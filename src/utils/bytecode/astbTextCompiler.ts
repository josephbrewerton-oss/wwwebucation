// src/utils/bytecode/astbTextCompiler.ts
/**
 * AST S-Expression Text Frontend & `:for` Macro Expander -> Binary `.astb` Compiler.
 */

import type {
  AstBytecodeCompileOptions,
  AstCheckpointConfig,
  AstLedgerConfig,
  AstLedgerTerm,
  AstScopeConfig,
} from './astbSchema';
import { compileSceneToBytecode } from './astbEncoder';

function extractSexprBlocks(text: string, tag: string): string[] {
  const blocks: string[] = [];
  const safeTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startRegex = new RegExp('\\(' + safeTag + '[\\s)]', 'gi');
  let m: RegExpExecArray | null;
  while ((m = startRegex.exec(text)) !== null) {
    const startIdx = m.index;
    let depth = 0;
    let inString = false;
    let endIdx = -1;
    for (let i = startIdx; i < text.length; i++) {
      const char = text[i];
      if (!inString && char === ';') {
        const nl = text.indexOf('\n', i);
        if (nl === -1) break;
        i = nl;
        continue;
      }
      if (!inString && char === '<' && text.startsWith('<!--', i)) {
        const endC = text.indexOf('-->', i + 4);
        if (endC === -1) break;
        i = endC + 2;
        continue;
      }
      if (char === '"' && (i === 0 || text[i - 1] !== '\\')) {
        inString = !inString;
      } else if (!inString) {
        if (char === '(') depth++;
        else if (char === ')') {
          depth--;
          if (depth === 0) {
            endIdx = i + 1;
            break;
          }
        }
      }
    }
    if (endIdx !== -1) {
      blocks.push(text.slice(startIdx, endIdx));
    }
  }
  return blocks;
}

