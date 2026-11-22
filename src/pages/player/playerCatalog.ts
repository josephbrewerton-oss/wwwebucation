// src/pages/player/playerCatalog.ts
/**
 * Catalog metadata, subject/stage classification, recent-labs persistence,
 * dropdown HTML, cryptographic provenance readout, and launcher grid rendering
 * for the Interactive Media Player page.
 */

import { getSavedLanguage } from '../../engine/operational-language';
import { getLocalState, setLocalState } from '../../services/localStateStore';
import { PRESET_OPTIONS, type ScenePresetOption } from '../../data/player/generatedScenes';
import {
  getCustomCartridges,
  type CartridgeDefinition,
} from '../../services/cartridgeStore';
import {
  getRegisteredRecord,
  formatShortHash,
  getTotalCertifiedCartridges,
  CURRICULUM_AUTHORITY_NAME,
} from '../../utils/cartridgeIntegrity';

export const DEFAULT_PRESET_ID =
  PRESET_OPTIONS.find((p) => p.kind === 'lab' && p.isPlayableScene !== false)?.id || 'welcome';

export const EXTRA_DOC_PRESETS: ScenePresetOption[] = [
  {
    id: 'lumina-architecture',
    label: 'Lumina: Sovereign Architectural Manifesto (4-Chapter Show & Tell)',
    type: 'Slide',
    kind: 'doc',
    isPlayableScene: true,
    stage: 'FOUNDATIONAL SYSTEM ARCHITECTURE',
    subject: 'System Architecture',
    section: 'System Architecture & Docs',
  },
];

export const ALL_BUILTIN_PRESETS: ScenePresetOption[] = [...PRESET_OPTIONS, ...EXTRA_DOC_PRESETS];
export const VALID_PRESET_IDS = new Set(ALL_BUILTIN_PRESETS.map((p) => p.id));

export type SubjectFilterId =
  | 'All'
  | 'Science'
  | 'Maths'
  | 'Catholic'
  | 'English'
  | 'Computing'
  | 'Languages'
  | 'Geography';
export type FormatFilterId = 'All' | 'Sim' | 'Slide' | 'App' | 'Film' | '3D';
export type StageFilterId = 'All' | 'KS1' | 'KS2' | 'KS3' | 'KS4';

const RECENT_PRESETS_STORAGE_KEY = 'stj_player_recent_presets_v1';

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function normalizePresetId(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_PRESET_ID;
  if (raw === 'lumina-architecture-manifesto') return 'lumina-architecture';
  if (VALID_PRESET_IDS.has(raw)) return raw;
  try {
    const custom = getCustomCartridges();
    if (custom.some((c) => c.id === raw)) return raw;
  } catch (_) {}
  return DEFAULT_PRESET_ID;
}

export function buildPlayerSrc(
  base: string,
  presetId: string,
  bslActive: boolean,
  externalSrc?: string | null
): string {
  const perfHud = getLocalState('app_perf_hud_enabled') === 'true';
  const verbosity = getLocalState('app_hud_verbosity') || 'minimal';
  const budgetAlert = getLocalState('app_frame_budget_alert') === 'true';

  const params = new URLSearchParams({
    bsl: bslActive ? '1' : '0',
    mode: 'suite',
    tools: '1',
    all: '1',
  });
  if (externalSrc) {
    params.set('src', externalSrc);
  } else {
    params.set('preset', presetId);
  }

  if (perfHud) {
    params.set('hud', '1');
    params.set('hud_verbosity', verbosity);
    if (budgetAlert) params.set('budget_alert', '1');
  }

  const activeLang = getSavedLanguage();
  if (activeLang && activeLang !== 'en') {
    params.set('lang', activeLang);
  }

  return `${base}player.html?${params.toString()}`;
}

export function isNonMediaOrUtility(p: ScenePresetOption): boolean {
  if (p.kind === 'data' || p.kind === 'benchmark' || p.kind === 'doc') return true;
  if (p.isPlayableScene === false) return true;
  return p.subject === 'System Architecture';
}

