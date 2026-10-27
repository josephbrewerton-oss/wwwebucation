// src/components/NeuralLabCanvas.tsx
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CurriculumSelector } from './CurriculumSelector';
import { QuestionCard } from './QuestionCard';
import NeuralAstCanvasTopology from './NeuralAstCanvasTopology';
import { dispatch } from '../engine/hypercall';
import { hypervisor, GuestVMState, HypervisorMetrics } from '../engine/hypervisor';
import { hasUserGrantedAiConsent, setUserAiConsent } from '../engine/aicaller';
import { getSavedLanguage, listenToLanguageChange } from '../engine/operational-language';
import { findCurriculumKnowledge } from '../data/oakCurriculumKnowledge';
import { resolveCurriculumRoute } from '../curriculum/curriculumMesh';
import { PRNG } from '../engine/prng';
import { TrajectoryEngine, CognitiveTrajectoryState } from '../engine/trajectoryEngine';
import { LessonSequencer, PedagogicalStage } from '../engine/lessonSequencer';
import {
  playSuccessChime,
  playIncorrectTone,
  triggerHapticSuccess,
  triggerHapticError,
} from '../services/soundHaptics';
import {
  triggerCorrectConfetti,
  triggerStreakCelebration,
  triggerMasteryConfetti,
} from '../utils/confetti';
import { openPlayerModal, resolvePresetForTopic } from '../services/playerLauncher';
import { stripPromptDecorators, extractDataPayloadFromAst } from '../utils/astQuestionExtractor';
import {
  getDataCartridges,
  getDataCartridge,
  findDataCartridgeForTopic,
  exportDataCartridgeAsAst,
  saveCustomCartridge,
  type CartridgeDefinition,
} from '../services/cartridgeStore';

const AstVectorMediaPlayer = React.lazy(() => import('./AstVectorMediaPlayer'));

interface NeuralLabCanvasProps {
  initialKeyStage?: string;
  initialSubject?: string;
  initialUnit?: string;
  initialCartridgeId?: string;
  onTopicChange?: (keyStage: string, subject: string, unit: string) => void;
}

