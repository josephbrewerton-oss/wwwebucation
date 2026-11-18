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
import { getLocalJson, setLocalJson } from '../services/localStateStore';

type BslDockCorner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

interface BslPipLayoutState {
  mode: 'docked' | 'floating';
  corner: BslDockCorner;
  compact: boolean;
  left?: number;
  top?: number;
}

const BSL_PIP_LAYOUT_STORAGE_KEY = 'stj_bsl_pip_layout';

export class NativeBslInterpreterElement extends HTMLElement {
  // PiP and Window state
  private pipWindow: Window | null = null;
  private stageHostContainer: HTMLElement | null = null;
  private avatarWrapper: HTMLElement | null = null;

  // Speech tracking to avoid restarting on word boundaries
  private lastSpokenSubtitle = '';

  // Camera POV & 360-degree drag orbit offsets + elastic spring-back velocity
  private cameraMode: 'receiver' | 'signer' = 'receiver';
  private isOrbitingAvatar = false;
  private orbitYawOffset = 0;
  private orbitPitchOffset = 0;
  private orbitYawVel = 0;
  private orbitPitchVel = 0;
  private readonly cameraConfigs = {
    receiver: { yaw: 180, pitch: -8, distance: 360, fov: 60 },
    signer: { yaw: 0, pitch: 26, distance: 360, fov: 60 },
  };

  // Grammar & Mode
  private grammarMode: BslGrammarMode = 'bsl-natural';
  private voiceEnabled = true;
  private lastUtteranceText = '';

  // Animation Loop State
  private animationFrameId: number | null = null;
  private animationFrameWindow: Window | null = null;
  private currentPose: BslHandPose;
  private targetPose: BslHandPose;
  private poseQueue: BslHandPose[] = [];
  private currentPoseStartTime = 0;
  private currentPoseDuration = 380; // ms per sign keyframe
  private currentAnimProgress = 1;
  private holdRemaining = 0;
  private isIdle = true;
  private hasResetIdleHud = true;

  // Continuous 3D Joint Tracking for Seamless C0 Spring-Back (Dominant, Base & Torso)
  private liveTip: Point3D = { ...DOMINANT_REST_POSE };
  private liveKnuckle: Point3D = { ...DOMINANT_REST_KNUCKLE };
  private liveWrist: Point3D = { ...DOMINANT_REST_WRIST };
  private liveBaseForearm: Point3D = { x: -66, y: 36, z: -5 };
  private liveBaseWrist: Point3D = { x: -DOMINANT_REST_WRIST.x, y: DOMINANT_REST_WRIST.y, z: DOMINANT_REST_WRIST.z };
  private liveBaseKnuckle: Point3D = { x: -DOMINANT_REST_KNUCKLE.x, y: DOMINANT_REST_KNUCKLE.y, z: DOMINANT_REST_KNUCKLE.z };
  private liveBasePalm: Point3D = { x: -38, y: 54, z: 14 };
  private liveBaseTip: Point3D = { x: -DOMINANT_REST_POSE.x, y: DOMINANT_REST_POSE.y, z: DOMINANT_REST_POSE.z };
  private prevBaseForearm: Point3D = { x: -66, y: 36, z: -5 };
  private prevBaseWrist: Point3D = { x: -DOMINANT_REST_WRIST.x, y: DOMINANT_REST_WRIST.y, z: DOMINANT_REST_WRIST.z };
  private prevBaseKnuckle: Point3D = { x: -DOMINANT_REST_KNUCKLE.x, y: DOMINANT_REST_KNUCKLE.y, z: DOMINANT_REST_KNUCKLE.z };
  private prevBasePalm: Point3D = { x: -38, y: 54, z: 14 };
  private prevBaseTip: Point3D = { x: -DOMINANT_REST_POSE.x, y: DOMINANT_REST_POSE.y, z: DOMINANT_REST_POSE.z };
  private liveRoleYaw = 0;
  private liveRolePitch = 0;
  private prevRoleYaw = 0;
  private prevRolePitch = 0;

  // Active Telemetry
  private currentGloss = 'READY';
  private currentSentenceType = 'STANDBY';
  private currentNmfText = 'Eyebrows: neutral | Mouth: neutral';
  private activeClassifierText = 'CL: NONE';

  // Subscriptions
  private unsubscribeSpeech?: () => void;
  private unsubscribeVoice?: () => void;
  private unsubscribeSignLang?: () => void;

