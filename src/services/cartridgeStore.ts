// src/services/cartridgeStore.ts
/**
 * St. Joseph's Decentralized Curriculum Cartridge Store
 * 
 * Decentralized, client-side, zero-cloud storage and lifecycle engine for:
 * 1. Built-in Core STEM & Humanities Cartridges
 * 2. Imported PhET Interactive Simulations (HTML5, SWF, JSON)
 * 3. Teacher/Student User-Authored Cartridges
 * 4. Multi-Lesson Air-Gapped Cartridge Bundles
 * 
 * Invariants:
 * - 0% cloud database dependency (100% browser IndexedDB / LocalStorage persistence)
 * - True decentralization: Cartridges run standalone anywhere on GitHub Pages, offline, or air-gapped
 * - Instant PhET & Flash SWF distillation down to < 4 KB AST S-Expressions
 */

import { transpilePhetFile, isPhetBundle, extractPhetMetadata } from '../utils/phetBridge';
import { transpileSwfToAst } from '../utils/swfAstParser';
import {
  putVaultCartridge,
  getVaultCartridge,
  getAllVaultCartridges,
  deleteVaultCartridge,
  countVaultCartridges,
  hasVaultCartridge,
  type VaultCartridgeRecord,
} from './dbStore';
import {
  compressCartridge,
  decompressCartridge,
  compressCartridgeBundle,
  decompressCartridgeBundle,
  type CompressedCartridgeMetadata,
} from '../utils/cartridgeCompression';
import { PRESET_OPTIONS, type ScenePresetOption } from '../data/player/generatedScenes';
import { BUILTIN_DATA_CARTRIDGES } from '../data/player/dataCartridges';
import {
  type DataCartridgeQuestion,
  type DataCartridgePayload,
  extractDataPayloadFromAst,
  serializeDataCartridgeToAst,
} from '../utils/astQuestionExtractor';

export type { DataCartridgeQuestion, DataCartridgePayload };

export interface CartridgeDefinition {
  id: string;
  title: string;
  stage: string;
  oakId?: string;
  oakUnit?: string;
  subject?: string;
  category?: string;
  duration?: number;
  type?: 'Sim' | 'Slide' | 'App' | 'Film' | 'Data';
  video?: string;
  videoFit?: 'contain' | 'cover' | 'fill';
  desc: string;
  icon: string;
  source: 'builtin' | 'phet' | 'user' | 'imported';
  tier?: 'core' | 'phet' | 'user' | 'imported';
  isCore?: boolean;
  mount?: string;
  section?: string;
  order?: number;
  svgMarkup?: string;
  astSource?: string;
  svgFile?: string;
  astFile?: string;
  dataPayload?: DataCartridgePayload;
  author?: string;
  version?: string;
  invariants?: string[];
  createdAt?: number;
  updatedAt?: number;
}

export interface CartridgeBundle {
  id: string;
  title: string;
  description: string;
  cartridgeIds: string[];
  createdAt?: number;
}

const STORAGE_KEY_CUSTOM_CARTRIDGES = 'stj_custom_cartridges_v1';
const STORAGE_KEY_CUSTOM_BUNDLES = 'stj_custom_bundles_v1';

// Canonical Alias Map for fault-tolerant decentralized matching (e.g. spelling variants)
export const CARTRIDGE_ALIASES: Record<string, string> = {
  'bbc-micro': 'bbc-model-b',
  'bbc-model-b': 'bbc-model-b',
  'bbc': 'bbc-model-b',
  'bbc-basic': 'bbc-model-b',
  'acorn': 'bbc-model-b',
  '6502': 'bbc-model-b',
  'pythagorus': 'pythagoras',
  'pythagoras': 'pythagoras',
  'pythagoras-theorem': 'pythagoras',
  'pythagoras-proof': 'pythagoras',
  'ohms-law': 'electric-circuits',
  'phet-ohms-law': 'electric-circuits',
  'circuits': 'electric-circuits',
  'circuit': 'electric-circuits',
  'gas': 'kinetic-gas',
  'boyles-law': 'kinetic-gas',
  'curves': 'calculus-curves',
  'calculus': 'calculus-curves',
  'aquarium': 'fish-tank',
  'fish': 'fish-tank',
  'fishing': 'math-fishing',
  'mountain': 'mountain-elevation',
  'climber': 'mountain-elevation',
  'photosynth': 'photosynthesis',
  'leaf': 'photosynthesis',
  'stars': 'solar-system',
  'space': 'solar-system',
  'balance': 'algebra-balance',
  'atom': 'atom',
  'atomic-structure': 'atom',
  'bohr': 'atom',
  'periodic-table': 'atom',
  'elements': 'atom',
  'spelling': 'spelling-bee',
  'spelling-bee': 'spelling-bee',
  'bee': 'spelling-bee',
  'spell': 'spelling-bee',
  'stations': 'stations-of-the-cross',
  'stations-of-the-cross': 'stations-of-the-cross',
  'stations-cross': 'stations-of-the-cross',
  'via-crucis': 'stations-of-the-cross',
  'way-of-the-cross': 'stations-of-the-cross',
  'passion': 'stations-of-the-cross',
  'altar': 'altar-anatomy',
  'altar-anatomy': 'altar-anatomy',
  'altar-stone': 'altar-anatomy',
  'mensa': 'altar-anatomy',
  'holy-oils': 'holy-oils',
  'oils': 'holy-oils',
  'chrism': 'holy-oils',
  'ambry': 'holy-oils',
  'olea-sancta': 'holy-oils',
  'triduum': 'triduum-easter',
  'triduum-easter': 'triduum-easter',
  'easter': 'triduum-easter',
  'easter-vigil': 'triduum-easter',
  'lumen-christi': 'triduum-easter',
  'paschal-triduum': 'triduum-easter',
  'holy-water': 'holy-water-thurifer',
  'holy-water-thurifer': 'holy-water-thurifer',
  'thurifer': 'holy-water-thurifer',
  'thurible': 'holy-water-thurifer',
  'incense': 'holy-water-thurifer',
  'asperges': 'holy-water-thurifer',
  'liturgy-of-the-hours': 'liturgy-of-the-hours',
  'divine-office': 'liturgy-of-the-hours',
  'breviary': 'liturgy-of-the-hours',
  'canonical-hours': 'liturgy-of-the-hours',
  'lauds': 'liturgy-of-the-hours',
  'vespers': 'liturgy-of-the-hours',
  'seven-sacraments': 'seven-sacraments',
  'sacraments': 'seven-sacraments',
  'sacrament': 'seven-sacraments',
  'baptism': 'seven-sacraments',
  'confirmation': 'seven-sacraments',
  'eucharist': 'seven-sacraments',
  'liturgical-calendar': 'liturgical-calendar',
  'calendar': 'liturgical-calendar',
  'seasons': 'liturgical-calendar',
  'advent': 'liturgical-calendar',
  'lent': 'liturgical-calendar',
  'liturgical-postures': 'liturgical-postures',
  'postures': 'liturgical-postures',
  'genuflection': 'liturgical-postures',
  'kneeling': 'liturgical-postures',
  'bow': 'liturgical-postures',
  'catholic-rites': 'catholic-rites',
  'rites': 'catholic-rites',
  'eastern-churches': 'catholic-rites',
  'byzantine': 'catholic-rites',
  'maronite': 'catholic-rites',
  'cst-virtues': 'cst-virtues',
  'cst': 'cst-virtues',
  'virtues': 'cst-virtues',
  'social-teaching': 'cst-virtues',
  'latin-mass-prayers': 'latin-mass-prayers',
  'latin-prayers': 'latin-mass-prayers',
  'latin': 'latin-mass-prayers',
  'gregorian-chant': 'latin-mass-prayers',
  'pater-noster': 'latin-mass-prayers',
  'nicene-creed': 'nicene-creed',
  'creed': 'nicene-creed',
  'credo': 'nicene-creed',
  'apostles-creed': 'nicene-creed',
  'ten-commandments': 'ten-commandments',
  'commandments': 'ten-commandments',
  'decalogue': 'ten-commandments',
  'sinai': 'ten-commandments',
  'order-of-the-mass': 'order-of-the-mass',
  'mass': 'order-of-the-mass',
  'holy-mass': 'order-of-the-mass',
  'eucharistic-liturgy': 'order-of-the-mass',
  'sacred-objects': 'sacred-objects',
  'sacred-vessels': 'sacred-objects',
  'vestments': 'sacred-objects',
  'first-communion': 'first-communion',
  'holy-communion': 'first-communion',
  'eucharistic-adoration': 'first-communion',
  'eucharistic-procession-film': 'eucharistic-procession-film',
  'procession-film': 'eucharistic-procession-film',
  'liturgical-film': 'eucharistic-procession-film',
  'procession': 'eucharistic-procession-film',
  'welcome': 'welcome',
  'intro': 'welcome',
  'start': 'welcome',
  'onboarding': 'welcome',
  'showcase': 'welcome',
  'data-states': 'oak-data-states-of-matter',
  'oak-data-states-of-matter': 'oak-data-states-of-matter',
  'states-of-matter-data': 'oak-data-states-of-matter',
  'data-fractions': 'oak-data-fractions-decimals',
  'oak-data-fractions-decimals': 'oak-data-fractions-decimals',
  'data-seasonal': 'oak-data-seasonal-changes',
  'oak-data-seasonal-changes': 'oak-data-seasonal-changes',
  'data-sacraments': 'oak-data-re-sacraments',
  'oak-data-re-sacraments': 'oak-data-re-sacraments',
  'data-algorithms': 'oak-data-algorithms-sequencing',
  'oak-data-algorithms-sequencing': 'oak-data-algorithms-sequencing',
  'data-phonics': 'oak-data-phonics-screening',
  'oak-data-phonics-screening': 'oak-data-phonics-screening',
  'data-circuits': 'oak-data-electric-circuits',
  'oak-data-electric-circuits': 'oak-data-electric-circuits',
  'data-angles': 'oak-data-angles-triangles',
  'oak-data-angles-triangles': 'oak-data-angles-triangles',
  'data-cells': 'oak-data-cell-biology',
  'oak-data-cell-biology': 'oak-data-cell-biology',
  'data-creed': 'oak-data-re-nicene-creed',
  'oak-data-re-nicene-creed': 'oak-data-re-nicene-creed',
  'data-spanish': 'oak-data-spanish-foundations',
  'oak-data-spanish-foundations': 'oak-data-spanish-foundations',
};

