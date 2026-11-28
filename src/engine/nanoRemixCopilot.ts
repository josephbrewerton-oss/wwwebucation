// src/engine/nanoRemixCopilot.ts
/**
 * On-Device Gemini Nano Remix Co-Pilot
 * 100% local execution (Chrome Prompt API -> WebLLM -> Deterministic Remix Synthesizer).
 * Zero cloud egress: protects pupil privacy under UK GDPR / DfE Children's Code.
 */

import {
  aiCaller,
  hasUserGrantedAiConsent,
} from './aicaller';
import {
  validateStudentInput,
  sanitizeAiOutput,
  CHILD_SAFEGUARDING_SYSTEM_PROMPT,
} from '../services/childSafetyFilter';

export interface RemixSvgElementInfo {
  id: string;
  tag: string;
}

export interface NanoRemixContext {
  requestId?: string;
  sceneId: string;
  sceneTitle: string;
  stage?: string;
  activeTab: string;
  selectedSvgId?: string | null;
  svgIds: RemixSvgElementInfo[];
  astTargets: string[];
  missingTargets: string[];
  currentAst: string;
  currentSlideScript?: string;
  currentVars?: Record<string, any>;
  prompt: string;
}

export interface NanoRemixProposal {
  requestId?: string;
  explanation: string;
  mode: 'patch_ast' | 'patch_svg' | 'patch_both' | 'patch_slidescript' | 'advice_only';
  nextAst?: string;
  appendSvgXml?: string;
  nextSlideScript?: string;
  matchedCount?: number;
  totalTargets?: number;
  missingAfterPatch?: string[];
  engineUsed: 'chrome-builtin-nano' | 'webgpu-webllm' | 'deterministic-remix';
}

const SAFE_COLOR_WORDS: Record<string, string> = {
  red: '#ef4444',
  crimson: '#dc2626',
  blue: '#38bdf8',
  navy: '#1d4ed8',
  cyan: '#06b6d4',
  green: '#22c55e',
  emerald: '#10b981',
  yellow: '#eab308',
  gold: '#f59e0b',
  amber: '#f59e0b',
  orange: '#f97316',
  purple: '#a855f7',
  violet: '#8b5cf6',
  pink: '#ec4899',
  white: '#f8fafc',
  silver: '#cbd5e1',
};

export function hasBalancedParens(text: string): boolean {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth < 0) return false;
      }
    }
  }
  return depth === 0 && !inString;
}

export function extractBalancedScene(raw: string): string | null {
  const cleaned = String(raw || '')
    .replace(/^```[a-z]*\s*/im, '')
    .replace(/\s*```$/im, '')
    .trim();
  const start = cleaned.search(/\(:scene\b/i);
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth === 0) {
          return cleaned.slice(start, i + 1);
        }
      }
    }
  }
  return null;
}

export function sanitizeSvgFragment(xml: string): string {
  const clean = String(xml || '').trim();
  if (!clean || clean.length > 16384) return '';
  const stripped = clean.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  // Reject script/foreignObject/iframe/object/embed/style/SMIL-href-mutation/event handlers/unsafe URI or CSS functions
  if (
    /<(?:script|foreignobject|iframe|object|embed|style|link|meta)\b/i.test(stripped) ||
    /\bon[a-z]{2,20}\s*=/i.test(stripped) ||
    /(?:javascript|vbscript|data)\s*:/i.test(stripped) ||
    /\bxlink:href\b/i.test(stripped) ||
    /\battributeName\s*=\s*["']?\s*(?:href|xlink:href|src|style|on[a-z]+)/i.test(stripped) ||
    /\bstyle\s*=\s*["'][^"']*(?:expression\s*\(|url\s*\(|@import|behavior\s*:)/i.test(stripped)
  ) {
    return '';
  }
  // Allow safe geometric SVG primitives only
  if (!/<(g|circle|rect|ellipse|line|polygon|polyline|path|text)\b/i.test(stripped)) {
    return '';
  }
  return stripped;
}

function extractAstTargets(astText: string): string[] {
  const targets = new Set<string>();
  const re = /:(?:target|selector|actor)\s+"?#([a-zA-Z0-9_\-:]+)"?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(astText)) !== null) {
    if (m[1]) targets.add(m[1]);
  }
  return Array.from(targets);
}

