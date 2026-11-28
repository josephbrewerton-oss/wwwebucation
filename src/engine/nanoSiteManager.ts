// src/engine/nanoSiteManager.ts
/**
 * St Joseph's Curriculum Portal — Gemini Nano & WebMCP Site Control Plane
 *
 * Unifies site routing, catalog discovery, shared render-boundary telemetry
 * (`static/player/ast-render-boundary.js`), and the `448 KiB` Everyman WASM Kernel
 * behind a compact (< 2.5 KB) JSON manifest and typed action dispatcher so on-device
 * Gemini Nano (`window.LanguageModel` + WebMCP) can inspect and steer the whole site
 * without scraping HTML/DOM trees.
 */

import { getSharedRenderBoundary, type RenderMode } from './sharedRenderBoundary';
import type { EverymanBios } from './everymanBios';
import { getAllCartridges } from '../services/cartridgeStore';
import { setBslEnabled, getBslEnabled } from '../services/bslGlobalStore';
import { setSoundEnabled, isSoundEnabled } from '../services/soundHaptics';
import { getBaseUrl } from '../utils/url';
import {
  validateStudentInput,
  sanitizeAiOutput,
  CHILD_SAFEGUARDING_SYSTEM_PROMPT,
} from '../services/childSafetyFilter';
import { hasUserGrantedAiConsent } from './nanoAvailability';
import { compileTupleMatcher, freezePattern, type PatternNode } from '../utils/safePatternKernel';

export type SiteRouteNavigator = (path: string) => void | Promise<void>;

export type NanoSiteAction =
  | 'read_manifest'
  | 'navigate'
  | 'load_cartridge'
  | 'set_render_mode'
  | 'dispatch_tuple'
  | 'set_var'
  | 'highlight_target'
  | 'toggle_bsl'
  | 'toggle_sound'
  | 'open_tutor';

/** Strict allowlist of host site actions that an AST cartridge may request via SITE_DIRECTIVE. */
export const CARTRIDGE_ALLOWED_SITE_ACTIONS: ReadonlySet<NanoSiteAction> = new Set<NanoSiteAction>([
  'navigate',
  'load_cartridge',
  'toggle_bsl',
  'toggle_sound',
  'open_tutor',
  'set_render_mode',
  'highlight_target',
]);

export interface NanoSiteDirective {
  action: NanoSiteAction;
  route?: string;
  presetId?: string;
  autoplay?: boolean;
  surfaceId?: string;
  mode?: RenderMode;
  slotId?: number;
  op?: number;
  arg1?: number;
  arg2?: number;
  name?: string;
  value?: number;
  selector?: string;
  enabled?: boolean;
  prompt?: string;
}

export interface NanoSiteManifest {
  schemaVersion: 'stj-nano-site/1.0';
  site: {
    name: string;
    version: string;
    currentRoute: string;
    routes: string[];
  };
  renderBoundary: ReturnType<ReturnType<typeof getSharedRenderBoundary>['getSnapshot']>;
  wasmKernel: {
    active: boolean;
    surfaceId: string | null;
    stateHex: string;
    t: number;
    isPlaying: boolean;
    varCount: number;
    displayListCount: number;
    manifestSlice: Array<{
      s: number;
      st: string;
      k: string;
      tag: string;
      val: number;
    }>;
  } | null;
  catalog: {
    total: number;
    featuredIds: string[];
  };
}

export interface PlayerBridgeAdapter {
  loadPreset: (presetId: string, autoplay?: boolean) => void;
  setVar?: (name: string, value: number) => void;
  highlight?: (selector: string) => void;
  openTutor?: (prompt?: string) => void;
  getActivePreset?: () => string;
}

const VALID_ROUTES = [
  '/',
  '/player',
  '/media-player',
  '/catholic-life',
  '/practice-lab',
  '/learning-zone',
  '/revision',
  '/curriculum-studio',
  '/phonics',
  '/languages',
  '/bsl',
  '/shakespeare',
  '/overseas-curriculums',
  '/teacher-beacon',
  '/news',
  '/licensing',
  '/privacy',
  '/child-safety',
  '/profile',
  '/settings',
];