// Built-in Core Curriculum Cartridge Catalog
export const BUILTIN_CARTRIDGES: CartridgeDefinition[] = [
  {
    id: 'welcome',
    type: 'Sim',
    title: 'Welcome to AST Vector Player & Educational Simulator',
    stage: 'PORTAL APPARATUS & SIMULATOR',
    category: 'Portal Showcase',
    desc: 'Interactive demonstration of the AST Vector Engine: 60 FPS sub-pixel kinematics, harmonic oscillations, smartboard stylus ink, and zero-cloud Gemini Nano tutoring.',
    icon: '✨',
    source: 'builtin',
    svgFile: 'cartridges/welcome.svg',
    astFile: 'cartridges/welcome.ast',
    version: '2.6.0',
    invariants: ['Zero Bloat Runtime', 'Harmonic Resonance', 'Sub-15ms Cold Start', 'Direct Pointer Capture'],
  },
  {
    id: 'pythagoras',
    type: 'Sim',
    title: "Pythagoras' Theorem (a² + b² = c²)",
    stage: 'KS3 GEOMETRY',
    category: 'Mathematics',
    desc: 'Interactive right-triangle manipulative demonstrating area conservation: square a² (emerald) plus square b² (sapphire) equals square c² (amber).',
    icon: '📐',
    source: 'builtin',
    svgFile: 'cartridges/pythagoras.svg',
    astFile: 'cartridges/pythagoras.ast',
    version: '2.6.0',
    invariants: ['Pythagorean Theorem', 'Area Conservation', 'Euclidean Metric'],
  },
  {
    id: 'kinetic-gas',
    type: 'Sim',
    title: "Kinetic Gas Theory & Boyle's Law (PV = nRT)",
    stage: 'KS3/KS4 PHYSICS & CHEMISTRY',
    category: 'Science',
    desc: 'Real-time particle kinematics in a compression cylinder with temperature heater, pressure gauge, and Maxwell-Boltzmann velocity distribution.',
    icon: '🌡️',
    source: 'builtin',
    svgFile: 'cartridges/kinetic-gas.svg',
    astFile: 'cartridges/kinetic-gas.ast',
    version: '2.6.0',
    invariants: ["Boyle's Law", 'Ideal Gas Law', 'Kinetic Theory of Gases'],
  },
  {
    id: 'electric-circuits',
    type: 'Sim',
    title: "Electrical Circuits & Ohm's Law (V = I × R)",
    stage: 'KS2/KS3 PHYSICS',
    category: 'Science',
    desc: 'Live closed-loop circuit with electron charge kinematics, battery electromotive force, resistance dissipation, and lightbulb filament luminance.',
    icon: '💡',
    source: 'builtin',
    svgFile: 'cartridges/electric-circuits.svg',
    astFile: 'cartridges/electric-circuits.ast',
    version: '2.6.0',
    invariants: ["Ohm's Law", 'Kirchhoff Voltage Loop', 'Electron Drift Velocity'],
  },
  {
    id: 'calculus-curves',
    type: 'Sim',
    title: 'Calculus: Tangent Slopes (dy/dx) & Definite Integrals (∫)',
    stage: 'GCSE & A-LEVEL MATHS',
    category: 'Mathematics',
    desc: 'Interactive tangent probe gliding over quadratic & cubic curves with real-time derivative secant limit and Riemann sum area accumulation.',
    icon: '📈',
    source: 'builtin',
    svgFile: 'cartridges/calculus-curves.svg',
    astFile: 'cartridges/calculus-curves.ast',
    version: '2.6.0',
    invariants: ['First Derivative Tangent Limit', 'Riemann Integral Sum', 'Continuity'],
  },
  {
    id: 'algebra-balance',
    type: 'Sim',
    title: 'Algebraic Balance Scale: Preserving Equality (2x + 5 = 15)',
    stage: 'KS2/KS3 MATHS',
    category: 'Mathematics',
    desc: 'Physical 2-pan balance scale demystifying linear equations. Whatever operation you apply to one side, you must apply to the other to preserve equilibrium.',
    icon: '⚖️',
    source: 'builtin',
    svgFile: 'cartridges/algebra-balance.svg',
    astFile: 'cartridges/algebra-balance.ast',
    version: '2.6.0',
    invariants: ['Conservation of Mass', 'Additive Invariance', 'Multiplicative Invariance'],
  },
  {
    id: 'bodmas',
    type: 'Slide',
    title: 'BODMAS / BIDMAS: Forcefield & Magnetic Clamping',
    stage: 'KS2/KS3 MATHS',
    category: 'Mathematics',
    desc: 'Interactive operator physics: titanium bracket shields, magnetic multiplication clamps, and concrete Area Model showing why 5 + 3 × 4 ≠ 32.',
    icon: '🧮',
    source: 'builtin',
    svgFile: 'cartridges/bodmas.svg',
    astFile: 'cartridges/bodmas.ast',
    version: '2.6.0',
    invariants: ['Order of Operations', 'Distributive Property'],
  },
  {
    id: 'times-tables',
    type: 'Sim',
    title: 'Times Tables (1× to 12× Standard School Chart & Grid)',
    stage: 'KS1/KS2 MATHS',
    category: 'Mathematics',
    desc: 'Standard school 1 to 12 multiplication facts, 12×12 multiplication square, fact families, and commutative proofs.',
    icon: '📐',
    source: 'builtin',
    svgFile: 'cartridges/times-tables.svg',
    astFile: 'cartridges/times-tables.ast',
    version: '2.6.0',
    invariants: ['Commutative Property', 'Distributive Property'],
  },
  {
    id: 'fractions',
    type: 'Slide',
    title: 'Fractions & Proportions',
    stage: 'KS2 MATHS',
    category: 'Mathematics',
    desc: 'Visual slice partitioning, equivalent denominators, and geometric whole unit assembly.',
    icon: '🥧',
    source: 'builtin',
    svgFile: 'cartridges/fractions.svg',
    astFile: 'cartridges/fractions.ast',
    version: '2.6.0',
    invariants: ['Common Denominator Equivalence', 'Whole Conservation'],
  },
  {
    id: 'fish-tank',
    type: 'App',
    title: 'Aquarium Living Ecosystem & Boids Flocking Benchmark',
    stage: 'BENCHMARK & STRESS LAB',
    category: 'Diagnostics & Games',
    desc: 'Autonomous multi-species boids flocking simulation with acoustic glass-tap scatter, stage tap feeding, and frame render budget monitoring.',
    icon: '🐠',
    source: 'builtin',
    svgFile: 'cartridges/fish-tank.svg',
    astFile: 'cartridges/fish-tank.ast',
    version: '2.6.0',
    invariants: ['Craig Reynolds Boid Flocking', 'Continuous Velocity Verlet'],
  },
  {
    id: 'solar-system',
    type: 'Sim',
    title: 'Solar System Planetary Orbits',
    stage: 'KS3 SCIENCE',
    category: 'Science',
    desc: '3D Heliocentric orbital velocities, Keplerian mechanics, and scale celestial dynamics.',
    icon: '🪐',
    source: 'builtin',
    svgFile: 'cartridges/solar-system.svg',
    astFile: 'cartridges/solar-system.ast',
    version: '2.6.0',
    invariants: ["Kepler's Laws of Planetary Motion", 'Gravitational Central Force'],
  },
  {
    id: 'photosynthesis',
    type: 'Slide',
    title: 'Photosynthesis & Leaf Anatomy',
    stage: 'KS3 BIOLOGY',
    category: 'Science',
    desc: 'Light-dependent chloroplast reactions, stomata gas exchange, and glucose synthesis rate limiter.',
    icon: '🍃',
    source: 'builtin',
    svgFile: 'cartridges/photosynthesis.svg',
    astFile: 'cartridges/photosynthesis.ast',
    version: '2.6.0',
    invariants: ['Conservation of Carbon & Oxygen Atoms', 'Blackman Limiting Factors'],
  },
  {
    id: 'atom',
    type: 'Sim',
    title: 'Atomic Structure: Bohr Electron Shells',
    stage: 'KS3 CHEMISTRY',
    category: 'Science',
    desc: 'Quantized electron orbits (2, 8, 8), proton/neutron nucleus binding, and valence energy states.',
    icon: '⚛️',
    source: 'builtin',
    svgFile: 'cartridges/atom.svg',
    astFile: 'cartridges/atom.ast',
    version: '2.6.0',
    invariants: ['Bohr Angular Momentum Quantization', 'Nuclear Charge Balance'],
  },
  {
    id: 'velocity',
    type: 'Sim',
    title: 'Velocity Vectors & Kinematics',
    stage: 'KS3 PHYSICS',
    category: 'Science',
    desc: 'Continuous motion physics, displacement vectors, velocity-time graph area accumulation, and acceleration mechanics.',
    icon: '🏎️',
    source: 'builtin',
    svgFile: 'cartridges/velocity.svg',
    astFile: 'cartridges/velocity.ast',
    version: '2.6.0',
    invariants: ['Newtonian Kinematics', 'Displacement Calculus'],
  },
  {
    id: 'mountain-elevation',
    type: 'Sim',
    title: 'Mountain Altitude: Climber Game & Trigonometry',
    stage: 'KS2/KS3 MATHS & GEOGRAPHY',
    category: 'Games & Simulations',
    desc: 'Interactive hill climber game contrasting vertical altitude against slope distance, right-angle hypotenuse, and atmospheric lapse rate.',
    icon: '🧗',
    source: 'builtin',
    svgFile: 'cartridges/mountain-elevation.svg',
    astFile: 'cartridges/mountain-elevation.ast',
    version: '2.6.0',
    invariants: ['Trigonometric Ratios (sin, cos, tan)', 'Atmospheric Lapse Rate'],
  },
  {
    id: 'math-fishing',
    type: 'App',
    title: 'Math Pond: Number Bonds Fishing Game',
    stage: 'KS1/KS2 MATHS',
    category: 'Games & Simulations',
    desc: 'Interactive vector pond fishing adventure: hook swimming fish to solve number bonds to 10 & 20, doubles, and mental arithmetic.',
    icon: '🎣',
    source: 'builtin',
    svgFile: 'cartridges/math-fishing.svg',
    astFile: 'cartridges/math-fishing.ast',
    version: '2.6.0',
    invariants: ['Additive Part-Whole Number Bonds', 'Combinatorics'],
  },
  {
    id: 'dna-helix',
    type: 'Sim',
    title: 'DNA Double Helix & Base Pairs',
    stage: 'KS3 GENETICS',
    category: 'Science',
    desc: 'Antiparallel sugar-phosphate backbone and hydrogen-bonded A-T / C-G base pairing.',
    icon: '🧬',
    source: 'builtin',
    svgFile: 'cartridges/dna-helix.svg',
    astFile: 'cartridges/dna-helix.ast',
    version: '2.6.0',
    invariants: ['Watson-Crick Complementary Base Pairing', 'Double Helix Pitch'],
  },
  {
    id: 'phonics-lab',
    type: 'App',
    title: 'Early Phonics: Sound Buttons & Blending Mat',
    stage: 'EYFS/KS1 PHONICS',
    category: 'Early Literacy & Phonics',
    desc: 'Synthetic phonics soundboard, interactive sound button blending mat, tricky words, and Alien Words Screening Check.',
    icon: '🔤',
    source: 'builtin',
    svgFile: 'cartridges/phonics-lab.svg',
    astFile: 'cartridges/phonics-lab.ast',
    version: '2.6.0',
    invariants: ['Phoneme-Grapheme Correspondence', 'Synthetic Blending'],
  },
  {
    id: 'spelling-bee',
    type: 'App',
    title: 'Spelling Bee Championship: KS1 to KS3 Orthography',
    stage: 'KS1/KS2/KS3 ENGLISH',
    category: 'English & Literacy',
    desc: 'UK National Curriculum statutory spelling lists, Web Speech API auditory synthesis, interactive touch letter tiles, phonics breakdown, and streak multipliers.',
    icon: '🐝',
    source: 'builtin',
    svgFile: 'cartridges/spelling-bee.svg',
    astFile: 'cartridges/spelling-bee.ast',
    version: '2.6.0',
    invariants: ['National Curriculum Statutory Spellings', 'Auditory Memory & Phonics'],
  },
  {
    id: 'church-tour',
    type: 'Slide',
    title: 'Catholic Church Sanctuary Tour',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'Latin cross basilica architecture, Nave, High Altar, golden Tabernacle, and Marian Chapel.',
    icon: '⛪',
    source: 'builtin',
    svgFile: 'cartridges/church-tour.svg',
    astFile: 'cartridges/church-tour.ast',
    version: '2.6.0',
    invariants: ['Sacred Architecture', 'Latin Cross Basilica Proportions'],
  },
  {
    id: 'stations-of-the-cross',
    type: 'Slide',
    title: 'The Stations of the Cross (Via Crucis)',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'The 14 sacred stations of the Via Dolorosa, Golgotha Calvary hill, Roman praetorium, Holy Sepulchre tomb, and glorious Easter Resurrection.',
    icon: '✝️',
    source: 'builtin',
    duration: 28.0,
    oakId: 'OAK-KS2-RE-020',
    oakUnit: 'ks2-re-catholic-via-crucis-stations',
    mount: '/curriculum/catholic-life/stations-of-the-cross',
    section: 'Catholic Life & Faith Formation',
    svgFile: 'cartridges/stations-of-the-cross.svg',
    astFile: 'cartridges/stations-of-the-cross.ast',
    version: '2.6.0',
    invariants: ['14 Traditional Stations of the Cross', 'Via Dolorosa Sacred Pilgrimage', 'Scriptural Passion', 'Paschal Resurrection'],
  },
  {
    id: 'altar-anatomy',
    type: 'Slide',
    title: 'The Catholic Altar: Sacred Anatomy & Types',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'The Mensa, Altar Stone with martyr relics, seasonal Antependium, Crucifix, and beeswax altar candles.',
    icon: '✝️',
    source: 'builtin',
    svgFile: 'cartridges/altar-anatomy.svg',
    astFile: 'cartridges/altar-anatomy.ast',
    version: '2.6.0',
    invariants: ['Consecrated Mensa', 'Sepulchrum Martyr Relics', 'Altar Linens & Liturgical Colors'],
  },
  {
    id: 'holy-oils',
    type: 'Slide',
    title: 'The Three Holy Oils & Sacred Ambry (Olea Sancta)',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'Oleum Infirmorum (O.I.), Oleum Catechumenorum (O.C.), Sanctum Chrisma (S.C.), and the sanctuary ambry niche.',
    icon: '🏺',
    source: 'builtin',
    svgFile: 'cartridges/holy-oils.svg',
    astFile: 'cartridges/holy-oils.ast',
    version: '2.6.0',
    invariants: ['Olea Sancta', 'Chrism Mass Balsam & Olive Oil', 'Indelible Sacramental Character'],
  },
  {
    id: 'triduum-easter',
    type: 'Sim',
    title: 'The Sacred Paschal Triduum & Easter Glory',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'From the Upper Room Mandatum and Calvary Cross to the New Fire, Lumen Christi 3 elevations, Exsultet, and 50-day Paschal Resurrection.',
    icon: '🔥',
    source: 'builtin',
    svgFile: 'cartridges/triduum-easter.svg',
    astFile: 'cartridges/triduum-easter.ast',
    version: '2.6.0',
    invariants: ['Sacrum Triduum Paschale', 'Lumen Christi 3 Elevations', 'Exsultet & Paschal Candle', 'Resurrectio Domini'],
  },
  {
    id: 'holy-water-thurifer',
    type: 'Sim',
    title: 'Holy Water, Asperges & The Thurible (Thuribulum)',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'Aqua Benedicta sacramental stoup, Sunday Asperges Me sprinkling, 3-chain thurible swing dynamics, incense boat, and 7 Mass incensations.',
    icon: '💨',
    source: 'builtin',
    svgFile: 'cartridges/holy-water-thurifer.svg',
    astFile: 'cartridges/holy-water-thurifer.ast',
    version: '2.6.0',
    invariants: ['Aqua Benedicta Sacramental', 'Asperges Me & Vidi Aquam', 'Thurible Dynamics & Rising Incense'],
  },
  {
    id: 'liturgy-of-the-hours',
    type: 'Sim',
    title: 'The Liturgy of the Hours (Divine Office)',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'The seven canonical hours sanctifying the cycle of day and night: Matins, Lauds (Benedictus), Daytime Hours, Vespers (Magnificat), and Compline (Nunc Dimittis).',
    icon: '🕰️',
    source: 'builtin',
    svgFile: 'cartridges/liturgy-of-the-hours.svg',
    astFile: 'cartridges/liturgy-of-the-hours.ast',
    version: '2.6.0',
    invariants: ['Liturgia Horarum', 'Seven Canonical Hours', 'Canticles of Zechariah, Mary & Simeon'],
  },
  {
    id: 'seven-sacraments',
    type: 'Sim',
    title: 'The Seven Holy Sacraments (Septem Sacramenta)',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'Visible signs of invisible grace: Sacraments of Initiation (Baptism, Confirmation, Eucharist), Healing (Penance, Anointing), and Service of Communion (Orders, Matrimony).',
    icon: '✨',
    source: 'builtin',
    svgFile: 'cartridges/seven-sacraments.svg',
    astFile: 'cartridges/seven-sacraments.ast',
    version: '2.6.0',
    invariants: ['Septem Sacramenta', 'Threefold Indelible Character', 'Ex Opere Operato'],
  },
  {
    id: 'liturgical-calendar',
    type: 'Sim',
    title: 'The Catholic Liturgical Year (Annus Liturgicus)',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'The 360-degree seasonal year wheel: Advent (Violet), Christmas (Gold), Ordinary Time (Green), Lent (Purple), Easter (Gold), Pentecost (Red), and Christ the King.',
    icon: '📅',
    source: 'builtin',
    svgFile: 'cartridges/liturgical-calendar.svg',
    astFile: 'cartridges/liturgical-calendar.ast',
    version: '2.6.0',
    invariants: ['Liturgical Cycle & Colors', 'Sunday Lectionary Cycles A/B/C', '50-Day Easter Season'],
  },
  {
    id: 'liturgical-postures',
    type: 'Sim',
    title: 'Sacred Postures & Gestures (Gestus Sacri)',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'Praying with mind, soul, and body: Standing (dignity & readiness), Kneeling (adoration), Genuflecting to the Tabernacle, Bowing, and the Sign of the Cross.',
    icon: '🙇',
    source: 'builtin',
    svgFile: 'cartridges/liturgical-postures.svg',
    astFile: 'cartridges/liturgical-postures.ast',
    version: '2.6.0',
    invariants: ['Sacred Postures', 'Right-Knee Genuflection', 'Profound Bow at Creed', 'Trinitarian Sign of Cross'],
  },
  {
    id: 'catholic-rites',
    type: 'Sim',
    title: 'The 24 Catholic Rites & Churches (Omnes Gentes)',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'The universal communion of 24 autonomous (sui iuris) Catholic Churches across East and West: Latin, Byzantine, Alexandrian, Antiochian, Chaldean, and Armenian traditions.',
    icon: '🌍',
    source: 'builtin',
    svgFile: 'cartridges/catholic-rites.svg',
    astFile: 'cartridges/catholic-rites.ast',
    version: '2.6.0',
    invariants: ['24 Sui Iuris Catholic Churches', 'Communion with Peter', 'Eastern & Western Liturgical Rites'],
  },
  {
    id: 'cst-virtues',
    type: 'Sim',
    title: 'Catholic Social Teaching (CST) & School Virtues',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'The 7 pillars of Catholic Social Teaching: Human Dignity (Imago Dei), Common Good, Solidarity, Subsidiarity, Option for the Poor, Dignity of Work, and Care for Creation (Laudato Si).',
    icon: '🤝',
    source: 'builtin',
    svgFile: 'cartridges/cst-virtues.svg',
    astFile: 'cartridges/cst-virtues.ast',
    version: '2.6.0',
    invariants: ['7 Pillars of CST', 'Imago Dei Human Dignity', 'Laudato Si Care for Creation'],
  },
  {
    id: 'latin-mass-prayers',
    type: 'Sim',
    title: 'Latin Prayers & Gregorian Chant (Vox Ecclesiae)',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'The ancient mother tongue and sacred music of the Western Church: Pater Noster, Ave Maria, Sanctus, Agnus Dei, and 4-line Gregorian square neume notation.',
    icon: '📜',
    source: 'builtin',
    svgFile: 'cartridges/latin-mass-prayers.svg',
    astFile: 'cartridges/latin-mass-prayers.ast',
    version: '2.6.0',
    invariants: ['Pater Noster & Ave Maria', '4-Line Gregorian Neume Notation', 'Latin Universal Liturgical Heritage'],
  },
  {
    id: 'nicene-creed',
    type: 'Sim',
    title: "The Nicene & Apostles' Creed (Credo in Deum)",
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'The foundational profession of apostolic faith: The Father & Creation, The Son & Redemption, The Holy Spirit & The Church, and the Four Marks of the Church.',
    icon: '✝️',
    source: 'builtin',
    svgFile: 'cartridges/nicene-creed.svg',
    astFile: 'cartridges/nicene-creed.ast',
    version: '2.6.0',
    invariants: ['Trinitarian Creed Structure', 'Four Marks of Church', 'Incarnation & Resurrection'],
  },
  {
    id: 'ten-commandments',
    type: 'Sim',
    title: 'The Ten Commandments (The Decalogue & Mt Sinai)',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'The moral law of God given on Mount Sinai: Tablet I (Love of God, Commandments 1-3) and Tablet II (Love of Neighbour, Commandments 4-10) fulfilled in Christ.',
    icon: '📜',
    source: 'builtin',
    svgFile: 'cartridges/ten-commandments.svg',
    astFile: 'cartridges/ten-commandments.ast',
    version: '2.6.0',
    invariants: ['Two Tablets of Sinai', 'Decalogue Categorization', 'Two Great Commandments of Love'],
  },
  {
    id: 'order-of-the-mass',
    type: 'Sim',
    title: 'The Order of the Holy Mass (Ordo Missae)',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'The sacred liturgy through 4 movements: Introductory Rites, Liturgy of the Word, Liturgy of the Eucharist (Transubstantiation & Elevation), and Concluding Rites.',
    icon: '🍷',
    source: 'builtin',
    svgFile: 'cartridges/order-of-the-mass.svg',
    astFile: 'cartridges/order-of-the-mass.ast',
    version: '2.6.0',
    invariants: ['4 Movements of the Mass', 'Consecration & Elevation', 'Real Presence in Tabernacle'],
  },
  {
    id: 'sacred-objects',
    type: 'Sim',
    title: 'Sacred Vessels, Linens & Vestments',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'Interactive examination of sacred vessels (Chalice, Paten, Ciborium), linens (Corporal, Purificator, Pall), and priestly vestments.',
    icon: '🏺',
    source: 'builtin',
    svgFile: 'cartridges/sacred-objects.svg',
    astFile: 'cartridges/sacred-objects.ast',
    version: '2.6.0',
    invariants: ['Vessels of Gold Reverence', 'Corporal Particle Protection', 'Alb Baptismal Innocence'],
  },
  {
    id: 'first-communion',
    type: 'Sim',
    title: 'First Holy Communion & Eucharistic Adoration',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'Preparation steps for receiving Jesus: First Confession, Eucharistic Fast, Reverent Reception with Amen, and Thanksgiving before the Monstrance.',
    icon: '🍞',
    source: 'builtin',
    svgFile: 'cartridges/first-communion.svg',
    astFile: 'cartridges/first-communion.ast',
    version: '2.6.0',
    invariants: ['Amen Real Presence Oath', '1-Hour Eucharistic Fast', 'Reverent Reception Posture'],
  },
  {
    id: 'eucharistic-procession-film',
    type: 'Film',
    video: '/media/eucharistic-procession.mp4',
    videoFit: 'contain',
    title: 'Solemn Eucharistic Procession (Educational Film & Vector HUD)',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'Synchronized liturgical film driving: Blessed Sacrament canopy, thurible incensation streams, Tantum Ergo hymns, and humeral veil blessing with interactive vector checkpoints.',
    icon: '🎬',
    source: 'builtin',
    svgFile: 'cartridges/eucharistic-procession-film.svg',
    astFile: 'cartridges/eucharistic-procession-film.ast',
    version: '2.6.0',
    invariants: ['Film Synchronized Timeline', 'Sub-Frame Scrubbing', 'Over-Film Stylus Whiteboard', 'Checkpoints Pause Film'],
  },
  {
    id: 'water-cycle',
    type: 'Slide',
    title: 'Water Cycle: Continuous Earth Cycle',
    stage: 'KS2 GEOGRAPHY',
    category: 'Geography & Science',
    desc: 'Solar evaporation, condensation cloud formation, precipitation, and groundwater runoff loop.',
    icon: '💧',
    source: 'builtin',
    svgFile: 'cartridges/water-cycle.svg',
    astFile: 'cartridges/water-cycle.ast',
    version: '2.6.0',
    invariants: ['Hydrological Mass Conservation', 'Phase Change Thermodynamics'],
  },
  {
    id: 'languages',
    type: 'App',
    title: 'MFL & Polyglot Studio: Spanish, French & Latin',
    stage: 'KS2/KS3 MFL',
    category: 'Modern & Classical Languages',
    desc: 'Spanish, French & Latin phonics soundboard, regular verb conjugation wheels, and vocabulary recall sprints.',
    icon: '🌍',
    source: 'builtin',
    svgFile: 'cartridges/languages.svg',
    astFile: 'cartridges/languages.ast',
    version: '2.6.0',
    invariants: ['Grammar Agreement', 'Phoneme Articulation', 'Vocabulary Association'],
  },
  {
    id: 'shakespeare',
    type: 'Slide',
    title: 'The Globe Theatre: Shakespeare & Iambic Pentameter',
    stage: 'KS3/KS4 ENGLISH LITERATURE',
    category: 'English Literature',
    desc: 'Wooden O 3D stage geometry, rhythm meter visualizer for unstressed/stressed beats, and Elizabethan theatrical staging.',
    icon: '🎭',
    source: 'builtin',
    svgFile: 'cartridges/shakespeare.svg',
    astFile: 'cartridges/shakespeare.ast',
    version: '2.6.0',
    invariants: ['Iambic Pentameter Metre', 'Elizabethan Theatrical Proportions'],
  },
  {
    id: 'bsl-fingerspelling',
    type: 'Sim',
    title: 'BSL: 3D British Sign Language Two-Handed Fingerspelling',
    stage: 'ACCESSIBILITY & LANGUAGES',
    category: 'Modern & Classical Languages',
    desc: '3D rotatable two-handed BSL manual alphabet rig, A-E-I-O-U vowel fingertip tap positions, Signer POV vs Receiver POV camera orbit, and speed slider.',
    icon: '🖐️',
    source: 'builtin',
    svgFile: 'cartridges/bsl-fingerspelling.svg',
    astFile: 'cartridges/bsl-fingerspelling.ast',
    version: '2.6.0',
    invariants: ['BSL Manual Alphabet', 'Two-Handed Signing Anatomy', '3D Spatial Orientation'],
  },
  {
    id: 'phonics-screening',
    type: 'Sim',
    title: 'Year 1 Phonics Screening Check & Alien Words',
    stage: 'EYFS/KS1 PHONICS',
    category: 'Early Literacy & Phonics',
    desc: 'Official statutory 40-word screening check simulator with monster alien cards, tactile sound button dots & dashes, animated sweep bar, and pass diagnostics.',
    icon: '👾',
    source: 'builtin',
    svgFile: 'cartridges/phonics-screening.svg',
    astFile: 'cartridges/phonics-screening.ast',
    version: '2.6.0',
    invariants: ['DfE Statutory Screening Check', 'Pseudo-Word Phonetic Decoding', 'Sound Buttons'],
  },
  {
    id: 'shakespeare-macbeth',
    type: 'Slide',
    title: 'Macbeth: 5-Act Dramatic Soliloquy & Moral Fall',
    stage: 'KS3/KS4 ENGLISH LITERATURE',
    category: 'English Literature',
    desc: '5-Act play-through on the 1599 Globe stage: blasted heath prophecy, floating bloody dagger, Banquo ghost feast, and Dunsinane catastrophe.',
    icon: '👑',
    source: 'builtin',
    svgFile: 'cartridges/shakespeare-macbeth.svg',
    astFile: 'cartridges/shakespeare-macbeth.ast',
    version: '2.6.0',
    invariants: ['Shakespearean Tragedy', 'Iambic Pentameter Blank Verse', 'Canon vs What-If Drama'],
  },
  {
    id: 'rosary-mysteries',
    type: 'Sim',
    title: 'The Holy Rosary: 3D Beads & 20 Scriptural Mysteries',
    stage: 'CATHOLIC LIFE',
    category: 'Catholic Faith',
    desc: 'Contemplative 3D chaplet ring with Our Father and Hail Mary beads, depth-fog lighting, 4 mystery cycles (Joyful, Luminous, Sorrowful, Glorious), and Latin prayers.',
    icon: '📿',
    source: 'builtin',
    svgFile: 'cartridges/rosary-mysteries.svg',
    astFile: 'cartridges/rosary-mysteries.ast',
    version: '2.6.0',
    invariants: ['Scriptural Contemplation', 'Marian Devotion', 'Ecclesiastical Latin Prayers'],
  },
  {
    id: 'bbc-model-b',
    type: 'Sim',
    title: 'BBC Micro Model B: 6502 Computing & BBC BASIC',
    stage: 'KS2 & KS3 COMPUTING',
    category: 'Computing',
    desc: 'The iconic 1981 Acorn BBC Microcomputer Model B with 2 MHz MOS 6502 CPU, 32KB RAM, Teletext SAA5050 MODE 7 graphics, and BBC BASIC.',
    icon: '💻',
    source: 'builtin',
    duration: 16.0,
    oakId: 'OAK-KS2-COM-012',
    oakUnit: 'ks2-computing-history-algorithms-bbc-micro',
    mount: '/curriculum/computing/history/bbc-model-b',
    section: 'Computing & Algorithmic Thinking',
    svgFile: 'cartridges/bbc-model-b.svg',
    astFile: 'cartridges/bbc-model-b.ast',
    version: '2.6.0',
    invariants: ['MOS 6502 Instruction Timing', 'BBC BASIC Line Number Ordering', 'Teletext SAA5050 40x25 Character Grid'],
  },
  // Modular Oak Curriculum Question Banks & Data Cartridges
  ...BUILTIN_DATA_CARTRIDGES.map((d): CartridgeDefinition => ({
    id: d.id,
    type: 'Data',
    title: d.title,
    stage: d.stage,
    subject: d.subject,
    oakId: d.oakId,
    oakUnit: d.oakUnit,
    category: d.category,
    desc: d.desc,
    icon: d.icon,
    source: 'builtin',
    svgMarkup: d.svgMarkup,
    astSource: d.astSource,
    dataPayload: d.dataPayload,
    isCore: true,
    tier: 'core',
    version: '2.6.0',
    invariants: ['Modular Decentralized Data Cartridge', 'Zero LLM Heap Overhead', 'Sub-1ms Retrieval'],
  })),
];

