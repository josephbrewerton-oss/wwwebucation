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

export interface CartridgeDefinition {
  id: string;
  title: string;
  stage: string;
  category: string;
  type?: 'Sim' | 'Slide' | 'App';
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
};

// Built-in Core Curriculum Cartridge Catalog
export const BUILTIN_CARTRIDGES: CartridgeDefinition[] = [
  {
    id: 'pythagoras',
    type: 'Sim',
    title: "Pythagoras' Theorem (a² + b² = c²)",
    stage: 'KS3 GEOMETRY',
    category: 'Mathematics',
    desc: 'Interactive right-triangle manipulative demonstrating area conservation: square a² (emerald) plus square b² (sapphire) equals square c² (amber).',
    icon: '📐',
    source: 'builtin',
    svgFile: 'scenes/pythagoras.svg',
    astFile: 'scenes/pythagoras.ast',
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
    svgFile: 'scenes/kinetic-gas.svg',
    astFile: 'scenes/kinetic-gas.ast',
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
    svgFile: 'scenes/electric-circuits.svg',
    astFile: 'scenes/electric-circuits.ast',
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
    svgFile: 'scenes/calculus-curves.svg',
    astFile: 'scenes/calculus-curves.ast',
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
    svgFile: 'scenes/algebra-balance.svg',
    astFile: 'scenes/algebra-balance.ast',
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
    svgFile: 'scenes/bodmas.svg',
    astFile: 'scenes/bodmas.ast',
    version: '2.6.0',
    invariants: ['Order of Operations', 'Distributive Property'],
  },
  {
    id: 'times-tables',
    type: 'Sim',
    title: 'Times Tables Arrays & Distributive Splitter (12×12)',
    stage: 'KS1/KS2 MATHS',
    category: 'Mathematics',
    desc: 'Visual 2D arrays, 90° commutative rotation, and mental arithmetic decomposition: 7 × 8 = (7 × 5) + (7 × 3) = 56.',
    icon: '📐',
    source: 'builtin',
    svgFile: 'scenes/times-tables.svg',
    astFile: 'scenes/times-tables.ast',
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
    svgFile: 'scenes/fractions.svg',
    astFile: 'scenes/fractions.ast',
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
    svgFile: 'scenes/fish-tank.svg',
    astFile: 'scenes/fish-tank.ast',
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
    svgFile: 'scenes/solar-system.svg',
    astFile: 'scenes/solar-system.ast',
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
    svgFile: 'scenes/photosynthesis.svg',
    astFile: 'scenes/photosynthesis.ast',
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
    svgFile: 'scenes/atom.svg',
    astFile: 'scenes/atom.ast',
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
    svgFile: 'scenes/velocity.svg',
    astFile: 'scenes/velocity.ast',
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
    svgFile: 'scenes/mountain-elevation.svg',
    astFile: 'scenes/mountain-elevation.ast',
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
    svgFile: 'scenes/math-fishing.svg',
    astFile: 'scenes/math-fishing.ast',
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
    svgFile: 'scenes/dna-helix.svg',
    astFile: 'scenes/dna-helix.ast',
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
    svgFile: 'scenes/phonics-lab.svg',
    astFile: 'scenes/phonics-lab.ast',
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
    svgFile: 'scenes/spelling-bee.svg',
    astFile: 'scenes/spelling-bee.ast',
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
    svgFile: 'scenes/church-tour.svg',
    astFile: 'scenes/church-tour.ast',
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
    svgFile: 'scenes/stations-of-the-cross.svg',
    astFile: 'scenes/stations-of-the-cross.ast',
    version: '2.6.0',
    invariants: ['14 Traditional Stations of the Cross', 'Via Dolorosa Sacred Pilgrimage', 'Scriptural Passion'],
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
    svgFile: 'scenes/altar-anatomy.svg',
    astFile: 'scenes/altar-anatomy.ast',
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
    svgFile: 'scenes/holy-oils.svg',
    astFile: 'scenes/holy-oils.ast',
    version: '2.6.0',
    invariants: ['Olea Sancta', 'Chrism Mass Balsam & Olive Oil', 'Indelible Sacramental Character'],
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
    svgFile: 'scenes/water-cycle.svg',
    astFile: 'scenes/water-cycle.ast',
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
    svgFile: 'scenes/languages.svg',
    astFile: 'scenes/languages.ast',
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
    svgFile: 'scenes/shakespeare.svg',
    astFile: 'scenes/shakespeare.ast',
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
    svgFile: 'scenes/bsl-fingerspelling.svg',
    astFile: 'scenes/bsl-fingerspelling.ast',
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
    svgFile: 'scenes/phonics-screening.svg',
    astFile: 'scenes/phonics-screening.ast',
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
    svgFile: 'scenes/shakespeare-macbeth.svg',
    astFile: 'scenes/shakespeare-macbeth.ast',
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
    svgFile: 'scenes/rosary-mysteries.svg',
    astFile: 'scenes/rosary-mysteries.ast',
    version: '2.6.0',
    invariants: ['Scriptural Contemplation', 'Marian Devotion', 'Ecclesiastical Latin Prayers'],
  },
];

