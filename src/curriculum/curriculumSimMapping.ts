// src/curriculum/curriculumSimMapping.ts
// St Joseph's Curriculum Portal - Topic to AST Simulation Preset Resolver
// Zero-allocation deterministic mapping between National Curriculum topics and 60 FPS Vector Simulators

export interface SimPresetBadge {
  presetId: string;
  label: string;
  type: 'Sim' | 'Slide' | 'App' | 'Film';
  icon: string;
}

const EXACT_TOPIC_MAP: Record<string, SimPresetBadge> = {
  // Mathematics
  'fractions': { presetId: 'fractions', label: 'Fraction Strips & Equivalence', type: 'Slide', icon: '🍰' },
  'fractions-decimals': { presetId: 'fractions', label: 'Fractions & Decimals Sim', type: 'Slide', icon: '🍰' },
  'unit-fractions': { presetId: 'fractions', label: 'Unit Fractions & Denominators', type: 'Slide', icon: '🍰' },
  'pythagoras': { presetId: 'pythagoras', label: "Pythagoras' Theorem (a² + b² = c²)", type: 'Sim', icon: '📐' },
  'angles-triangles': { presetId: 'pythagoras', label: 'Angles & Right Triangles', type: 'Sim', icon: '📐' },
  'algebra-balance': { presetId: 'algebra-balance', label: 'Algebraic Balance Scale', type: 'Sim', icon: '⚖️' },
  'linear-equations': { presetId: 'algebra-balance', label: 'Linear Equations Balance', type: 'Sim', icon: '⚖️' },
  'bodmas': { presetId: 'bodmas', label: 'BODMAS Order of Operations', type: 'Sim', icon: '🔢' },
  'times-tables': { presetId: 'times-tables', label: 'Multiplication Array Grid', type: 'App', icon: '✖️' },
  'calculus-curves': { presetId: 'calculus-curves', label: 'Calculus Gradient Tangents', type: 'Sim', icon: '📈' },

  // Science - Physics & Chemistry
  'states-of-matter': { presetId: 'kinetic-gas', label: 'Kinetic Gas & Particle Pressure', type: 'Sim', icon: '💨' },
  'kinetic-gas': { presetId: 'kinetic-gas', label: 'Kinetic Gas Theory & Boyle’s Law', type: 'Sim', icon: '💨' },
  'electric-circuits': { presetId: 'electric-circuits', label: 'Electric Circuits & Ohm’s Law', type: 'Sim', icon: '⚡' },
  'electricity': { presetId: 'electric-circuits', label: 'Circuits, Voltage & Current', type: 'Sim', icon: '⚡' },
  'atom': { presetId: 'atom', label: 'Atomic Structure & Electron Shells', type: 'Sim', icon: '⚛️' },
  'atomic-structure': { presetId: 'atom', label: 'Atomic Structure & Orbitals', type: 'Sim', icon: '⚛️' },
  'velocity': { presetId: 'velocity', label: 'Velocity, Vectors & Acceleration', type: 'Sim', icon: '🚀' },
  'forces-motion': { presetId: 'velocity', label: 'Forces, Vectors & Newton’s Laws', type: 'Sim', icon: '🚀' },
  'water-cycle': { presetId: 'water-cycle', label: 'The Hydrological Water Cycle', type: 'Sim', icon: '🌧️' },
  'solar-system': { presetId: 'solar-system', label: 'Solar System Planetary Orbits', type: 'Sim', icon: '🪐' },
  'earth-space': { presetId: 'solar-system', label: 'Heliocentric Planetary Motion', type: 'Sim', icon: '🪐' },
  'seasonal-changes': { presetId: 'solar-system', label: 'Earth Tilt & Seasonal Cycles', type: 'Sim', icon: '🌍' },

  // Science - Biology
  'photosynthesis': { presetId: 'photosynthesis', label: 'Photosynthesis & Chloroplasts', type: 'Sim', icon: '🌿' },
  'plant-biology': { presetId: 'photosynthesis', label: 'Plant Cells & Sunlight Reaction', type: 'Sim', icon: '🌱' },
  'dna-helix': { presetId: 'dna-helix', label: 'DNA Double Helix & Base Pairs', type: 'Sim', icon: '🧬' },
  'genetics': { presetId: 'dna-helix', label: 'Genetics & Nucleotide Pairing', type: 'Sim', icon: '🧬' },
  'cell-biology': { presetId: 'photosynthesis', label: 'Cell Biology & Organelles', type: 'Sim', icon: '🔬' },

  // Languages & Phonics & Computing
  'phonics-simple-sentences': { presetId: 'phonics-lab', label: 'Phonics Sound Mat & Digraphs', type: 'App', icon: '🔤' },
  'phonics-screening': { presetId: 'phonics-screening', label: 'Phonics Screening Alien Words', type: 'App', icon: '👾' },
  'spanish-foundations': { presetId: 'languages', label: 'Spanish Vocabulary & Grammar', type: 'App', icon: '🇪🇸' },
  'spanish': { presetId: 'languages', label: 'Spanish Interactive Lab', type: 'App', icon: '🇪🇸' },
  'algorithms-sequencing': { presetId: 'bbc-model-b', label: 'Algorithms & Sequencing Machine', type: 'App', icon: '💻' },
  'shakespeare-theatre': { presetId: 'shakespeare', label: 'Shakespeare Globe Theatre', type: 'Slide', icon: '🎭' },
  'macbeth': { presetId: 'shakespeare-macbeth', label: 'Shakespeare: Macbeth Tragedy', type: 'Slide', icon: '🗡️' },

  // Catholic Life & Religious Education
  'sacred-architecture': { presetId: 'church-tour', label: '3D Church Sanctuary Tour', type: 'Slide', icon: '🏛️' },
  'church-tour': { presetId: 'church-tour', label: 'Tour of a Catholic Church', type: 'Slide', icon: '🏛️' },
  'altar-anatomy': { presetId: 'altar-anatomy', label: 'High Altar Anatomy & Relics', type: 'Slide', icon: '🕯️' },
  'the-mass': { presetId: 'order-of-the-mass', label: 'Order of the Mass Step-by-Step', type: 'Slide', icon: '🍞' },
  'order-of-mass': { presetId: 'order-of-the-mass', label: 'Order of the Mass Walkthrough', type: 'Slide', icon: '🍞' },
  'eucharist': { presetId: 'altar-anatomy', label: 'The Holy Eucharist & Sacred Mensa', type: 'Slide', icon: '🍷' },
  'sacraments': { presetId: 'seven-sacraments', label: 'The Seven Holy Sacraments', type: 'Slide', icon: '🕊️' },
  'holy-oils': { presetId: 'holy-oils', label: 'The Three Holy Oils & Ambry', type: 'Slide', icon: '🌿' },
  'holy-water': { presetId: 'holy-water-thurifer', label: 'Holy Water & Thurible Rites', type: 'Slide', icon: '💧' },
  'latin-prayers': { presetId: 'latin-mass-prayers', label: 'Latin Mass Prayers Chapel', type: 'Slide', icon: '🇻🇦' },
  'stations-of-the-cross': { presetId: 'stations-of-the-cross', label: 'Stations of the Cross (Via Crucis)', type: 'Slide', icon: '✝️' },
  'first-communion': { presetId: 'first-communion', label: 'First Holy Communion Lab', type: 'Slide', icon: '🕊️' },
  'creed': { presetId: 'nicene-creed', label: 'The Nicene Creed Explained', type: 'Slide', icon: '📜' },
  'nicene-creed': { presetId: 'nicene-creed', label: 'The Nicene Creed Vector Sim', type: 'Slide', icon: '📜' },
  'ten-commandments': { presetId: 'ten-commandments', label: 'The Decalogue & Moral Law', type: 'Slide', icon: '📖' },
  'cst-virtues': { presetId: 'cst-virtues', label: 'Catholic Social Teaching Virtues', type: 'Slide', icon: '🌱' },
};