// Fallback embedded SVG & AST for core cartridges when running completely air-gapped
export { EMBEDDED_CORE_CARTRIDGES } from "../data/player/embeddedCoreCartridges";
import { EMBEDDED_CORE_CARTRIDGES } from "../data/player/embeddedCoreCartridges";

// In-memory cache for 60 FPS zero-disk live access
let inMemoryCartridgesCache: CartridgeDefinition[] | null = null;
let isVaultInitialized = false;
let vaultInitPromise: Promise<void> | null = null;

/**
 * Initializes the decentralized IndexedDB cartridge vault:
 * 1. Loads all expanded cartridges from IndexedDB into RAM.
 * 2. Migrates legacy localStorage cartridges to IndexedDB.
 * 3. Pre-expands core embedded cartridges so zero network requests are needed offline.
 */
export async function initCartridgeVault(): Promise<void> {
  if (isVaultInitialized) return;
  if (vaultInitPromise) return vaultInitPromise;

  vaultInitPromise = (async () => {
    try {
      // 1. Read existing cartridges from IndexedDB vault
      const vaultItems = await getAllVaultCartridges();

      // 2. Read legacy localStorage items
      let localItems: CartridgeDefinition[] = [];
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_CARTRIDGES);
          if (raw) localItems = JSON.parse(raw);
        } catch {}
      }

      // 3. Merge and migrate into IndexedDB
      const mergedMap = new Map<string, CartridgeDefinition>();
      vaultItems.forEach((v) => mergedMap.set(v.id, v as CartridgeDefinition));

      for (const item of localItems) {
        if (!mergedMap.has(item.id)) {
          mergedMap.set(item.id, item);
          await putVaultCartridge(item as VaultCartridgeRecord);
        }
      }

      // 4. Pre-expand embedded core simulations (e.g. Pythagoras, Church Tour, Catholic Rites) into vault
      for (const [id, core] of Object.entries(EMBEDDED_CORE_CARTRIDGES)) {
        const existing = mergedMap.get(id);
        if (!existing || !existing.svgMarkup || !existing.astSource) {
          const isCatholic = id.includes('church') || id.includes('rites');
          const title = id === 'church-tour'
            ? 'Tour of a Catholic Church: Sacred Architecture & Sacred Spaces'
            : id === 'catholic-rites'
            ? 'The 24 Catholic Rites & Churches: Unity in Diversity Across East & West'
            : id.charAt(0).toUpperCase() + id.slice(1);
          const coreDef: CartridgeDefinition = {
            ...(existing || {}),
            id,
            title: existing?.title || title,
            stage: existing?.stage || (isCatholic ? 'CATHOLIC LIFE' : 'CURRICULUM'),
            category: existing?.category || (isCatholic ? 'Catholic Faith' : 'STEM'),
            desc: existing?.desc || 'Pre-expanded offline core vector simulation.',
            icon: existing?.icon || (id.includes('church') ? '⛪' : id.includes('rites') ? '🌍' : '📐'),
            source: 'builtin',
            svgMarkup: core.svg,
            astSource: core.ast,
            updatedAt: Date.now(),
          };
          mergedMap.set(id, coreDef);
          await putVaultCartridge(coreDef as VaultCartridgeRecord);
        }
      }

      inMemoryCartridgesCache = Array.from(mergedMap.values());

      // 5. Synchronize into runtime ASTSceneRegistry if present in global scope
      if (typeof window !== 'undefined') {
        const g = window as any;
        if (g.ASTSceneRegistry && typeof g.ASTSceneRegistry.register === 'function') {
          for (const cart of inMemoryCartridgesCache) {
            if (cart.svgMarkup && cart.astSource) {
              g.ASTSceneRegistry.register(cart.id, {
                id: cart.id,
                title: cart.title,
                stage: cart.stage,
                svgMarkup: cart.svgMarkup,
                astSource: cart.astSource,
              });
            }
          }
        }
      }

      isVaultInitialized = true;
    } catch (err) {
      console.warn('[cartridgeStore] Failed to initialize cartridge vault:', err);
    }
  })();

  return vaultInitPromise;
}