export default function NeuralLabCanvas({
  initialKeyStage,
  initialSubject,
  initialUnit,
  initialCartridgeId,
  onTopicChange,
}: NeuralLabCanvasProps) {
  const [curriculumSetting, setCurriculumSetting] = useState<string>(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('curriculum_standard')) || 'uk_oak';
  });

  const [selectedKeyStage, setSelectedKeyStage] = useState(() => initialKeyStage || (typeof window !== 'undefined' ? localStorage.getItem('stj_active_stage') : null) || 'Key Stage 1');
  const [selectedSubject, setSelectedSubject] = useState(() => initialSubject || (typeof window !== 'undefined' ? localStorage.getItem('stj_active_subject') : null) || 'Science');
  const [selectedUnit, setSelectedUnit] = useState(() => initialUnit || (typeof window !== 'undefined' ? localStorage.getItem('stj_active_unit') : null) || 'Seasonal Changes');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [sessionId, setSessionId] = useState('Lesson 1');
  const [questionMode, setQuestionMode] = useState<'card' | 'stage'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('practice_question_mode');
      if (saved === 'card' || saved === 'stage') return saved;
    }
    return 'card';
  });

  const [activeLang, setActiveLang] = useState<string>(() => {
    return typeof window !== 'undefined' ? getSavedLanguage() : 'en';
  });

  useEffect(() => {
    const unsub = listenToLanguageChange((newLang) => {
      setActiveLang(newLang);
    });
    return unsub;
  }, []);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState<'warmup' | 'challenger' | 'brainbuster'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('preferred_difficulty') as any) || 'challenger';
    }
    return 'challenger';
  });
  const [hasConsent, setHasConsent] = useState(false);
  const [showCanvasTopology, setShowCanvasTopology] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('practice_show_topology') === 'true';
    }
    return false;
  });

  const handleSetQuestionMode = (mode: 'card' | 'stage') => {
    setQuestionMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('practice_question_mode', mode);
    }
  };

  const handleToggleCanvasTopology = () => {
    setShowCanvasTopology((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('practice_show_topology', String(next));
      }
      return next;
    });
  };

  // Modular Data Cartridges State (Question Banks & Diagnostic Decks)
  const [dataCartridgesList, setDataCartridgesList] = useState<CartridgeDefinition[]>(() => getDataCartridges());
  const [mountedDataCartridge, setMountedDataCartridge] = useState<CartridgeDefinition | null>(() => {
    if (initialCartridgeId) {
      const direct = getDataCartridge(initialCartridgeId);
      if (direct && direct.dataPayload) return direct;
    }
    if (initialUnit) {
      const match = findDataCartridgeForTopic(initialKeyStage, initialSubject, initialUnit);
      if (match && match.dataPayload) return match;
    }
    return null;
  });
  const [activeDeckQuestionIndex, setActiveDeckQuestionIndex] = useState(0);
  const [isCartridgeModalOpen, setIsCartridgeModalOpen] = useState(false);
  const [cartridgeFilterSubject, setCartridgeFilterSubject] = useState('All');
  const [cartridgeToast, setCartridgeToast] = useState<string | null>(null);

  // Synchronize mountedDataCartridge whenever selection coordinates change
  useEffect(() => {
    const matched = findDataCartridgeForTopic(selectedKeyStage, selectedSubject, selectedUnit);
    if (matched && matched.dataPayload) {
      setMountedDataCartridge(matched);
      setActiveDeckQuestionIndex(0);
    } else {
      setMountedDataCartridge(null);
      setActiveDeckQuestionIndex(0);
    }
  }, [selectedKeyStage, selectedSubject, selectedUnit]);

  useEffect(() => {
    const handleUpdate = () => {
      setDataCartridgesList(getDataCartridges());
    };
    window.addEventListener('cartridges_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('cartridges_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Hypervisor Host Supervisor State & Metrics
  const [vmState, setVmState] = useState<GuestVMState>(() => hypervisor.getState());
  const [vmMetrics, setVmMetrics] = useState<HypervisorMetrics>(() => hypervisor.getMetrics());

  useEffect(() => {
    return hypervisor.subscribe((state, metrics) => {
      setVmState(state);
      setVmMetrics(metrics);
    });
  }, []);

  useEffect(() => {
    setHasConsent(hasUserGrantedAiConsent());
    const onConsentChanged = (e: any) => setHasConsent(Boolean(e.detail));
    window.addEventListener('ai_consent_changed', onConsentChanged);
    window.addEventListener('storage', () => setHasConsent(hasUserGrantedAiConsent()));
    return () => window.removeEventListener('ai_consent_changed', onConsentChanged);
  }, []);
  const [trajectoryState, setTrajectoryState] = useState<CognitiveTrajectoryState | null>(null);
  const [streamTransition, setStreamTransition] = useState<{
    nextSeedToken: string;
    pedagogicalIntent: string;
    adaptationLabel: string;
  } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<{
    id?: string;
    seedToken?: string;
    pedagogicalStage?: PedagogicalStage;
    stageBadge?: string;
    stepLabel?: string;
    pedagogicalIntent?: string;
    prompt: string;
    displayOptions: string[];
    rawOptions: string[];
    hint?: string;
    explanation?: string;
    misconceptions?: string[];
    socraticFollowUp?: string;
    keyStage: string;
    subject: string;
    unit: string;
    lessonTitle?: string;
    urn?: string;
    csn?: string;
    routeEngine?: string;
    cartridgeId?: string;
    cartridgeTitle?: string;
    deckQuestionIndex?: number;
    totalDeckQuestions?: number;
    tier?: string;
    axiom?: string;
    trap?: string;
  } | null>(null);

  const activeRequestIdRef = useRef(0);
  const recentPromptsRef = useRef<string[]>([]);
  const activeQuestionRef = useRef(activeQuestion);
  const activeSelectionRef = useRef({
    keyStage: selectedKeyStage,
    subject: selectedSubject,
    unit: selectedUnit,
    lesson: selectedLesson,
  });

  useEffect(() => {
    activeQuestionRef.current = activeQuestion;
  }, [activeQuestion]);

  useEffect(() => {
    activeSelectionRef.current = {
      keyStage: selectedKeyStage,
      subject: selectedSubject,
      unit: selectedUnit,
      lesson: selectedLesson,
    };
  }, [selectedKeyStage, selectedSubject, selectedUnit, selectedLesson]);

  useEffect(() => {
    if (initialKeyStage && initialKeyStage !== selectedKeyStage) {
      setSelectedKeyStage(initialKeyStage);
    }
  }, [initialKeyStage]);

  useEffect(() => {
    if (initialSubject && initialSubject !== selectedSubject) {
      setSelectedSubject(initialSubject);
    }
  }, [initialSubject]);

  useEffect(() => {
    if (initialUnit && initialUnit !== selectedUnit) {
      setSelectedUnit(initialUnit);
    }
  }, [initialUnit]);

  // 1. Resolve Curriculum Tree via Unified Node Dispatch (fetch full tree once)
  const [curriculumTree, setCurriculumTree] = useState<any>(null);
  useEffect(() => {
    dispatch('CurriculumNode', {
      intent: 'resolve:tree',
      payload: {},
    }).then((res) => {
      if (res.ok && res.data) setCurriculumTree(res.data);
    });
  }, []);

  const slugify = (text: string) =>
    (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const sanitizeHint = (raw?: string): string => {
    if (!raw) return 'Review the core definition and eliminate options that contradict the rule.';
    return raw
      .replace(/^[\s\S]*?\*\*Response:\*\*/i, '')
      .replace(/^[\s\S]*?(?:Okay,?\s+here['’]?s\s+(?:a\s+)?socratic\s+hint[^:]*:\s*|Here(?:'s|\s+is)\s+a\s+hint:?)/i, '')
      .replace(/\((?:Since|Based on|If they|Note).*?\)/gi, '')
      .replace(/\*\*.*?\*\*/g, '')
      .replace(/^"(.*)"$/, '$1')
      .replace(/^(?:Hint|Tutor Hint|Prof\. Turing):\s*/i, '')
      .trim();
  };

  const handleNewQuestion = useCallback((payload: any) => {
    setIsGenerating(false);
    const { question, keyStage, subject, unit } = payload;
    if (!question?.options || question.options.length < 2) return;

    const rawKey = typeof question.answerKey === 'number' ? question.answerKey : 0;
    const rawOptions = question.options;
    const rawMisconceptions = Array.isArray(question.misconceptions) ? question.misconceptions : [];

    // Pair options with their misconceptions before shuffling
    const items = rawOptions.map((opt: string, idx: number) => ({
      text: opt,
      misconception: rawMisconceptions[idx] || (idx === rawKey ? 'Correct!' : 'Common conceptual trap.'),
      isCorrect: idx === rawKey,
    }));

    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const computedCorrectIndex = shuffled.findIndex((item) => item.isCorrect);
    setCorrectIndex(computedCorrectIndex !== -1 ? computedCorrectIndex : 0);
    setSelectedAnswer(null);

    if (question.prompt) {
      const pTrimmed = question.prompt.trim();
      recentPromptsRef.current = [pTrimmed, ...recentPromptsRef.current.filter((p) => p !== pTrimmed)].slice(0, 15);
    }

    if (typeof question.deckQuestionIndex === 'number') {
      setActiveDeckQuestionIndex(question.deckQuestionIndex);
    }

    setActiveQuestion({
      id: question.id || `q_${Date.now()}`,
      urn: question.urn,
      csn: question.csn,
      routeEngine: question.routeEngine,
      cartridgeId: question.cartridgeId,
      cartridgeTitle: question.cartridgeTitle,
      deckQuestionIndex: question.deckQuestionIndex,
      totalDeckQuestions: question.totalDeckQuestions,
      tier: question.tier,
      axiom: question.axiom,
      trap: question.trap,
      seedToken: question.seedToken || payload.seedToken || '',
      pedagogicalStage: question.pedagogicalStage,
      stageBadge: question.stageBadge,
      stepLabel: question.stepLabel,
      pedagogicalIntent: question.pedagogicalIntent,
      prompt: question.prompt,
      displayOptions: shuffled.map((s) => s.text),
      misconceptions: shuffled.map((s) => s.misconception),
      rawOptions: question.options,
      hint: question.hint || payload.hint || '',
      explanation: question.explanation || payload.explanation || '',
      socraticFollowUp: question.socraticFollowUp || payload.socraticFollowUp || '',
      keyStage: keyStage || activeSelectionRef.current.keyStage,
      subject: subject || activeSelectionRef.current.subject,
      unit: unit || activeSelectionRef.current.unit,
      lessonTitle: payload.lessonTitle || activeSelectionRef.current.lesson || undefined,
    });
  }, []);

  // 2. Request Question via Unified Node Dispatch (Cache -> Bus -> LLM synthesis handled in engine)
  const requestQuestion = useCallback(async (
    ks = activeSelectionRef.current.keyStage,
    sub = activeSelectionRef.current.subject,
    u = activeSelectionRef.current.unit,
    diff = difficulty,
    targetLang = activeLang,
    forceVariation = false,
    customSeed?: string,
    lessonTitle = activeSelectionRef.current.lesson,
    targetDeckIndex?: number,
    targetCartridgeId?: string
  ) => {
    const requestId = ++activeRequestIdRef.current;
    setIsGenerating(true);
    setSelectedAnswer(null);
    setCorrectIndex(null);

    // Hard fallback timer ensuring the UI never gets stuck in a generating state (aligned with hypervisor watchdog)
    const safetyTimer = setTimeout(() => {
      if (requestId === activeRequestIdRef.current) {
        setIsGenerating(false);
      }
    }, 32000);

    setStreamTransition(null);

    try {
      const currentPrompt = activeQuestionRef.current?.prompt || '';
      const seedToUse = customSeed !== undefined && customSeed !== '' ? customSeed : undefined;
      const res = await dispatch('QuestionEngine', {
        intent: 'synthesize:governed',
        payload: {
          keyStage: ks,
          subject: sub,
          topic: u,
          lessonTitle,
          curriculum: curriculumSetting,
          difficulty: diff,
          lang: targetLang,
          forceVariation,
          excludePrompt: currentPrompt,
          seed: seedToUse,
          nonce: Math.floor(Math.random() * 1000000),
          cartridgeId: targetCartridgeId || mountedDataCartridge?.id,
          deckQuestionIndex: targetDeckIndex,
        },
      });

      if (requestId !== activeRequestIdRef.current) return;

      if (res.ok && res.data) {
        let questionData = res.data;
        // Strict guard: If the returned question stem matches the current active question stem, rotate to an alternate question
        const cleanStem = stripPromptDecorators(questionData.prompt || '').toLowerCase();
        const currentStem = stripPromptDecorators(currentPrompt || '').toLowerCase();
        const recentStems = recentPromptsRef.current.map(p => stripPromptDecorators(p).toLowerCase());
        const isDuplicate = Boolean(currentStem && cleanStem && (cleanStem === currentStem || recentStems.includes(cleanStem)));

        if (isDuplicate) {
          const route = resolveCurriculumRoute(ks, sub, u);
          const offline = findCurriculumKnowledge(ks, sub, u);
          const allBankQuestions = [
            ...(route?.questions || []),
            ...(offline?.questions || [])
          ];
          const isQMatch = (qPrompt: string) => {
            const stem = stripPromptDecorators(qPrompt || '').toLowerCase();
            return !stem || stem === currentStem || recentStems.includes(stem);
          };
          const candidateQuestions = allBankQuestions.filter((q) => !isQMatch(q.prompt));
          const alt = candidateQuestions.length > 0
            ? candidateQuestions[Math.floor(Math.random() * candidateQuestions.length)]
            : allBankQuestions.find((q) => stripPromptDecorators(q.prompt || '').toLowerCase() !== currentStem);
          if (alt) {
            questionData = {
              ...questionData,
              id: alt.id || questionData.id,
              prompt: alt.prompt,
              options: alt.options,
              answerKey: alt.answerKey,
              hint: alt.hint || questionData.hint,
              explanation: alt.explanation || questionData.explanation,
            };
          } else if (allBankQuestions.length > 0) {
            // All questions in this unit have been seen in this session; reset history and cycle cleanly
            recentPromptsRef.current = [currentPrompt];
            const recycled = allBankQuestions.find((q) => stripPromptDecorators(q.prompt || '').toLowerCase() !== currentStem) || allBankQuestions[0];
            questionData = {
              ...questionData,
              id: recycled.id || questionData.id,
              prompt: recycled.prompt,
              options: recycled.options,
              answerKey: recycled.answerKey,
              hint: recycled.hint || questionData.hint,
              explanation: recycled.explanation || questionData.explanation,
            };
          }
        }

        handleNewQuestion({
          question: questionData,
          keyStage: ks,
          subject: sub,
          unit: u,
          hint: questionData.hint || '',
          seedToken: questionData.seedToken,
        });
      }
    } catch {
      if (requestId === activeRequestIdRef.current) {
        const fallbackOffline = findCurriculumKnowledge(ks, sub, u);
        const currentPrompt = activeQuestionRef.current?.prompt || '';
        if (fallbackOffline && fallbackOffline.questions?.length > 0) {
          const eligible = fallbackOffline.questions.filter((q) => q.prompt.trim() !== currentPrompt.trim());
          const chosen = eligible.length > 0
            ? eligible[Math.floor(Math.random() * eligible.length)]
            : fallbackOffline.questions[0];
          handleNewQuestion({
            question: chosen,
            keyStage: ks,
            subject: sub,
            unit: u,
            hint: chosen.hint || '',
          });
        }
      }
    } finally {
      clearTimeout(safetyTimer);
      if (requestId === activeRequestIdRef.current) {
        setIsGenerating(false);
      }
    }
  }, [curriculumSetting, difficulty, activeLang, handleNewQuestion]);

  const handleKeyStageSelect = (newKs: string, firstSub: string, firstUnit: string) => {
    const nextSub = firstSub || selectedSubject;
    const nextUnit = firstUnit || selectedUnit;
    if (typeof window !== 'undefined') {
      localStorage.setItem('stj_active_stage', newKs);
      localStorage.setItem('stj_active_subject', nextSub);
      localStorage.setItem('stj_active_unit', nextUnit);
    }
    activeSelectionRef.current = {
      keyStage: newKs,
      subject: nextSub,
      unit: nextUnit,
      lesson: '',
    };
    setSelectedKeyStage(newKs);
    setSelectedSubject(nextSub);
    setSelectedUnit(nextUnit);
    setSelectedLesson('');
    onTopicChange?.(newKs, nextSub, nextUnit);
    requestQuestion(newKs, nextSub, nextUnit, difficulty, activeLang, false, undefined, '');
  };

  const handleSubjectSelect = (newSub: string, firstUnit: string) => {
    const nextUnit = firstUnit || selectedUnit;
    if (typeof window !== 'undefined') {
      localStorage.setItem('stj_active_stage', selectedKeyStage);
      localStorage.setItem('stj_active_subject', newSub);
      localStorage.setItem('stj_active_unit', nextUnit);
    }
    activeSelectionRef.current = {
      keyStage: selectedKeyStage,
      subject: newSub,
      unit: nextUnit,
      lesson: '',
    };
    setSelectedSubject(newSub);
    setSelectedUnit(nextUnit);
    setSelectedLesson('');
    onTopicChange?.(selectedKeyStage, newSub, nextUnit);
    requestQuestion(selectedKeyStage, newSub, nextUnit, difficulty, activeLang, false, undefined, '');
  };

  const handleUnitSelect = (newUnit: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('stj_active_stage', selectedKeyStage);
      localStorage.setItem('stj_active_subject', selectedSubject);
      localStorage.setItem('stj_active_unit', newUnit);
    }
    activeSelectionRef.current = {
      keyStage: selectedKeyStage,
      subject: selectedSubject,
      unit: newUnit,
      lesson: '',
    };
    setSelectedUnit(newUnit);
    setSelectedLesson('');
    onTopicChange?.(selectedKeyStage, selectedSubject, newUnit);
    requestQuestion(selectedKeyStage, selectedSubject, newUnit, difficulty, activeLang, false, undefined, '');
  };

  const handleLessonSelect = (lesson: string) => {
    activeSelectionRef.current = {
      keyStage: selectedKeyStage,
      subject: selectedSubject,
      unit: selectedUnit,
      lesson,
    };
    setSelectedLesson(lesson);
    requestQuestion(selectedKeyStage, selectedSubject, selectedUnit, difficulty, activeLang, false, undefined, lesson);
  };

  const handleDifficultyChange = (newDiff: 'warmup' | 'challenger' | 'brainbuster') => {
    setDifficulty(newDiff);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred_difficulty', newDiff);
    }
    requestQuestion(selectedKeyStage, selectedSubject, selectedUnit, newDiff, activeLang, false, undefined, selectedLesson);
  };

  const handleJumpToDeckQuestion = (idx: number) => {
    if (!mountedDataCartridge) return;
    setActiveDeckQuestionIndex(idx);
    requestQuestion(
      selectedKeyStage,
      selectedSubject,
      selectedUnit,
      difficulty,
      activeLang,
      false,
      undefined,
      selectedLesson,
      idx,
      mountedDataCartridge.id
    );
  };

  const handleNextDeckQuestion = () => {
    if (!mountedDataCartridge || !mountedDataCartridge.dataPayload) {
      requestQuestion(selectedKeyStage, selectedSubject, selectedUnit, difficulty, activeLang, true);
      return;
    }
    const total = mountedDataCartridge.dataPayload.questions.length;
    const nextIdx = (activeDeckQuestionIndex + 1) % total;
    handleJumpToDeckQuestion(nextIdx);
  };

  const handlePrevDeckQuestion = () => {
    if (!mountedDataCartridge || !mountedDataCartridge.dataPayload) return;
    const total = mountedDataCartridge.dataPayload.questions.length;
    const prevIdx = (activeDeckQuestionIndex - 1 + total) % total;
    handleJumpToDeckQuestion(prevIdx);
  };

  const handleMountCartridge = (cart: CartridgeDefinition) => {
    setMountedDataCartridge(cart);
    setActiveDeckQuestionIndex(0);
    const stage = cart.dataPayload?.stage || cart.stage || selectedKeyStage;
    const sub = cart.dataPayload?.subject || cart.subject || selectedSubject;
    const unit = cart.dataPayload?.unit || cart.oakUnit || cart.title;

    setSelectedKeyStage(stage);
    setSelectedSubject(sub);
    setSelectedUnit(unit);
    setSelectedLesson('');
    onTopicChange?.(stage, sub, unit);
    setIsCartridgeModalOpen(false);

    requestQuestion(
      stage,
      sub,
      unit,
      difficulty,
      activeLang,
      false,
      undefined,
      '',
      0,
      cart.id
    );
    setCartridgeToast(`Mounted ${cart.title}!`);
    setTimeout(() => setCartridgeToast(null), 3000);
  };

  const handleExportCartridge = (cartId?: string) => {
    const id = cartId || mountedDataCartridge?.id;
    if (!id) return;
    const ast = exportDataCartridgeAsAst(id);
    if (!ast) return;
    const blob = new Blob([ast], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id}.ast`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setCartridgeToast(`Exported ${id}.ast`);
    setTimeout(() => setCartridgeToast(null), 3000);
  };

  const handleImportCustomCartridge = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const payload = extractDataPayloadFromAst(text);
      if (payload && payload.questions.length > 0) {
        const customId = `user-cart-${Date.now()}`;
        const newCart: CartridgeDefinition = {
          id: customId,
          title: `${payload.unit} (Custom Deck)`,
          stage: payload.stage,
          subject: payload.subject,
          oakUnit: payload.unit,
          category: payload.subject || 'Custom',
          type: 'Data',
          icon: '📦',
          desc: `Custom AST Data Cartridge (${payload.questions.length} questions).`,
          source: 'user',
          dataPayload: payload,
          astSource: text,
        };
        saveCustomCartridge(newCart);
        setDataCartridgesList(getDataCartridges());
        handleMountCartridge(newCart);
      } else {
        alert('Could not parse valid AST Data Cartridge. Please check format.');
      }
    };
    reader.readAsText(file);
  };

  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      requestQuestion(selectedKeyStage, selectedSubject, selectedUnit, difficulty, activeLang, false, undefined, selectedLesson);
    }
  }, []);

  // 3. User Selection & Progress Tracking via Unified Dispatch
  const handleSelectOption = (idx: number) => {
    if (selectedAnswer === correctIndex || !activeQuestion || correctIndex === null) return;

    setSelectedAnswer(idx);
    const isCorrect = idx === correctIndex;
    const feedbackText = isCorrect ? 'Spot on! Correct conceptual deduction.' : sanitizeHint(activeQuestion.hint);

    // Audio / UI Feedback
    dispatch('FeedbackSubstrate', {
      intent: 'emit:toast',
      payload: { text: feedbackText, isCorrect },
    });

    // Native Web Audio & Haptic Feedback
    if (isCorrect) {
      playSuccessChime();
      triggerHapticSuccess();
    } else {
      playIncorrectTone();
      triggerHapticError();
    }

    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => {
        const nextStreak = st + 1;
        if (nextStreak === 3 || nextStreak === 5 || nextStreak === 10 || nextStreak % 5 === 0) {
          triggerStreakCelebration(nextStreak);
        } else if (activeQuestion.pedagogicalStage === 'MASTERY') {
          triggerMasteryConfetti();
        } else {
          triggerCorrectConfetti();
        }
        return nextStreak;
      });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('active_student_misconception');
      }
    } else {
      setStreak(0);
      if (typeof window !== 'undefined' && activeQuestion.misconceptions?.[idx]) {
        // Broadcast the specific misconception to the Classroom Beacon for teacher oversight
        localStorage.setItem('active_student_misconception', activeQuestion.misconceptions[idx]);
      }
    }

    // Update in-memory cognitive trajectory lattice
    const updatedTrajectory = TrajectoryEngine.recordAttempt({
      seedToken: activeQuestion.seedToken || 'unknown_seed',
      topicId: `${slugify(activeQuestion.subject)}_${slugify(activeQuestion.unit)}`,
      selectedCoordinate: idx,
      correctCoordinate: correctIndex,
      isCorrect,
      misconceptionTag: !isCorrect ? activeQuestion.misconceptions?.[idx] : undefined,
      timestamp: Date.now(),
    });
    setTrajectoryState(updatedTrajectory);

    // Update Oak Pedagogical Sequence State (Hook -> Axiom -> Practice -> Pivot -> Mastery)
    const updatedLessonState = LessonSequencer.recordAttempt({
      keyStage: activeQuestion.keyStage || selectedKeyStage,
      subject: activeQuestion.subject,
      unit: activeQuestion.unit,
      isCorrect,
      misconceptionTag: !isCorrect ? activeQuestion.misconceptions?.[idx] : undefined,
    });

    // Compute deterministic next coordinate stream transition
    const nextTransition = TrajectoryEngine.deriveNextSeedStream({
      currentSeedToken: activeQuestion.seedToken || 'unknown_seed',
      previousCoordinate: idx,
      isCorrect,
      misconceptionTag: !isCorrect ? activeQuestion.misconceptions?.[idx] : undefined,
    });
    setStreamTransition(nextTransition);

    // Record Metrics with Coordinate Telemetry
    dispatch('TelemetryNode', {
      intent: 'record:answer',
      payload: {
        cohortCode: sessionId || 'default_cohort',
        challengeId: activeQuestion.id,
        topicId: `${slugify(activeQuestion.subject)}_${slugify(activeQuestion.unit)}`,
        isCorrect,
        userAnswer: activeQuestion.displayOptions[idx],
        seedToken: activeQuestion.seedToken,
        selectedCoordinate: idx,
        correctCoordinate: correctIndex,
        misconceptionTag: !isCorrect ? activeQuestion.misconceptions?.[idx] : undefined,
      },
    });
  };

  // 4. Session Reporting via Unified Dispatch
  const handleExportReport = () => {
    dispatch('ReportEngine', {
      intent: 'export:html',
      payload: { sessionId },
    });
  };

  // 5. In-Stage Vector Player Socratic Launch
  const handleSolveInPlayer = () => {
    if (!activeQuestion) return;
    const targetPreset = resolvePresetForTopic(selectedSubject, selectedUnit);
    openPlayerModal({
      preset: targetPreset,
      title: `${selectedSubject}: ${selectedUnit} (In-Stage Practice)`,
      autoPlay: true,
      lang: activeLang,
      checkpoint: {
        title: `${selectedSubject} Checkpoint`,
        prompt: activeQuestion.prompt,
        options: activeQuestion.displayOptions,
        answer: correctIndex,
        explanation: activeQuestion.explanation,
        t: 0.5,
      },
    });
  };

  // Synchronize in-stage player checkpoint answers with the NeuralLab assessment state
  useEffect(() => {
    const handleCheckpointMsg = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CHECKPOINT_ANSWERED') {
        const chosenIdx = event.data.chosenIdx;
        if (typeof chosenIdx === 'number' && selectedAnswer === null && activeQuestion) {
          handleSelectOption(chosenIdx);
        }
      }
    };
    window.addEventListener('message', handleCheckpointMsg);
    return () => window.removeEventListener('message', handleCheckpointMsg);
  }, [selectedAnswer, activeQuestion, handleSelectOption]);

  return (
    <div style={{ maxWidth: '1100px', margin: '1rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <CurriculumSelector
        keyStage={selectedKeyStage}
        subject={selectedSubject}
        unit={selectedUnit}
        selectedLesson={selectedLesson}
        onLessonChange={handleLessonSelect}
        status="online"
        isReady={!isGenerating}
        sessionId={sessionId}
        curriculumTree={curriculumTree}
        buttonLabel={isGenerating ? '⚡ Generating...' : 'New Question'}
        onKeyStageChange={handleKeyStageSelect}
        onSubjectChange={handleSubjectSelect}
        onUnitChange={handleUnitSelect}
        onSessionIdChange={setSessionId}
        onNewQuestion={() => requestQuestion(selectedKeyStage, selectedSubject, selectedUnit, difficulty, activeLang, true, undefined, selectedLesson)}
        onDownloadReport={handleExportReport}
      />

      <div
        style={{
          marginTop: '1.25rem',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          minHeight: '480px',
          boxSizing: 'border-box',
        }}
      >
        {/* Catholic First Communion Masterclass Quick Pill */}
        {(selectedSubject.toLowerCase().includes('catholic') ||
          selectedSubject.toLowerCase().includes('religious education') ||
          selectedUnit.toLowerCase().includes('communion') ||
          selectedUnit.toLowerCase().includes('eucharist') ||
          selectedUnit.toLowerCase().includes('mass')) && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.65rem 1rem',
              background: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)',
              border: '1px solid #facc15',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>✝️</span>
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#854d0e' }}>
                First Holy Communion Interactive Masterclass Available
              </span>
            </div>
            <Link
              to="/learning-zone?tab=first-communion"
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                background: '#4338ca',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>Explore Mass & Altar Vessels</span>
              <span>➔</span>
            </Link>
          </div>
        )}

        {/* Cartridge Toast Notification */}
        {cartridgeToast && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.65rem 1rem',
              background: '#064e3b',
              border: '1px solid #10b981',
              borderRadius: '8px',
              color: '#a7f3d0',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚡</span>
            <span>{cartridgeToast}</span>
          </div>
        )}

        {/* Modular Oak Curriculum Cartridge Deck Dock */}
        <div
          style={{
            marginBottom: '1.25rem',
            background: mountedDataCartridge
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: mountedDataCartridge ? '1px solid #3b82f6' : '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '12px 16px',
            color: mountedDataCartridge ? '#f8fafc' : '#334155',
            boxShadow: mountedDataCartridge ? '0 4px 14px rgba(59, 130, 246, 0.15)' : 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>
                {mountedDataCartridge?.icon || '📦'}
              </span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      color: mountedDataCartridge ? '#60a5fa' : '#0f172a',
                    }}
                  >
                    {mountedDataCartridge ? `AST Cartridge Deck: ${mountedDataCartridge.title}` : 'Oak Curriculum Cartridge Library'}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: mountedDataCartridge ? '#1e3a8a' : '#e2e8f0',
                      color: mountedDataCartridge ? '#93c5fd' : '#475569',
                      border: mountedDataCartridge ? '1px solid #3b82f6' : '1px solid #cbd5e1',
                    }}
                  >
                    {mountedDataCartridge ? '📦 MODULAR DECK' : '⚡ 11+ OAK CARTRIDGES'}
                  </span>
                  {activeQuestion?.tier && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: '#064e3b',
                        color: '#6ee7b7',
                        border: '1px solid #059669',
                        textTransform: 'uppercase',
                      }}
                    >
                      Tier: {activeQuestion.tier}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.76rem', color: mountedDataCartridge ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                  {mountedDataCartridge
                    ? `${mountedDataCartridge.stage} • ${mountedDataCartridge.subject} • 100% Offline AST • Zero Cloud LLM Latency`
                    : 'Practice with verified, zero-cloud Oak National Curriculum cartridges across KS1–KS3.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {mountedDataCartridge && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevDeckQuestion}
                    title="Previous question in cartridge deck"
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      background: '#1e293b',
                      color: '#cbd5e1',
                      border: '1px solid #475569',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    ◀ Prev
                  </button>

                  <button
                    type="button"
                    onClick={handleNextDeckQuestion}
                    title="Next question in cartridge deck"
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Next ▶
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportCartridge()}
                    title="Download this cartridge as an offline .ast file"
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#e2e8f0',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    💾 Export .ast
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setIsCartridgeModalOpen(true)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: mountedDataCartridge ? 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' : '#4338ca',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
                }}
              >
                <span>📚</span>
                <span>{mountedDataCartridge ? 'Switch Deck' : 'Browse Cartridges'}</span>
              </button>
            </div>
          </div>

          {/* Stepper Pills for Mounted Cartridge */}
          {mountedDataCartridge && mountedDataCartridge.dataPayload && (
            <div
              style={{
                marginTop: '10px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                  Deck Questions:
                </span>
                {mountedDataCartridge.dataPayload.questions.map((q, idx) => {
                  const isActive = idx === activeDeckQuestionIndex;
                  return (
                    <button
                      key={q.id || idx}
                      type="button"
                      onClick={() => handleJumpToDeckQuestion(idx)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: isActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                        color: isActive ? '#090d16' : '#cbd5e1',
                        border: isActive ? '1px solid #7dd3fc' : '1px solid rgba(255, 255, 255, 0.15)',
                        fontSize: '0.72rem',
                        fontWeight: isActive ? 900 : 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title={`Jump to Q${idx + 1}: ${q.prompt.slice(0, 40)}...`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                Question {activeDeckQuestionIndex + 1} of {mountedDataCartridge.dataPayload.questions.length}
              </div>
            </div>
          )}
        </div>

        {/* Child-Friendly Difficulty / Challenge Level Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
              🎯 Challenge Level:
            </span>
            <button
              type="button"
              onClick={() => handleDifficultyChange('warmup')}
              style={{
                padding: '5px 12px',
                borderRadius: '9999px',
                border: difficulty === 'warmup' ? '2px solid #10b981' : '1px solid #cbd5e1',
                background: difficulty === 'warmup' ? '#ecfdf5' : '#ffffff',
                color: difficulty === 'warmup' ? '#065f46' : '#64748b',
                fontWeight: difficulty === 'warmup' ? 800 : 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🌱 Warm-Up
            </button>
            <button
              type="button"
              onClick={() => handleDifficultyChange('challenger')}
              style={{
                padding: '5px 12px',
                borderRadius: '9999px',
                border: difficulty === 'challenger' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: difficulty === 'challenger' ? '#eff6ff' : '#ffffff',
                color: difficulty === 'challenger' ? '#1e40af' : '#64748b',
                fontWeight: difficulty === 'challenger' ? 800 : 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              ⚡ Challenger
            </button>
            <button
              type="button"
              onClick={() => handleDifficultyChange('brainbuster')}
              style={{
                padding: '5px 12px',
                borderRadius: '9999px',
                border: difficulty === 'brainbuster' ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                background: difficulty === 'brainbuster' ? '#f5f3ff' : '#ffffff',
                color: difficulty === 'brainbuster' ? '#5b21b6' : '#64748b',
                fontWeight: difficulty === 'brainbuster' ? 800 : 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🏆 Brain Buster
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {difficulty === 'warmup' && '🌱 Gentle questions to build core confidence'}
              {difficulty === 'challenger' && '⚡ Real-world problems and clever distractors'}
              {difficulty === 'brainbuster' && '🏆 Big brain puzzles that power up device AI!'}
            </span>

            {/* Live Hypervisor Supervisor Status */}
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px',
                background: vmState === 'ready' || vmState === 'executing' ? '#f0fdfa' : '#f8fafc',
                color: vmState === 'ready' || vmState === 'executing' ? '#0d9488' : '#64748b',
                border: `1px solid ${vmState === 'ready' || vmState === 'executing' ? '#99f6e4' : '#cbd5e1'}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title={`Hypervisor Status: ${vmState}. Main-Thread FPS: ${vmMetrics.currentFps || 60}. Zero-Copy Frames: ${vmMetrics.binaryFramesTransferred}.`}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background:
                    vmState === 'ready'
                      ? '#10b981'
                      : vmState === 'executing'
                      ? '#f59e0b'
                      : vmState === 'watchdog_timeout'
                      ? '#ef4444'
                      : '#94a3b8',
                  display: 'inline-block',
                }}
              />
              {vmState === 'executing'
                ? 'Hypervisor: Watchdog Armed'
                : vmState === 'ready'
                ? 'Hypervisor: Supervising'
                : vmState === 'watchdog_timeout'
                ? 'Hypervisor: Recycled'
                : 'Hypervisor: Active'}
            </span>

            {/* Thread Isolation & Zero-Copy Badge */}
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '6px',
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title="Inference runs 100% off-main-thread inside worker.html with zero-copy ArrayBuffer loopback"
            >
              <span>⚡</span>
              <span>{vmMetrics.currentFps || 60} FPS • Zero-Copy</span>
            </span>

            {/* Transparent Resource/Consent Interactive Badge */}
            <button
              type="button"
              onClick={() => {
                const nextState = !hasConsent;
                setUserAiConsent(nextState);
                requestQuestion(selectedKeyStage, selectedSubject, selectedUnit, difficulty);
              }}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px',
                background: hasConsent ? '#f0fdf4' : '#fffbeb',
                color: hasConsent ? '#15803d' : '#92400e',
                border: `1px solid ${hasConsent ? '#bbf7d0' : '#fde68a'}`,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title={
                hasConsent
                  ? 'On-Device Gemini Nano active (100% private). Click to switch to Eco Mode.'
                  : 'Fast offline mode. Click to enable on-device Gemini Nano live tutoring.'
              }
            >
              <span>{hasConsent ? '🧠' : '⚡'}</span>
              <span>{hasConsent ? 'Nano AI: Active' : 'Enable Nano AI'}</span>
            </button>

            {/* 2D Canvas AST Topology Toggle */}
            <button
              type="button"
              onClick={handleToggleCanvasTopology}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px',
                background: showCanvasTopology ? '#f0fdf4' : '#f8fafc',
                color: showCanvasTopology ? '#166534' : '#475569',
                border: `1px solid ${showCanvasTopology ? '#bbf7d0' : '#cbd5e1'}`,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              aria-pressed={showCanvasTopology}
              aria-label="Toggle 2D Neural AST Canvas and screen-reader mirror"
              title="Toggle interactive 2D Canvas Neural AST graph with full WCAG screen reader DOM mirror"
            >
              <span>🕸️</span>
              <span>{showCanvasTopology ? '2D Canvas: Active' : 'Show 2D Canvas'}</span>
            </button>
          </div>
        </div>

        {isGenerating ? (
          <div
            style={{
              height: '380px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#475569' }}>
              🎯 Preparing your question for {selectedSubject}: {selectedUnit}...
            </div>
            <div style={{ width: '70%', height: '18px', background: '#f1f5f9', borderRadius: '6px' }} />
            <div style={{ width: '100%', height: '48px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            <div style={{ width: '100%', height: '48px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            <div style={{ width: '100%', height: '48px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
          </div>
        ) : activeQuestion ? (
          <>
            {/* Interactive 2D Neural AST Canvas with Full Screen-Reader DOM Mirror (WCAG 2.1 AA) */}
            {showCanvasTopology && (
              <NeuralAstCanvasTopology
                prompt={activeQuestion.prompt}
                options={activeQuestion.displayOptions}
                selectedAnswer={selectedAnswer}
                correctIndex={correctIndex}
                onSelectOption={handleSelectOption}
                fps={vmMetrics.currentFps || 60}
                zeroCopyFrames={vmMetrics.binaryFramesTransferred}
              />
            )}

            {/* Presentation Mode Selector Bar */}
            <div
              style={{
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                padding: '8px 12px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>📝</span>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#334155' }}>
                  Practice Presentation:
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {questionMode === 'card' ? 'Multi-Choice Oak Curriculum Questions with Socratic Diagnostics' : 'Served directly inside live 60 FPS vector simulation player'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleSetQuestionMode('card')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: questionMode === 'card' ? '#0f172a' : 'transparent',
                    color: questionMode === 'card' ? '#ffffff' : '#64748b',
                    fontWeight: questionMode === 'card' ? 800 : 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: questionMode === 'card' ? '0 2px 8px rgba(15, 23, 42, 0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  aria-pressed={questionMode === 'card'}
                >
                  <span>📝 Multi-Choice Questions</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuestionMode('stage')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: questionMode === 'stage' ? '#6366f1' : 'transparent',
                    color: questionMode === 'stage' ? '#ffffff' : '#64748b',
                    fontWeight: questionMode === 'stage' ? 800 : 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: questionMode === 'stage' ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  aria-pressed={questionMode === 'stage'}
                >
                  <span>🎬 In-Stage Vector Player</span>
                </button>
              </div>
            </div>

            {questionMode === 'stage' ? (
              <div
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #334155',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
                  background: '#090d16',
                }}
              >
                {/* In-Stage Question Header Banner */}
                <div
                  style={{
                    padding: '10px 16px',
                    background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
                    borderBottom: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚡</span>
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
                        In-Stage Socratic Challenge: {selectedSubject} • {selectedUnit}
                      </span>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                        Question served live on vector apparatus with Promethean stylus pen inking.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {streak > 1 && (
                      <span style={{ background: '#f59e0b', color: '#000', fontSize: '0.72rem', fontWeight: 900, padding: '3px 10px', borderRadius: '9999px', boxShadow: '0 2px 6px rgba(245, 158, 11, 0.35)' }}>
                        🔥 Streak: {streak}
                      </span>
                    )}
                    <span style={{ background: '#10b981', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px' }}>
                      ⭐ Score: {score}
                    </span>
                  </div>
                </div>

                {/* Embedded AST Vector Media Player with Injected Checkpoint */}
                <React.Suspense
                  fallback={
                    <div style={{ height: '540px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '12px' }}>
                      <span style={{ fontSize: '2rem' }}>⚡</span>
                      <span>Mounting In-Stage AST Vector Apparatus...</span>
                    </div>
                  }
                >
                  <AstVectorMediaPlayer
                    key={`${selectedSubject}-${selectedUnit}-${activeQuestion.id}`}
                    preset={resolvePresetForTopic(selectedSubject, selectedUnit)}
                    height="540px"
                    autoPlay={true}
                    allowPresetSwitch={true}
                    initialCheckpoint={{
                      title: `${selectedSubject} In-Stage Quiz`,
                      prompt: activeQuestion.prompt,
                      options: activeQuestion.displayOptions,
                      answer: correctIndex,
                      explanation: activeQuestion.explanation,
                      t: 0.5,
                    }}
                  />
                </React.Suspense>

                {/* Question Actions Toolbar under Player */}
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#0b0f19',
                    borderTop: '1px solid #1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const targetSeed = streamTransition?.nextSeedToken;
                        requestQuestion(
                          selectedKeyStage,
                          selectedSubject,
                          selectedUnit,
                          difficulty,
                          activeLang,
                          true,
                          targetSeed
                        );
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#38bdf8',
                        color: '#090d16',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>⚡ Next Question In-Stage</span>
                      <span>➔</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => requestQuestion(selectedKeyStage, selectedSubject, selectedUnit, difficulty, activeLang, true)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #334155',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#cbd5e1',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      🔄 Parallel Variation
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSolveInPlayer}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#a5b4fc',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                    }}
                  >
                    ⛶ Fullscreen Stage Modal
                  </button>
                </div>
              </div>
            ) : (
              <QuestionCard
                keyStage={activeQuestion.keyStage || selectedKeyStage}
                subject={activeQuestion.subject}
                unit={activeQuestion.unit}
                lessonTitle={activeQuestion.lessonTitle || selectedLesson || undefined}
                prompt={activeQuestion.prompt}
                displayOptions={activeQuestion.displayOptions}
                selectedAnswer={selectedAnswer}
                correctIndex={correctIndex}
                onSelectOption={handleSelectOption}
                score={score}
                streak={streak}
                seedToken={activeQuestion.seedToken}
                pedagogicalStage={activeQuestion.pedagogicalStage}
                stageBadge={activeQuestion.stageBadge}
                stepLabel={activeQuestion.stepLabel}
                pedagogicalIntent={activeQuestion.pedagogicalIntent}
                urn={activeQuestion.urn}
                csn={activeQuestion.csn}
                routeEngine={activeQuestion.routeEngine}
                trajectoryState={trajectoryState}
                streamTransition={streamTransition}
                onSeedJump={(customSeed) => {
                  requestQuestion(
                    selectedKeyStage,
                    selectedSubject,
                    selectedUnit,
                    difficulty,
                    activeLang,
                    false,
                    customSeed
                  );
                }}
                hint={activeQuestion.hint}
                explanation={activeQuestion.explanation}
                misconceptions={activeQuestion.misconceptions}
                socraticFollowUp={activeQuestion.socraticFollowUp}
                currentLang={activeLang}
                onLanguageChange={(newLang) => {
                  setActiveLang(newLang);
                  requestQuestion(selectedKeyStage, selectedSubject, selectedUnit, difficulty, newLang);
                }}
                onNextQuestion={() => {
                  if (mountedDataCartridge && mountedDataCartridge.dataPayload) {
                    handleNextDeckQuestion();
                  } else {
                    const targetSeed = streamTransition?.nextSeedToken;
                    requestQuestion(
                      selectedKeyStage,
                      selectedSubject,
                      selectedUnit,
                      difficulty,
                      activeLang,
                      true,
                      targetSeed
                    );
                  }
                }}
                onParallelVariation={() => requestQuestion(selectedKeyStage, selectedSubject, selectedUnit, difficulty, activeLang, true)}
              />
            )}
          </>
        ) : (
          <div
            style={{
              height: '380px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              color: '#64748b',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Ready to Practice</div>
            <div style={{ fontSize: '0.95rem' }}>
              Select your Stage, Subject, and Unit above, or mount a cartridge from the <strong>Cartridge Library</strong> to begin.
            </div>
            <button
              type="button"
              onClick={() => setIsCartridgeModalOpen(true)}
              style={{
                marginTop: '8px',
                padding: '8px 18px',
                borderRadius: '8px',
                background: '#4338ca',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(67, 56, 202, 0.3)',
              }}
            >
              <span>📦</span>
              <span>Open Oak Cartridge Library</span>
            </button>
          </div>
        )}
      </div>

      {/* Cartridge Library & Importer Modal */}
      {isCartridgeModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsCartridgeModalOpen(false)}
        >
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '16px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              color: '#f8fafc',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid #1e293b',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.75rem' }}>📦</span>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                    Oak Curriculum Data Cartridges
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                    Decentralized, zero-cloud question banks running off pure AST S-Expressions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCartridgeModalOpen(false)}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Subject Filters */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexWrap: 'wrap',
                marginBottom: '1.25rem',
              }}
            >
              {['All', 'Science', 'Mathematics', 'Catholic Faith', 'Computing', 'English Literature & Phonics', 'Modern & Classical Languages'].map((cat) => {
                const isActive = cartridgeFilterSubject === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCartridgeFilterSubject(cat)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      border: isActive ? '1px solid #38bdf8' : '1px solid #334155',
                      background: isActive ? '#0369a1' : '#1e293b',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Cartridge Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '12px',
                marginBottom: '1.5rem',
              }}
            >
              {dataCartridgesList
                .filter((c) => {
                  if (cartridgeFilterSubject === 'All') return true;
                  return (c.category || c.subject) === cartridgeFilterSubject;
                })
                .map((cart) => {
                  const qCount = cart.dataPayload?.questions?.length || 0;
                  const isCurrent = mountedDataCartridge?.id === cart.id;

                  return (
                    <div
                      key={cart.id}
                      style={{
                        background: isCurrent ? 'rgba(59, 130, 246, 0.12)' : '#1e293b',
                        border: isCurrent ? '1.5px solid #3b82f6' : '1px solid #334155',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.4rem' }}>{cart.icon || '📦'}</span>
                            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
                              {cart.title}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              background: '#047857',
                              color: '#a7f3d0',
                              border: '1px solid #059669',
                            }}
                          >
                            {qCount} Questions
                          </span>
                        </div>
                        <p style={{ margin: '6px 0 0 0', fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.4 }}>
                          {cart.desc}
                        </p>
                        <div style={{ marginTop: '8px', fontSize: '0.68rem', color: '#38bdf8', fontWeight: 700 }}>
                          {cart.stage} • {cart.subject || cart.category}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <button
                          type="button"
                          onClick={() => handleExportCartridge(cart.id)}
                          style={{
                            background: 'transparent',
                            color: '#94a3b8',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          title="Download canonical AST S-Expression file"
                        >
                          💾 .ast
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMountCartridge(cart)}
                          style={{
                            background: isCurrent ? '#059669' : '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '5px 14px',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span>{isCurrent ? '✓ Active Deck' : '▶ Mount to Lab'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Custom Cartridge File Ingestion Dropzone */}
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed #475569',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#e2e8f0' }}>
                  📥 Import Custom Cartridge (.ast or .json)
                </span>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Load teacher-authored question banks or offline air-gapped curriculum cartridges.
                </div>
              </div>

              <label
                style={{
                  background: '#334155',
                  color: '#f8fafc',
                  padding: '5px 14px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Browse File</span>
                <input
                  type="file"
                  accept=".ast,.json,.svg"
                  onChange={handleImportCustomCartridge}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}