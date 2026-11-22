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
  DOMINANT_REST_POSE,
  DOMINANT_REST_KNUCKLE,
  DOMINANT_REST_WRIST,
  evaluateBslEase,
} from '../utils/bslAlphabet';
import {
  analyzeAndTransformBslGrammar,
  BslGrammarMode,
  BslGrammarAnalysis,
} from '../utils/bslGrammarEngine';
import {
  buildBslInterpreterShellHtml,
  buildBslQuickPillsMarkup,
  getMakatonSymbolPictogram,
} from './bsl/bslInterpreterTemplate';
import {
  buildLociLayerSvg,
  buildBodyLayerSvg,
  buildHeadLayerSvg,
  buildBaseHandLayerSvg,
  buildDominantHandLayerSvg,
} from './bsl/bslAvatarSvgRenderer';
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
    this.innerHTML = buildBslInterpreterShellHtml(this.voiceEnabled, this.grammarMode);
    this.stageHostContainer = this.querySelector('#bsl-stage-container');
    this.avatarWrapper = this.querySelector('#bsl-avatar-wrapper');
  }

  private getQuickPillsMarkup(): string {
    return buildBslQuickPillsMarkup(this.grammarMode);
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

  private getMakatonSymbolPictogram(wordUpper: string): string {
    return getMakatonSymbolPictogram(wordUpper);
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
    this.renderBaseHandLayer(activeCam, originX, originY, baseMode, activeShape, activePalm, easeT, leftElbow3D, idleBreathY);
    this.renderDominantHandLayer(activeCam, originX, originY, wrist, knuckle, tip, activeShape, activePalm, rightElbow3D);
  }

  private renderLociLayer(cam: any, ox: number, oy: number) {
    const lociGroup = this.queryAvatarElement('#bsl-layer-loci');
    if (!lociGroup) return;
    const html = buildLociLayerSvg(cam, ox, oy, this.grammarMode);
    if (!html) {
      if (lociGroup.innerHTML) lociGroup.innerHTML = '';
      return;
    }
    lociGroup.innerHTML = html;
  }

  private renderBodyLayer(cam: any, ox: number, oy: number, leftElbow3D: Point3D, rightElbow3D: Point3D) {
    const bodyGroup = this.queryAvatarElement('#bsl-layer-body');
    if (!bodyGroup) return;
    bodyGroup.innerHTML = buildBodyLayerSvg(cam, ox, oy, leftElbow3D, rightElbow3D);
  }

  private renderHeadLayer(cam: any, ox: number, oy: number, nmf: BslNmf) {
    const headGroup = this.queryAvatarElement('#bsl-layer-head');
    if (!headGroup) return;
    headGroup.innerHTML = buildHeadLayerSvg({
      cam,
      ox,
      oy,
      nmf,
      currentAnimProgress: this.currentAnimProgress,
      eyeBlinkProgress: this.eyeBlinkProgress,
      isIdle: this.isIdle,
    });
  }

  private renderBaseHandLayer(
    cam: any,
    ox: number,
    oy: number,
    mode: BslBaseHandMode,
    activeShape: any,
    activePalm: any,
    easeT = 1.0,
    leftElbow3D: Point3D = { x: -66, y: 35, z: -5 },
    idleBreathY = 0
  ) {
    const baseGroup = this.queryAvatarElement('#bsl-layer-base-hand');
    if (!baseGroup) return;
    const result = buildBaseHandLayerSvg({
      cam,
      ox,
      oy,
      mode,
      activeShape,
      activePalm,
      easeT,
      leftElbow3D,
      idleBreathY,
      targetPose: this.targetPose,
      prevBaseWrist: this.prevBaseWrist,
      prevBaseKnuckle: this.prevBaseKnuckle,
      prevBasePalm: this.prevBasePalm,
      prevBaseTip: this.prevBaseTip,
    });
    this.liveBaseForearm = result.liveBaseForearm;
    this.liveBaseWrist = result.liveBaseWrist;
    this.liveBaseKnuckle = result.liveBaseKnuckle;
    this.liveBasePalm = result.liveBasePalm;
    this.liveBaseTip = result.liveBaseTip;
    baseGroup.innerHTML = result.html;
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
    domGroup.innerHTML = buildDominantHandLayerSvg(cam, ox, oy, wrist, knuckle, tip, shape, palm, rightElbow3D);
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
