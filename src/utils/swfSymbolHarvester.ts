// src/utils/swfSymbolHarvester.ts
/**
 * SWF -> Native .astb Vector Symbol Harvester & Quantizer
 *
 * Extracts individual clean vector shapes & their referenced gradients/patterns from a
 * transpiled SWF's pure-SVG output, strips ALL Flash bytecode (AVM1/AVM2), quantizes
 * path coordinates for ultra-compact gzipped payloads, and produces drop-in <defs> symbols
 * plus ready-to-paste native .ast animation bindings.
 */

export interface HarvestedSwfSymbol {
  id: string;
  originalId: string;
  label: string;
  pathCount: number;
  rawBytes: number;
  optimizedBytes: number;
  savedPercent: number;
  referencedDefIds: string[];
  defsMarkup: string;
  symbolMarkup: string;
  standaloneSvg: string;
  astBindingSnippet: string;
  viewBox: string;
}

export interface HarvestSwfSymbolsOptions {
  /** Coordinate quantization grid in SVG pixels (default: 0.5). */
  quantizeStep?: number;
  /** Maximum number of symbols to harvest (default: 24). */
  maxSymbols?: number;
  /** Prefix applied to harvested symbol and def IDs to avoid collisions. */
  idPrefix?: string;
}

/**
 * Quantizes numeric coordinates inside an SVG path `d="..."` attribute to a compact grid
 * (default 0.5 px) and strips redundant whitespace / `.0` suffixes without altering topology.
 */
export function quantizeSvgPathData(d: string, step = 0.5): string {
  if (!d) return '';
  const quantized = d.replace(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi, (token) => {
    const n = Number(token);
    if (!Number.isFinite(n)) return token;
    const snapped = step > 0 ? Math.round(n / step) * step : n;
    const rounded = Number(snapped.toFixed(2));
    return Object.is(rounded, -0) ? '0' : String(rounded);
  });
  return quantized
    .replace(/\s*([MLHVCSQTAZmlhvcsqtaz])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .replace(/ ,|, /g, ',')
    .trim();
}

/**
 * Computes an approximate tight bounding box from path coordinates so harvested symbols
 * preview cleanly in a dedicated viewBox.
 */
function estimateMarkupBounds(markup: string): { x: number; y: number; w: number; h: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const pushPt = (x: number, y: number) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };

  // Scan path d attributes
  const dRe = /\bd="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = dRe.exec(markup)) !== null) {
    const tokens = m[1].match(/[MLQCTmlqct]|-?\d*\.?\d+/g) || [];
    let cmd = 'M';
    let i = 0;
    while (i < tokens.length) {
      if (/^[A-Za-z]$/.test(tokens[i])) {
        cmd = tokens[i++];
        continue;
      }
      if (cmd === 'M' || cmd === 'L') {
        const x = Number(tokens[i++]);
        const y = Number(tokens[i++]);
        pushPt(x, y);
      } else if (cmd === 'Q') {
        const cx = Number(tokens[i++]);
        const cy = Number(tokens[i++]);
        const x = Number(tokens[i++]);
        const y = Number(tokens[i++]);
        pushPt(cx, cy);
        pushPt(x, y);
      } else if (cmd === 'C') {
        const x1 = Number(tokens[i++]);
        const y1 = Number(tokens[i++]);
        const x2 = Number(tokens[i++]);
        const y2 = Number(tokens[i++]);
        const x = Number(tokens[i++]);
        const y = Number(tokens[i++]);
        pushPt(x1, y1);
        pushPt(x2, y2);
        pushPt(x, y);
      } else {
        i++;
      }
    }
  }

  // Scan basic circle/ellipse/rect attributes if no path coordinates matched
  if (!Number.isFinite(minX)) {
    const rectRe = /<rect[^>]*>/g;
    while ((m = rectRe.exec(markup)) !== null) {
      const x = Number(m[0].match(/\bx="([^"]+)"/)?.[1] || 0);
      const y = Number(m[0].match(/\by="([^"]+)"/)?.[1] || 0);
      const w = Number(m[0].match(/\bwidth="([^"]+)"/)?.[1] || 0);
      const h = Number(m[0].match(/\bheight="([^"]+)"/)?.[1] || 0);
      pushPt(x, y);
      pushPt(x + w, y + h);
    }
  }

  if (!Number.isFinite(minX) || maxX <= minX || maxY <= minY) {
    return { x: 0, y: 0, w: 120, h: 120 };
  }

  const pad = Math.max(4, Math.round(Math.max(maxX - minX, maxY - minY) * 0.08));
  return {
    x: Math.floor(minX - pad),
    y: Math.floor(minY - pad),
    w: Math.max(12, Math.ceil(maxX - minX + pad * 2)),
    h: Math.max(12, Math.ceil(maxY - minY + pad * 2)),
  };
}

