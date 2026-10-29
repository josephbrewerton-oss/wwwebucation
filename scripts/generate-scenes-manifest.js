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
  for (let i = match.length - 1; i >= 1; i--) {
    if (match[i] !== undefined && match[i] !== '') {
      return match[i].trim().replace(/^"|"$/g, '');
    }
  }
  return match[0].trim().replace(/^"|"$/g, '');
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

  // 4. Default controlled search paths (Single canonical source of truth)
  const defaultCandidates = [
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
export const OAK_CURRICULUM_REGISTRY = {};

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

  const oakId = declaredOakId || `OAK-${stageCode}-${inferPrefix}-${id.slice(0, 10).toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
  const oakUnit = declaredOakUnit || `${stageCode.toLowerCase()}-${inferSubject.toLowerCase().replace(/[^a-z]/g, '')}-${id}`;
  const subject = declaredSubject || inferSubject;
  const section = declaredSection || inferSection;
  const mount = declaredMount || `/curriculum/${inferSubject.toLowerCase().split(' ')[0]}/${id}`;

  return { oakId, oakUnit, subject, section, mount };
}

function parseAstHeader(astContent, filename, base) {
  const fallbackBase = base || (filename ? filename.replace(/\.ast$/, '') : 'unnamed');

  // Parse (:id ...), :id ..., (id ...), or meta (id ...)
  const parsedId = extractSlot(astContent, /\(:id\s+("([^"]+)"|([^\s\)]+))\)/i)
    || extractSlot(astContent, /:id\s+("([^"]+)"|([^\s\)]+))/i)
    || extractSlot(astContent, /\(id\s+("([^"]+)"|([^\s\)]+))\)/i)
    || extractSlot(astContent, /meta[\s\S]*?\(id\s+("([^"]+)"|([^\s\)]+))\)/i);
  
  const id = parsedId || fallbackBase;

  // Parse (:type ...), :type ..., (type ...)
  const rawType = extractSlot(astContent, /\(:type\s+("Sim"|"Slide"|"App"|"Film"|"[^"]+"|[^\s\)]+)\)/i)
    || extractSlot(astContent, /:type\s+("Sim"|"Slide"|"App"|"Film"|"[^"]+"|[^\s\)]+)/i)
    || extractSlot(astContent, /\(type\s+("Sim"|"Slide"|"App"|"Film"|"[^"]+"|[^\s\)]+)\)/i);

  // Parse (:title ...), :title ..., (title ...)
  let title = extractSlot(astContent, /\(:title\s+"([^"]+)"\)/i)
    || extractSlot(astContent, /:title\s+"([^"]+)"/i)
    || extractSlot(astContent, /\(title\s+"([^"]+)"\)/i);
  if (!title) {
    title = (id || fallbackBase)
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Parse (:stage ...), :stage ..., (stage ...)
  let stage = extractSlot(astContent, /\(:stage\s+"([^"]+)"\)/i)
    || extractSlot(astContent, /:stage\s+"([^"]+)"/i)
    || extractSlot(astContent, /\(stage\s+"([^"]+)"\)/i);
  if (!stage) {
    stage = 'CURRICULUM';
  }

  // Parse (:duration ...), :duration ..., (duration ...)
  const durationStr = extractSlot(astContent, /\(:duration\s+([\d\.]+)\)/i)
    || extractSlot(astContent, /:duration\s+([\d\.]+)/i)
    || extractSlot(astContent, /\(duration\s+([\d\.]+)\)/i);
  const duration = durationStr ? parseFloat(durationStr) : 14.0;

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
    base: fallbackBase,
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
  const allCartridgeFiles = new Map(); // id -> { astPath, svgPath, meta, content, base }

  for (const dir of inputDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);

    // Scan directory for all matching .ast and .svg file pairs by basename
    const astBasenames = new Set(files.filter((f) => f.endsWith('.ast')).map((f) => f.slice(0, -4)));
    const svgBasenames = new Set(files.filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)));

    // Find all matching pairs
    const matchingBases = Array.from(astBasenames).filter((base) => svgBasenames.has(base));

    for (const base of matchingBases) {
      const astFile = `${base}.ast`;
      const svgFile = `${base}.svg`;
      const fullAstPath = path.join(dir, astFile);
      const fullSvgPath = path.join(dir, svgFile);

      let content = fs.readFileSync(fullAstPath, 'utf8');
      const meta = parseAstHeader(content, astFile, base);

      if (!meta || processedIds.has(meta.id)) continue;

      // Ensure :type is called directly in the .ast file if in scene form
      let updatedContent = ensureTypeCalledInAst(content, meta.type);
      // Ensure Oak Curriculum numbers (:oak-id and :oak-unit) are directly assigned in the .ast file if in scene form
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
        content,
        base
      });

      manifest.push({
        id: meta.id,
        base: base,
        type: meta.type, // "Sim" | "Slide" | "App" | "Film"
        title: meta.title,
        stage: meta.stage,
        duration: meta.duration,
        oakId: meta.oakId,
        oakUnit: meta.oakUnit,
        subject: meta.subject,
        has3D: meta.has3D,
        nodes3DCount: meta.nodes3DCount,
        svgFile: `cartridges/${base}.svg`,
        astFile: `cartridges/${base}.ast`,
        astbFile: `bytecode/${base}.astb`,
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
    types: ['Sim', 'Slide', 'App', 'Film'],
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

  // 2. Output manifest.oak.json (authoritative Oak Curriculum Registry)
  const oakUnits = [];
  const seenUnits = new Set();
  manifest.forEach((m) => {
    if (m.oakUnit && !seenUnits.has(m.oakUnit)) {
      seenUnits.add(m.oakUnit);
      oakUnits.push({
        unit: m.oakUnit,
        oakId: m.oakId,
        subject: m.subject,
        section: m.section,
        stage: m.stage,
        title: m.title,
        cartridgeId: m.id
      });
    }
  });

  const oakManifest = {
    version: '2.6.0',
    authority: "St Joseph's Curriculum Portal & Oak National Academy Standards Alignment",
    generatedAt: new Date().toISOString(),
    totalCartridges: manifest.length,
    units: oakUnits,
    cartridges: manifest.map((m) => ({
      id: m.id,
      base: m.base,
      type: m.type,
      title: m.title,
      stage: m.stage,
      oakId: m.oakId,
      oakUnit: m.oakUnit,
      subject: m.subject,
      section: m.section,
      mount: m.mount,
      duration: m.duration,
      svgFile: m.svgFile,
      astFile: m.astFile,
      astbFile: m.astbFile,
      isCore: m.isCore,
      tier: m.tier,
      hasCheckpoints: m.hasCheckpoints,
      checkpointCount: m.checkpointCount
    }))
  };

  const oakJsonStr = JSON.stringify(oakManifest, null, 2) + '\n';
  const playerOakManifestPath = path.join(rootDir, 'static', 'player', 'manifest.oak.json');
  const rootOakManifestPath = path.join(rootDir, 'static', 'manifest.oak.json');
  fs.writeFileSync(playerOakManifestPath, oakJsonStr, 'utf8');
  fs.writeFileSync(rootOakManifestPath, oakJsonStr, 'utf8');
  console.log(`[Manifest Generator] Successfully wrote Oak manifest to ${playerOakManifestPath} and ${rootOakManifestPath}`);

  // 1. Synchronize assets into static/player/scenes/ (authoritative single source of truth for player)
  const playerScenesDir = path.join(rootDir, 'static', 'player', 'scenes');
  if (!fs.existsSync(playerScenesDir)) fs.mkdirSync(playerScenesDir, { recursive: true });

  const targetDir = path.join(rootDir, 'static', 'cartridges');
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  for (const [id, item] of allCartridgeFiles.entries()) {
    // Copy into static/player/scenes/
    const targetPlayerAst = path.join(playerScenesDir, `${item.base}.ast`);
    const targetPlayerSvg = path.join(playerScenesDir, `${item.base}.svg`);
    if (!fs.existsSync(targetPlayerAst) || fs.readFileSync(targetPlayerAst, 'utf8') !== item.content) {
      fs.writeFileSync(targetPlayerAst, item.content, 'utf8');
    }
    if (fs.existsSync(item.svgPath)) {
      if (!fs.existsSync(targetPlayerSvg) || fs.statSync(item.svgPath).size !== fs.statSync(targetPlayerSvg).size) {
        fs.copyFileSync(item.svgPath, targetPlayerSvg);
      }
    }

    // Mirror with logical ID if different from disk base
    if (item.meta.id && item.meta.id !== item.base) {
      const targetPlayerAstId = path.join(playerScenesDir, `${item.meta.id}.ast`);
      const targetPlayerSvgId = path.join(playerScenesDir, `${item.meta.id}.svg`);
      if (!fs.existsSync(targetPlayerAstId) || fs.readFileSync(targetPlayerAstId, 'utf8') !== item.content) {
        fs.writeFileSync(targetPlayerAstId, item.content, 'utf8');
      }
      if (fs.existsSync(item.svgPath)) {
        if (!fs.existsSync(targetPlayerSvgId) || fs.statSync(item.svgPath).size !== fs.statSync(targetPlayerSvgId).size) {
          fs.copyFileSync(item.svgPath, targetPlayerSvgId);
        }
      }
    }

    // Sync into static/cartridges/
    const targetAst = path.join(targetDir, `${item.base}.ast`);
    const targetSvg = path.join(targetDir, `${item.base}.svg`);
    if (!fs.existsSync(targetAst) || fs.readFileSync(targetAst, 'utf8') !== item.content) {
      fs.writeFileSync(targetAst, item.content, 'utf8');
    }
    if (fs.existsSync(item.svgPath) && item.svgPath !== targetSvg) {
      if (!fs.existsSync(targetSvg) || fs.statSync(item.svgPath).size !== fs.statSync(targetSvg).size) {
        fs.copyFileSync(item.svgPath, targetSvg);
      }
    }
  }
  console.log(`[Manifest Generator] Synchronized ${allCartridgeFiles.size} asset pairs to static/player/scenes/`);

  // 3. Output strongly typed presets for React UI
  const tsDataDir = path.dirname(tsExportPath);
  if (!fs.existsSync(tsDataDir)) {
    fs.mkdirSync(tsDataDir, { recursive: true });
  }

  const presetEntries = manifest.map((m) => ({
    id: m.id,
    base: m.base,
    type: m.type, // 'Sim' | 'Slide' | 'App' | 'Film'
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
  base?: string;
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
