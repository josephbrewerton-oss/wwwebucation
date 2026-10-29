/**
 * scripts/generate-scenes-manifest.js
 * 
 * Scans controlled input directories for *.ast cartridges, verifies matching [id].svg,
 * parses root slots (:id, :type ["Sim"|"Slide"|"App"|"Film"], :title, :stage, :duration), and emits:
 * 1. static/player/scenes.manifest.json & static/scenes.manifest.json
 * 2. static/player/manifest.oak.json & static/manifest.oak.json
 * 3. src/data/player/generatedScenes.ts (Single source of truth for React UI)
 * 4. Synchronizes assets into static/player/cartridges/ for zero-404 iframe execution
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
  if (rawType) {
    const clean = rawType.replace(/^"|"$/g, '').trim().toLowerCase();
    if (clean === 'sim' || clean === 'simulation' || clean === 'interactive') return 'Sim';
    if (clean === 'slide' || clean === 'slides' || clean === 'presentation') return 'Slide';
    if (clean === 'app' || clean === 'application' || clean === 'tool' || clean === 'lab') return 'App';
    if (clean === 'film' || clean === 'video' || clean === 'movie') return 'Film';
  }

  if (/:video\s+|:film\s+/i.test(astContent)) {
    return 'Film';
  }

  const hasSubtitles = /:subtitles\s*\(/i.test(astContent);
  const hasGestures = /:gestures\s*\(/i.test(astContent) || /:draggable\s+/i.test(astContent);
  const hasCheckpoints = /:interactive\s*\(/i.test(astContent) || /:checkpoint\s+/i.test(astContent);
  const hasPhysics = /:physics\s*\(/i.test(astContent) || /:emitter\s+/i.test(astContent);

  if (hasSubtitles && !hasGestures && !hasPhysics) {
    return 'Slide';
  }

  if (hasGestures || hasPhysics || hasCheckpoints) {
    return 'Sim';
  }

  return 'App';
}

/**
 * Resolves controlled input directories from options, CLI flags, env vars, or defaults.
 */
export function getControlledInputDirs(options = {}) {
  if (options.inputDirs && Array.isArray(options.inputDirs) && options.inputDirs.length > 0) {
    return options.inputDirs.map((d) => (path.isAbsolute(d) ? d : path.join(rootDir, d)));
  }

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

  const envDirs = process.env.CARTRIDGE_DIRS || process.env.INPUT_DIRS;
  if (envDirs) {
    return envDirs
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => (path.isAbsolute(d) ? d : path.join(rootDir, d)));
  }

  const defaultCandidates = [
    path.join(rootDir, 'static', 'cartridges'),
    path.join(rootDir, 'static', 'player', 'cartridges')
  ];

  return defaultCandidates.filter((d) => fs.existsSync(d));
}

export const normalizeCartridgeType = inferCartridgeType;

export const OAK_CURRICULUM_REGISTRY = {};

/**
 * Dynamically resolves Oak Curriculum Number, Unit, Subject, Section and Mount.
 */
