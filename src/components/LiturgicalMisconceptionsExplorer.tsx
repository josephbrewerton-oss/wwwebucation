// src/components/LiturgicalMisconceptionsExplorer.tsx
/**
 * Liturgical Postures, Eucharistic Reception & The Our Father Explorer
 * 
 * An authoritative, cross-rite pedagogical module exploring:
 *  1. How to Receive the Holy Eucharist across Catholic Rites:
 *     - On the Tongue (Universal Norm of the Roman Rite)
 *     - In the Hand (Permitted by Indult with St. Cyril of Jerusalem rules)
 *     - Via Liturgical Spoon / Labis (Byzantine Rite)
 *     - Intinction by the Priest (Maronite, Syrian, Armenian)
 *  2. How to Hold Your Hands During the Our Father (Pater Noster):
 *     - Hands Joined (Junctis Manibus - The Prescribed Lay Posture)
 *     - Priestly Orans Posture (Sacerdotal Gesture in persona Christi)
 *     - Holding Hands Across Pews (Informal Popular Custom vs Rubrics)
 *     - Hands Crossed on Breast & Metanies (Eastern Catholic Traditions)
 *  3. Liturgical Mythbusters Quiz & Case Studies
 */

import React, { useState } from 'react';
import {
  EUCHARISTIC_RECEPTION_METHODS,
  OUR_FATHER_POSTURES,
  LITURGICAL_MYTHS,
  ReceptionMethod,
  OurFatherPosture,
  LiturgicalMyth,
} from '../data/catholic/liturgicalPosturesData';
import { speakInLanguage, cancelSpeech } from '../engine/translationService';
import {
  playSuccessChime,
  playIncorrectTone,
  playClickTone,
  triggerHapticSuccess,
  triggerHapticClick,
  triggerHapticError,
} from '../services/soundHaptics';

interface LiturgicalMisconceptionsExplorerProps {
  theme?: 'dark' | 'light';
  initialSection?: 'eucharist' | 'our-father' | 'mythbusters';
}