// Auto-bootstrap vault in browser environments
if (typeof window !== 'undefined') {
  initCartridgeVault().catch(() => {});
}

/**
 * Returns all custom & PhET imported cartridges.
 * Uses in-memory Tier 0 cache first, falling back to localStorage if IndexedDB is still booting.
 */
export function getCustomCartridges(): CartridgeDefinition[] {
  if (typeof window === 'undefined') return [];
  if (inMemoryCartridgesCache !== null) {
    return inMemoryCartridgesCache;
  }

  // Trigger background vault expansion if not yet initialized
  if (!isVaultInitialized) {
    initCartridgeVault().catch(() => {});
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_CARTRIDGES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const result = Array.isArray(parsed) ? parsed : [];
    inMemoryCartridgesCache = result;
    return result;
  } catch (err) {
    console.warn('[cartridgeStore] Failed to read custom cartridges:', err);
    return [];
  }
}

/**
 * Normalizes any cartridge ID or alias to canonical ID
 */
export function normalizeCartridgeId(id: string): string {
  if (!id || typeof id !== 'string') return '';
  const clean = id.toLowerCase().trim()
    .replace(/^(demo-|scene-|preset-)/, '')
    .replace(/\.(ast|svg|json|html|phet)$/, '');

  if (CARTRIDGE_ALIASES[clean]) return CARTRIDGE_ALIASES[clean];

  // Resolve by Oak National Curriculum numbers (:oak-id or :oak-unit)
  const byOak = PRESET_OPTIONS.find(
    (p) =>
      (p.oakId && p.oakId.toLowerCase() === clean) ||
      (p.oakUnit && p.oakUnit.toLowerCase() === clean)
  );
  if (byOak) return byOak.id;

  return clean;
}

