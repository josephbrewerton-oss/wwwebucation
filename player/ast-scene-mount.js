/**
 * static/player/ast-scene-mount.js
 *
 * St Joseph's AST Vector Media Player — Scene Asset Mounting, Compilation, Video Backdrop & Hot-Reload
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Extracted peer module for ASTVectorPlayerEngine.
 * Zero external dependencies; loaded before ast-engine.js.
 * All methods execute with `this` bound to the ASTVectorPlayerEngine instance.
 */

(function (global) {
  'use strict';

  const _getAST3D = () => global.AST3DEngine || (typeof window !== 'undefined' ? window.AST3DEngine : undefined);

  class ASTSceneMountMethods {
  setupBackdropVideo(scene) {
    if (typeof document === 'undefined') return;

    const stageSvg = this.getStageSvg();
    const parentContainer = (stageSvg && stageSvg.parentElement) || this.container || document.getElementById('player-stage');

    let videoEl = document.getElementById('ast-backdrop-video');
    if (!videoEl && parentContainer) {
      videoEl = document.createElement('video');
      videoEl.id = 'ast-backdrop-video';
      videoEl.setAttribute('playsinline', '');
      videoEl.setAttribute('webkit-playsinline', '');
      videoEl.setAttribute('preload', 'auto');
      videoEl.controls = false;
      videoEl.muted = false;
      videoEl.style.position = 'absolute';
      videoEl.style.top = '0';
      videoEl.style.left = '0';
      videoEl.style.width = '100%';
      videoEl.style.height = '100%';
      videoEl.style.zIndex = '1';
      videoEl.style.pointerEvents = 'none';
      videoEl.style.background = '#000000';
      videoEl.style.display = 'none';

      if (stageSvg && stageSvg.parentNode === parentContainer) {
        parentContainer.insertBefore(videoEl, stageSvg);
      } else {
        parentContainer.appendChild(videoEl);
      }
    }

    this.backdropVideo = videoEl;

    if (stageSvg) {
      stageSvg.style.position = 'relative';
      stageSvg.style.zIndex = '2';
      stageSvg.style.background = 'transparent';
    }

    if (scene && (scene.video || scene.hasVideo)) {
      const videoSrc = scene.video;
      if (videoEl && videoSrc) {
        const currentSrc = videoEl.getAttribute('src');
        if (currentSrc !== videoSrc) {
          videoEl.src = videoSrc;
          videoEl.load();
        }
        videoEl.style.objectFit = scene.videoFit || 'contain';
        videoEl.style.display = 'block';

        const onLoadedMeta = () => {
          if (videoEl.duration && Number.isFinite(videoEl.duration) && (!scene.duration || scene.duration === 10.0)) {
            if (scene && typeof scene === 'object' && scene !== Object.prototype && scene !== Function.prototype) {
              Object.defineProperty(scene, 'duration', {
                value: videoEl.duration,
                writable: true,
                configurable: true,
                enumerable: true
              });
            }
            this.durationSec = videoEl.duration;
          }
          if (this.isPlaying) {
            videoEl.play().catch(() => {});
          }
        };
        videoEl.onloadedmetadata = onLoadedMeta;
        videoEl.onerror = (e) => {
          console.warn('[AST Engine] Backdrop video source unavailable or failed to load:', videoSrc, e);
          videoEl.style.display = 'none';
        };

        if (Number.isFinite(videoEl.duration) && videoEl.duration > 0) {
          videoEl.currentTime = this.progress * videoEl.duration;
        }

        videoEl.onended = () => {
          if (this.loop) {
            videoEl.currentTime = 0;
            videoEl.play().catch(() => {});
          } else {
            this.pause();
          }
        };
      }
    } else if (videoEl) {
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.style.display = 'none';
      videoEl.onloadedmetadata = null;
      videoEl.onended = null;
    }
  }

  _applyScenePhysics(scene) {
    if (!this.physics || !scene || !scene.physics) return;
    this.physics.clear();
    if (scene.physics.gravity !== undefined) this.physics.setGravity(scene.physics.gravity);
    if (scene.physics.restitution !== undefined) this.physics.setRestitution(scene.physics.restitution);
    if (scene.physics.friction !== undefined) this.physics.setFriction(scene.physics.friction);
    if (scene.physics.substeps !== undefined) this.physics.setSubsteps(scene.physics.substeps);
    if (scene.physics.stiffness !== undefined) this.physics.stiffness = scene.physics.stiffness;
    if (scene.physics.damping !== undefined) this.physics.damping = scene.physics.damping;
    if (scene.physics.drag !== undefined) this.physics.drag = scene.physics.drag;
    if (scene.physics.groundY !== undefined) this.physics.groundY = scene.physics.groundY;
    if (Array.isArray(scene.physics.bodies)) {
      for (let i = 0; i < scene.physics.bodies.length; i++) {
        const b = scene.physics.bodies[i];
        if (b && typeof b === 'object') {
          this.physics.addBody(b);
        }
      }
    }
    if (Array.isArray(scene.physics.springs)) {
      for (let i = 0; i < scene.physics.springs.length; i++) {
        const sp = scene.physics.springs[i];
        if (sp && typeof sp === 'object') {
          this.physics.addSpring(sp);
        }
      }
    }
  }

  mountSceneAsset(scene, container) {
    if (!scene || this._isMounting) return;
    this._isMounting = true;
    try {
      this._mountedContainer = container || null;
      this._mountedSceneId = scene.id;
      this.setupBackdropVideo(scene);
      const stage = this.getStageSvg();
      if (stage) {
        stage.setAttribute('viewBox', '0 0 800 480');
        this._defaultViewBox = '0 0 800 480';
      }
      if (container) {
        this.ensureMasterDefs(container);
      }
      this.activeBindings = [];
      this.activeVarBindings = [];
      this.active3DNodes = [];
      this.active3DLines = [];
      this.active3DRings = [];
      this.active3DPolygons = [];
      this.active3DItems = [];
      this.activeScopes = [];
      this.activeLedgers = [];
      if (this._cpHoldTimers) this._cpHoldTimers.fill(0);
      if (this._cpPassedMask) this._cpPassedMask.fill(0);
      this._cachedElements = null;

      if (global.ASTSharedRenderBoundary && typeof global.ASTSharedRenderBoundary.registerSurface === 'function') {
        global.ASTSharedRenderBoundary.registerSurface({
          id: 'player-stage',
          label: scene.title || scene.id || 'AST Player Stage',
          renderMode: 'svg',
          sceneId: scene.id || '',
          svgContainer: container || null,
          stageSvg: stage || null,
        });
      }

      if (container && scene.svgText) {
        try {
          if (global.ASTSharedRenderBoundary && typeof global.ASTSharedRenderBoundary.mountSvgStage === 'function') {
            const mountRes = global.ASTSharedRenderBoundary.mountSvgStage({
              container,
              stageSvg: stage,
              surfaceId: 'player-stage',
              svgText: scene.svgText,
            });
            if (mountRes && mountRes.viewBox) {
              this._defaultViewBox = mountRes.viewBox;
            }
            if (!mountRes || !mountRes.mounted) {
              console.warn('[AST Engine] SVG template mounting bypassed due to parse failure.');
            }
          } else {
            let safeSvg = this.sanitizeSvg(scene.svgText);
            safeSvg = safeSvg
              .replace(/&times;/g, '×')
              .replace(/&bull;/g, '•')
              .replace(/&Omega;/g, 'Ω')
              .replace(/&nbsp;/g, '&#160;')
              .replace(/&divide;/g, '÷')
              .replace(/&diams;/g, '♦')
              .replace(/&mdash;/g, '—')
              .replace(/&ne;/g, '≠')
              .replace(/&deg;/g, '°');

            let mounted = false;
            if (safeSvg && typeof document !== 'undefined') {
              const rootSvg = this._buildSafeSvgTree(safeSvg);
              if (rootSvg) {
                const vb = rootSvg.getAttribute('viewBox') || rootSvg.getAttribute('viewbox');
                if (vb && stage) {
                  stage.setAttribute('viewBox', vb);
                  this._defaultViewBox = vb;
                }
                this.sanitizeSvgElement(rootSvg);
                if (typeof container.replaceChildren === 'function') {
                  container.replaceChildren(...rootSvg.childNodes);
                } else {
                  while (container.firstChild) {
                    container.removeChild(container.firstChild);
                  }
                  while (rootSvg.firstChild) {
                    container.appendChild(rootSvg.firstChild);
                  }
                }
                mounted = true;
              }
            }

            if (!mounted && container) {
              console.warn('[AST Engine] SVG template mounting bypassed due to parse failure.');
            }
          }
        } catch (err) {
          console.warn('SVG mount bypassed due to parse failure:', err);
        }
      } else if (container && typeof scene.render === 'function' && typeof scene.mount !== 'function') {
        const rendered = scene.render(this.progress);
        if (typeof Node !== 'undefined' && rendered instanceof Node) {
          container.replaceChildren(rendered);
        } else if (typeof rendered === 'string') {
          try {
            const safeRendered = this.sanitizeSvg(rendered);
            const wrapped = safeRendered.trim().startsWith('<svg')
              ? safeRendered
              : `<svg xmlns="http://www.w3.org/2000/svg">${safeRendered}</svg>`;
            const svgEl = this._buildSafeSvgTree(wrapped);
            if (svgEl) {
              this.sanitizeSvgElement(svgEl);
              if (typeof container.replaceChildren === 'function') {
                container.replaceChildren(...svgEl.childNodes);
              } else {
                container.textContent = '';
                while (svgEl.firstChild) container.appendChild(svgEl.firstChild);
              }
            }
          } catch (e) {
            console.warn('[AST Engine] Rendered SVG string failed to parse safely:', e);
          }
        }
      }

      if (container && typeof scene.mount === 'function') {
        this._cachedElements = scene.mount(container);
      }

      const hasDomQuery = Boolean(container && typeof container.querySelector === 'function');
      const bindingsList = (scene.rawBindings && scene.rawBindings.length) ? scene.rawBindings : (scene.bindings || []);
      if (bindingsList && bindingsList.length) {
        bindingsList.forEach(b => {
          if (b.type === '3d-node' || b.type === '3d-line' || b.type === '3d-ring' || b.type === '3d-polygon') {
            const _3d = _getAST3D();
            if (_3d && typeof _3d.mount3DBinding === 'function') {
              _3d.mount3DBinding.call(this, b, container, hasDomQuery);
            }
          } else if (b.type === 'var-update' && b.varName) {
            let varEvalFn = () => (this.vars ? this.vars[b.varName] : 0);
            try {
              varEvalFn = this.compileAstFn(b.expr || '0');
            } catch (e) {
              console.warn('[AST Engine] Failed compiling var binding:', b.varName, b.expr, e);
            }
            this.activeVarBindings.push({
              varName: b.varName,
              evalFn: varEvalFn
            });
          } else {
            const node = hasDomQuery ? container.querySelector(b.target) : null;
            if (node) {
              let rawBindFn = null;
              let rawExpr = String(b.expr || '0').trim();
              let affine = b.affine || null;

              if (!affine && rawExpr) {
                const transX = rawExpr.match(/^translate\(\s*([^,]+?)\s*(?:,\s*0\s*)?\)$/);
                const rot = rawExpr.match(/^rotate\(\s*([^,)]+?)(?:\s*,\s*([0-9.-]+)\s*,\s*([0-9.-]+)\s*)?\)$/);
                const coreMath = transX ? transX[1].trim() : (rot ? rot[1].trim() : rawExpr);

                const lin1 = coreMath.match(/^([0-9.-]+)\s*([+-])\s*([0-9.-]+)\s*\*\s*t$/);
                const lin2 = coreMath.match(/^([0-9.-]+)\s*\*\s*t\s*([+-])\s*([0-9.-]+)$/);
                if (lin1) {
                  const c = parseFloat(lin1[1]);
                  const m = (lin1[2] === '-' ? -1 : 1) * parseFloat(lin1[3]);
                  affine = { m, c, transform: transX ? 'translateX' : (rot ? 'rotate' : 'none'), originX: rot && rot[2] ? parseFloat(rot[2]) : null, originY: rot && rot[3] ? parseFloat(rot[3]) : null };
                } else if (lin2) {
                  const m = parseFloat(lin2[1]);
                  const c = (lin2[2] === '-' ? -1 : 1) * parseFloat(lin2[3]);
                  affine = { m, c, transform: transX ? 'translateX' : (rot ? 'rotate' : 'none'), originX: rot && rot[2] ? parseFloat(rot[2]) : null, originY: rot && rot[3] ? parseFloat(rot[3]) : null };
                }
              }

              const isTransformAttr = b.attr === 'transform';
              try {
                rawBindFn = this.compileAstFn(rawExpr.replace(/\\\\'/g, "\\'"));
              } catch (e) {
                console.warn('[AST Engine] Failed compiling expr:', b.expr, e);
                rawBindFn = isTransformAttr ? () => '' : () => 0;
              }

              const boundEval = isTransformAttr
                ? (t, vars, MathObj, comp) => {
                    let val;
                    try {
                      val = typeof rawBindFn === 'function' ? rawBindFn(t, vars, comp, MathObj) : '';
                    } catch {
                      return '';
                    }
                    if (val === 0 || val === '0' || !val) return '';
                    if (typeof val === 'number') return `translate(${val}, 0)`;
                    if (typeof val === 'string' && !val.includes('(')) return `translate(${val}, 0)`;
                    return val;
                  }
                : (t, vars, MathObj, comp) => {
                    try {
                      return typeof rawBindFn === 'function' ? rawBindFn(t, vars, comp, MathObj) : 0;
                    } catch {
                      return 0;
                    }
                  };

              let whenFn = null;
              if (b.when) {
                try {
                  whenFn = this.compileAstFn(String(b.when).replace(/\\\\'/g, "\\'"));
                } catch (_) {
                  whenFn = null;
                }
              }

              this.activeBindings.push({
                target: b.target,
                attr: b.attr,
                node,
                affine,
                matrixBuf: affine && (affine.transform === 'translateX' || affine.transform === 'translateY' || affine.transform === 'rotate') ? new Float32Array(6) : null,
                whenFn,
                evalFn: boundEval
              });
            }
          }
        });
      }

      this._applyScenePhysics(scene);

      this.resetVars();
      this.updateComputedVars();

      try {
        if (container) {
          const dynamicTargets = new Set();

          if (Array.isArray(this.activeBindings)) {
            this.activeBindings.forEach(b => {
              if (b && b.node && b.node.isConnected) {
                dynamicTargets.add(b.node);
              } else if (b && b.target) {
                const freshEl = container.querySelector(b.target);
                if (freshEl) {
                  b.node = freshEl;
                  dynamicTargets.add(freshEl);
                }
              }
            });
          }

          if (Array.isArray(this.active3DItems)) {
            this.active3DItems.forEach(item => {
              if (item && item.domNode && item.domNode.isConnected) {
                dynamicTargets.add(item.domNode);
              }
            });
          }

          if (scene.actors && Array.isArray(scene.actors)) {
            scene.actors.forEach(a => {
              if (a && a.target) {
                const el = container.querySelector(a.target);
                if (el) dynamicTargets.add(el);
              }
            });
          }

          dynamicTargets.forEach(el => {
            if (el && el.style && typeof el.style.setProperty === 'function') {
              el.style.setProperty('will-change', 'transform, opacity');
            }
          });

          if (scene.gestures && Array.isArray(scene.gestures)) {
            scene.gestures.forEach(g => {
              if (!g || !g.target) return;
              const el = container.querySelector(g.target);
              if (el) dynamicTargets.add(el);
            });
          }

          dynamicTargets.forEach(node => {
            if (node && node.style) {
              node.style.willChange = 'transform';
              node.setAttribute('data-kinematic', 'true');
              node.style.pointerEvents = 'auto';
            }
          });

          if (scene.staticElements && Array.isArray(scene.staticElements)) {
            scene.staticElements.forEach(s => {
              const el = container.querySelector(s.target);
              if (el && el.style) {
                el.style.pointerEvents = 'none';
                el.style.contain = 'paint layout';
                el.setAttribute('data-static', 'true');
              }
            });
          } else {
            const directChildren = Array.from(container.children || []);
            directChildren.forEach(child => {
              if (child.id === 'annotation-ink-root' || child.id === 'dev-overlay-root') return;
              const containsDynamic = Array.from(dynamicTargets).some(dt => child.contains(dt));
              if (!containsDynamic && child.style) {
                child.style.contain = 'paint layout';
                child.setAttribute('data-static', 'true');
              }
            });
          }
        }
      } catch (domOptErr) {
        console.warn('[AST Engine] DOM optimization notice:', domOptErr);
      }

      this.emitters.clear();
      if (scene.emitters && Array.isArray(scene.emitters)) {
        scene.emitters.forEach(emConfig => {
          const em = this.addEmitter(emConfig);
          if (em.phaseExpr) {
            try {
              const rawPhFn = this.compileAstFn(em.phaseExpr);
              if (typeof rawPhFn === 'function') {
                em._phaseEval = (t, vars, MathObj, computed, clamp, lerp, map) =>
                  (typeof rawPhFn === 'function' ? rawPhFn(t, vars, computed, MathObj, clamp, lerp, map) : 0);
              }
            } catch (_) {}
          }
          if (em.clampXExpr) {
            try {
              const rawCxFn = this.compileAstFn(em.clampXExpr);
              if (typeof rawCxFn === 'function') {
                em._clampXEval = (t, vars, MathObj, computed, clamp, lerp, map) =>
                  (typeof rawCxFn === 'function' ? rawCxFn(t, vars, computed, MathObj, clamp, lerp, map) : 0);
              }
            } catch (_) {}
          }
          if (em.speedExpr) {
            try {
              const rawSpdFn = this.compileAstFn(em.speedExpr);
              if (typeof rawSpdFn === 'function') {
                em._speedEval = (t, vars, MathObj, computed, clamp, lerp, map) =>
                  (typeof rawSpdFn === 'function' ? rawSpdFn(t, vars, computed, MathObj, clamp, lerp, map) : 0);
              }
            } catch (_) {}
          }
          if (em.countExpr) {
            try {
              const rawCntFn = this.compileAstFn(em.countExpr);
              if (typeof rawCntFn === 'function') {
                em._countEval = (t, vars, MathObj, computed, clamp, lerp, map) =>
                  (typeof rawCntFn === 'function' ? rawCntFn(t, vars, computed, MathObj, clamp, lerp, map) : 0);
              }
            } catch (_) {}
          }
        });
      }
      if (this.emitters && this.emitters.size > 0) {
        for (const em of this.emitters.values()) {
          em.mount(container);
        }
      }

      // Mount Live Vector Oscilloscopes (:scope) backed by pre-allocated Float32Array ring buffers
      if (scene.scopes && Array.isArray(scene.scopes)) {
        for (let s = 0; s < scene.scopes.length; s++) {
          const scCfg = scene.scopes[s];
          if (!scCfg || !scCfg.target) continue;
          const node = container && typeof container.querySelector === 'function' ? container.querySelector(scCfg.target) : null;
          let plotX = 480;
          let plotY = 100;
          let plotW = 280;
          let plotH = 140;
          if (Array.isArray(scCfg.plot) && scCfg.plot.length >= 4) {
            plotX = scCfg.plot[0];
            plotY = scCfg.plot[1];
            plotW = scCfg.plot[2];
            plotH = scCfg.plot[3];
          } else if (node && typeof node.getAttribute === 'function') {
            const dpx = parseFloat(node.getAttribute('data-plot-x'));
            const dpy = parseFloat(node.getAttribute('data-plot-y'));
            const dpw = parseFloat(node.getAttribute('data-plot-w'));
            const dph = parseFloat(node.getAttribute('data-plot-h'));
            if (Number.isFinite(dpx) && Number.isFinite(dpy) && dpw > 0 && dph > 0) {
              plotX = dpx; plotY = dpy; plotW = dpw; plotH = dph;
            }
          }
          let evalX = () => 0;
          let evalY = () => 0;
          try {
            const rawX = this.compileAstFn(scCfg.xExpr || 't');
            if (typeof rawX === 'function') {
              evalX = (t, vars, MathObj, computed, clamp, lerp, map) =>
                (typeof rawX === 'function' ? rawX(t, vars, computed, MathObj, clamp, lerp, map) : 0);
            }
          } catch (_) {}
          try {
            const rawY = this.compileAstFn(scCfg.yExpr || '0');
            if (typeof rawY === 'function') {
              evalY = (t, vars, MathObj, computed, clamp, lerp, map) =>
                (typeof rawY === 'function' ? rawY(t, vars, computed, MathObj, clamp, lerp, map) : 0);
            }
          } catch (_) {}
          const cap = Math.max(8, Math.min(2048, scCfg.samples || 96));
          this.activeScopes.push({
            target: scCfg.target,
            node,
            capacity: cap,
            rawX: new Float32Array(cap),
            rawY: new Float32Array(cap),
            slotTokens: new Array(cap),
            ptStrings: new Array(cap),
            head: 0,
            count: 0,
            hasLast: false,
            lastSampleX: 0,
            lastSampleY: 0,
            xMin: Array.isArray(scCfg.xRange) ? scCfg.xRange[0] : 0,
            xMax: Array.isArray(scCfg.xRange) ? scCfg.xRange[1] : 30,
            yMin: Array.isArray(scCfg.yRange) ? scCfg.yRange[0] : 0,
            yMax: Array.isArray(scCfg.yRange) ? scCfg.yRange[1] : 100,
            plotX,
            plotY,
            plotW,
            plotH,
            evalX,
            evalY
          });
        }
      }

      // Mount Conservation-Law & Energy-Ledger Meters (:ledger) with pre-allocated Float32Array term buffers
      if (scene.ledgers && Array.isArray(scene.ledgers)) {
        for (let l = 0; l < scene.ledgers.length; l++) {
          const ldCfg = scene.ledgers[l];
          if (!ldCfg || !Array.isArray(ldCfg.terms) || ldCfg.terms.length === 0) continue;
          const terms = ldCfg.terms;
          const evalFns = [];
          for (let ti = 0; ti < terms.length; ti++) {
            let fn = () => 0;
            try {
              const rawFn = this.compileAstFn(terms[ti].expr || '0');
              if (typeof rawFn === 'function') {
                fn = (t, vars, MathObj, computed, clamp, lerp, map) =>
                  (typeof rawFn === 'function' ? rawFn(t, vars, computed, MathObj, clamp, lerp, map) : 0);
              }
            } catch (_) {}
            evalFns.push(fn);
          }
          let maxEvalFn = null;
          if (ldCfg.maxExpr) {
            try {
              const rawMaxFn = this.compileAstFn(ldCfg.maxExpr);
              if (typeof rawMaxFn === 'function') {
                maxEvalFn = (t, vars, MathObj, computed, clamp, lerp, map) =>
                  (typeof rawMaxFn === 'function' ? rawMaxFn(t, vars, computed, MathObj, clamp, lerp, map) : 0);
              }
            } catch (_) {}
          }

          let groupNode = container && typeof container.querySelector === 'function'
            ? (container.querySelector(ldCfg.target || `#${ldCfg.id}`) || container.querySelector(`#${ldCfg.id}`))
            : null;
          const rectNodes = [];
          const valueLabelNodes = [];
          let totalNode = null;
          const lx = typeof ldCfg.x === 'number' ? ldCfg.x : 40;
          const ly = typeof ldCfg.y === 'number' ? ldCfg.y : 400;
          const lw = typeof ldCfg.width === 'number' ? ldCfg.width : 320;
          const lh = typeof ldCfg.height === 'number' ? ldCfg.height : 20;

          if (typeof document !== 'undefined' && container) {
            if (!groupNode) {
              groupNode = document.createElementNS('http://www.w3.org/2000/svg', 'g');
              groupNode.setAttribute('id', ldCfg.id);
              groupNode.setAttribute('class', 'ast-conservation-ledger');
              container.appendChild(groupNode);
            } else {
              groupNode.replaceChildren();
            }
            const track = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            track.setAttribute('x', String(lx));
            track.setAttribute('y', String(ly));
            track.setAttribute('width', String(lw));
            track.setAttribute('height', String(lh));
            track.setAttribute('rx', '4');
            track.setAttribute('fill', '#0f172a');
            track.setAttribute('stroke', '#334155');
            track.setAttribute('stroke-width', '1.2');
            groupNode.appendChild(track);

            for (let ti = 0; ti < terms.length; ti++) {
              const segRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
              segRect.setAttribute('x', String(lx));
              segRect.setAttribute('y', String(ly + 1));
              segRect.setAttribute('width', '0');
              segRect.setAttribute('height', String(Math.max(4, lh - 2)));
              segRect.setAttribute('fill', terms[ti].color || '#38bdf8');
              groupNode.appendChild(segRect);
              rectNodes.push(segRect);

              const swatch = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
              const legX = lx + ti * Math.floor(lw / Math.min(3, terms.length));
              const legY = ly + lh + 7;
              swatch.setAttribute('x', String(legX));
              swatch.setAttribute('y', String(legY));
              swatch.setAttribute('width', '8');
              swatch.setAttribute('height', '8');
              swatch.setAttribute('rx', '2');
              swatch.setAttribute('fill', terms[ti].color || '#38bdf8');
              groupNode.appendChild(swatch);

              const legTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              legTxt.setAttribute('x', String(legX + 12));
              legTxt.setAttribute('y', String(legY + 8));
              legTxt.setAttribute('fill', '#cbd5e1');
              legTxt.setAttribute('font-size', '9.5');
              legTxt.setAttribute('font-family', 'monospace');
              legTxt.textContent = `${terms[ti].label}: 0`;
              groupNode.appendChild(legTxt);
              valueLabelNodes.push(legTxt);
            }

            totalNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            totalNode.setAttribute('x', String(lx + lw));
            totalNode.setAttribute('y', String(ly - 5));
            totalNode.setAttribute('fill', '#94a3b8');
            totalNode.setAttribute('font-size', '9.5');
            totalNode.setAttribute('font-weight', '700');
            totalNode.setAttribute('text-anchor', 'end');
            totalNode.setAttribute('font-family', 'monospace');
            totalNode.textContent = '';
            groupNode.appendChild(totalNode);
          }

          this.activeLedgers.push({
            id: ldCfg.id,
            unit: ldCfg.unit || '',
            x: lx,
            y: ly,
            width: lw,
            height: lh,
            terms,
            evalFns,
            maxEvalFn,
            values: new Float32Array(terms.length),
            lastValues: new Float32Array(terms.length),
            hasLast: false,
            rectNodes,
            valueLabelNodes,
            totalNode
          });
        }
      }

      // Pre-compile manipulation checkpoint :pass-expr evaluators
      if (scene.interactive && Array.isArray(scene.interactive.checkpoints)) {
        for (let ci = 0; ci < scene.interactive.checkpoints.length; ci++) {
          const cp = scene.interactive.checkpoints[ci];
          if (cp && cp.passExpr && !cp._passEvalFn) {
            try {
              const rawPassFn = this.compileAstFn(cp.passExpr);
              cp._passEvalFn = typeof rawPassFn === 'function'
                ? (t, vars, MathObj, computed, clamp, lerp, map) =>
                    Boolean(typeof rawPassFn === 'function' ? rawPassFn(t, vars, computed, MathObj, clamp, lerp, map) : false)
                : () => false;
            } catch (_) {
              cp._passEvalFn = () => false;
            }
          }
        }
      }

      // Initialize zero-GC Lab CSV log columnar buffers
      this._initLabLogBuffers();

      if (scene.bindInputs && Array.isArray(scene.bindInputs)) {
        scene.bindInputs.forEach(bi => this.registerBindInput(bi));
      }

      this.stateMachines.clear();
      if (scene.stateMachines && Array.isArray(scene.stateMachines)) {
        scene.stateMachines.forEach(smConfig => {
          this.addStateMachine(smConfig);
        });
      }

      // Pre-classify scene execution mode once per mount (eliminates per-frame Object.keys allocation in tick)
      this._isSlideScene = Boolean(scene && (scene.type === 'Slide' || scene.cartridgeType === 'Slide'));
      this._isDynamicScene = !this._isSlideScene && Boolean(
        this.isContinuousSim || this.isDynamicSim || (scene && (
          scene.continuous || scene.isContinuous || scene.type === 'Sim' || scene.cartridgeType === 'Sim' ||
          (scene.vars && (Array.isArray(scene.vars) ? scene.vars.length > 0 : Object.keys(scene.vars).length > 0)) ||
          typeof scene.mount === 'function'
        ))
      );
      this._lastOrbitTransform = '';
      this._lastOrbitTransition = '';
      this._last3DSortKeys = null;

      this.applyBindings(this.progress);
      this.translateInStageLabels();
      if (this.profiler) {
        this.profiler.mount(this.getStageSvg());
      }
      if (typeof window !== 'undefined' && window.__astGestures && typeof window.__astGestures.enhanceSceneInteractivity === 'function') {
        window.__astGestures.enhanceSceneInteractivity();
      }
    } finally {
      this._isMounting = false;
    }
  }

  hotReloadSvg(svgMarkup) {
    if (!svgMarkup || typeof svgMarkup !== 'string') return false;
    try {
      if (!this.scene) {
        this.scene = { id: 'custom-scene', title: 'Custom SVG Scene', stage: 'DEVELOPER', duration: 10.0 };
      }
      this.scene.svgText = this.sanitizeSvg(svgMarkup);
      this.scene._rawAstbBuffer = null;
      this.scene._svgEditedManually = true;
      this._svgDirtyFromInspector = false;

      const targetContainer = this._container || this.container;
      if (targetContainer) {
        this.mountSceneAsset(this.scene, targetContainer);
        this.applyBindings(this.progress);
      }

      this.emit('svghotreloaded', { svg: this.scene.svgText, progress: this.progress });
      this.notifyParent({ type: 'DEV_HOT_RELOAD_SUCCESS', target: 'svg' });
      this.verifyLoadedCartridge(this.scene).catch(() => {});
      return true;
    } catch (err) {
      console.error('[AST Engine] Failed to hot-reload SVG:', err);
      return false;
    }
  }

  hotReloadAst(astInput) {
    if (!astInput) return false;
    try {
      let parsed = typeof astInput === 'string' ? this.parseAst(astInput) : astInput;
      if (!parsed) return false;

      if (!this.scene) this.scene = {};
      this.scene.id = parsed.id || this.scene.id || 'custom-ast';
      this.scene.title = parsed.title || this.scene.title || 'Custom AST Scene';
      this.scene.stage = parsed.stage || this.scene.stage || 'DEVELOPER';
      this.scene.duration = parsed.duration || this.scene.duration || 10.0;
      if (parsed.type) this.scene.type = parsed.type;
      if (parsed.vars) this.scene.vars = parsed.vars;
      if (parsed.uiControls) this.scene.uiControls = parsed.uiControls;
      if (parsed.inputs) this.scene.inputs = parsed.inputs;
      if (parsed.computed) this.scene.computed = parsed.computed;
      if (parsed.gestures) this.scene.gestures = parsed.gestures;
      if (parsed.controls) this.scene.controls = parsed.controls;
      this.scene.keyframes = parsed.keyframes || [];
      this.scene.subtitles = parsed.subtitles || [];
      this.scene.rawBindings = parsed.bindings || parsed.rawBindings || [];
      if (parsed.interactive) {
        this.scene.interactive = parsed.interactive;
      } else if (parsed.checkpoints && parsed.checkpoints.length > 0) {
        this.scene.interactive = { checkpoints: parsed.checkpoints, hotspots: [] };
      } else {
        this.scene.interactive = null;
      }
      if (parsed.camera) this.scene.camera = parsed.camera;
      if (parsed.physics) this.scene.physics = parsed.physics;
      this.scene.scopes = parsed.scopes || [];
      this.scene.ledgers = parsed.ledgers || [];
      if (typeof parsed.has3D === 'boolean') this.scene.has3D = parsed.has3D;
      this.scene.astSource = typeof astInput === 'string' ? astInput : null;
      this.scene._rawAstbBuffer = null;
      this.scene._astEditedManually = true;

      this.activePresetId = this.scene.id || this.activePresetId;
      this.durationSec = this.scene.duration;
      this.resetVars();
      this.updateComputedVars();

      const targetContainer = this._container || this.container;
      if (targetContainer) {
        this.mountSceneAsset(this.scene, targetContainer);
        this.applyBindings(this.progress);
      }
      if (typeof this.mountDeclarativeHud === 'function') {
        this.mountDeclarativeHud(this.scene);
      }

      this.emit('asthotreloaded', { ast: parsed, progress: this.progress });
      this.notifyParent({ type: 'DEV_HOT_RELOAD_SUCCESS', target: 'ast' });
      this.verifyLoadedCartridge(this.scene).catch(() => {});
      return true;
    } catch (err) {
      console.error('[AST Engine] Failed to hot-reload AST:', err);
      return false;
    }
  }
  }

  const ASTSceneMount = {};
  const _proto = ASTSceneMountMethods.prototype;
  for (const _name of Object.getOwnPropertyNames(_proto)) {
    if (_name !== 'constructor' && typeof _proto[_name] === 'function') {
      ASTSceneMount[_name] = _proto[_name];
    }
  }

  global.ASTSceneMount = ASTSceneMount;
  if (typeof window !== 'undefined') {
    window.ASTSceneMount = ASTSceneMount;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ASTSceneMount };
  }
})(typeof window !== 'undefined' ? window : globalThis);
