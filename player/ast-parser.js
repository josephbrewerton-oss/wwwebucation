/**
 * static/player/ast-parser.js
 * Pure S-Expression (.ast) Scene Parser (parseAst)
 * Delegates binary .astb payloads to ast-bytecode-decoder.js; math/expressions live in ast-expr.js.
 */
(function (global) {
  'use strict';

  function _decompileBytecode(buffer) {
    const fn = global.decompileBytecode || (typeof window !== 'undefined' ? window.decompileBytecode : undefined);
    return typeof fn === 'function' ? fn(buffer) : null;
  }

  /**
   * Parses S-Expression (.ast) or Bytecode (.astb) into structured scene configuration
   * Supports :camera, :keyframes, :subtitles, 2D bindings, and 3D nodes/lines/rings/polygons
   */
  function parseAst(astContent) {
    if (!astContent) return null;
    if (astContent instanceof ArrayBuffer || (typeof Uint8Array !== 'undefined' && astContent instanceof Uint8Array)) {
      return _decompileBytecode(astContent);
    }
    if (typeof astContent === 'string' && astContent.startsWith('ASTB')) {
      const u8 = typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(astContent) : null;
      if (u8) return _decompileBytecode(u8);
    }
    if (typeof astContent !== 'string') return null;

    if (astContent.includes('<svg') && (astContent.includes('(:scene') || astContent.includes('(:cartridge'))) {
      const sStart = astContent.search(/\(:(?:scene|cartridge)\b/i);
      if (sStart !== -1) {
        let depth = 0;
        let inStr = false;
        let sEnd = -1;
        for (let i = sStart; i < astContent.length; i++) {
          const ch = astContent[i];
          if (ch === '"' && (i === 0 || astContent[i - 1] !== '\\')) {
            inStr = !inStr;
          } else if (!inStr) {
            if (ch === '(') depth++;
            else if (ch === ')') {
              depth--;
              if (depth === 0) {
                sEnd = i + 1;
                break;
              }
            }
          }
        }
        if (sEnd !== -1) {
          astContent = astContent.slice(sStart, sEnd);
        }
      }
    }

    // Compile-time (:for <var> (<start> <end> [<step>]) body...) / (:for <var> ("a" "b") body...)
    // and (:repeat ...) macro expander — supports nested loops and {{i}} / {{i+N}} / {{i-N}} / {{i*N}} placeholders.
    const expandForMacros = (src, depth = 0) => {
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
        if (!inStr && ch === '(') {
          const headSlice = src.slice(i, i + 16);
          if (/^\(\s*:(?:for|repeat)\s+/i.test(headSlice)) {
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
                  const values = [];
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
                    let tm;
                    let iter = 0;
                    while ((tm = tokRe.exec(specInside)) !== null && ++iter <= MAX_ITERS) {
                      values.push(tm[1] !== undefined ? tm[1].replace(/\\"/g, '"') : tm[2]);
                    }
                  }
                  const safeVar = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const tplRe = new RegExp(`\\{\\{\\s*${safeVar}(?:\\s*([+\\-*])\\s*(-?\\d+(?:\\.\\d+)?))?\\s*\\}\\}`, 'g');
                  let expanded = '';
                  for (let vi = 0; vi < values.length; vi++) {
                    const vStr = values[vi];
                    const vNum = Number(vStr);
                    const substituted = bodyRaw.replace(tplRe, (_all, op, operandStr) => {
                      if (!op) return vStr;
                      if (!Number.isFinite(vNum)) return vStr;
                      const rhs = Number(operandStr);
                      const res = op === '+' ? vNum + rhs : (op === '-' ? vNum - rhs : vNum * rhs);
                      return Number.isInteger(res) ? String(res) : String(Number(res.toFixed(6)));
                    });
                    expanded += '\n' + expandForMacros(substituted, depth + 1);
                  }
                  out += expanded;
                  i = endIdx;
                  continue;
                }
              }
            }
          }
        }
        out += ch;
        i++;
      }
      return out;
    };

    astContent = expandForMacros(astContent, 0);

    const extractSlot = (a, b) => {
      const text = b ? a : astContent;
      const reg = b ? b : a;
      if (!text || typeof text !== 'string') return null;
      const match = text.match(reg);
      return match ? match[1].trim().replace(/^"|"$/g, '') : null;
    };

    const extractQuoted = (text, key) => {
      if (!text || typeof text !== 'string') return null;
      const reg = new RegExp(`:${key}\\s+"((?:[^"\\\\]|\\\\.)*)"`, 'i');
      const m = text.match(reg);
      if (m) return m[1].replace(/\\"/g, '"');
      const fallbackReg = new RegExp(`:${key}\\s+([^\\s\\)]+)`, 'i');
      const fb = text.match(fallbackReg);
      return fb ? fb[1].replace(/^"|"$/g, '') : null;
    };

    const id = extractSlot(/:id\s+("[^"]+"|[^\s\)]+)/i);
    const rawType = extractSlot(/:type\s+("Sim"|"Slide"|"App"|"Film"|"[^"]+"|[^\s\)]+)/i);
    const video = extractSlot(/:video\s+("((?:[^"\\]|\\.)*)"|[^\s\)]+)/i) || extractQuoted(astContent, 'video') || extractSlot(/:film\s+("((?:[^"\\]|\\.)*)"|[^\s\)]+)/i) || extractQuoted(astContent, 'film');
    const videoFit = extractSlot(/:video-?fit\s+("((?:[^"\\]|\\.)*)"|[^\s\)]+)/i) || extractQuoted(astContent, 'video-fit') || extractQuoted(astContent, 'videoFit') || 'contain';
    let type = 'Sim';
    if (rawType) {
      const norm = rawType.toLowerCase();
      if (norm === 'film' || norm === 'video' || norm === 'movie') type = 'Film';
      else if (norm === 'slide') type = 'Slide';
      else if (norm === 'app') type = 'App';
      else if (norm === 'data') type = 'Data';
      else type = 'Sim';
    } else if (video) {
      type = 'Film';
    } else {
      const hasSubtitles = /:subtitles\s*\(/i.test(astContent);
      const hasGestures = /:gestures\s*\(/i.test(astContent) || /:draggable\s+/i.test(astContent);
      const hasCheckpoints = /:interactive\s*\(/i.test(astContent) || /:checkpoint\s+/i.test(astContent) || /:questions\s*\(/i.test(astContent);
      const hasPhysics = /:physics\s*\(/i.test(astContent) || /:emitter\s+/i.test(astContent);
      if (hasSubtitles && !hasGestures && !hasPhysics) {
        type = 'Slide';
      } else if (hasGestures || hasPhysics || hasCheckpoints) {
        type = 'Sim';
      } else {
        type = 'App';
      }
    }
    const title = extractSlot(/:title\s+"([^"]+)"/i);
    const stage = extractSlot(/:stage\s+"([^"]+)"/i) || 'CURRICULUM';
    const durationStr = extractSlot(/:duration\s+([\d\.]+)/i);
    const duration = durationStr ? parseFloat(durationStr) : 10.0;
    const bootSound = extractQuoted(astContent, 'boot-sound') || extractQuoted(astContent, 'bootSound') || null;

    // Helper to extract S-expression blocks with balanced parentheses and string quote protection
    const extractSexprBlocks = (text, tag) => {
      const blocks = [];
      const safeTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const startRegex = new RegExp('\\(' + safeTag + '[\\s)]', 'gi');
      let m;
      while ((m = startRegex.exec(text)) !== null) {
        const startIdx = m.index;
        let depth = 0;
        let inString = false;
        let endIdx = -1;
        for (let i = startIdx; i < text.length; i++) {
          const char = text[i];
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
    };

    // Extract either (:tag ( ... )) or plist-style :tag ( ... )
    const extractKeywordBlocks = (text, tag) => {
      const direct = extractSexprBlocks(text, tag);
      if (direct.length > 0) return direct;
      const blocks = [];
      const safeTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const kwRegex = new RegExp(`(?:^|[\\s(])${safeTag}\\s+\\(`, 'gi');
      let m;
      while ((m = kwRegex.exec(text)) !== null) {
        const openIdx = text.indexOf('(', m.index + m[0].length - 1);
        if (openIdx === -1) continue;
        let depth = 0;
        let inString = false;
        let endIdx = -1;
        for (let i = openIdx; i < text.length; i++) {
          const char = text[i];
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
          blocks.push(text.slice(openIdx, endIdx));
        }
      }
      return blocks;
    };

    // Extract direct child S-expressions from an enclosing list block
    const extractChildForms = (blockText) => {
      const forms = [];
      if (!blockText) return forms;
      let searchStart = blockText.indexOf('(');
      if (searchStart === -1) return forms;
      // If wrapped as (:tag ((...) ...)) or (:tag ()), unwrap outer form to inner list.
      // Do NOT unwrap when the first paren is itself a child form like (:bindings (:target ...)).
      const trimmed = blockText.slice(searchStart).trim();
      let innerStart = 1;
      const tagMatch = trimmed.match(/^\(\s*:[a-zA-Z0-9_-]+/);
      if (tagMatch) {
        let p = tagMatch[0].length;
        while (p < trimmed.length) {
          if (trimmed[p] === ';') {
            while (p < trimmed.length && trimmed[p] !== '\n') p++;
          } else if (/\s/.test(trimmed[p])) {
            p++;
          } else {
            break;
          }
        }
        if (trimmed[p] === '(') {
          let q = p + 1;
          while (q < trimmed.length) {
            if (trimmed[q] === ';') {
              while (q < trimmed.length && trimmed[q] !== '\n') q++;
            } else if (/\s/.test(trimmed[q])) {
              q++;
            } else {
              break;
            }
          }
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
            if (c === '"' && (i === 0 || trimmed[i - 1] !== '\\')) {
              inStr = !inStr;
            } else if (!inStr) {
              if (c === '(') depth++;
              else if (c === ')') {
                depth--;
                if (depth === 0) {
                  fEnd = i + 1;
                  i++;
                  break;
                }
              }
            }
          }
          if (fEnd !== -1) {
            forms.push(trimmed.slice(fStart, fEnd));
            continue;
          }
        }
        if (ch === ')' && i === trimmed.length - 1) break;
        i++;
      }
      return forms;
    };

    const parseLiteralVal = (raw) => {
      if (raw === null || raw === undefined) return undefined;
      const clean = String(raw).replace(/^"|"$/g, '').replace(/\\"/g, '"');
      if (clean === 'true') return true;
      if (clean === 'false') return false;
      if (clean !== '' && !isNaN(Number(clean))) return Number(clean);
      return clean;
    };

    const extractSlotValue = (text, key) => {
      if (!text || typeof text !== 'string') return undefined;
      const safeK = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const qReg = new RegExp(`:${safeK}\\s+"((?:[^"\\\\]|\\\\.)*)"`, 'i');
      const qm = text.match(qReg);
      if (qm) return qm[1].replace(/\\"/g, '"');
      const aReg = new RegExp(`:${safeK}\\s+([^\\s\\)]+)`, 'i');
      const am = text.match(aReg);
      if (!am) return undefined;
      return parseLiteralVal(am[1]);
    };

    // Camera definition with balanced parenthesis S-expression extraction
    const camBlocks = extractSexprBlocks(astContent, ':camera');
    let camera = { distance: 500, pitch: 20, yaw: 0, fov: 60 };
    if (camBlocks.length > 0) {
      const cBody = camBlocks[0];
      const getCamVal = (key) => {
        const m = cBody.match(new RegExp(`:${key}\\s+("[^"]+"|[\\d\\.-]+)`, 'i'));
        return m ? m[1].replace(/^"|"$/g, '') : null;
      };
      if (getCamVal('distance')) camera.distance = parseFloat(getCamVal('distance'));
      if (getCamVal('pitch')) camera.pitch = parseFloat(getCamVal('pitch')) || getCamVal('pitch');
      if (getCamVal('yaw')) camera.yaw = parseFloat(getCamVal('yaw')) || getCamVal('yaw');
      if (getCamVal('fov')) camera.fov = parseFloat(getCamVal('fov'));
    }

    // Keyframes
    const keyframes = [];
    const kfRegex = /\(:t\s+([\d\.]+)\s+:title\s+"([^"]+)"\s+:rule\s+"([^"]+)"\)/gi;
    let match;
    while ((match = kfRegex.exec(astContent)) !== null) {
      keyframes.push({
        t: parseFloat(match[1]),
        title: match[2],
        rule: match[3]
      });
    }

    // Subtitles
    const subtitles = [];
    const subRegex = /\(:start\s+([\d\.]+)\s+:end\s+([\d\.]+)\s+:en\s+"([^"]+)"(?:\s+:es\s+"([^"]+)")?(?:\s+:la\s+"([^"]+)")?\)/gi;
    while ((match = subRegex.exec(astContent)) !== null) {
      const subObj = {
        start: parseFloat(match[1]),
        end: parseFloat(match[2]),
        en: match[3]
      };
      if (match[4]) subObj.es = match[4];
      if (match[5]) subObj.la = match[5];
      subtitles.push(subObj);
    }

    // Bindings (2D, Text, Var integration, 3D nodes/lines/rings/polygons,
    // plus nested (:when "<cond>" ...), (:group ...), and multi-attr (:target "#id" (:attr ...) (:text ...)))
    const bindings = [];
    const composeWhen = (outerWhen, innerWhen) => {
      if (!outerWhen) return innerWhen || undefined;
      if (!innerWhen) return outerWhen;
      return `(and ${outerWhen} ${innerWhen})`;
    };

    const parseAttrShorthand = (form, inheritedTarget, inheritedWhen) => {
      const target = extractQuoted(form, 'target') || inheritedTarget;
      let attrName = extractQuoted(form, 'name') || extractQuoted(form, 'attr');
      let expr = extractQuoted(form, 'expr');
      const localWhen = extractQuoted(form, 'when');
      const when = composeWhen(inheritedWhen, localWhen);
      if (!attrName || !expr) {
        const posM = form.match(/^\(\s*:attr\s+"((?:[^"\\]|\\.)*)"(?:\s+"((?:[^"\\]|\\.)*)")?/i);
        if (posM) {
          if (!attrName) attrName = posM[1].replace(/\\"/g, '"');
          if (!expr && posM[2] !== undefined) expr = posM[2].replace(/\\"/g, '"');
        }
      }
      if (target && attrName && expr) {
        const entry = { type: '2d-attr', target, attr: attrName, expr };
        if (when) entry.when = when;
        bindings.push(entry);
      }
    };

    const parseTargetForm = (block, inheritedWhen) => {
      const childForms = extractChildForms(block);
      // Strip nested child forms when reading header attributes on grouped (:target "#id" (:attr ...) ...)
      let headerBlock = block;
      if (childForms.length > 0) {
        for (let ci = 0; ci < childForms.length; ci++) {
          headerBlock = headerBlock.replace(childForms[ci], ' ');
        }
      }
      const target = extractQuoted(headerBlock, 'target') || extractSlot.call(null, headerBlock, /:target\s+"([^"]+)"/i);
      const nodeType = extractSlot.call(null, headerBlock, /:type\s+"([^"]+)"/i);
      const attr = extractQuoted(headerBlock, 'attr') || extractSlot.call(null, headerBlock, /:attr\s+"([^"]+)"/i);
      const expr = extractQuoted(headerBlock, 'expr') || extractSlot.call(null, headerBlock, /:expr\s+"([^"]+)"/i);
      const localWhen = extractQuoted(headerBlock, 'when');
      const when = composeWhen(inheritedWhen, localWhen);

      const zLayerStr = extractSlot.call(null, headerBlock, /:z-layer\s+([\d\.\-]+)/i);
      const zLayer = zLayerStr !== null ? parseFloat(zLayerStr) : undefined;
      const zBiasStr = extractSlot.call(null, headerBlock, /:z-bias\s+([\d\.\-]+)/i);
      const zBias = zBiasStr !== null ? parseFloat(zBiasStr) : undefined;
      const sortAfter = extractQuoted(headerBlock, 'sort-after') || extractQuoted(headerBlock, 'sortAfter') || undefined;

      if (nodeType === '3d-node') {
        const x = extractSlot.call(null, block, /:x\s+"([^"]+)"/i) || '0';
        const y = extractSlot.call(null, block, /:y\s+"([^"]+)"/i) || '0';
        const z = extractSlot.call(null, block, /:z\s+"([^"]+)"/i) || '0';
        const baseRStr = extractSlot.call(null, block, /:base-r\s+([\d\.]+)/i);
        const baseR = baseRStr ? parseFloat(baseRStr) : 8;
        const label = extractSlot.call(null, block, /:label\s+"([^"]+)"/i);
        const depthFogStr = extractSlot.call(null, block, /:depth-fog\s+([^\s\)]+)/i);
        const depthFog = depthFogStr !== 'false';
        const entry = { type: '3d-node', target, x, y, z, baseR, label, depthFog };
        if (zLayer !== undefined) entry.zLayer = zLayer;
        if (zBias !== undefined) entry.zBias = zBias;
        if (sortAfter) entry.sortAfter = sortAfter;
        if (when) entry.when = when;
        bindings.push(entry);
      } else if (nodeType === '3d-line') {
        const splitExpr = extractQuoted(block, 'split-expr') || extractQuoted(block, 'splitExpr') || undefined;
        const splineA = extractQuoted(block, 'spline-a') || extractQuoted(block, 'splineA') || undefined;
        const splineB = extractQuoted(block, 'spline-b') || extractQuoted(block, 'splineB') || undefined;
        const splineIndexStr = extractSlot.call(null, block, /:spline-index\s+(\d+)/i);
        const splineIndex = splineIndexStr !== null ? parseInt(splineIndexStr, 10) : undefined;
        const entry = {
          type: '3d-line',
          target,
          x1: extractSlot.call(null, block, /:x1\s+"([^"]+)"/i) || '0',
          y1: extractSlot.call(null, block, /:y1\s+"([^"]+)"/i) || '0',
          z1: extractSlot.call(null, block, /:z1\s+"([^"]+)"/i) || '0',
          x2: extractSlot.call(null, block, /:x2\s+"([^"]+)"/i) || '0',
          y2: extractSlot.call(null, block, /:y2\s+"([^"]+)"/i) || '0',
          z2: extractSlot.call(null, block, /:z2\s+"([^"]+)"/i) || '0',
          cap1: extractSlot.call(null, block, /:cap1\s+"([^"]+)"/i),
          cap2: extractSlot.call(null, block, /:cap2\s+"([^"]+)"/i),
          baseR: parseFloat(extractSlot.call(null, block, /:base-r\s+([\d\.]+)/i) || '8')
        };
        if (zLayer !== undefined) entry.zLayer = zLayer;
        if (zBias !== undefined) entry.zBias = zBias;
        if (sortAfter) entry.sortAfter = sortAfter;
        if (splitExpr) entry.splitExpr = splitExpr;
        if (splineA) entry.splineA = splineA;
        if (splineB) entry.splineB = splineB;
        if (splineIndex !== undefined) entry.splineIndex = splineIndex;
        if (when) entry.when = when;
        bindings.push(entry);
      } else if (nodeType === '3d-ring') {
        const rStr = extractSlot.call(null, block, /:r\s+("[^"]+"|[\d\.]+)/i) || '100';
        const cx = extractSlot.call(null, block, /:cx\s+"([^"]+)"/i) || '0';
        const cy = extractSlot.call(null, block, /:cy\s+"([^"]+)"/i) || '0';
        const cz = extractSlot.call(null, block, /:cz\s+"([^"]+)"/i) || '0';
        const tiltX = extractSlot.call(null, block, /:tilt-x\s+("[^"]+"|[\d\.-]+)/i) || '0';
        const tiltY = extractSlot.call(null, block, /:tilt-y\s+("[^"]+"|[\d\.-]+)/i) || '0';
        const tiltZ = extractSlot.call(null, block, /:tilt-z\s+("[^"]+"|[\d\.-]+)/i) || '0';
        const segsStr = extractSlot.call(null, block, /:segments\s+([\d]+)/i);
        const segments = segsStr ? parseInt(segsStr, 10) : 24;
        const depthFogStr = extractSlot.call(null, block, /:depth-fog\s+([^\s\)]+)/i);
        const depthFog = depthFogStr !== 'false';
        const entry = { type: '3d-ring', target, r: rStr, cx, cy, cz, tiltX, tiltY, tiltZ, segments, depthFog };
        if (zLayer !== undefined) entry.zLayer = zLayer;
        if (zBias !== undefined) entry.zBias = zBias;
        if (sortAfter) entry.sortAfter = sortAfter;
        if (when) entry.when = when;
        bindings.push(entry);
      } else if (nodeType === '3d-polygon') {
        const ptsStr = extractSlot.call(null, block, /:points\s+"([^"]+)"/i) || extractSlot.call(null, block, /:pts\s+"([^"]+)"/i);
        const depthFogStr = extractSlot.call(null, block, /:depth-fog\s+([^\s\)]+)/i);
        const depthFog = depthFogStr !== 'false';
        const cullBackfaceStr = extractSlot.call(null, block, /:cull-backface\s+([^\s\)]+)/i);
        const cullBackface = cullBackfaceStr === 'true';
        const entry = { type: '3d-polygon', target, pointsExpr: ptsStr, depthFog, cullBackface };
        if (zLayer !== undefined) entry.zLayer = zLayer;
        if (zBias !== undefined) entry.zBias = zBias;
        if (sortAfter) entry.sortAfter = sortAfter;
        if (when) entry.when = when;
        bindings.push(entry);
      } else {
        if (target && attr && expr) {
          const entry = { type: '2d-attr', target, attr, expr };
          if (when) entry.when = when;
          bindings.push(entry);
        }
        // Grouped multi-attribute child forms inside (:target "#id" (:attr ...) (:text ...) (:when ...))
        if (target && childForms.length > 0) {
          childForms.forEach(cf => walkBindingForm(cf, when, target));
        }
      }
    };

    const walkBindingForm = (form, inheritedWhen, inheritedTarget) => {
      if (!form) return;
      if (/^\(\s*:when\b/i.test(form)) {
        const children = extractChildForms(form);
        let hdr = form;
        for (let ci = 0; ci < children.length; ci++) hdr = hdr.replace(children[ci], ' ');
        const condMatch = hdr.match(/^\(\s*:when\s+(?::(?:if|cond|expr)\s+)?"((?:[^"\\]|\\.)*)"/i);
        const cond = condMatch ? condMatch[1].replace(/\\"/g, '"') : (extractQuoted(hdr, 'if') || extractQuoted(hdr, 'cond') || extractQuoted(hdr, 'expr'));
        const nextWhen = composeWhen(inheritedWhen, cond);
        children.forEach(cf => walkBindingForm(cf, nextWhen, inheritedTarget));
        return;
      }
      if (/^\(\s*:group\b/i.test(form)) {
        const children = extractChildForms(form);
        children.forEach(cf => walkBindingForm(cf, inheritedWhen, inheritedTarget));
        return;
      }
      if (/^\(\s*:target\b/i.test(form)) {
        parseTargetForm(form, inheritedWhen);
        return;
      }
      if (/^\(\s*:attr\b/i.test(form)) {
        parseAttrShorthand(form, inheritedTarget, inheritedWhen);
        return;
      }
      if (/^\(\s*:text\b/i.test(form)) {
        const target = extractQuoted(form, 'target') || inheritedTarget;
        let expr = extractQuoted(form, 'expr');
        if (!expr) {
          const posM = form.match(/^\(\s*:text\s+"((?:[^"\\]|\\.)*)"/i);
          if (posM) expr = posM[1].replace(/\\"/g, '"');
        }
        const when = composeWhen(inheritedWhen, extractQuoted(form, 'when'));
        if (target && expr) {
          const entry = { type: '2d-attr', target, attr: 'textContent', expr };
          if (when) entry.when = when;
          bindings.push(entry);
        }
        return;
      }
      if (/^\(\s*:var\b/i.test(form)) {
        const vMatch = form.match(/^\(\s*:var\s+(?::name\s+)?"((?:[^"\\]|\\.)*)"/i)
          || form.match(/^\(\s*:var\s+([^\s\)]+)/i);
        const varName = vMatch ? vMatch[1].replace(/\\"/g, '"') : null;
        const expr = extractQuoted(form, 'expr');
        if (varName && expr) {
          const entry = { type: 'var-update', varName, expr };
          if (inheritedWhen) entry.when = inheritedWhen;
          bindings.push(entry);
        }
      }
    };

    const bindListBlocks = extractKeywordBlocks(astContent, ':bindings');
    if (bindListBlocks.length > 0) {
      bindListBlocks.forEach(bBlock => {
        const bindForms = extractChildForms(bBlock);
        bindForms.forEach(form => walkBindingForm(form, undefined, null));
      });
    } else {
      // Backwards compatibility for legacy scenes with bare top-level (:target ...) outside (:bindings ...)
      const bindBlocks = extractSexprBlocks(astContent, ':target');
      bindBlocks.forEach(block => parseTargetForm(block, undefined));
    }

    // Checkpoints (Interactive Formative Assessment)
    const checkpoints = [];
    const isInteractiveExplicitlyDisabled = /:interactive\s+(false|nil|none)\b/i.test(astContent) ||
      /:questions\s+(false|nil|none)\b/i.test(astContent) ||
      /:type\s+"App"/i.test(astContent) ||
      extractSexprBlocks(astContent, ':interactive').some(b => /:(?:enabled|active|questions)\s+(false|nil)\b/i.test(b));

    if (!isInteractiveExplicitlyDisabled) {
      const cpEntryBlocks = extractSexprBlocks(astContent, ':checkpoint');
      cpEntryBlocks.forEach(cpText => {
      const tMatch = cpText.match(/:t\s+([\d\.]+)/i);
      const cpTitle = extractQuoted(cpText, 'title') || extractSlot.call(null, cpText, /:title\s+"([^"]+)"/i) || 'Checkpoint';
      const prompt = extractQuoted(cpText, 'prompt') || extractSlot.call(null, cpText, /:prompt\s+"([^"]+)"/i) || '';
      const ansMatch = cpText.match(/:answer\s+(\d+)/i);
      const explanation = extractQuoted(cpText, 'explanation') || extractSlot.call(null, cpText, /:explanation\s+"([^"]+)"/i) || '';
      const passExpr = extractQuoted(cpText, 'pass-expr') || extractQuoted(cpText, 'passExpr') || null;
      const holdDurStr = extractSlot.call(null, cpText, /:hold-?duration\s+([\d\.]+)/i);
      const holdDuration = holdDurStr !== null ? parseFloat(holdDurStr) : undefined;

      const options = [];
      const optTagIdx = cpText.indexOf(':options');
      if (optTagIdx !== -1) {
        const startParen = cpText.indexOf('(', optTagIdx);
        if (startParen !== -1) {
          let depth = 0;
          let inString = false;
          let endParen = -1;
          for (let i = startParen; i < cpText.length; i++) {
            const ch = cpText[i];
            if (ch === '"' && (i === 0 || cpText[i - 1] !== '\\')) {
              inString = !inString;
            } else if (!inString) {
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
            const inside = cpText.slice(startParen + 1, endParen);
            const optRegex = /"((?:[^"\\]|\\.)*)"/g;
            let om;
            while ((om = optRegex.exec(inside)) !== null) {
              options.push(om[1].replace(/\\"/g, '"'));
            }
          }
        }
      }

      const onWrong = {};
      let owSearch = 0;
      while (true) {
        const relIdx = cpText.slice(owSearch).search(/:on-?wrong\s*\(/i);
        if (relIdx === -1) break;
        const pStart = cpText.indexOf('(', owSearch + relIdx);
        if (pStart === -1) break;
        let depth = 0;
        let inStr = false;
        let pEnd = -1;
        for (let i = pStart; i < cpText.length; i++) {
          const ch = cpText[i];
          if (ch === '"' && (i === 0 || cpText[i - 1] !== '\\')) {
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
        const owInside = cpText.slice(pStart + 1, pEnd);
        const pairRe = /(\d+)\s+"((?:[^"\\]|\\.)*)"/g;
        let pm;
        while ((pm = pairRe.exec(owInside)) !== null) {
          onWrong[parseInt(pm[1], 10)] = pm[2].replace(/\\"/g, '"');
        }
        owSearch = pEnd + 1;
      }

      if (tMatch && prompt) {
        const cpEntry = {
          t: parseFloat(tMatch[1]),
          title: cpTitle,
          prompt: prompt,
          options: passExpr ? options : (options.length > 0 ? options : ['Correct', 'Incorrect']),
          answer: ansMatch ? parseInt(ansMatch[1], 10) : 0,
          explanation: explanation
        };
        if (passExpr) cpEntry.passExpr = passExpr;
        if (holdDuration !== undefined) cpEntry.holdDuration = holdDuration;
        if (Object.keys(onWrong).length > 0) cpEntry.onWrong = onWrong;
        checkpoints.push(cpEntry);
      }
    });

      // Also extract questions from (:questions ((:q ...))) if no explicit :checkpoint entries were defined
      if (checkpoints.length === 0) {
        const nonQuestAst = extractSexprBlocks(astContent, ':quests').reduce((acc, qb) => acc.replace(qb, ''), astContent);
        const qEntryBlocks = extractSexprBlocks(nonQuestAst, ':q').concat(extractSexprBlocks(nonQuestAst, ':question'));
        if (qEntryBlocks.length > 0) {
          const count = qEntryBlocks.length;
          const dur = Math.max(12.0, count * 3.0);
          qEntryBlocks.forEach((qText, qIdx) => {
            const prompt = extractSlot.call(null, qText, /:prompt\s+"([^"]+)"/i) || extractSlot.call(null, qText, /:q\s+"([^"]+)"/i) || '';
            const ansMatch = qText.match(/:answer\s+(\d+)/i) || qText.match(/:ans\s+(\d+)/i);
            const explanation = extractSlot.call(null, qText, /:explanation\s+"([^"]+)"/i) || '';
            const hint = extractSlot.call(null, qText, /:hint\s+"([^"]+)"/i) || '';
            const optTagIdx = qText.indexOf(':options');
            const options = [];
            if (optTagIdx !== -1) {
              const startParen = qText.indexOf('(', optTagIdx);
              if (startParen !== -1) {
                let depth = 0;
                let inString = false;
                let endParen = -1;
                for (let i = startParen; i < qText.length; i++) {
                  const ch = qText[i];
                  if (ch === '"' && (i === 0 || qText[i - 1] !== '\\')) {
                    inString = !inString;
                  } else if (!inString) {
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
                  const inside = qText.slice(startParen + 1, endParen);
                  const optRegex = /"((?:[^"\\]|\\.)*)"/g;
                  let om;
                  while ((om = optRegex.exec(inside)) !== null) {
                    options.push(om[1]);
                  }
                }
              }
            }
            if (prompt) {
              checkpoints.push({
                t: parseFloat(((qIdx + 1) / (count + 1) * dur).toFixed(2)),
                title: `Question ${qIdx + 1} of ${count}`,
                prompt: prompt,
                options: options.length > 0 ? options : ['Correct', 'Incorrect'],
                answer: ansMatch ? parseInt(ansMatch[1], 10) : 0,
                explanation: explanation || hint || ''
              });
            }
          });
        }
      }
    }

    // Micro-physics block parsing (:physics (:gravity 980 :restitution 0.7 :friction 0.25 :stiffness 120 :damping 4 :substeps 4) (:body ...) (:spring ...))
    const physicsBlocks = extractSexprBlocks(astContent, ':physics');
    let physics = null;
    if (physicsBlocks.length > 0) {
      const pb = physicsBlocks[0];
      const gMatch = pb.match(/:gravity\s+([\d\.\-]+)/i);
      const fMatch = pb.match(/:friction\s+([\d\.]+)/i);
      const rMatch = pb.match(/:(?:restitution|bounce)\s+([\d\.]+)/i);
      const stMatch = pb.match(/:stiffness\s+([\d\.]+)/i);
      const dmpMatch = pb.match(/:damping\s+([\d\.]+)/i);
      const subMatch = pb.match(/:substeps\s+(\d+)/i);
      const drgMatch = pb.match(/:drag\s+([\d\.]+)/i);
      const grMatch = pb.match(/:ground(?:Y)?\s+([\d\.]+)/i);

      const defRestitution = rMatch ? parseFloat(rMatch[1]) : 0.45;
      const defFriction = fMatch ? parseFloat(fMatch[1]) : 0.25;
      const defStiffness = stMatch ? parseFloat(stMatch[1]) : 120;
      const defDamping = dmpMatch ? parseFloat(dmpMatch[1]) : 4.0;

      const bodyBlocks = extractSexprBlocks(pb, ':body');
      const bodies = bodyBlocks.map(bText => {
        const bId = extractSlot(bText, /:id\s+"([^"]+)"/i) || extractSlot(bText, /:id\s+([^\s\)]+)/i);
        const target = extractSlot(bText, /:target\s+"([^"]+)"/i) || extractSlot(bText, /:target\s+([^\s\)]+)/i);
        const x = parseFloat(extractSlot(bText, /:x\s+([\d\.\-]+)/i) || 0);
        const y = parseFloat(extractSlot(bText, /:y\s+([\d\.\-]+)/i) || 0);
        const vx = parseFloat(extractSlot(bText, /:vx\s+([\d\.\-]+)/i) || 0);
        const vy = parseFloat(extractSlot(bText, /:vy\s+([\d\.\-]+)/i) || 0);
        const mass = parseFloat(extractSlot(bText, /:mass\s+([\d\.]+)/i) || 1.0);
        const rStr = extractSlot(bText, /:(?:restitution|bounce)\s+([\d\.]+)/i);
        const bounce = rStr !== null ? parseFloat(rStr) : defRestitution;
        const bfStr = extractSlot(bText, /:friction\s+([\d\.]+)/i);
        const bFriction = bfStr !== null ? parseFloat(bfStr) : defFriction;
        const radius = parseFloat(extractSlot(bText, /:radius\s+([\d\.]+)/i) || 16);
        const groundYStr = extractSlot(bText, /:ground(?:Y)?\s+([\d\.]+)/i);
        const groundY = groundYStr ? parseFloat(groundYStr) : undefined;
        const staticMatch = bText.match(/:(?:isStatic|static)\s+(true|false)/i);
        const isStatic = staticMatch ? staticMatch[1] === 'true' : false;
        const stStr = extractSlot(bText, /:stiffness\s+([\d\.]+)/i);
        const dmStr = extractSlot(bText, /:damping\s+([\d\.]+)/i);
        const lenStr = extractSlot(bText, /:length\s+([\d\.]+)/i);
        const axStr = extractSlot(bText, /:anchor-?x\s+([\d\.\-]+)/i);
        const ayStr = extractSlot(bText, /:anchor-?y\s+([\d\.\-]+)/i);
        const entry = {
          id: bId,
          target: target || `#${bId}`,
          x, y, vx, vy, mass,
          bounce,
          restitution: bounce,
          friction: bFriction,
          radius,
          groundY,
          isStatic
        };
        if (stStr !== null) entry.stiffness = parseFloat(stStr);
        if (dmStr !== null) entry.damping = parseFloat(dmStr);
        if (lenStr !== null) entry.length = parseFloat(lenStr);
        if (axStr !== null) entry.anchorX = parseFloat(axStr);
        if (ayStr !== null) entry.anchorY = parseFloat(ayStr);
        return entry;
      });

      const springBlocks = extractSexprBlocks(pb, ':spring');
      const springs = springBlocks.map((sText, sIdx) => {
        const sId = extractSlot(sText, /:id\s+"([^"]+)"/i) || extractSlot(sText, /:id\s+([^\s\)]+)/i) || `spring_${sIdx + 1}`;
        const a = extractSlot(sText, /:a\s+"([^"]+)"/i) || extractSlot(sText, /:a\s+([^\s\)]+)/i);
        const b = extractSlot(sText, /:b\s+"([^"]+)"/i) || extractSlot(sText, /:b\s+([^\s\)]+)/i)
          || extractSlot(sText, /:target\s+"([^"]+)"/i) || extractSlot(sText, /:target\s+([^\s\)]+)/i);
        const lineTarget = extractSlot(sText, /:line\s+"([^"]+)"/i) || extractSlot(sText, /:line\s+([^\s\)]+)/i);
        const axStr = extractSlot(sText, /:anchor-?x\s+([\d\.\-]+)/i);
        const ayStr = extractSlot(sText, /:anchor-?y\s+([\d\.\-]+)/i);
        const lenStr = extractSlot(sText, /:(?:rest-)?length\s+([\d\.]+)/i);
        const kStr = extractSlot(sText, /:(?:stiffness|k)\s+([\d\.]+)/i);
        const cStr = extractSlot(sText, /:(?:damping|c)\s+([\d\.]+)/i);
        return {
          id: sId,
          a: a || null,
          b: b || null,
          lineTarget: lineTarget || null,
          anchorX: axStr !== null ? parseFloat(axStr) : 0,
          anchorY: ayStr !== null ? parseFloat(ayStr) : 0,
          length: lenStr !== null ? parseFloat(lenStr) : undefined,
          stiffness: kStr !== null ? parseFloat(kStr) : defStiffness,
          damping: cStr !== null ? parseFloat(cStr) : defDamping
        };
      });

      physics = {
        gravity: gMatch ? parseFloat(gMatch[1]) : 980,
        restitution: defRestitution,
        friction: defFriction,
        stiffness: defStiffness,
        damping: defDamping,
        substeps: subMatch ? parseInt(subMatch[1], 10) : 4,
        drag: drgMatch ? parseFloat(drgMatch[1]) : 0,
        groundY: grMatch ? parseFloat(grMatch[1]) : 420,
        bodies,
        springs
      };
    }

    // Reactive State Variables
    // Supports (:vars ((:var :name "volume" :val 1.0 ...))) AND :vars ((posX :default 400.0 :min 90.0 :max 710.0) ...)
    const vars = {};
    const varBlocks = extractKeywordBlocks(astContent, ':vars');
    if (varBlocks.length > 0) {
      const vEntries = extractSexprBlocks(varBlocks[0], ':var');
      vEntries.forEach(vText => {
        const name = extractSlot.call(null, vText, /:name\s+"([^"]+)"/i) || extractSlot.call(null, vText, /:name\s+([^\s\)]+)/i);
        const valRaw = extractSlotValue(vText, 'val') !== undefined ? extractSlotValue(vText, 'val') : extractSlotValue(vText, 'default');
        const minMatch = vText.match(/:min\s+([\d\.\-]+)/i);
        const maxMatch = vText.match(/:max\s+([\d\.\-]+)/i);
        const stepMatch = vText.match(/:step\s+([\d\.]+)/i);
        const unit = extractSlot.call(null, vText, /:unit\s+"([^"]+)"/i) || '';
        const label = extractSlot.call(null, vText, /:label\s+"([^"]+)"/i) || name;
        if (name && valRaw !== undefined) {
          const isNumeric = typeof valRaw === 'number' && Number.isFinite(valRaw);
          const hasMin = Boolean(minMatch);
          const hasMax = Boolean(maxMatch);
          const hasStep = Boolean(stepMatch);
          vars[name] = {
            name,
            value: valRaw,
            defaultValue: valRaw,
            min: hasMin ? parseFloat(minMatch[1]) : (isNumeric ? 0 : undefined),
            max: hasMax ? parseFloat(maxMatch[1]) : (isNumeric ? 100 : undefined),
            step: hasStep ? parseFloat(stepMatch[1]) : (isNumeric ? 1 : undefined),
            hasMin,
            hasMax,
            hasStep,
            hasExplicitBounds: hasMin && hasMax,
            unit,
            label
          };
        }
      });

      const directVarForms = extractChildForms(varBlocks[0]);
      directVarForms.forEach(vText => {
        if (/^\(\s*:var\b/i.test(vText)) return;
        const headMatch = vText.match(/^\(\s*([a-zA-Z_$][a-zA-Z0-9_$-]*)\b/);
        if (!headMatch) return;
        const name = headMatch[1];
        const valRaw = extractSlotValue(vText, 'default') !== undefined ? extractSlotValue(vText, 'default') : extractSlotValue(vText, 'val');
        const minMatch = vText.match(/:min\s+([\d\.\-]+)/i);
        const maxMatch = vText.match(/:max\s+([\d\.\-]+)/i);
        const stepMatch = vText.match(/:step\s+([\d\.]+)/i);
        const unit = extractSlot.call(null, vText, /:unit\s+"([^"]+)"/i) || '';
        const label = extractSlot.call(null, vText, /:label\s+"([^"]+)"/i) || name;
        if (name && valRaw !== undefined) {
          const isNumeric = typeof valRaw === 'number' && Number.isFinite(valRaw);
          const hasMin = Boolean(minMatch);
          const hasMax = Boolean(maxMatch);
          const hasStep = Boolean(stepMatch);
          vars[name] = {
            name,
            value: valRaw,
            defaultValue: valRaw,
            min: hasMin ? parseFloat(minMatch[1]) : (isNumeric ? 0 : undefined),
            max: hasMax ? parseFloat(maxMatch[1]) : (isNumeric ? 100 : undefined),
            step: hasStep ? parseFloat(stepMatch[1]) : (isNumeric ? 1 : undefined),
            hasMin,
            hasMax,
            hasStep,
            hasExplicitBounds: hasMin && hasMax,
            unit,
            label
          };
        }
      });
    }

    // UI Controls Projection Subsystem: Fantasy Console / Lisp Machine Architecture
    // Canonical: (ui:controls (control:button ...) (control:toggle ...) (control:slider ...) (control:select ...))
    // Keyword/Legacy: (:ui-controls (...)) or (:inputs (...))
    const uiControls = [];
    const uiBlocks = extractSexprBlocks(astContent, 'ui:controls')
      .concat(extractSexprBlocks(astContent, ':ui-controls'))
      .concat(extractSexprBlocks(astContent, ':inputs'));

    if (uiBlocks.length > 0) {
      const controlTags = [
        'control:button', 'control:toggle', 'control:slider', 'control:select',
        ':button', ':toggle', ':switch', ':slider', ':number', ':stepper', ':select'
      ];
      uiBlocks.forEach(blockText => {
        const positionedEntries = [];
        controlTags.forEach(tag => {
          const found = extractSexprBlocks(blockText, tag);
          let searchFrom = 0;
          found.forEach(entryText => {
            const pos = blockText.indexOf(entryText, searchFrom);
            searchFrom = pos >= 0 ? pos + entryText.length : searchFrom;
            positionedEntries.push({ entryText, pos });
          });
        });
        positionedEntries.sort((a, b) => a.pos - b.pos);
        const entries = positionedEntries.map(item => item.entryText);

        entries.forEach(entryText => {
          let ctrlType = 'button';
          if (entryText.includes('control:toggle') || entryText.includes(':toggle') || entryText.includes(':switch')) {
            ctrlType = 'toggle';
          } else if (entryText.includes('control:slider') || entryText.includes(':slider') || entryText.includes(':number') || entryText.includes(':stepper')) {
            ctrlType = 'slider';
          } else if (entryText.includes('control:select') || entryText.includes(':select')) {
            ctrlType = 'select';
          } else if (entryText.includes('control:button') || entryText.includes(':button')) {
            ctrlType = 'button';
          }

          const id = extractSlot.call(null, entryText, /:id\s+"([^"]+)"/i) 
            || extractSlot.call(null, entryText, /:id\s+([^\s\)]+)/i)
            || extractSlot.call(null, entryText, /:var\s+"([^"]+)"/i)
            || extractSlot.call(null, entryText, /:var\s+([^\s\)]+)/i)
            || `ctrl_${uiControls.length + 1}`;

          const label = extractSlot.call(null, entryText, /:label\s+"([^"]+)"/i)
            || extractSlot.call(null, entryText, /:label\s+([^\s\)]+)/i)
            || id;

          let bind = extractSlot.call(null, entryText, /:bind\s+"([^"]+)"/i)
            || extractSlot.call(null, entryText, /:bind\s+([^\s\)]+)/i)
            || extractSlot.call(null, entryText, /:var\s+"([^"]+)"/i)
            || extractSlot.call(null, entryText, /:var\s+([^\s\)]+)/i)
            || null;

          let cleanBind = bind ? bind.replace(/^\*|\*$/g, '') : null;

          let action = null;
          const actionMatch = entryText.match(/:action\s+(\([^\)]+\)|"[^"]+"|([^\s\)]+))/i);
          if (actionMatch) {
            action = actionMatch[1].trim().replace(/^"|"$/g, '');
          } else if (ctrlType === 'button' && (id === 'reset' || id === 'sim:reset')) {
            action = '(sim:reset)';
          } else if (ctrlType === 'toggle' && (cleanBind === 'bsl-active' || cleanBind === 'bslActive' || id === 'bsl')) {
            action = '(player:toggle-bsl)';
          }

          const rawMinStr = extractSlot.call(null, entryText, /:min\s+([\d\.\-]+)/i);
          const rawMaxStr = extractSlot.call(null, entryText, /:max\s+([\d\.\-]+)/i);
          const rawStepStr = extractSlot.call(null, entryText, /:step\s+([\d\.]+)/i);
          const unit = extractSlot.call(null, entryText, /:unit\s+"([^"]+)"/i) || '';
          const hasMin = rawMinStr !== null && rawMinStr !== undefined;
          const hasMax = rawMaxStr !== null && rawMaxStr !== undefined;
          const hasStep = rawStepStr !== null && rawStepStr !== undefined;
          const min = parseFloat(rawMinStr || '0');
          const max = parseFloat(rawMaxStr || '100');
          const step = parseFloat(rawStepStr || '1');
          const defaultStr = extractSlot.call(null, entryText, /:default\s+"?([^"\s\)]+)"?/i)
            || extractSlot.call(null, entryText, /:val\s+"?([^"\s\)]+)"?/i);
          let defaultVal = defaultStr !== null ? (isNaN(Number(defaultStr)) ? defaultStr : parseFloat(defaultStr)) : undefined;

          let options = [];
          const optMatch = entryText.match(/:options\s*\(([^)]+)\)/i);
          if (optMatch) {
            const optStr = optMatch[1];
            const matches = optStr.match(/"([^"]+)"|([^\s"]+)/g);
            if (matches) {
              options = matches.map(s => s.replace(/^"|"$/g, ''));
            }
          }

          uiControls.push({
            id,
            type: ctrlType,
            label,
            bind: cleanBind,
            rawBind: bind,
            var: cleanBind,
            action,
            min,
            max,
            step,
            hasMin,
            hasMax,
            hasStep,
            unit,
            default: defaultVal,
            val: defaultVal,
            options
          });
        });
      });
    }
    const inputs = uiControls;

    // Derived & Computed Output Variables
    // Supports (:computed ((:name "pressure" :expr "..."))) AND :computed ((mult "...") ...)
    const computed = [];
    const compBlocks = extractKeywordBlocks(astContent, ':computed');
    if (compBlocks.length > 0) {
      const compEntries = extractSexprBlocks(compBlocks[0], ':name');
      compEntries.forEach(cText => {
        const name = extractSlot.call(null, cText, /:name\s+"([^"]+)"/i) || extractSlot.call(null, cText, /:name\s+([^\s\)]+)/i);
        const expr = extractQuoted(cText, 'expr') || extractSlot.call(null, cText, /:expr\s+"([^"]+)"/i);
        if (name && expr) {
          computed.push({ name, expr });
        }
      });

      const compForms = extractChildForms(compBlocks[0]);
      compForms.forEach(cText => {
        if (/^\(\s*:name\b/i.test(cText)) return;
        const pairMatch = cText.match(/^\(\s*([a-zA-Z_$][a-zA-Z0-9_$-]*)\s+"((?:[^"\\]|\\.)*)"\s*\)$/);
        if (pairMatch) {
          computed.push({
            name: pairMatch[1],
            expr: pairMatch[2].replace(/\\"/g, '"')
          });
        } else {
          const headMatch = cText.match(/^\(\s*([a-zA-Z_$][a-zA-Z0-9_$-]*)\b/);
          const expr = extractQuoted(cText, 'expr');
          if (headMatch && expr) {
            computed.push({ name: headMatch[1], expr });
          }
        }
      });
    }

    // Direct Manipulation & Keyboard Gestures (100% Declarative S-Expression VM)
    // Supports :draggable, :interactive, :clickable, :holdable, :trackball, :rotatable, :key
    // Plus nested pure-AST action trees: (:seq ...), (:if "<cond>" <then> [<else>]), (:set-var ...), (:step-var ...), (:toggle-var ...), (:action ...), (:tone ...), (:speak ...)
    const parseGestureStepForm = (stepForm) => {
      if (!stepForm || typeof stepForm !== 'string') return null;
      const headM = stepForm.match(/^\(\s*:([a-zA-Z0-9_-]+)/);
      if (!headM) return null;
      const kind = headM[1].toLowerCase();
      const subForms = extractChildForms(stepForm);
      let hdr = stepForm;
      for (let si = 0; si < subForms.length; si++) hdr = hdr.replace(subForms[si], ' ');

      if (kind === 'seq') {
        const steps = subForms.map(parseGestureStepForm).filter(Boolean);
        return steps.length > 0 ? { type: 'seq', steps } : null;
      }
      if (kind === 'if') {
        const condM = hdr.match(/^\(\s*:if\s+(?::(?:cond|expr)\s+)?"((?:[^"\\]|\\.)*)"/i);
        const cond = condM ? condM[1].replace(/\\"/g, '"') : (extractQuoted(hdr, 'cond') || extractQuoted(hdr, 'expr'));
        const thenStep = subForms[0] ? parseGestureStepForm(subForms[0]) : null;
        const elseStep = subForms[1] ? parseGestureStepForm(subForms[1]) : null;
        if (!cond || !thenStep) return null;
        return { type: 'if', cond, then: thenStep, else: elseStep || null };
      }

      const firstArgM = hdr.match(/^\(\s*:[a-zA-Z0-9_-]+\s+"((?:[^"\\]|\\.)*)"/i);
      const firstStr = firstArgM ? firstArgM[1].replace(/\\"/g, '"') : null;
      const firstNumM = !firstStr ? hdr.match(/^\(\s*:[a-zA-Z0-9_-]+\s+(-?\d+(?:\.\d+)?)\b/) : null;
      const firstVal = firstStr !== null ? firstStr : (firstNumM ? Number(firstNumM[1]) : undefined);

      if (kind === 'set-var') {
        const varName = firstStr || extractQuoted(hdr, 'var') || extractQuoted(hdr, 'name');
        if (!varName) return null;
        return {
          type: 'set-var',
          setVar: varName,
          val: extractSlotValue(hdr, 'val'),
          fromAttr: extractQuoted(hdr, 'from-attr') || extractQuoted(hdr, 'fromAttr') || undefined,
          attr: extractQuoted(hdr, 'attr') || undefined,
          valExpr: extractQuoted(hdr, 'val-expr') || extractQuoted(hdr, 'valExpr') || undefined,
          expr: extractQuoted(hdr, 'expr') || undefined,
        };
      }
      if (kind === 'toggle-var') {
        const varName = firstStr || extractQuoted(hdr, 'var') || extractQuoted(hdr, 'name');
        return varName ? { type: 'toggle-var', toggleVar: varName } : null;
      }
      if (kind === 'step-var') {
        const varName = firstStr || extractQuoted(hdr, 'var') || extractQuoted(hdr, 'name');
        if (!varName) return null;
        const deltaStr = extractSlot.call(null, hdr, /:delta\s+([\d\.\-]+)/i);
        const minStr = extractSlot.call(null, hdr, /:min\s+([\d\.\-]+)/i);
        const maxStr = extractSlot.call(null, hdr, /:max\s+([\d\.\-]+)/i);
        return {
          type: 'step-var',
          stepVar: varName,
          delta: deltaStr !== null ? parseFloat(deltaStr) : 1,
          min: minStr !== null ? parseFloat(minStr) : undefined,
          max: maxStr !== null ? parseFloat(maxStr) : undefined,
        };
      }
      if (kind === 'clear-var') {
        const varName = firstStr || extractQuoted(hdr, 'var') || extractQuoted(hdr, 'name');
        return varName ? { type: 'clear-var', var: varName } : null;
      }
      if (kind === 'reset-var') {
        const varName = firstStr || extractQuoted(hdr, 'var') || extractQuoted(hdr, 'name');
        return varName ? { type: 'reset-var', var: varName, val: extractSlotValue(hdr, 'val') } : null;
      }
      if (kind === 'action') {
        const actionName = firstStr || extractQuoted(hdr, 'name') || extractQuoted(hdr, 'id');
        if (!actionName) return null;
        const deltaStr = extractSlot.call(null, hdr, /:delta\s+([\d\.\-]+)/i);
        const countRaw = extractSlotValue(hdr, 'count');
        return {
          type: 'action',
          action: actionName,
          var: extractQuoted(hdr, 'var') || undefined,
          delta: deltaStr !== null ? parseFloat(deltaStr) : undefined,
          count: typeof countRaw === 'number' ? countRaw : undefined,
          val: extractSlotValue(hdr, 'val'),
          attr: extractQuoted(hdr, 'attr') || undefined,
          clearVar: extractQuoted(hdr, 'clear-var') || undefined,
          resetVar: extractQuoted(hdr, 'reset-var') || undefined,
          resetVal: extractSlotValue(hdr, 'reset-val'),
          route: extractQuoted(hdr, 'route') || undefined,
          preset: extractQuoted(hdr, 'preset') || undefined,
          prompt: extractQuoted(hdr, 'prompt') || undefined,
          mode: extractQuoted(hdr, 'mode') || undefined,
          enabled: extractSlotValue(hdr, 'enabled'),
          directive: extractQuoted(hdr, 'directive') || undefined,
        };
      }
      if (kind === 'tone') {
        const toneVal = firstVal !== undefined ? String(firstVal) : (extractSlotValue(hdr, 'val') !== undefined ? String(extractSlotValue(hdr, 'val')) : null);
        const toneExpr = extractQuoted(hdr, 'expr') || extractQuoted(hdr, 'tone-expr') || undefined;
        return (toneVal || toneExpr) ? { type: 'tone', tone: toneVal, toneExpr } : null;
      }
      if (kind === 'speak') {
        const text = firstStr || extractQuoted(hdr, 'text') || extractQuoted(hdr, 'val');
        const speakExpr = extractQuoted(hdr, 'expr') || undefined;
        const speakRateVar = extractQuoted(hdr, 'rate-var') || extractQuoted(hdr, 'speak-rate-var') || undefined;
        const speakPitchRaw = extractSlotValue(hdr, 'pitch');
        return (text || speakExpr) ? { type: 'speak', speak: text, speakExpr, speakRateVar, speakPitch: typeof speakPitchRaw === 'number' ? speakPitchRaw : undefined } : null;
      }
      if (kind === 'speak-var') {
        const varName = firstStr || extractQuoted(hdr, 'var') || extractQuoted(hdr, 'name');
        const fallbackVar = extractQuoted(hdr, 'fallback-var') || extractQuoted(hdr, 'fallback') || undefined;
        return varName ? { type: 'speak-var', speakVar: varName, fallbackVar } : null;
      }
      if (kind === 'speak-attr') {
        const attrName = firstStr || extractQuoted(hdr, 'attr') || extractQuoted(hdr, 'name');
        return attrName ? { type: 'speak-attr', speakAttr: attrName } : null;
      }
      return null;
    };

    const gestures = [];
    const gestureBlocks = extractKeywordBlocks(astContent, ':gestures');
    if (gestureBlocks.length > 0) {
      const gBlock = gestureBlocks[0];
      const gEntries = extractChildForms(gBlock);

      gEntries.forEach(gText => {
        if (gText.startsWith('(:interactive (') || gText.startsWith('(:interactive\n')) return;
        const isDraggable = /^\(\s*:draggable\b/i.test(gText);
        const isRotatable = /^\(\s*:rotatable\b/i.test(gText);
        const isTrackball = /^\(\s*:trackball\b/i.test(gText);
        const isClickable = /^\(\s*:clickable\b/i.test(gText);
        const isHoldable = /^\(\s*:holdable\b/i.test(gText);
        const isKey = /^\(\s*:key\b/i.test(gText);
        const isInteractive = /^\(\s*:interactive\b/i.test(gText);
        if (!isDraggable && !isRotatable && !isTrackball && !isClickable && !isHoldable && !isKey && !isInteractive) return;

        // Extract nested step forms (:seq, :if, :set-var, etc.) and strip them from header before parsing flat attrs
        const nestedStepForms = extractChildForms(gText);
        const steps = nestedStepForms.map(parseGestureStepForm).filter(Boolean);
        let headerText = gText;
        for (let si = 0; si < nestedStepForms.length; si++) {
          headerText = headerText.replace(nestedStepForms[si], ' ');
        }

        const bodyText = headerText.replace(/^\(\s*:[a-zA-Z0-9_-]+/, '(');
        const target = extractSlot.call(null, bodyText, /:target\s+"([^"]+)"/i) || extractSlot.call(null, bodyText, /:target\s+([^\s\)]+)/i);
        const code = extractSlot.call(null, bodyText, /:code\s+"([^"]+)"/i) || extractSlot.call(null, bodyText, /:code\s+([^\s\)]+)/i);
        const key = extractSlot.call(null, bodyText, /:key\s+"([^"]+)"/i) || extractSlot.call(null, bodyText, /:key\s+([^\s\)]+)/i);
        const axis = extractSlot.call(null, bodyText, /:axis\s+"([^"]+)"/i) || (isTrackball ? 'trackball' : 'xy');
        const action = extractSlot.call(null, bodyText, /:action\s+"([^"]+)"/i);

        const minStr = extractSlot.call(null, bodyText, /:min\s+([\d\.\-]+)/i);
        const maxStr = extractSlot.call(null, bodyText, /:max\s+([\d\.\-]+)/i);
        const useDragDefaults = isDraggable || isRotatable || isInteractive;
        const min = minStr !== null ? parseFloat(minStr) : (useDragDefaults ? 0 : undefined);
        const max = maxStr !== null ? parseFloat(maxStr) : (useDragDefaults ? 800 : undefined);

        const minXStr = extractSlot.call(null, bodyText, /:min-x\s+([\d\.\-]+)/i);
        const maxXStr = extractSlot.call(null, bodyText, /:max-x\s+([\d\.\-]+)/i);
        const minYStr = extractSlot.call(null, bodyText, /:min-y\s+([\d\.\-]+)/i);
        const maxYStr = extractSlot.call(null, bodyText, /:max-y\s+([\d\.\-]+)/i);
        const minX = minXStr !== null ? parseFloat(minXStr) : min;
        const maxX = maxXStr !== null ? parseFloat(maxXStr) : max;
        const minY = minYStr !== null ? parseFloat(minYStr) : min;
        const maxY = maxYStr !== null ? parseFloat(maxYStr) : max;

        const cxStr = extractSlot.call(null, bodyText, /:cx\s+([\d\.\-]+)/i);
        const cyStr = extractSlot.call(null, bodyText, /:cy\s+([\d\.\-]+)/i);
        const cx = cxStr !== null ? parseFloat(cxStr) : undefined;
        const cy = cyStr !== null ? parseFloat(cyStr) : undefined;

        const varName = extractQuoted(bodyText, 'var') || extractQuoted(bodyText, 'bind-var');
        const varX = extractQuoted(bodyText, 'var-x') || extractQuoted(bodyText, 'varX');
        const varY = extractQuoted(bodyText, 'var-y') || extractQuoted(bodyText, 'varY');
        const yawVar = extractSlot.call(null, bodyText, /:yaw-var\s+"([^"]+)"/i) || null;
        const pitchVar = extractSlot.call(null, bodyText, /:pitch-var\s+"([^"]+)"/i) || null;
        const pitchMin = parseFloat(extractSlot.call(null, bodyText, /:pitch-min\s+([\d\.\-]+)/i) || '-65');
        const pitchMax = parseFloat(extractSlot.call(null, bodyText, /:pitch-max\s+([\d\.\-]+)/i) || '65');

        const toggleVar = extractSlot.call(null, bodyText, /:toggle-var\s+"([^"]+)"/i)
          || extractSlot.call(null, bodyText, /:toggle-var\s+([^\s\)]+)/i)
          || extractSlot.call(null, bodyText, /:toggle\s+"([^"]+)"/i)
          || extractSlot.call(null, bodyText, /:toggle\s+([^\s\)]+)/i);
        const setVar = extractSlot.call(null, bodyText, /:set-var\s+"([^"]+)"/i)
          || extractSlot.call(null, bodyText, /:set-var\s+([^\s\)]+)/i)
          || extractSlot.call(null, bodyText, /:set\s+"([^"]+)"/i)
          || extractSlot.call(null, bodyText, /:set\s+([^\s\)]+)/i);
        const rawStepAttr = extractSlotValue(bodyText, 'step');
        const stepVar = extractQuoted(bodyText, 'step-var')
          || (typeof rawStepAttr === 'string' ? rawStepAttr : null);
        const step = typeof rawStepAttr === 'number' ? rawStepAttr : undefined;
        const holdVar = extractSlot.call(null, bodyText, /:hold-var\s+"([^"]+)"/i)
          || extractSlot.call(null, bodyText, /:hold-var\s+([^\s\)]+)/i);

        const expr = extractQuoted(bodyText, 'expr');
        const condExpr = extractQuoted(bodyText, 'if');
        const valExpr = extractQuoted(bodyText, 'val-expr') || extractQuoted(bodyText, 'valExpr');
        const toneRaw = extractSlotValue(bodyText, 'tone');
        const tone = toneRaw !== undefined && toneRaw !== null ? String(toneRaw) : null;
        const toneExpr = extractQuoted(bodyText, 'tone-expr') || extractQuoted(bodyText, 'toneExpr');
        const speak = extractQuoted(bodyText, 'speak');
        const speakExpr = extractQuoted(bodyText, 'speak-expr') || extractQuoted(bodyText, 'speakExpr');
        const speakAttr = extractQuoted(bodyText, 'speak-attr') || extractQuoted(bodyText, 'speakAttr');
        const speakVar = extractQuoted(bodyText, 'speak-var') || extractQuoted(bodyText, 'speakVar');
        const fallbackVar = extractQuoted(bodyText, 'fallback-var') || extractQuoted(bodyText, 'fallbackVar');
        const fromAttr = extractQuoted(bodyText, 'from-attr') || extractQuoted(bodyText, 'fromAttr');
        const clearVar = extractQuoted(bodyText, 'clear-var') || extractQuoted(bodyText, 'clearVar');
        const resetVar = extractQuoted(bodyText, 'reset-var') || extractQuoted(bodyText, 'resetVar');
        const resetVal = extractSlotValue(bodyText, 'reset-val');
        const countRaw = extractSlotValue(bodyText, 'count');
        const count = typeof countRaw === 'number' ? countRaw : undefined;
        const speakRateVar = extractQuoted(bodyText, 'speak-rate-var') || extractQuoted(bodyText, 'speakRateVar');
        const speakPitchRaw = extractSlotValue(bodyText, 'speak-pitch');
        const speakPitchAlt = speakPitchRaw === undefined ? extractSlotValue(bodyText, 'speakPitch') : speakPitchRaw;
        const speakPitch = typeof speakPitchAlt === 'number' ? speakPitchAlt : undefined;

        const val = extractSlotValue(bodyText, 'val');
        const releaseVal = extractSlotValue(bodyText, 'release-val');
        const holdRaw = extractSlotValue(bodyText, 'hold');
        const hold = (isHoldable || holdRaw === true || Boolean(holdVar))
          ? true
          : (holdRaw === false ? false : undefined);
        const invert = extractSlotValue(bodyText, 'invert') === true;
        const relative = extractSlotValue(bodyText, 'relative') === true;
        const seek = extractSlotValue(bodyText, 'seek') === true;
        const deltaStr = extractSlot.call(null, bodyText, /:delta\s+([\d\.\-]+)/i);
        const delta = deltaStr !== null ? parseFloat(deltaStr) : 1;
        const rateStr = extractSlot.call(null, bodyText, /:rate\s+([\d\.\-]+)/i);
        const rate = rateStr !== null ? parseFloat(rateStr) : undefined;
        const attr = extractSlot.call(null, bodyText, /:attr\s+"([^"]+)"/i);

        if ((isKey && (code || key)) || target) {
          let gestureType = 'draggable';
          if (isKey) gestureType = 'key';
          else if (isHoldable) gestureType = 'holdable';
          else if (isClickable) gestureType = 'clickable';
          else if (isTrackball) gestureType = 'trackball';
          else if (isRotatable) gestureType = 'rotatable';
          else if (!isDraggable) gestureType = 'interactive';

          const gObj = {
            type: gestureType,
            target,
            code,
            key,
            axis,
            action,
            min,
            max,
            minX,
            maxX,
            minY,
            maxY,
            cx,
            cy,
            var: varName,
            varX,
            varY,
            yawVar,
            pitchVar,
            pitchMin,
            pitchMax,
            toggleVar,
            setVar,
            stepVar,
            step,
            holdVar,
            expr,
            ifExpr: condExpr,
            valExpr,
            tone,
            toneExpr,
            speak,
            speakExpr,
            speakAttr,
            speakVar,
            fallbackVar,
            fromAttr,
            clearVar,
            resetVar,
            resetVal,
            count,
            speakRateVar,
            speakPitch,
            val,
            releaseVal,
            hold,
            invert,
            relative,
            seek,
            delta,
            rate,
            attr
          };
          if (steps.length > 0) {
            gObj.steps = steps;
          }
          gestures.push(gObj);
        }
      });
    }

    // Static Layer Primitives (:static ((:element :target "#bg" :cache true) ...))
    const staticElements = [];
    const staticBlocks = extractSexprBlocks(astContent, ':static');
    if (staticBlocks.length > 0) {
      const sEntries = extractSexprBlocks(staticBlocks[0], ':element');
      sEntries.forEach(sText => {
        const target = extractSlot.call(null, sText, /:target\s+"([^"]+)"/i) || extractSlot.call(null, sText, /:target\s+([^\s\)]+)/i);
        const layer = extractSlot.call(null, sText, /:layer\s+"([^"]+)"/i) || 'bg';
        const cacheMatch = sText.match(/:cache\s+(true|false)/i);
        if (target) {
          staticElements.push({
            target,
            layer,
            cache: cacheMatch ? cacheMatch[1] === 'true' : true
          });
        }
      });
    }

    // Dynamic Kinematic Actors (:actors ((:actor :target "#piston" :kinematic true) ...))
    const actors = [];
    const actorBlocks = extractSexprBlocks(astContent, ':actors');
    if (actorBlocks.length > 0) {
      const aEntries = extractSexprBlocks(actorBlocks[0], ':actor');
      aEntries.forEach(aText => {
        const target = extractSlot.call(null, aText, /:target\s+"([^"]+)"/i) || extractSlot.call(null, aText, /:target\s+([^\s\)]+)/i);
        const kinematicMatch = aText.match(/:kinematic\s+(true|false)/i);
        const willChangeMatch = aText.match(/:will-change\s+(true|false)/i);
        if (target) {
          actors.push({
            target,
            kinematic: kinematicMatch ? kinematicMatch[1] === 'true' : true,
            willChange: willChangeMatch ? willChangeMatch[1] === 'true' : true
          });
        }
      });
    }

    // Multi-Entity Particle Emitters, Pools & Obstacle Collision Pipelines
    const emitters = [];
    const emitterContainerBlocks = extractSexprBlocks(astContent, ':emitters');
    const emitterBlocks = emitterContainerBlocks.length > 0
      ? extractSexprBlocks(emitterContainerBlocks[0], ':emitter').concat(extractSexprBlocks(emitterContainerBlocks[0], ':particle-pool'))
      : extractSexprBlocks(astContent, ':emitter').concat(extractSexprBlocks(astContent, ':particle-pool'));

    emitterBlocks.forEach(emText => {
      const emId = extractSlot.call(null, emText, /:id\s+"([^"]+)"/i) || extractSlot.call(null, emText, /:id\s+([^\s\)]+)/i) || `emitter_${emitters.length + 1}`;
      const count = parseInt(extractSlot.call(null, emText, /:count\s+(\d+)/i) || '80', 10);
      const speed = parseFloat(extractSlot.call(null, emText, /:speed\s+([\d\.\-]+)/i) || '120');
      const radius = parseFloat(extractSlot.call(null, emText, /:radius\s+([\d\.]+)/i) || '4');
      const gravity = parseFloat(extractSlot.call(null, emText, /:gravity\s+([\d\.\-]+)/i) || '0');
      const fill = extractSlot.call(null, emText, /:fill\s+"([^"]+)"/i) || '#38bdf8';
      const wrapMode = extractSlot.call(null, emText, /:wrapMode\s+"([^"]+)"/i) || 'bounce';
      const boundsEl = extractSlot.call(null, emText, /:boundsElement\s+"([^"]+)"/i) || extractSlot.call(null, emText, /:boundsElement\s+([^\s\)]+)/i);
      const emRestStr = extractSlot.call(null, emText, /:(?:restitution|bounce)\s+([\d\.]+)/i);
      const emFricStr = extractSlot.call(null, emText, /:friction\s+([\d\.]+)/i);
      const emSubStr = extractSlot.call(null, emText, /:substeps\s+(\d+)/i);
      const speedExpr = extractQuoted(emText, 'speed-expr') || extractQuoted(emText, 'speedExpr') || null;
      const countExpr = extractQuoted(emText, 'count-expr') || extractQuoted(emText, 'countExpr') || null;
      const phaseExpr = extractQuoted(emText, 'phase-expr') || extractQuoted(emText, 'phaseExpr') || null;
      const clampXExpr = extractQuoted(emText, 'clamp-x-expr') || extractQuoted(emText, 'clampXExpr') || null;
      const placeholderSelector = extractQuoted(emText, 'placeholder-selector') || extractQuoted(emText, 'placeholderSelector') || null;
      const liquidMinYStr = extractSlot.call(null, emText, /:liquid-min-y\s+([\d\.\-]+)/i);
      const liquidMinY = liquidMinYStr !== null ? parseFloat(liquidMinYStr) : undefined;
      const phaseSyncMatch = emText.match(/:phase-?sync\s+(true|false)/i);
      const phaseSync = phaseSyncMatch ? phaseSyncMatch[1] === 'true' : false;

      // Explicit Bounds
      const minX = parseFloat(extractSlot.call(null, emText, /:minX\s+([\d\.\-]+)/i) || '40');
      const maxX = parseFloat(extractSlot.call(null, emText, /:maxX\s+([\d\.\-]+)/i) || '760');
      const minY = parseFloat(extractSlot.call(null, emText, /:minY\s+([\d\.\-]+)/i) || '40');
      const maxY = parseFloat(extractSlot.call(null, emText, /:maxY\s+([\d\.\-]+)/i) || '440');

      // Obstacles (:obstacles ((:obstacle :target "#piston-assembly" :restitution 1.0 :friction 0.1) ...))
      const obstacles = [];
      const obsContainerBlocks = extractSexprBlocks(emText, ':obstacles');
      if (obsContainerBlocks.length > 0) {
        const obsEntries = extractSexprBlocks(obsContainerBlocks[0], ':obstacle');
        obsEntries.forEach(obText => {
          const target = extractSlot.call(null, obText, /:target\s+"([^"]+)"/i) || extractSlot.call(null, obText, /:target\s+([^\s\)]+)/i);
          const bounce = parseFloat(extractSlot.call(null, obText, /:(?:restitution|bounce)\s+([\d\.]+)/i) || '1.0');
          const refract = parseFloat(extractSlot.call(null, obText, /:refract\s+([\d\.]+)/i) || '0');
          const friction = parseFloat(extractSlot.call(null, obText, /:friction\s+([\d\.]+)/i) || '0');
          if (target) {
            obstacles.push({ target, bounce, refract, friction });
          }
        });
      }

      emitters.push({
        id: emId,
        count,
        speed,
        speedExpr,
        countExpr,
        phaseExpr,
        clampXExpr,
        placeholderSelector,
        liquidMinY,
        phaseSync,
        radius,
        gravity,
        fill,
        wrapMode,
        restitution: emRestStr !== null ? parseFloat(emRestStr) : 1.0,
        friction: emFricStr !== null ? parseFloat(emFricStr) : 0.0,
        substeps: emSubStr !== null ? parseInt(emSubStr, 10) : 4,
        bounds: { minX, maxX, minY, maxY },
        boundsElement: boundsEl,
        obstacles
      });
    });

    // Declarative State Transition Machines (:state-machines)
    const stateMachines = [];
    const smContainerBlocks = extractSexprBlocks(astContent, ':state-machines');
    const smBlocks = smContainerBlocks.length > 0
      ? extractSexprBlocks(smContainerBlocks[0], ':state-machine')
      : extractSexprBlocks(astContent, ':state-machine');

    smBlocks.forEach(smText => {
      const smId = extractSlot.call(null, smText, /:id\s+"([^"]+)"/i) || extractSlot.call(null, smText, /:id\s+([^\s\)]+)/i) || `sm_${stateMachines.length + 1}`;
      const initial = extractSlot.call(null, smText, /:initial\s+"([^"]+)"/i) || extractSlot.call(null, smText, /:initial\s+([^\s\)]+)/i) || 'default';
      const dwell = parseFloat(extractSlot.call(null, smText, /:dwell\s+([\d\.]+)/i) || '0.25');

      // States
      const states = [];
      const stateContainer = extractSexprBlocks(smText, ':states');
      const stateBlocks = stateContainer.length > 0
        ? extractSexprBlocks(stateContainer[0], ':state')
        : extractSexprBlocks(smText, ':state');

      stateBlocks.forEach(stText => {
        const stName = extractSlot.call(null, stText, /:name\s+"([^"]+)"/i) || extractSlot.call(null, stText, /:name\s+([^\s\)]+)/i) || 'state';
        const attrs = Object.create(null);
        const attrBlocks = extractSexprBlocks(stText, ':attr');
        attrBlocks.forEach(atText => {
          const target = extractSlot.call(null, atText, /:target\s+"([^"]+)"/i) || extractSlot.call(null, atText, /:target\s+([^\s\)]+)/i);
          const attr = extractSlot.call(null, atText, /:attr\s+"([^"]+)"/i) || extractSlot.call(null, atText, /:attr\s+([^\s\)]+)/i) || 'fill';
          const val = extractSlot.call(null, atText, /:val\s+"([^"]+)"/i) || extractSlot.call(null, atText, /:val\s+([^\s\)]+)/i);
          if (target && attr) {
            if (!attrs[target]) attrs[target] = Object.create(null);
            attrs[target][attr] = val !== null ? val : '#38bdf8';
          }
        });

        // Emitter sets
        const emitterSets = [];
        const esBlocks = extractSexprBlocks(stText, ':emitter-set');
        esBlocks.forEach(esText => {
          const target = extractSlot.call(null, esText, /:target\s+"([^"]+)"/i) || extractSlot.call(null, esText, /:target\s+([^\s\)]+)/i);
          const speed = parseFloat(extractSlot.call(null, esText, /:speed\s+([\d\.\-]+)/i) || '120');
          const count = parseInt(extractSlot.call(null, esText, /:count\s+(\d+)/i) || '80', 10);
          const gravity = parseFloat(extractSlot.call(null, esText, /:gravity\s+([\d\.\-]+)/i) || '0');
          if (target) {
            emitterSets.push({ target, speed, count, gravity });
          }
        });

        states.push({ name: stName, attrs, emitterSets });
      });

      // Transitions
      const transitions = [];
      const transContainer = extractSexprBlocks(smText, ':transitions');
      const transBlocks = transContainer.length > 0
        ? extractSexprBlocks(transContainer[0], ':transition')
        : extractSexprBlocks(smText, ':transition');

      transBlocks.forEach(trText => {
        const from = extractSlot.call(null, trText, /:from\s+"([^"]+)"/i) || extractSlot.call(null, trText, /:from\s+([^\s\)]+)/i) || '*';
        const to = extractSlot.call(null, trText, /:to\s+"([^"]+)"/i) || extractSlot.call(null, trText, /:to\s+([^\s\)]+)/i);
        const trigger = extractSlot.call(null, trText, /:trigger\s+"([^"]+)"/i) || extractSlot.call(null, trText, /:trigger\s+([^\s\)]+)/i) || 'true';
        const duration = parseFloat(extractSlot.call(null, trText, /:duration\s+([\d\.]+)/i) || '0.5');
        const dwellTime = parseFloat(extractSlot.call(null, trText, /:dwell\s+([\d\.]+)/i) || '0.3');
        if (to) {
          transitions.push({ from, to, trigger, duration, dwellTime });
        }
      });

      stateMachines.push({
        id: smId,
        initial,
        dwellTime: dwell,
        states,
        transitions
      });
    });

    // Live Vector Oscilloscopes (:scope)
    const scopes = [];
    const scopeBlocks = extractSexprBlocks(astContent, ':scope');
    scopeBlocks.forEach(sb => {
      const target = extractQuoted(sb, 'target') || extractSlot.call(null, sb, /:target\s+([^\s\)]+)/i);
      const xExpr = extractQuoted(sb, 'x-expr') || extractQuoted(sb, 'xExpr') || 't';
      const yExpr = extractQuoted(sb, 'y-expr') || extractQuoted(sb, 'yExpr') || '0';
      const samplesStr = extractSlot.call(null, sb, /:samples\s+(\d+)/i);
      const samples = samplesStr ? Math.max(8, Math.min(2048, parseInt(samplesStr, 10))) : 96;
      const xrMatch = sb.match(/:x-?range\s*\(\s*([\d\.\-]+)\s+([\d\.\-]+)\s*\)/i);
      const yrMatch = sb.match(/:y-?range\s*\(\s*([\d\.\-]+)\s+([\d\.\-]+)\s*\)/i);
      const plotMatch = sb.match(/:plot\s*\(\s*([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s*\)/i);
      if (target) {
        const sc = {
          target,
          xExpr,
          yExpr,
          samples,
          xRange: xrMatch ? [parseFloat(xrMatch[1]), parseFloat(xrMatch[2])] : [0, 30],
          yRange: yrMatch ? [parseFloat(yrMatch[1]), parseFloat(yrMatch[2])] : [0, 100]
        };
        if (plotMatch) {
          sc.plot = [
            parseFloat(plotMatch[1]),
            parseFloat(plotMatch[2]),
            parseFloat(plotMatch[3]),
            parseFloat(plotMatch[4])
          ];
        }
        scopes.push(sc);
      }
    });

    // Conservation-Law & Energy-Ledger Meters (:ledger)
    const ledgers = [];
    const ledgerBlocks = extractSexprBlocks(astContent, ':ledger');
    ledgerBlocks.forEach(lb => {
      const lid = extractQuoted(lb, 'id') || `ledger_${ledgers.length + 1}`;
      const target = extractQuoted(lb, 'target') || `#${lid}`;
      const unit = extractQuoted(lb, 'unit') || '';
      const maxExpr = extractQuoted(lb, 'max') || '';
      const lx = parseFloat(extractSlot.call(null, lb, /:x\s+([\d\.\-]+)/i) || '40');
      const ly = parseFloat(extractSlot.call(null, lb, /:y\s+([\d\.\-]+)/i) || '400');
      const lw = parseFloat(extractSlot.call(null, lb, /:width\s+([\d\.]+)/i) || '320');
      const lh = parseFloat(extractSlot.call(null, lb, /:height\s+([\d\.]+)/i) || '20');
      const termBlocks = extractSexprBlocks(lb, ':label');
      const terms = [];
      termBlocks.forEach(tb => {
        const label = extractQuoted(tb, 'label') || 'Term';
        const expr = extractQuoted(tb, 'expr') || '0';
        const color = extractQuoted(tb, 'color') || '#38bdf8';
        terms.push({ label, expr, color });
      });
      if (terms.length > 0) {
        ledgers.push({ id: lid, target, unit, maxExpr, x: lx, y: ly, width: lw, height: lh, terms });
      }
    });

    // Cartridge Feature & UI Controls (:controls (:arrow-step :off) ... or plist)
    let controls = null;
    const controlsBlocks = extractSexprBlocks(astContent, ':controls');
    if (controlsBlocks.length > 0) {
      controls = {};
      controlsBlocks.forEach(cb => {
        const pairRe = /\(\s*:([a-zA-Z0-9_-]+)\s+(:on|:off|:true|:false|true|false)\s*\)/gi;
        let pm;
        while ((pm = pairRe.exec(cb)) !== null) {
          const flag = pm[1].toLowerCase();
          const tok = pm[2].toLowerCase();
          controls[flag] = (tok === ':on' || tok === ':true' || tok === 'true');
        }
        const plistBody = cb.replace(/^\(\s*:controls\b/i, '').replace(/\([^\)]*\)/g, ' ');
        const plistRe = /:([a-zA-Z0-9_-]+)\s+(:on|:off|:true|:false|true|false)(?=[\s)]|$)/gi;
        let plm;
        while ((plm = plistRe.exec(plistBody)) !== null) {
          const flag = plm[1].toLowerCase();
          const tok = plm[2].toLowerCase();
          controls[flag] = (tok === ':on' || tok === ':true' || tok === 'true');
        }
      });
      if (Object.keys(controls).length === 0) controls = null;
    }

    // Declarative 3D Camera Viewpoint Stops (:camera-stops ((:stop :id ... :aliases ... :yaw ... :pitch ... :scale ... :t ... :toast ...)))
    let cameraStops = null;
    const camStopBlocks = extractSexprBlocks(astContent, ':camera-stops');
    if (camStopBlocks.length > 0) {
      const stops = [];
      const stopForms = extractSexprBlocks(camStopBlocks[0], ':stop');
      stopForms.forEach(st => {
        const sid = extractQuoted(st, 'id') || extractSlot.call(null, st, /:id\s+([^\s\)]+)/i);
        if (!sid) return;
        const rawAliases = extractQuoted(st, 'aliases') || '';
        const aliases = rawAliases
          ? rawAliases.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
          : [];
        const yawStr = extractSlot.call(null, st, /:yaw\s+([\d\.\-]+)/i);
        const pitchStr = extractSlot.call(null, st, /:pitch\s+([\d\.\-]+)/i);
        const scaleStr = extractSlot.call(null, st, /:scale\s+([\d\.\-]+)/i);
        const tStr = extractSlot.call(null, st, /:t\s+([\d\.\-]+)/i);
        const toast = extractQuoted(st, 'toast') || '';
        stops.push({
          id: sid.toLowerCase(),
          aliases,
          yaw: yawStr !== null ? parseFloat(yawStr) : 0,
          pitch: pitchStr !== null ? parseFloat(pitchStr) : 0,
          scale: scaleStr !== null ? parseFloat(scaleStr) : 1.0,
          t: tStr !== null ? parseFloat(tStr) : undefined,
          toast
        });
      });
      if (stops.length > 0) cameraStops = stops;
    }

    // Declarative Guided Quest Missions (:quests :title ... (:missions ((:mission ... (:questions ((:q ...)))))))
    let quests = null;
    const questBlocks = extractSexprBlocks(astContent, ':quests');
    if (questBlocks.length > 0) {
      const qb = questBlocks[0];
      const missionsBlocks = extractSexprBlocks(qb, ':missions');
      const headerOnly = missionsBlocks.length > 0 ? qb.replace(missionsBlocks[0], '') : qb;
      const qTitle = extractQuoted(headerOnly, 'title') || '3D Explorer Quest Started!';
      const completionTitle = extractQuoted(headerOnly, 'completion-title') || 'QUEST COMPLETE!';
      const completionDesc = extractQuoted(headerOnly, 'completion-desc') || 'Congratulations! You have completed every mission in this scene.';
      const feedbackWrong = extractQuoted(headerOnly, 'feedback-wrong') || 'Key Insight:';
      const correctToast = extractQuoted(headerOnly, 'correct-toast') || '⭐ Correct! +100 Points';
      const wrongToast = extractQuoted(headerOnly, 'wrong-toast') || 'Notice: Review the explanation below';

      const missionForms = extractSexprBlocks(missionsBlocks.length > 0 ? missionsBlocks[0] : qb, ':mission');
      const missions = [];
      missionForms.forEach((mb, mIdx) => {
        const qSubBlocks = extractSexprBlocks(mb, ':questions');
        const mHeader = qSubBlocks.length > 0 ? mb.replace(qSubBlocks[0], '') : mb;
        const mid = extractQuoted(mHeader, 'id') || `mission_${mIdx + 1}`;
        const mTitle = extractQuoted(mHeader, 'title') || `Mission ${mIdx + 1}`;
        const mDesc = extractQuoted(mHeader, 'desc') || '';
        const tStr = extractSlot.call(null, mHeader, /:t\s+([\d\.\-]+)/i);
        const yawStr = extractSlot.call(null, mHeader, /:yaw\s+([\d\.\-]+)/i);
        const pitchStr = extractSlot.call(null, mHeader, /:pitch\s+([\d\.\-]+)/i);
        const scaleStr = extractSlot.call(null, mHeader, /:scale\s+([\d\.\-]+)/i);
        const hasCam = yawStr !== null || pitchStr !== null || scaleStr !== null;

        const qForms = extractSexprBlocks(qSubBlocks.length > 0 ? qSubBlocks[0] : mb, ':q');
        const questionPool = [];
        qForms.forEach(qf => {
          const prompt = extractQuoted(qf, 'prompt') || '';
          const ansMatch = qf.match(/:answer\s+(\d+)/i);
          const explanation = extractQuoted(qf, 'explanation') || '';
          const options = [];
          const optIdx = qf.indexOf(':options');
          if (optIdx !== -1) {
            const sParen = qf.indexOf('(', optIdx);
            if (sParen !== -1) {
              let depth = 0;
              let inStr = false;
              let eParen = -1;
              for (let i = sParen; i < qf.length; i++) {
                const ch = qf[i];
                if (ch === '"' && (i === 0 || qf[i - 1] !== '\\')) inStr = !inStr;
                else if (!inStr) {
                  if (ch === '(') depth++;
                  else if (ch === ')') {
                    depth--;
                    if (depth === 0) { eParen = i; break; }
                  }
                }
              }
              if (eParen !== -1) {
                const inside = qf.slice(sParen + 1, eParen);
                const optRe = /"((?:[^"\\]|\\.)*)"/g;
                let om;
                while ((om = optRe.exec(inside)) !== null) {
                  options.push(om[1].replace(/\\"/g, '"'));
                }
              }
            }
          }
          if (prompt && options.length > 0) {
            questionPool.push({
              question: prompt,
              options,
              correct: ansMatch ? parseInt(ansMatch[1], 10) : 0,
              explanation
            });
          }
        });

        if (questionPool.length > 0) {
          missions.push({
            id: mid,
            targetT: tStr !== null ? parseFloat(tStr) : 0,
            cam: hasCam ? {
              yaw: yawStr !== null ? parseFloat(yawStr) : 0,
              pitch: pitchStr !== null ? parseFloat(pitchStr) : 0,
              scale: scaleStr !== null ? parseFloat(scaleStr) : 1.0
            } : null,
            title: mTitle,
            desc: mDesc,
            questionPool
          });
        }
      });

      if (missions.length > 0) {
        quests = {
          title: qTitle,
          completionTitle,
          completionDesc,
          feedbackWrong,
          correctToast,
          wrongToast,
          missions
        };
      }
    }

    // Declarative Player AST Skill activations (:use-skill "skill-id" :param val ...)
    const skills = [];
    const useSkillBlocks = extractSexprBlocks(astContent, ':use-skill');
    useSkillBlocks.forEach(sb => {
      const idMatch = sb.match(/^\(\s*:use-skill\s+"([^"]+)"/i) || sb.match(/:id\s+"([^"]+)"/i);
      const skillId = idMatch ? idMatch[1] : null;
      if (!skillId) return;
      const params = {};
      const attrRe = /:([a-zA-Z0-9_-]+)\s+("(?:[^"\\]|\\.)*"|true|false|-?\d+(?:\.\d+)?)/gi;
      let am;
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
    });

    const has3D = Boolean((camBlocks && camBlocks.length > 0) || bindings.some(b => b.type && b.type.startsWith('3d-')));

    return {
      id: id || 'custom-scene',
      title: title || 'AST Vector Scene',
      stage,
      type,
      cartridgeType: type,
      duration,
      bootSound,
      video: video || null,
      videoFit: videoFit || 'contain',
      hasVideo: Boolean(video),
      camera: (camBlocks && camBlocks.length > 0) ? camera : null,
      cameraStops,
      quests,
      has3D,
      keyframes,
      subtitles,
      bindings,
      checkpoints,
      scopes,
      ledgers,
      physics,
      stateMachines: stateMachines.length > 0 ? stateMachines : null,
      emitters: emitters.length > 0 ? emitters : null,
      vars,
      inputs,
      uiControls,
      computed,
      staticElements,
      actors,
      gestures,
      skills,
      controls,
      interactive: checkpoints.length > 0 ? { checkpoints, hotspots: [] } : null
    };
  }

  global.parseAst = parseAst;
  if (typeof window !== 'undefined') {
    window.parseAst = parseAst;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseAst };
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
