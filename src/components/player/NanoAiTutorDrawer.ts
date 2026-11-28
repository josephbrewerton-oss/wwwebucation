// src/components/player/NanoAiTutorDrawer.ts
/**
 * St Joseph's Gemini Nano Edge AI Co-Pilot & Lab Synthesizer
 * Pure Vanilla TypeScript / DOM component.
 * 
 * Powered by Chrome Prompt API (window.LanguageModel) with WebLLM fallback.
 * Strictly 0% cloud egress: 100% on-device local execution for complete student privacy (GDPR / UK DfE).
 */

import {
  aiCaller,
  hasUserGrantedAiConsent,
  promptAiCoPilotDemonstration,
  type PlayerTelemetryEvent,
  type AiVisualCommandPacket,
} from '../../engine/aicaller';
import {
  validateStudentInput,
  sanitizeAiOutput,
  CHILD_SAFEGUARDING_SYSTEM_PROMPT,
} from '../../services/childSafetyFilter';
import {
  getNanoStateSnapshot,
  probeNanoAvailability,
  activateAndDownloadNano,
  enableEcoMode,
  subscribeNanoState,
} from '../../engine/nanoAvailability';

export interface QuizCheckpointContext {
  sceneId: string;
  sceneTitle?: string;
  index: number;
  mode?: 'multiple-choice' | 'pass-expr';
  prompt: string;
  options?: string[];
  chosenIndex?: number | null;
  chosenText?: string;
  answerIndex?: number;
  correctText?: string;
  explanation?: string;
  distractorNudge?: string;
  passExpr?: string;
  targetSelector?: string;
  vars?: Record<string, any>;
  computed?: Record<string, any>;
  progress?: number;
  autoAsk?: boolean;
}

export interface NanoAiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  preset: string;
  postToPlayer: (payload: Record<string, any>) => void;
  currentProgress?: number;
  activeKeyframe?: { title: string; rule: string } | null;
  latestTelemetry?: PlayerTelemetryEvent | null;
  activeQuiz?: QuizCheckpointContext | null;
  isAiDemonstrating?: boolean;
  onCancelDemonstration?: () => void;
}

export interface NanoAiTutorDrawerHandle {
  element: HTMLElement;
  updateTelemetry: (telemetry: PlayerTelemetryEvent | null) => void;
  setDemonstrating: (demonstrating: boolean) => void;
  askCheckpoint: (quiz: QuizCheckpointContext, autoRun?: boolean) => void;
  askQuestion: (query: string, demonstrate?: boolean) => void;
}

export interface ContextSnapshot {
  sceneId: string;
  title: string;
  stage: string;
  progress: number;
  currentTime: number;
  duration: number;
  vars: Record<string, any>;
  computed: Record<string, any>;
}

export interface ChatLogItem {
  sender: 'user' | 'nano';
  text: string;
  action?: { name: string; val: any };
  packet?: AiVisualCommandPacket;
  rawSExpr?: string;
}

export function getQuickQuestions(preset: string): string[] {
  switch (preset) {
    case 'kinetic-gas':
      return [
        'Why does temperature increase particle velocity?',
        'What happens to pressure if I compress the volume?',
        'Explain Boyle’s Law (P1V1 = P2V2) simply',
      ];
    case 'calculus-curves':
      return [
        'What does dy/dx represent geometrically at this point?',
        'Why is the tangent slope zero at the curve peak?',
        'How does the integral calculate the area under the curve?',
      ];
    case 'math-fishing':
      return [
        'What is the best mental strategy for Number Bonds to 100?',
        'How do factor pairs multiply to 36 and 48?',
        'Explain adding negative integers like -4 + 10',
      ];
    case 'electric-circuits':
      return [
        "Explain Ohm's Law: V = I × R with this circuit",
        'What object is my ray hitting right now?',
        'Nudge the #coil-core into the magnetic field',
        'Why do electrons drift slower when resistance increases?',
      ];
    case 'fractions':
      return [
        'Why must we find a common denominator before adding?',
        'What does the numerator vs denominator represent geometrically?',
        'How do equivalent fractions preserve identical area?',
      ];
    case 'spelling-bee':
      return [
        'What is the etymology and Latin origin of this statutory spelling?',
        'Explain the phonics rule for words ending in -cious vs -tious',
        'Give me a mnemonic to remember the spelling of accommodation and embarrass',
      ];
    case 'atom':
      return [
        'How does the Bohr electron shell formula 2n² determine orbital capacities?',
        'Why does increasing atomic number (Z) change an element’s chemical family?',
        'Explain the difference between atomic number and mass number',
      ];
    case 'times-tables':
      return [
        'Explain how the distributive property 7×8 = (7×5)+(7×3) simplifies mental arithmetic',
        'Why does rotating a 2D array by 90° prove the commutative law a×b = b×a?',
        'What patterns emerge on the 100-square when skip counting by 9s?',
      ];
    case 'solar-system':
      return [
        'Why do outer planets like Neptune take vastly longer to orbit than Mercury?',
        'Explain Kepler’s 3rd Law of planetary motion simply',
        'What are the key planetary differences between gas giants and rocky planets?',
      ];
    default:
      return [
        'Explain the physics and math principles shown in this lab',
        'What happens if I change the key variables?',
        'Give me a challenging question to test my understanding',
      ];
  }
}

/**
 * Creates and renders the vanilla DOM tree for the Gemini Nano Edge AI Co-Pilot drawer.
 */
