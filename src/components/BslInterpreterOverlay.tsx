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
  solveHandKinematics,
  evaluateBslEase,
} from '../utils/bslAlphabet';
import {
  decomposeTextToBslStreamWithLexicon,
  lookupBslSign,
  BSL_CURRICULUM_LEXICON,
  registerBslSigns,
  MAKATON_CORE_STAGES,
  getMakatonSigns,
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
  openBslSignStudio,
  subscribeLanguageTuple,
  setSignLanguage,
  getLanguageTuple,
} from '../services/bslGlobalStore';
import '../utils/ast3dWasmBridge'; // Auto-boots WebAssembly 3D Kernel
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
  { label: '🍽️ Eat', word: 'EAT' },
  { label: '🥤 Drink', word: 'DRINK' },
  { label: '🚻 Toilet', word: 'TOILET' },
  { label: '🛏️ Bed', word: 'BED' },
  { label: '👩 Mum', word: 'MUM' },
  { label: '👨 Dad', word: 'DAD' },
  { label: '🏠 Home', word: 'HOME' },
  { label: '🎮 Play', word: 'PLAY' },
  { label: '👀 Look', word: 'LOOK' },
  { label: '👂 Listen', word: 'LISTEN' },
  { label: '⏳ Wait', word: 'WAIT' },
  { label: '❤️ Like', word: 'LIKE' },
  { label: '🧼 Wash', word: 'WASH' },
  { label: '🚶 Walk', word: 'WALK' },
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
  const [selectedMakatonStage, setSelectedMakatonStage] = useState<'all' | number>('all');
  const [showGrammarInspector, setShowGrammarInspector] = useState<boolean>(false);
  const [grammarAnalysis, setGrammarAnalysis] = useState<BslGrammarAnalysis | null>(null);
  const [customInput, setCustomInput] = useState<string>('');
  const [isPipActive, setIsPipActive] = useState<boolean>(false);
  const [showPanControls, setShowPanControls] = useState<boolean>(false);
  const [showFacialFeatures, setShowFacialFeatures] = useState<boolean>(true);
  const [avatarSkinMode, setAvatarSkinMode] = useState<'human' | 'skeleton'>(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        return (localStorage.getItem('stj_bsl_skin_mode') as 'human' | 'skeleton') || 'human';
      }
    } catch (_) {}
    return 'human';
  });
  const [importNotice, setImportNotice] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [availableSigns, setAvailableSigns] = useState<{ label: string; word: string }[]>(() => {
    return Object.values(BSL_CURRICULUM_LEXICON).map((s) => ({
      label: s.englishLabel || s.word,
      word: s.word,
    }));
  });

  const displaySigns = useMemo(() => {
    if (selectedMakatonStage === 'all') return availableSigns;
    const stageSigns = new Set(getMakatonSigns(selectedMakatonStage).map((s) => s.word));
    return availableSigns.filter((s) => stageSigns.has(s.word));
  }, [availableSigns, selectedMakatonStage]);

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

  // Synchronize with Global Language Tuple from UniversalTranslatorBar (e.g. ['en', 'MAKATON'] vs ['en', 'BSL'])
  useEffect(() => {
    const [, currentSign] = getLanguageTuple();
    if (currentSign === 'MAKATON') {
      setGrammarMode('makaton');
    }
    const unsubscribeTuple = subscribeLanguageTuple(([, sgn]) => {
      if (sgn === 'MAKATON') {
        setGrammarMode('makaton');
      } else if (sgn === 'BSL') {
        setGrammarMode('bsl-natural');
      }
    });
    return unsubscribeTuple;
  }, []);

  // Active signing state
  const [currentLetter, setCurrentLetter] = useState<string>('');
  const [currentPose, setCurrentPose] = useState<BslHandPose>(REST_POSE);
  const [prevPose, setPrevPose] = useState<BslHandPose>(REST_POSE);
  const [transitionProgress, setTransitionProgress] = useState<number>(1);
  const [activeWordDisplay, setActiveWordDisplay] = useState<string>('');

  // Zero-bloat procedural blink timer (closes eyelids for ~130ms every 3.5-5.5s)
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  useEffect(() => {
    let timeoutId: any;
    let blinkTimeoutId: any;
    const scheduleNextBlink = () => {
      const nextDelay = 3400 + Math.random() * 2200;
      timeoutId = setTimeout(() => {
        setIsBlinking(true);
        blinkTimeoutId = setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 130);
      }, nextDelay);
    };
    scheduleNextBlink();
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(blinkTimeoutId);
    };
  }, []);

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

  // Kinematic render loop (60 FPS Hermite interpolation with hold dwell & ease curves)
  useEffect(() => {
    let t = 1;
    let fromPose = REST_POSE;
    let toPose = REST_POSE;
    let holdRemainingSec = 0;

    const frameStep = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Stationary dwell time at keyframe before interpolating (:hold <ms>)
      if (holdRemainingSec > 0) {
        holdRemainingSec -= dt;
        animFrameRef.current = requestAnimationFrame(frameStep);
        return;
      }

      const duration = 0.36 / speedMultiplier;
      t += dt / duration;

      if (t >= 1) {
        t = 1;
        if (queueRef.current.length > 0) {
          const next = queueRef.current.shift()!;
          fromPose = toPose;
          toPose = next;
          t = 0;
          if (toPose.hold && toPose.hold > 0) {
            holdRemainingSec = (toPose.hold / 1000) / speedMultiplier;
          }
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

  // Easing profile evaluation (:snap, :ease-out, :linear, :bounce)
  const easedProgress = useMemo(() => {
    return evaluateBslEase(currentPose.ease, transitionProgress);
  }, [currentPose.ease, transitionProgress]);

  // Current interpolated dominant pointer points
  const interpolatedTip: Point3D = useMemo(() => {
    return interpolatePoint3D(prevPose.targetTip, currentPose.targetTip, easedProgress);
  }, [prevPose.targetTip, currentPose.targetTip, easedProgress]);

  const interpolatedKnuckle: Point3D = useMemo(() => {
    return interpolatePoint3D(prevPose.targetKnuckle, currentPose.targetKnuckle, easedProgress);
  }, [prevPose.targetKnuckle, currentPose.targetKnuckle, easedProgress]);

  const interpolatedWrist: Point3D = useMemo(() => {
    return interpolatePoint3D(prevPose.targetWrist, currentPose.targetWrist, easedProgress);
  }, [prevPose.targetWrist, currentPose.targetWrist, easedProgress]);

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

      let px = pt.x;
      let py = pt.y;
      let pz = pt.z;

      // Level 6 Constructed Action / Role Shift Torso Yaw Rotation
      const roleYaw = currentPose?.nmf?.roleShift?.yaw;
      if (roleYaw) {
        const rad = (roleYaw * Math.PI) / 180;
        const cosY = Math.cos(rad);
        const sinY = Math.sin(rad);
        const rx = px * cosY + pz * sinY;
        const rz = -px * sinY + pz * cosY;
        px = rx;
        pz = rz;
      }

      return project3DToSvg({ x: px, y: py - yShift, z: pz - zShift }, cameraConfig, ox, oy);
    },
    [cameraMode, headCenter3D.y, headCenter3D.z, cameraConfig, orbitOffset.panX, orbitOffset.panY, currentPose?.nmf?.roleShift?.yaw]
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
  // Anatomically proportioned upper torso & shoulders (neck length ~ 1/3 head height, natural downward trapezius slope)
  const torsoChest = useMemo(() => projPointBody({ x: 0, y: -24, z: -15 }), [projPointBody]);
  const torsoLeftShoulder = useMemo(
    () => projPointBody({ x: cameraMode === 'split' ? -38 : -56, y: -15, z: -20 }),
    [projPointBody, cameraMode]
  );
  const torsoRightShoulder = useMemo(
    () => projPointBody({ x: cameraMode === 'split' ? 38 : 56, y: -15, z: -20 }),
    [projPointBody, cameraMode]
  );

  // Screen-space shoulder anchors (ensures stable viewer-left and viewer-right orientation across all orbit yaw angles)
  const shoulderViewerLeft = useMemo(() => {
    return torsoLeftShoulder.x <= torsoRightShoulder.x ? torsoLeftShoulder : torsoRightShoulder;
  }, [torsoLeftShoulder, torsoRightShoulder]);

  const shoulderViewerRight = useMemo(() => {
    return torsoLeftShoulder.x > torsoRightShoulder.x ? torsoLeftShoulder : torsoRightShoulder;
  }, [torsoLeftShoulder, torsoRightShoulder]);

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
    if (lowerMouth === 'mm') {
      // Adverbial: ordinary, steady, effortless
      mouthW = cameraMode === 'face' ? 7.2 : 5.4;
      mouthH = 0.8;
      mouthCurvature = 0.3;
    } else if (lowerMouth === 'th') {
      // Adverbial: careless, accidental, relaxed
      mouthW = cameraMode === 'face' ? 6.5 : 4.8;
      mouthH = 3.2;
      mouthCurvature = -0.4;
    } else if (lowerMouth === 'pursed') {
      // Adverbial: exact, precise, deliberate
      mouthW = cameraMode === 'face' ? 3.4 : 2.6;
      mouthH = 3.4;
      mouthCurvature = 0;
    } else if (lowerMouth === 'puffed-cheeks') {
      // Adverbial: vast, massive, strenuous
      mouthW = cameraMode === 'face' ? 4.8 : 3.6;
      mouthH = 4.2;
      mouthCurvature = 0;
    } else if (lowerMouth === 'tight-lips') {
      // Adverbial: determined, restricted
      mouthW = cameraMode === 'face' ? 8.8 : 6.8;
      mouthH = 0.5;
      mouthCurvature = -0.3;
    } else if (lowerMouth === 'f-mouth') {
      // Adverbial: focused, intense
      mouthW = cameraMode === 'face' ? 6.0 : 4.5;
      mouthH = 2.0;
      mouthCurvature = 0.8;
    } else if (lowerMouth.includes('o') || lowerMouth.includes('u')) {
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

  // Project dominant hand (The Pen) complete anatomical landmarks with dynamic shape solving & palm axial roll
  const domHand3D = useMemo(() => {
    const w = interpolatedWrist;
    const k = interpolatedKnuckle;
    const t = interpolatedTip;
    const shape = currentPose.shape || prevPose.shape || 'flat-closed';
    const palm = currentPose.palm || prevPose.palm || 'in';

    return solveHandKinematics(w, k, t, shape, palm);
  }, [interpolatedWrist, interpolatedKnuckle, interpolatedTip, currentPose.shape, prevPose.shape, currentPose.palm, prevPose.palm]);

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
                {currentPose.isWholeWordSign ? (grammarMode === 'makaton' ? 'Makaton Keyword Sign' : 'BSL Concept Sign') : 'BANZSL Fingerspelling'}
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

            {/* Respectful Stylized Human Skin Gradients (Warm Natural Tone with Ambient Lighting) */}
            <linearGradient id="bslHumanSkin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef0e6" />
              <stop offset="35%" stopColor="#f8d7c2" />
              <stop offset="75%" stopColor="#ebbda1" />
              <stop offset="100%" stopColor="#d5997a" />
            </linearGradient>

            <linearGradient id="bslHumanSkinPalm" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff6ef" />
              <stop offset="50%" stopColor="#fae1d1" />
              <stop offset="100%" stopColor="#ecc4aa" />
            </linearGradient>

            <linearGradient id="bslHumanSkinBack" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f8d7c2" />
              <stop offset="100%" stopColor="#d59a7c" />
            </linearGradient>

            {/* Sub-mandibular ambient neck shadow */}
            <linearGradient id="bslJawShadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b46e50" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#b46e50" stopOpacity="0" />
            </linearGradient>

            {/* Fleshy Thenar & Hypothenar Palm Eminence Cushion */}
            <radialGradient id="bslPalmEminence" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fff8f4" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#fde4d4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f8d7c2" stopOpacity="0" />
            </radialGradient>

            {/* Realistic Hazel/Slate Iris with Deep Limbal Ring */}
            <radialGradient id="bslIrisGradient" cx="35%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="45%" stopColor="#334155" />
              <stop offset="85%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </radialGradient>

            {/* Natural Lip Contours & Vermilion Border */}
            <linearGradient id="bslLipUpper" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#be5d69" />
              <stop offset="100%" stopColor="#993844" />
            </linearGradient>
            <linearGradient id="bslLipLower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8929c" />
              <stop offset="45%" stopColor="#df7a86" />
              <stop offset="100%" stopColor="#b34956" />
            </linearGradient>

            {/* Layered Hair Volume Gradients */}
            <linearGradient id="bslHairVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="35%" stopColor="#293548" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="bslHairFront" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#55657e" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Standard BSL Professional Attire (Contrasting Matte Dark Navy Top) */}
            <linearGradient id="bslInterpreterTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#243044" />
              <stop offset="40%" stopColor="#151e2e" />
              <stop offset="100%" stopColor="#0b111c" />
            </linearGradient>

            {/* Faint Dorsal Fingernail Translucency */}
            <linearGradient id="bslNailGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#faeae2" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#eec8b5" stopOpacity="0.7" />
            </linearGradient>

            {/* Soft Ambient Depth Filter */}
            <filter id="bslSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.3" />
            </filter>
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

              {/* Top Mapped Action Tuples with Explicit Language Tuples */}
              <text
                x="66"
                y="12"
                fill={grammarMode === 'makaton' ? '#c084fc' : '#38bdf8'}
                fontSize="5.2"
                fontFamily="ui-monospace, monospace"
                fontWeight="800"
                textAnchor="middle"
                letterSpacing="0.2"
              >
                {grammarMode === 'makaton'
                  ? `(:tuple [:en :makaton] :brow :${eyebrowState} :mouth "${mouthPattern || 'neutral'}")`
                  : `(:tuple [:en :bsl] :brow :${eyebrowState} :mouth "${mouthPattern || 'neutral'}")`}
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
                {currentPose.classifier
                  ? `(:cl :type "${currentPose.classifier.type}" :aspect :${currentPose.aspect || currentPose.classifier.aspect || 'neutral'} :shape :${domHand3D.shape || 'flat'})`
                  : grammarMode === 'makaton'
                  ? `(:act :keyword "${currentPose.letter?.split(' ')[0] || currentPose.label}" :shape :${domHand3D.shape || 'flat'})`
                  : `(:act :sign "${currentPose.letter || currentPose.label}" :shape :${domHand3D.shape || 'flat'})`}
              </text>

              {/* Bottom Mapped Coordinate & Loci Tuples */}
              <text
                x="66"
                y="173"
                fill={currentPose.nmf?.roleShift ? '#f43f5e' : '#64748b'}
                fontSize="4.8"
                fontFamily="ui-monospace, monospace"
                fontWeight="700"
                textAnchor="middle"
              >
                {currentPose.nmf?.roleShift
                  ? `(:shift :agent "${currentPose.nmf.roleShift.agent}" :yaw ${currentPose.nmf.roleShift.yaw > 0 ? '+' : ''}${currentPose.nmf.roleShift.yaw}°)`
                  : `(:loci :chin [${torsoChin.x.toFixed(0)}, ${torsoChin.y.toFixed(0)}] :tilt :${headTilt})`}
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
              fill={currentPose.classifier ? '#10b981' : currentPose.isWholeWordSign ? '#f59e0b' : '#38bdf8'}
              fontSize="6"
              fontWeight="800"
              textAnchor="middle"
              letterSpacing="0.4"
            >
              {currentPose.classifier
                ? `🌐 BSL CLASSIFIER • ${currentPose.classifier.type.toUpperCase()}${currentPose.aspect ? ` [${currentPose.aspect.toUpperCase()}]` : ''}`
                : currentPose.isWholeWordSign
                ? grammarMode === 'makaton'
                  ? `🤝 MAKATON • ${currentPose.label.includes('Stage') ? currentPose.label.split('•')[0].trim().toUpperCase() : 'CORE STAGE 1-4'} KEYWORD`
                  : `✨ BSL SIGN • ${baseHand3D.mode === 'mirror' ? '2-HANDED MIRROR' : baseHand3D.mode === 'rest' ? '1-HANDED GESTURE' : 'CONTACT BASE'}`
                : '🔤 BANZSL MANUAL ALPHABET FINGERSPELLING'}
            </text>
          )}

          {/* UPPER TORSO & ANATOMICAL LOCI */}
          <g id="bsl-upper-torso">
            {avatarSkinMode === 'human' ? (
              <g id="bsl-human-torso-head">
                {/* 1. Realistic Compact Anatomical Neck Column with Sternocleidomastoid Contours */}
                {(() => {
                  const s = torsoHead.scale;
                  const neckHalfW = 8.8 * s;
                  const neckLeftX = torsoHead.x - neckHalfW;
                  const neckRightX = torsoHead.x + neckHalfW;
                  const neckBaseY = torsoChest.y + 1.5 * s;
                  const neckTopY = torsoChin.y - 1.5 * s;

                  return (
                    <>
                      <path
                        d={`M ${neckLeftX} ${neckTopY}
                            L ${neckLeftX - 1.2 * s} ${neckBaseY}
                            L ${neckRightX + 1.2 * s} ${neckBaseY}
                            L ${neckRightX} ${neckTopY} Z`}
                        fill="url(#bslHumanSkin)"
                        stroke="#d59a7c"
                        strokeWidth="0.8"
                      />
                      {/* Sub-mandibular ambient neck shadow right under jawline */}
                      <path
                        d={`M ${neckLeftX} ${neckTopY}
                            Q ${torsoChin.x} ${torsoChin.y + 3.2 * s} ${neckRightX} ${neckTopY}
                            L ${neckRightX + 0.6 * s} ${torsoChin.y + 4.5 * s}
                            Q ${torsoChin.x} ${torsoChin.y + 7.5 * s} ${neckLeftX - 0.6 * s} ${torsoChin.y + 4.5 * s} Z`}
                        fill="url(#bslJawShadow)"
                      />

                      {/* 2. Professional Interpreter Top with sculpted trapezius slope and rounded shoulder caps */}
                      <path
                        d={`M ${shoulderViewerLeft.x - 4 * s} 180
                            L ${shoulderViewerLeft.x - 3 * s} ${shoulderViewerLeft.y + 12 * s}
                            Q ${shoulderViewerLeft.x - 2 * s} ${shoulderViewerLeft.y} ${shoulderViewerLeft.x + 4 * s} ${shoulderViewerLeft.y}
                            Q ${neckLeftX - 4 * s} ${neckBaseY + 1 * s} ${neckLeftX} ${neckBaseY}
                            Q ${torsoHead.x} ${neckBaseY + 6.5 * s} ${neckRightX} ${neckBaseY}
                            Q ${neckRightX + 4 * s} ${neckBaseY + 1 * s} ${shoulderViewerRight.x - 4 * s} ${shoulderViewerRight.y}
                            Q ${shoulderViewerRight.x + 2 * s} ${shoulderViewerRight.y} ${shoulderViewerRight.x + 3 * s} ${shoulderViewerRight.y + 12 * s}
                            L ${shoulderViewerRight.x + 4 * s} 180 Z`}
                        fill="url(#bslInterpreterTop)"
                        stroke="#334155"
                        strokeWidth="1.2"
                      />

                      {/* Anatomical Clavicle / Collarbone Accents branching to each shoulder */}
                      <path
                        d={`M ${torsoHead.x - 2.5 * s} ${neckBaseY + 7 * s}
                            Q ${torsoHead.x - 14 * s} ${neckBaseY + 5.5 * s} ${shoulderViewerLeft.x + 10 * s} ${shoulderViewerLeft.y + 3 * s}`}
                        fill="none"
                        stroke="#d59a7c"
                        strokeWidth={1.0 * s}
                        strokeLinecap="round"
                        opacity={0.6}
                      />
                      <path
                        d={`M ${torsoHead.x + 2.5 * s} ${neckBaseY + 7 * s}
                            Q ${torsoHead.x + 14 * s} ${neckBaseY + 5.5 * s} ${shoulderViewerRight.x - 10 * s} ${shoulderViewerRight.y + 3 * s}`}
                        fill="none"
                        stroke="#d59a7c"
                        strokeWidth={1.0 * s}
                        strokeLinecap="round"
                        opacity={0.6}
                      />

                      {/* Professional Crew Collar with layered neckband ribbing */}
                      <path
                        d={`M ${neckLeftX - 1 * s} ${neckBaseY - 1 * s}
                            Q ${torsoHead.x} ${neckBaseY + 6.5 * s} ${neckRightX + 1 * s} ${neckBaseY - 1 * s}`}
                        fill="none"
                        stroke="#475569"
                        strokeWidth={1.6 * s}
                        strokeLinecap="round"
                      />
                      <path
                        d={`M ${neckLeftX} ${neckBaseY + 1 * s}
                            Q ${torsoHead.x} ${neckBaseY + 8.5 * s} ${neckRightX} ${neckBaseY + 1 * s}`}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth={1.1 * s}
                        strokeLinecap="round"
                        opacity={0.8}
                      />

                      {/* Fabric Sleeves connecting seamlessly to forearm limbs */}
                      {cameraMode === 'split' ? (
                        <>
                          <line
                            x1={shoulderViewerLeft.x}
                            y1={shoulderViewerLeft.y + 4 * s}
                            x2={shoulderViewerLeft.x - 4 * s}
                            y2={180}
                            stroke="#1e293b"
                            strokeWidth={11 * s}
                            strokeLinecap="round"
                          />
                          <line
                            x1={shoulderViewerRight.x}
                            y1={shoulderViewerRight.y + 4 * s}
                            x2={shoulderViewerRight.x + 4 * s}
                            y2={180}
                            stroke="#1e293b"
                            strokeWidth={11 * s}
                            strokeLinecap="round"
                          />
                        </>
                      ) : (
                        <>
                          {/* Dominant Upper Arm Sleeve (Right Shoulder to Dominant Forearm) */}
                          <path
                            d={`M ${torsoRightShoulder.x} ${torsoRightShoulder.y + 3 * s}
                                Q ${torsoRightShoulder.x * 0.7 + domForearm.x * 0.3 - 6 * s} ${Math.max(torsoRightShoulder.y + 16 * s, (torsoRightShoulder.y + domForearm.y) * 0.5 + 12 * s)} ${domForearm.x} ${domForearm.y}`}
                            fill="none"
                            stroke="#1e293b"
                            strokeWidth={11 * s}
                            strokeLinecap="round"
                          />
                          {/* Base Upper Arm Sleeve (Left Shoulder to Base Forearm) */}
                          <path
                            d={`M ${torsoLeftShoulder.x} ${torsoLeftShoulder.y + 3 * s}
                                Q ${torsoLeftShoulder.x * 0.7 + baseForearm.x * 0.3 + 6 * s} ${Math.max(torsoLeftShoulder.y + 16 * s, (torsoLeftShoulder.y + baseForearm.y) * 0.5 + 12 * s)} ${baseForearm.x} ${baseForearm.y}`}
                            fill="none"
                            stroke="#1e293b"
                            strokeWidth={11 * s}
                            strokeLinecap="round"
                          />
                        </>
                      )}
                    </>
                  );
                })()}

                {/* 3. Left & Right Ears with Anatomical Concha Folds */}
                <g id="bsl-ears">
                  {/* Left Ear */}
                  <ellipse
                    cx={torsoHead.x - (cameraMode === 'face' ? 24 : cameraMode === 'split' ? 16 : 19) * torsoHead.scale}
                    cy={torsoHead.y}
                    rx={3.6 * torsoHead.scale}
                    ry={5.8 * torsoHead.scale}
                    fill="url(#bslHumanSkin)"
                    stroke="#cf9c80"
                    strokeWidth="0.8"
                  />
                  <path
                    d={`M ${torsoHead.x - (cameraMode === 'face' ? 24 : cameraMode === 'split' ? 16 : 19) * torsoHead.scale} ${torsoHead.y - 2.5 * torsoHead.scale}
                        Q ${torsoHead.x - (cameraMode === 'face' ? 25.5 : cameraMode === 'split' ? 17.5 : 20.5) * torsoHead.scale} ${torsoHead.y} ${torsoHead.x - (cameraMode === 'face' ? 24 : cameraMode === 'split' ? 16 : 19) * torsoHead.scale} ${torsoHead.y + 2.5 * torsoHead.scale}`}
                    fill="none"
                    stroke="#b46e50"
                    strokeWidth={0.8 * torsoHead.scale}
                    strokeLinecap="round"
                    opacity={0.65}
                  />

                  {/* Right Ear */}
                  <ellipse
                    cx={torsoHead.x + (cameraMode === 'face' ? 24 : cameraMode === 'split' ? 16 : 19) * torsoHead.scale}
                    cy={torsoHead.y}
                    rx={3.6 * torsoHead.scale}
                    ry={5.8 * torsoHead.scale}
                    fill="url(#bslHumanSkin)"
                    stroke="#cf9c80"
                    strokeWidth="0.8"
                  />
                  <path
                    d={`M ${torsoHead.x + (cameraMode === 'face' ? 24 : cameraMode === 'split' ? 16 : 19) * torsoHead.scale} ${torsoHead.y - 2.5 * torsoHead.scale}
                        Q ${torsoHead.x + (cameraMode === 'face' ? 25.5 : cameraMode === 'split' ? 17.5 : 20.5) * torsoHead.scale} ${torsoHead.y} ${torsoHead.x + (cameraMode === 'face' ? 24 : cameraMode === 'split' ? 16 : 19) * torsoHead.scale} ${torsoHead.y + 2.5 * torsoHead.scale}`}
                    fill="none"
                    stroke="#b46e50"
                    strokeWidth={0.8 * torsoHead.scale}
                    strokeLinecap="round"
                    opacity={0.65}
                  />
                </g>

                {/* 4. Cranial Dome & Contoured Mandible Jawline */}
                {(() => {
                  const s = torsoHead.scale;
                  const headRx = (cameraMode === 'face' ? 24 : cameraMode === 'split' ? 16 : 19) * s;
                  const headRy = (cameraMode === 'face' ? 32 : cameraMode === 'split' ? 22 : 25) * s;
                  return (
                    <g id="bsl-head-contour">
                      {/* Contoured Cranium & Jaw Tapering to Chin */}
                      <path
                        d={`M ${torsoHead.x - headRx} ${torsoHead.y - headRy * 0.1}
                            C ${torsoHead.x - headRx} ${torsoHead.y - headRy * 1.08} ${torsoHead.x + headRx} ${torsoHead.y - headRy * 1.08} ${torsoHead.x + headRx} ${torsoHead.y - headRy * 0.1}
                            C ${torsoHead.x + headRx * 0.98} ${torsoHead.y + headRy * 0.45} ${torsoHead.x + headRx * 0.55} ${torsoChin.y} ${torsoChin.x} ${torsoChin.y + 0.5}
                            C ${torsoHead.x - headRx * 0.55} ${torsoChin.y} ${torsoHead.x - headRx * 0.98} ${torsoHead.y + headRy * 0.45} ${torsoHead.x - headRx} ${torsoHead.y - headRy * 0.1} Z`}
                        fill="url(#bslHumanSkin)"
                        stroke="#d49f82"
                        strokeWidth="1.2"
                        filter="url(#bslSoftGlow)"
                      />

                      {/* Gentle Cheek Warmth & Malar Volume */}
                      <ellipse cx={torsoHead.x - headRx * 0.52} cy={torsoHead.y + headRy * 0.12} rx={5 * s} ry={3.5 * s} fill="#f43f5e" opacity="0.08" />
                      <ellipse cx={torsoHead.x + headRx * 0.52} cy={torsoHead.y + headRy * 0.12} rx={5 * s} ry={3.5 * s} fill="#f43f5e" opacity="0.08" />

                      {/* 5. Layered Volumetric Hair Architecture */}
                      {/* Back Volume Base */}
                      <path
                        d={`M ${torsoHead.x - headRx * 1.05} ${torsoHead.y - headRy * 0.05}
                            C ${torsoHead.x - headRx * 1.08} ${torsoHead.y - headRy * 1.18} ${torsoHead.x + headRx * 1.08} ${torsoHead.y - headRy * 1.18} ${torsoHead.x + headRx * 1.05} ${torsoHead.y - headRy * 0.05}
                            Q ${torsoHead.x} ${torsoHead.y - headRy * 0.35} ${torsoHead.x - headRx * 1.05} ${torsoHead.y - headRy * 0.05} Z`}
                        fill="url(#bslHairVolume)"
                      />
                      {/* Forehead Ambient Occlusion Shadow below Hairline */}
                      <path
                        d={`M ${torsoHead.x - headRx * 0.9} ${torsoHead.y - headRy * 0.25}
                            Q ${torsoHead.x} ${torsoHead.y - headRy * 0.45} ${torsoHead.x + headRx * 0.9} ${torsoHead.y - headRy * 0.25}
                            Q ${torsoHead.x} ${torsoHead.y - headRy * 0.35} ${torsoHead.x - headRx * 0.9} ${torsoHead.y - headRy * 0.25} Z`}
                        fill="rgba(15, 23, 42, 0.18)"
                      />
                      {/* Sculpted Front Hairline with Natural Side-Part */}
                      <path
                        d={`M ${torsoHead.x - headRx * 1.02} ${torsoHead.y - headRy * 0.1}
                            Q ${torsoHead.x - headRx * 0.3} ${torsoHead.y - headRy * 0.8} ${torsoHead.x - headRx * 0.1} ${torsoHead.y - headRy * 0.55}
                            Q ${torsoHead.x + headRx * 0.5} ${torsoHead.y - headRy * 0.75} ${torsoHead.x + headRx * 1.02} ${torsoHead.y - headRy * 0.1}
                            Q ${torsoHead.x + headRx * 0.7} ${torsoHead.y - headRy * 0.4} ${torsoHead.x + headRx * 0.35} ${torsoHead.y - headRy * 0.5}
                            Q ${torsoHead.x - headRx * 0.4} ${torsoHead.y - headRy * 0.4} ${torsoHead.x - headRx * 1.02} ${torsoHead.y - headRy * 0.1} Z`}
                        fill="url(#bslHairFront)"
                      />
                    </g>
                  );
                })()}

                {/* 6. Human Facial Features (Living NMF Rig) */}
                {showFacialFeatures && (
                  <g id="bsl-face-nmf" opacity={0.98}>
                    {/* Natural Arched Eyebrows (Grammatical NMF) */}
                    <line
                      x1={facialLandmarks.leftBrowOut.x}
                      y1={facialLandmarks.leftBrowOut.y}
                      x2={facialLandmarks.leftBrowIn.x}
                      y2={facialLandmarks.leftBrowIn.y}
                      stroke={eyebrowState === 'raised' ? '#f59e0b' : (eyebrowState === 'furrowed' ? '#ea580c' : '#273449')}
                      strokeWidth={(cameraMode === 'face' ? 3.4 : 2.5) * torsoHead.scale}
                      strokeLinecap="round"
                    />
                    <line
                      x1={facialLandmarks.rightBrowIn.x}
                      y1={facialLandmarks.rightBrowIn.y}
                      x2={facialLandmarks.rightBrowOut.x}
                      y2={facialLandmarks.rightBrowOut.y}
                      stroke={eyebrowState === 'raised' ? '#f59e0b' : (eyebrowState === 'furrowed' ? '#ea580c' : '#273449')}
                      strokeWidth={(cameraMode === 'face' ? 3.4 : 2.5) * torsoHead.scale}
                      strokeLinecap="round"
                    />

                    {/* Supratarsal Eyelid Creases (Folds above each eye) */}
                    <path
                      d={`M ${facialLandmarks.leftEye.x - 3.8 * torsoHead.scale} ${facialLandmarks.leftEye.y - 3.2 * torsoHead.scale}
                          Q ${facialLandmarks.leftEye.x} ${facialLandmarks.leftEye.y - (eyebrowState === 'raised' ? 4.8 : 3.8) * torsoHead.scale} ${facialLandmarks.leftEye.x + 3.8 * torsoHead.scale} ${facialLandmarks.leftEye.y - 2.8 * torsoHead.scale}`}
                      fill="none"
                      stroke="#d49f82"
                      strokeWidth={0.8 * torsoHead.scale}
                      strokeLinecap="round"
                      opacity={0.65}
                    />
                    <path
                      d={`M ${facialLandmarks.rightEye.x - 3.8 * torsoHead.scale} ${facialLandmarks.rightEye.y - 2.8 * torsoHead.scale}
                          Q ${facialLandmarks.rightEye.x} ${facialLandmarks.rightEye.y - (eyebrowState === 'raised' ? 4.8 : 3.8) * torsoHead.scale} ${facialLandmarks.rightEye.x + 3.8 * torsoHead.scale} ${facialLandmarks.rightEye.y - 3.2 * torsoHead.scale}`}
                      fill="none"
                      stroke="#d49f82"
                      strokeWidth={0.8 * torsoHead.scale}
                      strokeLinecap="round"
                      opacity={0.65}
                    />

                    {/* Left Eye (Living Almond Sclera + Hazel Iris + Specular Catchlight + Procedural Blink) */}
                    {isBlinking ? (
                      /* Natural closed eyelid arc during 120ms procedural micro-blink */
                      <path
                        d={`M ${facialLandmarks.leftEye.x - 4.2 * torsoHead.scale} ${facialLandmarks.leftEye.y}
                            Q ${facialLandmarks.leftEye.x} ${facialLandmarks.leftEye.y + 1.8 * torsoHead.scale} ${facialLandmarks.leftEye.x + 4.2 * torsoHead.scale} ${facialLandmarks.leftEye.y}`}
                        fill="none"
                        stroke="#334155"
                        strokeWidth={1.8 * torsoHead.scale}
                        strokeLinecap="round"
                      />
                    ) : (
                      <g id="bsl-left-eye-open">
                        {/* Almond Sclera with soft ambient shadow */}
                        <path
                          d={`M ${facialLandmarks.leftEye.x - 4.4 * torsoHead.scale} ${facialLandmarks.leftEye.y}
                              Q ${facialLandmarks.leftEye.x} ${facialLandmarks.leftEye.y - 3.0 * torsoHead.scale} ${facialLandmarks.leftEye.x + 4.4 * torsoHead.scale} ${facialLandmarks.leftEye.y}
                              Q ${facialLandmarks.leftEye.x} ${facialLandmarks.leftEye.y + 2.5 * torsoHead.scale} ${facialLandmarks.leftEye.x - 4.4 * torsoHead.scale} ${facialLandmarks.leftEye.y} Z`}
                          fill="#fefefe"
                          stroke="#cbd5e1"
                          strokeWidth="0.7"
                        />
                        {/* Upper eyelid ambient shadow */}
                        <path
                          d={`M ${facialLandmarks.leftEye.x - 4.4 * torsoHead.scale} ${facialLandmarks.leftEye.y}
                              Q ${facialLandmarks.leftEye.x} ${facialLandmarks.leftEye.y - 3.0 * torsoHead.scale} ${facialLandmarks.leftEye.x + 4.4 * torsoHead.scale} ${facialLandmarks.leftEye.y}
                              Q ${facialLandmarks.leftEye.x} ${facialLandmarks.leftEye.y - 1.0 * torsoHead.scale} ${facialLandmarks.leftEye.x - 4.4 * torsoHead.scale} ${facialLandmarks.leftEye.y} Z`}
                          fill="rgba(15, 23, 42, 0.14)"
                        />
                        {/* Hazel/Slate Iris with Limbal Ring */}
                        <circle
                          cx={facialLandmarks.leftEye.x}
                          cy={facialLandmarks.leftEye.y}
                          r={(cameraMode === 'face' ? 2.3 : 1.7) * torsoHead.scale}
                          fill="url(#bslIrisGradient)"
                          stroke="#090d16"
                          strokeWidth="0.4"
                        />
                        {/* Dark Pupil */}
                        <circle
                          cx={facialLandmarks.leftEye.x}
                          cy={facialLandmarks.leftEye.y}
                          r={(cameraMode === 'face' ? 1.2 : 0.9) * torsoHead.scale}
                          fill="#09090b"
                        />
                        {/* 10 O'Clock Primary Specular Catchlight Dot */}
                        <circle
                          cx={facialLandmarks.leftEye.x - 0.7 * torsoHead.scale}
                          cy={facialLandmarks.leftEye.y - 0.7 * torsoHead.scale}
                          r={(cameraMode === 'face' ? 0.7 : 0.5) * torsoHead.scale}
                          fill="#ffffff"
                        />
                        {/* Secondary micro bounce catchlight */}
                        <circle
                          cx={facialLandmarks.leftEye.x + 0.5 * torsoHead.scale}
                          cy={facialLandmarks.leftEye.y + 0.5 * torsoHead.scale}
                          r={(cameraMode === 'face' ? 0.35 : 0.25) * torsoHead.scale}
                          fill="#ffffff"
                          opacity={0.65}
                        />
                        {/* Upper Eyelash Line */}
                        <path
                          d={`M ${facialLandmarks.leftEye.x - 4.5 * torsoHead.scale} ${facialLandmarks.leftEye.y}
                              Q ${facialLandmarks.leftEye.x} ${facialLandmarks.leftEye.y - 3.2 * torsoHead.scale} ${facialLandmarks.leftEye.x + 4.5 * torsoHead.scale} ${facialLandmarks.leftEye.y}`}
                          fill="none"
                          stroke="#1e293b"
                          strokeWidth={1.3 * torsoHead.scale}
                          strokeLinecap="round"
                        />
                      </g>
                    )}

                    {/* Right Eye (Living Almond Sclera + Hazel Iris + Specular Catchlight + Procedural Blink) */}
                    {isBlinking ? (
                      /* Natural closed eyelid arc during 120ms procedural micro-blink */
                      <path
                        d={`M ${facialLandmarks.rightEye.x - 4.2 * torsoHead.scale} ${facialLandmarks.rightEye.y}
                            Q ${facialLandmarks.rightEye.x} ${facialLandmarks.rightEye.y + 1.8 * torsoHead.scale} ${facialLandmarks.rightEye.x + 4.2 * torsoHead.scale} ${facialLandmarks.rightEye.y}`}
                        fill="none"
                        stroke="#334155"
                        strokeWidth={1.8 * torsoHead.scale}
                        strokeLinecap="round"
                      />
                    ) : (
                      <g id="bsl-right-eye-open">
                        {/* Almond Sclera with soft ambient shadow */}
                        <path
                          d={`M ${facialLandmarks.rightEye.x - 4.4 * torsoHead.scale} ${facialLandmarks.rightEye.y}
                              Q ${facialLandmarks.rightEye.x} ${facialLandmarks.rightEye.y - 3.0 * torsoHead.scale} ${facialLandmarks.rightEye.x + 4.4 * torsoHead.scale} ${facialLandmarks.rightEye.y}
                              Q ${facialLandmarks.rightEye.x} ${facialLandmarks.rightEye.y + 2.5 * torsoHead.scale} ${facialLandmarks.rightEye.x - 4.4 * torsoHead.scale} ${facialLandmarks.rightEye.y} Z`}
                          fill="#fefefe"
                          stroke="#cbd5e1"
                          strokeWidth="0.7"
                        />
                        {/* Upper eyelid ambient shadow */}
                        <path
                          d={`M ${facialLandmarks.rightEye.x - 4.4 * torsoHead.scale} ${facialLandmarks.rightEye.y}
                              Q ${facialLandmarks.rightEye.x} ${facialLandmarks.rightEye.y - 3.0 * torsoHead.scale} ${facialLandmarks.rightEye.x + 4.4 * torsoHead.scale} ${facialLandmarks.rightEye.y}
                              Q ${facialLandmarks.rightEye.x} ${facialLandmarks.rightEye.y - 1.0 * torsoHead.scale} ${facialLandmarks.rightEye.x - 4.4 * torsoHead.scale} ${facialLandmarks.rightEye.y} Z`}
                          fill="rgba(15, 23, 42, 0.14)"
                        />
                        {/* Hazel/Slate Iris with Limbal Ring */}
                        <circle
                          cx={facialLandmarks.rightEye.x}
                          cy={facialLandmarks.rightEye.y}
                          r={(cameraMode === 'face' ? 2.3 : 1.7) * torsoHead.scale}
                          fill="url(#bslIrisGradient)"
                          stroke="#090d16"
                          strokeWidth="0.4"
                        />
                        {/* Dark Pupil */}
                        <circle
                          cx={facialLandmarks.rightEye.x}
                          cy={facialLandmarks.rightEye.y}
                          r={(cameraMode === 'face' ? 1.2 : 0.9) * torsoHead.scale}
                          fill="#09090b"
                        />
                        {/* 10 O'Clock Primary Specular Catchlight Dot */}
                        <circle
                          cx={facialLandmarks.rightEye.x - 0.7 * torsoHead.scale}
                          cy={facialLandmarks.rightEye.y - 0.7 * torsoHead.scale}
                          r={(cameraMode === 'face' ? 0.7 : 0.5) * torsoHead.scale}
                          fill="#ffffff"
                        />
                        {/* Secondary micro bounce catchlight */}
                        <circle
                          cx={facialLandmarks.rightEye.x + 0.5 * torsoHead.scale}
                          cy={facialLandmarks.rightEye.y + 0.5 * torsoHead.scale}
                          r={(cameraMode === 'face' ? 0.35 : 0.25) * torsoHead.scale}
                          fill="#ffffff"
                          opacity={0.65}
                        />
                        {/* Upper Eyelash Line */}
                        <path
                          d={`M ${facialLandmarks.rightEye.x - 4.5 * torsoHead.scale} ${facialLandmarks.rightEye.y}
                              Q ${facialLandmarks.rightEye.x} ${facialLandmarks.rightEye.y - 3.2 * torsoHead.scale} ${facialLandmarks.rightEye.x + 4.5 * torsoHead.scale} ${facialLandmarks.rightEye.y}`}
                          fill="none"
                          stroke="#1e293b"
                          strokeWidth={1.3 * torsoHead.scale}
                          strokeLinecap="round"
                        />
                      </g>
                    )}

                    {/* Sculpted Nose Bridge & Nostril Wings */}
                    <path
                      d={`M ${facialLandmarks.noseBridge.x} ${facialLandmarks.noseBridge.y}
                          L ${facialLandmarks.noseTip.x - 1.2 * torsoHead.scale} ${facialLandmarks.noseTip.y}
                          Q ${facialLandmarks.noseTip.x} ${facialLandmarks.noseTip.y + 1.8 * torsoHead.scale} ${facialLandmarks.noseTip.x + 1.6 * torsoHead.scale} ${facialLandmarks.noseTip.y}`}
                      fill="none"
                      stroke="#c48e6c"
                      strokeWidth={cameraMode === 'face' ? '1.5' : '1.1'}
                      strokeLinecap="round"
                    />
                    {/* Faint Nostril Wing Creases */}
                    <path
                      d={`M ${facialLandmarks.noseTip.x - 2.8 * torsoHead.scale} ${facialLandmarks.noseTip.y + 0.6 * torsoHead.scale}
                          Q ${facialLandmarks.noseTip.x - 1.8 * torsoHead.scale} ${facialLandmarks.noseTip.y + 1.8 * torsoHead.scale} ${facialLandmarks.noseTip.x - 0.8 * torsoHead.scale} ${facialLandmarks.noseTip.y + 1.6 * torsoHead.scale}`}
                      fill="none"
                      stroke="#caa084"
                      strokeWidth={0.7 * torsoHead.scale}
                      strokeLinecap="round"
                      opacity={0.6}
                    />
                    <path
                      d={`M ${facialLandmarks.noseTip.x + 2.8 * torsoHead.scale} ${facialLandmarks.noseTip.y + 0.6 * torsoHead.scale}
                          Q ${facialLandmarks.noseTip.x + 1.8 * torsoHead.scale} ${facialLandmarks.noseTip.y + 1.8 * torsoHead.scale} ${facialLandmarks.noseTip.x + 0.8 * torsoHead.scale} ${facialLandmarks.noseTip.y + 1.6 * torsoHead.scale}`}
                      fill="none"
                      stroke="#caa084"
                      strokeWidth={0.7 * torsoHead.scale}
                      strokeLinecap="round"
                      opacity={0.6}
                    />

                    {/* Philtrum Columns (Under-nose indentation to Cupid's bow) */}
                    <line
                      x1={facialLandmarks.noseTip.x - 0.7 * torsoHead.scale}
                      y1={facialLandmarks.noseTip.y + 2.2 * torsoHead.scale}
                      x2={facialLandmarks.mouthCenter.x - 0.7 * torsoHead.scale}
                      y2={facialLandmarks.mouthCenter.y - 2.6 * torsoHead.scale}
                      stroke="#d59a7c"
                      strokeWidth={0.5 * torsoHead.scale}
                      strokeLinecap="round"
                      opacity={0.45}
                    />
                    <line
                      x1={facialLandmarks.noseTip.x + 0.7 * torsoHead.scale}
                      y1={facialLandmarks.noseTip.y + 2.2 * torsoHead.scale}
                      x2={facialLandmarks.mouthCenter.x + 0.7 * torsoHead.scale}
                      y2={facialLandmarks.mouthCenter.y - 2.6 * torsoHead.scale}
                      stroke="#d59a7c"
                      strokeWidth={0.5 * torsoHead.scale}
                      strokeLinecap="round"
                      opacity={0.45}
                    />

                    {/* Natural Mouth & Lips with Cupid's Bow and Oral Cavity Depth */}
                    {mouthPattern ? (
                      <g id="bsl-mouth-articulating">
                        {/* Oral Cavity Aperture */}
                        <path
                          d={`M ${facialLandmarks.mouthLeft.x} ${facialLandmarks.mouthLeft.y}
                              Q ${facialLandmarks.mouthCenter.x} ${facialLandmarks.mouthCenter.y - (facialLandmarks.mouthH * 0.45 * torsoHead.scale)} ${facialLandmarks.mouthRight.x} ${facialLandmarks.mouthRight.y}
                              Q ${facialLandmarks.mouthCenter.x} ${facialLandmarks.mouthCenter.y + (facialLandmarks.mouthH * 1.1 * torsoHead.scale)} ${facialLandmarks.mouthLeft.x} ${facialLandmarks.mouthLeft.y} Z`}
                          fill="#3d0a12"
                          stroke="url(#bslLipUpper)"
                          strokeWidth={cameraMode === 'face' ? '1.8' : '1.3'}
                          strokeLinejoin="round"
                        />
                        {/* Subtle Upper Incisor Tooth-Line Accent */}
                        <rect
                          x={facialLandmarks.mouthCenter.x - 2.8 * torsoHead.scale}
                          y={facialLandmarks.mouthCenter.y - (facialLandmarks.mouthH * 0.2 * torsoHead.scale)}
                          width={5.6 * torsoHead.scale}
                          height={1.3 * torsoHead.scale}
                          rx={0.6 * torsoHead.scale}
                          fill="#fefcf8"
                          opacity={0.88}
                        />
                        {/* Lower Vermilion Lip Highlight */}
                        <path
                          d={`M ${facialLandmarks.mouthLeft.x + 1.5 * torsoHead.scale} ${facialLandmarks.mouthCenter.y + (facialLandmarks.mouthH * 0.7 * torsoHead.scale)}
                              Q ${facialLandmarks.mouthCenter.x} ${facialLandmarks.mouthCenter.y + (facialLandmarks.mouthH * 1.25 * torsoHead.scale)} ${facialLandmarks.mouthRight.x - 1.5 * torsoHead.scale} ${facialLandmarks.mouthCenter.y + (facialLandmarks.mouthH * 0.7 * torsoHead.scale)}`}
                          fill="none"
                          stroke="url(#bslLipLower)"
                          strokeWidth={1.5 * torsoHead.scale}
                          strokeLinecap="round"
                        />
                      </g>
                    ) : (
                      <g id="bsl-mouth-neutral">
                        {/* Upper Lip with Cupid's Bow Dip */}
                        <path
                          d={`M ${facialLandmarks.mouthLeft.x} ${facialLandmarks.mouthLeft.y}
                              Q ${facialLandmarks.mouthLeft.x * 0.5 + facialLandmarks.mouthCenter.x * 0.5} ${facialLandmarks.mouthCenter.y - 1.2 * torsoHead.scale} ${facialLandmarks.mouthCenter.x} ${facialLandmarks.mouthCenter.y - 0.4 * torsoHead.scale}
                              Q ${facialLandmarks.mouthRight.x * 0.5 + facialLandmarks.mouthCenter.x * 0.5} ${facialLandmarks.mouthCenter.y - 1.2 * torsoHead.scale} ${facialLandmarks.mouthRight.x} ${facialLandmarks.mouthRight.y}
                              Q ${facialLandmarks.mouthCenter.x} ${facialLandmarks.mouthCenter.y + 0.3 * torsoHead.scale} ${facialLandmarks.mouthLeft.x} ${facialLandmarks.mouthLeft.y} Z`}
                          fill="url(#bslLipUpper)"
                        />
                        {/* Fuller Lower Lip with Vermilion Ambient Highlight */}
                        <path
                          d={`M ${facialLandmarks.mouthLeft.x + 0.8 * torsoHead.scale} ${facialLandmarks.mouthLeft.y}
                              Q ${facialLandmarks.mouthCenter.x} ${facialLandmarks.mouthCenter.y + 2.2 * torsoHead.scale} ${facialLandmarks.mouthRight.x - 0.8 * torsoHead.scale} ${facialLandmarks.mouthRight.y}
                              Q ${facialLandmarks.mouthCenter.x} ${facialLandmarks.mouthCenter.y + 0.4 * torsoHead.scale} ${facialLandmarks.mouthLeft.x + 0.8 * torsoHead.scale} ${facialLandmarks.mouthLeft.y} Z`}
                          fill="url(#bslLipLower)"
                        />
                        {/* Oral commissure line (mouth slit) */}
                        <path
                          d={`M ${facialLandmarks.mouthLeft.x} ${facialLandmarks.mouthLeft.y}
                              Q ${facialLandmarks.mouthCenter.x} ${facialLandmarks.mouthCenter.y + 0.2 * torsoHead.scale} ${facialLandmarks.mouthRight.x} ${facialLandmarks.mouthRight.y}`}
                          fill="none"
                          stroke="#7e2231"
                          strokeWidth={cameraMode === 'face' ? '1.0' : '0.7'}
                          strokeLinecap="round"
                        />
                      </g>
                    )}
                  </g>
                )}
              </g>
            ) : (
              <g id="bsl-skeleton-torso-head">
                {/* Shoulders & Trapezius line */}
                <path
                  d={`M ${shoulderViewerLeft.x} ${shoulderViewerLeft.y} Q ${torsoChest.x} ${torsoChest.y} ${shoulderViewerRight.x} ${shoulderViewerRight.y}`}
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
                    {/* Eyebrows: Dynamic Grammatical NMF */}
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

                    {/* Mouth & Lips */}
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
            )}
          </g>

          {/* Grid lines floor reference */}
          <line x1="15" y1="150" x2="225" y2="150" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <line x1="120" y1="130" x2="120" y2="160" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

          {/* NON-DOMINANT HAND (The Base / Left Hand) */}
          <g id="bsl-base-hand" opacity={0.95}>
            {avatarSkinMode === 'human' ? (
              <g id="bsl-base-hand-human" opacity={baseHand3D.mode === 'rest' ? 0.65 : 0.98} filter="url(#bslSoftGlow)">
                {/* 1. Forearm (Contrasting sleeve cuff to warm skin wrist) */}
                <line
                  x1={baseForearm.x}
                  y1={baseForearm.y}
                  x2={baseWrist.x}
                  y2={baseWrist.y}
                  stroke="url(#bslHumanSkin)"
                  strokeWidth={6.8 * baseWrist.scale}
                  strokeLinecap="round"
                />
                <line
                  x1={baseForearm.x - 3}
                  y1={baseForearm.y - 1}
                  x2={baseForearm.x + 3}
                  y2={baseForearm.y + 1}
                  stroke="#1e293b"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                />
                {/* Wrist Carpal Crease */}
                <path
                  d={`M ${baseWrist.x - 3.5 * baseWrist.scale} ${baseWrist.y}
                      Q ${baseWrist.x} ${baseWrist.y + 1.2 * baseWrist.scale} ${baseWrist.x + 3.5 * baseWrist.scale} ${baseWrist.y}`}
                  fill="none"
                  stroke="#d59a7c"
                  strokeWidth={0.8 * baseWrist.scale}
                  strokeLinecap="round"
                  opacity={0.65}
                />

                {/* 2. Palm body polygon - Warm contoured fleshy palm */}
                <polygon
                  points={`${baseWrist.x},${baseWrist.y} ${baseThumbBase.x},${baseThumbBase.y} ${baseKnuckle.x},${baseKnuckle.y} ${baseKMid.x},${baseKMid.y} ${baseKRing.x},${baseKRing.y} ${baseKPinky.x},${baseKPinky.y}`}
                  fill="url(#bslHumanSkinPalm)"
                  stroke="#c48e6c"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />

                {/* Thenar eminence cushion (base of thumb pad) */}
                <ellipse
                  cx={(baseWrist.x + baseThumbBase.x * 2) / 3}
                  cy={(baseWrist.y + baseThumbBase.y * 2) / 3}
                  rx={4.8 * baseWrist.scale}
                  ry={3.6 * baseWrist.scale}
                  fill="url(#bslPalmEminence)"
                  opacity="0.9"
                />
                {/* Hypothenar eminence (outer ulnar palm mound) */}
                <ellipse
                  cx={(baseWrist.x * 1.8 + baseKPinky.x * 1.2) / 3}
                  cy={(baseWrist.y * 1.8 + baseKPinky.y * 1.2) / 3}
                  rx={3.8 * baseWrist.scale}
                  ry={2.8 * baseWrist.scale}
                  fill="url(#bslPalmEminence)"
                  opacity="0.75"
                />

                {/* 3. Volumetric Middle Finger with Joint Crease & Nail Bed */}
                <line x1={basePalm.x} y1={basePalm.y} x2={baseKMid.x} y2={baseKMid.y} stroke="url(#bslHumanSkin)" strokeWidth={(isLeftExtended ? 5.2 : 4.4) * baseKMid.scale} strokeLinecap="round" />
                <line x1={baseKMid.x} y1={baseKMid.y} x2={baseTipMid.x} y2={baseTipMid.y} stroke="url(#bslHumanSkin)" strokeWidth={(isLeftExtended ? 4.8 : 4.0) * baseTipMid.scale} strokeLinecap="round" />
                <line x1={(baseKMid.x + baseTipMid.x) / 2 - 1.4} y1={(baseKMid.y + baseTipMid.y) / 2} x2={(baseKMid.x + baseTipMid.x) / 2 + 1.4} y2={(baseKMid.y + baseTipMid.y) / 2} stroke="#b88365" strokeWidth="0.8" strokeLinecap="round" opacity={0.6} />
                <circle cx={baseTipMid.x} cy={baseTipMid.y} r={(isLeftExtended ? 3.4 : 2.5) * baseTipMid.scale} fill="#fef0e6" stroke="#caa084" strokeWidth="0.8" />
                <path d={`M ${baseTipMid.x - 1.2} ${baseTipMid.y - 0.2} Q ${baseTipMid.x} ${baseTipMid.y - 1.1} ${baseTipMid.x + 1.2} ${baseTipMid.y - 0.2}`} fill="url(#bslNailGradient)" stroke="#ebd5cb" strokeWidth="0.4" opacity={0.7} />

                {/* 4. Volumetric Ring Finger with Joint Crease & Nail Bed */}
                <line x1={basePalm.x} y1={basePalm.y} x2={baseKRing.x} y2={baseKRing.y} stroke="url(#bslHumanSkin)" strokeWidth={(isLeftExtended ? 5.0 : 4.2) * baseKRing.scale} strokeLinecap="round" />
                <line x1={baseKRing.x} y1={baseKRing.y} x2={baseTipRing.x} y2={baseTipRing.y} stroke="url(#bslHumanSkin)" strokeWidth={(isLeftExtended ? 4.6 : 3.8) * baseTipRing.scale} strokeLinecap="round" />
                <line x1={(baseKRing.x + baseTipRing.x) / 2 - 1.3} y1={(baseKRing.y + baseTipRing.y) / 2} x2={(baseKRing.x + baseTipRing.x) / 2 + 1.3} y2={(baseKRing.y + baseTipRing.y) / 2} stroke="#b88365" strokeWidth="0.8" strokeLinecap="round" opacity={0.6} />
                <circle cx={baseTipRing.x} cy={baseTipRing.y} r={(isLeftExtended ? 3.2 : 2.4) * baseTipRing.scale} fill="#fef0e6" stroke="#caa084" strokeWidth="0.8" />
                <path d={`M ${baseTipRing.x - 1.1} ${baseTipRing.y - 0.2} Q ${baseTipRing.x} ${baseTipRing.y - 1.0} ${baseTipRing.x + 1.1} ${baseTipRing.y - 0.2}`} fill="url(#bslNailGradient)" stroke="#ebd5cb" strokeWidth="0.4" opacity={0.7} />

                {/* 5. Volumetric Pinky Finger with Joint Crease & Nail Bed */}
                <line x1={basePalm.x} y1={basePalm.y} x2={baseKPinky.x} y2={baseKPinky.y} stroke="url(#bslHumanSkin)" strokeWidth={(isLeftExtended ? 4.6 : 3.8) * baseKPinky.scale} strokeLinecap="round" />
                <line x1={baseKPinky.x} y1={baseKPinky.y} x2={baseTipPinky.x} y2={baseTipPinky.y} stroke="url(#bslHumanSkin)" strokeWidth={(isLeftExtended ? 4.2 : 3.4) * baseTipPinky.scale} strokeLinecap="round" />
                <line x1={(baseKPinky.x + baseTipPinky.x) / 2 - 1.1} y1={(baseKPinky.y + baseTipPinky.y) / 2} x2={(baseKPinky.x + baseTipPinky.x) / 2 + 1.1} y2={(baseKPinky.y + baseTipPinky.y) / 2} stroke="#b88365" strokeWidth="0.8" strokeLinecap="round" opacity={0.6} />
                <circle cx={baseTipPinky.x} cy={baseTipPinky.y} r={(isLeftExtended ? 3.0 : 2.2) * baseTipPinky.scale} fill="#fef0e6" stroke="#caa084" strokeWidth="0.8" />
                <path d={`M ${baseTipPinky.x - 1.0} ${baseTipPinky.y - 0.2} Q ${baseTipPinky.x} ${baseTipPinky.y - 0.9} ${baseTipPinky.x + 1.0} ${baseTipPinky.y - 0.2}`} fill="url(#bslNailGradient)" stroke="#ebd5cb" strokeWidth="0.4" opacity={0.7} />

                {/* 6. Volumetric Thumb with Joint Crease & Nail Bed */}
                <line x1={baseThumbBase.x} y1={baseThumbBase.y} x2={baseThumbKnuckle.x} y2={baseThumbKnuckle.y} stroke="url(#bslHumanSkin)" strokeWidth={5.4 * baseThumbKnuckle.scale} strokeLinecap="round" />
                <line x1={baseThumbKnuckle.x} y1={baseThumbKnuckle.y} x2={baseThumbTip.x} y2={baseThumbTip.y} stroke="url(#bslHumanSkin)" strokeWidth={4.8 * baseThumbTip.scale} strokeLinecap="round" />
                <circle cx={baseThumbTip.x} cy={baseThumbTip.y} r={3.4 * baseThumbTip.scale} fill="#fef0e6" stroke="#caa084" strokeWidth="0.8" />
                <path d={`M ${baseThumbTip.x - 1.3} ${baseThumbTip.y - 0.2} Q ${baseThumbTip.x} ${baseThumbTip.y - 1.1} ${baseThumbTip.x + 1.3} ${baseThumbTip.y - 0.2}`} fill="url(#bslNailGradient)" stroke="#ebd5cb" strokeWidth="0.4" opacity={0.7} />

                {/* 7. Volumetric Index Finger with Joint Crease & Nail Bed */}
                <line x1={basePalm.x} y1={basePalm.y} x2={baseKnuckle.x} y2={baseKnuckle.y} stroke="url(#bslHumanSkin)" strokeWidth={5.4 * baseKnuckle.scale} strokeLinecap="round" />
                <line x1={baseKnuckle.x} y1={baseKnuckle.y} x2={baseTip.x} y2={baseTip.y} stroke="url(#bslHumanSkin)" strokeWidth={4.8 * baseTip.scale} strokeLinecap="round" />
                <line x1={(baseKnuckle.x + baseTip.x) / 2 - 1.4} y1={(baseKnuckle.y + baseTip.y) / 2} x2={(baseKnuckle.x + baseTip.x) / 2 + 1.4} y2={(baseKnuckle.y + baseTip.y) / 2} stroke="#b88365" strokeWidth="0.8" strokeLinecap="round" opacity={0.6} />
                <circle cx={baseTip.x} cy={baseTip.y} r={3.6 * baseTip.scale} fill="#fef0e6" stroke="#caa084" strokeWidth="0.8" />
                <path d={`M ${baseTip.x - 1.3} ${baseTip.y - 0.2} Q ${baseTip.x} ${baseTip.y - 1.1} ${baseTip.x + 1.3} ${baseTip.y - 0.2}`} fill="url(#bslNailGradient)" stroke="#ebd5cb" strokeWidth="0.4" opacity={0.7} />
              </g>
            ) : (
              <g id="bsl-base-hand-skeleton">
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
              </g>
            )}

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
            {avatarSkinMode === 'human' ? (
              <g id="bsl-dominant-hand-human" filter="url(#bslSoftGlow)">
                {/* 1. Forearm (Contrasting sleeve cuff to warm skin wrist) */}
                <line
                  x1={domForearm.x}
                  y1={domForearm.y}
                  x2={domWrist.x}
                  y2={domWrist.y}
                  stroke="url(#bslHumanSkin)"
                  strokeWidth={7.0 * domWrist.scale}
                  strokeLinecap="round"
                />
                <line
                  x1={domForearm.x - 3}
                  y1={domForearm.y - 1}
                  x2={domForearm.x + 3}
                  y2={domForearm.y + 1}
                  stroke="#1e293b"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                />
                {/* Wrist Carpal Crease */}
                <path
                  d={`M ${domWrist.x - 3.5 * domWrist.scale} ${domWrist.y}
                      Q ${domWrist.x} ${domWrist.y + 1.2 * domWrist.scale} ${domWrist.x + 3.5 * domWrist.scale} ${domWrist.y}`}
                  fill="none"
                  stroke="#d59a7c"
                  strokeWidth={0.8 * domWrist.scale}
                  strokeLinecap="round"
                  opacity={0.65}
                />

                {/* 2. Palm body polygon - Warm contoured fleshy palm */}
                <polygon
                  points={`${domWrist.x},${domWrist.y} ${domThumbBase.x},${domThumbBase.y} ${domKnuckle.x},${domKnuckle.y} ${domKMid.x},${domKMid.y} ${domKRing.x},${domKRing.y} ${domKPinky.x},${domKPinky.y}`}
                  fill="url(#bslHumanSkinPalm)"
                  stroke="#c48e6c"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />

                {/* Thenar eminence cushion (base of thumb pad) */}
                <ellipse
                  cx={(domWrist.x + domThumbBase.x * 2) / 3}
                  cy={(domWrist.y + domThumbBase.y * 2) / 3}
                  rx={5.0 * domWrist.scale}
                  ry={3.8 * domWrist.scale}
                  fill="url(#bslPalmEminence)"
                  opacity="0.9"
                />
                {/* Hypothenar eminence (outer ulnar palm mound) */}
                <ellipse
                  cx={(domWrist.x * 1.8 + domKPinky.x * 1.2) / 3}
                  cy={(domWrist.y * 1.8 + domKPinky.y * 1.2) / 3}
                  rx={4.0 * domWrist.scale}
                  ry={3.0 * domWrist.scale}
                  fill="url(#bslPalmEminence)"
                  opacity="0.75"
                />

                {/* 3. Volumetric Middle Finger with Joint Crease & Nail Bed */}
                <line x1={domPalm.x} y1={domPalm.y} x2={domKMid.x} y2={domKMid.y} stroke="url(#bslHumanSkin)" strokeWidth={(isDomExtended ? 5.4 : 4.6) * domKMid.scale} strokeLinecap="round" />
                <line x1={domKMid.x} y1={domKMid.y} x2={domTipMid.x} y2={domTipMid.y} stroke="url(#bslHumanSkin)" strokeWidth={(isDomExtended ? 5.0 : 4.2) * domTipMid.scale} strokeLinecap="round" />
                <line x1={(domKMid.x + domTipMid.x) / 2 - 1.4} y1={(domKMid.y + domTipMid.y) / 2} x2={(domKMid.x + domTipMid.x) / 2 + 1.4} y2={(domKMid.y + domTipMid.y) / 2} stroke="#b88365" strokeWidth="0.8" strokeLinecap="round" opacity={0.6} />
                <circle cx={domTipMid.x} cy={domTipMid.y} r={(isDomExtended ? 3.6 : 2.6) * domTipMid.scale} fill="#fef0e6" stroke="#caa084" strokeWidth="0.8" />
                <path d={`M ${domTipMid.x - 1.2} ${domTipMid.y - 0.2} Q ${domTipMid.x} ${domTipMid.y - 1.1} ${domTipMid.x + 1.2} ${domTipMid.y - 0.2}`} fill="url(#bslNailGradient)" stroke="#ebd5cb" strokeWidth="0.4" opacity={0.7} />

                {/* 4. Volumetric Ring Finger with Joint Crease & Nail Bed */}
                <line x1={domPalm.x} y1={domPalm.y} x2={domKRing.x} y2={domKRing.y} stroke="url(#bslHumanSkin)" strokeWidth={(isDomExtended ? 5.2 : 4.4) * domKRing.scale} strokeLinecap="round" />
                <line x1={domKRing.x} y1={domKRing.y} x2={domTipRing.x} y2={domTipRing.y} stroke="url(#bslHumanSkin)" strokeWidth={(isDomExtended ? 4.8 : 4.0) * domTipRing.scale} strokeLinecap="round" />
                <line x1={(domKRing.x + domTipRing.x) / 2 - 1.3} y1={(domKRing.y + domTipRing.y) / 2} x2={(domKRing.x + domTipRing.x) / 2 + 1.3} y2={(domKRing.y + domTipRing.y) / 2} stroke="#b88365" strokeWidth="0.8" strokeLinecap="round" opacity={0.6} />
                <circle cx={domTipRing.x} cy={domTipRing.y} r={(isDomExtended ? 3.4 : 2.5) * domTipRing.scale} fill="#fef0e6" stroke="#caa084" strokeWidth="0.8" />
                <path d={`M ${domTipRing.x - 1.1} ${domTipRing.y - 0.2} Q ${domTipRing.x} ${domTipRing.y - 1.0} ${domTipRing.x + 1.1} ${domTipRing.y - 0.2}`} fill="url(#bslNailGradient)" stroke="#ebd5cb" strokeWidth="0.4" opacity={0.7} />

                {/* 5. Volumetric Pinky Finger with Joint Crease & Nail Bed */}
                <line x1={domPalm.x} y1={domPalm.y} x2={domKPinky.x} y2={domKPinky.y} stroke="url(#bslHumanSkin)" strokeWidth={(isDomExtended ? 4.8 : 4.0) * domKPinky.scale} strokeLinecap="round" />
                <line x1={domKPinky.x} y1={domKPinky.y} x2={domTipPinky.x} y2={domTipPinky.y} stroke="url(#bslHumanSkin)" strokeWidth={(isDomExtended ? 4.4 : 3.6) * domTipPinky.scale} strokeLinecap="round" />
                <line x1={(domKPinky.x + domTipPinky.x) / 2 - 1.1} y1={(domKPinky.y + domTipPinky.y) / 2} x2={(domKPinky.x + domTipPinky.x) / 2 + 1.1} y2={(domKPinky.y + domTipPinky.y) / 2} stroke="#b88365" strokeWidth="0.8" strokeLinecap="round" opacity={0.6} />
                <circle cx={domTipPinky.x} cy={domTipPinky.y} r={(isDomExtended ? 3.2 : 2.3) * domTipPinky.scale} fill="#fef0e6" stroke="#caa084" strokeWidth="0.8" />
                <path d={`M ${domTipPinky.x - 1.0} ${domTipPinky.y - 0.2} Q ${domTipPinky.x} ${domTipPinky.y - 0.9} ${domTipPinky.x + 1.0} ${domTipPinky.y - 0.2}`} fill="url(#bslNailGradient)" stroke="#ebd5cb" strokeWidth="0.4" opacity={0.7} />

                {/* 6. Volumetric Thumb with Joint Crease & Nail Bed */}
                <line x1={domThumbBase.x} y1={domThumbBase.y} x2={domThumbKnuckle.x} y2={domThumbKnuckle.y} stroke="url(#bslHumanSkin)" strokeWidth={5.6 * domThumbKnuckle.scale} strokeLinecap="round" />
                <line x1={domThumbKnuckle.x} y1={domThumbKnuckle.y} x2={domThumbTip.x} y2={domThumbTip.y} stroke="url(#bslHumanSkin)" strokeWidth={5.0 * domThumbTip.scale} strokeLinecap="round" />
                <circle cx={domThumbTip.x} cy={domThumbTip.y} r={3.5 * domThumbTip.scale} fill="#fef0e6" stroke="#caa084" strokeWidth="0.8" />
                <path d={`M ${domThumbTip.x - 1.3} ${domThumbTip.y - 0.2} Q ${domThumbTip.x} ${domThumbTip.y - 1.1} ${domThumbTip.x + 1.3} ${domThumbTip.y - 0.2}`} fill="url(#bslNailGradient)" stroke="#ebd5cb" strokeWidth="0.4" opacity={0.7} />

                {/* 7. Volumetric Active Pointer / Index Finger with Joint Crease & Nail Bed */}
                <line x1={domPalm.x} y1={domPalm.y} x2={domKnuckle.x} y2={domKnuckle.y} stroke="url(#bslHumanSkin)" strokeWidth={5.6 * domKnuckle.scale} strokeLinecap="round" />
                <line x1={domKnuckle.x} y1={domKnuckle.y} x2={domTip.x} y2={domTip.y} stroke="url(#bslHumanSkin)" strokeWidth={5.0 * domTip.scale} strokeLinecap="round" />
                <line x1={(domKnuckle.x + domTip.x) / 2 - 1.4} y1={(domKnuckle.y + domTip.y) / 2} x2={(domKnuckle.x + domTip.x) / 2 + 1.4} y2={(domKnuckle.y + domTip.y) / 2} stroke="#b88365" strokeWidth="0.8" strokeLinecap="round" opacity={0.6} />
                <circle cx={domTip.x} cy={domTip.y} r={3.8 * domTip.scale} fill="#fef0e6" stroke="#caa084" strokeWidth="0.8" />
                <path d={`M ${domTip.x - 1.3} ${domTip.y - 0.2} Q ${domTip.x} ${domTip.y - 1.1} ${domTip.x + 1.3} ${domTip.y - 0.2}`} fill="url(#bslNailGradient)" stroke="#ebd5cb" strokeWidth="0.4" opacity={0.7} />
              </g>
            ) : (
              <g id="bsl-dominant-hand-skeleton">
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
              </g>
            )}
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
            onClick={() =>
              setAvatarSkinMode((prev) => {
                const next = prev === 'human' ? 'skeleton' : 'human';
                try {
                  localStorage.setItem('stj_bsl_skin_mode', next);
                } catch (_) {}
                return next;
              })
            }
            style={{
              ...stageBtnStyle,
              background:
                avatarSkinMode === 'human'
                  ? 'rgba(245, 158, 11, 0.22)'
                  : 'rgba(56, 189, 248, 0.18)',
              borderColor:
                avatarSkinMode === 'human'
                  ? '#f59e0b'
                  : 'rgba(56, 189, 248, 0.4)',
              color: avatarSkinMode === 'human' ? '#fcd34d' : '#38bdf8',
            }}
            title="Toggle between Culturally-Aligned Stylized Human Avatar and Kinematic Coordinate Skeleton"
          >
            <span>{avatarSkinMode === 'human' ? '🧑 Human' : '🦴 Skeleton'}</span>
          </button>

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

      {/* Makaton Stages & Repertoire Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          padding: '3px 8px',
          background: 'rgba(10, 16, 30, 0.98)',
          borderTop: '1px solid rgba(56, 189, 248, 0.15)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#a855f7', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span>🤝 Makaton:</span>
        </span>
        {[
          { id: 'all', label: 'All Signs' },
          { id: 1, label: 'S1 Needs' },
          { id: 2, label: 'S2 People' },
          { id: 3, label: 'S3 Food/Play' },
          { id: 4, label: 'S4 Actions' },
          { id: 5, label: 'S5 School' },
          { id: 7, label: 'S7 Faith' },
        ].map((tab) => {
          const isSelected = selectedMakatonStage === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedMakatonStage(tab.id as any)}
              style={{
                background: isSelected ? 'rgba(168, 85, 247, 0.28)' : 'rgba(30, 41, 59, 0.6)',
                border: `1px solid ${isSelected ? '#a855f7' : 'rgba(148, 163, 184, 0.2)'}`,
                borderRadius: '3px',
                color: isSelected ? '#e9d5ff' : '#94a3b8',
                padding: '1px 5px',
                fontSize: '0.56rem',
                fontWeight: isSelected ? 800 : 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
              title={`Filter repertoire by Makaton stage: ${tab.label}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Quick BSL / Makaton Curriculum Signs Strip */}
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
        {displaySigns.map((s) => (
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
            title={`Play whole-word sign: ${s.word}`}
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
                const next = m === 'bsl-natural' ? 'makaton' : m === 'makaton' ? 'sse' : m === 'sse' ? 'fingerspell' : 'bsl-natural';
                if (next === 'makaton') {
                  setSignLanguage('MAKATON');
                } else if (next === 'bsl-natural') {
                  setSignLanguage('BSL');
                }
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
                  : grammarMode === 'makaton'
                  ? 'rgba(168, 85, 247, 0.25)'
                  : grammarMode === 'sse'
                  ? 'rgba(245, 158, 11, 0.22)'
                  : 'rgba(56, 189, 248, 0.22)',
              border: `1px solid ${
                grammarMode === 'bsl-natural'
                  ? '#10b981'
                  : grammarMode === 'makaton'
                  ? '#a855f7'
                  : grammarMode === 'sse'
                  ? '#f59e0b'
                  : '#38bdf8'
              }`,
              borderRadius: '4px',
              color:
                grammarMode === 'bsl-natural'
                  ? '#6ee7b7'
                  : grammarMode === 'makaton'
                  ? '#e9d5ff'
                  : grammarMode === 'sse'
                  ? '#fbbf24'
                  : '#38bdf8',
              padding: '1px 6px',
              fontSize: '0.62rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
            title="Cycle Syntax: Natural BSL (Level 2/3 Topic-Comment) -> Makaton (SEN Keyword Signing) -> SSE (Sign Supported English) -> Fingerspelling"
          >
            {grammarMode === 'bsl-natural'
              ? '🤟 Natural BSL'
              : grammarMode === 'makaton'
              ? '🤝 Makaton'
              : grammarMode === 'sse'
              ? '📝 SSE L1'
              : '🔤 Fingerspell'}
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
