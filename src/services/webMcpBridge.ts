// src/services/webMcpBridge.ts
/**
 * St Joseph's Curriculum Portal — W3C WebMCP Bridge
 * Specification: W3C Web Machine Learning Community Group (Google Chrome & Microsoft)
 * Repository Reference: https://github.com/webmachinelearning/webmcp-types
 * 
 * Exposes St Joseph's client-side actions, Catholic Life repository, and AST vector
 * simulation player as native WebMCP tools registered via `document.modelContext.registerTool(...)`.
 * 
 * Architectural Invariants:
 * - Zero external runtime dependencies (progressive enhancement).
 * - Zero cloud leakage (all tools execute purely client-side in the browser tab).
 * - Safe no-op on browsers without WebMCP support (0 ms cold start, 0 KB overhead).
 */

import { openPlayerModal, VectorPresetId } from './playerLauncher';
import { getLearnerProfile } from './studentProfileStore';
import {
  SACRED_OBJECTS,
  ALTAR_APPOINTMENTS,
  HOLY_WATER_CATECHESIS,
  THURIFER_AND_INCENSE_CATECHESIS,
  INCENSATION_MOMENTS,
  HOLY_OILS,
  SANCTUARY_QUESTS,
} from '../data/catholic';

export type NavigateFunction = (to: string) => void;

interface WebMcpState {
  isSupported: boolean;
  registeredTools: string[];
  activeAbortController: AbortController | null;
}

const state: WebMcpState = {
  isSupported: false,
  registeredTools: [],
  activeAbortController: null,
};

let activeNavigator: NavigateFunction | null = null;

/**
 * Check if the browser natively supports the W3C WebMCP API on document.modelContext
 */
export function isWebMcpSupported(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  return typeof (document as any).modelContext?.registerTool === 'function';
}

/**
 * Returns the names of all registered WebMCP tools in the current session
 */
export function getRegisteredWebMcpTools(): readonly string[] {
  return state.registeredTools;
}

/**
 * Set or update the React Router navigate callback for in-app transitions
 */
export function setWebMcpNavigator(navigator: NavigateFunction | null): void {
  activeNavigator = navigator;
}

/**
 * Register all St Joseph's WebMCP tools on document.modelContext
 */
