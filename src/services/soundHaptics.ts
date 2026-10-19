// src/services/soundHaptics.ts
/**
 * Zero-Data Educational Sound & Tactile Haptic Engine
 * 
 * Generates harmonic audio feedback using the browser's native Web Audio API
 * (sine and triangle wave oscillators) and tactile haptic impulses via navigator.vibrate.
 * 
 * - ZERO external sound files or network data.
 * - 100% offline & instant.
 * - Non-jarring, pedagogical sound design (uplifting success, gentle formative tone).
 * - Full mute & privacy controls for quiet classrooms.
 */

const SOUND_KEY = 'stj_sound_enabled';
const HAPTICS_KEY = 'stj_haptics_enabled';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const val = localStorage.getItem(SOUND_KEY);
  return val === null ? true : val === 'true';
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_KEY, String(enabled));
  window.dispatchEvent(new CustomEvent('stj_sound_haptics_updated'));
}

export function isHapticsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const val = localStorage.getItem(HAPTICS_KEY);
  return val === null ? true : val === 'true';
}

export function setHapticsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HAPTICS_KEY, String(enabled));
  window.dispatchEvent(new CustomEvent('stj_sound_haptics_updated'));
}

/**
 * Plays a soft, uplifting harmonic chime for correct answers / milestones.
 * Major triad: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
 */
export function playSuccessChime(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      // Envelope: gentle attack, pleasant ring, smooth exponential fade
      const startTime = now + idx * 0.08;
      const duration = 0.28;
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (err) {
    console.warn('[Sound Engine] Chime play error:', err);
  }
}

/**
 * Plays a warm, gentle formative tone for incorrect answers.
 * Low, encouraging minor/fourth transition (A3 220Hz -> F3 174Hz).
 * Purposefully designed to be gentle, friendly, and non-punitive.
 */
export function playIncorrectTone(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.exponentialRampToValueAtTime(174.61, now + 0.16); // F3

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.24);
  } catch (err) {
    console.warn('[Sound Engine] Tone play error:', err);
  }
}

/**
 * Subtle 10ms micro-click for interactive tactile button presses.
 */
export function playClickTone(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.015);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.015);
  } catch (err) {}
}

/**
 * Celebratory 4-note ascending fanfare when a student completes a unit/lab.
 */
export function playCelebrationFanfare(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
      const startTime = now + idx * 0.1;
      const duration = idx === notes.length - 1 ? 0.45 : 0.25;

      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.14, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (err) {}
}

/**
 * Haptic feedback trigger for physical touch devices (phones and tablets).
 */
export function triggerHapticSuccess(): void {
  if (!isHapticsEnabled() || typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate([18, 30, 22]);
  } catch {}
}

export function triggerHapticError(): void {
  if (!isHapticsEnabled() || typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate([25, 45, 25]);
  } catch {}
}

export function triggerHapticClick(): void {
  if (!isHapticsEnabled() || typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate(8);
  } catch {}
}

/**
 * Procedural chant synthesis for the three elevations of "Lumen Christi" -> "Deo gratias"
 * Elevation 1 (Entrance): Lower pitch (F4 / G4 / A4)
 * Elevation 2 (Nave): Mid pitch (G4 / A4 / B4)
 * Elevation 3 (Sanctuary): High triumphant pitch (A4 / B4 / C#5)
 * 0 KB download, pure Web Audio mathematical synthesis.
 */
export function playLumenChristiChant(elevation: 1 | 2 | 3 = 1): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const baseFreqs = {
      1: [349.23, 392.00, 440.00], // F4, G4, A4
      2: [392.00, 440.00, 493.88], // G4, A4, B4
      3: [440.00, 493.88, 554.37], // A4, B4, C#5
    }[elevation];

    const now = ctx.currentTime;

    // Deacon chant: "Lu - men - Chri-sti"
    baseFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const startTime = now + idx * 0.32;
      const duration = idx === 2 ? 0.75 : 0.32;

      osc.frequency.setValueAtTime(freq, startTime);

      // Warm chant vocal envelope
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.14, startTime + 0.06);
      gain.gain.setValueAtTime(0.12, startTime + duration - 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });

    // Assembly response after pause: "De - o   gra - ti - as" (harmonic chord)
    const responseStart = now + 1.25;
    const responseNotes = [
      [baseFreqs[1], baseFreqs[2]], // De-
      [baseFreqs[0], baseFreqs[1]], // o
      [baseFreqs[0], baseFreqs[2]], // gra-
      [baseFreqs[0] * 0.75, baseFreqs[0], baseFreqs[2]], // ti-as (full warm resolution)
    ];

    responseNotes.forEach((chord, step) => {
      const stepStart = responseStart + step * 0.35;
      const stepDuration = step === 3 ? 0.95 : 0.35;

      chord.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';

        osc.frequency.setValueAtTime(note, stepStart);
        gain.gain.setValueAtTime(0.001, stepStart);
        gain.gain.exponentialRampToValueAtTime(0.07, stepStart + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, stepStart + stepDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(stepStart);
        osc.stop(stepStart + stepDuration);
      });
    });
  } catch (err) {
    console.warn('[Sound Engine] Lumen Christi chant error:', err);
  }
}

/**
 * Procedural synthesis of glorious Easter carillon / campanile bells.
 * Simulates real bronze church bells with non-harmonic overtones and rich decays.
 */
export function playEasterBells(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const bellPitches = [659.25, 830.61, 987.77, 1108.73, 1318.51]; // E5, G#5, B5, C#6, E6
    const now = ctx.currentTime;

    // Change ringing pattern: 6 cascading strikes
    const strikeDelays = [0.0, 0.18, 0.36, 0.54, 0.74, 0.96, 1.2];
    strikeDelays.forEach((delay, i) => {
      const pitch = bellPitches[i % bellPitches.length];
      const strikeTime = now + delay;
      const duration = 1.4;

      // Strike note + strike overtone
      [pitch, pitch * 2.01, pitch * 2.76].forEach((f, overtoneIdx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = overtoneIdx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, strikeTime);

        const amp = overtoneIdx === 0 ? 0.12 : 0.05;
        gain.gain.setValueAtTime(0.001, strikeTime);
        gain.gain.exponentialRampToValueAtTime(amp, strikeTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(strikeTime);
        osc.stop(strikeTime + duration);
      });
    });
  } catch (err) {
    console.warn('[Sound Engine] Easter bells error:', err);
  }
}

/**
 * Procedural wooden clapper (crotalus / strepitu) sound used when bells are silenced during Triduum.
 */
export function playCrotalusClapper(): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // 3 rapid dry wooden knocks
    [0.0, 0.09, 0.18].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(240, now + offset);
      osc.frequency.exponentialRampToValueAtTime(80, now + offset + 0.025);

      gain.gain.setValueAtTime(0.001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.18, now + offset + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.035);
    });
  } catch (err) {}
}

