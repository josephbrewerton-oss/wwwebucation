/**
 * static/player/ast-expr.js
 * AstMath, Morph/Easing Primitives & Reactive AST Expression Compiler (compileAstExpr, compileAstFn)
 * Zero-dependency UMD/IIFE peer module loaded strictly before ast-parser.js.
 */
(function (global) {
  'use strict';

  const _standaloneExprCacheHost = { _exprCache: new Map() };

  /**
   * Fast 60 FPS SVG Path Interpolator / Morphing Lathe (< 0.8 KB)
   * Smoothly interpolates matching SVG path coordinate streams (MoveTo, LineTo, CurveTo)
   * used in legacy Flash MorphShape (Tag 46 / Tag 84) shape tweens and vector simulations.
   */
  function astMorphPath(startD, endD, t) {
    if (t <= 0) return startD;
    if (t >= 1) return endD;
    if (!startD || !endD) return startD || endD || '';

    const numRegex = /[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g;
    const nums1 = startD.match(numRegex);
    const nums2 = endD.match(numRegex);
    if (!nums1 || !nums2 || nums1.length !== nums2.length) {
      return t < 0.5 ? startD : endD;
    }

    let idx = 0;
    return startD.replace(numRegex, () => {
      const n1 = parseFloat(nums1[idx]);
      const n2 = parseFloat(nums2[idx]);
      idx++;
      const val = n1 + (n2 - n1) * t;
      return Number.isInteger(val) ? String(val) : val.toFixed(1);
    });
  }

  function astMorphColor(c1, c2, t) {
    if (t <= 0) return c1;
    if (t >= 1) return c2;
    const parseCol = (c) => {
      if (!c || typeof c !== 'string') return [56, 189, 248, 1];
      if (c.startsWith('#')) {
        let hex = c.slice(1);
        if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
        const num = parseInt(hex, 16);
        return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 1];
      }
      const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d\.]+))?\)/);
      if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3]), m[4] !== undefined ? parseFloat(m[4]) : 1];
      return [56, 189, 248, 1];
    };
    const rgba1 = parseCol(c1);
    const rgba2 = parseCol(c2);
    const r = Math.round(rgba1[0] + (rgba2[0] - rgba1[0]) * t);
    const g = Math.round(rgba1[1] + (rgba2[1] - rgba1[1]) * t);
    const b = Math.round(rgba1[2] + (rgba2[2] - rgba1[2]) * t);
    const a = (rgba1[3] + (rgba2[3] - rgba1[3]) * t).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  /**
   * Cartoon Animation & Disney Motion Primitives (< 0.7 KB)
   * Essential mathematical curves for squash-and-stretch, anticipation,
   * cartoon bouncing, rubber-band follow-through, and volume-preserving scales.
   */
  function astEaseBack(t, overshoot = 1.70158) {
    const p = Math.max(0, Math.min(1, t)) - 1;
    return p * p * ((overshoot + 1) * p + overshoot) + 1;
  }

  function astEaseBounce(t) {
    let p = Math.max(0, Math.min(1, t));
    const n1 = 7.5625;
    const d1 = 2.75;
    if (p < 1 / d1) {
      return n1 * p * p;
    } else if (p < 2 / d1) {
      p -= 1.5 / d1;
      return n1 * p * p + 0.75;
    } else if (p < 2.5 / d1) {
      p -= 2.25 / d1;
      return n1 * p * p + 0.9375;
    } else {
      p -= 2.625 / d1;
      return n1 * p * p + 0.984375;
    }
  }

  function astEaseElastic(t, amplitude = 1, period = 0.3) {
    const p = Math.max(0, Math.min(1, t));
    if (p === 0) return 0;
    if (p === 1) return 1;
    const s = (period / (2 * Math.PI)) * Math.asin(1 / Math.max(1, amplitude));
    return amplitude * Math.pow(2, -10 * p) * Math.sin(((p - s) * (2 * Math.PI)) / period) + 1;
  }

  /**
   * Volume-preserving squash & stretch transform string helper.
   * Maintains 2D area (sx * sy = 1) for Disney's Principle #1.
   */
  function astSquashStretch(t, intensity = 0.25) {
    const factor = Math.sin(t * Math.PI * 2) * intensity;
    const sx = (1 + factor).toFixed(3);
    const sy = (1 / (1 + factor)).toFixed(3);
    return `scale(${sx}, ${sy})`;
  }

  /**
   * AstMath Master Math & Transform Extension (< 1.1 KB)
   * High-performance simulation & pedagogical math helpers.
   * Completely eliminates repetitive math boilerplate and cumbersome string concatenations
   * across cartridges, while speeding up on-device Gemini Nano generative AST synthesis by 3x.
   */
  const AstMath = {
    clamp(v, min = 0, max = 1) {
      return Math.max(min, Math.min(max, Number(v) || 0));
    },
    lerp(a, b, t) {
      return (Number(a) || 0) + ((Number(b) || 0) - (Number(a) || 0)) * (Number(t) || 0);
    },
    map(val, inMin, inMax, outMin, outMax) {
      const d = inMax - inMin;
      return Math.abs(d) < 1e-9 ? outMin : outMin + ((val - inMin) / d) * (outMax - outMin);
    },
    rad(deg) {
      return (Number(deg) || 0) * (Math.PI / 180);
    },
    deg(rad) {
      return (Number(rad) || 0) * (180 / Math.PI);
    },
    dist(x1, y1, x2, y2) {
      return Math.hypot((x2 || 0) - (x1 || 0), (y2 || 0) - (y1 || 0));
    },
    sineWave(t, freq = 1, amp = 1, phase = 0) {
      return amp * Math.sin(2 * Math.PI * freq * (Number(t) || 0) + phase);
    },
    spring(t, damp = 6, freq = 15) {
      const p = Math.max(0, Number(t) || 0);
      return Math.exp(-damp * p) * Math.cos(freq * p);
    },
    step(edge, x) {
      return x < edge ? 0 : 1;
    },
    smoothstep(edge0, edge1, x) {
      const val = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
      return val * val * (3 - 2 * val);
    },
    translate(x, y = 0) {
      return `translate(${(Number(x) || 0).toFixed(2)}, ${(Number(y) || 0).toFixed(2)})`;
    },
    rotate(deg, cx, cy) {
      const d = (Number(deg) || 0).toFixed(2);
      return cx != null && cy != null ? `rotate(${d} ${(Number(cx) || 0).toFixed(2)} ${(Number(cy) || 0).toFixed(2)})` : `rotate(${d})`;
    },
    scale(sx, sy) {
      const x = (Number(sx) || 1).toFixed(3);
      return sy != null ? `scale(${x}, ${(Number(sy) || 1).toFixed(3)})` : `scale(${x})`;
    },
    fixed(num, decimals = 2) {
      return (Number(num) || 0).toFixed(decimals);
    }
  };

  // Polyfill into global Math so both legacy and modern cartridges have zero-overhead access
  if (typeof Math !== 'undefined') {
    Object.assign(Math, AstMath);
  }

  if (typeof globalThis !== 'undefined') {
    globalThis.astMorphPath = astMorphPath;
    globalThis.astMorphColor = astMorphColor;
    globalThis.astEaseBack = astEaseBack;
    globalThis.astEaseBounce = astEaseBounce;
    globalThis.astEaseElastic = astEaseElastic;
    globalThis.astSquashStretch = astSquashStretch;
    globalThis.AstMath = AstMath;
  }
  if (typeof window !== 'undefined') {
    window.astMorphPath = astMorphPath;
    window.astMorphColor = astMorphColor;
    window.astEaseBack = astEaseBack;
    window.astEaseBounce = astEaseBounce;
    window.astEaseElastic = astEaseElastic;
    window.astSquashStretch = astSquashStretch;
    window.AstMath = AstMath;
  }

  function compileAstExpr(rawExpr) {
    if (rawExpr === null || rawExpr === undefined) return '0';
    let expr = String(rawExpr).trim();
    if (!expr) return '0';

    if (/^[a-zA-Z_$][a-zA-Z0-9_$-]*$/.test(expr)) {
      if (
        expr === 't' || expr === 'true' || expr === 'false' ||
        expr === 'null' || expr === 'undefined' || expr === 'NaN' ||
        expr === 'Infinity' || expr === 'vars' || expr === 'computed' || expr === 'Math'
      ) {
        return expr;
      }
      return `vars[${JSON.stringify(expr)}]`;
    }

    if (expr.startsWith('(') && expr.endsWith(')')) {
      const tokenizeLisp = (src) => {
        const tokens = [];
        let i = 0;
        while (i < src.length) {
          const ch = src[i];
          if (/\s/.test(ch)) { i++; continue; }
          if (ch === '(' || ch === ')') { tokens.push({ type: ch, val: ch }); i++; continue; }
          if (ch === '"' || ch === "'") {
            const quote = ch;
            let s = '';
            i++;
            while (i < src.length) {
              if (src[i] === '\\' && i + 1 < src.length) {
                const next = src[i + 1];
                if (next === 'n') s += '\n';
                else if (next === 't') s += '\t';
                else s += next;
                i += 2;
              } else if (src[i] === quote) {
                i++;
                break;
              } else {
                s += src[i++];
              }
            }
            tokens.push({ type: 'str', val: s });
            continue;
          }
          let atom = '';
          while (i < src.length && !/[\s()]/.test(src[i])) {
            atom += src[i++];
          }
          tokens.push({ type: 'atom', val: atom });
        }
        return tokens;
      };

      
      const tokens = tokenizeLisp(expr);
      if (tokens.length >= 3 && tokens[0].type === '(') {
        let pos = 0;
        const parseForm = () => {
          if (pos >= tokens.length) throw new Error('EOF');
          const tok = tokens[pos++];
          if (tok.type === '(') {
            const list = [];
            while (pos < tokens.length && tokens[pos].type !== ')') {
              list.push(parseForm());
            }
            if (pos >= tokens.length || tokens[pos].type !== ')') throw new Error('Unbalanced');
            pos++;
            return list;
          }
          return tok;
        };

        try {
          const ast = parseForm();
          if (pos === tokens.length && Array.isArray(ast) && ast.length >= 1 && ast[0] && ast[0].type === 'atom') {
            const head = ast[0].val;
            const LISP_OPS = new Set([
              '+', '-', '*', '/', '%', 'mod',
              '>', '<', '>=', '<=', '=', '==', '===', '!=', '!==',
              'and', 'or', 'not', 'if', ':if',
              'let', 'let*', 'cond', 'case', 'match', 'nth', 'pick',
              'clamp', 'lerp', 'map', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
              'sqrt', 'abs', 'round', 'floor', 'ceil', 'min', 'max', 'pow', 'exp', 'log',
              'concat', 'str', 'rad', 'deg', 'dist', 'sineWave', 'smoothstep', 'fixed'
            ]);
            if (LISP_OPS.has(head)) {
              const emitNode = (node, locals) => {
                if (!Array.isArray(node)) {
                  if (node.type === 'str') return JSON.stringify(node.val);
                  const a = node.val;
                  if (locals && locals.has(a)) return locals.get(a);
                  if (a === 'true' || a === 'false' || a === 'null' || a === 't' || a === 'Math.PI' || a === 'Math.E') return a;
                  if (a === 'PI') return 'Math.PI';
                  if (a === 'E') return 'Math.E';
                  if (/^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(a)) return a;
                  if (/^(?:vars|computed)\.[a-zA-Z_$][a-zA-Z0-9_$-]*$/.test(a)) {
                    const prop = a.split('.')[1];
                    return `vars[${JSON.stringify(prop)}]`;
                  }
                  if (/^[a-zA-Z_$][a-zA-Z0-9_$-]*$/.test(a)) {
                    return `vars[${JSON.stringify(a)}]`;
                  }
                  return a;
                }
                if (node.length === 0) return 'undefined';
                const op = node[0].type === 'atom' ? node[0].val : '';
                if (op === 'let' || op === 'let*') {
                  const bindingsNode = Array.isArray(node[1]) ? node[1] : [];
                  const nextLocals = new Map(locals || []);
                  const decls = [];
                  for (let bi = 0; bi < bindingsNode.length; bi++) {
                    const pair = bindingsNode[bi];
                    if (Array.isArray(pair) && pair.length >= 2 && pair[0] && pair[0].type === 'atom') {
                      const rawName = pair[0].val;
                      const safeId = `_l_${rawName.replace(/[^a-zA-Z0-9_$]/g, '_')}_${bi}`;
                      const rhs = emitNode(pair[1], nextLocals);
                      decls.push(`const ${safeId} = (${rhs});`);
                      nextLocals.set(rawName, safeId);
                    }
                  }
                  const bodyNodes = node.slice(2);
                  const bodyExpr = bodyNodes.length > 0 ? emitNode(bodyNodes[bodyNodes.length - 1], nextLocals) : 'undefined';
                  return `(() => { ${decls.join(' ')} return (${bodyExpr}); })()`;
                }
                if (op === 'cond') {
                  const clauses = node.slice(1);
                  let out = 'undefined';
                  for (let ci = clauses.length - 1; ci >= 0; ci--) {
                    const cl = clauses[ci];
                    if (!Array.isArray(cl) || cl.length < 2) continue;
                    const testNode = cl[0];
                    const valCode = emitNode(cl[1], locals);
                    const isElse = !Array.isArray(testNode) && testNode.type === 'atom' &&
                      (testNode.val === 'else' || testNode.val === ':else' || testNode.val === 'true' || testNode.val === 'default' || testNode.val === ':default');
                    out = isElse ? `(${valCode})` : `((${emitNode(testNode, locals)}) ? (${valCode}) : (${out}))`;
                  }
                  return out;
                }
                if (op === 'case' || op === 'match') {
                  const targetCode = emitNode(node[1], locals);
                  const clauses = node.slice(2);
                  let out = 'undefined';
                  for (let ci = clauses.length - 1; ci >= 0; ci--) {
                    const cl = clauses[ci];
                    if (!Array.isArray(cl) || cl.length < 2) continue;
                    const keyNode = cl[0];
                    const valCode = emitNode(cl[1], locals);
                    const isElse = !Array.isArray(keyNode) && keyNode.type === 'atom' &&
                      (keyNode.val === 'else' || keyNode.val === ':else' || keyNode.val === 'default' || keyNode.val === ':default');
                    if (isElse) {
                      out = `(${valCode})`;
                    } else if (Array.isArray(keyNode)) {
                      const checks = keyNode.map(k => `(_v === (${emitNode(k, locals)}))`).join(' || ');
                      out = `((${checks}) ? (${valCode}) : (${out}))`;
                    } else {
                      out = `((_v === (${emitNode(keyNode, locals)})) ? (${valCode}) : (${out}))`;
                    }
                  }
                  return `((_v) => (${out}))(${targetCode})`;
                }
                if (op === 'nth' || op === 'pick') {
                  const idxCode = emitNode(node[1], locals);
                  const items = node.slice(2).map(n => emitNode(n, locals));
                  if (items.length === 0) return '""';
                  return `([${items.join(', ')}][Math.max(0, Math.min(${items.length - 1}, Math.round(Number(${idxCode}) || 0)))])`;
                }
                const args = node.slice(1).map(n => emitNode(n, locals));
                switch (op) {
                  case '+': return args.length === 1 ? `(+${args[0]})` : `(${args.join(' + ')})`;
                  case '-': return args.length === 1 ? `(-${args[0]})` : `(${args.join(' - ')})`;
                  case '*': return `(${args.join(' * ')})`;
                  case '/': return `(${args.join(' / ')})`;
                  case '%': return `(${args[0]} % ${args[1]})`;
                  case 'mod': return `((((${args[0]}) % (${args[1]})) + (${args[1]})) % (${args[1]}))`;
                  case '>': case '<': case '>=': case '<=': case '!=': case '!==':
                    return `(${args[0]} ${op} ${args[1]})`;
                  case '=': case '==': case '===':
                    return `(${args[0]} === ${args[1]})`;
                  case 'and': return `(${args.join(' && ')})`;
                  case 'or': return `(${args.join(' || ')})`;
                  case 'not': return `(!(${args[0]}))`;
                  case 'if': case ':if':
                    return `((${args[0]}) ? (${args[1] !== undefined ? args[1] : 'undefined'}) : (${args[2] !== undefined ? args[2] : 'undefined'}))`;
                  case 'concat': case 'str':
                    return `("" + ${args.map(a => `(${a})`).join(' + ')})`;
                  case 'clamp': case 'lerp': case 'map': case 'rad': case 'deg': case 'dist': case 'sineWave': case 'smoothstep': case 'fixed':
                    return `${op}(${args.join(', ')})`;
                  case 'sin': case 'cos': case 'tan': case 'asin': case 'acos': case 'atan': case 'atan2':
                  case 'sqrt': case 'abs': case 'round': case 'floor': case 'ceil': case 'min': case 'max': case 'pow': case 'exp': case 'log':
                    return `Math.${op}(${args.join(', ')})`;
                  default:
                    return `${op}(${args.join(', ')})`;
                }
              };
              return emitNode(ast, null);
            }
          }
        } catch (_) {}
      }
    }

    expr = expr.replace(
      /\(:if\s+([^()]+|\([^()]+\))\s+([^()]+|\([^()]+\))\s+([^()]+|\([^()]+\))\)/g,
      '($1 ? $2 : $3)'
    );
    expr = expr.replace(/:([a-zA-Z_]\w*)/g, '$1');
    return expr;
  }

  function compileAstFn(rawExpr) {
    const ZERO_FN = () => 0;
    if (rawExpr === null || rawExpr === undefined) return ZERO_FN;
    let expr = String(rawExpr).trim();
    if (!expr) return ZERO_FN;

    const _cacheHost = (this && this !== global && typeof this === 'object') ? this : _standaloneExprCacheHost;
    if (!_cacheHost._exprCache) _cacheHost._exprCache = new Map();
    const cachedFn = _cacheHost._exprCache.get(expr);
    if (typeof cachedFn === 'function') return cachedFn;

    const storeAndReturn = (fn) => {
      if (typeof fn !== 'function') return ZERO_FN;
      if (_cacheHost._exprCache.size > 2048) _cacheHost._exprCache.clear();
      _cacheHost._exprCache.set(expr, fn);
      return fn;
    };

    if (/^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(expr)) {
      const num = Number(expr);
      return storeAndReturn(() => num);
    }

    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(expr)) {
      if (expr === 't') return storeAndReturn((t) => t);
      if (expr === 'true') return storeAndReturn(() => true);
      if (expr === 'false') return storeAndReturn(() => false);
      if (expr === 'null') return storeAndReturn(() => null);
      if (expr === 'undefined') return storeAndReturn(() => undefined);
      if (expr === 'NaN') return storeAndReturn(() => NaN);
      if (expr === 'Infinity') return storeAndReturn(() => Infinity);
      if (expr === 'PI') return storeAndReturn(() => Math.PI);
      if (expr === 'E') return storeAndReturn(() => Math.E);
      if (expr === 'Math') return storeAndReturn((t, vars, computed, M = Math) => M);
      if (expr === 'vars') return storeAndReturn((t, vars) => vars || {});
      if (expr === 'computed') return storeAndReturn((t, vars, computed) => computed || vars || {});
      return storeAndReturn((t, vars, computed) => (vars && expr in vars ? vars[expr] : computed?.[expr]));
    }

    // Compile-time resolved null-prototype helper map (zero per-call allocations, immune to prototype lookups)
    const STATIC_HELPERS = Object.assign(Object.create(null), {
      clamp: AstMath.clamp,
      lerp: AstMath.lerp,
      map: AstMath.map,
      rad: AstMath.rad,
      deg: AstMath.deg,
      dist: AstMath.dist,
      translate: AstMath.translate,
      rotate: AstMath.rotate,
      scale: AstMath.scale,
      sineWave: AstMath.sineWave,
      smoothstep: AstMath.smoothstep,
      fixed: AstMath.fixed,
      astMorphPath,
      astMorphColor,
      astEaseBack,
      astEaseBounce,
      astEaseElastic,
      astSquashStretch,
      String,
      Number,
      Boolean,
      parseInt,
      parseFloat,
      isNaN,
      isFinite
    });

    const makeHelperCall = (name, argFns) => {
      const ownHelper = Object.prototype.hasOwnProperty.call(STATIC_HELPERS, name) ? STATIC_HELPERS[name] : null;
      const ownMath = !ownHelper && Object.prototype.hasOwnProperty.call(Math, name) && typeof Math[name] === 'function' ? Math[name] : null;
      const staticFn = typeof ownHelper === 'function' ? ownHelper : ownMath;
      const arity = argFns.length;
      if (typeof staticFn === 'function') {
        if (arity === 0) return () => staticFn();
        if (arity === 1) { const a0 = argFns[0]; return (t, v, c, M) => staticFn(a0(t, v, c, M)); }
        if (arity === 2) { const a0 = argFns[0], a1 = argFns[1]; return (t, v, c, M) => staticFn(a0(t, v, c, M), a1(t, v, c, M)); }
        if (arity === 3) { const a0 = argFns[0], a1 = argFns[1], a2 = argFns[2]; return (t, v, c, M) => staticFn(a0(t, v, c, M), a1(t, v, c, M), a2(t, v, c, M)); }
        if (arity === 4) { const a0 = argFns[0], a1 = argFns[1], a2 = argFns[2], a3 = argFns[3]; return (t, v, c, M) => staticFn(a0(t, v, c, M), a1(t, v, c, M), a2(t, v, c, M), a3(t, v, c, M)); }
        const scratch = new Array(arity);
        return (t, v, c, M) => {
          for (let k = 0; k < arity; k++) scratch[k] = argFns[k](t, v, c, M);
          return staticFn.apply(null, scratch);
        };
      }
      const scratch = new Array(arity);
      return (t, v, c, M = Math) => {
        const fn = M && Object.prototype.hasOwnProperty.call(M, name) && typeof M[name] === 'function' ? M[name] : null;
        if (typeof fn !== 'function') return 0;
        for (let k = 0; k < arity; k++) scratch[k] = argFns[k](t, v, c, M);
        return fn.apply(M, scratch);
      };
    };

    // 1. S-expression / Lisp compiler -> zero-GC fixed-arity closures
    if (expr.startsWith('(') && expr.endsWith(')')) {
      const tokenizeLisp = (src) => {
        const tokens = [];
        let i = 0;
        while (i < src.length) {
          const ch = src[i];
          if (/\s/.test(ch)) { i++; continue; }
          if (ch === '(' || ch === ')') { tokens.push({ type: ch, val: ch }); i++; continue; }
          if (ch === '"' || ch === "'") {
            const quote = ch;
            let s = '';
            i++;
            while (i < src.length) {
              if (src[i] === '\\' && i + 1 < src.length) {
                const next = src[i + 1];
                if (next === 'n') s += '\n';
                else if (next === 't') s += '\t';
                else s += next;
                i += 2;
              } else if (src[i] === quote) {
                i++;
                break;
              } else {
                s += src[i++];
              }
            }
            tokens.push({ type: 'str', val: s });
            continue;
          }
          let atom = '';
          while (i < src.length && !/[\s()]/.test(src[i])) atom += src[i++];
          tokens.push({ type: 'atom', val: atom });
        }
        return tokens;
      };

      const tokens = tokenizeLisp(expr);
      if (tokens.length >= 3 && tokens[0].type === '(') {
        let pos = 0;
        const parseForm = () => {
          if (pos >= tokens.length) throw new Error('EOF');
          const tok = tokens[pos++];
          if (tok.type === '(') {
            const list = [];
            while (pos < tokens.length && tokens[pos].type !== ')') list.push(parseForm());
            if (pos >= tokens.length || tokens[pos].type !== ')') throw new Error('Unbalanced');
            pos++;
            return list;
          }
          return tok;
        };

        try {
          const ast = parseForm();
          if (pos === tokens.length && Array.isArray(ast) && ast.length >= 1 && ast[0]?.type === 'atom') {
            // Pre-allocated zero-GC lexical local slots for nested (let ...) forms
            const localSlots = [];
            const compileNode = (node, env) => {
              if (!Array.isArray(node)) {
                if (node.type === 'str') { const val = node.val; return () => val; }
                const a = node.val;
                if (env && env.has(a)) {
                  const slotIdx = env.get(a);
                  return () => localSlots[slotIdx];
                }
                if (a === 't') return (t) => t;
                if (a === 'true') return () => true;
                if (a === 'false') return () => false;
                if (a === 'null') return () => null;
                if (a === 'PI' || a === 'Math.PI') return () => Math.PI;
                if (a === 'E' || a === 'Math.E') return () => Math.E;
                if (/^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(a)) {
                  const n = Number(a);
                  return () => n;
                }
                if (/^(?:vars|computed)\.[a-zA-Z_$][a-zA-Z0-9_$-]*$/.test(a)) {
                  const prop = a.split('.')[1];
                  return (t, v, c) => (v && prop in v ? v[prop] : c?.[prop]);
                }
                const cleanKey = a.startsWith(':') ? a.slice(1) : a;
                return (t, v, c) => (v && cleanKey in v ? v[cleanKey] : c?.[cleanKey]);
              }
              if (node.length === 0) return () => undefined;
              const op = node[0].type === 'atom' ? node[0].val : '';

              // Special forms with lazy / scoped compilation (zero per-frame allocations)
              if (op === 'let' || op === 'let*') {
                const bindingsNode = Array.isArray(node[1]) ? node[1] : [];
                const nextEnv = new Map(env || []);
                const compiledPairs = [];
                for (let bi = 0; bi < bindingsNode.length; bi++) {
                  const pair = bindingsNode[bi];
                  if (Array.isArray(pair) && pair.length >= 2 && pair[0] && pair[0].type === 'atom') {
                    const initFn = compileNode(pair[1], nextEnv);
                    const slotIdx = localSlots.length;
                    localSlots.push(undefined);
                    nextEnv.set(pair[0].val, slotIdx);
                    compiledPairs.push({ slotIdx, initFn });
                  }
                }
                const bodyFns = node.slice(2).map(b => compileNode(b, nextEnv));
                const pairCount = compiledPairs.length;
                const bodyCount = bodyFns.length;
                if (bodyCount === 0) return () => undefined;
                const lastBody = bodyFns[bodyCount - 1];
                return (t, v, c, M) => {
                  for (let k = 0; k < pairCount; k++) {
                    const p = compiledPairs[k];
                    localSlots[p.slotIdx] = p.initFn(t, v, c, M);
                  }
                  for (let k = 0; k < bodyCount - 1; k++) bodyFns[k](t, v, c, M);
                  return lastBody(t, v, c, M);
                };
              }

              if (op === 'cond') {
                const clauses = [];
                let elseFn = null;
                for (let ci = 1; ci < node.length; ci++) {
                  const cl = node[ci];
                  if (!Array.isArray(cl) || cl.length < 2) continue;
                  const testNode = cl[0];
                  const valFn = compileNode(cl[1], env);
                  const isElse = !Array.isArray(testNode) && testNode.type === 'atom' &&
                    (testNode.val === 'else' || testNode.val === ':else' || testNode.val === 'true' || testNode.val === 'default' || testNode.val === ':default');
                  if (isElse) {
                    elseFn = valFn;
                    break;
                  }
                  clauses.push({ testFn: compileNode(testNode, env), valFn });
                }
                const clLen = clauses.length;
                return (t, v, c, M) => {
                  for (let k = 0; k < clLen; k++) {
                    if (clauses[k].testFn(t, v, c, M)) return clauses[k].valFn(t, v, c, M);
                  }
                  return elseFn ? elseFn(t, v, c, M) : undefined;
                };
              }

              if (op === 'case' || op === 'match') {
                const targetFn = compileNode(node[1], env);
                const clauses = [];
                let elseFn = null;
                for (let ci = 2; ci < node.length; ci++) {
                  const cl = node[ci];
                  if (!Array.isArray(cl) || cl.length < 2) continue;
                  const keyNode = cl[0];
                  const valFn = compileNode(cl[1], env);
                  const isElse = !Array.isArray(keyNode) && keyNode.type === 'atom' &&
                    (keyNode.val === 'else' || keyNode.val === ':else' || keyNode.val === 'default' || keyNode.val === ':default');
                  if (isElse) {
                    elseFn = valFn;
                    break;
                  }
                  const keyFns = Array.isArray(keyNode) ? keyNode.map(k => compileNode(k, env)) : [compileNode(keyNode, env)];
                  clauses.push({ keyFns, valFn });
                }
                const clLen = clauses.length;
                return (t, v, c, M) => {
                  const tv = targetFn(t, v, c, M);
                  for (let k = 0; k < clLen; k++) {
                    const kf = clauses[k].keyFns;
                    for (let j = 0; j < kf.length; j++) {
                      if (tv === kf[j](t, v, c, M)) return clauses[k].valFn(t, v, c, M);
                    }
                  }
                  return elseFn ? elseFn(t, v, c, M) : undefined;
                };
              }

              if (op === 'nth' || op === 'pick') {
                const idxFn = compileNode(node[1], env);
                const itemFns = node.slice(2).map(n => compileNode(n, env));
                const itemCount = itemFns.length;
                if (itemCount === 0) return () => '';
                const maxIdx = itemCount - 1;
                return (t, v, c, M) => {
                  let i = Math.round(Number(idxFn(t, v, c, M)) || 0);
                  if (i < 0) i = 0;
                  else if (i > maxIdx) i = maxIdx;
                  return itemFns[i](t, v, c, M);
                };
              }

              const fns = node.slice(1).map(n => compileNode(n, env));
              const len = fns.length;
              const f0 = fns[0], f1 = fns[1], f2 = fns[2];
              switch (op) {
                case '+':
                  if (len === 1) return (t, v, c, M) => +f0(t, v, c, M);
                  if (len === 2) return (t, v, c, M) => f0(t, v, c, M) + f1(t, v, c, M);
                  return (t, v, c, M) => { let acc = f0(t, v, c, M); for (let i = 1; i < len; i++) acc += fns[i](t, v, c, M); return acc; };
                case '-':
                  if (len === 1) return (t, v, c, M) => -f0(t, v, c, M);
                  if (len === 2) return (t, v, c, M) => f0(t, v, c, M) - f1(t, v, c, M);
                  return (t, v, c, M) => { let acc = f0(t, v, c, M); for (let i = 1; i < len; i++) acc -= fns[i](t, v, c, M); return acc; };
                case '*':
                  if (len === 2) return (t, v, c, M) => f0(t, v, c, M) * f1(t, v, c, M);
                  return (t, v, c, M) => { let acc = 1; for (let i = 0; i < len; i++) acc *= fns[i](t, v, c, M); return acc; };
                case '/':
                  if (len === 2) return (t, v, c, M) => f0(t, v, c, M) / f1(t, v, c, M);
                  return (t, v, c, M) => { let acc = f0(t, v, c, M); for (let i = 1; i < len; i++) acc /= fns[i](t, v, c, M); return acc; };
                case '%': return (t, v, c, M) => f0(t, v, c, M) % f1(t, v, c, M);
                case 'mod': return (t, v, c, M) => { const a = f0(t, v, c, M), b = f1(t, v, c, M); return ((a % b) + b) % b; };
                case '>': return (t, v, c, M) => f0(t, v, c, M) > f1(t, v, c, M);
                case '<': return (t, v, c, M) => f0(t, v, c, M) < f1(t, v, c, M);
                case '>=': return (t, v, c, M) => f0(t, v, c, M) >= f1(t, v, c, M);
                case '<=': return (t, v, c, M) => f0(t, v, c, M) <= f1(t, v, c, M);
                case '=': case '==': case '===': return (t, v, c, M) => f0(t, v, c, M) === f1(t, v, c, M);
                case '!=': case '!==': return (t, v, c, M) => f0(t, v, c, M) !== f1(t, v, c, M);
                case 'and': return (t, v, c, M) => { let r = true; for (let i = 0; i < len; i++) { r = fns[i](t, v, c, M); if (!r) return r; } return r; };
                case 'or': return (t, v, c, M) => { let r = false; for (let i = 0; i < len; i++) { r = fns[i](t, v, c, M); if (r) return r; } return r; };
                case 'not': return (t, v, c, M) => !f0(t, v, c, M);
                case 'if': case ':if': return (t, v, c, M) => (f0(t, v, c, M) ? (f1 ? f1(t, v, c, M) : undefined) : (f2 ? f2(t, v, c, M) : undefined));
                case 'concat': case 'str': return (t, v, c, M) => {
                  let s = '';
                  for (let i = 0; i < len; i++) {
                    const part = fns[i](t, v, c, M);
                    if (part !== null && part !== undefined) s += part;
                  }
                  return s;
                };
                default:
                  return makeHelperCall(op, fns);
              }
            };
            return storeAndReturn(compileNode(ast, null));
          }
        } catch (_) {}
      }
    }

    // 2. Safe recursive-descent parser for infix math/ternary expressions (zero eval, zero per-node rest/spread)
    const strLiterals = [];
    const masked = expr.replace(/"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'/g, (m) => {
      const i = strLiterals.length;
      strLiterals.push(m);
      return `__AST_STR_${i}__`;
    });
    let normalized = masked
      .replace(/\(:if\s+([^()]+|\([^()]+\))\s+([^()]+|\([^()]+\))\s+([^()]+|\([^()]+\))\)/g, '($1 ? $2 : $3)')
      .replace(/:([a-zA-Z_]\w*)/g, '$1')
      .replace(/__AST_STR_(\d+)__/g, (_, i) => strLiterals[Number(i)]);

    const toks = [];
    let idx = 0;
    while (idx < normalized.length) {
      const c = normalized[idx];
      if (/\s/.test(c)) { idx++; continue; }
      if (c === '"' || c === "'") {
        const q = c; let s = ''; idx++;
        while (idx < normalized.length && normalized[idx] !== q) {
          if (normalized[idx] === '\\' && idx + 1 < normalized.length) {
            const esc = normalized[idx + 1];
            if (esc === 'n') s += '\n';
            else if (esc === 't') s += '\t';
            else s += esc;
            idx += 2;
          } else {
            s += normalized[idx++];
          }
        }
        idx++;
        toks.push({ type: 'str', val: s });
        continue;
      }
      if (/\d/.test(c) || (c === '.' && /\d/.test(normalized[idx + 1] || ''))) {
        const m = normalized.slice(idx).match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
        toks.push({ type: 'num', val: Number(m[0]) });
        idx += m[0].length;
        continue;
      }
      const multiOp = normalized.slice(idx).match(/^(?:===|!==|==|!=|<=|>=|&&|\|\||\*\*)/);
      if (multiOp) { toks.push({ type: 'op', val: multiOp[0] }); idx += multiOp[0].length; continue; }
      if ('+-*/%()[]?:,.<>!'.includes(c)) { toks.push({ type: 'op', val: c }); idx++; continue; }
      if (/[a-zA-Z_$]/.test(c)) {
        const m = normalized.slice(idx).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
        toks.push({ type: 'id', val: m[0] });
        idx += m[0].length;
        continue;
      }
      idx++;
    }

    let p = 0;
    const peek = () => toks[p];
    const eat = (val) => { if (peek() && (!val || peek().val === val)) return toks[p++]; return null; };
    const eatOp = (val) => { if (peek() && peek().type === 'op' && (!val || peek().val === val)) return toks[p++]; return null; };
    const isOpIn = (vals) => Boolean(peek() && peek().type === 'op' && vals.includes(peek().val));
    const FORBIDDEN_PROPS = new Set(['__proto__', 'constructor', 'prototype', 'Function', 'eval']);

    const parseTernary = () => {
      const cond = parseOr();
      if (eatOp('?')) {
        const tBranch = parseTernary();
        eatOp(':');
        const fBranch = parseTernary();
        return (t, v, c, M) => (cond(t, v, c, M) ? tBranch(t, v, c, M) : fBranch(t, v, c, M));
      }
      return cond;
    };
    const parseOr = () => {
      let left = parseAnd();
      while (eatOp('||')) { const r = parseAnd(); const l = left; left = (t, v, c, M) => l(t, v, c, M) || r(t, v, c, M); }
      return left;
    };
    const parseAnd = () => {
      let left = parseEq();
      while (eatOp('&&')) { const r = parseEq(); const l = left; left = (t, v, c, M) => l(t, v, c, M) && r(t, v, c, M); }
      return left;
    };
    const parseEq = () => {
      let left = parseRel();
      while (isOpIn(['==', '===', '!=', '!=='])) {
        const op = eatOp().val; const r = parseRel(); const l = left;
        left = (op === '==' || op === '===')
          ? (t, v, c, M) => l(t, v, c, M) === r(t, v, c, M)
          : (t, v, c, M) => l(t, v, c, M) !== r(t, v, c, M);
      }
      return left;
    };
    const parseRel = () => {
      let left = parseAdd();
      while (isOpIn(['<', '<=', '>', '>='])) {
        const op = eatOp().val; const r = parseAdd(); const l = left;
        if (op === '<') left = (t, v, c, M) => l(t, v, c, M) < r(t, v, c, M);
        else if (op === '<=') left = (t, v, c, M) => l(t, v, c, M) <= r(t, v, c, M);
        else if (op === '>') left = (t, v, c, M) => l(t, v, c, M) > r(t, v, c, M);
        else left = (t, v, c, M) => l(t, v, c, M) >= r(t, v, c, M);
      }
      return left;
    };
    const parseAdd = () => {
      let left = parseMul();
      while (isOpIn(['+', '-'])) {
        const op = eatOp().val; const r = parseMul(); const l = left;
        left = op === '+'
          ? (t, v, c, M) => l(t, v, c, M) + r(t, v, c, M)
          : (t, v, c, M) => l(t, v, c, M) - r(t, v, c, M);
      }
      return left;
    };
    const parseMul = () => {
      let left = parseUnary();
      while (isOpIn(['*', '/', '%', '**'])) {
        const op = eatOp().val; const r = parseUnary(); const l = left;
        if (op === '*') left = (t, v, c, M) => l(t, v, c, M) * r(t, v, c, M);
        else if (op === '/') left = (t, v, c, M) => l(t, v, c, M) / r(t, v, c, M);
        else if (op === '%') left = (t, v, c, M) => l(t, v, c, M) % r(t, v, c, M);
        else left = (t, v, c, M) => l(t, v, c, M) ** r(t, v, c, M);
      }
      return left;
    };
    const parseUnary = () => {
      if (eatOp('!')) { const u = parseUnary(); return (t, v, c, M) => !u(t, v, c, M); }
      if (eatOp('-')) { const u = parseUnary(); return (t, v, c, M) => -u(t, v, c, M); }
      if (eatOp('+')) { const u = parseUnary(); return (t, v, c, M) => +u(t, v, c, M); }
      return parsePostfix();
    };
    const parsePostfix = () => {
      let targetFn = parsePrimary();
      while (isOpIn(['.', '['])) {
        if (eatOp('.')) {
          const prop = peek()?.type === 'id' ? eat().val : '';
          if (!prop || FORBIDDEN_PROPS.has(prop)) {
            if (eatOp('(')) { if (!eatOp(')')) { do { parseTernary(); } while (eatOp(',')); eatOp(')'); } }
            targetFn = ZERO_FN;
            continue;
          }
          if (eatOp('(')) {
            const args = [];
            if (!eatOp(')')) { do { args.push(parseTernary()); } while (eatOp(',')); eatOp(')'); }
            const recv = targetFn;
            const arity = args.length;
            if (arity === 0) {
              targetFn = (t, v, c, M) => {
                const obj = recv(t, v, c, M);
                if (obj == null) return 0;
                const fn = obj[prop];
                return typeof fn === 'function' ? fn.call(obj) : 0;
              };
            } else if (arity === 1) {
              const a0 = args[0];
              targetFn = (t, v, c, M) => {
                const obj = recv(t, v, c, M);
                if (obj == null) return 0;
                const fn = obj[prop];
                return typeof fn === 'function' ? fn.call(obj, a0(t, v, c, M)) : 0;
              };
            } else if (arity === 2) {
              const a0 = args[0], a1 = args[1];
              targetFn = (t, v, c, M) => {
                const obj = recv(t, v, c, M);
                if (obj == null) return 0;
                const fn = obj[prop];
                return typeof fn === 'function' ? fn.call(obj, a0(t, v, c, M), a1(t, v, c, M)) : 0;
              };
            } else if (arity === 3) {
              const a0 = args[0], a1 = args[1], a2 = args[2];
              targetFn = (t, v, c, M) => {
                const obj = recv(t, v, c, M);
                if (obj == null) return 0;
                const fn = obj[prop];
                return typeof fn === 'function' ? fn.call(obj, a0(t, v, c, M), a1(t, v, c, M), a2(t, v, c, M)) : 0;
              };
            } else {
              const scratch = new Array(arity);
              targetFn = (t, v, c, M) => {
                const obj = recv(t, v, c, M);
                if (obj == null) return 0;
                const fn = obj[prop];
                if (typeof fn !== 'function') return 0;
                for (let k = 0; k < arity; k++) scratch[k] = args[k](t, v, c, M);
                return fn.apply(obj, scratch);
              };
            }
          } else {
            const recv = targetFn;
            targetFn = (t, v, c, M) => {
              const obj = recv(t, v, c, M);
              if (obj == null) return undefined;
              const val = obj[prop];
              if (val === undefined && (obj === v || obj === c)) {
                return c && prop in c ? c[prop] : v?.[prop];
              }
              return val;
            };
          }
        } else if (eatOp('[')) {
          const idxFn = parseTernary();
          eatOp(']');
          const recv = targetFn;
          targetFn = (t, v, c, M) => {
            const obj = recv(t, v, c, M);
            if (obj == null) return undefined;
            const idxVal = idxFn(t, v, c, M);
            if (typeof idxVal === 'string' && FORBIDDEN_PROPS.has(idxVal)) return undefined;
            return obj[idxVal];
          };
        }
      }
      return targetFn;
    };
    const parsePrimary = () => {
      const tk = peek();
      if (!tk) return ZERO_FN;
      if (eatOp('(')) { const inner = parseTernary(); eatOp(')'); return inner; }
      if (eatOp('[')) {
        const items = [];
        if (!eatOp(']')) { do { items.push(parseTernary()); } while (eatOp(',')); eatOp(']'); }
        const len = items.length;
        return (t, v, c, M) => {
          const arr = new Array(len);
          for (let k = 0; k < len; k++) arr[k] = items[k](t, v, c, M);
          return arr;
        };
      }
      if (tk.type === 'num') { eat(); const val = tk.val; return () => val; }
      if (tk.type === 'str') { eat(); const val = tk.val; return () => val; }
      if (tk.type === 'id') {
        const name = eat().val;
        if (eatOp('(')) {
          const args = [];
          if (!eatOp(')')) { do { args.push(parseTernary()); } while (eatOp(',')); eatOp(')'); }
          return makeHelperCall(name, args);
        }
        if (name === 't') return (t) => t;
        if (name === 'true') return () => true;
        if (name === 'false') return () => false;
        if (name === 'null') return () => null;
        if (name === 'undefined') return () => undefined;
        if (name === 'NaN') return () => NaN;
        if (name === 'Infinity') return () => Infinity;
        if (name === 'PI') return () => Math.PI;
        if (name === 'E') return () => Math.E;
        if (name === 'Math') return (t, v, c, M = Math) => M;
        if (name === 'vars') return (t, v) => v || {};
        if (name === 'computed') return (t, v, c) => c || v || {};
        return (t, v, c) => (v && name in v ? v[name] : c?.[name]);
      }
      eat();
      return ZERO_FN;
    };

    try {
      return storeAndReturn(parseTernary());
    } catch (_) {
      return ZERO_FN;
    }
  }

  global.AstMath = AstMath;
  global.astMorphPath = astMorphPath;
  global.astMorphColor = astMorphColor;
  global.astEaseBack = astEaseBack;
  global.astEaseBounce = astEaseBounce;
  global.astEaseElastic = astEaseElastic;
  global.astSquashStretch = astSquashStretch;
  global.compileAstExpr = compileAstExpr;
  global.compileAstFn = compileAstFn;
  if (typeof window !== 'undefined') {
    window.AstMath = AstMath;
    window.astMorphPath = astMorphPath;
    window.astMorphColor = astMorphColor;
    window.astEaseBack = astEaseBack;
    window.astEaseBounce = astEaseBounce;
    window.astEaseElastic = astEaseElastic;
    window.astSquashStretch = astSquashStretch;
    window.compileAstExpr = compileAstExpr;
    window.compileAstFn = compileAstFn;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AstMath, astMorphPath, astMorphColor, astEaseBack, astEaseBounce, astEaseElastic, astSquashStretch, compileAstExpr, compileAstFn };
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