export async function registerWebMcpTools(navigator?: NavigateFunction): Promise<boolean> {
  if (navigator) {
    activeNavigator = navigator;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const mc = (document as any).modelContext;
  if (!mc || typeof mc.registerTool !== 'function') {
    state.isSupported = false;
    return false;
  }

  state.isSupported = true;

  // Cleanup any previously registered tools via AbortController signal
  if (state.activeAbortController) {
    state.activeAbortController.abort();
    state.activeAbortController = null;
    state.registeredTools = [];
  }

  const abortController = new AbortController();
  state.activeAbortController = abortController;
  const signal = abortController.signal;

  const tools: Array<{
    name: string;
    title: string;
    description: string;
    inputSchema: Record<string, any>;
    annotations?: { readOnlyHint?: boolean; consequentialHint?: boolean };
    execute: (args: any, options: { signal: AbortSignal }) => Promise<string> | string;
  }> = [
    // 1. Catholic Catechism & Liturgy Query Tool
    {
      name: 'catholic_catechism_search',
      title: 'Catholic Catechism & Liturgy Search',
      description:
        "Query St Joseph's Roman Rite liturgical repository, including Holy Water (Aqua Benedicta), Thurifer & Incense rubrics, Altar anatomy, Holy Oils, and Sanctuary pilgrim stations.",
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Topic or object to inspect (e.g., holy water, thurible, high altar, chrism, asperges, thurifer, corporal).',
          },
          category: {
            type: 'string',
            enum: ['all', 'holy-water', 'thurifer', 'altar', 'sacred-objects', 'holy-oils', 'sanctuary'],
            description: 'Optional category filter to constrain results.',
          },
        },
        required: ['query'],
      },
      execute: async ({ query, category = 'all' }: { query: string; category?: string }) => {
        const q = (query || '').toLowerCase().trim();
        const results: Record<string, any> = { query: q, category };

        // Search Holy Water
        if (category === 'all' || category === 'holy-water') {
          const matchedWater = HOLY_WATER_CATECHESIS.filter(
            (item) =>
              q === 'all' ||
              item.title.toLowerCase().includes(q) ||
              item.latinTitle.toLowerCase().includes(q) ||
              item.summary.toLowerCase().includes(q) ||
              item.theologicalDepth.toLowerCase().includes(q)
          );
          if (matchedWater.length > 0) {
            results.holyWater = matchedWater.map((item) => ({
              title: item.title,
              latinTitle: item.latinTitle,
              summary: item.summary,
              catechismRef: item.catechismRef,
              scriptureRef: item.scriptureRef,
              theologicalDepth: item.theologicalDepth,
              practicalAction: item.practicalAction,
            }));
          }
        }

        // Search Thurifer & Incense
        if (category === 'all' || category === 'thurifer') {
          const matchedThurifer = THURIFER_AND_INCENSE_CATECHESIS.filter(
            (item) =>
              q === 'all' ||
              item.title.toLowerCase().includes(q) ||
              item.latinTitle.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q) ||
              item.spiritualSignificance.toLowerCase().includes(q)
          );
          const matchedMoments = INCENSATION_MOMENTS.filter(
            (m) =>
              q === 'all' ||
              m.moment.toLowerCase().includes(q) ||
              m.target.toLowerCase().includes(q) ||
              m.purpose.toLowerCase().includes(q)
          );
          if (matchedThurifer.length > 0 || matchedMoments.length > 0) {
            results.thuriferAndIncense = {
              catechesis: matchedThurifer.map((item) => ({
                title: item.title,
                latinTitle: item.latinTitle,
                role: item.serverRole,
                rubricRef: item.rubricRef,
                description: item.description,
                swingPattern: item.swingPattern,
                spiritualSignificance: item.spiritualSignificance,
              })),
              sevenIncensationsAtMass: matchedMoments.map((m) => ({
                order: m.order,
                moment: m.moment,
                latinMoment: m.latinMoment,
                target: m.target,
                swings: m.swings,
                girmRule: m.girmRule,
                purpose: m.purpose,
              })),
            };
          }
        }

        // Search Altar Appointments
        if (category === 'all' || category === 'altar') {
          const matchedAltar = ALTAR_APPOINTMENTS.filter(
            (a) =>
              q === 'all' ||
              a.name.toLowerCase().includes(q) ||
              a.latinName.toLowerCase().includes(q) ||
              a.description.toLowerCase().includes(q)
          );
          if (matchedAltar.length > 0) {
            results.altarAppointments = matchedAltar.map((a) => ({
              id: a.id,
              name: a.name,
              latinName: a.latinName,
              category: a.category,
              description: a.description,
              spiritualMeaning: a.spiritualMeaning,
              catechismRef: a.catechismRef,
            }));
          }
        }

        // Search Sacred Objects
        if (category === 'all' || category === 'sacred-objects') {
          const matchedObjects = SACRED_OBJECTS.filter(
            (o) =>
              q === 'all' ||
              o.name.toLowerCase().includes(q) ||
              o.description.toLowerCase().includes(q) ||
              o.spiritualMeaning.toLowerCase().includes(q)
          );
          if (matchedObjects.length > 0) {
            results.sacredObjects = matchedObjects.map((o) => ({
              id: o.id,
              name: o.name,
              category: o.category,
              description: o.description,
              spiritualMeaning: o.spiritualMeaning,
              catechismRef: o.catechismRef,
            }));
          }
        }

        // Search Holy Oils
        if (category === 'all' || category === 'holy-oils') {
          const matchedOils = HOLY_OILS.filter(
            (o) =>
              q === 'all' ||
              o.name.toLowerCase().includes(q) ||
              o.latinName.toLowerCase().includes(q) ||
              o.primarySacraments.some((s) => s.toLowerCase().includes(q))
          );
          if (matchedOils.length > 0) {
            results.holyOils = matchedOils.map((o) => ({
              id: o.id,
              name: o.name,
              latinName: o.latinName,
              primarySacraments: o.primarySacraments,
              spiritualMeaning: o.spiritualMeaning,
              consecrationType: o.consecrationType,
            }));
          }
        }

        // Search Sanctuary Stations
        if (category === 'all' || category === 'sanctuary') {
          const matchedStations = SANCTUARY_QUESTS.filter(
            (s) =>
              q === 'all' ||
              s.name.toLowerCase().includes(q) ||
              s.latinName.toLowerCase().includes(q) ||
              s.theologicalSignificance.toLowerCase().includes(q)
          );
          if (matchedStations.length > 0) {
            results.sanctuaryStations = matchedStations.map((s) => ({
              stationNum: s.stationNum,
              name: s.name,
              latinName: s.latinName,
              relicName: s.relicName,
              theologicalSignificance: s.theologicalSignificance,
              actionGuidance: s.actionGuidance,
            }));
          }
        }

        return JSON.stringify(results, null, 2);
      },
    },

    // 2. Navigation Tool
    {
      name: 'navigate_portal',
      title: 'Navigate Portal Viewport',
      description:
        "Seamlessly navigate the user's viewport inside St Joseph's Curriculum Portal without reloading the page.",
      annotations: { readOnlyHint: false },
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description:
              'Destination path (e.g. /catholic-life, /practice-lab, /cartridges, /curriculum, /jotter, /licensing).',
          },
          tab: {
            type: 'string',
            description:
              'Optional tab for multi-tab views (e.g. in /catholic-life: holy-water-thurifer, altar, church-tour, sacred-objects, holy-oils, postures).',
          },
        },
        required: ['path'],
      },
      execute: async ({ path, tab }: { path: string; tab?: string }) => {
        let destination = path.startsWith('/') ? path : `/${path}`;
        if (tab) {
          destination += destination.includes('?') ? `&tab=${encodeURIComponent(tab)}` : `?tab=${encodeURIComponent(tab)}`;
        }

        if (activeNavigator) {
          activeNavigator(destination);
        } else if (typeof window !== 'undefined') {
          window.location.href = destination;
        }

        return JSON.stringify({
          status: 'success',
          navigatedTo: destination,
          timestamp: Date.now(),
        });
      },
    },

    // 3. AST Vector Simulation Launcher
    {
      name: 'launch_simulation',
      title: 'Launch AST Vector Simulation',
      description:
        'Launch an interactive zero-bloat Flash-caliber AST vector simulation on the stage (e.g., church-tour, kinetic-gas, calculus-curves, fractions, solar-system, electric-circuits).',
      annotations: { readOnlyHint: false },
      inputSchema: {
        type: 'object',
        properties: {
          cartridgeId: {
            type: 'string',
            description:
              'Preset ID of the AST cartridge: church-tour, kinetic-gas, calculus-curves, fractions, bodmas, times-tables, solar-system, photosynthesis, pythagoras, atom, velocity, dna-helix, electric-circuits, math-fishing, mountain-elevation, phonics-lab.',
          },
          autoPlay: {
            type: 'boolean',
            description: 'Whether to immediately play the simulation upon mounting.',
          },
        },
        required: ['cartridgeId'],
      },
      execute: async ({ cartridgeId, autoPlay = true }: { cartridgeId: string; autoPlay?: boolean }) => {
        openPlayerModal({
          preset: cartridgeId as VectorPresetId,
          title: `Simulation: ${cartridgeId}`,
          autoPlay,
        });

        return JSON.stringify({
          status: 'launched',
          cartridgeId,
          autoPlay,
          engine: 'ast-vector-engine',
          footprint: '< 35 KB gzipped, zero external dependencies',
        });
      },
    },

    // 4. List All AST Cartridges Tool
    {
      name: 'list_ast_simulations',
      title: 'List AST Simulations',
      description:
        'Enumerate all interactive, zero-bloat vector simulations with their pedagogical learning objectives and runtimes.',
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: 'object',
        properties: {
          subjectFilter: {
            type: 'string',
            description: 'Optional filter by subject (e.g. Science, Mathematics, Religious Education, Computing, English, Geography).',
          },
        },
      },
      execute: async ({ subjectFilter }: { subjectFilter?: string }) => {
        const cartridges = [
          { id: 'church-tour', title: 'St. Joseph Church Sanctuary Tour & Liturgical Mystery', subject: 'Religious Education', invariants: ['Sub-pixel zoom', 'Altar reverence', 'Holy Water stoup', 'Thurifer processional'] },
          { id: 'kinetic-gas', title: 'Kinetic Gas Theory & Maxwell-Boltzmann Distributions', subject: 'Science', invariants: ['Conservation of momentum', 'Brownian motion', 'Elastic collisions'] },
          { id: 'calculus-curves', title: 'Interactive Differential Tangent & Slope Explorer', subject: 'Mathematics', invariants: ['Continuous derivatives', 'Secant-to-tangent limits', 'Newtonian fluxions'] },
          { id: 'electric-circuits', title: "Ohm's Law & Kirchhoff Mesh Current Simulator", subject: 'Science', invariants: ['Charge conservation', 'Voltage drops', 'Live switch toggling'] },
          { id: 'fractions', title: 'Fractions Vector Mastery & Equivalence Strips', subject: 'Mathematics', invariants: ['Visual unit partition', 'Improper-to-mixed conversion'] },
          { id: 'solar-system', title: 'Keplerian Orbital Vector Dynamics', subject: 'Science', invariants: ['Inverse square gravitation', 'Orbital eccentricity'] },
          { id: 'photosynthesis', title: 'Light Reactions, Chloroplast Photolysis & Calvin Cycle', subject: 'Science', invariants: ['ATP/NADPH yield', 'Electron transport chain'] },
          { id: 'pythagoras', title: 'Geometric Proof & Dissection Vectors', subject: 'Mathematics', invariants: ['Area preservation', 'Euclidean transformation'] },
          { id: 'atom', title: 'Bohr-Rutherford Atomic Shell & Electron Orbital Quantisation', subject: 'Science', invariants: ['Discrete energy levels', 'Photon emission spectra'] },
          { id: 'velocity', title: 'Kinematics Vector Decomposition & Acceleration', subject: 'Science', invariants: ['Uniform acceleration', 'SUVAT calculus'] },
          { id: 'dna-helix', title: 'Double Helix Nitrogenous Base-Pairing Transcriber', subject: 'Science', invariants: ['Watson-Crick antiparallel base pairing'] },
          { id: 'bodmas', title: 'Order of Operations Algebraic Hierarchy Matrix', subject: 'Mathematics', invariants: ['Operator precedence tree evaluation'] },
          { id: 'phonics-lab', title: 'Synthetic Phonics Articulatory Acoustics & Grapheme Lab', subject: 'English', invariants: ['Pure phoneme sonification'] },
          { id: 'times-tables', title: 'Multiplication Grid & Distributive Law Matrices', subject: 'Mathematics', invariants: ['Commutative property visualization'] },
          { id: 'mountain-elevation', title: 'Contour Elevation & Topological Projection Vectors', subject: 'Geography', invariants: ['Isometric contour interpolation'] },
          { id: 'math-fishing', title: 'Mental Arithmetic Velocity & Reflex Retrieval', subject: 'Mathematics', invariants: ['Rapid fluency feedback'] },
        ];

        let filtered = cartridges;
        if (subjectFilter) {
          const sf = subjectFilter.toLowerCase();
          filtered = cartridges.filter((c) => c.subject.toLowerCase().includes(sf));
        }

        return JSON.stringify({
          count: filtered.length,
          total: cartridges.length,
          cartridges: filtered,
        }, null, 2);
      },
    },

    // 5. Learner Status Tool (Child-Safe, Zero Cloud Leakage)
    {
      name: 'get_learner_status',
      title: 'Get Local Learner Status',
      description:
        'Retrieve anonymous, on-device learner statistics (stars earned, avatar emoji, key stage) with zero cloud egress.',
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        const profile = getLearnerProfile();
        return JSON.stringify({
          alias: profile.alias || 'Pupil',
          avatarEmoji: profile.avatarEmoji || '🦉',
          starsEarned: profile.starsEarned || 0,
          keyStage: profile.keyStage || 'Key Stage 2',
          cohortCode: profile.cohortCode || 'Year 4',
          streakPeak: profile.streakPeak || 0,
          cloudEgress: 'STRICTLY_ZERO (Local IndexedDB only)',
          kcsieCompliant: true,
        }, null, 2);
      },
    },
  ];

  // Register each tool with document.modelContext
  for (const tool of tools) {
    try {
      await mc.registerTool(
        {
          name: tool.name,
          title: tool.title,
          description: tool.description,
          inputSchema: tool.inputSchema,
          annotations: tool.annotations,
          execute: (args: any, opt: any) => tool.execute(args, opt),
        },
        { signal }
      );
      state.registeredTools.push(tool.name);
    } catch (err) {
      console.warn(`[WebMCP] Could not register tool '${tool.name}':`, err);
    }
  }

  // Dispatch custom window event so UI indicators can update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('stjosephs_webmcp_ready', {
        detail: {
          supported: true,
          tools: state.registeredTools,
        },
      })
    );
  }

  return true;
}

/**
 * Teardown and unregister all WebMCP tools
 */
export function unregisterWebMcpTools(): void {
  if (state.activeAbortController) {
    state.activeAbortController.abort();
    state.activeAbortController = null;
    state.registeredTools = [];
  }
}

/**
 * Initialize WebMCP bridge with automatic cleanup on unmount
 */
export function initWebMcpBridge(navigator?: NavigateFunction): () => void {
  registerWebMcpTools(navigator);

  return () => {
    unregisterWebMcpTools();
  };
}
