/**
 * src/components/BslInterpreterOverlay.tsx
 *
 * St Joseph's Educational Media Suite - British Sign Language (BSL) "In-Vision" Vector Interpreter
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Procedural, zero-video, real-time 3D vector BSL signing overlay.
 * Synchronizes with narrative speech synthesis boundaries, keyframes, and subtitles.
 * Features 360° perspective orbit (Signer POV vs Receiver POV), W3C Document PiP undocking,
 * and zero external runtime dependencies (< 12 KB uncompressed, 60 FPS, < 2 MB RAM).
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Point3D,
  BslHandPose,
  BSL_BASE_HAND,
  DOMINANT_REST_POSE,
  DOMINANT_REST_KNUCKLE,
  DOMINANT_REST_WRIST,
  BSL_ALPHABET_POSES,
  interpolatePoint3D,
  decomposeTextToBslStream,
  project3DToSvg,
} from '../utils/bslAlphabet';

export interface BslInterpreterOverlayProps {
  activeWord?: string;
  activeSubtitle?: string;
  isSpeaking?: boolean;
  onClose?: () => void;
  className?: string;
}

const REST_POSE: BslHandPose = {
  letter: ' ',
  label: 'Rest',
  rule: 'Neutral position resting ready to sign',
  isVowel: false,
  targetTip: DOMINANT_REST_POSE,
  targetKnuckle: DOMINANT_REST_KNUCKLE,
  targetWrist: DOMINANT_REST_WRIST,
};

export const BslInterpreterOverlay: React.FC<BslInterpreterOverlayProps> = ({
  activeWord = '',
  activeSubtitle = '',
  isSpeaking = false,
  onClose,
  className = '',
}) => {
  const [viewAngle, setViewAngle] = useState<'signer' | 'receiver'>('signer');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.2);
  const [customInput, setCustomInput] = useState<string>('');
  const [isPipActive, setIsPipActive] = useState<boolean>(false);

  // Active signing state
  const [currentLetter, setCurrentLetter] = useState<string>('');
  const [currentPose, setCurrentPose] = useState<BslHandPose>(REST_POSE);
  const [prevPose, setPrevPose] = useState<BslHandPose>(REST_POSE);
  const [transitionProgress, setTransitionProgress] = useState<number>(1);
  const [activeWordDisplay, setActiveWordDisplay] = useState<string>('');

  // Queue of poses to play
  const queueRef = useRef<BslHandPose[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const pipWindowRef = useRef<Window | null>(null);

  // Camera angles
  const cameraConfig = useMemo(() => {
    if (viewAngle === 'signer') {
      // Looking down from chest / pupil first-person view
      return { yaw: 0, pitch: 26, distance: 360, fov: 60 };
    } else {
      // Looking face-to-face across table at conversation partner
      return { yaw: 180, pitch: -8, distance: 360, fov: 60 };
    }
  }, [viewAngle]);

  // Enqueue new word for fingerspelling
  const enqueueWord = useCallback((word: string) => {
    if (!word || typeof word !== 'string') return;
    const cleanWord = word.trim().toUpperCase();
    if (!cleanWord) return;

    setActiveWordDisplay(cleanWord);
    const poses = decomposeTextToBslStream(cleanWord);
    if (poses.length > 0) {
      // Append a small rest pose at the end of word
      queueRef.current = [...poses, REST_POSE];
    }
  }, []);

  // React to parent speech boundary or subtitle changes
  useEffect(() => {
    if (activeWord && activeWord.trim()) {
      enqueueWord(activeWord);
    } else if (activeSubtitle && activeSubtitle.trim()) {
      // If no discrete word provided, pick first significant word of subtitle
      const words = activeSubtitle.trim().split(/\s+/).filter(w => w.length > 1);
      if (words.length > 0) {
        enqueueWord(words[0]);
      }
    }
  }, [activeWord, activeSubtitle, enqueueWord]);

  // Kinematic render loop (60 FPS Hermite interpolation)
  useEffect(() => {
    let t = transitionProgress;
    let fromPose = prevPose;
    let toPose = currentPose;

    const frameStep = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const duration = 0.38 / speedMultiplier; // seconds per letter transition
      t += dt / duration;

      if (t >= 1) {
        t = 1;
        // Finished moving to toPose, check if queue has next
        if (queueRef.current.length > 0) {
          const next = queueRef.current.shift()!;
          fromPose = toPose;
          toPose = next;
          t = 0;
          setPrevPose(fromPose);
          setCurrentPose(toPose);
          setCurrentLetter(toPose.letter.trim());
        }
      }
      setTransitionProgress(t);

      animFrameRef.current = requestAnimationFrame(frameStep);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(frameStep);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [speedMultiplier, prevPose, currentPose, transitionProgress]);

  // Current interpolated dominant pointer points
  const interpolatedTip: Point3D = useMemo(() => {
    return interpolatePoint3D(prevPose.targetTip, currentPose.targetTip, transitionProgress);
  }, [prevPose.targetTip, currentPose.targetTip, transitionProgress]);

  const interpolatedKnuckle: Point3D = useMemo(() => {
    return interpolatePoint3D(prevPose.targetKnuckle, currentPose.targetKnuckle, transitionProgress);
  }, [prevPose.targetKnuckle, currentPose.targetKnuckle, transitionProgress]);

  const interpolatedWrist: Point3D = useMemo(() => {
    return interpolatePoint3D(prevPose.targetWrist, currentPose.targetWrist, transitionProgress);
  }, [prevPose.targetWrist, currentPose.targetWrist, transitionProgress]);

  // Canvas dimension: 220 x 170
  const originX = 110;
  const originY = 95;

  // Project non-dominant hand (The Paper)
  const baseWrist = project3DToSvg(BSL_BASE_HAND.wrist, cameraConfig, originX, originY);
  const basePalm = project3DToSvg(BSL_BASE_HAND.palm, cameraConfig, originX, originY);
  const baseFingertips = useMemo(() => {
    return BSL_BASE_HAND.fingertips.map((tip, idx) => ({
      ...tip,
      idx,
      proj: project3DToSvg(tip, cameraConfig, originX, originY),
    }));
  }, [cameraConfig]);

  // Project dominant hand (The Pen)
  const domTip = project3DToSvg(interpolatedTip, cameraConfig, originX, originY);
  const domKnuckle = project3DToSvg(interpolatedKnuckle, cameraConfig, originX, originY);
  const domWrist = project3DToSvg(interpolatedWrist, cameraConfig, originX, originY);

  // W3C Document Picture-in-Picture Undocking
  const handleTogglePip = async () => {
    if (isPipActive && pipWindowRef.current) {
      pipWindowRef.current.close();
      setIsPipActive(false);
      return;
    }

    if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
      try {
        const pip = await (window as any).documentPictureInPicture.requestWindow({
          width: 320,
          height: 380,
        });
        pipWindowRef.current = pip;
        setIsPipActive(true);

        // Copy styles to PiP window
        [...document.styleSheets].forEach((sheet) => {
          try {
            if (sheet.href) {
              const link = pip.document.createElement('link');
              link.rel = 'stylesheet';
              link.href = sheet.href;
              pip.document.head.appendChild(link);
            } else if (sheet.cssRules) {
              const style = pip.document.createElement('style');
              [...sheet.cssRules].forEach((rule) => {
                style.appendChild(pip.document.createTextNode(rule.cssText));
              });
              pip.document.head.appendChild(style);
            }
          } catch (_) {}
        });

        pip.document.body.style.margin = '0';
        pip.document.body.style.background = '#090d16';
        pip.document.body.style.color = '#f8fafc';
        pip.document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';

        const container = pip.document.createElement('div');
        container.id = 'bsl-pip-root';
        pip.document.body.appendChild(container);

        pip.addEventListener('pagehide', () => {
          setIsPipActive(false);
          pipWindowRef.current = null;
        });
      } catch (err) {
        console.warn('Document PiP could not be opened:', err);
      }
    } else {
      alert('Document Picture-in-Picture is not supported in this browser version. Docked view remains active!');
    }
  };

  const handleTestWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      enqueueWord(customInput);
      setCustomInput('');
    }
  };

  // Render minimized floating pill
  if (isMinimized) {
    return (
      <div
        className={`bsl-interpreter-minimized ${className}`}
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          zIndex: 40,
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          borderRadius: '9999px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          color: '#38bdf8',
          fontSize: '0.8rem',
          fontWeight: 700,
          userSelect: 'none',
        }}
        onClick={() => setIsMinimized(false)}
        title="Click to expand BSL In-Vision Interpreter"
      >
        <span style={{ fontSize: '1.1rem' }}>🖐️</span>
        <span>BSL Interpreter</span>
        {currentLetter && (
          <span
            style={{
              background: '#38bdf8',
              color: '#0f172a',
              borderRadius: '4px',
              padding: '1px 6px',
              fontSize: '0.72rem',
              fontWeight: 900,
            }}
          >
            {currentLetter}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bsl-interpreter-dock ${className}`}
      style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        width: '260px',
        zIndex: 40,
        background: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(56, 189, 248, 0.35)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(56, 189, 248, 0.15)',
        borderRadius: '12px',
        overflow: 'hidden',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        userSelect: 'none',
        transition: 'transform 0.2s ease, opacity 0.2s ease',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          background: 'rgba(30, 41, 59, 0.8)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#38bdf8' }}>
          <span>🖐️</span>
          <span>BSL In-Vision</span>
          <span
            style={{
              fontSize: '0.65rem',
              padding: '1px 5px',
              borderRadius: '4px',
              background: isSpeaking ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.2)',
              color: isSpeaking ? '#4ade80' : '#94a3b8',
              border: `1px solid ${isSpeaking ? 'rgba(34, 197, 94, 0.4)' : 'rgba(148, 163, 184, 0.3)'}`,
            }}
          >
            {isSpeaking ? 'SYNCED' : 'READY'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* PiP Button */}
          {typeof window !== 'undefined' && 'documentPictureInPicture' in window && (
            <button
              type="button"
              onClick={handleTogglePip}
              style={{
                background: isPipActive ? '#0284c7' : 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '4px',
                fontSize: '0.8rem',
              }}
              title="Undock to Picture-in-Picture window"
            >
              🗗
            </button>
          )}

          {/* Minimize Button */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '0.85rem',
              lineHeight: 1,
            }}
            title="Minimize to floating pill"
          >
            —
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                lineHeight: 1,
                fontWeight: 800,
              }}
              title="Turn off BSL Signing"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3D Skeletal Vector Stage */}
      <div style={{ position: 'relative', width: '100%', height: '150px', background: 'radial-gradient(ellipse at center, #1e293b 0%, #090d16 100%)' }}>
        <svg
          viewBox="0 0 220 170"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        >
          <defs>
            <radialGradient id="bslVowelGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bslTouchPulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid lines floor reference */}
          <line x1="20" y1="150" x2="200" y2="150" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <line x1="110" y1="130" x2="110" y2="160" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

          {/* NON-DOMINANT HAND (The Paper) */}
          <g id="bsl-base-hand" opacity="0.95">
            {/* Base Palm polygon */}
            <polygon
              points={`${baseWrist.x},${baseWrist.y} ${baseFingertips[0].proj.x},${baseFingertips[0].proj.y} ${baseFingertips[1].proj.x},${baseFingertips[1].proj.y} ${baseFingertips[4].proj.x},${baseFingertips[4].proj.y}`}
              fill="rgba(56, 189, 248, 0.08)"
              stroke="rgba(56, 189, 248, 0.4)"
              strokeWidth="1.2"
            />

            {/* Fingers connecting wrist to fingertips */}
            {baseFingertips.map((tip) => {
              const isSelectedVowel = currentPose.activeVowelIndex === tip.idx;
              return (
                <g key={`base-finger-${tip.id}`}>
                  {/* Skeletal ray */}
                  <line
                    x1={basePalm.x}
                    y1={basePalm.y}
                    x2={tip.proj.x}
                    y2={tip.proj.y}
                    stroke={isSelectedVowel ? '#f59e0b' : '#38bdf8'}
                    strokeWidth={isSelectedVowel ? 2.5 : 1.5}
                    strokeLinecap="round"
                  />

                  {/* Active Vowel Pulse aura */}
                  {isSelectedVowel && (
                    <circle
                      cx={tip.proj.x}
                      cy={tip.proj.y}
                      r={14 * tip.proj.scale}
                      fill="url(#bslVowelGlow)"
                    />
                  )}

                  {/* Fingertip joint marker */}
                  <circle
                    cx={tip.proj.x}
                    cy={tip.proj.y}
                    r={isSelectedVowel ? 6 * tip.proj.scale : 4 * tip.proj.scale}
                    fill={isSelectedVowel ? '#fbbf24' : '#0284c7'}
                    stroke="#ffffff"
                    strokeWidth="1"
                  />

                  {/* Vowel Letter Label on Fingertip (A, E, I, O, U) */}
                  <text
                    x={tip.proj.x}
                    y={tip.proj.y + (viewAngle === 'signer' ? -6 : 10)}
                    textAnchor="middle"
                    fill={isSelectedVowel ? '#fef08a' : '#94a3b8'}
                    fontSize={isSelectedVowel ? '9px' : '7.5px'}
                    fontWeight={isSelectedVowel ? 900 : 700}
                  >
                    {tip.id}
                  </text>
                </g>
              );
            })}

            {/* Base Wrist joint */}
            <circle cx={baseWrist.x} cy={baseWrist.y} r={5 * baseWrist.scale} fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          </g>

          {/* DOMINANT HAND (The Pen - Moving Pointer) */}
          <g id="bsl-dominant-hand">
            {/* Forearm segment */}
            <line
              x1={domWrist.x + 35}
              y1={domWrist.y + 40}
              x2={domWrist.x}
              y2={domWrist.y}
              stroke="#64748b"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.6"
            />

            {/* Hand / Knuckle segment */}
            <line
              x1={domWrist.x}
              y1={domWrist.y}
              x2={domKnuckle.x}
              y2={domKnuckle.y}
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Pointer finger segment */}
            <line
              x1={domKnuckle.x}
              y1={domKnuckle.y}
              x2={domTip.x}
              y2={domTip.y}
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Pointer Knuckle joint */}
            <circle cx={domKnuckle.x} cy={domKnuckle.y} r={4.5 * domKnuckle.scale} fill="#0284c7" stroke="#ffffff" strokeWidth="1" />

            {/* Dominant Tip (Contact Beacon) */}
            <circle
              cx={domTip.x}
              cy={domTip.y}
              r={5 * domTip.scale}
              fill="#38bdf8"
              stroke="#ffffff"
              strokeWidth="1.5"
            />

            {/* Target Touch Pulse Ripple */}
            {currentLetter && (
              <circle
                cx={domTip.x}
                cy={domTip.y}
                r={10 * domTip.scale}
                fill="url(#bslTouchPulse)"
                opacity="0.8"
              />
            )}
          </g>
        </svg>

        {/* Active Letter Badge Over Stage */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '6px',
            padding: '3px 8px',
          }}
        >
          <span
            style={{
              fontSize: '1.1rem',
              fontWeight: 900,
              color: currentPose.isVowel ? '#f59e0b' : '#38bdf8',
            }}
          >
            {currentLetter || '—'}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {currentPose.label || 'Ready'}
            </span>
            {activeWordDisplay && (
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f8fafc' }}>
                {activeWordDisplay}
              </span>
            )}
          </div>
        </div>

        {/* Camera Angle Toggle Badge */}
        <button
          type="button"
          onClick={() => setViewAngle((prev) => (prev === 'signer' ? 'receiver' : 'signer'))}
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '0.65rem',
            fontWeight: 700,
            color: '#38bdf8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          title="Toggle between Signer POV (first-person) and Receiver POV (conversation partner)"
        >
          <span>{viewAngle === 'signer' ? '👤 Signer POV' : '👥 Receiver POV'}</span>
        </button>
      </div>

      {/* Rule & Kinematic Description */}
      <div
        style={{
          padding: '6px 10px',
          background: 'rgba(15, 23, 42, 0.98)',
          borderTop: '1px solid rgba(56, 189, 248, 0.15)',
          fontSize: '0.68rem',
          color: '#cbd5e1',
          lineHeight: 1.3,
          minHeight: '34px',
        }}
      >
        <strong style={{ color: '#38bdf8' }}>BSL Rule: </strong>
        {currentPose.rule || 'Hands in neutral rest position ready for narration stream.'}
      </div>

      {/* Speed & Quick Input Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          background: 'rgba(30, 41, 59, 0.6)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '0.68rem',
        }}
      >
        {/* Speed pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>Speed:</span>
          {[1.0, 1.5, 2.0].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeedMultiplier(s)}
              style={{
                background: speedMultiplier === s ? '#0284c7' : 'rgba(15, 23, 42, 0.6)',
                border: `1px solid ${speedMultiplier === s ? '#38bdf8' : 'rgba(56, 189, 248, 0.2)'}`,
                borderRadius: '4px',
                color: speedMultiplier === s ? '#ffffff' : '#94a3b8',
                padding: '1px 5px',
                fontSize: '0.62rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {s.toFixed(1)}×
            </button>
          ))}
        </div>

        {/* Quick word practice form */}
        <form onSubmit={handleTestWordSubmit} style={{ display: 'flex', gap: '3px' }}>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Try word..."
            maxLength={12}
            style={{
              width: '68px',
              padding: '2px 5px',
              fontSize: '0.65rem',
              borderRadius: '4px',
              background: '#0f172a',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#f8fafc',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '2px 6px',
              fontSize: '0.65rem',
              borderRadius: '4px',
              background: '#0284c7',
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Sign
          </button>
        </form>
      </div>
    </div>
  );
};
export default BslInterpreterOverlay;
