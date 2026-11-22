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

import {
  putVaultCartridge,
  getVaultCartridge,
  getAllVaultCartridges,
  deleteVaultCartridge,
  countVaultCartridges,
  hasVaultCartridge,
  type VaultCartridgeRecord,
} from './dbStore';
import { getLocalState, setLocalState } from './localStateStore';
import { getAssetUrl } from '../utils/url';
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
  serializeDataCartridgeToAst,
} from '../utils/astQuestionExtractor';
import {
  type CartridgeDefinition,
  type CartridgeBundle,
  CARTRIDGE_ALIASES,
  BUILTIN_CARTRIDGES,
} from '../data/player/builtinCartridgeCatalog';
import {
  importCartridgeFileWithSaver,
  createCustomCartridgeWithSaver,
  type CreateCustomCartridgeInput,
} from './cartridgeImporter';
import { EMBEDDED_CORE_CARTRIDGES } from "../data/player/embeddedCoreCartridges";

export type {
  DataCartridgeQuestion,
  DataCartridgePayload,
  CartridgeDefinition,
  CartridgeBundle,
  CreateCustomCartridgeInput,
};
export { CARTRIDGE_ALIASES, BUILTIN_CARTRIDGES, EMBEDDED_CORE_CARTRIDGES };

const STORAGE_KEY_CUSTOM_CARTRIDGES = 'stj_custom_cartridges_v1';

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

      // 2. Check legacy IndexedDB app_state migration buffer (if any)
      let localItems: CartridgeDefinition[] = [];
      if (typeof window !== 'undefined') {
        try {
          const raw = getLocalState(STORAGE_KEY_CUSTOM_CARTRIDGES);
          if (raw) localItems = JSON.parse(raw);
        } catch {}
      }

      // 3. Merge into IndexedDB Vault
      const mergedMap = new Map<string, CartridgeDefinition>();
      vaultItems.forEach((v) => mergedMap.set(v.id, v as CartridgeDefinition));

      for (const item of localItems) {
        if (!mergedMap.has(item.id)) {
          mergedMap.set(item.id, item);
          await putVaultCartridge(item as VaultCartridgeRecord);
        }
      }

      // 4. Pre-expand embedded core simulations ONLY as offline seed when vault entry is absent
      //    (never overwrite a signed builtin copy fetched from static/cartridges/)
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
            seal: '',
            svgMarkup: core.svg,
            astSource: core.ast,
            updatedAt: Date.now(),
          };
          mergedMap.set(id, coreDef);
          await putVaultCartridge(coreDef as VaultCartridgeRecord);
        }
      }

      // 4b. Pre-expand modular built-in Data Cartridges (0 network calls, ready immediately in IndexedDB)
      for (const dataDeck of BUILTIN_DATA_CARTRIDGES) {
        const existing = mergedMap.get(dataDeck.id);
        if (!existing || !existing.svgMarkup || !existing.astSource || (existing.source === 'builtin' && existing.astSource !== dataDeck.astSource)) {
          const dataDef: CartridgeDefinition = {
            ...(existing || {}),
            id: dataDeck.id,
            type: 'Data',
            title: existing?.title || dataDeck.title,
            stage: existing?.stage || dataDeck.stage,
            subject: existing?.subject || dataDeck.subject,
            oakId: existing?.oakId || dataDeck.oakId,
            oakUnit: existing?.oakUnit || dataDeck.oakUnit,
            category: existing?.category || dataDeck.category,
            desc: existing?.desc || dataDeck.desc,
            icon: existing?.icon || dataDeck.icon,
            source: 'builtin',
            isCore: true,
            tier: 'core',
            svgMarkup: dataDeck.svgMarkup,
            astSource: dataDeck.astSource,
            dataPayload: dataDeck.dataPayload,
            updatedAt: Date.now(),
          };
          mergedMap.set(dataDeck.id, dataDef);
          await putVaultCartridge(dataDef as VaultCartridgeRecord);
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

/**
 * Inflates a specific cartridge into the user's IndexedDB Cartridge Vault on demand.
 * Guarantees zero-network retrieval on subsequent loads and air-gapped readiness.
 */
export async function inflateCartridgeToVault(
  cartridgeId: string,
  expectedSeal?: string
): Promise<CartridgeDefinition | null> {
  const canonical = normalizeCartridgeId(cartridgeId);
  if (!canonical) return null;

  const isFreshBuiltin = (item: { source?: string; seal?: string } | null | undefined): boolean => {
    if (!item) return false;
    if (item.source && item.source !== 'builtin') return true;
    if (!expectedSeal) return true;
    return item.seal === expectedSeal;
  };

  // 1. Check in-memory cache
  const inMem = inMemoryCartridgesCache?.find((c) => c.id === canonical);
  if (inMem && inMem.svgMarkup && inMem.astSource && isFreshBuiltin(inMem)) {
    return inMem;
  }

  // 2. Check IndexedDB cartridge vault (preserve stale builtin as offline fallback only)
  let staleFallback: CartridgeDefinition | null = null;
  try {
    const vaultItem = await getVaultCartridge(canonical);
    if (vaultItem && vaultItem.svgMarkup && vaultItem.astSource) {
      if (isFreshBuiltin(vaultItem)) {
        if (inMemoryCartridgesCache && !inMemoryCartridgesCache.some((c) => c.id === canonical)) {
          inMemoryCartridgesCache.push(vaultItem as CartridgeDefinition);
        }
        return vaultItem as CartridgeDefinition;
      }
      staleFallback = vaultItem as CartridgeDefinition;
    }
  } catch (_) {}

  // 3. Check embedded Data Cartridges (0ms air-gapped, no network fetch)
  const builtinData = BUILTIN_DATA_CARTRIDGES.find((d) => d.id === canonical);
  if (builtinData) {
    const def: CartridgeDefinition = {
      id: builtinData.id,
      type: 'Data',
      title: builtinData.title,
      stage: builtinData.stage,
      subject: builtinData.subject,
      oakId: builtinData.oakId,
      oakUnit: builtinData.oakUnit,
      category: builtinData.category,
      desc: builtinData.desc,
      icon: builtinData.icon,
      source: 'builtin',
      isCore: true,
      tier: 'core',
      seal: expectedSeal || '',
      svgMarkup: builtinData.svgMarkup,
      astSource: builtinData.astSource,
      dataPayload: builtinData.dataPayload,
      updatedAt: Date.now(),
    };
    await putVaultCartridge(def as VaultCartridgeRecord);
    if (inMemoryCartridgesCache) {
      const idx = inMemoryCartridgesCache.findIndex((c) => c.id === canonical);
      if (idx >= 0) inMemoryCartridgesCache[idx] = def;
      else inMemoryCartridgesCache.push(def);
    }
    return def;
  }

  // 4. Fetch official signed companion .svg and .ast first so vault always matches St Joseph's Curriculum checksums
  const knownMeta = PRESET_OPTIONS.find((p) => p.id === canonical);
  if (knownMeta && typeof fetch !== 'undefined') {
    try {
      const [svgRes, astRes] = await Promise.all([
        fetch(getAssetUrl(`cartridges/${canonical}.svg`)).catch(() => null),
        fetch(getAssetUrl(`cartridges/${canonical}.ast`)).catch(() => null),
      ]);

      let svgText = (svgRes && svgRes.ok) ? await svgRes.text() : '';
      let astText = (astRes && astRes.ok) ? await astRes.text() : '';

      if (svgText.trim().startsWith('<!DOCTYPE') || svgText.trim().startsWith('<html')) svgText = '';
      if (astText.trim().startsWith('<!DOCTYPE') || astText.trim().startsWith('<html')) astText = '';

      if (svgText && astText) {
        const meta = PRESET_OPTIONS.find((p) => p.id === canonical);
        const def: CartridgeDefinition = {
          id: canonical,
          title: meta?.label || canonical.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          stage: meta?.stage || 'CURRICULUM',
          subject: meta?.subject,
          type: meta?.type || 'Sim',
          category: meta?.subject || 'Curriculum',
          desc: `St Joseph's Curriculum cartridge: ${canonical}.`,
          icon: meta?.type === 'Sim' ? '🎮' : meta?.type === 'Slide' ? '📑' : '💻',
          source: 'builtin',
          seal: expectedSeal || '',
          svgMarkup: svgText,
          astSource: astText,
          updatedAt: Date.now(),
        };
        await putVaultCartridge(def as VaultCartridgeRecord);
        if (inMemoryCartridgesCache) {
          const idx = inMemoryCartridgesCache.findIndex((c) => c.id === canonical);
          if (idx >= 0) inMemoryCartridgesCache[idx] = def;
          else inMemoryCartridgesCache.push(def);
        }
        return def;
      }
    } catch (_) {}
  }

  // 5. Offline / air-gap fallback to cached vault entry or embedded core simulations
  if (staleFallback) return staleFallback;
  if (EMBEDDED_CORE_CARTRIDGES[canonical]) {
    const core = EMBEDDED_CORE_CARTRIDGES[canonical];
    const def: CartridgeDefinition = {
      id: canonical,
      title: canonical.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      stage: 'CURRICULUM',
      category: 'STEM',
      desc: 'Pre-expanded offline core vector simulation.',
      icon: '📐',
      source: 'builtin',
      seal: '',
      svgMarkup: core.svg,
      astSource: core.ast,
      updatedAt: Date.now(),
    };
    await putVaultCartridge(def as VaultCartridgeRecord);
    if (inMemoryCartridgesCache) {
      const idx = inMemoryCartridgesCache.findIndex((c) => c.id === canonical);
      if (idx >= 0) inMemoryCartridgesCache[idx] = def;
      else inMemoryCartridgesCache.push(def);
    }
    return def;
  }

  return null;
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
    const raw = getLocalState(STORAGE_KEY_CUSTOM_CARTRIDGES);
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
    'breadboard-components': '/curriculum/science/physics/breadboard-components',
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

  // 3. Synchronize compact index to IndexedDB app_state
  try {
    setLocalState(STORAGE_KEY_CUSTOM_CARTRIDGES, JSON.stringify(updated));
  } catch {}

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

  // 3. Synchronize compact index to IndexedDB app_state
  try {
    setLocalState(STORAGE_KEY_CUSTOM_CARTRIDGES, JSON.stringify(filtered));
  } catch (err) {
    console.error('[cartridgeStore] Failed to update cartridge state:', err);
  }

  window.dispatchEvent(new Event('cartridges_updated'));
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
 * and turns it into a reusable decentralized Cartridge.
 * Implementation lives in src/services/cartridgeImporter.ts.
 */
export async function importCartridgeFile(file: File): Promise<CartridgeDefinition> {
  return importCartridgeFileWithSaver(file, saveCustomCartridge);
}

/**
 * Creates a brand new cartridge from teacher/student form inputs.
 * Implementation lives in src/services/cartridgeImporter.ts.
 */
export function createCustomCartridge(input: CreateCustomCartridgeInput): CartridgeDefinition {
  return createCustomCartridgeWithSaver(input, saveCustomCartridge);
}