export const CORE_PLAYABLE_LABS: ScenePresetOption[] = ALL_BUILTIN_PRESETS.filter(
  (p) => !isNonMediaOrUtility(p)
);
export const HIDDEN_EXTRAS_COUNT = ALL_BUILTIN_PRESETS.length - CORE_PLAYABLE_LABS.length;

export function isCatholicPreset(p: ScenePresetOption): boolean {
  const subj = (p.subject || '').toLowerCase();
  return (
    subj.includes('religious') ||
    subj === 'catholic life' ||
    p.stage === 'CATHOLIC LIFE' ||
    Boolean(p.section && p.section.includes('Catholic'))
  );
}

export function getNormalizedSubject(p: ScenePresetOption): SubjectFilterId {
  if (isCatholicPreset(p)) return 'Catholic';
  const subj = (p.subject || '').toLowerCase();
  if (subj.includes('science') || subj.includes('physics') || subj.includes('chem') || subj.includes('bio')) return 'Science';
  if (subj.includes('math')) return 'Maths';
  if (subj.includes('english') || subj.includes('phonics')) return 'English';
  if (subj.includes('comput') || subj.includes('design')) return 'Computing';
  if (subj.includes('language') || subj.includes('spanish') || subj.includes('french') || subj.includes('latin') || subj.includes('bsl') || subj.includes('sign')) return 'Languages';
  if (subj.includes('geograph')) return 'Geography';
  return 'All';
}

export function matchesKeyStage(p: ScenePresetOption, stageFilter: StageFilterId): boolean {
  if (stageFilter === 'All') return true;
  const raw = `${p.stage || ''} ${p.oakId || ''}`.toUpperCase();
  if (stageFilter === 'KS1') return raw.includes('EYFS') || raw.includes('KS1') || raw.includes('KEY STAGE 1') || raw.includes('EARLY YEARS');
  if (stageFilter === 'KS2') return raw.includes('KS2') || raw.includes('KEY STAGE 2') || raw.includes('WHOLE SCHOOL');
  if (stageFilter === 'KS3') return raw.includes('KS3') || raw.includes('KEY STAGE 3');
  if (stageFilter === 'KS4') return raw.includes('KS4') || raw.includes('GCSE') || raw.includes('A-LEVEL') || raw.includes('KEY STAGE 4');
  return true;
}