export default function LiturgicalMisconceptionsExplorer({
  theme = 'light',
  initialSection = 'eucharist',
}: LiturgicalMisconceptionsExplorerProps): React.JSX.Element {
  const [activeSection, setActiveSection] = useState<'eucharist' | 'our-father' | 'mythbusters'>(initialSection);

  // Eucharistic Reception state
  const [selectedMethodId, setSelectedMethodId] = useState<string>('on-the-tongue-roman');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Our Father state
  const [selectedPostureId, setSelectedPostureId] = useState<string>('hands-joined-laity');

  // Mythbusters state
  const [userMythAnswers, setUserMythAnswers] = useState<Record<string, 'TRUE' | 'FALSE'>>({});
  const [revealedMyths, setRevealedMyths] = useState<Record<string, boolean>>({});

  const isDark = theme === 'dark';

  const selectedMethod: ReceptionMethod =
    EUCHARISTIC_RECEPTION_METHODS.find((m) => m.id === selectedMethodId) || EUCHARISTIC_RECEPTION_METHODS[0];

  const selectedPosture: OurFatherPosture =
    OUR_FATHER_POSTURES.find((p) => p.id === selectedPostureId) || OUR_FATHER_POSTURES[0];

  const handleSpeech = (text: string) => {
    cancelSpeech();
    speakInLanguage(text, 'en');
  };

  const handleSelectMethod = (id: string) => {
    playClickTone();
    triggerHapticClick();
    setSelectedMethodId(id);
    setActiveStepIndex(0);
  };

  const handleSelectPosture = (id: string) => {
    playClickTone();
    triggerHapticClick();
    setSelectedPostureId(id);
  };

  const handleAnswerMyth = (mythId: string, answer: 'TRUE' | 'FALSE') => {
    playClickTone();
    triggerHapticClick();
    setUserMythAnswers((prev) => ({ ...prev, [mythId]: answer }));
    setRevealedMyths((prev) => ({ ...prev, [mythId]: true }));

    const myth = LITURGICAL_MYTHS.find((m) => m.id === mythId);
    if (!myth) return;

    // In our myths array, all statements are myths/falsehoods
    const isCorrect = answer === 'FALSE';
    if (isCorrect) {
      playSuccessChime();
      triggerHapticSuccess();
    } else {
      playIncorrectTone();
      triggerHapticError();
    }
  };

  const palette = {
    bg: isDark ? '#0f172a' : '#ffffff',
    cardBg: isDark ? '#1e293b' : '#f8fafc',
    border: isDark ? '#334155' : '#e2e8f0',
    text: isDark ? '#f8fafc' : '#0f172a',
    muted: isDark ? '#94a3b8' : '#64748b',
    gold: '#d97706',
    goldBg: isDark ? '#451a03' : '#fef3c7',
    red: '#dc2626',
    green: '#16a34a',
    blue: '#2563eb',
    purple: '#7c3aed',
  };

  return (
    <div
      style={{
        background: palette.bg,
        color: palette.text,
        borderRadius: '1rem',
        border: `1px solid ${palette.border}`,
        padding: '1.75rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          color: '#ffffff',
          borderRadius: '0.875rem',
          padding: '1.75rem',
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '2rem' }}>🕊️</span>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fbbf24' }}>
              Rubrics, Reverence & Cross-Rite Fidelity
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
              The Great Liturgical Misconceptions Guide
            </h2>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '0.95rem', color: '#e0e7ff', lineHeight: 1.5, maxWidth: '850px' }}>
          Two of the most passionately debated and widely misunderstood practices in Catholic life are{' '}
          <strong>how to receive the Holy Eucharist</strong> and{' '}
          <strong>how to hold your hands during the Our Father (Pater Noster)</strong>. Explore the authentic universal
          norms of the Roman Rite, the sacred apostolic customs of the Eastern Catholic Churches, and the canonical facts.
        </p>

        {/* Section Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          {[
            { id: 'eucharist', label: '🍞 Receiving the Eucharist', emoji: '👅' },
            { id: 'our-father', label: '🙏 Our Father Hand Postures', emoji: '🙌' },
            { id: 'mythbusters', label: '⚖️ Liturgy Mythbusters', emoji: '🕵️' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playClickTone();
                triggerHapticClick();
                setActiveSection(tab.id as 'eucharist' | 'our-father' | 'mythbusters');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: activeSection === tab.id ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.2)',
                background: activeSection === tab.id ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                color: activeSection === tab.id ? '#1e1b4b' : '#ffffff',
              }}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: RECEIVING THE HOLY EUCHARIST */}
      {activeSection === 'eucharist' && (
        <div>
          {/* Method Selector Pills */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: palette.muted, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Eucharistic Reception Method:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {EUCHARISTIC_RECEPTION_METHODS.map((method) => {
                const isSelected = selectedMethod.id === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => handleSelectMethod(method.id)}
                    style={{
                      textAlign: 'left',
                      padding: '0.85rem',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      border: isSelected ? '2px solid #b45309' : `1px solid ${palette.border}`,
                      background: isSelected ? palette.goldBg : palette.cardBg,
                      color: palette.text,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '1.4rem' }}>{method.diagramEmoji}</span>
                      {method.isUniversalNorm ? (
                        <span style={{ background: '#15803d', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                          UNIVERSAL NORM
                        </span>
                      ) : (
                        <span style={{ background: '#0369a1', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                          BY INDULT / TRADITION
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{method.name}</div>
                    <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: palette.muted }}>
                      {method.latinOrGreekTerm}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Method Display Card */}
          <div
            style={{
              background: palette.cardBg,
              border: `1px solid ${palette.border}`,
              borderRadius: '0.875rem',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.8rem' }}>{selectedMethod.diagramEmoji}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{selectedMethod.name}</h3>
                    <div style={{ fontSize: '0.8rem', color: palette.gold, fontWeight: 700 }}>
                      {selectedMethod.latinOrGreekTerm} • Practiced in: {selectedMethod.ritesPracticed.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSpeech(
                    `${selectedMethod.name}. ${selectedMethod.theologicalSignificance}. Step by step: ${selectedMethod.stepByStepGuide.join('. ')}`
                  )
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '0.5rem',
                  background: palette.gold,
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                🔊 Listen Guide
              </button>
            </div>

            {/* Theological Significance Box */}
            <div
              style={{
                background: isDark ? '#1e1b4b' : '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '0.625rem',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1d4ed8', marginBottom: '0.25rem' }}>
                📖 Theological Meaning & Biblical Foundation:
              </div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {selectedMethod.theologicalSignificance}
              </p>
              <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: palette.muted }}>
                <strong>Patristic & Scriptural Root:</strong> {selectedMethod.scripturalAndPatristicRoots}
              </div>
            </div>

            {/* Step-by-Step Interactive Walkthrough */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                🚶 Step-by-Step Rehearsal (Click to Practice):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedMethod.stepByStepGuide.map((step, idx) => {
                  const isActive = activeStepIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        playClickTone();
                        triggerHapticClick();
                        setActiveStepIndex(idx);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: isActive ? '2px solid #b45309' : `1px solid ${palette.border}`,
                        background: isActive ? palette.goldBg : palette.bg,
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        lineHeight: 1.45,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                      }}
                    >
                      <span
                        style={{
                          background: isActive ? '#b45309' : palette.muted,
                          color: '#fff',
                          borderRadius: '9999px',
                          width: '1.4rem',
                          height: '1.4rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Critical Rules & Sacristan Warnings */}
            <div
              style={{
                background: isDark ? '#450a0a' : '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.625rem',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#b91c1c', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>⚠️</span> CRITICAL SACRAMENTAL RULES & MISTAKES TO AVOID:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', lineHeight: 1.5, color: isDark ? '#fca5a5' : '#991b1b' }}>
                {selectedMethod.criticalRulesAndErrorsToAvoid.map((rule, idx) => (
                  <li key={idx} style={{ marginBottom: '0.35rem' }}>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Rubrical & Canonical Citations */}
            <div style={{ fontSize: '0.8rem', color: palette.muted }}>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>⚖️ Official Magisterial & Canon Law Citations:</div>
              {selectedMethod.rubricalCitations.map((cite, idx) => (
                <div key={idx} style={{ fontStyle: 'italic', marginBottom: '0.2rem' }}>
                  • {cite}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: THE OUR FATHER & HAND POSTURES */}
      {activeSection === 'our-father' && (
        <div>
          {/* Intro Callout */}
          <div
            style={{
              background: isDark ? '#1e1b4b' : '#f5f3ff',
              border: '1px solid #ddd6fe',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#6d28d9', marginBottom: '0.25rem' }}>
              ❓ The Parish Question: Should You Hold Hands, Fold Hands, or Raise Hands?
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>
              Almost every Catholic child and adult has experienced the confusion at the start of the Our Father: some
              people hold hands across the aisle, some stretch their arms outward like the priest, and others keep their
              hands folded. Here is what the official liturgical books of the Church (the Roman Missal and GIRM) actually
              say.
            </p>
          </div>

          {/* Posture Selector Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {OUR_FATHER_POSTURES.map((pos) => {
              const isSelected = selectedPosture.id === pos.id;
              return (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => handleSelectPosture(pos.id)}
                  style={{
                    textAlign: 'left',
                    padding: '0.85rem',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isSelected ? '2px solid #7c3aed' : `1px solid ${palette.border}`,
                    background: isSelected ? (isDark ? '#2e1065' : '#ede9fe') : palette.cardBg,
                    color: palette.text,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.5rem' }}>{pos.visualIcon}</span>
                    {pos.isRubricallyMandatedForLaity ? (
                      <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '9999px' }}>
                        LAITY NORM
                      </span>
                    ) : (
                      <span style={{ background: '#64748b', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '9999px' }}>
                        NOT PRESCRIBED
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{pos.name}</div>
                  <div style={{ fontSize: '0.75rem', color: palette.muted, fontStyle: 'italic' }}>
                    {pos.term}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Posture Detail Card */}
          <div
            style={{
              background: palette.cardBg,
              border: `1px solid ${palette.border}`,
              borderRadius: '0.875rem',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2rem' }}>{selectedPosture.visualIcon}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{selectedPosture.name}</h3>
                    <div style={{ fontSize: '0.8rem', color: palette.purple, fontWeight: 700 }}>
                      {selectedPosture.term} • Who: <strong>{selectedPosture.whoIsPrescribedFor}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSpeech(
                    `${selectedPosture.name}. ${selectedPosture.description}. Theological rationale: ${selectedPosture.theologicalRationale}. Guidance: ${selectedPosture.officialChurchGuidance}`
                  )
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '0.5rem',
                  background: palette.purple,
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                🔊 Listen Explanation
              </button>
            </div>

            {/* Description */}
            <div style={{ fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '1rem', padding: '0.85rem', background: palette.bg, borderRadius: '0.5rem' }}>
              <strong>Physical Form:</strong> {selectedPosture.description}
            </div>

            {/* Theological Rationale */}
            <div
              style={{
                background: isDark ? '#1e293b' : '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '0.625rem',
                padding: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#15803d', marginBottom: '0.25rem' }}>
                🌿 Theological Rationale:
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>
                {selectedPosture.theologicalRationale}
              </p>
            </div>

            {/* The Misconception vs Reality */}
            <div
              style={{
                background: isDark ? '#3b0764' : '#faf5ff',
                border: '1px solid #e9d5ff',
                borderRadius: '0.625rem',
                padding: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#7e22ce', marginBottom: '0.25rem' }}>
                🎭 The Widespread Misconception:
              </div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', lineHeight: 1.5 }}>
                {selectedPosture.commonMisconception}
              </p>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                🇻🇦 Official Holy See & Rubrical Ruling:
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>
                {selectedPosture.officialChurchGuidance}
              </p>
            </div>

            {/* Citations */}
            <div style={{ fontSize: '0.8rem', color: palette.muted }}>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>📜 Liturgical Citations:</div>
              {selectedPosture.citations.map((cite, idx) => (
                <div key={idx} style={{ fontStyle: 'italic', marginBottom: '0.2rem' }}>
                  • {cite}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: LITURGY MYTHBUSTERS QUIZ */}
      {activeSection === 'mythbusters' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', fontWeight: 800 }}>
              🕵️ Liturgy Mythbusters: Fact or Fiction?
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: palette.muted }}>
              Test your knowledge on the most common liturgical rumors and misconceptions heard in parishes! Click TRUE or
              FALSE for each statement to reveal the Vatican documents.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {LITURGICAL_MYTHS.map((item, idx) => {
              const isAnswered = revealedMyths[item.id];
              const userAnswer = userMythAnswers[item.id];
              const isUserCorrect = userAnswer === 'FALSE';

              return (
                <div
                  key={item.id}
                  style={{
                    background: palette.cardBg,
                    border: `1px solid ${palette.border}`,
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: palette.gold, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Statement #{idx + 1} • {item.riteContext}
                    </span>
                    {isAnswered && (
                      <span
                        style={{
                          background: item.verdict === 'FALSE' ? '#dc2626' : '#16a34a',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 900,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          letterSpacing: '0.05em',
                        }}
                      >
                        VERDICT: {item.verdict}
                      </span>
                    )}
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.85rem', lineHeight: 1.4 }}>
                    &ldquo;{item.myth}&rdquo;
                  </div>

                  {!isAnswered ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleAnswerMyth(item.id, 'TRUE')}
                        style={{
                          padding: '0.45rem 1rem',
                          borderRadius: '0.5rem',
                          background: palette.bg,
                          border: `1px solid ${palette.border}`,
                          color: palette.text,
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        True
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAnswerMyth(item.id, 'FALSE')}
                        style={{
                          padding: '0.45rem 1rem',
                          borderRadius: '0.5rem',
                          background: palette.bg,
                          border: `1px solid ${palette.border}`,
                          color: palette.text,
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        False (Myth)
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          background: isUserCorrect ? (isDark ? '#052e16' : '#f0fdf4') : (isDark ? '#450a0a' : '#fef2f2'),
                          border: isUserCorrect ? '1px solid #86efac' : '1px solid #fecaca',
                          borderRadius: '0.5rem',
                          padding: '0.85rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: isUserCorrect ? '#16a34a' : '#dc2626', marginBottom: '0.25rem' }}>
                          {isUserCorrect ? '🎉 Correct! This is indeed a myth.' : '❌ Incorrect. This is actually a common misconception!'}
                        </div>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', lineHeight: 1.45 }}>
                          {item.explanation}
                        </p>
                        <div style={{ fontSize: '0.78rem', fontStyle: 'italic', color: palette.muted }}>
                          <strong>Official Source:</strong> {item.officialDoc}
                        </div>
                      </div>
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
}
