/**
 * static/player/ast-svg-integrity.js
 *
 * St Joseph's AST Vector Media Player — SVG Sanitizer, Safe Tree Builder, Master Defs & SHA-256 Integrity Module
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted peer module for ASTSceneLoader (loaded before ast-loader.js).
 * Zero external dependencies; all methods execute with `this` bound to the ASTVectorPlayerEngine instance.
 * - Safe DOM SVG sanitization & allowlisted tree builder (sanitizeSvg, sanitizeSvgElement, _buildSafeSvgTree)
 * - Master SVG defs injection (ensureMasterDefs)
 * - Cryptographic SHA-256 cartridge checksum verification (_computeSha256Hex, _resolveChecksumBaseUrl,
 *   _loadChecksumRegistry, verifyLoadedCartridge)
 */

(function (global) {
  'use strict';

  class ASTSvgIntegrityMethods {
    sanitizeSvg(rawSvg) {
      if (global.ASTSharedRenderBoundary && typeof global.ASTSharedRenderBoundary.sanitizeSvg === 'function') {
        return global.ASTSharedRenderBoundary.sanitizeSvg(rawSvg);
      }
      if (!rawSvg || typeof rawSvg !== 'string') return '';
      let clean = rawSvg.trim();
      if (/<!DOCTYPE|<!ENTITY/i.test(clean)) {
        clean = clean
          .replace(/<!DOCTYPE(?:\s+[^[>]*(?:\[[\s\S]*?\])?\s*)?>/gi, '<!-- DOCTYPE disabled -->')
          .replace(/<!ENTITY[\s\S]*?>/gi, '<!-- ENTITY disabled -->');
      }
      return clean;
    }

    sanitizeSvgElement(rootSvg) {
      if (global.ASTSharedRenderBoundary && typeof global.ASTSharedRenderBoundary.sanitizeSvgElement === 'function') {
        return global.ASTSharedRenderBoundary.sanitizeSvgElement(rootSvg);
      }
      if (!rootSvg) return null;
      const dangerousTags = ['script', 'foreignobject', 'iframe', 'embed', 'object', 'link', 'meta', 'style'];
      if (rootSvg.tagName && dangerousTags.includes(rootSvg.tagName.toLowerCase())) return null;

      for (const tag of dangerousTags) {
        rootSvg.querySelectorAll(tag).forEach(el => el.remove());
      }

      const allElements = [rootSvg, ...rootSvg.querySelectorAll('*')];
      for (const el of allElements) {
        if (!el.attributes) continue;
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
        for (const attrName of toRemove) {
          el.removeAttribute(attrName);
        }
      }

      return rootSvg;
    }

    _buildSafeSvgTree(svgMarkup) {
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
              if (nameLower === 'href' || nameLower === 'xlink:href') {
                const trimmedVal = val.trim();
                const isSafeLocalRef = /^#[A-Za-z_][\w:.-]*$/.test(trimmedVal);
                if (!isSafeLocalRef) {
                  continue;
                }
                if (nameLower === 'xlink:href') {
                  el.setAttributeNS(XLINK_NS, 'xlink:href', trimmedVal);
                } else {
                  el.setAttribute('href', trimmedVal);
                }
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
    }

    ensureMasterDefs(container) {
      if (global.ASTSharedRenderBoundary && typeof global.ASTSharedRenderBoundary.ensureMasterDefs === 'function') {
        global.ASTSharedRenderBoundary.ensureMasterDefs(container || this._container || this.container);
        return;
      }
      if (typeof document === 'undefined') return;
      const target = container || this._container || this.container;
      if (!target) return;
      const rootSvg = (target.tagName && target.tagName.toLowerCase() === 'svg')
        ? target
        : (target.ownerSVGElement || (typeof target.closest === 'function' ? target.closest('svg') : null) || document.getElementById('stage-svg') || (typeof target.querySelector === 'function' ? target.querySelector('svg') : null));
      if (!rootSvg) return;

      if (rootSvg.querySelector('#ast-master-defs') || document.getElementById('ast-master-defs')) return;

      const createSvg = (tag, attrs, children) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        if (attrs) {
          for (const [k, v] of Object.entries(attrs)) {
            el.setAttribute(k, String(v));
          }
        }
        if (Array.isArray(children)) {
          for (const ch of children) {
            if (ch) el.appendChild(ch);
          }
        }
        return el;
      };

      const makeGlowFilter = (id) => createSvg('filter', { id, x: '-30%', y: '-30%', width: '160%', height: '160%' }, [
        createSvg('feGaussianBlur', { stdDeviation: '3.5', result: 'blur' }),
        createSvg('feMerge', null, [
          createSvg('feMergeNode', { in: 'blur' }),
          createSvg('feMergeNode', { in: 'SourceGraphic' })
        ])
      ]);

      const makeArrowMarker = (id, fill, refX = 7, points = '0 0, 8 3, 0 6') =>
        createSvg('marker', { id, markerWidth: '8', markerHeight: '6', refX: String(refX), refY: '3', orient: 'auto' }, [
          createSvg('polygon', { points, fill })
        ]);

      const makeLinGrad = (id, c0, c1, y2 = '1', x2 = '1') =>
        createSvg('linearGradient', { id, x1: '0', y1: '0', x2, y2 }, [
          createSvg('stop', { offset: '0%', 'stop-color': c0 }),
          createSvg('stop', { offset: '100%', 'stop-color': c1 })
        ]);

      const defsEl = createSvg('defs', { id: 'ast-master-defs' }, [
        createSvg('filter', { id: 'pyth-shadow', x: '-20%', y: '-20%', width: '140%', height: '140%' }, [
          createSvg('feDropShadow', { dx: '0', dy: '4', stdDeviation: '6', 'flood-color': '#000000', 'flood-opacity': '0.65' })
        ]),
        createSvg('filter', { id: 'pyth-glow', x: '-20%', y: '-20%', width: '140%', height: '140%' }, [
          createSvg('feGaussianBlur', { stdDeviation: '3.5', result: 'blur' }),
          createSvg('feMerge', null, [
            createSvg('feMergeNode', { in: 'blur' }),
            createSvg('feMergeNode', { in: 'SourceGraphic' })
          ])
        ]),
        makeGlowFilter('ast-glow-cyan'),
        createSvg('filter', { id: 'ast-glow-gold', x: '-30%', y: '-30%', width: '160%', height: '160%' }, [
          createSvg('feGaussianBlur', { stdDeviation: '3.5', result: 'blur' }),
          createSvg('feComponentTransfer', { in: 'blur', result: 'cb' }, [
            createSvg('feFuncR', { type: 'linear', slope: '1.2' }),
            createSvg('feFuncG', { type: 'linear', slope: '0.9' }),
            createSvg('feFuncB', { type: 'linear', slope: '0.2' })
          ]),
          createSvg('feMerge', null, [
            createSvg('feMergeNode', { in: 'cb' }),
            createSvg('feMergeNode', { in: 'SourceGraphic' })
          ])
        ]),
        makeGlowFilter('ast-glow-red'),
        makeGlowFilter('ast-glow-emerald'),
        makeGlowFilter('ast-glow-purple'),
        createSvg('filter', { id: 'ast-drop-shadow', x: '-20%', y: '-20%', width: '140%', height: '140%' }, [
          createSvg('feDropShadow', { dx: '0', dy: '6', stdDeviation: '8', 'flood-color': '#000000', 'flood-opacity': '0.55' })
        ]),
        createSvg('filter', { id: 'ast-blur-soft', x: '-20%', y: '-20%', width: '140%', height: '140%' }, [
          createSvg('feGaussianBlur', { stdDeviation: '5' })
        ]),
        makeArrowMarker('ast-arrowhead', '#38bdf8', 7, '0 0, 8 3, 0 6'),
        makeArrowMarker('ast-arrow-start', '#38bdf8', 1, '8 0, 0 3, 8 6'),
        makeArrowMarker('ast-arrow-cyan', '#38bdf8', 7, '0 0, 8 3, 0 6'),
        makeArrowMarker('ast-arrow-gold', '#f59e0b', 7, '0 0, 8 3, 0 6'),
        makeArrowMarker('ast-arrow-red', '#ef4444', 7, '0 0, 8 3, 0 6'),
        makeArrowMarker('ast-arrow-emerald', '#10b981', 7, '0 0, 8 3, 0 6'),
        createSvg('marker', { id: 'ast-vector-dot', markerWidth: '6', markerHeight: '6', refX: '3', refY: '3' }, [
          createSvg('circle', { cx: '3', cy: '3', r: '2.5', fill: '#38bdf8' })
        ]),
        createSvg('pattern', { id: 'ast-grid-fine', width: '20', height: '20', patternUnits: 'userSpaceOnUse' }, [
          createSvg('path', { d: 'M 20 0 L 0 0 0 20', fill: 'none', stroke: '#1e293b', 'stroke-width': '0.75', 'stroke-opacity': '0.5' })
        ]),
        createSvg('pattern', { id: 'ast-grid-dense', width: '40', height: '40', patternUnits: 'userSpaceOnUse' }, [
          createSvg('rect', { width: '40', height: '40', fill: 'none' }),
          createSvg('path', { d: 'M 40 0 L 0 0 0 40', fill: 'none', stroke: '#334155', 'stroke-width': '1.2', 'stroke-opacity': '0.6' }),
          createSvg('path', { d: 'M 20 0 L 20 40 M 0 20 L 40 20', fill: 'none', stroke: '#1e293b', 'stroke-width': '0.5', 'stroke-opacity': '0.4' })
        ]),
        createSvg('pattern', { id: 'ast-grid-dots', width: '20', height: '20', patternUnits: 'userSpaceOnUse' }, [
          createSvg('circle', { cx: '2', cy: '2', r: '1', fill: '#475569', 'fill-opacity': '0.6' })
        ]),
        makeLinGrad('ast-grad-cyan', '#38bdf8', '#0284c7'),
        makeLinGrad('ast-grad-gold', '#fef08a', '#f59e0b'),
        makeLinGrad('ast-grad-emerald', '#34d399', '#059669'),
        makeLinGrad('ast-grad-purple', '#c084fc', '#7c3aed'),
        makeLinGrad('ast-grad-crimson', '#f87171', '#dc2626'),
        makeLinGrad('ast-blueprint-backdrop', '#070e1b', '#020617', '1', '0')
      ]);
      rootSvg.insertBefore(defsEl, rootSvg.firstChild);
    }

    async _computeSha256Hex(data) {
      if (data === null || data === undefined) return '';
      const subtle = (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle)
        || (typeof window !== 'undefined' && window.crypto && window.crypto.subtle);
      if (!subtle || typeof subtle.digest !== 'function') return '';
      let u8;
      if (typeof data === 'string') {
        u8 = new TextEncoder().encode(data);
      } else if (data instanceof Uint8Array) {
        u8 = data;
      } else if (data instanceof ArrayBuffer) {
        u8 = new Uint8Array(data);
      } else {
        return '';
      }
      const digest = await subtle.digest('SHA-256', u8);
      const bytes = new Uint8Array(digest);
      let hex = '';
      for (let i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
      }
      return hex;
    }

    _resolveChecksumBaseUrl() {
      let repoBase = '/';
      if (typeof window !== 'undefined') {
        if (window.__AST_BASE_URL__ || window.__AST_ASSET_BASE__) {
          repoBase = String(window.__AST_BASE_URL__ || window.__AST_ASSET_BASE__).replace(/\/+$/, '') + '/';
        } else if (typeof document !== 'undefined' && document.querySelector('base')?.getAttribute('href')) {
          repoBase = document.querySelector('base').getAttribute('href').replace(/\/+$/, '') + '/';
        } else if (window.location) {
          const pathname = window.location.pathname || '/';
          const host = window.location.hostname || '';
          const playerIdx = pathname.indexOf('/player/');
          if (playerIdx >= 0) {
            repoBase = pathname.slice(0, playerIdx + 1);
          } else if (host === 'github.io' || host.endsWith('.github.io')) {
            const seg = pathname.split('/').filter(Boolean)[0];
            repoBase = seg ? `/${seg}/` : '/';
          }
        }
      }
      return repoBase;
    }

    async _loadChecksumRegistry() {
      if (this._checksumRegistryCache) return this._checksumRegistryCache;
      if (typeof fetch === 'undefined') return null;
      const repoBase = this._resolveChecksumBaseUrl();
      const candidates = Array.from(new Set([
        `${repoBase}cartridge-checksums.json`,
        '../cartridge-checksums.json',
        './cartridge-checksums.json',
        '/cartridge-checksums.json'
      ]));
      for (const url of candidates) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const text = await res.text();
          if (!text || text.trim().startsWith('<')) continue;
          const json = JSON.parse(text);
          if (json && json.cartridges) {
            this._checksumRegistryCache = json;
            return json;
          }
        } catch (_) {}
      }
      return null;
    }

    async verifyLoadedCartridge(scene) {
      if (!scene || !scene.id) return null;
      const id = String(scene.id).trim().toLowerCase();
      const shortFmt = (h) => (h && h.length >= 12 ? `${h.slice(0, 6)}...${h.slice(-6)}` : (h || 'unsigned'));
      const registry = await this._loadChecksumRegistry();
      const record = registry && registry.cartridges ? registry.cartridges[id] : null;

      const [computedAstb, computedAst, computedSvg] = await Promise.all([
        scene._rawAstbBuffer ? this._computeSha256Hex(scene._rawAstbBuffer) : Promise.resolve(''),
        scene.astSource ? this._computeSha256Hex(scene.astSource) : Promise.resolve(''),
        scene.svgText ? this._computeSha256Hex(scene.svgText) : Promise.resolve('')
      ]);

      let result;
      if (!record) {
        const activeHash = computedAstb || computedAst || computedSvg;
        result = {
          cartridgeId: id,
          status: 'unverified-external',
          isNative: false,
          isVerified: false,
          tier: 'community',
          shortHash: activeHash ? shortFmt(activeHash) : 'external',
          computedAstbSha256: computedAstb || undefined,
          computedAstSha256: computedAst || undefined,
          computedSvgSha256: computedSvg || undefined,
          authority: 'Third-Party / Community Author',
          badgeText: 'Community Cartridge',
          badgeTooltip: `Unregistered external or custom cartridge (${scene.title || id}). SHA-256: ${activeHash ? shortFmt(activeHash) : 'n/a'}`
        };
      } else {
        const matchesTextDigest = async (rawText, computedHash, expectedHash) => {
          if (!expectedHash) return true;
          const target = expectedHash.toLowerCase();
          if (computedHash === target) return true;
          if (!rawText) return false;
          const normalizedLf = rawText.replace(/\r\n/g, '\n');
          const trimmed = normalizedLf.trim();
          const variants = [normalizedLf, trimmed, trimmed + '\n', trimmed + '\n\n'];
          for (const variant of variants) {
            const h = await this._computeSha256Hex(variant);
            if (h === target) return true;
          }
          return false;
        };

        const astbMatch = !computedAstb || !record.astbSha256 || computedAstb === record.astbSha256.toLowerCase();
        let astMatch = true;
        if (computedAst && record.astSha256 && (!computedAstb || scene._astEditedManually)) {
          astMatch = await matchesTextDigest(scene.astSource, computedAst, record.astSha256);
        }
        let svgMatch = true;
        if (computedSvg && record.svgSha256 && scene._svgEditedManually) {
          svgMatch = await matchesTextDigest(scene.svgText, computedSvg, record.svgSha256);
        }

        if (!astbMatch || !astMatch || !svgMatch) {
          const activeHash = computedAst || computedSvg || computedAstb || record.astSha256;
          result = {
            cartridgeId: id,
            status: 'tampered',
            isNative: true,
            isVerified: false,
            tier: 'modified',
            seal: record.seal,
            shortHash: shortFmt(activeHash),
            computedAstbSha256: computedAstb || undefined,
            computedAstSha256: computedAst || undefined,
            computedSvgSha256: computedSvg || undefined,
            expectedAstbSha256: record.astbSha256,
            expectedAstSha256: record.astSha256,
            expectedSvgSha256: record.svgSha256,
            authority: record.authority,
            badgeText: 'Cartridge Altered',
            badgeTooltip: `Altered / Remixed copy of ${record.title}. Live SHA-256 (${shortFmt(activeHash)}) differs from St Joseph's Curriculum seal (${shortFmt(record.seal)}).`
          };
        } else {
          result = {
            cartridgeId: id,
            status: 'verified-native',
            isNative: true,
            isVerified: true,
            tier: 'native',
            seal: record.seal,
            shortHash: shortFmt(record.seal || record.astSha256),
            computedAstbSha256: computedAstb || record.astbSha256,
            computedAstSha256: computedAst || record.astSha256,
            computedSvgSha256: computedSvg || record.svgSha256,
            expectedAstbSha256: record.astbSha256,
            expectedAstSha256: record.astSha256,
            expectedSvgSha256: record.svgSha256,
            authority: record.authority || "St Joseph's Catholic Primary School Curriculum Authority",
            badgeText: "St Joseph's Curriculum",
            badgeTooltip: `Verified St Joseph's Curriculum Cartridge (${record.title}). Signed by ${record.authority} • Seal: ${shortFmt(record.seal)}`
          };
        }
      }

      this.lastIntegrity = result;
      this.emit('integrityverified', result);
      this.notifyParent({
        type: 'CARTRIDGE_INTEGRITY',
        preset: id,
        integrity: result
      });
      return result;
    }
  }

  const ASTSvgIntegrity = {};
  const _proto = ASTSvgIntegrityMethods.prototype;
  const _names = Object.getOwnPropertyNames(_proto);
  for (let i = 0; i < _names.length; i++) {
    const _name = _names[i];
    if (_name !== 'constructor') {
      ASTSvgIntegrity[_name] = _proto[_name];
    }
  }

  global.ASTSvgIntegrity = ASTSvgIntegrity;
  if (typeof window !== 'undefined') {
    window.ASTSvgIntegrity = ASTSvgIntegrity;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
