// src/services/playerLauncher.ts
/**
 * Global Media Player Call Service
 * Enables any component, script, or page across the portal to programmatically
 * launch or embed the AST Vector Media Player.
 */

export type VectorPresetId =
  | 'fractions'
  | 'bodmas'
  | 'times-tables'
  | 'solar-system'
  | 'church-tour'
  | 'photosynthesis'
  | 'pythagoras'
  | 'atom'
  | 'cell-mitosis'
  | 'velocity'
  | 'dna-helix'
  | 'mountain-elevation'
  | 'shakespeare'
  | 'languages'
  | 'phonics-lab'
  | 'spelling-bee'
  | 'kinetic-gas'
  | 'electric-circuits'
  | 'math-fishing'
  | 'calculus-curves'
  | 'algebra-balance'
  | (string & {});

export interface PlayerCheckpointOption {
  prompt: string;
  options: string[];
  answer: number;
  explanation?: string;
  title?: string;
  t?: number;
}

export interface PlayerCallOptions {
  preset?: VectorPresetId;
  title?: string;
  autoPlay?: boolean;
  lang?: string;
  checkpoint?: PlayerCheckpointOption;
}

type PlayerListener = (options: PlayerCallOptions | null) => void;

const listeners = new Set<PlayerListener>();
let currentOptions: PlayerCallOptions | null = null;

/**
 * Intelligent topic-to-preset resolver
 */
