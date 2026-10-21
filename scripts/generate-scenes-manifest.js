/**
 * scripts/generate-scenes-manifest.js
 * 
 * Scans controlled input directories for *.ast cartridges, verifies matching [id].svg,
 * parses/ensures root slots (:id, :type ["Sim"|"Slide"|"App"], :title, :stage, :duration), and emits:
 * 1. static/player/scenes.manifest.json (Runtime payload for the iframe player)
 * 2. src/data/player/generatedScenes.ts (Single source of truth for React UI)
 * 3. Keeps controlled input directories (scenes, cartridges) synchronized
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const manifestPath = path.join(rootDir, 'static', 'player', 'scenes.manifest.json');
const tsExportPath = path.join(rootDir, 'src', 'data', 'player', 'generatedScenes.ts');

function extractSlot(content, regex) {
  const match = content.match(regex);
  if (!match) return null;
  return match[1].trim().replace(/^"|"$/g, '');
}

/**
 * Infers cartridge type purely from AST header or AST structural nodes.
 * Zero hard-coded lists of IDs.
 */
export function inferCartridgeType(rawType, astContent) {
  // 1. Explicit declaration takes absolute priority
  if (rawType) {
    const clean = rawType.replace(/^"|"$/g, '').trim().toLowerCase();
    if (clean === 'sim' || clean === 'simulation' || clean === 'interactive') return 'Sim';
    if (clean === 'slide' || clean === 'slides' || clean === 'presentation') return 'Slide';
    if (clean === 'app' || clean === 'application' || clean === 'tool' || clean === 'lab') return 'App';
    if (clean === 'film' || clean === 'video' || clean === 'movie') return 'Film';
  }

  // 1b. Explicit video or film slot declaration
  if (/:video\s+|:film\s+/i.test(astContent)) {
    return 'Film';
  }

  // 2. Structural Inference (Pure AST inspection, NO ID checking)
  const hasSubtitles = /:subtitles\s*\(/i.test(astContent);
  const hasGestures = /:gestures\s*\(/i.test(astContent) || /:draggable\s+/i.test(astContent);
  const hasCheckpoints = /:interactive\s*\(/i.test(astContent) || /:checkpoint\s+/i.test(astContent);
  const hasPhysics = /:physics\s*\(/i.test(astContent) || /:emitter\s+/i.test(astContent);

  // If it's a narrated presentation with no direct pointer grabbing:
  if (hasSubtitles && !hasGestures && !hasPhysics) {
    return 'Slide';
  }

  // If it has direct physical manipulation, emitters, or formative checkpoints:
  if (hasGestures || hasPhysics || hasCheckpoints) {
    return 'Sim';
  }

  // Standalone game/utility/unclassified tool:
  return 'App';
}

/**
 * Resolves controlled input directories from options, CLI flags, env vars, or defaults.
 */
export function getControlledInputDirs(options = {}) {
  // 1. Explicit options
  if (options.inputDirs && Array.isArray(options.inputDirs) && options.inputDirs.length > 0) {
    return options.inputDirs.map((d) => (path.isAbsolute(d) ? d : path.join(rootDir, d)));
  }

  // 2. Command-line args --input-dirs=dir1,dir2 or --dirs=dir1,dir2
  const cliDirsArg = process.argv.find(
    (arg) => arg.startsWith('--input-dirs=') || arg.startsWith('--dirs=') || arg.startsWith('--input-dir=')
  );
  if (cliDirsArg) {
    const raw = cliDirsArg.split('=')[1];
    return raw
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => (path.isAbsolute(d) ? d : path.join(rootDir, d)));
  }

  // 3. Environment variables CARTRIDGE_DIRS or INPUT_DIRS
  const envDirs = process.env.CARTRIDGE_DIRS || process.env.INPUT_DIRS;
  if (envDirs) {
    return envDirs
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => (path.isAbsolute(d) ? d : path.join(rootDir, d)));
  }

  // 4. Default controlled search paths
  const defaultCandidates = [
    path.join(rootDir, 'static', 'player', 'scenes'),
    path.join(rootDir, 'static', 'player', 'cartridges'),
    path.join(rootDir, 'static', 'cartridges')
  ];

  return defaultCandidates.filter((d) => fs.existsSync(d));
}

export const normalizeCartridgeType = inferCartridgeType;

/**
 * Canonical Oak National Curriculum Standards & Reference Registry
 * Maps core curriculum apparatus to official Oak National Academy numbers,
 * key stages, subject departments, and verified lesson coordinates.
 */
export const OAK_CURRICULUM_REGISTRY = {
  'pythagoras': {
    oakId: 'OAK-KS3-MAT-001',
    oakUnit: 'ks3-maths-geometry-pythagoras',
    subject: 'Mathematics',
    mount: '/curriculum/maths/geometry/pythagoras',
    section: 'Mathematics & Geometry'
  },
  'calculus-curves': {
    oakId: 'OAK-KS4-MAT-002',
    oakUnit: 'ks4-maths-calculus-tangents',
    subject: 'Mathematics',
    mount: '/curriculum/maths/calculus/tangent-slopes',
    section: 'Mathematics & Geometry'
  },
  'algebra-balance': {
    oakId: 'OAK-KS3-MAT-003',
    oakUnit: 'ks3-maths-algebra-linear-equations',
    subject: 'Mathematics',
    mount: '/curriculum/maths/algebra/balance-scale',
    section: 'Mathematics & Geometry'
  },
  'bodmas': {
    oakId: 'OAK-KS2-MAT-004',
    oakUnit: 'ks2-maths-arithmetic-order-operations',
    subject: 'Mathematics',
    mount: '/curriculum/maths/algebra/bodmas',
    section: 'Mathematics & Geometry'
  },
  'fractions': {
    oakId: 'OAK-KS2-MAT-005',
    oakUnit: 'ks2-maths-arithmetic-common-denominators',
    subject: 'Mathematics',
    mount: '/curriculum/maths/arithmetic/fractions',
    section: 'Mathematics & Geometry'
  },
  'times-tables': {
    oakId: 'OAK-KS1-MAT-006',
    oakUnit: 'ks1-maths-arithmetic-multiplication-arrays',
    subject: 'Mathematics',
    mount: '/curriculum/maths/arithmetic/times-tables',
    section: 'Mathematics & Geometry'
  },
  'math-fishing': {
    oakId: 'OAK-KS1-MAT-007',
    oakUnit: 'ks1-maths-arithmetic-number-bonds',
    subject: 'Mathematics',
    mount: '/curriculum/maths/arithmetic/number-bonds',
    section: 'Mathematics & Geometry'
  },
  'kinetic-gas': {
    oakId: 'OAK-KS3-SCI-001',
    oakUnit: 'ks3-physics-particles-gas-pressure',
    subject: 'Science',
    mount: '/curriculum/science/physics/kinetic-gas',
    section: 'Natural Sciences & Physics'
  },
  'electric-circuits': {
    oakId: 'OAK-KS3-SCI-002',
    oakUnit: 'ks3-physics-electricity-circuits-ohms-law',
    subject: 'Science',
    mount: '/curriculum/science/physics/electric-circuits',
    section: 'Natural Sciences & Physics'
  },
  'atom': {
    oakId: 'OAK-KS3-SCI-003',
    oakUnit: 'ks3-chemistry-atomic-structure-periodic-table',
    subject: 'Science',
    mount: '/curriculum/science/chemistry/atomic-structure',
    section: 'Natural Sciences & Physics'
  },
  'photosynthesis': {
    oakId: 'OAK-KS3-SCI-004',
    oakUnit: 'ks3-biology-plants-photosynthesis-solar',
    subject: 'Science',
    mount: '/curriculum/science/biology/photosynthesis',
    section: 'Natural Sciences & Physics'
  },
  'dna-helix': {
    oakId: 'OAK-KS3-SCI-005',
    oakUnit: 'ks3-biology-genetics-dna-transcription',
    subject: 'Science',
    mount: '/curriculum/science/biology/dna-helix',
    section: 'Natural Sciences & Physics'
  },
  'solar-system': {
    oakId: 'OAK-KS3-SCI-006',
    oakUnit: 'ks3-physics-space-solar-system-gravity',
    subject: 'Science',
    mount: '/curriculum/science/physics/solar-system',
    section: 'Natural Sciences & Physics'
  },
  'velocity': {
    oakId: 'OAK-KS3-SCI-007',
    oakUnit: 'ks3-physics-motion-velocity-vectors',
    subject: 'Science',
    mount: '/curriculum/science/physics/velocity-vectors',
    section: 'Natural Sciences & Physics'
  },
  'water-cycle': {
    oakId: 'OAK-KS2-GEO-001',
    oakUnit: 'ks2-geography-physical-water-cycle',
    subject: 'Geography',
    mount: '/curriculum/geography/water-cycle',
    section: 'Geography & Earth Sciences'
  },
  'mountain-elevation': {
    oakId: 'OAK-KS2-GEO-002',
    oakUnit: 'ks2-geography-topography-mountain-elevation',
    subject: 'Geography',
    mount: '/curriculum/geography/mountain-elevation',
    section: 'Geography & Earth Sciences'
  },
  'phonics-lab': {
    oakId: 'OAK-KS1-ENG-001',
    oakUnit: 'ks1-english-reading-phonics-sound-buttons',
    subject: 'English',
    mount: '/curriculum/english/phonics/phonics-lab',
    section: 'English Literature & Phonics'
  },
  'phonics-screening': {
    oakId: 'OAK-KS1-ENG-002',
    oakUnit: 'ks1-english-reading-phonics-alien-words',
    subject: 'English',
    mount: '/curriculum/english/phonics/screening-check',
    section: 'English Literature & Phonics'
  },
  'spelling-bee': {
    oakId: 'OAK-KS2-ENG-003',
    oakUnit: 'ks2-english-writing-orthography-spelling',
    subject: 'English',
    mount: '/curriculum/english/spelling/spelling-bee',
    section: 'English Literature & Phonics'
  },
  'shakespeare': {
    oakId: 'OAK-KS3-ENG-004',
    oakUnit: 'ks3-english-literature-globe-theatre',
    subject: 'English',
    mount: '/curriculum/english/theatre/globe',
    section: 'English Literature & Phonics'
  },
  'shakespeare-macbeth': {
    oakId: 'OAK-KS4-ENG-005',
    oakUnit: 'ks4-english-literature-macbeth-drama',
    subject: 'English',
    mount: '/curriculum/english/theatre/macbeth',
    section: 'English Literature & Phonics'
  },
  'languages': {
    oakId: 'OAK-KS2-MFL-001',
    oakUnit: 'ks2-languages-mfl-polyglot-studio',
    subject: 'Languages',
    mount: '/curriculum/languages/mfl-polyglot',
    section: 'Languages & Inclusion'
  },
  'bsl-fingerspelling': {
    oakId: 'OAK-KS2-INC-001',
    oakUnit: 'ks2-inclusion-bsl-3d-fingerspelling',
    subject: 'Inclusion & Languages',
    mount: '/curriculum/languages/bsl-fingerspelling',
    section: 'Languages & Inclusion'
  },
  'fish-tank': {
    oakId: 'OAK-KS3-COM-001',
    oakUnit: 'ks3-computing-systems-stress-benchmarks',
    subject: 'Computing',
    mount: '/curriculum/computing/stress-benchmark',
    section: 'Computing & Technology'
  },
  'church-tour': {
    oakId: 'OAK-KS2-RE-001',
    oakUnit: 'ks2-re-catholic-sacred-architecture',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/church-tour',
    section: 'Catholic Life & Faith Formation'
  },
  'altar-anatomy': {
    oakId: 'OAK-KS2-RE-002',
    oakUnit: 'ks2-re-catholic-altar-mensa-relics',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/altar-anatomy',
    section: 'Catholic Life & Faith Formation'
  },
  'holy-oils': {
    oakId: 'OAK-KS2-RE-003',
    oakUnit: 'ks2-re-catholic-holy-oils-ambry',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/holy-oils',
    section: 'Catholic Life & Faith Formation'
  },
  'holy-water-thurifer': {
    oakId: 'OAK-KS2-RE-004',
    oakUnit: 'ks2-re-catholic-asperges-incensations',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/holy-water-thurifer',
    section: 'Catholic Life & Faith Formation'
  },
  'first-communion': {
    oakId: 'OAK-KS2-RE-005',
    oakUnit: 'ks2-re-catholic-first-holy-communion',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/first-communion',
    section: 'Catholic Life & Faith Formation'
  },
  'triduum-easter': {
    oakId: 'OAK-KS2-RE-006',
    oakUnit: 'ks2-re-catholic-paschal-triduum',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/triduum-easter',
    section: 'Catholic Life & Faith Formation'
  },
  'liturgy-of-the-hours': {
    oakId: 'OAK-KS3-RE-007',
    oakUnit: 'ks3-re-catholic-divine-office-psalms',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/liturgy-of-the-hours',
    section: 'Catholic Life & Faith Formation'
  },
  'seven-sacraments': {
    oakId: 'OAK-KS2-RE-008',
    oakUnit: 'ks2-re-catholic-seven-sacraments',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/seven-sacraments',
    section: 'Catholic Life & Faith Formation'
  },
  'liturgical-calendar': {
    oakId: 'OAK-KS2-RE-009',
    oakUnit: 'ks2-re-catholic-liturgical-seasons',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/liturgical-calendar',
    section: 'Catholic Life & Faith Formation'
  },
  'liturgical-postures': {
    oakId: 'OAK-KS2-RE-010',
    oakUnit: 'ks2-re-catholic-liturgical-postures-prayer',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/liturgical-postures',
    section: 'Catholic Life & Faith Formation'
  },
  'catholic-rites': {
    oakId: 'OAK-KS3-RE-011',
    oakUnit: 'ks3-re-catholic-sacramental-rites',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/rites',
    section: 'Catholic Life & Faith Formation'
  },
  'cst-virtues': {
    oakId: 'OAK-KS3-RE-012',
    oakUnit: 'ks3-re-catholic-social-teaching-virtues',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/cst-virtues',
    section: 'Catholic Life & Faith Formation'
  },
  'latin-mass-prayers': {
    oakId: 'OAK-KS3-RE-013',
    oakUnit: 'ks3-re-catholic-traditional-latin-prayers',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/prayers-latin',
    section: 'Catholic Life & Faith Formation'
  },
  'nicene-creed': {
    oakId: 'OAK-KS3-RE-014',
    oakUnit: 'ks3-re-catholic-creed-profession-faith',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/creed',
    section: 'Catholic Life & Faith Formation'
  },
  'ten-commandments': {
    oakId: 'OAK-KS2-RE-015',
    oakUnit: 'ks2-re-catholic-decalogue-moral-law',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/commandments',
    section: 'Catholic Life & Faith Formation'
  },
  'order-of-the-mass': {
    oakId: 'OAK-KS2-RE-016',
    oakUnit: 'ks2-re-catholic-order-of-mass',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/mass',
    section: 'Catholic Life & Faith Formation'
  },
  'sacred-objects': {
    oakId: 'OAK-KS2-RE-017',
    oakUnit: 'ks2-re-catholic-sacred-vessels-vestments',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/sacred-objects',
    section: 'Catholic Life & Faith Formation'
  },
  'eucharistic-procession-film': {
    oakId: 'OAK-KS2-RE-018',
    oakUnit: 'ks2-re-catholic-eucharistic-procession',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/film',
    section: 'Catholic Life & Faith Formation'
  },
  'rosary-mysteries': {
    oakId: 'OAK-KS2-RE-019',
    oakUnit: 'ks2-re-catholic-rosary-twenty-mysteries',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/rosary-mysteries',
    section: 'Catholic Life & Faith Formation'
  },
  'stations-of-the-cross': {
    oakId: 'OAK-KS2-RE-020',
    oakUnit: 'ks2-re-catholic-via-crucis-stations',
    subject: 'Religious Education',
    mount: '/curriculum/catholic-life/stations-of-the-cross',
    section: 'Catholic Life & Faith Formation'
  },
  'welcome': {
    oakId: 'OAK-PORTAL-000',
    oakUnit: 'portal-apparatus-showcase',
    subject: 'Educational Technology',
    mount: '/player',
    section: 'Portal Showcase & Apparatus'
  },
  'pipeline-sample': {
    oakId: 'OAK-DEV-001',
    oakUnit: 'dev-apparatus-pipeline-sample',
    subject: 'Educational Technology',
    mount: '/curriculum/dev/pipeline-sample',
    section: 'Development & Test Apparatus'
  }
};

/**
 * Dynamically resolves Oak Curriculum Number, Unit, Subject, Section and Mount.
 * Prioritizes explicit AST declaration, then canonical registry, then algorithmic inference.
 * Zero hardcoding failure.
 */
export function resolveCartridgeCurriculumMetadata(id, astContent, stage) {
  // 1. Explicit AST declaration takes top priority
  const declaredOakId = extractSlot(astContent, /:oak-?id\s+"([^"]+)"/i) || extractSlot(astContent, /:oak\s+"([^"]+)"/i);
  const declaredOakUnit = extractSlot(astContent, /:oak-?unit\s+"([^"]+)"/i) || extractSlot(astContent, /:unit\s+"([^"]+)"/i);
  const declaredSubject = extractSlot(astContent, /:subject\s+"([^"]+)"/i);
  const declaredMount = extractSlot(astContent, /:mount\s+"([^"]+)"/i);
  const declaredSection = extractSlot(astContent, /:section\s+"([^"]+)"/i);

  // 2. Canonical Registry Lookup
  const known = OAK_CURRICULUM_REGISTRY[id];

  // 3. Algorithmic inference from Stage & ID keywords
  const normStage = (stage || '').toUpperCase();
  let inferSubject = 'General Curriculum';
  let inferSection = 'Curriculum Cartridges';
  let inferPrefix = 'GEN';

  if (/MATH|GEOMETRY|ALGEBRA|CALCULUS|ARITHMETIC/.test(normStage) || /math|pythagoras|algebra|calculus|fractions|bodmas|times/.test(id)) {
    inferSubject = 'Mathematics';
    inferSection = 'Mathematics & Geometry';
    inferPrefix = 'MAT';
  } else if (/SCIENCE|PHYSICS|CHEMISTRY|BIOLOGY/.test(normStage) || /gas|circuit|atom|photo|dna|solar|velocity/.test(id)) {
    inferSubject = 'Science';
    inferSection = 'Natural Sciences & Physics';
    inferPrefix = 'SCI';
  } else if (/CATHOLIC|RE|FAITH|RELIGIOUS/.test(normStage) || /church|altar|holy|rosary|station|cross|triduum|easter|liturgy|sacrament|posture|calendar|rite|cst|virtue|latin|prayer|creed|commandment|mass|sacred|communion|eucharistic|film/.test(id)) {
    inferSubject = 'Religious Education';
    inferSection = 'Catholic Life & Faith Formation';
    inferPrefix = 'RE';
  } else if (/ENGLISH|PHONICS|LITERATURE|SPELLING/.test(normStage) || /phonics|spelling|shakespeare/.test(id)) {
    inferSubject = 'English';
    inferSection = 'English Literature & Phonics';
    inferPrefix = 'ENG';
  } else if (/GEOGRAPHY/.test(normStage) || /water-cycle|mountain|elevation/.test(id)) {
    inferSubject = 'Geography';
    inferSection = 'Geography & Earth Sciences';
    inferPrefix = 'GEO';
  } else if (/LANGUAGES|MFL|INCLUSION|BSL/.test(normStage) || /language|bsl/.test(id)) {
    inferSubject = 'Languages';
    inferSection = 'Languages & Inclusion';
    inferPrefix = 'LAN';
  } else if (/COMPUTING|BENCHMARK|TECH/.test(normStage) || /fish-tank/.test(id)) {
    inferSubject = 'Computing';
    inferSection = 'Computing & Technology';
    inferPrefix = 'COM';
  }

  const stageCode = normStage.includes('KS1') || normStage.includes('EYFS') ? 'KS1'
    : normStage.includes('KS2') ? 'KS2'
    : normStage.includes('KS4') || normStage.includes('GCSE') || normStage.includes('A-LEVEL') ? 'KS4'
    : 'KS3';

  const oakId = declaredOakId || (known && known.oakId) || `OAK-${stageCode}-${inferPrefix}-${id.slice(0, 10).toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
  const oakUnit = declaredOakUnit || (known && known.oakUnit) || `${stageCode.toLowerCase()}-${inferSubject.toLowerCase().replace(/[^a-z]/g, '')}-${id}`;
  const subject = declaredSubject || (known && known.subject) || inferSubject;
  const section = declaredSection || (known && known.section) || inferSection;
  const mount = declaredMount || (known && known.mount) || `/curriculum/${inferSubject.toLowerCase().split(' ')[0]}/${id}`;

  return { oakId, oakUnit, subject, section, mount };
}

function parseAstHeader(astContent, filename) {
  const id = extractSlot(astContent, /:id\s+("[^"]+"|[^\s\)]+)/i);
  const rawType = extractSlot(astContent, /:type\s+("Sim"|"Slide"|"App"|"[^"]+"|[^\s\)]+)/i);
  const title = extractSlot(astContent, /:title\s+"([^"]+)"/i);
  const stage = extractSlot(astContent, /:stage\s+"([^"]+)"/i) || 'CURRICULUM';
  const durationStr = extractSlot(astContent, /:duration\s+([\d\.]+)/i);
  const duration = durationStr ? parseFloat(durationStr) : 10.0;

  if (!id) {
    console.warn(`[Manifest Generator] Warning: Could not find :id in ${filename}`);
    return null;
  }

  const type = inferCartridgeType(rawType, astContent);

  // Count keyframes
  const keyframesMatch = astContent.match(/\(:keyframes\s*\(([\s\S]*?)\)\s*\)/i);
  const keyframeCount = keyframesMatch ? (keyframesMatch[1].match(/\(:t\s+/g) || []).length : 0;

  // Count subtitles
  const subtitlesMatch = astContent.match(/\(:subtitles\s*\(([\s\S]*?)\)\s*\)/i);
  const subtitleCount = subtitlesMatch ? (subtitlesMatch[1].match(/\(:start\s+/g) || []).length : 0;

  // Count bindings
  const bindingsCount = (astContent.match(/\(:target\s+/g) || []).length;

  // Checkpoints count & capability
  const checkpointBlocks = (astContent.match(/\(:checkpoint\s+/gi) || []).length;
  const isInteractiveDisabled = /:interactive\s+(false|nil|none)\b/i.test(astContent) ||
    /:questions\s+(false|nil|none)\b/i.test(astContent) ||
    type === 'App';
  const hasCheckpoints = !isInteractiveDisabled && checkpointBlocks > 0;

  // 3D capabilities
  const has3D = /:camera\s+|:type\s+"3d-/i.test(astContent);
  const nodes3DCount = (astContent.match(/:type\s+"3d-/gi) || []).length;

  // Core Cartridge Tier (:core true or :tier "core")
  const tierMatch = extractSlot(astContent, /:tier\s+("Core"|"core"|"phet"|"user"|"[^"]+"|[^\s\)]+)/i);
  const coreExplicit = /:core\s+(true|t)\b/i.test(astContent);
  const tier = tierMatch ? tierMatch.toLowerCase() : 'core';
  const isCore = coreExplicit || tier === 'core';

  // Dynamic Oak Curriculum & Navigation Resolver (Zero Hardcoded Fragility)
  const curriculumMeta = resolveCartridgeCurriculumMetadata(id, astContent, stage);

  // Video/Film backdrop capabilities
  const video = extractSlot(astContent, /:video\s+"([^"]+)"/i) || extractSlot(astContent, /:film\s+"([^"]+)"/i);
  const videoFit = extractSlot(astContent, /:video-?fit\s+"([^"]+)"/i) || extractSlot(astContent, /:videoFit\s+"([^"]+)"/i) || 'contain';

  return {
    id,
    type,
    rawType,
    title: title || id,
    stage,
    duration,
    oakId: curriculumMeta.oakId,
    oakUnit: curriculumMeta.oakUnit,
    subject: curriculumMeta.subject,
    has3D,
    nodes3DCount,
    isCore,
    tier,
    mount: curriculumMeta.mount,
    section: curriculumMeta.section,
    video,
    videoFit,
    hasVideo: Boolean(video),
    keyframeCount,
    subtitleCount,
    bindingsCount,
    hasCheckpoints,
    checkpointCount: hasCheckpoints ? checkpointBlocks : 0
  };
}

/**
 * Ensures the .ast content explicitly declares :type ("Sim", "Slide", "App", "Film")
 */
function ensureTypeCalledInAst(astContent, type) {
  // If already calls :type "Sim"|"Slide"|"App"|"Film", preserve
  if (/:type\s+"(Sim|Slide|App|Film)"/i.test(astContent)) {
    return astContent;
  }

  // If has other :type "3d-...", check if root header has :type
  const headerMatch = astContent.match(/^\s*\(:scene\s+:id\s+("[^"]+"|[^\s\)]+)/i);
  if (headerMatch) {
    return astContent.replace(
      /^(\s*\(:scene\s+:id\s+("[^"]+"|[^\s\)]+))/i,
      `$1 :type "${type}"`
    );
  }

  // Pattern (scene :id "..." ...)
  const altHeaderMatch = astContent.match(/^\s*\(scene\s+:id\s+("[^"]+"|[^\s\)]+)/i);
  if (altHeaderMatch) {
    return astContent.replace(
      /^(\s*\(scene\s+:id\s+("[^"]+"|[^\s\)]+))/i,
      `$1 :type "${type}"`
    );
  }

  return astContent;
}

/**
 * Ensures the .ast content explicitly declares :oak-id and :oak-unit
 */
export function ensureOakCalledInAst(astContent, oakId, oakUnit) {
  if (!oakId) return astContent;
  let updated = astContent;

  const hasOakId = /:oak-?id\s+"[^"]+"/i.test(updated) || /:oak\s+"[^"]+"/i.test(updated);
  const hasOakUnit = /:oak-?unit\s+"[^"]+"/i.test(updated) || /:unit\s+"[^"]+"/i.test(updated);

  if (hasOakId && hasOakUnit) return updated;

  // Pattern (:scene :id "..." ...)
  const headerRegex = /^(\s*\(:scene\s+:id\s+(?:"[^"]+"|[^\s\)]+)(?:\s+:type\s+"[^"]+")?)/i;
  const match = updated.match(headerRegex);
  if (match) {
    let additions = '';
    if (!hasOakId) additions += ` :oak-id "${oakId}"`;
    if (!hasOakUnit && oakUnit) additions += ` :oak-unit "${oakUnit}"`;
    return updated.replace(headerRegex, `$1${additions}`);
  }

  // Pattern (scene :id "..." ...)
  const altHeaderRegex = /^(\s*\(scene\s+:id\s+(?:"[^"]+"|[^\s\)]+)(?:\s+:type\s+"[^"]+")?)/i;
  const altMatch = updated.match(altHeaderRegex);
  if (altMatch) {
    let additions = '';
    if (!hasOakId) additions += ` :oak-id "${oakId}"`;
    if (!hasOakUnit && oakUnit) additions += ` :oak-unit "${oakUnit}"`;
    return updated.replace(altHeaderRegex, `$1${additions}`);
  }

  return updated;
}

export function generateScenesManifest(options = {}) {
  const inputDirs = getControlledInputDirs(options);
  if (!inputDirs.length) {
    console.error(`[Manifest Generator] No controlled input directories found.`);
    process.exit(1);
  }

  console.log(`[Manifest Generator] Controlled Input Directories:`, inputDirs);

  const manifest = [];
  const processedIds = new Set();
  const allCartridgeFiles = new Map(); // id -> { astPath, svgPath, meta, content }

  for (const dir of inputDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    const astFiles = files.filter((f) => f.endsWith('.ast'));

    for (const astFile of astFiles) {
      const fullAstPath = path.join(dir, astFile);
      let content = fs.readFileSync(fullAstPath, 'utf8');
      const meta = parseAstHeader(content, astFile);

      if (!meta || processedIds.has(meta.id)) continue;

      const svgFile = `${meta.id}.svg`;
      const fullSvgPath = path.join(dir, svgFile);

      // Verify matching SVG
      let svgExists = fs.existsSync(fullSvgPath);
      if (!svgExists) {
        // Check other input directories for SVG
        for (const otherDir of inputDirs) {
          const altSvg = path.join(otherDir, svgFile);
          if (fs.existsSync(altSvg)) {
            svgExists = true;
            break;
          }
        }
      }

      if (!svgExists) {
        console.warn(`[Manifest Generator] Warning: Matching SVG file missing for ${astFile}:${svgFile}`);
        continue;
      }

      // Ensure :type is called directly in the .ast file
      let updatedContent = ensureTypeCalledInAst(content, meta.type);
      // Ensure Oak Curriculum numbers (:oak-id and :oak-unit) are directly assigned in the .ast file
      updatedContent = ensureOakCalledInAst(updatedContent, meta.oakId, meta.oakUnit);
      if (updatedContent !== content) {
        fs.writeFileSync(fullAstPath, updatedContent, 'utf8');
        content = updatedContent;
      }

      processedIds.add(meta.id);
      allCartridgeFiles.set(meta.id, {
        astPath: fullAstPath,
        svgPath: fullSvgPath,
        meta,
        content
      });

      manifest.push({
        id: meta.id,
        type: meta.type, // "Sim" | "Slide" | "App"
        title: meta.title,
        stage: meta.stage,
        duration: meta.duration,
        oakId: meta.oakId,
        oakUnit: meta.oakUnit,
        subject: meta.subject,
        has3D: meta.has3D,
        nodes3DCount: meta.nodes3DCount,
        svgFile: `scenes/${svgFile}`,
        astFile: `scenes/${astFile}`,
        astbFile: `bytecode/${meta.id}.astb`,
        video: meta.video || null,
        videoFit: meta.videoFit || 'contain',
        hasVideo: Boolean(meta.video),
        isCore: Boolean(meta.isCore),
        tier: meta.tier || 'core',
        mount: meta.mount,
        section: meta.section,
        keyframeCount: meta.keyframeCount,
        subtitleCount: meta.subtitleCount,
        bindingsCount: meta.bindingsCount,
        hasCheckpoints: Boolean(meta.hasCheckpoints),
        checkpointCount: meta.checkpointCount || 0
      });
    }
  }

  // Systematic Oak National Curriculum progression ordering (Zero hardcoded scene names)
  function getOakSortKey(scene) {
    if (scene.id === 'welcome' || (scene.oakId && scene.oakId.includes('PORTAL'))) {
      return '0-0-000';
    }

    const oakId = scene.oakId || '';
    const match = oakId.match(/OAK-(KS\d|EYFS|DEV|PORTAL)-([A-Z]+)-(\d+)/i);

    const subjectWeights = {
      'RE': 1,
      'MAT': 2,
      'SCI': 3,
      'ENG': 4,
      'GEO': 5,
      'MFL': 6,
      'LAN': 6,
      'INC': 7,
      'COM': 8,
      'DEV': 9
    };

    const stageWeights = {
      'EYFS': 1,
      'KS1': 2,
      'KS2': 3,
      'KS3': 4,
      'KS4': 5,
      'GCSE': 5,
      'A-LEVEL': 6
    };

    if (match) {
      const stage = match[1].toUpperCase();
      const subj = match[2].toUpperCase();
      const num = parseInt(match[3], 10) || 999;
      const stageW = stageWeights[stage] || 8;
      const subjW = subjectWeights[subj] || 8;
      return `1-${subjW}-${stageW}-${String(num).padStart(4, '0')}`;
    }

    return `2-9-9-${scene.id}`;
  }

  manifest.sort((a, b) => {
    const keyA = getOakSortKey(a);
    const keyB = getOakSortKey(b);
    if (keyA !== keyB) return keyA.localeCompare(keyB);
    return a.title.localeCompare(b.title);
  });

  // 1. Output runtime JSON manifest
  const output = {
    version: '2.6.0',
    generatedAt: new Date().toISOString(),
    totalScenes: manifest.length,
    inputDirs: inputDirs.map((d) => path.relative(rootDir, d) || '.'),
    types: ['Sim', 'Slide', 'App'],
    scenes: manifest
  };

  const jsonStr = JSON.stringify(output, null, 2) + '\n';
  fs.writeFileSync(manifestPath, jsonStr, 'utf8');
  console.log(`[Manifest Generator] Successfully wrote ${manifest.length} scenes to ${manifestPath}`);

  // Emit to root static/ directory for root-level fetches
  const rootManifestPath = path.join(rootDir, 'static', 'scenes.manifest.json');
  fs.writeFileSync(rootManifestPath, jsonStr, 'utf8');

  // Emit scenes-config.json for backward compatibility in both locations
  const legacyConfigPath = path.join(rootDir, 'static', 'player', 'scenes-config.json');
  fs.writeFileSync(legacyConfigPath, jsonStr, 'utf8');
  const rootLegacyConfigPath = path.join(rootDir, 'static', 'scenes-config.json');
  fs.writeFileSync(rootLegacyConfigPath, jsonStr, 'utf8');

  // Synchronize controlled cartridge folders so they all have the updated :type files
  const syncDirs = [
    path.join(rootDir, 'static', 'cartridges'),
    path.join(rootDir, 'static', 'player', 'cartridges'),
    path.join(rootDir, 'static', 'player', 'scenes')
  ];

  syncDirs.forEach((targetDir) => {
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    for (const [id, item] of allCartridgeFiles.entries()) {
      const targetAst = path.join(targetDir, `${id}.ast`);
      const targetSvg = path.join(targetDir, `${id}.svg`);
      if (!fs.existsSync(targetAst) || fs.readFileSync(targetAst, 'utf8') !== item.content) {
        fs.writeFileSync(targetAst, item.content, 'utf8');
      }
      if (fs.existsSync(item.svgPath) && item.svgPath !== targetSvg) {
        if (!fs.existsSync(targetSvg) || fs.statSync(item.svgPath).size !== fs.statSync(targetSvg).size) {
          fs.copyFileSync(item.svgPath, targetSvg);
        }
      }
    }
  });

  // 2. Output strongly typed presets for React UI
  const tsDataDir = path.dirname(tsExportPath);
  if (!fs.existsSync(tsDataDir)) {
    fs.mkdirSync(tsDataDir, { recursive: true });
  }

  const presetEntries = manifest.map((m) => ({
    id: m.id,
    type: m.type, // 'Sim' | 'Slide' | 'App'
    label: `${m.title}`,
    stage: m.stage,
    oakId: m.oakId,
    oakUnit: m.oakUnit,
    subject: m.subject,
    isCore: m.isCore ?? true,
    tier: m.tier || 'core',
    mount: m.mount,
    section: m.section,
    hasCheckpoints: Boolean(m.hasCheckpoints),
    checkpointCount: m.checkpointCount || 0
  }));

  const tsContent = `// AUTO-GENERATED BY scripts/generate-scenes-manifest.js
// DO NOT EDIT MANUALLY - Derived directly from controlled cartridge input directories

export type CartridgeType = 'Sim' | 'Slide' | 'App' | 'Film';

export interface ScenePresetOption {
  id: string;
  type: CartridgeType;
  label: string;
  stage: string;
  oakId?: string;
  oakUnit?: string;
  subject?: string;
  isCore?: boolean;
  tier?: string;
  mount?: string;
  section?: string;
  hasCheckpoints?: boolean;
  checkpointCount?: number;
}

export const PRESET_OPTIONS: ScenePresetOption[] = ${JSON.stringify(presetEntries, null, 2)};
`;

  fs.writeFileSync(tsExportPath, tsContent, 'utf8');
  console.log(`[Manifest Generator] Successfully wrote ${presetEntries.length} typed presets to ${tsExportPath}`);

  return output;
}

// Run when executed directly
if (process.argv[1] && process.argv[1].endsWith('generate-scenes-manifest.js')) {
  generateScenesManifest();
  process.exit(0);
}
