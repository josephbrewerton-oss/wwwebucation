// src/engine/aicaller.ts
import { edgeCognitiveEngine } from './EdgeCognitiveEngine';
import { validateStudentInput, sanitizeAiOutput } from '../services/childSafetyFilter';

export interface AiInferenceOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  topK?: number;
  /** Set to true to reuse the multi-turn session (e.g. for conversational chat). Default: false (stateless). */
  preserveContext?: boolean;
  onDownloadProgress?: (loaded: number, total: number) => void;
  /** Maximum inference timeout in milliseconds. Defaults to 12000ms. */
  timeoutMs?: number;
  /**
   * W3C Prompt API constrained sampling:
   * Accepts a RegExp object or JSON Schema to constrain token sampling logits directly.
   */
  responseConstraint?: RegExp | any;
  /**
   * Prevents the constraint definition itself from eating into Nano's context window.
   */
  omitResponseConstraintInput?: boolean;
}
export interface ModelAvailability {
  status: 'readily' | 'after-download' | 'no';
  maxTokens?: number;
  temperature?: number;
}

export const CONSENT_STORAGE_KEY = 'ai_model_download_consent';

export function hasUserGrantedAiConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_STORAGE_KEY) === 'granted';
}

export function setUserAiConsent(granted: boolean): void {
  if (typeof window === 'undefined') return;
  if (granted) {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'granted');
  } else {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'denied');
  }
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('ai_consent_changed', { detail: granted }));
}

class AiRuntimeCaller {
  private chatSession: any = null;
  private activeSystemPrompt: string = '';
  private cachedAvailability: ModelAvailability | null = null;
  private availabilityPromise: Promise<ModelAvailability> | null = null;

  /**
   * Safe accessor for the Prompt API root across Chromium revisions
   */
  private getAiRoot(): any {
    if (typeof window === 'undefined') return null;
    const win = window as any;
    const scope = typeof self !== 'undefined' ? (self as any) : win;

    if (typeof win.LanguageModel !== 'undefined') return win.LanguageModel;
    if (typeof scope.LanguageModel !== 'undefined') return scope.LanguageModel;
    if (win.ai?.languageModel) return win.ai.languageModel;
    if (scope.ai?.languageModel) return scope.ai.languageModel;
    if (win.ai?.assistant) return win.ai.assistant;

    return null;
  }

  /**
   * Synchronous check for native Prompt API presence (window.ai / LanguageModel).
   * 0ms, zero overhead, safe for low-spec Chromebooks.
   */
  public hasNativePromptApi(): boolean {
    return this.getAiRoot() !== null;
  }

  /**
   * Check if WebLLM / WebGPU on-device neural fallback is available (Safari 18+, Firefox, non-Chromium)
   */
  public hasWebLlmFallback(): boolean {
    return edgeCognitiveEngine.isSupported();
  }

  /**
   * Identifies the active on-device engine tier
   */
  public getActiveEngineType(): 'chrome-builtin-nano' | 'webgpu-webllm' | 'rule-engine' {
    if (this.hasNativePromptApi()) return 'chrome-builtin-nano';
    if (edgeCognitiveEngine.isSupported()) return 'webgpu-webllm';
    return 'rule-engine';
  }

  /**
   * Synchronous check whether on-device AI (Native Prompt API or WebLLM fallback) is supported and consented to.
   */
  public isPromptApiAvailableSync(): boolean {
    if (!hasUserGrantedAiConsent()) return false;
    if (this.hasNativePromptApi()) {
      if (this.cachedAvailability && this.cachedAvailability.status === 'no') return false;
      return true;
    }
    // Safari / Firefox / non-Chromium WebLLM / WebGPU fallback path:
    if (edgeCognitiveEngine.isSupported()) return true;
    return false;
  }

