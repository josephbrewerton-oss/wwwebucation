import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AstVectorMediaPlayer from './AstVectorMediaPlayer';
import { SACRED_OBJECTS, SacredObject } from '../data/catholic';
import { speakInLanguage } from '../engine/translationService';
import {
  playSuccessChime,
  playIncorrectTone,
  playClickTone,
  triggerHapticSuccess,
  triggerHapticError,
  triggerHapticClick,
} from '../services/soundHaptics';

export { SACRED_OBJECTS };
export type { SacredObject };

const LATIN_NAMES: Record<string, string> = {
  chalice: 'Calix Aureus',
  paten: 'Patina Sacra',
  ciborium: 'Ciborium',
  tabernacle: 'Tabernaculum',
  'sanctuary-lamp': 'Lumen Sanctuarii',
  cruets: 'Ampullae / Urceoli',
  purificator: 'Purificatorium',
  corporal: 'Corporale',
  monstrance: 'Ostensorium / Monstrantia',
  alb: 'Alba Túnica',
  cincture: 'Cingulum',
  stole: 'Stola Sacerdotalis',
  chasuble: 'Casula / Planeta',
  'humeral-veil': 'Velum Humerale',
  mensa: 'Mensa Altaris',
  'altar-stone': 'Petra Altaris',
  pall: 'Palla Lintea',
  'altar-bells': 'Campanellae / Tintinnabulum',
  'thurible-boat': 'Thuribulum et Navicula',
  aspergillum: 'Aspergillum et Aspersorium',
};