/**
 * Retrieves all cartridges (Built-in + Custom + PhET Imported)
 */
export function getAllCartridges(): CartridgeDefinition[] {
  const custom = getCustomCartridges();
  const customMap = new Map<string, CartridgeDefinition>();
  custom.forEach((c) => customMap.set(c.id, c));

  // Merge built-in cartridges, letting custom cartridges override if user updated them
  const merged: CartridgeDefinition[] = [];
  const seen = new Set<string>();

  custom.forEach((c) => {
    const isCore = c.isCore ?? (c.source === 'builtin');
    const tier = c.tier || (c.source === 'builtin' ? 'core' : (c.source as any));
    merged.push({
      ...c,
      isCore,
      tier,
      mount: c.mount || getDefaultMountForCartridge(c.id),
      section: c.section || getDefaultSectionForCartridge(c.id, c.category),
    });
    seen.add(c.id);
  });

  const presetMap = new Map<string, ScenePresetOption>(PRESET_OPTIONS.map((p) => [p.id, p]));

  BUILTIN_CARTRIDGES.forEach((b) => {
    if (!seen.has(b.id)) {
      const meta = presetMap.get(b.id);
      merged.push({
        ...b,
        oakId: b.oakId || meta?.oakId,
        oakUnit: b.oakUnit || meta?.oakUnit,
        subject: b.subject || meta?.subject,
        isCore: true,
        tier: 'core',
        mount: b.mount || meta?.mount || getDefaultMountForCartridge(b.id),
        section: b.section || meta?.section || getDefaultSectionForCartridge(b.id, b.category),
      });
      seen.add(b.id);
    }
  });

  // Ensure all generated curriculum cartridges are present with full Oak metadata
  PRESET_OPTIONS.forEach((opt) => {
    if (!seen.has(opt.id)) {
      merged.push({
        id: opt.id,
        title: opt.label,
        stage: opt.stage,
        oakId: opt.oakId,
        oakUnit: opt.oakUnit,
        subject: opt.subject,
        type: opt.type,
        category: opt.subject || 'General Curriculum',
        desc: `Oak National Curriculum aligned cartridge: ${opt.oakId || opt.stage}.`,
        icon: opt.type === 'Sim' ? '🎮' : opt.type === 'Slide' ? '📑' : '💻',
        source: 'builtin',
        svgFile: `cartridges/${opt.id}.svg`,
        astFile: `cartridges/${opt.id}.ast`,
        isCore: opt.isCore ?? true,
        tier: (opt.tier as any) || 'core',
        mount: opt.mount || getDefaultMountForCartridge(opt.id),
        section: opt.section || getDefaultSectionForCartridge(opt.id),
      });
      seen.add(opt.id);
    }
  });

  return merged;
}

/**
 * Canonical default mount address for a cartridge
 */
