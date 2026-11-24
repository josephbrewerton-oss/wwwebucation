// src/utils/swfNativeDistiller.ts
/**
 * St Joseph's Flash SWF -> Native AST Cartridge Distiller
 *
 * Promotes live-captured or auto-swept states from the pure-SVG AVM1 micro-VM
 * into ultra-light, bytecode-free native W3C SVG + AST S-Expression cartridges.
 *
 * Architectural Invariants:
 * - 100% pure W3C SVG DOM (zero <canvas>, zero external libraries, zero (:swf-vm ...))
 * - Screen-reader safe: inactive states use display="none" (never opacity="0" alone),
 *   decorative shapes carry aria-hidden="true", interactive controls carry role="button",
 *   tabindex="0", and descriptive aria-label.
 * - Offline Eco Mode default (0 MB downloads, < 10 ms deterministic enrichment),
 *   with opt-in on-device Gemini Nano polish when consented and available.
 */

import { aiCaller, hasUserGrantedAiConsent } from '../engine/aicaller';
import { sanitizeAiOutput } from '../services/childSafetyFilter';

export interface SwfObservedButton {
  id: string;
  name: string;
  label: string;
  charId: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SwfCapturedState {
  id: string;
  frameNumber: number;
  totalFrames: number;
  frameLabel: string;
  width: number;
  height: number;
  bg: string;
  svgMarkup: string;
  nodeCount: number;
  pathCount: number;
  truncated?: boolean;
  observedTexts: string[];
  observedButtons: SwfObservedButton[];
  observedVars: Record<string, number | string>;
  fingerprint: string;
  title: string;
  caption: string;
}

export interface DistilledCheckpoint {
  t: number;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export type DistillTargetFormat = 'Slide' | 'Sim';

export interface DistillOptions {
  id: string;
  title: string;
  stage: string;
  subject?: string;
  format: DistillTargetFormat;
  states: SwfCapturedState[];
  checkpoints: DistilledCheckpoint[];
  originalSwfBytes?: number;
}

export interface DistilledNativeCartridge {
  id: string;
  title: string;
  stage: string;
  subject: string;
  type: DistillTargetFormat;
  svgMarkup: string;
  astSource: string;
  metrics: {
    stateCount: number;
    dedupedPathCount: number;
    promotedVarCount: number;
    promotedButtonCount: number;
    originalBytes: number;
    nativeSvgBytes: number;
    nativeAstBytes: number;
    nativeTotalBytes: number;
    savedPercent: number;
  };
}

function escXml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAstString(str: string): string {
  return String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escJsSingle(str: string): string {
  return String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeSlugId(raw: string): string {
  const cleaned = String(raw || 'distilled-lesson')
    .replace(/\.swf$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return cleaned ? `${cleaned}-native` : `lesson-${Date.now().toString(36)}-native`;
}

export function formatTitleFromSlug(raw: string): string {
  const cleaned = String(raw || 'Imported Lesson')
    .replace(/\.swf$/i, '')
    .replace(/^flash[:\s-]*/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  if (!cleaned) return 'Native Lesson';
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Infers the best default native format ('Slide' vs 'Sim') from captured runtime signals.
 */
export function inferRecommendedFormat(states: SwfCapturedState[]): DistillTargetFormat {
  if (!states || states.length === 0) return 'Slide';
  let hasButtons = false;
  let hasNumericVars = false;
  for (const s of states) {
    if (s.observedButtons && s.observedButtons.length > 0) hasButtons = true;
    if (s.observedVars) {
      for (const v of Object.values(s.observedVars)) {
        if (typeof v === 'number' && Number.isFinite(v)) {
          hasNumericVars = true;
          break;
        }
      }
    }
  }
  return hasButtons || hasNumericVars ? 'Sim' : 'Slide';
}

/**
 * Normalizes a raw snapshot returned by ASTAVM1Runtime into a SwfCapturedState
 * with clean deterministic title & caption defaults.
 */
export function normalizeCapturedSnapshot(
  raw: any,
  index: number,
  lessonTitle?: string
): SwfCapturedState {
  const observedTexts: string[] = Array.isArray(raw?.observedTexts)
    ? raw.observedTexts
        .map((t: any) => String(t || '').replace(/\s+/g, ' ').trim())
        .filter((t: string) => t.length > 0 && t.length <= 160)
        .slice(0, 24)
    : [];

  const observedButtons: SwfObservedButton[] = Array.isArray(raw?.observedButtons)
    ? raw.observedButtons.slice(0, 12).map((b: any, i: number) => ({
        id: String(b?.id || `btn_${i + 1}`),
        name: String(b?.name || `button_${i + 1}`),
        label: String(b?.label || `Button ${i + 1}`).slice(0, 60),
        charId: Number(b?.charId) || 0,
        x: Math.round(Number(b?.x) || 0),
        y: Math.round(Number(b?.y) || 0),
        width: Math.max(24, Math.round(Number(b?.width) || 100)),
        height: Math.max(20, Math.round(Number(b?.height) || 36)),
      }))
    : [];

  const observedVars: Record<string, number | string> = {};
  if (raw?.observedVars && typeof raw.observedVars === 'object') {
    for (const [k, v] of Object.entries(raw.observedVars)) {
      if (/^[a-zA-Z][a-zA-Z0-9_]{0,28}$/.test(k)) {
        if (typeof v === 'number' && Number.isFinite(v)) {
          observedVars[k] = v;
        } else if (typeof v === 'string' && v.length <= 64) {
          observedVars[k] = v;
        }
      }
    }
  }

  const frameNumber = Math.max(1, Math.round(Number(raw?.frameNumber) || 1));
  const totalFrames = Math.max(1, Math.round(Number(raw?.totalFrames) || 1));
  const frameLabel = String(raw?.frameLabel || '').trim();

  const meaningfulText = observedTexts.find((t) => /[a-zA-Z]{2,}/.test(t) && t.length <= 64) || '';
  const defaultTitle = frameLabel
    ? formatTitleFromSlug(frameLabel)
    : meaningfulText
    ? meaningfulText.slice(0, 48)
    : `Screen ${index + 1} (Frame ${frameNumber})`;

  const caption = buildEcoCaptionForState(
    {
      index,
      frameNumber,
      frameLabel,
      observedTexts,
      observedButtons,
      observedVars,
    },
    lessonTitle || 'Interactive Lesson'
  );

  return {
    id: `state_${index + 1}_${String(raw?.fingerprint || index)}`,
    frameNumber,
    totalFrames,
    frameLabel,
    width: Math.max(160, Math.min(1920, Math.round(Number(raw?.width) || 640))),
    height: Math.max(120, Math.min(1200, Math.round(Number(raw?.height) || 400))),
    bg: typeof raw?.bg === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(raw.bg) ? raw.bg : '#0f172a',
    svgMarkup: String(raw?.svgMarkup || ''),
    nodeCount: Math.max(0, Math.round(Number(raw?.nodeCount) || 0)),
    pathCount: Math.max(0, Math.round(Number(raw?.pathCount) || 0)),
    truncated: Boolean(raw?.truncated),
    observedTexts,
    observedButtons,
    observedVars,
    fingerprint: String(raw?.fingerprint || `s_${index}_${frameNumber}`),
    title: defaultTitle,
    caption,
  };
}

function buildEcoCaptionForState(
  info: {
    index: number;
    frameNumber: number;
    frameLabel: string;
    observedTexts: string[];
    observedButtons: SwfObservedButton[];
    observedVars: Record<string, number | string>;
  },
  lessonTitle: string
): string {
  const cleanTexts = info.observedTexts
    .filter((t) => t.length >= 2 && !/^\d+$/.test(t))
    .slice(0, 3);
  if (cleanTexts.length > 0) {
    const joined = cleanTexts.join('. ').replace(/\.{2,}/g, '.');
    return joined.length <= 150 ? joined : `${joined.slice(0, 147)}...`;
  }
  const varEntries = Object.entries(info.observedVars).slice(0, 3);
  if (varEntries.length > 0) {
    const summary = varEntries.map(([k, v]) => `${k.replace(/_/g, ' ')} = ${v}`).join(', ');
    return `${lessonTitle}, view ${info.index + 1}: observing ${summary}.`;
  }
  if (info.observedButtons.length > 0) {
    const labels = info.observedButtons.map((b) => b.label).slice(0, 2).join(' and ');
    return `${lessonTitle}, view ${info.index + 1}: interactive controls include ${labels}.`;
  }
  if (info.frameLabel) {
    return `${lessonTitle}: ${formatTitleFromSlug(info.frameLabel)} (frame ${info.frameNumber}).`;
  }
  return `${lessonTitle}: stage view ${info.index + 1} captured from frame ${info.frameNumber}.`;
}

/**
 * Deterministic Offline Eco-Mode Checkpoint Generator (0 MB download, < 5 ms).
 * Synthesizes 1-2 grounded multiple-choice checkpoints from captured stage texts, labels, or variables.
 */
export function generateEcoCheckpoints(
  states: SwfCapturedState[],
  lessonTitle: string
): DistilledCheckpoint[] {
  if (!states || states.length === 0) return [];
  const checkpoints: DistilledCheckpoint[] = [];

  const textPool: { stateIdx: number; text: string }[] = [];
  const seen = new Set<string>();
  states.forEach((s, idx) => {
    for (const t of s.observedTexts) {
      const clean = t.trim();
      if (clean.length >= 3 && clean.length <= 56 && /[a-zA-Z]/.test(clean) && !seen.has(clean.toLowerCase())) {
        seen.add(clean.toLowerCase());
        textPool.push({ stateIdx: idx, text: clean });
      }
    }
  });

  if (textPool.length >= 2) {
    const target = textPool[0];
    const distractors = textPool
      .slice(1)
      .filter((x) => x.text.toLowerCase() !== target.text.toLowerCase())
      .slice(0, 2)
      .map((x) => x.text);
    while (distractors.length < 2) {
      distractors.push(distractors.length === 0 ? 'An unrelated blank screen' : 'No label shown on stage');
    }
    checkpoints.push({
      t: states.length > 1 ? 0.5 : 1.0,
      prompt: `In "${lessonTitle}", which key concept or label appears in View ${target.stateIdx + 1}?`,
      options: [target.text, distractors[0], distractors[1]],
      answer: 0,
      explanation: `View ${target.stateIdx + 1} highlights "${target.text}" directly on the interactive stage.`,
    });
  } else {
    const firstState = states[0];
    const varKeys = Object.keys(firstState.observedVars || {});
    if (varKeys.length > 0) {
      const keyLabel = varKeys[0].replace(/_/g, ' ');
      checkpoints.push({
        t: states.length > 1 ? 0.5 : 1.0,
        prompt: `Which live variable is tracked on stage during "${lessonTitle}"?`,
        options: [
          formatTitleFromSlug(keyLabel),
          'External Cloud Bandwidth',
          'Static Page Margin',
        ],
        answer: 0,
        explanation: `"${formatTitleFromSlug(keyLabel)}" is actively updated as you explore ${lessonTitle}.`,
      });
    } else {
      checkpoints.push({
        t: 1.0,
        prompt: `How many distinct visual stages were captured in "${lessonTitle}"?`,
        options: [
          `${states.length} stage${states.length === 1 ? '' : 's'}`,
          `${states.length + 3} stages`,
          'Zero vector stages',
        ],
        answer: 0,
        explanation: `This distilled native cartridge steps cleanly across ${states.length} pure SVG stage${states.length === 1 ? '' : 's'}.`,
      });
    }
  }

  if (states.length >= 3) {
    const lastIdx = states.length - 1;
    const lastState = states[lastIdx];
    const finalCue = lastState.title || `Screen ${lastIdx + 1}`;
    const otherTitle = states[0].title !== finalCue ? states[0].title : 'Opening Setup Screen';
    checkpoints.push({
      t: 1.0,
      prompt: `What does the final view (View ${states.length}) of "${lessonTitle}" show?`,
      options: [otherTitle, finalCue, 'Preloader Error Screen'],
      answer: 1,
      explanation: `View ${states.length} presents "${finalCue}" — ${lastState.caption}`,
    });
  }

  return checkpoints;
}

/**
 * Deduplicates identical <path .../> definitions shared across 2+ captured states
 * into a single <defs> block referenced via <use href="#dpath-N"/>.
 */
function deduplicateSvgPaths(stateLayers: string[]): {
  defsMarkup: string;
  dedupedLayers: string[];
  dedupedPathCount: number;
} {
  if (stateLayers.length <= 1) {
    return { defsMarkup: '', dedupedLayers: stateLayers, dedupedPathCount: 0 };
  }

  const pathRegex = /<path\b([^>]*?)\/>/g;
  const counts = new Map<string, number>();

  for (const layer of stateLayers) {
    let m: RegExpExecArray | null;
    pathRegex.lastIndex = 0;
    while ((m = pathRegex.exec(layer)) !== null) {
      const attrs = m[1].trim();
      // Only hoist paths large enough that <use href="#dpath-N"/> actually saves bytes
      if (attrs.length < 36) continue;
      counts.set(attrs, (counts.get(attrs) || 0) + 1);
    }
  }

  const hoistedIds = new Map<string, string>();
  const defsParts: string[] = [];
  let idx = 0;
  counts.forEach((count, attrs) => {
    if (count >= 2 && idx < 180) {
      idx++;
      const id = `dpath-${idx}`;
      hoistedIds.set(attrs, id);
      defsParts.push(`<path id="${id}" ${attrs}/>`);
    }
  });

  if (hoistedIds.size === 0) {
    return { defsMarkup: '', dedupedLayers: stateLayers, dedupedPathCount: 0 };
  }

  const dedupedLayers = stateLayers.map((layer) =>
    layer.replace(pathRegex, (full, rawAttrs) => {
      const id = hoistedIds.get(String(rawAttrs || '').trim());
      return id ? `<use href="#${id}"/>` : full;
    })
  );

  return {
    defsMarkup: defsParts.join(''),
    dedupedLayers,
    dedupedPathCount: hoistedIds.size,
  };
}

/**
 * Collects promoted numeric variables across all captured states for 'Sim' mode.
 */
function collectPromotedVars(states: SwfCapturedState[]): Array<{
  name: string;
  label: string;
  initial: number;
  min: number;
  max: number;
  step: number;
}> {
  const stats = new Map<string, { min: number; max: number; initial: number }>();
  for (const s of states) {
    if (!s.observedVars) continue;
    for (const [k, v] of Object.entries(s.observedVars)) {
      if (typeof v !== 'number' || !Number.isFinite(v)) continue;
      if (k === 'state' || k === 'page' || k.startsWith('swf_')) continue;
      const cur = stats.get(k);
      if (!cur) {
        stats.set(k, { min: v, max: v, initial: v });
      } else {
        if (v < cur.min) cur.min = v;
        if (v > cur.max) cur.max = v;
      }
    }
  }

  const result: Array<{ name: string; label: string; initial: number; min: number; max: number; step: number }> = [];
  stats.forEach((st, name) => {
    if (result.length >= 4) return;
    const isInt = Number.isInteger(st.initial) && Number.isInteger(st.min) && Number.isInteger(st.max);
    const pad = Math.max(10, Math.abs(st.max - st.min));
    const min = isInt ? Math.floor(Math.min(0, st.min)) : Math.round((st.min - pad) * 10) / 10;
    const max = isInt ? Math.ceil(Math.max(st.max + pad, 100)) : Math.round((st.max + pad) * 10) / 10;
    result.push({
      name,
      label: formatTitleFromSlug(name),
      initial: st.initial,
      min,
      max: max > min ? max : min + 10,
      step: isInt ? 1 : 0.1,
    });
  });
  return result;
}

/**
 * Emits a 100% pure W3C SVG stage + bytecode-free native AST S-Expression cartridge.
 */
export function distillSwfStatesToNativeCartridge(opts: DistillOptions): DistilledNativeCartridge {
  const states = opts.states && opts.states.length > 0 ? opts.states : [];
  if (states.length === 0) {
    throw new Error('At least one captured SWF state is required to build a native AST cartridge.');
  }

  const count = states.length;
  const maxIdx = Math.max(0, count - 1);
  const stageW = Math.max(480, states[0].width || 640);
  const stageH = Math.max(300, states[0].height || 400);
  const chromeH = 68;
  const totalH = stageH + chromeH;
  const bg = states[0].bg || '#0f172a';
  const cleanId = opts.id || sanitizeSlugId(opts.title);
  const cleanTitle = (opts.title || 'Distilled Native Lesson').trim();
  const cleanStage = (opts.stage || 'CURRICULUM').trim();
  const cleanSubject = (opts.subject || 'Distilled Flash').trim();
  const format: DistillTargetFormat = opts.format === 'Sim' ? 'Sim' : 'Slide';

  const promotedVars = format === 'Sim' ? collectPromotedVars(states) : [];
  const { defsMarkup, dedupedLayers, dedupedPathCount } = deduplicateSvgPaths(
    states.map((s) => s.svgMarkup)
  );

  // Build interactive hotspot buttons observed in Sim mode
  const simButtons: Array<{
    stateIdx: number;
    btnId: string;
    label: string;
    targetState: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }> = [];

  if (format === 'Sim') {
    states.forEach((s, stateIdx) => {
      (s.observedButtons || []).slice(0, 4).forEach((b, bIdx) => {
        const nextState = count > 1 ? (stateIdx + 1) % count : 0;
        simButtons.push({
          stateIdx,
          btnId: `sim-btn-${stateIdx}-${bIdx}`,
          label: b.label || `Control ${bIdx + 1}`,
          targetState: nextState,
          x: Math.max(8, Math.min(stageW - 60, b.x)),
          y: Math.max(8, Math.min(stageH - 36, b.y)),
          width: Math.max(52, Math.min(stageW - 16, b.width)),
          height: Math.max(28, Math.min(stageH - 16, b.height)),
        });
      });
    });
  }

  // 1. Emit pure W3C SVG DOM with screen-reader-safe display="none" gating
  const stateGroupsSvg = states
    .map((s, idx) => {
      const stateBtnsSvg = simButtons
        .filter((b) => b.stateIdx === idx)
        .map(
          (b) =>
            `<g id="${b.btnId}" role="button" tabindex="0" aria-label="${escXml(b.label)}" data-state="${b.targetState}" style="cursor:pointer;">` +
            `<rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" rx="6" fill="rgba(2,132,199,0.14)" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 3"/>` +
            `<title>${escXml(b.label)}</title>` +
            `</g>`
        )
        .join('');
      return (
        `<g id="distilled-state-${idx}" display="${idx === 0 ? 'inline' : 'none'}">` +
        `<g aria-hidden="true">${dedupedLayers[idx]}</g>` +
        stateBtnsSvg +
        `</g>`
      );
    })
    .join('\n    ');

  // Navigation dots across bottom chrome bar
  const dotSpacing = Math.min(18, Math.max(12, Math.floor((stageW - 320) / Math.max(1, count))));
  const dotsTotalW = (count - 1) * dotSpacing;
  const dotsStartX = Math.round(stageW / 2 - dotsTotalW / 2);
  const dotY = stageH + 48;

  const dotsSvg = states
    .map((s, idx) => {
      const cx = dotsStartX + idx * dotSpacing;
      return (
        `<g id="state-dot-wrap-${idx}" class="state-dot" data-state="${idx}" role="button" tabindex="0" aria-label="View ${idx + 1}: ${escXml(s.title)}" style="cursor:pointer;">` +
        `<circle id="state-dot-${idx}" cx="${cx}" cy="${dotY}" r="5" fill="${idx === 0 ? '#38bdf8' : '#475569'}"/>` +
        `</g>`
      );
    })
    .join('');

  const varHudSvg =
    format === 'Sim' && promotedVars.length > 0
      ? `<g id="sim-var-hud" transform="translate(${stageW - 188}, 10)">` +
        `<rect width="178" height="${22 + promotedVars.length * 16}" rx="6" fill="rgba(15,23,42,0.88)" stroke="#334155" stroke-width="1"/>` +
        `<text x="10" y="15" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10" font-weight="700">LIVE PARAMETERS</text>` +
        promotedVars
          .map(
            (v, vi) =>
              `<text id="sim-var-txt-${v.name}" x="10" y="${31 + vi * 16}" fill="#f8fafc" font-family="ui-monospace, monospace" font-size="11">${escXml(v.label)}: ${v.initial}</text>`
          )
          .join('') +
        `</g>`
      : '';

  const navBtnY = stageH + 34;
  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${stageW} ${totalH}" width="100%" height="100%" role="img" aria-label="${escXml(cleanTitle)}">
  <defs>
    <clipPath id="distilled-stage-clip"><rect x="0" y="0" width="${stageW}" height="${stageH}"/></clipPath>
    ${defsMarkup}
  </defs>
  <rect id="distilled-bg" x="0" y="0" width="${stageW}" height="${stageH}" fill="${escXml(bg)}" aria-hidden="true"/>
  <g id="distilled-stage-root" clip-path="url(#distilled-stage-clip)">
    ${stateGroupsSvg}
  </g>
  ${varHudSvg}
  <g id="distilled-nav-bar">
    <rect x="0" y="${stageH}" width="${stageW}" height="${chromeH}" fill="#0f172a" aria-hidden="true"/>
    <line x1="0" y1="${stageH}" x2="${stageW}" y2="${stageH}" stroke="#334155" stroke-width="1" aria-hidden="true"/>
    <text id="distilled-caption-txt" x="16" y="${stageH + 22}" fill="#f1f5f9" font-family="system-ui, -apple-system, sans-serif" font-size="12.5" font-weight="600">${escXml(states[0].caption.slice(0, 92))}</text>
    <g id="btn-prev-state" role="button" tabindex="0" aria-label="Previous view" style="cursor:pointer;">
      <rect x="16" y="${navBtnY}" width="74" height="26" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1"/>
      <text x="53" y="${navBtnY + 17}" text-anchor="middle" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="11.5" font-weight="600">Prev</text>
    </g>
    <g id="btn-next-state" role="button" tabindex="0" aria-label="Next view" style="cursor:pointer;">
      <rect x="98" y="${navBtnY}" width="74" height="26" rx="6" fill="#0284c7"/>
      <text x="135" y="${navBtnY + 17}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700">Next</text>
    </g>
    ${dotsSvg}
    <text id="distilled-state-num" x="${stageW - 118}" y="${navBtnY + 17}" text-anchor="end" fill="#94a3b8" font-family="ui-monospace, monospace" font-size="11.5">View 1 / ${count}</text>
    <g id="btn-read-state" role="button" tabindex="0" aria-label="Read and sign current screen" style="cursor:pointer;">
      <rect x="${stageW - 108}" y="${navBtnY}" width="92" height="26" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1"/>
      <text x="${stageW - 62}" y="${navBtnY + 17}" text-anchor="middle" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="11" font-weight="700">Read &amp; Sign</text>
    </g>
  </g>
</svg>`;

  // 2. Emit pure bytecode-free AST S-Expression source (ZERO (:swf-vm ...))
  const durationSec = Math.max(8, count * 4);
  const stateTextsArray = `[${states.map((s) => `'${escJsSingle(s.caption)}'`).join(', ')}]`;

  const varsLines: string[] = [
    `    (:var :name "state" :val 0 :min 0 :max ${maxIdx} :step 1 :label "Lesson View")`,
  ];
  for (const pv of promotedVars) {
    varsLines.push(
      `    (:var :name "${pv.name}" :val ${pv.initial} :min ${pv.min} :max ${pv.max} :step ${pv.step} :label "${escAstString(pv.label)}")`
    );
  }

  const inputsLines: string[] = [];
  if (count > 1) {
    inputsLines.push(`    (:slider :var "state" :label "Lesson View" :min 0 :max ${maxIdx} :step 1)`);
  }
  for (const pv of promotedVars) {
    inputsLines.push(
      `    (:slider :var "${pv.name}" :label "${escAstString(pv.label)}" :min ${pv.min} :max ${pv.max} :step ${pv.step})`
    );
  }

  const subtitlesLines = states.map((s, idx) => {
    const start = (idx / count).toFixed(2);
    const end = ((idx + 1) / count).toFixed(2);
    return `    (:start ${start} :end ${end} :en "${escAstString(s.caption)}")`;
  });

  const keyframesLines = states.map((s, idx) => {
    const t = count > 1 ? (idx / (count - 1)).toFixed(2) : '0.00';
    return `    (:t ${t} :title "${escAstString(s.title)}" :rule "${escAstString(s.caption)}")`;
  });

  const checkpoints = opts.checkpoints && opts.checkpoints.length > 0
    ? opts.checkpoints
    : generateEcoCheckpoints(states, cleanTitle);

  const checkpointsLines = checkpoints.map((cp) => {
    const optsSexpr = cp.options.map((o) => `"${escAstString(o)}"`).join(' ');
    const tStr = Math.max(0, Math.min(1, Number(cp.t) || 1)).toFixed(2);
    return (
      `    (:checkpoint :t ${tStr}\n` +
      `      :prompt "${escAstString(cp.prompt)}"\n` +
      `      :options (${optsSexpr})\n` +
      `      :answer ${Math.max(0, Math.min(cp.options.length - 1, Math.round(cp.answer || 0)))}\n` +
      `      :explanation "${escAstString(cp.explanation)}")`
    );
  });

  const clampExpr = `Math.max(0, Math.min(${maxIdx}, Math.round(vars.state || 0)))`;
  const bindingsLines: string[] = [];
  for (let idx = 0; idx < count; idx++) {
    bindingsLines.push(
      `    (:target "#distilled-state-${idx}" :attr "display" :expr "${clampExpr} === ${idx} ? 'inline' : 'none'")`
    );
    bindingsLines.push(
      `    (:target "#state-dot-${idx}" :attr "fill" :expr "${clampExpr} === ${idx} ? '#38bdf8' : '#475569'")`
    );
  }
  bindingsLines.push(
    `    (:target "#distilled-state-num" :attr "textContent" :expr "'View ' + (${clampExpr} + 1) + ' / ${count}'")`
  );
  bindingsLines.push(
    `    (:target "#distilled-caption-txt" :attr "textContent" :expr "(${stateTextsArray}[${clampExpr}] || '').slice(0, 92)")`
  );
  for (const pv of promotedVars) {
    bindingsLines.push(
      `    (:target "#sim-var-txt-${pv.name}" :attr "textContent" :expr "'${escJsSingle(pv.label)}: ' + (vars.${pv.name} !== undefined ? vars.${pv.name} : ${pv.initial})")`
    );
  }

  const gesturesLines: string[] = [
    `    (:key       :code "ArrowLeft"      :action "step-slide" :delta -1 :count ${count} :var "state" :tone "392")`,
    `    (:key       :code "ArrowRight"     :action "step-slide" :delta  1 :count ${count} :var "state" :tone "523.25")`,
    `    (:clickable :target "#btn-prev-state" :action "step-slide" :delta -1 :count ${count} :var "state" :tone "392")`,
    `    (:clickable :target "#btn-next-state" :action "step-slide" :delta  1 :count ${count} :var "state" :tone "523.25")`,
    `    (:clickable :target ".state-dot"      :action "goto-slide" :attr "data-state" :count ${count} :var "state" :tone "440")`,
    `    (:clickable :target "#btn-read-state" :speak-var "stateText" :tone "523.25,659.25")`,
  ];
  for (const sb of simButtons) {
    gesturesLines.push(
      `    (:clickable :target "#${sb.btnId}" :action "goto-slide" :attr "data-state" :count ${count} :var "state" :tone "587.33")`
    );
  }

  const astSource = `(:scene :id "${escAstString(cleanId)}" :type "${format}" :title "${escAstString(cleanTitle)}" :stage "${escAstString(cleanStage)}" :duration ${durationSec.toFixed(1)}
  (:controls
    (:arrow-step :on)
    (:param-hud ${format === 'Sim' && promotedVars.length > 0 ? ':on' : ':off'})
    (:whiteboard :on)
    (:xray :on))
  (:vars (
${varsLines.join('\n')}
  ))
${inputsLines.length > 0 ? `  (:inputs (\n${inputsLines.join('\n')}\n  ))\n` : ''}  (:computed (
    (:name "activeState" :expr "${clampExpr}")
    (:name "stateText" :expr "${stateTextsArray}[${clampExpr}] || ''")
  ))
  (:subtitles (
${subtitlesLines.join('\n')}
  ))
  (:keyframes (
${keyframesLines.join('\n')}
  ))
  (:interactive (
${checkpointsLines.join('\n')}
  ))
  (:bindings (
${bindingsLines.join('\n')}
  ))
  (:gestures (
${gesturesLines.join('\n')}
  ))
)
`;

  const nativeSvgBytes = new TextEncoder().encode(svgMarkup).length;
  const nativeAstBytes = new TextEncoder().encode(astSource).length;
  const nativeTotalBytes = nativeSvgBytes + nativeAstBytes;
  const originalBytes = Math.max(0, Number(opts.originalSwfBytes) || 0);
  const savedPercent =
    originalBytes > 0
      ? Math.round(((originalBytes - nativeTotalBytes) / originalBytes) * 100)
      : 0;

  return {
    id: cleanId,
    title: cleanTitle,
    stage: cleanStage,
    subject: cleanSubject,
    type: format,
    svgMarkup,
    astSource,
    metrics: {
      stateCount: count,
      dedupedPathCount,
      promotedVarCount: promotedVars.length,
      promotedButtonCount: simButtons.length,
      originalBytes,
      nativeSvgBytes,
      nativeAstBytes,
      nativeTotalBytes,
      savedPercent,
    },
  };
}

export interface NanoPolishResult {
  usedNano: boolean;
  title: string;
  captions: string[];
  checkpoints: DistilledCheckpoint[];
  note: string;
}

/**
 * Opt-in On-Device Gemini Nano pedagogical polish.
 * Strictly respects UK GDPR / Eco Mode consent; sends ONLY compact extracted text outlines
 * (never raw SVG) and falls back cleanly to Eco Mode on any error or timeout.
 */
export async function polishDistillationWithNano(
  lessonTitle: string,
  states: SwfCapturedState[],
  existingCheckpoints: DistilledCheckpoint[]
): Promise<NanoPolishResult> {
  const ecoFallback = (note: string): NanoPolishResult => ({
    usedNano: false,
    title: lessonTitle,
    captions: states.map((s) => s.caption),
    checkpoints: existingCheckpoints.length > 0 ? existingCheckpoints : generateEcoCheckpoints(states, lessonTitle),
    note,
  });

  if (!hasUserGrantedAiConsent()) {
    return ecoFallback('Eco Mode active — enable on-device AI in Settings to polish with Gemini Nano.');
  }

  try {
    const avail = await aiCaller.checkAvailability();
    if (avail.status !== 'readily') {
      return ecoFallback('On-device Gemini Nano is not downloaded yet — kept deterministic Eco Mode captions.');
    }

    const compactOutline = states
      .map(
        (s, i) =>
          `View ${i + 1} (frame ${s.frameNumber}${s.frameLabel ? `, label "${s.frameLabel}"` : ''}): ` +
          `texts=[${s.observedTexts.slice(0, 6).join(' | ') || 'none'}]; ` +
          `buttons=[${s.observedButtons.map((b) => b.label).slice(0, 4).join(', ') || 'none'}]; ` +
          `vars=${JSON.stringify(s.observedVars)}`
      )
      .join('\n');

    const systemPrompt =
      'You are a UK Curriculum teacher turning captured screens from a legacy Flash activity into a concise, BSL-friendly accessible lesson. ' +
      'Respond strictly with valid JSON only: {"title":"...","captions":["..."],"checkpoint":{"prompt":"...","options":["...","...","..."],"answer":0,"explanation":"..."}}. ' +
      'Rules: 1 caption per view, each under 22 words, clear plain English suitable for deaf/BSL learners and primary/secondary pupils.';

    const prompt =
      `Lesson draft title: "${lessonTitle}"\n` +
      `Captured views (${states.length}):\n${compactOutline}\n` +
      `Return valid JSON with a clean title, ${states.length} short captions, and 1 multiple-choice formative checkpoint.`;

    const raw = await aiCaller.promptText({
      prompt,
      systemPrompt,
      timeoutMs: 12000,
    });

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return ecoFallback('Gemini Nano response was not structured JSON — kept Eco Mode captions.');
    }
    const parsed = JSON.parse(jsonMatch[0]);
    const polishedTitle = typeof parsed.title === 'string' && parsed.title.trim()
      ? sanitizeAiOutput(parsed.title.trim()).slice(0, 80)
      : lessonTitle;

    const captions = states.map((s, idx) => {
      const c = Array.isArray(parsed.captions) && typeof parsed.captions[idx] === 'string'
        ? sanitizeAiOutput(parsed.captions[idx].trim())
        : '';
      return c.length >= 4 ? c.slice(0, 160) : s.caption;
    });

    const checkpoints = [...existingCheckpoints];
    const cp = parsed.checkpoint;
    if (
      cp &&
      typeof cp.prompt === 'string' &&
      Array.isArray(cp.options) &&
      cp.options.length >= 2
    ) {
      const cleanOpts = cp.options
        .slice(0, 4)
        .map((o: any) => sanitizeAiOutput(String(o || '').trim()).slice(0, 80))
        .filter(Boolean);
      if (cleanOpts.length >= 2) {
        const ans = Math.max(0, Math.min(cleanOpts.length - 1, Math.round(Number(cp.answer) || 0)));
        checkpoints.splice(0, checkpoints.length, {
          t: states.length > 1 ? 0.5 : 1.0,
          prompt: sanitizeAiOutput(cp.prompt.trim()).slice(0, 140),
          options: cleanOpts,
          answer: ans,
          explanation: sanitizeAiOutput(String(cp.explanation || 'Great observation!').trim()).slice(0, 160),
        });
      }
    }

    return {
      usedNano: true,
      title: polishedTitle,
      captions,
      checkpoints: checkpoints.length > 0 ? checkpoints : generateEcoCheckpoints(states, polishedTitle),
      note: 'Polished locally on-device with Gemini Nano (0 bytes sent to cloud).',
    };
  } catch {
    return ecoFallback('On-device AI busy — kept fast offline Eco Mode captions and checkpoint.');
  }
}