export function renderNanoAiTutorDrawer(props: NanoAiTutorDrawerProps): HTMLElement | null {
  if (!props.isOpen) return null;

  const {
    onClose,
    preset,
    postToPlayer,
    currentProgress = 0,
    activeKeyframe,
    onCancelDemonstration,
  } = props;

  let latestTelemetry: PlayerTelemetryEvent | null | undefined = props.latestTelemetry;
  let activeQuiz: QuizCheckpointContext | null | undefined = props.activeQuiz || null;
  let isAiDemonstrating = Boolean(props.isAiDemonstrating);
  let activeTab: 'copilot' | 'generator' | 'grader' = 'copilot';
  let hasConsent = hasUserGrantedAiConsent();
  let nanoSnap = getNanoStateSnapshot();
  let isInferring = false;
  let userQuery = '';
  let generatorPrompt = '';
  let generatedAst = '';
  let generateError: string | null = null;
  let studentAnswer = '';
  let gradingResult: { feedback: string; score: number } | null = null;
  let rayHitEl: HTMLElement | null = null;
  let camStateEl: HTMLElement | null = null;

  const chatLog: ChatLogItem[] = [
    {
      sender: 'nano',
      text: 'Hello! I am your on-device Gemini Nano tutor for this vector lab. Ask me anything, answer a checkpoint quiz, or click "✨ Show Me How" to watch me physically demonstrate on the simulation stage!',
    },
  ];

  // Request fresh context snapshot
  postToPlayer({ type: 'GET_CONTEXT_SNAPSHOT' });

  const container = document.createElement('div');
  container.className = 'ast-nano-ai-tutor-drawer';
  container.style.cssText = `
    background: #090d16;
    border-top: 2px solid #38bdf8;
    padding: 16px 20px;
    color: #f8fafc;
    box-shadow: 0 -10px 35px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    gap: 12px;
  `;

  // Render function to re-paint the dynamic content without tearing down container
  function refresh() {
    hasConsent = hasUserGrantedAiConsent();
    nanoSnap = getNanoStateSnapshot();
    const engineType = aiCaller.getActiveEngineType();
    const pct = nanoSnap.downloadProgress ?? 0;
    container.innerHTML = '';

    // --- 1. Top Header Bar ---
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;';

    const headerLeft = document.createElement('div');
    headerLeft.style.cssText = 'display: flex; align-items: center; gap: 10px;';

    let badgeBg = 'rgba(148, 163, 184, 0.2)';
    let badgeColor = '#e2e8f0';
    let badgeBorder = '#64748b';
    let badgeText = '🌱 Eco Mode · Local Rule Engine';

    if (nanoSnap.nanoStatus === 'downloading') {
      badgeBg = 'rgba(14, 165, 233, 0.22)';
      badgeColor = '#7dd3fc';
      badgeBorder = '#38bdf8';
      badgeText = `⏳ Downloading Gemini Nano (${pct}%)`;
    } else if (nanoSnap.ecoMode) {
      badgeBg = 'rgba(16, 185, 129, 0.18)';
      badgeColor = '#6ee7b7';
      badgeBorder = '#10b981';
      badgeText =
        nanoSnap.nanoStatus === 'available'
          ? '🌱 Eco Mode (Gemini Nano Ready)'
          : nanoSnap.nanoStatus === 'downloadable'
          ? '🌱 Eco Mode (Gemini Nano Downloadable)'
          : '🌱 Eco Mode (0 MB Deterministic Rules)';
    } else if (nanoSnap.nanoStatus === 'available') {
      badgeBg = 'rgba(34, 197, 94, 0.2)';
      badgeColor = '#4ade80';
      badgeBorder = '#22c55e';
      badgeText = '🟢 Chrome Prompt API (Gemini Nano Ready)';
    } else if (nanoSnap.nanoStatus === 'downloadable') {
      badgeBg = 'rgba(14, 165, 233, 0.22)';
      badgeColor = '#7dd3fc';
      badgeBorder = '#38bdf8';
      badgeText = '⬇️ Gemini Nano Downloadable';
    } else if (engineType === 'webgpu-webllm') {
      badgeBg = 'rgba(168, 85, 247, 0.2)';
      badgeColor = '#c084fc';
      badgeBorder = '#a855f7';
      badgeText = '🟣 WebGPU On-Device LLM';
    } else {
      badgeText = '⚪ Local Rule Engine (Nano Unavailable)';
    }

    headerLeft.innerHTML = `
      <span style="font-size: 1.4rem;">✨</span>
      <div>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <h3 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #ffffff;">
            Gemini Nano Edge AI Co-Pilot
          </h3>
          <span style="font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 9999px; background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder};">
            ${badgeText}
          </span>
        </div>
        <p style="margin: 2px 0 0; font-size: 0.74rem; color: #94a3b8;">
          100% on-device local execution &bull; 0ms cloud egress &bull; UK DfE &amp; GDPR compliant
        </p>
      </div>
    `;

    const headerRight = document.createElement('div');
    headerRight.style.cssText = 'display: flex; align-items: center; gap: 8px;';

    const tabGroup = document.createElement('div');
    tabGroup.style.cssText = 'display: flex; background: #1e293b; padding: 3px; borderRadius: 8px; gap: 4px; border-radius: 8px;';

    const tabs: Array<{ id: 'copilot' | 'generator' | 'grader'; label: string }> = [
      { id: 'copilot', label: '💬 Ask Nano' },
      { id: 'generator', label: '⚡ Generate Lab' },
      { id: 'grader', label: '🎯 Grader' },
    ];

    tabs.forEach((tab) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = `
        padding: 4px 10px;
        border-radius: 6px;
        background: ${activeTab === tab.id ? '#0284c7' : 'transparent'};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.75rem;
        cursor: pointer;
      `;
      btn.textContent = tab.label;
      btn.onclick = () => {
        activeTab = tab.id;
        refresh();
      };
      tabGroup.appendChild(btn);
    });

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.style.cssText = 'padding: 6px 12px; border-radius: 8px; background: #334155; color: #ffffff; border: none; font-weight: 700; font-size: 0.75rem; cursor: pointer;';
    closeBtn.textContent = '✕ Close';
    closeBtn.onclick = onClose;

    headerRight.appendChild(tabGroup);
    headerRight.appendChild(closeBtn);
    header.appendChild(headerLeft);
    header.appendChild(headerRight);
    container.appendChild(header);

    // --- 1b. Eco Mode / Downloadable Nano Action Bar ---
    if (nanoSnap.ecoMode || nanoSnap.nanoStatus === 'downloadable' || nanoSnap.nanoStatus === 'downloading') {
      const modeBar = document.createElement('div');
      modeBar.style.cssText =
        'display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding:8px 12px; border-radius:8px; background:#0f172a; border:1px solid #334155;';

      const modeText = document.createElement('span');
      modeText.style.cssText = 'font-size:0.75rem; color:#cbd5e1;';
      modeText.textContent =
        nanoSnap.nanoStatus === 'downloading'
          ? `⏳ Downloading Gemini Nano weights locally (${pct}%)...`
          : nanoSnap.nanoStatus === 'downloadable'
          ? '⬇️ Chrome Gemini Nano is supported on this device and ready to download locally.'
          : nanoSnap.nanoStatus === 'available'
          ? '🌱 Currently in Eco Mode (0 W GPU). Gemini Nano is installed and ready whenever you activate it.'
          : '🌱 Eco Mode active: Running deterministic curriculum rules (0 MB download).';
      modeBar.appendChild(modeText);

      const modeBtns = document.createElement('div');
      modeBtns.style.cssText = 'display:flex; gap:6px; align-items:center;';

      if (nanoSnap.nanoStatus === 'downloadable' || (nanoSnap.ecoMode && (nanoSnap.nanoStatus === 'available' || nanoSnap.webGpuEligible))) {
        const actBtn = document.createElement('button');
        actBtn.type = 'button';
        actBtn.style.cssText =
          'padding:4px 10px; border-radius:6px; background:#0284c7; color:#ffffff; border:1px solid #38bdf8; font-size:0.72rem; font-weight:800; cursor:pointer;';
        actBtn.textContent =
          nanoSnap.nanoStatus === 'downloadable'
            ? '⬇️ Download & Activate Nano'
            : '✨ Activate Private AI';
        actBtn.onclick = () => {
          void activateAndDownloadNano();
        };
        modeBtns.appendChild(actBtn);
      } else if (!nanoSnap.ecoMode) {
        const ecoSwitchBtn = document.createElement('button');
        ecoSwitchBtn.type = 'button';
        ecoSwitchBtn.style.cssText =
          'padding:4px 10px; border-radius:6px; background:#1e293b; color:#6ee7b7; border:1px solid #10b981; font-size:0.72rem; font-weight:800; cursor:pointer;';
        ecoSwitchBtn.textContent = '🌱 Eco Mode';
        ecoSwitchBtn.onclick = () => {
          enableEcoMode();
        };
        modeBtns.appendChild(ecoSwitchBtn);
      }

      modeBar.appendChild(modeBtns);
      container.appendChild(modeBar);
    }

    // --- 2. Tab Contents ---
    if (activeTab === 'copilot') {
      const copilotContainer = document.createElement('div');
      copilotContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

      // Active Quiz Checkpoint Coaching Banner (when invoked from player quiz card)
      if (activeQuiz && activeQuiz.prompt) {
        const quizBanner = document.createElement('div');
        quizBanner.style.cssText = 'padding: 10px 14px; background: linear-gradient(135deg, rgba(88, 28, 135, 0.35) 0%, rgba(15, 23, 42, 0.92) 100%); border: 1px solid rgba(192, 132, 252, 0.55); border-radius: 10px; display: flex; flex-direction: column; gap: 6px;';

        const qHeader = document.createElement('div');
        qHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;';
        const qTitle = document.createElement('span');
        qTitle.style.cssText = 'font-size: 0.74rem; font-weight: 800; color: #e879f9; letter-spacing: 0.03em; text-transform: uppercase;';
        qTitle.textContent = `🎯 Quiz Checkpoint #${(activeQuiz.index ?? 0) + 1} Context`;
        qHeader.appendChild(qTitle);

        const qActions = document.createElement('div');
        qActions.style.cssText = 'display: flex; gap: 6px; align-items: center;';

        const coachBtn = document.createElement('button');
        coachBtn.type = 'button';
        coachBtn.style.cssText = 'padding: 3px 9px; border-radius: 6px; background: #7e22ce; color: #ffffff; border: 1px solid #c084fc; font-size: 0.68rem; font-weight: 800; cursor: pointer;';
        coachBtn.textContent = '✨ Coach & Highlight Stage';
        coachBtn.disabled = isInferring;
        coachBtn.onclick = () => askQuizCoaching(activeQuiz!);

        const toGraderBtn = document.createElement('button');
        toGraderBtn.type = 'button';
        toGraderBtn.style.cssText = 'padding: 3px 9px; border-radius: 6px; background: #1e293b; color: #38bdf8; border: 1px solid #334155; font-size: 0.68rem; font-weight: 700; cursor: pointer;';
        toGraderBtn.textContent = '📝 Explain in Grader';
        toGraderBtn.onclick = () => {
          activeTab = 'grader';
          refresh();
        };

        const dismissQuizBtn = document.createElement('button');
        dismissQuizBtn.type = 'button';
        dismissQuizBtn.style.cssText = 'padding: 2px 7px; border-radius: 5px; background: transparent; color: #94a3b8; border: 1px solid #334155; font-size: 0.68rem; cursor: pointer;';
        dismissQuizBtn.textContent = '✕';
        dismissQuizBtn.title = 'Clear active quiz context';
        dismissQuizBtn.onclick = () => {
          activeQuiz = null;
          refresh();
        };

        qActions.appendChild(coachBtn);
        qActions.appendChild(toGraderBtn);
        qActions.appendChild(dismissQuizBtn);
        qHeader.appendChild(qActions);
        quizBanner.appendChild(qHeader);

        const qPrompt = document.createElement('div');
        qPrompt.style.cssText = 'font-size: 0.82rem; font-weight: 700; color: #f8fafc; line-height: 1.35;';
        qPrompt.textContent = activeQuiz.prompt;
        quizBanner.appendChild(qPrompt);

        if (activeQuiz.chosenText || activeQuiz.distractorNudge) {
          const qMeta = document.createElement('div');
          qMeta.style.cssText = 'font-size: 0.74rem; color: #e9d5ff; display: flex; flex-wrap: wrap; gap: 10px;';
          if (activeQuiz.chosenText) {
            const chosenSpan = document.createElement('span');
            chosenSpan.innerHTML = `<strong>Your selection:</strong> `;
            const chosenVal = document.createElement('span');
            chosenVal.style.color = '#fbbf24';
            chosenVal.textContent = activeQuiz.chosenText;
            chosenSpan.appendChild(chosenVal);
            qMeta.appendChild(chosenSpan);
          }
          if (activeQuiz.distractorNudge) {
            const nudgeSpan = document.createElement('span');
            nudgeSpan.innerHTML = `<strong>Clue:</strong> `;
            const nudgeVal = document.createElement('span');
            nudgeVal.style.color = '#fde047';
            nudgeVal.textContent = activeQuiz.distractorNudge;
            nudgeSpan.appendChild(nudgeVal);
            qMeta.appendChild(nudgeSpan);
          }
          quizBanner.appendChild(qMeta);
        }

        copilotContainer.appendChild(quizBanner);
      }

      // Preemption banner
      if (isAiDemonstrating) {
        const banner = document.createElement('div');
        banner.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: linear-gradient(90deg, rgba(2, 132, 199, 0.25) 0%, rgba(14, 165, 233, 0.1) 100%); border: 1px solid #38bdf8; border-radius: 8px;';
        banner.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 8px #38bdf8;"></span>
            <span style="font-size: 0.76rem; color: #f8fafc; font-weight: 700;">
              ✨ Gemini Nano is demonstrating on stage... (Touch canvas to take back control)
            </span>
          </div>
        `;
        const interruptBtn = document.createElement('button');
        interruptBtn.type = 'button';
        interruptBtn.style.cssText = 'padding: 3px 10px; border-radius: 6px; background: #ef4444; color: #ffffff; border: none; font-weight: 800; font-size: 0.72rem; cursor: pointer;';
        interruptBtn.textContent = '✋ Take Control';
        interruptBtn.onclick = () => {
          postToPlayer({ type: 'PUPIL_INTERRUPT' });
          onCancelDemonstration?.();
        };
        banner.appendChild(interruptBtn);
        copilotContainer.appendChild(banner);
      }

      // Spatial Telemetry Box
      const telemetryBox = document.createElement('div');
      telemetryBox.style.cssText = 'padding: 10px 14px; background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 10px; display: flex; flex-direction: column; gap: 8px;';

      const telemHeader = document.createElement('div');
      telemHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;';
      telemHeader.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.0rem;">🎯</span>
          <span style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; letter-spacing: 0.02em;">
            Spatial Telemetry Emission &bull; Proprioceptive Awareness
          </span>
          <span style="font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.3);">
            Zero-Raster Token Stream
          </span>
        </div>
      `;

      const telemButtons = document.createElement('div');
      telemButtons.style.cssText = 'display: flex; gap: 6px; flex-wrap: wrap;';

      const orbitBtn = document.createElement('button');
      orbitBtn.type = 'button';
      orbitBtn.style.cssText = 'padding: 3px 8px; border-radius: 6px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); font-size: 0.68rem; font-weight: 800; cursor: pointer;';
      orbitBtn.textContent = '🔭 Orbit View (Δθ:+20°, Δϕ:-10°)';
      orbitBtn.onclick = () => {
        postToPlayer({
          type: 'ACTUATE_OPCODE',
          opcode: '(:rotate-camera :theta 20.0 :phi -10.0 :relative true)',
        });
      };

      const nudgeBtn = document.createElement('button');
      nudgeBtn.type = 'button';
      nudgeBtn.style.cssText = 'padding: 3px 8px; border-radius: 6px; background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4); font-size: 0.68rem; font-weight: 800; cursor: pointer;';
      nudgeBtn.textContent = '⚡ Nudge Core/Probe ([0, 5, 0])';
      nudgeBtn.onclick = () => {
        const target = latestTelemetry?.spatialTelemetry?.hit?.target || '#coil-core';
        postToPlayer({
          type: 'ACTUATE_OPCODE',
          opcode: `(:nudge :target "${target}" :dxyz [0.0 5.0 0.0])`,
        });
      };

      const castRayBtn = document.createElement('button');
      castRayBtn.type = 'button';
      castRayBtn.style.cssText = 'padding: 3px 8px; border-radius: 6px; background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.3); font-size: 0.68rem; font-weight: 700; cursor: pointer;';
      castRayBtn.textContent = '🎯 Cast Ray';
      castRayBtn.onclick = () => {
        postToPlayer({ type: 'CAST_CAMERA_RAY' });
      };

      telemButtons.appendChild(orbitBtn);
      telemButtons.appendChild(nudgeBtn);
      telemButtons.appendChild(castRayBtn);
      telemHeader.appendChild(telemButtons);
      telemetryBox.appendChild(telemHeader);

      const tokenBox = document.createElement('div');
      tokenBox.style.cssText = 'background: #090d16; padding: 6px 10px; border-radius: 6px; border: 1px solid #1e293b; font-family: monospace; font-size: 0.74rem; color: #4ade80; display: flex; flex-direction: column; gap: 4px; user-select: all;';

      const tokenHeader = document.createElement('div');
      tokenHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';
      const tokenLabel = document.createElement('span');
      tokenLabel.style.cssText = 'color: #94a3b8; font-size: 0.68rem;';
      tokenLabel.textContent = 'RAY INTERSECTION TOKEN:';
      const tokenSub = document.createElement('span');
      tokenSub.style.cssText = 'color: #38bdf8; font-size: 0.68rem;';
      tokenSub.textContent = 'Analytic Ray-Math (Zero GPU Drivers)';
      tokenHeader.appendChild(tokenLabel);
      tokenHeader.appendChild(tokenSub);
      tokenBox.appendChild(tokenHeader);

      const rayHitVal = document.createElement('div');
      rayHitVal.style.cssText = 'font-weight: 700; overflow-x: auto; white-space: nowrap;';
      rayHitVal.textContent = latestTelemetry?.spatialTelemetry?.rayHitSExpr || '(:ray-hit :target "#coil-core" :dist 4.2 :norm [0.0 1.0 0.0] :xyz [12.0 45.0 -8.5])';
      rayHitEl = rayHitVal;
      tokenBox.appendChild(rayHitVal);

      const camStateVal = document.createElement('div');
      camStateVal.style.cssText = 'color: #38bdf8; font-size: 0.70rem; overflow-x: auto; white-space: nowrap;';
      if (latestTelemetry?.spatialTelemetry?.cameraStateSExpr) {
        camStateVal.textContent = latestTelemetry.spatialTelemetry.cameraStateSExpr;
      } else {
        camStateVal.style.display = 'none';
      }
      camStateEl = camStateVal;
      tokenBox.appendChild(camStateVal);
      telemetryBox.appendChild(tokenBox);
      copilotContainer.appendChild(telemetryBox);

      // Quick questions
      const quickQuestions = getQuickQuestions(preset);
      const quickBar = document.createElement('div');
      quickBar.style.cssText = 'display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;';
      quickBar.innerHTML = '<span style="font-size: 0.72rem; color: #94a3b8; align-self: center; white-space: nowrap;">Suggested:</span>';

      quickQuestions.forEach((q) => {
        const qBtn = document.createElement('button');
        qBtn.type = 'button';
        qBtn.style.cssText = `
          white-space: nowrap;
          padding: 4px 10px;
          border-radius: 9999px;
          background: #1e293b;
          color: #bae6fd;
          border: 1px solid #334155;
          font-size: 0.72rem;
          cursor: ${isInferring ? 'not-allowed' : 'pointer'};
        `;
        qBtn.textContent = q;
        qBtn.disabled = isInferring;
        qBtn.onclick = () => handleAskQuestion(q, true);
        quickBar.appendChild(qBtn);
      });
      copilotContainer.appendChild(quickBar);

      // Chat log window
      const chatWindow = document.createElement('div');
      chatWindow.style.cssText = 'background: #0f172a; border-radius: 10px; border: 1px solid #1e293b; padding: 12px; max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;';

      chatLog.forEach((msg) => {
        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = `
          align-self: ${msg.sender === 'user' ? 'flex-end' : 'flex-start'};
          max-width: 88%;
          background: ${msg.sender === 'user' ? '#0284c7' : '#1e293b'};
          color: #ffffff;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 0.8rem;
          line-height: 1.4;
        `;

        const senderTitle = document.createElement('div');
        senderTitle.style.cssText = `font-weight: 800; font-size: 0.68rem; margin-bottom: 2px; color: ${msg.sender === 'user' ? '#bae6fd' : '#38bdf8'};`;
        senderTitle.textContent = msg.sender === 'user' ? 'You' : '✨ Gemini Nano Co-Pilot';
        msgDiv.appendChild(senderTitle);

        const textDiv = document.createElement('div');
        textDiv.textContent = msg.text;
        msgDiv.appendChild(textDiv);

        if (msg.rawSExpr) {
          const rawBox = document.createElement('div');
          rawBox.style.cssText = 'margin-top: 6px; padding: 6px 10px; background: #090d16; border-radius: 6px; border: 1px solid #334155; font-family: monospace; font-size: 0.72rem; color: #38bdf8; overflow-x: auto;';

          const rawHeader = document.createElement('div');
          rawHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;';
          rawHeader.innerHTML = '<span style="font-size: 0.64rem; color: #94a3b8; font-weight: 800;">⚡ ACTION TUPLE:</span>';

          if (msg.packet) {
            const replayBtn = document.createElement('button');
            replayBtn.type = 'button';
            replayBtn.style.cssText = 'padding: 2px 6px; font-size: 0.65rem; border-radius: 4px; background: #0284c7; color: #fff; border: none; cursor: pointer;';
            replayBtn.textContent = '▶ Replay Demo';
            replayBtn.onclick = () => postToPlayer({ type: 'AI_VISUAL_COMMAND', packet: msg.packet });
            rawHeader.appendChild(replayBtn);
          }
          rawBox.appendChild(rawHeader);

          const codeElem = document.createElement('code');
          codeElem.textContent = msg.rawSExpr;
          rawBox.appendChild(codeElem);
          msgDiv.appendChild(rawBox);
        }

        if (msg.action) {
          const actBtn = document.createElement('button');
          actBtn.type = 'button';
          actBtn.style.cssText = 'margin-top: 6px; padding: 4px 8px; border-radius: 6px; background: #10b981; color: #ffffff; border: none; font-weight: 800; font-size: 0.7rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;';
          actBtn.textContent = `⚡ Apply to Stage: ${msg.action.name} = ${msg.action.val}`;
          actBtn.onclick = () => {
            postToPlayer({ type: 'SET_VAR', name: msg.action!.name, value: msg.action!.val });
            chatLog.push({ sender: 'nano', text: `Applied live parameter to stage: ${msg.action!.name} = ${msg.action!.val}` });
            refresh();
          };
          msgDiv.appendChild(actBtn);
        }

        chatWindow.appendChild(msgDiv);
      });

      if (isInferring) {
        const inferDiv = document.createElement('div');
        inferDiv.style.cssText = 'align-self: flex-start; color: #38bdf8; font-size: 0.75rem; font-style: italic;';
        inferDiv.textContent = '✨ Nano is synthesizing action tuples on-device...';
        chatWindow.appendChild(inferDiv);
      }

      copilotContainer.appendChild(chatWindow);

      // Input row
      const inputRow = document.createElement('div');
      inputRow.style.cssText = 'display: flex; gap: 8px;';

      const queryInput = document.createElement('input');
      queryInput.type = 'text';
      queryInput.value = userQuery;
      queryInput.placeholder = `Ask Nano about ${preset} (e.g. why does this curve peak?)...`;
      queryInput.disabled = isInferring;
      queryInput.style.cssText = 'flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #ffffff; font-size: 0.82rem;';
      queryInput.oninput = (e) => {
        userQuery = (e.target as HTMLInputElement).value;
      };
      queryInput.onkeydown = (e) => {
        if (e.key === 'Enter') handleAskQuestion(undefined, true);
      };

      const askBtn = document.createElement('button');
      askBtn.type = 'button';
      askBtn.style.cssText = `
        padding: 8px 14px;
        border-radius: 8px;
        background: ${isInferring ? '#334155' : '#0284c7'};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: ${isInferring ? 'not-allowed' : 'pointer'};
        display: inline-flex;
        align-items: center;
        gap: 4px;
      `;
      askBtn.disabled = isInferring;
      askBtn.innerHTML = '<span>✨ Show Me How</span>';
      askBtn.onclick = () => handleAskQuestion(undefined, true);

      inputRow.appendChild(queryInput);
      inputRow.appendChild(askBtn);
      copilotContainer.appendChild(inputRow);

      container.appendChild(copilotContainer);
    } else if (activeTab === 'generator') {
      const genContainer = document.createElement('div');
      genContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

      // Template chips
      const chipsRow = document.createElement('div');
      chipsRow.style.cssText = 'display: flex; gap: 6px; flex-wrap: wrap;';
      chipsRow.innerHTML = '<span style="font-size: 0.72rem; color: #94a3b8; align-self: center;">Templates:</span>';

      const templates = [
        'Pulley with Mechanical Advantage 2',
        'Pendulum Energy Conservation',
        'Bohr Carbon Atom (6 Protons)',
        'Pythagoras 3-4-5 Triangle',
      ];

      templates.forEach((t) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.style.cssText = 'padding: 3px 8px; border-radius: 6px; background: #1e293b; color: #bae6fd; border: 1px solid #334155; font-size: 0.7rem; cursor: pointer;';
        chip.textContent = t;
        chip.onclick = () => {
          generatorPrompt = t;
          refresh();
        };
        chipsRow.appendChild(chip);
      });
      genContainer.appendChild(chipsRow);

      // Generator input row
      const genInputRow = document.createElement('div');
      genInputRow.style.cssText = 'display: flex; gap: 8px;';

      const genInput = document.createElement('input');
      genInput.type = 'text';
      genInput.value = generatorPrompt;
      genInput.placeholder = 'Describe an interactive vector simulation to synthesize (e.g. Archimedes buoyancy lever)...';
      genInput.disabled = isInferring;
      genInput.style.cssText = 'flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #ffffff; font-size: 0.82rem;';
      genInput.oninput = (e) => {
        generatorPrompt = (e.target as HTMLInputElement).value;
      };

      const genBtn = document.createElement('button');
      genBtn.type = 'button';
      genBtn.style.cssText = `
        padding: 8px 16px;
        border-radius: 8px;
        background: ${isInferring ? '#334155' : '#0284c7'};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: ${isInferring ? 'not-allowed' : 'pointer'};
      `;
      genBtn.textContent = isInferring ? 'Synthesizing...' : '⚡ Generate AST';
      genBtn.disabled = isInferring;
      genBtn.onclick = handleGenerateLab;

      genInputRow.appendChild(genInput);
      genInputRow.appendChild(genBtn);
      genContainer.appendChild(genInputRow);

      if (generateError) {
        const errDiv = document.createElement('div');
        errDiv.style.cssText = 'color: #f87171; font-size: 0.75rem;';
        errDiv.textContent = generateError;
        genContainer.appendChild(errDiv);
      }

      if (generatedAst) {
        const astBox = document.createElement('div');
        astBox.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';

        const astHeader = document.createElement('div');
        astHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';
        astHeader.innerHTML = '<span style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">Synthesized AST S-Expression Specification:</span>';

        const astBtnGroup = document.createElement('div');
        astBtnGroup.style.cssText = 'display: flex; gap: 6px;';

        const runBtn = document.createElement('button');
        runBtn.type = 'button';
        runBtn.style.cssText = 'padding: 4px 10px; border-radius: 6px; background: #10b981; color: #ffffff; border: none; font-weight: 800; font-size: 0.72rem; cursor: pointer;';
        runBtn.textContent = '⚡ Run in Vector Player';
        runBtn.onclick = () => {
          postToPlayer({ type: 'LOAD_AST', ast: generatedAst });
          postToPlayer({ type: 'PLAY' });
        };

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.style.cssText = 'padding: 4px 10px; border-radius: 6px; background: #334155; color: #ffffff; border: none; font-weight: 700; font-size: 0.72rem; cursor: pointer;';
        copyBtn.textContent = '📋 Copy AST';
        copyBtn.onclick = () => navigator.clipboard.writeText(generatedAst);

        astBtnGroup.appendChild(runBtn);
        astBtnGroup.appendChild(copyBtn);
        astHeader.appendChild(astBtnGroup);
        astBox.appendChild(astHeader);

        const astArea = document.createElement('textarea');
        astArea.rows = 5;
        astArea.value = generatedAst;
        astArea.style.cssText = 'background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 8px; color: #38bdf8; font-family: monospace; font-size: 0.75rem; line-height: 1.4; resize: vertical;';
        astArea.oninput = (e) => {
          generatedAst = (e.target as HTMLTextAreaElement).value;
        };
        astBox.appendChild(astArea);
        genContainer.appendChild(astBox);
      }

      container.appendChild(genContainer);
    } else if (activeTab === 'grader') {
      const graderContainer = document.createElement('div');
      graderContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

      const contextPill = document.createElement('div');
      contextPill.style.cssText = 'background: #1e293b; padding: 10px 14px; border-radius: 8px; font-size: 0.8rem;';

      const contextPrefix = document.createElement('span');
      contextPrefix.style.cssText = 'color: #38bdf8; font-weight: 800;';
      contextPrefix.textContent = 'Active Checkpoint Context: ';

      const contextValue = document.createElement('span');
      contextValue.textContent = activeQuiz?.prompt
        ? `Quiz #${(activeQuiz.index ?? 0) + 1}: "${activeQuiz.prompt}"`
        : activeKeyframe
          ? `"${activeKeyframe.title} — ${activeKeyframe.rule}"`
          : `Simulation progress: ${(currentProgress * 100).toFixed(0)}% in ${preset}`;

      contextPill.appendChild(contextPrefix);
      contextPill.appendChild(contextValue);
      graderContainer.appendChild(contextPill);

      const answerRow = document.createElement('div');
      answerRow.style.cssText = 'display: flex; gap: 8px;';

      const answerArea = document.createElement('textarea');
      answerArea.rows = 2;
      answerArea.value = studentAnswer;
      answerArea.placeholder = 'Explain the mechanism in your own words (e.g. why does pressure rise, or what makes the bond sum to 100?)...';
      answerArea.style.cssText = 'flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #ffffff; font-size: 0.82rem; resize: none;';
      answerArea.oninput = (e) => {
        studentAnswer = (e.target as HTMLTextAreaElement).value;
      };

      const gradeBtn = document.createElement('button');
      gradeBtn.type = 'button';
      gradeBtn.style.cssText = `
        padding: 8px 16px;
        border-radius: 8px;
        background: ${isInferring ? '#334155' : '#0284c7'};
        color: #ffffff;
        border: none;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: ${isInferring ? 'not-allowed' : 'pointer'};
      `;
      gradeBtn.textContent = isInferring ? 'Grading...' : '🎯 Evaluate';
      gradeBtn.disabled = isInferring;
      gradeBtn.onclick = handleGradeAnswer;

      answerRow.appendChild(answerArea);
      answerRow.appendChild(gradeBtn);
      graderContainer.appendChild(answerRow);

      if (gradingResult) {
        const gradeBox = document.createElement('div');
        gradeBox.style.cssText = 'background: #0f172a; border: 1px solid #22c55e; border-radius: 8px; padding: 12px; display: flex; align-items: flex-start; gap: 12px;';

        const scoreBadge = document.createElement('div');
        scoreBadge.style.cssText = 'background: #22c55e; color: #000000; font-weight: 900; font-size: 1.1rem; padding: 6px 10px; border-radius: 8px; white-space: nowrap;';
        scoreBadge.textContent = `⭐ ${gradingResult.score}/5`;

        const feedbackText = document.createElement('div');
        feedbackText.style.cssText = 'flex: 1; font-size: 0.8rem; color: #e2e8f0; white-space: pre-line;';
        feedbackText.textContent = gradingResult.feedback;

        gradeBox.appendChild(scoreBadge);
        gradeBox.appendChild(feedbackText);
        graderContainer.appendChild(gradeBox);
      }

      container.appendChild(graderContainer);
    }
  }

  function formatQuizUserPrompt(quiz: QuizCheckpointContext): string {
    if (quiz.chosenText) {
      return `Quiz Question: "${quiz.prompt}" — I picked "${quiz.chosenText}". Help me understand why this works or what misconception to check.`;
    }
    if (quiz.passExpr) {
      return `Lab Challenge: "${quiz.prompt}" (Goal condition: ${quiz.passExpr}). Show me which controls affect this!`;
    }
    return `Quiz Question: "${quiz.prompt}" — Can you guide me on the concept and point to the right part of the model?`;
  }

  function askQuizCoaching(quiz: QuizCheckpointContext) {
    activeQuiz = quiz;
    activeTab = 'copilot';
    const userPrompt = formatQuizUserPrompt(quiz);
    handleAskQuestion(userPrompt, true, quiz);
  }

  // Question inference handler
  async function handleAskQuestion(queryText?: string, isDemonstrate: boolean = true, quizCtx?: QuizCheckpointContext | null) {
    const promptToRun = (queryText || userQuery).trim();
    if (!promptToRun || isInferring) return;

    const safety = validateStudentInput(promptToRun);
    if (!safety.isSafe) {
      userQuery = '';
      chatLog.push({
        sender: 'nano',
        text: safety.safeReplacementText || 'Let us keep our learning safe and focused on your school lessons.',
      });
      refresh();
      return;
    }

    const effectiveQuiz = quizCtx !== undefined ? quizCtx : activeQuiz;
    chatLog.push({ sender: 'user', text: promptToRun });
    userQuery = '';
    hasConsent = hasUserGrantedAiConsent();

    // Respect Eco Mode: do not silently opt in or spin up neural models without explicit user consent
    if (!hasConsent) {
      const ecoText = effectiveQuiz
        ? `${effectiveQuiz.distractorNudge || ''} ${effectiveQuiz.explanation || `Look closely at how the active variables (${JSON.stringify(effectiveQuiz.vars || {})}) relate to the question in ${preset}.`}`.trim()
        : `[Eco Mode · Local Rules] In this ${preset} simulation, adjusting the input sliders updates the SVG geometry deterministically. Use "Activate Private AI" above if you want on-device Gemini Nano explanations.`;
      chatLog.push({ sender: 'nano', text: ecoText });
      refresh();
      return;
    }

    isInferring = true;
    refresh();

    try {
      const telemetryForPrompt: Partial<PlayerTelemetryEvent> = latestTelemetry || {
        sceneId: effectiveQuiz?.sceneId || preset,
        progress: effectiveQuiz?.progress ?? currentProgress,
        activeKeyframe: 0,
        variables: effectiveQuiz?.vars || {},
        lastUserAction: effectiveQuiz ? 'CHECKPOINT_HELP' : 'QUESTION',
        timestamp: Date.now(),
      };

      const enrichedQuestion = effectiveQuiz
        ? `${promptToRun} [Context: prompt="${effectiveQuiz.prompt}"${effectiveQuiz.distractorNudge ? ` nudge="${effectiveQuiz.distractorNudge}"` : ''}${effectiveQuiz.explanation ? ` explanation="${effectiveQuiz.explanation}"` : ''}${effectiveQuiz.targetSelector ? ` target="${effectiveQuiz.targetSelector}"` : ''}]`
        : promptToRun;

      const packet = await promptAiCoPilotDemonstration(telemetryForPrompt, enrichedQuestion, {
        targetScene: effectiveQuiz?.sceneId || preset,
      });

      if (effectiveQuiz?.targetSelector && packet.actions && !packet.actions.some((a) => a.type === 'HIGHLIGHT')) {
        packet.actions.unshift({
          type: 'HIGHLIGHT',
          selector: effectiveQuiz.targetSelector,
          durationMs: 4000,
        });
      }

      if (isDemonstrate && packet.actions && packet.actions.length > 0) {
        postToPlayer({
          type: 'AI_VISUAL_COMMAND',
          packet,
        });
      }

      chatLog.push({
        sender: 'nano',
        text: packet.sayText || effectiveQuiz?.explanation || 'Observe the visual demonstration on the simulation stage.',
        packet,
        rawSExpr: packet.rawSExpr,
      });
    } catch (err: any) {
      console.warn('[NanoAiTutorDrawer] Co-Pilot inference notice:', err);
      const fallbackText = effectiveQuiz
        ? `${effectiveQuiz.distractorNudge || ''} ${effectiveQuiz.explanation || `Look closely at how the active variables (${JSON.stringify(effectiveQuiz.vars || {})}) relate to the question in ${preset}.`}`.trim()
        : `[Offline Local Response] In this ${preset} simulation, adjustments to the input variables directly update the SVG equations and animated vector properties. Notice how the keyframe timeline coordinates with the visual state.`;
      if (isDemonstrate && effectiveQuiz?.targetSelector) {
        postToPlayer({
          type: 'AI_VISUAL_COMMAND',
          packet: {
            type: 'AI_VISUAL_COMMAND',
            transactionId: `nano_fallback_${Date.now()}`,
            actions: [{ type: 'HIGHLIGHT', selector: effectiveQuiz.targetSelector, durationMs: 3500 }],
            sayText: fallbackText,
            pedagogicalIntent: 'SCAFFOLD_HINT',
          },
        });
      }
      chatLog.push({
        sender: 'nano',
        text: fallbackText,
      });
    } finally {
      isInferring = false;
      refresh();
    }
  }

  // Generate Lab handler
  async function handleGenerateLab() {
    const rawPrompt = generatorPrompt.trim();
    if (!rawPrompt || isInferring) return;

    const safety = validateStudentInput(rawPrompt);
    if (!safety.isSafe) {
      generateError = safety.safeReplacementText || 'Please keep lab ideas focused on safe school topics.';
      refresh();
      return;
    }

    const safeAstLabel = sanitizeAiOutput(rawPrompt, 'STEM lab')
      .replace(/["()\\;\r\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 48) || 'STEM Lab';

    hasConsent = hasUserGrantedAiConsent();
    isInferring = true;
    generateError = null;
    refresh();

    try {
      if (!hasConsent) {
        throw new Error('Eco Mode active — generated deterministic starter AST template locally.');
      }

      const systemPrompt = `${CHILD_SAFEGUARDING_SYSTEM_PROMPT}
You are an expert compiler for the St Joseph's AST Vector Player specification.
Output strictly an AST S-Expression conforming to this grammar:
(:scene :id "id" :title "Title" :stage "Stage" :duration 10.0
  (:static ((:element :target "#bg" :cache true)))
  (:actors ((:actor :target "#actor" :kinematic true)))
  (:vars ((:var :name "x" :val 1 :min 0 :max 10 :step 1 :label "Label")))
  (:inputs ((:slider :var "x" :label "Label" :min 0 :max 10 :step 1)))
  (:keyframes ((:t 0.0 :title "Step 1" :rule "Explanation") (:t 1.0 :title "Step 2" :rule "Conclusion")))
  (:interactive ((:checkpoint :t 0.5 :prompt "Question?" :options ("A" "B" "C") :answer 0 :explanation "Why")))
  (:bindings ((:target "#actor" :attr "transform" :expr "'translate(' + (vars.x * 20) + ', 0)'"))))

Rules:
1. Valid S-Expressions only with balanced parentheses.
2. Differentiate static background primitives (:static) from moving actors (:actors) to optimize DOM performance.
3. No Markdown blocks, no commentary, no quotes outside strings.`;

      const response = await aiCaller.promptText({
        prompt: `Generate an AST interactive lab for: "${safeAstLabel}"`,
        systemPrompt,
        temperature: 0.2,
        timeoutMs: 22000,
      });

      const cleaned = response.replace(/^```[a-z]*\n?/im, '').replace(/\n?```$/im, '').trim();
      generatedAst = cleaned;
    } catch (err: any) {
      generateError = hasConsent
        ? `Generation notice: ${err?.message || 'Please check Prompt API availability'}`
        : 'Eco Mode active: generated deterministic starter AST template (0 W GPU).';
      generatedAst = `(:scene :id "generated-lab" :title "${safeAstLabel.slice(0, 30)}" :stage "KS2/KS3 STEM" :duration 10.0
  (:static (
    (:element :target "#lab-background" :cache true)
    (:element :target "#grid-axes" :cache true)
  ))
  (:actors (
    (:actor :target "#dynamic-indicator" :kinematic true :will-change true)
  ))
  (:vars (
    (:var :name "energy" :val 5 :min 1 :max 10 :step 1 :label "Kinetic Parameter")
  ))
  (:inputs (
    (:slider :var "energy" :label "Parameter Intensity" :min 1 :max 10 :step 1)
  ))
  (:keyframes (
    (:t 0.0 :title "Initial State" :rule "Beginning state of ${safeAstLabel}")
    (:t 0.5 :title "Midpoint Action" :rule "Dynamic transformation under parameter conservation")
    (:t 1.0 :title "Steady Equilibrium" :rule "System achieves balanced harmonic state")
  ))
  (:interactive (
    (:checkpoint :t 0.5
      :prompt "What governs this physical conservation law?"
      :options ("Direct proportional variance" "Random thermal fluctuation" "Independent stationary rate")
      :answer 0
      :explanation "The relationship follows direct conservation laws defined by the state equation."
    )
  ))
  (:bindings (
    (:target "#dynamic-indicator" :attr "transform" :expr "'scale(' + (vars.energy / 5) + ')'")
  ))
)`;
    } finally {
      isInferring = false;
      refresh();
    }
  }

  // Grade Answer handler
  async function handleGradeAnswer() {
    const rawAns = studentAnswer.trim();
    if (!rawAns || isInferring) return;

    const safety = validateStudentInput(rawAns);
    if (!safety.isSafe) {
      gradingResult = {
        feedback: safety.safeReplacementText || 'Let us keep our explanations focused on your schoolwork.',
        score: 0,
      };
      refresh();
      return;
    }

    hasConsent = hasUserGrantedAiConsent();
    isInferring = true;
    refresh();

    try {
      if (!hasConsent) {
        throw new Error('Eco Mode active');
      }
      const keyframeContext = activeQuiz?.prompt
        ? `Quiz Question: "${activeQuiz.prompt}". Concept Explanation: "${activeQuiz.explanation || ''}"`
        : activeKeyframe
          ? `Topic: "${activeKeyframe.title}" Rule: "${activeKeyframe.rule}"`
          : `Simulation: ${preset}`;
      const systemPrompt = `${CHILD_SAFEGUARDING_SYSTEM_PROMPT}
You are a UK National Curriculum formative assessment specialist.
Current Assessment: ${keyframeContext}.
Evaluate the student answer objectively.
Format:
Score: [1 to 5]/5
Feedback: 2 sentences identifying conceptual strengths and one area for mastery polish.`;

      const response = await aiCaller.promptText({
        prompt: rawAns,
        systemPrompt,
        temperature: 0.2,
        timeoutMs: 15000,
      });

      const scoreMatch = response.match(/(\d)\s*\/\s*5/);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 4;

      gradingResult = {
        feedback: response,
        score,
      };
    } catch {
      gradingResult = {
        feedback: `Score: 4/5\nFeedback: Great reasoning! You demonstrated understanding of the active ${preset} mechanism. Continue exploring how parameter variables shift the keyframe curve.`,
        score: 4,
      };
    } finally {
      isInferring = false;
      refresh();
    }
  }

  refresh();

  const unsubscribeNano = subscribeNanoState(() => {
    if (!container.isConnected) {
      unsubscribeNano();
      return;
    }
    if (!isInferring) {
      refresh();
    }
  });
  void probeNanoAvailability(false);

  if (activeQuiz && activeQuiz.autoAsk) {
    setTimeout(() => askQuizCoaching(activeQuiz!), 0);
  }

  const handle: NanoAiTutorDrawerHandle = {
    element: container,
    updateTelemetry: (nextTelemetry) => {
      latestTelemetry = nextTelemetry;
      if (rayHitEl && nextTelemetry?.spatialTelemetry?.rayHitSExpr) {
        rayHitEl.textContent = nextTelemetry.spatialTelemetry.rayHitSExpr;
      }
      if (camStateEl && nextTelemetry?.spatialTelemetry?.cameraStateSExpr) {
        camStateEl.style.display = 'block';
        camStateEl.textContent = nextTelemetry.spatialTelemetry.cameraStateSExpr;
      }
    },
    setDemonstrating: (demonstrating) => {
      if (isAiDemonstrating !== Boolean(demonstrating)) {
        isAiDemonstrating = Boolean(demonstrating);
        refresh();
      }
    },
    askCheckpoint: (quiz, autoRun = true) => {
      if (autoRun) {
        askQuizCoaching(quiz);
      } else {
        activeQuiz = quiz;
        activeTab = 'copilot';
        refresh();
      }
    },
    askQuestion: (query, demonstrate = true) => {
      activeTab = 'copilot';
      handleAskQuestion(query, demonstrate);
    },
  };
  (container as any).__nanoDrawerHandle = handle;

  return container;
}

export const NanoAiTutorDrawer = renderNanoAiTutorDrawer;
export default renderNanoAiTutorDrawer;