// Fallback embedded SVG & AST for core cartridges when running completely air-gapped
export const EMBEDDED_CORE_CARTRIDGES: Record<string, { svg: string; ast: string }> = {
  pythagoras: {
    svg: `<svg viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Blueprint Vignette -->
    <radialGradient id="pyth-bg-glow" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="60%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>

    <!-- Blueprint Grid Pattern (28px unit grid matching simulation scale) -->
    <pattern id="pyth-blueprint-grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#1e293b" stroke-width="0.75" stroke-opacity="0.6" />
      <circle cx="28" cy="28" r="1" fill="#334155" fill-opacity="0.8" />
    </pattern>

    <!-- Precision Drop Shadows and Neon Halos -->
    <filter id="pyth-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="pyth-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.65" />
    </filter>

    <!-- Color Gradients -->
    <!-- Leg a: Emerald -->
    <linearGradient id="pyth-grad-a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34d399" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#059669" stop-opacity="0.75" />
    </linearGradient>

    <!-- Leg b: Sapphire -->
    <linearGradient id="pyth-grad-b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.75" />
    </linearGradient>

    <!-- Hypotenuse c: Amber / Gold -->
    <linearGradient id="pyth-grad-c" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#d97706" stop-opacity="0.75" />
    </linearGradient>

    <!-- HUD Glass Gradient -->
    <linearGradient id="pyth-hud-glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#1e293b" stop-opacity="0.90" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95" />
    </linearGradient>
  </defs>

  <!-- Stage Background & Engineering Grid -->
  <rect width="800" height="480" fill="url(#pyth-bg-glow)" />
  <rect width="800" height="480" fill="url(#pyth-blueprint-grid)" />

  <!-- Technical Axis Origin Guides -->
  <g opacity="0.35">
    <line x1="40" y1="280" x2="760" y2="280" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3 3" />
    <line x1="360" y1="40" x2="360" y2="440" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3 3" />
  </g>

  <!-- Interactive Precision Formula Header HUD -->
  <g id="pyth-hud-banner" transform="translate(130, 16)" filter="url(#pyth-shadow)">
    <rect width="540" height="52" rx="14" fill="url(#pyth-hud-glass)" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.8" />
    <!-- Subtle Top Rim Highlight -->
    <path d="M 14 1 L 526 1" stroke="#ffffff" stroke-width="1" stroke-opacity="0.25" />
    
    <text x="270" y="33" fill="#f8fafc" font-size="16" font-weight="900" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">
      <tspan fill="#34d399">a² (9)</tspan> + <tspan fill="#60a5fa">b² (16)</tspan> = <tspan fill="#fbbf24">c² (25)</tspan> ➔ 3² + 4² = 5²
    </text>
  </g>

  <!-- Square a² (Emerald Leg A) -->
  <g id="pyth-group-a">
    <rect id="pyth-rect-a" x="276" y="196" width="84" height="84" rx="6" fill="url(#pyth-grad-a)" stroke="#10b981" stroke-width="2.5" filter="url(#pyth-shadow)" data-draggable="pyth-handle-a" style="cursor:ns-resize;" />
    <!-- Pre-rendered 3x3 Unit Tiles for immediate cold-start pedagogical proof -->
    <g id="pyth-grid-a" opacity="0.5" stroke="#ffffff" stroke-width="1" pointer-events="none">
      <line x1="304" y1="196" x2="304" y2="280" />
      <line x1="332" y1="196" x2="332" y2="280" />
      <line x1="276" y1="224" x2="360" y2="224" />
      <line x1="276" y1="252" x2="360" y2="252" />
    </g>
    <!-- Square Area Badge -->
    <rect id="pyth-badge-a" x="286" y="226" width="64" height="26" rx="6" fill="#064e3b" fill-opacity="0.9" stroke="#34d399" stroke-width="1.5" pointer-events="none" />
    <text id="pyth-txt-a" x="318" y="244" fill="#ffffff" font-size="14" font-weight="900" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" text-rendering="geometricPrecision" pointer-events="none">a² = 9</text>
  </g>

  <!-- Square b² (Sapphire Leg B) -->
  <g id="pyth-group-b">
    <rect id="pyth-rect-b" x="360" y="280" width="112" height="112" rx="6" fill="url(#pyth-grad-b)" stroke="#3b82f6" stroke-width="2.5" filter="url(#pyth-shadow)" data-draggable="pyth-handle-b" style="cursor:ew-resize;" />
    <!-- Pre-rendered 4x4 Unit Tiles for immediate cold-start pedagogical proof -->
    <g id="pyth-grid-b" opacity="0.5" stroke="#ffffff" stroke-width="1" pointer-events="none">
      <line x1="388" y1="280" x2="388" y2="392" />
      <line x1="416" y1="280" x2="416" y2="392" />
      <line x1="444" y1="280" x2="444" y2="392" />
      <line x1="360" y1="308" x2="472" y2="308" />
      <line x1="360" y1="336" x2="472" y2="336" />
      <line x1="360" y1="364" x2="472" y2="364" />
    </g>
    <!-- Square Area Badge -->
    <rect id="pyth-badge-b" x="382" y="323" width="68" height="26" rx="6" fill="#1e3a8a" fill-opacity="0.9" stroke="#60a5fa" stroke-width="1.5" pointer-events="none" />
    <text id="pyth-txt-b" x="416" y="341" fill="#ffffff" font-size="14" font-weight="900" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" text-rendering="geometricPrecision" pointer-events="none">b² = 16</text>
  </g>

  <!-- Square c² (Amber Hypotenuse C) -->
  <g id="pyth-group-c" transform="translate(360, 196) rotate(36.87)">
    <g id="pyth-rot-c">
      <rect id="pyth-rect-c" x="0" y="-140" width="140" height="140" rx="6" fill="url(#pyth-grad-c)" stroke="#f59e0b" stroke-width="2.5" filter="url(#pyth-shadow)" />
      <!-- Pre-rendered 5x5 Unit Tiles for immediate cold-start pedagogical proof -->
      <g id="pyth-grid-c" opacity="0.5" stroke="#ffffff" stroke-width="1" pointer-events="none">
        <line x1="28" y1="-140" x2="28" y2="0" />
        <line x1="56" y1="-140" x2="56" y2="0" />
        <line x1="84" y1="-140" x2="84" y2="0" />
        <line x1="112" y1="-140" x2="112" y2="0" />
        <line x1="0" y1="-112" x2="140" y2="-112" />
        <line x1="0" y1="-84" x2="140" y2="-84" />
        <line x1="0" y1="-56" x2="140" y2="-56" />
        <line x1="0" y1="-28" x2="140" y2="-28" />
      </g>
      <!-- Square Area Badge -->
      <rect id="pyth-badge-c" x="15" y="-83" width="110" height="28" rx="6" fill="#78350f" fill-opacity="0.9" stroke="#fbbf24" stroke-width="1.5" pointer-events="none" />
      <text id="pyth-txt-c" x="70" y="-64" fill="#ffffff" font-size="14" font-weight="900" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" text-rendering="geometricPrecision" pointer-events="none">c² = 25 (c = 5)</text>
    </g>
  </g>

  <!-- Central Euclidean Right Triangle -->
  <polygon id="pyth-triangle" points="360,280 472,280 360,196" fill="#0e7490" fill-opacity="0.25" stroke="#38bdf8" stroke-width="3.5" stroke-linejoin="round" filter="url(#pyth-glow)" />

  <!-- Precision Drafting Right-Angle Symbol -->
  <g id="pyth-right-angle-group">
    <rect id="pyth-right-angle" x="360" y="262" width="18" height="18" fill="none" stroke="#94a3b8" stroke-width="2" />
    <circle cx="369" cy="271" r="2" fill="#38bdf8" />
  </g>

  <!-- Side Dimension Badges -->
  <g id="pyth-labels-group" pointer-events="none" font-family="system-ui, -apple-system, sans-serif">
    <!-- Leg a Label -->
    <rect x="365" y="226" width="46" height="22" rx="4" fill="#0f172a" fill-opacity="0.8" stroke="#10b981" stroke-width="1" />
    <text id="pyth-label-a" x="388" y="242" fill="#34d399" font-size="12" font-weight="900" text-anchor="middle">a = 3</text>

    <!-- Leg b Label -->
    <rect x="400" y="252" width="46" height="22" rx="4" fill="#0f172a" fill-opacity="0.8" stroke="#3b82f6" stroke-width="1" />
    <text id="pyth-label-b" x="423" y="268" fill="#60a5fa" font-size="12" font-weight="900" text-anchor="middle">b = 4</text>

    <!-- Hypotenuse c Label -->
    <rect x="425" y="218" width="56" height="22" rx="4" fill="#0f172a" fill-opacity="0.8" stroke="#f59e0b" stroke-width="1" />
    <text id="pyth-label-c" x="453" y="234" fill="#fbbf24" font-size="12" font-weight="900" text-anchor="middle">c = 5.00</text>
  </g>

  <!-- Manipulator Handle A (Top Vertex / Leg a Controller) -->
  <g id="pyth-handle-a" transform="translate(360, 196)" data-draggable="pyth-handle-a" style="cursor:ns-resize;">
    <!-- Pulse Ring -->
    <circle cx="0" cy="0" r="22" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="1" stroke-dasharray="3 3" />
    <!-- Tactile Handle Bead -->
    <circle cx="0" cy="0" r="15" fill="#10b981" stroke="#ffffff" stroke-width="2.5" filter="url(#pyth-glow)" />
    <!-- Vertical Drag Icon & Label -->
    <text x="0" y="5" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle" pointer-events="none">↕</text>
  </g>

  <!-- Manipulator Handle B (Right Vertex / Leg b Controller) -->
  <g id="pyth-handle-b" transform="translate(472, 280)" data-draggable="pyth-handle-b" style="cursor:ew-resize;">
    <!-- Pulse Ring -->
    <circle cx="0" cy="0" r="22" fill="#3b82f6" fill-opacity="0.2" stroke="#3b82f6" stroke-width="1" stroke-dasharray="3 3" />
    <!-- Tactile Handle Bead -->
    <circle cx="0" cy="0" r="15" fill="#3b82f6" stroke="#ffffff" stroke-width="2.5" filter="url(#pyth-glow)" />
    <!-- Horizontal Drag Icon & Label -->
    <text x="0" y="5" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle" pointer-events="none">↔</text>
  </g>
</svg>`,
    ast: `(:scene :id "pythagoras" :type "Sim" :title "Pythagoras' Theorem (a² + b² = c²)" :stage "KS3 GEOMETRY" :duration 11.0
  (:vars (
    (:var :name "sideA" :val 3 :min 1 :max 8 :step 1 :unit "units" :label "Leg a")
    (:var :name "sideB" :val 4 :min 1 :max 8 :step 1 :unit "units" :label "Leg b")
  ))
  (:inputs (
    (:number :var "sideA" :label "Triangle Leg a" :min 1 :max 10 :step 1)
    (:number :var "sideB" :label "Triangle Leg b" :min 1 :max 10 :step 1)
  ))
  (:computed (
    (:name "hypotenuse" :expr "Math.sqrt(vars.sideA * vars.sideA + vars.sideB * vars.sideB).toFixed(2)")
    (:name "areaA" :expr "vars.sideA * vars.sideA")
    (:name "areaB" :expr "vars.sideB * vars.sideB")
    (:name "areaC" :expr "vars.sideA * vars.sideA + vars.sideB * vars.sideB")
  ))
  (:gestures (
    (:draggable :target "#pyth-handle-a" :axis "y" :min 100 :max 250)
    (:draggable :target "#pyth-handle-b" :axis "x" :min 380 :max 640)
    (:draggable :target "#pyth-rect-a" :axis "y" :min 100 :max 250)
    (:draggable :target "#pyth-rect-b" :axis "x" :min 380 :max 640)
  ))
  (:subtitles (
    (:start 0.00 :end 0.35 :en "Drag the handles, pans, or type your own figures for leg a and leg b." :es "Arrastra los controles o introduce tus propios números para los catetos a y b.")
    (:start 0.35 :end 0.70 :en "Observe area conservation: square a² (emerald) plus square b² (sapphire) always equals square c² (amber)." :es "Observa la conservación de área: el cuadrado a² más el cuadrado b² siempre es igual a c².")
    (:start 0.70 :end 1.00 :en "a² + b² = c². The total number of unit tiles is strictly conserved for all right triangles." :es "a² + b² = c². El número total de baldosas unitarias se conserva estrictamente.")
  ))
  (:keyframes (
    (:t 0.00 :title "Interactive Manipulative" :rule "Drag handles or enter custom figures to test Pythagorean triples")
    (:t 0.35 :title "Area Conservation" :rule "Square of side a has area a²; square of side b has area b²")
    (:t 0.70 :title "Vector Area Sum" :rule "Total square units: a² + b² = c²")
    (:t 1.00 :title "Hypotenuse Square c²" :rule "c = √(a² + b²) preserved across continuous geometry")
  ))
  (:interactive false)
  (:questions false)
  (:bindings (
    (:target "#pyth-txt-a" :attr "opacity" :expr "1")
    (:target "#pyth-txt-b" :attr "opacity" :expr "1")
    (:target "#pyth-txt-c" :attr "opacity" :expr "1")
  ))
)`
  }
};

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

      // 4. Pre-expand embedded core simulations (e.g. Pythagoras) into vault if not present
      for (const [id, core] of Object.entries(EMBEDDED_CORE_CARTRIDGES)) {
        if (!mergedMap.has(id)) {
          const coreDef: CartridgeDefinition = {
            id,
            title: id.charAt(0).toUpperCase() + id.slice(1),
            stage: 'CURRICULUM',
            category: 'STEM',
            desc: 'Pre-expanded offline core vector simulation.',
            icon: '📐',
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
  return CARTRIDGE_ALIASES[clean] || clean;
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

  BUILTIN_CARTRIDGES.forEach((b) => {
    if (!seen.has(b.id)) {
      merged.push({
        ...b,
        isCore: true,
        tier: 'core',
        mount: b.mount || getDefaultMountForCartridge(b.id),
        section: b.section || getDefaultSectionForCartridge(b.id, b.category),
      });
      seen.add(b.id);
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
  };
  return map[id] || `/curriculum/${id}`;
}

export function getDefaultSectionForCartridge(id: string, category?: string): string {
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
  const found = all.find((c) => c.id === canonicalId || c.id === idOrAlias);
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
      svgFile: `scenes/${canonicalId}.svg`,
      astFile: `scenes/${canonicalId}.ast`,
      version: '2.6.0',
    };
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
      if (data && data.id && (data.svgMarkup || data.astSource)) {
        const cart: CartridgeDefinition = {
          id: data.id,
          title: data.title || data.id,
          stage: data.stage || 'CUSTOM CARTRIDGE',
          category: data.category || 'General',
          desc: data.desc || 'Imported decentralized cartridge package.',
          icon: data.icon || '📦',
          source: data.source || 'user',
          svgMarkup: data.svgMarkup || '',
          astSource: data.astSource || '',
          author: data.author || 'Educator',
          version: data.version || '1.0.0',
          invariants: data.invariants || [],
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
    const astMatch = text.match(/<metadata[^>]*data-ast=["']([\s\S]*?)["']/i) || text.match(/\(:scene[\s\S]*?\)/);
    const cleanId = file.name.replace(/\.(ast\.)?svg$/i, '').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();

    const cart: CartridgeDefinition = {
      id: cleanId,
      title: titleMatch ? titleMatch[1] : cleanId,
      stage: 'VECTOR CAPSULE',
      category: 'Mathematics',
      desc: 'Imported living vector cartridge capsule.',
      icon: '🎨',
      source: 'imported',
      svgMarkup: text,
      astSource: astMatch ? (astMatch[1] ? decodeURIComponent(astMatch[1]) : astMatch[0]) : `(:scene :id "${cleanId}" :title "${cleanId}")`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveCustomCartridge(cart);
    return cart;
  }

  // 5. Raw AST S-Expression file (.ast)
  if (fileName.endsWith('.ast') || text.trim().startsWith('(:scene') || text.trim().startsWith('(')) {
    const cleanId = file.name.replace(/\.ast$/i, '').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
    const titleMatch = text.match(/:title\s+"([^"]+)"/i);
    const stageMatch = text.match(/:stage\s+"([^"]+)"/i);

    const cart: CartridgeDefinition = {
      id: cleanId,
      title: titleMatch ? titleMatch[1] : cleanId,
      stage: stageMatch ? stageMatch[1] : 'CURRICULUM',
      category: 'Mathematics',
      desc: 'Imported declarative AST vector logic cartridge.',
      icon: '📜',
      source: 'imported',
      svgMarkup: `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#090d16"/><text x="400" y="240" fill="#38bdf8" font-size="20" font-weight="800" text-anchor="middle">${cleanId}</text></svg>`,
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
  svgMarkup?: string;
  astSource?: string;
}): CartridgeDefinition {
  const cleanId = input.title
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-|-$/g, '') || `cartridge-${Date.now().toString(36)}`;

  const defaultSvg = `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">
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

  const defaultAst = `(:scene :id "${cleanId}" :title "${input.title}" :stage "${input.stage}" :duration 12.0
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
    category: input.category || 'General',
    desc: input.desc || 'Custom authored decentralized vector cartridge.',
    icon: input.icon || '📐',
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
