/**
 * src/components/NativeBslInterpreter.ts
 *
 * St Joseph's Curriculum Portal — Sovereign Real-Time In-Vision BSL & Makaton Vector Interpreter
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Features:
 * 1. Zero-Video Procedural 3D Vector Avatar running client-side at 60 FPS (0 KB video feeds).
 * 2. Signature BSL Level 6 Linguistic Syntax Engine:
 *    - 10-Point 3D Spatial Register Grid (ME, YOU, LOCUS_A–F, LOCUS_HIGH, LOCUS_LOW).
 *    - Polycomponential Classifiers (CL:V, CL:B, CL:C, handling-book, handling-cup, proform-1).
 *    - Aspectual Modulators (durative, intensive, habitual, inceptive).
 *    - Constructed Action & Role-Shift torso yaw (±15° to ±20°).
 *    - Adverbial Non-Manual Features (NMF: mm, th, tight-lips, puffed-cheeks, pursed, f-mouth).
 * 3. Makaton Key Word Signing mode (spoken English chronological order, SEN clarity).
 * 4. Dual-Perspective Camera: Receiver POV (front-facing) and Signer POV (1st-person acquisition).
 * 5. Native Browser Document Picture-in-Picture (documentPictureInPicture API) uncoupling
 *    into an always-on-top desktop window while preserving the 60 FPS rendering loop.
 * 6. Integrated Speech Synthesis audio toggle with bslGlobalStore synchronization.
 */

import {
  Point3D,
  BslHandPose,
  BslNmf,
  BslBaseHandMode,
  BSL_BASE_HAND,
  BSL_BASE_REST_HAND,
  DOMINANT_REST_POSE,
  DOMINANT_REST_KNUCKLE,
  DOMINANT_REST_WRIST,
  project3DToSvg,
  interpolatePoint3D,
  solveHandKinematics,
  evaluateBslEase,
} from '../utils/bslAlphabet';
import {
  lookupBslSign,
  lookupMakatonSign,
  BSL_CURRICULUM_LEXICON,
} from '../utils/bslLexicon';
import {
  analyzeAndTransformBslGrammar,
  BslGrammarMode,
  BslGrammarAnalysis,
  DEFAULT_BSL_LOCI,
  BslLocusId,
} from '../utils/bslGrammarEngine';
import {
  subscribeBslSpeech,
  setBslEnabled,
  getSignLanguage,
  setSignLanguage,
  subscribeSignLanguage,
  getVoiceEnabled,
  toggleVoice,
  subscribeVoice,
  BslSpeechPayload,
} from '../services/bslGlobalStore';
import { isSoundEnabled } from '../services/soundHaptics';

export class NativeBslInterpreterElement extends HTMLElement {
  // PiP and Window state
  private pipWindow: Window | null = null;
  private stageHostContainer: HTMLElement | null = null;
  private avatarWrapper: HTMLElement | null = null;

  // Speech tracking to avoid restarting on word boundaries
  private lastSpokenSubtitle = '';

  // Camera POV & 360-degree drag orbit offsets
  private cameraMode: 'receiver' | 'signer' = 'receiver';
  private orbitYawOffset = 0;
  private orbitPitchOffset = 0;
  private readonly cameraConfigs = {
    receiver: { yaw: 180, pitch: -8, distance: 360, fov: 60 },
    signer: { yaw: 0, pitch: 26, distance: 360, fov: 60 },
  };

  // Grammar & Mode
  private grammarMode: BslGrammarMode = 'bsl-natural';
  private voiceEnabled = true;

  // Animation Loop State
  private animationFrameId: number | null = null;
  private currentPose: BslHandPose;
  private targetPose: BslHandPose;
  private poseQueue: BslHandPose[] = [];
  private currentPoseStartTime = 0;
  private currentPoseDuration = 550; // ms per sign keyframe
  private currentAnimProgress = 0;
  private holdRemaining = 0;
  private isIdle = true;

  // Active Telemetry
  private currentGloss = 'READY';
  private currentSentenceType = 'STANDBY';
  private currentNmfText = 'Eyebrows: neutral | Mouth: neutral';
  private activeClassifierText = 'CL: NONE';

  // Subscriptions
  private unsubscribeSpeech?: () => void;
  private unsubscribeVoice?: () => void;
  private unsubscribeSignLang?: () => void;

  // Blinking & Idle Breathing
  private eyeBlinkProgress = 0;
  private nextBlinkTime = 0;

  constructor() {
    super();
    this.currentPose = this.createRestPose();
    this.targetPose = this.createRestPose();
  }

  connectedCallback() {
    this.voiceEnabled = getVoiceEnabled();
    this.grammarMode = getSignLanguage() === 'MAKATON' ? 'makaton' : 'bsl-natural';
    this.render();
    this.bindDomEvents();
    this.subscribeStores();
    this.startAnimationLoop();
  }

