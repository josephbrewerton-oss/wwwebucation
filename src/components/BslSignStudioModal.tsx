/**
 * src/components/BslSignStudioModal.tsx
 *
 * St Joseph's Educational Media Suite - British Sign Language (BSL) Sign Studio & Keyframe Poser
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * An interactive, zero-video visual authoring environment for creating, editing, and previewing
 * procedural 3D vector BSL signs. Persists to browser IndexedDB and exports to standard AST S-Expressions.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Point3D,
  BslHandShape,
  BslBaseHandMode,
  BslNmf,
  project3DToSvg,
  DOMINANT_REST_POSE,
  DOMINANT_REST_KNUCKLE,
  DOMINANT_REST_WRIST,
  BSL_BASE_HAND,
  BSL_BASE_REST_HAND,
} from '../utils/bslAlphabet';
import { BslSign, BslSignKeyframe, BslCategory, lookupBslSign } from '../utils/bslLexicon';
import { serializeSignToAst, parseAstNodeToSign } from '../utils/bslAstCodec';
import { parseSExpr } from '../utils/sexprParser';
import { analyzeAndTransformBslGrammar } from '../utils/bslGrammarEngine';
import {
  saveCustomBslSign,
  getCustomBslSign,
  loadCustomBslSigns,
  deleteCustomBslSign,
} from '../services/customSignStore';
import { closeBslSignStudio, broadcastBslSpeech } from '../services/bslGlobalStore';

interface BslSignStudioModalProps {
  initialWord?: string;
  onClose: () => void;
}

const HANDSHAPES: { id: BslHandShape; label: string; icon: string; desc: string }[] = [
  { id: 'flat', label: 'Flat Palm', icon: '✋', desc: 'Open fingers together' },
  { id: 'fist', label: 'Closed Fist', icon: '✊', desc: 'All fingers folded in' },
  { id: 'point', label: 'Index Point', icon: '☝️', desc: 'Index extended, others folded' },
  { id: 'claw', label: 'Curved Claw', icon: '🖐️', desc: 'Fingers curved like a claw' },
  { id: 'spread', label: 'Spread Open', icon: '👐', desc: 'Fingers open and splayed' },
  { id: 'v', label: 'Two-Finger V', icon: '✌️', desc: 'Index and middle in a V' },
];

const PRESET_POSITIONS: {
  name: string;
  tip: Point3D;
  knuckle: Point3D;
  wrist: Point3D;
}[] = [
  {
    name: 'Neutral Rest',
    tip: { x: 28, y: 70, z: -10 },
    knuckle: { x: 25, y: 85, z: -15 },
    wrist: { x: 20, y: 100, z: -20 },
  },
  {
    name: 'Chest Center',
    tip: { x: 5, y: 35, z: 15 },
    knuckle: { x: 10, y: 45, z: 10 },
    wrist: { x: 18, y: 60, z: 5 },
  },
  {
    name: 'Heart / Sacred',
    tip: { x: -8, y: 28, z: 15 },
    knuckle: { x: -3, y: 38, z: 12 },
    wrist: { x: 5, y: 52, z: 8 },
  },
  {
    name: 'Forehead / Head',
    tip: { x: 8, y: -22, z: 18 },
    knuckle: { x: 12, y: -10, z: 14 },
    wrist: { x: 20, y: 12, z: 8 },
  },
  {
    name: 'Forward Gesture',
    tip: { x: 15, y: 25, z: 35 },
    knuckle: { x: 18, y: 40, z: 25 },
    wrist: { x: 20, y: 60, z: 10 },
  },
  {
    name: 'Heaven Lift',
    tip: { x: 18, y: -30, z: 22 },
    knuckle: { x: 20, y: -15, z: 18 },
    wrist: { x: 22, y: 15, z: 10 },
  },
  {
    name: 'Down Hand Touch',
    tip: { x: 0, y: 40, z: 10 },
    knuckle: { x: 5, y: 48, z: 8 },
    wrist: { x: 12, y: 60, z: 5 },
  },
];

export const BslSignStudioModal: React.FC<BslSignStudioModalProps> = ({
  initialWord = '',
  onClose,
}) => {
  // Sign Metadata State
  const [word, setWord] = useState<string>(initialWord ? initialWord.toUpperCase() : 'NEW_SIGN');
  const [englishLabel, setEnglishLabel] = useState<string>(
    initialWord ? initialWord.charAt(0).toUpperCase() + initialWord.slice(1).toLowerCase() : 'New Sign'
  );
  const [category, setCategory] = useState<BslCategory>('school');
  const [gloss, setGloss] = useState<string>(initialWord ? initialWord.toUpperCase() : 'NEW-SIGN');
  const [description, setDescription] = useState<string>('Custom authored curriculum sign.');
  const [aliasesText, setAliasesText] = useState<string>('');
  const [isDirectional, setIsDirectional] = useState<boolean>(false);
  const [directionalFrom, setDirectionalFrom] = useState<string>('ME');
  const [directionalTo, setDirectionalTo] = useState<string>('YOU');
  const [syntaxTestInput, setSyntaxTestInput] = useState<string>('');
  const [syntaxTestResult, setSyntaxTestResult] = useState<string>('');

  // Keyframes State
  const [keyframes, setKeyframes] = useState<BslSignKeyframe[]>([
    {
      label: 'Initial Pose',
      rule: 'Begin from chest level',
      targetTip: { x: 12, y: 35, z: 20 },
      targetKnuckle: { x: 16, y: 45, z: 14 },
      targetWrist: { x: 20, y: 60, z: 8 },
      shape: 'flat',
      baseHandMode: 'rest',
      nmf: { mouth: initialWord.toLowerCase(), eyebrows: 'neutral', headTilt: 'neutral' },
    },
    {
      label: 'Final Gesture',
      rule: 'Extend outward with gentle nod',
      targetTip: { x: 18, y: 20, z: 32 },
      targetKnuckle: { x: 20, y: 35, z: 22 },
      targetWrist: { x: 22, y: 55, z: 10 },
      shape: 'spread',
      baseHandMode: 'mirror',
      nmf: { mouth: initialWord.toLowerCase(), eyebrows: 'raised', headTilt: 'nod' },
    },
  ]);

  const [activeKeyframeIndex, setActiveKeyframeIndex] = useState<number>(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [previewProgress, setPreviewProgress] = useState<number>(0);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [viewAngle, setViewAngle] = useState<'signer' | 'receiver'>('receiver');
  const [existingCustomSigns, setExistingCustomSigns] = useState<string[]>([]);

  // Load existing sign if available
  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (initialWord) {
        const custom = await getCustomBslSign(initialWord);
        const builtIn = lookupBslSign(initialWord);
        const target = custom || builtIn;
        if (target && isMounted) {
          setWord(target.word);
          setEnglishLabel(target.englishLabel || target.word);
          setCategory(target.category || 'school');
          setGloss(target.gloss || target.word);
          setDescription(target.description || '');
          if (target.aliases) setAliasesText(target.aliases.join(', '));
          if (target.isDirectional) {
            setIsDirectional(true);
            if (target.defaultLoci) {
              setDirectionalFrom(target.defaultLoci.from || 'ME');
              setDirectionalTo(target.defaultLoci.to || 'YOU');
            }
          }
          if (target.keyframes && target.keyframes.length > 0) {
            setKeyframes(JSON.parse(JSON.stringify(target.keyframes)));
          }
        }
      }
      const customMap = await loadCustomBslSigns();
      if (isMounted) {
        setExistingCustomSigns(Object.keys(customMap));
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [initialWord]);

  // Preview Loop animation
  const animRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isPlayingPreview || keyframes.length === 0) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let startTime = performance.now();
    const durationPerKeyframe = 650;
    const totalDuration = keyframes.length * durationPerKeyframe;

    const frame = (now: number) => {
      const elapsed = (now - startTime) % totalDuration;
      const progress = elapsed / totalDuration;
      setPreviewProgress(progress);
      animRef.current = requestAnimationFrame(frame);
    };

    animRef.current = requestAnimationFrame(frame);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlayingPreview, keyframes]);

  // Compute currently displayed pose (either animated preview or active keyframe)
  const currentKeyframe = keyframes[activeKeyframeIndex] || keyframes[0];

  const displayedKeyframe: BslSignKeyframe = React.useMemo(() => {
    if (!isPlayingPreview || keyframes.length <= 1) {
      return currentKeyframe;
    }

    const totalKf = keyframes.length;
    const exactKf = previewProgress * totalKf;
    const fromIdx = Math.floor(exactKf) % totalKf;
    const toIdx = (fromIdx + 1) % totalKf;
    const t = exactKf - Math.floor(exactKf);

    const from = keyframes[fromIdx];
    const to = keyframes[toIdx];

    return {
      label: `Preview ${fromIdx + 1} ➔ ${toIdx + 1}`,
      rule: to.rule || from.rule,
      shape: t > 0.5 ? to.shape : from.shape,
      baseHandMode: t > 0.5 ? to.baseHandMode : from.baseHandMode,
      nmf: t > 0.5 ? to.nmf : from.nmf,
      targetTip: {
        x: from.targetTip.x + (to.targetTip.x - from.targetTip.x) * t,
        y: from.targetTip.y + (to.targetTip.y - from.targetTip.y) * t,
        z: from.targetTip.z + (to.targetTip.z - from.targetTip.z) * t,
      },
      targetKnuckle: {
        x: from.targetKnuckle.x + (to.targetKnuckle.x - from.targetKnuckle.x) * t,
        y: from.targetKnuckle.y + (to.targetKnuckle.y - from.targetKnuckle.y) * t,
        z: from.targetKnuckle.z + (to.targetKnuckle.z - from.targetKnuckle.z) * t,
      },
      targetWrist: {
        x: from.targetWrist.x + (to.targetWrist.x - from.targetWrist.x) * t,
        y: from.targetWrist.y + (to.targetWrist.y - from.targetWrist.y) * t,
        z: from.targetWrist.z + (to.targetWrist.z - from.targetWrist.z) * t,
      },
    };
  }, [isPlayingPreview, keyframes, previewProgress, currentKeyframe]);

  // Keyframe Editing Operations
  const updateActiveKeyframe = (patch: Partial<BslSignKeyframe>) => {
    setKeyframes((prev) => {
      const next = [...prev];
      next[activeKeyframeIndex] = {
        ...next[activeKeyframeIndex],
        ...patch,
      };
      return next;
    });
  };

  const handleAddKeyframe = () => {
    const last = keyframes[keyframes.length - 1] || currentKeyframe;
    const newKf: BslSignKeyframe = {
      label: `Pose ${keyframes.length + 1}`,
      rule: 'Hold position',
      targetTip: { ...last.targetTip, y: last.targetTip.y + 5 },
      targetKnuckle: { ...last.targetKnuckle },
      targetWrist: { ...last.targetWrist },
      shape: last.shape || 'flat',
      baseHandMode: last.baseHandMode || 'rest',
      nmf: { ...(last.nmf || {}) },
    };
    setKeyframes([...keyframes, newKf]);
    setActiveKeyframeIndex(keyframes.length);
  };

  const handleDeleteKeyframe = (idx: number) => {
    if (keyframes.length <= 1) return;
    const next = keyframes.filter((_, i) => i !== idx);
    setKeyframes(next);
    setActiveKeyframeIndex(Math.min(activeKeyframeIndex, next.length - 1));
  };

  const handleApplyPreset = (preset: (typeof PRESET_POSITIONS)[0]) => {
    updateActiveKeyframe({
      targetTip: { ...preset.tip },
      targetKnuckle: { ...preset.knuckle },
      targetWrist: { ...preset.wrist },
    });
  };

  // Save to IndexedDB & Hot-Reload
  const handleSaveSign = async () => {
    const cleanWord = word.trim().toUpperCase();
    if (!cleanWord) {
      setSaveStatus('Word name required');
      return;
    }

    const aliases = aliasesText
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const signToSave: BslSign = {
      id: cleanWord.toLowerCase(),
      word: cleanWord,
      category,
      englishLabel: englishLabel.trim() || cleanWord,
      gloss: gloss.trim().toUpperCase() || cleanWord,
      description: description.trim(),
      keyframes,
      aliases: aliases.length > 0 ? aliases : undefined,
      isDirectional: isDirectional ? true : undefined,
      defaultLoci: isDirectional ? { from: directionalFrom, to: directionalTo } : undefined,
    };

    try {
      await saveCustomBslSign(signToSave);
      setSaveStatus('✅ Saved to Local Lexicon!');
      setExistingCustomSigns((prev) =>
        prev.includes(cleanWord) ? prev : [...prev, cleanWord]
      );
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus('❌ Failed to save');
      console.error(err);
    }
  };

  // Export current sign as AST S-Expression file download
  const handleExportAst = () => {
    const sign: BslSign = {
      id: word.trim().toLowerCase(),
      word: word.trim().toUpperCase(),
      category,
      englishLabel,
      gloss,
      description,
      keyframes,
      aliases: aliasesText.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
      isDirectional: isDirectional ? true : undefined,
      defaultLoci: isDirectional ? { from: directionalFrom, to: directionalTo } : undefined,
    };

    const astText = serializeSignToAst(sign);
    const blob = new Blob([astText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bsl-${word.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.ast`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Synthesize Keyframes from Natural Description (Edge AI / Heuristic)
  const handleSynthesizeFromDescription = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);

    try {
      const promptLower = aiPrompt.toLowerCase();
      let generatedShape: BslHandShape = 'flat';
      let generatedMode: BslBaseHandMode = 'rest';
      let eyebrows: 'neutral' | 'raised' | 'furrowed' = 'neutral';
      let headTilt: 'neutral' | 'nod' | 'shake' = 'neutral';

      if (promptLower.includes('point') || promptLower.includes('finger') || promptLower.includes('indicate')) {
        generatedShape = 'point';
      } else if (promptLower.includes('fist') || promptLower.includes('punch') || promptLower.includes('strong')) {
        generatedShape = 'fist';
      } else if (promptLower.includes('claw') || promptLower.includes('curved') || promptLower.includes('grab')) {
        generatedShape = 'claw';
      } else if (promptLower.includes('spread') || promptLower.includes('open') || promptLower.includes('sun') || promptLower.includes('star')) {
        generatedShape = 'spread';
      } else if (promptLower.includes('two') || promptLower.includes('cut') || promptLower.includes('peace') || promptLower.includes('victory')) {
        generatedShape = 'v';
      }

      if (promptLower.includes('both') || promptLower.includes('mirror') || promptLower.includes('together') || promptLower.includes('symmetrical')) {
        generatedMode = 'mirror';
      } else if (promptLower.includes('palm') || promptLower.includes('book') || promptLower.includes('table') || promptLower.includes('touch left')) {
        generatedMode = 'vowel-board';
      }

      if (promptLower.includes('question') || promptLower.includes('wonder') || promptLower.includes('ask') || promptLower.includes('look up')) {
        eyebrows = 'raised';
      } else if (promptLower.includes('why') || promptLower.includes('focus') || promptLower.includes('intense')) {
        eyebrows = 'furrowed';
      }

      if (promptLower.includes('yes') || promptLower.includes('agree') || promptLower.includes('holy') || promptLower.includes('pray')) {
        headTilt = 'nod';
      }

      // Synthesize 2 keyframes based on spatial direction
      let kf1Tip: Point3D = { x: 10, y: 35, z: 15 };
      let kf2Tip: Point3D = { x: 15, y: 20, z: 30 };

      if (promptLower.includes('up') || promptLower.includes('sky') || promptLower.includes('heaven') || promptLower.includes('rise')) {
        kf1Tip = { x: 10, y: 30, z: 15 };
        kf2Tip = { x: 12, y: -20, z: 25 };
      } else if (promptLower.includes('down') || promptLower.includes('ground') || promptLower.includes('lower') || promptLower.includes('sink')) {
        kf1Tip = { x: 12, y: 20, z: 20 };
        kf2Tip = { x: 10, y: 65, z: 15 };
      } else if (promptLower.includes('circle') || promptLower.includes('orbit') || promptLower.includes('spin') || promptLower.includes('around')) {
        kf1Tip = { x: -10, y: 25, z: 20 };
        kf2Tip = { x: 25, y: 25, z: 25 };
      }

      const synthesized: BslSignKeyframe[] = [
        {
          label: 'Inception Pose',
          rule: `Prepare ${generatedShape} handshape`,
          targetTip: kf1Tip,
          targetKnuckle: { x: kf1Tip.x + 3, y: kf1Tip.y + 12, z: kf1Tip.z - 5 },
          targetWrist: { x: kf1Tip.x + 8, y: kf1Tip.y + 25, z: kf1Tip.z - 10 },
          shape: generatedShape,
          baseHandMode: generatedMode,
          nmf: { mouth: word.toLowerCase(), eyebrows, headTilt: 'neutral' },
        },
        {
          label: 'Focal Expression',
          rule: `Deliver kinetic motion for ${word}`,
          targetTip: kf2Tip,
          targetKnuckle: { x: kf2Tip.x + 2, y: kf2Tip.y + 12, z: kf2Tip.z - 6 },
          targetWrist: { x: kf2Tip.x + 6, y: kf2Tip.y + 26, z: kf2Tip.z - 12 },
          shape: generatedShape,
          baseHandMode: generatedMode,
          nmf: { mouth: word.toLowerCase(), eyebrows, headTilt },
        },
      ];

      setKeyframes(synthesized);
      setActiveKeyframeIndex(0);
      setIsPlayingPreview(true);
      setSaveStatus('✨ Synthesized 2 Keyframes!');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Test current sign live in global BSL stream
  const handleTestInInterpreter = () => {
    broadcastBslSpeech({ word: word.toUpperCase(), subtitle: englishLabel });
  };

  // 3D Perspective Projection for Studio Stage
  const camera = {
    yaw: viewAngle === 'receiver' ? 180 : 0,
    pitch: viewAngle === 'receiver' ? -8 : 24,
    distance: 360,
    fov: 60,
  };

  const dominantTip2D = project3DToSvg(displayedKeyframe.targetTip, camera, 0, 0);
  const dominantKnuckle2D = project3DToSvg(displayedKeyframe.targetKnuckle, camera, 0, 0);
  const dominantWrist2D = project3DToSvg(displayedKeyframe.targetWrist, camera, 0, 0);

  // Base hand coordinates
  const baseMode = displayedKeyframe.baseHandMode || 'rest';
  let baseTip3D: Point3D = BSL_BASE_REST_HAND.fingertips[2];
  let baseKnuckle3D: Point3D = BSL_BASE_REST_HAND.palm;
  let baseWrist3D: Point3D = BSL_BASE_REST_HAND.wrist;

  if (baseMode === 'mirror') {
    baseTip3D = { ...displayedKeyframe.targetTip, x: -displayedKeyframe.targetTip.x };
    baseKnuckle3D = { ...displayedKeyframe.targetKnuckle, x: -displayedKeyframe.targetKnuckle.x };
    baseWrist3D = { ...displayedKeyframe.targetWrist, x: -displayedKeyframe.targetWrist.x };
  } else if (baseMode === 'vowel-board') {
    baseTip3D = BSL_BASE_HAND.fingertips[2];
    baseKnuckle3D = BSL_BASE_HAND.palm;
    baseWrist3D = BSL_BASE_HAND.wrist;
  }

  const baseTip2D = project3DToSvg(baseTip3D, camera, 0, 0);
  const baseKnuckle2D = project3DToSvg(baseKnuckle3D, camera, 0, 0);
  const baseWrist2D = project3DToSvg(baseWrist3D, camera, 0, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bsl-studio-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">🖐️</span>
            <div>
              <h2 id="bsl-studio-title" className="text-base font-bold text-white tracking-wide">
                BSL Sign Studio — Procedural Vector Poser
              </h2>
              <p className="text-xs text-sky-400 font-medium">
                Author new curriculum signs • Zero-Video AST S-Expressions • Offline IndexedDB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saveStatus && (
              <span className="text-xs font-semibold px-2 py-1 bg-sky-950 text-sky-300 border border-sky-800 rounded">
                {saveStatus}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white px-2.5 py-1 text-sm rounded bg-slate-800/80 hover:bg-slate-700 transition"
              title="Close Sign Studio"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Studio Body: Two Column Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Column: Visual 3D Poser Stage (5 cols) */}
          <div className="lg:col-span-5 p-4 flex flex-col bg-slate-950/40">
            {/* View angle & Stage controls */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                3D Vector Stage
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewAngle('receiver')}
                  className={`text-xs px-2 py-0.5 rounded transition ${
                    viewAngle === 'receiver'
                      ? 'bg-sky-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Receiver POV
                </button>
                <button
                  type="button"
                  onClick={() => setViewAngle('signer')}
                  className={`text-xs px-2 py-0.5 rounded transition ${
                    viewAngle === 'signer'
                      ? 'bg-sky-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Signer POV
                </button>
              </div>
            </div>

            {/* SVG Visual Stage */}
            <div className="relative aspect-square w-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
              <svg viewBox="-80 -80 160 160" className="w-full h-full select-none">
                <defs>
                  <radialGradient id="stageGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="0" cy="0" r="70" fill="url(#stageGlow)" />

                {/* Coordinate Grid Guides */}
                <circle cx="0" cy="0" r="45" fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="-70" y1="0" x2="70" y2="0" stroke="#1e293b" strokeWidth="0.75" />
                <line x1="0" y1="-70" x2="0" y2="70" stroke="#1e293b" strokeWidth="0.75" />

                {/* Stylized Upper Torso Outline */}
                <ellipse cx="0" cy="55" rx="36" ry="18" fill="#1e293b" opacity="0.4" />
                <circle cx="0" cy="-28" r="16" fill="#1e293b" opacity="0.3" />

                {/* Non-Dominant Base Hand (Orange/Amber) */}
                {baseMode !== 'rest' && (
                  <g id="studio-base-hand">
                    <line
                      x1={baseWrist2D.x}
                      y1={baseWrist2D.y}
                      x2={baseKnuckle2D.x}
                      y2={baseKnuckle2D.y}
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1={baseKnuckle2D.x}
                      y1={baseKnuckle2D.y}
                      x2={baseTip2D.x}
                      y2={baseTip2D.y}
                      stroke="#fbbf24"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                    <circle cx={baseWrist2D.x} cy={baseWrist2D.y} r="3" fill="#d97706" />
                    <circle cx={baseKnuckle2D.x} cy={baseKnuckle2D.y} r="3.2" fill="#f59e0b" />
                    <circle cx={baseTip2D.x} cy={baseTip2D.y} r="3.5" fill="#fef08a" />
                  </g>
                )}

                {/* Dominant Hand Kinematic Skeleton (Cyan/Sky) */}
                <g id="studio-dominant-hand">
                  {/* Wrist to Knuckle Forearm / Metacarpal */}
                  <line
                    x1={dominantWrist2D.x}
                    y1={dominantWrist2D.y}
                    x2={dominantKnuckle2D.x}
                    y2={dominantKnuckle2D.y}
                    stroke="#0284c7"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Knuckle to Finger Tip */}
                  <line
                    x1={dominantKnuckle2D.x}
                    y1={dominantKnuckle2D.y}
                    x2={dominantTip2D.x}
                    y2={dominantTip2D.y}
                    stroke="#38bdf8"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  {/* Joint Nodes */}
                  <circle cx={dominantWrist2D.x} cy={dominantWrist2D.y} r="3.5" fill="#0369a1" />
                  <circle cx={dominantKnuckle2D.x} cy={dominantKnuckle2D.y} r="3.8" fill="#0284c7" />
                  <circle cx={dominantTip2D.x} cy={dominantTip2D.y} r="4.2" fill="#7dd3fc" />
                </g>

                {/* Non-Manual Eyebrows & Mouthing Indicators */}
                {displayedKeyframe.nmf && (
                  <g id="studio-nmf" transform="translate(0, -28)">
                    {displayedKeyframe.nmf.eyebrows === 'raised' && (
                      <path d="M -7 -6 Q -4 -9 -1 -6 M 1 -6 Q 4 -9 7 -6" fill="none" stroke="#38bdf8" strokeWidth="1.2" />
                    )}
                    {displayedKeyframe.nmf.eyebrows === 'furrowed' && (
                      <path d="M -7 -8 Q -4 -6 -1 -5 M 1 -5 Q 4 -6 7 -8" fill="none" stroke="#f43f5e" strokeWidth="1.2" />
                    )}
                    {displayedKeyframe.nmf.mouth && (
                      <text x="0" y="8" fill="#94a3b8" fontSize="5" textAnchor="middle" fontWeight="bold">
                        "{displayedKeyframe.nmf.mouth}"
                      </text>
                    )}
                  </g>
                )}
              </svg>

              {/* Status overlay badge */}
              <div className="absolute top-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[11px] font-mono text-sky-300 border border-slate-700/50">
                Shape: :{displayedKeyframe.shape || 'flat'} • Base: :{baseMode}
              </div>
            </div>

            {/* Playback Controls & Timeline */}
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  isPlayingPreview
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-sky-600 hover:bg-sky-500 text-white'
                }`}
              >
                {isPlayingPreview ? '⏸ Pause Loop' : '▶️ Play Sign Loop'}
              </button>
              <button
                type="button"
                onClick={handleTestInInterpreter}
                className="py-1.5 px-3 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                title="Send active sign to global in-vision interpreter"
              >
                📡 Test Live
              </button>
            </div>

            {/* Keyframe Step Tabs */}
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-400">Keyframe Sequence</span>
                <button
                  type="button"
                  onClick={handleAddKeyframe}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                >
                  + Add Pose
                </button>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {keyframes.map((kf, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsPlayingPreview(false);
                      setActiveKeyframeIndex(idx);
                    }}
                    className={`px-3 py-1 text-xs rounded font-medium shrink-0 transition flex items-center gap-1 ${
                      activeKeyframeIndex === idx
                        ? 'bg-sky-700 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Pose {idx + 1}</span>
                    {keyframes.length > 1 && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteKeyframe(idx);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            handleDeleteKeyframe(idx);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-400 ml-1"
                        title="Delete keyframe"
                      >
                        ✕
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Position Presets */}
            <div className="mt-3 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                Quick Anatomical Presets:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_POSITIONS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="text-left text-[11px] px-2 py-1 bg-slate-800/80 hover:bg-slate-700/80 rounded text-slate-300 transition truncate"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Parameters, Handshape & Metadata Editor (7 cols) */}
          <div className="lg:col-span-7 p-4 flex flex-col space-y-4">
            {/* Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Word Identifier (UPPERCASE)
                </label>
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value.toUpperCase())}
                  placeholder="e.g. PHOTOSYNTHESIS"
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-sm font-bold text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  English Display Label
                </label>
                <input
                  type="text"
                  value={englishLabel}
                  onChange={(e) => setEnglishLabel(e.target.value)}
                  placeholder="e.g. Photosynthesis"
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BslCategory)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="school">School & Classroom</option>
                  <option value="faith">Catholic Faith & Liturgy</option>
                  <option value="stem">STEM & Science</option>
                  <option value="conversation">Conversation & Social</option>
                  <option value="grammar">Grammar & Directional Verbs (Level 2/3)</option>
                  <option value="temporal">Temporal & Timeline (Level 2/3)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Aliases (Comma separated)
                </label>
                <input
                  type="text"
                  value={aliasesText}
                  onChange={(e) => setAliasesText(e.target.value)}
                  placeholder="e.g. PLANT_GROWTH, LIGHT_FEEDING"
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Level 2/3 Directional Verb & Spatial Loci Configuration */}
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-sky-300 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDirectional}
                    onChange={(e) => setIsDirectional(e.target.checked)}
                    className="accent-sky-500 rounded"
                  />
                  <span>Directional Agreement Verb (Level 2/3 Spatial Loci)</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isDirectional ? `[${directionalFrom} ➔ ${directionalTo}]` : 'Static Trajectory'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Directional verbs (e.g. GIVE, ASK, TELL, SHOW) modulate their 3D starting and ending points dynamically based on grammatical subject and object loci.
              </p>
              {isDirectional && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Origin Locus (Sender / From)</label>
                    <select
                      value={directionalFrom}
                      onChange={(e) => setDirectionalFrom(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                    >
                      <option value="ME">1P: Me (Signer Chest)</option>
                      <option value="YOU">2P: You (Addressee Forward)</option>
                      <option value="LOCUS_A">3P: Locus A (Left Space)</option>
                      <option value="LOCUS_B">3P: Locus B (Right Space)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Target Locus (Recipient / To)</label>
                    <select
                      value={directionalTo}
                      onChange={(e) => setDirectionalTo(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                    >
                      <option value="YOU">2P: You (Addressee Forward)</option>
                      <option value="ME">1P: Me (Signer Chest)</option>
                      <option value="LOCUS_B">3P: Locus B (Right Space)</option>
                      <option value="LOCUS_A">3P: Locus A (Left Space)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Dominant Handshape Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Active Pose Handshape (:shape)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {HANDSHAPES.map((hs) => (
                  <button
                    key={hs.id}
                    type="button"
                    onClick={() => updateActiveKeyframe({ shape: hs.id })}
                    className={`p-2 rounded flex flex-col items-center justify-center border text-center transition ${
                      currentKeyframe.shape === hs.id
                        ? 'bg-sky-950 border-sky-500 text-sky-200'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                    title={hs.desc}
                  >
                    <span className="text-lg">{hs.icon}</span>
                    <span className="text-[11px] font-semibold mt-0.5">{hs.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Coordinate Sliders */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                Pose 3D Vector Offsets (Tip: [{currentKeyframe.targetTip.x}, {currentKeyframe.targetTip.y}, {currentKeyframe.targetTip.z}])
              </span>
              <div className="space-y-2">
                {/* Horizontal X */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-slate-400">X (L/R):</span>
                  <input
                    type="range"
                    min="-40"
                    max="60"
                    value={currentKeyframe.targetTip.x}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateActiveKeyframe({
                        targetTip: { ...currentKeyframe.targetTip, x: val },
                        targetKnuckle: { ...currentKeyframe.targetKnuckle, x: val + 4 },
                        targetWrist: { ...currentKeyframe.targetWrist, x: val + 8 },
                      });
                    }}
                    className="flex-1 accent-sky-500"
                  />
                  <span className="w-8 font-mono text-right text-slate-300">{currentKeyframe.targetTip.x}</span>
                </div>
                {/* Vertical Y */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-slate-400">Y (Up/Dn):</span>
                  <input
                    type="range"
                    min="-40"
                    max="80"
                    value={currentKeyframe.targetTip.y}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateActiveKeyframe({
                        targetTip: { ...currentKeyframe.targetTip, y: val },
                        targetKnuckle: { ...currentKeyframe.targetKnuckle, y: val + 12 },
                        targetWrist: { ...currentKeyframe.targetWrist, y: val + 25 },
                      });
                    }}
                    className="flex-1 accent-sky-500"
                  />
                  <span className="w-8 font-mono text-right text-slate-300">{currentKeyframe.targetTip.y}</span>
                </div>
                {/* Depth Z */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-slate-400">Z (Depth):</span>
                  <input
                    type="range"
                    min="-20"
                    max="50"
                    value={currentKeyframe.targetTip.z}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateActiveKeyframe({
                        targetTip: { ...currentKeyframe.targetTip, z: val },
                        targetKnuckle: { ...currentKeyframe.targetKnuckle, z: val - 6 },
                        targetWrist: { ...currentKeyframe.targetWrist, z: val - 12 },
                      });
                    }}
                    className="flex-1 accent-sky-500"
                  />
                  <span className="w-8 font-mono text-right text-slate-300">{currentKeyframe.targetTip.z}</span>
                </div>
              </div>
            </div>

            {/* Non-Dominant Hand Mode & Non-Manual Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Base Hand Mode (:base-mode)
                </label>
                <select
                  value={currentKeyframe.baseHandMode || 'rest'}
                  onChange={(e) =>
                    updateActiveKeyframe({ baseHandMode: e.target.value as BslBaseHandMode })
                  }
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                >
                  <option value="rest">Resting at Side (1-Handed)</option>
                  <option value="mirror">Mirror Dominant (2-Handed Symmetrical)</option>
                  <option value="vowel-board">Open Flat Palm (Base / Table)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Eyebrows Marker (NMF)
                </label>
                <select
                  value={currentKeyframe.nmf?.eyebrows || 'neutral'}
                  onChange={(e) =>
                    updateActiveKeyframe({
                      nmf: {
                        ...(currentKeyframe.nmf || {}),
                        eyebrows: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                >
                  <option value="neutral">Neutral</option>
                  <option value="raised">Raised (Question / Openness)</option>
                  <option value="furrowed">Furrowed (Wh-Question / Intensity)</option>
                </select>
              </div>
            </div>

            {/* Head Motion NMF (Nod / Shake / Tilt) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Head Movement Marker (NMF)
                </label>
                <select
                  value={currentKeyframe.nmf?.headTilt || 'neutral'}
                  onChange={(e) =>
                    updateActiveKeyframe({
                      nmf: {
                        ...(currentKeyframe.nmf || {}),
                        headTilt: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                >
                  <option value="neutral">Neutral</option>
                  <option value="nod">Nod (Affirmation / Agreement)</option>
                  <option value="shake">Shake (Negation / Denial)</option>
                  <option value="tilt-left">Tilt Left</option>
                  <option value="tilt-right">Tilt Right</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mouth Viseme / Speech Cue
                </label>
                <input
                  type="text"
                  value={currentKeyframe.nmf?.mouth || ''}
                  onChange={(e) =>
                    updateActiveKeyframe({
                      nmf: {
                        ...(currentKeyframe.nmf || {}),
                        mouth: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. give, no, what"
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* AI Synthesizer / Descriptive Assistant */}
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-xs font-semibold text-sky-400 block mb-1">
                🤖 Edge AI / Heuristic Keyframe Synthesizer
              </span>
              <p className="text-[11px] text-slate-400 mb-2">
                Type a natural gesture description (e.g. "Open flat hand rises towards the sky like a sun beam").
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe hand motion, shape or direction..."
                  className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleSynthesizeFromDescription}
                  disabled={isAiGenerating}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold transition disabled:opacity-50"
                >
                  {isAiGenerating ? 'Generating...' : 'Synthesize'}
                </button>
              </div>
            </div>

            {/* Level 2/3 Natural Syntax Tester & Preview Playground */}
            <div className="bg-slate-950/90 p-3 rounded-lg border border-sky-900/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <span>⚖️</span>
                  <span>Level 2/3 BSL Natural Syntax Playground</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">OSV & Directional</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Test full English sentences to see authentic Topic-Comment reordering, time fronting, and agreement verb loci modulation in action.
              </p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={syntaxTestInput}
                  onChange={(e) => setSyntaxTestInput(e.target.value)}
                  placeholder="e.g. What did the teacher give you yesterday?"
                  className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!syntaxTestInput.trim()) return;
                    const res = analyzeAndTransformBslGrammar(syntaxTestInput, { mode: 'bsl-natural' });
                    setSyntaxTestResult(res.glossSequence);
                    broadcastBslSpeech({ subtitle: syntaxTestInput });
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition"
                >
                  Test & Sign
                </button>
              </div>
              {syntaxTestResult && (
                <div className="p-2 bg-slate-900/90 rounded border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto whitespace-nowrap">
                  {syntaxTestResult}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveSign}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg transition flex items-center gap-1.5"
                >
                  <span>💾</span>
                  <span>Save to Lexicon</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportAst}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                  title="Export as AST S-Expression file"
                >
                  Export .ast
                </button>
              </div>

              {existingCustomSigns.includes(word.toUpperCase()) && (
                <button
                  type="button"
                  onClick={async () => {
                    await deleteCustomBslSign(word);
                    setSaveStatus('Deleted');
                    setExistingCustomSigns((prev) => prev.filter((w) => w !== word.toUpperCase()));
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1"
                >
                  Delete Sign
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