/**
 * Extracts `<defs>` child definitions keyed by their `id="..."` attribute.
 */
function indexDefsById(svgMarkup: string): Map<string, string> {
  const map = new Map<string, string>();
  const defsMatch = svgMarkup.match(/<defs[^>]*>([\s\S]*?)<\/defs>/i);
  if (!defsMatch) return map;
  const defsBody = defsMatch[1];

  const blockRe = /<(linearGradient|radialGradient|pattern|clipPath)\b[^>]*\bid="([^"]+)"[^>]*>[\s\S]*?<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(defsBody)) !== null) {
    map.set(m[2], m[0]);
  }
  return map;
}

/**
 * Extracts balanced `<g id="swf-shape-...">...</g>` blocks and `<path id="swf-morph-..." .../>`
 * elements from transpiled SWF SVG markup.
 */
function extractRawSwfShapeBlocks(svgMarkup: string): Array<{ id: string; raw: string }> {
  const results: Array<{ id: string; raw: string }> = [];
  const seen = new Set<string>();

  // 1. Balanced <g id="swf-shape-..."> blocks
  const openRe = /<g\b[^>]*\bid="(swf-shape-[^"]+)"[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = openRe.exec(svgMarkup)) !== null) {
    const id = m[1];
    if (seen.has(id)) continue;
    const startIdx = m.index;
    const openTag = m[0];
    if (openTag.endsWith('/>')) continue; // skip empty shapes

    let depth = 1;
    let cursor = startIdx + openTag.length;
    const tagRe = /<\/?g\b[^>]*>/g;
    tagRe.lastIndex = cursor;
    let endIdx = -1;
    let tm: RegExpExecArray | null;
    while ((tm = tagRe.exec(svgMarkup)) !== null) {
      if (tm[0].startsWith('</g')) {
        depth--;
        if (depth === 0) {
          endIdx = tm.index + tm[0].length;
          break;
        }
      } else if (!tm[0].endsWith('/>')) {
        depth++;
      }
    }
    if (endIdx > startIdx) {
      seen.add(id);
      results.push({ id, raw: svgMarkup.slice(startIdx, endIdx) });
    }
  }

  // 2. Standalone morph paths <path id="swf-morph-..." ... />
  const morphRe = /<path\b[^>]*\bid="(swf-morph-[^"]+)"[^>]*\/?>/g;
  while ((m = morphRe.exec(svgMarkup)) !== null) {
    const id = m[1];
    if (seen.has(id)) continue;
    seen.add(id);
    results.push({ id, raw: m[0] });
  }

  return results;
}

/**
 * Harvests clean, quantized, zero-bytecode W3C SVG `<defs>` symbols from a transpiled SWF.
 * Only gradients/patterns actually referenced by each symbol are bundled into its output.
 */