function computeMatchSummary(astText: string, svgIds: RemixSvgElementInfo[], appendSvgXml?: string) {
  const svgSet = new Set(svgIds.map((s) => s.id));
  if (appendSvgXml) {
    const idRe = /\bid\s*=\s*["']([^"']+)["']/gi;
    let m: RegExpExecArray | null;
    while ((m = idRe.exec(appendSvgXml)) !== null) {
      if (m[1]) svgSet.add(m[1]);
    }
  }
  const targets = extractAstTargets(astText);
  const missingAfterPatch = targets.filter((id) => !svgSet.has(id));
  return {
    matchedCount: targets.length - missingAfterPatch.length,
    totalTargets: targets.length,
    missingAfterPatch,
  };
}

/**
 * Inserts an S-expression entry into a top-level section (e.g. :vars, :inputs, :bindings, :interactive).
 * Creates the section cleanly before the closing ) of (:scene ...) if it does not yet exist.
 */
function insertIntoAstSection(astSource: string, sectionName: string, entrySExpr: string): string {
  const trimmed = (astSource || '').trim() || '(:scene :id "custom-remix" :title "Custom Remix" :stage "KS3 STEM" :duration 10.0 (:bindings ()))';
  const sectionPattern = new RegExp(`\\(:${sectionName}\\s*\\(`, 'i');
  const match = sectionPattern.exec(trimmed);
  if (match) {
    const insertPos = match.index + match[0].length;
    return `${trimmed.slice(0, insertPos)}\n    ${entrySExpr}${trimmed.slice(insertPos)}`;
  }

  const lastParen = trimmed.lastIndexOf(')');
  if (lastParen > 0) {
    return `${trimmed.slice(0, lastParen)}\n  (:${sectionName} (\n    ${entrySExpr}\n  ))\n)`;
  }
  return `${trimmed}\n(:${sectionName} (\n  ${entrySExpr}\n))`;
}

function findBestTargetId(prompt: string, ctx: NanoRemixContext): string | null {
  const explicitHash = prompt.match(/#([a-zA-Z0-9_\-:]+)/);
  if (explicitHash && ctx.svgIds.some((s) => s.id === explicitHash[1])) {
    return explicitHash[1];
  }
  const lower = prompt.toLowerCase();
  const byToken = ctx.svgIds.find((s) => lower.includes(s.id.toLowerCase()) || lower.includes(s.id.toLowerCase().replace(/[-_]/g, ' ')));
  if (byToken) return byToken.id;
  if (ctx.selectedSvgId && ctx.svgIds.some((s) => s.id === ctx.selectedSvgId)) {
    return ctx.selectedSvgId;
  }
  const nonBg = ctx.svgIds.find((s) => !/bg|background|grid|frame|axis|canvas/i.test(s.id));
  return (nonBg || ctx.svgIds[0])?.id || null;
}

function detectColorFromPrompt(prompt: string): string | null {
  const hex = prompt.match(/#[0-9a-fA-F]{3,6}\b/);
  if (hex && hex[0].length >= 4) return hex[0];
  const lower = prompt.toLowerCase();
  for (const [word, code] of Object.entries(SAFE_COLOR_WORDS)) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(lower)) return code;
  }
  return null;
}

/**
 * Tier 3: Deterministic Offline Remix Co-Pilot Synthesizer (< 2ms, 0 external deps)
 */