export function resolveCartridgeCurriculumMetadata(id, astContent, stage) {
  const declaredOakId = extractSlot(astContent, /:oak-?id\s+"([^"]+)"/i) || extractSlot(astContent, /:oak\s+"([^"]+)"/i);
  const declaredOakUnit = extractSlot(astContent, /:oak-?unit\s+"([^"]+)"/i) || extractSlot(astContent, /:unit\s+"([^"]+)"/i);
  const declaredSubject = extractSlot(astContent, /:subject\s+"([^"]+)"/i);
  const declaredMount = extractSlot(astContent, /:mount\s+"([^"]+)"/i);
  const declaredSection = extractSlot(astContent, /:section\s+"([^"]+)"/i);

  const normStage = (stage || '').toUpperCase();
  let inferSubject = 'General Curriculum';
  let inferSection = 'Curriculum Cartridges';
  let inferPrefix = 'GEN';

  if (/MATH|GEOMETRY|ALGEBRA|CALCULUS|ARITHMETIC/.test(normStage) || /math|pythagoras|algebra|calculus|fractions|bodmas|times|pendulum/.test(id)) {
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

  const parsedId = extractSlot(astContent, /\(:id\s+("([^"]+)"|([^\s\)]+))\)/i)
    || extractSlot(astContent, /:id\s+("([^"]+)"|([^\s\)]+))/i)
    || extractSlot(astContent, /\(id\s+("([^"]+)"|([^\s\)]+))\)/i)
    || extractSlot(astContent, /meta[\s\S]*?\(id\s+("([^"]+)"|([^\s\)]+))\)/i);
  
  const id = parsedId || fallbackBase;

  const rawType = extractSlot(astContent, /\(:type\s+("Sim"|"Slide"|"App"|"Film"|"[^"]+"|[^\s\)]+)\)/i)
    || extractSlot(astContent, /:type\s+("Sim"|"Slide"|"App"|"Film"|"[^"]+"|[^\s\)]+)/i)
    || extractSlot(astContent, /\(type\s+("Sim"|"Slide"|"App"|"Film"|"[^"]+"|[^\s\)]+)\)/i);

  let title = extractSlot(astContent, /\(:title\s+"([^"]+)"\)/i)
    || extractSlot(astContent, /:title\s+"([^"]+)"/i)
    || extractSlot(astContent, /\(title\s+"([^"]+)"\)/i);
  if (!title) {
    title = (id || fallbackBase)
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  let stage = extractSlot(astContent, /\(:stage\s+"([^"]+)"\)/i)
    || extractSlot(astContent, /:stage\s+"([^"]+)"/i)
    || extractSlot(astContent, /\(stage\s+"([^"]+)"\)/i);
  if (!stage) {
    stage = 'CURRICULUM';
  }

  const durationStr = extractSlot(astContent, /\(:duration\s+([\d\.]+)\)/i)
    || extractSlot(astContent, /:duration\s+([\d\.]+)/i)
    || extractSlot(astContent, /\(duration\s+([\d\.]+)\)/i);
  const duration = durationStr ? parseFloat(durationStr) : 14.0;

  const type = inferCartridgeType(rawType, astContent);

  const keyframesMatch = astContent.match(/\(:keyframes\s*\(([\s\S]*?)\)\s*\)/i);
  const keyframeCount = keyframesMatch ? (keyframesMatch[1].match(/\(:t\s+/g) || []).length : 0;

  const subtitlesMatch = astContent.match(/\(:subtitles\s*\(([\s\S]*?)\)\s*\)/i);
  const subtitleCount = subtitlesMatch ? (subtitlesMatch[1].match(/\(:start\s+/g) || []).length : 0;

  const bindingsCount = (astContent.match(/\(:target\s+/g) || []).length;

  const checkpointBlocks = (astContent.match(/\(:checkpoint\s+/gi) || []).length;
  const isInteractiveDisabled = /:interactive\s+(false|nil|none)\b/i.test(astContent) ||
    /:questions\s+(false|nil|none)\b/i.test(astContent) ||
    type === 'App';
  const hasCheckpoints = !isInteractiveDisabled && checkpointBlocks > 0;

  const has3D = /:camera\s+|:type\s+"3d-/i.test(astContent);
  const nodes3DCount = (astContent.match(/:type\s+"3d-/gi) || []).length;

  const tierMatch = extractSlot(astContent, /:tier\s+("Core"|"core"|"phet"|"user"|"[^"]+"|[^\s\)]+)/i);
  const coreExplicit = /:core\s+(true|t)\b/i.test(astContent);
  const tier = tierMatch ? tierMatch.toLowerCase() : 'core';
  const isCore = coreExplicit || tier === 'core';

  const curriculumMeta = resolveCartridgeCurriculumMetadata(id, astContent, stage);

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

function ensureTypeCalledInAst(astContent, type) {
  if (/:type\s+"(Sim|Slide|App|Film)"/i.test(astContent)) {
    return astContent;
  }

  const headerMatch = astContent.match(/^\s*\(:scene\s+:id\s+("[^"]+"|[^\s\)]+)/i);
  if (headerMatch) {
    return astContent.replace(
      /^(\s*\(:scene\s+:id\s+("[^"]+"|[^\s\)]+))/i,
      `$1 :type "${type}"`
    );
  }

  const altHeaderMatch = astContent.match(/^\s*\(scene\s+:id\s+("[^"]+"|[^\s\)]+)/i);
  if (altHeaderMatch) {
    return astContent.replace(
      /^(\s*\(scene\s+:id\s+("[^"]+"|[^\s\)]+))/i,
      `$1 :type "${type}"`
    );
  }

  return astContent;
}

export function ensureOakCalledInAst(astContent, oakId, oakUnit) {
  if (!oakId) return astContent;
  let updated = astContent;

  const hasOakId = /:oak-?id\s+"[^"]+"/i.test(updated) || /:oak\s+"[^"]+"/i.test(updated);
  const hasOakUnit = /:oak-?unit\s+"[^"]+"/i.test(updated) || /:unit\s+"[^"]+"/i.test(updated);

  if (hasOakId && hasOakUnit) return updated;

  const headerRegex = /^(\s*\(:scene\s+:id\s+(?:"[^"]+"|[^\s\)]+)(?:\s+:type\s+"[^"]+")?)/i;
  const match = updated.match(headerRegex);
  if (match) {
    let additions = '';
    if (!hasOakId) additions += ` :oak-id "${oakId}"`;
    if (!hasOakUnit && oakUnit) additions += ` :oak-unit "${oakUnit}"`;
    return updated.replace(headerRegex, `$1${additions}`);
  }

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
  const allCartridgeFiles = new Map();

  for (const dir of inputDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);

    const astBasenames = new Set(files.filter((f) => f.endsWith('.ast')).map((f) => f.slice(0, -4)));
    const svgBasenames = new Set(files.filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)));

    const matchingBases = Array.from(astBasenames).filter((base) => svgBasenames.has(base));

    for (const base of matchingBases) {
      const astFile = `${base}.ast`;
      const svgFile = `${base}.svg`;
      const fullAstPath = path.join(dir, astFile);
      const fullSvgPath = path.join(dir, svgFile);

      let content = fs.readFileSync(fullAstPath, 'utf8');
      const meta = parseAstHeader(content, astFile, base);

      if (!meta || processedIds.has(meta.id)) continue;

      let updatedContent = ensureTypeCalledInAst(content, meta.type);
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
        type: meta.type,
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

  function getOakSortKey(scene) {
    if (scene.id === 'welcome' || (scene.oakId && scene.oakId.includes('PORTAL'))) {
      return '0-0-000';
    }

    const oakId = scene.oakId || '';
    const match = oakId.match(/OAK-(KS\d|EYFS|DEV|PORTAL)-([A-Z]+)-(\d+)/i);

    const subjectWeights = {
      'RE': 1, 'MAT': 2, 'SCI': 3, 'ENG': 4,
      'GEO': 5, 'MFL': 6, 'LAN': 6, 'INC': 7,
      'COM': 8, 'DEV': 9
    };

    const stageWeights = {
      'EYFS': 1, 'KS1': 2, 'KS2': 3,
      'KS3': 4, 'KS4': 5, 'GCSE': 5, 'A-LEVEL': 6
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

  // 1. Output runtime JSON manifests
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

  const rootManifestPath = path.join(rootDir, 'static', 'scenes.manifest.json');
  fs.writeFileSync(rootManifestPath, jsonStr, 'utf8');

  const legacyConfigPath = path.join(rootDir, 'static', 'player', 'scenes-config.json');
  fs.writeFileSync(legacyConfigPath, jsonStr, 'utf8');
  const rootLegacyConfigPath = path.join(rootDir, 'static', 'scenes-config.json');
  fs.writeFileSync(rootLegacyConfigPath, jsonStr, 'utf8');

  // 2. Output manifest.oak.json
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

  // 3. Synchronize assets into static/player/cartridges/ (matches manifest svgFile/astFile paths)
  const playerCartridgesDir = path.join(rootDir, 'static', 'player', 'cartridges');
  if (!fs.existsSync(playerCartridgesDir)) fs.mkdirSync(playerCartridgesDir, { recursive: true });

  const rootCartridgesDir = path.join(rootDir, 'static', 'cartridges');
  if (!fs.existsSync(rootCartridgesDir)) fs.mkdirSync(rootCartridgesDir, { recursive: true });

  // Fallback scenes directory for backward compatibility
  const playerScenesDir = path.join(rootDir, 'static', 'player', 'scenes');
  if (!fs.existsSync(playerScenesDir)) fs.mkdirSync(playerScenesDir, { recursive: true });

  for (const [id, item] of allCartridgeFiles.entries()) {
    // A. Sync to static/player/cartridges/
    const targetPlayerAst = path.join(playerCartridgesDir, `${item.base}.ast`);
    const targetPlayerSvg = path.join(playerCartridgesDir, `${item.base}.svg`);
    if (!fs.existsSync(targetPlayerAst) || fs.readFileSync(targetPlayerAst, 'utf8') !== item.content) {
      fs.writeFileSync(targetPlayerAst, item.content, 'utf8');
    }
    if (fs.existsSync(item.svgPath)) {
      if (!fs.existsSync(targetPlayerSvg) || fs.statSync(item.svgPath).size !== fs.statSync(targetPlayerSvg).size) {
        fs.copyFileSync(item.svgPath, targetPlayerSvg);
      }
    }

    // B. Sync to static/cartridges/ (if discovered from player/cartridges)
    const targetRootAst = path.join(rootCartridgesDir, `${item.base}.ast`);
    const targetRootSvg = path.join(rootCartridgesDir, `${item.base}.svg`);
    if (!fs.existsSync(targetRootAst) || fs.readFileSync(targetRootAst, 'utf8') !== item.content) {
      fs.writeFileSync(targetRootAst, item.content, 'utf8');
    }
    if (fs.existsSync(item.svgPath) && item.svgPath !== targetRootSvg) {
      if (!fs.existsSync(targetRootSvg) || fs.statSync(item.svgPath).size !== fs.statSync(targetRootSvg).size) {
        fs.copyFileSync(item.svgPath, targetRootSvg);
      }
    }

    // C. Backward-compatibility mirror in static/player/scenes/
    const legacySceneAst = path.join(playerScenesDir, `${item.base}.ast`);
    const legacySceneSvg = path.join(playerScenesDir, `${item.base}.svg`);
    if (!fs.existsSync(legacySceneAst) || fs.readFileSync(legacySceneAst, 'utf8') !== item.content) {
      fs.writeFileSync(legacySceneAst, item.content, 'utf8');
    }
    if (fs.existsSync(item.svgPath)) {
      if (!fs.existsSync(legacySceneSvg) || fs.statSync(item.svgPath).size !== fs.statSync(legacySceneSvg).size) {
        fs.copyFileSync(item.svgPath, legacySceneSvg);
      }
    }
  }
  console.log(`[Manifest Generator] Synchronized ${allCartridgeFiles.size} asset pairs to static/player/cartridges/`);

  // 4. Output strongly typed presets for React UI
  const tsDataDir = path.dirname(tsExportPath);
  if (!fs.existsSync(tsDataDir)) {
    fs.mkdirSync(tsDataDir, { recursive: true });
  }

  const presetEntries = manifest.map((m) => ({
    id: m.id,
    base: m.base,
    type: m.type,
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

if (process.argv[1] && process.argv[1].endsWith('generate-scenes-manifest.js')) {
  generateScenesManifest();
  process.exit(0);
}