  /**
   * Diagnostic check across Desktop & Mobile runtimes (hardware capability check only)
   */
  async checkAvailability(): Promise<ModelAvailability> {
    if (this.cachedAvailability) {
      return this.cachedAvailability;
    }

    if (this.availabilityPromise) {
      return this.availabilityPromise;
    }

    const lm = this.getAiRoot();
    if (!lm) {
      // Check WebLLM / WebGPU fallback for Safari / Firefox / non-Chromium
      if (edgeCognitiveEngine.isSupported()) {
        this.cachedAvailability = {
          status: 'readily',
          maxTokens: 4096,
          temperature: 0.2,
        };
        return this.cachedAvailability;
      }

      this.cachedAvailability = { status: 'no' };
      return this.cachedAvailability;
    }

    this.availabilityPromise = (async () => {
      try {
        if (typeof lm.availability === 'function') {
          let status: any = 'no';
          try {
            // Modern W3C availability check
            status = await lm.availability({
              expectedInputs: [{ type: 'text', languages: ['en'] }],
              expectedOutputs: [{ type: 'text', languages: ['en'] }],
              outputLanguage: 'en',
              expectedInputLanguages: ['en'],
              expectedOutputLanguages: ['en'],
            });
          } catch {
            try {
              status = await lm.availability({
                outputLanguage: 'en',
                expectedInputLanguages: ['en'],
                expectedOutputLanguages: ['en'],
              });
            } catch {
              status = await lm.availability();
            }
          }

          const mappedStatus =
            status === 'readily' || status === 'available'
              ? 'readily'
              : status === 'after-download' || status === 'downloadable'
              ? 'after-download'
              : 'no';
          this.cachedAvailability = { status: mappedStatus };
          return this.cachedAvailability;
        }

        if (typeof lm.capabilities === 'function') {
          const caps = await lm.capabilities();
          const mappedStatus =
            caps?.available === 'readily' || caps?.available === 'available'
              ? 'readily'
              : caps?.available === 'after-download' || caps?.available === 'downloadable'
              ? 'after-download'
              : caps?.available || 'no';
          this.cachedAvailability = {
            status: mappedStatus,
            maxTokens: caps?.maxTokens,
            temperature: caps?.defaultTemperature,
          };
          return this.cachedAvailability;
        }

        this.cachedAvailability = { status: 'no' };
        return this.cachedAvailability;
      } catch {
        this.cachedAvailability = { status: 'no' };
        return this.cachedAvailability;
      } finally {
        this.availabilityPromise = null;
      }
    })();

    return this.availabilityPromise;
  }

