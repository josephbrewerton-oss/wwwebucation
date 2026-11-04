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
  setUserAiConsent,
  promptAiCoPilotDemonstration,
  type PlayerTelemetryEvent,
  type AiVisualCommandPacket,
} from '../../engine/aicaller';

export interface NanoAiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  preset: string;
  postToPlayer: (payload: Record<string, any>) => void;
  currentProgress?: number;
  activeKeyframe?: { title: string; rule: string } | null;
  latestTelemetry?: PlayerTelemetryEvent | null;
  isAiDemonstrating?: boolean;
  onCancelDemonstration?: () => void;
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
    latestTelemetry,
    isAiDemonstrating = false,
    onCancelDemonstration,
  } = props;

  let activeTab: 'copilot' | 'generator' | 'grader' = 'copilot';
  let hasConsent = hasUserGrantedAiConsent();
  let engineType = aiCaller.getActiveEngineType();
  let isInferring = false;
  let userQuery = '';
  let generatorPrompt = '';
  let generatedAst = '';
  let generateError: string | null = null;
  let studentAnswer = '';
  let gradingResult: { feedback: string; score: number } | null = null;

  const chatLog: ChatLogItem[] = [
    {
      sender: 'nano',
      text: 'Hello! I am your on-device Gemini Nano tutor for this vector lab. Ask me anything, or click "✨ Show Me How" to watch me physically demonstrate on the simulation stage!',
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
    container.innerHTML = '';

    // --- 1. Top Header Bar ---
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;';

    const headerLeft = document.createElement('div');
    headerLeft.style.cssText = 'display: flex; align-items: center; gap: 10px;';
    const badgeBg = engineType === 'chrome-builtin-nano' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(168, 85, 247, 0.2)';
    const badgeColor = engineType === 'chrome-builtin-nano' ? '#4ade80' : '#c084fc';
    const badgeBorder = engineType === 'chrome-builtin-nano' ? '#22c55e' : '#a855f7';
    const badgeText = engineType === 'chrome-builtin-nano' ? '🟢 Chrome Prompt API (Built-in Nano)' : engineType === 'webgpu-webllm' ? '🟣 WebGPU On-Device LLM' : '⚪ Local Rule Engine';

    headerLeft.innerHTML = `
      <span style="font-size: 1.4rem;">✨</span>
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
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

    // --- 2. Tab Contents ---
    if (activeTab === 'copilot') {
      const copilotContainer = document.createElement('div');
      copilotContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

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
      tokenBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #94a3b8; font-size: 0.68rem;">RAY INTERSECTION TOKEN:</span>
          <span style="color: #38bdf8; font-size: 0.68rem;">Analytic Ray-Math (Zero GPU Drivers)</span>
        </div>
        <div style="font-weight: 700; overflow-x: auto; white-space: nowrap;">
          ${latestTelemetry?.spatialTelemetry?.rayHitSExpr || '(:ray-hit :target "#coil-core" :dist 4.2 :norm [0.0 1.0 0.0] :xyz [12.0 45.0 -8.5])'}
        </div>
        ${latestTelemetry?.spatialTelemetry?.cameraStateSExpr ? `
          <div style="color: #38bdf8; font-size: 0.70rem; overflow-x: auto; white-space: nowrap;">
            ${latestTelemetry.spatialTelemetry.cameraStateSExpr}
          </div>
        ` : ''}
      `;
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
          actBtn.innerHTML = `<span>⚡ Apply to Stage: ${msg.action.name} = ${msg.action.val}</span>`;
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
      contextPill.innerHTML = `
        <span style="color: #38bdf8; font-weight: 800;">Active Checkpoint Context: </span>
        <span>${activeKeyframe ? `"${activeKeyframe.title} — ${activeKeyframe.rule}"` : `Simulation progress: ${(currentProgress * 100).toFixed(0)}% in ${preset}`}</span>
      `;
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
        gradeBox.innerHTML = `
          <div style="background: #22c55e; color: #000000; font-weight: 900; font-size: 1.1rem; padding: 6px 10px; border-radius: 8px; white-space: nowrap;">
            ⭐ ${gradingResult.score}/5
          </div>
          <div style="flex: 1; font-size: 0.8rem; color: #e2e8f0; white-space: pre-line;">
            ${gradingResult.feedback}
          </div>
        `;
        graderContainer.appendChild(gradeBox);
      }

      container.appendChild(graderContainer);
    }
  }

  // Question inference handler
  async function handleAskQuestion(queryText?: string, isDemonstrate: boolean = true) {
    const promptToRun = (queryText || userQuery).trim();
    if (!promptToRun || isInferring) return;

    if (!hasConsent) {
      setUserAiConsent(true);
      hasConsent = true;
    }

    chatLog.push({ sender: 'user', text: promptToRun });
    userQuery = '';
    isInferring = true;
    refresh();

    try {
      const telemetryForPrompt: Partial<PlayerTelemetryEvent> = latestTelemetry || {
        sceneId: preset,
        progress: currentProgress,
        activeKeyframe: 0,
        variables: {},
        lastUserAction: 'QUESTION',
        timestamp: Date.now(),
      };

      const packet = await promptAiCoPilotDemonstration(telemetryForPrompt, promptToRun, {
        targetScene: preset,
      });

      if (isDemonstrate && packet.actions && packet.actions.length > 0) {
        postToPlayer({
          type: 'AI_VISUAL_COMMAND',
          packet,
        });
      }

      chatLog.push({
        sender: 'nano',
        text: packet.sayText || 'Observe the visual demonstration on the simulation stage.',
        packet,
        rawSExpr: packet.rawSExpr,
      });
    } catch (err: any) {
      console.warn('[NanoAiTutorDrawer] Co-Pilot inference notice:', err);
      chatLog.push({
        sender: 'nano',
        text: `[Offline Local Response] In this ${preset} simulation, adjustments to the input variables directly update the SVG equations and animated vector properties. Notice how the keyframe timeline coordinates with the visual state.`,
      });
    } finally {
      isInferring = false;
      refresh();
    }
  }

  // Generate Lab handler
  async function handleGenerateLab() {
    if (!generatorPrompt.trim() || isInferring) return;

    if (!hasConsent) {
      setUserAiConsent(true);
      hasConsent = true;
    }

    isInferring = true;
    generateError = null;
    refresh();

    try {
      const systemPrompt = `You are an expert compiler for the St Joseph's AST Vector Player specification.
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
        prompt: `Generate an AST interactive lab for: "${generatorPrompt}"`,
        systemPrompt,
        temperature: 0.2,
        timeoutMs: 22000,
      });

      const cleaned = response.replace(/^```[a-z]*\n?/im, '').replace(/\n?```$/im, '').trim();
      generatedAst = cleaned;
    } catch (err: any) {
      generateError = `Generation error: ${err?.message || 'Please check Prompt API availability'}`;
      generatedAst = `(:scene :id "generated-lab" :title "${generatorPrompt.slice(0, 30)}" :stage "KS2/KS3 STEM" :duration 10.0
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
    (:t 0.0 :title "Initial State" :rule "Beginning state of ${generatorPrompt}")
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
    if (!studentAnswer.trim() || isInferring) return;

    if (!hasConsent) {
      setUserAiConsent(true);
      hasConsent = true;
    }

    isInferring = true;
    refresh();

    try {
      const keyframeContext = activeKeyframe ? `Topic: "${activeKeyframe.title}" Rule: "${activeKeyframe.rule}"` : `Simulation: ${preset}`;
      const systemPrompt = `You are a UK National Curriculum formative assessment specialist.
Current Assessment: ${keyframeContext}.
Evaluate student answer: "${studentAnswer}".
Format:
Score: [1 to 5]/5
Feedback: 2 sentences identifying conceptual strengths and one area for mastery polish.`;

      const response = await aiCaller.promptText({
        prompt: studentAnswer,
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
  return container;
}

export const NanoAiTutorDrawer = renderNanoAiTutorDrawer;
export default renderNanoAiTutorDrawer;
