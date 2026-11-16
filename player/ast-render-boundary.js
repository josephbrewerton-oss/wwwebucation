/**
 * static/player/ast-render-boundary.js
 *
 * St Joseph's Curriculum Portal & Lumina AST Engine — Standalone Shared Rendering Boundary
 *
 * Zero-dependency, framework-free shared rendering subsystem separating DOM/Canvas pixel
 * commits from compute VMs (static/player/ast-engine.js & src/engine/everymanBios.ts).
 *
 * Designed as a single shared resource inspectable & steerable by Gemini Nano / WebMCP:
 *   1. Unified Surface Registry ('svg' | 'canvas' | 'hybrid') with compact <1 KB snapshots
 *   2. Flat 32-byte WASM Display-List Canvas Blitter (0x068000 -> CanvasRenderingContext2D)
 *   3. Safe SVG Stage Sanitizer, Master <defs>, viewBox Sync & Mount Pipeline
 *   4. Zero-GC Attribute & 6-Float Affine Matrix Commit Primitives
 *   5. Cross-Surface Spotlight Highlight & Pointer Coordinate Normalizer
 */
(function (global) {
  'use strict';

  const BOUNDARY_VERSION = '1.0.0-rc.1';

  const DisplayOp = Object.freeze({
    END_FRAME: 0,
    CLEAR_RECT: 1,
    FILL_RECT: 2,
    STROKE_RECT: 3,
    CIRCLE: 4,
    TEXT: 5,
    LINE: 6,
    PROGRESS_BAR: 7,
  });

  const DEFAULT_VIEWBOX = '0 0 800 480';
  const STAGE_WIDTH = 800;
  const STAGE_HEIGHT = 480;

  const ENTITY_MAP = [
    [/&times;/g, '×'],
    [/&bull;/g, '•'],
    [/&Omega;/g, 'Ω'],
    [/&nbsp;/g, '&#160;'],
    [/&divide;/g, '÷'],
    [/&diams;/g, '♦'],
    [/&mdash;/g, '—'],
    [/&ne;/g, '≠'],
    [/&deg;/g, '°'],
  ];

  const DANGEROUS_TAGS = ['script', 'foreignobject', 'iframe', 'embed', 'object', 'link', 'meta', 'style'];

  const surfaces = new Map();
  const listeners = new Set();
  const sharedUtf8 = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { fatal: false }) : null;

  let activeSurfaceId = null;
  let globalFrameCount = 0;
  let lastHighlightState = null;

  function emitBoundaryEvent(type, detail) {
    for (const cb of listeners) {
      try {
        cb({ type, detail, timestamp: Date.now() });
      } catch (_) {}
    }
    if (typeof global.dispatchEvent === 'function' && typeof global.CustomEvent === 'function') {
      try {
        global.dispatchEvent(new global.CustomEvent('ast_render_boundary_event', {
          detail: { type, ...detail },
        }));
      } catch (_) {}
    }
  }

  function decodeUtf8Slice(u8, ptr, len, decoder) {
    if (!u8 || !ptr || !len || ptr < 0 || ptr + len > u8.length) return '';
    const dec = decoder || sharedUtf8;
    if (dec) return dec.decode(u8.subarray(ptr, ptr + len));
    let out = '';
    for (let i = 0; i < len; i++) {
      out += String.fromCharCode(u8[ptr + i]);
    }
    return out;
  }

  function normalizeMode(mode) {
    if (mode === 'canvas' || mode === 'svg' || mode === 'hybrid') return mode;
    return 'svg';
  }

  function applySurfaceVisibility(entry) {
    if (!entry) return;
    const mode = entry.renderMode;
    if (entry.svgContainer && entry.svgContainer.style) {
      entry.svgContainer.style.display = mode === 'canvas' ? 'none' : '';
      entry.svgContainer.style.opacity = '1';
    }
    if (entry.stageSvg && entry.stageSvg !== entry.svgContainer && entry.stageSvg.style) {
      entry.stageSvg.style.display = mode === 'canvas' ? 'none' : '';
    }
    if (entry.canvas && entry.canvas.style) {
      if (mode === 'svg') {
        entry.canvas.style.display = 'none';
      } else if (mode === 'hybrid') {
        entry.canvas.style.display = 'block';
        entry.canvas.style.pointerEvents = 'none';
      } else {
        entry.canvas.style.display = 'block';
        entry.canvas.style.pointerEvents = 'auto';
      }
    }
  }

  function registerSurface(opts) {
    if (!opts || !opts.id) return null;
    const id = String(opts.id);
    const existing = surfaces.get(id) || {};
    const entry = {
      id,
      label: opts.label || existing.label || id,
      renderMode: normalizeMode(opts.renderMode || existing.renderMode || (opts.canvas && !opts.svgContainer ? 'canvas' : 'svg')),
      sceneId: opts.sceneId || existing.sceneId || '',
      viewBox: opts.viewBox || existing.viewBox || DEFAULT_VIEWBOX,
      svgContainer: opts.svgContainer !== undefined ? opts.svgContainer : (existing.svgContainer || null),
      stageSvg: opts.stageSvg !== undefined ? opts.stageSvg : (existing.stageSvg || null),
      canvas: opts.canvas !== undefined ? opts.canvas : (existing.canvas || null),
      bios: opts.bios !== undefined ? opts.bios : (existing.bios || null),
      metadata: Object.assign({}, existing.metadata || {}, opts.metadata || {}),
      frameCount: existing.frameCount || 0,
      lastBlitOps: existing.lastBlitOps || 0,
      svgMounted: Boolean(opts.svgMounted !== undefined ? opts.svgMounted : existing.svgMounted),
      updatedAt: Date.now(),
    };
    surfaces.set(id, entry);
    activeSurfaceId = id;
    applySurfaceVisibility(entry);
    emitBoundaryEvent('surface_registered', { id, renderMode: entry.renderMode, sceneId: entry.sceneId });
    return entry;
  }

  function unregisterSurface(id) {
    const key = String(id || '');
    const deleted = surfaces.delete(key);
    if (activeSurfaceId === key) {
      const next = surfaces.keys().next();
      activeSurfaceId = next.done ? null : next.value;
    }
    if (deleted) {
      emitBoundaryEvent('surface_unregistered', { id: key });
    }
    return deleted;
  }

  function getSurface(id) {
    if (id && surfaces.has(String(id))) return surfaces.get(String(id));
    if (activeSurfaceId && surfaces.has(activeSurfaceId)) return surfaces.get(activeSurfaceId);
    const first = surfaces.values().next();
    return first.done ? null : first.value;
  }

  function listSurfaces() {
    return Array.from(surfaces.values()).map((s) => ({
      id: s.id,
      label: s.label,
      renderMode: s.renderMode,
      sceneId: s.sceneId,
      viewBox: s.viewBox,
      hasSvg: Boolean(s.svgContainer || s.stageSvg),
      hasCanvas: Boolean(s.canvas),
      hasBios: Boolean(s.bios),
      svgMounted: Boolean(s.svgMounted),
      frameCount: s.frameCount,
      lastBlitOps: s.lastBlitOps,
    }));
  }

  function setRenderMode(surfaceId, mode) {
    const target = surfaceId ? surfaces.get(String(surfaceId)) : getSurface();
    const nextMode = normalizeMode(mode);
    if (!target) return { ok: false, renderMode: nextMode };
    target.renderMode = nextMode;
    target.updatedAt = Date.now();
    applySurfaceVisibility(target);
    emitBoundaryEvent('render_mode_changed', { id: target.id, renderMode: nextMode });
    return { ok: true, id: target.id, renderMode: nextMode };
  }

  function setSurfaceScene(surfaceId, sceneId, metadata) {
    const target = surfaceId ? surfaces.get(String(surfaceId)) : getSurface();
    if (!target) return null;
    target.sceneId = String(sceneId || '');
    if (metadata && typeof metadata === 'object') {
      target.metadata = Object.assign({}, target.metadata, metadata);
    }
    target.updatedAt = Date.now();
    emitBoundaryEvent('surface_scene_changed', { id: target.id, sceneId: target.sceneId });
    return target;
  }

  function sanitizeSvg(rawSvg) {
    if (!rawSvg || typeof rawSvg !== 'string') return '';
    let clean = rawSvg.trim();
    if (/<!DOCTYPE|<!ENTITY/i.test(clean)) {
      clean = clean
        .replace(/<!DOCTYPE(?:\s+[^[>]*(?:\[[\s\S]*?\])?\s*)?>/gi, '<!-- DOCTYPE disabled -->')
        .replace(/<!ENTITY[\s\S]*?>/gi, '<!-- ENTITY disabled -->');
    }
    return clean;
  }

  function sanitizeSvgElement(rootSvg) {
    if (!rootSvg) return null;
    if (rootSvg.tagName && DANGEROUS_TAGS.includes(rootSvg.tagName.toLowerCase())) return null;

    if (typeof rootSvg.querySelectorAll === 'function') {
      for (let i = 0; i < DANGEROUS_TAGS.length; i++) {
        rootSvg.querySelectorAll(DANGEROUS_TAGS[i]).forEach((el) => el.remove());
      }
    }

    const descendants = typeof rootSvg.querySelectorAll === 'function'
      ? Array.from(rootSvg.querySelectorAll('*'))
      : [];
    const allElements = [rootSvg].concat(descendants);

    for (let j = 0; j < allElements.length; j++) {
      const el = allElements[j];
      if (!el || !el.attributes) continue;
      const toRemove = [];
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        const name = attr.name.toLowerCase();
        const val = (attr.value || '').trim().toLowerCase();
        if (name.startsWith('on')) {
          toRemove.push(attr.name);
        } else if (
          (name === 'href' || name.endsWith(':href') || name === 'src') &&
          /^(javascript:|vbscript:|data:(?!image\/(png|jpe?g|gif|webp|svg\+xml)))/i.test(val)
        ) {
          toRemove.push(attr.name);
        }
      }
      for (let k = 0; k < toRemove.length; k++) {
        el.removeAttribute(toRemove[k]);
      }
    }
    return rootSvg;
  }

  function createSvgNode(tag, attrs, children) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) {
      const keys = Object.keys(attrs);
      for (let i = 0; i < keys.length; i++) {
        el.setAttribute(keys[i], String(attrs[keys[i]]));
      }
    }
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        if (children[i]) el.appendChild(children[i]);
      }
    }
    return el;
  }

  function ensureMasterDefs(container) {
    if (typeof document === 'undefined' || !container) return null;
    const rootSvg = (container.tagName && container.tagName.toLowerCase() === 'svg')
      ? container
      : (container.ownerSVGElement ||
        (typeof container.closest === 'function' ? container.closest('svg') : null) ||
        document.getElementById('stage-svg') ||
        (typeof container.querySelector === 'function' ? container.querySelector('svg') : null));
    if (!rootSvg) return null;

    const existingDefs = (typeof rootSvg.querySelector === 'function' && rootSvg.querySelector('#ast-master-defs')) ||
      document.getElementById('ast-master-defs');
    if (existingDefs) return existingDefs;

    const defsEl = createSvgNode('defs', { id: 'ast-master-defs' }, [
      createSvgNode('filter', { id: 'pyth-shadow', x: '-20%', y: '-20%', width: '140%', height: '140%' }, [
        createSvgNode('feDropShadow', { dx: '0', dy: '4', stdDeviation: '6', 'flood-color': '#000000', 'flood-opacity': '0.65' })
      ]),
      createSvgNode('filter', { id: 'pyth-glow', x: '-20%', y: '-20%', width: '140%', height: '140%' }, [
        createSvgNode('feGaussianBlur', { stdDeviation: '3.5', result: 'blur' }),
        createSvgNode('feMerge', null, [
          createSvgNode('feMergeNode', { in: 'blur' }),
          createSvgNode('feMergeNode', { in: 'SourceGraphic' })
        ])
      ]),
      createSvgNode('filter', { id: 'ast-glow-cyan', x: '-30%', y: '-30%', width: '160%', height: '160%' }, [
        createSvgNode('feGaussianBlur', { stdDeviation: '3.5', result: 'blur' }),
        createSvgNode('feMerge', null, [
          createSvgNode('feMergeNode', { in: 'blur' }),
          createSvgNode('feMergeNode', { in: 'SourceGraphic' })
        ])
      ]),
      createSvgNode('filter', { id: 'ast-glow-gold', x: '-30%', y: '-30%', width: '160%', height: '160%' }, [
        createSvgNode('feGaussianBlur', { stdDeviation: '3.5', result: 'blur' }),
        createSvgNode('feComponentTransfer', { in: 'blur', result: 'cb' }, [
          createSvgNode('feFuncR', { type: 'linear', slope: '1.2' }),
          createSvgNode('feFuncG', { type: 'linear', slope: '0.9' }),
          createSvgNode('feFuncB', { type: 'linear', slope: '0.2' })
        ]),
        createSvgNode('feMerge', null, [
          createSvgNode('feMergeNode', { in: 'cb' }),
          createSvgNode('feMergeNode', { in: 'SourceGraphic' })
        ])
      ]),
      createSvgNode('filter', { id: 'ast-drop-shadow', x: '-20%', y: '-20%', width: '140%', height: '140%' }, [
        createSvgNode('feDropShadow', { dx: '0', dy: '6', stdDeviation: '8', 'flood-color': '#000000', 'flood-opacity': '0.55' })
      ]),
      createSvgNode('filter', { id: 'ast-blur-soft', x: '-20%', y: '-20%', width: '140%', height: '140%' }, [
        createSvgNode('feGaussianBlur', { stdDeviation: '5' })
      ])
    ]);

    rootSvg.insertBefore(defsEl, rootSvg.firstChild || null);
    return defsEl;
  }

  /**
   * Shared SVG Stage Mount Boundary.
   * Normalizes entities, strips XSS vectors, syncs root viewBox, and mounts cleanly.
   */
  function mountSvgStage(options) {
    const opts = options || {};
    const container = opts.container || null;
    const stageSvg = opts.stageSvg || null;
    const surfaceId = opts.surfaceId || null;
    const rawSvg = opts.svgText || opts.svgMarkup || '';

    if (stageSvg && typeof stageSvg.setAttribute === 'function') {
      stageSvg.setAttribute('viewBox', DEFAULT_VIEWBOX);
    }
    if (container && opts.skipDefs !== true) {
      ensureMasterDefs(container);
    }

    let safeSvg = sanitizeSvg(rawSvg);
    for (let i = 0; i < ENTITY_MAP.length; i++) {
      safeSvg = safeSvg.replace(ENTITY_MAP[i][0], ENTITY_MAP[i][1]);
    }

    let mounted = false;
    let viewBox = DEFAULT_VIEWBOX;

    if (container && safeSvg && typeof document !== 'undefined') {
      const buildSafeSvgTree = (svgMarkup) => {
        const SVG_NS = 'http://www.w3.org/2000/svg';
        const XLINK_NS = 'http://www.w3.org/1999/xlink';
        const VOID_TAGS = new Set([
          'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
          'stop', 'use', 'image', 'feblend', 'fecolormatrix', 'fecomposite',
          'feconvolvematrix', 'fedisplacementmap', 'fedistantlight', 'fedropshadow',
          'feflood', 'fefunca', 'fefuncb', 'fefuncg', 'fefuncr', 'fegaussianblur',
          'feimage', 'femergenode', 'femorphology', 'feoffset', 'fepointlight',
          'fespotlight', 'fetile', 'feturbulence', 'animate', 'animatemotion',
          'animatetransform', 'mpath', 'set'
        ]);
        const ALLOWED_TAGS = new Set([
          'svg', 'g', 'defs', 'symbol', 'use', 'path', 'rect', 'circle',
          'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan', 'textpath',
          'image', 'lineargradient', 'radialgradient', 'stop', 'clippath',
          'mask', 'pattern', 'marker', 'filter', 'feblend', 'fecolormatrix',
          'fecomponenttransfer', 'fecomposite', 'feconvolvematrix',
          'fediffuselighting', 'fedisplacementmap', 'fedistantlight', 'fedropshadow',
          'feflood', 'fefunca', 'fefuncb', 'fefuncg', 'fefuncr', 'fegaussianblur',
          'feimage', 'femerge', 'femergenode', 'femorphology', 'feoffset',
          'fepointlight', 'fespecularlighting', 'fespotlight', 'fetile',
          'feturbulence', 'animate', 'animatemotion', 'animatetransform',
          'mpath', 'set', 'title', 'desc', 'switch'
        ]);
        const TAG_CANONICAL = {
          lineargradient: 'linearGradient',
          radialgradient: 'radialGradient',
          clippath: 'clipPath',
          textpath: 'textPath',
          feblend: 'feBlend',
          fecolormatrix: 'feColorMatrix',
          fecomponenttransfer: 'feComponentTransfer',
          fecomposite: 'feComposite',
          feconvolvematrix: 'feConvolveMatrix',
          fediffuselighting: 'feDiffuseLighting',
          fedisplacementmap: 'feDisplacementMap',
          fedistantlight: 'feDistantLight',
          fedropshadow: 'feDropShadow',
          feflood: 'feFlood',
          fefunca: 'feFuncA',
          fefuncb: 'feFuncB',
          fefuncg: 'feFuncG',
          fefuncr: 'feFuncR',
          fegaussianblur: 'feGaussianBlur',
          feimage: 'feImage',
          femerge: 'feMerge',
          femergenode: 'feMergeNode',
          femorphology: 'feMorphology',
          feoffset: 'feOffset',
          fepointlight: 'fePointLight',
          fespecularlighting: 'feSpecularLighting',
          fespotlight: 'feSpotLight',
          fetile: 'feTile',
          feturbulence: 'feTurbulence',
          animatemotion: 'animateMotion',
          animatetransform: 'animateTransform'
        };
        const ATTR_CANONICAL = {
          viewbox: 'viewBox',
          preserveaspectratio: 'preserveAspectRatio',
          pathlength: 'pathLength',
          stddeviation: 'stdDeviation',
          gradientunits: 'gradientUnits',
          gradienttransform: 'gradientTransform',
          spreadmethod: 'spreadMethod',
          patternunits: 'patternUnits',
          patterncontentunits: 'patternContentUnits',
          patterntransform: 'patternTransform',
          maskunits: 'maskUnits',
          maskcontentunits: 'maskContentUnits',
          clippathunits: 'clipPathUnits',
          filterunits: 'filterUnits',
          primitiveunits: 'primitiveUnits',
          basefrequency: 'baseFrequency',
          numoctaves: 'numOctaves',
          stitchtiles: 'stitchTiles',
          xchannelselector: 'xChannelSelector',
          ychannelselector: 'yChannelSelector',
          edgemode: 'edgeMode',
          kernelmatrix: 'kernelMatrix',
          targetx: 'targetX',
          targety: 'targetY',
          preservealpha: 'preserveAlpha',
          surfacescale: 'surfaceScale',
          diffuseconstant: 'diffuseConstant',
          specularconstant: 'specularConstant',
          specularexponent: 'specularExponent',
          pointsatx: 'pointsAtX',
          pointsaty: 'pointsAtY',
          pointsatz: 'pointsAtZ',
          limitingconeangle: 'limitingConeAngle',
          tablevalues: 'tableValues',
          markerwidth: 'markerWidth',
          markerheight: 'markerHeight',
          refx: 'refX',
          refy: 'refY',
          markerunits: 'markerUnits',
          attributename: 'attributeName',
          attributetype: 'attributeType',
          repeatcount: 'repeatCount',
          repeatdur: 'repeatDur',
          calcmode: 'calcMode',
          keysplines: 'keySplines',
          keytimes: 'keyTimes',
          textlength: 'textLength',
          lengthadjust: 'lengthAdjust',
          startoffset: 'startOffset',
          fillopacity: 'fill-opacity',
          fontfamily: 'font-family',
          fontsize: 'font-size',
          fontweight: 'font-weight',
          letterspacing: 'letter-spacing',
          pointerevents: 'pointer-events',
          stopcolor: 'stop-color',
          stopopacity: 'stop-opacity',
          strokelinecap: 'stroke-linecap',
          strokewidth: 'stroke-width',
          textanchor: 'text-anchor'
        };
        const ALLOWED_ATTRS = new Set([
          'id', 'class', 'style', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy',
          'fx', 'fy', 'fr', 'r', 'rx', 'ry', 'd', 'points', 'pathlength',
          'dx', 'dy', 'rotate', 'width', 'height', 'viewbox', 'preserveaspectratio',
          'transform', 'fill', 'fill-opacity', 'fillopacity', 'fill-rule',
          'stroke', 'stroke-width', 'strokewidth', 'stroke-opacity',
          'stroke-linecap', 'strokelinecap', 'stroke-linejoin',
          'stroke-dasharray', 'stroke-dashoffset', 'stroke-miterlimit',
          'opacity', 'font-family', 'fontfamily', 'font-size', 'fontsize',
          'font-weight', 'fontweight', 'font-style', 'text-anchor', 'textanchor',
          'dominant-baseline', 'letter-spacing', 'letterspacing', 'word-spacing',
          'text-transform', 'textlength', 'lengthadjust', 'startoffset', 'offset',
          'stop-color', 'stopcolor', 'stop-opacity', 'stopopacity',
          'gradientunits', 'gradienttransform', 'spreadmethod', 'patternunits',
          'patterncontentunits', 'patterntransform', 'maskunits',
          'maskcontentunits', 'clip-path', 'clip-rule', 'clippathunits',
          'mask', 'filter', 'filterunits', 'primitiveunits',
          'color-interpolation-filters', 'stddeviation', 'in', 'in2', 'result',
          'k1', 'k2', 'k3', 'k4', 'type', 'values', 'mode', 'operator',
          'flood-color', 'flood-opacity', 'basefrequency', 'numoctaves', 'seed',
          'stitchtiles', 'scale', 'xchannelselector', 'ychannelselector',
          'edgemode', 'kernelmatrix', 'order', 'divisor', 'bias', 'targetx',
          'targety', 'preservealpha', 'surfacescale', 'diffuseconstant',
          'specularconstant', 'specularexponent', 'azimuth', 'elevation',
          'pointsatx', 'pointsaty', 'pointsatz', 'limitingconeangle', 'radius',
          'tablevalues', 'slope', 'intercept', 'amplitude', 'exponent',
          'markerwidth', 'markerheight', 'refx', 'refy', 'orient',
          'markerunits', 'marker-start', 'marker-mid', 'marker-end',
          'attributename', 'attributetype', 'begin', 'dur', 'end', 'min',
          'max', 'restart', 'repeatcount', 'repeatdur', 'from', 'to', 'by',
          'calcmode', 'keysplines', 'keytimes', 'additive', 'accumulate',
          'xmlns', 'xmlns:xlink', 'href', 'xlink:href', 'visibility', 'display',
          'overflow', 'pointer-events', 'pointerevents', 'cursor', 'color',
          'vector-effect', 'shape-rendering', 'text-rendering', 'image-rendering'
        ]);
        const decodeEntities = (str) => String(str)
          .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
          .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/&amp;/g, '&');

        let rootSvg = null;
        const stack = [];
        const skipStack = [];
        const tokenRx = /<!--[\s\S]*?-->|<\/([a-zA-Z0-9:-]+)\s*>|<([a-zA-Z0-9:-]+)((?:\s+[a-zA-Z0-9:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>|([^<]+)/g;
        let match;

        while ((match = tokenRx.exec(svgMarkup)) !== null) {
          const [, closeTag, openTag, attrStr, selfClose, textNode] = match;
          if (closeTag) {
            const closeLower = closeTag.toLowerCase();
            if (skipStack.length > 0) {
              if (skipStack[skipStack.length - 1] === closeLower) {
                skipStack.pop();
              }
              continue;
            }
            if (stack.length > 0 && stack[stack.length - 1].tagName.toLowerCase() === closeLower) {
              stack.pop();
            }
          } else if (openTag) {
            const tagLower = openTag.toLowerCase();
            if (skipStack.length > 0 || !ALLOWED_TAGS.has(tagLower)) {
              if (!selfClose && !VOID_TAGS.has(tagLower)) {
                skipStack.push(tagLower);
              }
              continue;
            }
            const canonicalTag = TAG_CANONICAL[tagLower] || openTag;
            const el = document.createElementNS(SVG_NS, canonicalTag);
            if (attrStr) {
              const attrRx = /([a-zA-Z0-9:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
              let aMatch;
              while ((aMatch = attrRx.exec(attrStr)) !== null) {
                const rawName = aMatch[1];
                const nameLower = rawName.toLowerCase();
                if (nameLower.startsWith('on')) continue;
                if (!ALLOWED_ATTRS.has(nameLower) && !nameLower.startsWith('data-') && !nameLower.startsWith('aria-')) {
                  continue;
                }
                const canonicalAttr = ATTR_CANONICAL[nameLower] || rawName;
                const val = decodeEntities(aMatch[2] ?? aMatch[3] ?? aMatch[4] ?? '');
                if (nameLower === 'xlink:href') {
                  // Reject legacy xlink URL attributes from untrusted SVG input.
                  continue;
                } else if (nameLower === 'href') {
                  const trimmedVal = val.trim();
                  const isSafeLocalRef = /^#[A-Za-z_][\w:.-]*$/.test(trimmedVal);
                  const isSafeDataImage = /^data:image\/(?:png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=]+$/i.test(trimmedVal);
                  if (!isSafeLocalRef && !isSafeDataImage) {
                    continue;
                  }
                  el.setAttribute('href', trimmedVal);
                } else {
                  el.setAttribute(canonicalAttr, val);
                }
              }
            }
            if (stack.length > 0) {
              stack[stack.length - 1].appendChild(el);
            } else if (tagLower === 'svg') {
              rootSvg = el;
            }
            if (!selfClose && !VOID_TAGS.has(tagLower) && (stack.length > 0 || tagLower === 'svg')) {
              stack.push(el);
            }
          } else if (textNode && skipStack.length === 0 && stack.length > 0) {
            stack[stack.length - 1].appendChild(document.createTextNode(decodeEntities(textNode)));
          }
        }
        return rootSvg;
      };
      try {
        const rootSvg = buildSafeSvgTree(safeSvg);
        if (rootSvg) {
          const vb = rootSvg.getAttribute('viewBox') || rootSvg.getAttribute('viewbox');
          if (vb) {
            viewBox = vb;
            if (stageSvg && typeof stageSvg.setAttribute === 'function') {
              stageSvg.setAttribute('viewBox', vb);
            } else if (container.tagName && container.tagName.toLowerCase() === 'svg') {
              container.setAttribute('viewBox', vb);
            }
          }
          const sanitized = sanitizeSvgElement(rootSvg);
          if (sanitized) {
            if (typeof container.replaceChildren === 'function') {
              container.replaceChildren(...sanitized.childNodes);
            } else {
              while (container.firstChild) {
                container.removeChild(container.firstChild);
              }
              while (sanitized.firstChild) {
                container.appendChild(sanitized.firstChild);
              }
            }
            mounted = true;
          }
        }
      } catch (err) {
        if (typeof console !== 'undefined') {
          console.warn('[ASTSharedRenderBoundary] SVG mount fallback:', err);
        }
      }
    }

    if (surfaceId || surfaces.size > 0) {
      const target = getSurface(surfaceId);
      if (target) {
        target.svgMounted = mounted;
        target.viewBox = viewBox;
        target.updatedAt = Date.now();
        applySurfaceVisibility(target);
      }
    }

    return { mounted, viewBox };
  }
  /**
   * Zero-GC DOM Attribute / Affine Transform Commit Boundary.
   */
  function commitBindingValue(node, attr, val) {
    if (!node) return;
    if (attr === 'textContent' || attr === 'text') {
      node.textContent = String(val);
      return;
    }
    const safeVal = typeof val === 'number' && !Number.isFinite(val) ? 0 : val;
    if (typeof node.setAttribute === 'function') {
      node.setAttribute(attr, String(safeVal));
    }
  }

  function commitAffineMatrix(node, matrixBuf) {
    if (!node || !matrixBuf || typeof node.setAttribute !== 'function') return;
    node.setAttribute(
      'transform',
      'matrix(' +
        matrixBuf[0] + ',' +
        matrixBuf[1] + ',' +
        matrixBuf[2] + ',' +
        matrixBuf[3] + ',' +
        matrixBuf[4] + ',' +
        matrixBuf[5] + ')'
    );
  }

  /**
   * Dumb VGA / Vector Display-List Canvas Blitter (reads 32-byte records at 0x068000).
   * Zero domain logic: executes draw opcodes emitted by the 448 KiB WASM kernel.
   */
  function blitDisplayList(ctx, dv, u8, dlPtr, maxCmds, decoder, surfaceId) {
    if (!ctx || !dv || !u8 || !dlPtr) return 0;
    const limit = typeof maxCmds === 'number' && maxCmds > 0 ? maxCmds : 768;
    let count = 0;

    for (let i = 0; i < limit; i++) {
      const p = dlPtr + i * 32;
      const op = dv.getUint32(p + 0, true);
      if (op === DisplayOp.END_FRAME) break;
      count++;

      const slotAndLen = dv.getUint32(p + 4, true);
      const x = dv.getFloat32(p + 8, true);
      const y = dv.getFloat32(p + 12, true);
      const w = dv.getFloat32(p + 16, true);
      const h = dv.getFloat32(p + 20, true);
      const rgba = dv.getUint32(p + 24, true);
      const strPtr = dv.getUint32(p + 28, true);

      const r = (rgba >>> 24) & 0xff;
      const g = (rgba >>> 16) & 0xff;
      const b = (rgba >>> 8) & 0xff;
      const a = (rgba & 0xff) / 255;
      const color = 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(3) + ')';

      if (op === DisplayOp.CLEAR_RECT || op === DisplayOp.FILL_RECT) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
      } else if (op === DisplayOp.STROKE_RECT) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, h);
      } else if (op === DisplayOp.CIRCLE) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, w), 0, Math.PI * 2);
        ctx.fill();
      } else if (op === DisplayOp.TEXT && strPtr > 0) {
        const strLen = (slotAndLen >>> 16) & 0xffff;
        const txt = decodeUtf8Slice(u8, strPtr, strLen, decoder);
        ctx.fillStyle = color;
        ctx.font = '700 ' + Math.max(10, Math.round(w || 13)) + 'px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillText(txt, x, y);
      } else if (op === DisplayOp.LINE) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(w, h);
        ctx.stroke();
      } else if (op === DisplayOp.PROGRESS_BAR) {
        const clampedW = Math.max(0, w);
        const clampedH = Math.max(2, h);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, clampedW, clampedH);
      }
    }

    globalFrameCount++;
    const surf = surfaceId ? surfaces.get(String(surfaceId)) : getSurface();
    if (surf) {
      surf.frameCount++;
      surf.lastBlitOps = count;
    }
    return count;
  }

  /**
   * Shared 60 FPS Canvas BIOS Loop & Stage Pointer Coordinate Normalizer.
   */
  function bindCanvasLoop(opts) {
    const canvas = opts && opts.canvas;
    if (!canvas) return () => {};
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    const stageW = opts.stageWidth || STAGE_WIDTH;
    const stageH = opts.stageHeight || STAGE_HEIGHT;
    const surfaceId = opts.surfaceId || 'everyman-bios';

    registerSurface({
      id: surfaceId,
      canvas,
      renderMode: opts.renderMode || 'canvas',
      bios: opts.bios || null,
      sceneId: opts.sceneId || '',
    });

    const onPointer = (phase) => (ev) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const sx = ((ev.clientX - rect.left) / rect.width) * stageW;
      const sy = ((ev.clientY - rect.top) / rect.height) * stageH;
      if (typeof opts.onPointer === 'function') {
        opts.onPointer(phase, sx, sy, ev.buttons || (phase === 1 ? 1 : 0));
      }
    };

    const handleDown = onPointer(1);
    const handleMove = onPointer(0);
    const handleUp = onPointer(2);
    canvas.addEventListener('pointerdown', handleDown);
    canvas.addEventListener('pointermove', handleMove);
    canvas.addEventListener('pointerup', handleUp);

    let rafId = null;
    let lastTickMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    let disposed = false;

    const step = (now) => {
      if (disposed) return;
      const dt = Math.min(50, Math.max(1, now - lastTickMs));
      lastTickMs = now;
      if (typeof opts.onStep === 'function') {
        opts.onStep(dt, ctx, surfaceId);
      }
      if (!disposed) {
        rafId = requestAnimationFrame(step);
      }
    };
    rafId = requestAnimationFrame(step);

    return () => {
      disposed = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      canvas.removeEventListener('pointerdown', handleDown);
      canvas.removeEventListener('pointermove', handleMove);
      canvas.removeEventListener('pointerup', handleUp);
    };
  }

  function highlightTarget(selector, durationMs, surfaceId) {
    if (!selector || typeof selector !== 'string') return { ok: false, reason: 'invalid_selector' };
    const cleanSel = selector.trim();
    if (!/^#[a-zA-Z0-9_\-:]+$/.test(cleanSel)) {
      return { ok: false, reason: 'unsafe_selector', selector: cleanSel };
    }
    const surf = getSurface(surfaceId);
    const roots = [];
    if (surf && surf.svgContainer) roots.push(surf.svgContainer);
    if (surf && surf.stageSvg && surf.stageSvg !== surf.svgContainer) roots.push(surf.stageSvg);
    if (typeof document !== 'undefined') roots.push(document);

    let targetEl = null;
    for (let i = 0; i < roots.length; i++) {
      if (roots[i] && typeof roots[i].querySelector === 'function') {
        targetEl = roots[i].querySelector(cleanSel);
        if (targetEl) break;
      }
    }

    lastHighlightState = {
      selector: cleanSel,
      surfaceId: surf ? surf.id : null,
      matchedDom: Boolean(targetEl),
      at: Date.now(),
    };

    if (targetEl && targetEl.classList) {
      targetEl.classList.add('ai-spotlight-pulse');
      const ttl = typeof durationMs === 'number' && durationMs > 0 ? durationMs : 2200;
      setTimeout(() => {
        try {
          targetEl.classList.remove('ai-spotlight-pulse');
        } catch (_) {}
      }, ttl);
    }

    emitBoundaryEvent('target_highlighted', lastHighlightState);
    return { ok: true, selector: cleanSel, matchedDom: Boolean(targetEl) };
  }

  function getSnapshot(surfaceId) {
    const active = getSurface(surfaceId);
    return {
      boundaryVersion: BOUNDARY_VERSION,
      activeSurfaceId: active ? active.id : activeSurfaceId,
      renderMode: active ? active.renderMode : 'svg',
      stageDimensions: { width: STAGE_WIDTH, height: STAGE_HEIGHT, viewBox: active ? active.viewBox : DEFAULT_VIEWBOX },
      globalFrameCount,
      lastHighlight: lastHighlightState,
      surfaces: listSurfaces(),
    };
  }

  function subscribe(cb) {
    if (typeof cb !== 'function') return () => {};
    listeners.add(cb);
    return () => listeners.delete(cb);
  }

  const api = {
    version: BOUNDARY_VERSION,
    DisplayOp,
    registerSurface,
    unregisterSurface,
    getSurface,
    listSurfaces,
    setRenderMode,
    setSurfaceScene,
    sanitizeSvg,
    sanitizeSvgElement,
    ensureMasterDefs,
    mountSvgStage,
    commitBindingValue,
    commitAffineMatrix,
    blitDisplayList,
    bindCanvasLoop,
    highlightTarget,
    getSnapshot,
    subscribe,
  };

  global.ASTSharedRenderBoundary = api;
  global.__AST_SHARED_RENDERER__ = api;
  if (typeof window !== 'undefined') {
    window.ASTSharedRenderBoundary = api;
    window.__AST_SHARED_RENDERER__ = api;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