const ALL_VALID_SITE_ACTIONS: ReadonlySet<NanoSiteAction> = new Set<NanoSiteAction>([
  'read_manifest',
  'navigate',
  'load_cartridge',
  'set_render_mode',
  'dispatch_tuple',
  'set_var',
  'highlight_target',
  'toggle_bsl',
  'toggle_sound',
  'open_tutor',
]);

const VALID_ROUTE_SET: ReadonlySet<string> = new Set(VALID_ROUTES);

const IDENT_CHARS: PatternNode = freezePattern(['set', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-']);
const ALPHA_UNDER: PatternNode = freezePattern(['set', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_']);
const ALNUM: PatternNode = freezePattern(['set', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789']);

const SAFE_PRESET_ID_MATCHER = compileTupleMatcher(
  'site:presetId',
  freezePattern([
    'seq',
    [['anchor', 'start'], ALNUM, ['rep', IDENT_CHARS, 0, 32], ['rep', IDENT_CHARS, 0, 31], ['anchor', 'end']],
  ]),
  ''
);

const SAFE_VAR_NAME_MATCHER = compileTupleMatcher(
  'site:varName',
  freezePattern([
    'seq',
    [['anchor', 'start'], ALPHA_UNDER, ['rep', IDENT_CHARS, 0, 32], ['rep', IDENT_CHARS, 0, 31], ['anchor', 'end']],
  ]),
  ''
);

const SAFE_SELECTOR_MATCHER = compileTupleMatcher(
  'site:selector',
  freezePattern([
    'seq',
    [['anchor', 'start'], ['lit', '#'], ALPHA_UNDER, ['rep', IDENT_CHARS, 0, 32], ['rep', IDENT_CHARS, 0, 31], ['anchor', 'end']],
  ]),
  ''
);

const SAFE_SURFACE_ID_MATCHER = compileTupleMatcher(
  'site:surfaceId',
  freezePattern([
    'seq',
    [['anchor', 'start'], IDENT_CHARS, ['rep', IDENT_CHARS, 0, 32], ['rep', IDENT_CHARS, 0, 31], ['anchor', 'end']],
  ]),
  ''
);

const ALLOWED_TUPLE_OPS: ReadonlySet<number> = new Set([1, 2, 3, 4, 5, 6, 7]);
const MAX_SAFE_NUMERIC_ARG = 1_000_000;
const MAX_SLOT_ID = 1023;
const MAX_GOAL_CHARS = 400;

export type DirectiveValidationResult =
  | { ok: true; directive: NanoSiteDirective }
  | { ok: false; reason: string; blockedBySafety?: boolean; category?: string; safeMessage?: string };

/**
 * Deterministic structural validator for all Ask Nano / WebMCP / cartridge site directives.
 * Enforces explicit allowlists and finite bounds before any state mutation occurs.
 */
export function validateSiteDirective(raw: unknown): DirectiveValidationResult {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, reason: 'Directive must be a plain object' };
  }
  const d = raw as Record<string, unknown>;
  const action = typeof d.action === 'string' ? d.action.trim() : '';
  if (!action || !ALL_VALID_SITE_ACTIONS.has(action as NanoSiteAction)) {
    return { ok: false, reason: `Unsupported action: ${action || '(empty)'}` };
  }

  let surfaceId: string | undefined;
  if (d.surfaceId !== undefined && d.surfaceId !== null && d.surfaceId !== '') {
    if (typeof d.surfaceId !== 'string' || !SAFE_SURFACE_ID_MATCHER(d.surfaceId.trim())) {
      return { ok: false, reason: 'Invalid surfaceId' };
    }
    surfaceId = d.surfaceId.trim();
  }

  switch (action as NanoSiteAction) {
    case 'read_manifest':
      return { ok: true, directive: { action: 'read_manifest', surfaceId } };

    case 'navigate': {
      const route = typeof d.route === 'string' ? d.route.trim() : '';
      if (!route || !VALID_ROUTE_SET.has(route)) {
        return { ok: false, reason: `Route not in hypervisor allowlist: ${route || '(empty)'}` };
      }
      return { ok: true, directive: { action: 'navigate', route, surfaceId } };
    }

    case 'load_cartridge': {
      const presetId = typeof d.presetId === 'string' ? d.presetId.trim() : '';
      if (!presetId || !SAFE_PRESET_ID_MATCHER(presetId)) {
        return { ok: false, reason: 'Invalid or missing presetId' };
      }
      return {
        ok: true,
        directive: {
          action: 'load_cartridge',
          presetId,
          autoplay: typeof d.autoplay === 'boolean' ? d.autoplay : undefined,
          surfaceId,
        },
      };
    }

    case 'set_render_mode': {
      if (d.mode !== 'svg' && d.mode !== 'canvas' && d.mode !== 'hybrid') {
        return { ok: false, reason: `Invalid render mode: ${String(d.mode)}` };
      }
      return { ok: true, directive: { action: 'set_render_mode', mode: d.mode, surfaceId } };
    }

    case 'dispatch_tuple': {
      const slotId = d.slotId === undefined ? 0 : Number(d.slotId);
      const op = d.op === undefined ? 6 : Number(d.op);
      const arg1 = d.arg1 === undefined ? 0 : Number(d.arg1);
      const arg2 = d.arg2 === undefined ? 0 : Number(d.arg2);
      if (!Number.isInteger(slotId) || slotId < 0 || slotId > MAX_SLOT_ID) {
        return { ok: false, reason: `slotId out of bounds [0..${MAX_SLOT_ID}]` };
      }
      if (!Number.isInteger(op) || !ALLOWED_TUPLE_OPS.has(op)) {
        return { ok: false, reason: `Opcode ${String(op)} not in WASM allowlist (1..7)` };
      }
      if (
        !Number.isFinite(arg1) ||
        !Number.isFinite(arg2) ||
        Math.abs(arg1) > MAX_SAFE_NUMERIC_ARG ||
        Math.abs(arg2) > MAX_SAFE_NUMERIC_ARG
      ) {
        return { ok: false, reason: 'Tuple numeric arguments must be finite and within safe bounds' };
      }
      return {
        ok: true,
        directive: { action: 'dispatch_tuple', slotId, op, arg1, arg2, surfaceId },
      };
    }

    case 'set_var': {
      const name = typeof d.name === 'string' ? d.name.trim() : '';
      const value = Number(d.value);
      if (!name || !SAFE_VAR_NAME_MATCHER(name)) {
        return { ok: false, reason: 'Invalid variable name' };
      }
      if (!Number.isFinite(value) || Math.abs(value) > MAX_SAFE_NUMERIC_ARG) {
        return { ok: false, reason: 'Variable value must be a finite number within safe bounds' };
      }
      return { ok: true, directive: { action: 'set_var', name, value, surfaceId } };
    }

    case 'highlight_target': {
      const selector = typeof d.selector === 'string' ? d.selector.trim() : '';
      if (!selector || !SAFE_SELECTOR_MATCHER(selector)) {
        return { ok: false, reason: `Unsafe selector rejected: ${selector || '(empty)'}` };
      }
      return { ok: true, directive: { action: 'highlight_target', selector, surfaceId } };
    }

    case 'toggle_bsl':
      return {
        ok: true,
        directive: {
          action: 'toggle_bsl',
          enabled: typeof d.enabled === 'boolean' ? d.enabled : undefined,
          surfaceId,
        },
      };

    case 'toggle_sound':
      return {
        ok: true,
        directive: {
          action: 'toggle_sound',
          enabled: typeof d.enabled === 'boolean' ? d.enabled : undefined,
          surfaceId,
        },
      };

    case 'open_tutor': {
      let safePrompt: string | undefined;
      if (typeof d.prompt === 'string' && d.prompt.trim().length > 0) {
        const rawPrompt = d.prompt.trim().slice(0, MAX_GOAL_CHARS);
        const safety = validateStudentInput(rawPrompt);
        if (!safety.isSafe) {
          return {
            ok: false,
            reason: safety.reason || 'Tutor prompt blocked by child safety policy',
            blockedBySafety: true,
            category: safety.category,
            safeMessage: safety.safeReplacementText,
          };
        }
        safePrompt = sanitizeAiOutput(rawPrompt, 'your lesson').slice(0, MAX_GOAL_CHARS);
      }
      return { ok: true, directive: { action: 'open_tutor', prompt: safePrompt, surfaceId } };
    }
  }
}

const DIRECTIVE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: [
        'read_manifest',
        'navigate',
        'load_cartridge',
        'set_render_mode',
        'dispatch_tuple',
        'set_var',
        'highlight_target',
        'toggle_bsl',
        'toggle_sound',
        'open_tutor',
      ],
    },
    route: { type: 'string' },
    presetId: { type: 'string' },
    mode: { type: 'string', enum: ['svg', 'canvas', 'hybrid'] },
    surfaceId: { type: 'string' },
    slotId: { type: 'number' },
    op: { type: 'number' },
    arg1: { type: 'number' },
    arg2: { type: 'number' },
    name: { type: 'string' },
    value: { type: 'number' },
    selector: { type: 'string' },
    enabled: { type: 'boolean' },
    prompt: { type: 'string' },
  },
  required: ['action'],
};

let boundNavigator: SiteRouteNavigator | null = null;
let boundPlayerBridge: PlayerBridgeAdapter | null = null;
let activeNanoAbortController: AbortController | null = null;
const registeredNanoToolNames: string[] = [];

export function bindSiteNavigator(nav: SiteRouteNavigator | null): void {
  boundNavigator = nav;
}

export function bindSitePlayerAdapter(adapter: PlayerBridgeAdapter | null): void {
  boundPlayerBridge = adapter;
}

function getActiveBiosFromBoundary(surfaceId?: string): { surfaceId: string; bios: EverymanBios } | null {
  try {
    const boundary = getSharedRenderBoundary();
    const preferred = boundary.getSurface(surfaceId);
    if (preferred && preferred.bios && (preferred.bios as EverymanBios).ready) {
      return { surfaceId: preferred.id, bios: preferred.bios as EverymanBios };
    }
    const all = boundary.listSurfaces();
    for (const s of all) {
      const full = boundary.getSurface(s.id);
      if (full && full.bios && (full.bios as EverymanBios).ready) {
        return { surfaceId: full.id, bios: full.bios as EverymanBios };
      }
    }
  } catch (_) {}
  return null;
}

/**
 * Emits a strictly bounded (< 2.5 KB) site + shared render-boundary + WASM kernel manifest
 * tailored for Gemini Nano's local context window.
 */
export function getSiteManifest(surfaceId?: string): NanoSiteManifest {
  const boundary = getSharedRenderBoundary();
  const renderSnapshot = boundary.getSnapshot(surfaceId);
  const activeBios = getActiveBiosFromBoundary(surfaceId);

  let wasmKernel: NanoSiteManifest['wasmKernel'] = null;
  if (activeBios) {
    const tel = activeBios.bios.readTelemetry();
    const rows = activeBios.bios.readManifest().slice(0, 14);
    wasmKernel = {
      active: true,
      surfaceId: activeBios.surfaceId,
      stateHex: tel.stateHex,
      t: tel.t,
      isPlaying: tel.isPlaying,
      varCount: tel.varCount,
      displayListCount: tel.displayListCount,
      manifestSlice: rows.map((r) => ({
        s: r.slotId,
        st: r.stageState,
        k: r.kind,
        tag: r.semanticTag,
        val: Number(Number(r.value).toFixed(3)),
      })),
    };
  }

  let catalogTotal = 0;
  let featuredIds: string[] = [];
  try {
    const all = getAllCartridges();
    catalogTotal = all.length;
    featuredIds = all.slice(0, 12).map((c) => c.id);
  } catch (_) {}

  const currentRoute =
    typeof window !== 'undefined' && window.location ? window.location.pathname || '/' : '/';

  return {
    schemaVersion: 'stj-nano-site/1.0',
    site: {
      name: "St Joseph's Curriculum Portal",
      version: '1.0.0',
      currentRoute,
      routes: VALID_ROUTES,
    },
    renderBoundary: renderSnapshot,
    wasmKernel,
    catalog: {
      total: catalogTotal,
      featuredIds,
    },
  };
}

/**
 * Deterministic dispatcher for Nano/WebMCP site management directives.
 */
export async function executeSiteDirective(
  directive: NanoSiteDirective,
  explicitNavigator?: SiteRouteNavigator
): Promise<{
  ok: boolean;
  action: NanoSiteAction;
  detail: Record<string, any>;
  manifest: NanoSiteManifest;
}> {
  const validated = validateSiteDirective(directive);
  if (!validated.ok) {
    const fallbackAction: NanoSiteAction =
      directive && typeof directive.action === 'string' && ALL_VALID_SITE_ACTIONS.has(directive.action)
        ? directive.action
        : 'read_manifest';
    return {
      ok: false,
      action: fallbackAction,
      detail: {
        reason: validated.reason,
        ...(validated.blockedBySafety
          ? {
              blockedBySafety: true,
              category: validated.category,
              safeMessage: validated.safeMessage,
            }
          : {}),
      },
      manifest: getSiteManifest(),
    };
  }

  const validDir = validated.directive;
  const boundary = getSharedRenderBoundary();
  const nav = explicitNavigator || boundNavigator;
  const detail: Record<string, any> = {};
  let ok = true;

  switch (validDir.action) {
    case 'read_manifest': {
      detail.note = 'Returned current site and render boundary manifest';
      break;
    }

    case 'navigate': {
      const targetRoute = validDir.route!;
      if (nav) {
        await nav(targetRoute);
        detail.navigatedTo = targetRoute;
      } else if (typeof window !== 'undefined' && window.location) {
        const base = getBaseUrl();
        const url = targetRoute === '/' ? base : `${base}${targetRoute.replace(/^\//, '')}`;
        window.history.pushState({}, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
        detail.navigatedTo = targetRoute;
      } else {
        ok = false;
        detail.reason = 'No router available in current environment';
      }
      break;
    }

    case 'load_cartridge': {
      const presetId = validDir.presetId!;
      if (boundPlayerBridge) {
        boundPlayerBridge.loadPreset(presetId, Boolean(validDir.autoplay));
        detail.loadedVia = 'active-player-adapter';
        detail.presetId = presetId;
      } else if (nav) {
        await nav(`/player?preset=${encodeURIComponent(presetId)}`);
        detail.loadedVia = 'router-navigation';
        detail.presetId = presetId;
      } else if (typeof window !== 'undefined') {
        const base = getBaseUrl();
        window.location.href = `${base}player?preset=${encodeURIComponent(presetId)}`;
        detail.loadedVia = 'location-navigation';
        detail.presetId = presetId;
      } else {
        ok = false;
        detail.reason = 'No active player or navigator';
      }
      break;
    }

    case 'set_render_mode': {
      const nextMode: RenderMode = validDir.mode!;
      const res = boundary.setRenderMode(validDir.surfaceId, nextMode);
      ok = res.ok;
      Object.assign(detail, res);
      break;
    }

    case 'dispatch_tuple': {
      const targetBios = getActiveBiosFromBoundary(validDir.surfaceId);
      if (!targetBios) {
        ok = false;
        detail.reason = 'No active Everyman WASM Kernel mounted on Shared Render Boundary';
        break;
      }
      const slotId = validDir.slotId ?? 0;
      const op = validDir.op ?? 6;
      const arg1 = validDir.arg1 ?? 0;
      const arg2 = validDir.arg2 ?? 0;
      const rc = targetBios.bios.dispatchTuple(slotId, op, arg1, arg2);
      ok = rc >= 0;
      detail.surfaceId = targetBios.surfaceId;
      detail.returnCode = rc;
      detail.stateHex = targetBios.bios.readStateHex();
      break;
    }

    case 'set_var': {
      const varName = validDir.name!;
      const varVal = validDir.value!;
      const targetBios = getActiveBiosFromBoundary(validDir.surfaceId);
      let matchedKernel = false;
      if (targetBios) {
        const rows = targetBios.bios.readManifest();
        const match = rows.find((r) => r.kind === 'var' && r.semanticTag === varName);
        if (match) {
          targetBios.bios.dispatchTuple(match.slotId, 4, varVal, 0);
          detail.updatedKernelSlot = match.slotId;
          matchedKernel = true;
        }
      }
      if (boundPlayerBridge?.setVar) {
        boundPlayerBridge.setVar(varName, varVal);
        detail.updatedPlayerVar = varName;
      } else if (!matchedKernel) {
        ok = false;
        detail.reason = `Variable "${varName}" not found in active manifest or player adapter`;
        break;
      }
      detail.name = varName;
      detail.value = varVal;
      break;
    }

    case 'highlight_target': {
      const sel = validDir.selector!;
      const hl = boundary.highlightTarget(sel, 2400, validDir.surfaceId);
      ok = hl.ok;
      Object.assign(detail, hl);
      // Only forward to player bridge if render boundary accepted the selector
      if (hl.ok && boundPlayerBridge?.highlight) {
        boundPlayerBridge.highlight(sel);
      }
      break;
    }

    case 'toggle_bsl': {
      const nextBsl = typeof validDir.enabled === 'boolean' ? validDir.enabled : !getBslEnabled();
      setBslEnabled(nextBsl);
      detail.bslEnabled = nextBsl;
      break;
    }

    case 'toggle_sound': {
      const nextSound = typeof validDir.enabled === 'boolean' ? validDir.enabled : !isSoundEnabled();
      setSoundEnabled(nextSound);
      detail.soundEnabled = nextSound;
      break;
    }

    case 'open_tutor': {
      const safePrompt = validDir.prompt || '';
      if (boundPlayerBridge?.openTutor) {
        boundPlayerBridge.openTutor(safePrompt || undefined);
        detail.openedTutor = true;
        if (safePrompt) detail.prompt = safePrompt;
      } else {
        ok = false;
        detail.reason = 'No active player tutor surface mounted';
      }
      break;
    }
  }

  return {
    ok,
    action: validDir.action,
    detail,
    manifest: getSiteManifest(validDir.surfaceId),
  };
}

/**
 * Hypervisor gatekeeper for incoming SITE_DIRECTIVE requests from AST cartridges.
 * Enforces the explicit CARTRIDGE_ALLOWED_SITE_ACTIONS allowlist before forwarding
 * into executeSiteDirective so neither cartridges nor Nano bypass host authority.
 */
export async function dispatchCartridgeSiteDirective(
  rawDirective: unknown,
  explicitNavigator?: SiteRouteNavigator
): Promise<{
  ok: boolean;
  action: string;
  detail: Record<string, any>;
  manifest: NanoSiteManifest;
}> {
  const dir = rawDirective && typeof rawDirective === 'object' ? (rawDirective as Record<string, any>) : null;
  const rawAction = dir && typeof dir.action === 'string' ? dir.action.trim().replace(/-/g, '_') : '';
  if (!rawAction || !CARTRIDGE_ALLOWED_SITE_ACTIONS.has(rawAction as NanoSiteAction)) {
    return {
      ok: false,
      action: rawAction || 'unknown',
      detail: { reason: `Blocked by hypervisor allowlist: ${rawAction || '(empty)'}` },
      manifest: getSiteManifest(),
    };
  }
  const normalized: NanoSiteDirective = {
    action: rawAction as NanoSiteAction,
    route: typeof dir?.route === 'string' ? dir.route : undefined,
    presetId: typeof dir?.presetId === 'string' ? dir.presetId : (typeof dir?.preset === 'string' ? dir.preset : undefined),
    autoplay: typeof dir?.autoplay === 'boolean' ? dir.autoplay : undefined,
    surfaceId: typeof dir?.surfaceId === 'string' ? dir.surfaceId : undefined,
    mode: dir?.mode === 'svg' || dir?.mode === 'canvas' || dir?.mode === 'hybrid' ? dir.mode : undefined,
    selector: typeof dir?.selector === 'string' ? dir.selector : undefined,
    enabled: typeof dir?.enabled === 'boolean' ? dir.enabled : undefined,
    prompt: typeof dir?.prompt === 'string' ? dir.prompt : undefined,
  };
  return executeSiteDirective(normalized, explicitNavigator);
}

/**
 * Deterministic command parser when native Chromium LanguageModel is absent,
 * paired with structured LanguageModel JSON-Schema execution when Nano is present.
 */
export async function runNanoSitePrompt(
  goal: string,
  explicitNavigator?: SiteRouteNavigator
): Promise<{
  source: 'gemini-nano' | 'deterministic-router';
  directive: NanoSiteDirective;
  result: Awaited<ReturnType<typeof executeSiteDirective>>;
}> {
  const manifest = getSiteManifest();
  const boundedGoal = typeof goal === 'string' ? goal.trim().slice(0, MAX_GOAL_CHARS) : '';

  // Deterministic fail-closed safeguarding gate BEFORE any LLM invocation or state routing
  const safety = validateStudentInput(boundedGoal);
  if (!safety.isSafe) {
    const blockedDirective: NanoSiteDirective = { action: 'read_manifest' };
    return {
      source: 'deterministic-router',
      directive: blockedDirective,
      result: {
        ok: false,
        action: 'read_manifest',
        detail: {
          blockedBySafety: true,
          category: safety.category,
          reason: safety.reason || 'Blocked by child safeguarding policy',
          safeMessage: safety.safeReplacementText,
        },
        manifest,
      },
    };
  }

  const lm =
    typeof window !== 'undefined'
      ? (window as any).LanguageModel || (typeof self !== 'undefined' ? (self as any).LanguageModel : null)
      : null;

  let directive: NanoSiteDirective | null = null;
  let source: 'gemini-nano' | 'deterministic-router' = 'deterministic-router';

  // Honor Eco Mode / UK GDPR consent: only invoke LanguageModel if user explicitly opted in
  if (hasUserGrantedAiConsent() && lm && typeof lm.create === 'function') {
    try {
      const avail = typeof lm.availability === 'function' ? await lm.availability() : 'available';
      if (avail === 'available' || avail === 'readily') {
        const session = await lm.create({
          initialPrompts: [
            {
              role: 'system',
              content: `${CHILD_SAFEGUARDING_SYSTEM_PROMPT}\nYou are an on-device site controller. Convert the user request into ONE JSON action matching the schema using the provided compact site manifest.`,
            },
          ],
        });
        try {
          const promptText = `Manifest:\n${JSON.stringify(manifest)}\n\nGoal: ${boundedGoal}`;
          const raw = await session.prompt(promptText, { responseConstraint: DIRECTIVE_JSON_SCHEMA });
          const parsed = JSON.parse(String(raw));
          const checked = validateSiteDirective(parsed);
          if (checked.ok) {
            directive = checked.directive;
            source = 'gemini-nano';
          }
        } finally {
          if (typeof session.destroy === 'function') session.destroy();
        }
      }
    } catch (_) {
      directive = null;
      source = 'deterministic-router';
    }
  }

  if (!directive) {
    directive = parseDeterministicSiteGoal(boundedGoal, manifest);
  }

  const result = await executeSiteDirective(directive, explicitNavigator);
  return { source, directive, result };
}

function parseDeterministicSiteGoal(goal: string, manifest: NanoSiteManifest): NanoSiteDirective {
  const g = (goal || '').trim().toLowerCase();
  if (!g || g.includes('manifest') || g.includes('status') || g.includes('inspect')) {
    return { action: 'read_manifest' };
  }
  if (g.includes('hybrid')) return { action: 'set_render_mode', mode: 'hybrid' };
  if (g.includes('canvas') || g.includes('wasm mode')) return { action: 'set_render_mode', mode: 'canvas' };
  if (g.includes('svg mode')) return { action: 'set_render_mode', mode: 'svg' };
  if (g.includes('bsl')) return { action: 'toggle_bsl', enabled: !g.includes('off') && !g.includes('hide') };
  if (g.includes('mute')) return { action: 'toggle_sound', enabled: false };
  if (g.includes('unmute')) return { action: 'toggle_sound', enabled: true };
  if (g.includes('reset')) return { action: 'dispatch_tuple', slotId: 0, op: 5 };
  if (g.includes('play') || g.includes('pause')) return { action: 'dispatch_tuple', slotId: 0, op: 6 };

  for (const r of manifest.site.routes) {
    const slug = r.replace(/^\//, '');
    if (slug && g.includes(slug)) {
      return { action: 'navigate', route: r };
    }
  }
  for (const cid of manifest.catalog.featuredIds) {
    if (g.includes(cid.toLowerCase())) {
      return { action: 'load_cartridge', presetId: cid, autoplay: true };
    }
  }
  return { action: 'read_manifest' };
}

/**
 * Registers additive site-level WebMCP tools (`site_get_manifest`, `site_manage_surface`,
 * `site_dispatch_wasm_tuple`) without disturbing portal/player tool registrations.
 */
export async function registerNanoSiteWebMcpTools(
  navigatorFn?: SiteRouteNavigator
): Promise<{ registered: boolean; toolNames: string[]; unregister: () => void }> {
  if (navigatorFn) {
    boundNavigator = navigatorFn;
  }

  if (typeof window !== 'undefined') {
    (window as any).__STJ_NANO_SITE__ = {
      getManifest: getSiteManifest,
      executeDirective: executeSiteDirective,
      runPrompt: runNanoSitePrompt,
    };
  }

  const mc: any =
    (typeof navigator !== 'undefined' && (navigator as any).modelContext) ||
    (typeof document !== 'undefined' && (document as any).modelContext) ||
    null;

  if (!mc || typeof mc.registerTool !== 'function') {
    return { registered: false, toolNames: [], unregister: () => {} };
  }

  if (activeNanoAbortController) {
    activeNanoAbortController.abort();
    activeNanoAbortController = null;
    registeredNanoToolNames.length = 0;
  }

  const controller = new AbortController();
  activeNanoAbortController = controller;

  const tools = [
    {
      name: 'site_get_manifest',
      title: 'Get Compact Site & Shared Render-Boundary Manifest',
      description:
        'Returns a compact (<2.5 KB) JSON manifest of active portal routes, mounted shared render surfaces (SVG/Canvas/Hybrid), WASM kernel telemetry, and curriculum cartridge catalog.',
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: 'object',
        properties: {
          surfaceId: { type: 'string', description: 'Optional render surface ID to inspect.' },
        },
      },
      execute: async (args: { surfaceId?: string }) =>
        JSON.stringify(getSiteManifest(args?.surfaceId), null, 2),
    },
    {
      name: 'site_manage_surface',
      title: 'Steer Site Navigation, Cartridge & Shared Render Boundary',
      description:
        'Navigates SPA routes, loads a curriculum cartridge, switches shared render boundary mode (svg | canvas | hybrid), toggles BSL/audio, or highlights a visual selector.',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['navigate', 'load_cartridge', 'set_render_mode', 'set_var', 'highlight_target', 'toggle_bsl', 'toggle_sound', 'open_tutor'],
          },
          route: { type: 'string' },
          presetId: { type: 'string' },
          mode: { type: 'string', enum: ['svg', 'canvas', 'hybrid'] },
          surfaceId: { type: 'string' },
          name: { type: 'string' },
          value: { type: 'number' },
          selector: { type: 'string' },
          enabled: { type: 'boolean' },
        },
        required: ['action'],
      },
      execute: async (args: NanoSiteDirective) =>
        JSON.stringify(await executeSiteDirective(args), null, 2),
    },
    {
      name: 'site_dispatch_wasm_tuple',
      title: 'Dispatch 4-Slot Interrupt Tuple to 448 KiB WASM Kernel',
      description:
        'Dispatches (slotId, op, arg1, arg2) directly into the 16-byte WASM Interrupt Mailbox (op 1=FOCUS, 2=DOCK, 3=OFFSTAGE, 4=SET_VAL, 5=RESET, 6=TOGGLE_PLAY, 7=SET_T).',
      inputSchema: {
        type: 'object',
        properties: {
          slotId: { type: 'number' },
          op: { type: 'number' },
          arg1: { type: 'number' },
          arg2: { type: 'number' },
          surfaceId: { type: 'string' },
        },
        required: ['slotId', 'op'],
      },
      execute: async (args: { slotId: number; op: number; arg1?: number; arg2?: number; surfaceId?: string }) =>
        JSON.stringify(
          await executeSiteDirective({
            action: 'dispatch_tuple',
            slotId: args.slotId,
            op: args.op,
            arg1: args.arg1,
            arg2: args.arg2,
            surfaceId: args.surfaceId,
          }),
          null,
          2
        ),
    },
  ];

  for (const t of tools) {
    try {
      await mc.registerTool(t, { signal: controller.signal });
      registeredNanoToolNames.push(t.name);
    } catch (_) {}
  }

  return {
    registered: registeredNanoToolNames.length > 0,
    toolNames: [...registeredNanoToolNames],
    unregister: unregisterNanoSiteWebMcpTools,
  };
}

export function unregisterNanoSiteWebMcpTools(): void {
  if (activeNanoAbortController) {
    activeNanoAbortController.abort();
    activeNanoAbortController = null;
    registeredNanoToolNames.length = 0;
  }
}
