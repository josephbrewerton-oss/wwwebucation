/**
 * src/components/NativeBslInterpreter.ts
 *
 * St Joseph's Educational Media Suite - Real-Time "In-Vision" BSL Level 6 Vector Interpreter
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * ZERO-REACT, zero-video, real-time 3D vector BSL signing engine.
 * Full BSL Level 6 Linguistic Implementation:
 * - Two distinct volumetric hands (Dominant & Non-Dominant) with full anatomical finger articulation
 * - Symmetrical 2-handed signs (PRAY, CHURCH, BIBLE, FORCE, EQUAL, SCIENCE, CIRCUITS)
 * - Two-handed BANZSL manual alphabet & vowel board
 * - High-contrast expressive facial rig (eyebrow syntax, mouth morphemes 'mm', 'th', 'tight-lips', 'puffed-cheeks')
 * - Direct speech audio synthesis & live interactive practice buttons
 * - Live connection to all 60 curriculum simulator narration streams
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
  decomposeTextToBslStreamWithLexicon,
  lookupBslSign,
  BSL_CURRICULUM_LEXICON,
  registerBslSigns,
  lookupMakatonSign,
} from '../utils/bslLexicon';
import { parseAstToLexicon } from '../utils/bslAstCodec';
import {
  analyzeAndTransformBslGrammar,
  BslGrammarMode,
  BslGrammarAnalysis,
} from '../utils/bslGrammarEngine';
import {
  subscribeBslSpeech,
  subscribeBsl,
  toggleBsl,
  BslSpeechPayload,
} from '../services/bslGlobalStore';

const REST_POSE: BslHandPose = {
  letter: ' ',
  label: 'Neutral Rest',
  rule: 'Hands relaxed in natural signing readiness',
  isVowel: false,
  targetTip: DOMINANT_REST_POSE,
  targetKnuckle: DOMINANT_REST_KNUCKLE,
  targetWrist: DOMINANT_REST_WRIST,
  shape: 'flat-closed',
  baseHandMode: 'rest',
};

export class NativeBslInterpreterElement extends HTMLElement {
  private queue: BslHandPose[] = [];
  private currentPose: BslHandPose = { ...REST_POSE };
  private prevPose: BslHandPose = { ...REST_POSE };
  private transitionT = 1.0;
  private poseDuration = 480; // ms per sign keyframe
  private holdTimer = 0;
  private animFrameId: number | null = null;
  private lastTime = 0;
  private isPlaying = false;
  private grammarMode: BslGrammarMode = 'bsl-natural';
  private viewAngle: 'receiver' | 'signer' = 'receiver';
  private orbitYaw = 0;
  private orbitPitch = 0;
  private activeSentence = '';
  private activeGloss = 'WELCOME';
  private activeClassifier = '';
  private activeAspect = '';
  private isVoiceOn = true;
  private unsubscribeSpeech?: () => void;
  private messageListener?: (e: MessageEvent) => void;

  // Window dragging & orbiting
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private cardLeft = 0;
  private cardTop = 0;
  private isOrbitDragging = false;
  private orbitStartX = 0;
  private orbitStartY = 0;

  connectedCallback() {
    this.renderShell();
    this.bindEvents();
    this.loadLexicon();
    this.startSigningLoop();

    // Listen to lesson speech from store
    this.unsubscribeSpeech = subscribeBslSpeech((payload: BslSpeechPayload) => {
      if (payload.subtitle) {
        this.processUtterance(payload.subtitle);
      } else if (payload.word) {
        this.processUtterance(payload.word);
      }
    });

    // Listen directly to postMessage events from any simulator iframe
    this.messageListener = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'SUBTITLE_UPDATE' && e.data.text) {
        this.processUtterance(e.data.text);
      } else if (e.data.type === 'KEYFRAME' && e.data.title) {
        this.processUtterance(`${e.data.title}. ${e.data.rule || ''}`);
      } else if (e.data.type === 'PRESETCHANGE' && e.data.title) {
        this.processUtterance(`Lesson: ${e.data.title}`);
      }
    };
    window.addEventListener('message', this.messageListener);

    // Initial welcoming introduction to demonstrate two-handed signing right away!
    setTimeout(() => {
      if (this.queue.length === 0) {
        this.processUtterance("Welcome to St Joseph's British Sign Language Interpreter");
      }
    }, 400);
  }

  disconnectedCallback() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.unsubscribeSpeech) this.unsubscribeSpeech();
    if (this.messageListener) window.removeEventListener('message', this.messageListener);
  }

  private async loadLexicon() {
    try {
      const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
      const res = await fetch(`${base}lexicons/bsl-signs.ast`);
      if (res.ok) {
        const astContent = await res.text();
        const diskSigns = parseAstToLexicon(astContent);
        registerBslSigns(diskSigns);
      }
    } catch (_) {}
  }

  public processUtterance(text: string) {
    if (!text || !text.trim()) return;
    this.activeSentence = text.trim();
    
    // 1. Level 6 Grammar Analysis & Structural Reordering
    const analysis: BslGrammarAnalysis = analyzeAndTransformBslGrammar(text, this.grammarMode);
    
    // 2. Extract telemetry
    const glosses = analysis.glossSequence || analysis.tokens.map(t => t.gloss).join(' ');
    this.activeGloss = glosses || text;
    this.activeClassifier = analysis.tokens
      .filter(t => t.classifier)
      .map(t => `${t.classifier!.type.toUpperCase()}`)
      .join(', ');
    this.activeAspect = analysis.tokens.find(t => t.aspect)?.aspect || '';

    // 3. Obtain BSL Keyframe stream (analysis.stream contains directional agreement, classifiers & whole signs)
    const poses = (analysis.stream && analysis.stream.length > 0)
      ? analysis.stream
      : decomposeTextToBslStreamWithLexicon(analysis.tokens.map(t => t.cleanWord || t.originalWord).join(' '));

    // 4. Enqueue into signing buffer
    if (poses.length > 0) {
      this.queue.push(...poses);
    }

    // 5. Speak text if voice is active
    if (this.isVoiceOn && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(this.activeSentence);
        u.lang = 'en-GB';
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
      } catch (_) {}
    }

    this.updateHud();
  }

  private renderShell() {
    this.innerHTML = `
      <div id="bsl-in-vision-card" style="position:fixed; bottom:20px; right:20px; z-index:9999; width:380px; max-width:calc(100vw - 32px); background:#090d16; border:2px solid #0284c7; border-radius:16px; box-shadow:0 16px 50px rgba(0,0,0,0.75); overflow:hidden; font-family:system-ui,-apple-system,sans-serif; color:#f8fafc; user-select:none;">
        
        <!-- Header Controls Bar -->
        <div id="bsl-header-drag" style="background:linear-gradient(90deg, #0f172a 0%, #1e293b 100%); padding:8px 12px; border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center; cursor:grab;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.1rem;">🖐️</span>
            <div>
              <span style="font-size:0.8rem; font-weight:800; color:#38bdf8; display:block; line-height:1.1;">
                BSL Level 6 Interpreter
              </span>
              <span style="font-size:0.62rem; color:#94a3b8; text-transform:uppercase; letter-spacing:0.04em;">
                Two-Handed 3D Vector Avatar
              </span>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:5px;">
            <!-- Voice Audio Toggle -->
            <button type="button" id="bsl-btn-voice" style="background:${this.isVoiceOn ? '#0369a1' : '#1e293b'}; border:1px solid #475569; color:#f8fafc; font-size:0.68rem; font-weight:700; padding:3px 7px; border-radius:6px; cursor:pointer;" title="Toggle Speech Audio Narration">
              ${this.isVoiceOn ? '🔊 Audio' : '🔇 Mute'}
            </button>

            <!-- POV Toggle Button -->
            <button type="button" id="bsl-btn-pov" style="background:#1e293b; border:1px solid #475569; color:#f8fafc; font-size:0.68rem; font-weight:700; padding:3px 7px; border-radius:6px; cursor:pointer;" title="Switch between Receiver POV (front) and Signer POV (first-person)">
              ${this.viewAngle === 'receiver' ? 'Front' : 'Signer'}
            </button>

            <!-- Mode Selector Button -->
            <select id="bsl-select-mode" style="background:#1e293b; border:1px solid #475569; color:#38bdf8; font-size:0.68rem; font-weight:700; padding:2px 5px; border-radius:6px; cursor:pointer; outline:none;">
              <option value="bsl-natural" ${this.grammarMode === 'bsl-natural' ? 'selected' : ''}>BSL L6</option>
              <option value="makaton" ${this.grammarMode === 'makaton' ? 'selected' : ''}>Makaton</option>
              <option value="fingerspell" ${this.grammarMode === 'fingerspell' ? 'selected' : ''}>Fingerspell</option>
            </select>

            <!-- Close Button -->
            <button type="button" id="bsl-btn-close" style="background:transparent; border:none; color:#94a3b8; font-size:1.1rem; cursor:pointer; padding:0 4px;" title="Close BSL In-Vision Overlay">
              ✕
            </button>
          </div>
        </div>

        <!-- 3D Perspective Vector Canvas Viewport -->
        <div id="bsl-stage-container" style="position:relative; width:100%; height:260px; background:#040711; overflow:hidden;">
          <svg id="bsl-avatar-svg" viewBox="0 0 320 250" style="width:100%; height:100%; display:block; cursor:crosshair;">
            <defs>
              <linearGradient id="bslHumanSkin" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#ffedd5" />
                <stop offset="60%" stop-color="#fed7aa" />
                <stop offset="100%" stop-color="#f97316" />
              </linearGradient>
              <linearGradient id="bslHumanSkinPalm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#fff7ed" />
                <stop offset="50%" stop-color="#fed7aa" />
                <stop offset="100%" stop-color="#fb923c" />
              </linearGradient>
              <linearGradient id="bslShirtNavy" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#0f172a" />
                <stop offset="100%" stop-color="#1e293b" />
              </linearGradient>
              <linearGradient id="bslLipGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#dc2626" />
                <stop offset="100%" stop-color="#991b1b" />
              </linearGradient>
              <filter id="bslGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <!-- Background Atmosphere & Spatial Register Grid -->
            <rect width="320" height="250" fill="#040711" />
            <g id="bsl-spatial-grid" opacity="0.3">
              <!-- Spatial Loci Points -->
              <circle cx="55" cy="140" r="3.5" fill="#38bdf8" />
              <text x="55" y="153" font-size="8" fill="#64748b" text-anchor="middle">LOC_A</text>
              <circle cx="265" cy="140" r="3.5" fill="#38bdf8" />
              <text x="265" y="153" font-size="8" fill="#64748b" text-anchor="middle">LOC_B</text>
              <circle cx="160" cy="30" r="3.5" fill="#ca8a04" />
              <text x="160" y="22" font-size="8" fill="#ca8a04" text-anchor="middle">LOC_HIGH</text>
            </g>

            <!-- Avatar Upper Torso & Dark Navy Shirt Silhouette -->
            <g id="bsl-avatar-torso">
              <path id="bsl-torso-path" d="M 65,250 L 95,160 Q 160,148 225,160 L 255,250 Z" fill="url(#bslShirtNavy)" stroke="#334155" stroke-width="2" />
              <!-- Collar with clean V-neck notch -->
              <path d="M 144,156 L 160,178 L 176,156 Z" fill="#090d16" stroke="#475569" stroke-width="1.5" />
            </g>

            <!-- Avatar Head & Expressive Facial Rig (NMF) -->
            <g id="bsl-avatar-head">
              <!-- Neck -->
              <rect x="150" y="115" width="20" height="25" fill="#fed7aa" stroke="#c2410c" stroke-width="1" />
              
              <!-- Head Silhouette -->
              <ellipse id="bsl-head-oval" cx="160" cy="80" rx="30" ry="38" fill="url(#bslHumanSkin)" stroke="#ea580c" stroke-width="1.8" />
              
              <!-- Hair Crown -->
              <path id="bsl-hair-crown" d="M 130,70 C 130,40 190,40 190,70 C 182,60 138,60 130,70 Z" fill="#1e293b" />
              
              <!-- Left Eye (Whites, Iris, Pupil) -->
              <ellipse cx="145" cy="74" rx="6.5" ry="4.5" fill="#ffffff" stroke="#0f172a" stroke-width="1" />
              <circle id="bsl-iris-left" cx="145" cy="74" r="3" fill="#0284c7" />
              <circle cx="145" cy="74" r="1.3" fill="#090d16" />

              <!-- Right Eye (Whites, Iris, Pupil) -->
              <ellipse cx="175" cy="74" rx="6.5" ry="4.5" fill="#ffffff" stroke="#0f172a" stroke-width="1" />
              <circle id="bsl-iris-right" cx="175" cy="74" r="3" fill="#0284c7" />
              <circle cx="175" cy="74" r="1.3" fill="#090d16" />

              <!-- Left Eyebrow (Expressive syntax curvature) -->
              <path id="bsl-eyebrow-left" d="M 136,66 Q 145,61 154,66" fill="none" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round" />

              <!-- Right Eyebrow (Expressive syntax curvature) -->
              <path id="bsl-eyebrow-right" d="M 166,66 Q 175,61 184,66" fill="none" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round" />

              <!-- Nose Bridge and Nostrils -->
              <path d="M 160,72 L 157,83 L 163,83" fill="none" stroke="#c2410c" stroke-width="1.8" stroke-linecap="round" />

              <!-- Expressive Mouth with Oral Cavity and Lips -->
              <g id="bsl-mouth-group">
                <!-- Inner Oral Cavity -->
                <path id="bsl-mouth-cavity" d="M 148,98 Q 160,102 172,98 Q 160,105 148,98 Z" fill="#3d0a12" opacity="0.9" />
                <!-- Subtle Upper Teeth Accent -->
                <rect id="bsl-mouth-teeth" x="154" y="97" width="12" height="2.5" rx="1" fill="#f8fafc" opacity="0.85" />
                <!-- Vermilion Lip Line -->
                <path id="bsl-mouth-path" d="M 148,98 Q 160,102 172,98" fill="none" stroke="url(#bslLipGradient)" stroke-width="3" stroke-linecap="round" />
              </g>
            </g>

     <!-- ============================================================== -->
            <!-- 3D NON-DOMINANT BASE HAND (Left Hand) - Authentic 2-Handed BSL -->
            <!-- ============================================================== -->
            <g id="bsl-base-hand-group">
              <!-- Left Forearm Bone -->
              <line id="bsl-base-arm" x1="95" y1="150" x2="115" y2="135" stroke="#c2410c" stroke-width="10" stroke-linecap="round" opacity="0.95" />
              <!-- Left Wrist Joint -->
              <circle id="bsl-base-wrist" cx="115" cy="135" r="8" fill="#ea580c" stroke="#fed7aa" stroke-width="1.2" />
              <!-- Left Palm Cushion Ellipse -->
              <ellipse id="bsl-base-palm-poly" cx="125" cy="125" rx="12" ry="14" fill="url(#bslHumanSkinPalm)" stroke="#ea580c" stroke-width="1.8" />
              <!-- Left Eminence Mound (Thumb base) -->
              <circle id="bsl-base-eminence" cx="120" cy="128" r="6.5" fill="#f97316" opacity="0.5" />
              <!-- 5 Left Articulated Finger Bones with Joint Thickness -->
              <line id="bsl-base-finger-0" x1="120" y1="125" x2="105" y2="115" stroke="#f97316" stroke-width="6.5" stroke-linecap="round" />
              <line id="bsl-base-finger-1" x1="125" y1="120" x2="115" y2="98" stroke="#f97316" stroke-width="6" stroke-linecap="round" />
              <line id="bsl-base-finger-2" x1="130" y1="122" x2="128" y2="94" stroke="#f97316" stroke-width="6" stroke-linecap="round" />
              <line id="bsl-base-finger-3" x1="135" y1="125" x2="140" y2="98" stroke="#f97316" stroke-width="5.5" stroke-linecap="round" />
              <line id="bsl-base-finger-4" x1="140" y1="128" x2="150" y2="106" stroke="#f97316" stroke-width="5" stroke-linecap="round" />
              <!-- Left Primary Fingertip (for 2-handed mirror signs) -->
              <circle id="bsl-base-tip" cx="115" cy="98" r="6" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" opacity="0" />
              <!-- Contact Vowel Highlight Beacon -->
              <circle id="bsl-base-beacon" cx="105" cy="115" r="7" fill="#38bdf8" filter="url(#bslGlow)" opacity="0" />
            </g>

            <!-- ============================================================== -->
            <!-- 3D DOMINANT POINTER HAND (Right Hand Volumetric Kinematics)     -->
            <!-- ============================================================== -->
            <g id="bsl-dom-hand-group">
              <!-- Right Forearm Bone -->
              <line id="bsl-dom-forearm" x1="225" y1="150" x2="195" y2="135" stroke="#ea580c" stroke-width="10" stroke-linecap="round" opacity="0.95" />
              <!-- Right Wrist Joint -->
              <circle id="bsl-dom-wrist" cx="195" cy="135" r="8.5" fill="#ea580c" stroke="#fed7aa" stroke-width="1.2" />
              <!-- Right Palm Cushion Ellipse -->
              <ellipse id="bsl-dom-palm-poly" cx="180" cy="125" rx="12" ry="14" fill="url(#bslHumanSkinPalm)" stroke="#ea580c" stroke-width="1.8" />
              <!-- Right Eminence Mound -->
              <circle id="bsl-dom-eminence" cx="188" cy="128" r="7" fill="#f97316" opacity="0.5" />
              <!-- Main Pointer Finger Bone (Index) -->
              <line id="bsl-dom-finger-main" x1="180" y1="120" x2="145" y2="105" stroke="#fed7aa" stroke-width="6.5" stroke-linecap="round" />
              <!-- Articulated Secondary Dominant Fingers -->
              <line id="bsl-dom-finger-mid" x1="185" y1="124" x2="155" y2="112" stroke="#fed7aa" stroke-width="6" stroke-linecap="round" />
              <line id="bsl-dom-finger-thumb" x1="192" y1="130" x2="178" y2="118" stroke="#fed7aa" stroke-width="6.5" stroke-linecap="round" />
              <!-- Active Fingertip Point with Glowing Touch Marker -->
              <circle id="bsl-dom-tip" cx="145" cy="105" r="6.5" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
            </g>
            <!-- Active Sign Keyframe Aura Indicator -->
            <circle id="bsl-action-aura" cx="160" cy="120" r="22" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0" stroke-dasharray="4,4" />
          </svg>

          <!-- Top-Left Linguistic Status Tag -->
          <div id="bsl-status-badge" style="position:absolute; top:8px; left:10px; background:rgba(15,23,42,0.85); backdrop-filter:blur(4px); padding:3px 8px; border-radius:5px; font-size:0.68rem; font-weight:800; color:#38bdf8; border:1px solid rgba(56,189,248,0.3); pointer-events:none;">
            BSL L6 • NATURAL
          </div>

          <!-- Top-Right Classifier Tag -->
          <div id="bsl-classifier-badge" style="position:absolute; top:8px; right:10px; background:rgba(15,23,42,0.85); backdrop-filter:blur(4px); padding:3px 8px; border-radius:5px; font-size:0.68rem; font-weight:800; color:#facc15; border:1px solid rgba(250,204,21,0.3); pointer-events:none; display:none;">
            CL: PROFORM
          </div>
        </div>

        <!-- Live Subtitle & Gloss Display Bar -->
        <div style="background:#0f172a; padding:10px 14px; border-top:1px solid #1e293b;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <div id="bsl-active-gloss" style="font-size:0.82rem; font-weight:800; color:#facc15; letter-spacing:0.04em;">
              GLOSS: ${this.activeGloss}
            </div>
            <div id="bsl-nmf-tag" style="font-size:0.68rem; color:#38bdf8; font-weight:700; background:rgba(56,189,248,0.12); padding:1px 6px; border-radius:4px; border:1px solid rgba(56,189,248,0.25);">
              NMF: neutral
            </div>
          </div>

          <!-- English Spoken Sentence -->
          <div id="bsl-active-english" style="font-size:0.75rem; color:#cbd5e1; line-height:1.35; min-height:22px;">
            "${this.activeSentence || 'Listening to simulator narration...'}"
          </div>
        </div>

        <!-- Interactive Practice & Quick Signs Drawer -->
        <div style="background:#090d16; padding:8px 12px; border-top:1px solid #1e293b; display:flex; flex-direction:column; gap:6px;">
          <!-- Quick Sign Pills -->
          <div style="display:flex; gap:4px; flex-wrap:wrap;" id="bsl-quick-pills">
            <button type="button" class="bsl-pill" data-sign="PRAY" style="background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.65rem; font-weight:700; padding:2px 7px; border-radius:4px; cursor:pointer;">🙏 Pray</button>
            <button type="button" class="bsl-pill" data-sign="CHURCH" style="background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.65rem; font-weight:700; padding:2px 7px; border-radius:4px; cursor:pointer;">⛪ Church</button>
            <button type="button" class="bsl-pill" data-sign="SCIENCE" style="background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.65rem; font-weight:700; padding:2px 7px; border-radius:4px; cursor:pointer;">🔬 Science</button>
            <button type="button" class="bsl-pill" data-sign="BIBLE" style="background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.65rem; font-weight:700; padding:2px 7px; border-radius:4px; cursor:pointer;">📖 Bible</button>
            <button type="button" class="bsl-pill" data-sign="EQUAL" style="background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.65rem; font-weight:700; padding:2px 7px; border-radius:4px; cursor:pointer;">⚖️ Equal</button>
            <button type="button" class="bsl-pill" data-sign="WHAT" style="background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.65rem; font-weight:700; padding:2px 7px; border-radius:4px; cursor:pointer;">❓ What</button>
          </div>

          <!-- Free-text sign input -->
          <div style="display:flex; gap:5px; align-items:center;">
            <input
              type="text"
              id="bsl-custom-input"
              placeholder="Type word or phrase to sign..."
              style="flex:1; background:#1e293b; border:1px solid #334155; border-radius:6px; color:#ffffff; font-size:0.72rem; padding:4px 8px; outline:none;"
            />
            <button type="button" id="bsl-btn-submit" style="background:#0284c7; color:#ffffff; border:none; border-radius:6px; font-size:0.72rem; font-weight:700; padding:4px 10px; cursor:pointer;">
              Sign 🖐️
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private bindEvents() {
    // Close button
    const btnClose = this.querySelector('#bsl-btn-close');
    btnClose?.addEventListener('click', () => {
      toggleBsl();
    });

    // Voice button
    const btnVoice = this.querySelector<HTMLButtonElement>('#bsl-btn-voice');
    btnVoice?.addEventListener('click', () => {
      this.isVoiceOn = !this.isVoiceOn;
      if (btnVoice) {
        btnVoice.textContent = this.isVoiceOn ? '🔊 Audio' : '🔇 Mute';
        btnVoice.style.background = this.isVoiceOn ? '#0369a1' : '#1e293b';
      }
    });

    // POV toggle
    const btnPov = this.querySelector<HTMLButtonElement>('#bsl-btn-pov');
    btnPov?.addEventListener('click', () => {
      this.viewAngle = this.viewAngle === 'receiver' ? 'signer' : 'receiver';
      if (btnPov) btnPov.textContent = this.viewAngle === 'receiver' ? 'Front' : 'Signer';
    });

    // Mode selector
    const selectMode = this.querySelector<HTMLSelectElement>('#bsl-select-mode');
    selectMode?.addEventListener('change', (e) => {
      this.grammarMode = (e.target as HTMLSelectElement).value as BslGrammarMode;
      const statusBadge = this.querySelector('#bsl-status-badge');
      if (statusBadge) {
        statusBadge.textContent = this.grammarMode === 'bsl-natural' ? 'BSL L6 • NATURAL' :
                                  this.grammarMode === 'makaton' ? 'MAKATON • KEYWORD' : 'BSL • FINGERSPELL';
      }
      if (this.activeSentence) {
        this.processUtterance(this.activeSentence);
      }
    });

    // Quick sign pill buttons
    this.querySelectorAll<HTMLButtonElement>('.bsl-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const sign = btn.getAttribute('data-sign');
        if (sign) this.processUtterance(sign);
      });
    });

    // Custom sign input
    const customInput = this.querySelector<HTMLInputElement>('#bsl-custom-input');
    const btnSubmit = this.querySelector<HTMLButtonElement>('#bsl-btn-submit');
    const handleSignInput = () => {
      const val = customInput?.value?.trim();
      if (val) {
        this.processUtterance(val);
        if (customInput) customInput.value = '';
      }
    };
    btnSubmit?.addEventListener('click', handleSignInput);
    customInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSignInput();
    });

    // Dragging support for moving the card
    const header = this.querySelector<HTMLDivElement>('#bsl-header-drag');
    const card = this.querySelector<HTMLDivElement>('#bsl-in-vision-card');

    if (header && card) {
      header.addEventListener('pointerdown', (e) => {
        if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'SELECT') return;
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        const rect = card.getBoundingClientRect();
        this.cardLeft = rect.left;
        this.cardTop = rect.top;
        card.style.right = 'auto';
        card.style.bottom = 'auto';
        card.style.left = `${this.cardLeft}px`;
        card.style.top = `${this.cardTop}px`;
        header.setPointerCapture(e.pointerId);
      });

      header.addEventListener('pointermove', (e) => {
        if (!this.isDragging) return;
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;
        card.style.left = `${this.cardLeft + dx}px`;
        card.style.top = `${this.cardTop + dy}px`;
      });

      header.addEventListener('pointerup', (e) => {
        this.isDragging = false;
        try { header.releasePointerCapture(e.pointerId); } catch (_) {}
      });
    }

    // Interactive 3D Orbiting on the stage
    const svgStage = this.querySelector<SVGSVGElement>('#bsl-avatar-svg');
    if (svgStage) {
      svgStage.addEventListener('pointerdown', (e) => {
        this.isOrbitDragging = true;
        this.orbitStartX = e.clientX;
        this.orbitStartY = e.clientY;
        svgStage.setPointerCapture(e.pointerId);
      });

      svgStage.addEventListener('pointermove', (e) => {
        if (!this.isOrbitDragging) return;
        const dx = e.clientX - this.orbitStartX;
        const dy = e.clientY - this.orbitStartY;
        this.orbitYaw = Math.max(-45, Math.min(45, this.orbitYaw + dx * 0.5));
        this.orbitPitch = Math.max(-25, Math.min(25, this.orbitPitch - dy * 0.4));
        this.orbitStartX = e.clientX;
        this.orbitStartY = e.clientY;
      });

      svgStage.addEventListener('pointerup', (e) => {
        this.isOrbitDragging = false;
        try { svgStage.releasePointerCapture(e.pointerId); } catch (_) {}
      });
    }
  }

  private updateHud() {
    const glossEl = this.querySelector('#bsl-active-gloss');
    const englishEl = this.querySelector('#bsl-active-english');
    const clBadge = this.querySelector<HTMLDivElement>('#bsl-classifier-badge');
    const nmfTag = this.querySelector('#bsl-nmf-tag');

    if (glossEl) glossEl.textContent = `GLOSS: ${this.activeGloss || 'IDLE'}`;
    if (englishEl) englishEl.textContent = `"${this.activeSentence || 'Ready to interpret...'}"`;
    if (clBadge) {
      if (this.activeClassifier) {
        clBadge.style.display = 'block';
        clBadge.textContent = `CL: ${this.activeClassifier}`;
      } else {
        clBadge.style.display = 'none';
      }
    }
    if (nmfTag && this.currentPose.nmf) {
      const parts: string[] = [];
      if (this.currentPose.nmf.eyebrows && this.currentPose.nmf.eyebrows !== 'neutral') parts.push(this.currentPose.nmf.eyebrows);
      if (this.currentPose.nmf.mouth) parts.push(`"${this.currentPose.nmf.mouth}"`);
      if (this.currentPose.nmf.headTilt && this.currentPose.nmf.headTilt !== 'neutral') parts.push(this.currentPose.nmf.headTilt);
      nmfTag.textContent = parts.length > 0 ? `NMF: ${parts.join(' ')}` : 'NMF: neutral';
    }
  }

  private startSigningLoop() {
    this.isPlaying = true;
    this.lastTime = performance.now();

    const frame = (time: number) => {
      const dt = Math.min(time - this.lastTime, 100);
      this.lastTime = time;

      if (this.holdTimer > 0) {
        this.holdTimer -= dt;
      } else if (this.transitionT < 1.0) {
        this.transitionT += dt / this.poseDuration;
        if (this.transitionT >= 1.0) {
          this.transitionT = 1.0;
          this.holdTimer = this.currentPose.hold || 80;
        }
      } else if (this.queue.length > 0) {
        this.prevPose = { ...this.currentPose };
        this.currentPose = this.queue.shift()!;
        this.transitionT = 0.0;
        this.poseDuration = 380;
        this.updateHud();
      } else if (this.currentPose !== REST_POSE && this.transitionT >= 1.0) {
        // Return to natural neutral resting pose
        this.prevPose = { ...this.currentPose };
        this.currentPose = { ...REST_POSE };
        this.transitionT = 0.0;
        this.poseDuration = 500;
      }

      this.renderFrame();
      this.animFrameId = requestAnimationFrame(frame);
    };

    this.lastTime = performance.now();
    this.animFrameId = requestAnimationFrame(frame);
  }

  private renderFrame() {
    const ease = evaluateBslEase(this.currentPose.ease, this.transitionT);

    // Interpolate 3D Coordinates
    const targetTip = interpolatePoint3D(this.prevPose.targetTip, this.currentPose.targetTip, ease);
    const targetKnuckle = interpolatePoint3D(this.prevPose.targetKnuckle, this.currentPose.targetKnuckle, ease);
    const targetWrist = interpolatePoint3D(this.prevPose.targetWrist, this.currentPose.targetWrist, ease);

    // Camera settings (Receiver POV = 180° front view, Signer POV = 0° first person)
    const baseYaw = (this.viewAngle === 'receiver' ? 180 : 0) + this.orbitYaw;
    const basePitch = (this.viewAngle === 'receiver' ? -6 : 22) + this.orbitPitch;
    const camera = { yaw: baseYaw, pitch: basePitch, distance: 360, fov: 60 };

    // Stage origin centered for 320x250 canvas
    const originX = 160;
    const originY = 145;

    // -------------------------------------------------------------
    // 1. SOLVE VOLUMETRIC DOMINANT HAND (Right Hand)
    // -------------------------------------------------------------
    const domSolved = solveHandKinematics(
      targetWrist,
      targetKnuckle,
      targetTip,
      this.currentPose.shape,
      this.currentPose.palm
    );

    const projDomWrist = project3DToSvg(domSolved.wrist, camera, originX, originY);
    const projDomPalm = project3DToSvg(domSolved.palm, camera, originX, originY);
    const projDomKnuckle = project3DToSvg(domSolved.knuckleIndex, camera, originX, originY);
    const projDomTip = project3DToSvg(domSolved.tipIndex, camera, originX, originY);
    const projDomMidK = project3DToSvg(domSolved.kMid, camera, originX, originY);
    const projDomMidTip = project3DToSvg(domSolved.tipMid, camera, originX, originY);
    const projDomThumbBase = project3DToSvg(domSolved.thumbBase, camera, originX, originY);
    const projDomThumbTip = project3DToSvg(domSolved.thumbTip, camera, originX, originY);

    // -------------------------------------------------------------
    // 2. SOLVE VOLUMETRIC NON-DOMINANT HAND (Left Hand) - Proper 2-Handed BSL
    // -------------------------------------------------------------
    const baseMode: BslBaseHandMode = this.currentPose.baseHandMode || (this.currentPose.isWholeWordSign ? 'rest' : 'vowel-board');
    const override = this.currentPose.baseHandOverride;
    const isMirror = baseMode === 'mirror';

    let baseWrist3D: Point3D;
    let basePalm3D: Point3D;
    let baseFingertips3D: Point3D[];

    if (isMirror) {
      // Symmetrical 2-Handed Signs (PRAY, CHURCH, BIBLE, FORCE, LOVE, EQUAL, PEACE, SCIENCE, CIRCUITS)
      // Left hand mirrors the dominant hand across the sagittal plane (X -> -X)
      baseWrist3D = { x: -domSolved.wrist.x, y: domSolved.wrist.y, z: domSolved.wrist.z };
      basePalm3D = { x: -domSolved.palm.x, y: domSolved.palm.y, z: domSolved.palm.z };
      const mirrorTip = { x: -domSolved.tipIndex.x, y: domSolved.tipIndex.y, z: domSolved.tipIndex.z };
      const mirrorMid = { x: -domSolved.tipMid.x, y: domSolved.tipMid.y, z: domSolved.tipMid.z };
      baseFingertips3D = [
        { x: -domSolved.thumbTip.x, y: domSolved.thumbTip.y, z: domSolved.thumbTip.z }, // Thumb
        mirrorTip,                                                                      // Index
        mirrorMid,                                                                      // Middle
        { x: mirrorMid.x + 8, y: mirrorMid.y + 1, z: mirrorMid.z },                     // Ring
        { x: mirrorMid.x + 14, y: mirrorMid.y + 4, z: mirrorMid.z },                    // Pinky
      ];
    } else if (baseMode === 'rest') {
      // 1-Handed Signs: Left hand rests naturally at waist/hip
      baseWrist3D = BSL_BASE_REST_HAND.wrist;
      basePalm3D = BSL_BASE_REST_HAND.palm;
      baseFingertips3D = BSL_BASE_REST_HAND.fingertips;
    } else {
      // Vowel-Board / 2-Handed Fingerspelling & Base-Hold Mode
      const sx = override?.shiftX || 0;
      const sy = override?.shiftY || 0;
      const sz = override?.shiftZ || 0;
      baseWrist3D = override?.wrist || {
        x: BSL_BASE_HAND.wrist.x + sx,
        y: BSL_BASE_HAND.wrist.y + sy,
        z: BSL_BASE_HAND.wrist.z + sz,
      };
      basePalm3D = override?.palm || {
        x: BSL_BASE_HAND.palm.x + sx,
        y: BSL_BASE_HAND.palm.y + sy,
        z: BSL_BASE_HAND.palm.z + sz,
      };
      baseFingertips3D = BSL_BASE_HAND.fingertips.map(f => ({
        x: f.x + sx,
        y: f.y + sy,
        z: f.z + sz,
      }));
    }

    const projBaseWrist = project3DToSvg(baseWrist3D, camera, originX, originY);
    const projBasePalm = project3DToSvg(basePalm3D, camera, originX, originY);
    const projBaseFingertips = baseFingertips3D.map(f => project3DToSvg(f, camera, originX, originY));

    // -------------------------------------------------------------
    // 3. EXPRESSIVE FACIAL RIG (Eyebrows, Eyes, Mouth Morphemes, Tilt)
    // -------------------------------------------------------------
    const nmf = this.currentPose.nmf as any;
const headTilt = nmf?.headTilt || nmf?.tilt || 'neutral';
const mouth = (nmf?.mouth || (this.currentPose as any)?.viseme || this.currentPose.label || '').toLowerCase();
let eyebrows = nmf?.eyebrows || nmf?.brows || 'neutral';

if (eyebrows === 'neutral') {
  const lbl = (this.currentPose.label || '').toLowerCase();
  const rule = (this.currentPose.rule || '').toLowerCase();
  if (lbl.includes('topic') || rule.includes('topic') || mouth.includes('theory') || this.currentPose.isWholeWordSign) {
    eyebrows = 'raised';
  } else if (lbl.includes('what') || lbl.includes('why') || lbl.includes('how') || this.currentPose.letter === '?') {
    eyebrows = 'furrowed';
  }
}

    let headDx = 0;
    let headDy = 0;
    if (headTilt === 'nod') {
      headDy = 4 * Math.sin(this.transitionT * Math.PI);
    } else if (headTilt === 'shake') {
      headDx = 6 * Math.sin(this.transitionT * Math.PI * 2);
    } else if (headTilt === 'tilt-right') {
      headDx = 5;
    } else if (headTilt === 'tilt-left') {
      headDx = -5;
    }

    // Head Position
    const headOval = this.querySelector<SVGEllipseElement>('#bsl-head-oval');
    if (headOval) {
      headOval.setAttribute('cx', String(160 + headDx));
      headOval.setAttribute('cy', String(80 + headDy));
    }

    // Eyebrows (Grammatical NMF: Furrowed for WH-questions, Raised for Polar/RHQ)
    const browL = this.querySelector<SVGPathElement>('#bsl-eyebrow-left');
    const browR = this.querySelector<SVGPathElement>('#bsl-eyebrow-right');
    if (browL && browR) {
      if (eyebrows === 'raised') {
        browL.setAttribute('d', `M ${136 + headDx},${59 + headDy} Q ${145 + headDx},${52 + headDy} ${154 + headDx},${59 + headDy}`);
        browR.setAttribute('d', `M ${166 + headDx},${59 + headDy} Q ${175 + headDx},${52 + headDy} ${184 + headDx},${59 + headDy}`);
        browL.setAttribute('stroke', '#38bdf8');
        browR.setAttribute('stroke', '#38bdf8');
      } else if (eyebrows === 'furrowed') {
        browL.setAttribute('d', `M ${136 + headDx},${61 + headDy} Q ${145 + headDx},${68 + headDy} ${154 + headDx},${64 + headDy}`);
        browR.setAttribute('d', `M ${166 + headDx},${64 + headDy} Q ${175 + headDx},${68 + headDy} ${184 + headDx},${61 + headDy}`);
        browL.setAttribute('stroke', '#f59e0b');
        browR.setAttribute('stroke', '#f59e0b');
      } else {
        browL.setAttribute('d', `M ${136 + headDx},${66 + headDy} Q ${145 + headDx},${61 + headDy} ${154 + headDx},${66 + headDy}`);
        browR.setAttribute('d', `M ${166 + headDx},${66 + headDy} Q ${175 + headDx},${61 + headDy} ${184 + headDx},${66 + headDy}`);
        browL.setAttribute('stroke', '#0f172a');
        browR.setAttribute('stroke', '#0f172a');
      }
    }

    // Expressive Mouth & Adverbial Mouthing Morphemes ('mm', 'th', 'tight-lips', 'puffed-cheeks', 'open')
    const mouthCavity = this.querySelector<SVGPathElement>('#bsl-mouth-cavity');
    const mouthTeeth = this.querySelector<SVGRectElement>('#bsl-mouth-teeth');
    const mouthPath = this.querySelector<SVGPathElement>('#bsl-mouth-path');

    if (mouthPath) {
      if (mouth === 'mm') {
        // Closed, determined/ordinary lips
        mouthPath.setAttribute('d', `M ${150 + headDx},${99 + headDy} L ${170 + headDx},${99 + headDy}`);
        if (mouthCavity) mouthCavity.setAttribute('d', `M ${150 + headDx},${99 + headDy} L ${170 + headDx},${99 + headDy} Z`);
        if (mouthTeeth) mouthTeeth.style.opacity = '0';
      } else if (mouth === 'th') {
        // Careless/relaxed: tongue between teeth
        mouthPath.setAttribute('d', `M ${148 + headDx},${97 + headDy} Q ${160 + headDx},${103 + headDy} ${172 + headDx},${97 + headDy}`);
        if (mouthCavity) mouthCavity.setAttribute('d', `M ${148 + headDx},${97 + headDy} Q ${160 + headDx},${104 + headDy} ${172 + headDx},${97 + headDy} Z`);
        if (mouthTeeth) {
          mouthTeeth.style.opacity = '0.9';
          mouthTeeth.setAttribute('x', String(154 + headDx));
          mouthTeeth.setAttribute('y', String(97 + headDy));
        }
      } else if (mouth === 'tight-lips') {
        // Determined, restricted: clamped thin line
        mouthPath.setAttribute('d', `M ${152 + headDx},${100 + headDy} L ${168 + headDx},${100 + headDy}`);
        if (mouthCavity) mouthCavity.setAttribute('d', `M ${152 + headDx},${100 + headDy} L ${168 + headDx},${100 + headDy} Z`);
        if (mouthTeeth) mouthTeeth.style.opacity = '0';
      } else if (mouth === 'puffed-cheeks') {
        // Vast, massive, strenuous: wide rounded oral aperture
        mouthPath.setAttribute('d', `M ${146 + headDx},${96 + headDy} Q ${160 + headDx},${108 + headDy} ${174 + headDx},${96 + headDy}`);
        if (mouthCavity) mouthCavity.setAttribute('d', `M ${146 + headDx},${96 + headDy} Q ${160 + headDx},${110 + headDy} ${174 + headDx},${96 + headDy} Q ${160 + headDx},${92 + headDy} ${146 + headDx},${96 + headDy} Z`);
        if (mouthTeeth) mouthTeeth.style.opacity = '0.4';
      } else {
        // Natural speech mouth opening
        mouthPath.setAttribute('d', `M ${148 + headDx},${98 + headDy} Q ${160 + headDx},${102 + headDy} ${172 + headDx},${98 + headDy}`);
        if (mouthCavity) mouthCavity.setAttribute('d', `M ${148 + headDx},${98 + headDy} Q ${160 + headDx},${104 + headDy} ${172 + headDx},${98 + headDy} Z`);
        if (mouthTeeth) mouthTeeth.style.opacity = '0.85';
      }
    }

    // -------------------------------------------------------------
    // 4. RENDER DOMINANT HAND (Right Hand Volumetric Joints)
    // -------------------------------------------------------------
    const domArm = this.querySelector<SVGLineElement>('#bsl-dom-forearm');
    if (domArm) {
      domArm.setAttribute('x1', String(225 + (this.viewAngle === 'signer' ? -25 : 0)));
      domArm.setAttribute('y1', '150');
      domArm.setAttribute('x2', String(projDomWrist.x));
      domArm.setAttribute('y2', String(projDomWrist.y));
    }

    const domWrist = this.querySelector<SVGCircleElement>('#bsl-dom-wrist');
    if (domWrist) {
      domWrist.setAttribute('cx', String(projDomWrist.x));
      domWrist.setAttribute('cy', String(projDomWrist.y));
    }

    const basePalmPoly = this.querySelector<SVGEllipseElement>('#bsl-base-palm-poly');
if (basePalmPoly) {
  basePalmPoly.setAttribute('cx', String(projBasePalm.x));
  basePalmPoly.setAttribute('cy', String(projBasePalm.y));
  basePalmPoly.setAttribute('rx', '12');
  basePalmPoly.setAttribute('ry', '14');
  basePalmPoly.setAttribute('opacity', baseMode === 'rest' ? '0.35' : '1');
}

    const domEminence = this.querySelector<SVGCircleElement>('#bsl-dom-eminence');
    if (domEminence) {
      domEminence.setAttribute('cx', String((projDomWrist.x + projDomThumbBase.x) / 2));
      domEminence.setAttribute('cy', String((projDomWrist.y + projDomThumbBase.y) / 2));
    }

    const domFingerMain = this.querySelector<SVGLineElement>('#bsl-dom-finger-main');
    if (domFingerMain) {
      domFingerMain.setAttribute('x1', String(projDomKnuckle.x));
      domFingerMain.setAttribute('y1', String(projDomKnuckle.y));
      domFingerMain.setAttribute('x2', String(projDomTip.x));
      domFingerMain.setAttribute('y2', String(projDomTip.y));
    }

    const domFingerMid = this.querySelector<SVGLineElement>('#bsl-dom-finger-mid');
    if (domFingerMid) {
      domFingerMid.setAttribute('x1', String(projDomMidK.x));
      domFingerMid.setAttribute('y1', String(projDomMidK.y));
      domFingerMid.setAttribute('x2', String(projDomMidTip.x));
      domFingerMid.setAttribute('y2', String(projDomMidTip.y));
    }

    const domFingerThumb = this.querySelector<SVGLineElement>('#bsl-dom-finger-thumb');
    if (domFingerThumb) {
      domFingerThumb.setAttribute('x1', String(projDomThumbBase.x));
      domFingerThumb.setAttribute('y1', String(projDomThumbBase.y));
      domFingerThumb.setAttribute('x2', String(projDomThumbTip.x));
      domFingerThumb.setAttribute('y2', String(projDomThumbTip.y));
    }

    const domTip = this.querySelector<SVGCircleElement>('#bsl-dom-tip');
    if (domTip) {
      domTip.setAttribute('cx', String(projDomTip.x));
      domTip.setAttribute('cy', String(projDomTip.y));
    }

    // -------------------------------------------------------------
    // 5. RENDER NON-DOMINANT HAND (Left Hand Volumetric Joints)
    // -------------------------------------------------------------
    const baseArm = this.querySelector<SVGLineElement>('#bsl-base-arm');
    if (baseArm) {
      baseArm.setAttribute('x1', String(95 + (this.viewAngle === 'signer' ? 25 : 0)));
      baseArm.setAttribute('y1', '150');
      baseArm.setAttribute('x2', String(projBaseWrist.x));
      baseArm.setAttribute('y2', String(projBaseWrist.y));
      baseArm.setAttribute('opacity', baseMode === 'rest' ? '0.35' : '0.95');
    }

    const baseWristEl = this.querySelector<SVGCircleElement>('#bsl-base-wrist');
    if (baseWristEl) {
      baseWristEl.setAttribute('cx', String(projBaseWrist.x));
      baseWristEl.setAttribute('cy', String(projBaseWrist.y));
      baseWristEl.setAttribute('opacity', baseMode === 'rest' ? '0.35' : '1');
    }

    const basePalmPoly = this.querySelector<SVGEllipseElement>('#bsl-base-palm-poly');
    if (basePalmPoly) {
      basePalmPoly.setAttribute('cx', String(projBasePalm.x));
      basePalmPoly.setAttribute('cy', String(projBasePalm.y));
      basePalmPoly.setAttribute('rx', '12');
      basePalmPoly.setAttribute('ry', '14');
      basePalmPoly.setAttribute('opacity', baseMode === 'rest' ? '0.35' : '1');
    }

    const baseEminence = this.querySelector<SVGCircleElement>('#bsl-base-eminence');
    if (baseEminence && projBaseFingertips[0]) {
      baseEminence.setAttribute('cx', String((projBaseWrist.x + projBaseFingertips[0].x) / 2));
      baseEminence.setAttribute('cy', String((projBaseWrist.y + projBaseFingertips[0].y) / 2));
      baseEminence.setAttribute('opacity', baseMode === 'rest' ? '0.25' : '0.5');
    }

    // Update 5 Left Finger Bones
    for (let i = 0; i < 5; i++) {
      const fingerEl = this.querySelector<SVGLineElement>(`#bsl-base-finger-${i}`);
      const pt = projBaseFingertips[i];
      if (fingerEl && pt) {
        fingerEl.setAttribute('x1', String(projBasePalm.x));
        fingerEl.setAttribute('y1', String(projBasePalm.y));
        fingerEl.setAttribute('x2', String(pt.x));
        fingerEl.setAttribute('y2', String(pt.y));
        fingerEl.setAttribute('opacity', baseMode === 'rest' ? '0.25' : '1');
      }
    }

    // Left Tip in Mirror Mode
    const baseTipEl = this.querySelector<SVGCircleElement>('#bsl-base-tip');
    if (baseTipEl) {
      if (isMirror && projBaseFingertips[1]) {
        baseTipEl.setAttribute('cx', String(projBaseFingertips[1].x));
        baseTipEl.setAttribute('cy', String(projBaseFingertips[1].y));
        baseTipEl.setAttribute('opacity', '1');
      } else {
        baseTipEl.setAttribute('opacity', '0');
      }
    }

    // Contact Vowel Beacon
    const beacon = this.querySelector<SVGCircleElement>('#bsl-base-beacon');
    if (beacon) {
      if (typeof this.currentPose.activeVowelIndex === 'number' && this.currentPose.activeVowelIndex >= 0) {
        const pt = projBaseFingertips[this.currentPose.activeVowelIndex];
        if (pt) {
          beacon.setAttribute('cx', String(pt.x));
          beacon.setAttribute('cy', String(pt.y));
          beacon.setAttribute('opacity', '0.9');
        }
      } else {
        beacon.setAttribute('opacity', '0');
      }
    }
  }
}

// Register as a native custom element
if (typeof customElements !== 'undefined' && !customElements.get('native-bsl-interpreter')) {
  customElements.define('native-bsl-interpreter', NativeBslInterpreterElement);
}
