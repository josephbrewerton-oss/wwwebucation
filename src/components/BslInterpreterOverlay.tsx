/**
 * src/components/BslInterpreterOverlay.tsx
 *
 * St Joseph's Educational Media Suite - British Sign Language (BSL) "In-Vision" Vector Interpreter
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Procedural, zero-video, real-time 3D vector BSL signing overlay.
 * Features:
 * 1. High-Performance WebAssembly 3D Kernel Acceleration (conforming to docs/WASM_ARCHITECTURE_CONTRACT.md).
 * 2. Draggable floating window with pointer capture, window bounds clamping, and persistent position.
 * 3. Interactive 3D Camera Orbit & Pan Controls: Direct drag-to-orbit on stage, mouse wheel zoom,
 *    and on-screen D-Pad pan controls (Up, Down, Left, Right, Zoom, and Reset).
 * 4. Quick Corner Docking (Top-Left, Top-Right, Bottom-Left, Bottom-Right).
 * 5. Synchronized with speech boundaries, keyframes, and subtitles.
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  decomposeTextToBslStream,
  project3DToSvg,
  interpolatePoint3D,
} from '../utils/bslAlphabet';
import {
  decomposeTextToBslStreamWithLexicon,
  lookupBslSign,
  BSL_CURRICULUM_LEXICON,
  registerBslSigns,
} from '../utils/bslLexicon';
import { parseAstToLexicon } from '../utils/bslAstCodec';
import {
  analyzeAndTransformBslGrammar,
  BslGrammarMode,
  BslGrammarAnalysis,
} from '../utils/bslGrammarEngine';
import '../utils/ast3dWasmBridge'; // Auto-boots WebAssembly 3D Kernel
import { subscribeBslSpeech, openBslSignStudio } from '../services/bslGlobalStore';
import { subscribeCustomSigns, initCustomSignsIntoLexicon } from '../services/customSignStore';

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

const QUICK_SIGNS = [
  { label: '✝️ Jesus', word: 'JESUS' },
  { label: '🙏 Pray', word: 'PRAY' },
  { label: '⛪ Church', word: 'CHURCH' },
  { label: '✨ God', word: 'GOD' },
  { label: '✝ Cross', word: 'CROSS' },
  { label: '📖 Bible', word: 'BIBLE' },
  { label: '🏫 School', word: 'SCHOOL' },
  { label: '🔬 Science', word: 'SCIENCE' },
  { label: '🔢 Maths', word: 'MATHS' },
  { label: '🤝 Help', word: 'HELP' },
  { label: '👋 Hello', word: 'HELLO' },
  { label: '❤️ Love', word: 'LOVE' },
  { label: '🕊️ Peace', word: 'PEACE' },
  { label: '👍 Good', word: 'GOOD' },
  { label: '🤲 Thank You', word: 'THANK YOU' },
  { label: '☀️ Sun', word: 'SUN' },
  { label: '🪐 Planet', word: 'PLANET' },
  { label: '🔄 Orbit', word: 'ORBIT' },
  { label: '🌍 Earth', word: 'EARTH' },
  { label: '🌙 Moon', word: 'MOON' },
  { label: '🍎 Gravity', word: 'GRAVITY' },
  { label: '⚡ Energy', word: 'ENERGY' },
  { label: '💨 Fast', word: 'FAST' },
  { label: '⏱️ Time', word: 'TIME' },
  { label: '💥 Force', word: 'FORCE' },
  { label: '👋 Bye', word: 'GOODBYE' },
  { label: '❓ What', word: 'WHAT' },
  { label: '📍 Where', word: 'WHERE' },
  { label: '🛑 Stop', word: 'STOP' },
  { label: '▶️ Start', word: 'START' },
  { label: '🏁 Finish', word: 'FINISH' },
  { label: '😊 Happy', word: 'HAPPY' },
  { label: '😢 Sad', word: 'SAD' },
  { label: '🙏 Sorry', word: 'SORRY' },
  { label: '➕ More', word: 'MORE' },
  { label: '🔁 Again', word: 'AGAIN' },
  { label: '✅ Correct', word: 'CORRECT' },
];

export const BslInterpreterOverlay: React.FC<BslInterpreterOverlayProps> = ({
  activeWord = '',
  activeSubtitle = '',
  isSpeaking = false,
  onClose,
  className = '',
}) => {
  const [viewAngle, setViewAngle] = useState<'signer' | 'receiver'>('receiver');
  const [cameraMode, setCameraMode] = useState<'split' | 'body' | 'face'>('split');
  const [windowOpacity, setWindowOpacity] = useState<number>(1.0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.2);
  const [grammarMode, setGrammarMode] = useState<BslGrammarMode>('bsl-natural');
  const [showGrammarInspector, setShowGrammarInspector] = useState<boolean>(false);
  const [grammarAnalysis, setGrammarAnalysis] = useState<BslGrammarAnalysis | null>(null);
  const [customInput, setCustomInput] = useState<string>('');
  const [isPipActive, setIsPipActive] = useState<boolean>(false);
  const [showPanControls, setShowPanControls] = useState<boolean>(false);
  const [showFacialFeatures, setShowFacialFeatures] = useState<boolean>(true);
  const [importNotice, setImportNotice] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [availableSigns, setAvailableSigns] = useState<{ label: string; word: string }[]>(() => {
    return Object.values(BSL_CURRICULUM_LEXICON).map((s) => ({
      label: s.englishLabel || s.word,
      word: s.word,
    }));
  });

  // Synchronize available signs with custom signs from IndexedDB
  useEffect(() => {
    const refreshSigns = () => {
      setAvailableSigns(
        Object.values(BSL_CURRICULUM_LEXICON).map((s) => ({
          label: s.englishLabel || s.word,
          word: s.word,
        }))
      );
    };
    initCustomSignsIntoLexicon().then(refreshSigns);
    const unsub = subscribeCustomSigns(refreshSigns);
    return unsub;
  }, []);

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

  const handleImportAstFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parseAstToLexicon(text);
      const count = registerBslSigns(imported);
      if (count > 0) {
        setAvailableSigns(
          Object.values(BSL_CURRICULUM_LEXICON).map((s) => ({
            label: s.englishLabel || s.word,
            word: s.word,
          }))
        );
        const firstKey = Object.keys(imported)[0];
        setImportNotice(`+${count} sign${count > 1 ? 's' : ''}`);
        setTimeout(() => setImportNotice(''), 3500);
        if (firstKey) {
          enqueueWord(firstKey);
        }
      } else {
        setImportNotice('0 signs');
        setTimeout(() => setImportNotice(''), 3000);
      }
    } catch (_) {
      setImportNotice('Error');
      setTimeout(() => setImportNotice(''), 3000);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 1. Draggable Window State (Persistent in localStorage with safe viewport bounds)
  const [windowPos, setWindowPos] = useState<{ x: number; y: number } | null>(() => {
    try {
      const saved = localStorage.getItem('stj_bsl_window_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          if (typeof window !== 'undefined') {
            const maxX = Math.max(0, window.innerWidth - 280);
            const maxY = Math.max(0, window.innerHeight - 200);
            if (parsed.x < 0 || parsed.x > maxX || parsed.y < 0 || parsed.y > maxY) {
              return null; // Reset to safe default dock if off-screen
            }
          }
          return parsed;
        }
      }
    } catch (_) {}
    return null;
  });

  // Keep window within viewport bounds when window resizes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setWindowPos((prev) => {
        if (!prev) return null;
        const maxX = Math.max(0, window.innerWidth - 280);
        const maxY = Math.max(0, window.innerHeight - 200);
        if (prev.x > maxX || prev.y > maxY || prev.x < 0 || prev.y < 0) {
          return null; // Return to safe docked corner
        }
        return prev;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDraggingWindowRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });
  const windowRef = useRef<HTMLDivElement | null>(null);

  // 2. Interactive 3D Camera Orbit & Pan State
  const [orbitOffset, setOrbitOffset] = useState<{
    yaw: number;
    pitch: number;
    distanceDelta: number;
    panX: number;
    panY: number;
  }>({
    yaw: 0,
    pitch: 0,
    distanceDelta: 0,
    panX: 0,
    panY: 0,
  });

  const is3DDraggingRef = useRef(false);
  const drag3DStartRef = useRef<{ x: number; y: number; startYaw: number; startPitch: number }>({
    x: 0,
    y: 0,
    startYaw: 0,
    startPitch: 0,
  });

  // Check if WASM 3D Kernel is initialized
  const [isWasmActive, setIsWasmActive] = useState<boolean>(() => {
    return Boolean(typeof window !== 'undefined' && (window as any).AST3DWasmBridge?.isReady);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).AST3DWasmBridge?.isReady) {
        setIsWasmActive(true);
        clearInterval(timer);
      }
    }, 150);
    return () => clearInterval(timer);
  }, []);

  // Auto-sync signs from static/lexicons/bsl-signs.ast
  useEffect(() => {
    if (typeof window === 'undefined') return;
    fetch('/lexicons/bsl-signs.ast')
      .then((res) => (res.ok ? res.text() : ''))
      .then((astContent) => {
        if (astContent && astContent.trim()) {
          const diskSigns = parseAstToLexicon(astContent);
          registerBslSigns(diskSigns);
          setAvailableSigns(
            Object.values(BSL_CURRICULUM_LEXICON).map((s) => ({
              label: s.englishLabel || s.word,
              word: s.word,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Window Pointer Drag Handlers
  const handleHeaderPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input, form, select')) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const rect = windowRef.current?.getBoundingClientRect();
    const currentX = rect ? rect.left : 100;
    const currentY = rect ? rect.top : 100;

    isDraggingWindowRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: currentX,
      startY: currentY,
    };
  };

  const handleHeaderPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingWindowRef.current) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    const parentW = window.innerWidth;
    const parentH = window.innerHeight;
    const winW = 270;
    const winH = 260;

    const newX = Math.max(8, Math.min(parentW - winW - 8, dragStartRef.current.startX + dx));
    const newY = Math.max(8, Math.min(parentH - winH - 8, dragStartRef.current.startY + dy));

    setWindowPos({ x: newX, y: newY });
  };

  const handleHeaderPointerUp = (e: React.PointerEvent) => {
    if (isDraggingWindowRef.current) {
      isDraggingWindowRef.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
      if (windowPos) {
        try {
          localStorage.setItem('stj_bsl_window_pos', JSON.stringify(windowPos));
        } catch (_) {}
      }
    }
  };

  // Corner Docking Shortcuts
  const handleDockCorner = (corner: 'tl' | 'tr' | 'bl' | 'br') => {
    const parentW = window.innerWidth;
    const parentH = window.innerHeight;
    const winW = 270;
    const winH = 270;
    let pos = { x: parentW - winW - 16, y: parentH - winH - 16 };
    if (corner === 'tl') pos = { x: 16, y: 70 };
    if (corner === 'tr') pos = { x: parentW - winW - 16, y: 70 };
    if (corner === 'bl') pos = { x: 16, y: parentH - winH - 16 };
    if (corner === 'br') pos = { x: parentW - winW - 16, y: parentH - winH - 16 };
    setWindowPos(pos);
    try {
      localStorage.setItem('stj_bsl_window_pos', JSON.stringify(pos));
    } catch (_) {}
  };

  const handleResetWindowPos = () => {
    setWindowPos(null);
    try {
      localStorage.removeItem('stj_bsl_window_pos');
    } catch (_) {}
  };

  // 3D Stage Direct Drag Handlers (Orbit Hands)
  const handleStagePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    try {
      (e.currentTarget as unknown as Element).setPointerCapture(e.pointerId);
    } catch (_) {}
    is3DDraggingRef.current = true;
    drag3DStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startYaw: orbitOffset.yaw,
      startPitch: orbitOffset.pitch,
    };
  };

  const handleStagePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!is3DDraggingRef.current) return;
    const dx = e.clientX - drag3DStartRef.current.x;
    const dy = e.clientY - drag3DStartRef.current.y;
    setOrbitOffset((prev) => ({
      ...prev,
      yaw: drag3DStartRef.current.startYaw + dx * 0.9,
      pitch: Math.max(-75, Math.min(75, drag3DStartRef.current.startPitch + dy * 0.7)),
    }));
  };

  const handleStagePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (is3DDraggingRef.current) {
      is3DDraggingRef.current = false;
      try {
        (e.currentTarget as unknown as Element).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const handleStageWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY * 0.35;
    setOrbitOffset((prev) => ({
      ...prev,
      distanceDelta: Math.max(-160, Math.min(260, prev.distanceDelta + delta)),
    }));
  };

  // Camera angles with interactive orbit offset, Split Dual View, and Face Focus mode
  const cameraConfig = useMemo(() => {
    let baseYaw = viewAngle === 'signer' ? 0 : 180;
    let basePitch = viewAngle === 'signer' ? 24 : -6;
    let baseDistance = 360;

    if (cameraMode === 'face') {
      basePitch = 0;
      baseDistance = 210; // Zoomed in for crystal-clear focus on face, eyebrows, eyes, and mouth
    } else if (cameraMode === 'split') {
      basePitch = viewAngle === 'signer' ? 18 : -4;
      baseDistance = 330; // Ergonomically framed dual-zone perspective
    }

    return {
      yaw: baseYaw + orbitOffset.yaw,
      pitch: Math.max(-85, Math.min(85, basePitch + orbitOffset.pitch)),
      distance: Math.max(120, baseDistance + orbitOffset.distanceDelta),
      fov: cameraMode === 'face' ? 55 : 60,
    };
  }, [viewAngle, orbitOffset, cameraMode]);

  // Enqueue new word or phrase for conceptual BSL signing or fingerspelling
  const enqueueText = useCallback((text: string, overrideMode?: BslGrammarMode) => {
    if (!text || typeof text !== 'string') return;
    const clean = text.trim();
    if (!clean) return;

    setActiveWordDisplay(clean.toUpperCase());
    const effectiveMode = overrideMode || grammarMode;
    const analysis = analyzeAndTransformBslGrammar(clean, { mode: effectiveMode });
    setGrammarAnalysis(analysis);
    if (analysis.stream.length > 0) {
      queueRef.current = [...analysis.stream, REST_POSE];
    }
  }, [grammarMode]);

  const enqueueWord = useCallback((word: string) => {
    enqueueText(word);
  }, [enqueueText]);

  // React to parent speech boundary or subtitle changes
  useEffect(() => {
    if (activeSubtitle && activeSubtitle.trim()) {
      enqueueText(activeSubtitle);
    } else if (activeWord && activeWord.trim()) {
      enqueueText(activeWord);
    }
  }, [activeWord, activeSubtitle, enqueueText]);

  // Subscribe to universal speech bus for full-portal coordination
  useEffect(() => {
    const unsubscribe = subscribeBslSpeech((payload) => {
      // Prioritize full subtitle sentences for natural BSL topic-comment grammar & concept signs
      if (payload.subtitle && payload.subtitle.trim()) {
        enqueueText(payload.subtitle);
      } else if (payload.word && payload.word.trim()) {
        enqueueText(payload.word);
      }
    });
    return unsubscribe;
  }, [enqueueText]);

  // Kinematic render loop (60 FPS Hermite interpolation)
  useEffect(() => {
    let t = 1;
    let fromPose = REST_POSE;
    let toPose = REST_POSE;

    const frameStep = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const duration = 0.36 / speedMultiplier;
      t += dt / duration;

      if (t >= 1) {
        t = 1;
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
  }, [speedMultiplier]);

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

  // Canvas dimension: 240 x 180 (comfortably framing both left and right hands in 3D perspective with generous headroom)
  const originX = 120 + orbitOffset.panX;
  const originY = (cameraMode === 'face' ? 88 : 106) + orbitOffset.panY;

  // Active Non-Manual Feature (NMF) grammatical state
  const activeNmf = currentPose.nmf;
  const eyebrowState = activeNmf?.eyebrows || 'neutral';
  const mouthPattern = activeNmf?.mouth || '';
  const headTilt = activeNmf?.headTilt || 'neutral';

  // 3D Head Center & Tilt Dynamics
  const headCenter3D: Point3D = useMemo(() => {
    let dx = 0;
    let dy = -72;
    let dz = -15;
    if (headTilt === 'nod') {
      dy += 4 * Math.sin(transitionProgress * Math.PI); // subtle rhythmic nod
      dz += 2;
    } else if (headTilt === 'shake') {
      dx += 6 * Math.sin(transitionProgress * Math.PI * 2); // authentic BSL negation head shake
    } else if (headTilt === 'tilt-right') {
      dx += 4;
      dy -= 2;
    } else if (headTilt === 'tilt-left') {
      dx -= 4;
      dy -= 2;
    }
    return { x: dx, y: dy, z: dz };
  }, [headTilt, transitionProgress]);

  // Perspective projection for Upper Torso & Head / Face (anchored on LHS in split mode)
  const projPointBody = useCallback(
    (pt: Point3D) => {
      let ox = 120 + orbitOffset.panX;
      let oy = (cameraMode === 'face' ? 88 : 106) + orbitOffset.panY;
      let yShift = cameraMode === 'face' ? headCenter3D.y : 0;
      let zShift = cameraMode === 'face' ? headCenter3D.z : 0;

      if (cameraMode === 'split') {
        ox = 66 + orbitOffset.panX;
        oy = 96 + orbitOffset.panY;
        yShift = 0;
        zShift = 0;
      }
      return project3DToSvg({ x: pt.x, y: pt.y - yShift, z: pt.z - zShift }, cameraConfig, ox, oy);
    },
    [cameraMode, headCenter3D.y, headCenter3D.z, cameraConfig, orbitOffset.panX, orbitOffset.panY]
  );

  // Perspective projection for Signing Hands Space (anchored on RHS in split mode)
  const projPointHands = useCallback(
    (pt: Point3D) => {
      let ox = 120 + orbitOffset.panX;
      let oy = (cameraMode === 'face' ? 88 : 106) + orbitOffset.panY;
      let yShift = cameraMode === 'face' ? headCenter3D.y : 0;
      let zShift = cameraMode === 'face' ? headCenter3D.z : 0;

      if (cameraMode === 'split') {
        ox = 175 + orbitOffset.panX;
        oy = 104 + orbitOffset.panY;
        yShift = 0;
        zShift = 0;
      }
      return project3DToSvg({ x: pt.x, y: pt.y - yShift, z: pt.z - zShift }, cameraConfig, ox, oy);
    },
    [cameraMode, headCenter3D.y, headCenter3D.z, cameraConfig, orbitOffset.panX, orbitOffset.panY]
  );

  const projPoint = projPointHands;

  // Upper Torso & Head Reference Frame (Anatomical Loci for BSL Signs)
  const torsoHead = useMemo(() => projPointBody(headCenter3D), [projPointBody, headCenter3D]);
  const torsoChin = useMemo(
    () => projPointBody({ x: headCenter3D.x, y: headCenter3D.y + 26, z: headCenter3D.z + 5 }),
    [projPointBody, headCenter3D]
  );
  const torsoChest = useMemo(() => projPointBody({ x: 0, y: 15, z: -15 }), [projPointBody]);
  const torsoLeftShoulder = useMemo(
    () => projPointBody({ x: cameraMode === 'split' ? -68 : -95, y: 15, z: -25 }),
    [projPointBody, cameraMode]
  );
  const torsoRightShoulder = useMemo(
    () => projPointBody({ x: cameraMode === 'split' ? 68 : 95, y: 15, z: -25 }),
    [projPointBody, cameraMode]
  );

  // 3D Projected Facial Feature Landmarks (Eyes, Eyebrows, Nose, Mouth)
  const facialLandmarks = useMemo(() => {
    let browInnerDy = 0;
    let browOuterDy = 0;
    if (eyebrowState === 'raised') {
      browInnerDy = -5;
      browOuterDy = -4;
    } else if (eyebrowState === 'furrowed') {
      browInnerDy = 3;
      browOuterDy = -1;
    }

    let mouthW = cameraMode === 'face' ? 8 : (cameraMode === 'split' ? 5.5 : 6);
    let mouthH = cameraMode === 'face' ? 3 : 2;
    let mouthCurvature = 0;
    const lowerMouth = mouthPattern.toLowerCase();
    if (lowerMouth.includes('o') || lowerMouth.includes('u')) {
      mouthW = cameraMode === 'face' ? 5.5 : 4;
      mouthH = cameraMode === 'face' ? 7 : 5;
    } else if (
      lowerMouth.includes('a') ||
      lowerMouth.includes('e') ||
      lowerMouth.includes('good') ||
      lowerMouth.includes('yes') ||
      lowerMouth.includes('friend') ||
      lowerMouth.includes('thank')
    ) {
      mouthW = cameraMode === 'face' ? 9.5 : (cameraMode === 'split' ? 7 : 7.5);
      mouthH = cameraMode === 'face' ? 3.5 : 2.5;
      mouthCurvature = cameraMode === 'face' ? 4 : 3;
    } else if (lowerMouth.includes('no') || lowerMouth.includes('question')) {
      mouthW = cameraMode === 'face' ? 8 : (cameraMode === 'split' ? 5.5 : 6);
      mouthH = cameraMode === 'face' ? 5 : 3.5;
      mouthCurvature = -2;
    }

    const zFace = headCenter3D.z + 14;
    const zNose = headCenter3D.z + 18;

    const leftBrowOut = projPointBody({ x: headCenter3D.x - 11, y: headCenter3D.y - 10 + browOuterDy, z: zFace });
    const leftBrowIn = projPointBody({ x: headCenter3D.x - 3, y: headCenter3D.y - 11 + browInnerDy, z: zFace + 1 });
    const rightBrowIn = projPointBody({ x: headCenter3D.x + 3, y: headCenter3D.y - 11 + browInnerDy, z: zFace + 1 });
    const rightBrowOut = projPointBody({ x: headCenter3D.x + 11, y: headCenter3D.y - 10 + browOuterDy, z: zFace });

    const leftEye = projPointBody({ x: headCenter3D.x - 7, y: headCenter3D.y - 5, z: zFace });
    const rightEye = projPointBody({ x: headCenter3D.x + 7, y: headCenter3D.y - 5, z: zFace });

    const noseBridge = projPointBody({ x: headCenter3D.x, y: headCenter3D.y - 3, z: zNose - 2 });
    const noseTip = projPointBody({ x: headCenter3D.x, y: headCenter3D.y + 4, z: zNose });

    const mouthLeft = projPointBody({ x: headCenter3D.x - mouthW, y: headCenter3D.y + 13 - mouthCurvature, z: zFace });
    const mouthCenter = projPointBody({ x: headCenter3D.x, y: headCenter3D.y + 14, z: zFace + 2 });
    const mouthRight = projPointBody({ x: headCenter3D.x + mouthW, y: headCenter3D.y + 13 - mouthCurvature, z: zFace });

    return {
      leftBrowOut,
      leftBrowIn,
      rightBrowIn,
      rightBrowOut,
      leftEye,
      rightEye,
      noseBridge,
      noseTip,
      mouthLeft,
      mouthCenter,
      mouthRight,
      mouthW,
      mouthH,
      eyebrowState,
      mouthPattern,
      headTilt,
    };
  }, [headCenter3D, projPointBody, eyebrowState, mouthPattern, headTilt, cameraMode]);

  // Project dominant hand (The Pen) complete anatomical landmarks with dynamic shape solving
  const domHand3D = useMemo(() => {
    const w = interpolatedWrist;
    const k = interpolatedKnuckle;
    const t = interpolatedTip;
    const shape = currentPose.shape || 'point';

    // Direction along index pointing axis
    const fx = k.x - w.x;
    const fy = k.y - w.y;
    const fz = k.z - w.z;
    const fLen = Math.hypot(fx, fy, fz) || 1;
    const ufx = fx / fLen;
    const ufy = fy / fLen;
    const ufz = fz / fLen;

    // Lateral vector across palm toward pinky (perpendicular to finger and vertical)
    const latX = -ufy * 0.9;
    const latY = ufx * 0.9;
    const latZ = 0.4;
    const latLen = Math.hypot(latX, latY, latZ) || 1;
    const ulx = latX / latLen;
    const uly = latY / latLen;
    const ulz = latZ / latLen;

    // Palmar / dorsal normal vector (uf x ul)
    const unx = ufy * ulz - ufz * uly;
    const uny = ufz * ulx - ufx * ulz;
    const unz = ufx * uly - ufy * ulx;
    const unLen = Math.hypot(unx, uny, unz) || 1;
    const unormX = unx / unLen;
    const unormY = uny / unLen;
    const unormZ = unz / unLen;

    // Palm center of dominant hand
    const palm: Point3D = {
      x: w.x * 0.5 + k.x * 0.5 + ulx * 12,
      y: w.y * 0.5 + k.y * 0.5 + uly * 12,
      z: w.z * 0.5 + k.z * 0.5 + ulz * 12,
    };

    // Knuckles for middle, ring, pinky
    const kMid: Point3D = {
      x: k.x + ulx * 14 - ufx * 3,
      y: k.y + uly * 14 - ufy * 3,
      z: k.z + ulz * 14 - ufz * 3,
    };
    const kRing: Point3D = {
      x: k.x + ulx * 25 - ufx * 7,
      y: k.y + uly * 25 - ufy * 7,
      z: k.z + ulz * 25 - ufz * 7,
    };
    const kPinky: Point3D = {
      x: k.x + ulx * 35 - ufx * 12,
      y: k.y + uly * 35 - ufy * 12,
      z: k.z + ulz * 35 - ufz * 12,
    };

    // Passive curled fingertips tucked into the palm (pointing hand posture)
    const tipMidCurled: Point3D = {
      x: palm.x + ulx * 6 - ufx * 4,
      y: palm.y + uly * 6 - ufy * 4,
      z: palm.z + 8,
    };
    const tipRingCurled: Point3D = {
      x: palm.x + ulx * 16 - ufx * 6,
      y: palm.y + uly * 16 - ufy * 6,
      z: palm.z + 6,
    };
    const tipPinkyCurled: Point3D = {
      x: palm.x + ulx * 24 - ufx * 8,
      y: palm.y + uly * 24 - ufy * 8,
      z: palm.z + 4,
    };

    // Thumb base & knuckle
    const thumbBase: Point3D = {
      x: w.x * 0.65 + k.x * 0.35 - ulx * 10,
      y: w.y * 0.65 + k.y * 0.35 - uly * 10,
      z: w.z * 0.65 + k.z * 0.35 + 4,
    };
    const thumbKnuckle: Point3D = {
      x: thumbBase.x + ufx * 12 - ulx * 5,
      y: thumbBase.y + ufy * 12 - uly * 5,
      z: thumbBase.z + 6,
    };

    // Forearm entry point
    const forearm: Point3D = {
      x: w.x - ufx * 36 + ulx * 6,
      y: w.y - ufy * 36 + uly * 6 + 28,
      z: w.z - 20,
    };

    // Dynamic handshape digit solver (:point | :flat | :fist | :claw | :spread | :v)
    let tipIndex: Point3D = t;
    let tipMid: Point3D = tipMidCurled;
    let tipRing: Point3D = tipRingCurled;
    let tipPinky: Point3D = tipPinkyCurled;
    let thumbTip: Point3D = {
      x: k.x * 0.6 + kMid.x * 0.4 - ufx * 4,
      y: k.y * 0.6 + kMid.y * 0.4 - ufy * 4,
      z: k.z + 8,
    };

    switch (shape) {
      case 'flat':
        // All fingers extended, closed together (B-hand)
        tipIndex = t;
        tipMid = {
          x: kMid.x + ufx * 27,
          y: kMid.y + ufy * 27,
          z: kMid.z + ufz * 27,
        };
        tipRing = {
          x: kRing.x + ufx * 24,
          y: kRing.y + ufy * 24,
          z: kRing.z + ufz * 24,
        };
        tipPinky = {
          x: kPinky.x + ufx * 19,
          y: kPinky.y + ufy * 19,
          z: kPinky.z + ufz * 19,
        };
        thumbTip = {
          x: k.x - ulx * 7 - ufx * 2,
          y: k.y - uly * 7 - ufy * 2,
          z: k.z + 4,
        };
        break;

      case 'fist':
        // S-hand / A-hand: all fingers tightly curled including index
        tipIndex = {
          x: palm.x - ulx * 3 - ufx * 4,
          y: palm.y - uly * 3 - ufy * 4,
          z: palm.z + 8,
        };
        tipMid = tipMidCurled;
        tipRing = tipRingCurled;
        tipPinky = tipPinkyCurled;
        thumbTip = {
          x: k.x + ulx * 6 + ufx * 2,
          y: k.y + uly * 6 + ufy * 2,
          z: k.z + 10,
        };
        break;

      case 'claw':
        // Curved 5-hand: all fingers bent into curved hooks
        tipIndex = {
          x: k.x + ufx * 14 - unormX * 12,
          y: k.y + ufy * 14 - unormY * 12,
          z: k.z + ufz * 14 - unormZ * 12,
        };
        tipMid = {
          x: kMid.x + ufx * 15 - unormX * 12,
          y: kMid.y + ufy * 15 - unormY * 12,
          z: kMid.z + ufz * 15 - unormZ * 12,
        };
        tipRing = {
          x: kRing.x + ufx * 14 - unormX * 12,
          y: kRing.y + ufy * 14 - unormY * 12,
          z: kRing.z + ufz * 14 - unormZ * 12,
        };
        tipPinky = {
          x: kPinky.x + ufx * 11 - unormX * 12,
          y: kPinky.y + ufy * 11 - unormY * 12,
          z: kPinky.z + ufz * 11 - unormZ * 12,
        };
        thumbTip = {
          x: thumbKnuckle.x + ufx * 10 - unormX * 10,
          y: thumbKnuckle.y + ufy * 10 - unormY * 10,
          z: thumbKnuckle.z + ufz * 10 - unormZ * 10,
        };
        break;

      case 'spread':
        // Open 5-hand: all fingers extended and splayed laterally
        tipIndex = {
          x: k.x + ufx * 25 - ulx * 8,
          y: k.y + ufy * 25 - uly * 8,
          z: k.z + ufz * 25,
        };
        tipMid = {
          x: kMid.x + ufx * 28,
          y: kMid.y + ufy * 28,
          z: kMid.z + ufz * 28,
        };
        tipRing = {
          x: kRing.x + ufx * 25 + ulx * 8,
          y: kRing.y + ufy * 25 + uly * 8,
          z: kRing.z + ufz * 25,
        };
        tipPinky = {
          x: kPinky.x + ufx * 21 + ulx * 16,
          y: kPinky.y + ufy * 21 + uly * 16,
          z: kPinky.z + ufz * 21,
        };
        thumbTip = {
          x: thumbKnuckle.x + ufx * 12 - ulx * 14,
          y: thumbKnuckle.y + ufy * 12 - uly * 14,
          z: thumbKnuckle.z + 8,
        };
        break;

      case 'v':
        // V-hand: Index + Middle extended with spread, ring and pinky curled
        tipIndex = {
          x: k.x + ufx * 25 - ulx * 6,
          y: k.y + ufy * 25 - uly * 6,
          z: k.z + ufz * 25,
        };
        tipMid = {
          x: kMid.x + ufx * 26 + ulx * 6,
          y: kMid.y + ufy * 26 + uly * 6,
          z: kMid.z + ufz * 26,
        };
        tipRing = tipRingCurled;
        tipPinky = tipPinkyCurled;
        thumbTip = {
          x: kRing.x - ufx * 2,
          y: kRing.y - ufy * 2,
          z: kRing.z + 8,
        };
        break;

      case 'point':
      default:
        // Only index extended (1-hand / G-hand)
        tipIndex = t;
        tipMid = tipMidCurled;
        tipRing = tipRingCurled;
        tipPinky = tipPinkyCurled;
        break;
    }

    return {
      wrist: w,
      knuckleIndex: k,
      tipIndex,
      palm,
      kMid,
      kRing,
      kPinky,
      tipMid,
      tipRing,
      tipPinky,
      thumbBase,
      thumbKnuckle,
      thumbTip,
      forearm,
      shape,
    };
  }, [interpolatedWrist, interpolatedKnuckle, interpolatedTip, currentPose.shape]);

  // Project all dominant hand landmarks to 2D SVG stage (anchored on RHS in dual split mode)
  const domWrist = projPointHands(domHand3D.wrist);
  const domKnuckle = projPointHands(domHand3D.knuckleIndex);
  const domTip = projPointHands(domHand3D.tipIndex);
  const domPalm = projPointHands(domHand3D.palm);
  const domKMid = projPointHands(domHand3D.kMid);
  const domKRing = projPointHands(domHand3D.kRing);
  const domKPinky = projPointHands(domHand3D.kPinky);
  const domTipMid = projPointHands(domHand3D.tipMid);
  const domTipRing = projPointHands(domHand3D.tipRing);
  const domTipPinky = projPointHands(domHand3D.tipPinky);
  const domThumbBase = projPointHands(domHand3D.thumbBase);
  const domThumbKnuckle = projPointHands(domHand3D.thumbKnuckle);
  const domThumbTip = projPointHands(domHand3D.thumbTip);
  const domForearm = projPointHands(domHand3D.forearm);

  // Project non-dominant hand (The Base / Left Hand) dynamically adapting to BSL linguistic mode
  const baseHand3D = useMemo(() => {
    const mode: BslBaseHandMode = currentPose.baseHandMode || (currentPose.isWholeWordSign ? 'rest' : 'vowel-board');
    const override = currentPose.baseHandOverride;

    if (mode === 'mirror') {
      // Symmetrical 2-Handed Signs (PRAY, CHURCH, BIBLE, FORCE, LOVE, PEACE, EARTH, EQUAL, etc.)
      // Left hand mirrors the dominant hand across the sagittal plane (X -> -X)
      return {
        mode: 'mirror' as const,
        wrist: { x: -domHand3D.wrist.x, y: domHand3D.wrist.y, z: domHand3D.wrist.z },
        knuckleIndex: { x: -domHand3D.knuckleIndex.x, y: domHand3D.knuckleIndex.y, z: domHand3D.knuckleIndex.z },
        tipIndex: { x: -domHand3D.tipIndex.x, y: domHand3D.tipIndex.y, z: domHand3D.tipIndex.z },
        palm: { x: -domHand3D.palm.x, y: domHand3D.palm.y, z: domHand3D.palm.z },
        kMid: { x: -domHand3D.kMid.x, y: domHand3D.kMid.y, z: domHand3D.kMid.z },
        kRing: { x: -domHand3D.kRing.x, y: domHand3D.kRing.y, z: domHand3D.kRing.z },
        kPinky: { x: -domHand3D.kPinky.x, y: domHand3D.kPinky.y, z: domHand3D.kPinky.z },
        tipMid: { x: -domHand3D.tipMid.x, y: domHand3D.tipMid.y, z: domHand3D.tipMid.z },
        tipRing: { x: -domHand3D.tipRing.x, y: domHand3D.tipRing.y, z: domHand3D.tipRing.z },
        tipPinky: { x: -domHand3D.tipPinky.x, y: domHand3D.tipPinky.y, z: domHand3D.tipPinky.z },
        thumbBase: { x: -domHand3D.thumbBase.x, y: domHand3D.thumbBase.y, z: domHand3D.thumbBase.z },
        thumbKnuckle: { x: -domHand3D.thumbKnuckle.x, y: domHand3D.thumbKnuckle.y, z: domHand3D.thumbKnuckle.z },
        thumbTip: { x: -domHand3D.thumbTip.x, y: domHand3D.thumbTip.y, z: domHand3D.thumbTip.z },
        forearm: { x: -domHand3D.forearm.x, y: domHand3D.forearm.y, z: domHand3D.forearm.z },
        shape: domHand3D.shape,
      };
    }

    if (mode === 'rest') {
      // One-Handed Signs (GOD, SUN, MOON, HELLO, THANK YOU, PLEASE, YES, NO, LIGHT, WATER, ENERGY)
      // Left hand rests comfortably down at the lower waist/torso
      const rw = BSL_BASE_REST_HAND.wrist;
      const rp = BSL_BASE_REST_HAND.palm;
      return {
        mode: 'rest' as const,
        wrist: rw,
        knuckleIndex: { x: rp.x + 8, y: rp.y - 12, z: rp.z + 5 },
        tipIndex: BSL_BASE_REST_HAND.fingertips[1],
        palm: rp,
        kMid: { x: rp.x + 18, y: rp.y - 10, z: rp.z + 5 },
        kRing: { x: rp.x + 28, y: rp.y - 8, z: rp.z + 5 },
        kPinky: { x: rp.x + 36, y: rp.y - 6, z: rp.z + 4 },
        tipMid: BSL_BASE_REST_HAND.fingertips[2],
        tipRing: BSL_BASE_REST_HAND.fingertips[3],
        tipPinky: BSL_BASE_REST_HAND.fingertips[4],
        thumbBase: { x: rw.x * 0.5 + rp.x * 0.5, y: rw.y * 0.5 + rp.y * 0.5, z: rw.z },
        thumbKnuckle: { x: rp.x - 8, y: rp.y - 5, z: rp.z + 8 },
        thumbTip: BSL_BASE_REST_HAND.fingertips[0],
        forearm: { x: rw.x - 25, y: rw.y + 35, z: rw.z - 15 },
        shape: 'flat' as const,
      };
    }

    // Mode 'vowel-board' or 'override'
    const sx = override?.shiftX || 0;
    const sy = override?.shiftY || 0;
    const sz = override?.shiftZ || 0;

    const bw: Point3D = override?.wrist || { x: BSL_BASE_HAND.wrist.x + sx, y: BSL_BASE_HAND.wrist.y + sy, z: BSL_BASE_HAND.wrist.z + sz };
    const bp: Point3D = override?.palm || { x: BSL_BASE_HAND.palm.x + sx, y: BSL_BASE_HAND.palm.y + sy, z: BSL_BASE_HAND.palm.z + sz };

    return {
      mode: mode,
      wrist: bw,
      knuckleIndex: { x: bp.x + 5, y: bp.y - 15, z: bp.z + 4 },
      tipIndex: { x: BSL_BASE_HAND.fingertips[1].x + sx, y: BSL_BASE_HAND.fingertips[1].y + sy, z: BSL_BASE_HAND.fingertips[1].z + sz },
      palm: bp,
      kMid: { x: bp.x + 15, y: bp.y - 18, z: bp.z + 4 },
      kRing: { x: bp.x + 25, y: bp.y - 15, z: bp.z + 4 },
      kPinky: { x: bp.x + 34, y: bp.y - 10, z: bp.z + 4 },
      tipMid: { x: BSL_BASE_HAND.fingertips[2].x + sx, y: BSL_BASE_HAND.fingertips[2].y + sy, z: BSL_BASE_HAND.fingertips[2].z + sz },
      tipRing: { x: BSL_BASE_HAND.fingertips[3].x + sx, y: BSL_BASE_HAND.fingertips[3].y + sy, z: BSL_BASE_HAND.fingertips[3].z + sz },
      tipPinky: { x: BSL_BASE_HAND.fingertips[4].x + sx, y: BSL_BASE_HAND.fingertips[4].y + sy, z: BSL_BASE_HAND.fingertips[4].z + sz },
      thumbBase: { x: bw.x * 0.6 + bp.x * 0.4, y: bw.y * 0.6 + bp.y * 0.4, z: bw.z },
      thumbKnuckle: { x: bp.x - 15, y: bp.y + 5, z: bp.z + 6 },
      thumbTip: { x: BSL_BASE_HAND.fingertips[0].x + sx, y: BSL_BASE_HAND.fingertips[0].y + sy, z: BSL_BASE_HAND.fingertips[0].z + sz },
      forearm: { x: bw.x - 30, y: bw.y + 35, z: bw.z - 15 },
      shape: 'flat' as const,
    };
  }, [currentPose.baseHandMode, currentPose.baseHandOverride, currentPose.isWholeWordSign, domHand3D]);

  // Project all non-dominant base hand landmarks to 2D SVG stage (anchored on RHS in dual split mode)
  const baseWrist = projPointHands(baseHand3D.wrist);
  const baseKnuckle = projPointHands(baseHand3D.knuckleIndex);
  const baseTip = projPointHands(baseHand3D.tipIndex);
  const basePalm = projPointHands(baseHand3D.palm);
  const baseKMid = projPointHands(baseHand3D.kMid);
  const baseKRing = projPointHands(baseHand3D.kRing);
  const baseKPinky = projPointHands(baseHand3D.kPinky);
  const baseTipMid = projPointHands(baseHand3D.tipMid);
  const baseTipRing = projPointHands(baseHand3D.tipRing);
  const baseTipPinky = projPointHands(baseHand3D.tipPinky);
  const baseThumbBase = projPointHands(baseHand3D.thumbBase);
  const baseThumbKnuckle = projPointHands(baseHand3D.thumbKnuckle);
  const baseThumbTip = projPointHands(baseHand3D.thumbTip);
  const baseForearm = projPointHands(baseHand3D.forearm);

  const baseFingertips = useMemo(() => {
    return [
      { id: 'A', name: 'Thumb', proj: baseThumbTip, idx: 0 },
      { id: 'E', name: 'Index', proj: baseTip, idx: 1 },
      { id: 'I', name: 'Middle', proj: baseTipMid, idx: 2 },
      { id: 'O', name: 'Ring', proj: baseTipRing, idx: 3 },
      { id: 'U', name: 'Pinky', proj: baseTipPinky, idx: 4 },
    ];
  }, [baseThumbTip, baseTip, baseTipMid, baseTipRing, baseTipPinky]);

  const isDomExtended = domHand3D.shape === 'flat' || domHand3D.shape === 'spread' || domHand3D.shape === 'claw';
  const isLeftExtended = baseHand3D.shape === 'flat' || baseHand3D.shape === 'spread' || baseHand3D.shape === 'claw';

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
    }
  };

  const handleTestWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      enqueueWord(customInput);
      setCustomInput('');
    }
  };

  // Button styling helpers
  const panBtnStyle: React.CSSProperties = {
    background: 'rgba(30, 41, 59, 0.85)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: '4px',
    color: '#38bdf8',
    padding: '2px 6px',
    fontSize: '0.66rem',
    fontWeight: 700,
    cursor: 'pointer',
    userSelect: 'none',
  };

  const stageBtnStyle: React.CSSProperties = {
    background: 'rgba(15, 23, 42, 0.85)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    borderRadius: '5px',
    padding: '2px 6px',
    fontSize: '0.62rem',
    fontWeight: 700,
    color: '#38bdf8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    userSelect: 'none',
  };

  const handleCycleOpacity = () => {
    setWindowOpacity((prev) => {
      if (prev === 1.0) return 0.85;
      if (prev === 0.85) return 0.65;
      return 1.0;
    });
  };

  // Render minimized floating pill
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
        {isWasmActive && (
          <span style={{ fontSize: '0.62rem', background: 'rgba(34, 197, 94, 0.25)', color: '#4ade80', padding: '1px 4px', borderRadius: '4px' }}>
            WASM
          </span>
        )}
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
    return typeof document !== 'undefined' && document.body ? createPortal(pill, document.body) : pill;
  }

  const overlayWindow = (
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
        transition: 'opacity 0.2s ease',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(14px)',
        border: '1.5px solid rgba(56, 189, 248, 0.4)',
        boxShadow: '0 14px 36px rgba(0, 0, 0, 0.65), 0 0 20px rgba(56, 189, 248, 0.18)',
        borderRadius: '12px',
        overflow: 'hidden',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      {/* Draggable Header Bar */}
      <div
        onPointerDown={handleHeaderPointerDown}
        onPointerMove={handleHeaderPointerMove}
        onPointerUp={handleHeaderPointerUp}
        onPointerCancel={handleHeaderPointerUp}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 10px',
          background: 'rgba(30, 41, 59, 0.9)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
          fontSize: '0.75rem',
          cursor: isDraggingWindowRef.current ? 'grabbing' : 'grab',
        }}
        title="Drag header to move window anywhere on screen"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#38bdf8' }}>
          <span style={{ cursor: 'grab', opacity: 0.8 }} title="Drag Handle">⠿</span>
          <span>🖐️</span>
          <span>BSL In-Vision</span>
          <span
            style={{
              fontSize: '0.58rem',
              padding: '1px 4px',
              borderRadius: '3px',
              background: 'rgba(56, 189, 248, 0.2)',
              color: '#38bdf8',
              fontWeight: 800,
              border: '1px solid rgba(56, 189, 248, 0.35)',
            }}
            title="Phase 1: 50+ Real BSL Curriculum Signs with Hybrid Fingerspelling Engine"
          >
            LEXICON
          </span>
          {isWasmActive && (
            <span
              style={{
                fontSize: '0.6rem',
                padding: '1px 4px',
                borderRadius: '3px',
                background: 'rgba(34, 197, 94, 0.25)',
                color: '#4ade80',
                fontWeight: 900,
                border: '1px solid rgba(34, 197, 94, 0.4)',
              }}
              title="3D perspective vector projection accelerated by WebAssembly"
            >
              ⚡ WASM 3D
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          {/* Quick Corner Dock Buttons (All 4 Corners) */}
          <div style={{ display: 'flex', gap: '1px' }}>
            <button
              type="button"
              onClick={() => handleDockCorner('tl')}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '1px 2px', fontSize: '0.7rem' }}
              title="Dock Top-Left"
            >
              ↖
            </button>
            <button
              type="button"
              onClick={() => handleDockCorner('tr')}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '1px 2px', fontSize: '0.7rem' }}
              title="Dock Top-Right"
            >
              ↗
            </button>
            <button
              type="button"
              onClick={() => handleDockCorner('bl')}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '1px 2px', fontSize: '0.7rem' }}
              title="Dock Bottom-Left"
            >
              ↙
            </button>
            <button
              type="button"
              onClick={() => handleDockCorner('br')}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '1px 2px', fontSize: '0.7rem' }}
              title="Dock Bottom-Right"
            >
              ↘
            </button>
          </div>

          {/* Opacity Cycle Button */}
          <button
            type="button"
            onClick={handleCycleOpacity}
            style={{
              background: windowOpacity < 1.0 ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              border: `1px solid ${windowOpacity < 1.0 ? '#38bdf8' : 'rgba(56, 189, 248, 0.2)'}`,
              color: windowOpacity < 1.0 ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              padding: '1px 3px',
              borderRadius: '3px',
              fontSize: '0.62rem',
              fontWeight: 700,
            }}
            title={`Toggle window opacity (currently ${Math.round(windowOpacity * 100)}%)`}
          >
            👁️
          </button>

          {/* 3D Pan / Orbit Controls Toggle */}
          <button
            type="button"
            onClick={() => setShowPanControls((prev) => !prev)}
            style={{
              background: showPanControls ? '#0284c7' : 'transparent',
              border: `1px solid ${showPanControls ? '#38bdf8' : 'rgba(56, 189, 248, 0.2)'}`,
              color: showPanControls ? '#ffffff' : '#94a3b8',
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '0.66rem',
              fontWeight: 700,
            }}
            title="Toggle 3D Camera Orbit & Pan D-Pad"
          >
            🌐
          </button>

          {/* Sign Studio & Keyframe Poser Launcher */}
          <button
            type="button"
            onClick={() => openBslSignStudio(activeWordDisplay || undefined)}
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid #10b981',
              color: '#6ee7b7',
              cursor: 'pointer',
              padding: '2px 5px',
              borderRadius: '4px',
              fontSize: '0.66rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
            }}
            title="Open BSL Sign Studio to create or edit signs"
          >
            <span>✍️</span>
            <span>Studio</span>
          </button>

          {/* Level 2/3 Syntax & Spatial Loci Inspector */}
          <button
            type="button"
            onClick={() => setShowGrammarInspector((p) => !p)}
            style={{
              background: showGrammarInspector ? '#0284c7' : 'rgba(56, 189, 248, 0.15)',
              border: `1px solid ${showGrammarInspector ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)'}`,
              color: showGrammarInspector ? '#ffffff' : '#38bdf8',
              cursor: 'pointer',
              padding: '2px 5px',
              borderRadius: '4px',
              fontSize: '0.66rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
            }}
            title="Toggle BSL Level 2/3 Syntax & Spatial Loci Inspector"
          >
            <span>⚖️</span>
            <span>Syntax</span>
          </button>

          {/* Reset Position Button */}
          {windowPos && (
            <button
              type="button"
              onClick={handleResetWindowPos}
              style={{ background: 'transparent', border: 'none', color: '#f59e0b', cursor: 'pointer', padding: '2px 3px', fontSize: '0.72rem' }}
              title="Reset window to default dock"
            >
              ↺
            </button>
          )}

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
                padding: '2px 3px',
                borderRadius: '4px',
                fontSize: '0.75rem',
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
              padding: '2px 3px',
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
                padding: '2px 3px',
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

      {/* Dedicated Sign & Non-Manual Features (NMF) Live Info Strip - NEVER covers the face! */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 10px',
          background: 'rgba(15, 23, 42, 0.98)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
          fontSize: '0.68rem',
          minHeight: '28px',
        }}
      >
        {/* Left: Active Letter / Sign Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              padding: '2px 8px',
              borderRadius: '5px',
              background: currentPose.isWholeWordSign ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)',
              border: `1px solid ${currentPose.isWholeWordSign ? '#f59e0b' : '#38bdf8'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '0.85rem' }}>
              {currentPose.isWholeWordSign ? '✨' : '🔤'}
            </span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 900,
                color: currentPose.isWholeWordSign ? '#fbbf24' : '#38bdf8',
                letterSpacing: '0.3px',
              }}
            >
              {currentPose.isWholeWordSign
                ? currentLetter.replace(/\s*\[.*\]/, '')
                : currentLetter || '—'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{
                  fontSize: '0.6rem',
                  color: currentPose.isWholeWordSign ? '#fbbf24' : '#94a3b8',
                  fontWeight: 700,
                }}
              >
                {currentPose.isWholeWordSign ? 'BSL Concept Sign' : 'BANZSL Fingerspelling'}
              </span>
              {currentPose.shape && (
                <span
                  style={{
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    color: '#f59e0b',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    padding: '0px 4px',
                    borderRadius: '3px',
                    fontFamily: 'monospace',
                  }}
                  title={`Handshape Opcode: :shape :${currentPose.shape}`}
                >
                  :{currentPose.shape}
                </span>
              )}
              {currentPose.isWholeWordSign && (
                <span
                  style={{
                    fontSize: '0.55rem',
                    fontWeight: 700,
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    padding: '0px 4px',
                    borderRadius: '3px',
                  }}
                  title={`Base Hand: ${baseHand3D.mode}`}
                >
                  {baseHand3D.mode === 'mirror' ? '2-Handed' : baseHand3D.mode === 'rest' ? '1-Hand' : 'Base'}
                </span>
              )}
            </div>
            {activeWordDisplay && (
              <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#cbd5e1' }}>
                &ldquo;{activeWordDisplay}&rdquo;
              </span>
            )}
          </div>
        </div>

        {/* Right: Live NMF Linguistic Expressions Indicator */}
        {showFacialFeatures ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.62rem' }}>
            {activeNmf?.eyebrows && activeNmf.eyebrows !== 'neutral' && (
              <span
                style={{
                  background: activeNmf.eyebrows === 'raised' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  border: `1px solid ${activeNmf.eyebrows === 'raised' ? '#38bdf8' : '#f59e0b'}`,
                  color: activeNmf.eyebrows === 'raised' ? '#38bdf8' : '#f59e0b',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  fontWeight: 800,
                }}
              >
                {activeNmf.eyebrows === 'raised' ? 'Raised Brows' : 'Furrowed'}
              </span>
            )}
            {activeNmf?.mouth && (
              <span
                style={{
                  color: '#f1f5f9',
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontStyle: 'italic',
                }}
              >
                👄 &ldquo;{activeNmf.mouth}&rdquo;
              </span>
            )}
            {activeNmf?.headTilt && activeNmf.headTilt !== 'neutral' && (
              <span
                style={{
                  color: '#a78bfa',
                  background: 'rgba(167, 139, 250, 0.2)',
                  padding: '1px 4px',
                  borderRadius: '4px',
                  fontWeight: 700,
                }}
              >
                {activeNmf.headTilt === 'nod' ? '✓ Nod' : activeNmf.headTilt === 'shake' ? '✗ Shake' : 'Tilt'}
              </span>
            )}
            {(!activeNmf || (!activeNmf.eyebrows && !activeNmf.mouth && !activeNmf.headTilt)) && (
              <span style={{ color: '#64748b', fontSize: '0.6rem' }}>Neutral</span>
            )}
          </div>
        ) : (
          <span style={{ color: '#64748b', fontSize: '0.6rem' }}>Face Off</span>
        )}
      </div>

      {/* BSL Level 2/3 Syntax & Spatial Loci Inspector Drawer */}
      {showGrammarInspector && (
        <div
          style={{
            padding: '6px 10px',
            background: 'rgba(10, 15, 30, 0.98)',
            borderBottom: '1px solid rgba(56, 189, 248, 0.3)',
            fontSize: '0.65rem',
            color: '#e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>⚖️ Level 2/3 Natural BSL</span>
              <span
                style={{
                  fontSize: '0.55rem',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: '3px',
                  background: grammarAnalysis?.sentenceType === 'wh-question'
                    ? 'rgba(239, 68, 68, 0.2)'
                    : grammarAnalysis?.sentenceType === 'polar-question'
                    ? 'rgba(56, 189, 248, 0.2)'
                    : grammarAnalysis?.sentenceType === 'negation'
                    ? 'rgba(245, 158, 11, 0.2)'
                    : 'rgba(34, 197, 94, 0.2)',
                  color: grammarAnalysis?.sentenceType === 'wh-question'
                    ? '#f87171'
                    : grammarAnalysis?.sentenceType === 'polar-question'
                    ? '#38bdf8'
                    : grammarAnalysis?.sentenceType === 'negation'
                    ? '#fbbf24'
                    : '#4ade80',
                  border: '1px solid currentColor',
                }}
              >
                {grammarAnalysis?.sentenceType?.toUpperCase() || 'TOPIC-COMMENT'}
              </span>
            </span>
            <span style={{ fontSize: '0.58rem', color: '#94a3b8' }}>
              NMF: {facialLandmarks.eyebrowState === 'furrowed' ? 'Furrowed 😠' : facialLandmarks.eyebrowState === 'raised' ? 'Raised 🤨' : 'Neutral 🙂'}
              {facialLandmarks.headTilt === 'shake' ? ' • Shake ↔️' : facialLandmarks.headTilt === 'nod' ? ' • Nod ↕️' : ''}
            </span>
          </div>

          {/* Gloss Sequence */}
          <div
            style={{
              padding: '3px 6px',
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.62rem',
              color: '#fbbf24',
              marginBottom: '5px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {grammarAnalysis?.glossSequence || activeWordDisplay || 'Awaiting utterance...'}
          </div>

          {/* Spatial Loci Compass */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', fontSize: '0.58rem' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '2px 4px', borderRadius: '3px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
              <span style={{ color: '#94a3b8', display: 'block', fontWeight: 700 }}>1P (Self)</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>Me / Signer</span>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '2px 4px', borderRadius: '3px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
              <span style={{ color: '#94a3b8', display: 'block', fontWeight: 700 }}>2P (Front)</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>You / Addressee</span>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '2px 4px', borderRadius: '3px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
              <span style={{ color: '#94a3b8', display: 'block', fontWeight: 700 }}>Locus A (Left)</span>
              <span style={{ color: grammarAnalysis?.activeLoci?.LOCUS_A?.assignedEntity ? '#a78bfa' : '#64748b', fontWeight: 600 }}>
                {grammarAnalysis?.activeLoci?.LOCUS_A?.assignedEntity || '3rd Entity'}
              </span>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '2px 4px', borderRadius: '3px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
              <span style={{ color: '#94a3b8', display: 'block', fontWeight: 700 }}>Locus B (Right)</span>
              <span style={{ color: grammarAnalysis?.activeLoci?.LOCUS_B?.assignedEntity ? '#f472b6' : '#64748b', fontWeight: 600 }}>
                {grammarAnalysis?.activeLoci?.LOCUS_B?.assignedEntity || '3rd Entity'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3D Skeletal Vector Stage with Pointer Drag Orbit */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '165px',
          background: 'radial-gradient(ellipse at center, #1e293b 0%, #090d16 100%)',
          cursor: is3DDraggingRef.current ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      >
        <svg
          viewBox="0 0 240 180"
          onPointerDown={handleStagePointerDown}
          onPointerMove={handleStagePointerMove}
          onPointerUp={handleStagePointerUp}
          onPointerCancel={handleStagePointerUp}
          onWheel={handleStageWheel}
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

          {/* DUAL-ZONE SPLIT (LHS Face & Upper Body + RHS Signing Hands) & MAPPED TUPLES */}
          {cameraMode === 'split' && (
            <g id="bsl-dual-zone-framing">
              {/* Subtle central neon dashed demarcation line */}
              <line x1="118" y1="18" x2="118" y2="162" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
              <circle cx="118" cy="90" r="2.2" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.8" opacity="0.75" />

              {/* Corner framing brackets for LHS Face Zone */}
              <path d="M 12 20 L 8 20 L 8 28" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.45" />
              <path d="M 104 20 L 110 20 L 110 28" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.45" />
              <path d="M 8 154 L 8 162 L 16 162" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.45" />
              <path d="M 102 162 L 110 162 L 110 154" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.45" />

              {/* Corner framing brackets for RHS Hand Signing Zone */}
              <path d="M 126 20 L 132 20 L 132 28" fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity="0.45" />
              <path d="M 226 20 L 232 20 L 232 28" fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity="0.45" />
              <path d="M 126 162 L 132 162 L 132 154" fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity="0.45" />
              <path d="M 224 162 L 232 162 L 232 154" fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity="0.45" />

              {/* Top Mapped Action Tuples */}
              <text
                x="66"
                y="12"
                fill="#38bdf8"
                fontSize="5.2"
                fontFamily="ui-monospace, monospace"
                fontWeight="800"
                textAnchor="middle"
                letterSpacing="0.2"
              >
                {`(:nmf :brow :${eyebrowState} :mouth "${mouthPattern || 'neutral'}")`}
              </text>
              <text
                x="175"
                y="12"
                fill="#f59e0b"
                fontSize="5.2"
                fontFamily="ui-monospace, monospace"
                fontWeight="800"
                textAnchor="middle"
                letterSpacing="0.2"
              >
                {`(:act :sign "${currentPose.letter || currentPose.label}" :shape :${domHand3D.shape || 'flat'})`}
              </text>

              {/* Bottom Mapped Coordinate & Loci Tuples */}
              <text
                x="66"
                y="173"
                fill="#64748b"
                fontSize="4.8"
                fontFamily="ui-monospace, monospace"
                fontWeight="700"
                textAnchor="middle"
              >
                {`(:loci :chin [${torsoChin.x.toFixed(0)}, ${torsoChin.y.toFixed(0)}] :tilt :${headTilt})`}
              </text>
              <text
                x="175"
                y="173"
                fill="#64748b"
                fontSize="4.8"
                fontFamily="ui-monospace, monospace"
                fontWeight="700"
                textAnchor="middle"
              >
                {`(:xyz [${Math.round(interpolatedTip.x)}, ${Math.round(interpolatedTip.y)}, ${Math.round(interpolatedTip.z)}] :base :${baseHand3D.mode})`}
              </text>
            </g>
          )}

          {cameraMode !== 'split' && cameraMode !== 'face' && (
            <text
              x="120"
              y="13"
              fill={currentPose.isWholeWordSign ? '#f59e0b' : '#38bdf8'}
              fontSize="6"
              fontWeight="800"
              textAnchor="middle"
              letterSpacing="0.4"
            >
              {currentPose.isWholeWordSign
                ? `✨ BSL SIGN • ${baseHand3D.mode === 'mirror' ? '2-HANDED MIRROR' : baseHand3D.mode === 'rest' ? '1-HANDED GESTURE' : 'CONTACT BASE'}`
                : '🔤 BANZSL MANUAL ALPHABET FINGERSPELLING'}
            </text>
          )}

          {/* UPPER TORSO & ANATOMICAL LOCI */}
          <g id="bsl-upper-torso">
            {/* Shoulders & Collar line */}
            <path
              d={`M ${torsoLeftShoulder.x} ${torsoLeftShoulder.y} Q ${torsoChest.x} ${torsoChest.y} ${torsoRightShoulder.x} ${torsoRightShoulder.y}`}
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              strokeDasharray="3 3"
              opacity="0.35"
            />
            {/* Chest Center Cross/Anchor */}
            <circle cx={torsoChest.x} cy={torsoChest.y} r={3 * torsoChest.scale} fill="#38bdf8" opacity="0.35" />
            
            {/* Head Silhouette Base with generous headroom */}
            <ellipse
              cx={torsoHead.x}
              cy={torsoHead.y}
              rx={(cameraMode === 'face' ? 24 : cameraMode === 'split' ? 16 : 19) * torsoHead.scale}
              ry={(cameraMode === 'face' ? 32 : cameraMode === 'split' ? 22 : 25) * torsoHead.scale}
              fill="rgba(15, 23, 42, 0.7)"
              stroke={eyebrowState === 'raised' ? '#38bdf8' : (eyebrowState === 'furrowed' ? '#f59e0b' : '#64748b')}
              strokeWidth={eyebrowState !== 'neutral' ? '2' : '1.3'}
            />

            {/* Chin Locus Indicator */}
            <circle cx={torsoChin.x} cy={torsoChin.y} r={(cameraMode === 'face' ? 3.5 : cameraMode === 'split' ? 2.2 : 2.5) * torsoChin.scale} fill="#94a3b8" opacity="0.6" />

            {/* BSL NON-MANUAL FEATURES (NMF) 3D FACIAL RIG */}
            {showFacialFeatures && (
              <g id="bsl-face-nmf" opacity={0.95}>
                {/* Eyebrows: Dynamic Grammatical NMF (Raised = Yes/No question, Furrowed = Wh-question) */}
                <line
                  x1={facialLandmarks.leftBrowOut.x}
                  y1={facialLandmarks.leftBrowOut.y}
                  x2={facialLandmarks.leftBrowIn.x}
                  y2={facialLandmarks.leftBrowIn.y}
                  stroke={eyebrowState === 'raised' ? '#38bdf8' : (eyebrowState === 'furrowed' ? '#f59e0b' : '#cbd5e1')}
                  strokeWidth={(cameraMode === 'face' ? 3.2 : 2.4) * torsoHead.scale}
                  strokeLinecap="round"
                />
                <line
                  x1={facialLandmarks.rightBrowIn.x}
                  y1={facialLandmarks.rightBrowIn.y}
                  x2={facialLandmarks.rightBrowOut.x}
                  y2={facialLandmarks.rightBrowOut.y}
                  stroke={eyebrowState === 'raised' ? '#38bdf8' : (eyebrowState === 'furrowed' ? '#f59e0b' : '#cbd5e1')}
                  strokeWidth={(cameraMode === 'face' ? 3.2 : 2.4) * torsoHead.scale}
                  strokeLinecap="round"
                />

                {/* Left Eye */}
                <ellipse
                  cx={facialLandmarks.leftEye.x}
                  cy={facialLandmarks.leftEye.y}
                  rx={(cameraMode === 'face' ? 3.8 : 2.8) * torsoHead.scale}
                  ry={(cameraMode === 'face' ? 2.4 : 1.8) * torsoHead.scale}
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth={cameraMode === 'face' ? '1.2' : '0.8'}
                />
                <circle
                  cx={facialLandmarks.leftEye.x}
                  cy={facialLandmarks.leftEye.y}
                  r={(cameraMode === 'face' ? 1.6 : 1.2) * torsoHead.scale}
                  fill="#38bdf8"
                />

                {/* Right Eye */}
                <ellipse
                  cx={facialLandmarks.rightEye.x}
                  cy={facialLandmarks.rightEye.y}
                  rx={(cameraMode === 'face' ? 3.8 : 2.8) * torsoHead.scale}
                  ry={(cameraMode === 'face' ? 2.4 : 1.8) * torsoHead.scale}
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth={cameraMode === 'face' ? '1.2' : '0.8'}
                />
                <circle
                  cx={facialLandmarks.rightEye.x}
                  cy={facialLandmarks.rightEye.y}
                  r={(cameraMode === 'face' ? 1.6 : 1.2) * torsoHead.scale}
                  fill="#38bdf8"
                />

                {/* Nose Bridge */}
                <line
                  x1={facialLandmarks.noseBridge.x}
                  y1={facialLandmarks.noseBridge.y}
                  x2={facialLandmarks.noseTip.x}
                  y2={facialLandmarks.noseTip.y}
                  stroke="#64748b"
                  strokeWidth={cameraMode === 'face' ? '1.6' : '1.2'}
                  strokeLinecap="round"
                  opacity="0.8"
                />

                {/* Mouth & Lips (Dynamic Mouthing Aperture & Lip Pattern) */}
                {mouthPattern ? (
                  <path
                    d={`M ${facialLandmarks.mouthLeft.x} ${facialLandmarks.mouthLeft.y} Q ${facialLandmarks.mouthCenter.x} ${facialLandmarks.mouthCenter.y + (facialLandmarks.mouthH * torsoHead.scale)} ${facialLandmarks.mouthRight.x} ${facialLandmarks.mouthRight.y}`}
                    fill="rgba(56, 189, 248, 0.28)"
                    stroke="#38bdf8"
                    strokeWidth={cameraMode === 'face' ? '2.4' : '1.8'}
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d={`M ${facialLandmarks.mouthLeft.x} ${facialLandmarks.mouthLeft.y} Q ${facialLandmarks.mouthCenter.x} ${facialLandmarks.mouthCenter.y} ${facialLandmarks.mouthRight.x} ${facialLandmarks.mouthRight.y}`}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth={cameraMode === 'face' ? '1.8' : '1.3'}
                    strokeLinecap="round"
                  />
                )}
              </g>
            )}
          </g>

          {/* Grid lines floor reference */}
          <line x1="15" y1="150" x2="225" y2="150" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <line x1="120" y1="130" x2="120" y2="160" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

          {/* NON-DOMINANT HAND (The Base / Left Hand) */}
          <g id="bsl-base-hand" opacity={0.95}>
            {/* 1. Forearm connecting to wrist */}
            <line
              x1={baseForearm.x}
              y1={baseForearm.y}
              x2={baseWrist.x}
              y2={baseWrist.y}
              stroke="#475569"
              strokeWidth="4"
              strokeLinecap="round"
              opacity={baseHand3D.mode === 'rest' ? 0.35 : 0.55}
            />

            {/* 2. Palm body polygon */}
            <polygon
              points={`${baseWrist.x},${baseWrist.y} ${baseThumbBase.x},${baseThumbBase.y} ${baseKnuckle.x},${baseKnuckle.y} ${baseKMid.x},${baseKMid.y} ${baseKRing.x},${baseKRing.y} ${baseKPinky.x},${baseKPinky.y}`}
              fill={baseHand3D.mode === 'rest' ? 'rgba(71, 85, 105, 0.12)' : 'rgba(56, 189, 248, 0.12)'}
              stroke={baseHand3D.mode === 'rest' ? 'rgba(100, 116, 139, 0.3)' : 'rgba(56, 189, 248, 0.45)'}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* 3. Wrist and Palm center */}
            <circle cx={baseWrist.x} cy={baseWrist.y} r={5 * baseWrist.scale} fill={baseHand3D.mode === 'rest' ? '#475569' : '#0284c7'} stroke="#ffffff" strokeWidth="1" />
            <circle cx={basePalm.x} cy={basePalm.y} r={4 * basePalm.scale} fill={baseHand3D.mode === 'rest' ? '#64748b' : '#38bdf8'} opacity={0.5} />

            {/* 4. Middle Finger */}
            <line x1={basePalm.x} y1={basePalm.y} x2={baseKMid.x} y2={baseKMid.y} stroke={baseHand3D.mode === 'rest' ? '#64748b' : '#38bdf8'} strokeWidth={isLeftExtended ? 3 : 2.5} strokeLinecap="round" />
            <line x1={baseKMid.x} y1={baseKMid.y} x2={baseTipMid.x} y2={baseTipMid.y} stroke={baseHand3D.mode === 'rest' ? '#475569' : isLeftExtended ? '#38bdf8' : '#0ea5e9'} strokeWidth={isLeftExtended ? 3 : 2.2} strokeLinecap="round" opacity={isLeftExtended ? 1 : 0.85} />
            <circle cx={baseKMid.x} cy={baseKMid.y} r={3.5 * baseKMid.scale} fill={baseHand3D.mode === 'rest' ? '#475569' : '#0284c7'} stroke="#ffffff" strokeWidth="0.8" />
            <circle cx={baseTipMid.x} cy={baseTipMid.y} r={(isLeftExtended ? 4.8 : 3) * baseTipMid.scale} fill={baseHand3D.mode === 'rest' ? '#64748b' : '#38bdf8'} stroke="#ffffff" strokeWidth={isLeftExtended ? 1 : 0} />

            {/* 5. Ring Finger */}
            <line x1={basePalm.x} y1={basePalm.y} x2={baseKRing.x} y2={baseKRing.y} stroke={baseHand3D.mode === 'rest' ? '#64748b' : '#38bdf8'} strokeWidth={isLeftExtended ? 3 : 2.2} strokeLinecap="round" />
            <line x1={baseKRing.x} y1={baseKRing.y} x2={baseTipRing.x} y2={baseTipRing.y} stroke={baseHand3D.mode === 'rest' ? '#475569' : isLeftExtended ? '#38bdf8' : '#0ea5e9'} strokeWidth={isLeftExtended ? 3 : 2} strokeLinecap="round" opacity={isLeftExtended ? 1 : 0.8} />
            <circle cx={baseKRing.x} cy={baseKRing.y} r={3.2 * baseKRing.scale} fill={baseHand3D.mode === 'rest' ? '#475569' : '#0284c7'} stroke="#ffffff" strokeWidth="0.8" />
            <circle cx={baseTipRing.x} cy={baseTipRing.y} r={(isLeftExtended ? 4.5 : 2.8) * baseTipRing.scale} fill={baseHand3D.mode === 'rest' ? '#64748b' : '#38bdf8'} stroke="#ffffff" strokeWidth={isLeftExtended ? 1 : 0} />

            {/* 6. Pinky Finger */}
            <line x1={basePalm.x} y1={basePalm.y} x2={baseKPinky.x} y2={baseKPinky.y} stroke={baseHand3D.mode === 'rest' ? '#64748b' : '#38bdf8'} strokeWidth={isLeftExtended ? 2.8 : 2} strokeLinecap="round" />
            <line x1={baseKPinky.x} y1={baseKPinky.y} x2={baseTipPinky.x} y2={baseTipPinky.y} stroke={baseHand3D.mode === 'rest' ? '#475569' : isLeftExtended ? '#38bdf8' : '#0ea5e9'} strokeWidth={isLeftExtended ? 2.8 : 1.8} strokeLinecap="round" opacity={isLeftExtended ? 1 : 0.75} />
            <circle cx={baseKPinky.x} cy={baseKPinky.y} r={3 * baseKPinky.scale} fill={baseHand3D.mode === 'rest' ? '#475569' : '#0284c7'} stroke="#ffffff" strokeWidth="0.8" />
            <circle cx={baseTipPinky.x} cy={baseTipPinky.y} r={(isLeftExtended ? 4 : 2.5) * baseTipPinky.scale} fill={baseHand3D.mode === 'rest' ? '#64748b' : '#38bdf8'} stroke="#ffffff" strokeWidth={isLeftExtended ? 1 : 0} />

            {/* 7. Thumb */}
            <line x1={baseThumbBase.x} y1={baseThumbBase.y} x2={baseThumbKnuckle.x} y2={baseThumbKnuckle.y} stroke={baseHand3D.mode === 'rest' ? '#64748b' : '#38bdf8'} strokeWidth="2.8" strokeLinecap="round" />
            <line x1={baseThumbKnuckle.x} y1={baseThumbKnuckle.y} x2={baseThumbTip.x} y2={baseThumbTip.y} stroke={baseHand3D.mode === 'rest' ? '#475569' : '#0ea5e9'} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={baseThumbKnuckle.x} cy={baseThumbKnuckle.y} r={3.8 * baseThumbKnuckle.scale} fill={baseHand3D.mode === 'rest' ? '#475569' : '#0284c7'} stroke="#ffffff" strokeWidth="0.8" />
            <circle cx={baseThumbTip.x} cy={baseThumbTip.y} r={3.5 * baseThumbTip.scale} fill={baseHand3D.mode === 'rest' ? '#64748b' : '#38bdf8'} stroke="#ffffff" strokeWidth="0.8" />

            {/* 8. Index Finger */}
            <line x1={basePalm.x} y1={basePalm.y} x2={baseKnuckle.x} y2={baseKnuckle.y} stroke={baseHand3D.mode === 'rest' ? '#64748b' : '#38bdf8'} strokeWidth="3.2" strokeLinecap="round" />
            <line x1={baseKnuckle.x} y1={baseKnuckle.y} x2={baseTip.x} y2={baseTip.y} stroke={baseHand3D.mode === 'rest' ? '#475569' : '#38bdf8'} strokeWidth="3" strokeLinecap="round" />
            <circle cx={baseKnuckle.x} cy={baseKnuckle.y} r={4.5 * baseKnuckle.scale} fill={baseHand3D.mode === 'rest' ? '#475569' : '#0284c7'} stroke="#ffffff" strokeWidth="1" />
            <circle cx={baseTip.x} cy={baseTip.y} r={5.2 * baseTip.scale} fill={baseHand3D.mode === 'rest' ? '#64748b' : '#38bdf8'} stroke="#ffffff" strokeWidth="1.5" />

            {/* Vowel Labels: ONLY rendered during BANZSL fingerspelling, NEVER during whole-word signs! */}
            {!currentPose.isWholeWordSign && (
              baseFingertips.map((tip) => {
                const isSelectedVowel = currentPose.activeVowelIndex === tip.idx;
                return (
                  <g key={`base-vowel-${tip.id}`}>
                    {isSelectedVowel && (
                      <circle
                        cx={tip.proj.x}
                        cy={tip.proj.y}
                        r={11 * tip.proj.scale}
                        fill="url(#bslVowelGlow)"
                        opacity="0.8"
                      />
                    )}
                    <text
                      x={tip.proj.x}
                      y={tip.proj.y - 7}
                      fill={isSelectedVowel ? '#f59e0b' : '#94a3b8'}
                      fontSize="7"
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      {tip.name || tip.id}
                    </text>
                  </g>
                );
              })
            )}
          </g>

          {/* DOMINANT HAND (The Pen - Full Anatomical Right Hand) */}
          <g id="bsl-dominant-hand">
            {/* 1. Forearm connecting to wrist */}
            <line
              x1={domForearm.x}
              y1={domForearm.y}
              x2={domWrist.x}
              y2={domWrist.y}
              stroke="#475569"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.55"
            />

            {/* 2. Palm body polygon */}
            <polygon
              points={`${domWrist.x},${domWrist.y} ${domThumbBase.x},${domThumbBase.y} ${domKnuckle.x},${domKnuckle.y} ${domKMid.x},${domKMid.y} ${domKRing.x},${domKRing.y} ${domKPinky.x},${domKPinky.y}`}
              fill="rgba(56, 189, 248, 0.12)"
              stroke="rgba(56, 189, 248, 0.45)"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* 3. Wrist and Palm center */}
            <circle cx={domWrist.x} cy={domWrist.y} r={5 * domWrist.scale} fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
            <circle cx={domPalm.x} cy={domPalm.y} r={4 * domPalm.scale} fill="#38bdf8" opacity="0.5" />

            {/* 4. Middle Finger */}
            <line x1={domPalm.x} y1={domPalm.y} x2={domKMid.x} y2={domKMid.y} stroke="#38bdf8" strokeWidth={isDomExtended ? 3 : 2.5} strokeLinecap="round" />
            <line x1={domKMid.x} y1={domKMid.y} x2={domTipMid.x} y2={domTipMid.y} stroke={isDomExtended ? '#38bdf8' : '#0ea5e9'} strokeWidth={isDomExtended ? 3 : 2.2} strokeLinecap="round" opacity={isDomExtended ? 1 : 0.85} />
            <circle cx={domKMid.x} cy={domKMid.y} r={3.5 * domKMid.scale} fill="#0284c7" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx={domTipMid.x} cy={domTipMid.y} r={(isDomExtended ? 4.8 : 3) * domTipMid.scale} fill="#38bdf8" stroke="#ffffff" strokeWidth={isDomExtended ? 1 : 0} />

            {/* 5. Ring Finger */}
            <line x1={domPalm.x} y1={domPalm.y} x2={domKRing.x} y2={domKRing.y} stroke="#38bdf8" strokeWidth={isDomExtended ? 3 : 2.2} strokeLinecap="round" />
            <line x1={domKRing.x} y1={domKRing.y} x2={domTipRing.x} y2={domTipRing.y} stroke={isDomExtended ? '#38bdf8' : '#0ea5e9'} strokeWidth={isDomExtended ? 3 : 2} strokeLinecap="round" opacity={isDomExtended ? 1 : 0.8} />
            <circle cx={domKRing.x} cy={domKRing.y} r={3.2 * domKRing.scale} fill="#0284c7" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx={domTipRing.x} cy={domTipRing.y} r={(isDomExtended ? 4.5 : 2.8) * domTipRing.scale} fill="#38bdf8" stroke="#ffffff" strokeWidth={isDomExtended ? 1 : 0} />

            {/* 6. Pinky Finger */}
            <line x1={domPalm.x} y1={domPalm.y} x2={domKPinky.x} y2={domKPinky.y} stroke="#38bdf8" strokeWidth={isDomExtended ? 2.8 : 2} strokeLinecap="round" />
            <line x1={domKPinky.x} y1={domKPinky.y} x2={domTipPinky.x} y2={domTipPinky.y} stroke={isDomExtended ? '#38bdf8' : '#0ea5e9'} strokeWidth={isDomExtended ? 2.8 : 1.8} strokeLinecap="round" opacity={isDomExtended ? 1 : 0.75} />
            <circle cx={domKPinky.x} cy={domKPinky.y} r={3 * domKPinky.scale} fill="#0284c7" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx={domTipPinky.x} cy={domTipPinky.y} r={(isDomExtended ? 4 : 2.5) * domTipPinky.scale} fill="#38bdf8" stroke="#ffffff" strokeWidth={isDomExtended ? 1 : 0} />

            {/* 7. Thumb */}
            <line x1={domThumbBase.x} y1={domThumbBase.y} x2={domThumbKnuckle.x} y2={domThumbKnuckle.y} stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" />
            <line x1={domThumbKnuckle.x} y1={domThumbKnuckle.y} x2={domThumbTip.x} y2={domThumbTip.y} stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={domThumbKnuckle.x} cy={domThumbKnuckle.y} r={3.8 * domThumbKnuckle.scale} fill="#0284c7" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx={domThumbTip.x} cy={domThumbTip.y} r={3.5 * domThumbTip.scale} fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />

            {/* 8. Active Pointer / Index Finger */}
            <line x1={domPalm.x} y1={domPalm.y} x2={domKnuckle.x} y2={domKnuckle.y} stroke="#38bdf8" strokeWidth="3.2" strokeLinecap="round" />
            <line x1={domKnuckle.x} y1={domKnuckle.y} x2={domTip.x} y2={domTip.y} stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <circle cx={domKnuckle.x} cy={domKnuckle.y} r={4.5 * domKnuckle.scale} fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
            <circle cx={domTip.x} cy={domTip.y} r={5.2 * domTip.scale} fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
            {(!currentPose.isWholeWordSign || domHand3D.shape === 'point') && (
              <circle
                cx={domTip.x}
                cy={domTip.y}
                r={10 * domTip.scale}
                fill="url(#bslTouchPulse)"
                opacity="0.85"
              />
            )}
            {/* Dynamic S-Expression Reticle mapping tuple directly to signing locus */}
            {cameraMode === 'split' && (
              <g opacity={0.85}>
                <line x1={domTip.x - 5} y1={domTip.y} x2={domTip.x + 5} y2={domTip.y} stroke="#f59e0b" strokeWidth="0.7" opacity="0.6" />
                <line x1={domTip.x} y1={domTip.y - 5} x2={domTip.x} y2={domTip.y + 5} stroke="#f59e0b" strokeWidth="0.7" opacity="0.6" />
                <text x={domTip.x + 6} y={domTip.y - 3} fill="#f59e0b" fontSize="4.4" fontFamily="ui-monospace, monospace" fontWeight="700" opacity="0.75">
                  {`[${Math.round(interpolatedTip.x)}, ${Math.round(interpolatedTip.y)}]`}
                </text>
              </g>
            )}
          </g>
        </svg>

        {/* Camera Angle & Face Focus Control Bar - Positioned at bottom floor so stage and face are 100% unobstructed */}
        <div style={{ position: 'absolute', bottom: '6px', left: '8px', display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setViewAngle((prev) => (prev === 'signer' ? 'receiver' : 'signer'))}
            style={stageBtnStyle}
            title="Toggle between Signer POV (first-person) and Receiver POV (conversation partner)"
          >
            <span>{viewAngle === 'signer' ? '👤 Signer' : '👥 Receiver'}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setCameraMode((prev) =>
                prev === 'split' ? 'body' : prev === 'body' ? 'face' : 'split'
              )
            }
            style={{
              ...stageBtnStyle,
              background: cameraMode === 'split' ? 'rgba(56, 189, 248, 0.28)' : cameraMode === 'face' ? 'rgba(245, 158, 11, 0.28)' : 'rgba(15, 23, 42, 0.85)',
              borderColor: cameraMode === 'split' ? '#38bdf8' : cameraMode === 'face' ? '#f59e0b' : 'rgba(56, 189, 248, 0.3)',
              color: cameraMode === 'split' ? '#38bdf8' : cameraMode === 'face' ? '#f59e0b' : '#e2e8f0',
            }}
            title="Cycle views: Dual Split (Face LHS + Hands RHS with Mapped Tuples), Center Unified Body, or Face Focus"
          >
            <span>
              {cameraMode === 'split'
                ? '⚖️ Dual: Face+Hands'
                : cameraMode === 'face'
                ? '🔍 Face Focus'
                : '👤 Center Body'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowFacialFeatures((prev) => !prev)}
            style={{
              ...stageBtnStyle,
              background: showFacialFeatures ? 'rgba(56, 189, 248, 0.18)' : 'rgba(15, 23, 42, 0.85)',
              borderColor: showFacialFeatures ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)',
              color: showFacialFeatures ? '#38bdf8' : '#94a3b8',
            }}
            title="Toggle 3D Non-Manual Facial Features (Eyebrows, Eyes, Lip Patterns, Head Tilts)"
          >
            <span>{showFacialFeatures ? '😊 Face: ON' : '😶 Face: OFF'}</span>
          </button>
        </div>

        {/* Orbit Hint badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '6px',
            right: '8px',
            fontSize: '0.6rem',
            color: '#64748b',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '1px 5px',
            borderRadius: '4px',
            pointerEvents: 'none',
          }}
        >
          Drag 3D Orbit
        </div>
      </div>

      {/* On-Screen 3D Camera Pan / Orbit Control Pad */}
      {showPanControls && (
        <div
          style={{
            padding: '6px 10px',
            background: 'rgba(15, 23, 42, 0.98)',
            borderTop: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* D-Pad Orbit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ fontSize: '0.62rem', color: '#94a3b8', marginRight: '2px' }}>Orbit:</span>
            <button
              type="button"
              onClick={() => setOrbitOffset((p) => ({ ...p, pitch: Math.min(75, p.pitch + 12) }))}
              title="Tilt Camera Up"
              style={panBtnStyle}
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => setOrbitOffset((p) => ({ ...p, pitch: Math.max(-75, p.pitch - 12) }))}
              title="Tilt Camera Down"
              style={panBtnStyle}
            >
              ▼
            </button>
            <button
              type="button"
              onClick={() => setOrbitOffset((p) => ({ ...p, yaw: p.yaw - 15 }))}
              title="Orbit Camera Left"
              style={panBtnStyle}
            >
              ◀
            </button>
            <button
              type="button"
              onClick={() => setOrbitOffset((p) => ({ ...p, yaw: p.yaw + 15 }))}
              title="Orbit Camera Right"
              style={panBtnStyle}
            >
              ▶
            </button>
          </div>

          {/* Zoom and Reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <button
              type="button"
              onClick={() => setOrbitOffset((p) => ({ ...p, distanceDelta: Math.max(-160, p.distanceDelta - 30) }))}
              title="Zoom In (+)"
              style={panBtnStyle}
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setOrbitOffset((p) => ({ ...p, distanceDelta: Math.min(260, p.distanceDelta + 30) }))}
              title="Zoom Out (-)"
              style={panBtnStyle}
            >
              -
            </button>
            <button
              type="button"
              onClick={() => setOrbitOffset({ yaw: 0, pitch: 0, distanceDelta: 0, panX: 0, panY: 0 })}
              title="Reset 3D Camera Orbit & Pan"
              style={{ ...panBtnStyle, color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
            >
              ⟲ Reset
            </button>
          </div>
        </div>
      )}

      {/* Rule & Kinematic Description */}
      <div
        style={{
          padding: '6px 10px',
          background: 'rgba(15, 23, 42, 0.98)',
          borderTop: '1px solid rgba(56, 189, 248, 0.15)',
          fontSize: '0.68rem',
          color: '#cbd5e1',
          lineHeight: 1.3,
          minHeight: '32px',
        }}
      >
        <strong style={{ color: '#38bdf8' }}>BSL Rule: </strong>
        {currentPose.rule || 'Hands in neutral rest position ready for narration stream.'}
      </div>

      {/* Quick BSL Curriculum Signs Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(56, 189, 248, 0.1)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#38bdf8', whiteSpace: 'nowrap', paddingRight: '2px' }}>
          Signs:
        </span>
        {availableSigns.map((s) => (
          <button
            key={s.word}
            type="button"
            onClick={() => enqueueWord(s.word)}
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '4px',
              color: '#e2e8f0',
              padding: '1px 6px',
              fontSize: '0.62rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
            title={`Play BSL whole-word sign: ${s.word}`}
          >
            {s.label}
          </button>
        ))}

        {/* Hidden file input for runtime .ast sign import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".ast,.lisp,.txt"
          onChange={handleImportAstFile}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: importNotice ? 'rgba(34, 197, 94, 0.25)' : 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${importNotice ? '#22c55e' : 'rgba(245, 158, 11, 0.4)'}`,
            borderRadius: '4px',
            color: importNotice ? '#4ade80' : '#fbbf24',
            padding: '1px 6px',
            fontSize: '0.62rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
          title="Import custom signs from any .ast S-Expression file"
        >
          {importNotice ? `✓ ${importNotice}` : '📂 Import .ast'}
        </button>
      </div>

      {/* Speed & Quick Input Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          background: 'rgba(30, 41, 59, 0.65)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '0.68rem',
        }}
      >
        {/* Speed pills and Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={() => {
              setGrammarMode((m) => {
                const next = m === 'bsl-natural' ? 'sse' : m === 'sse' ? 'fingerspell' : 'bsl-natural';
                if (activeWordDisplay) {
                  enqueueText(activeWordDisplay, next);
                }
                return next;
              });
            }}
            style={{
              background:
                grammarMode === 'bsl-natural'
                  ? 'rgba(16, 185, 129, 0.22)'
                  : grammarMode === 'sse'
                  ? 'rgba(245, 158, 11, 0.22)'
                  : 'rgba(56, 189, 248, 0.22)',
              border: `1px solid ${
                grammarMode === 'bsl-natural' ? '#10b981' : grammarMode === 'sse' ? '#f59e0b' : '#38bdf8'
              }`,
              borderRadius: '4px',
              color: grammarMode === 'bsl-natural' ? '#6ee7b7' : grammarMode === 'sse' ? '#fbbf24' : '#38bdf8',
              padding: '1px 6px',
              fontSize: '0.62rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
            title="Cycle Syntax: Natural BSL (Level 2/3 Topic-Comment & Directional) -> SSE (Sign Supported English) -> BANZSL Fingerspelling"
          >
            {grammarMode === 'bsl-natural' ? '🤟 Level 2/3 BSL' : grammarMode === 'sse' ? '📝 SSE L1' : '🔤 Fingerspell'}
          </button>

          <span style={{ color: '#94a3b8', fontSize: '0.62rem', marginLeft: '2px' }}>Speed:</span>
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
                padding: '1px 4px',
                fontSize: '0.6rem',
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
            placeholder="Sign word/phrase..."
            maxLength={60}
            style={{
              width: '95px',
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
              padding: '2px 7px',
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

  return typeof document !== 'undefined' && document.body
    ? createPortal(overlayWindow, document.body)
    : overlayWindow;
};

export default BslInterpreterOverlay;