export function synthesizeDeterministicRemix(ctx: NanoRemixContext): NanoRemixProposal {
  const prompt = (ctx.prompt || '').trim();
  const lower = prompt.toLowerCase();
  const baseAst = (ctx.currentAst || '').trim() ||
    `(:scene :id "${ctx.sceneId || 'custom-remix'}" :title "${ctx.sceneTitle || 'Custom Remix'}" :stage "${ctx.stage || 'STEM'}" :duration 10.0 (:bindings ()))`;

  // 1. Debug / Fix Mismatches / Why isn't it moving?
  if (/(fix|debug|why|broken|missing|not moving|doesn't move|mismatch|error|help)/i.test(lower)) {
    let nextAst = baseAst;
    const notes: string[] = [];

    if (!hasBalancedParens(nextAst)) {
      let open = 0;
      let close = 0;
      for (const ch of nextAst) {
        if (ch === '(') open++;
        else if (ch === ')') close++;
      }
      if (open > close) {
        nextAst = `${nextAst}${')'.repeat(open - close)}`;
        notes.push(`Closed ${open - close} missing parenthesis`);
      }
    }

    let appendSvgXml = '';
    if (ctx.missingTargets.length > 0) {
      const remapped: string[] = [];
      const created: string[] = [];
      for (const missingId of ctx.missingTargets) {
        const similar = ctx.svgIds.find((s) =>
          s.id.toLowerCase().includes(missingId.toLowerCase()) ||
          missingId.toLowerCase().includes(s.id.toLowerCase())
        );
        if (similar) {
          const esc = missingId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          nextAst = nextAst.replace(new RegExp(`#${esc}(?=["'\\s)])`, 'g'), `#${similar.id}`);
          remapped.push(`#${missingId} → #${similar.id}`);
        } else {
          appendSvgXml += `  <g id="${missingId}">\n    <circle cx="400" cy="240" r="32" fill="#38bdf8" fill-opacity="0.3" stroke="#38bdf8" stroke-width="3" />\n    <text x="400" y="245" fill="#f8fafc" font-size="12" font-weight="700" text-anchor="middle">${missingId}</text>\n  </g>\n`;
          created.push(`#${missingId}`);
        }
      }
      if (remapped.length) notes.push(`Remapped ${remapped.join(', ')}`);
      if (created.length) notes.push(`Created matching SVG nodes for ${created.join(', ')}`);
    }

    if (notes.length === 0 && ctx.astTargets.length === 0 && ctx.svgIds.length > 0) {
      const targetId = findBestTargetId(prompt, ctx);
      if (targetId) {
        nextAst = insertIntoAstSection(
          nextAst,
          'bindings',
          `(:target "#${targetId}" :attr "transform" :expr "'translate(0, ' + (Math.sin(t * Math.PI * 2) * 14).toFixed(1) + ')'")`
        );
        notes.push(`Added live motion binding to existing shape #${targetId} because the scene had no :bindings rules yet`);
      }
    }

    if (notes.length > 0) {
      const summary = computeMatchSummary(nextAst, ctx.svgIds, appendSvgXml);
      return {
        requestId: ctx.requestId,
        mode: appendSvgXml ? 'patch_both' : 'patch_ast',
        nextAst,
        appendSvgXml: appendSvgXml || undefined,
        explanation: `Nano Diagnostics: ${notes.join('. ')}.`,
        ...summary,
        engineUsed: 'deterministic-remix',
      };
    }

    return {
      requestId: ctx.requestId,
      mode: 'advice_only',
      explanation: `Parentheses are balanced and ${ctx.astTargets.length} AST target(s) already match your SVG (${ctx.svgIds.length} shape IDs available). Try asking: "Add a slider for speed" or "Make #${findBestTargetId(prompt, ctx) || 'shape'} pulse".`,
      matchedCount: ctx.astTargets.length,
      totalTargets: ctx.astTargets.length,
      missingAfterPatch: [],
      engineUsed: 'deterministic-remix',
    };
  }

  // 2. Add a new SVG Shape + matching AST binding
  if (/(add|create|draw|insert)\s+(a\s+|an\s+|new\s+)?(circle|box|rect|square|shape|badge|planet|ball|marker|label)/i.test(lower)) {
    const color = detectColorFromPrompt(prompt) || '#38bdf8';
    const isRect = /(box|rect|square|badge|panel)/i.test(lower);
    const nameMatch = prompt.match(/(?:called|named|id)\s+["']?([a-zA-Z][a-zA-Z0-9_-]{1,20})["']?/i);
    const baseName = nameMatch
      ? nameMatch[1].toLowerCase()
      : isRect ? 'remix-badge' : 'remix-orb';
    let uniqueId = baseName;
    let suffix = 2;
    while (ctx.svgIds.some((s) => s.id === uniqueId)) {
      uniqueId = `${baseName}-${suffix++}`;
    }

    const appendSvgXml = isRect
      ? `  <g id="${uniqueId}">\n    <rect x="330" y="195" width="140" height="52" rx="10" fill="${color}" fill-opacity="0.26" stroke="${color}" stroke-width="3" />\n    <text x="400" y="226" fill="#f8fafc" font-size="14" font-weight="800" text-anchor="middle">${uniqueId}</text>\n  </g>\n`
      : `  <g id="${uniqueId}">\n    <circle cx="400" cy="240" r="30" fill="${color}" fill-opacity="0.32" stroke="${color}" stroke-width="3" />\n    <text x="400" y="244" fill="#f8fafc" font-size="12" font-weight="800" text-anchor="middle">${uniqueId}</text>\n  </g>\n`;

    const nextAst = insertIntoAstSection(
      baseAst,
      'bindings',
      `(:target "#${uniqueId}" :attr "transform" :expr "'translate(0, ' + (Math.sin(t * Math.PI * 2) * 18).toFixed(1) + ')'")`
    );
    const summary = computeMatchSummary(nextAst, ctx.svgIds, appendSvgXml);
    return {
      requestId: ctx.requestId,
      mode: 'patch_both',
      nextAst,
      appendSvgXml,
      explanation: `Added SVG shape <g id="${uniqueId}"> and matched it with a smooth motion binding in your .ast file.`,
      ...summary,
      engineUsed: 'deterministic-remix',
    };
  }

  // 3. Add a Slider / Variable + bind it
  if (/(slider|variable|var|control|dial|parameter|input)/i.test(lower)) {
    const forMatch = prompt.match(/(?:for|named|called)\s+([a-zA-Z][a-zA-Z0-9_ ]{1,24}?)(?:\s+from|\s+between|\s*$)/i);
    const rawName = (forMatch ? forMatch[1].trim() : 'boost')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'boost';
    const rangeMatch = prompt.match(/from\s+(-?\d+(?:\.\d+)?)\s+to\s+(-?\d+(?:\.\d+)?)/i);
    const minVal = rangeMatch ? Number(rangeMatch[1]) : 0;
    const maxVal = rangeMatch ? Number(rangeMatch[2]) : 10;
    const midVal = Number(((minVal + maxVal) / 2).toFixed(1));
    const stepVal = maxVal - minVal <= 5 ? 0.5 : 1;
    const label = rawName.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    let nextAst = insertIntoAstSection(
      baseAst,
      'vars',
      `(:var :name "${rawName}" :val ${midVal} :min ${minVal} :max ${maxVal} :step ${stepVal} :label "${label}")`
    );
    nextAst = insertIntoAstSection(
      nextAst,
      'inputs',
      `(:slider :var "${rawName}" :label "${label}" :min ${minVal} :max ${maxVal} :step ${stepVal})`
    );

    const targetId = findBestTargetId(prompt, ctx);
    if (targetId) {
      nextAst = insertIntoAstSection(
        nextAst,
        'bindings',
        `(:target "#${targetId}" :attr "transform" :expr "'scale(' + (0.7 + 0.6 * ((vars.${rawName} - ${minVal}) / ${Math.max(1, maxVal - minVal)})).toFixed(2) + ')'")`
      );
    }

    const summary = computeMatchSummary(nextAst, ctx.svgIds);
    return {
      requestId: ctx.requestId,
      mode: 'patch_ast',
      nextAst,
      explanation: `Added variable "${rawName}" (${minVal}–${maxVal}) and live slider control${targetId ? `, wired to #${targetId}` : ''}.`,
      ...summary,
      engineUsed: 'deterministic-remix',
    };
  }

  // 4. Add a Checkpoint Quiz
  if (/(checkpoint|quiz|question|test)/i.test(lower)) {
    const safeTopic = (ctx.sceneTitle || ctx.sceneId || 'this model').replace(/"/g, "'");
    const cpExpr = `(:checkpoint :t 0.5 :title "Remix Mastery Check" :prompt "When you adjust the key variable in ${safeTopic}, how does the visual output respond?" :options ("It responds proportionally according to the model" "Nothing changes on stage" "It resets to zero immediately") :answer 0 :explanation "The AST binding recalculates the SVG geometry live from your active variable.")`;
    const nextAst = insertIntoAstSection(baseAst, 'interactive', cpExpr);
    const summary = computeMatchSummary(nextAst, ctx.svgIds);
    return {
      requestId: ctx.requestId,
      mode: 'patch_ast',
      nextAst,
      explanation: `Inserted a pupil checkpoint quiz at t = 0.50 into (:interactive ...).`,
      ...summary,
      engineUsed: 'deterministic-remix',
    };
  }

  // 5. Animate / Rotate / Pulse / Colour an existing SVG target
  const targetId = findBestTargetId(prompt, ctx);
  if (targetId) {
    const color = detectColorFromPrompt(prompt);
    let bindingExpr = `(:target "#${targetId}" :attr "opacity" :expr "0.45 + 0.55 * Math.abs(Math.sin(t * Math.PI * 2))")`;
    let actionDesc = `added a smooth pulse animation to #${targetId}`;

    if (/(spin|rotate|turn|orbit|angle)/i.test(lower)) {
      bindingExpr = `(:target "#${targetId}" :attr "transform" :expr "'rotate(' + (t * 360).toFixed(1) + ' 400 240)'")`;
      actionDesc = `added a 360° rotation binding to #${targetId}`;
    } else if (/(move|slide|bounce|float|oscillate|wave|faster|speed)/i.test(lower)) {
      const freq = /(fast|quick|double|2x)/i.test(lower) ? 4 : 2;
      bindingExpr = `(:target "#${targetId}" :attr "transform" :expr "'translate(' + (Math.sin(t * Math.PI * ${freq}) * 35).toFixed(1) + ', ' + (Math.cos(t * Math.PI * ${freq}) * 18).toFixed(1) + ')'")`;
      actionDesc = `added dynamic orbital motion to #${targetId}`;
    } else if (color) {
      bindingExpr = `(:target "#${targetId}" :attr "fill" :expr "'${color}'")`;
      actionDesc = `updated #${targetId} fill colour to ${color}`;
    }

    const nextAst = insertIntoAstSection(baseAst, 'bindings', bindingExpr);
    const summary = computeMatchSummary(nextAst, ctx.svgIds);
    return {
      requestId: ctx.requestId,
      mode: 'patch_ast',
      nextAst,
      explanation: `Remix ready: ${actionDesc} (verified against your SVG IDs).`,
      ...summary,
      engineUsed: 'deterministic-remix',
    };
  }

  return {
    requestId: ctx.requestId,
    mode: 'advice_only',
    explanation: `Ready to remix "${ctx.sceneTitle || ctx.sceneId}". Try: "Add a slider for speed from 1 to 10", "Make #${ctx.svgIds[0]?.id || 'shape'} spin", "Add a green circle", or "Add a checkpoint quiz".`,
    matchedCount: ctx.astTargets.length,
    totalTargets: ctx.astTargets.length,
    missingAfterPatch: ctx.missingTargets,
    engineUsed: 'deterministic-remix',
  };
}

/**
 * Primary Entrypoint: Calls on-device Gemini Nano / WebLLM with compact zero-bloat SVG inventory,
 * validates S-Expression output + SVG ID matching, and falls back deterministically offline.
 */
export async function promptAiRemixAssistant(ctx: NanoRemixContext): Promise<NanoRemixProposal> {
  const cleanPrompt = (ctx.prompt || '').trim();
  if (!cleanPrompt) {
    return synthesizeDeterministicRemix(ctx);
  }

  const safety = validateStudentInput(cleanPrompt);
  if (!safety.isSafe) {
    return {
      requestId: ctx.requestId,
      mode: 'advice_only',
      explanation: safety.safeReplacementText || 'Let us keep our coding remixes safe and focused on your lesson.',
      engineUsed: 'deterministic-remix',
    };
  }

  // Honor Eco Mode & UK GDPR consent: stay deterministic unless the user explicitly enabled local AI
  if (!hasUserGrantedAiConsent()) {
    return synthesizeDeterministicRemix(ctx);
  }

  const canUseLlm = aiCaller.hasNativePromptApi() || aiCaller.hasWebLlmFallback();
  if (!canUseLlm) {
    return synthesizeDeterministicRemix(ctx);
  }

  const svgListStr = ctx.svgIds
    .slice(0, 35)
    .map((s) => `#${s.id} (<${s.tag}>)`)
    .join(', ');

  const systemPrompt = `${CHILD_SAFEGUARDING_SYSTEM_PROMPT}
You are Gemini Nano, an on-device coding remix co-pilot for school pupils (KS2-KS4) editing SVG + AST S-Expression simulations.
SCENE: id="${ctx.sceneId}" title="${ctx.sceneTitle}" stage="${ctx.stage || 'STEM'}"
SELECTED ELEMENT: ${ctx.selectedSvgId ? `#${ctx.selectedSvgId}` : 'none'}
EXISTING SVG ELEMENT IDs: ${svgListStr || 'none'}
CURRENT AST TARGETS: ${ctx.astTargets.map((id) => `#${id}`).join(', ') || 'none'}
MISSING IN SVG: ${ctx.missingTargets.map((id) => `#${id}`).join(', ') || 'none'}
ACTIVE VARIABLES: ${JSON.stringify(ctx.currentVars || {})}

RULES:
1. Keep remixes age-appropriate, educational, and syntactically valid.
2. Only reference :target "#id" values that exist in EXISTING SVG ELEMENT IDs, OR include new valid <g id="..."> SVG XML in "appendSvgXml".
3. Preserve balanced parentheses in the complete (:scene ...) S-Expression.
4. Reply STRICTLY as a single JSON object matching:
{
  "explanation": "1-2 short kid-friendly sentences explaining your edit or answer",
  "mode": "patch_ast" | "patch_svg" | "patch_both" | "advice_only",
  "nextAst": "complete updated (:scene ...) S-expression if AST changed, or empty string",
  "appendSvgXml": "optional <g id=\\"...\\">...</g> SVG snippet to insert before </svg>, or empty string"
}`;

  const trimmedAst = (ctx.currentAst || '').slice(0, 3800);
  const userPrompt = `Pupil request: "${cleanPrompt}"\n\nCurrent AST:\n${trimmedAst}`;

  try {
    const raw = await aiCaller.promptText({
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.15,
      timeoutMs: 18000,
    });

    const engineUsed: NanoRemixProposal['engineUsed'] = aiCaller.hasNativePromptApi()
      ? 'chrome-builtin-nano'
      : 'webgpu-webllm';

    // 1. Try JSON extraction first
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        const explanation = sanitizeAiOutput(String(parsed.explanation || 'Updated your remix!')).slice(0, 360);
        const safeSvg = sanitizeSvgFragment(parsed.appendSvgXml || '');
        const candidateAst = extractBalancedScene(parsed.nextAst || '');

        if (candidateAst && hasBalancedParens(candidateAst)) {
          const summary = computeMatchSummary(candidateAst, ctx.svgIds, safeSvg);
          return {
            requestId: ctx.requestId,
            explanation,
            mode: safeSvg ? 'patch_both' : 'patch_ast',
            nextAst: candidateAst,
            appendSvgXml: safeSvg || undefined,
            ...summary,
            engineUsed,
          };
        }

        if (safeSvg) {
          return {
            requestId: ctx.requestId,
            explanation,
            mode: 'patch_svg',
            appendSvgXml: safeSvg,
            ...computeMatchSummary(ctx.currentAst, ctx.svgIds, safeSvg),
            engineUsed,
          };
        }

        if (parsed.mode === 'advice_only' && explanation) {
          return {
            requestId: ctx.requestId,
            explanation,
            mode: 'advice_only',
            engineUsed,
          };
        }
      } catch {
        // Fall through to raw S-expression extraction or deterministic remix
      }
    }

    // 2. Fallback: Did Nano emit a bare (:scene ...) S-expression?
    const extractedScene = extractBalancedScene(raw);
    if (extractedScene && hasBalancedParens(extractedScene)) {
      const summary = computeMatchSummary(extractedScene, ctx.svgIds);
      return {
        requestId: ctx.requestId,
        explanation: 'Gemini Nano updated your AST S-Expression.',
        mode: 'patch_ast',
        nextAst: extractedScene,
        ...summary,
        engineUsed,
      };
    }

    // 3. Guarantee usable edit on weak local LLM response by merging deterministic remix
    return synthesizeDeterministicRemix(ctx);
  } catch (err) {
    console.warn('[NanoRemixCopilot] Falling back to deterministic remix:', err);
    return synthesizeDeterministicRemix(ctx);
  }
}