  disconnectedCallback() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.unsubscribeSpeech?.();
    this.unsubscribeVoice?.();
    this.unsubscribeSignLang?.();
    if (this.pipWindow) {
      this.pipWindow.close();
      this.pipWindow = null;
    }
  }

  private createRestPose(): BslHandPose {
    return {
      letter: 'REST',
      label: 'Neutral Resting Hand',
      rule: 'Hands rest relaxed in ready signing posture',
      isVowel: false,
      targetTip: { x: 28, y: 44, z: 16 },
      targetKnuckle: { x: 42, y: 50, z: 14 },
      targetWrist: { x: 58, y: 62, z: 8 },
      baseHandMode: 'rest',
      shape: 'flat',
      palm: 'in',
      ease: 'smooth',
      nmf: { eyebrows: 'neutral', mouth: 'closed', headTilt: 'neutral' },
    };
  }

  private render() {
    this.innerHTML = `
      <div id="bsl-floating-card" class="bsl-interpreter-dock" style="position:fixed; bottom:20px; right:20px; width:340px; background:#020617; border:1.5px solid #1e293b; border-radius:12px; box-shadow:0 20px 40px -8px rgba(0,0,0,0.7); z-index:9995; overflow:hidden; font-family:system-ui, -apple-system, sans-serif; display:flex; flex-direction:column; user-select:none; pointer-events:auto;">
        
        <!-- Header Bar / Drag Handle -->
        <div id="bsl-header-bar" style="background:#0f172a; padding:8px 12px; border-bottom:1px solid #1e293b; display:flex; align-items:center; justify-content:space-between; cursor:grab;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:0.95rem;">🧏</span>
            <span style="font-size:0.75rem; font-weight:800; color:#38bdf8; letter-spacing:0.5px;">BSL LEVEL 6 &amp; MAKATON</span>
          </div>
          <div style="display:flex; align-items:center; gap:4px;">
            <button type="button" id="bsl-btn-pov" style="background:#1e293b; border:1px solid #334155; color:#cbd5e1; border-radius:4px; font-size:0.68rem; font-weight:700; padding:2px 6px; cursor:pointer;" title="Toggle Camera POV (Receiver Front / Signer 1P)">
              POV: Front
            </button>
            <button type="button" id="bsl-btn-voice" style="background:${this.voiceEnabled ? '#0284c7' : '#1e293b'}; border:1px solid ${this.voiceEnabled ? '#38bdf8' : '#334155'}; color:#f8fafc; border-radius:4px; font-size:0.68rem; font-weight:700; padding:2px 6px; cursor:pointer;" title="Speech Narration Audio Toggle">
              ${this.voiceEnabled ? '🔊 Audio' : '🔇 Mute'}
            </button>
            <button type="button" id="bsl-btn-redock" style="background:#1e293b; border:1px solid #334155; color:#cbd5e1; border-radius:4px; font-size:0.68rem; font-weight:700; padding:2px 6px; cursor:pointer;" title="Dock avatar back to bottom right corner">
              ⚓ Dock
            </button>
            <button type="button" id="bsl-btn-pip" style="background:#1e293b; border:1px solid #334155; color:#38bdf8; border-radius:4px; font-size:0.75rem; font-weight:700; padding:2px 6px; cursor:pointer;" title="Pop-out Window (Document Picture-in-Picture)">
              ⧉
            </button>
            <button type="button" id="bsl-btn-close" style="background:#1e293b; border:1px solid #334155; color:#94a3b8; border-radius:4px; font-size:0.75rem; font-weight:700; padding:2px 6px; cursor:pointer;" title="Close BSL Interpreter">
              ✕
            </button>
          </div>
        </div>

        <!-- Stage Container Hosting Live Avatar Wrapper -->
        <div id="bsl-stage-container" style="background:#020617; position:relative; width:100%; height:320px; display:flex; flex-direction:column; overflow:hidden;">
          
          <div id="bsl-avatar-wrapper" style="width:100%; height:100%; display:flex; flex-direction:column; position:relative;">
            
            <!-- SVG Avatar 60 FPS Viewport -->
            <div style="flex:1; width:100%; position:relative; overflow:hidden; background:radial-gradient(circle at 50% 40%, #0f172a 0%, #020617 100%);">
              <svg id="bsl-avatar-svg" viewBox="0 0 240 240" style="width:100%; height:100%; display:block; shape-rendering:geometricPrecision;">
                <defs>
                  <linearGradient id="bsl-skin-base" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#fee2cd" />
                    <stop offset="60%" stop-color="#f8be93" />
                    <stop offset="100%" stop-color="#e99e6c" />
                  </linearGradient>
                  <linearGradient id="bsl-skin-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#e99e6c" />
                    <stop offset="100%" stop-color="#cb7c49" />
                  </linearGradient>
                  <linearGradient id="bsl-hair-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#2a2523" />
                    <stop offset="50%" stop-color="#1f1a18" />
                    <stop offset="100%" stop-color="#141110" />
                  </linearGradient>
                  <linearGradient id="bsl-shirt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#273549" />
                    <stop offset="50%" stop-color="#1e293b" />
                    <stop offset="100%" stop-color="#0f172a" />
                  </linearGradient>
                  <linearGradient id="bsl-lip-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#e27c73" />
                    <stop offset="100%" stop-color="#c9564c" />
                  </linearGradient>
                  <radialGradient id="bsl-iris-grad" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stop-color="#38bdf8" />
                    <stop offset="45%" stop-color="#0284c7" />
                    <stop offset="100%" stop-color="#0c4a6e" />
                  </radialGradient>
                  <linearGradient id="bsl-hand-dominant" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffedd5" />
                    <stop offset="60%" stop-color="#fed7aa" />
                    <stop offset="100%" stop-color="#fba66c" />
                  </linearGradient>
                  <linearGradient id="bsl-hand-base" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffedd5" />
                    <stop offset="60%" stop-color="#fed7aa" />
                    <stop offset="100%" stop-color="#fba66c" />
                  </linearGradient>
                  <filter id="bsl-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="bsl-shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.35" />
                  </filter>
                </defs>

                <!-- 1. Background Spatial Loci Register Grid -->
                <g id="bsl-layer-loci" opacity="0.25"></g>

                <!-- 2. Torso, Shoulders & Neck -->
                <g id="bsl-layer-body"></g>

                <!-- 3. Head & Facial NMF Rig (Eyebrows, Eyes, Mouth morphemes) -->
                <g id="bsl-layer-head"></g>

                <!-- 4. Non-Dominant Base Hand (Left) -->
                <g id="bsl-layer-base-hand"></g>

                <!-- 5. Dominant Hand (Right) -->
                <g id="bsl-layer-dominant-hand"></g>
              </svg>

              <!-- In-Stage HUD Telemetry -->
              <div style="position:absolute; top:6px; left:8px; pointer-events:none; display:flex; flex-direction:column; gap:2px;">
                <span id="bsl-hud-gloss" style="background:rgba(2,132,199,0.85); color:#ffffff; font-size:0.65rem; font-weight:800; padding:1px 5px; border-radius:3px; letter-spacing:0.5px; text-transform:uppercase;">
                  GLOSS: READY
                </span>
                <span id="bsl-hud-nmf" style="background:rgba(15,23,42,0.8); border:1px solid #334155; color:#94a3b8; font-size:0.58rem; padding:1px 4px; border-radius:3px;">
                  NMF: Neutral
                </span>
              </div>

              <div style="position:absolute; top:6px; right:8px; pointer-events:none; text-align:right; display:flex; flex-direction:column; gap:2px;">
                <span id="bsl-hud-mode" style="background:rgba(15,23,42,0.8); border:1px solid #1e293b; color:#38bdf8; font-size:0.58rem; font-weight:700; padding:1px 4px; border-radius:3px;">
                  ${this.grammarMode === 'makaton' ? 'MAKATON' : 'BSL L6'}
                </span>
                <span id="bsl-hud-cl" style="background:rgba(15,23,42,0.8); border:1px solid #334155; color:#a855f7; font-size:0.58rem; padding:1px 4px; border-radius:3px;">
                  CL: NONE
                </span>
              </div>
            </div>

            <!-- Bottom Interactive Deck -->
            <div style="background:#090d16; border-top:1px solid #1e293b; padding:8px 10px; display:flex; flex-direction:column; gap:6px;">
              <!-- Mode selector & Quick Pills -->
              <div style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
                <select id="bsl-select-mode" style="background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.68rem; padding:3px 6px; border-radius:4px; cursor:pointer;">
                  <option value="bsl-natural" ${this.grammarMode === 'bsl-natural' ? 'selected' : ''}>BSL L6 (Natural OSV)</option>
                  <option value="makaton" ${this.grammarMode === 'makaton' ? 'selected' : ''}>Makaton (Key Word)</option>
                  <option value="fingerspell" ${this.grammarMode === 'fingerspell' ? 'selected' : ''}>Fingerspelling (A–Z)</option>
                </select>

                <div id="bsl-quick-pills" style="display:flex; gap:3px; overflow-x:auto; padding-bottom:2px; max-width:180px;">
                  ${this.getQuickPillsMarkup()}
                </div>
              </div>

              <!-- Live Text Input -->
              <form id="bsl-text-form" style="display:flex; gap:4px; margin:0;">
                <input type="text" id="bsl-text-input" placeholder="Type words or sign sentence..." style="flex:1; background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.75rem; padding:4px 8px; border-radius:4px; outline:none;" />
                <button type="submit" style="background:#0284c7; border:none; color:#ffffff; font-size:0.72rem; font-weight:700; padding:4px 10px; border-radius:4px; cursor:pointer;">
                  Sign
                </button>
              </form>
            </div>

          </div>

        </div>
      </div>
    `;

    this.stageHostContainer = this.querySelector('#bsl-stage-container');
    this.avatarWrapper = this.querySelector('#bsl-avatar-wrapper');
  }

  private getQuickPillsMarkup(): string {
    const words =
      this.grammarMode === 'makaton'
        ? ['EAT', 'DRINK', 'HELP', 'PLEASE', 'THANK YOU', 'MORE']
        : ['PRAY', 'CHURCH', 'SCIENCE', 'WHAT', 'EQUAL'];
    return words
      .map(
        (w) =>
          `<button type="button" class="bsl-pill-btn" data-word="${w}" style="background:#1e293b; border:1px solid #334155; color:${
            this.grammarMode === 'makaton' ? '#34d399' : '#38bdf8'
          }; font-size:0.6rem; padding:2px 5px; border-radius:3px; cursor:pointer; white-space:nowrap;">${w}</button>`
      )
      .join('');
  }

  private bindQuickPillListeners() {
    const pillsRoot = this.queryAvatarElement('#bsl-quick-pills');
    const btns = pillsRoot ? pillsRoot.querySelectorAll<HTMLButtonElement>('.bsl-pill-btn') : this.querySelectorAll<HTMLButtonElement>('.bsl-pill-btn');
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const word = btn.getAttribute('data-word');
        if (word) this.processUtterance(word, true);
      });
    });
  }

  private applyModeUI(mode: BslGrammarMode) {
    this.grammarMode = mode;
    const hudMode = this.queryAvatarElement<HTMLSpanElement>('#bsl-hud-mode');
    if (hudMode) {
      hudMode.textContent =
        mode === 'bsl-natural' ? 'BSL L6' : mode === 'makaton' ? 'MAKATON' : 'SPELLING';
      hudMode.style.color = mode === 'makaton' ? '#34d399' : '#38bdf8';
    }
    const selectMode = this.queryAvatarElement<HTMLSelectElement>('#bsl-select-mode');
    if (selectMode && selectMode.value !== mode) {
      selectMode.value = mode;
    }
    const pillsRoot = this.queryAvatarElement<HTMLElement>('#bsl-quick-pills');
    if (pillsRoot) {
      pillsRoot.innerHTML = this.getQuickPillsMarkup();
      this.bindQuickPillListeners();
    }
  }

  private bindDomEvents() {
    // POV toggle
    const btnPov = this.querySelector<HTMLButtonElement>('#bsl-btn-pov');
    btnPov?.addEventListener('click', () => {
      this.cameraMode = this.cameraMode === 'receiver' ? 'signer' : 'receiver';
      this.orbitYawOffset = 0;
      this.orbitPitchOffset = 0;
      if (btnPov) {
        btnPov.textContent = this.cameraMode === 'receiver' ? 'POV: Front' : 'POV: Signer';
      }
    });

    // 360-degree drag-to-orbit on Avatar SVG viewport (double-click to reset)
    const avatarSvg = this.querySelector<SVGSVGElement>('#bsl-avatar-svg');
    if (avatarSvg) {
      let orbiting = false;
      let startX = 0;
      let startY = 0;
      let baseYaw = 0;
      let basePitch = 0;
      avatarSvg.style.cursor = 'grab';
      avatarSvg.addEventListener('pointerdown', (e) => {
        orbiting = true;
        startX = e.clientX;
        startY = e.clientY;
        baseYaw = this.orbitYawOffset;
        basePitch = this.orbitPitchOffset;
        avatarSvg.style.cursor = 'grabbing';
        avatarSvg.setPointerCapture?.(e.pointerId);
      });
      avatarSvg.addEventListener('pointermove', (e) => {
        if (!orbiting) return;
        this.orbitYawOffset = baseYaw + (e.clientX - startX) * 0.65;
        this.orbitPitchOffset = Math.max(-45, Math.min(45, basePitch + (e.clientY - startY) * 0.45));
      });
      const stopOrbit = () => {
        if (orbiting) {
          orbiting = false;
          avatarSvg.style.cursor = 'grab';
        }
      };
      avatarSvg.addEventListener('pointerup', stopOrbit);
      avatarSvg.addEventListener('pointercancel', stopOrbit);
      avatarSvg.addEventListener('dblclick', () => {
        this.orbitYawOffset = 0;
        this.orbitPitchOffset = 0;
      });
    }

    // Voice toggle
    const btnVoice = this.querySelector<HTMLButtonElement>('#bsl-btn-voice');
    btnVoice?.addEventListener('click', () => {
      toggleVoice();
    });

    // PiP Pop-out Window
    const btnPip = this.querySelector<HTMLButtonElement>('#bsl-btn-pip');
    btnPip?.addEventListener('click', () => this.toggleDocumentPiP());

    // Close
    const btnClose = this.querySelector<HTMLButtonElement>('#bsl-btn-close');
    btnClose?.addEventListener('click', () => {
      setBslEnabled(false);
    });

    // Mode select (synchronizes Makaton / BSL choice with global store)
    const selectMode = this.querySelector<HTMLSelectElement>('#bsl-select-mode');
    selectMode?.addEventListener('change', (e) => {
      const nextMode = (e.target as HTMLSelectElement).value as BslGrammarMode;
      this.applyModeUI(nextMode);
      if (nextMode === 'makaton') {
        setSignLanguage('MAKATON');
      } else if (nextMode === 'bsl-natural') {
        setSignLanguage('BSL');
      }
    });

    // Quick Pill Buttons (manual user intent -> speaks audio if voice and sound enabled)
    this.bindQuickPillListeners();

    // Text Input Form (manual user intent -> speaks audio if voice and sound enabled)
    const textForm = this.querySelector<HTMLFormElement>('#bsl-text-form');
    const textInput = this.querySelector<HTMLInputElement>('#bsl-text-input');
    textForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = textInput?.value.trim();
      if (val) {
        this.processUtterance(val, true);
        if (textInput) textInput.value = '';
      }
    });

    // Make floating card draggable with safe viewport boundary clamping
    const floatingCard = this.querySelector<HTMLElement>('#bsl-floating-card');
    const headerBar = this.querySelector<HTMLElement>('#bsl-header-bar');
    if (floatingCard && headerBar) {
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let initialLeft = 0;
      let initialTop = 0;

      headerBar.addEventListener('mousedown', (e) => {
        if ((e.target as HTMLElement).tagName === 'BUTTON') return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = floatingCard.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        floatingCard.style.bottom = 'auto';
        floatingCard.style.right = 'auto';
        floatingCard.style.left = `${initialLeft}px`;
        floatingCard.style.top = `${initialTop}px`;
        headerBar.style.cursor = 'grabbing';
      });

      // Quick re-dock to bottom right corner
      const btnRedock = this.querySelector<HTMLButtonElement>('#bsl-btn-redock');
      btnRedock?.addEventListener('click', () => {
        floatingCard.style.bottom = '20px';
        floatingCard.style.right = '20px';
        floatingCard.style.left = 'auto';
        floatingCard.style.top = 'auto';
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const cardW = floatingCard.offsetWidth || 340;
        const maxLeft = Math.max(10, window.innerWidth - cardW - 10);
        const maxTop = Math.max(50, window.innerHeight - 100);
        const clampedLeft = Math.max(10, Math.min(maxLeft, initialLeft + dx));
        const clampedTop = Math.max(50, Math.min(maxTop, initialTop + dy));
        floatingCard.style.left = `${clampedLeft}px`;
        floatingCard.style.top = `${clampedTop}px`;
      });

      window.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          headerBar.style.cursor = 'grab';
        }
      });
    }
  }

  private subscribeStores() {
    this.unsubscribeVoice = subscribeVoice((enabled) => {
      this.voiceEnabled = enabled;
      const btnVoice = this.querySelector<HTMLButtonElement>('#bsl-btn-voice');
      if (btnVoice) {
        btnVoice.textContent = enabled ? '🔊 Audio' : '🔇 Mute';
        btnVoice.style.background = enabled ? '#0284c7' : '#1e293b';
        btnVoice.style.borderColor = enabled ? '#38bdf8' : '#334155';
      }
    });

    this.unsubscribeSignLang = subscribeSignLanguage((code) => {
      if (code === 'MAKATON' && this.grammarMode !== 'makaton') {
        this.applyModeUI('makaton');
      } else if (code === 'BSL' && this.grammarMode === 'makaton') {
        this.applyModeUI('bsl-natural');
      }
    });

    this.unsubscribeSpeech = subscribeBslSpeech((payload: BslSpeechPayload) => {
      if (payload.subtitle) {
        if (payload.subtitle !== this.lastSpokenSubtitle) {
          this.lastSpokenSubtitle = payload.subtitle;
          this.processUtterance(payload.subtitle, false);
        }
      } else if (payload.word) {
        // Highlighting current spoken word boundary in HUD without resetting the sentence queue
        const hudGloss = this.queryAvatarElement('#bsl-hud-gloss');
        if (hudGloss) {
          hudGloss.textContent = `WORD: ${payload.word.toUpperCase()}`;
        }
        if (!this.lastSpokenSubtitle && this.isIdle) {
          this.processUtterance(payload.word, false);
        }
      }
      if (payload.isSpeaking === false) {
        this.lastSpokenSubtitle = '';
      }
    });
  }

  /**
   * Safe element resolver that queries within both the local custom element
   * and the detached Picture-in-Picture window so animations and HUD updates
   * never fail or disconnect when undocked.
   */
  private queryAvatarElement<T extends Element = HTMLElement>(selector: string): T | null {
    if (this.avatarWrapper) {
      const el = this.avatarWrapper.querySelector<T>(selector);
      if (el) return el;
    }
    if (this.pipWindow && this.pipWindow.document) {
      const el = this.pipWindow.document.querySelector<T>(selector);
      if (el) return el;
    }
    return this.querySelector<T>(selector);
  }

  /**
   * Parses natural text through the BSL Level 6 grammar engine / Makaton lexicon
   * and queues 3D skeletal keyframe trajectories.
   */
  public processUtterance(text: string, speakAudio: boolean = false) {
    if (!text || typeof text !== 'string') return;
    const cleanText = text.trim();
    if (!cleanText) return;

    // Optional audio narration via Web Speech API (only if explicitly requested by manual user action,
    // and both voice narration and master sound are active)
    if (speakAudio && this.voiceEnabled && isSoundEnabled() && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[BSL Interpreter] Speech synthesis error:', err);
      }
    }

    // Linguistic Grammar Analysis (BSL Level 6 / Makaton / Fingerspelling)
    const analysis: BslGrammarAnalysis = analyzeAndTransformBslGrammar(cleanText, this.grammarMode);

    this.currentGloss = analysis.glossSequence || cleanText.toUpperCase();
    this.currentSentenceType = analysis.sentenceType.toUpperCase();
    this.currentNmfText = `Eyebrows: ${analysis.nmfSummary.eyebrows} | Mouth: ${analysis.nmfSummary.mouthCue || 'natural'} | Head: ${analysis.nmfSummary.headTilt}`;

    // Update HUD
    const hudGloss = this.queryAvatarElement('#bsl-hud-gloss');
    if (hudGloss) hudGloss.textContent = `GLOSS: ${this.currentGloss.slice(0, 24)}`;

    const hudNmf = this.queryAvatarElement('#bsl-hud-nmf');
    if (hudNmf) hudNmf.textContent = this.currentNmfText;

    // Check if classifier is active
    const clToken = analysis.tokens.find((t) => t.role === 'classifier-predicate' || t.classifier);
    if (clToken && clToken.classifier) {
      this.activeClassifierText = `CL: ${clToken.classifier.type} (${clToken.aspect || 'normal'})`;
    } else {
      this.activeClassifierText = 'CL: NONE';
    }
    const hudCl = this.queryAvatarElement('#bsl-hud-cl');
    if (hudCl) hudCl.textContent = this.activeClassifierText;

    // Queue keyframe poses
    if (analysis.stream && analysis.stream.length > 0) {
      this.poseQueue = [...analysis.stream];
      this.isIdle = false;
      this.advanceToNextPose();
    }
  }

  private advanceToNextPose() {
    if (this.poseQueue.length === 0) {
      // Transition smoothly back to neutral rest pose
      this.targetPose = this.createRestPose();
      this.currentPoseDuration = 450;
      this.currentPoseStartTime = performance.now();
      this.holdRemaining = 0;
      this.isIdle = true;
      return;
    }

    this.currentPose = { ...this.targetPose };
    this.targetPose = this.poseQueue.shift()!;
    this.currentPoseDuration = this.targetPose.hold ? Math.max(300, this.targetPose.hold + 200) : 480;
    this.currentPoseStartTime = performance.now();
    this.holdRemaining = this.targetPose.hold || 80;
    this.isIdle = false;

    const hudGloss = this.queryAvatarElement('#bsl-hud-gloss');
    if (hudGloss) {
      hudGloss.textContent = `SIGN: ${this.targetPose.label || this.targetPose.letter}`;
    }
  }

  /**
   * Main 60 FPS Skeletal Kinematic Animation Loop.
   * Dynamically tracks PiP window vs main window requestAnimationFrame.
   */
  private startAnimationLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    const loop = (now: number) => {
      this.updateAvatar(now);
      const raf = (this.pipWindow && typeof this.pipWindow.requestAnimationFrame === 'function')
        ? this.pipWindow.requestAnimationFrame.bind(this.pipWindow)
        : window.requestAnimationFrame.bind(window);
      this.animationFrameId = raf(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private updateAvatar(now: number) {
    const svg = this.queryAvatarElement<SVGSVGElement>('#bsl-avatar-svg');
    if (!svg) return;

    // Advance timeline interpolation
    let progress = 1.0;
    if (this.currentPoseDuration > 0) {
      const elapsed = now - this.currentPoseStartTime;
      progress = Math.min(1.0, elapsed / this.currentPoseDuration);
    }
    this.currentAnimProgress = progress;

    const easeType = this.targetPose.ease || 'smooth';
    const easeT = evaluateBslEase(easeType, progress);

    if (progress >= 1.0 && !this.isIdle) {
      if (this.holdRemaining > 0) {
        this.holdRemaining -= 16.6;
      } else {
        this.advanceToNextPose();
      }
    }

    // Interpolate current dominant hand skeletal target vectors
    const tip = interpolatePoint3D(this.currentPose.targetTip, this.targetPose.targetTip, easeT);
    const knuckle = interpolatePoint3D(this.currentPose.targetKnuckle, this.targetPose.targetKnuckle, easeT);
    const wrist = interpolatePoint3D(this.currentPose.targetWrist, this.targetPose.targetWrist, easeT);

    const activeShape = this.targetPose.shape || 'flat';
    const activePalm = this.targetPose.palm || 'in';
    const activeNmf = this.targetPose.nmf || { eyebrows: 'neutral', mouth: 'closed', headTilt: 'neutral' };

    // Authentic BSL & Makaton Base Mode Resolution:
    // Respect explicit 'rest' (one-handed signs such as EAT, DRINK, GOD, SUN, MUM) without forcing vowel-board!
    let baseMode: BslBaseHandMode = this.targetPose.baseHandMode || 'rest';
    if (!this.targetPose.baseHandMode) {
      const letter = this.targetPose.letter;
      if (this.targetPose.isVowel || (letter && letter.length === 1 && letter >= 'A' && letter <= 'Z')) {
        baseMode = (letter === 'B' || letter === 'W') ? 'mirror' : letter === 'G' ? 'base-hold' : 'vowel-board';
      } else if (!this.isIdle) {
        const wordClean = (this.targetPose.label || '').toUpperCase();
        if (
          wordClean.includes('PRAY') || wordClean.includes('CHURCH') || wordClean.includes('EQUAL') ||
          wordClean.includes('WHAT') || wordClean.includes('SCIENCE') || wordClean.includes('BIBLE') ||
          wordClean.includes('FORCE') || wordClean.includes('PEACE') || wordClean.includes('LOVE')
        ) {
          baseMode = 'mirror';
        } else {
          baseMode = 'rest';
        }
      } else {
        baseMode = 'rest';
      }
    }

    const cam = this.cameraConfigs[this.cameraMode];
    const originX = 120;
    const originY = 120;

    // Natural blinking logic
    if (now > this.nextBlinkTime) {
      this.eyeBlinkProgress = 1.0;
      this.nextBlinkTime = now + 2500 + Math.random() * 3000;
    }
    if (this.eyeBlinkProgress > 0) {
      this.eyeBlinkProgress = Math.max(0, this.eyeBlinkProgress - 0.12);
    }

    // Role-shift torso yaw + 360-degree user drag orbit offsets
    const roleYaw = activeNmf.roleShift?.yaw || 0;
    const rolePitch = activeNmf.roleShift?.elevation === 'high' ? -4 : activeNmf.roleShift?.elevation === 'low' ? 4 : 0;
    const activeCam = {
      yaw: cam.yaw + (this.cameraMode === 'receiver' ? -roleYaw : roleYaw) + this.orbitYawOffset,
      pitch: cam.pitch + rolePitch + this.orbitPitchOffset,
      distance: cam.distance,
      fov: cam.fov,
    };

    // Render Layers
    this.renderLociLayer(activeCam, originX, originY);
    this.renderBodyLayer(activeCam, originX, originY);
    this.renderHeadLayer(activeCam, originX, originY, activeNmf);
    this.renderBaseHandLayer(activeCam, originX, originY, baseMode, wrist, knuckle, tip, activeShape, activePalm);
    this.renderDominantHandLayer(activeCam, originX, originY, wrist, knuckle, tip, activeShape, activePalm);
  }

  private renderLociLayer(cam: any, ox: number, oy: number) {
    const lociGroup = this.queryAvatarElement('#bsl-layer-loci');
    if (!lociGroup) return;

    // Draw subtle 3D spatial register coordinates
    const loci = [
      DEFAULT_BSL_LOCI.LOCUS_A,
      DEFAULT_BSL_LOCI.LOCUS_B,
      DEFAULT_BSL_LOCI.LOCUS_HIGH,
      DEFAULT_BSL_LOCI.LOCUS_LOW,
      DEFAULT_BSL_LOCI.ME,
      DEFAULT_BSL_LOCI.YOU,
    ];

    let html = '';
    for (const loc of loci) {
      const p = project3DToSvg(loc.coords, cam, ox, oy);
      if (p.scale > 0) {
        html += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2" fill="#38bdf8" />`;
      }
    }
    lociGroup.innerHTML = html;
  }

  private renderBodyLayer(cam: any, ox: number, oy: number) {
    const bodyGroup = this.queryAvatarElement('#bsl-layer-body');
    if (!bodyGroup) return;

    // Anatomical Shoulder & Trapezius Slope Invariants:
    // Shoulders slope down from chest (-24 to -15), bi-acromial span = 112 (-56 to +56)
    const pNeckBase = project3DToSvg({ x: 0, y: -24, z: 0 }, cam, ox, oy);
    const pLeftShoulder = project3DToSvg({ x: -56, y: -15, z: 0 }, cam, ox, oy);
    const pRightShoulder = project3DToSvg({ x: 56, y: -15, z: 0 }, cam, ox, oy);
    const pWaistLeft = project3DToSvg({ x: -44, y: 75, z: -10 }, cam, ox, oy);
    const pWaistRight = project3DToSvg({ x: 44, y: 75, z: -10 }, cam, ox, oy);

    // Anatomical Elbows & Arms
    const pLeftElbow = project3DToSvg({ x: -68, y: 35, z: -5 }, cam, ox, oy);
    const pRightElbow = project3DToSvg({ x: 68, y: 35, z: -5 }, cam, ox, oy);

    // Torso silhouette with soft athletic waist taper
    const torsoPath = `M ${pLeftShoulder.x.toFixed(1)} ${pLeftShoulder.y.toFixed(1)}
      Q ${pNeckBase.x.toFixed(1)} ${(pNeckBase.y + 4).toFixed(1)} ${pRightShoulder.x.toFixed(1)} ${pRightShoulder.y.toFixed(1)}
      L ${(pRightShoulder.x - 2).toFixed(1)} ${(pRightShoulder.y + 28).toFixed(1)}
      L ${pWaistRight.x.toFixed(1)} ${pWaistRight.y.toFixed(1)}
      L ${pWaistLeft.x.toFixed(1)} ${pWaistLeft.y.toFixed(1)}
      L ${(pLeftShoulder.x + 2).toFixed(1)} ${(pLeftShoulder.y + 28).toFixed(1)} Z`;

    // Crew neckline & Clavicle (Collarbone) contours
    const collarPath = `M ${(pNeckBase.x - 14).toFixed(1)} ${(pNeckBase.y - 7).toFixed(1)}
      Q ${pNeckBase.x.toFixed(1)} ${(pNeckBase.y + 9).toFixed(1)} ${(pNeckBase.x + 14).toFixed(1)} ${(pNeckBase.y - 7).toFixed(1)}`;

    const clavicleLeft = `M ${(pNeckBase.x - 3).toFixed(1)} ${(pNeckBase.y + 11).toFixed(1)}
      Q ${(pLeftShoulder.x + 26).toFixed(1)} ${(pLeftShoulder.y + 4).toFixed(1)} ${(pLeftShoulder.x + 10).toFixed(1)} ${(pLeftShoulder.y + 6).toFixed(1)}`;
    const clavicleRight = `M ${(pNeckBase.x + 3).toFixed(1)} ${(pNeckBase.y + 11).toFixed(1)}
      Q ${(pRightShoulder.x - 26).toFixed(1)} ${(pRightShoulder.y + 4).toFixed(1)} ${(pRightShoulder.x - 10).toFixed(1)} ${(pRightShoulder.y + 6).toFixed(1)}`;

    // Left and Right Upper Arm Sleeves
    const leftSleeve = `M ${pLeftShoulder.x.toFixed(1)} ${pLeftShoulder.y.toFixed(1)}
      L ${pLeftElbow.x.toFixed(1)} ${pLeftElbow.y.toFixed(1)}
      L ${(pLeftElbow.x + 14).toFixed(1)} ${(pLeftElbow.y - 3).toFixed(1)}
      L ${(pLeftShoulder.x + 12).toFixed(1)} ${(pLeftShoulder.y + 26).toFixed(1)} Z`;

    const rightSleeve = `M ${pRightShoulder.x.toFixed(1)} ${pRightShoulder.y.toFixed(1)}
      L ${(pRightShoulder.x - 12).toFixed(1)} ${(pRightShoulder.y + 26).toFixed(1)}
      L ${(pRightElbow.x - 14).toFixed(1)} ${(pRightElbow.y - 3).toFixed(1)}
      L ${pRightElbow.x.toFixed(1)} ${pRightElbow.y.toFixed(1)} Z`;

    bodyGroup.innerHTML = `
      <!-- Upper Arm Sleeves -->
      <path d="${leftSleeve}" fill="#162032" stroke="#0f172a" stroke-width="1.2" />
      <path d="${rightSleeve}" fill="#162032" stroke="#0f172a" stroke-width="1.2" />
      
      <!-- Torso Interpreter Top -->
      <path d="${torsoPath}" fill="url(#bsl-shirt-grad)" stroke="#334155" stroke-width="1.5" />
      
      <!-- Clavicle / Collarbone Accents -->
      <path d="${clavicleLeft}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.4" stroke-linecap="round" />
      <path d="${clavicleRight}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.4" stroke-linecap="round" />

      <!-- Suprasternal Notch (Neck pit) -->
      <ellipse cx="${pNeckBase.x.toFixed(1)}" cy="${(pNeckBase.y + 11).toFixed(1)}" rx="2.5" ry="1.5" fill="rgba(0,0,0,0.3)" />

      <!-- Neckline Ribbing -->
      <path d="${collarPath}" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
    `;
  }

  private renderHeadLayer(cam: any, ox: number, oy: number, nmf: BslNmf) {
    const headGroup = this.queryAvatarElement('#bsl-layer-head');
    if (!headGroup) return;

    // Head center at y = -72, chin at y = -46, neck span = 22 units (~ 1/3 head proportion invariant)
    const tiltModX =
      nmf.headTilt === 'shake'
        ? Math.sin(this.currentAnimProgress * Math.PI * 3.5) * 6.5
        : nmf.headTilt === 'tilt-left'
        ? -6
        : nmf.headTilt === 'tilt-right'
        ? 6
        : 0;
    const tiltModY =
      nmf.headTilt === 'nod' ? Math.sin(this.currentAnimProgress * Math.PI * 2) * 4.5 : 0;
    const pHead = project3DToSvg({ x: tiltModX, y: -72 + tiltModY, z: 0 }, cam, ox, oy);
    const pNeck = project3DToSvg({ x: tiltModX * 0.5, y: -36 + tiltModY * 0.5, z: 0 }, cam, ox, oy);
    const pChin = project3DToSvg({ x: tiltModX, y: -46 + tiltModY, z: 0 }, cam, ox, oy);

    const s = pHead.scale;
    const headRadius = 21 * s;

    // 1. Ears (Left and Right)
    const earY = pHead.y + 2;
    const earW = 5.5 * s;
    const earH = 11 * s;
    const leftEar = `M ${(pHead.x - headRadius + 1).toFixed(1)} ${(earY - earH * 0.5).toFixed(1)}
      C ${(pHead.x - headRadius - earW).toFixed(1)} ${(earY - earH * 0.4).toFixed(1)} ${(pHead.x - headRadius - earW).toFixed(1)} ${(earY + earH * 0.4).toFixed(1)} ${(pHead.x - headRadius + 2).toFixed(1)} ${(earY + earH * 0.5).toFixed(1)} Z`;
    const rightEar = `M ${(pHead.x + headRadius - 1).toFixed(1)} ${(earY - earH * 0.5).toFixed(1)}
      C ${(pHead.x + headRadius + earW).toFixed(1)} ${(earY - earH * 0.4).toFixed(1)} ${(pHead.x + headRadius + earW).toFixed(1)} ${(earY + earH * 0.4).toFixed(1)} ${(pHead.x + headRadius - 2).toFixed(1)} ${(earY + earH * 0.5).toFixed(1)} Z`;

    // 2. Anatomical Neck & Sternocleidomastoid
    const neckTopW = 11 * s;
    const neckBaseW = 14 * s;
    const neckPath = `M ${(pNeck.x - neckTopW).toFixed(1)} ${(pHead.y + 10).toFixed(1)}
      L ${(pNeck.x - neckBaseW).toFixed(1)} ${(pNeck.y + 13).toFixed(1)}
      L ${(pNeck.x + neckBaseW).toFixed(1)} ${(pNeck.y + 13).toFixed(1)}
      L ${(pNeck.x + neckTopW).toFixed(1)} ${(pHead.y + 10).toFixed(1)} Z`;

    // 3. Realistic Contoured Head & Jawline (Cranium tapering to defined chin)
    const craniumTop = pHead.y - headRadius * 1.05;
    const cheekY = pHead.y + 4;
    const jawY = pHead.y + 17;
    const chinPt = pChin.y;

    const faceContour = `M ${pHead.x.toFixed(1)} ${craniumTop.toFixed(1)}
      C ${(pHead.x + headRadius * 1.05).toFixed(1)} ${craniumTop.toFixed(1)} ${(pHead.x + headRadius * 1.02).toFixed(1)} ${cheekY.toFixed(1)} ${(pHead.x + headRadius * 0.88).toFixed(1)} ${jawY.toFixed(1)}
      C ${(pHead.x + headRadius * 0.65).toFixed(1)} ${(jawY + 7).toFixed(1)} ${(pHead.x + 6).toFixed(1)} ${chinPt.toFixed(1)} ${pHead.x.toFixed(1)} ${chinPt.toFixed(1)}
      C ${(pHead.x - 6).toFixed(1)} ${chinPt.toFixed(1)} ${(pHead.x - headRadius * 0.65).toFixed(1)} ${(jawY + 7).toFixed(1)} ${(pHead.x - headRadius * 0.88).toFixed(1)} ${jawY.toFixed(1)}
      C ${(pHead.x - headRadius * 1.02).toFixed(1)} ${cheekY.toFixed(1)} ${(pHead.x - headRadius * 1.05).toFixed(1)} ${craniumTop.toFixed(1)} ${pHead.x.toFixed(1)} ${craniumTop.toFixed(1)} Z`;

    // 4. Hair (Styled professional interpreter crop)
    const hairCap = `M ${(pHead.x - headRadius * 1.08).toFixed(1)} ${cheekY.toFixed(1)}
      C ${(pHead.x - headRadius * 1.15).toFixed(1)} ${(craniumTop - 5).toFixed(1)} ${(pHead.x + headRadius * 1.15).toFixed(1)} ${(craniumTop - 5).toFixed(1)} ${(pHead.x + headRadius * 1.08).toFixed(1)} ${cheekY.toFixed(1)}
      C ${(pHead.x + headRadius * 0.95).toFixed(1)} ${(pHead.y - 4).toFixed(1)} ${(pHead.x + headRadius * 0.4).toFixed(1)} ${(pHead.y - 12).toFixed(1)} ${(pHead.x - 2).toFixed(1)} ${(pHead.y - 11).toFixed(1)}
      C ${(pHead.x - headRadius * 0.5).toFixed(1)} ${(pHead.y - 10).toFixed(1)} ${(pHead.x - headRadius * 0.9).toFixed(1)} ${(pHead.y - 2).toFixed(1)} ${(pHead.x - headRadius * 1.08).toFixed(1)} ${cheekY.toFixed(1)} Z`;

    // 5. Eyebrows & Forehead Creases
    const eyebrowDelta = nmf.eyebrows === 'raised' ? -6.5 : nmf.eyebrows === 'furrowed' ? 3.5 : 0;
    const browY = pHead.y - 5.5 + eyebrowDelta;
    const browAngle = nmf.eyebrows === 'furrowed' ? 5 : nmf.eyebrows === 'raised' ? -2 : 0;

    let foreheadCrease = '';
    if (nmf.eyebrows === 'raised') {
      foreheadCrease = `
        <path d="M ${(pHead.x - 12).toFixed(1)} ${(browY - 6).toFixed(1)} Q ${pHead.x.toFixed(1)} ${(browY - 8).toFixed(1)} ${(pHead.x + 12).toFixed(1)} ${(browY - 6).toFixed(1)}" stroke="rgba(203,124,73,0.35)" stroke-width="1" fill="none" />
      `;
    } else if (nmf.eyebrows === 'furrowed') {
      foreheadCrease = `
        <line x1="${(pHead.x - 2).toFixed(1)}" y1="${(browY - 3).toFixed(1)}" x2="${(pHead.x - 2).toFixed(1)}" y2="${(browY + 4).toFixed(1)}" stroke="rgba(203,124,73,0.45)" stroke-width="1.2" />
        <line x1="${(pHead.x + 2).toFixed(1)}" y1="${(browY - 3).toFixed(1)}" x2="${(pHead.x + 2).toFixed(1)}" y2="${(browY + 4).toFixed(1)}" stroke="rgba(203,124,73,0.45)" stroke-width="1.2" />
      `;
    }

    // 6. Eyes & Eyelids (Almond contours with Iris, Pupil, and Sclera)
    const eyeH = Math.max(0.4, 3.4 * (1 - this.eyeBlinkProgress));
    const eyeLX = pHead.x - 8.5 * s;
    const eyeRX = pHead.x + 8.5 * s;
    const eyeY = pHead.y + 2;

    const eyeContourL = `M ${(eyeLX - 6).toFixed(1)} ${eyeY.toFixed(1)}
      Q ${eyeLX.toFixed(1)} ${(eyeY - eyeH * 1.1).toFixed(1)} ${(eyeLX + 6).toFixed(1)} ${eyeY.toFixed(1)}
      Q ${eyeLX.toFixed(1)} ${(eyeY + eyeH * 1.1).toFixed(1)} ${(eyeLX - 6).toFixed(1)} ${eyeY.toFixed(1)} Z`;

    const eyeContourR = `M ${(eyeRX - 6).toFixed(1)} ${eyeY.toFixed(1)}
      Q ${eyeRX.toFixed(1)} ${(eyeY - eyeH * 1.1).toFixed(1)} ${(eyeRX + 6).toFixed(1)} ${eyeY.toFixed(1)}
      Q ${eyeRX.toFixed(1)} ${(eyeY + eyeH * 1.1).toFixed(1)} ${(eyeRX - 6).toFixed(1)} ${eyeY.toFixed(1)} Z`;

    // 7. Nose (Bridge, tip bulb, and nostrils)
    const noseBridgeY = pHead.y - 1;
    const noseTipY = pHead.y + 9;
    const noseSvg = `
      <!-- Nose Bridge & Shadow -->
      <path d="M ${(pHead.x - 1.5).toFixed(1)} ${noseBridgeY.toFixed(1)} L ${(pHead.x - 1.8).toFixed(1)} ${(noseTipY - 2).toFixed(1)} Q ${(pHead.x - 4).toFixed(1)} ${noseTipY.toFixed(1)} ${pHead.x.toFixed(1)} ${(noseTipY + 1).toFixed(1)} Q ${(pHead.x + 4).toFixed(1)} ${noseTipY.toFixed(1)} ${(pHead.x + 1.8).toFixed(1)} ${(noseTipY - 2).toFixed(1)}" fill="none" stroke="#d99564" stroke-width="1.2" stroke-linecap="round" />
      <!-- Nostril accents -->
      <circle cx="${(pHead.x - 3).toFixed(1)}" cy="${noseTipY.toFixed(1)}" r="1" fill="#cb7c49" />
      <circle cx="${(pHead.x + 3).toFixed(1)}" cy="${noseTipY.toFixed(1)}" r="1" fill="#cb7c49" />
    `;

    // 8. Realistic Mouth Morphemes & Contoured Lips
    let mouthSvg = '';
    const mY = pHead.y + 17;
    const mouthType = nmf.mouth || 'closed';

    if (mouthType === 'open') {
      mouthSvg = `
        <ellipse cx="${pHead.x.toFixed(1)}" cy="${mY.toFixed(1)}" rx="7.5" ry="4.5" fill="#140a08" stroke="#d99564" stroke-width="1" />
        <rect x="${(pHead.x - 4.5).toFixed(1)}" y="${(mY - 3).toFixed(1)}" width="9" height="2.5" fill="#ffffff" rx="1" />
        <ellipse cx="${pHead.x.toFixed(1)}" cy="${(mY + 2.5).toFixed(1)}" rx="4.5" ry="1.8" fill="#e07a70" />
      `;
    } else if (mouthType === 'puffed-cheeks') {
      mouthSvg = `
        <!-- Volumetric Cheek Puffs -->
        <circle cx="${(pHead.x - 14).toFixed(1)}" cy="${(mY - 2).toFixed(1)}" r="6" fill="#f8be93" opacity="0.6" filter="url(#bsl-glow)" />
        <circle cx="${(pHead.x + 14).toFixed(1)}" cy="${(mY - 2).toFixed(1)}" r="6" fill="#f8be93" opacity="0.6" filter="url(#bsl-glow)" />
        <path d="M ${(pHead.x - 7).toFixed(1)} ${mY.toFixed(1)} Q ${pHead.x.toFixed(1)} ${(mY - 1).toFixed(1)} ${(pHead.x + 7).toFixed(1)} ${mY.toFixed(1)}" stroke="#c9564c" stroke-width="2.5" stroke-linecap="round" fill="none" />
      `;
    } else if (mouthType === 'pursed' || mouthType === 'round') {
      mouthSvg = `
        <ellipse cx="${pHead.x.toFixed(1)}" cy="${mY.toFixed(1)}" rx="4.5" ry="4" fill="url(#bsl-lip-grad)" stroke="#9f372d" stroke-width="1" />
        <circle cx="${pHead.x.toFixed(1)}" cy="${mY.toFixed(1)}" r="2" fill="#140a08" />
      `;
    } else if (mouthType === 'tight-lips' || mouthType === 'mm') {
      mouthSvg = `
        <line x1="${(pHead.x - 8).toFixed(1)}" y1="${mY.toFixed(1)}" x2="${(pHead.x + 8).toFixed(1)}" y2="${mY.toFixed(1)}" stroke="#c9564c" stroke-width="2.2" stroke-linecap="round" />
        <!-- Lower lip crease -->
        <path d="M ${(pHead.x - 4).toFixed(1)} ${(mY + 3.5).toFixed(1)} Q ${pHead.x.toFixed(1)} ${(mY + 4.5).toFixed(1)} ${(pHead.x + 4).toFixed(1)} ${(mY + 3.5).toFixed(1)}" stroke="#d99564" stroke-width="1.2" fill="none" />
      `;
    } else if (mouthType === 'th') {
      mouthSvg = `
        <!-- Upper teeth & tongue tip -->
        <ellipse cx="${pHead.x.toFixed(1)}" cy="${mY.toFixed(1)}" rx="6.5" ry="3.5" fill="#140a08" stroke="#d99564" stroke-width="1" />
        <rect x="${(pHead.x - 4).toFixed(1)}" y="${(mY - 2.5).toFixed(1)}" width="8" height="2.2" fill="#ffffff" rx="0.5" />
        <ellipse cx="${pHead.x.toFixed(1)}" cy="${(mY + 1).toFixed(1)}" rx="4.5" ry="2" fill="#f43f5e" />
      `;
    } else if (mouthType === 'f-mouth') {
      mouthSvg = `
        <path d="M ${(pHead.x - 7).toFixed(1)} ${(mY - 1).toFixed(1)} Q ${pHead.x.toFixed(1)} ${(mY + 1).toFixed(1)} ${(pHead.x + 7).toFixed(1)} ${(mY - 1).toFixed(1)}" stroke="#c9564c" stroke-width="1.6" fill="none" />
        <rect x="${(pHead.x - 4).toFixed(1)}" y="${(mY - 2).toFixed(1)}" width="8" height="2" fill="#ffffff" rx="0.6" />
        <path d="M ${(pHead.x - 5).toFixed(1)} ${(mY + 1).toFixed(1)} Q ${pHead.x.toFixed(1)} ${(mY + 3.2).toFixed(1)} ${(pHead.x + 5).toFixed(1)} ${(mY + 1).toFixed(1)}" stroke="#e27c73" stroke-width="2" stroke-linecap="round" fill="none" />
      `;
    } else if (mouthType === 'smile') {
      mouthSvg = `
        <path d="M ${(pHead.x - 8).toFixed(1)} ${(mY - 1).toFixed(1)} Q ${pHead.x.toFixed(1)} ${(mY + 6).toFixed(1)} ${(pHead.x + 8).toFixed(1)} ${(mY - 1).toFixed(1)} Z" fill="url(#bsl-lip-grad)" stroke="#c9564c" stroke-width="1" />
        <path d="M ${(pHead.x - 5).toFixed(1)} ${(mY + 0.5).toFixed(1)} Q ${pHead.x.toFixed(1)} ${(mY + 2.5).toFixed(1)} ${(pHead.x + 5).toFixed(1)} ${(mY + 0.5).toFixed(1)}" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" />
        <!-- Smile dimple creases -->
        <line x1="${(pHead.x - 9).toFixed(1)}" y1="${(mY - 2).toFixed(1)}" x2="${(pHead.x - 8).toFixed(1)}" y2="${mY.toFixed(1)}" stroke="#d99564" stroke-width="1" />
        <line x1="${(pHead.x + 9).toFixed(1)}" y1="${(mY - 2).toFixed(1)}" x2="${(pHead.x + 8).toFixed(1)}" y2="${mY.toFixed(1)}" stroke="#d99564" stroke-width="1" />
      `;
    } else if (!this.isIdle && mouthType !== 'closed' && mouthType !== 'neutral') {
      // Dynamic lexical lip articulation during active BSL / Makaton word mouthing
      const pulse = Math.abs(Math.sin(this.currentAnimProgress * Math.PI * 2));
      const openRy = 1.4 + pulse * 2.2;
      mouthSvg = `
        <ellipse cx="${pHead.x.toFixed(1)}" cy="${mY.toFixed(1)}" rx="6.2" ry="${openRy.toFixed(1)}" fill="#26100d" stroke="#c9564c" stroke-width="1.3" />
        <ellipse cx="${pHead.x.toFixed(1)}" cy="${(mY - openRy * 0.4).toFixed(1)}" rx="3.8" ry="0.9" fill="#ffffff" opacity="0.85" />
      `;
    } else {
      // Natural resting lips with Cupid's bow
      mouthSvg = `
        <!-- Cupid's bow upper lip -->
        <path d="M ${(pHead.x - 7).toFixed(1)} ${mY.toFixed(1)} Q ${(pHead.x - 3.5).toFixed(1)} ${(mY - 1.8).toFixed(1)} ${pHead.x.toFixed(1)} ${(mY - 0.5).toFixed(1)} Q ${(pHead.x + 3.5).toFixed(1)} ${(mY - 1.8).toFixed(1)} ${(pHead.x + 7).toFixed(1)} ${mY.toFixed(1)}" stroke="#c9564c" stroke-width="1.8" stroke-linecap="round" fill="none" />
        <!-- Lower lip fullness -->
        <path d="M ${(pHead.x - 5).toFixed(1)} ${(mY + 0.5).toFixed(1)} Q ${pHead.x.toFixed(1)} ${(mY + 3.8).toFixed(1)} ${(pHead.x + 5).toFixed(1)} ${(mY + 0.5).toFixed(1)}" stroke="#e27c73" stroke-width="2" stroke-linecap="round" fill="none" />
        <!-- Under-lip shadow indentation -->
        <path d="M ${(pHead.x - 3.5).toFixed(1)} ${(mY + 5.5).toFixed(1)} Q ${pHead.x.toFixed(1)} ${(mY + 6.2).toFixed(1)} ${(pHead.x + 3.5).toFixed(1)} ${(mY + 5.5).toFixed(1)}" stroke="#d99564" stroke-width="1" fill="none" />
      `;
    }

    headGroup.innerHTML = `
      <!-- Ears -->
      <path d="${leftEar}" fill="url(#bsl-skin-base)" stroke="#d99564" stroke-width="1" />
      <path d="${rightEar}" fill="url(#bsl-skin-base)" stroke="#d99564" stroke-width="1" />

      <!-- Neck -->
      <path d="${neckPath}" fill="url(#bsl-skin-base)" stroke="#d99564" stroke-width="1" />
      <!-- Sternocleidomastoid muscle shadow lines -->
      <line x1="${(pNeck.x - 6).toFixed(1)}" y1="${(pHead.y + 11).toFixed(1)}" x2="${(pNeck.x - 2).toFixed(1)}" y2="${(pNeck.y + 12).toFixed(1)}" stroke="#d99564" stroke-width="1" opacity="0.4" />
      <line x1="${(pNeck.x + 6).toFixed(1)}" y1="${(pHead.y + 11).toFixed(1)}" x2="${(pNeck.x + 2).toFixed(1)}" y2="${(pNeck.y + 12).toFixed(1)}" stroke="#d99564" stroke-width="1" opacity="0.4" />

      <!-- Cranium & Face Contour -->
      <path d="${faceContour}" fill="url(#bsl-skin-base)" stroke="#d99564" stroke-width="1.4" filter="url(#bsl-shadow)" />

      <!-- Hair Cap -->
      <path d="${hairCap}" fill="url(#bsl-hair-grad)" stroke="#0f172a" stroke-width="1.2" />

      <!-- Forehead Expression Creases -->
      ${foreheadCrease}

      <!-- Eyebrows (Tapered natural arches) -->
      <path d="M ${(pHead.x - 14.5).toFixed(1)} ${(browY + browAngle + 1).toFixed(1)} Q ${(pHead.x - 9).toFixed(1)} ${(browY - 1).toFixed(1)} ${(pHead.x - 3).toFixed(1)} ${browY.toFixed(1)}" stroke="#2a2523" stroke-width="2.6" stroke-linecap="round" fill="none" />
      <path d="M ${(pHead.x + 3).toFixed(1)} ${browY.toFixed(1)} Q ${(pHead.x + 9).toFixed(1)} ${(browY - 1).toFixed(1)} ${(pHead.x + 14.5).toFixed(1)} ${(browY + browAngle + 1).toFixed(1)}" stroke="#2a2523" stroke-width="2.6" stroke-linecap="round" fill="none" />

      <!-- Left Eye -->
      <path d="${eyeContourL}" fill="#f8fafc" stroke="#1c1917" stroke-width="1" />
      <circle cx="${eyeLX.toFixed(1)}" cy="${eyeY.toFixed(1)}" r="2.8" fill="url(#bsl-iris-grad)" />
      <circle cx="${eyeLX.toFixed(1)}" cy="${eyeY.toFixed(1)}" r="1.4" fill="#090d16" />
      <circle cx="${(eyeLX - 0.9).toFixed(1)}" cy="${(eyeY - 0.9).toFixed(1)}" r="0.7" fill="#ffffff" />

      <!-- Right Eye -->
      <path d="${eyeContourR}" fill="#f8fafc" stroke="#1c1917" stroke-width="1" />
      <circle cx="${eyeRX.toFixed(1)}" cy="${eyeY.toFixed(1)}" r="2.8" fill="url(#bsl-iris-grad)" />
      <circle cx="${eyeRX.toFixed(1)}" cy="${eyeY.toFixed(1)}" r="1.4" fill="#090d16" />
      <circle cx="${(eyeRX - 0.9).toFixed(1)}" cy="${(eyeY - 0.9).toFixed(1)}" r="0.7" fill="#ffffff" />

      <!-- Upper Eyelid / Lash Liners -->
      <path d="M ${(eyeLX - 6.5).toFixed(1)} ${eyeY.toFixed(1)} Q ${eyeLX.toFixed(1)} ${(eyeY - eyeH * 1.3).toFixed(1)} ${(eyeLX + 6.5).toFixed(1)} ${eyeY.toFixed(1)}" stroke="#1c1917" stroke-width="1.4" fill="none" />
      <path d="M ${(eyeRX - 6.5).toFixed(1)} ${eyeY.toFixed(1)} Q ${eyeRX.toFixed(1)} ${(eyeY - eyeH * 1.3).toFixed(1)} ${(eyeRX + 6.5).toFixed(1)} ${eyeY.toFixed(1)}" stroke="#1c1917" stroke-width="1.4" fill="none" />

      <!-- Nose -->
      ${noseSvg}

      <!-- Mouth -->
      ${mouthSvg}
    `;
  }

  private renderBaseHandLayer(
    cam: any,
    ox: number,
    oy: number,
    mode: BslBaseHandMode,
    wrist: Point3D,
    knuckle: Point3D,
    tip: Point3D,
    activeShape: any,
    activePalm: any
  ) {
    const baseGroup = this.queryAvatarElement('#bsl-layer-base-hand');
    if (!baseGroup) return;

    // 1. Bilateral Symmetrical Kinematics (PRAY, CHURCH, EQUAL, WHAT, SCIENCE, BIBLE, etc.)
    if (mode === 'mirror') {
      const solvedDom = solveHandKinematics(wrist, knuckle, tip, activeShape, activePalm);

      // Anatomical sagittal mirror (x -> -x) reflects the dominant right hand into an authentic left hand
      const pForearm = project3DToSvg({ x: -solvedDom.forearm.x, y: solvedDom.forearm.y, z: solvedDom.forearm.z }, cam, ox, oy);
      const pWrist = project3DToSvg({ x: -solvedDom.wrist.x, y: solvedDom.wrist.y, z: solvedDom.wrist.z }, cam, ox, oy);
      const pPalm = project3DToSvg({ x: -solvedDom.palm.x, y: solvedDom.palm.y, z: solvedDom.palm.z }, cam, ox, oy);
      const pKnuckleIndex = project3DToSvg({ x: -solvedDom.knuckleIndex.x, y: solvedDom.knuckleIndex.y, z: solvedDom.knuckleIndex.z }, cam, ox, oy);
      const pTipIndex = project3DToSvg({ x: -solvedDom.tipIndex.x, y: solvedDom.tipIndex.y, z: solvedDom.tipIndex.z }, cam, ox, oy);
      const pTipMid = project3DToSvg({ x: -solvedDom.tipMid.x, y: solvedDom.tipMid.y, z: solvedDom.tipMid.z }, cam, ox, oy);
      const pTipRing = project3DToSvg({ x: -solvedDom.tipRing.x, y: solvedDom.tipRing.y, z: solvedDom.tipRing.z }, cam, ox, oy);
      const pTipPinky = project3DToSvg({ x: -solvedDom.tipPinky.x, y: solvedDom.tipPinky.y, z: solvedDom.tipPinky.z }, cam, ox, oy);
      const pThumbTip = project3DToSvg({ x: -solvedDom.thumbTip.x, y: solvedDom.thumbTip.y, z: solvedDom.thumbTip.z }, cam, ox, oy);
      const pThumbKnuckle = project3DToSvg({ x: -solvedDom.thumbKnuckle.x, y: solvedDom.thumbKnuckle.y, z: solvedDom.thumbKnuckle.z }, cam, ox, oy);

      baseGroup.innerHTML = `
        <!-- Mirrored Base Forearm in Natural Skin Tone -->
        <line x1="${pForearm.x.toFixed(1)}" y1="${pForearm.y.toFixed(1)}" x2="${pWrist.x.toFixed(1)}" y2="${pWrist.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="10" stroke-linecap="round" />
        
        <!-- Mirrored Wrist to Palm Cushion -->
        <line x1="${pWrist.x.toFixed(1)}" y1="${pWrist.y.toFixed(1)}" x2="${pPalm.x.toFixed(1)}" y2="${pPalm.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="9" stroke-linecap="round" />
        <ellipse cx="${pPalm.x.toFixed(1)}" cy="${pPalm.y.toFixed(1)}" rx="10" ry="8.5" fill="url(#bsl-hand-base)" stroke="#cb7c49" stroke-width="1.4" />
        
        <!-- Mirrored Thumb -->
        <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pThumbKnuckle.x.toFixed(1)}" y2="${pThumbKnuckle.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4.8" stroke-linecap="round" />
        <line x1="${pThumbKnuckle.x.toFixed(1)}" y1="${pThumbKnuckle.y.toFixed(1)}" x2="${pThumbTip.x.toFixed(1)}" y2="${pThumbTip.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4" stroke-linecap="round" />
        <circle cx="${pThumbTip.x.toFixed(1)}" cy="${pThumbTip.y.toFixed(1)}" r="3" fill="#ffedd5" stroke="#cb7c49" stroke-width="1" />

        <!-- Mirrored Index Finger -->
        <line x1="${pKnuckleIndex.x.toFixed(1)}" y1="${pKnuckleIndex.y.toFixed(1)}" x2="${pTipIndex.x.toFixed(1)}" y2="${pTipIndex.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="5.2" stroke-linecap="round" />
        <circle cx="${pKnuckleIndex.x.toFixed(1)}" cy="${pKnuckleIndex.y.toFixed(1)}" r="2.8" fill="#f8be93" />
        <circle cx="${pTipIndex.x.toFixed(1)}" cy="${pTipIndex.y.toFixed(1)}" r="3.5" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" filter="url(#bsl-glow)" />

        <!-- Mirrored Secondary Fingers (Mid, Ring, Pinky) -->
        <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipMid.x.toFixed(1)}" y2="${pTipMid.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4.2" stroke-linecap="round" />
        <circle cx="${pTipMid.x.toFixed(1)}" cy="${pTipMid.y.toFixed(1)}" r="2.5" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />

        <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipRing.x.toFixed(1)}" y2="${pTipRing.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="3.8" stroke-linecap="round" />
        <circle cx="${pTipRing.x.toFixed(1)}" cy="${pTipRing.y.toFixed(1)}" r="2.3" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />

        <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipPinky.x.toFixed(1)}" y2="${pTipPinky.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="3.2" stroke-linecap="round" />
        <circle cx="${pTipPinky.x.toFixed(1)}" cy="${pTipPinky.y.toFixed(1)}" r="2" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />
      `;
      return;
    }

    // 2. BANZSL Two-Handed Manual Alphabet / Vowel Board ('vowel-board')
    if (mode === 'vowel-board') {
      const pForearm = project3DToSvg({ x: -78, y: 95, z: -5 }, cam, ox, oy);
      const pWrist = project3DToSvg(BSL_BASE_HAND.wrist, cam, ox, oy);
      const pPalm = project3DToSvg(BSL_BASE_HAND.palm, cam, ox, oy);

      let fingersSvg = '';
      BSL_BASE_HAND.fingertips.forEach((tipPt, idx) => {
        const pTip = project3DToSvg(tipPt, cam, ox, oy);
        const isTarget = this.targetPose.isVowel && this.targetPose.activeVowelIndex === idx;
        const color = isTarget ? '#f59e0b' : '#38bdf8';
        fingersSvg += `
          <!-- Articulated finger segment from palm to tip -->
          <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTip.x.toFixed(1)}" y2="${pTip.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4.8" stroke-linecap="round" />
          <!-- Fingertip vowel pad / target anchor -->
          <circle cx="${pTip.x.toFixed(1)}" cy="${pTip.y.toFixed(1)}" r="${isTarget ? '5.4' : '4'}" fill="${color}" stroke="#ffffff" stroke-width="1.2" filter="${isTarget ? 'url(#bsl-glow)' : 'none'}" />
          <circle cx="${pTip.x.toFixed(1)}" cy="${pTip.y.toFixed(1)}" r="1.5" fill="#ffffff" />
        `;
      });

      baseGroup.innerHTML = `
        <!-- Base Forearm Limb -->
        <line x1="${pForearm.x.toFixed(1)}" y1="${pForearm.y.toFixed(1)}" x2="${pWrist.x.toFixed(1)}" y2="${pWrist.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="9.5" stroke-linecap="round" />
        <line x1="${pWrist.x.toFixed(1)}" y1="${pWrist.y.toFixed(1)}" x2="${pPalm.x.toFixed(1)}" y2="${pPalm.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="8.5" stroke-linecap="round" />
        
        <!-- Non-Dominant Base Palm ("Paper" Vowel Board) -->
        <ellipse cx="${pPalm.x.toFixed(1)}" cy="${pPalm.y.toFixed(1)}" rx="11.5" ry="9.5" fill="url(#bsl-hand-base)" stroke="#cb7c49" stroke-width="1.5" />
        <path d="M ${(pPalm.x - 5).toFixed(1)} ${pPalm.y.toFixed(1)} Q ${pPalm.x.toFixed(1)} ${(pPalm.y + 3).toFixed(1)} ${(pPalm.x + 5).toFixed(1)} ${pPalm.y.toFixed(1)}" stroke="#d99564" stroke-width="1" fill="none" />
        
        <!-- 5 Articulated Vowel/Consonant Base Fingertips -->
        ${fingersSvg}
      `;
      return;
    }

    // 3. Base Workbench Anchor ('base-hold')
    if (mode === 'base-hold') {
      const baseForearm: Point3D = { x: -80, y: 75, z: 0 };
      const baseWrist: Point3D = { x: -65, y: 55, z: 10 };
      const baseHoldAnchor: Point3D = { x: -45, y: 35, z: 15 };
      const pF = project3DToSvg(baseForearm, cam, ox, oy);
      const pW = project3DToSvg(baseWrist, cam, ox, oy);
      const pP = project3DToSvg(baseHoldAnchor, cam, ox, oy);
      
      // Horizontal extended digits forming workbench
      const pFingers = project3DToSvg({ x: -25, y: 32, z: 15 }, cam, ox, oy);

      baseGroup.innerHTML = `
        <line x1="${pF.x.toFixed(1)}" y1="${pF.y.toFixed(1)}" x2="${pW.x.toFixed(1)}" y2="${pW.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="9.5" stroke-linecap="round" />
        <line x1="${pW.x.toFixed(1)}" y1="${pW.y.toFixed(1)}" x2="${pP.x.toFixed(1)}" y2="${pP.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="8.5" stroke-linecap="round" />
        
        <!-- Workbench Base Palm Cushion -->
        <ellipse cx="${pP.x.toFixed(1)}" cy="${pP.y.toFixed(1)}" rx="12" ry="7.5" fill="url(#bsl-hand-base)" stroke="#0284c7" stroke-width="1.8" />
        
        <!-- Flat horizontal workbench fingers -->
        <line x1="${pP.x.toFixed(1)}" y1="${pP.y.toFixed(1)}" x2="${pFingers.x.toFixed(1)}" y2="${pFingers.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="6.5" stroke-linecap="round" />
        <circle cx="${pFingers.x.toFixed(1)}" cy="${pFingers.y.toFixed(1)}" r="3" fill="#ffedd5" stroke="#cb7c49" stroke-width="1" />
      `;
      return;
    }

    // 3b. Override spatial anchor & Level 6 Discourse Buoys ('override', 'buoy-list', 'buoy-pointer')
    if (mode === 'override' || mode === 'buoy-list' || mode === 'buoy-pointer') {
      const ov = this.targetPose.baseHandOverride;
      const anchorPalm: Point3D = ov?.palm || {
        x: BSL_BASE_HAND.palm.x + (ov?.shiftX || 0),
        y: BSL_BASE_HAND.palm.y + (ov?.shiftY || 0),
        z: BSL_BASE_HAND.palm.z + (ov?.shiftZ || 10),
      };
      const anchorWrist: Point3D = ov?.wrist || {
        x: anchorPalm.x - 16,
        y: anchorPalm.y + 34,
        z: anchorPalm.z - 8,
      };
      const anchorForearm: Point3D = { x: anchorWrist.x - 22, y: anchorWrist.y + 28, z: anchorWrist.z - 12 };
      const pF = project3DToSvg(anchorForearm, cam, ox, oy);
      const pW = project3DToSvg(anchorWrist, cam, ox, oy);
      const pP = project3DToSvg(anchorPalm, cam, ox, oy);

      const buoyCount = mode === 'buoy-pointer' ? 1 : this.targetPose.buoy?.count || 3;
      let digitsSvg = '';
      for (let d = 0; d < Math.min(4, buoyCount); d++) {
        const fingerOffset = (d - 1.5) * 9;
        const pD = project3DToSvg(
          { x: anchorPalm.x + fingerOffset, y: anchorPalm.y - 26, z: anchorPalm.z + 6 },
          cam,
          ox,
          oy
        );
        digitsSvg += `
          <line x1="${pP.x.toFixed(1)}" y1="${pP.y.toFixed(1)}" x2="${pD.x.toFixed(1)}" y2="${pD.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4.4" stroke-linecap="round" />
          <circle cx="${pD.x.toFixed(1)}" cy="${pD.y.toFixed(1)}" r="2.8" fill="#38bdf8" stroke="#ffffff" stroke-width="1" />
        `;
      }

      baseGroup.innerHTML = `
        <line x1="${pF.x.toFixed(1)}" y1="${pF.y.toFixed(1)}" x2="${pW.x.toFixed(1)}" y2="${pW.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="9.5" stroke-linecap="round" />
        <line x1="${pW.x.toFixed(1)}" y1="${pW.y.toFixed(1)}" x2="${pP.x.toFixed(1)}" y2="${pP.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="8.5" stroke-linecap="round" />
        <ellipse cx="${pP.x.toFixed(1)}" cy="${pP.y.toFixed(1)}" rx="11" ry="8.5" fill="url(#bsl-hand-base)" stroke="#0284c7" stroke-width="1.5" />
        ${digitsSvg}
      `;
      return;
    }

    // 4. Two-Handed Ready Rest Posture ('rest')
    // Symmetrical resting posture in the lower signing space (mid-chest / upper abdomen)
    const baseForearm: Point3D = { x: -70, y: 80, z: 0 };
    const baseWrist: Point3D = { x: -55, y: 60, z: 10 };
    const basePalm: Point3D = { x: -40, y: 48, z: 15 };
    const baseTip: Point3D = { x: -28, y: 42, z: 16 };

    const pF = project3DToSvg(baseForearm, cam, ox, oy);
    const pW = project3DToSvg(baseWrist, cam, ox, oy);
    const pP = project3DToSvg(basePalm, cam, ox, oy);
    const pT = project3DToSvg(baseTip, cam, ox, oy);

    baseGroup.innerHTML = `
      <line x1="${pF.x.toFixed(1)}" y1="${pF.y.toFixed(1)}" x2="${pW.x.toFixed(1)}" y2="${pW.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="9" stroke-linecap="round" />
      <line x1="${pW.x.toFixed(1)}" y1="${pW.y.toFixed(1)}" x2="${pP.x.toFixed(1)}" y2="${pP.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="8" stroke-linecap="round" />
      <ellipse cx="${pP.x.toFixed(1)}" cy="${pP.y.toFixed(1)}" rx="9.5" ry="8" fill="url(#bsl-hand-base)" stroke="#cb7c49" stroke-width="1.2" />
      <line x1="${pP.x.toFixed(1)}" y1="${pP.y.toFixed(1)}" x2="${pT.x.toFixed(1)}" y2="${pT.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="5" stroke-linecap="round" />
      <circle cx="${pT.x.toFixed(1)}" cy="${pT.y.toFixed(1)}" r="2.5" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />
    `;
  }

  private renderDominantHandLayer(
    cam: any,
    ox: number,
    oy: number,
    wrist: Point3D,
    knuckle: Point3D,
    tip: Point3D,
    shape: any,
    palm: any
  ) {
    const domGroup = this.queryAvatarElement('#bsl-layer-dominant-hand');
    if (!domGroup) return;

    // Kinematic Hand Solver
    const solved = solveHandKinematics(wrist, knuckle, tip, shape, palm);

    const pForearm = project3DToSvg(solved.forearm, cam, ox, oy);
    const pWrist = project3DToSvg(solved.wrist, cam, ox, oy);
    const pPalm = project3DToSvg(solved.palm, cam, ox, oy);
    const pKnuckleIndex = project3DToSvg(solved.knuckleIndex, cam, ox, oy);
    const pTipIndex = project3DToSvg(solved.tipIndex, cam, ox, oy);
    const pTipMid = project3DToSvg(solved.tipMid, cam, ox, oy);
    const pTipRing = project3DToSvg(solved.tipRing, cam, ox, oy);
    const pTipPinky = project3DToSvg(solved.tipPinky, cam, ox, oy);
    const pThumbTip = project3DToSvg(solved.thumbTip, cam, ox, oy);
    const pThumbKnuckle = project3DToSvg(solved.thumbKnuckle, cam, ox, oy);

    domGroup.innerHTML = `
      <!-- Forearm Limb in Natural Skin Tone -->
      <line x1="${pForearm.x.toFixed(1)}" y1="${pForearm.y.toFixed(1)}" x2="${pWrist.x.toFixed(1)}" y2="${pWrist.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="10" stroke-linecap="round" />
      
      <!-- Wrist to Palm Pad (Thenar & Hypothenar Cushion) -->
      <line x1="${pWrist.x.toFixed(1)}" y1="${pWrist.y.toFixed(1)}" x2="${pPalm.x.toFixed(1)}" y2="${pPalm.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="9" stroke-linecap="round" />
      <ellipse cx="${pPalm.x.toFixed(1)}" cy="${pPalm.y.toFixed(1)}" rx="10" ry="8.5" fill="url(#bsl-hand-dominant)" stroke="#cb7c49" stroke-width="1.4" />
      
      <!-- Thumb (Metacarpal + Phalanx) -->
      <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pThumbKnuckle.x.toFixed(1)}" y2="${pThumbKnuckle.y.toFixed(1)}" stroke="url(#bsl-hand-dominant)" stroke-width="4.8" stroke-linecap="round" />
      <line x1="${pThumbKnuckle.x.toFixed(1)}" y1="${pThumbKnuckle.y.toFixed(1)}" x2="${pThumbTip.x.toFixed(1)}" y2="${pThumbTip.y.toFixed(1)}" stroke="url(#bsl-hand-dominant)" stroke-width="4" stroke-linecap="round" />
      <circle cx="${pThumbTip.x.toFixed(1)}" cy="${pThumbTip.y.toFixed(1)}" r="3" fill="#ffedd5" stroke="#cb7c49" stroke-width="1" />

      <!-- Primary Index Finger (Proximal + Intermediate + Distal Phalanx) -->
      <line x1="${pKnuckleIndex.x.toFixed(1)}" y1="${pKnuckleIndex.y.toFixed(1)}" x2="${pTipIndex.x.toFixed(1)}" y2="${pTipIndex.y.toFixed(1)}" stroke="url(#bsl-hand-dominant)" stroke-width="5.2" stroke-linecap="round" />
      <!-- Knuckle accent -->
      <circle cx="${pKnuckleIndex.x.toFixed(1)}" cy="${pKnuckleIndex.y.toFixed(1)}" r="2.8" fill="#f8be93" />
      <!-- Fingertip pad & nail highlight -->
      <circle cx="${pTipIndex.x.toFixed(1)}" cy="${pTipIndex.y.toFixed(1)}" r="3.5" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" filter="url(#bsl-glow)" />

      <!-- Secondary Fingers (Mid, Ring, Pinky) -->
      <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipMid.x.toFixed(1)}" y2="${pTipMid.y.toFixed(1)}" stroke="url(#bsl-hand-dominant)" stroke-width="4.2" stroke-linecap="round" />
      <circle cx="${pTipMid.x.toFixed(1)}" cy="${pTipMid.y.toFixed(1)}" r="2.5" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />

      <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipRing.x.toFixed(1)}" y2="${pTipRing.y.toFixed(1)}" stroke="url(#bsl-hand-dominant)" stroke-width="3.8" stroke-linecap="round" />
      <circle cx="${pTipRing.x.toFixed(1)}" cy="${pTipRing.y.toFixed(1)}" r="2.3" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />

      <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipPinky.x.toFixed(1)}" y2="${pTipPinky.y.toFixed(1)}" stroke="url(#bsl-hand-dominant)" stroke-width="3.2" stroke-linecap="round" />
      <circle cx="${pTipPinky.x.toFixed(1)}" cy="${pTipPinky.y.toFixed(1)}" r="2" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />
    `;
  }

  /**
   * Native Browser Document Picture-in-Picture Uncoupling
   * Pops out the entire live 60 FPS vector avatar into an always-on-top desktop window.
   */
  public async toggleDocumentPiP() {
    // 1. Feature detection: W3C Document Picture-in-Picture API
    if (!('documentPictureInPicture' in window)) {
      console.warn('[BSL Interpreter] Document Picture-in-Picture is not supported in this browser.');
      const hudNmf = this.queryAvatarElement('#bsl-hud-nmf');
      if (hudNmf) {
        hudNmf.textContent = 'PiP unavailable in this browser (use Drag / POV)';
      }
      return;
    }

    // 2. If already popped out, close PiP and dock back cleanly
    if (this.pipWindow) {
      this.pipWindow.close();
      this.pipWindow = null;
      return;
    }

    try {
      // 3. Request native always-on-top Document PiP window
      this.pipWindow = await (window as any).documentPictureInPicture.requestWindow({
        width: 340,
        height: 480,
        disallowReturnToOpener: false,
      });

      if (!this.pipWindow || !this.avatarWrapper || !this.stageHostContainer) return;

      // 4. Copy styles to PiP window
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = this.pipWindow!.document.createElement('style');
          style.textContent = cssRules;
          this.pipWindow!.document.head.appendChild(style);
        } catch (_) {
          const link = this.pipWindow!.document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.href = (styleSheet as CSSStyleSheet).href || '';
          this.pipWindow!.document.head.appendChild(link);
        }
      });

      // 5. Setup PiP body styles
      this.pipWindow.document.body.style.margin = '0';
      this.pipWindow.document.body.style.padding = '0';
      this.pipWindow.document.body.style.background = '#020617';
      this.pipWindow.document.body.style.color = '#f8fafc';
      this.pipWindow.document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      this.pipWindow.document.body.style.overflow = 'hidden';

      // 5b. Header Bar for PiP window with prominent Dock button
      const pipHeader = this.pipWindow.document.createElement('div');
      pipHeader.style.cssText = 'background:#0f172a; padding:6px 12px; border-bottom:1px solid #1e293b; display:flex; align-items:center; justify-content:space-between; user-select:none;';
      pipHeader.innerHTML = `
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:0.9rem;">🧏</span>
          <span style="font-size:0.72rem; font-weight:800; color:#38bdf8; letter-spacing:0.5px;">BSL IN-VISION (ALWAYS ON TOP)</span>
        </div>
        <button type="button" id="pip-btn-redock" style="background:#0284c7; border:none; color:#ffffff; border-radius:4px; font-size:0.7rem; font-weight:700; padding:2px 8px; cursor:pointer;" title="Dock back to webpage">
          ⚓ Dock to Page
        </button>
      `;
      this.pipWindow.document.body.appendChild(pipHeader);
      pipHeader.querySelector('#pip-btn-redock')?.addEventListener('click', () => {
        if (this.pipWindow) {
          this.pipWindow.close();
        }
      });

      // 6. Transfer live avatar wrapper and re-bind animation loop to PiP
      this.pipWindow.document.body.appendChild(this.avatarWrapper);
      this.startAnimationLoop();

      const pipBtn = this.querySelector<HTMLButtonElement>('#bsl-btn-pip');
      if (pipBtn) {
        pipBtn.style.background = '#0284c7';
        pipBtn.style.color = '#ffffff';
        pipBtn.title = 'Dock BSL Avatar Back Home';
      }

      // 7. Dock back home on PiP window close
      this.pipWindow.addEventListener('pagehide', () => {
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
        if (this.avatarWrapper && this.stageHostContainer) {
          this.stageHostContainer.appendChild(this.avatarWrapper);
        }
        this.pipWindow = null;
        if (pipBtn) {
          pipBtn.style.background = '#1e293b';
          pipBtn.style.color = '#38bdf8';
          pipBtn.title = 'Pop-out Window (Document Picture-in-Picture)';
        }
        this.startAnimationLoop();
      });
    } catch (err) {
      console.error('[BSL Interpreter] Failed to open Document PiP window:', err);
    }
  }
}

// Custom Element Registration
if (!customElements.get('native-bsl-interpreter')) {
  customElements.define('native-bsl-interpreter', NativeBslInterpreterElement);
}

export const NativeBslInterpreter = NativeBslInterpreterElement;
export default NativeBslInterpreterElement;