export default function SacredObjectsExplorer() {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Vessel' | 'Linen' | 'Sanctuary' | 'Vestment'>('All');
  const [selectedObjectId, setSelectedObjectId] = useState<string>('chalice');
  const [playerExpanded, setPlayerExpanded] = useState<boolean>(true);
  
  // Interactive Quiz State
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const filteredObjects = activeCategory === 'All' 
    ? SACRED_OBJECTS 
    : SACRED_OBJECTS.filter((obj) => obj.category === activeCategory);

  const activeObject = SACRED_OBJECTS.find((o) => o.id === selectedObjectId) || SACRED_OBJECTS[0];

  const handleSelectObject = (id: string) => {
    playClickTone();
    triggerHapticClick();
    setSelectedObjectId(id);
  };

  const handleSpeak = (text: string, lang = 'en') => {
    speakInLanguage(text, lang as 'en' | 'la');
  };

  // Quiz questions derived from SACRED_OBJECTS
  const currentQuizObject = SACRED_OBJECTS[quizIndex % SACRED_OBJECTS.length];
  // Generate 4 distinct options
  const quizOptions = React.useMemo(() => {
    const correct = currentQuizObject.name;
    const distractors = SACRED_OBJECTS
      .filter((o) => o.id !== currentQuizObject.id)
      .map((o) => o.name);
    // Shuffle distractors
    const shuffled = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 3);
    return [correct, ...shuffled].sort(() => 0.5 - Math.random());
  }, [currentQuizObject.id]);

  const handleQuizAnswer = (option: string) => {
    if (isAnswerSubmitted) return;
    setSelectedQuizOption(option);
    setIsAnswerSubmitted(true);
    if (option === currentQuizObject.name) {
      setQuizScore((prev) => prev + 1);
      playSuccessChime();
      triggerHapticSuccess();
    } else {
      playIncorrectTone();
      triggerHapticError();
    }
  };

  const handleNextQuiz = () => {
    playClickTone();
    triggerHapticClick();
    setSelectedQuizOption(null);
    setIsAnswerSubmitted(false);
    setQuizIndex((prev) => (prev + 1) % SACRED_OBJECTS.length);
  };

  return (
    <div style={{ margin: '1.5rem 0' }}>
      {/* Hero Banner with Embedded AST Vector Simulation */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
          borderRadius: '16px',
          padding: '1.75rem',
          color: '#ffffff',
          marginBottom: '1.5rem',
          border: '2px solid #ca8a04',
          boxShadow: '0 8px 24px rgba(30, 27, 75, 0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.8rem' }}>🏺</span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fef08a', margin: 0 }}>
              Sacred Vessels, Linens, Appointments &amp; Vestments
            </h2>
            <span
              style={{
                background: '#ca8a04',
                color: '#1e1b4b',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              LITURGICAL SACRAMENTALS
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            Every object in the Catholic sanctuary is consecrated for divine worship: vessels of gold that hold the Precious Blood and Body of Christ, pristine linen corporals, the burning red lamp of the Real Presence, and liturgical vestments worn by the priest in persona Christi.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setPlayerExpanded(!playerExpanded)}
            style={{
              background: playerExpanded ? '#facc15' : 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '8px',
              color: playerExpanded ? '#1e1b4b' : '#ffffff',
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{playerExpanded ? '▲ Hide Vector Sim' : '🎮 Vector Simulation'}</span>
          </button>

          <Link
            to="/media-player?preset=sacred-objects"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '8px 16px',
              fontSize: '0.82rem',
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

      {/* Embedded AST Vector Media Player */}
      {playerExpanded && (
        <div
          style={{
            borderRadius: '14px',
            overflow: 'hidden',
            border: '2px solid #ca8a04',
            background: '#090e1a',
            marginBottom: '2rem',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              background: '#1e1b4b',
              padding: '10px 16px',
              borderBottom: '1px solid #312e81',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#facc15' }}>
              <span>✨</span>
              <span>AST Vector Interactive Engine: Sacred Sanctuary Objects &amp; Vestments</span>
            </span>
            <span style={{ fontSize: '0.75rem', color: '#fde68a', fontFamily: 'monospace' }}>
              Cartridge: sacred-objects.ast
            </span>
          </div>
          <AstVectorMediaPlayer
            preset="sacred-objects"
            height="clamp(240px, 45vw + 40px, 420px)"
            allowPresetSwitch={false}
            embedded={true}
            bslEnabled={false}
          />
        </div>
      )}

      {/* Category Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '1.5rem',
        }}
      >
        {(
          [
            { id: 'All', label: '🌟 All Sacred Objects (20)' },
            { id: 'Vessel', label: '🏆 Sacred Vessels (5)' },
            { id: 'Linen', label: '🕊️ Sacred Linens (3)' },
            { id: 'Sanctuary', label: '🕯️ Sanctuary Appointments (7)' },
            { id: 'Vestment', label: '👑 Priestly Vestments (5)' },
          ] as const
        ).map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              playClickTone();
              triggerHapticClick();
              setActiveCategory(cat.id);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: activeCategory === cat.id ? '2px solid #ca8a04' : '1px solid #e2e8f0',
              background: activeCategory === cat.id ? '#1e1b4b' : '#ffffff',
              color: activeCategory === cat.id ? '#fde047' : '#334155',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Spotlight Card & Objects Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Active Object Detail Card */}
        <div
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            border: '2px solid #ca8a04',
            padding: '1.75rem',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  fontSize: '2.4rem',
                  background: '#fef08a',
                  width: '56px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  border: '2px solid #ca8a04',
                }}
              >
                {activeObject.icon}
              </span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#1e1b4b' }}>
                  {activeObject.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span
                    style={{
                      fontStyle: 'italic',
                      color: '#b45309',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                    }}
                  >
                    {LATIN_NAMES[activeObject.id] || 'Nomen Latinum'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSpeak(LATIN_NAMES[activeObject.id] || activeObject.name, 'la')}
                    style={{
                      background: '#fef3c7',
                      border: '1px solid #fde68a',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#92400e',
                      cursor: 'pointer',
                    }}
                    title="Pronounce Latin Title"
                  >
                    🔊 Latin
                  </button>
                </div>
              </div>
            </div>

            <span
              style={{
                background: '#e0e7ff',
                color: '#3730a3',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}
            >
              {activeObject.category}
            </span>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.84rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              Liturgical Description &amp; Purpose
            </h4>
            <p style={{ margin: 0, fontSize: '0.94rem', color: '#1e293b', lineHeight: 1.55 }}>
              {activeObject.description}
            </p>
          </div>

          <div
            style={{
              background: '#fefce8',
              borderLeft: '4px solid #ca8a04',
              borderRadius: '6px',
              padding: '12px 14px',
              marginBottom: '1.25rem',
            }}
          >
            <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase', margin: '0 0 4px 0' }}>
              🕊️ Spiritual Symbolism &amp; Theological Meaning
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#713f12', lineHeight: 1.5 }}>
              {activeObject.spiritualMeaning}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '10px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1' }}>
              📜 {activeObject.catechismRef}
            </span>
            <button
              type="button"
              onClick={() => handleSpeak(`${activeObject.name}. ${activeObject.description} ${activeObject.spiritualMeaning}`, 'en')}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🔊 Listen Narration</span>
            </button>
          </div>
        </div>

        {/* Clickable Grid of Objects */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '10px',
            maxHeight: '440px',
            overflowY: 'auto',
            paddingRight: '6px',
          }}
        >
          {filteredObjects.map((obj) => {
            const isSelected = obj.id === selectedObjectId;
            return (
              <button
                key={obj.id}
                type="button"
                onClick={() => handleSelectObject(obj.id)}
                style={{
                  background: isSelected ? '#1e1b4b' : '#ffffff',
                  border: isSelected ? '2px solid #ca8a04' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(202, 138, 4, 0.25)' : 'none',
                }}
              >
                <span style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{obj.icon}</span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: isSelected ? '#fde047' : '#1e293b',
                    lineHeight: 1.25,
                  }}
                >
                  {obj.name}
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: isSelected ? '#93c5fd' : '#64748b',
                    marginTop: '4px',
                  }}
                >
                  {obj.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Formative Interactive Catechism Quiz */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
          borderRadius: '16px',
          padding: '1.75rem',
          color: '#ffffff',
          border: '2px solid #059669',
          boxShadow: '0 8px 24px rgba(6, 78, 59, 0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🎯</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#6ee7b7', margin: 0 }}>
              Sacred Sanctuary Identification Quiz
            </h3>
          </div>
          <div
            style={{
              background: '#047857',
              borderRadius: '9999px',
              padding: '4px 12px',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#d1fae5',
            }}
          >
            Score: {quizScore} / {quizIndex + (isAnswerSubmitted ? 1 : 0)}
          </div>
        </div>

        <p style={{ fontSize: '0.95rem', color: '#ecfdf5', lineHeight: 1.5, marginBottom: '1.25rem' }}>
          <strong>Clue:</strong> &quot;{currentQuizObject.description}&quot;
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '10px',
            marginBottom: '1.25rem',
          }}
        >
          {quizOptions.map((opt) => {
            const isCorrect = opt === currentQuizObject.name;
            const isChosen = opt === selectedQuizOption;

            let btnBg = 'rgba(255, 255, 255, 0.15)';
            let btnBorder = '1px solid rgba(255, 255, 255, 0.25)';
            let btnColor = '#ffffff';

            if (isAnswerSubmitted) {
              if (isCorrect) {
                btnBg = '#10b981';
                btnBorder = '2px solid #34d399';
                btnColor = '#ffffff';
              } else if (isChosen) {
                btnBg = '#ef4444';
                btnBorder = '2px solid #f87171';
                btnColor = '#ffffff';
              }
            }

            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleQuizAnswer(opt)}
                disabled={isAnswerSubmitted}
                style={{
                  background: btnBg,
                  border: btnBorder,
                  color: btnColor,
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: isAnswerSubmitted ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {isAnswerSubmitted && (
          <div
            style={{
              background: selectedQuizOption === currentQuizObject.name ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
              border: selectedQuizOption === currentQuizObject.name ? '1px solid #34d399' : '1px solid #f87171',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: selectedQuizOption === currentQuizObject.name ? '#6ee7b7' : '#fca5a5' }}>
                {selectedQuizOption === currentQuizObject.name ? '🎉 Correct!' : `❌ Correct answer was ${currentQuizObject.name}.`}
              </span>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#ecfdf5' }}>
                {currentQuizObject.spiritualMeaning}
              </p>
            </div>
            <button
              type="button"
              onClick={handleNextQuiz}
              style={{
                background: '#ffffff',
                color: '#064e3b',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Next Clue &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