export function resolveTopicSimulator(topicId: string, topicTitle: string, subjectTitle: string): SimPresetBadge | null {
  const normId = (topicId || '').toLowerCase().trim();
  const normTitle = (topicTitle || '').toLowerCase().trim();
  const normSub = (subjectTitle || '').toLowerCase().trim();

  // 1. Direct key match
  if (EXACT_TOPIC_MAP[normId]) {
    return EXACT_TOPIC_MAP[normId];
  }

  // 2. Keyword heuristic matching
  if (normId.includes('fraction') || normTitle.includes('fraction')) {
    return EXACT_TOPIC_MAP['fractions'];
  }
  if (normId.includes('pythag') || normTitle.includes('pythag')) {
    return EXACT_TOPIC_MAP['pythagoras'];
  }
  if (normId.includes('circuit') || normTitle.includes('circuit') || normTitle.includes('ohm')) {
    return EXACT_TOPIC_MAP['electric-circuits'];
  }
  if (normId.includes('gas') || normTitle.includes('gas') || normTitle.includes('matter') || normTitle.includes('particle')) {
    return EXACT_TOPIC_MAP['states-of-matter'];
  }
  if (normId.includes('solar') || normTitle.includes('solar') || normTitle.includes('planet') || normTitle.includes('earth and space')) {
    return EXACT_TOPIC_MAP['solar-system'];
  }
  if (normId.includes('photo') || normTitle.includes('photosynthesis') || normTitle.includes('chloroplast')) {
    return EXACT_TOPIC_MAP['photosynthesis'];
  }
  if (normId.includes('atom') || normTitle.includes('atomic') || normTitle.includes('electron')) {
    return EXACT_TOPIC_MAP['atom'];
  }
  if (normId.includes('velocity') || normTitle.includes('velocity') || normTitle.includes('acceleration') || normTitle.includes('motion')) {
    return EXACT_TOPIC_MAP['velocity'];
  }
  if (normId.includes('dna') || normTitle.includes('dna') || normTitle.includes('genetic') || normTitle.includes('inheritance')) {
    return EXACT_TOPIC_MAP['dna-helix'];
  }
  if (normId.includes('water-cycle') || normTitle.includes('water cycle') || normTitle.includes('hydrolog')) {
    return EXACT_TOPIC_MAP['water-cycle'];
  }
  if (normId.includes('algebra') || normTitle.includes('algebra') || normTitle.includes('equation')) {
    return EXACT_TOPIC_MAP['algebra-balance'];
  }
  if (normId.includes('bodmas') || normTitle.includes('order of operations') || normTitle.includes('bidmas')) {
    return EXACT_TOPIC_MAP['bodmas'];
  }
  if (normId.includes('multipli') || normTitle.includes('times table') || normTitle.includes('multiplication')) {
    return EXACT_TOPIC_MAP['times-tables'];
  }
  if (normId.includes('phonic') || normTitle.includes('phonic') || normTitle.includes('digraph')) {
    return EXACT_TOPIC_MAP['phonics-simple-sentences'];
  }
  if (normId.includes('spanish') || normTitle.includes('spanish')) {
    return EXACT_TOPIC_MAP['spanish-foundations'];
  }
  if (normId.includes('algorithm') || normTitle.includes('algorithm') || normTitle.includes('programming')) {
    return EXACT_TOPIC_MAP['algorithms-sequencing'];
  }
  if (normId.includes('shakespeare') || normTitle.includes('shakespeare') || normTitle.includes('macbeth')) {
    return EXACT_TOPIC_MAP['shakespeare-theatre'];
  }

  // Catholic RE matches
  if (normSub.includes('religious') || normSub.includes('catholic') || normSub.includes('re')) {
    if (normId.includes('mass') || normTitle.includes('mass') || normTitle.includes('eucharist')) {
      return EXACT_TOPIC_MAP['the-mass'];
    }
    if (normId.includes('sacrament') || normTitle.includes('sacrament')) {
      return EXACT_TOPIC_MAP['sacraments'];
    }
    if (normId.includes('church') || normTitle.includes('architecture') || normTitle.includes('sanctuary')) {
      return EXACT_TOPIC_MAP['sacred-architecture'];
    }
    if (normId.includes('creed') || normTitle.includes('creed')) {
      return EXACT_TOPIC_MAP['creed'];
    }
    if (normId.includes('station') || normTitle.includes('cross') || normTitle.includes('via crucis')) {
      return EXACT_TOPIC_MAP['stations-of-the-cross'];
    }
    if (normId.includes('oil') || normTitle.includes('chrism') || normTitle.includes('ambry')) {
      return EXACT_TOPIC_MAP['holy-oils'];
    }
    if (normId.includes('cst') || normTitle.includes('social teaching') || normTitle.includes('virtue')) {
      return EXACT_TOPIC_MAP['cst-virtues'];
    }
    return EXACT_TOPIC_MAP['church-tour'];
  }

  return null;
}

const DATA_CARTRIDGE_TOPICS = new Set([
  'states-of-matter',
  'fractions-decimals',
  'seasonal-changes',
  'sacraments',
  're-sacraments',
  'algorithms-sequencing',
  'angles-triangles',
  'electric-circuits',
  'phonics-screening',
  'cell-biology',
  'nicene-creed',
  're-nicene-creed',
  'spanish-foundations',
]);

export function hasDataCartridge(topicId: string): boolean {
  if (!topicId) return false;
  return DATA_CARTRIDGE_TOPICS.has(topicId.toLowerCase().trim());
}