export function getRecentPresetIds(): string[] {
  try {
    const raw = getLocalState(RECENT_PRESETS_STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((id) => typeof id === 'string') : [];
  } catch (_) {
    return [];
  }
}

export function recordRecentPreset(id: string): void {
  if (!id || id.startsWith('__')) return;
  try {
    const prev = getRecentPresetIds().filter((x) => x !== id);
    const next = [id, ...prev].slice(0, 5);
    setLocalState(RECENT_PRESETS_STORAGE_KEY, JSON.stringify(next));
  } catch (_) {}
}

export function getCustomCartridgesList(): CartridgeDefinition[] {
  try {
    const custom = getCustomCartridges();
    return custom.filter((c) => !VALID_PRESET_IDS.has(c.id));
  } catch (_) {
    return [];
  }
}

export function getPresetMeta(id: string): ScenePresetOption {
  const found = ALL_BUILTIN_PRESETS.find((p) => p.id === id);
  if (found) return found;
  try {
    const custom = getCustomCartridges().find((c) => c.id === id);
    if (custom) {
      return {
        id: custom.id,
        label: custom.title,
        stage: custom.stage || 'LOCAL VAULT',
        type: (custom.type as any) || 'Sim',
        kind: 'lab',
        isPlayableScene: true,
        subject: custom.subject || 'Custom Ingestion',
      };
    }
  } catch (_) {}
  return ALL_BUILTIN_PRESETS[0];
}

export function getAllAvailablePresets(includeNonMediaExtras: boolean): ScenePresetOption[] {
  const customList: ScenePresetOption[] = getCustomCartridgesList().map((c) => ({
    id: c.id,
    label: c.title,
    stage: c.stage || 'LOCAL VAULT',
    type: (c.type as any) || 'Sim',
    kind: 'lab',
    isPlayableScene: true,
    subject: c.subject || 'Custom Ingested',
  }));
  const baseList = includeNonMediaExtras ? ALL_BUILTIN_PRESETS : CORE_PLAYABLE_LABS;
  return [...customList, ...baseList];
}

export function buildOptionsHtml(selectedId: string): string {
  const customList = getCustomCartridgesList();
  const customGroupHtml = customList.length > 0 ? `
    <optgroup label="💾 Local Ingested Cartridges" style="background:#0f172a; color:#a78bfa;">
      ${customList.map((c) => `<option value="${escapeHtml(c.id)}" ${c.id === selectedId ? 'selected' : ''}>${escapeHtml(c.title)} (${escapeHtml(c.stage || 'LOCAL')})</option>`).join('')}
    </optgroup>
  ` : '';

  const dropdownLabs = CORE_PLAYABLE_LABS.filter((p) => !p.id.startsWith('phet-'));
  const phetLabs = CORE_PLAYABLE_LABS.filter((p) => p.id.startsWith('phet-'));

  const scienceOpts = dropdownLabs.filter((p) => getNormalizedSubject(p) === 'Science');
  const mathOpts = dropdownLabs.filter((p) => getNormalizedSubject(p) === 'Maths');
  const catholicOpts = dropdownLabs.filter((p) => getNormalizedSubject(p) === 'Catholic');
  const englishOpts = dropdownLabs.filter((p) => getNormalizedSubject(p) === 'English');
  const computingOpts = dropdownLabs.filter((p) => getNormalizedSubject(p) === 'Computing');
  const languageOpts = dropdownLabs.filter((p) => getNormalizedSubject(p) === 'Languages');
  const geoOtherOpts = dropdownLabs.filter((p) => {
    const s = getNormalizedSubject(p);
    return s === 'Geography' || s === 'All';
  });

  const renderOpts = (arr: ScenePresetOption[]) =>
    arr.map((p) => `<option value="${escapeHtml(p.id)}" ${p.id === selectedId ? 'selected' : ''}>${escapeHtml(p.label)} · ${escapeHtml(p.type)} (${escapeHtml(p.stage)})</option>`).join('');

  // Preserve deep-linked utility/data preset in dropdown if directly selected via URL
  const selectedPreset = ALL_BUILTIN_PRESETS.find((p) => p.id === selectedId);
  const activeExtraHtml = selectedPreset && isNonMediaOrUtility(selectedPreset)
    ? `<optgroup label="📎 Active Reference / Benchmark" style="background:#0f172a; color:#cbd5e1;">
        <option value="${escapeHtml(selectedPreset.id)}" selected>${escapeHtml(selectedPreset.label)} (${escapeHtml(selectedPreset.stage)})</option>
      </optgroup>`
    : '';

  return `
    ${customGroupHtml}
    ${activeExtraHtml}
    <optgroup label="🔬 Sciences (Physics, Chemistry &amp; Biology)" style="background:#0f172a; color:#38bdf8;">
      ${renderOpts(scienceOpts)}
    </optgroup>
    <optgroup label="📐 Mathematics &amp; Geometry" style="background:#0f172a; color:#34d399;">
      ${renderOpts(mathOpts)}
    </optgroup>
    <optgroup label="✝️ Catholic Faith &amp; Liturgy" style="background:#0f172a; color:#fde047;">
      ${renderOpts(catholicOpts)}
    </optgroup>
    <optgroup label="📖 English, Literature &amp; Phonics" style="background:#0f172a; color:#fbbf24;">
      ${renderOpts(englishOpts)}
    </optgroup>
    <optgroup label="💻 Computing &amp; Design Technology" style="background:#0f172a; color:#c084fc;">
      ${renderOpts(computingOpts)}
    </optgroup>
    <optgroup label="🗣️ Languages &amp; BSL" style="background:#0f172a; color:#f472b6;">
      ${renderOpts(languageOpts)}
    </optgroup>
    <optgroup label="🌍 Geography &amp; Portal Showcase" style="background:#0f172a; color:#60a5fa;">
      ${renderOpts(geoOtherOpts)}
    </optgroup>
    <optgroup label="⚛️ PhET Distillations" style="background:#0f172a; color:#38bdf8;">
      ${renderOpts(phetLabs)}
      <option value="__open_local__">📥 Import Local PhET (.html / .phet) or SWF...</option>
    </optgroup>
    <optgroup label="🔍 Discovery" style="background:#0f172a; color:#94a3b8;">
      <option value="__custom_find__">🔍 Search &amp; Filter All Labs Below...</option>
    </optgroup>
  `;
}

export function buildIntegrityReadoutHtml(
  presetId: string,
  liveInfo?: Record<string, any> | null
): string {
  const rec = getRegisteredRecord(presetId);
  const status = liveInfo?.status || (rec ? 'verified-native' : 'unverified-external');
  const astbHash = liveInfo?.computedAstbSha256 || rec?.astbSha256 || '';
  const astHash = liveInfo?.computedAstSha256 || rec?.astSha256 || '';
  const svgHash = liveInfo?.computedSvgSha256 || rec?.svgSha256 || '';
  const sealHash = liveInfo?.seal || rec?.seal || '';

  if (status === 'verified-native') {
    return `
      <span style="color:#34d399; font-weight:800;">🛡️ VERIFIED • ST JOSEPH'S CURRICULUM</span>
      <span>Authority: <strong style="color:#f8fafc;">${escapeHtml(liveInfo?.authority || CURRICULUM_AUTHORITY_NAME)}</strong></span>
      ${sealHash ? `<span>Seal: <code style="color:#38bdf8;">${escapeHtml(formatShortHash(sealHash))}</code></span>` : ''}
      ${astbHash ? `<span>.astb: <code style="color:#a7f3d0;">${escapeHtml(formatShortHash(astbHash))}</code></span>` : ''}
      ${astHash ? `<span>.ast: <code style="color:#cbd5e1;">${escapeHtml(formatShortHash(astHash))}</code></span>` : ''}
      ${svgHash ? `<span>.svg: <code style="color:#cbd5e1;">${escapeHtml(formatShortHash(svgHash))}</code></span>` : ''}
    `;
  }
  if (status === 'tampered') {
    return `
      <span style="color:#fbbf24; font-weight:800;">✎ ALTERED / REMIXED CARTRIDGE</span>
      <span>Live SHA-256: <code style="color:#fde68a;">${escapeHtml(liveInfo?.shortHash || 'modified')}</code></span>
      ${sealHash ? `<span>Original Seal: <code style="color:#94a3b8;">${escapeHtml(formatShortHash(sealHash))}</code></span>` : ''}
      <span style="color:#94a3b8;">Content differs from signed St Joseph's Curriculum pair</span>
    `;
  }
  return `
    <span style="color:#cbd5e1; font-weight:800;">◈ CUSTOM / EXTERNAL CARTRIDGE</span>
    <span>ID: <code style="color:#38bdf8;">${escapeHtml(presetId)}</code></span>
    ${liveInfo?.shortHash ? `<span>SHA-256: <code style="color:#cbd5e1;">${escapeHtml(String(liveInfo.shortHash))}</code></span>` : ''}
    <span style="color:#94a3b8;">Not in St Joseph's Curriculum signed registry (${getTotalCertifiedCartridges()} certified)</span>
  `;
}

export function buildCatalogGridHtml(params: {
  filtered: ScenePresetOption[];
  isStageOpen: boolean;
  activePreset: string;
  activeSubject: SubjectFilterId;
}): string {
  const { filtered, isStageOpen, activePreset, activeSubject } = params;
  if (filtered.length === 0) {
    return `<div style="text-align:center; padding:2.5rem 1rem; color:#64748b; border:1px dashed #cbd5e1; border-radius:12px;">No matching labs found for your active filters.</div>`;
  }

  const customIds = new Set(
    getCustomCartridges()
      .filter((c) => c.source !== 'builtin')
      .map((c) => c.id)
  );

  const renderCardHtml = (p: ScenePresetOption) => {
    const isSelected = isStageOpen && p.id === activePreset;
    const subjLabel = p.subject || 'Curriculum';
    const kindSuffix =
      p.kind === 'data'
        ? ' · Recall Data Pack'
        : p.kind === 'benchmark'
          ? ' · Benchmark'
          : p.kind === 'doc'
            ? ' · Architecture Doc'
            : '';
    const formatLabel = p.has3D ? `${p.type || 'Sim'} (3D)` : (p.type || 'Sim');
    const officialRec = getRegisteredRecord(p.id);
    const isModifiedCustom = Boolean(officialRec && customIds.has(p.id));
    const sealBadgeHtml = isModifiedCustom
      ? `<span title="Altered local remix of St Joseph's Curriculum cartridge (${escapeHtml(p.id)})" style="font-family:monospace; font-size:0.68rem; font-weight:700; padding:1px 6px; border-radius:4px; background:#fef3c7; color:#92400e; border:1px solid #fcd34d;">✎ Remix</span>`
      : officialRec
        ? `<span title="Verified St Joseph's Curriculum Cartridge • Seal SHA-256: ${escapeHtml(officialRec.seal)}" style="font-family:monospace; font-size:0.68rem; font-weight:700; padding:1px 6px; border-radius:4px; background:#ecfdf5; color:#047857; border:1px solid #a7f3d0;">🛡️ St Joseph's • ${escapeHtml(officialRec.seal.slice(0, 6))}</span>`
        : `<span title="Custom or Architecture Cartridge" style="font-family:monospace; font-size:0.68rem; font-weight:700; padding:1px 6px; border-radius:4px; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;">◈ Custom</span>`;
    return `
      <div
        class="cartridge-card"
        role="button"
        tabindex="0"
        data-id="${escapeHtml(p.id)}"
        style="padding:13px 15px; border-radius:10px; border:1px solid ${isSelected ? '#0284c7' : '#e2e8f0'}; background:${isSelected ? '#f0f9ff' : '#ffffff'}; cursor:pointer; display:flex; flex-direction:column; justify-content:space-between; gap:10px; transition:border-color 0.15s ease, box-shadow 0.15s ease;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:5px;">
            <div style="font-size:0.72rem; color:#64748b; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${escapeHtml(formatLabel)} &middot; ${escapeHtml(subjLabel)} &middot; ${escapeHtml(p.stage)}${escapeHtml(kindSuffix)}
            </div>
            ${sealBadgeHtml}
          </div>
          <strong style="display:block; font-size:0.9rem; color:#0f172a; line-height:1.35;">${escapeHtml(p.label)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.76rem;">
          <span style="color:${isSelected ? '#0369a1' : '#0284c7'}; font-weight:700;">${isSelected ? '▶ Currently Loaded' : 'Launch Lab &rarr;'}</span>
          ${p.hasCheckpoints && p.checkpointCount ? `<span style="color:#64748b; font-variant-numeric:tabular-nums;">${p.checkpointCount} checks</span>` : ''}
        </div>
      </div>
    `;
  };

  type SubjectBucketKey = Exclude<SubjectFilterId, 'All'> | 'Custom' | 'Other';
  const SUBJECT_SECTIONS: {
    key: SubjectBucketKey;
    filterId?: SubjectFilterId;
    icon: string;
    title: string;
    subtitle: string;
    accent: string;
    bg: string;
    border: string;
  }[] = [
    { key: 'Science', filterId: 'Science', icon: '🔬', title: 'Science', subtitle: 'Physics, Chemistry & Biology', accent: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
    { key: 'Maths', filterId: 'Maths', icon: '📐', title: 'Mathematics', subtitle: 'Number, Algebra & Geometry', accent: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
    { key: 'Catholic', filterId: 'Catholic', icon: '✝️', title: 'Catholic Faith & Liturgy', subtitle: 'Sacraments, Scripture & Formation', accent: '#b45309', bg: '#fffbeb', border: '#fde68a' },
    { key: 'English', filterId: 'English', icon: '📖', title: 'English & Phonics', subtitle: 'Decodable Readers, Phonics & Literature', accent: '#c2410c', bg: '#fff7ed', border: '#fed7aa' },
    { key: 'Computing', filterId: 'Computing', icon: '💻', title: 'Computing & D&T', subtitle: 'Systems, Engineering & Logic', accent: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
    { key: 'Languages', filterId: 'Languages', icon: '🗣️', title: 'Languages & BSL', subtitle: 'Modern Languages & British Sign Language', accent: '#be185d', bg: '#fdf2f8', border: '#fbcfe8' },
    { key: 'Geography', filterId: 'Geography', icon: '🌍', title: 'Geography', subtitle: 'Earth, Elevation & Water Systems', accent: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
    { key: 'Custom', icon: '💾', title: 'Local Vault & Imported Files', subtitle: 'Your locally loaded cartridges', accent: '#334155', bg: '#f8fafc', border: '#cbd5e1' },
    { key: 'Other', icon: '📎', title: 'Portal Showcase, Benchmarks & Docs', subtitle: 'Architecture, recall packs & utilities', accent: '#475569', bg: '#f8fafc', border: '#cbd5e1' },
  ];

  const grouped = new Map<SubjectBucketKey, ScenePresetOption[]>();
  for (const p of filtered) {
    let bucket: SubjectBucketKey;
    if (!VALID_PRESET_IDS.has(p.id)) {
      bucket = 'Custom';
    } else {
      const norm = getNormalizedSubject(p);
      bucket = norm === 'All' ? 'Other' : norm;
    }
    const list = grouped.get(bucket);
    if (list) list.push(p);
    else grouped.set(bucket, [p]);
  }

  const visibleSections = SUBJECT_SECTIONS.filter((sec) => (grouped.get(sec.key)?.length || 0) > 0);
  const isSingleSubjectFocus = activeSubject !== 'All';

  return visibleSections.map((sec) => {
    const items = grouped.get(sec.key) || [];
    const countLabel = `${items.length} ${items.length === 1 ? 'lab' : 'labs'}`;
    const actionBtnHtml = !isSingleSubjectFocus && sec.filterId
      ? `<button type="button" class="subject-focus-btn" data-focus-subject="${sec.filterId}" style="padding:4px 10px; border-radius:6px; border:1px solid ${sec.border}; background:#ffffff; color:${sec.accent}; font-size:0.74rem; font-weight:700; cursor:pointer; white-space:nowrap;">Focus Subject &rarr;</button>`
      : isSingleSubjectFocus
        ? `<button type="button" class="subject-focus-btn" data-focus-subject="All" style="padding:4px 10px; border-radius:6px; border:1px solid #cbd5e1; background:#ffffff; color:#334155; font-size:0.74rem; font-weight:700; cursor:pointer; white-space:nowrap;">&larr; All Subjects</button>`
        : '';

    return `
      <details open class="subject-breakdown-group" data-subject-group="${sec.key}" style="border:1px solid #e2e8f0; border-radius:12px; background:#ffffff; overflow:hidden;">
        <summary style="list-style:none; cursor:pointer; padding:11px 15px; background:${sec.bg}; border-bottom:1px solid ${sec.border}; border-left:4px solid ${sec.accent}; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; user-select:none;">
          <div style="display:flex; align-items:center; gap:9px; min-width:0;">
            <span style="font-size:1.15rem; line-height:1;" aria-hidden="true">${sec.icon}</span>
            <div>
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <strong style="font-size:0.95rem; color:#0f172a;">${escapeHtml(sec.title)}</strong>
                <span style="font-size:0.72rem; font-weight:800; padding:1px 8px; border-radius:9999px; background:#ffffff; color:${sec.accent}; border:1px solid ${sec.border}; font-variant-numeric:tabular-nums;">
                  ${countLabel}
                </span>
              </div>
              <div style="font-size:0.76rem; color:#64748b; margin-top:1px;">${escapeHtml(sec.subtitle)}</div>
            </div>
          </div>
          <span style="font-size:0.72rem; color:#64748b; font-weight:700;" aria-hidden="true">▾</span>
        </summary>
        ${actionBtnHtml ? `<div style="padding:8px 14px; background:#ffffff; border-bottom:1px solid #e2e8f0; display:flex; justify-content:flex-end;">${actionBtnHtml}</div>` : ''}
        <div style="padding:14px; display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px; background:#f8fafc;">
          ${items.map(renderCardHtml).join('')}
        </div>
      </details>
    `;
  }).join('');
}