export function harvestSwfSymbols(
  svgMarkup: string,
  options: HarvestSwfSymbolsOptions = {}
): HarvestedSwfSymbol[] {
  if (!svgMarkup || typeof svgMarkup !== 'string') return [];

  const quantizeStep = options.quantizeStep ?? 0.5;
  const maxSymbols = Math.max(1, Math.min(64, options.maxSymbols ?? 24));
  const cleanPrefix = (options.idPrefix || 'sym')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'sym';

  const defsById = indexDefsById(svgMarkup);
  const rawBlocks = extractRawSwfShapeBlocks(svgMarkup);
  const harvested: HarvestedSwfSymbol[] = [];

  for (let idx = 0; idx < rawBlocks.length && harvested.length < maxSymbols; idx++) {
    const { id: originalId, raw } = rawBlocks[idx];
    const pathMatches = raw.match(/<path\b/g) || [];
    if (pathMatches.length === 0 && !/<(?:circle|ellipse|rect|polygon)\b/.test(raw)) {
      continue;
    }

    const newId = `${cleanPrefix}-${idx + 1}`;

    // Quantize all path d="..." values and strip redundant whitespace / Flash-only data attributes
    let optimized = raw
      .replace(/\bd="([^"]+)"/g, (_full, dVal) => `d="${quantizeSvgPathData(dVal, quantizeStep)}"`)
      .replace(/\s+data-swf-[a-z0-9-]+="[^"]*"/gi, '')
      .replace(/\bid="[^"]+"/, `id="${newId}"`)
      .replace(/>\s+</g, '><')
      .trim();

    // Collect only referenced url(#...) defs and namespace them cleanly
    const refIds = new Set<string>();
    const urlRe = /url\(#([^)]+)\)/g;
    let um: RegExpExecArray | null;
    while ((um = urlRe.exec(optimized)) !== null) {
      refIds.add(um[1]);
    }

    const bundledDefs: string[] = [];
    const referencedDefIds: string[] = [];
    for (const defId of refIds) {
      const defXml = defsById.get(defId);
      if (!defXml) continue;
      const namespacedDefId = `${newId}-${defId.replace(/[^a-z0-9_-]/gi, '')}`;
      referencedDefIds.push(namespacedDefId);
      const compactDef = defXml
        .replace(`id="${defId}"`, `id="${namespacedDefId}"`)
        .replace(/>\s+</g, '><')
        .trim();
      bundledDefs.push(compactDef);
      optimized = optimized.split(`url(#${defId})`).join(`url(#${namespacedDefId})`);
    }

    const defsMarkup = bundledDefs.length > 0 ? `<defs>${bundledDefs.join('')}</defs>` : '';
    const bounds = estimateMarkupBounds(optimized);
    const viewBox = `${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}`;

    const standaloneSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${defsMarkup}${optimized}</svg>`;

    const rawBytes = raw.length + Array.from(refIds).reduce((acc, k) => acc + (defsById.get(k)?.length || 0), 0);
    const optimizedBytes = defsMarkup.length + optimized.length;
    const savedPercent =
      rawBytes > 0 ? Math.max(0, Math.round(((rawBytes - optimizedBytes) / rawBytes) * 100)) : 0;

    const astBindingSnippet = `;; Drop <defs> + <g id="${newId}"> into your cartridge .svg, then stamp with <use id="${newId}-actor" href="#${newId}"/>
(:bindings (
  (:target "#${newId}-actor" :attr "transform" :expr "'translate(240,180) scale(' + (1 + Math.sin(t * 6.283) * 0.06).toFixed(3) + ',' + (1 - Math.sin(t * 6.283) * 0.06).toFixed(3) + ')'")
))`;

    harvested.push({
      id: newId,
      originalId,
      label: originalId.replace(/^swf-/, '').replace(/-/g, ' '),
      pathCount: Math.max(1, pathMatches.length),
      rawBytes,
      optimizedBytes,
      savedPercent,
      referencedDefIds,
      defsMarkup,
      symbolMarkup: `${defsMarkup}${optimized}`,
      standaloneSvg,
      astBindingSnippet,
      viewBox,
    });
  }

  return harvested;
}