export function resolvePresetForTopic(subject?: string, unit?: string, topic?: string): VectorPresetId {
  const s = (subject || '').toLowerCase();
  const u = (unit || '').toLowerCase();
  const t = (topic || '').toLowerCase();
  const combined = `${s} ${u} ${t}`;

  // Catholic Life & Religious Education Cartridge Taxonomy
  if (combined.includes('station') || combined.includes('via crucis') || combined.includes('via dolorosa') || combined.includes('calvary') || combined.includes('passion of christ')) {
    return 'stations-of-the-cross';
  }
  if (combined.includes('rosary') || combined.includes('mysteries') || combined.includes('hail mary') || combined.includes('decade')) {
    return 'rosary-mysteries';
  }
  if (combined.includes('triduum') || combined.includes('paschal') || combined.includes('good friday') || combined.includes('holy thursday') || combined.includes('easter vigil') || combined.includes('lumen christi')) {
    return 'triduum-easter';
  }
  if (combined.includes('first communion') || combined.includes('first holy communion') || combined.includes('adoration') || combined.includes('monstrance') || combined.includes('transubstantiation') || combined.includes('real presence')) {
    return 'first-communion';
  }
  if (combined.includes('ordo missae') || combined.includes('order of the mass') || combined.includes('liturgy of the word') || combined.includes('liturgy of the eucharist') || combined.includes('holy mass') || combined.includes('last supper')) {
    return 'order-of-the-mass';
  }
  if (combined.includes('altar') || combined.includes('mensa') || combined.includes('antependium') || combined.includes('relic')) {
    return 'altar-anatomy';
  }
  if (combined.includes('holy oil') || combined.includes('chrism') || combined.includes('ambry') || combined.includes('olea sancta') || combined.includes('catechumen')) {
    return 'holy-oils';
  }
  if (combined.includes('holy water') || combined.includes('thurib') || combined.includes('asperges') || combined.includes('incense')) {
    return 'holy-water-thurifer';
  }
  if (combined.includes('sacrament') || combined.includes('baptism') || combined.includes('confirmation') || combined.includes('reconciliation') || combined.includes('anointing') || combined.includes('holy orders') || combined.includes('matrimony')) {
    return 'seven-sacraments';
  }
  if (combined.includes('liturgical year') || combined.includes('liturgical season') || combined.includes('calendar') || combined.includes('advent') || combined.includes('lent') || combined.includes('pentecost')) {
    return 'liturgical-calendar';
  }
  if (combined.includes('posture') || combined.includes('genuflect') || combined.includes('kneel') || combined.includes('bowing') || combined.includes('sign of the cross')) {
    return 'liturgical-postures';
  }
  if (combined.includes('liturgy of the hours') || combined.includes('divine office') || combined.includes('breviary') || combined.includes('canonical hour') || combined.includes('lauds') || combined.includes('vespers') || combined.includes('compline')) {
    return 'liturgy-of-the-hours';
  }
  if (combined.includes('eastern rite') || combined.includes('eastern catholic') || combined.includes('byzantine') || combined.includes('maronite') || combined.includes('sui iuris') || combined.includes('24 catholic')) {
    return 'catholic-rites';
  }
  if (combined.includes('social teaching') || combined.includes('cst') || combined.includes('virtue') || combined.includes('human dignity') || combined.includes('solidarity') || combined.includes('subsidiarity') || combined.includes('laudato si')) {
    return 'cst-virtues';
  }
  if (combined.includes('latin mass') || combined.includes('gregorian') || combined.includes('pater noster') || combined.includes('ave maria') || combined.includes('chant')) {
    return 'latin-mass-prayers';
  }
  if (combined.includes('creed') || combined.includes('nicene') || combined.includes('apostles creed') || combined.includes('credo')) {
    return 'nicene-creed';
  }
  if (combined.includes('commandment') || combined.includes('decalogue') || combined.includes('sinai') || combined.includes('moral law')) {
    return 'ten-commandments';
  }
  if (combined.includes('sacred vessel') || combined.includes('chalice') || combined.includes('paten') || combined.includes('vestment') || combined.includes('ciborium') || combined.includes('sacred object')) {
    return 'sacred-objects';
  }
  if (combined.includes('church') || combined.includes('sanctuary') || combined.includes('narthex') || combined.includes('nave') || combined.includes('ambo') || combined.includes('tabernacle') || combined.includes('relig') || combined.includes('catholic')) {
    return 'church-tour';
  }
  // Accessibility & Languages
  if (combined.includes('bsl') || combined.includes('sign language') || combined.includes('fingerspell') || combined.includes('banzsl') || combined.includes('deaf')) {
    return 'bsl-fingerspelling';
  }
  if (combined.includes('spanish') || combined.includes('french') || combined.includes('latin') || combined.includes('mfl') || combined.includes('foreign language') || combined.includes('polyglot') || combined.includes('conjugat') || combined.includes('vocab')) {
    return 'languages';
  }

  // English & Humanities
  if (combined.includes('macbeth') || combined.includes('soliloquy') || combined.includes('duncan') || combined.includes('banquo') || combined.includes('weird sisters')) {
    return 'shakespeare-macbeth';
  }
  if (combined.includes('shakespear') || combined.includes('hamlet') || combined.includes('romeo') || combined.includes('juliet') || combined.includes('theatre') || combined.includes('theater') || combined.includes('globe') || combined.includes('drama') || combined.includes('poetry') || combined.includes('iambic') || combined.includes('playwright')) {
    return 'shakespeare';
  }
  if (combined.includes('screening') || combined.includes('alien word') || combined.includes('pseudo-word') || combined.includes('pseudo word')) {
    return 'phonics-screening';
  }
  if (combined.includes('phonic') || combined.includes('sound button') || combined.includes('blending mat') || combined.includes('grapheme') || combined.includes('phoneme') || combined.includes('digraph')) {
    return 'phonics-lab';
  }
  if (combined.includes('spelling') || combined.includes('spell') || combined.includes('spelling bee') || combined.includes('orthography')) {
    return 'spelling-bee';
  }

  // Physics, Chemistry & Space Sciences
  if (combined.includes('kinetic gas') || combined.includes('boyle') || combined.includes('gas law') || combined.includes('gas pressure') || combined.includes('ideal gas') || combined.includes('particle collision')) {
    return 'kinetic-gas';
  }
  if (combined.includes('circuit') || combined.includes('ohm') || combined.includes('voltage') || combined.includes('current') || combined.includes('resistor') || combined.includes('ammeter') || combined.includes('voltmeter') || combined.includes('electricity')) {
    return 'electric-circuits';
  }
  if (combined.includes('atom') || combined.includes('bohr') || combined.includes('electron') || combined.includes('nucleus') || combined.includes('chem')) {
    return 'atom';
  }
  if (combined.includes('velocity') || combined.includes('speed') || combined.includes('acceleration') || combined.includes('kinematics') || combined.includes('distance-time') || combined.includes('displacement')) {
    return 'velocity';
  }
  if (combined.includes('solar') || combined.includes('planet') || combined.includes('heliocentric') || combined.includes('astronomy') || combined.includes('orbit')) {
    return 'solar-system';
  }

  // Biology, Genetics & Earth Sciences
  if (combined.includes('dna') || combined.includes('helix') || combined.includes('genet') || combined.includes('chromosome') || combined.includes('nucleotide') || combined.includes('transcription')) {
    return 'dna-helix';
  }
  if (combined.includes('mitosis') || combined.includes('cell division') || combined.includes('cytokinesis') || combined.includes('prophase')) {
    return 'cell-mitosis';
  }
  if (combined.includes('photo') || combined.includes('chloroplast') || combined.includes('plant') || combined.includes('leaf') || combined.includes('botan') || combined.includes('thylakoid')) {
    return 'photosynthesis';
  }
  if (combined.includes('water cycle') || combined.includes('evaporation') || combined.includes('condensation') || combined.includes('precipitation') || combined.includes('transpiration') || combined.includes('hydrology')) {
    return 'water-cycle';
  }
  if (combined.includes('mountain') || combined.includes('altitude') || combined.includes('elevation') || combined.includes('climb') || combined.includes('climber') || combined.includes('hill') || combined.includes('height')) {
    return 'mountain-elevation';
  }
  if (combined.includes('aquarium') || combined.includes('fish tank') || combined.includes('benchmark') || combined.includes('ecosystem') || combined.includes('stress test')) {
    return 'fish-tank';
  }

  // Mathematics & Quantitative Reasoning
  if (combined.includes('calculus') || combined.includes('derivative') || combined.includes('integral') || combined.includes('tangent') || combined.includes('slope') || combined.includes('differentiation') || combined.includes('riemann') || combined.includes('turning point') || combined.includes('dy/dx')) {
    return 'calculus-curves';
  }
  if (combined.includes('algebra') || combined.includes('equation balance') || combined.includes('balance scale') || combined.includes('zero-pair') || combined.includes('solve for x') || combined.includes('linear equation')) {
    return 'algebra-balance';
  }
  if (combined.includes('pythag') || combined.includes('triangle') || combined.includes('hypotenuse') || combined.includes('geometry') || combined.includes('right-angled')) {
    return 'pythagoras';
  }
  if (combined.includes('bodmas') || combined.includes('bidmas') || combined.includes('order of operation') || combined.includes('bracket') || combined.includes('parenthes')) {
    return 'bodmas';
  }
  if (combined.includes('times table') || combined.includes('multiplication') || combined.includes('array') || combined.includes('distributive') || combined.includes('mtc')) {
    return 'times-tables';
  }
  if (combined.includes('fishing') || combined.includes('number bond') || combined.includes('ten frame') || combined.includes('bonds to 10') || combined.includes('bonds to 20')) {
    return 'math-fishing';
  }
  if (combined.includes('math') || combined.includes('fraction') || combined.includes('decimal') || combined.includes('ratio')) {
    return 'fractions';
  }
  if (combined.includes('science') || combined.includes('space') || combined.includes('physics')) {
    return 'solar-system';
  }

  // Educational teaching default
  return 'fractions';
}