  // PiP Docking & Drag State
  private layoutState: BslPipLayoutState = {
    mode: 'docked',
    corner: 'bottom-right',
    compact: true,
  };
  private isPointerDownHeader = false;
  private isDraggingCard = false;
  private isFloatingPopout = false;
  private activeDragPointerId: number | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragInitialLeft = 0;
  private dragInitialTop = 0;
  private boundPointerMove?: (e: PointerEvent) => void;
  private boundPointerUp?: (e: PointerEvent) => void;
  private boundWindowResize?: () => void;

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
    this.loadSavedLayout();
    this.render();
    this.applyPipLayout();
    this.bindDomEvents();
    this.subscribeStores();
    this.startAnimationLoop();
  }

  disconnectedCallback() {
    this.stopAnimationLoop();
    this.unsubscribeSpeech?.();
    this.unsubscribeVoice?.();
    this.unsubscribeSignLang?.();
    if (this.boundPointerMove) {
      window.removeEventListener('pointermove', this.boundPointerMove);
      this.boundPointerMove = undefined;
    }
    if (this.boundPointerUp) {
      window.removeEventListener('pointerup', this.boundPointerUp);
      window.removeEventListener('pointercancel', this.boundPointerUp);
      this.boundPointerUp = undefined;
    }
    if (this.boundWindowResize) {
      window.removeEventListener('resize', this.boundWindowResize);
      this.boundWindowResize = undefined;
    }
    if (this.pipWindow) {
      this.dockBackFromPiP(true);
    }
  }

  private createRestPose(): BslHandPose {
    return {
      letter: 'REST',
      label: 'Neutral Resting Hand',
      rule: 'Hands rest relaxed in ready signing posture',
      isVowel: false,
      targetTip: { ...DOMINANT_REST_POSE },
      targetKnuckle: { ...DOMINANT_REST_KNUCKLE },
      targetWrist: { ...DOMINANT_REST_WRIST },
      baseHandMode: 'rest',
      shape: 'flat-closed',
      palm: 'in',
      ease: 'spring',
      nmf: { eyebrows: 'neutral', mouth: 'closed', headTilt: 'neutral' },
    };
  }

  private lerpRaw3D(a: Point3D, b: Point3D, t: number): Point3D {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t,
    };
  }

  private loadSavedLayout() {
    const saved = getLocalJson<Partial<BslPipLayoutState>>(BSL_PIP_LAYOUT_STORAGE_KEY);
    if (!saved || typeof saved !== 'object') return;
    const validCorners: BslDockCorner[] = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
    if (saved.corner && validCorners.includes(saved.corner)) {
      this.layoutState.corner = saved.corner;
    }
    if (typeof saved.compact === 'boolean') {
      this.layoutState.compact = saved.compact;
    }
    if (
      saved.mode === 'floating' &&
      typeof saved.left === 'number' &&
      Number.isFinite(saved.left) &&
      typeof saved.top === 'number' &&
      Number.isFinite(saved.top)
    ) {
      this.layoutState.mode = 'floating';
      this.layoutState.left = saved.left;
      this.layoutState.top = saved.top;
    } else {
      this.layoutState.mode = 'docked';
    }
  }

  private saveLayout() {
    setLocalJson(BSL_PIP_LAYOUT_STORAGE_KEY, this.layoutState);
  }

  private computeClampedFloatingCoords(rawLeft: number, rawTop: number): { left: number; top: number } {
    const isCompact = this.layoutState.compact;
    const cardW = isCompact ? 224 : 300;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 720;
    const maxLeft = Math.max(8, vw - cardW - 8);
    const maxTop = Math.max(56, vh - 160);
    return {
      left: Math.max(8, Math.min(maxLeft, rawLeft)),
      top: Math.max(56, Math.min(maxTop, rawTop)),
    };
  }

  private applyPipLayout() {
    const floatingCard = this.querySelector<HTMLElement>('#bsl-floating-card');
    const stageContainer = this.querySelector<HTMLElement>('#bsl-stage-container');
    const pipDockedNotice = this.querySelector<HTMLElement>('#bsl-pip-docked-notice');
    const deck = this.queryAvatarElement<HTMLElement>('#bsl-interactive-deck');
    const titleEl = this.querySelector<HTMLElement>('#bsl-header-title');
    const povBtn = this.querySelector<HTMLButtonElement>('#bsl-btn-pov');
    const voiceBtn = this.querySelector<HTMLButtonElement>('#bsl-btn-voice');
    const compactBtn = this.querySelector<HTMLButtonElement>('#bsl-btn-compact');
    const redockBtn = this.querySelector<HTMLButtonElement>('#bsl-btn-redock');

    const isCompact = this.layoutState.compact;
    const isPoppedOut = Boolean(this.pipWindow && !this.pipWindow.closed);
    const cardW = isCompact ? 224 : 300;
    const stageH = isCompact ? 210 : 308;

    if (floatingCard) {
      floatingCard.style.width = `${cardW}px`;
      floatingCard.setAttribute('data-dock-corner', this.layoutState.mode === 'floating' ? 'floating' : this.layoutState.corner);

      if (this.layoutState.mode === 'floating' && typeof this.layoutState.left === 'number' && typeof this.layoutState.top === 'number') {
        const clamped = this.computeClampedFloatingCoords(this.layoutState.left, this.layoutState.top);
        this.layoutState.left = clamped.left;
        this.layoutState.top = clamped.top;
        floatingCard.style.left = `${clamped.left}px`;
        floatingCard.style.top = `${clamped.top}px`;
        floatingCard.style.right = 'auto';
        floatingCard.style.bottom = 'auto';
      } else {
        const c = this.layoutState.corner;
        const topOffset = 74;
        const edgeOffset = 12;
        if (c === 'top-left') {
          floatingCard.style.top = `${topOffset}px`;
          floatingCard.style.left = `${edgeOffset}px`;
          floatingCard.style.right = 'auto';
          floatingCard.style.bottom = 'auto';
        } else if (c === 'top-right') {
          floatingCard.style.top = `${topOffset}px`;
          floatingCard.style.right = `${edgeOffset}px`;
          floatingCard.style.left = 'auto';
          floatingCard.style.bottom = 'auto';
        } else if (c === 'bottom-left') {
          floatingCard.style.bottom = `${edgeOffset}px`;
          floatingCard.style.left = `${edgeOffset}px`;
          floatingCard.style.top = 'auto';
          floatingCard.style.right = 'auto';
        } else {
          floatingCard.style.bottom = `${edgeOffset}px`;
          floatingCard.style.right = `${edgeOffset}px`;
          floatingCard.style.top = 'auto';
          floatingCard.style.left = 'auto';
        }
      }
    }

    if (stageContainer) {
      stageContainer.style.display = isPoppedOut ? 'none' : 'flex';
      stageContainer.style.height = `${stageH}px`;
    }
    if (pipDockedNotice) {
      pipDockedNotice.style.display = isPoppedOut ? 'flex' : 'none';
    }
    if (deck) {
      deck.style.display = (isCompact && !isPoppedOut) ? 'none' : 'flex';
    }
    if (titleEl) {
      const isMakaton = this.grammarMode === 'makaton';
      const isSpell = this.grammarMode === 'fingerspell';
      titleEl.textContent = isMakaton
        ? (isCompact ? '🤝 MAKATON' : '🤝 MAKATON (KEY WORD)')
        : isSpell
        ? (isCompact ? '🔤 A–Z' : '🔤 FINGERSPELLING')
        : (isCompact ? '🇬🇧 BSL L6' : '🇬🇧 BSL LEVEL 6 (OSV)');
      titleEl.style.color = isMakaton ? '#34d399' : isSpell ? '#fbbf24' : '#38bdf8';
      titleEl.style.borderColor = isMakaton ? 'rgba(52,211,153,0.45)' : isSpell ? 'rgba(251,191,36,0.45)' : 'rgba(56,189,248,0.45)';
    }
    if (povBtn) {
      povBtn.textContent = this.cameraMode === 'receiver'
        ? (isCompact ? 'POV' : 'POV: Front')
        : (isCompact ? '1P' : 'POV: Signer');
    }
    if (voiceBtn) {
      voiceBtn.textContent = this.voiceEnabled
        ? (isCompact ? '🔊' : '🔊 Audio')
        : (isCompact ? '🔇' : '🔇 Mute');
    }
    if (compactBtn) {
      compactBtn.textContent = isCompact ? '⊞' : '⊟';
      compactBtn.title = isCompact ? 'Expand signing deck' : 'Compact In-Vision mode';
      compactBtn.setAttribute('aria-label', compactBtn.title);
    }
    if (redockBtn) {
      redockBtn.style.display = this.layoutState.mode === 'floating' ? 'inline-flex' : 'none';
    }
    const pipBtn = this.querySelector<HTMLButtonElement>('#bsl-btn-pip');
    if (pipBtn) {
      const activePopout = isPoppedOut || (this.isFloatingPopout && this.layoutState.mode === 'floating');
      pipBtn.style.background = activePopout ? '#0284c7' : '#1e293b';
      pipBtn.style.color = activePopout ? '#ffffff' : '#38bdf8';
      pipBtn.title = activePopout
        ? 'Dock BSL Avatar Back to Corner'
        : 'Pop-out / Undock BSL Window';
    }

    const cornerBtns = this.querySelectorAll<HTMLButtonElement>('.bsl-corner-btn');
    cornerBtns.forEach((btn) => {
      const c = btn.getAttribute('data-corner');
      const isActive = this.layoutState.mode === 'docked' && c === this.layoutState.corner;
      btn.style.background = isActive ? '#38bdf8' : '#334155';
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  public setDockCorner(corner: BslDockCorner) {
    this.isFloatingPopout = false;
    this.layoutState.mode = 'docked';
    this.layoutState.corner = corner;
    delete this.layoutState.left;
    delete this.layoutState.top;
    this.applyPipLayout();
    this.saveLayout();
  }

  public toggleCompactMode() {
    this.layoutState.compact = !this.layoutState.compact;
    this.applyPipLayout();
    this.saveLayout();
  }

  private render() {
    this.innerHTML = `
      <div id="bsl-floating-card" class="bsl-interpreter-dock" data-dock-corner="bottom-right" style="position:fixed; bottom:12px; right:12px; width:224px; background:#020617; border:1.5px solid #1e293b; border-radius:12px; box-shadow:0 20px 40px -8px rgba(0,0,0,0.7); z-index:9995; overflow:hidden; font-family:system-ui, -apple-system, sans-serif; display:flex; flex-direction:column; user-select:none; pointer-events:auto;">
        
        <!-- Header Bar / Drag Handle -->
        <div id="bsl-header-bar" style="background:#0f172a; padding:6px 8px; border-bottom:1px solid #1e293b; display:flex; align-items:center; justify-content:space-between; gap:4px; cursor:grab; touch-action:none;">
          <div style="display:flex; align-items:center; gap:4px; min-width:0;">
            <button type="button" id="bsl-header-title" style="background:rgba(15,23,42,0.9); border:1px solid rgba(56,189,248,0.45); border-radius:4px; padding:1px 5px; font-size:0.66rem; font-weight:800; color:#38bdf8; letter-spacing:0.35px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer;" title="Click to switch between BSL Level 6 (OSV) and Makaton Key Word Signing (SVO + Symbols)">🇬🇧 BSL L6</button>
          </div>
          <div style="display:flex; align-items:center; gap:3px; flex-shrink:0;">
            <button type="button" id="bsl-btn-redock" style="display:none; align-items:center; justify-content:center; background:#0369a1; border:1px solid #38bdf8; color:#ffffff; border-radius:4px; font-size:0.65rem; font-weight:700; padding:1px 5px; cursor:pointer;" title="Return to docked corner">
              ⚓
            </button>
            <button type="button" id="bsl-btn-pov" style="background:#1e293b; border:1px solid #334155; color:#cbd5e1; border-radius:4px; font-size:0.65rem; font-weight:700; padding:2px 5px; cursor:pointer;" title="Toggle Camera POV (Receiver Front / Signer 1P)">
              POV
            </button>
            <button type="button" id="bsl-btn-voice" style="background:${this.voiceEnabled ? '#0284c7' : '#1e293b'}; border:1px solid ${this.voiceEnabled ? '#38bdf8' : '#334155'}; color:#f8fafc; border-radius:4px; font-size:0.65rem; font-weight:700; padding:2px 5px; cursor:pointer;" title="Speech Narration Audio Toggle">
              ${this.voiceEnabled ? '🔊' : '🔇'}
            </button>
            <button type="button" id="bsl-btn-compact" style="background:#1e293b; border:1px solid #334155; color:#cbd5e1; border-radius:4px; font-size:0.72rem; font-weight:700; padding:1px 5px; cursor:pointer;" title="Expand signing deck">
              ⊞
            </button>
            <div id="bsl-corner-grid" role="group" aria-label="Dock corner presets" title="Snap to any screen corner" style="display:grid; grid-template-columns:1fr 1fr; gap:1.5px; padding:2px; background:#020617; border:1px solid #334155; border-radius:4px;">
              <button type="button" class="bsl-corner-btn" data-corner="top-left" title="Dock Top-Left" aria-label="Dock Top-Left" style="width:9px; height:7px; padding:0; border:none; border-radius:1px; cursor:pointer; background:#334155;"></button>
              <button type="button" class="bsl-corner-btn" data-corner="top-right" title="Dock Top-Right" aria-label="Dock Top-Right" style="width:9px; height:7px; padding:0; border:none; border-radius:1px; cursor:pointer; background:#334155;"></button>
              <button type="button" class="bsl-corner-btn" data-corner="bottom-left" title="Dock Bottom-Left" aria-label="Dock Bottom-Left" style="width:9px; height:7px; padding:0; border:none; border-radius:1px; cursor:pointer; background:#334155;"></button>
              <button type="button" class="bsl-corner-btn" data-corner="bottom-right" title="Dock Bottom-Right" aria-label="Dock Bottom-Right" style="width:9px; height:7px; padding:0; border:none; border-radius:1px; cursor:pointer; background:#38bdf8;"></button>
            </div>
            <button type="button" id="bsl-btn-pip" style="background:#1e293b; border:1px solid #334155; color:#38bdf8; border-radius:4px; font-size:0.72rem; font-weight:700; padding:1px 5px; cursor:pointer;" title="Pop-out Window (Document Picture-in-Picture)">
              ⧉
            </button>
            <button type="button" id="bsl-btn-close" style="background:#1e293b; border:1px solid #334155; color:#94a3b8; border-radius:4px; font-size:0.72rem; font-weight:700; padding:1px 5px; cursor:pointer;" title="Close BSL Interpreter">
              ✕
            </button>
          </div>
        </div>

        <!-- Compact Pop-out Notice When Avatar is Undocked in Document PiP -->
        <div id="bsl-pip-docked-notice" style="display:none; padding:8px 10px; background:#090d16; align-items:center; justify-content:space-between; gap:8px; font-size:0.7rem; color:#94a3b8;">
          <span>Popped out in window</span>
          <button type="button" id="bsl-pip-notice-return" style="background:#0284c7; border:none; color:#ffffff; border-radius:4px; font-size:0.68rem; font-weight:700; padding:2px 7px; cursor:pointer;">⚓ Return</button>
        </div>

        <!-- Stage Container Hosting Live Avatar Wrapper -->
        <div id="bsl-stage-container" style="background:#020617; position:relative; width:100%; height:210px; display:flex; flex-direction:column; overflow:hidden;">
          
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
              <div style="position:absolute; top:6px; left:8px; pointer-events:none; display:flex; flex-direction:column; gap:2px; max-width:62%;">
                <span id="bsl-hud-gloss" style="background:${this.grammarMode === 'makaton' ? 'rgba(5,150,105,0.9)' : 'rgba(2,132,199,0.85)'}; color:#ffffff; font-size:0.63rem; font-weight:800; padding:1px 5px; border-radius:3px; letter-spacing:0.4px; text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${this.grammarMode === 'makaton' ? 'KEY WORD: READY' : 'GLOSS: READY'}
                </span>
                <span id="bsl-hud-nmf" style="background:rgba(15,23,42,0.82); border:1px solid #334155; color:#94a3b8; font-size:0.56rem; padding:1px 4px; border-radius:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${this.grammarMode === 'makaton' ? 'Speech + Sign + Symbol (SVO)' : 'NMF: Neutral'}
                </span>
              </div>

              <div style="position:absolute; top:6px; right:8px; pointer-events:none; text-align:right; display:flex; flex-direction:column; gap:2px;">
                <span id="bsl-hud-mode" style="background:rgba(15,23,42,0.85); border:1px solid #1e293b; color:${this.grammarMode === 'makaton' ? '#34d399' : '#38bdf8'}; font-size:0.58rem; font-weight:800; padding:1px 4px; border-radius:3px;">
                  ${this.grammarMode === 'makaton' ? 'MAKATON' : 'BSL L6'}
                </span>
                <span id="bsl-hud-cl" style="background:rgba(15,23,42,0.85); border:1px solid #334155; color:${this.grammarMode === 'makaton' ? '#34d399' : '#a855f7'}; font-size:0.56rem; font-weight:700; padding:1px 4px; border-radius:3px;">
                  ${this.grammarMode === 'makaton' ? 'SEN SVO' : 'CL: NONE'}
                </span>
              </div>

              <!-- Makaton High-Contrast Pictographic Concept Symbol Card (Active Exclusively in Makaton Mode) -->
              <div id="bsl-makaton-symbol-card" style="display:none; position:absolute; bottom:7px; left:8px; width:56px; background:#ffffff; border:2px solid #059669; border-radius:7px; box-shadow:0 6px 14px rgba(0,0,0,0.45); padding:3px 3px 2px; flex-direction:column; align-items:center; justify-content:center; pointer-events:none;">
                <div id="bsl-makaton-symbol-svg" style="width:34px; height:34px; display:flex; align-items:center; justify-content:center;"></div>
                <span id="bsl-makaton-symbol-word" style="font-size:0.58rem; font-weight:800; color:#0f172a; line-height:1.1; text-align:center; text-transform:lowercase; max-width:50px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"></span>
              </div>
            </div>

            <!-- Bottom Interactive Deck -->
            <div id="bsl-interactive-deck" style="background:#090d16; border-top:1px solid #1e293b; padding:8px 10px; display:flex; flex-direction:column; gap:6px;">
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

  private applyModeUI(mode: BslGrammarMode, replayLast = false) {
    this.grammarMode = mode;
    const isMakaton = mode === 'makaton';
    const isSpell = mode === 'fingerspell';

    const titleEl = this.querySelector<HTMLElement>('#bsl-header-title');
    if (titleEl) {
      const isCompact = this.layoutState.compact && !(this.pipWindow && !this.pipWindow.closed);
      titleEl.textContent = isMakaton
        ? (isCompact ? '🤝 MAKATON' : '🤝 MAKATON (KEY WORD)')
        : isSpell
        ? (isCompact ? '🔤 A–Z' : '🔤 FINGERSPELLING')
        : (isCompact ? '🇬🇧 BSL L6' : '🇬🇧 BSL LEVEL 6 (OSV)');
      titleEl.style.color = isMakaton ? '#34d399' : isSpell ? '#fbbf24' : '#38bdf8';
      titleEl.style.borderColor = isMakaton ? 'rgba(52,211,153,0.45)' : isSpell ? 'rgba(251,191,36,0.45)' : 'rgba(56,189,248,0.45)';
    }

    const hudMode = this.queryAvatarElement<HTMLSpanElement>('#bsl-hud-mode');
    if (hudMode) {
      hudMode.textContent =
        mode === 'bsl-natural' ? 'BSL L6' : isMakaton ? 'MAKATON' : 'SPELLING';
      hudMode.style.color = isMakaton ? '#34d399' : isSpell ? '#fbbf24' : '#38bdf8';
    }

    const hudGloss = this.queryAvatarElement<HTMLSpanElement>('#bsl-hud-gloss');
    if (hudGloss) {
      hudGloss.style.background = isMakaton ? 'rgba(5,150,105,0.9)' : 'rgba(2,132,199,0.85)';
      if (this.isIdle) {
        hudGloss.textContent = isMakaton ? 'KEY WORD: READY' : 'GLOSS: READY';
      }
    }

    const hudNmf = this.queryAvatarElement<HTMLSpanElement>('#bsl-hud-nmf');
    if (hudNmf && this.isIdle) {
      hudNmf.textContent = isMakaton ? 'Speech + Sign + Symbol (SVO)' : 'NMF: Neutral';
    }

    const hudCl = this.queryAvatarElement<HTMLSpanElement>('#bsl-hud-cl');
    if (hudCl) {
      hudCl.style.color = isMakaton ? '#34d399' : '#a855f7';
      if (this.isIdle) {
        hudCl.textContent = isMakaton ? 'SEN SVO' : 'CL: NONE';
      }
    }

    if (!isMakaton) {
      this.updateMakatonSymbolCard(null);
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

    if (replayLast && this.lastUtteranceText) {
      this.processUtterance(this.lastUtteranceText, false);
    }
  }

  private bindDomEvents() {
    // 1-Click Header Mode Badge Toggle (works even in Compact docked mode)
    const btnHeaderMode = this.querySelector<HTMLButtonElement>('#bsl-header-title');
    btnHeaderMode?.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextMode: BslGrammarMode = this.grammarMode === 'makaton' ? 'bsl-natural' : 'makaton';
      this.applyModeUI(nextMode, true);
      setSignLanguage(nextMode === 'makaton' ? 'MAKATON' : 'BSL');
    });

    // POV toggle
    const btnPov = this.querySelector<HTMLButtonElement>('#bsl-btn-pov');
    btnPov?.addEventListener('click', () => {
      this.cameraMode = this.cameraMode === 'receiver' ? 'signer' : 'receiver';
      this.orbitYawOffset = 0;
      this.orbitPitchOffset = 0;
      if (btnPov) {
        btnPov.textContent = this.cameraMode === 'receiver'
          ? (this.layoutState.compact ? 'POV' : 'POV: Front')
          : (this.layoutState.compact ? '1P' : 'POV: Signer');
      }
    });

    // Compact / Expanded toggle
    const btnCompact = this.querySelector<HTMLButtonElement>('#bsl-btn-compact');
    btnCompact?.addEventListener('click', () => {
      this.toggleCompactMode();
    });

    // 4-Corner Dock Presets
    const cornerBtns = this.querySelectorAll<HTMLButtonElement>('.bsl-corner-btn');
    cornerBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const corner = btn.getAttribute('data-corner') as BslDockCorner | null;
        if (corner) this.setDockCorner(corner);
      });
    });

    // 360-degree drag-to-orbit on Avatar SVG viewport (springs back to front on release)
    const avatarSvg = this.querySelector<SVGSVGElement>('#bsl-avatar-svg');
    if (avatarSvg) {
      let orbitPointerId: number | null = null;
      let startX = 0;
      let startY = 0;
      let baseYaw = 0;
      let basePitch = 0;
      avatarSvg.style.cursor = 'grab';
      avatarSvg.addEventListener('pointerdown', (e) => {
        this.isOrbitingAvatar = true;
        orbitPointerId = e.pointerId;
        this.orbitYawVel = 0;
        this.orbitPitchVel = 0;
        startX = e.clientX;
        startY = e.clientY;
        baseYaw = this.orbitYawOffset;
        basePitch = this.orbitPitchOffset;
        avatarSvg.style.cursor = 'grabbing';
        try {
          avatarSvg.setPointerCapture?.(e.pointerId);
        } catch (_) {}
      });
      avatarSvg.addEventListener('pointermove', (e) => {
        if (!this.isOrbitingAvatar) return;
        if (orbitPointerId !== null && e.pointerId !== orbitPointerId) return;
        this.orbitYawOffset = Math.max(-150, Math.min(150, baseYaw + (e.clientX - startX) * 0.65));
        this.orbitPitchOffset = Math.max(-45, Math.min(45, basePitch + (e.clientY - startY) * 0.45));
      });
      const stopOrbit = () => {
        if (this.isOrbitingAvatar) {
          this.isOrbitingAvatar = false;
          avatarSvg.style.cursor = 'grab';
          if (orbitPointerId !== null) {
            try {
              if (avatarSvg.hasPointerCapture?.(orbitPointerId)) {
                avatarSvg.releasePointerCapture(orbitPointerId);
              }
            } catch (_) {}
            orbitPointerId = null;
          }
        }
      };
      avatarSvg.addEventListener('pointerup', stopOrbit);
      avatarSvg.addEventListener('pointercancel', stopOrbit);
      avatarSvg.addEventListener('lostpointercapture', stopOrbit);
      avatarSvg.addEventListener('dblclick', () => {
        this.isOrbitingAvatar = false;
        this.orbitYawOffset = 0;
        this.orbitPitchOffset = 0;
        this.orbitYawVel = 0;
        this.orbitPitchVel = 0;
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
      this.applyModeUI(nextMode, true);
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

    // Re-dock from floating mode button & PiP return button
    const btnRedock = this.querySelector<HTMLButtonElement>('#bsl-btn-redock');
    btnRedock?.addEventListener('click', () => {
      this.setDockCorner(this.layoutState.corner || 'bottom-right');
    });
    const btnPipNoticeReturn = this.querySelector<HTMLButtonElement>('#bsl-pip-notice-return');
    btnPipNoticeReturn?.addEventListener('click', () => {
      this.dockBackFromPiP(true);
    });

    // Make floating card draggable via Pointer Events (4px threshold + magnetic corner snap)
    const floatingCard = this.querySelector<HTMLElement>('#bsl-floating-card');
    const headerBar = this.querySelector<HTMLElement>('#bsl-header-bar');
    if (floatingCard && headerBar) {
      headerBar.addEventListener('dblclick', (e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        if (this.layoutState.mode === 'floating') {
          this.setDockCorner(this.layoutState.corner || 'bottom-right');
        }
      });

      headerBar.addEventListener('pointerdown', (e: PointerEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        this.isPointerDownHeader = true;
        this.isDraggingCard = false;
        this.activeDragPointerId = e.pointerId;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        const rect = floatingCard.getBoundingClientRect();
        const startCoords = this.computeClampedFloatingCoords(rect.left, rect.top);
        this.dragInitialLeft = startCoords.left;
        this.dragInitialTop = startCoords.top;
      });

      this.boundPointerMove = (e: PointerEvent) => {
        if (!this.isPointerDownHeader) return;
        if (this.activeDragPointerId !== null && e.pointerId !== this.activeDragPointerId) return;
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;

        if (!this.isDraggingCard) {
          if (Math.hypot(dx, dy) < 5) return;
          this.isDraggingCard = true;
          this.layoutState.mode = 'floating';
          floatingCard.setAttribute('data-dock-corner', 'floating');
          floatingCard.style.bottom = 'auto';
          floatingCard.style.right = 'auto';
          headerBar.style.cursor = 'grabbing';
          try {
            headerBar.setPointerCapture?.(e.pointerId);
          } catch (_) {}
          const redockBtn = this.querySelector<HTMLButtonElement>('#bsl-btn-redock');
          if (redockBtn) redockBtn.style.display = 'inline-flex';
          this.querySelectorAll<HTMLButtonElement>('.bsl-corner-btn').forEach((btn) => {
            btn.style.background = '#334155';
            btn.setAttribute('aria-pressed', 'false');
          });
        }

        const clamped = this.computeClampedFloatingCoords(this.dragInitialLeft + dx, this.dragInitialTop + dy);
        this.layoutState.left = clamped.left;
        this.layoutState.top = clamped.top;
        floatingCard.style.left = `${clamped.left}px`;
        floatingCard.style.top = `${clamped.top}px`;
      };

      const finishCardDrag = (e?: PointerEvent) => {
        if (!this.isPointerDownHeader && !this.isDraggingCard) return;
        if (e && this.activeDragPointerId !== null && e.pointerId !== this.activeDragPointerId) return;
        const wasDragging = this.isDraggingCard;
        const pid = this.activeDragPointerId;
        this.isPointerDownHeader = false;
        this.isDraggingCard = false;
        this.activeDragPointerId = null;
        headerBar.style.cursor = 'grab';
        if (pid !== null) {
          try {
            if (headerBar.hasPointerCapture?.(pid)) {
              headerBar.releasePointerCapture(pid);
            }
          } catch (_) {}
        }

        if (wasDragging) {
          // Magnetic snap-back if dropped near one of the 4 dock corners
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const rect = floatingCard.getBoundingClientRect();
          const SNAP_DIST = 36;
          if (!this.isFloatingPopout) {
            if (rect.left <= SNAP_DIST && vh - rect.bottom <= SNAP_DIST + 20) {
              this.setDockCorner('bottom-left');
              return;
            }
            if (vw - rect.right <= SNAP_DIST && vh - rect.bottom <= SNAP_DIST + 20) {
              this.setDockCorner('bottom-right');
              return;
            }
            if (rect.left <= SNAP_DIST && rect.top <= 74 + SNAP_DIST) {
              this.setDockCorner('top-left');
              return;
            }
            if (vw - rect.right <= SNAP_DIST && rect.top <= 74 + SNAP_DIST) {
              this.setDockCorner('top-right');
              return;
            }
          }
          this.saveLayout();
        }
      };

      this.boundPointerUp = finishCardDrag;
      headerBar.addEventListener('lostpointercapture', () => finishCardDrag());

      this.boundWindowResize = () => {
        if (this.layoutState.mode === 'floating') {
          this.applyPipLayout();
        }
      };

      window.addEventListener('pointermove', this.boundPointerMove);
      window.addEventListener('pointerup', this.boundPointerUp);
      window.addEventListener('pointercancel', this.boundPointerUp);
      window.addEventListener('resize', this.boundWindowResize);
    }
  }

  private subscribeStores() {
    this.unsubscribeVoice = subscribeVoice((enabled) => {
      this.voiceEnabled = enabled;
      const btnVoice = this.querySelector<HTMLButtonElement>('#bsl-btn-voice');
      if (btnVoice) {
        btnVoice.textContent = enabled
          ? (this.layoutState.compact ? '🔊' : '🔊 Audio')
          : (this.layoutState.compact ? '🔇' : '🔇 Mute');
        btnVoice.style.background = enabled ? '#0284c7' : '#1e293b';
        btnVoice.style.borderColor = enabled ? '#38bdf8' : '#334155';
      }
    });

    this.unsubscribeSignLang = subscribeSignLanguage((code) => {
      if (code === 'MAKATON' && this.grammarMode !== 'makaton') {
        this.applyModeUI('makaton', true);
      } else if (code === 'BSL' && this.grammarMode === 'makaton') {
        this.applyModeUI('bsl-natural', true);
      }
    });

    this.unsubscribeSpeech = subscribeBslSpeech((payload: BslSpeechPayload) => {
      if (payload.stopSigning) {
        this.lastSpokenSubtitle = '';
        this.returnToRest();
        return;
      }
      if (payload.subtitle) {
        if (payload.subtitle !== this.lastSpokenSubtitle) {
          this.lastSpokenSubtitle = payload.subtitle;
          this.processUtterance(payload.subtitle, false);
        }
      } else if (payload.word) {
        // Highlighting current spoken word boundary in HUD without resetting the sentence queue
        const hudGloss = this.queryAvatarElement('#bsl-hud-gloss');
        if (hudGloss && !this.isIdle) {
          hudGloss.textContent = `WORD: ${payload.word.toUpperCase()}`;
        }
        if (!this.lastSpokenSubtitle && this.isIdle) {
          this.processUtterance(payload.word, false);
        }
      }
      if (payload.isSpeaking === false) {
        this.lastSpokenSubtitle = '';
        if (this.isIdle && this.currentAnimProgress >= 1.0) {
          this.resetHudToStandby();
        }
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
   * Generates a crisp black-on-white procedural SEN line-art pictogram for Makaton Concept Symbol cards.
   */
  private getMakatonSymbolPictogram(wordUpper: string): string {
    const s = 'stroke="#0f172a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"';
    if (wordUpper === 'EAT' || wordUpper === 'FOOD') {
      return `<svg viewBox="0 0 36 36" width="32" height="32"><circle cx="18" cy="19" r="10" ${s}/><circle cx="18" cy="19" r="5.5" ${s}/><line x1="5" y1="11" x2="5" y2="27" ${s}/><line x1="31" y1="11" x2="31" y2="27" ${s}/></svg>`;
    }
    if (wordUpper === 'DRINK' || wordUpper === 'WATER' || wordUpper === 'RAIN' || wordUpper === 'WASH') {
      return `<svg viewBox="0 0 36 36" width="32" height="32"><path d="M10 9 L26 9 L23 29 L13 29 Z" ${s}/><path d="M12 16 Q18 19 24 16" ${s}/></svg>`;
    }
    if (wordUpper === 'BOOK' || wordUpper === 'READ' || wordUpper === 'WRITE' || wordUpper === 'BIBLE' || wordUpper === 'LEARN') {
      return `<svg viewBox="0 0 36 36" width="32" height="32"><path d="M6 10 Q12 8 18 11 Q24 8 30 10 L30 27 Q24 25 18 28 Q12 25 6 27 Z" ${s}/><line x1="18" y1="11" x2="18" y2="28" ${s}/></svg>`;
    }
    if (wordUpper === 'SCHOOL' || wordUpper === 'HOME' || wordUpper === 'HOUSE' || wordUpper === 'CHURCH' || wordUpper === 'TABERNACLE') {
      const cross = (wordUpper === 'CHURCH' || wordUpper === 'TABERNACLE') ? `<line x1="18" y1="3" x2="18" y2="9" ${s}/><line x1="15" y1="5.5" x2="21" y2="5.5" ${s}/>` : '';
      return `<svg viewBox="0 0 36 36" width="32" height="32">${cross}<path d="M6 17 L18 8 L30 17" ${s}/><path d="M9 16 L9 29 L27 29 L27 16" ${s}/><rect x="15" y="21" width="6" height="8" ${s}/></svg>`;
    }
    if (wordUpper === 'JESUS' || wordUpper === 'GOD' || wordUpper === 'PRAY' || wordUpper === 'CROSS' || wordUpper === 'HOLY' || wordUpper === 'CHALICE' || wordUpper === 'EUCHARIST' || wordUpper === 'CONSECRATE' || wordUpper === 'INCENSE' || wordUpper === 'GENUFLECT') {
      if (wordUpper === 'CHALICE' || wordUpper === 'EUCHARIST' || wordUpper === 'CONSECRATE') {
        return `<svg viewBox="0 0 36 36" width="32" height="32"><circle cx="18" cy="9" r="4.5" ${s}/><path d="M11 16 Q18 26 25 16 Z" ${s}/><line x1="18" y1="22" x2="18" y2="30" ${s}/><line x1="12" y1="30" x2="24" y2="30" ${s}/></svg>`;
      }
      return `<svg viewBox="0 0 36 36" width="32" height="32"><line x1="18" y1="6" x2="18" y2="30" ${s}/><line x1="9" y1="14" x2="27" y2="14" ${s}/></svg>`;
    }
    if (wordUpper === 'LOVE' || wordUpper === 'LIKE' || wordUpper === 'PLEASE' || wordUpper === 'THANK YOU' || wordUpper === 'FRIEND' || wordUpper === 'PEACE') {
      return `<svg viewBox="0 0 36 36" width="32" height="32"><path d="M18 29 C18 29 7 21 7 13.5 C7 9.5 10.5 7 14 7 C16.2 7 18 8.6 18 10.2 C18 8.6 19.8 7 22 7 C25.5 7 29 9.5 29 13.5 C29 21 18 29 18 29 Z" ${s}/></svg>`;
    }
    if (wordUpper === 'HAPPY' || wordUpper === 'GOOD' || wordUpper === 'YES' || wordUpper === 'CORRECT') {
      return `<svg viewBox="0 0 36 36" width="32" height="32"><circle cx="18" cy="18" r="12" ${s}/><circle cx="13.5" cy="15" r="1.3" fill="#0f172a"/><circle cx="22.5" cy="15" r="1.3" fill="#0f172a"/><path d="M12.5 21 Q18 26 23.5 21" ${s}/></svg>`;
    }
    if (wordUpper === 'SAD' || wordUpper === 'NO' || wordUpper === 'WRONG' || wordUpper === 'SORRY') {
      return `<svg viewBox="0 0 36 36" width="32" height="32"><circle cx="18" cy="18" r="12" ${s}/><circle cx="13.5" cy="15" r="1.3" fill="#0f172a"/><circle cx="22.5" cy="15" r="1.3" fill="#0f172a"/><path d="M13 24 Q18 19.5 23 24" ${s}/></svg>`;
    }
    if (wordUpper === 'SUN' || wordUpper === 'LIGHT' || wordUpper === 'DAY' || wordUpper === 'MORNING' || wordUpper === 'ENERGY') {
      return `<svg viewBox="0 0 36 36" width="32" height="32"><circle cx="18" cy="18" r="6.5" ${s}/><line x1="18" y1="5" x2="18" y2="8.5" ${s}/><line x1="18" y1="27.5" x2="18" y2="31" ${s}/><line x1="5" y1="18" x2="8.5" y2="18" ${s}/><line x1="27.5" y1="18" x2="31" y2="18" ${s}/><line x1="9" y1="9" x2="11.5" y2="11.5" ${s}/><line x1="24.5" y1="24.5" x2="27" y2="27" ${s}/></svg>`;
    }
    if (wordUpper === 'SCIENCE' || wordUpper === 'ATOM' || wordUpper === 'PLANET' || wordUpper === 'EARTH' || wordUpper === 'ORBIT' || wordUpper === 'GRAVITY') {
      return `<svg viewBox="0 0 36 36" width="32" height="32"><circle cx="18" cy="18" r="3" fill="#0f172a"/><ellipse cx="18" cy="18" rx="13" ry="5.5" transform="rotate(28 18 18)" ${s}/><ellipse cx="18" cy="18" rx="13" ry="5.5" transform="rotate(-28 18 18)" ${s}/></svg>`;
    }
    if (wordUpper === 'MATHS' || wordUpper === 'EQUAL' || wordUpper === 'NUMBER' || wordUpper === 'FRACTION' || wordUpper === 'MORE' || wordUpper === 'AGAIN') {
      return `<svg viewBox="0 0 36 36" width="32" height="32"><line x1="8" y1="13" x2="18" y2="13" ${s}/><line x1="13" y1="8" x2="13" y2="18" ${s}/><line x1="19" y1="21" x2="29" y2="21" ${s}/><line x1="19" y1="26" x2="29" y2="26" ${s}/></svg>`;
    }
    if (wordUpper === 'WHAT' || wordUpper === 'WHERE' || wordUpper === 'WHO' || wordUpper === 'WHEN' || wordUpper === 'HOW' || wordUpper === 'QUESTION') {
      return `<svg viewBox="0 0 36 36" width="32" height="32"><path d="M13 12.5 C13 9 23 9 23 14 C23 17.5 18 18 18 22" ${s}/><circle cx="18" cy="27.5" r="1.6" fill="#0f172a"/></svg>`;
    }
    if (wordUpper === 'LOOK') {
      return `<svg viewBox="0 0 36 36" width="32" height="32"><path d="M5 18 Q18 8 31 18 Q18 28 5 18 Z" ${s}/><circle cx="18" cy="18" r="3.5" fill="#0f172a"/></svg>`;
    }
    if (wordUpper === 'STOP' || wordUpper === 'WAIT' || wordUpper === 'HELLO' || wordUpper === 'GOODBYE' || wordUpper === 'HELP') {
      return `<svg viewBox="0 0 36 36" width="32" height="32"><path d="M13 18 L13 9 M17 17 L17 7 M21 17 L21 8 M25 19 L25 11 M10 19 L10 14 C10 25 13 29 19 29 C24 29 26 25 26 19" ${s}/></svg>`;
    }
    return `<svg viewBox="0 0 36 36" width="32" height="32"><rect x="7" y="7" width="22" height="22" rx="5" ${s}/><circle cx="18" cy="15" r="3.5" ${s}/><path d="M12 24 Q18 20 24 24" ${s}/></svg>`;
  }

  private updateMakatonSymbolCard(pose: BslHandPose | null) {
    const card = this.queryAvatarElement<HTMLElement>('#bsl-makaton-symbol-card');
    if (!card) return;
    if (this.grammarMode !== 'makaton' || !pose || !pose.letter || pose.letter === ' ' || pose.letter === 'REST') {
      card.style.display = 'none';
      return;
    }
    const svgSlot = this.queryAvatarElement<HTMLElement>('#bsl-makaton-symbol-svg');
    const wordSlot = this.queryAvatarElement<HTMLElement>('#bsl-makaton-symbol-word');
    const rawWord = (pose.letter || '').trim().toUpperCase();
    const displayWord = ((pose.label || '').split('•')[1] || rawWord).trim().toLowerCase();

    if (svgSlot) {
      svgSlot.innerHTML = this.getMakatonSymbolPictogram(rawWord);
    }
    if (wordSlot) {
      wordSlot.textContent = displayWord;
    }
    card.style.display = 'flex';
  }

  /**
   * Parses natural text through the BSL Level 6 grammar engine / Makaton lexicon
   * and queues 3D skeletal keyframe trajectories.
   */
  public processUtterance(text: string, speakAudio: boolean = false) {
    if (!text || typeof text !== 'string') return;
    const cleanText = text.trim();
    if (!cleanText) return;
    this.lastUtteranceText = cleanText;

    // Optional audio narration via Web Speech API (only if explicitly requested by manual user action,
    // and both voice narration and master sound are active)
    if (speakAudio && this.voiceEnabled && isSoundEnabled() && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        // Makaton pairs slightly slower, clearer spoken English alongside key word signs
        utterance.rate = this.grammarMode === 'makaton' ? 0.9 : 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[BSL Interpreter] Speech synthesis error:', err);
      }
    }

    // Linguistic Grammar Analysis (BSL Level 6 / Makaton / Fingerspelling)
    const analysis: BslGrammarAnalysis = analyzeAndTransformBslGrammar(cleanText, this.grammarMode);
    const isMakaton = this.grammarMode === 'makaton';

    this.currentGloss = analysis.glossSequence || cleanText.toUpperCase();
    this.currentSentenceType = analysis.sentenceType.toUpperCase();
    this.currentNmfText = isMakaton
      ? `SVO Key Words • Lip-read: "${cleanText.slice(0, 18)}"`
      : `Eyebrows: ${analysis.nmfSummary.eyebrows} | Mouth: ${analysis.nmfSummary.mouthCue || 'natural'} | Head: ${analysis.nmfSummary.headTilt}`;

    // Update HUD
    const hudGloss = this.queryAvatarElement<HTMLSpanElement>('#bsl-hud-gloss');
    if (hudGloss) {
      hudGloss.style.background = isMakaton ? 'rgba(5,150,105,0.9)' : 'rgba(2,132,199,0.85)';
      hudGloss.textContent = isMakaton
        ? `KEY WORDS: ${this.currentGloss.slice(0, 22)}`
        : `GLOSS: ${this.currentGloss.slice(0, 24)}`;
    }

    const hudNmf = this.queryAvatarElement('#bsl-hud-nmf');
    if (hudNmf) hudNmf.textContent = this.currentNmfText;

    // Distinguish Makaton Stage telemetry vs BSL Level 6 Classifier telemetry
    if (isMakaton) {
      const signedStages = Array.from(
        new Set(analysis.tokens.filter((t) => t.makatonStage !== undefined).map((t) => `S${t.makatonStage}`))
      );
      this.activeClassifierText = signedStages.length > 0 ? `STAGE ${signedStages.join(',')}` : 'SPEECH ONLY';
    } else {
      const clToken = analysis.tokens.find((t) => t.role === 'classifier-predicate' || t.classifier);
      if (clToken && clToken.classifier) {
        this.activeClassifierText = `CL: ${clToken.classifier.type} (${clToken.aspect || 'normal'})`;
      } else {
        this.activeClassifierText = 'CL: NONE';
      }
    }
    const hudCl = this.queryAvatarElement<HTMLSpanElement>('#bsl-hud-cl');
    if (hudCl) {
      hudCl.style.color = isMakaton ? '#34d399' : '#a855f7';
      hudCl.textContent = this.activeClassifierText;
    }

    // Queue keyframe poses
    if (analysis.stream && analysis.stream.length > 0) {
      this.poseQueue = [...analysis.stream];
      this.isIdle = false;
      this.hasResetIdleHud = false;
      this.advanceToNextPose();
    } else if (isMakaton) {
      // In Makaton, sentences with zero core keywords remain in calm ready posture without fingerspelling clutter
      this.updateMakatonSymbolCard(null);
      this.returnToRest();
    }
  }

  private snapshotLivePose() {
    this.currentPose = {
      ...this.targetPose,
      targetTip: { ...this.liveTip },
      targetKnuckle: { ...this.liveKnuckle },
      targetWrist: { ...this.liveWrist },
    };
    this.prevBaseForearm = { ...this.liveBaseForearm };
    this.prevBaseWrist = { ...this.liveBaseWrist };
    this.prevBaseKnuckle = { ...this.liveBaseKnuckle };
    this.prevBasePalm = { ...this.liveBasePalm };
    this.prevBaseTip = { ...this.liveBaseTip };
    this.prevRoleYaw = this.liveRoleYaw;
    this.prevRolePitch = this.liveRolePitch;
  }

  private resetHudToStandby() {
    const isMakaton = this.grammarMode === 'makaton';
    this.currentGloss = 'READY';
    this.currentSentenceType = 'STANDBY';
    this.currentNmfText = isMakaton ? 'Speech + Sign + Symbol (SVO)' : 'NMF: Neutral';
    this.activeClassifierText = isMakaton ? 'SEN SVO' : 'CL: NONE';
    const hudGloss = this.queryAvatarElement<HTMLSpanElement>('#bsl-hud-gloss');
    if (hudGloss) {
      hudGloss.style.background = isMakaton ? 'rgba(5,150,105,0.9)' : 'rgba(2,132,199,0.85)';
      hudGloss.textContent = isMakaton ? 'KEY WORD: READY' : 'GLOSS: READY';
    }
    const hudNmf = this.queryAvatarElement('#bsl-hud-nmf');
    if (hudNmf) hudNmf.textContent = this.currentNmfText;
    const hudCl = this.queryAvatarElement<HTMLSpanElement>('#bsl-hud-cl');
    if (hudCl) {
      hudCl.style.color = isMakaton ? '#34d399' : '#a855f7';
      hudCl.textContent = this.activeClassifierText;
    }
    this.updateMakatonSymbolCard(null);
    this.hasResetIdleHud = true;
  }

  public returnToRest() {
    this.poseQueue = [];
    this.updateMakatonSymbolCard(null);
    if (this.isIdle && this.targetPose.letter === 'REST') {
      if (this.currentAnimProgress >= 1.0) {
        this.resetHudToStandby();
      }
      return;
    }
    this.snapshotLivePose();
    this.targetPose = this.createRestPose();
    this.currentPoseDuration = 320;
    this.currentPoseStartTime = performance.now();
    this.currentAnimProgress = 0;
    this.holdRemaining = 0;
    this.isIdle = true;
    this.hasResetIdleHud = false;
  }

  private advanceToNextPose() {
    this.snapshotLivePose();

    if (this.poseQueue.length === 0) {
      // Spring briskly from exact live 3D pose back to neutral chest rest pose
      this.updateMakatonSymbolCard(null);
      this.targetPose = this.createRestPose();
      this.currentPoseDuration = 340;
      this.currentPoseStartTime = performance.now();
      this.currentAnimProgress = 0;
      this.holdRemaining = 0;
      this.isIdle = true;
      this.hasResetIdleHud = false;
      return;
    }

    this.targetPose = this.poseQueue.shift()!;
    const isMakaton = this.grammarMode === 'makaton';
    const isBoundary = this.targetPose.letter === ' ';

    // Makaton uses a measured, deliberate SEN Key Word cadence (~540ms + 240ms visual apex hold)
    // whereas BSL Level 6 executes crisp fluent natural signing (~360ms + 60ms hold)
    if (isMakaton) {
      this.currentPoseDuration = isBoundary ? 260 : (this.targetPose.hold ? Math.max(480, this.targetPose.hold + 280) : 540);
      this.holdRemaining = isBoundary ? 140 : Math.max(240, (this.targetPose.hold || 120) + 120);
    } else {
      this.currentPoseDuration = isBoundary ? 190 : (this.targetPose.hold ? Math.max(240, this.targetPose.hold + 150) : 360);
      this.holdRemaining = isBoundary ? 30 : (this.targetPose.hold || 60);
    }

    this.currentPoseStartTime = performance.now();
    this.currentAnimProgress = 0;
    this.isIdle = false;
    this.hasResetIdleHud = false;

    this.updateMakatonSymbolCard(isBoundary ? null : this.targetPose);

    const hudGloss = this.queryAvatarElement('#bsl-hud-gloss');
    if (hudGloss && !isBoundary) {
      hudGloss.textContent = isMakaton
        ? `KEY WORD: ${this.targetPose.label || this.targetPose.letter}`
        : `SIGN: ${this.targetPose.label || this.targetPose.letter}`;
    }
  }

  private stopAnimationLoop() {
    if (this.animationFrameId !== null) {
      const targetWin = this.animationFrameWindow || window;
      try {
        if (typeof targetWin.cancelAnimationFrame === 'function') {
          targetWin.cancelAnimationFrame(this.animationFrameId);
        } else {
          window.cancelAnimationFrame(this.animationFrameId);
        }
      } catch (_) {
        try {
          window.cancelAnimationFrame(this.animationFrameId);
        } catch (_) {}
      }
      this.animationFrameId = null;
      this.animationFrameWindow = null;
    }
  }

  /**
   * Main 60 FPS Skeletal Kinematic Animation Loop.
   * Dynamically tracks PiP window vs main window requestAnimationFrame.
   */
  private startAnimationLoop() {
    this.stopAnimationLoop();
    const scheduleNext = (cb: FrameRequestCallback) => {
      const usePip = Boolean(this.pipWindow && !this.pipWindow.closed && typeof this.pipWindow.requestAnimationFrame === 'function');
      const win = usePip ? this.pipWindow! : window;
      this.animationFrameWindow = win;
      this.animationFrameId = win.requestAnimationFrame(cb);
    };
    const loop = () => {
      this.updateAvatar(performance.now());
      scheduleNext(loop);
    };
    scheduleNext(loop);
  }

  private updateAvatar(now: number) {
    const svg = this.queryAvatarElement<SVGSVGElement>('#bsl-avatar-svg');
    if (!svg) return;

    // Elastic spring-back for 3D camera orbit when pointer is released
    if (!this.isOrbitingAvatar && (this.orbitYawOffset !== 0 || this.orbitPitchOffset !== 0 || this.orbitYawVel !== 0 || this.orbitPitchVel !== 0)) {
      this.orbitYawVel = (this.orbitYawVel - this.orbitYawOffset * 0.16) * 0.74;
      this.orbitPitchVel = (this.orbitPitchVel - this.orbitPitchOffset * 0.16) * 0.74;
      this.orbitYawOffset += this.orbitYawVel;
      this.orbitPitchOffset += this.orbitPitchVel;
      if (Math.abs(this.orbitYawOffset) < 0.08 && Math.abs(this.orbitYawVel) < 0.08) {
        this.orbitYawOffset = 0;
        this.orbitYawVel = 0;
      }
      if (Math.abs(this.orbitPitchOffset) < 0.08 && Math.abs(this.orbitPitchVel) < 0.08) {
        this.orbitPitchOffset = 0;
        this.orbitPitchVel = 0;
      }
    }

    // Advance timeline interpolation using unified performance.now() timebase
    let progress = 1.0;
    if (this.currentPoseDuration > 0 && this.currentPoseStartTime > 0) {
      const elapsed = Math.max(0, now - this.currentPoseStartTime);
      progress = Math.min(1.0, elapsed / this.currentPoseDuration);
    }

    if (progress >= 1.0 && !this.isIdle) {
      if (this.holdRemaining > 0) {
        this.holdRemaining -= 16.6;
      } else {
        this.advanceToNextPose();
        progress = 0.0;
      }
    }

    this.currentAnimProgress = progress;
    if (this.isIdle && progress >= 1.0 && !this.hasResetIdleHud) {
      this.resetHudToStandby();
    }

    const easeType = this.targetPose.ease || (this.isIdle ? 'spring' : 'smooth');
    const easeT = evaluateBslEase(easeType, progress);

    // Subtle idle breathing oscillation once hands settle at rest
    const idleBreathY = this.isIdle && progress >= 1.0 ? Math.sin(now * 0.0026) * 1.4 : 0;

    // Single-pass kinematic interpolation (no double-smoothstep sluggishness)
    const rawTip = this.lerpRaw3D(this.currentPose.targetTip, this.targetPose.targetTip, easeT);
    const rawKnuckle = this.lerpRaw3D(this.currentPose.targetKnuckle, this.targetPose.targetKnuckle, easeT);
    const rawWrist = this.lerpRaw3D(this.currentPose.targetWrist, this.targetPose.targetWrist, easeT);
    const tip: Point3D = { x: rawTip.x, y: rawTip.y + idleBreathY, z: rawTip.z };
    const knuckle: Point3D = { x: rawKnuckle.x, y: rawKnuckle.y + idleBreathY, z: rawKnuckle.z };
    const wrist: Point3D = { x: rawWrist.x, y: rawWrist.y + idleBreathY, z: rawWrist.z };
    this.liveTip = tip;
    this.liveKnuckle = knuckle;
    this.liveWrist = wrist;

    const activeShape = this.targetPose.shape || 'flat-closed';
    const activePalm = this.targetPose.palm || 'in';
    const activeNmf = this.targetPose.nmf || { eyebrows: 'neutral', mouth: 'closed', headTilt: 'neutral' };

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

    // Smoothly spring-interpolate Role-Shift torso yaw & elevation pitch
    const targetRoleYaw = activeNmf.roleShift?.yaw || 0;
    const targetRolePitch = activeNmf.roleShift?.elevation === 'high' ? -4 : activeNmf.roleShift?.elevation === 'low' ? 4 : 0;
    const roleYaw = this.prevRoleYaw + (targetRoleYaw - this.prevRoleYaw) * easeT;
    const rolePitch = this.prevRolePitch + (targetRolePitch - this.prevRolePitch) * easeT;
    this.liveRoleYaw = roleYaw;
    this.liveRolePitch = rolePitch;

    const activeCam = {
      yaw: cam.yaw + (this.cameraMode === 'receiver' ? -roleYaw : roleYaw) + this.orbitYawOffset,
      pitch: cam.pitch + rolePitch + this.orbitPitchOffset,
      distance: cam.distance,
      fov: cam.fov,
    };

    // Dynamic anatomical 3D elbows shared between sleeves and forearms so arms never detach
    const rightElbow3D: Point3D = {
      x: Math.max(54, Math.min(74, 58 + wrist.x * 0.16)),
      y: Math.max(24, Math.min(46, 32 + (wrist.y - 45) * 0.2)),
      z: -5,
    };
    const leftElbow3D: Point3D = {
      x: Math.min(-54, Math.max(-74, -58 + this.liveBaseWrist.x * 0.16)),
      y: Math.max(24, Math.min(46, 32 + (this.liveBaseWrist.y - 45) * 0.2)),
      z: -5,
    };

    // Render Layers
    this.renderLociLayer(activeCam, originX, originY);
    this.renderBodyLayer(activeCam, originX, originY, leftElbow3D, rightElbow3D);
    this.renderHeadLayer(activeCam, originX, originY, activeNmf);
    this.renderBaseHandLayer(activeCam, originX, originY, baseMode, wrist, knuckle, tip, activeShape, activePalm, easeT, leftElbow3D, idleBreathY);
    this.renderDominantHandLayer(activeCam, originX, originY, wrist, knuckle, tip, activeShape, activePalm, rightElbow3D);
  }

  private renderLociLayer(cam: any, ox: number, oy: number) {
    const lociGroup = this.queryAvatarElement('#bsl-layer-loci');
    if (!lociGroup) return;
    if (this.grammarMode === 'makaton') {
      if (lociGroup.innerHTML) lociGroup.innerHTML = '';
      return;
    }

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

  private renderBodyLayer(cam: any, ox: number, oy: number, leftElbow3D: Point3D, rightElbow3D: Point3D) {
    const bodyGroup = this.queryAvatarElement('#bsl-layer-body');
    if (!bodyGroup) return;

    // Anatomical Shoulder & Trapezius Slope Invariants:
    // Shoulders slope down from chest (-24 to -15), bi-acromial span = 112 (-56 to +56)
    const pNeckBase = project3DToSvg({ x: 0, y: -24, z: 0 }, cam, ox, oy);
    const pLeftShoulder = project3DToSvg({ x: -56, y: -15, z: 0 }, cam, ox, oy);
    const pRightShoulder = project3DToSvg({ x: 56, y: -15, z: 0 }, cam, ox, oy);
    const pWaistLeft = project3DToSvg({ x: -44, y: 75, z: -10 }, cam, ox, oy);
    const pWaistRight = project3DToSvg({ x: 44, y: 75, z: -10 }, cam, ox, oy);

    // Anatomical Elbows shared with Forearms
    const pLeftElbow = project3DToSvg(leftElbow3D, cam, ox, oy);
    const pRightElbow = project3DToSvg(rightElbow3D, cam, ox, oy);

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
    activePalm: any,
    easeT = 1.0,
    leftElbow3D: Point3D = { x: -66, y: 35, z: -5 },
    idleBreathY = 0
  ) {
    const baseGroup = this.queryAvatarElement('#bsl-layer-base-hand');
    if (!baseGroup) return;

    // 1. Bilateral Symmetrical Kinematics (PRAY, CHURCH, EQUAL, WHAT, SCIENCE, BIBLE, etc.)
    if (mode === 'mirror') {
      const targetMirrorWrist: Point3D = { x: -this.targetPose.targetWrist.x, y: this.targetPose.targetWrist.y + idleBreathY, z: this.targetPose.targetWrist.z };
      const targetMirrorKnuckle: Point3D = { x: -this.targetPose.targetKnuckle.x, y: this.targetPose.targetKnuckle.y + idleBreathY, z: this.targetPose.targetKnuckle.z };
      const targetMirrorTip: Point3D = { x: -this.targetPose.targetTip.x, y: this.targetPose.targetTip.y + idleBreathY, z: this.targetPose.targetTip.z };

      const mWrist = this.lerpRaw3D(this.prevBaseWrist, targetMirrorWrist, easeT);
      const mKnuckle = this.lerpRaw3D(this.prevBaseKnuckle, targetMirrorKnuckle, easeT);
      const mTip = this.lerpRaw3D(this.prevBaseTip, targetMirrorTip, easeT);

      const solvedDom = solveHandKinematics(
        { x: -mWrist.x, y: mWrist.y, z: mWrist.z },
        { x: -mKnuckle.x, y: mKnuckle.y, z: mKnuckle.z },
        { x: -mTip.x, y: mTip.y, z: mTip.z },
        activeShape,
        activePalm
      );
      this.liveBaseForearm = { ...leftElbow3D };
      this.liveBaseWrist = mWrist;
      this.liveBaseKnuckle = { x: -solvedDom.knuckleIndex.x, y: solvedDom.knuckleIndex.y, z: solvedDom.knuckleIndex.z };
      this.liveBasePalm = { x: -solvedDom.palm.x, y: solvedDom.palm.y, z: solvedDom.palm.z };
      this.liveBaseTip = { x: -solvedDom.tipIndex.x, y: solvedDom.tipIndex.y, z: solvedDom.tipIndex.z };

      const pForearm = project3DToSvg(leftElbow3D, cam, ox, oy);
      const pWrist = project3DToSvg(this.liveBaseWrist, cam, ox, oy);
      const pPalm = project3DToSvg(this.liveBasePalm, cam, ox, oy);
      const pKnuckleIndex = project3DToSvg(this.liveBaseKnuckle, cam, ox, oy);
      const pTipIndex = project3DToSvg(this.liveBaseTip, cam, ox, oy);
      const pTipMid = project3DToSvg({ x: -solvedDom.tipMid.x, y: solvedDom.tipMid.y, z: solvedDom.tipMid.z }, cam, ox, oy);
      const pTipRing = project3DToSvg({ x: -solvedDom.tipRing.x, y: solvedDom.tipRing.y, z: solvedDom.tipRing.z }, cam, ox, oy);
      const pTipPinky = project3DToSvg({ x: -solvedDom.tipPinky.x, y: solvedDom.tipPinky.y, z: solvedDom.tipPinky.z }, cam, ox, oy);
      const pThumbTip = project3DToSvg({ x: -solvedDom.thumbTip.x, y: solvedDom.thumbTip.y, z: solvedDom.thumbTip.z }, cam, ox, oy);
      const pThumbKnuckle = project3DToSvg({ x: -solvedDom.thumbKnuckle.x, y: solvedDom.thumbKnuckle.y, z: solvedDom.thumbKnuckle.z }, cam, ox, oy);

      baseGroup.innerHTML = `
        <line x1="${pForearm.x.toFixed(1)}" y1="${pForearm.y.toFixed(1)}" x2="${pWrist.x.toFixed(1)}" y2="${pWrist.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="10" stroke-linecap="round" />
        <line x1="${pWrist.x.toFixed(1)}" y1="${pWrist.y.toFixed(1)}" x2="${pPalm.x.toFixed(1)}" y2="${pPalm.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="9" stroke-linecap="round" />
        <ellipse cx="${pPalm.x.toFixed(1)}" cy="${pPalm.y.toFixed(1)}" rx="10" ry="8.5" fill="url(#bsl-hand-base)" stroke="#cb7c49" stroke-width="1.4" />
        <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pThumbKnuckle.x.toFixed(1)}" y2="${pThumbKnuckle.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4.8" stroke-linecap="round" />
        <line x1="${pThumbKnuckle.x.toFixed(1)}" y1="${pThumbKnuckle.y.toFixed(1)}" x2="${pThumbTip.x.toFixed(1)}" y2="${pThumbTip.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4" stroke-linecap="round" />
        <circle cx="${pThumbTip.x.toFixed(1)}" cy="${pThumbTip.y.toFixed(1)}" r="3" fill="#ffedd5" stroke="#cb7c49" stroke-width="1" />
        <line x1="${pKnuckleIndex.x.toFixed(1)}" y1="${pKnuckleIndex.y.toFixed(1)}" x2="${pTipIndex.x.toFixed(1)}" y2="${pTipIndex.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="5.2" stroke-linecap="round" />
        <circle cx="${pKnuckleIndex.x.toFixed(1)}" cy="${pKnuckleIndex.y.toFixed(1)}" r="2.8" fill="#f8be93" />
        <circle cx="${pTipIndex.x.toFixed(1)}" cy="${pTipIndex.y.toFixed(1)}" r="3.5" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" filter="url(#bsl-glow)" />
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
      const iWrist = this.lerpRaw3D(this.prevBaseWrist, BSL_BASE_HAND.wrist, easeT);
      const iPalm = this.lerpRaw3D(this.prevBasePalm, BSL_BASE_HAND.palm, easeT);
      const palmShiftX = iPalm.x - BSL_BASE_HAND.palm.x;
      const palmShiftY = iPalm.y - BSL_BASE_HAND.palm.y;
      const palmShiftZ = iPalm.z - BSL_BASE_HAND.palm.z;

      this.liveBaseForearm = { ...leftElbow3D };
      this.liveBaseWrist = iWrist;
      this.liveBaseKnuckle = { x: iPalm.x, y: iPalm.y - 12, z: iPalm.z + 2 };
      this.liveBasePalm = iPalm;
      this.liveBaseTip = {
        x: BSL_BASE_HAND.fingertips[2].x + palmShiftX,
        y: BSL_BASE_HAND.fingertips[2].y + palmShiftY,
        z: BSL_BASE_HAND.fingertips[2].z + palmShiftZ,
      };

      const pForearm = project3DToSvg(leftElbow3D, cam, ox, oy);
      const pWrist = project3DToSvg(iWrist, cam, ox, oy);
      const pPalm = project3DToSvg(iPalm, cam, ox, oy);

      let fingersSvg = '';
      BSL_BASE_HAND.fingertips.forEach((tipPt, idx) => {
        const shiftedTip: Point3D = {
          x: tipPt.x + palmShiftX,
          y: tipPt.y + palmShiftY,
          z: tipPt.z + palmShiftZ,
        };
        const pTip = project3DToSvg(shiftedTip, cam, ox, oy);
        const isTarget = this.targetPose.isVowel && this.targetPose.activeVowelIndex === idx;
        const color = isTarget ? '#f59e0b' : '#38bdf8';
        fingersSvg += `
          <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTip.x.toFixed(1)}" y2="${pTip.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4.8" stroke-linecap="round" />
          <circle cx="${pTip.x.toFixed(1)}" cy="${pTip.y.toFixed(1)}" r="${isTarget ? '5.4' : '4'}" fill="${color}" stroke="#ffffff" stroke-width="1.2" filter="${isTarget ? 'url(#bsl-glow)' : 'none'}" />
          <circle cx="${pTip.x.toFixed(1)}" cy="${pTip.y.toFixed(1)}" r="1.5" fill="#ffffff" />
        `;
      });

      baseGroup.innerHTML = `
        <line x1="${pForearm.x.toFixed(1)}" y1="${pForearm.y.toFixed(1)}" x2="${pWrist.x.toFixed(1)}" y2="${pWrist.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="9.5" stroke-linecap="round" />
        <line x1="${pWrist.x.toFixed(1)}" y1="${pWrist.y.toFixed(1)}" x2="${pPalm.x.toFixed(1)}" y2="${pPalm.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="8.5" stroke-linecap="round" />
        <ellipse cx="${pPalm.x.toFixed(1)}" cy="${pPalm.y.toFixed(1)}" rx="11.5" ry="9.5" fill="url(#bsl-hand-base)" stroke="#cb7c49" stroke-width="1.5" />
        <path d="M ${(pPalm.x - 5).toFixed(1)} ${pPalm.y.toFixed(1)} Q ${pPalm.x.toFixed(1)} ${(pPalm.y + 3).toFixed(1)} ${(pPalm.x + 5).toFixed(1)} ${pPalm.y.toFixed(1)}" stroke="#d99564" stroke-width="1" fill="none" />
        ${fingersSvg}
      `;
      return;
    }

    // 3. Base Workbench Anchor ('base-hold')
    if (mode === 'base-hold') {
      const targetWrist: Point3D = { x: -58, y: 52, z: 10 };
      const targetPalm: Point3D = { x: -42, y: 36, z: 15 };
      const targetTip: Point3D = { x: -22, y: 33, z: 16 };

      const baseWrist = this.lerpRaw3D(this.prevBaseWrist, targetWrist, easeT);
      const baseHoldAnchor = this.lerpRaw3D(this.prevBasePalm, targetPalm, easeT);
      const baseTip = this.lerpRaw3D(this.prevBaseTip, targetTip, easeT);

      this.liveBaseForearm = { ...leftElbow3D };
      this.liveBaseWrist = baseWrist;
      this.liveBaseKnuckle = baseHoldAnchor;
      this.liveBasePalm = baseHoldAnchor;
      this.liveBaseTip = baseTip;

      const pF = project3DToSvg(leftElbow3D, cam, ox, oy);
      const pW = project3DToSvg(baseWrist, cam, ox, oy);
      const pP = project3DToSvg(baseHoldAnchor, cam, ox, oy);
      const pFingers = project3DToSvg(baseTip, cam, ox, oy);

      baseGroup.innerHTML = `
        <line x1="${pF.x.toFixed(1)}" y1="${pF.y.toFixed(1)}" x2="${pW.x.toFixed(1)}" y2="${pW.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="9.5" stroke-linecap="round" />
        <line x1="${pW.x.toFixed(1)}" y1="${pW.y.toFixed(1)}" x2="${pP.x.toFixed(1)}" y2="${pP.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="8.5" stroke-linecap="round" />
        <ellipse cx="${pP.x.toFixed(1)}" cy="${pP.y.toFixed(1)}" rx="12" ry="7.5" fill="url(#bsl-hand-base)" stroke="#0284c7" stroke-width="1.8" />
        <line x1="${pP.x.toFixed(1)}" y1="${pP.y.toFixed(1)}" x2="${pFingers.x.toFixed(1)}" y2="${pFingers.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="6.5" stroke-linecap="round" />
        <circle cx="${pFingers.x.toFixed(1)}" cy="${pFingers.y.toFixed(1)}" r="3" fill="#ffedd5" stroke="#cb7c49" stroke-width="1" />
      `;
      return;
    }

    // 3b. Override spatial anchor & Level 6 Discourse Buoys ('override', 'buoy-list', 'buoy-pointer')
    if (mode === 'override' || mode === 'buoy-list' || mode === 'buoy-pointer') {
      const ov = this.targetPose.baseHandOverride;
      const targetPalm: Point3D = ov?.palm || {
        x: BSL_BASE_HAND.palm.x + (ov?.shiftX || 0),
        y: BSL_BASE_HAND.palm.y + (ov?.shiftY || 0),
        z: BSL_BASE_HAND.palm.z + (ov?.shiftZ || 10),
      };
      const targetWrist: Point3D = ov?.wrist || {
        x: targetPalm.x - 16,
        y: targetPalm.y + 28,
        z: targetPalm.z - 8,
      };

      const anchorWrist = this.lerpRaw3D(this.prevBaseWrist, targetWrist, easeT);
      const anchorPalm = this.lerpRaw3D(this.prevBasePalm, targetPalm, easeT);

      this.liveBaseForearm = { ...leftElbow3D };
      this.liveBaseWrist = anchorWrist;
      this.liveBaseKnuckle = anchorPalm;
      this.liveBasePalm = anchorPalm;
      this.liveBaseTip = { x: anchorPalm.x, y: anchorPalm.y - 26, z: anchorPalm.z + 6 };

      const pF = project3DToSvg(leftElbow3D, cam, ox, oy);
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

    // 4. Symmetrical 5-Finger Ready Rest Posture ('rest') — springs smoothly from any prior base hand pose
    const targetRestWrist: Point3D = { x: -DOMINANT_REST_WRIST.x, y: DOMINANT_REST_WRIST.y + idleBreathY, z: DOMINANT_REST_WRIST.z };
    const targetRestKnuckle: Point3D = { x: -DOMINANT_REST_KNUCKLE.x, y: DOMINANT_REST_KNUCKLE.y + idleBreathY, z: DOMINANT_REST_KNUCKLE.z };
    const targetRestTip: Point3D = { x: -DOMINANT_REST_POSE.x, y: DOMINANT_REST_POSE.y + idleBreathY, z: DOMINANT_REST_POSE.z };

    const baseWrist = this.lerpRaw3D(this.prevBaseWrist, targetRestWrist, easeT);
    const baseKnuckle = this.lerpRaw3D(this.prevBaseKnuckle, targetRestKnuckle, easeT);
    const baseTip = this.lerpRaw3D(this.prevBaseTip, targetRestTip, easeT);

    // Solve 5-finger left hand kinematics by mirroring across sagittal plane
    const solvedMirror = solveHandKinematics(
      { x: -baseWrist.x, y: baseWrist.y, z: baseWrist.z },
      { x: -baseKnuckle.x, y: baseKnuckle.y, z: baseKnuckle.z },
      { x: -baseTip.x, y: baseTip.y, z: baseTip.z },
      'flat-closed',
      'in'
    );

    this.liveBaseForearm = { ...leftElbow3D };
    this.liveBaseWrist = baseWrist;
    this.liveBaseKnuckle = baseKnuckle;
    this.liveBasePalm = { x: -solvedMirror.palm.x, y: solvedMirror.palm.y, z: solvedMirror.palm.z };
    this.liveBaseTip = baseTip;

    const pForearm = project3DToSvg(leftElbow3D, cam, ox, oy);
    const pWrist = project3DToSvg(baseWrist, cam, ox, oy);
    const pPalm = project3DToSvg(this.liveBasePalm, cam, ox, oy);
    const pKnuckleIndex = project3DToSvg({ x: -solvedMirror.knuckleIndex.x, y: solvedMirror.knuckleIndex.y, z: solvedMirror.knuckleIndex.z }, cam, ox, oy);
    const pTipIndex = project3DToSvg({ x: -solvedMirror.tipIndex.x, y: solvedMirror.tipIndex.y, z: solvedMirror.tipIndex.z }, cam, ox, oy);
    const pTipMid = project3DToSvg({ x: -solvedMirror.tipMid.x, y: solvedMirror.tipMid.y, z: solvedMirror.tipMid.z }, cam, ox, oy);
    const pTipRing = project3DToSvg({ x: -solvedMirror.tipRing.x, y: solvedMirror.tipRing.y, z: solvedMirror.tipRing.z }, cam, ox, oy);
    const pTipPinky = project3DToSvg({ x: -solvedMirror.tipPinky.x, y: solvedMirror.tipPinky.y, z: solvedMirror.tipPinky.z }, cam, ox, oy);
    const pThumbTip = project3DToSvg({ x: -solvedMirror.thumbTip.x, y: solvedMirror.thumbTip.y, z: solvedMirror.thumbTip.z }, cam, ox, oy);
    const pThumbKnuckle = project3DToSvg({ x: -solvedMirror.thumbKnuckle.x, y: solvedMirror.thumbKnuckle.y, z: solvedMirror.thumbKnuckle.z }, cam, ox, oy);

    baseGroup.innerHTML = `
      <line x1="${pForearm.x.toFixed(1)}" y1="${pForearm.y.toFixed(1)}" x2="${pWrist.x.toFixed(1)}" y2="${pWrist.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="9.5" stroke-linecap="round" />
      <line x1="${pWrist.x.toFixed(1)}" y1="${pWrist.y.toFixed(1)}" x2="${pPalm.x.toFixed(1)}" y2="${pPalm.y.toFixed(1)}" stroke="url(#bsl-skin-base)" stroke-width="8.5" stroke-linecap="round" />
      <ellipse cx="${pPalm.x.toFixed(1)}" cy="${pPalm.y.toFixed(1)}" rx="9.5" ry="8" fill="url(#bsl-hand-base)" stroke="#cb7c49" stroke-width="1.3" />
      <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pThumbKnuckle.x.toFixed(1)}" y2="${pThumbKnuckle.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4.5" stroke-linecap="round" />
      <line x1="${pThumbKnuckle.x.toFixed(1)}" y1="${pThumbKnuckle.y.toFixed(1)}" x2="${pThumbTip.x.toFixed(1)}" y2="${pThumbTip.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="3.8" stroke-linecap="round" />
      <circle cx="${pThumbTip.x.toFixed(1)}" cy="${pThumbTip.y.toFixed(1)}" r="2.8" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.9" />
      <line x1="${pKnuckleIndex.x.toFixed(1)}" y1="${pKnuckleIndex.y.toFixed(1)}" x2="${pTipIndex.x.toFixed(1)}" y2="${pTipIndex.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4.8" stroke-linecap="round" />
      <circle cx="${pKnuckleIndex.x.toFixed(1)}" cy="${pKnuckleIndex.y.toFixed(1)}" r="2.5" fill="#f8be93" />
      <circle cx="${pTipIndex.x.toFixed(1)}" cy="${pTipIndex.y.toFixed(1)}" r="2.8" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.9" />
      <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipMid.x.toFixed(1)}" y2="${pTipMid.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="4" stroke-linecap="round" />
      <circle cx="${pTipMid.x.toFixed(1)}" cy="${pTipMid.y.toFixed(1)}" r="2.3" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />
      <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipRing.x.toFixed(1)}" y2="${pTipRing.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="3.6" stroke-linecap="round" />
      <circle cx="${pTipRing.x.toFixed(1)}" cy="${pTipRing.y.toFixed(1)}" r="2.1" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />
      <line x1="${pPalm.x.toFixed(1)}" y1="${pPalm.y.toFixed(1)}" x2="${pTipPinky.x.toFixed(1)}" y2="${pTipPinky.y.toFixed(1)}" stroke="url(#bsl-hand-base)" stroke-width="3.1" stroke-linecap="round" />
      <circle cx="${pTipPinky.x.toFixed(1)}" cy="${pTipPinky.y.toFixed(1)}" r="1.9" fill="#ffedd5" stroke="#cb7c49" stroke-width="0.8" />
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
    palm: any,
    rightElbow3D: Point3D = { x: 66, y: 35, z: -5 }
  ) {
    const domGroup = this.queryAvatarElement('#bsl-layer-dominant-hand');
    if (!domGroup) return;

    // Kinematic Hand Solver with forearm anchored directly to the anatomical right elbow
    const solved = solveHandKinematics(wrist, knuckle, tip, shape, palm);

    const pForearm = project3DToSvg(rightElbow3D, cam, ox, oy);
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

  private dockBackFromPiP(closeWindow = false) {
    const pipWin = this.pipWindow;
    this.stopAnimationLoop();
    this.pipWindow = null;

    if (closeWindow && pipWin && !pipWin.closed) {
      try {
        pipWin.close();
      } catch (_) {}
    }

    if (this.avatarWrapper && this.stageHostContainer && this.avatarWrapper.parentElement !== this.stageHostContainer) {
      try {
        document.adoptNode(this.avatarWrapper);
      } catch (_) {}
      this.stageHostContainer.appendChild(this.avatarWrapper);
    }

    const pipBtn = this.querySelector<HTMLButtonElement>('#bsl-btn-pip');
    if (pipBtn) {
      pipBtn.style.background = '#1e293b';
      pipBtn.style.color = '#38bdf8';
      pipBtn.title = 'Pop-out Window (Document Picture-in-Picture)';
    }

    this.applyPipLayout();
    if (this.isConnected) {
      this.startAnimationLoop();
    }
  }

  private toggleInPageFloatingPopout() {
    if (this.isFloatingPopout && this.layoutState.mode === 'floating') {
      this.isFloatingPopout = false;
      this.layoutState.compact = true;
      this.setDockCorner(this.layoutState.corner || 'bottom-right');
      return;
    }

    this.isFloatingPopout = true;
    this.layoutState.compact = false;
    this.layoutState.mode = 'floating';
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const coords = this.computeClampedFloatingCoords(vw - 324, 84);
    this.layoutState.left = coords.left;
    this.layoutState.top = coords.top;
    this.applyPipLayout();
    this.saveLayout();

    const hudNmf = this.queryAvatarElement('#bsl-hud-nmf');
    if (hudNmf && this.isIdle) {
      hudNmf.textContent = 'Undocked window • Drag header to move';
    }
  }

  /**
   * Native Browser Document Picture-in-Picture Uncoupling
   * Pops out the entire live 60 FPS vector avatar into an always-on-top desktop window,
   * with automatic in-viewport floating window fallback when running inside an iframe.
   */
  public async toggleDocumentPiP() {
    // 1. If already popped out in native OS PiP, close PiP and dock back cleanly
    if (this.pipWindow && !this.pipWindow.closed) {
      this.dockBackFromPiP(true);
      return;
    }

    // 2. Detect embedded iframe context (W3C Document PiP is restricted to top-level browsing contexts)
    let isEmbeddedIframe = false;
    try {
      isEmbeddedIframe = window.self !== window.top;
    } catch (_) {
      isEmbeddedIframe = true;
    }

    if (isEmbeddedIframe || !('documentPictureInPicture' in window)) {
      this.toggleInPageFloatingPopout();
      return;
    }

    try {
      // 3. Request native always-on-top Document PiP window
      const pipWin: Window = await (window as any).documentPictureInPicture.requestWindow({
        width: 340,
        height: 480,
        disallowReturnToOpener: false,
      });

      if (!pipWin || !this.avatarWrapper || !this.stageHostContainer) return;
      this.pipWindow = pipWin;
      this.isFloatingPopout = false;

      // 4. Copy styles to PiP window
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = pipWin.document.createElement('style');
          style.textContent = cssRules;
          pipWin.document.head.appendChild(style);
        } catch (_) {
          const link = pipWin.document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.href = (styleSheet as CSSStyleSheet).href || '';
          pipWin.document.head.appendChild(link);
        }
      });

      // 5. Setup PiP body styles as flex column so avatar fills remaining height cleanly
      pipWin.document.body.style.cssText = 'margin:0; padding:0; width:100vw; height:100vh; display:flex; flex-direction:column; background:#020617; color:#f8fafc; font-family:system-ui, -apple-system, sans-serif; overflow:hidden;';

      // 5b. Header Bar for PiP window with prominent Dock button
      const pipHeader = pipWin.document.createElement('div');
      pipHeader.style.cssText = 'background:#0f172a; padding:6px 12px; border-bottom:1px solid #1e293b; display:flex; align-items:center; justify-content:space-between; user-select:none; flex-shrink:0;';
      pipHeader.innerHTML = `
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:0.9rem;">🧏</span>
          <span style="font-size:0.72rem; font-weight:800; color:#38bdf8; letter-spacing:0.5px;">BSL IN-VISION (ALWAYS ON TOP)</span>
        </div>
        <button type="button" id="pip-btn-redock" style="background:#0284c7; border:none; color:#ffffff; border-radius:4px; font-size:0.7rem; font-weight:700; padding:2px 8px; cursor:pointer;" title="Dock back to webpage">
          ⚓ Dock to Page
        </button>
      `;
      pipWin.document.body.appendChild(pipHeader);
      pipHeader.querySelector('#pip-btn-redock')?.addEventListener('click', () => {
        this.dockBackFromPiP(true);
      });

      // 6. Transfer live avatar wrapper and re-bind animation loop to PiP
      const deck = this.avatarWrapper.querySelector<HTMLElement>('#bsl-interactive-deck');
      if (deck) deck.style.display = 'flex';
      pipWin.document.body.appendChild(this.avatarWrapper);

      this.applyPipLayout();
      this.startAnimationLoop();

      // 7. Dock back home on PiP window close (pagehide + unload fallback)
      const onPipClosed = () => {
        if (this.pipWindow === pipWin) {
          this.dockBackFromPiP(false);
        }
      };
      pipWin.addEventListener('pagehide', onPipClosed);
      pipWin.addEventListener('unload', onPipClosed);
    } catch (err) {
      console.warn('[BSL Interpreter] Native Document PiP unavailable, falling back to floating pop-out:', err);
      this.dockBackFromPiP(false);
      this.toggleInPageFloatingPopout();
    }
  }
}

// Custom Element Registration
if (!customElements.get('native-bsl-interpreter')) {
  customElements.define('native-bsl-interpreter', NativeBslInterpreterElement);
}

export const NativeBslInterpreter = NativeBslInterpreterElement;
export default NativeBslInterpreterElement;