export function getDefaultMountForCartridge(id: string): string {
  const map: Record<string, string> = {
    'pythagoras': '/curriculum/maths/geometry/pythagoras',
    'kinetic-gas': '/curriculum/science/physics/kinetic-gas',
    'electric-circuits': '/curriculum/science/physics/electric-circuits',
    'church-tour': '/curriculum/catholic-life/church-tour',
    'altar-anatomy': '/curriculum/catholic-life/altar-anatomy',
    'stations-of-the-cross': '/curriculum/catholic-life/stations-of-the-cross',
    'holy-oils': '/curriculum/catholic-life/holy-oils',
    'rosary-mysteries': '/curriculum/catholic-life/rosary-mysteries',
    'phonics-lab': '/curriculum/english/phonics/phonics-lab',
    'phonics-screening': '/curriculum/english/phonics/screening-check',
    'spelling-bee': '/curriculum/english/spelling/spelling-bee',
    'shakespeare': '/curriculum/english/theatre/globe',
    'shakespeare-macbeth': '/curriculum/english/theatre/macbeth',
    'languages': '/curriculum/languages/mfl-polyglot',
    'bsl-fingerspelling': '/curriculum/languages/bsl-fingerspelling',
    'bodmas': '/curriculum/maths/algebra/bodmas',
    'times-tables': '/curriculum/maths/arithmetic/times-tables',
    'math-fishing': '/curriculum/maths/arithmetic/number-bonds',
    'fractions': '/curriculum/maths/arithmetic/fractions',
    'calculus-curves': '/curriculum/maths/calculus/tangent-slopes',
    'algebra-balance': '/curriculum/maths/algebra/balance-scale',
    'atom': '/curriculum/science/chemistry/atomic-structure',
    'photosynthesis': '/curriculum/science/biology/photosynthesis',
    'dna-helix': '/curriculum/science/biology/dna-helix',
    'solar-system': '/curriculum/science/physics/solar-system',
    'velocity': '/curriculum/science/physics/velocity-vectors',
    'water-cycle': '/curriculum/geography/water-cycle',
    'mountain-elevation': '/curriculum/geography/mountain-elevation',
    'fish-tank': '/curriculum/computing/stress-benchmark',
    'bbc-model-b': '/curriculum/computing/history/bbc-model-b',
  };
  return map[id] || `/curriculum/${id}`;
}

export function getDefaultSectionForCartridge(id: string, category?: string): string {
  if (id.includes('bbc') || id.includes('fish-tank') || category === 'Computing') {
    return 'Computing & Algorithmic Thinking';
  }
  if (id.includes('church') || id.includes('altar') || id.includes('holy') || id.includes('rosary') || category === 'Catholic Faith') {
    return 'Catholic Life & Faith Formation';
  }
  if (id.includes('math') || id.includes('pythagoras') || id.includes('algebra') || id.includes('calculus') || id.includes('fractions') || id.includes('bodmas') || id.includes('times') || category === 'Mathematics') {
    return 'Mathematics & Geometry';
  }
  if (id.includes('gas') || id.includes('circuit') || id.includes('atom') || id.includes('photo') || id.includes('dna') || id.includes('solar') || id.includes('velocity') || category === 'Science') {
    return 'Natural Sciences & Physics';
  }
  if (id.includes('phonics') || id.includes('spelling') || id.includes('shakespeare') || category === 'English Literature') {
    return 'English Literature & Phonics';
  }
  if (id.includes('language') || id.includes('bsl') || category === 'Modern & Classical Languages') {
    return 'Languages & Inclusion';
  }
  return 'Curriculum Cartridges';
}

/**
 * Resolves a cartridge by its self-declared :mount address or route
 */
export function getCartridgeByMount(mountPath: string): CartridgeDefinition | null {
  if (!mountPath) return null;
  const cleanPath = mountPath.toLowerCase().trim().replace(/\/+$/, '');
  const all = getAllCartridges();
  
  // Exact mount match
  const exact = all.find((c) => c.mount && c.mount.toLowerCase().replace(/\/+$/, '') === cleanPath);
  if (exact) return exact;

  // Path suffix match (e.g. /curriculum/geometry/pythagoras -> pythagoras)
  const segments = cleanPath.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  if (lastSegment) {
    const byId = getCartridge(lastSegment);
    if (byId) return byId;
  }
  
  return null;
}

/**
 * Generates self-assembling navigation sections directly from the cartridges
 */
export function getCartridgeNavigationSections(): { section: string; icon: string; cartridges: CartridgeDefinition[] }[] {
  const all = getAllCartridges();
  const map = new Map<string, { section: string; icon: string; cartridges: CartridgeDefinition[] }>();

  all.forEach((c) => {
    const secName = c.section || getDefaultSectionForCartridge(c.id, c.category);
    if (!map.has(secName)) {
      let icon = '📚';
      if (secName.includes('Catholic')) icon = '⛪';
      else if (secName.includes('Mathematics')) icon = '📐';
      else if (secName.includes('Sciences')) icon = '🔬';
      else if (secName.includes('English')) icon = '🎭';
      else if (secName.includes('Languages')) icon = '🌍';
      map.set(secName, { section: secName, icon, cartridges: [] });
    }
    map.get(secName)!.cartridges.push(c);
  });

  return Array.from(map.values());
}

/**
 * Finds a cartridge by ID or alias
 */
export function getCartridge(idOrAlias: string): CartridgeDefinition | null {
  if (!idOrAlias) return null;
  const canonicalId = normalizeCartridgeId(idOrAlias);
  const all = getAllCartridges();
  const found = all.find(
    (c) =>
      c.id === canonicalId ||
      c.id === idOrAlias ||
      (c.oakId && c.oakId.toLowerCase() === idOrAlias.toLowerCase()) ||
      (c.oakUnit && c.oakUnit.toLowerCase() === idOrAlias.toLowerCase())
  );
  if (found) {
    if (!found.svgMarkup && EMBEDDED_CORE_CARTRIDGES[canonicalId]) {
      found.svgMarkup = EMBEDDED_CORE_CARTRIDGES[canonicalId].svg;
      found.astSource = EMBEDDED_CORE_CARTRIDGES[canonicalId].ast;
    }
    return found;
  }

  // Fallback check against embedded core
  if (EMBEDDED_CORE_CARTRIDGES[canonicalId]) {
    return {
      id: canonicalId,
      title: canonicalId.charAt(0).toUpperCase() + canonicalId.slice(1),
      stage: 'CURRICULUM',
      category: 'STEM',
      desc: 'Built-in curriculum vector simulation.',
      icon: '📐',
      source: 'builtin',
      svgMarkup: EMBEDDED_CORE_CARTRIDGES[canonicalId].svg,
      astSource: EMBEDDED_CORE_CARTRIDGES[canonicalId].ast,
    };
  }

  // Generic fallback for any valid scene/cartridge ID
  if (canonicalId && /^[a-z0-9_-]+$/i.test(canonicalId)) {
    const formattedTitle = canonicalId
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      id: canonicalId,
      title: formattedTitle,
      stage: 'CURRICULUM',
      category: 'STEM',
      desc: `Interactive curriculum vector laboratory cartridge for ${formattedTitle}.`,
      icon: '⚡',
      source: 'builtin',
      svgFile: `cartridges/${canonicalId}.svg`,
      astFile: `cartridges/${canonicalId}.ast`,
      version: '2.6.0',
    };
  }

  return null;
}

/**
 * Retrieves all registered Data Cartridges (Question Banks & Diagnostic Decks)
 */
export function getDataCartridges(): CartridgeDefinition[] {
  return getAllCartridges().filter((c) => c.type === 'Data');
}

/**
 * Finds a Data Cartridge by ID, alias, or matching stage/subject/unit coordinates
 */
export function getDataCartridge(idOrAlias: string): CartridgeDefinition | undefined {
  if (!idOrAlias) return undefined;
  const cart = getCartridge(idOrAlias);
  if (cart && cart.type === 'Data') return cart;

  // Fallback: match by unit or title
  const clean = idOrAlias.toLowerCase().trim();
  const allData = getDataCartridges();
  return allData.find(
    (c) =>
      c.id.toLowerCase() === clean ||
      (c.oakUnit && c.oakUnit.toLowerCase() === clean) ||
      (c.dataPayload?.unit && c.dataPayload.unit.toLowerCase() === clean) ||
      c.title.toLowerCase().includes(clean)
  );
}

/**
 * Resolves a Data Cartridge for given curriculum coordinates (stage, subject, unit)
 */
export function findDataCartridgeForTopic(stage?: string, subject?: string, unit?: string): CartridgeDefinition | undefined {
  if (!unit && !subject) return undefined;
  const cleanUnit = (unit || '').toLowerCase().trim();
  const cleanSub = (subject || '').toLowerCase().trim();
  const allData = getDataCartridges();

  // 1. Direct unit or title match
  const directMatch = allData.find((c) => {
    const payloadUnit = (c.dataPayload?.unit || c.oakUnit || '').toLowerCase();
    const title = c.title.toLowerCase();
    const unitMatches = payloadUnit === cleanUnit || payloadUnit.includes(cleanUnit) || cleanUnit.includes(payloadUnit) || title.includes(cleanUnit);
    if (!unitMatches) return false;
    if (stage && c.stage && c.stage.toLowerCase() !== stage.toLowerCase()) {
      const ksMatch = c.stage.match(/ks\s*([1-4])/i);
      const targetKsMatch = stage.match(/ks\s*([1-4])/i);
      if (ksMatch && targetKsMatch && ksMatch[1] !== targetKsMatch[1]) {
        return false;
      }
    }
    return true;
  });
  if (directMatch) return directMatch;

  // 2. Significant keyword tokens match (e.g. "matter", "fractions", "circuits", "angles", "sacraments", "creed", "phonics", "spanish")
  const stopWords = new Set(['and', '&', 'the', 'of', 'in', 'for', 'with', 'a', 'an']);
  const unitTokens = cleanUnit.split(/[^a-z0-9]+/).filter((t) => t.length >= 3 && !stopWords.has(t));

  if (unitTokens.length > 0) {
    const tokenMatch = allData.find((c) => {
      const corpus = `${c.title} ${c.oakUnit || ''} ${c.dataPayload?.unit || ''} ${c.id}`.toLowerCase();
      const matchCount = unitTokens.filter((tok) => corpus.includes(tok)).length;
      return matchCount >= Math.min(1, unitTokens.length);
    });
    if (tokenMatch) return tokenMatch;
  }

  // 3. Fallback: subject match if unit was ambiguous or general
  if (cleanSub) {
    return allData.find((c) => {
      const cSub = (c.subject || c.dataPayload?.subject || '').toLowerCase();
      return cSub === cleanSub || cSub.includes(cleanSub) || cleanSub.includes(cSub);
    });
  }

  return undefined;
}