  /**
   * Creates a configured session instance respecting user consent
   */
  private async createSessionInstance(opts?: Partial<AiInferenceOptions>): Promise<any> {
    // UK GDPR & Children's Code Consent Gate:
    // If the user hasn't explicitly granted permission, do NOT spin up or download local neural weights
    if (!hasUserGrantedAiConsent()) {
      throw new Error('User has not consented to in-browser AI model execution/download.');
    }
    const lm = this.getAiRoot();
    if (!lm) {
      throw new Error('W3C LanguageModel API not supported in this environment.');
    }

    const systemPrompt = opts?.systemPrompt || 'You are an elite UK Curriculum Socratic educator.';

    // Fully-specified W3C Prompt API configuration
    const createOptions: any = {
      systemPrompt,
      // Modern W3C spec: replaces numeric temperature/topK
      samplingMode: 'most-predictable',
      expectedInputs: [{ type: 'text', languages: ['en'] }],
      expectedOutputs: [{ type: 'text', languages: ['en'] }],
      outputLanguage: 'en',
      expectedInputLanguages: ['en'],
      expectedOutputLanguages: ['en'],
    };
    if (opts?.onDownloadProgress) {
      createOptions.monitor = (m: any) => {
        m.addEventListener('downloadprogress', (e: any) => {
          opts.onDownloadProgress?.(e.loaded, e.total);
        });
      };
    }

    const createPromise = (async () => {
      // 1. Try modern W3C Prompt API with samplingMode
      try {
        return await lm.create(createOptions);
      } catch {
        // 2. Fall back to numeric temperature/topK for older Chromium revisions
        try {
          return await lm.create({
            systemPrompt,
            temperature: 0.1,
            topK: 1,
            outputLanguage: 'en',
            expectedInputLanguages: ['en'],
            expectedOutputLanguages: ['en'],
          });
        } catch {
          // 3. Minimal fallback
          return await lm.create({
            systemPrompt,
            expectedInputLanguages: ['en'],
            expectedOutputLanguages: ['en'],
          });
        }
      }
    })();

    // Model weight downloading might take longer, allow 45s if monitoring progress, otherwise 25s
    const creationTimeoutMs = opts?.onDownloadProgress ? 45000 : 25000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`[AiCaller] Session initialization timed out after ${creationTimeoutMs}ms`)), creationTimeoutMs)
    );

    return Promise.race([createPromise, timeoutPromise]);
  }

  /**
   * Returns a stateful multi-turn session or an ephemeral single-task session
   */
  async getSession(opts?: Partial<AiInferenceOptions>): Promise<any> {
    const systemPrompt = opts?.systemPrompt || 'You are an elite UK Curriculum Socratic educator.';

    if (!opts?.preserveContext) {
      return await this.createSessionInstance(opts);
    }

    if (this.chatSession && this.activeSystemPrompt !== systemPrompt) {
      this.destroy();
    }

    if (!this.chatSession) {
      this.activeSystemPrompt = systemPrompt;
      this.chatSession = await this.createSessionInstance(opts);
    }

    return this.chatSession;
  }

  /**
   * Single prompt execution with strict timeout protection and WebLLM fallback
   */
  async promptText(opts: AiInferenceOptions): Promise<string> {
    if (!hasUserGrantedAiConsent()) {
      throw new Error('User has not consented to in-browser AI model execution.');
    }

    // Child safety check on input before calling any model
    const safetyCheck = validateStudentInput(opts.prompt);
    if (!safetyCheck.isSafe) {
      return safetyCheck.safeReplacementText || 'Let us keep our learning safe and focused on your school lessons.';
    }

    let rawOutput = '';

    // Tier 1: Chrome Native Prompt API
    if (this.hasNativePromptApi()) {
      const isEphemeral = !opts.preserveContext;
      let session = await this.getSession(opts);
      const timeoutMs = opts.timeoutMs ?? 25000;

const executeCall = async (s: any) => {
  let activeSession = s;

  const buildArgs = (includeConstraint: boolean) => {
    const args: any = { outputLanguage: 'en' };
    if (includeConstraint && opts.responseConstraint) {
      args.responseConstraint = opts.responseConstraint;
      if (opts.omitResponseConstraintInput !== undefined) {
        args.omitResponseConstraintInput = opts.omitResponseConstraintInput;
      }
    }
    return args;
  };

  const attemptPrompt = async (targetSession: any, useConstraint: boolean) => {
    const args = buildArgs(useConstraint);
    try {
      return await targetSession.prompt(opts.prompt, args);
    } catch (err: any) {
      // Fallback for older Chromium builds that reject options objects entirely
      if (err?.name === 'TypeError' || String(err?.message || '').includes('parameter')) {
        return await targetSession.prompt(opts.prompt);
      }
      throw err;
    }
  };

  try {
    return await attemptPrompt(activeSession, true);
  } catch (err: any) {
    const isDestroyed =
      err?.name === 'InvalidStateError' ||
      String(err?.message || '').toLowerCase().includes('destroyed');

    // Case 1: Session died / invalidated -> Reinitialize and retry
    if (isDestroyed) {
      if (isEphemeral) {
        try { activeSession?.destroy?.(); } catch {}
      } else {
        this.destroy();
      }

      activeSession = await this.getSession(opts);
      session = activeSession; // keep outer reference in sync for final cleanup

      try {
        return await attemptPrompt(activeSession, true);
      } catch (retryErr: any) {
        // If it failed again specifically on constraints, drop down to unconstrained
        if (opts.responseConstraint) {
          console.warn('[AiCaller] Reinitialized session failed on constraint; falling back unconstrained:', retryErr);
          return await attemptPrompt(activeSession, false);
        }
        throw retryErr;
      }
    }

    // Case 2: Constraint unsupported by runtime -> Retry unconstrained on same session
    if (opts.responseConstraint) {
      console.warn('[AiCaller] Prompt with responseConstraint failed, retrying unconstrained:', err);
      return await attemptPrompt(activeSession, false);
    }

    throw err;
  }
};
      const inferencePromise = executeCall(session);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`[AiCaller] Inference prompt timed out after ${timeoutMs}ms`)), timeoutMs)
      );

      try {
        rawOutput = await Promise.race([inferencePromise, timeoutPromise]);
      } catch (err) {
        if (!isEphemeral) this.destroy();
        console.warn('[AiCaller] Chrome AI prompt failed, invoking WebLLM fallback:', err);
        // Fall through to Tier 2
      } finally {
        if (isEphemeral && session?.destroy) {
          try { session.destroy(); } catch {}
        }
      }
    }

    // Tier 2: WebLLM / WebGPU neural execution for Safari 18+, Firefox, and non-Chromium
    if (!rawOutput && edgeCognitiveEngine.isSupported()) {
      const res = await edgeCognitiveEngine.infer(opts.prompt, opts.systemPrompt);
      rawOutput = res.output;
    }

    if (!rawOutput) {
      throw new Error('No on-device AI inference engine is available in this browser environment.');
    }

    // Sanitize output for child safety before returning
    return sanitizeAiOutput(rawOutput);
  }

  /**
   * Streaming prompt execution supporting native Chrome API and WebLLM WebGPU streams
   */
  async *promptStream(opts: AiInferenceOptions): AsyncGenerator<string, void, unknown> {
    if (!hasUserGrantedAiConsent()) {
      throw new Error('User has not consented to in-browser AI model execution.');
    }

    // Child safety check on streaming input
    const safetyCheck = validateStudentInput(opts.prompt);
    if (!safetyCheck.isSafe) {
      yield safetyCheck.safeReplacementText || 'Let us keep our learning safe and focused on your school lessons.';
      return;
    }

    // Tier 1: Chrome Native Prompt API Streaming
    if (this.hasNativePromptApi()) {
      const isEphemeral = !opts.preserveContext;
      let session = await this.getSession(opts);

      try {
        let stream: any = null;
        try {
          stream = session.promptStreaming ? session.promptStreaming(opts.prompt, { outputLanguage: 'en' }) : null;
        } catch {
          stream = session.promptStreaming ? session.promptStreaming(opts.prompt) : null;
        }

        if (!stream) {
          let text = '';
          try {
            text = await session.prompt(opts.prompt, { outputLanguage: 'en' });
          } catch {
            text = await session.prompt(opts.prompt);
          }
          yield text;
          return;
        }

        if (Symbol.asyncIterator in stream) {
          let previous = '';
          for await (const chunk of stream) {
            const delta = chunk.startsWith(previous) ? chunk.slice(previous.length) : chunk;
            previous = chunk;
            yield delta;
          }
        } else if (typeof stream.getReader === 'function') {
          const reader = stream.getReader();
          let previous = '';
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = typeof value === 'string' ? value : new TextDecoder().decode(value);
              const delta = chunk.startsWith(previous) ? chunk.slice(previous.length) : chunk;
              previous = chunk;
              yield delta;
            }
          } finally {
            reader.releaseLock();
          }
        }
        return;
      } catch (err) {
        if (!isEphemeral) this.destroy();
        console.warn('[AiCaller] Native stream failed, trying WebLLM streaming:', err);
        // Fall through to Tier 2
      } finally {
        if (isEphemeral && session?.destroy) {
          try { session.destroy(); } catch {}
        }
      }
    }

    // Tier 2: WebLLM / WebGPU real-time token stream
    if (edgeCognitiveEngine.isSupported()) {
      for await (const token of edgeCognitiveEngine.inferStream(opts.prompt, opts.systemPrompt)) {
        yield token;
      }
      return;
    }

    throw new Error('No on-device AI inference engine is available in this browser environment.');
  }

  /**
   * Token budget inspection
   */
  async getRemainingTokens(): Promise<number | null> {
    if (!this.chatSession?.tokensLeft) return null;
    return this.chatSession.tokensLeft;
  }

  /**
   * Explicit lifecycle cleanup
   */
  destroy() {
    if (this.chatSession) {
      try {
        this.chatSession.destroy?.();
      } catch {}
      this.chatSession = null;
      this.activeSystemPrompt = '';
    }
  }
}

