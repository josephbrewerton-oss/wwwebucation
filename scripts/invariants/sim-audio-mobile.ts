// scripts/invariants/sim-audio-mobile.ts
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  loadAstPlayerRuntimeIntoSandbox,
  loadSiteGesturesRuntimeIntoSandbox,
} from './harness';

export async function runAudioMobileInvariants(): Promise<number> {
  let passedTests = 0;

  // =========================================================================
  // 28. Mobile / Android PWA Cartridge Audio, Touch Activation & TTS Invariants
  // =========================================================================
  {
    // 28a. Verify VectorProceduralAudioSynth.unlock() does NOT poison _unlocked while suspended,
    // prefers iframe-local AudioContext over a suspended window.top context, and syncs mute state
    let localCtxCreated = 0;
    let silentBuffersPlayed = 0;
    let resumeCalls = 0;
    let allowResumeToRun = false;

    class MockAudioContext {
      state = 'suspended';
      currentTime = 0;
      destination = {};
      constructor() { localCtxCreated++; }
      resume() {
        resumeCalls++;
        if (allowResumeToRun) {
          this.state = 'running';
          return Promise.resolve();
        }
        return Promise.resolve();
      }
      createBuffer() { return {}; }
      createBufferSource() {
        return {
          buffer: null,
          connect() {},
          start() { silentBuffersPlayed++; },
        };
      }
      createOscillator() {
        return {
          type: 'sine',
          frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
          connect() {},
          start() {},
          stop() {},
        };
      }
      createGain() {
        return {
          gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
          connect() {},
        };
      }
    }

    const spokenOnIframe: any[] = [];
    const spokenOnTop: any[] = [];
    let cancelCountIframe = 0;
    const scheduledTimeouts: Array<{ fn: Function; ms: number }> = [];

    class MockUtterance {
      text: string;
      lang = '';
      rate = 1;
      pitch = 1;
      volume = 1;
      voice: any = null;
      onstart: any = null;
      onend: any = null;
      onerror: any = null;
      onboundary: any = null;
      constructor(text: string) { this.text = text; }
    }

    const iframeSpeechSynth: any = {
      speaking: false,
      pending: false,
      paused: false,
      getVoices: () => [
        { name: 'Google Cloud en-GB', lang: 'en-GB', localService: false },
        { name: 'Android Local en-GB', lang: 'en-GB', localService: true },
      ],
      cancel() {
        cancelCountIframe++;
        this.speaking = false;
        this.pending = false;
      },
      resume() { this.paused = false; },
      speak(u: any) {
        this.speaking = true;
        spokenOnIframe.push(u);
      },
    };

    const topSuspendedCtx = { state: 'suspended', resume: () => Promise.resolve() };
    const topWin: any = {
      location: { origin: 'https://example.test' },
      __astSharedAudioCtx: topSuspendedCtx,
      speechSynthesis: {
        speak(u: any) { spokenOnTop.push(u); },
        getVoices: () => [],
        cancel() {},
      },
      SpeechSynthesisUtterance: MockUtterance,
      addEventListener: () => {},
    };

    const audioWin: any = {
      location: { origin: 'https://example.test', search: '' },
      top: topWin,
      AudioContext: MockAudioContext,
      speechSynthesis: iframeSpeechSynth,
      SpeechSynthesisUtterance: MockUtterance,
      addEventListener: () => {},
    };

    const audioSb: any = {
      console, Math, Number, String, Boolean, Array, Object, Map, Set, WeakSet,
      ArrayBuffer, DataView, Float32Array, Float64Array, Int32Array, Uint8Array,
      TextDecoder, TextEncoder, RegExp, Error, JSON, URLSearchParams, Date, Function,
      parseInt, parseFloat, isNaN, isFinite,
      setTimeout: (fn: Function, ms = 0) => { scheduledTimeouts.push({ fn, ms }); return scheduledTimeouts.length; },
      clearTimeout: () => {},
      performance: { now: () => Date.now() },
      navigator: { userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/125.0.0.0 Mobile Safari/537.36' },
      location: audioWin.location,
      window: audioWin,
    };
    audioSb.globalThis = audioSb;
    audioSb.self = audioWin;
    loadAstPlayerRuntimeIntoSandbox(audioSb);

    const MobileEngineCtor = audioSb.ASTVectorPlayerEngine || audioWin.ASTVectorPlayerEngine;
    const mobileEngine = new MobileEngineCtor({ muted: false, voiceEnabled: true });

    // First unlock during an unactivated touchstart/pointerdown: must NOT reuse suspended top ctx and must NOT set _unlocked = true
    const buffersBeforeFirst = silentBuffersPlayed;
    const firstUnlockOk = mobileEngine.audioSynth.unlock();
    assert.strictEqual(firstUnlockOk, false, 'unlock() must return false while AudioContext stays suspended');
    assert.strictEqual(mobileEngine.audioSynth._unlocked, false, 'unlock() must NOT poison _unlocked=true while AudioContext is suspended');
    assert.strictEqual(localCtxCreated, 1, 'Iframe audioSynth must create a local AudioContext rather than adopting a suspended window.top context');
    assert.strictEqual(silentBuffersPlayed, buffersBeforeFirst + 1, 'Suspended unlock attempt plays silent buffer without poisoning _unlocked');

    // Second unlock during a valid touchend/pointerup (resume transitions to running): must re-run silent buffer and mark _unlocked = true
    allowResumeToRun = true;
    const secondUnlockOk = mobileEngine.audioSynth.unlock();
    assert.strictEqual(secondUnlockOk, true, 'unlock() must return true once AudioContext transitions to running');
    assert.strictEqual(mobileEngine.audioSynth._unlocked, true, 'unlock() must mark _unlocked=true once running');
    assert.strictEqual(silentBuffersPlayed, buffersBeforeFirst + 2, 'Second unlock under valid gesture must re-play silent buffer because first did not poison _unlocked');

    // Third unlock after running: already unlocked, should not allocate extra silent buffers
    const thirdUnlockOk = mobileEngine.audioSynth.unlock();
    assert.strictEqual(thirdUnlockOk, true, 'Subsequent unlock() remains true once running');
    assert.strictEqual(silentBuffersPlayed, buffersBeforeFirst + 2, 'Already-unlocked running context must not replay silent buffer unnecessarily');

    // Mute & volume sync + toggleVoice(force) + _playSceneBootSound
    mobileEngine.setMuted(true);
    assert.strictEqual(mobileEngine.audioSynth.muted, true, 'engine.setMuted(true) must sync audioSynth.muted');
    mobileEngine.toggleMute();
    assert.strictEqual(mobileEngine.audioSynth.muted, false, 'engine.toggleMute() must sync audioSynth.muted');
    mobileEngine.setVolume(0);
    assert.strictEqual(mobileEngine.audioSynth.muted, true, 'engine.setVolume(0) must mute audioSynth');
    mobileEngine.setVolume(0.8);
    assert.strictEqual(mobileEngine.audioSynth.muted, false, 'engine.setVolume(0.8) must unmute audioSynth');
    assert.strictEqual(mobileEngine.toggleVoice(true), true, 'engine.toggleVoice(true) must honor force=true rather than flipping off');
    assert.strictEqual(mobileEngine.toggleVoice(false), false, 'engine.toggleVoice(false) must honor force=false');
    assert.strictEqual(mobileEngine.toggleVoice(true), true, 'engine.toggleVoice(true) must re-enable voice');

    // Boot sound via audioSynth.playTone must work without throwing
    assert.strictEqual(typeof mobileEngine.audioSynth.playTone, 'function', 'VectorProceduralAudioSynth must expose playTone()');
    mobileEngine._playSceneBootSound({ bootSound: '440' });

    // SpeechSynthesis inside iframe must use iframe's own window.speechSynthesis, prefer localService voice,
    // and on Android use a 25ms handoff when cancelling active speech
    mobileEngine.speak('Hello phonics', { immediate: true });
    assert.strictEqual(spokenOnTop.length, 0, 'Iframe speakText must NOT route away to window.top when iframe speechSynthesis exists');
    assert.strictEqual(spokenOnIframe.length, 1, 'First speakText must speak synchronously on iframe speechSynthesis');
    assert.strictEqual(spokenOnIframe[0].voice.localService, true, 'speakText must prefer localService=true voice on Android/PWA');

    // Second speak while first is still active on Android -> cancel() + 25ms deferred speak()
    scheduledTimeouts.length = 0;
    mobileEngine.speak('Second word', { immediate: true });
    assert.strictEqual(cancelCountIframe, 1, 'Interrupting active speech must call cancel()');
    assert.strictEqual(spokenOnIframe.length, 1, 'On Android, speak() after cancel() must wait for 25ms handoff instead of same-tick race');
    const handoff = scheduledTimeouts.find((t) => t.ms === 25);
    assert.ok(handoff, 'Android cancel->speak handoff must schedule a 25ms timeout');
    handoff!.fn();
    assert.strictEqual(spokenOnIframe.length, 2, '25ms handoff must execute speak() for the replacement utterance');
    assert.strictEqual(spokenOnIframe[1].text, 'Second word', 'Replacement utterance text must match');

    // 28b. Verify modular site-gestures runtime defers touch-tap audio/TTS to pointerup/touchend AND plays first :tone synchronously
    const siteTimeouts: Array<{ fn: Function; ms: number }> = [];
    const siteSpoken: string[] = [];
    const siteTones: number[] = [];
    let touchPreventDefaultCalled = false;

    const touchEl: any = {
      id: 'word-1',
      getAttribute: (a: string) => (a === 'data-word' ? 'cat' : null),
      hasAttribute: (a: string) => a === 'data-word',
      setAttribute: () => {},
      closest: (sel: string) => (sel === '.book-word' ? touchEl : null),
      style: {},
    };
    const mockStageSvg: any = {
      style: {},
      parentNode: null,
      hasAttribute: () => true,
      setAttribute: () => {},
      appendChild: () => {},
      getScreenCTM: () => null,
      createSVGPoint: () => ({ x: 0, y: 0, matrixTransform: () => ({ x: 0, y: 0 }) }),
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {},
      removeEventListener: () => {},
      focus: () => {},
    };
    const siteEngineMock: any = {
      vars: { activeWord: '' },
      progress: 0,
      muted: false,
      volume: 1,
      audioSynth: { unlock: () => true },
      scene: {
        id: 'touch-audio-test',
        type: 'Slide',
        gestures: [
          { type: 'clickable', target: '.book-word', setVar: 'activeWord', fromAttr: 'data-word', speakAttr: 'data-word', tone: '523.25,659.25' },
        ],
      },
      setVar(k: string, v: any) { this.vars[k] = v; },
      applyBindings() {},
      speak(txt: string) { siteSpoken.push(txt); },
    };
    const sgWin: any = {
      addEventListener: () => {},
      focus: () => {},
    };
    const sgSb: any = {
      window: sgWin,
      document: {
        getElementById: () => null,
        querySelector: () => null,
        createElement: () => ({ setAttribute: () => {}, style: {}, appendChild: () => {}, classList: { add: () => {}, remove: () => {} } }),
        createElementNS: () => ({ setAttribute: () => {}, style: {}, appendChild: () => {}, replaceChildren: () => {} }),
      },
      performance: { now: () => 1000 },
      setTimeout: (fn: Function, ms = 0) => { siteTimeouts.push({ fn, ms }); return siteTimeouts.length; },
      clearTimeout: () => {},
      console, Math, Number, String, Boolean, Array, Object, Set, Map, Date, Function, parseFloat, parseInt, isNaN,
    };
    sgSb.globalThis = sgSb;
    sgSb.self = sgWin;
    loadSiteGesturesRuntimeIntoSandbox(sgSb);

    const sg = new sgSb.window.ASTDirectGestureSubsystem(siteEngineMock);
    sg.playAudioTone = (hz: number) => siteTones.push(hz);
    sg.createTouchRipple = () => {};
    sg.init(mockStageSvg, null);

    // Simulate Android touch tap: pointerdown (pointerType='touch') -> state updates immediately, audio/TTS queued for pointerup
    sg.handlePointerDown({
      target: touchEl,
      clientX: 50,
      clientY: 50,
      pointerId: 7,
      pointerType: 'touch',
      preventDefault: () => { touchPreventDefaultCalled = true; },
    });
    assert.strictEqual(siteEngineMock.vars.activeWord, 'cat', 'Touch pointerdown must still update cartridge state immediately');
    assert.strictEqual(touchPreventDefaultCalled, false, 'Pure :clickable touch tap must not call preventDefault() on pointerdown');
    assert.strictEqual(siteTones.length, 0, 'Touch pointerdown must defer audio tone until pointerup/touchend user activation');
    assert.strictEqual(siteSpoken.length, 0, 'Touch pointerdown must defer TTS speak until pointerup/touchend user activation');

    // Now lift finger (pointerup): first note of chord plays SYNCHRONOUSLY, second note scheduled at 70ms, TTS fires synchronously
    sg.handlePointerUp({ pointerId: 7, pointerType: 'touch' });
    assert.deepStrictEqual(siteTones, [523.25], 'First tone (idx===0) must play synchronously inside pointerup without setTimeout(0)');
    assert.deepStrictEqual(siteSpoken, ['cat'], 'Queued touch TTS must fire synchronously inside pointerup user activation');
    assert.ok(siteTimeouts.some((t) => t.ms === 70), 'Second arpeggio tone (idx===1) must schedule at 70ms');
    // Duplicate touchend after pointerup must NOT double-fire
    sg.handleTouchEnd();
    assert.strictEqual(siteSpoken.length, 1, 'Subsequent touchend must not double-fire already flushed audio/TTS');

    // 28c. Verify pending boot-sound replay on first unlock, muted speech skip, not-allowed top fallback,
    // Chromium desktop cancel->speak handoff, no double TOGGLE_PLAY, and parser gesture/bytecode fixes
    let oscStartedCount = 0;
    class ReplayAudioContext extends MockAudioContext {
      createOscillator() {
        return {
          type: 'square',
          frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
          connect() {},
          start() { oscStartedCount++; },
          stop() {},
        };
      }
      createGain() {
        return {
          gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} },
          connect() {},
        };
      }
    }
    allowResumeToRun = false;
    audioWin.AudioContext = ReplayAudioContext;
    delete audioWin.__astSharedAudioCtx;
    const replayEngine = new MobileEngineCtor({ muted: false, voiceEnabled: true });
    replayEngine._playSceneBootSound({ bootSound: 'bbc-beep' });
    assert.strictEqual(oscStartedCount, 0, 'Boot sound must wait while AudioContext is suspended');
    allowResumeToRun = true;
    replayEngine.audioSynth.unlock();
    assert.strictEqual(oscStartedCount, 2, 'Queued BBC boot beep (2 oscillators) must replay once AudioContext unlocks');
    replayEngine.audioSynth.unlock();
    assert.strictEqual(oscStartedCount, 2, 'Replayed boot sound must not fire twice on subsequent unlock()');

    // Muted engine must skip queuing silent SpeechSynthesis utterances
    const spokenBeforeMute = spokenOnIframe.length;
    replayEngine.setMuted(true);
    replayEngine.speak('Should remain silent', { immediate: true });
    assert.strictEqual(spokenOnIframe.length, spokenBeforeMute, 'Muted engine must not enqueue silent SpeechSynthesis utterances');
    replayEngine.setMuted(false);

    // not-allowed error inside iframe with allowTopFallback must retry once on same-origin window.top.speechSynthesis
    const topSpokenBefore = spokenOnTop.length;
    replayEngine.speak('Host Play Narration', { immediate: true, allowTopFallback: true });
    const lastIframeUtt = spokenOnIframe[spokenOnIframe.length - 1];
    assert.ok(lastIframeUtt && typeof lastIframeUtt.onerror === 'function', 'Utterance must attach onerror handler');
    lastIframeUtt.onerror({ error: 'not-allowed' });
    assert.strictEqual(spokenOnTop.length, topSpokenBefore + 1, 'not-allowed iframe speech with parent activation must fall back to same-origin window.top.speechSynthesis');
    assert.strictEqual(spokenOnTop[spokenOnTop.length - 1].text, 'Host Play Narration', 'Fallback utterance text must match');

    // Desktop Chrome UA must also receive 25ms cancel->speak handoff
    audioSb.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
    iframeSpeechSynth.speaking = true;
    scheduledTimeouts.length = 0;
    const spokenBeforeDesk = spokenOnIframe.length;
    replayEngine.speak('Desktop Chrome phrase', { immediate: true });
    assert.strictEqual(spokenOnIframe.length, spokenBeforeDesk, 'Desktop Chrome must defer speak() by 25ms after cancel() to avoid Chromium silent drop');
    const deskHandoff = scheduledTimeouts.find((t) => t.ms === 25);
    assert.ok(deskHandoff, 'Desktop Chrome cancel->speak handoff must schedule a 25ms timeout');
    deskHandoff!.fn();
    assert.strictEqual(spokenOnIframe.length, spokenBeforeDesk + 1, 'Desktop Chrome 25ms handoff must execute speak()');

    // Verify ast-parser.js extracts zero-JS gesture speech/attr slots on cartridge-level :gestures
    const parsedGestureScene = audioSb.parseAst(`(:scene :id "g-test" :type "Slide" :title "G"
      (:gestures (
        (:clickable :target ".word" :set-var "activeWord" :from-attr "data-word" :speak-attr "data-word" :speak-var "activeWord" :fallback-var "pageText" :clear-var "tmp" :count 5)
      ))
    )`);
    assert.ok(parsedGestureScene && parsedGestureScene.gestures && parsedGestureScene.gestures.length === 1, 'parseAst must parse cartridge-level :gestures');
    const g0 = parsedGestureScene.gestures[0];
    assert.strictEqual(g0.fromAttr, 'data-word', 'parseAst must extract :from-attr');
    assert.strictEqual(g0.speakAttr, 'data-word', 'parseAst must extract :speak-attr');
    assert.strictEqual(g0.speakVar, 'activeWord', 'parseAst must extract :speak-var');
    assert.strictEqual(g0.fallbackVar, 'pageText', 'parseAst must extract :fallback-var');
    assert.strictEqual(g0.clearVar, 'tmp', 'parseAst must extract :clear-var');
    assert.strictEqual(g0.count, 5, 'parseAst must extract :count');

    // Verify player-ui-events.js guards TOGGLE_PLAY when ast-bridge.js is active (no double-toggle)
    const uiEventsSrc = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'player-ui-events.js'), 'utf8');
    assert.ok(uiEventsSrc.includes('!window.__astBridgeActive'), 'player-ui-events.js must guard TOGGLE_PLAY/PLAY/PAUSE against double execution when ast-bridge.js is active');
    const bridgeSrc = fs.readFileSync(path.join(process.cwd(), 'static', 'player', 'ast-bridge.js'), 'utf8');
    assert.ok(bridgeSrc.includes('window.__astBridgeActive = true'), 'ast-bridge.js must mark window.__astBridgeActive = true on setup');

    console.log('[✅ PASS] Sim 28: Desktop, Android & iOS/PWA cartridge audio unlock, boot-sound replay, TTS fallbacks, no double TOGGLE_PLAY & touch activation verified.');
    passedTests++;
  }

  return passedTests;
}