/**
 * Exports a Data Cartridge's canonical AST S-Expression string
 */
export function exportDataCartridgeAsAst(cartridgeId: string): string | null {
  const cart = getDataCartridge(cartridgeId);
  if (!cart) return null;
  if (cart.astSource) return cart.astSource;
  if (cart.dataPayload) {
    return serializeDataCartridgeToAst(cart.dataPayload, cart.id, cart.title);
  }
  return null;
}

/**
 * Saves or updates a cartridge to decentralized storage (IndexedDB Vault + RAM)
 */
export function saveCustomCartridge(cartridge: CartridgeDefinition): void {
  if (typeof window === 'undefined') return;
  const existing = getCustomCartridges().filter((c) => c.id !== cartridge.id);
  const updatedItem: CartridgeDefinition = { ...cartridge, updatedAt: Date.now() };
  const updated = [updatedItem, ...existing];

  // 1. Update Tier 0 in-memory cache instantly
  inMemoryCartridgesCache = updated;

  // 2. Asynchronously persist to IndexedDB Vault (non-blocking)
  putVaultCartridge(updatedItem as VaultCartridgeRecord).catch((err) => {
    console.warn('[cartridgeStore] IndexedDB vault save error:', err);
  });

  // 3. Fallback write to localStorage
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_CARTRIDGES, JSON.stringify(updated));
  } catch {
    // If quota exceeded in localStorage, IndexedDB still holds the record!
  }

  // 4. Synchronize into runtime ASTSceneRegistry if available
  const g = window as any;
  if (g.ASTSceneRegistry && typeof g.ASTSceneRegistry.register === 'function') {
    g.ASTSceneRegistry.register(cartridge.id, {
      id: cartridge.id,
      title: cartridge.title,
      stage: cartridge.stage,
      svgMarkup: cartridge.svgMarkup,
      astSource: cartridge.astSource,
    });
  }

  window.dispatchEvent(new Event('cartridges_updated'));
  window.dispatchEvent(new Event('storage'));
}

/**
 * Deletes a custom cartridge from decentralized storage (IndexedDB Vault + RAM)
 */
export function deleteCustomCartridge(cartridgeId: string): void {
  if (typeof window === 'undefined') return;
  const canonicalId = normalizeCartridgeId(cartridgeId);
  const filtered = getCustomCartridges().filter((c) => c.id !== canonicalId && c.id !== cartridgeId);

  // 1. Update in-memory cache
  inMemoryCartridgesCache = filtered;

  // 2. Asynchronously delete from IndexedDB vault
  deleteVaultCartridge(canonicalId).catch((err) => {
    console.warn('[cartridgeStore] IndexedDB vault delete error:', err);
  });

  // 3. Update localStorage fallback
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_CARTRIDGES, JSON.stringify(filtered));
  } catch (err) {
    console.error('[cartridgeStore] Failed to delete cartridge from localStorage:', err);
  }

  window.dispatchEvent(new Event('cartridges_updated'));
  window.dispatchEvent(new Event('storage'));
}

/**
 * Expands a compressed cartridge (Uint8Array gzip or Base64 string) directly into the IndexedDB Vault
 */
export async function expandCompressedCartridgeToVault(
  compressedData: Uint8Array | string
): Promise<CartridgeDefinition> {
  const cartridge = await decompressCartridge(compressedData);
  saveCustomCartridge(cartridge);
  return cartridge;
}

/**
 * Expands a compressed cartridge bundle directly into the IndexedDB Vault
 */
export async function expandCompressedBundleToVault(
  compressedPayload: string | Uint8Array
): Promise<CartridgeDefinition[]> {
  const cartridges = await decompressCartridgeBundle(compressedPayload);
  for (const c of cartridges) {
    saveCustomCartridge(c);
  }
  return cartridges;
}

/**
 * Compresses an existing cartridge into a compact gzip binary or Base64 capsule for optical QR or P2P mesh
 */
export async function exportCompressedCartridge(cartridgeId: string): Promise<{
  cartridge: CartridgeDefinition;
  compressedBytes: Uint8Array;
  base64: string;
  metadata: CompressedCartridgeMetadata;
}> {
  const cartridge = getCartridge(cartridgeId);
  if (!cartridge) {
    throw new Error(`Cartridge [${cartridgeId}] not found in store`);
  }
  const result = await compressCartridge(cartridge);
  return {
    cartridge,
    ...result,
  };
}

/**
 * Returns current metrics on the offline IndexedDB Cartridge Vault
 */
export async function getVaultStats(): Promise<{
  isInitialized: boolean;
  vaultCount: number;
  memoryCount: number;
}> {
  const vaultCount = await countVaultCartridges();
  const memoryCount = inMemoryCartridgesCache ? inMemoryCartridgesCache.length : 0;
  return {
    isInitialized: isVaultInitialized,
    vaultCount,
    memoryCount,
  };
}

/**
 * Ingests ANY external file (PhET HTML5, PhET JSON, Flash SWF, .ast, .ast.svg, cartridge .json)
 * and turns it into a reusable decentralized Cartridge!
 */