/**
 * Calls the player modal across the application
 */
export function openPlayerModal(options: PlayerCallOptions = {}): void {
  currentOptions = {
    preset: options.preset || 'fractions',
    title: options.title || 'Curriculum Vector Media Player',
    autoPlay: options.autoPlay ?? true,
    lang: options.lang || 'en',
    checkpoint: options.checkpoint,
  };
  listeners.forEach((listener) => listener(currentOptions));
}

/**
 * Closes the player modal
 */
export function closePlayerModal(): void {
  currentOptions = null;
  listeners.forEach((listener) => listener(null));
}

/**
 * Subscribes to player launch/close events
 */
export function subscribeToPlayerCalls(listener: PlayerListener): () => void {
  listeners.add(listener);
  // Replay current state immediately
  if (currentOptions) {
    listener(currentOptions);
  }
  return () => {
    listeners.delete(listener);
  };
}

// Global browser window invocation hook
if (typeof window !== 'undefined') {
  (window as any).callMediaPlayer = (presetOrOptions?: string | PlayerCallOptions) => {
    if (typeof presetOrOptions === 'string') {
      openPlayerModal({ preset: presetOrOptions as VectorPresetId });
    } else if (presetOrOptions && typeof presetOrOptions === 'object') {
      openPlayerModal(presetOrOptions);
    } else {
      openPlayerModal({ preset: 'fractions' });
    }
  };
}