export const aiCaller = new AiRuntimeCaller();

// ============================================================================
// GEMINI NANO × AST VECTOR PLAYER CO-PILOT RPC PROTOCOL (betaplans.md)
// ============================================================================

export interface PlayerSpatialTelemetry {
  sExpr?: string;
  rayHitSExpr?: string;
  cameraStateSExpr?: string;
  hit?: {
    target: string;
    dist: number;
    norm: [number, number, number];
    xyz: [number, number, number];
  } | null;
  camera?: {
    theta: number;
    phi: number;
    dist: number;
  };
  timestamp?: number;
}

export interface PlayerTelemetryEvent {
  type: 'PLAYER_TELEMETRY';
  sceneId: string;
  progress: number;
  activeKeyframe: number;
  variables: Record<string, any>;
  lastUserAction: string;
  lastErrorKey?: string;
  spatialTelemetry?: PlayerSpatialTelemetry;
  timestamp: number;
}

export type AiVisualAction =
  | { type: 'SEEK'; targetProgress: number; durationMs?: number }
  | { type: 'HIGHLIGHT'; selector: string; pulseColor?: string; durationMs?: number }
  | { type: 'SET_VARIABLE'; variable: string; value: number | string }
  | { type: 'STEP'; stepIndex: number }
  | { type: 'ANNOTATE'; targetSelector: string; labelText: string; arrowDirection?: 'up' | 'down' | 'left' | 'right' }
  | { type: 'NARRATE'; text: string; language?: string }
  | { type: 'ZOOM_ELEMENT'; selector: string; durationMs?: number }
  | { type: 'RESET_VIEW'; durationMs?: number }
  | { type: 'ROTATE_CAMERA'; theta?: number; phi?: number; deltaTheta?: number; deltaPhi?: number; durationMs?: number }
  | { type: 'NUDGE'; target: string; dxyz: [number, number, number]; durationMs?: number }
  | { type: 'PROBE_MOVE'; target: string; xyz: [number, number, number]; durationMs?: number }
  | { type: 'CAST_RAY'; screenX?: number; screenY?: number };

