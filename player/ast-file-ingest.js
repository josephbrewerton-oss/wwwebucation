/**
 * static/player/ast-file-ingest.js
 *
 * St Joseph's AST Vector Media Player — Local File, Companion Pair, Payload & URL Ingestion Module
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted peer module for ASTSceneLoader (loaded before ast-loader.js).
 * Zero external dependencies; all methods execute with `this` bound to the ASTVectorPlayerEngine instance.
 * - File/Blob ingestion (.astb, .ast, .ast.svg, .svg, .json, SlideScript, PhET HTML)
 * - Dual companion pair merging (.ast + .svg)
 * - Zero-server URL & Base64 payload decoding
 * - SVG error fallback rendering
 */

(function (global) {
  'use strict';

  class ASTFileIngestMethods {
    /**
     * Ingests local files (.json, .ast, .svg) via File/Blob APIs (e.g. file picker or drag-and-drop).
     * @param {File|Blob} file
     * @param {boolean} shouldPlay
     * @returns {Promise<Object>} Loaded scene
     */
    async loadFromFile(file, shouldPlay = false) {
      if (!file) {
        const err = new Error('[AST Engine] loadFromFile requires a valid File or Blob');
        this.emit('error', { type: 'FILE_LOAD_ERROR', message: err.message });
        throw err;
      }
      const filename = file.name || 'custom-asset';
      const ext = filename.split('.').pop().toLowerCase();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => {
          const err = new Error(`Failed to read file "${filename}": ${reader.error?.message}`);
          this.emit('error', { type: 'FILE_READ_ERROR', filename, message: err.message });
          if (this.container) {
            this.renderErrorPlaceholder(filename, err.message);
          }
          reject(err);
        };
        reader.onload = () => {
          try {
            const id = filename.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');

            if (ext === 'astb') {
              const bytes = new Uint8Array(reader.result);
              const parsed = this.decompileBytecode(bytes);
              if (!parsed) {
                throw new Error(`Invalid .astb binary cartridge: "${filename}"`);
              }
              const scene = Object.assign({}, parsed, {
                id: parsed.id || id,
                title: parsed.title || filename,
                stage: parsed.stage || 'COMPILED .ASTB CARTRIDGE',
                rawBindings: parsed.bindings || [],
                inputs: parsed.uiControls || parsed.inputs || [],
                svgText: parsed.svgMarkup || '',
              });
              const loaded = this.loadSceneData(scene, shouldPlay);
              this.emit('fileloaded', { filename, type: 'astb', id: scene.id });
              resolve(loaded);
              return;
            }

            const content = String(reader.result || '').trim();

            if (ext === 'json') {
              const json = JSON.parse(content);
              json.id = json.id || id;
              const loaded = this.loadSceneData(json, shouldPlay);
              this.emit('fileloaded', { filename, type: 'json', id: json.id });
              resolve(loaded);
            } else if (ext === 'svg' || (ext !== 'ast' && content.includes('<svg'))) {
              let embeddedAst = '';
              const metaMatch = content.match(/<metadata[^>]*type=["']application\/ast-sexpr["'][^>]*>([\s\S]*?)<\/metadata>/i)
                || content.match(/<script[^>]*type=["'](?:application\/ast-sexpr|text\/ast)["'][^>]*>([\s\S]*?)<\/script>/i)
                || content.match(/<ast-scene[^>]*>([\s\S]*?)<\/ast-scene>/i);

              if (metaMatch && metaMatch[1]) {
                embeddedAst = metaMatch[1].trim();
              } else if (content.includes('(:scene') || content.includes('(:cartridge')) {
                embeddedAst = content;
              }

              let parsed = null;
              if (embeddedAst) {
                try {
                  parsed = this.parseAst(embeddedAst);
                } catch (e) {
                  console.warn('[AST Engine] Notice: Could not parse embedded AST inside SVG:', e);
                }
              }

              const scene = {
                id: (parsed && parsed.id) || id,
                type: (parsed && parsed.type) || undefined,
                cartridgeType: (parsed && (parsed.cartridgeType || parsed.type)) || undefined,
                title: (parsed && parsed.title) || filename,
                stage: (parsed && parsed.stage) || (embeddedAst ? 'HYBRID AST.SVG CAPSULE' : 'CUSTOM SVG'),
                duration: (parsed && parsed.duration) || 10.0,
                camera: (parsed && parsed.camera) || null,
                has3D: Boolean(parsed && parsed.has3D),
                keyframes: (parsed && parsed.keyframes) || [],
                subtitles: (parsed && parsed.subtitles) || [],
                rawBindings: (parsed && parsed.bindings) || [],
                interactive: (parsed && parsed.interactive) || null,
                gestures: (parsed && parsed.gestures) || null,
                stateMachines: (parsed && parsed.stateMachines) || null,
                emitters: (parsed && parsed.emitters) || null,
                bindInputs: (parsed && parsed.bindInputs) || null,
                vars: (parsed && parsed.vars) || {},
                inputs: (parsed && (parsed.uiControls || parsed.inputs)) || [],
                uiControls: (parsed && parsed.uiControls) || null,
                computed: (parsed && parsed.computed) || [],
                physics: (parsed && parsed.physics) || null,
                actors: (parsed && parsed.actors) || [],
                staticElements: (parsed && parsed.staticElements) || [],
                astSource: embeddedAst || '',
                svgText: content
              };

              const loaded = this.loadSceneData(scene, shouldPlay);
              this.emit('fileloaded', { filename, type: embeddedAst ? 'ast.svg' : 'svg', id: scene.id });
              resolve(loaded);
            } else if (ext === 'ast') {
              const parsed = this.parseAst(content);
              const scene = {
                id: (parsed && parsed.id) || id,
                type: (parsed && parsed.type) || undefined,
                cartridgeType: (parsed && (parsed.cartridgeType || parsed.type)) || undefined,
                title: (parsed && parsed.title) || filename,
                stage: (parsed && parsed.stage) || 'CUSTOM AST',
                duration: (parsed && parsed.duration) || 10.0,
                camera: (parsed && parsed.camera) || null,
                has3D: Boolean(parsed && parsed.has3D),
                keyframes: (parsed && parsed.keyframes) || [],
                subtitles: (parsed && parsed.subtitles) || [],
                rawBindings: (parsed && parsed.bindings) || [],
                interactive: (parsed && parsed.interactive) || null,
                gestures: (parsed && parsed.gestures) || null,
                stateMachines: (parsed && parsed.stateMachines) || null,
                emitters: (parsed && parsed.emitters) || null,
                bindInputs: (parsed && parsed.bindInputs) || null,
                vars: (parsed && parsed.vars) || {},
                inputs: (parsed && (parsed.uiControls || parsed.inputs)) || [],
                uiControls: (parsed && parsed.uiControls) || null,
                computed: (parsed && parsed.computed) || [],
                physics: (parsed && parsed.physics) || null,
                actors: (parsed && parsed.actors) || [],
                staticElements: (parsed && parsed.staticElements) || [],
                astSource: content,
                svgText: content.includes('<svg') ? content : ''
              };
              const loaded = this.loadSceneData(scene, shouldPlay);
              this.emit('fileloaded', { filename, type: 'ast', id: scene.id });
              resolve(loaded);
            } else {
              if (content.startsWith('{')) {
                const json = JSON.parse(content);
                resolve(this.loadSceneData(json, shouldPlay));
              } else if (content.startsWith('(')) {
                const parsed = this.parseAst(content);
                resolve(this.loadSceneData({ id, ...parsed }, shouldPlay));
              } else if (content.includes('<svg')) {
                resolve(this.loadSceneData({ id, title: filename, svgText: content }, shouldPlay));
              } else if (content.startsWith('#') || content.includes('Stage:') || content.includes('Shape:')) {
                if (global.ASTSlideScriptCompiler) {
                  const compiled = global.ASTSlideScriptCompiler.compile(content);
                  resolve(this.loadSceneData(compiled.scene, shouldPlay));
                } else {
                  throw new Error(`SlideScript detected but compiler is not loaded.`);
                }
              } else if (ext === 'html' || ext === 'htm' || ext === 'phet' || (global.ASTPhetBridge && global.ASTPhetBridge.isPhetBundle(content))) {
                if (global.ASTPhetBridge) {
                  const result = global.ASTPhetBridge.transpilePhet(content, filename);
                  const parsed = this.parseAst(result.astSource);
                  const scene = {
                    id: result.id || id,
                    title: result.title || filename,
                    stage: result.stage || 'PhET TRANSLATED',
                    duration: result.duration || 12.0,
                    svgText: result.svgText,
                    keyframes: (parsed && parsed.keyframes) || [],
                    subtitles: (parsed && parsed.subtitles) || [],
                    rawBindings: (parsed && parsed.bindings) || []
                  };
                  const loaded = this.loadSceneData(scene, shouldPlay);
                  this.emit('fileloaded', {
                    filename,
                    type: 'phet-transpiled',
                    id: scene.id,
                    title: scene.title,
                    stage: scene.stage,
                    metadata: result.metadata,
                    svgMarkup: result.svgText,
                    astSource: result.astSource
                  });
                  resolve(loaded);
                } else {
                  throw new Error(`PhET bundle detected but ASTPhetBridge is not loaded.`);
                }
              } else {
                throw new Error(`Unsupported file extension: .${ext}. Expected .json, .ast, .svg, .html (PhET), or SlideScript.`);
              }
            }
          } catch (parseErr) {
            console.error('[AST Engine] Error parsing file:', filename, parseErr);
            this.emit('error', { type: 'FILE_PARSE_ERROR', filename, message: parseErr.message });
            if (this.container) {
              this.renderErrorPlaceholder(filename, `File parse failed: ${parseErr.message}`);
            }
            reject(parseErr);
          }
        };
        if (ext === 'astb') {
          reader.readAsArrayBuffer(file);
        } else {
          reader.readAsText(file);
        }
      });
    }

    /**
     * Reads a File or Blob as UTF-8 text using a Promise.
     * @param {File|Blob} file
     * @returns {Promise<string>}
     */
    readFileAsText(file) {
      if (!file) return Promise.resolve('');
      if (typeof file.text === 'function') {
        return file.text();
      }
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || '').trim());
        reader.onerror = () => reject(new Error(`Failed to read file "${file.name}": ${reader.error?.message}`));
        reader.readAsText(file);
      });
    }

    /**
     * Loads one or multiple simulation files.
     * @param {FileList|File[]} fileList
     * @param {boolean} shouldPlay
     */
    async loadFiles(fileList, shouldPlay = false) {
      if (!fileList) {
        throw new Error('[AST Engine] loadFiles requires a valid file list');
      }
      const files = Array.from(fileList);
      if (files.length === 0) return null;
      if (files.length === 1) {
        return this.loadFromFile(files[0], shouldPlay);
      }

      const svgFile = files.find(f => {
        const name = (f.name || '').toLowerCase();
        return name.endsWith('.svg') && !name.endsWith('.ast.svg');
      }) || files.find(f => (f.name || '').toLowerCase().endsWith('.svg'));

      const astFile = files.find(f => {
        const name = (f.name || '').toLowerCase();
        return name.endsWith('.ast') || name.endsWith('.json') || name.endsWith('.slidescript');
      });

      if (svgFile && astFile) {
        const [svgContent, astContent] = await Promise.all([
          this.readFileAsText(svgFile),
          this.readFileAsText(astFile)
        ]);

        const astExt = (astFile.name || '').split('.').pop().toLowerCase();
        let parsed = null;
        let interactive = null;
        let gestures = null;
        let stateMachines = null;
        let emitters = null;
        let bindInputs = null;
        let keyframes = [];
        let subtitles = [];
        let rawBindings = [];
        let duration = 10.0;
        let title = astFile.name.replace(/\.[^/.]+$/, '');
        let id = title.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

        if (astExt === 'json') {
          const json = JSON.parse(astContent);
          id = json.id || id;
          title = json.title || title;
          duration = json.duration || duration;
          keyframes = json.keyframes || [];
          subtitles = json.subtitles || [];
          rawBindings = json.bindings || json.rawBindings || [];
          interactive = json.interactive || null;
          gestures = json.gestures || null;
          stateMachines = json.stateMachines || null;
          emitters = json.emitters || null;
          bindInputs = json.bindInputs || null;
        } else if (astExt === 'slidescript') {
          if (global.ASTSlideScriptCompiler) {
            const compiled = global.ASTSlideScriptCompiler.compile(astContent);
            parsed = compiled.scene;
            id = parsed.id || id;
            title = parsed.title || title;
            duration = parsed.duration || duration;
            keyframes = parsed.keyframes || [];
            subtitles = parsed.subtitles || [];
            rawBindings = parsed.rawBindings || [];
          }
        } else {
          parsed = this.parseAst(astContent);
          if (parsed) {
            id = parsed.id || id;
            title = parsed.title || title;
            duration = parsed.duration || duration;
            keyframes = parsed.keyframes || [];
            subtitles = parsed.subtitles || [];
            rawBindings = parsed.bindings || [];
            interactive = parsed.interactive || null;
            gestures = parsed.gestures || null;
            stateMachines = parsed.stateMachines || null;
            emitters = parsed.emitters || null;
            bindInputs = parsed.bindInputs || null;
          }
        }

        const scene = {
          id,
          title,
          stage: `DUAL PAIR (${astFile.name} + ${svgFile.name})`,
          duration,
          bootSound: (parsed && parsed.bootSound) || null,
          camera: (parsed && parsed.camera) || null,
          cameraStops: (parsed && parsed.cameraStops) || null,
          quests: (parsed && parsed.quests) || null,
          has3D: Boolean(parsed && parsed.has3D),
          keyframes,
          subtitles,
          rawBindings,
          interactive,
          gestures,
          stateMachines,
          emitters,
          bindInputs,
          astSource: astContent,
          svgText: svgContent
        };

        const loaded = this.loadSceneData(scene, shouldPlay);
        this.emit('fileloaded', {
          filename: `${astFile.name} + ${svgFile.name}`,
          type: 'companion-pair',
          id: scene.id,
          dualNature: true
        });
        return loaded;
      }

      const primaryFile = files.find(f => /\.(astb|ast|svg|json|html|slidescript)$/i.test(f.name)) || files[0];
      return this.loadFromFile(primaryFile, shouldPlay);
    }

    /**
     * Loads a simulation directly from a zero-server URL payload string or base64 payload.
     */
    loadFromPayload(payload, shouldPlay = false) {
      if (!payload || typeof payload !== 'string') {
        const err = new Error('[AST Engine] loadFromPayload requires a valid string');
        this.emit('error', { type: 'INVALID_PAYLOAD', message: err.message });
        throw err;
      }

      let content = payload.trim();
      if (content.startsWith('base64:')) {
        try {
          content = decodeURIComponent(escape(atob(content.slice(7))));
        } catch (e) {
          try { content = atob(content.slice(7)); } catch {}
        }
      } else if (!content.startsWith('(') && !content.startsWith('{') && !content.startsWith('<') && !content.startsWith('#') && /^[A-Za-z0-9+/=_-]+$/.test(content)) {
        try {
          const rawB64 = content.replace(/-/g, '+').replace(/_/g, '/');
          const decoded = decodeURIComponent(escape(atob(rawB64)));
          if (decoded.startsWith('(') || decoded.startsWith('{') || decoded.startsWith('<') || decoded.startsWith('#')) {
            content = decoded;
          }
        } catch {}
      }

      const id = `payload-${Date.now()}`;

      if (content.startsWith('(')) {
        const parsed = this.parseAst(content);
        const scene = {
          id: (parsed && parsed.id) || id,
          type: (parsed && parsed.type) || undefined,
          cartridgeType: (parsed && (parsed.cartridgeType || parsed.type)) || undefined,
          title: (parsed && parsed.title) || 'Decentralized Vector Simulation',
          stage: (parsed && parsed.stage) || 'DECENTRALIZED WEB',
          duration: (parsed && parsed.duration) || 10.0,
          camera: (parsed && parsed.camera) || null,
          has3D: Boolean(parsed && parsed.has3D),
          keyframes: (parsed && parsed.keyframes) || [],
          subtitles: (parsed && parsed.subtitles) || [],
          rawBindings: (parsed && parsed.bindings) || [],
          interactive: (parsed && parsed.interactive) || null,
          gestures: (parsed && parsed.gestures) || null,
          stateMachines: (parsed && parsed.stateMachines) || null,
          emitters: (parsed && parsed.emitters) || null,
          bindInputs: (parsed && parsed.bindInputs) || null,
          vars: (parsed && parsed.vars) || {},
          inputs: (parsed && (parsed.uiControls || parsed.inputs)) || [],
          uiControls: (parsed && parsed.uiControls) || null,
          computed: (parsed && parsed.computed) || [],
          physics: (parsed && parsed.physics) || null,
          actors: (parsed && parsed.actors) || [],
          staticElements: (parsed && parsed.staticElements) || [],
          astSource: content,
          svgText: content.includes('<svg') ? content : ''
        };
        const loaded = this.loadSceneData(scene, shouldPlay);
        this.emit('fileloaded', { filename: `${scene.id}.ast`, type: 'ast-payload', id: scene.id });
        return loaded;
      }

      if (content.startsWith('#') || content.includes('Stage:') || content.includes('Shape:')) {
        if (global.ASTSlideScriptCompiler) {
          const compiled = global.ASTSlideScriptCompiler.compile(content);
          const loaded = this.loadSceneData(compiled.scene, shouldPlay);
          this.emit('fileloaded', { filename: `${compiled.scene.id || id}.slidescript`, type: 'slidescript-payload', id: compiled.scene.id || id });
          return loaded;
        }
      }

      if (content.startsWith('{')) {
        const json = JSON.parse(content);
        const loaded = this.loadSceneData(json, shouldPlay);
        this.emit('fileloaded', { filename: `${json.id || id}.json`, type: 'json-payload', id: json.id || id });
        return loaded;
      }

      if (content.includes('<svg')) {
        return this.loadFromFile(new Blob([content], { type: 'image/svg+xml' }), shouldPlay);
      }

      throw new Error('[AST Engine] Unrecognized payload format: expected AST S-expression, SlideScript, or JSON');
    }

    /**
     * Loads an external standalone scene manifest (.json), AST file (.ast), or SVG (.svg) from a remote URL.
     */
    async loadFromUrl(url, shouldPlay = false) {
      if (!url || typeof url !== 'string') {
        const err = new Error('[AST Engine] loadFromUrl requires a valid URL');
        this.emit('error', { type: 'INVALID_URL', message: err.message });
        throw err;
      }
      try {
        let resolvedUrl = url;
        if (url.startsWith('/') && !url.startsWith('//') && typeof window !== 'undefined' && window.location) {
          const path = window.location.pathname || '/';
          const host = window.location.hostname || '';
          let dynamicBase = (window.__AST_BASE_URL__ || window.__AST_ASSET_BASE__ || '').replace(/\/+$/, '') + '/';
          if (dynamicBase === '/') {
            const playerIdx = path.indexOf('/player/');
            if (playerIdx >= 0) {
              dynamicBase = path.slice(0, playerIdx + 1);
            } else if (host === 'github.io' || host.endsWith('.github.io')) {
              const seg = path.split('/').filter(Boolean)[0];
              dynamicBase = seg ? `/${seg}/` : '/';
            }
          }
          if (dynamicBase && dynamicBase !== '/' && !url.startsWith(dynamicBase)) {
            resolvedUrl = dynamicBase.replace(/\/$/, '') + url;
          }
        }
        const res = await fetch(resolvedUrl);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const text = await res.text();
        const cleanUrl = url.split('?')[0];
        const filename = cleanUrl.split('/').pop() || 'remote-asset';
        const contentType = (res.headers && typeof res.headers.get === 'function' && res.headers.get('content-type')) || 'text/plain';
        const blob = new Blob([text], { type: contentType });
        try {
          Object.defineProperty(blob, 'name', { value: filename, writable: false });
        } catch {}
        return await this.loadFromFile(blob, shouldPlay);
      } catch (err) {
        console.error('[AST Engine] Failed to load from URL:', url, err);
        this.emit('error', { type: 'URL_LOAD_ERROR', url, message: err.message });
        if (this.container) {
          this.renderErrorPlaceholder(url, `Network error: ${err.message}`);
        }
        throw err;
      }
    }

    renderErrorPlaceholder(identifier, message) {
      if (!this.container || typeof document === 'undefined') return;
      const SVG_NS = 'http://www.w3.org/2000/svg';
      const mk = (tag, attrs = {}, text = null) => {
        const node = document.createElementNS(SVG_NS, tag);
        for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
        if (text !== null) node.textContent = String(text);
        return node;
      };
      const svg = mk('svg', { viewBox: '0 0 800 480', width: '100%', height: '100%' });
      svg.style.background = '#090d16';
      svg.style.borderRadius = '12px';
      svg.appendChild(mk('rect', { x: 20, y: 20, width: 760, height: 440, rx: 16, fill: '#0f172a', stroke: '#ef4444', 'stroke-width': 2, 'stroke-dasharray': '6 6' }));
      svg.appendChild(mk('circle', { cx: 400, cy: 180, r: 42, fill: '#ef4444', 'fill-opacity': '0.12', stroke: '#ef4444', 'stroke-width': '2.5' }));
      svg.appendChild(mk('text', { x: 400, y: 192, fill: '#ef4444', 'font-size': 34, 'font-weight': 'bold', 'text-anchor': 'middle', 'font-family': 'system-ui, sans-serif' }, '⚠️'));
      svg.appendChild(mk('text', { x: 400, y: 260, fill: '#f8fafc', 'font-size': 20, 'font-weight': '700', 'text-anchor': 'middle', 'font-family': 'system-ui, sans-serif' }, 'Scene Load Error'));
      svg.appendChild(mk('text', { x: 400, y: 295, fill: '#94a3b8', 'font-size': 14, 'text-anchor': 'middle', 'font-family': 'system-ui, sans-serif' }, message || 'Failed to load vector asset'));
      svg.appendChild(mk('text', { x: 400, y: 325, fill: '#64748b', 'font-size': 12, 'text-anchor': 'middle', 'font-family': 'monospace' }, `Target: ${identifier || 'Unknown'}`));
      const btnGroup = mk('g', { cursor: 'pointer', id: 'error-fallback-action', transform: 'translate(325, 360)' });
      btnGroup.appendChild(mk('rect', { width: 150, height: 38, rx: 19, fill: '#2563eb' }));
      btnGroup.appendChild(mk('text', { x: 75, y: 24, fill: '#ffffff', 'font-size': 13, 'font-weight': 'bold', 'text-anchor': 'middle', 'font-family': 'system-ui, sans-serif' }, 'Load Default Scene'));
      btnGroup.onclick = () => {
        this.loadScene('welcome', true);
      };
      svg.appendChild(btnGroup);
      if (typeof this.container.replaceChildren === 'function') this.container.replaceChildren(svg);
      else { this.container.textContent = ''; this.container.appendChild(svg); }
    }
  }

  const ASTFileIngest = {};
  const _proto = ASTFileIngestMethods.prototype;
  const _names = Object.getOwnPropertyNames(_proto);
  for (let i = 0; i < _names.length; i++) {
    const _name = _names[i];
    if (_name !== 'constructor') {
      ASTFileIngest[_name] = _proto[_name];
    }
  }

  global.ASTFileIngest = ASTFileIngest;
  if (typeof window !== 'undefined') {
    window.ASTFileIngest = ASTFileIngest;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
