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
  BSL_BASE_HAND,
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
} from '../utils/bslLexicon';
import '../utils/ast3dWasmBridge'; // Auto-boots WebAssembly 3D Kernel
import { subscribeBslSpeech } from '../services/bslGlobalStore';

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
];

export const BslInterpreterOverlay: React.FC<BslInterpreterOverlayProps> = ({
  activeWord = '',
  activeSubtitle = '',
  isSpeaking = false,
  onClose,
  className = '',
}) => {
  const [viewAngle, setViewAngle] = useState<'signer' | 'receiver'>('receiver');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.2);
  const [customInput, setCustomInput] = useState<string>('');
  const [isPipActive, setIsPipActive] = useState<boolean>(false);
  const [showPanControls, setShowPanControls] = useState<boolean>(false);
  const [showFacialFeatures, setShowFacialFeatures] = useState<boolean>(true);

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

  // Camera angles with interactive orbit offset
  const cameraConfig = useMemo(() => {
    const base =
      viewAngle === 'signer'
        ? { yaw: 0, pitch: 26, distance: 360, fov: 60 }
        : { yaw: 180, pitch: -8, distance: 360, fov: 60 };

    return {
      yaw: base.yaw + orbitOffset.yaw,
      pitch: Math.max(-85, Math.min(85, base.pitch + orbitOffset.pitch)),
      distance: Math.max(120, base.distance + orbitOffset.distanceDelta),
      fov: base.fov,
    };
  }, [viewAngle, orbitOffset]);

  // Enqueue new word for fingerspelling or whole-word BSL sign
  const enqueueWord = useCallback((word: string) => {
    if (!word || typeof word !== 'string') return;
    const cleanWord = word.trim().toUpperCase();
    if (!cleanWord) return;

    setActiveWordDisplay(cleanWord);
    const poses = decomposeTextToBslStreamWithLexicon(cleanWord);
    if (poses.length > 0) {
      queueRef.current = [...poses, REST_POSE];
    }
  }, []);

  // React to parent speech boundary or subtitle changes
  useEffect(() => {
    if (activeWord && activeWord.trim()) {
      enqueueWord(activeWord);
    } else if (activeSubtitle && activeSubtitle.trim()) {
      const words = activeSubtitle.trim().split(/\s+/).filter((w) => w.length > 1);
      if (words.length > 0) {
        enqueueWord(words[0]);
      }
    }
  }, [activeWord, activeSubtitle, enqueueWord]);

  // Subscribe to universal speech bus for full-portal coordination
  useEffect(() => {
    const unsubscribe = subscribeBslSpeech((payload) => {
      if (payload.word && payload.word.trim()) {
        enqueueWord(payload.word);
      } else if (payload.subtitle && payload.subtitle.trim()) {
        const words = payload.subtitle.trim().split(/\s+/).filter((w) => w.length > 1);
        if (words.length > 0) {
          enqueueWord(words[0]);
        }
      }
    });
    return unsubscribe;
  }, [enqueueWord]);

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

  // Canvas dimension: 240 x 170 (comfortably framing both left and right hands in 3D perspective)
  const originX = 120 + orbitOffset.panX;
  const originY = 95 + orbitOffset.panY;

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
    } else if (headTilt === 'tilt-right') {
      dx += 4;
      dy -= 2;
    } else if (headTilt === 'tilt-left') {
      dx -= 4;
      dy -= 2;
    }
    return { x: dx, y: dy, z: dz };
  }, [headTilt, transitionProgress]);

  // Upper Torso & Head Reference Frame (Anatomical Loci for BSL Signs)
  const torsoHead = useMemo(() => project3DToSvg(headCenter3D, cameraConfig, originX, originY), [headCenter3D, cameraConfig, originX, originY]);
  const torsoChin = useMemo(() => project3DToSvg({ x: headCenter3D.x, y: headCenter3D.y + 26, z: headCenter3D.z + 5 }, cameraConfig, originX, originY), [headCenter3D, cameraConfig, originX, originY]);
  const torsoChest = useMemo(() => project3DToSvg({ x: 0, y: 15, z: -15 }, cameraConfig, originX, originY), [cameraConfig, originX, originY]);
  const torsoLeftShoulder = useMemo(() => project3DToSvg({ x: -95, y: 15, z: -25 }, cameraConfig, originX, originY), [cameraConfig, originX, originY]);
  const torsoRightShoulder = useMemo(() => project3DToSvg({ x: 95, y: 15, z: -25 }, cameraConfig, originX, originY), [cameraConfig, originX, originY]);

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

    let mouthW = 6;
    let mouthH = 2;
    let mouthCurvature = 0;
    const lowerMouth = mouthPattern.toLowerCase();
    if (lowerMouth.includes('o') || lowerMouth.includes('u')) {
      mouthW = 4;
      mouthH = 5;
    } else if (
      lowerMouth.includes('a') ||
      lowerMouth.includes('e') ||
      lowerMouth.includes('good') ||
      lowerMouth.includes('yes') ||
      lowerMouth.includes('friend') ||
      lowerMouth.includes('thank')
    ) {
      mouthW = 7.5;
      mouthH = 2.5;
      mouthCurvature = 3;
    } else if (lowerMouth.includes('no') || lowerMouth.includes('question')) {
      mouthW = 6;
      mouthH = 3.5;
      mouthCurvature = -1.5;
    }

    const zFace = headCenter3D.z + 14;
    const zNose = headCenter3D.z + 18;

    const leftBrowOut = project3DToSvg({ x: headCenter3D.x - 11, y: headCenter3D.y - 10 + browOuterDy, z: zFace }, cameraConfig, originX, originY);
    const leftBrowIn = project3DToSvg({ x: headCenter3D.x - 3, y: headCenter3D.y - 11 + browInnerDy, z: zFace + 1 }, cameraConfig, originX, originY);
    const rightBrowIn = project3DToSvg({ x: headCenter3D.x + 3, y: headCenter3D.y - 11 + browInnerDy, z: zFace + 1 }, cameraConfig, originX, originY);
    const rightBrowOut = project3DToSvg({ x: headCenter3D.x + 11, y: headCenter3D.y - 10 + browOuterDy, z: zFace }, cameraConfig, originX, originY);

    const leftEye = project3DToSvg({ x: headCenter3D.x - 7, y: headCenter3D.y - 5, z: zFace }, cameraConfig, originX, originY);
    const rightEye = project3DToSvg({ x: headCenter3D.x + 7, y: headCenter3D.y - 5, z: zFace }, cameraConfig, originX, originY);

    const noseBridge = project3DToSvg({ x: headCenter3D.x, y: headCenter3D.y - 3, z: zNose - 2 }, cameraConfig, originX, originY);
    const noseTip = project3DToSvg({ x: headCenter3D.x, y: headCenter3D.y + 4, z: zNose }, cameraConfig, originX, originY);

    const mouthLeft = project3DToSvg({ x: headCenter3D.x - mouthW, y: headCenter3D.y + 13 - mouthCurvature, z: zFace }, cameraConfig, originX, originY);
    const mouthCenter = project3DToSvg({ x: headCenter3D.x, y: headCenter3D.y + 14, z: zFace + 2 }, cameraConfig, originX, originY);
    const mouthRight = project3DToSvg({ x: headCenter3D.x + mouthW, y: headCenter3D.y + 13 - mouthCurvature, z: zFace }, cameraConfig, originX, originY);

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
  }, [headCenter3D, cameraConfig, originX, originY, eyebrowState, mouthPattern, headTilt]);

  // Project non-dominant hand (The Paper) using WASM 3D Kernel
  const baseWrist = project3DToSvg(BSL_BASE_HAND.wrist, cameraConfig, originX, originY);
  const basePalm = project3DToSvg(BSL_BASE_HAND.palm, cameraConfig, originX, originY);
  const baseFingertips = useMemo(() => {
    return BSL_BASE_HAND.fingertips.map((tip, idx) => ({
      ...tip,
      idx,
      proj: project3DToSvg(tip, cameraConfig, originX, originY),
    }));
  }, [cameraConfig, originX, originY]);

  // Project dominant hand (The Pen) complete anatomical landmarks using WASM 3D Kernel
  const domHand3D = useMemo(() => {
    const w = interpolatedWrist;
    const k = interpolatedKnuckle;
    const t = interpolatedTip;

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

    // Curled fingertips tucked into the palm (pointing hand posture)
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

    // Thumb base, knuckle, and tip (folded across knuckles)
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
    const thumbTip: Point3D = {
      x: k.x * 0.6 + kMid.x * 0.4 - ufx * 4,
      y: k.y * 0.6 + kMid.y * 0.4 - ufy * 4,
      z: k.z + 8,
    };

    // Forearm entry point
    const forearm: Point3D = {
      x: w.x - ufx * 36 + ulx * 6,
      y: w.y - ufy * 36 + uly * 6 + 28,
      z: w.z - 20,
    };

    return {
      wrist: w,
      knuckleIndex: k,
      tipIndex: t,
      palm,
      kMid,
      kRing,
      kPinky,
      tipMidCurled,
      tipRingCurled,
      tipPinkyCurled,
      thumbBase,
      thumbKnuckle,
      thumbTip,
      forearm,
    };
  }, [interpolatedWrist, interpolatedKnuckle, interpolatedTip]);

  // Project all dominant hand landmarks to 2D SVG stage
  const domWrist = project3DToSvg(domHand3D.wrist, cameraConfig, originX, originY);
  const domKnuckle = project3DToSvg(domHand3D.knuckleIndex, cameraConfig, originX, originY);
  const domTip = project3DToSvg(domHand3D.tipIndex, cameraConfig, originX, originY);
  const domPalm = project3DToSvg(domHand3D.palm, cameraConfig, originX, originY);
  const domKMid = project3DToSvg(domHand3D.kMid, cameraConfig, originX, originY);
  const domKRing = project3DToSvg(domHand3D.kRing, cameraConfig, originX, originY);
  const domKPinky = project3DToSvg(domHand3D.kPinky, cameraConfig, originX, originY);
  const domTipMid = project3DToSvg(domHand3D.tipMidCurled, cameraConfig, originX, originY);
  const domTipRing = project3DToSvg(domHand3D.tipRingCurled, cameraConfig, originX, originY);
  const domTipPinky = project3DToSvg(domHand3D.tipPinkyCurled, cameraConfig, originX, originY);
  const domThumbBase = project3DToSvg(domHand3D.thumbBase, cameraConfig, originX, originY);
  const domThumbKnuckle = project3DToSvg(domHand3D.thumbKnuckle, cameraConfig, originX, originY);
  const domThumbTip = project3DToSvg(domHand3D.thumbTip, cameraConfig, originX, originY);
  const domForearm = project3DToSvg(domHand3D.forearm, cameraConfig, originX, originY);

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

  // Button styling helper
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
          {/* 3D Pan / Orbit Controls Toggle */}
          <button
            type="button"
            onClick={() => setShowPanControls((prev) => !prev)}
            style={{
              background: showPanControls ? '#0284c7' : 'transparent',
              border: `1px solid ${showPanControls ? '#38bdf8' : 'rgba(56, 189, 248, 0.2)'}`,
              color: showPanControls ? '#ffffff' : '#94a3b8',
              cursor: 'pointer',
              padding: '2px 5px',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: 700,
            }}
            title="Toggle 3D Camera Orbit & Pan D-Pad"
          >
            🌐 Orbit
          </button>

          {/* Quick Corner Dock Dropdown / Cycle */}
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
              onClick={() => handleDockCorner('br')}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '1px 2px', fontSize: '0.7rem' }}
              title="Dock Bottom-Right"
            >
              ↘
            </button>
          </div>

          {/* Reset Position Button */}
          {windowPos && (
            <button
              type="button"
              onClick={handleResetWindowPos}
              style={{ background: 'transparent', border: 'none', color: '#f59e0b', cursor: 'pointer', padding: '2px 4px', fontSize: '0.75rem' }}
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
                padding: '2px 4px',
                borderRadius: '4px',
                fontSize: '0.78rem',
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

      {/* 3D Skeletal Vector Stage with Pointer Drag Orbit */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '150px',
          background: 'radial-gradient(ellipse at center, #1e293b 0%, #090d16 100%)',
          cursor: is3DDraggingRef.current ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      >
        <svg
          viewBox="0 0 240 170"
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

          {/* Clear Visual Two-Hand Architecture Headers */}
          <text x="60" y="13" fill="#94a3b8" fontSize="7" fontWeight="800" textAnchor="middle" letterSpacing="0.3">✋ LEFT HAND (BASE / VOWELS)</text>
          <text x="180" y="13" fill="#38bdf8" fontSize="7" fontWeight="800" textAnchor="middle" letterSpacing="0.3">👉 RIGHT HAND (SIGNER / PEN)</text>

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
            
            {/* Head Silhouette Base */}
            <ellipse
              cx={torsoHead.x}
              cy={torsoHead.y}
              rx={19 * torsoHead.scale}
              ry={25 * torsoHead.scale}
              fill="rgba(15, 23, 42, 0.7)"
              stroke={eyebrowState === 'raised' ? '#38bdf8' : (eyebrowState === 'furrowed' ? '#f59e0b' : '#64748b')}
              strokeWidth={eyebrowState !== 'neutral' ? '1.8' : '1.2'}
            />

            {/* Chin Locus Indicator */}
            <circle cx={torsoChin.x} cy={torsoChin.y} r={2.5 * torsoChin.scale} fill="#94a3b8" opacity="0.6" />

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
                  strokeWidth={2.4 * torsoHead.scale}
                  strokeLinecap="round"
                />
                <line
                  x1={facialLandmarks.rightBrowIn.x}
                  y1={facialLandmarks.rightBrowIn.y}
                  x2={facialLandmarks.rightBrowOut.x}
                  y2={facialLandmarks.rightBrowOut.y}
                  stroke={eyebrowState === 'raised' ? '#38bdf8' : (eyebrowState === 'furrowed' ? '#f59e0b' : '#cbd5e1')}
                  strokeWidth={2.4 * torsoHead.scale}
                  strokeLinecap="round"
                />

                {/* Left Eye */}
                <ellipse
                  cx={facialLandmarks.leftEye.x}
                  cy={facialLandmarks.leftEye.y}
                  rx={2.8 * torsoHead.scale}
                  ry={1.8 * torsoHead.scale}
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth="0.8"
                />
                <circle
                  cx={facialLandmarks.leftEye.x}
                  cy={facialLandmarks.leftEye.y}
                  r={1.2 * torsoHead.scale}
                  fill="#38bdf8"
                />

                {/* Right Eye */}
                <ellipse
                  cx={facialLandmarks.rightEye.x}
                  cy={facialLandmarks.rightEye.y}
                  rx={2.8 * torsoHead.scale}
                  ry={1.8 * torsoHead.scale}
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth="0.8"
                />
                <circle
                  cx={facialLandmarks.rightEye.x}
                  cy={facialLandmarks.rightEye.y}
                  r={1.2 * torsoHead.scale}
                  fill="#38bdf8"
                />

                {/* Nose Bridge */}
                <line
                  x1={facialLandmarks.noseBridge.x}
                  y1={facialLandmarks.noseBridge.y}
                  x2={facialLandmarks.noseTip.x}
                  y2={facialLandmarks.noseTip.y}
                  stroke="#64748b"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity="0.8"
                />

                {/* Mouth & Lips (Dynamic Mouthing Aperture & Lip Pattern) */}
                {mouthPattern ? (
                  <path
                    d={`M ${facialLandmarks.mouthLeft.x} ${facialLandmarks.mouthLeft.y} Q ${facialLandmarks.mouthCenter.x} ${facialLandmarks.mouthCenter.y + (facialLandmarks.mouthH * torsoHead.scale)} ${facialLandmarks.mouthRight.x} ${facialLandmarks.mouthRight.y}`}
                    fill="rgba(56, 189, 248, 0.25)"
                    stroke="#38bdf8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d={`M ${facialLandmarks.mouthLeft.x} ${facialLandmarks.mouthLeft.y} Q ${facialLandmarks.mouthCenter.x} ${facialLandmarks.mouthCenter.y} ${facialLandmarks.mouthRight.x} ${facialLandmarks.mouthRight.y}`}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                )}
              </g>
            )}
          </g>

          {/* Grid lines floor reference */}
          <line x1="15" y1="150" x2="225" y2="150" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <line x1="120" y1="130" x2="120" y2="160" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

          {/* NON-DOMINANT HAND (The Paper) */}
          <g id="bsl-base-hand" opacity="0.95">
            <polygon
              points={`${baseWrist.x},${baseWrist.y} ${baseFingertips[0].proj.x},${baseFingertips[0].proj.y} ${baseFingertips[1].proj.x},${baseFingertips[1].proj.y} ${baseFingertips[4].proj.x},${baseFingertips[4].proj.y}`}
              fill="rgba(56, 189, 248, 0.08)"
              stroke="rgba(56, 189, 248, 0.4)"
              strokeWidth="1.2"
            />

            {baseFingertips.map((tip) => {
              const isSelectedVowel = currentPose.activeVowelIndex === tip.idx;
              return (
                <g key={`base-finger-${tip.id}`}>
                  <line
                    x1={basePalm.x}
                    y1={basePalm.y}
                    x2={tip.proj.x}
                    y2={tip.proj.y}
                    stroke={isSelectedVowel ? '#f59e0b' : '#38bdf8'}
                    strokeWidth={isSelectedVowel ? 3 : 2}
                    strokeLinecap="round"
                    opacity={isSelectedVowel ? 1 : 0.75}
                  />
                  <circle
                    cx={tip.proj.x}
                    cy={tip.proj.y}
                    r={isSelectedVowel ? 5.5 * tip.proj.scale : 4 * tip.proj.scale}
                    fill={isSelectedVowel ? '#f59e0b' : '#0ea5e9'}
                    stroke="#ffffff"
                    strokeWidth={isSelectedVowel ? 1.5 : 1}
                  />
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
            })}

            <circle cx={baseWrist.x} cy={baseWrist.y} r={5 * baseWrist.scale} fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
            <circle cx={basePalm.x} cy={basePalm.y} r={4 * basePalm.scale} fill="#38bdf8" opacity="0.6" />
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

            {/* 4. Curled Middle Finger */}
            <line x1={domPalm.x} y1={domPalm.y} x2={domKMid.x} y2={domKMid.y} stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={domKMid.x} y1={domKMid.y} x2={domTipMid.x} y2={domTipMid.y} stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
            <circle cx={domKMid.x} cy={domKMid.y} r={3.5 * domKMid.scale} fill="#0284c7" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx={domTipMid.x} cy={domTipMid.y} r={3 * domTipMid.scale} fill="#38bdf8" />

            {/* 5. Curled Ring Finger */}
            <line x1={domPalm.x} y1={domPalm.y} x2={domKRing.x} y2={domKRing.y} stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
            <line x1={domKRing.x} y1={domKRing.y} x2={domTipRing.x} y2={domTipRing.y} stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <circle cx={domKRing.x} cy={domKRing.y} r={3.2 * domKRing.scale} fill="#0284c7" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx={domTipRing.x} cy={domTipRing.y} r={2.8 * domTipRing.scale} fill="#38bdf8" />

            {/* 6. Curled Pinky Finger */}
            <line x1={domPalm.x} y1={domPalm.y} x2={domKPinky.x} y2={domKPinky.y} stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <line x1={domKPinky.x} y1={domKPinky.y} x2={domTipPinky.x} y2={domTipPinky.y} stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
            <circle cx={domKPinky.x} cy={domKPinky.y} r={3 * domKPinky.scale} fill="#0284c7" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx={domTipPinky.x} cy={domTipPinky.y} r={2.5 * domTipPinky.scale} fill="#38bdf8" />

            {/* 7. Thumb (folded/cupped) */}
            <line x1={domThumbBase.x} y1={domThumbBase.y} x2={domThumbKnuckle.x} y2={domThumbKnuckle.y} stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" />
            <line x1={domThumbKnuckle.x} y1={domThumbKnuckle.y} x2={domThumbTip.x} y2={domThumbTip.y} stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={domThumbKnuckle.x} cy={domThumbKnuckle.y} r={3.8 * domThumbKnuckle.scale} fill="#0284c7" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx={domThumbTip.x} cy={domThumbTip.y} r={3.5 * domThumbTip.scale} fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />

            {/* 8. Active Extended Pointer (Index Finger) */}
            <line x1={domPalm.x} y1={domPalm.y} x2={domKnuckle.x} y2={domKnuckle.y} stroke="#38bdf8" strokeWidth="3.2" strokeLinecap="round" />
            <line x1={domKnuckle.x} y1={domKnuckle.y} x2={domTip.x} y2={domTip.y} stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <circle cx={domKnuckle.x} cy={domKnuckle.y} r={4.5 * domKnuckle.scale} fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
            <circle cx={domTip.x} cy={domTip.y} r={5.2 * domTip.scale} fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
            {currentLetter && (
              <circle
                cx={domTip.x}
                cy={domTip.y}
                r={10 * domTip.scale}
                fill="url(#bslTouchPulse)"
                opacity="0.85"
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
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '6px',
            padding: '3px 8px',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: currentLetter.length > 2 ? '0.82rem' : '1.1rem',
              fontWeight: 900,
              color: currentLetter.includes('[') ? '#fbbf24' : currentPose.isVowel ? '#f59e0b' : '#38bdf8',
            }}
          >
            {currentLetter || '—'}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.62rem', color: currentLetter.includes('[') ? '#fbbf24' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {currentLetter.includes('[') ? '✨ BSL Whole Sign' : currentPose.label || 'Ready'}
            </span>
            {activeWordDisplay && (
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f8fafc' }}>
                {activeWordDisplay}
              </span>
            )}
          </div>
        </div>

        {/* BSL Non-Manual Features (NMF) Live Badge */}
        {showFacialFeatures && (activeNmf?.eyebrows || activeNmf?.mouth || activeNmf?.headTilt) && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(15, 23, 42, 0.92)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '6px',
              padding: '2px 7px',
              fontSize: '0.62rem',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            <span>😊 NMF:</span>
            {activeNmf.eyebrows && activeNmf.eyebrows !== 'neutral' && (
              <span style={{ color: activeNmf.eyebrows === 'raised' ? '#38bdf8' : '#f59e0b', fontWeight: 800 }}>
                {activeNmf.eyebrows === 'raised' ? 'Brows Raised' : 'Brows Furrowed'}
              </span>
            )}
            {activeNmf.mouth && (
              <span style={{ color: '#f1f5f9', fontStyle: 'italic', fontWeight: 600 }}>
                👄 &ldquo;{activeNmf.mouth}&rdquo;
              </span>
            )}
            {activeNmf.headTilt && activeNmf.headTilt !== 'neutral' && (
              <span style={{ color: '#a78bfa', fontWeight: 700 }}>
                {activeNmf.headTilt === 'nod' ? '✓ Nod' : 'Tilt'}
              </span>
            )}
          </div>
        )}

        {/* Camera Angle & Face Toggle Bar */}
        <div style={{ position: 'absolute', bottom: '8px', left: '8px', display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setViewAngle((prev) => (prev === 'signer' ? 'receiver' : 'signer'))}
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '6px',
              padding: '2px 7px',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#38bdf8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
            title="Toggle between Signer POV (first-person) and Receiver POV (conversation partner)"
          >
            <span>{viewAngle === 'signer' ? '👤 Signer' : '👥 Receiver'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFacialFeatures((prev) => !prev)}
            style={{
              background: showFacialFeatures ? 'rgba(56, 189, 248, 0.18)' : 'rgba(15, 23, 42, 0.85)',
              border: `1px solid ${showFacialFeatures ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}`,
              borderRadius: '6px',
              padding: '2px 7px',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: showFacialFeatures ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
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
            bottom: '8px',
            right: '8px',
            fontSize: '0.6rem',
            color: '#64748b',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '1px 5px',
            borderRadius: '4px',
            pointerEvents: 'none',
          }}
        >
          Drag to 3D Orbit • Scroll to Zoom
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
        {QUICK_SIGNS.map((s) => (
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
            maxLength={20}
            style={{
              width: '74px',
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

  return typeof document !== 'undefined' && document.body
    ? createPortal(overlayWindow, document.body)
    : overlayWindow;
};

export default BslInterpreterOverlay;
