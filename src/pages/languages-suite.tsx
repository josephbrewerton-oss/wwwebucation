// src/pages/languages-suite.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import {
  LANGUAGE_PHONEMES,
  VERB_CONJUGATIONS,
  ETYMOLOGY_COGNATES,
  type LanguagePhoneme,
  type VerbConjugation,
  type EtymologyCognate,
} from '../data/languagesCurriculumData';
import { triggerCorrectConfetti } from '../utils/confetti';

type LangTab = 'soundboard' | 'conjugation' | 'etymology' | 'sprint';

export default function LanguagesSuitePage() {
  const [activeTab, setActiveTab] = useState<LangTab>('soundboard');

  // Soundboard state
  const [selectedLang, setSelectedLang] = useState<'all' | 'es' | 'fr' | 'la'>('all');
  const [activePhoneme, setActivePhoneme] = useState<LanguagePhoneme | null>(() => LANGUAGE_PHONEMES[0]);

  // Conjugation state
  const [selectedVerbIdx, setSelectedVerbIdx] = useState(0);
  const [activePersonIdx, setActivePersonIdx] = useState(0);

  // Etymology state
  const [selectedCognateIdx, setSelectedCognateIdx] = useState(0);

  // Vocabulary Sprint state
  const [sprintScore, setSprintScore] = useState(0);
  const [sprintIdx, setSprintIdx] = useState(0);
  const [sprintFeedback, setSprintFeedback] = useState<string | null>(null);

  // Audio tone generator
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

  // Web Speech API Synthesis for Spanish, French, and Latin
  const speakForeign = useCallback((text: string, langCode: 'es' | 'fr' | 'la', rate: number = 0.88) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = rate;
        utter.pitch = 1.0;
        const voices = window.speechSynthesis.getVoices();

        let targetLang = 'es-ES';
        if (langCode === 'fr') targetLang = 'fr-FR';
        if (langCode === 'la') targetLang = 'it-IT'; // Italian phonology aligns with Ecclesiastical Latin

        const matchedVoice = voices.find((v) => v.lang.startsWith(targetLang) || v.lang.startsWith(langCode));
        if (matchedVoice) utter.voice = matchedVoice;
        else utter.lang = targetLang;

        window.speechSynthesis.speak(utter);
      } catch (_) {}
    }
  }, []);

  // Filtered phonemes
  const filteredPhonemes = useMemo(() => {
    return LANGUAGE_PHONEMES.filter((p) => selectedLang === 'all' || p.lang === selectedLang);
  }, [selectedLang]);

  // Current Verb
  const currentVerb: VerbConjugation = VERB_CONJUGATIONS[selectedVerbIdx] || VERB_CONJUGATIONS[0];
  const currentForm = currentVerb.forms[activePersonIdx] || currentVerb.forms[0];

  // Current Cognate
  const currentCognate: EtymologyCognate = ETYMOLOGY_COGNATES[selectedCognateIdx] || ETYMOLOGY_COGNATES[0];

  // Vocabulary Sprint Items
  const SPRINT_ITEMS = useMemo(() => [
    { question: 'What does Spanish "hablamos" mean?', options: ['We speak', 'I speak', 'They speak'], correct: 0, lang: 'es' as const, audio: 'hablamos' },
    { question: 'What does French "nous parlons" mean?', options: ['They speak', 'We speak', 'You speak'], correct: 1, lang: 'fr' as const, audio: 'nous parlons' },
    { question: 'What does Latin "scribo" mean?', options: ['I read', 'I speak', 'I write'], correct: 2, lang: 'la' as const, audio: 'scribo' },
    { question: 'What does Spanish "amigo" come from in Latin?', options: ['aqua', 'amicus', 'corpus'], correct: 1, lang: 'es' as const, audio: 'amigo' },
    { question: 'In Spanish, is "Yo hablo" or "Hablo" standard?', options: ['Both, but "Hablo" is most natural (pro-drop)', 'Must always say "Yo"', 'Neither'], correct: 0, lang: 'es' as const, audio: 'hablo' },
  ], []);

  const handleSprintAnswer = (optionIdx: number) => {
    const item = SPRINT_ITEMS[sprintIdx];
    if (optionIdx === item.correct) {
      setSprintScore((prev) => prev + 1);
      setSprintFeedback('🌟 Correct!');
      playTone(587.33, 0.1);
      speakForeign(item.audio, item.lang);
      triggerCorrectConfetti();
    } else {
      setSprintFeedback('Almost! The correct answer was: ' + item.options[item.correct]);
      playTone(240, 0.15);
    }

    setTimeout(() => {
      setSprintFeedback(null);
      setSprintIdx((prev) => (prev + 1) % SPRINT_ITEMS.length);
    }, 1200);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <PageMeta
        title="MFL & Polyglot Teaching Suite: Spanish, French & Latin | St Joseph's"
        description="Comprehensive European modern foreign languages and Latin teaching suite: Comparative phonics soundboard, dynamic verb conjugation matrix, pro-drop morphology, and English etymology cognate trees."
      />

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.8rem' }}>🌍</span>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              MFL &amp; Polyglot Language Teaching Suite
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#94a3b8' }}>
            Spanish • French • Classical &amp; Ecclesiastical Latin • Comparative Phonology, Verb Paradigms &amp; Academic English Cognates
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Link
            to="/player?preset=languages&mode=game"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(217, 119, 6, 0.3)',
            }}
            title="Launch 60 FPS animated vector morphology simulation"
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
            <span>🖨️ Print Language Sheet</span>
          </button>
        </div>
      </div>

      {/* Primary Suite Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {[
          { id: 'soundboard', label: '1. Multilingual Phonics Soundboard', icon: '🔊', count: `${LANGUAGE_PHONEMES.length} Sounds` },
          { id: 'conjugation', label: '2. Verb Conjugation Paradigm Wheel', icon: '🎡', count: `${VERB_CONJUGATIONS.length} Verbs` },
          { id: 'etymology', label: '3. Latin-Romance-English Cognate Tree', icon: '🌳', count: `${ETYMOLOGY_COGNATES.length} Roots` },
          { id: 'sprint', label: '4. Polyglot Recall Sprint', icon: '⚡', count: `${sprintScore} Points` },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as LangTab)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'transparent',
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
      {/* TAB 1: MULTILINGUAL PHONICS SOUNDBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'soundboard' && (
        <div>
          {/* Language Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              Filter Language:
            </span>
            {[
              { id: 'all', label: 'All Languages (🇪🇸 🇫🇷 🏛️)' },
              { id: 'es', label: '🇪🇸 Spanish (Español)' },
              { id: 'fr', label: '🇫🇷 French (Français)' },
              { id: 'la', label: '🏛️ Latin (Lingua Latina)' },
            ].map((l) => {
              const isSel = selectedLang === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setSelectedLang(l.id as any)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: isSel ? '1px solid #d97706' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isSel ? 'rgba(217, 119, 6, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    color: isSel ? '#fde68a' : '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  {l.label}
                </button>
              );
            })}
          </div>

          {/* Soundboard Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Grid of Sound Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
              {filteredPhonemes.map((p) => {
                const isSelected = activePhoneme?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setActivePhoneme(p);
                      playTone(480, 0.06);
                      speakForeign(p.audioText, p.lang);
                    }}
                    style={{
                      padding: '14px 10px',
                      borderRadius: '12px',
                      background: isSelected ? '#1e293b' : '#0f172a',
                      border: isSelected ? '2px solid #d97706' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      position: 'relative',
                      boxShadow: isSelected ? '0 0 12px rgba(217, 119, 6, 0.3)' : 'none',
                    }}
                  >
                    <span style={{ position: 'absolute', top: '6px', right: '8px', fontSize: '0.85rem' }}>
                      {p.flag}
                    </span>

                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fde68a', margin: '4px 0 2px' }}>
                      {p.grapheme}
                    </div>

                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38bdf8' }}>
                      {p.ipa}
                    </div>

                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                      {p.soundExample}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Inspector Sidebar */}
            {activePhoneme && (
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
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>
                    Comparative Phonetics Inspector
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(217, 119, 6, 0.2)', color: '#fde68a', border: '1px solid #d97706' }}>
                    {activePhoneme.flag} {activePhoneme.langName}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '12px',
                      background: '#1e293b',
                      border: '2px solid #d97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 900,
                      color: '#fde68a',
                    }}
                  >
                    {activePhoneme.grapheme}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                      IPA: <span style={{ color: '#38bdf8' }}>{activePhoneme.ipa}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                      Word: <strong style={{ color: '#cbd5e1' }}>{activePhoneme.soundExample}</strong>
                    </div>
                  </div>
                </div>

                {/* Pronounce Button */}
                <button
                  type="button"
                  onClick={() => {
                    playTone(520, 0.08);
                    speakForeign(activePhoneme.audioText, activePhoneme.lang);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '1rem',
                  }}
                >
                  <span>🔊 Pronounce in {activePhoneme.langName}</span>
                </button>

                {/* Mouth Tip */}
                <div style={{ padding: '12px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', marginBottom: '4px' }}>
                    👄 Articulation Guidance:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                    {activePhoneme.mouthTip}
                  </div>
                </div>

                {/* English Contrast */}
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid #0284c7' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '4px' }}>
                    🇬🇧 Contrast With English Phonology:
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                    {activePhoneme.englishContrast}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VERB CONJUGATION PARADIGM WHEEL */}
      {/* ========================================================================= */}
      {activeTab === 'conjugation' && (
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          {/* Verb Selector Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {VERB_CONJUGATIONS.map((v, idx) => {
              const isSel = selectedVerbIdx === idx;
              return (
                <button
                  key={v.infinitive}
                  type="button"
                  onClick={() => {
                    setSelectedVerbIdx(idx);
                    setActivePersonIdx(0);
                    playTone(480, 0.06);
                  }}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: isSel ? '#d97706' : '#0f172a',
                    color: isSel ? '#ffffff' : '#cbd5e1',
                    border: isSel ? '1px solid #f59e0b' : '1px solid #1e293b',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>{v.flag}</span>
                  <span style={{ fontSize: '1rem' }}>{v.infinitive}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({v.meaning})</span>
                </button>
              );
            })}
          </div>

          {/* Big Interactive Verb Conjugation Paradigm Box */}
          <div
            style={{
              padding: '2rem 1.5rem',
              borderRadius: '20px',
              background: 'radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)',
              border: '2px solid #334155',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>
                  {currentVerb.langName} Conjugation Engine
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '1.3rem', fontWeight: 900, color: '#ffffff' }}>
                  {currentVerb.flag} {currentVerb.infinitive} • {currentVerb.conjugationGroup}
                </h3>
              </div>

              {/* Hear Infinitive Button */}
              <button
                type="button"
                onClick={() => speakForeign(currentVerb.infinitive, currentVerb.lang)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🔊 Hear Infinitive
              </button>
            </div>

            {/* Pro-Drop Linguistic Rule Callout */}
            <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(217, 119, 6, 0.15)', border: '1px solid #d97706', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fde68a', marginBottom: '2px' }}>
                💡 Pro-Drop &amp; Stem Morphology Invariant:
              </div>
              <div style={{ fontSize: '0.82rem', color: '#fef3c7', lineHeight: 1.4 }}>
                {currentVerb.proDropRule}
              </div>
            </div>

            {/* Person Selector Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '1.5rem' }}>
              {currentVerb.forms.map((f, idx) => {
                const isSel = activePersonIdx === idx;
                return (
                  <button
                    key={f.person}
                    type="button"
                    onClick={() => {
                      setActivePersonIdx(idx);
                      playTone(440 + idx * 40, 0.06);
                      speakForeign(f.fullWord, currentVerb.lang);
                    }}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      background: isSel ? '#059669' : '#1e293b',
                      color: isSel ? '#ffffff' : '#cbd5e1',
                      border: isSel ? '2px solid #34d399' : '1px solid #334155',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, opacity: 0.8 }}>{f.person}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: isSel ? '#ffffff' : '#fde68a', margin: '2px 0' }}>{f.fullWord}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.75 }}>{f.english}</div>
                  </button>
                );
              })}
            </div>

            {/* Big Interactive Breakdown Display: Pronoun + Invariable Stem + Person Suffix */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                padding: '24px',
                borderRadius: '16px',
                background: '#0f172a',
                border: '1px solid #1e293b',
                flexWrap: 'wrap',
              }}
            >
              {/* Pronoun */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Subject Pronoun</div>
                <div style={{ padding: '8px 16px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                  {currentForm.pronoun}
                </div>
              </div>

              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d97706' }}>+</div>

              {/* Stem */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Invariable Stem</div>
                <div style={{ padding: '8px 18px', borderRadius: '8px', background: '#1e293b', border: '2px solid #0284c7', fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8' }}>
                  {currentVerb.stem}
                </div>
              </div>

              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d97706' }}>+</div>

              {/* Suffix */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Person Suffix</div>
                <div style={{ padding: '8px 18px', borderRadius: '8px', background: '#78350f', border: '2px solid #f59e0b', fontSize: '1.4rem', fontWeight: 900, color: '#fde68a' }}>
                  {currentForm.suffix}
                </div>
              </div>

              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d97706' }}>=</div>

              {/* Full Word */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Resulting Verb</div>
                <button
                  type="button"
                  onClick={() => speakForeign(currentForm.fullWord, currentVerb.lang)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: '#059669',
                    border: '2px solid #34d399',
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  title="Click to hear speech synthesis"
                >
                  <span>{currentForm.fullWord}</span>
                  <span style={{ fontSize: '1rem' }}>🔊</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LATIN-ROMANCE-ENGLISH ETYMOLOGY COGNATE TREE */}
      {/* ========================================================================= */}
      {activeTab === 'etymology' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0' }}>
              The Classical Bridge: How Latin &amp; Romance Roots Built 60%+ of Academic English
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
              Select any Latin root to inspect how it branched into modern Spanish, French, and sophisticated English vocabulary.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {/* Roots Selector Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '10px' }}>
              {ETYMOLOGY_COGNATES.map((c, idx) => {
                const isSel = selectedCognateIdx === idx;
                return (
                  <button
                    key={c.latinRoot}
                    type="button"
                    onClick={() => {
                      setSelectedCognateIdx(idx);
                      playTone(520, 0.06);
                    }}
                    style={{
                      padding: '14px 10px',
                      borderRadius: '12px',
                      background: isSel ? '#1e293b' : '#0f172a',
                      border: isSel ? '2px solid #d97706' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{c.icon}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fde68a' }}>{c.latinRoot}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>"{c.rootMeaning}"</div>
                  </button>
                );
              })}
            </div>

            {/* Cognate Tree Inspector */}
            <div
              style={{
                padding: '1.5rem',
                borderRadius: '16px',
                background: '#0f172a',
                border: '1px solid #1e293b',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>{currentCognate.icon}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#ffffff' }}>
                    Root: {currentCognate.latinRoot}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>
                    Core Meaning: "{currentCognate.rootMeaning}" • {currentCognate.category}
                  </div>
                </div>
              </div>

              {/* The European Branching Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: '#1e293b' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>🏛️ Latin Origin:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fde68a' }}>{currentCognate.latinWord}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: '#1e293b' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>🇪🇸 Spanish Cognate:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8' }}>{currentCognate.spanishWord}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: '#1e293b' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>🇫🇷 French Cognate:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#818cf8' }}>{currentCognate.frenchWord}</span>
                </div>
              </div>

              {/* English Academic Derivatives */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', marginBottom: '6px' }}>
                  🇬🇧 Academic English Descendants:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {currentCognate.englishAcademicWords.map((word) => (
                    <span
                      key={word}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(52, 211, 153, 0.15)',
                        border: '1px solid #059669',
                        color: '#a7f3d0',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Historical Context */}
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                <strong>Historical Note:</strong> {currentCognate.historicalNote}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: POLYGLOT RECALL SPRINT */}
      {/* ========================================================================= */}
      {activeTab === 'sprint' && (
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ padding: '2rem', borderRadius: '16px', background: '#0f172a', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '6px' }}>
              Rapid-Fire Polyglot Challenge • Streak: {sprintScore}
            </div>

            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc', margin: '1rem 0 1.5rem' }}>
              {SPRINT_ITEMS[sprintIdx].question}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SPRINT_ITEMS[sprintIdx].options.map((opt, optIdx) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSprintAnswer(optIdx)}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    border: '1px solid #334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            {sprintFeedback && (
              <div style={{ marginTop: '1.25rem', fontSize: '1.1rem', fontWeight: 800, color: sprintFeedback.includes('Correct') ? '#34d399' : '#f87171' }}>
                {sprintFeedback}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
