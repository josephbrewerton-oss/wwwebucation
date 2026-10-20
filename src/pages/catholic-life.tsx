import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import FirstCommunionMasteryLab from '../components/FirstCommunionMasteryLab';
import SevenSacramentsGuide from '../components/SevenSacramentsGuide';
import LiturgicalCalendarGuide from '../components/LiturgicalCalendarGuide';
import LatinMassPrayersChapel from '../components/LatinMassPrayersChapel';
import CreedExplorer from '../components/CreedExplorer';
import CommandmentsMoralGuide from '../components/CommandmentsMoralGuide';
import RosaryMysteryWalk from '../components/RosaryMysteryWalk';
import AstVectorMediaPlayer from '../components/AstVectorMediaPlayer';
import SanctuaryPilgrimQuest from '../components/SanctuaryPilgrimQuest';
import CatholicRitesExplorer from '../components/CatholicRitesExplorer';
import AltarAnatomyExplorer from '../components/AltarAnatomyExplorer';
import HolyOilsExplorer from '../components/HolyOilsExplorer';
import LiturgicalMisconceptionsExplorer from '../components/LiturgicalMisconceptionsExplorer';
import HolyWaterAndThuriferExplorer from '../components/HolyWaterAndThuriferExplorer';
import StationsOfTheCrossGuide from '../components/StationsOfTheCrossGuide';
import TriduumEasterJourneyGuide from '../components/TriduumEasterJourneyGuide';
import LiturgyOfTheHoursGuide from '../components/LiturgyOfTheHoursGuide';
import SacredObjectsExplorer from '../components/SacredObjectsExplorer';
import { speakInLanguage, cancelSpeech } from '../engine/translationService';
import { playSuccessChime, triggerHapticSuccess } from '../services/soundHaptics';

export type CatholicLifeTab =
  | 'overview'
  | 'church-tour'
  | 'stations-of-the-cross'
  | 'triduum-easter'
  | 'liturgy-of-the-hours'
  | 'altar'
  | 'holy-water-thurifer'
  | 'holy-oils'
  | 'rites'
  | 'postures'
  | 'mass'
  | 'sacraments'
  | 'first-communion'
  | 'rosary'
  | 'creed'
  | 'commandments'
  | 'liturgical-year'
  | 'sacred-objects'
  | 'prayers-latin'
  | 'cst-virtues'
  | 'journal';

import {
  CST_PRINCIPLES,
  SCHOOL_VIRTUES,
  CSTPrinciple,
  SchoolVirtue,
} from '../data/catholic';

export { CST_PRINCIPLES, SCHOOL_VIRTUES };
export type { CSTPrinciple, SchoolVirtue };