export async function importCartridgeFile(file: File): Promise<CartridgeDefinition> {
  const fileName = file.name.toLowerCase();

  // 1. Flash SWF (.swf) Transpiler
  if (fileName.endsWith('.swf')) {
    const buf = await file.arrayBuffer();
    const cleanId = file.name.replace(/\.swf$/i, '').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
    const swfRes = await transpileSwfToAst(buf, cleanId);
    if (!swfRes.success) {
      throw new Error(swfRes.error || 'Failed to transpile legacy Flash SWF file.');
    }
    const cart: CartridgeDefinition = {
      id: cleanId,
      title: `Flash: ${cleanId.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`,
      stage: 'FLASH TRANSLATED',
      category: 'Imported Flash',
      desc: `Transpiled from legacy Adobe Flash SWF with 60 FPS deterministic vector recreation.`,
      icon: '⚡',
      source: 'imported',
      svgMarkup: swfRes.svgMarkup,
      astSource: swfRes.astSource,
      author: 'Flash Archive',
      version: `Flash v${swfRes.metadata?.version || 9}`,
      invariants: ['Legacy Vector Timeline', 'ActionScript Translation'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveCustomCartridge(cart);
    return cart;
  }

  // 2. PhET Interactive Simulation (.html, .json, .phet)
  const text = await file.text();
  if (isPhetBundle(text) || fileName.endsWith('.phet') || fileName.includes('phet')) {
    const phetRes = await transpilePhetFile(text, file.name);
    if (!phetRes.success) {
      throw new Error(phetRes.error || 'Failed to transpile PhET simulation.');
    }
    const cleanId = (phetRes.metadata?.simName || file.name)
      .replace(/\.(html|json|phet)$/i, '')
      .replace(/[^a-z0-9_-]/gi, '-')
      .toLowerCase();

    const cart: CartridgeDefinition = {
      id: cleanId,
      title: phetRes.metadata?.title || `PhET: ${cleanId}`,
      stage: 'PhET INTERACTIVE APPARATUS',
      category: 'Science',
      desc: `Distilled from ${((phetRes.metadata?.originalSizeBytes || 1000000) / 1024 / 1024).toFixed(1)} MB PhET bundle down to clean AST vector physics with zero cloud leakage.`,
      icon: '🧪',
      source: 'phet',
      svgMarkup: phetRes.svgMarkup,
      astSource: phetRes.astSource,
      author: 'University of Colorado Boulder (PhET)',
      version: phetRes.metadata?.version || '1.0.0',
      invariants: phetRes.metadata?.detectedInvariants || ['Physical Conservation Law'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveCustomCartridge(cart);
    return cart;
  }

  // 3. Cartridge JSON export package
  if (fileName.endsWith('.json')) {
    try {
      const data = JSON.parse(text);
      if (data && data.id && (data.svgMarkup || data.astSource || data.dataPayload || Array.isArray(data.questions))) {
        const isData = data.type === 'Data' || Boolean(data.dataPayload) || Array.isArray(data.questions);
        const dataPayload = data.dataPayload || (Array.isArray(data.questions) ? extractDataPayloadFromAst(text) : undefined);
        const resolvedType: 'Sim' | 'Slide' | 'App' | 'Film' | 'Data' = isData ? 'Data' : (data.type || 'Sim');
        const count = dataPayload?.questions?.length || 0;
        const defaultSvg = isData
          ? `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="data-imported-json" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#090d16"/></radialGradient></defs><rect width="800" height="480" fill="url(#data-imported-json)" rx="16"/><rect x="40" y="40" width="720" height="400" rx="12" fill="#0f172a" fill-opacity="0.85" stroke="#0284c7" stroke-width="2" stroke-dasharray="6,4"/><circle cx="400" cy="140" r="50" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="3"/><text x="400" y="156" font-size="42" text-anchor="middle">📊</text><text x="400" y="235" fill="#f8fafc" font-size="22" font-weight="900" text-anchor="middle">${data.title || data.id}</text><text x="400" y="270" fill="#38bdf8" font-size="13" font-weight="800" text-anchor="middle" letter-spacing="2">${(data.stage || 'CURRICULUM').toUpperCase()} • ${(data.subject || 'DATA DECK').toUpperCase()}</text><rect x="260" y="300" width="280" height="38" rx="19" fill="#0284c7"/><text x="400" y="324" fill="#ffffff" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="1">📊 ${count} DIAGNOSTIC QUESTIONS</text><text x="400" y="375" fill="#94a3b8" font-size="12" font-weight="600" text-anchor="middle">⚡ Zero-Latency Modular Data Deck • Mounts Instantly in Practice Lab</text></svg>`
          : '';

        const cart: CartridgeDefinition = {
          id: data.id,
          title: data.title || data.id,
          stage: data.stage || (isData ? 'CURRICULUM DECK' : 'CUSTOM CARTRIDGE'),
          subject: data.subject || dataPayload?.subject,
          category: data.category || (isData ? (dataPayload?.subject || 'Curriculum Data') : 'General'),
          type: resolvedType,
          dataPayload: dataPayload || undefined,
          desc: data.desc || (isData ? `Decentralized question bank with ${count} questions.` : 'Imported decentralized cartridge package.'),
          icon: data.icon || (isData ? '📊' : '📦'),
          source: data.source || 'user',
          svgMarkup: data.svgMarkup || defaultSvg,
          astSource: data.astSource || (isData && dataPayload ? serializeDataCartridgeToAst(dataPayload, data.id, data.title || data.id) : ''),
          author: data.author || 'Educator',
          version: data.version || '1.0.0',
          invariants: data.invariants || (isData ? ['Modular Decentralized Data Cartridge', 'Zero LLM Heap Overhead'] : []),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        saveCustomCartridge(cart);
        return cart;
      }
    } catch (_) {}
  }

  // 4. Living AST.SVG Capsule or SVG file
  if (fileName.endsWith('.svg') || fileName.endsWith('.ast.svg')) {
    const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    const astMatch = text.match(/<metadata[^>]*data-ast=["']([\s\S]*?)["']/i) || text.match(/\(:scene[\s\S]*?\)/) || text.match(/\(:cartridge[\s\S]*?\)/);
    const cleanId = file.name.replace(/\.(ast\.)?svg$/i, '').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();

    const decodedAst = astMatch ? (astMatch[1] ? decodeURIComponent(astMatch[1]) : astMatch[0]) : '';
    const isData = decodedAst.includes(':type :data') || decodedAst.includes(':type "Data"') || decodedAst.includes(':questions');
    const dataPayload = isData ? extractDataPayloadFromAst(decodedAst) : undefined;

    const cart: CartridgeDefinition = {
      id: cleanId,
      title: titleMatch ? titleMatch[1] : cleanId,
      stage: 'VECTOR CAPSULE',
      type: isData ? 'Data' : 'Sim',
      dataPayload: dataPayload || undefined,
      category: isData ? (dataPayload?.subject || 'Curriculum Data') : 'Mathematics',
      desc: isData ? `Imported living data capsule (${dataPayload?.questions.length || 0} questions).` : 'Imported living vector cartridge capsule.',
      icon: isData ? '📊' : '🎨',
      source: 'imported',
      svgMarkup: text,
      astSource: decodedAst || `(:scene :id "${cleanId}" :title "${cleanId}")`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveCustomCartridge(cart);
    return cart;
  }

  // 5. Raw AST S-Expression file (.ast)
  if (fileName.endsWith('.ast') || text.trim().startsWith('(:scene') || text.trim().startsWith('(:cartridge') || text.trim().startsWith('(')) {
    const cleanId = file.name.replace(/\.ast$/i, '').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
    const titleMatch = text.match(/:title\s+"([^"]+)"/i);
    const stageMatch = text.match(/:stage\s+"([^"]+)"/i);
    const subjectMatch = text.match(/:subject\s+"([^"]+)"/i);
    const typeMatch = text.match(/:type\s+("Sim"|"Slide"|"App"|"Film"|"Data"|:data|:sim|:slide|:app|:film)/i);
    const videoMatch = text.match(/:video\s+"([^"]+)"/i) || text.match(/:film\s+"([^"]+)"/i);
    const videoFitMatch = text.match(/:video-?fit\s+"([^"]+)"/i);
    
    const isData = (typeMatch && /data/i.test(typeMatch[1])) || text.includes(':questions') || text.includes(':type :data');
    const resolvedType: 'Sim' | 'Slide' | 'App' | 'Film' | 'Data' = isData
      ? 'Data'
      : (typeMatch?.[1] as any) || (videoMatch ? 'Film' : 'Sim');

    const dataPayload = isData ? extractDataPayloadFromAst(text) : undefined;
    const qCount = dataPayload?.questions?.length || 0;

    const cart: CartridgeDefinition = {
      id: cleanId,
      title: titleMatch ? titleMatch[1] : cleanId,
      stage: stageMatch ? stageMatch[1] : (dataPayload?.stage || 'CURRICULUM'),
      subject: subjectMatch ? subjectMatch[1] : dataPayload?.subject,
      type: resolvedType,
      dataPayload: dataPayload || undefined,
      video: videoMatch ? videoMatch[1] : undefined,
      videoFit: (videoFitMatch ? videoFitMatch[1] : 'contain') as any,
      category: resolvedType === 'Film' ? 'Educational Film' : isData ? (dataPayload?.subject || 'Curriculum Data') : 'Mathematics',
      desc: resolvedType === 'Film'
        ? 'Synchronized educational film with interactive vector stage overlays.'
        : isData
        ? `Decentralized question bank cartridge with ${qCount} curriculum questions.`
        : 'Imported declarative AST vector logic cartridge.',
      icon: resolvedType === 'Film' ? '🎬' : isData ? '📊' : '📜',
      source: 'imported',
      svgMarkup: isData
        ? `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="data-imported-ast" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#090d16"/></radialGradient></defs><rect width="800" height="480" fill="url(#data-imported-ast)" rx="16"/><rect x="40" y="40" width="720" height="400" rx="12" fill="#0f172a" fill-opacity="0.85" stroke="#0284c7" stroke-width="2" stroke-dasharray="6,4"/><circle cx="400" cy="140" r="50" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="3"/><text x="400" y="156" font-size="42" text-anchor="middle">📊</text><text x="400" y="235" fill="#f8fafc" font-size="22" font-weight="900" text-anchor="middle">${titleMatch ? titleMatch[1] : cleanId}</text><text x="400" y="270" fill="#38bdf8" font-size="13" font-weight="800" text-anchor="middle" letter-spacing="2">${(stageMatch ? stageMatch[1] : (dataPayload?.stage || 'CURRICULUM')).toUpperCase()} • ${(subjectMatch ? subjectMatch[1] : (dataPayload?.subject || 'DATA DECK')).toUpperCase()}</text><rect x="260" y="300" width="280" height="38" rx="19" fill="#0284c7"/><text x="400" y="324" fill="#ffffff" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="1">📊 ${qCount} DIAGNOSTIC QUESTIONS</text><text x="400" y="375" fill="#94a3b8" font-size="12" font-weight="600" text-anchor="middle">⚡ Zero-Latency Modular Data Deck • Mounts Instantly in Practice Lab</text></svg>`
        : `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#090d16" fill-opacity="${resolvedType === 'Film' ? '0' : '1'}"/><text x="400" y="240" fill="#38bdf8" font-size="20" font-weight="800" text-anchor="middle">${cleanId}</text></svg>`,
      astSource: text,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveCustomCartridge(cart);
    return cart;
  }

  throw new Error(`Unsupported cartridge file format: ${file.name}. Expected .html (PhET), .swf, .json, .ast, or .svg.`);
}

/**
 * Creates a brand new cartridge from teacher/student form inputs
 */
export function createCustomCartridge(input: {
  title: string;
  category: string;
  stage: string;
  desc?: string;
  icon?: string;
  type?: 'Sim' | 'Slide' | 'App' | 'Film' | 'Data';
  dataPayload?: DataCartridgePayload;
  svgMarkup?: string;
  astSource?: string;
}): CartridgeDefinition {
  const cleanId = input.title
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-|-$/g, '') || `cartridge-${Date.now().toString(36)}`;

  const isData = input.type === 'Data' || Boolean(input.dataPayload);
  const resolvedType = isData ? 'Data' : (input.type || 'Sim');

  const defaultSvg = isData
    ? `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="data-custom" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#090d16"/></radialGradient></defs><rect width="800" height="480" fill="url(#data-custom)" rx="16"/><text x="400" y="220" fill="#38bdf8" font-size="24" font-weight="900" text-anchor="middle">${input.title}</text><text x="400" y="260" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">📊 ${input.dataPayload?.questions.length || 0} QUESTIONS</text></svg>`
    : `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="custom-glow" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090d16" />
    </radialGradient>
  </defs>
  <rect width="800" height="480" fill="url(#custom-glow)" />
  <g id="apparatus-root">
    <text x="400" y="60" fill="#38bdf8" font-size="22" font-weight="900" text-anchor="middle">${input.title}</text>
    <circle id="probe" cx="400" cy="240" r="40" fill="#3b82f6" stroke="#60a5fa" stroke-width="4" />
    <text id="probe-label" x="400" y="246" fill="#ffffff" font-size="16" font-weight="800" text-anchor="middle">Interactive</text>
  </g>
</svg>`;

  const defaultAst = isData && input.dataPayload
    ? serializeDataCartridgeToAst(input.dataPayload, cleanId, input.title)
    : `(:scene :id "${cleanId}" :title "${input.title}" :stage "${input.stage}" :duration 12.0
  (:vars (
    (:var :name "magnitude" :val 5 :min 1 :max 10 :step 1 :label "Magnitude")
  ))
  (:inputs (
    (:slider :var "magnitude" :label "Magnitude" :min 1 :max 10 :step 1)
  ))
  (:subtitles (
    (:start 0.00 :end 6.00 :en "Welcome to this interactive decentralized cartridge." :es "Bienvenido a este cartucho interactivo descentralizado.")
    (:start 6.00 :end 12.00 :en "Observe real-time vector transformations and physical invariants." :es "Observa las transformaciones vectoriales y los invariantes físicos.")
  ))
  (:keyframes (
    (:t 0.00 :title "Apparatus Init" :rule "Deterministic zero-cloud vector loop initialized.")
    (:t 0.50 :title "Conservation State" :rule "Reactive bindings execute at 60 FPS.")
  ))
  (:bindings (
    (:target "#probe" :attr "r" :expr "30 + vars.magnitude * 3")
  ))
)`;

  const newCart: CartridgeDefinition = {
    id: cleanId,
    title: input.title,
    stage: input.stage || 'CUSTOM APPARATUS',
    category: input.category || (isData ? 'Curriculum Data' : 'General'),
    type: resolvedType,
    dataPayload: input.dataPayload,
    desc: input.desc || (isData ? 'Custom authored decentralized question bank cartridge.' : 'Custom authored decentralized vector cartridge.'),
    icon: input.icon || (isData ? '📊' : '📐'),
    source: 'user',
    svgMarkup: input.svgMarkup || defaultSvg,
    astSource: input.astSource || defaultAst,
    author: 'Classroom Educator',
    version: '1.0.0',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  saveCustomCartridge(newCart);
  return newCart;
}
