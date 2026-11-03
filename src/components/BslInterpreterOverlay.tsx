/**
 * src/components/BslInterpreterOverlay.tsx
 * St Joseph's Educational Media Suite - BSL "In-Vision" Vector Interpreter
 * Copyright (c) 2026 Joseph Brewerton. SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  BslHandPose,
  DOMINANT_REST_POSE,
  DOMINANT_REST_KNUCKLE,
  DOMINANT_REST_WRIST,
  interpolatePoint3D,
  evaluateBslEase,
} from '../utils/bslAlphabet';
import {
  BSL_CURRICULUM_LEXICON,
  registerBslSigns,
  getMakatonSigns,
} from '../utils/bslLexicon';
import { parseAstToLexicon } from '../utils/bslAstCodec';
import {
  analyzeAndTransformBslGrammar,
  BslGrammarMode,
  BslGrammarAnalysis,
} from '../utils/bslGrammarEngine';
import {
  subscribeBslSpeech,
  openBslSignStudio,
  subscribeLanguageTuple,
  setSignLanguage,
  getLanguageTuple,
} from '../services/bslGlobalStore';
import { subscribeCustomSigns, initCustomSignsIntoLexicon } from '../services/customSignStore';
import { computeBslFrame, BslSolvedFrame } from '../utils/bslKinematicsEngine';
import '../utils/ast3dWasmBridge';

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
  onClose,
  className = '',
}) => {
  const [viewAngle, setViewAngle] = useState<'signer' | 'receiver'>('receiver');
  const [cameraMode, setCameraMode] = useState<'split' | 'body' | 'face'>('split');
  const [windowOpacity, setWindowOpacity] = useState<number>(1.0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.2);
  const [grammarMode, setGrammarMode] = useState<BslGrammarMode>('bsl-natural');
  const [selectedMakatonStage, setSelectedMakatonStage] = useState<'all' | number>('all');
  const [showGrammarInspector, setShowGrammarInspector] = useState<boolean>(false);
  const [grammarAnalysis, setGrammarAnalysis] = useState<BslGrammarAnalysis | null>(null);
  const [customInput, setCustomInput] = useState<string>('');
  const [isPipActive, setIsPipActive] = useState<boolean>(false);
  const [showPanControls, setShowPanControls] = useState<boolean>(false);
  const [showFacialFeatures, setShowFacialFeatures] = useState<boolean>(true);
  const [avatarSkinMode, setAvatarSkinMode] = useState<'human' | 'skeleton'>(() => {
    try {
      return (localStorage.getItem('stj_bsl_skin_mode') as 'human' | 'skeleton') || 'human';
    } catch (_) {
      return 'human';
    }
  });
  const [importNotice, setImportNotice] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [availableSigns, setAvailableSigns] = useState(() =>
    Object.values(BSL_CURRICULUM_LEXICON).map((s) => ({ label: s.englishLabel || s.word, word: s.word }))
  );

  const displaySigns = useMemo(() => {
    if (selectedMakatonStage === 'all') return availableSigns;
    const stageSigns = new Set(getMakatonSigns(selectedMakatonStage).map((s) => s.word));
    return availableSigns.filter((s) => stageSigns.has(s.word));
  }, [availableSigns, selectedMakatonStage]);

  useEffect(() => {
    const refresh = () => setAvailableSigns(Object.values(BSL_CURRICULUM_LEXICON).map((s) => ({ label: s.englishLabel || s.word, word: s.word })));
    initCustomSignsIntoLexicon().then(refresh);
    return subscribeCustomSigns(refresh);
  }, []);

  useEffect(() => {
    const [, currentSign] = getLanguageTuple();
    if (currentSign === 'MAKATON') setGrammarMode('makaton');
    return subscribeLanguageTuple(([, sgn]) => {
      if (sgn === 'MAKATON') setGrammarMode('makaton');
      else if (sgn === 'BSL') setGrammarMode('bsl-natural');
    });
  }, []);

  const [currentLetter, setCurrentLetter] = useState<string>('');
  const [currentPose, setCurrentPose] = useState<BslHandPose>(REST_POSE);
  const [prevPose, setPrevPose] = useState<BslHandPose>(REST_POSE);
  const [transitionProgress, setTransitionProgress] = useState<number>(1);
  const [activeWordDisplay, setActiveWordDisplay] = useState<string>('');

  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  useEffect(() => {
    let tId: any;
    let bId: any;
    const loop = () => {
      tId = setTimeout(() => {
        setIsBlinking(true);
        bId = setTimeout(() => {
          setIsBlinking(false);
          loop();
        }, 130);
      }, 3400 + Math.random() * 2200);
    };
    loop();
    return () => { clearTimeout(tId); clearTimeout(bId); };
  }, []);

  const queueRef = useRef<BslHandPose[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const pipWindowRef = useRef<Window | null>(null);
  const windowRef = useRef<HTMLDivElement | null>(null);

  const [windowPos, setWindowPos] = useState<{ x: number; y: number } | null>(() => {
    try {
      const saved = localStorage.getItem('stj_bsl_window_pos');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  const isDraggingWindowRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });
  const [orbitOffset, setOrbitOffset] = useState({ yaw: 0, pitch: 0, distanceDelta: 0, panX: 0, panY: 0 });
  const is3DDraggingRef = useRef(false);
  const drag3DStartRef = useRef({ x: 0, y: 0, startYaw: 0, startPitch: 0 });

  const cameraConfig = useMemo(() => {
    const baseYaw = viewAngle === 'signer' ? 0 : 180;
    const basePitch = cameraMode === 'face' ? 0 : viewAngle === 'signer' ? 18 : -4;
    const baseDistance = cameraMode === 'face' ? 210 : 330;
    return {
      yaw: baseYaw + orbitOffset.yaw,
      pitch: Math.max(-85, Math.min(85, basePitch + orbitOffset.pitch)),
      distance: Math.max(120, baseDistance + orbitOffset.distanceDelta),
      fov: cameraMode === 'face' ? 55 : 60,
    };
  }, [viewAngle, orbitOffset, cameraMode]);

  const enqueueText = useCallback((text: string, overrideMode?: BslGrammarMode) => {
    const clean = text?.trim();
    if (!clean) return;
    setActiveWordDisplay(clean.toUpperCase());
    const analysis = analyzeAndTransformBslGrammar(clean, { mode: overrideMode || grammarMode });
    setGrammarAnalysis(analysis);
    if (analysis.stream.length > 0) {
      queueRef.current = [...analysis.stream, REST_POSE];
    }
  }, [grammarMode]);

  useEffect(() => {
    if (activeSubtitle?.trim()) enqueueText(activeSubtitle);
    else if (activeWord?.trim()) enqueueText(activeWord);
  }, [activeWord, activeSubtitle, enqueueText]);

  useEffect(() => {
    return subscribeBslSpeech((payload) => {
      if (payload.subtitle?.trim()) enqueueText(payload.subtitle);
      else if (payload.word?.trim()) enqueueText(payload.word);
    });
  }, [enqueueText]);

  // 60 FPS Hermite interpolation ticker
  useEffect(() => {
    let t = 1;
    let fromPose = REST_POSE;
    let toPose = REST_POSE;
    let holdRemainingSec = 0;

    const frameStep = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (holdRemainingSec > 0) {
        holdRemainingSec -= dt;
        animFrameRef.current = requestAnimationFrame(frameStep);
        return;
      }

      t += dt / (0.36 / speedMultiplier);
      if (t >= 1) {
        t = 1;
        if (queueRef.current.length > 0) {
          fromPose = toPose;
          toPose = queueRef.current.shift()!;
          t = 0;
          if (toPose.hold) holdRemainingSec = (toPose.hold / 1000) / speedMultiplier;
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
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [speedMultiplier]);

  const easedProgress = useMemo(() => evaluateBslEase(currentPose.ease, transitionProgress), [currentPose.ease, transitionProgress]);
  const interpolatedTip = useMemo(() => interpolatePoint3D(prevPose.targetTip, currentPose.targetTip, easedProgress), [prevPose.targetTip, currentPose.targetTip, easedProgress]);
  const interpolatedKnuckle = useMemo(() => interpolatePoint3D(prevPose.targetKnuckle, currentPose.targetKnuckle, easedProgress), [prevPose.targetKnuckle, currentPose.targetKnuckle, easedProgress]);
  const interpolatedWrist = useMemo(() => interpolatePoint3D(prevPose.targetWrist, currentPose.targetWrist, easedProgress), [prevPose.targetWrist, currentPose.targetWrist, easedProgress]);

  // Compute clean solved frame via extracted pure math engine
  const frame: BslSolvedFrame = useMemo(() => {
    return computeBslFrame(
      currentPose,
      prevPose,
      interpolatedWrist,
      interpolatedKnuckle,
      interpolatedTip,
      transitionProgress,
      cameraConfig,
      orbitOffset.panX,
      orbitOffset.panY,
      cameraMode
    );
  }, [currentPose, prevPose, interpolatedWrist, interpolatedKnuckle, interpolatedTip, transitionProgress, cameraConfig, orbitOffset.panX, orbitOffset.panY, cameraMode]);

  // Window drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input, form, select')) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingWindowRef.current = true;
    const rect = windowRef.current?.getBoundingClientRect();
    dragStartRef.current = { mouseX: e.clientX, mouseY: e.clientY, startX: rect?.left || 100, startY: rect?.top || 100 };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingWindowRef.current) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    const next = {
      x: Math.max(8, Math.min(window.innerWidth - 278, dragStartRef.current.startX + dx)),
      y: Math.max(8, Math.min(window.innerHeight - 268, dragStartRef.current.startY + dy)),
    };
    setWindowPos(next);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingWindowRef.current) {
      isDraggingWindowRef.current = false;
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch (_) {}
      if (windowPos) localStorage.setItem('stj_bsl_window_pos', JSON.stringify(windowPos));
    }
  };

  if (isMinimized) {
    const pill = (
      <div
        className={`bsl-interpreter-minimized ${className}`}
        style={{
          position: 'fixed',
          bottom: windowPos ? undefined : '16px',
          right: windowPos ? undefined : '16px',
          left: windowPos ? `${windowPos.x}px` : undefined,
          top: windowPos ? `${windowPos.y}px` : undefined,
          zIndex: 9995,
          background: 'rgba(15, 23, 42, 0.94)',
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '9999px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          color: '#38bdf8',
          fontWeight: 700,
        }}
        onClick={() => setIsMinimized(false)}
      >
        <span>🖐️ BSL</span>
        {currentLetter && <span style={{ background: '#38bdf8', color: '#0f172a', borderRadius: '4px', padding: '1px 6px' }}>{currentLetter}</span>}
      </div>
    );
    return typeof document !== 'undefined' && document.body ? createPortal(pill, document.body) : pill;
  }

  const content = (
    <div
      ref={windowRef}
      className={`bsl-interpreter-dock ${className}`}
      style={{
        position: 'fixed',
        bottom: windowPos ? undefined : '16px',
        right: windowPos ? undefined : '16px',
        left: windowPos ? `${windowPos.x}px` : undefined,
        top: windowPos ? `${windowPos.y}px` : undefined,
        width: '270px',
        zIndex: 9995,
        opacity: windowOpacity,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(14px)',
        border: '1.5px solid rgba(56, 189, 248, 0.4)',
        boxShadow: '0 14px 36px rgba(0, 0, 0, 0.65)',
        borderRadius: '12px',
        overflow: 'hidden',
        color: '#f8fafc',
        userSelect: 'none',
      }}
    >
      {/* Header Bar */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 10px',
          background: 'rgba(30, 41, 59, 0.9)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
          cursor: 'grab',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#38bdf8' }}>
          <span>⠿ 🖐️ BSL In-Vision</span>
        </div>
        <div style={{ display: 'flex', gap: '3px' }}>
          <button type="button" onClick={() => setShowPanControls((p) => !p)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>🌐</button>
          <button type="button" onClick={() => openBslSignStudio(activeWordDisplay || undefined)} style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#6ee7b7', borderRadius: '4px', fontSize: '0.66rem' }}>Studio</button>
          <button type="button" onClick={() => setShowGrammarInspector((p) => !p)} style={{ background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '4px', fontSize: '0.66rem' }}>Syntax</button>
          <button type="button" onClick={() => setIsMinimized(true)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>—</button>
          {onClose && <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>}
        </div>
      </div>

      {/* Status Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 10px', background: '#090d16', fontSize: '0.68rem', borderBottom: '1px solid rgba(56, 189, 248, 0.2)' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontWeight: 900, color: currentPose.isWholeWordSign ? '#fbbf24' : '#38bdf8' }}>
            {currentLetter || '—'}
          </span>
          <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>
            {currentPose.isWholeWordSign ? 'Concept Sign' : 'Fingerspelling'}
          </span>
        </div>
        <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>
          {currentPose.nmf?.mouth ? `👄 "${currentPose.nmf.mouth}"` : 'Neutral'}
        </span>
      </div>

      {/* Pure Vector SVG Canvas */}
      <div style={{ position: 'relative', width: '100%', height: '165px', background: 'radial-gradient(ellipse at center, #1e293b 0%, #090d16 100%)' }}>
        <svg viewBox="0 0 240 180" style={{ width: '100%', height: '100%', display: 'block' }}>
          <defs>
            <radialGradient id="bslTouchPulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bslHumanSkin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef0e6" />
              <stop offset="100%" stopColor="#d5997a" />
            </linearGradient>
            <linearGradient id="bslInterpreterTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#243044" />
              <stop offset="100%" stopColor="#0b111c" />
            </linearGradient>
          </defs>

          {/* Torso & Head */}
          <g id="avatar-torso">
            <path
              d={`M ${frame.shoulderViewerLeft.x} 180 L ${frame.shoulderViewerLeft.x} ${frame.shoulderViewerLeft.y} Q ${frame.torsoChest.x} ${frame.torsoChest.y} ${frame.shoulderViewerRight.x} ${frame.shoulderViewerRight.y} L ${frame.shoulderViewerRight.x} 180 Z`}
              fill="url(#bslInterpreterTop)"
              stroke="#334155"
              strokeWidth="1.2"
            />
            <ellipse
              cx={frame.torsoHead.x}
              cy={frame.torsoHead.y}
              rx={19 * frame.torsoHead.scale}
              ry={25 * frame.torsoHead.scale}
              fill="url(#bslHumanSkin)"
              stroke="#d49f82"
              strokeWidth="1.2"
            />
            {showFacialFeatures && (
              <g id="avatar-face">
                <line x1={frame.face.leftBrowOut.x} y1={frame.face.leftBrowOut.y} x2={frame.face.leftBrowIn.x} y2={frame.face.leftBrowIn.y} stroke="#273449" strokeWidth="2.5" strokeLinecap="round" />
                <line x1={frame.face.rightBrowIn.x} y1={frame.face.rightBrowIn.y} x2={frame.face.rightBrowOut.x} y2={frame.face.rightBrowOut.y} stroke="#273449" strokeWidth="2.5" strokeLinecap="round" />
                {isBlinking ? (
                  <path d={`M ${frame.face.leftEye.x - 4} ${frame.face.leftEye.y} Q ${frame.face.leftEye.x} ${frame.face.leftEye.y + 2} ${frame.face.leftEye.x + 4} ${frame.face.leftEye.y}`} fill="none" stroke="#334155" strokeWidth="1.8" />
                ) : (
                  <circle cx={frame.face.leftEye.x} cy={frame.face.leftEye.y} r="1.8" fill="#090d16" />
                )}
                {isBlinking ? (
                  <path d={`M ${frame.face.rightEye.x - 4} ${frame.face.rightEye.y} Q ${frame.face.rightEye.x} ${frame.face.rightEye.y + 2} ${frame.face.rightEye.x + 4} ${frame.face.rightEye.y}`} fill="none" stroke="#334155" strokeWidth="1.8" />
                ) : (
                  <circle cx={frame.face.rightEye.x} cy={frame.face.rightEye.y} r="1.8" fill="#090d16" />
                )}
                <line x1={frame.face.noseBridge.x} y1={frame.face.noseBridge.y} x2={frame.face.noseTip.x} y2={frame.face.noseTip.y} stroke="#c48e6c" strokeWidth="1.2" strokeLinecap="round" />
                <path d={`M ${frame.face.mouthLeft.x} ${frame.face.mouthLeft.y} Q ${frame.face.mouthCenter.x} ${frame.face.mouthCenter.y + frame.face.mouthH} ${frame.face.mouthRight.x} ${frame.face.mouthRight.y}`} fill="#3d0a12" stroke="#be5d69" strokeWidth="1.4" />
              </g>
            )}
          </g>

{/* Base Hand (Left) */}
          <g id="avatar-base-hand" opacity={frame.baseHandMode === 'rest' ? 0.65 : 0.98}>
            <line x1={frame.baseHand.forearm.x} y1={frame.baseHand.forearm.y} x2={frame.baseHand.wrist.x} y2={frame.baseHand.wrist.y} stroke="url(#bslHumanSkin)" strokeWidth="6.5" strokeLinecap="round" />
            <ellipse
              cx={frame.baseHand.palm.x}
              cy={frame.baseHand.palm.y}
              rx={6.5 * frame.baseHand.palm.scale}
              ry={7.5 * frame.baseHand.palm.scale}
              fill="url(#bslHumanSkin)"
              stroke="#c48e6c"
              strokeWidth="1.2"
            />
            <line x1={frame.baseHand.knuckleIndex.x} y1={frame.baseHand.knuckleIndex.y} x2={frame.baseHand.tipIndex.x} y2={frame.baseHand.tipIndex.y} stroke="url(#bslHumanSkin)" strokeWidth="4.8" strokeLinecap="round" />
            <line x1={frame.baseHand.kMid.x} y1={frame.baseHand.kMid.y} x2={frame.baseHand.tipMid.x} y2={frame.baseHand.tipMid.y} stroke="url(#bslHumanSkin)" strokeWidth="4.8" strokeLinecap="round" />
            <line x1={frame.baseHand.kPinky.x} y1={frame.baseHand.kPinky.y} x2={frame.baseHand.tipPinky.x} y2={frame.baseHand.tipPinky.y} stroke="url(#bslHumanSkin)" strokeWidth="4.4" strokeLinecap="round" />
            <line x1={frame.baseHand.thumbBase.x} y1={frame.baseHand.thumbBase.y} x2={frame.baseHand.thumbTip.x} y2={frame.baseHand.thumbTip.y} stroke="url(#bslHumanSkin)" strokeWidth="4.8" strokeLinecap="round" />
          </g>

          {/* Dominant Hand (Right) */}
          <g id="avatar-dom-hand">
            <line x1={frame.domHand.forearm.x} y1={frame.domHand.forearm.y} x2={frame.domHand.wrist.x} y2={frame.domHand.wrist.y} stroke="url(#bslHumanSkin)" strokeWidth="6.8" strokeLinecap="round" />
            <ellipse
              cx={frame.domHand.palm.x}
              cy={frame.domHand.palm.y}
              rx={6.8 * frame.domHand.palm.scale}
              ry={8.0 * frame.domHand.palm.scale}
              fill="url(#bslHumanSkin)"
              stroke="#c48e6c"
              strokeWidth="1.2"
            />
            <line x1={frame.domHand.knuckleIndex.x} y1={frame.domHand.knuckleIndex.y} x2={frame.domHand.tipIndex.x} y2={frame.domHand.tipIndex.y} stroke="url(#bslHumanSkin)" strokeWidth="5" strokeLinecap="round" />
            <line x1={frame.domHand.kMid.x} y1={frame.domHand.kMid.y} x2={frame.domHand.tipMid.x} y2={frame.domHand.tipMid.y} stroke="url(#bslHumanSkin)" strokeWidth="5" strokeLinecap="round" />
            <line x1={frame.domHand.kPinky.x} y1={frame.domHand.kPinky.y} x2={frame.domHand.tipPinky.x} y2={frame.domHand.tipPinky.y} stroke="url(#bslHumanSkin)" strokeWidth="4.6" strokeLinecap="round" />
            <line x1={frame.domHand.thumbBase.x} y1={frame.domHand.thumbBase.y} x2={frame.domHand.thumbTip.x} y2={frame.domHand.thumbTip.y} stroke="url(#bslHumanSkin)" strokeWidth="5" strokeLinecap="round" />
            <circle cx={frame.domHand.tipIndex.x} cy={frame.domHand.tipIndex.y} r="8" fill="url(#bslTouchPulse)" opacity="0.8" />
          </g>
        </svg>

        {/* View Controls */}
        <div style={{ position: 'absolute', bottom: '6px', left: '8px', display: 'flex', gap: '4px' }}>
          <button type="button" onClick={() => setViewAngle((p) => (p === 'signer' ? 'receiver' : 'signer'))} style={{ background: '#0f172a', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '4px', fontSize: '0.62rem', padding: '2px 5px' }}>
            {viewAngle === 'signer' ? '👤 Signer' : '👥 Receiver'}
          </button>
          <button type="button" onClick={() => setCameraMode((p) => (p === 'split' ? 'body' : p === 'body' ? 'face' : 'split'))} style={{ background: '#0f172a', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '4px', fontSize: '0.62rem', padding: '2px 5px' }}>
            {cameraMode === 'split' ? '⚖️ Dual' : cameraMode === 'face' ? '🔍 Face' : '👤 Body'}
          </button>
        </div>
      </div>

      {/* Input / Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(30, 41, 59, 0.7)', fontSize: '0.65rem' }}>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          {[1.0, 1.5, 2.0].map((s) => (
            <button key={s} type="button" onClick={() => setSpeedMultiplier(s)} style={{ background: speedMultiplier === s ? '#0284c7' : '#0f172a', color: '#fff', border: 'none', borderRadius: '3px', padding: '1px 4px' }}>
              {s}×
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (customInput.trim()) { enqueueText(customInput); setCustomInput(''); } }} style={{ display: 'flex', gap: '3px' }}>
          <input type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="Type sign..." style={{ width: '90px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '3px', padding: '2px 4px', fontSize: '0.65rem' }} />
          <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '3px', padding: '2px 6px', fontWeight: 700 }}>Go</button>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' && document.body ? createPortal(content, document.body) : content;
};

export default BslInterpreterOverlay;
