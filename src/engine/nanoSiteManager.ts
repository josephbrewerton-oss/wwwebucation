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
  | 'toggle_sound';

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
  getActivePreset?: () => string;
}

const VALID_ROUTES = [
  '/',
  '/player',
  '/catholic-life',
  '/practice-lab',
  '/learning-zone',
  '/curriculum-studio',
  '/phonics',
  '/languages',
  '/shakespeare',
  '/profile',
  '/settings',
];

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
  const boundary = getSharedRenderBoundary();
  const nav = explicitNavigator || boundNavigator;
  const detail: Record<string, any> = {};
  let ok = true;

  switch (directive.action) {
    case 'read_manifest': {
      detail.note = 'Returned current site and render boundary manifest';
      break;
    }

    case 'navigate': {
      const targetRoute = directive.route && VALID_ROUTES.includes(directive.route)
        ? directive.route
        : '/player';
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
      const presetId = (directive.presetId || '').trim();
      if (!presetId) {
        ok = false;
        detail.reason = 'Missing presetId';
        break;
      }
      if (boundPlayerBridge) {
        boundPlayerBridge.loadPreset(presetId, Boolean(directive.autoplay));
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
      const nextMode: RenderMode =
        directive.mode === 'canvas' || directive.mode === 'hybrid' || directive.mode === 'svg'
          ? directive.mode
          : 'hybrid';
      const res = boundary.setRenderMode(directive.surfaceId, nextMode);
      ok = res.ok;
      Object.assign(detail, res);
      break;
    }

    case 'dispatch_tuple': {
      const targetBios = getActiveBiosFromBoundary(directive.surfaceId);
      if (!targetBios) {
        ok = false;
        detail.reason = 'No active Everyman WASM Kernel mounted on Shared Render Boundary';
        break;
      }
      const slotId = Number(directive.slotId || 0);
      const op = Number(directive.op || 6);
      const arg1 = Number(directive.arg1 || 0);
      const arg2 = Number(directive.arg2 || 0);
      const rc = targetBios.bios.dispatchTuple(slotId, op, arg1, arg2);
      ok = rc >= 0;
      detail.surfaceId = targetBios.surfaceId;
      detail.returnCode = rc;
      detail.stateHex = targetBios.bios.readStateHex();
      break;
    }

    case 'set_var': {
      const varName = (directive.name || '').trim();
      const varVal = Number(directive.value);
      if (!varName || !Number.isFinite(varVal)) {
        ok = false;
        detail.reason = 'Invalid variable name or numeric value';
        break;
      }
      const targetBios = getActiveBiosFromBoundary(directive.surfaceId);
      if (targetBios) {
        const rows = targetBios.bios.readManifest();
        const match = rows.find((r) => r.kind === 'var' && r.semanticTag === varName);
        if (match) {
          targetBios.bios.dispatchTuple(match.slotId, 4, varVal, 0);
          detail.updatedKernelSlot = match.slotId;
        }
      }
      if (boundPlayerBridge?.setVar) {
        boundPlayerBridge.setVar(varName, varVal);
        detail.updatedPlayerVar = varName;
      }
      detail.name = varName;
      detail.value = varVal;
      break;
    }

    case 'highlight_target': {
      const sel = directive.selector || '';
      const hl = boundary.highlightTarget(sel, 2400, directive.surfaceId);
      if (boundPlayerBridge?.highlight) {
        boundPlayerBridge.highlight(sel);
      }
      ok = hl.ok;
      Object.assign(detail, hl);
      break;
    }

    case 'toggle_bsl': {
      const nextBsl = typeof directive.enabled === 'boolean' ? directive.enabled : !getBslEnabled();
      setBslEnabled(nextBsl);
      detail.bslEnabled = nextBsl;
      break;
    }

    case 'toggle_sound': {
      const nextSound = typeof directive.enabled === 'boolean' ? directive.enabled : !isSoundEnabled();
      setSoundEnabled(nextSound);
      detail.soundEnabled = nextSound;
      break;
    }

    default:
      ok = false;
      detail.reason = `Unsupported action: ${String((directive as any).action)}`;
  }

  return {
    ok,
    action: directive.action,
    detail,
    manifest: getSiteManifest(directive.surfaceId),
  };
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
  const lm =
    typeof window !== 'undefined'
      ? (window as any).LanguageModel || (typeof self !== 'undefined' ? (self as any).LanguageModel : null)
      : null;

  let directive: NanoSiteDirective | null = null;
  let source: 'gemini-nano' | 'deterministic-router' = 'deterministic-router';

  if (lm && typeof lm.create === 'function') {
    try {
      const avail = typeof lm.availability === 'function' ? await lm.availability() : 'available';
      if (avail === 'available' || avail === 'readily') {
        const session = await lm.create({
          initialPrompts: [
            {
              role: 'system',
              content:
                'You are an on-device site controller. Convert the user request into ONE JSON action matching the schema using the provided compact site manifest.',
            },
          ],
        });
        try {
          const promptText = `Manifest:\n${JSON.stringify(manifest)}\n\nGoal: ${goal}`;
          const raw = await session.prompt(promptText, { responseConstraint: DIRECTIVE_JSON_SCHEMA });
          const parsed = JSON.parse(String(raw));
          if (parsed && typeof parsed.action === 'string') {
            directive = parsed as NanoSiteDirective;
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
    directive = parseDeterministicSiteGoal(goal, manifest);
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
            enum: ['navigate', 'load_cartridge', 'set_render_mode', 'set_var', 'highlight_target', 'toggle_bsl', 'toggle_sound'],
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