export interface AiVisualCommandPacket {
  type: 'AI_VISUAL_COMMAND';
  transactionId: string;
  actions: AiVisualAction[];
  pedagogicalIntent: 'EXPLAIN_MISCONCEPTION' | 'STEP_BY_STEP_DEMO' | 'ENCOURAGE';
  rawSExpr?: string;
  sayText?: string;
}

/**
 * Sanitizes an SVG CSS selector to guarantee zero script injection
 */
function sanitizeSvgSelector(rawSelector: string): string | null {
  if (!rawSelector || typeof rawSelector !== 'string') return null;
  const clean = rawSelector.trim().replace(/^['"]|['"]$/g, '');
  // Disallow javascript protocol, script tags, or dangerous syntax
  if (/[<>'"`;(){}]/.test(clean) || clean.toLowerCase().includes('script')) {
    return null;
  }
  // Must look like an ID (#...), class (....), or attribute ([...])
  if (/^[#\.]?[a-zA-Z0-9_\-\:]+$/.test(clean) || /^\[[a-zA-Z0-9_\-]+(=['"]?[a-zA-Z0-9_\-]+['"]?)?\]$/.test(clean)) {
    return clean.startsWith('#') || clean.startsWith('.') || clean.startsWith('[') ? clean : `#${clean}`;
  }
  return null;
}

/**
 * Parses Gemini Nano's concise Lisp-style S-Expression grammar:
 * (:act :seek <0.0-1.0> [:highlight "<svg-id>"] [:var "<name>" <val>] [:say "<text>"] [:zoom "<svg-id>"]
 *       [:orbit :theta <f> :phi <f>] [:nudge :target "<id>" :dxyz [<dx> <dy> <dz>]])
 */
export function parseAiActionTuples(nanoOutput: string): {
  actions: AiVisualAction[];
  sayText: string;
  rawSExpr: string;
} {
  const actions: AiVisualAction[] = [];
  let sayText = '';
  const sExprList: string[] = [];

  // 1. Match all (:act ...) blocks
  const actRegex = /\(:act\s+([^)]+)\)/gi;
  let match: RegExpExecArray | null;

  while ((match = actRegex.exec(nanoOutput)) !== null) {
    const rawTuple = match[0];
    const body = match[1];
    sExprList.push(rawTuple);

    // Parse :seek <float>
    const seekMatch = body.match(/:seek\s+([0-9.]+)/i);
    if (seekMatch) {
      const p = Math.max(0.0, Math.min(1.0, parseFloat(seekMatch[1])));
      if (!isNaN(p)) {
        actions.push({ type: 'SEEK', targetProgress: p, durationMs: 800 });
      }
    }

    // Parse :highlight / :spotlight "<selector>"
    const highlightMatch = body.match(/:(highlight|spotlight)\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))/i);
    if (highlightMatch) {
      const rawSel = highlightMatch[3] || highlightMatch[4] || highlightMatch[5];
      const validSel = sanitizeSvgSelector(rawSel);
      if (validSel) {
        actions.push({ type: 'HIGHLIGHT', selector: validSel, pulseColor: '#38bdf8', durationMs: 4500 });
      }
    }

    // Parse :zoom "<selector>"
    const zoomMatch = body.match(/:zoom\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))/i);
    if (zoomMatch) {
      const rawSel = zoomMatch[2] || zoomMatch[3] || zoomMatch[4];
      const validSel = sanitizeSvgSelector(rawSel);
      if (validSel) {
        actions.push({ type: 'ZOOM_ELEMENT', selector: validSel, durationMs: 700 });
      }
    }

    // Parse :orbit / :rotate-camera :theta <val> :phi <val>
    const orbitMatch = body.match(/:(?:orbit|rotate-camera|camera)\s+:theta\s+([0-9.-]+)\s+:phi\s+([0-9.-]+)/i);
    if (orbitMatch) {
      const theta = parseFloat(orbitMatch[1]);
      const phi = parseFloat(orbitMatch[2]);
      if (!isNaN(theta) && !isNaN(phi)) {
        actions.push({ type: 'ROTATE_CAMERA', theta, phi, durationMs: 700 });
      }
    }

    // Parse :nudge :target "<selector>" :dxyz [<dx> <dy> <dz>]
    const nudgeMatch = body.match(/:nudge\s+:target\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))\s+:dxyz\s+\[([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\]/i);
    if (nudgeMatch) {
      const rawSel = nudgeMatch[2] || nudgeMatch[3] || nudgeMatch[4];
      const validSel = sanitizeSvgSelector(rawSel);
      const dx = parseFloat(nudgeMatch[5]);
      const dy = parseFloat(nudgeMatch[6]);
      const dz = parseFloat(nudgeMatch[7]);
      if (validSel && !isNaN(dx) && !isNaN(dy) && !isNaN(dz)) {
        actions.push({ type: 'NUDGE', target: validSel, dxyz: [dx, dy, dz], durationMs: 600 });
      }
    }

    // Parse :probe-move :target "<selector>" :xyz [<x> <y> <z>]
    const probeMatch = body.match(/:probe-move\s+:target\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))\s+:xyz\s+\[([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\]/i);
    if (probeMatch) {
      const rawSel = probeMatch[2] || probeMatch[3] || probeMatch[4];
      const validSel = sanitizeSvgSelector(rawSel);
      const x = parseFloat(probeMatch[5]);
      const y = parseFloat(probeMatch[6]);
      const z = parseFloat(probeMatch[7]);
      if (validSel && !isNaN(x) && !isNaN(y) && !isNaN(z)) {
        actions.push({ type: 'PROBE_MOVE', target: validSel, xyz: [x, y, z], durationMs: 600 });
      }
    }

    // Parse :var "<name>" <val>
    const varMatch = body.match(/:var\s+("?([a-zA-Z0-9_]+)"?)\s+([0-9.-]+|"[^"]+"|'[^']+')/i);
    if (varMatch) {
      const varName = varMatch[2];
      const rawVal = varMatch[3].replace(/^['"]|['"]$/g, '');
      const numVal = parseFloat(rawVal);
      const finalVal = isNaN(numVal) ? rawVal : numVal;
      actions.push({ type: 'SET_VARIABLE', variable: varName, value: finalVal });
    }

    // Parse :step <int>
    const stepMatch = body.match(/:step\s+([0-9]+)/i);
    if (stepMatch) {
      actions.push({ type: 'STEP', stepIndex: parseInt(stepMatch[1], 10) });
    }

    // Parse :reset
    if (/:reset/i.test(body)) {
      actions.push({ type: 'RESET_VIEW' });
    }

    // Parse :say / :narrate "<text>"
    const sayMatch = body.match(/:(say|narrate)\s+("([^"]*)"|'([^']*)')/i);
    if (sayMatch) {
      const text = (sayMatch[3] !== undefined ? sayMatch[3] : sayMatch[4] || '').trim();
      if (text) {
        if (!sayText) sayText = text;
        actions.push({ type: 'NARRATE', text });
      }
    }
  }

  // 2. Parse standalone spatial action opcodes if not enclosed in (:act ...)
  const standaloneOrbit = nanoOutput.match(/\(:(?:rotate-camera|orbit|camera)\s+:theta\s+([0-9.-]+)\s+:phi\s+([0-9.-]+)\)/i);
  if (standaloneOrbit) {
    const theta = parseFloat(standaloneOrbit[1]);
    const phi = parseFloat(standaloneOrbit[2]);
    if (!isNaN(theta) && !isNaN(phi)) {
      actions.push({ type: 'ROTATE_CAMERA', theta, phi, durationMs: 700 });
      sExprList.push(standaloneOrbit[0]);
    }
  }

  const standaloneNudge = nanoOutput.match(/\(:nudge\s+:target\s+("([^"]+)"|'([^']+)'|([#a-zA-Z0-9_\-:]+))\s+:dxyz\s+\[([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\]\)/i);
  if (standaloneNudge) {
    const rawSel = standaloneNudge[2] || standaloneNudge[3] || standaloneNudge[4];
    const validSel = sanitizeSvgSelector(rawSel);
    const dx = parseFloat(standaloneNudge[5]);
    const dy = parseFloat(standaloneNudge[6]);
    const dz = parseFloat(standaloneNudge[7]);
    if (validSel && !isNaN(dx) && !isNaN(dy) && !isNaN(dz)) {
      actions.push({ type: 'NUDGE', target: validSel, dxyz: [dx, dy, dz], durationMs: 600 });
      sExprList.push(standaloneNudge[0]);
    }
  }

  // 3. If no :say was found inside (:act ...), extract spoken explanation from text outside the S-Expr
  if (!sayText) {
    const textWithoutSExpr = nanoOutput.replace(/\(:[a-z\-]+\s+[^)]+\)/gi, '').replace(/```[a-z]*|```/gi, '').trim();
    sayText = textWithoutSExpr || 'Let us observe the visual demonstration on the simulation stage.';
    if (actions.length > 0) {
      actions.push({ type: 'NARRATE', text: sayText });
    }
  }

  // 4. Fallback: If no action was emitted at all, generate an informative seek or orbit
  if (actions.length === 0) {
    const lower = nanoOutput.toLowerCase();
    if (lower.includes('orbit') || lower.includes('camera') || lower.includes('angle') || lower.includes('rotate')) {
      actions.push({ type: 'ROTATE_CAMERA', theta: 25.0, phi: -10.0, durationMs: 700 });
      actions.push({ type: 'NARRATE', text: sayText });
      sExprList.push(`(:act :orbit :theta 25.0 :phi -10.0 :say "${sayText.slice(0, 60)}")`);
    } else if (lower.includes('nudge') || lower.includes('probe') || lower.includes('core')) {
      actions.push({ type: 'NUDGE', target: '#coil-core', dxyz: [0.0, 5.0, 0.0], durationMs: 600 });
      actions.push({ type: 'NARRATE', text: sayText });
      sExprList.push(`(:act :nudge :target "#coil-core" :dxyz [0.0 5.0 0.0] :say "${sayText.slice(0, 60)}")`);
    } else {
      const targetP = lower.includes('finish') || lower.includes('result') || lower.includes('conclu') ? 0.9 : 0.5;
      actions.push({ type: 'SEEK', targetProgress: targetP, durationMs: 800 });
      actions.push({ type: 'NARRATE', text: sayText });
      sExprList.push(`(:act :seek ${targetP} :say "${sayText.slice(0, 80).replace(/"/g, "'")}...")`);
    }
  }

  return {
    actions,
    sayText,
    rawSExpr: sExprList.join('\n') || `(:act :seek 0.5 :say "${sayText.slice(0, 60)}")`,
  };
}

/**
 * Prompts Gemini Nano on-device to generate visual demonstration action tuples (:act)
 * conforming to the Co-Pilot specification in betaplans.md, with Proprioceptive Spatial Awareness.
 */
/**
 * Canonical regular expression constraining Gemini Nano's sampling logits directly
 * to single-level (:act ...) S-expression action tuples (Kenji / W3C Prompt API test case).
 */
export const NANO_ACT_TUPLE_REGEX =
  /^\s*\(:act(\s+:(seek\s+[0-1](\.\d+)?|highlight\s+"#[a-zA-Z0-9_\-:]+"|zoom\s+"#[a-zA-Z0-9_\-:]+"|orbit\s+:theta\s+-?\d+(\.\d+)?\s+:phi\s+-?\d+(\.\d+)?|nudge\s+:target\s+"#[a-zA-Z0-9_\-:]+"\s+:dxyz\s+\[-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\]|probe-move\s+:target\s+"#[a-zA-Z0-9_\-:]+"\s+:xyz\s+\[-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\]|var\s+"[a-zA-Z0-9_]+"\s+(-?\d+(\.\d+)?|"[^"]*")|step\s+\d+|reset|say\s+"[^"]*"))+\)\s*$/;

export async function promptAiCoPilotDemonstration(
  telemetry: Partial<PlayerTelemetryEvent>,
  pupilQuestion: string,
  opts?: { targetScene?: string; availableSelectors?: string[] }
): Promise<AiVisualCommandPacket> {
  const sceneId = telemetry?.sceneId || opts?.targetScene || 'simulation';
  const progressPercent = Math.round((telemetry?.progress ?? 0) * 100);
  const varsObj = telemetry?.variables || {};
  const varsStr = JSON.stringify(varsObj);
  const keyframeIdx = telemetry?.activeKeyframe ?? 0;

  // Spatial Telemetry Emission: exact ray hit and camera state S-Expression tokens
  const spatialTelemetryToken =
    telemetry?.spatialTelemetry?.sExpr ||
    telemetry?.spatialTelemetry?.rayHitSExpr ||
    '(:ray-hit :target "#coil-core" :dist 4.2 :norm [0.0 1.0 0.0] :xyz [12.0 45.0 -8.5])';
  const hitTarget = telemetry?.spatialTelemetry?.hit?.target || '#coil-core';

  // Compact, high-instruction-density system prompt constrained by betaplans.md grammar and Proprioceptive Awareness
  const systemPrompt = `You are Gemini Nano, an on-device AI Co-Pilot embedded in the St Joseph's Vector Classroom Whiteboard.
CURRENT SCENE: "${sceneId}" | PROGRESS: ${progressPercent}% (Step #${keyframeIdx}) | VARIABLES: ${varsStr}.

PROPRIOCEPTIVE SPATIAL TELEMETRY (Zero-Raster Token Stream):
Rather than consuming massive token bandwidth with raw image frames or video buffers:
The 3D coordinates and direct analytic ray-math intersections are condensed into compact symbolic S-Expression tokens:
${spatialTelemetryToken}

You have exact proprioceptive awareness: you know where the viewer is looking and which object the ray strikes without guessing.
Active Hit Target: "${hitTarget}".

DETERMINISTIC ACTUATION:
When you respond with an action opcode, the engine updates theta, phi, or node translation, re-evaluates the parametric equations, and re-sorts visible vector layers via the Painter's algorithm with depth fog.

Output strictly an (:act ...) S-Expression tuple in your response:
(:act [:seek <0.0 to 1.0>] [:orbit :theta <deg> :phi <deg>] [:nudge :target "<id>" :dxyz [<dx> <dy> <dz>]] [:highlight "<svg-id>"] [:var "<name>" <val>] [:zoom "<svg-id>"] [:say "<1-2 sentence spoken explanation>"])

EXAMPLES:
- Spatial Hit Identification: (:act :highlight "#coil-core" :say "Your gaze ray strikes #coil-core at coordinates [12.0 45.0 -8.5] with normal [0.0 1.0 0.0].")
- Deterministic Orbit: (:act :orbit :theta 25.0 :phi -10.0 :say "Rotating camera to view the apparatus in 3D perspective.")
- Deterministic Probe Nudge: (:act :nudge :target "#coil-core" :dxyz [0.0 5.0 0.0] :say "Nudging the coil core upwards to increase magnetic flux linkage.")
- Boyle's Gas Law: (:act :seek 0.30 :highlight "#piston" :var "pressure" 2.5 :say "Compressing the piston cylinder doubles particle collisions.")

RULES:
1. Output the (:act ...) S-Expression directly.
2. Explanations must be UK Curriculum aligned, pedagogically accurate, and under 30 words.
3. Incorporate proprioceptive ray-hit coordinates when asked about what is being looked at.`;

  const userPrompt = `Pupil asks: "${pupilQuestion.trim()}". Spatial token: ${spatialTelemetryToken}. Show and actuate on the simulation stage.`;

  // Execute on-device inference (Chrome Prompt API with WebLLM fallback)
// Execute on-device inference with RegExp sampling constraint
  const rawOutput = await aiCaller.promptText({
    prompt: userPrompt,
    systemPrompt,
    timeoutMs: 16000,
    responseConstraint: NANO_ACT_TUPLE_REGEX,
    omitResponseConstraintInput: true,
  });
  const parsed = parseAiActionTuples(rawOutput);

  return {
    type: 'AI_VISUAL_COMMAND',
    transactionId: `nano_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    actions: parsed.actions,
    pedagogicalIntent: 'STEP_BY_STEP_DEMO',
    rawSExpr: parsed.rawSExpr,
    sayText: parsed.sayText,
  };
}