export default function CatholicLifePage(): React.JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<CatholicLifeTab>(() => {
    const tabParam = searchParams.get('tab');
    if (
      tabParam &&
      [
        'overview',
        'church-tour',
        'stations-of-the-cross',
        'triduum-easter',
        'liturgy-of-the-hours',
        'altar',
        'holy-water-thurifer',
        'holy-oils',
        'rites',
        'postures',
        'mass',
        'sacraments',
        'first-communion',
        'rosary',
        'creed',
        'commandments',
        'liturgical-year',
        'sacred-objects',
        'prayers-latin',
        'cst-virtues',
        'journal',
      ].includes(tabParam)
    ) {
      return tabParam as CatholicLifeTab;
    }
    return 'overview';
  });

  const [selectedCst, setSelectedCst] = useState<CSTPrinciple>(CST_PRINCIPLES[0]);
  const [selectedVirtue, setSelectedVirtue] = useState<SchoolVirtue>(SCHOOL_VIRTUES[0]);
  const [overviewPlayerExpanded, setOverviewPlayerExpanded] = useState<boolean>(false);
  const [overviewTouchLock, setOverviewTouchLock] = useState<boolean>(true);
  const [cstPlayerExpanded, setCstPlayerExpanded] = useState<boolean>(false);
  const [massPlayerExpanded, setMassPlayerExpanded] = useState<boolean>(false);
  const [firstCommunionPlayerExpanded, setFirstCommunionPlayerExpanded] = useState<boolean>(false);

  // Keep state synced with URL search params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      if (
        [
          'overview',
          'church-tour',
          'stations-of-the-cross',
          'triduum-easter',
          'liturgy-of-the-hours',
          'altar',
          'holy-water-thurifer',
          'holy-oils',
          'rites',
          'postures',
          'mass',
          'sacraments',
          'first-communion',
          'rosary',
          'creed',
          'commandments',
          'liturgical-year',
          'sacred-objects',
          'prayers-latin',
          'cst-virtues',
          'journal',
        ].includes(tabParam)
      ) {
        setActiveTab(tabParam as CatholicLifeTab);
      }
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tab: CatholicLifeTab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'overview' ? {} : { tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navCards = [
    {
      tab: 'church-tour' as CatholicLifeTab,
      icon: '⛪',
      title: 'Tour of a Catholic Church',
      desc: 'Interactive AST vector walkthrough of the Narthex, Nave, Ambo, Altar, Tabernacle & Lady Chapel.',
      color: '#0284c7',
      bg: '#f0f9ff',
      badge: 'Interactive Tour (< 4 KB)',
    },
    {
      tab: 'stations-of-the-cross' as CatholicLifeTab,
      icon: '✝️',
      title: 'The Stations of the Cross (Via Crucis)',
      desc: '14 sacred stations of the Via Dolorosa, Golgotha Calvary hill, Roman praetorium, Holy Sepulchre tomb, and glorious Easter Resurrection with live AST vector cartridge.',
      color: '#b91c1c',
      bg: '#fef2f2',
      badge: 'Via Dolorosa & Easter Cartridge',
    },
    {
      tab: 'triduum-easter' as CatholicLifeTab,
      icon: '🔥',
      title: 'The Sacred Triduum & Easter (Lumen Christi)',
      desc: 'The unbroken three-day liturgy: Holy Thursday Upper Room, Good Friday Calvary, Holy Saturday Great Silence, Lumen Christi Easter Vigil & the 50-day glory of Eastertide.',
      color: '#d97706',
      bg: '#fffbeb',
      badge: 'Unbroken Liturgy & Lumen Christi',
    },
    {
      tab: 'liturgy-of-the-hours' as CatholicLifeTab,
      icon: '🕰️',
      title: 'The Liturgy of the Hours (Divine Office)',
      desc: 'Sanctifying day & night: Office of Readings, Lauds, Daytime Hours (Terce, Sext, None), Vespers, Compline, Gospel Canticles & 4-Week Psalter.',
      color: '#4f46e5',
      bg: '#eef2ff',
      badge: 'Live Canonical Clock & Breviary',
    },
    {
      tab: 'altar' as CatholicLifeTab,
      icon: '✝️',
      title: 'The Catholic Altar & Types of Altars',
      desc: 'Versus Populum, High Altar, Altar Stone with martyr relics, Mensa, Corporal, Chalice, Missal & sacristan dressing lab.',
      color: '#b45309',
      bg: '#fffbeb',
      badge: 'Interactive Anatomy & Types',
    },
    {
      tab: 'holy-water-thurifer' as CatholicLifeTab,
      icon: '💧',
      title: 'Holy Water & The Thurifer',
      desc: 'Aqua Benedicta, the Sunday Asperges sprinkling rite, the Thurifer & Boat Bearer, Thurible anatomy, and the 7 Mass incensations.',
      color: '#0284c7',
      bg: '#f0f9ff',
      badge: 'Sacramentals & Incense',
    },
    {
      tab: 'holy-oils' as CatholicLifeTab,
      icon: '🏺',
      title: 'The Three Holy Oils & Sacred Ambry',
      desc: 'Sacred Chrism (S.C.), Oil of Catechumens (O.C.), Oil of the Sick (O.I.), the Ambry cabinet, Chrism Mass, and pocket oil stocks.',
      color: '#d97706',
      bg: '#fef3c7',
      badge: 'Olea Sancta & Ambry',
    },
    {
      tab: 'rites' as CatholicLifeTab,
      icon: '🌍',
      title: 'The 6 Rites & 24 Catholic Churches',
      desc: 'Eastern Catholic Churches in the Middle East, India, Africa & Eastern Europe. Discover the Church breathing with two lungs (CCC 1200–1209).',
      color: '#047857',
      bg: '#ecfdf5',
      badge: 'Global South & Eastern Rites',
    },
    {
      tab: 'postures' as CatholicLifeTab,
      icon: '🕊️',
      title: 'Liturgical Postures & Misconceptions',
      desc: 'Receiving the Eucharist (Tongue, Hand, Byzantine Spoon), Our Father hand postures (Priestly Orans vs. Joined Hands), and Liturgy Mythbusters.',
      color: '#7c3aed',
      bg: '#f5f3ff',
      badge: 'Rubrics & Cross-Rite Guide',
    },
    {
      tab: 'mass' as CatholicLifeTab,
      icon: '⛪',
      title: 'The Holy Mass & Liturgy',
      desc: 'Interactive step-by-step walkthrough, postures, congregation responses & liturgy sequencing game.',
      color: '#4338ca',
      bg: '#eef2ff',
      badge: 'Interactive Walkthrough',
    },
    {
      tab: 'sacraments' as CatholicLifeTab,
      icon: '🕊️',
      title: 'The Seven Sacraments',
      desc: 'Sacraments of Initiation, Healing, and Service. Outward signs, form, matter, scripture & CCC roots.',
      color: '#0891b2',
      bg: '#ecfeff',
      badge: 'Foundations of Grace',
    },
    {
      tab: 'first-communion' as CatholicLifeTab,
      icon: '🍞',
      title: 'First Holy Communion Lab',
      desc: 'Reconciliation preparation, Examination of Conscience, receiving reverently & Thanksgiving.',
      color: '#b45309',
      bg: '#fffbeb',
      badge: 'Parish & Family Companion',
    },
    {
      tab: 'rosary' as CatholicLifeTab,
      icon: '📿',
      title: 'The Holy Rosary',
      desc: 'Interactive virtual decade walk through the Joyful, Luminous, Sorrowful & Glorious Mysteries.',
      color: '#059669',
      bg: '#ecfdf5',
      badge: '20 Mysteries with Scripture',
    },
    {
      tab: 'cst-virtues' as CatholicLifeTab,
      icon: '🤝',
      title: 'Catholic Social Teaching & Virtues',
      desc: '7 Core CST Principles (Human Dignity, Laudato Si\', Common Good) & St Joseph’s school virtues.',
      color: '#15803d',
      bg: '#f0fdf4',
      badge: 'Faith in Action',
    },
    {
      tab: 'creed' as CatholicLifeTab,
      icon: '🏛️',
      title: 'The Creeds of the Church',
      desc: 'Apostles\' Creed and Nicene Creed broken down clause-by-clause with theological clarity.',
      color: '#7c3aed',
      bg: '#f5f3ff',
      badge: 'What We Believe',
    },
    {
      tab: 'commandments' as CatholicLifeTab,
      icon: '📜',
      title: 'Commandments & Beatitudes',
      desc: 'Ten Commandments for young disciples and Jesus’s 8 Beatitudes from the Sermon on the Mount.',
      color: '#c026d3',
      bg: '#fdf4ff',
      badge: 'Moral Compass',
    },
    {
      tab: 'liturgical-year' as CatholicLifeTab,
      icon: '🌿',
      title: 'Liturgical Calendar & Seasons',
      desc: 'Advent, Christmas, Lent, Easter, Pentecost & Ordinary Time. Vestment colours, meanings & feasts.',
      color: '#16a34a',
      bg: '#f0fdf4',
      badge: 'Church Seasons',
    },
    {
      tab: 'sacred-objects' as CatholicLifeTab,
      icon: '🏺',
      title: 'Sacred Objects & Vestments',
      desc: 'Chalice, Monstrance, Ciborium, Tabernacle, Holy Water Stoup, Thurible, Aspergillum, Alb, Stole, Chasuble & recognition quiz.',
      color: '#d97706',
      bg: '#fffbeb',
      badge: 'Sanctuary Tour',
    },
    {
      tab: 'prayers-latin' as CatholicLifeTab,
      icon: '📖',
      title: 'Prayers & Latin Mass Chapel',
      desc: 'Daily school prayers with fill-in blanks + Traditional Latin Mass prayers with spoken audio.',
      color: '#1e3a8a',
      bg: '#eff6ff',
      badge: 'Bilingual Latin & English',
    },
    {
      tab: 'journal' as CatholicLifeTab,
      icon: '📓',
      title: 'My Mass & Prayer Journal',
      desc: 'Personal Sunday Gospel reflections, parish prayer intentions, and stars earned stored on-device.',
      color: '#475569',
      bg: '#f8fafc',
      badge: 'Zero-Cloud Private Journal',
    },
  ];

  return (
    <PageMeta
      title="Catholic Life & Faith Sanctuary"
      description="St Joseph's Whole-School Catholic Faith Sanctuary: Holy Mass, Seven Sacraments, Rosary, Daily Prayers, Creeds, Liturgical Seasons, and Catholic Social Teaching. Unified in one place for all ages."
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem 3.5rem 1rem' }}>
        {/* Whole-School Spiritual Banner */}
        <section
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a8a 100%)',
            borderRadius: '20px',
            color: '#ffffff',
            padding: '2.5rem 2rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 25px -5px rgba(30, 27, 75, 0.25)',
            border: '2px solid #facc15',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              fontSize: '12rem',
              opacity: 0.04,
              pointerEvents: 'none',
              lineHeight: 1,
            }}
          >
            ✝️
          </div>

          <div style={{ maxWidth: '820px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
              <span
                style={{
                  background: 'rgba(250, 204, 21, 0.2)',
                  color: '#fef08a',
                  border: '1px solid rgba(250, 204, 21, 0.4)',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>✝️</span>
                <span>Whole-School &amp; Parish Community</span>
              </span>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                🌿 Not Key Staged &bull; For All Year Groups &amp; Families
              </span>
            </div>

            <h1
              style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                margin: '0 0 0.85rem 0',
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              St Joseph's Catholic Life &amp; Faith Sanctuary
            </h1>

            <p
              style={{
                fontSize: '1.1rem',
                lineHeight: 1.6,
                color: '#e0e7ff',
                margin: '0 0 1.5rem 0',
              }}
            >
              <em>"Christ at the Heart of All That We Do."</em> Our Catholic faith is not a textbook subject split into Key Stages. It is a living, lifelong communion shared by every pupil from Reception to Year 6, our families, catechists, and parish priests.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => handleTabChange('overview')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: activeTab === 'overview' ? '#facc15' : 'rgba(255, 255, 255, 0.15)',
                  color: activeTab === 'overview' ? '#1e1b4b' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: activeTab === 'overview' ? '0 2px 8px rgba(250, 204, 21, 0.4)' : 'none',
                }}
              >
                🏠 Sanctuary Overview
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('church-tour')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: activeTab === 'church-tour' ? '#facc15' : 'rgba(255, 255, 255, 0.15)',
                  color: activeTab === 'church-tour' ? '#1e1b4b' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: activeTab === 'church-tour' ? '0 2px 8px rgba(250, 204, 21, 0.4)' : 'none',
                }}
              >
                ⛪ Church Tour
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('rites')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: activeTab === 'rites' ? '#facc15' : 'rgba(255, 255, 255, 0.15)',
                  color: activeTab === 'rites' ? '#1e1b4b' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: activeTab === 'rites' ? '0 2px 8px rgba(250, 204, 21, 0.4)' : 'none',
                }}
              >
                🌍 6 Rites &amp; 24 Churches
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('mass')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: activeTab === 'mass' ? '#facc15' : 'rgba(255, 255, 255, 0.15)',
                  color: activeTab === 'mass' ? '#1e1b4b' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                ⛪ The Holy Mass
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('sacraments')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: activeTab === 'sacraments' ? '#facc15' : 'rgba(255, 255, 255, 0.15)',
                  color: activeTab === 'sacraments' ? '#1e1b4b' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                🕊️ Seven Sacraments
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('rosary')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: activeTab === 'rosary' ? '#facc15' : 'rgba(255, 255, 255, 0.15)',
                  color: activeTab === 'rosary' ? '#1e1b4b' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                📿 Holy Rosary
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('cst-virtues')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: activeTab === 'cst-virtues' ? '#facc15' : 'rgba(255, 255, 255, 0.15)',
                  color: activeTab === 'cst-virtues' ? '#1e1b4b' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                🤝 CST &amp; Virtues
              </button>
            </div>
          </div>
        </section>

        {/* Secondary Category Navigation Bar */}
        <div
          role="navigation"
          aria-label="Catholic Sanctuary Sections"
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '10px',
            marginBottom: '1.75rem',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          {[
            { id: 'overview', label: '🏠 Overview' },
            { id: 'church-tour', label: '⛪ Church Tour' },
            { id: 'stations-of-the-cross', label: '✝️ Stations of the Cross' },
            { id: 'triduum-easter', label: '🔥 Sacred Triduum & Easter' },
            { id: 'liturgy-of-the-hours', label: '🕰️ Liturgy of the Hours' },
            { id: 'altar', label: '✝️ The Catholic Altar' },
            { id: 'holy-water-thurifer', label: '💧 Holy Water & Thurifer' },
            { id: 'holy-oils', label: '🏺 The Holy Oils' },
            { id: 'rites', label: '🌍 6 Rites & 24 Churches' },
            { id: 'postures', label: '🕊️ Postures & Misconceptions' },
            { id: 'mass', label: '⛪ The Mass' },
            { id: 'sacraments', label: '🕊️ 7 Sacraments' },
            { id: 'first-communion', label: '🍞 First Communion' },
            { id: 'rosary', label: '📿 Holy Rosary' },
            { id: 'cst-virtues', label: '🤝 CST & Virtues' },
            { id: 'creed', label: '🏛️ Creeds' },
            { id: 'commandments', label: '📜 Commandments' },
            { id: 'liturgical-year', label: '🌿 Church Seasons' },
            { id: 'sacred-objects', label: '🏺 Sacred Objects' },
            { id: 'prayers-latin', label: '📖 Prayers & Latin' },
            { id: 'journal', label: '📓 Mass Journal' },
          ].map((item) => {
            const isCur = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id as CatholicLifeTab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${isCur ? '#312e81' : '#cbd5e1'}`,
                  background: isCur ? '#312e81' : '#ffffff',
                  color: isCur ? '#ffffff' : '#334155',
                  fontWeight: isCur ? 700 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.12s ease',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* 1. OVERVIEW HUB */}
        {activeTab === 'overview' && (
          <div>
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fef08a',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem' }}>🌟</span>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#78350f', margin: '0 0 2px 0' }}>
                    Welcome to our Unified Catholic Life &amp; Faith Portal
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: '#92400e', margin: 0 }}>
                    Here, children, parents, teachers, and parish catechists can explore every element of Catholic teaching in one unified space.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleTabChange('church-tour')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  ⛪ Interactive Church Tour &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('rites')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#047857',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  🌍 6 Rites &amp; 24 Churches &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('mass')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#d97706',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Walk Through The Mass &rarr;
                </button>
              </div>
            </div>

            {/* Featured Church Tour Vector Player on Overview - Responsive & Mobile-Optimized */}
            <div
              className="catholic-life-overview-player-card"
              style={{
                background: '#090d16',
                border: '1px solid #1e293b',
                borderRadius: '16px',
                padding: '1.25rem',
                marginBottom: '2.5rem',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.3rem' }}>⛪</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                      Featured: Interactive Tour of a Catholic Church
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                      Narthex, Nave, Ambo, Altar, Tabernacle &amp; Lady Chapel &bull; 6 Sacred Spaces
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Mobile Preview Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setOverviewPlayerExpanded(prev => !prev)}
                    className="md:hidden"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: overviewPlayerExpanded ? '#334155' : 'rgba(56, 189, 248, 0.15)',
                      color: overviewPlayerExpanded ? '#cbd5e1' : '#38bdf8',
                      border: `1px solid ${overviewPlayerExpanded ? '#475569' : '#0284c7'}`,
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{overviewPlayerExpanded ? '⏹️ Hide 3D Stage' : '▶️ Preview 3D Stage'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange('church-tour')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Full Tour &amp; Sacred Spaces &rarr;
                  </button>
                </div>
              </div>

              {/* Mobile Compact Hero Preview when collapsed */}
              <div className={`md:hidden ${overviewPlayerExpanded ? 'hidden' : 'block'}`}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid #334155',
                    marginBottom: '0.5rem',
                  }}
                >
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                    📱 <strong>Mobile Viewport Notice:</strong> To ensure fast page scrolling across all 16 Catholic modules, the heavy 3D canvas is docked in the dedicated <strong>Church Tour</strong> tab.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {[
                      '1. 💧 Holy Water Font',
                      '2. ⛪ Nave & Pew Pliant',
                      '3. 📖 Pulpit / Ambo',
                      '4. ✝️ High Altar of Sacrifice',
                      '5. ✨ Tabernacle & Red Lamp',
                      '6. 🕊️ Lady Chapel',
                    ].map((st) => (
                      <span
                        key={st}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#f8fafc',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleTabChange('church-tour')}
                      style={{
                        background: '#facc15',
                        color: '#0f172a',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      ⛪ Open Full Interactive Tour &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => setOverviewPlayerExpanded(true)}
                      style={{
                        background: 'transparent',
                        color: '#38bdf8',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #0284c7',
                        cursor: 'pointer',
                      }}
                    >
                      ▶️ Expand 3D Player Here
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Vector Player (Always visible on desktop md+, toggleable on mobile) */}
              <div className={`relative ${overviewPlayerExpanded ? 'block' : 'hidden md:block'}`}>
                {/* Touch Safeguard Bar for Mobile */}
                <div
                  className="md:hidden"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#0f172a',
                    padding: '6px 10px',
                    borderRadius: '8px 8px 0 0',
                    border: '1px solid #334155',
                    borderBottom: 'none',
                    fontSize: '0.74rem',
                    color: '#94a3b8',
                  }}
                >
                  <span>Touch interaction mode:</span>
                  <button
                    type="button"
                    onClick={() => setOverviewTouchLock(prev => !prev)}
                    style={{
                      background: overviewTouchLock ? 'rgba(56, 189, 248, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                      color: overviewTouchLock ? '#38bdf8' : '#facc15',
                      border: `1px solid ${overviewTouchLock ? '#0284c7' : '#eab308'}`,
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {overviewTouchLock ? '🔒 Page Scroll Safe' : '👆 3D Interactive'}
                  </button>
                </div>

                <div style={{ pointerEvents: 'auto', position: 'relative', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                  <AstVectorMediaPlayer
                    preset="church-tour"
                    autoPlay={true}
                    height="clamp(210px, 45vw + 40px, 380px)"
                    allowPresetSwitch={false}
                    embedded={true}
                  />
                  {overviewTouchLock && (
                    <div
                      onClick={() => setOverviewTouchLock(false)}
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        background: 'rgba(15, 23, 42, 0.92)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(250, 204, 21, 0.5)',
                        color: '#fef08a',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        pointerEvents: 'auto',
                      }}
                      title="Tap to enable 3D Orbit touch interactions"
                    >
                      <span>👆 Tap to Enable 3D Orbit</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grid of All Sanctuary Modules */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: '1.25rem',
                marginBottom: '3rem',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {navCards.map((card) => (
                <div
                  key={card.tab}
                  onClick={() => handleTabChange(card.tab)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.05)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px -3px rgba(15, 23, 42, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(15, 23, 42, 0.05)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          background: card.bg,
                          color: card.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                        }}
                      >
                        {card.icon}
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: card.color,
                          background: card.bg,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                        }}
                      >
                        {card.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                      {card.title}
                    </h3>

                    <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                      {card.desc}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: card.color }}>
                    <span>Explore Section</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Catholic Social Teaching Featurette on Overview */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                border: '2px solid #bbf7d0',
                borderRadius: '18px',
                padding: '2rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Living Our Faith
                  </span>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#064e3b', margin: '4px 0 0 0' }}>
                    Catholic Social Teaching &amp; School Virtues
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange('cst-virtues')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#15803d',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  View All 7 CST Pillars &rarr;
                </button>
              </div>

              <p style={{ fontSize: '0.95rem', color: '#047857', lineHeight: 1.6, maxWidth: '800px', margin: '0 0 1.5rem 0' }}>
                Rooted in the Gospel and papal encyclicals including <em>Laudato Si’</em> and <em>Fratelli Tutti</em>, Catholic Social Teaching equips our students to build a world where the dignity of every person is honoured, creation is protected, and the poorest are cherished.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {CST_PRINCIPLES.slice(0, 3).map((p) => (
                  <div key={p.id} style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #dcfce7' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{p.icon}</div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>{p.title}</h4>
                    <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>{p.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. CATHOLIC SOCIAL TEACHING & SCHOOL VIRTUES */}
        {activeTab === 'cst-virtues' && (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🤝</span>
                  <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Catholic Social Teaching (CST) &amp; St Joseph's Virtues
                  </h2>
                </div>
                <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>
                  How we put the Gospel into daily action: our 7 CST Pillars and our school patron virtues.
                </p>
              </div>

              {/* Vector Sim Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setCstPlayerExpanded(!cstPlayerExpanded)}
                  style={{
                    background: cstPlayerExpanded ? '#15803d' : '#f0fdf4',
                    border: '1.5px solid #16a34a',
                    borderRadius: '9999px',
                    color: cstPlayerExpanded ? '#ffffff' : '#166534',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{cstPlayerExpanded ? '▲ Hide Vector Sim' : '🎮 Vector Simulation'}</span>
                </button>

                <Link
                  to="/media-player?preset=cst-virtues"
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '9999px',
                    color: '#334155',
                    padding: '6px 14px',
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

            {/* Embedded AST Vector Media Player for CST & Virtues */}
            {cstPlayerExpanded && (
              <div style={{ borderRadius: '14px', overflow: 'hidden', border: '2px solid #15803d', background: '#090e1a', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
                <div style={{ background: '#064e3b', padding: '10px 16px', borderBottom: '1px solid #047857', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#facc15' }}>
                    <span>✨</span>
                    <span>AST Vector Interactive Engine: Catholic Social Teaching &amp; Virtues</span>
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#a7f3d0', fontFamily: 'monospace' }}>Cartridge: cst-virtues.ast</span>
                </div>
                <AstVectorMediaPlayer
                  preset="cst-virtues"
                  height="clamp(240px, 45vw + 40px, 420px)"
                  allowPresetSwitch={false}
                  embedded={true}
                  bslEnabled={false}
                />
              </div>
            )}

            {/* CST Principles Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {/* Pillar List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e3a8a', margin: '0 0 6px 0' }}>
                  The 7 Pillars of Catholic Social Teaching
                </h3>
                {CST_PRINCIPLES.map((cst) => {
                  const isSelected = selectedCst.id === cst.id;
                  return (
                    <button
                      key={cst.id}
                      type="button"
                      onClick={() => setSelectedCst(cst)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: `1px solid ${isSelected ? '#15803d' : '#e2e8f0'}`,
                        background: isSelected ? '#f0fdf4' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '1.6rem' }}>{cst.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: isSelected ? '#166534' : '#0f172a' }}>
                          {cst.childTitle}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: isSelected ? '#15803d' : '#64748b', marginTop: '2px' }}>
                          {cst.title} &bull; {cst.scripture}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Pillar Detail Card */}
              <div
                style={{
                  background: '#ffffff',
                  border: '2px solid #bbf7d0',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 4px 14px rgba(21, 128, 61, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>{selectedCst.icon}</span>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                        Catholic Social Teaching &bull; {selectedCst.title}
                      </span>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                        {selectedCst.childTitle}
                      </h3>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#f8fafc',
                      borderLeft: '4px solid #15803d',
                      padding: '10px 14px',
                      borderRadius: '0 8px 8px 0',
                      marginBottom: '1.25rem',
                      fontStyle: 'italic',
                      fontSize: '0.88rem',
                      color: '#334155',
                    }}
                  >
                    📖 {selectedCst.scripture}
                  </div>

                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                    Catholic Teaching:
                  </h4>
                  <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                    {selectedCst.summary}
                  </p>

                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#15803d', margin: '0 0 6px 0' }}>
                    🏫 What This Looks Like at St Joseph’s:
                  </h4>
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #dcfce7',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      fontSize: '0.88rem',
                      color: '#166534',
                      lineHeight: 1.5,
                    }}
                  >
                    {selectedCst.schoolAction}
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      speakInLanguage(`${selectedCst.title}. Scripture: ${selectedCst.scripture}. At St Joseph's: ${selectedCst.schoolAction}`, 'en');
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>🔊 Listen to Reflection</span>
                  </button>
                </div>
              </div>
            </div>

            {/* St Joseph's School Virtues */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '2rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '2rem' }}>⭐</span>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    St Joseph’s School Virtues
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Inspired by our patron St Joseph: humble, faithful, compassionate, and brave.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {SCHOOL_VIRTUES.map((v) => {
                  const isSel = selectedVirtue.name === v.name;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setSelectedVirtue(v)}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: `1px solid ${isSel ? '#2563eb' : '#cbd5e1'}`,
                        background: isSel ? '#eff6ff' : '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: '1.75rem', marginBottom: '6px' }}>{v.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: isSel ? '#1d4ed8' : '#0f172a' }}>
                        {v.name}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #dbeafe',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.8rem' }}>{selectedVirtue.icon}</span>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e40af', margin: 0 }}>
                    {selectedVirtue.name}
                  </h4>
                </div>
                <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                  <strong>Definition:</strong> {selectedVirtue.definition}
                </p>
                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                  <strong>Holy Example:</strong> {selectedVirtue.patronExample}
                </p>
                <div
                  style={{
                    background: '#eff6ff',
                    borderLeft: '4px solid #3b82f6',
                    padding: '10px 14px',
                    borderRadius: '0 8px 8px 0',
                    fontSize: '0.9rem',
                    color: '#1e40af',
                    fontWeight: 600,
                  }}
                >
                  💡 Daily Pupil Question: {selectedVirtue.reflectionQuestion}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. THE HOLY MASS & SACRAMENTS & OTHER SUB-MODULES */}
        {activeTab !== 'overview' && activeTab !== 'cst-virtues' && (
          <div>
            {activeTab === 'sacraments' && (
              <div style={{ marginBottom: '2rem' }}>
                <SevenSacramentsGuide />
              </div>
            )}

            {activeTab === 'liturgical-year' && (
              <div style={{ marginBottom: '2rem' }}>
                <LiturgicalCalendarGuide />
              </div>
            )}

            {activeTab === 'prayers-latin' && (
              <div style={{ marginBottom: '2rem' }}>
                <LatinMassPrayersChapel />
              </div>
            )}

            {activeTab === 'creed' && (
              <div style={{ marginBottom: '2rem' }}>
                <CreedExplorer />
              </div>
            )}

            {activeTab === 'commandments' && (
              <div style={{ marginBottom: '2rem' }}>
                <CommandmentsMoralGuide />
              </div>
            )}

            {activeTab === 'rosary' && (
              <div style={{ marginBottom: '2rem' }}>
                <RosaryMysteryWalk />
              </div>
            )}

            {activeTab === 'church-tour' && (
              <div style={{ marginBottom: '2.5rem' }}>
                <SanctuaryPilgrimQuest />

                {/* Liturgical Architecture FAQ */}
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '1.25rem 1.5rem',
                    marginTop: '2rem',
                  }}
                >
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    Catechetical Insights for Pupils &amp; Families
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.82rem', color: '#475569' }}>
                    <div>
                      <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                        Why is a Catholic church shaped like a cross?
                      </strong>
                      Traditional Catholic churches follow a <em>Cruciform</em> (Latin cross) floor plan. It constantly reminds us that Christ’s Cross is the foundation of our faith. Churches are traditionally oriented facing East (<em>Ad Orientem</em>) towards the rising sun, symbolizing the Resurrection and the Second Coming.
                    </div>
                    <div>
                      <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                        Why do we genuflect on the right knee?
                      </strong>
                      Genuflecting (from Latin <em>genu flectere</em>, to bend the knee) is an ancient royal posture reserved only for God. In the Catholic church, we bend our right knee toward the Tabernacle to acknowledge that the King of Kings, Jesus Christ, is truly present in the Holy Eucharist.
                    </div>
                  </div>
                </div>

                {/* Dedicated Altar Deep Dive Card */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    borderRadius: '16px',
                    border: '2px solid #facc15',
                    padding: '1.5rem',
                    marginTop: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ maxWidth: '680px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.4rem' }}>✝️</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#92400e', margin: 0 }}>
                        Deep-Dive: The Sacred Anatomy &amp; Types of the Catholic Altar
                      </h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#78350f', lineHeight: 1.45 }}>
                      Examine the 4 historical types of altars (Versus Populum, High Altar, Altar Stone with martyr relics, and Side Altars), inspect the sacred linens and vessels, and step through the interactive Sacristan Dressing Lab.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTabChange('altar')}
                    style={{
                      background: '#b45309',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      fontWeight: 800,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(180, 83, 9, 0.3)',
                    }}
                  >
                    Open Altar Explorer &rarr;
                  </button>
                </div>

                {/* Dedicated Holy Oils Ambry Deep Dive Card */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)',
                    borderRadius: '16px',
                    border: '2px solid #38bdf8',
                    padding: '1.5rem',
                    marginTop: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ maxWidth: '680px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.4rem' }}>🏺</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0369a1', margin: 0 }}>
                        The Three Holy Oils (Olea Sancta) &amp; The Sacred Ambry
                      </h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#0f766e', lineHeight: 1.45 }}>
                      Explore the sanctuary Ambry housing the three silver and crystal ampullae: Sacred Chrism (S.C.), Oil of Catechumens (O.C.), and Oil of the Sick (O.I.), the annual Chrism Mass, and priestly pocket oil stocks.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTabChange('holy-oils')}
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      fontWeight: 800,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                    }}
                  >
                    Explore Holy Oils &rarr;
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'stations-of-the-cross' && (
              <div style={{ marginBottom: '2.5rem' }}>
                <StationsOfTheCrossGuide />
              </div>
            )}

            {activeTab === 'triduum-easter' && (
              <div style={{ marginBottom: '2.5rem' }}>
                <TriduumEasterJourneyGuide />
              </div>
            )}

            {activeTab === 'liturgy-of-the-hours' && (
              <div style={{ marginBottom: '2.5rem' }}>
                <LiturgyOfTheHoursGuide />
              </div>
            )}

            {activeTab === 'altar' && (
              <div style={{ marginBottom: '2.5rem' }}>
                <AltarAnatomyExplorer />
              </div>
            )}

            {activeTab === 'holy-water-thurifer' && (
              <div style={{ marginBottom: '2.5rem' }}>
                <HolyWaterAndThuriferExplorer />
              </div>
            )}

            {activeTab === 'holy-oils' && (
              <div style={{ marginBottom: '2.5rem' }}>
                <HolyOilsExplorer />
              </div>
            )}

            {activeTab === 'rites' && (
              <div style={{ marginBottom: '2.5rem' }}>
                <CatholicRitesExplorer />
              </div>
            )}

            {activeTab === 'postures' && (
              <div style={{ marginBottom: '2.5rem' }}>
                <LiturgicalMisconceptionsExplorer />
              </div>
            )}

            {activeTab === 'sacred-objects' && (
              <div style={{ marginBottom: '2.5rem' }}>
                <SacredObjectsExplorer />
              </div>
            )}

            {activeTab === 'first-communion' && (
              <div style={{ marginBottom: '2rem' }}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #431407 0%, #1e1b4b 60%, #090d16 100%)',
                    borderRadius: '16px',
                    padding: '1.75rem',
                    color: '#ffffff',
                    marginBottom: '1.5rem',
                    border: '2px solid #f59e0b',
                    boxShadow: '0 8px 24px rgba(67, 20, 7, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ maxWidth: '680px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.8rem' }}>🍞</span>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fef08a', margin: 0 }}>
                        First Holy Communion &amp; Eucharistic Adoration
                      </h3>
                      <span style={{ background: '#f59e0b', color: '#451a03', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800 }}>
                        Real Presence
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                      Prepare heart and soul to welcome the Lord Jesus: the Sacrament of Reconciliation, the 1-hour Eucharistic fast, reverent reception on the tongue or hand with a devout &apos;Amen&apos;, and silent thanksgiving before the Blessed Sacrament in the Monstrance.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setFirstCommunionPlayerExpanded(!firstCommunionPlayerExpanded)}
                      style={{
                        background: firstCommunionPlayerExpanded ? '#facc15' : 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '9999px',
                        color: firstCommunionPlayerExpanded ? '#1e1b4b' : '#ffffff',
                        padding: '6px 14px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{firstCommunionPlayerExpanded ? '▲ Hide Vector Sim' : '🎮 Vector Simulation'}</span>
                    </button>

                    <Link
                      to="/media-player?preset=first-communion"
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '9999px',
                        color: '#ffffff',
                        padding: '6px 14px',
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

                {/* Embedded AST Vector Media Player for First Communion */}
                {firstCommunionPlayerExpanded && (
                  <div style={{ borderRadius: '14px', overflow: 'hidden', border: '2px solid #ca8a04', background: '#090e1a', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
                    <div style={{ background: '#431407', padding: '10px 16px', borderBottom: '1px solid #78350f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#facc15' }}>
                        <span>✨</span>
                        <span>AST Vector Interactive Engine: First Holy Communion &amp; Eucharistic Adoration</span>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#fde68a', fontFamily: 'monospace' }}>Cartridge: first-communion.ast</span>
                    </div>
                    <AstVectorMediaPlayer
                      preset="first-communion"
                      height="clamp(240px, 45vw + 40px, 420px)"
                      allowPresetSwitch={false}
                      embedded={true}
                      bslEnabled={false}
                    />
                  </div>
                )}

                <FirstCommunionMasteryLab />
              </div>
            )}

            {activeTab === 'mass' && (
              <div style={{ marginBottom: '2rem' }}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #311042 0%, #1e1b4b 60%, #0f172a 100%)',
                    borderRadius: '16px',
                    padding: '1.75rem',
                    color: '#ffffff',
                    marginBottom: '1.5rem',
                    border: '2px solid #854d0e',
                    boxShadow: '0 8px 24px rgba(49, 16, 66, 0.25)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ maxWidth: '680px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.8rem' }}>🍷</span>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fef08a', margin: 0 }}>
                        The Order of the Holy Mass (Ordo Missae)
                      </h3>
                      <span style={{ background: '#f59e0b', color: '#451a03', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800 }}>
                        Source &amp; Summit
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                      Step through the 4 movements of the Holy Sacrifice of the Mass: Introductory Rites, Liturgy of the Word, Liturgy of the Eucharist (Transubstantiation, Epiclesis &amp; Elevation), and Concluding Rites.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setMassPlayerExpanded(!massPlayerExpanded)}
                      style={{
                        background: massPlayerExpanded ? '#facc15' : 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '9999px',
                        color: massPlayerExpanded ? '#1e1b4b' : '#ffffff',
                        padding: '6px 14px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{massPlayerExpanded ? '▲ Hide Vector Sim' : '🎮 Vector Simulation'}</span>
                    </button>

                    <Link
                      to="/media-player?preset=order-of-the-mass"
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '9999px',
                        color: '#ffffff',
                        padding: '6px 14px',
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

                {/* Embedded AST Vector Media Player for Order of the Mass */}
                {massPlayerExpanded && (
                  <div style={{ borderRadius: '14px', overflow: 'hidden', border: '2px solid #ca8a04', background: '#090e1a', marginBottom: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
                    <div style={{ background: '#311042', padding: '10px 16px', borderBottom: '1px solid #581c87', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#facc15' }}>
                        <span>✨</span>
                        <span>AST Vector Interactive Engine: The Order of the Holy Mass (Ordo Missae)</span>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#fde68a', fontFamily: 'monospace' }}>Cartridge: order-of-the-mass.ast</span>
                    </div>
                    <AstVectorMediaPlayer
                      preset="order-of-the-mass"
                      height="clamp(240px, 45vw + 40px, 420px)"
                      allowPresetSwitch={false}
                      embedded={true}
                      bslEnabled={false}
                    />
                  </div>
                )}
                
                <FirstCommunionMasteryLab />
              </div>
            )}

            {activeTab === 'journal' && (
              <div style={{ marginBottom: '2rem' }}>
                <FirstCommunionMasteryLab />
              </div>
            )}
          </div>
        )}

        {/* Bottom Navigation Back to Hub */}
        <div
          style={{
            marginTop: '3rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <button
            type="button"
            onClick={() => handleTabChange('overview')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            &larr; Back to Catholic Sanctuary Overview
          </button>

          <Link
            to="/learning-zone"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Explore National Curriculum Lessons</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </PageMeta>
  );
}