function expandForMacrosTs(src: string, depth = 0): string {
  if (!src || depth > 6 || !/\(\s*:(?:for|repeat)\b/i.test(src)) return src;
  const MAX_ITERS = 512;
  let out = '';
  let i = 0;
  const n = src.length;
  let inStr = false;
  while (i < n) {
    const ch = src[i];
    if (ch === ';' && !inStr) {
      const nl = src.indexOf('\n', i);
      if (nl === -1) { out += src.slice(i); break; }
      out += src.slice(i, nl + 1);
      i = nl + 1;
      continue;
    }
    if (ch === '"' && (i === 0 || src[i - 1] !== '\\')) {
      inStr = !inStr;
      out += ch;
      i++;
      continue;
    }
    if (!inStr && ch === '(' && /^\(\s*:(?:for|repeat)\s+/i.test(src.slice(i, i + 16))) {
      let d = 0;
      let sIn = false;
      let endIdx = -1;
      for (let j = i; j < n; j++) {
        const c = src[j];
        if (c === '"' && (j === 0 || src[j - 1] !== '\\')) sIn = !sIn;
        else if (!sIn) {
          if (c === '(') d++;
          else if (c === ')') {
            d--;
            if (d === 0) { endIdx = j + 1; break; }
          }
        }
      }
      if (endIdx !== -1) {
        const form = src.slice(i, endIdx);
        const hdrMatch = form.match(/^\(\s*:(?:for|repeat)\s+([a-zA-Z_][a-zA-Z0-9_-]*)\s+\(/i);
        if (hdrMatch) {
          const varName = hdrMatch[1];
          const specOpen = hdrMatch[0].length - 1;
          let sd = 0;
          let sStr = false;
          let specEnd = -1;
          for (let j = specOpen; j < form.length; j++) {
            const c = form[j];
            if (c === '"' && (j === 0 || form[j - 1] !== '\\')) sStr = !sStr;
            else if (!sStr) {
              if (c === '(') sd++;
              else if (c === ')') {
                sd--;
                if (sd === 0) { specEnd = j; break; }
              }
            }
          }
          if (specEnd !== -1) {
            const specInside = form.slice(specOpen + 1, specEnd).trim();
            const bodyRaw = form.slice(specEnd + 1, form.length - 1);
            const values: string[] = [];
            const rangeMatch = specInside.match(/^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)(?:\s+(-?\d+(?:\.\d+)?))?$/);
            if (rangeMatch) {
              const start = Number(rangeMatch[1]);
              const end = Number(rangeMatch[2]);
              let step = rangeMatch[3] !== undefined ? Number(rangeMatch[3]) : (end >= start ? 1 : -1);
              if (!Number.isFinite(step) || step === 0) step = end >= start ? 1 : -1;
              let iter = 0;
              for (let cur = start; step > 0 ? cur <= end + 1e-9 : cur >= end - 1e-9; cur += step) {
                if (++iter > MAX_ITERS) break;
                values.push(Number.isInteger(cur) ? String(cur) : String(Number(cur.toFixed(6))));
              }
            } else {
              const tokRe = /"((?:[^"\\]|\\.)*)"|([^\s()]+)/g;
              let tm: RegExpExecArray | null;
              let iter = 0;
              while ((tm = tokRe.exec(specInside)) !== null && ++iter <= MAX_ITERS) {
                values.push(tm[1] !== undefined ? tm[1].replace(/\\"/g, '"') : tm[2]);
              }
            }
            const safeVar = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const tplRe = new RegExp(`\\{\\{\\s*${safeVar}(?:\\s*([+\\-*])\\s*(-?\\d+(?:\\.\\d+)?))?\\s*\\}\\}`, 'g');
            let expanded = '';
            for (const vStr of values) {
              const vNum = Number(vStr);
              const substituted = bodyRaw.replace(tplRe, (_all, op, operandStr) => {
                if (!op || !Number.isFinite(vNum)) return vStr;
                const rhs = Number(operandStr);
                const res = op === '+' ? vNum + rhs : (op === '-' ? vNum - rhs : vNum * rhs);
                return Number.isInteger(res) ? String(res) : String(Number(res.toFixed(6)));
              });
              expanded += '\n' + expandForMacrosTs(substituted, depth + 1);
            }
            out += expanded;
            i = endIdx;
            continue;
          }
        }
      }
    }
    out += ch;
    i++;
  }
  return out;
}

function skipWsAndCommentsTs(text: string, pos: number): number {
  let idx = pos;
  while (idx < text.length) {
    if (text[idx] === ';') {
      const nl = text.indexOf('\n', idx);
      idx = nl === -1 ? text.length : nl + 1;
    } else if (text[idx] === '<' && text.startsWith('<!--', idx)) {
      const endC = text.indexOf('-->', idx + 4);
      idx = endC === -1 ? text.length : endC + 3;
    } else if (/\s/.test(text[idx])) {
      idx++;
    } else {
      break;
    }
  }
  return idx;
}

function extractChildFormsTs(blockText: string): string[] {
  const forms: string[] = [];
  if (!blockText) return forms;
  const searchStart = blockText.indexOf('(');
  if (searchStart === -1) return forms;
  const trimmed = blockText.slice(searchStart).trim();
  let innerStart = 1;
  const tagMatch = trimmed.match(/^\(\s*:[a-zA-Z0-9_-]+/);
  if (tagMatch) {
    const p = skipWsAndCommentsTs(trimmed, tagMatch[0].length);
    if (trimmed[p] === '(') {
      const q = skipWsAndCommentsTs(trimmed, p + 1);
      if (trimmed[q] === '(' || trimmed[q] === ')') {
        innerStart = p + 1;
      }
    }
  }
  let i = innerStart;
  while (i < trimmed.length) {
    const ch = trimmed[i];
    if (ch === ';') {
      while (i < trimmed.length && trimmed[i] !== '\n') i++;
      continue;
    }
    if (ch === '<' && trimmed.startsWith('<!--', i)) {
      const endC = trimmed.indexOf('-->', i + 4);
      i = endC === -1 ? trimmed.length : endC + 3;
      continue;
    }
    if (ch === '"') {
      i++;
      while (i < trimmed.length) {
        if (trimmed[i] === '\\') { i += 2; continue; }
        if (trimmed[i] === '"') { i++; break; }
        i++;
      }
      continue;
    }
    if (ch === '(') {
      let depth = 0;
      let inStr = false;
      const fStart = i;
      let fEnd = -1;
      for (; i < trimmed.length; i++) {
        const c = trimmed[i];
        if (!inStr && c === ';') {
          const nl = trimmed.indexOf('\n', i);
          if (nl === -1) { i = trimmed.length; break; }
          i = nl;
          continue;
        }
        if (!inStr && c === '<' && trimmed.startsWith('<!--', i)) {
          const endC = trimmed.indexOf('-->', i + 4);
          if (endC === -1) { i = trimmed.length; break; }
          i = endC + 2;
          continue;
        }
        if (c === '"' && (i === 0 || trimmed[i - 1] !== '\\')) inStr = !inStr;
        else if (!inStr) {
          if (c === '(') depth++;
          else if (c === ')') {
            depth--;
            if (depth === 0) { fEnd = i + 1; i++; break; }
          }
        }
      }
      if (fEnd !== -1) { forms.push(trimmed.slice(fStart, fEnd)); continue; }
    }
    if (ch === ')' && i === trimmed.length - 1) break;
    i++;
  }
  return forms;
}

/**
 * Compiles S-Expression text (and optional paired SVG vector stage) directly into a compact .astb buffer.
 */
export function compileAstTextToBytecode(astText: string, options?: AstBytecodeCompileOptions): Uint8Array {
  if (!astText || typeof astText !== 'string') {
    throw new Error('Empty or invalid AST content for bytecode compilation');
  }
  astText = expandForMacrosTs(astText, 0);

  // Extract cartridge-local (:skills (:skill ...)) definitions BEFORE scanning root :vars/:bindings/:rules/:gestures
  let definedSkills: string | undefined;
  if (astText.includes(':skills')) {
    const localSkillBlocks = extractSexprBlocks(astText, ':skills');
    if (localSkillBlocks.length > 0) {
      definedSkills = localSkillBlocks.join('\n');
      for (const lsb of localSkillBlocks) {
        astText = astText.replace(lsb, ' ');
      }
    }
  }

  // Extract (:use-skill "skill-id" :param val ...) activations
  const skills: Array<{ id: string; params: Record<string, any> }> = [];
  if (astText.includes(':use-skill')) {
    const useSkillBlocks = extractSexprBlocks(astText, ':use-skill');
    for (const sb of useSkillBlocks) {
      const sidMatch = sb.match(/^\(\s*:use-skill\s+"([^"]+)"/i) || sb.match(/:id\s+"([^"]+)"/i);
      const skillId = sidMatch ? sidMatch[1] : null;
      if (!skillId) continue;
      const params: Record<string, any> = {};
      const attrRe = /:([a-zA-Z0-9_-]+)\s+("(?:[^"\\]|\\.)*"|true|false|-?\d+(?:\.\d+)?)/gi;
      let am: RegExpExecArray | null;
      while ((am = attrRe.exec(sb)) !== null) {
        const k = am[1];
        if (k === 'id' || k === 'use-skill') continue;
        const raw = am[2];
        if (raw.startsWith('"')) params[k] = raw.slice(1, -1).replace(/\\([\\"])/g, '$1');
        else if (raw === 'true') params[k] = true;
        else if (raw === 'false') params[k] = false;
        else params[k] = Number(raw);
      }
      skills.push({ id: skillId, params });
    }
  }

  const idMatch = astText.match(/\(:id\s+("([^"]+)"|([^\s\)]+))\)/i)
    || astText.match(/:id\s+("([^"]+)"|([^\s\)]+))/i)
    || astText.match(/\(id\s+("([^"]+)"|([^\s\)]+))\)/i)
    || astText.match(/meta[\s\S]*?\(id\s+("([^"]+)"|([^\s\)]+))\)/i);
  const id = (options?.idOverride && options.idOverride.trim())
    || (idMatch ? (idMatch[2] || idMatch[3] || idMatch[1] || '').replace(/^"|"$/g, '').trim() : 'unnamed');

  const typeMatch = astText.match(/\(:type\s+("([^"]+)"|([^\s\)]+))\)/i)
    || astText.match(/:type\s+("([^"]+)"|([^\s\)]+))/i)
    || astText.match(/\(type\s+("([^"]+)"|([^\s\)]+))\)/i);
  const rawType = typeMatch ? (typeMatch[2] || typeMatch[3] || typeMatch[1] || '').replace(/^"|"$/g, '').trim() : null;

  const videoMatch = astText.match(/:video\s+("([^"]+)"|([^\s\)]+))/i) || astText.match(/:film\s+("([^"]+)"|([^\s\)]+))/i);
  const video = videoMatch ? (videoMatch[2] || videoMatch[3]) : null;

  const videoFitMatch = astText.match(/:video-?fit\s+("([^"]+)"|([^\s\)]+))/i);
  const videoFit: 'contain' | 'cover' | 'fill' = (videoFitMatch ? (videoFitMatch[2] || videoFitMatch[3]).toLowerCase() : 'contain') as any;

  let type: 'Sim' | 'Slide' | 'App' | 'Film' = 'Sim';
  if (rawType) {
    const norm = rawType.toLowerCase();
    if (norm === 'film' || norm === 'video') type = 'Film';
    else if (norm === 'slide') type = 'Slide';
    else if (norm === 'app') type = 'App';
    else type = 'Sim';
  } else if (video) {
    type = 'Film';
  }

  const titleMatch = astText.match(/\(:title\s+"([^"]+)"\)/i)
    || astText.match(/:title\s+"([^"]+)"/i)
    || astText.match(/\(title\s+"([^"]+)"\)/i);
  const title = (options?.titleOverride && options.titleOverride.trim())
    || (titleMatch ? titleMatch[1] : (id !== 'unnamed' ? id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'AST Scene'));

  const stageMatch = astText.match(/\(:stage\s+"([^"]+)"\)/i)
    || astText.match(/:stage\s+"([^"]+)"/i)
    || astText.match(/\(stage\s+"([^"]+)"\)/i);
  const stage = (options?.stageOverride && options.stageOverride.trim())
    || (stageMatch ? stageMatch[1] : 'CURRICULUM');

  const durationMatch = astText.match(/\(:duration\s+([\d\.]+)\)/i)
    || astText.match(/:duration\s+([\d\.]+)/i)
    || astText.match(/\(duration\s+([\d\.]+)\)/i);
  const duration = durationMatch ? parseFloat(durationMatch[1]) : 14.0;

  // Keyframes
  const keyframes: Array<{ t: number; title: string; rule: string }> = [];
  const kfRegex = /\(:t\s+([\d\.]+)\s+:title\s+"([^"]+)"\s+:rule\s+"([^"]+)"\)/gi;
  let km: RegExpExecArray | null;
  while ((km = kfRegex.exec(astText)) !== null) {
    keyframes.push({
      t: parseFloat(km[1]),
      title: km[2],
      rule: km[3],
    });
  }

  // Subtitles
  const subtitles: Array<{ start: number; end: number; en: string; es?: string; la?: string }> = [];
  const subRegex = /\(:start\s+([\d\.]+)\s+:end\s+([\d\.]+)\s+:en\s+"([^"]+)"(?:\s+:es\s+"([^"]+)")?(?:\s+:la\s+"([^"]+)")?\)/gi;
  let sm: RegExpExecArray | null;
  while ((sm = subRegex.exec(astText)) !== null) {
    subtitles.push({
      start: parseFloat(sm[1]),
      end: parseFloat(sm[2]),
      en: sm[3],
      es: sm[4] || undefined,
      la: sm[5] || undefined,
    });
  }

  // Helper extraction routines
  const extractSlot = (text: string, reg: RegExp): string | null => {
    if (!text || typeof text !== 'string') return null;
    const match = text.match(reg);
    return match ? match[1].trim().replace(/^"|"$/g, '') : null;
  };

  const extractQuoted = (text: string, key: string): string | null => {
    if (!text || typeof text !== 'string') return null;
    const reg = new RegExp(`:${key}\\s+"((?:[^"\\\\]|\\\\.)*)"`, 'i');
    const m = text.match(reg);
    if (m) return m[1].replace(/\\"/g, '"');
    const fallbackReg = new RegExp(`:${key}\\s+([^\\s\\)]+)`, 'i');
    const fb = text.match(fallbackReg);
    return fb ? fb[1].replace(/^"|"$/g, '') : null;
  };

  // Bindings (Supports 2D, 3D, plus nested (:when ...), (:group ...), and multi-attr (:target "#id" (:attr ...) (:text ...)))
  const bindings: Array<any> = [];
  const composeWhenTs = (outerW?: string, innerW?: string | null): string | undefined => {
    if (!outerW) return innerW || undefined;
    if (!innerW) return outerW;
    return `(and ${outerW} ${innerW})`;
  };
  const parseTargetTs = (block: string, inheritedWhen?: string) => {
    const childForms = extractChildFormsTs(block);
    let headerBlock = block;
    for (const cf of childForms) headerBlock = headerBlock.replace(cf, ' ');

    const target = extractQuoted(headerBlock, 'target') || extractSlot(headerBlock, /:target\s+"([^"]+)"/i);
    const nodeType = extractSlot(headerBlock, /:type\s+"([^"]+)"/i);
    const attr = extractQuoted(headerBlock, 'attr') || extractSlot(headerBlock, /:attr\s+"([^"]+)"/i);
    const expr = extractQuoted(headerBlock, 'expr') || extractSlot(headerBlock, /:expr\s+"([^"]+)"/i);
    const when = composeWhenTs(inheritedWhen, extractQuoted(headerBlock, 'when'));

    const zLayerStr = extractSlot(headerBlock, /:z-?layer\s+([\d\.\-]+)/i);
    const zLayer = zLayerStr !== null ? parseFloat(zLayerStr) : undefined;
    const sortAfter = extractQuoted(headerBlock, 'sort-after') || extractQuoted(headerBlock, 'sortAfter') || undefined;
    const zBiasStr = extractSlot(headerBlock, /:z-?bias\s+([\d\.\-]+)/i);
    const zBias = zBiasStr !== null ? parseFloat(zBiasStr) : undefined;

    if (nodeType === '3d-node') {
      const x = extractSlot(block, /:x\s+"([^"]+)"/i) || '0';
      const y = extractSlot(block, /:y\s+"([^"]+)"/i) || '0';
      const z = extractSlot(block, /:z\s+"([^"]+)"/i) || '0';
      const baseRStr = extractSlot(block, /:base-r\s+([\d\.]+)/i);
      const baseR = baseRStr ? parseFloat(baseRStr) : 8;
      const label = extractSlot(block, /:label\s+"([^"]+)"/i);
      const depthFogStr = extractSlot(block, /:depth-fog\s+([^\s\)]+)/i);
      const depthFog = depthFogStr !== 'false';
      bindings.push({ type: '3d-node', target, x, y, z, baseR, label, depthFog, zLayer, sortAfter, zBias });
    } else if (nodeType === '3d-line') {
      const splitExpr = extractQuoted(block, 'split-expr') || extractQuoted(block, 'splitExpr') || undefined;
      const splineA = extractQuoted(block, 'spline-a') || extractQuoted(block, 'splineA') || undefined;
      const splineB = extractQuoted(block, 'spline-b') || extractQuoted(block, 'splineB') || undefined;
      const splineIdxStr = extractSlot(block, /:spline-?index\s+(\d+)/i);
      const splineIndex = splineIdxStr !== null ? parseInt(splineIdxStr, 10) : undefined;
      const depthFogStr = extractSlot(block, /:depth-fog\s+([^\s\)]+)/i);
      const depthFog = depthFogStr !== 'false';
      bindings.push({
        type: '3d-line', target,
        x1: extractSlot(block, /:x1\s+"([^"]+)"/i) || '0',
        y1: extractSlot(block, /:y1\s+"([^"]+)"/i) || '0',
        z1: extractSlot(block, /:z1\s+"([^"]+)"/i) || '0',
        x2: extractSlot(block, /:x2\s+"([^"]+)"/i) || '0',
        y2: extractSlot(block, /:y2\s+"([^"]+)"/i) || '0',
        z2: extractSlot(block, /:z2\s+"([^"]+)"/i) || '0',
        cap1: extractSlot(block, /:cap1\s+"([^"]+)"/i),
        cap2: extractSlot(block, /:cap2\s+"([^"]+)"/i),
        baseR: parseFloat(extractSlot(block, /:base-r\s+([\d\.]+)/i) || '8'),
        depthFog, splitExpr, splineA, splineB, splineIndex, zLayer, sortAfter, zBias,
      });
    } else if (nodeType === '3d-ring') {
      const rStr = extractSlot(block, /:r\s+("[^"]+"|[\d\.]+)/i) || '100';
      const cx = extractSlot(block, /:cx\s+"([^"]+)"/i) || '0';
      const cy = extractSlot(block, /:cy\s+"([^"]+)"/i) || '0';
      const cz = extractSlot(block, /:cz\s+"([^"]+)"/i) || '0';
      const tiltX = extractSlot(block, /:tilt-x\s+("[^"]+"|[\d\.-]+)/i) || '0';
      const tiltY = extractSlot(block, /:tilt-y\s+("[^"]+"|[\d\.-]+)/i) || '0';
      const tiltZ = extractSlot(block, /:tilt-z\s+("[^"]+"|[\d\.-]+)/i) || '0';
      const segsStr = extractSlot(block, /:segments\s+([\d]+)/i);
      const segments = segsStr ? parseInt(segsStr, 10) : 24;
      const depthFogStr = extractSlot(block, /:depth-fog\s+([^\s\)]+)/i);
      const depthFog = depthFogStr !== 'false';
      bindings.push({ type: '3d-ring', target, r: rStr, cx, cy, cz, tiltX, tiltY, tiltZ, segments, depthFog, zLayer, sortAfter, zBias });
    } else if (nodeType === '3d-polygon') {
      const ptsStr = extractSlot(block, /:points\s+"([^"]+)"/i) || extractSlot(block, /:pts\s+"([^"]+)"/i);
      const depthFogStr = extractSlot(block, /:depth-fog\s+([^\s\)]+)/i);
      const depthFog = depthFogStr !== 'false';
      const cullBackfaceStr = extractSlot(block, /:cull-backface\s+([^\s\)]+)/i);
      const cullBackface = cullBackfaceStr === 'true';
      bindings.push({ type: '3d-polygon', target, pointsExpr: ptsStr, depthFog, cullBackface, zLayer, sortAfter, zBias });
    } else {
      if (target && attr && expr) {
        bindings.push({ type: '2d-attr', target, attr, expr, ...(when ? { when } : {}) });
      }
      if (target && childForms.length > 0) {
        childForms.forEach((cf) => walkBindingTs(cf, when, target));
      }
    }
  };
  const walkBindingTs = (form: string, inheritedWhen?: string, inheritedTarget?: string | null) => {
    if (!form) return;
    if (/^\(\s*:when\b/i.test(form)) {
      const children = extractChildFormsTs(form);
      let hdr = form;
      for (const cf of children) hdr = hdr.replace(cf, ' ');
      const condM = hdr.match(/^\(\s*:when\s+(?::(?:if|cond|expr)\s+)?"((?:[^"\\]|\\.)*)"/i);
      const cond = condM ? condM[1].replace(/\\"/g, '"') : (extractQuoted(hdr, 'if') || extractQuoted(hdr, 'cond') || extractQuoted(hdr, 'expr'));
      const nextWhen = composeWhenTs(inheritedWhen, cond);
      children.forEach((cf) => walkBindingTs(cf, nextWhen, inheritedTarget));
      return;
    }
    if (/^\(\s*:group\b/i.test(form)) {
      extractChildFormsTs(form).forEach((cf) => walkBindingTs(cf, inheritedWhen, inheritedTarget));
      return;
    }
    // Unwrap anonymous list wrappers like ( <!-- comment --> (:target ...) ... )
    if (!/^\(\s*:[a-zA-Z]/i.test(form)) {
      extractChildFormsTs(form).forEach((cf) => walkBindingTs(cf, inheritedWhen, inheritedTarget));
      return;
    }
    if (/^\(\s*:target\b/i.test(form)) {
      parseTargetTs(form, inheritedWhen);
      return;
    }
    if (/^\(\s*:attr\b/i.test(form)) {
      const target = extractQuoted(form, 'target') || inheritedTarget;
      let attrName = extractQuoted(form, 'name') || extractQuoted(form, 'attr');
      let expr = extractQuoted(form, 'expr');
      const when = composeWhenTs(inheritedWhen, extractQuoted(form, 'when'));
      if (!attrName || !expr) {
        const posM = form.match(/^\(\s*:attr\s+"((?:[^"\\]|\\.)*)"(?:\s+"((?:[^"\\]|\\.)*)")?/i);
        if (posM) {
          if (!attrName) attrName = posM[1].replace(/\\"/g, '"');
          if (!expr && posM[2] !== undefined) expr = posM[2].replace(/\\"/g, '"');
        }
      }
      if (target && attrName && expr) {
        bindings.push({ type: '2d-attr', target, attr: attrName, expr, ...(when ? { when } : {}) });
      }
      return;
    }
    if (/^\(\s*:on-enter\b/i.test(form)) {
      const innerForms = extractChildFormsTs(form);
      let hdr = form;
      for (const inf of innerForms) hdr = hdr.replace(inf, ' ');
      const explicitWhen = extractQuoted(hdr, 'when') || extractQuoted(hdr, 'if');
      const eqVar = extractQuoted(hdr, 'var') || extractQuoted(hdr, 'name');
      const eqValMatch = hdr.match(/:val\s+("(?:[^"\\]|\\.)*"|true|false|-?\d+(?:\.\d+)?)/i);
      let eqValExpr: string | null = null;
      if (eqValMatch) {
        const raw = eqValMatch[1];
        eqValExpr = raw.startsWith('"') ? `'${raw.slice(1, -1)}'` : raw;
      }
      const enterGuard = explicitWhen || (eqVar && eqValExpr !== null ? `(= ${eqVar} ${eqValExpr})` : undefined);
      const combinedEnter = composeWhenTs(inheritedWhen, enterGuard);
      const taggedWhen = combinedEnter ? `@enter:${combinedEnter.replace(/^@enter:/, '')}` : inheritedWhen;
      innerForms.forEach((child) => walkBindingTs(child, taggedWhen, inheritedTarget));
      return;
    }
    if (/^\(\s*:(?:var|rule)\b/i.test(form)) {
      const nameMatch = form.match(/^\(\s*:(?:var|rule)\s+(?::(?:name|var)\s+)?"([^"]+)"/i)
        || form.match(/:(?:name|var)\s+"([^"]+)"/i)
        || form.match(/^\(\s*:var\s+([a-zA-Z_$][a-zA-Z0-9_$-]*)/i);
      const varName = nameMatch ? nameMatch[1] : null;
      const expr = extractQuoted(form, 'expr');
      const onEnterRaw = extractQuoted(form, 'on-enter') || extractQuoted(form, 'onEnter');
      const inheritedIsEnter = typeof inheritedWhen === 'string' && inheritedWhen.startsWith('@enter:');
      const cleanInherited = inheritedIsEnter ? inheritedWhen.slice(7) : inheritedWhen;
      const when = composeWhenTs(cleanInherited, extractQuoted(form, 'when') || extractQuoted(form, 'if'));
      const onEnter = onEnterRaw
        ? composeWhenTs(cleanInherited, onEnterRaw)
        : (inheritedIsEnter ? (when || cleanInherited) : undefined);
      if (varName && expr) {
        bindings.push({
          type: 'var-update',
          varName,
          expr,
          ...(onEnter ? { onEnter } : (when ? { when } : {})),
        });
      }
      return;
    }
    if (/^\(\s*:text\b/i.test(form)) {
      const target = extractQuoted(form, 'target') || inheritedTarget;
      let expr = extractQuoted(form, 'expr');
      if (!expr) {
        const posM = form.match(/^\(\s*:text\s+"((?:[^"\\]|\\.)*)"/i);
        if (posM) expr = posM[1].replace(/\\"/g, '"');
      }
      const when = composeWhenTs(inheritedWhen, extractQuoted(form, 'when'));
      if (target && expr) {
        bindings.push({ type: '2d-attr', target, attr: 'textContent', expr, ...(when ? { when } : {}) });
      }
    }
  };
  const extractKeywordBlocksTs = (text: string, tag: string): string[] => {
    if (text.indexOf(tag) === -1 && text.toLowerCase().indexOf(tag.toLowerCase()) === -1) return [];
    const parenBlocks = extractSexprBlocks(text, tag);
    if (parenBlocks.length > 0) return parenBlocks;
    const out: string[] = [];
    const safeTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp('(?:^|[\\s(])' + safeTag + '\\s*\\(', 'gi');
    let m: RegExpExecArray | null;
    while ((m = rx.exec(text)) !== null) {
      const openIdx = text.indexOf('(', m.index + (m[0].startsWith('(') ? 1 : 0));
      if (openIdx === -1) continue;
      let depth = 0;
      let inStr = false;
      let endIdx = -1;
      for (let i = openIdx; i < text.length; i++) {
        const ch = text[i];
        if (ch === '"' && (i === 0 || text[i - 1] !== '\\')) {
          inStr = !inStr;
        } else if (!inStr) {
          if (ch === ';') {
            while (i < text.length && text[i] !== '\n') i++;
            continue;
          }
          if (ch === '<' && text.startsWith('<!--', i)) {
            const closeIdx = text.indexOf('-->', i + 4);
            if (closeIdx !== -1) { i = closeIdx + 2; continue; }
          }
          if (ch === '(') depth++;
          else if (ch === ')') {
            depth--;
            if (depth === 0) { endIdx = i; break; }
          }
        }
      }
      if (endIdx !== -1) {
        out.push(`(${tag} ${text.slice(openIdx, endIdx + 1)})`);
        rx.lastIndex = endIdx + 1;
      }
    }
    return out;
  };
  const bindingsRootBlocks = extractKeywordBlocksTs(astText, ':bindings');
  if (bindingsRootBlocks.length > 0) {
    bindingsRootBlocks.forEach((bb) => {
      extractChildFormsTs(bb).forEach((form) => walkBindingTs(form, undefined, null));
    });
  } else {
    extractSexprBlocks(astText, ':target').forEach((block) => parseTargetTs(block, undefined));
  }
  const rulesRootBlocks = extractKeywordBlocksTs(astText, ':rules');
  if (rulesRootBlocks.length > 0) {
    rulesRootBlocks.forEach((rb) => {
      extractChildFormsTs(rb).forEach((form) => walkBindingTs(form, undefined, null));
    });
  }

  // Fallback for flat 2D bindings
  if (bindings.length === 0) {
    const bindRegex = /\(:target\s+"([^"]+)"\s+:attr\s+"([^"]+)"\s+:expr\s+"([^"]+)"\)/gi;
    let bm: RegExpExecArray | null;
    while ((bm = bindRegex.exec(astText)) !== null) {
      bindings.push({
        type: '2d-attr',
        target: bm[1],
        attr: bm[2],
        expr: bm[3],
      });
    }
  }

  // Checkpoints (:pass-expr, :hold-duration, :on-wrong supported)
  const checkpoints: AstCheckpointConfig[] = [];
  const cpBlocks = extractSexprBlocks(astText, ':checkpoint');
  for (const cpBlock of cpBlocks) {
    const tStr = extractSlot(cpBlock, /:t\s+([\d\.]+)/i);
    const cpTitle = extractQuoted(cpBlock, 'title') || 'Checkpoint';
    const prompt = extractQuoted(cpBlock, 'prompt') || '';
    const ansStr = extractSlot(cpBlock, /:answer\s+(\d+)/i);
    const explanation = extractQuoted(cpBlock, 'explanation') || '';
    const passExpr = extractQuoted(cpBlock, 'pass-expr') || extractQuoted(cpBlock, 'passExpr') || undefined;
    const holdDurStr = extractSlot(cpBlock, /:hold-?duration\s+([\d\.]+)/i);
    const holdDuration = holdDurStr !== null ? parseFloat(holdDurStr) : undefined;

    const opts: string[] = [];
    const optTagIdx = cpBlock.search(/:options\b/i);
    if (optTagIdx !== -1) {
      const startParen = cpBlock.indexOf('(', optTagIdx);
      if (startParen !== -1) {
        let depth = 0;
        let inStr = false;
        let endParen = -1;
        for (let i = startParen; i < cpBlock.length; i++) {
          const ch = cpBlock[i];
          if (ch === '"' && (i === 0 || cpBlock[i - 1] !== '\\')) {
            inStr = !inStr;
          } else if (!inStr) {
            if (ch === '(') depth++;
            else if (ch === ')') {
              depth--;
              if (depth === 0) {
                endParen = i;
                break;
              }
            }
          }
        }
        if (endParen !== -1) {
          const inside = cpBlock.slice(startParen + 1, endParen);
          const optRegex = /"((?:[^"\\]|\\.)*)"/g;
          let om: RegExpExecArray | null;
          while ((om = optRegex.exec(inside)) !== null) {
            opts.push(om[1].replace(/\\"/g, '"'));
          }
        }
      }
    }

    // Parse :on-wrong ((0 "hint") (1 "hint")) or multiple (:on-wrong (0 "hint")) entries
    const onWrong: Record<number, string> = {};
    let searchFrom = 0;
    while (true) {
      const owMatchIdx = cpBlock.slice(searchFrom).search(/:on-?wrong\s*\(/i);
      if (owMatchIdx === -1) break;
      const absIdx = searchFrom + owMatchIdx;
      const pStart = cpBlock.indexOf('(', absIdx);
      if (pStart === -1) break;
      let depth = 0;
      let inStr = false;
      let pEnd = -1;
      for (let i = pStart; i < cpBlock.length; i++) {
        const ch = cpBlock[i];
        if (ch === '"' && (i === 0 || cpBlock[i - 1] !== '\\')) {
          inStr = !inStr;
        } else if (!inStr) {
          if (ch === '(') depth++;
          else if (ch === ')') {
            depth--;
            if (depth === 0) {
              pEnd = i;
              break;
            }
          }
        }
      }
      if (pEnd === -1) break;
      const owContent = cpBlock.slice(pStart + 1, pEnd);
      const pairRegex = /(\d+)\s+"((?:[^"\\]|\\.)*)"/g;
      let pm: RegExpExecArray | null;
      while ((pm = pairRegex.exec(owContent)) !== null) {
        onWrong[parseInt(pm[1], 10)] = pm[2].replace(/\\"/g, '"');
      }
      searchFrom = pEnd + 1;
    }

    if (tStr && prompt) {
      const cpObj: AstCheckpointConfig = {
        t: parseFloat(tStr),
        title: cpTitle,
        prompt,
        options: opts,
        answer: ansStr !== null ? parseInt(ansStr, 10) : 0,
        explanation,
      };
      if (passExpr) cpObj.passExpr = passExpr;
      if (holdDuration !== undefined) cpObj.holdDuration = holdDuration;
      if (Object.keys(onWrong).length > 0) cpObj.onWrong = onWrong;
      checkpoints.push(cpObj);
    }
  }

  // Scopes (:scope :target "#id" :x-expr "..." :y-expr "..." :samples 96 :x-range (0 30) :y-range (0 100))
  const scopes: AstScopeConfig[] = [];
  const scopeBlocks = extractSexprBlocks(astText, ':scope');
  for (const sb of scopeBlocks) {
    const target = extractQuoted(sb, 'target') || extractSlot(sb, /:target\s+([^\s\)]+)/i);
    const xExpr = extractQuoted(sb, 'x-expr') || extractQuoted(sb, 'xExpr') || 't';
    const yExpr = extractQuoted(sb, 'y-expr') || extractQuoted(sb, 'yExpr') || '0';
    const samplesStr = extractSlot(sb, /:samples\s+(\d+)/i);
    const samples = samplesStr ? parseInt(samplesStr, 10) : 96;

    const xrMatch = sb.match(/:x-?range\s*\(\s*([\d\.\-]+)\s+([\d\.\-]+)\s*\)/i);
    const yrMatch = sb.match(/:y-?range\s*\(\s*([\d\.\-]+)\s+([\d\.\-]+)\s*\)/i);
    const plotMatch = sb.match(/:plot\s*\(\s*([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s*\)/i);

    if (target) {
      const scopeEntry: AstScopeConfig = {
        target,
        xExpr,
        yExpr,
        samples,
        xRange: xrMatch ? [parseFloat(xrMatch[1]), parseFloat(xrMatch[2])] : [0, 30],
        yRange: yrMatch ? [parseFloat(yrMatch[1]), parseFloat(yrMatch[2])] : [0, 100],
      };
      if (plotMatch) {
        scopeEntry.plot = [
          parseFloat(plotMatch[1]),
          parseFloat(plotMatch[2]),
          parseFloat(plotMatch[3]),
          parseFloat(plotMatch[4]),
        ];
      }
      scopes.push(scopeEntry);
    }
  }

  // Ledgers (:ledger :id "..." :terms ((:label "..." :expr "..." :color "#...") ...))
  const ledgers: AstLedgerConfig[] = [];
  const ledgerBlocks = extractSexprBlocks(astText, ':ledger');
  for (const lb of ledgerBlocks) {
    const lid = extractQuoted(lb, 'id') || `ledger_${ledgers.length + 1}`;
    const target = extractQuoted(lb, 'target') || `#${lid}`;
    const unit = extractQuoted(lb, 'unit') || '';
    const maxExpr = extractQuoted(lb, 'max') || '';
    const lx = parseFloat(extractSlot(lb, /:x\s+([\d\.\-]+)/i) || '40');
    const ly = parseFloat(extractSlot(lb, /:y\s+([\d\.\-]+)/i) || '400');
    const lw = parseFloat(extractSlot(lb, /:width\s+([\d\.]+)/i) || '320');
    const lh = parseFloat(extractSlot(lb, /:height\s+([\d\.]+)/i) || '20');
    const termBlocks = extractSexprBlocks(lb, ':label');
    const terms: AstLedgerTerm[] = [];
    for (const tb of termBlocks) {
      const label = extractQuoted(tb, 'label') || 'Term';
      const expr = extractQuoted(tb, 'expr') || '0';
      const color = extractQuoted(tb, 'color') || '#38bdf8';
      terms.push({ label, expr, color });
    }
    if (terms.length > 0) {
      ledgers.push({
        id: lid,
        target,
        unit,
        maxExpr,
        x: lx,
        y: ly,
        width: lw,
        height: lh,
        terms,
      });
    }
  }

  // Gestures (:draggable, :clickable, :on-click, :key, :on-key, :holdable)
  const gestures: Array<any> = [];
  const parseGestureValTs = (text: string, key: string): any => {
    const m = text.match(new RegExp(`:${key}\\s+("((?:[^"\\\\]|\\\\.)*)"|true|false|-?\\d+(?:\\.\\d+)?)`, 'i'));
    if (!m) return undefined;
    if (m[2] !== undefined) return m[2].replace(/\\"/g, '"');
    if (m[1] === 'true') return true;
    if (m[1] === 'false') return false;
    const n = Number(m[1]);
    return Number.isFinite(n) ? n : m[1];
  };
  const parseStepTs = (stepText: string): any => {
    const headM = stepText.match(/^\(\s*:([a-zA-Z0-9_-]+)/i);
    if (!headM) return null;
    const kind = headM[1].toLowerCase();
    const children = extractChildFormsTs(stepText);
    if (kind === 'seq') {
      const steps = children.map(parseStepTs).filter(Boolean);
      return steps.length > 0 ? { type: 'seq', steps } : null;
    }
    if (kind === 'if') {
      let hdr = stepText;
      for (const cf of children) hdr = hdr.replace(cf, ' ');
      const condM = hdr.match(/^\(\s*:if\s+(?::(?:cond|expr)\s+)?"((?:[^"\\]|\\.)*)"/i);
      const cond = condM ? condM[1].replace(/\\"/g, '"') : extractQuoted(hdr, 'cond');
      const thenStep = children[0] ? parseStepTs(children[0]) : null;
      const elseStep = children[1] ? parseStepTs(children[1]) : null;
      return cond && thenStep ? { type: 'if', cond, then: thenStep, ...(elseStep ? { else: elseStep } : {}) } : null;
    }
    if (kind === 'set-var') {
      const posM = stepText.match(/^\(\s*:set-var\s+"((?:[^"\\]|\\.)*)"/i);
      const setVar = (posM ? posM[1].replace(/\\"/g, '"') : null) || extractQuoted(stepText, 'var') || extractQuoted(stepText, 'name');
      const val = parseGestureValTs(stepText, 'val');
      const valExpr = extractQuoted(stepText, 'val-expr') || extractQuoted(stepText, 'valExpr') || extractQuoted(stepText, 'expr');
      return setVar ? { type: 'set-var', setVar, ...(val !== undefined ? { val } : {}), ...(valExpr ? { valExpr } : {}) } : null;
    }
    if (kind === 'step-var') {
      const posM = stepText.match(/^\(\s*:step-var\s+"((?:[^"\\]|\\.)*)"/i);
      const stepVar = (posM ? posM[1].replace(/\\"/g, '"') : null) || extractQuoted(stepText, 'var') || extractQuoted(stepText, 'name');
      const delta = parseGestureValTs(stepText, 'delta');
      return stepVar ? { type: 'step-var', stepVar, delta: typeof delta === 'number' ? delta : 1 } : null;
    }
    if (kind === 'toggle-var') {
      const posM = stepText.match(/^\(\s*:toggle-var\s+"((?:[^"\\]|\\.)*)"/i);
      const toggleVar = (posM ? posM[1].replace(/\\"/g, '"') : null) || extractQuoted(stepText, 'var') || extractQuoted(stepText, 'name');
      return toggleVar ? { type: 'toggle-var', toggleVar } : null;
    }
    return null;
  };
  const gestureRootBlocks = extractKeywordBlocksTs(astText, ':gestures');
  const rawGestureForms: string[] = [];
  gestureRootBlocks.forEach((gb) => {
    extractChildFormsTs(gb).forEach((f) => rawGestureForms.push(f));
  });
  if (astText.includes(':on-click') || astText.includes(':on-key') || astText.includes(':hoverable')) {
    const seenG = new Set(rawGestureForms);
    const extras = (astText.includes(':on-click') ? extractSexprBlocks(astText, ':on-click') : [])
      .concat(astText.includes(':on-key') ? extractSexprBlocks(astText, ':on-key') : [])
      .concat(astText.includes(':hoverable') ? extractSexprBlocks(astText, ':hoverable') : []);
    for (const extra of extras) {
      if (!seenG.has(extra)) {
        seenG.add(extra);
        rawGestureForms.push(extra);
      }
    }
  }
  let hasRichGestures = false;
  for (const gText of rawGestureForms) {
    const isDraggable = /^\(\s*:draggable\b/i.test(gText);
    const isClickable = /^\(\s*:(?:clickable|on-click)\b/i.test(gText);
    const isKey = /^\(\s*:(?:key|on-key)\b/i.test(gText);
    const isHoldable = /^\(\s*:holdable\b/i.test(gText);
    const isHoverable = /^\(\s*:(?:hoverable|on-hover)\b/i.test(gText);
    if (!isDraggable && !isClickable && !isKey && !isHoldable && !isHoverable) continue;
    const nestedForms = extractChildFormsTs(gText);
    const steps = nestedForms.map(parseStepTs).filter(Boolean);
    let hdr = gText;
    for (const nf of nestedForms) hdr = hdr.replace(nf, ' ');
    const body = hdr.replace(/^\(\s*:[a-zA-Z0-9_-]+/, '(');
    const target = extractQuoted(body, 'target');
    const code = extractQuoted(body, 'code');
    const key = extractQuoted(body, 'key');
    const axis = extractQuoted(body, 'axis') || 'xy';
    const min = parseGestureValTs(body, 'min');
    const max = parseGestureValTs(body, 'max');
    const varName = extractQuoted(body, 'var') || extractQuoted(body, 'bind-var');
    const setVar = extractQuoted(body, 'set-var') || extractQuoted(body, 'set');
    const toggleVar = extractQuoted(body, 'toggle-var') || extractQuoted(body, 'toggle');
    const stepVar = extractQuoted(body, 'step-var');
    const holdVar = extractQuoted(body, 'hold-var');
    const hoverVar = extractQuoted(body, 'hover-var') || extractQuoted(body, 'hoverVar');
    const pressVar = extractQuoted(body, 'press-var') || extractQuoted(body, 'pressVar');
    const val = parseGestureValTs(body, 'val');
    const releaseVal = parseGestureValTs(body, 'release-val');
    const leaveVal = parseGestureValTs(body, 'leave-val');
    const hoverTone = parseGestureValTs(body, 'hover-tone');
    const valExpr = extractQuoted(body, 'val-expr') || extractQuoted(body, 'valExpr');
    const ifExpr = extractQuoted(body, 'if');
    const delta = parseGestureValTs(body, 'delta');
    const gType = isKey ? 'key' : (isHoverable ? 'hoverable' : (isClickable ? 'clickable' : (isHoldable ? 'holdable' : 'draggable')));
    const isExplicitEventGesture = /^\(\s*:(?:on-click|on-key|hoverable|on-hover)\b/i.test(gText);
    if (isExplicitEventGesture || steps.length > 0 || holdVar || hoverVar || pressVar) hasRichGestures = true;
    if ((isKey && (code || key)) || target) {
      gestures.push({
        type: gType,
        ...(target ? { target } : {}),
        ...(code ? { code } : {}),
        ...(key ? { key } : {}),
        ...(isDraggable ? { axis, min: typeof min === 'number' ? min : 0, max: typeof max === 'number' ? max : 100 } : {}),
        ...(varName ? { var: varName } : {}),
        ...(setVar ? { setVar } : {}),
        ...(toggleVar ? { toggleVar } : {}),
        ...(stepVar ? { stepVar } : {}),
        ...(holdVar ? { holdVar, hold: true } : {}),
        ...(hoverVar ? { hoverVar } : {}),
        ...(pressVar ? { pressVar } : {}),
        ...(val !== undefined ? { val } : {}),
        ...(releaseVal !== undefined ? { releaseVal } : {}),
        ...(leaveVal !== undefined ? { leaveVal } : {}),
        ...(hoverTone !== undefined ? { hoverTone: String(hoverTone) } : {}),
        ...(valExpr ? { valExpr } : {}),
        ...(ifExpr ? { ifExpr } : {}),
        ...(typeof delta === 'number' ? { delta } : {}),
        ...(steps.length > 0 ? { steps } : {}),
      });
    }
  }
  if (gestures.length === 0) {
    const gestRegex = /\(:draggable\s+:target\s+"([^"]+)"\s+:axis\s+"([^"]+)"\s+:min\s+([\d\.\-]+)\s+:max\s+([\d\.\-]+)\)/gi;
    let gm: RegExpExecArray | null;
    while ((gm = gestRegex.exec(astText)) !== null) {
      gestures.push({
        type: 'draggable',
        target: gm[1],
        axis: gm[2],
        min: parseFloat(gm[3]),
        max: parseFloat(gm[4]),
      });
    }
  }

  // Variables & Inputs
  const vars: Record<string, any> = {};
  const varBlocks = extractSexprBlocks(astText, ':var');
  varBlocks.forEach(vb => {
    const vName = extractSlot(vb, /:name\s+"([^"]+)"/i);
    const rawValMatch = vb.match(/:val\s+([\d\.\-]+|"([^"]+)"|true|false)/i);
    if (!vName || !rawValMatch) return;
    const rawVal = rawValMatch[1];
    let val: any = 0;
    if (rawVal === 'true') val = true;
    else if (rawVal === 'false') val = false;
    else if (rawVal.startsWith('"')) val = rawValMatch[2] || '';
    else val = parseFloat(rawVal);

    const minStr = extractSlot(vb, /:min\s+([\d\.\-]+)/i);
    const maxStr = extractSlot(vb, /:max\s+([\d\.\-]+)/i);
    const stepStr = extractSlot(vb, /:step\s+([\d\.]+)/i);
    const unitStr = extractSlot(vb, /:unit\s+"([^"]+)"/i);
    const labelStr = extractSlot(vb, /:label\s+"([^"]+)"/i);

    if (minStr !== null && maxStr !== null) {
      vars[vName] = {
        val,
        min: parseFloat(minStr),
        max: parseFloat(maxStr),
        step: stepStr ? parseFloat(stepStr) : 1,
        unit: unitStr || '',
        label: labelStr || vName,
      };
    } else {
      vars[vName] = val;
    }
  });

  // Flat var regex fallback
  if (Object.keys(vars).length === 0) {
    const varRegex = /\(:var\s+:name\s+"([^"]+)"\s+:val\s+([\d\.\-]+|"([^"]+)"|true|false)/gi;
    let vm: RegExpExecArray | null;
    while ((vm = varRegex.exec(astText)) !== null) {
      const vName = vm[1];
      const rawVal = vm[2];
      if (rawVal === 'true') vars[vName] = true;
      else if (rawVal === 'false') vars[vName] = false;
      else if (rawVal.startsWith('"')) vars[vName] = vm[3];
      else vars[vName] = parseFloat(rawVal);
    }
  }

  // User Input Controls (:inputs or ui:controls)
  const inputs: Array<any> = [];
  const uiControls: Array<any> = [];
  const uiBlocks = extractSexprBlocks(astText, 'ui:controls')
    .concat(extractSexprBlocks(astText, ':ui-controls'))
    .concat(extractSexprBlocks(astText, ':inputs'));

  if (uiBlocks.length > 0) {
    uiBlocks.forEach((blockText) => {
      const inEntries = extractSexprBlocks(blockText, 'control:slider')
        .concat(extractSexprBlocks(blockText, 'control:toggle'))
        .concat(extractSexprBlocks(blockText, 'control:button'))
        .concat(extractSexprBlocks(blockText, 'control:select'))
        .concat(extractSexprBlocks(blockText, ':slider'))
        .concat(extractSexprBlocks(blockText, ':toggle'))
        .concat(extractSexprBlocks(blockText, ':switch'))
        .concat(extractSexprBlocks(blockText, ':button'))
        .concat(extractSexprBlocks(blockText, ':select'))
        .concat(extractSexprBlocks(blockText, ':number'))
        .concat(extractSexprBlocks(blockText, ':stepper'));

      inEntries.forEach((inText) => {
        let ctrlType = 'slider';
        if (inText.includes('control:toggle') || inText.includes(':toggle') || inText.includes(':switch')) {
          ctrlType = 'toggle';
        } else if (inText.includes('control:button') || inText.includes(':button')) {
          ctrlType = 'button';
        } else if (inText.includes('control:select') || inText.includes(':select')) {
          ctrlType = 'select';
        }

        const ctrlId = extractSlot(inText, /:id\s+"([^"]+)"/i)
          || extractSlot(inText, /:id\s+([^\s\)]+)/i)
          || extractSlot(inText, /:var\s+"([^"]+)"/i)
          || extractSlot(inText, /:var\s+([^\s\)]+)/i)
          || `ctrl_${uiControls.length + 1}`;

        const inLabel = extractSlot(inText, /:label\s+"([^"]+)"/i)
          || extractSlot(inText, /:label\s+([^\s\)]+)/i)
          || ctrlId;

        const rawBind = extractSlot(inText, /:bind\s+"([^"]+)"/i)
          || extractSlot(inText, /:bind\s+([^\s\)]+)/i)
          || extractSlot(inText, /:var\s+"([^"]+)"/i)
          || extractSlot(inText, /:var\s+([^\s\)]+)/i)
          || ctrlId;
        const bind = rawBind.replace(/^\*|\*$/g, '');

        const min = parseFloat(extractSlot(inText, /:min\s+([\d\.\-]+)/i) || '0');
        const max = parseFloat(extractSlot(inText, /:max\s+([\d\.\-]+)/i) || '100');
        const step = parseFloat(extractSlot(inText, /:step\s+([\d\.]+)/i) || '1');
        const defaultStr = extractSlot(inText, /:default\s+"?([^"\s\)]+)"?/i)
          || extractSlot(inText, /:val\s+"?([^"\s\)]+)"?/i);
        const defaultVal = defaultStr !== null ? (isNaN(Number(defaultStr)) ? defaultStr : parseFloat(defaultStr)) : undefined;

        let options: string[] = [];
        const optMatch = inText.match(/:options\s*\(([^)]+)\)/i);
        if (optMatch) {
          const matches = optMatch[1].match(/"([^"]+)"|([^\s"]+)/g);
          if (matches) {
            options = matches.map((s) => s.replace(/^"|"$/g, ''));
          }
        }

        inputs.push({
          type: ctrlType === 'toggle' ? 'switch' : (ctrlType === 'button' ? 'button' : (ctrlType === 'select' ? 'select' : 'slider')),
          var: bind,
          label: inLabel,
          min,
          max,
          step,
          ...(options.length > 0 ? { options } : {}),
        });

        uiControls.push({
          id: ctrlId,
          type: ctrlType,
          label: inLabel,
          bind,
          min,
          max,
          step,
          default: defaultVal,
          ...(options.length > 0 ? { options } : {}),
        });
      });
    });
  }

  // Camera (Supports static and dynamic string expressions)
  let camera: { distance: number; pitch: number | string; yaw: number | string; fov: number } | null = null;
  const camBlocks = extractSexprBlocks(astText, ':camera');
  if (camBlocks.length > 0) {
    const cBody = camBlocks[0];
    const getCamVal = (key: string) => {
      const m = cBody.match(new RegExp(`:${key}\\s+("([^"]+)"|([\\d\\.-]+))`, 'i'));
      return m ? (m[2] !== undefined ? m[2] : m[3]) : null;
    };
    const distStr = getCamVal('distance');
    const pitchStr = getCamVal('pitch');
    const yawStr = getCamVal('yaw');
    const fovStr = getCamVal('fov');
    camera = {
      distance: distStr ? parseFloat(distStr) : 500,
      pitch: pitchStr ? (isNaN(Number(pitchStr)) ? pitchStr : parseFloat(pitchStr)) : 20,
      yaw: yawStr ? (isNaN(Number(yawStr)) ? yawStr : parseFloat(yawStr)) : 0,
      fov: fovStr ? parseFloat(fovStr) : 60,
    };
  } else {
    const camMatch = astText.match(/\(:camera\s+:distance\s+([\d\.]+)\s+:pitch\s+([\d\.\-]+)\s+:yaw\s+([\d\.\-]+)\s+:fov\s+([\d\.]+)\)/i);
    if (camMatch) {
      camera = {
        distance: parseFloat(camMatch[1]),
        pitch: parseFloat(camMatch[2]),
        yaw: parseFloat(camMatch[3]),
        fov: parseFloat(camMatch[4]),
      };
    }
  }

  return compileSceneToBytecode({
    id,
    type,
    title,
    stage,
    duration,
    video,
    videoFit,
    has3D: Boolean(camera),
    hasVideo: Boolean(video),
    camera,
    keyframes,
    subtitles,
    bindings,
    checkpoints,
    scopes,
    ledgers,
    gestures,
    vars,
    inputs,
    uiControls,
    ...(skills.length > 0 ? { skills } : {}),
    ...(definedSkills ? { definedSkills } : {}),
    ...(hasRichGestures || skills.length > 0 || definedSkills ? { completeBinary: true } : {}),
    ...(options?.svgMarkup ? { svgMarkup: options.svgMarkup } : {}),
  });
}
