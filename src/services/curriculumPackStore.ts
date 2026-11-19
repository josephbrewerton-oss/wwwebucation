// src/services/curriculumPackStore.ts
import { StandardStage, StandardSubject, StandardTopic } from '../curriculum/curriculumAdapter';
import { CurriculumTopicKnowledge } from '../data/oakCurriculumKnowledge';
import {
  getAllCurriculumPackRecords,
  putCurriculumPackRecord,
  deleteCurriculumPackRecord,
} from './dbStore';
import { getLocalState, setLocalState, removeLocalState } from './localStateStore';

export interface CustomQuestionDistractor {
  answerText: string;
  feedback: string;
}

export interface CustomQuestionItem {
  questionText: string;
  correctAnswer: string[];
  hint: string;
  explanation: string;
  distractors: CustomQuestionDistractor[];
}

export interface CustomCurriculumLesson {
  id: string; // unique slug
  stageTitle: string;
  subjectTitle: string;
  topicTitle: string;
  unitTitle?: string;
  axiom: string;
  hook?: string;
  guidedStep?: string;
  trap?: string;
  socraticCheck?: string;
  questions: CustomQuestionItem[];
}

export interface CustomCurriculumPack {
  id: string;
  title: string;
  countryOrRegion: string;
  authorOrMinistry: string;
  description: string;
  version: string;
  installedAt: number;
  stages: Record<string, {
    id: string;
    title: string;
    subjects: Array<{
      id: string;
      title: string;
      topics: Array<{
        id: string;
        title: string;
      }>;
    }>;
  }>;
  lessons: CustomCurriculumLesson[];
}

const STORAGE_KEY_CUSTOM_PACKS = 'stj_custom_curriculum_packs_v1';
const STORAGE_KEY_ACTIVE_PACK_ID = 'stj_active_custom_curriculum_pack';

// In-memory cache for fast synchronous lookups, hydrated from native IndexedDB
let inMemoryPacksCache: CustomCurriculumPack[] = [];
let packsHydrated = false;
let packsInitPromise: Promise<void> | null = null;

export async function initCurriculumPackStore(): Promise<void> {
  if (packsHydrated) return;
  if (packsInitPromise) return packsInitPromise;

  packsInitPromise = (async () => {
    try {
      const dbPacks = await getAllCurriculumPackRecords<CustomCurriculumPack>();
      if (dbPacks.length > 0) {
        inMemoryPacksCache = dbPacks.sort((a, b) => (b.installedAt || 0) - (a.installedAt || 0));
      } else {
        const legacySerialized = getLocalState(STORAGE_KEY_CUSTOM_PACKS);
        if (legacySerialized) {
          const parsed = JSON.parse(legacySerialized);
          if (Array.isArray(parsed)) {
            inMemoryPacksCache = parsed;
            for (const pack of parsed) {
              if (pack && pack.id) {
                await putCurriculumPackRecord(pack);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[curriculumPackStore] Failed to hydrate packs from IndexedDB:', err);
    } finally {
      packsHydrated = true;
    }
  })();

  return packsInitPromise;
}

export function getInstalledCurriculumPacks(): CustomCurriculumPack[] {
  if (typeof window === 'undefined') return [];
  if (!packsHydrated) {
    void initCurriculumPackStore();
  }
  return inMemoryPacksCache;
}

export function saveCurriculumPack(pack: CustomCurriculumPack): void {
  if (typeof window === 'undefined') return;
  const existing = getInstalledCurriculumPacks().filter((p) => p.id !== pack.id);
  const updated = [pack, ...existing];
  inMemoryPacksCache = updated;
  try {
    void putCurriculumPackRecord(pack);
    setLocalState(STORAGE_KEY_ACTIVE_PACK_ID, pack.id);
    window.dispatchEvent(new Event('curriculum_packs_updated'));
  } catch (err) {
    console.error('[curriculumPackStore] IndexedDB error saving pack:', err);
  }
}

export function removeCurriculumPack(packId: string): void {
  if (typeof window === 'undefined') return;
  const filtered = getInstalledCurriculumPacks().filter((p) => p.id !== packId);
  inMemoryPacksCache = filtered;
  try {
    void deleteCurriculumPackRecord(packId);
    if (getLocalState(STORAGE_KEY_ACTIVE_PACK_ID) === packId) {
      removeLocalState(STORAGE_KEY_ACTIVE_PACK_ID);
    }
    window.dispatchEvent(new Event('curriculum_packs_updated'));
  } catch (err) {
    console.error('[curriculumPackStore] Error removing pack:', err);
  }
}

/**
 * Searches installed custom packs for a lesson or topic knowledge record
 * matching stage, subject, and topic strings.
 */
export function findCustomTopicKnowledge(
  stage: string,
  subject: string,
  topic: string
): CurriculumTopicKnowledge | null {
  const packs = getInstalledCurriculumPacks();
  if (!packs || packs.length === 0) return null;

  const clean = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const cleanStage = clean(stage);
  const cleanSub = clean(subject);
  const cleanTop = clean(topic);

  for (const pack of packs) {
    for (const lesson of pack.lessons) {
      const lStage = clean(lesson.stageTitle);
      const lSub = clean(lesson.subjectTitle);
      const lTop = clean(lesson.topicTitle);

      const isTopicMatch = lTop === cleanTop || lTop.includes(cleanTop) || cleanTop.includes(lTop);
      const isSubMatch = !subject || lSub === cleanSub || lSub.includes(cleanSub) || cleanSub.includes(lSub);
      const isStageMatch = !stage || lStage === cleanStage || lStage.includes(cleanStage) || cleanStage.includes(lStage);

      if (isTopicMatch && (isSubMatch || isStageMatch)) {
        // Convert custom questions into CurriculumTopicKnowledge format
        const formattedQuestions = lesson.questions.map((q, idx) => {
          const correct = q.correctAnswer[0] || 'Correct concept';
          const distractors = (q.distractors || []).slice(0, 3).map((d) => d.answerText);
          while (distractors.length < 3) {
            distractors.push(`Alternative perspective ${distractors.length + 1}`);
          }
          // Put correct answer at index 0 and shuffle options
          const allOptions = [correct, ...distractors];
          const targetIndex = (idx * 2) % allOptions.length; // deterministic placement
          const finalOptions = [...allOptions];
          const temp = finalOptions[0];
          finalOptions[0] = finalOptions[targetIndex];
          finalOptions[targetIndex] = temp;

          return {
            id: `${lesson.id}-q${idx + 1}`,
            prompt: q.questionText,
            options: finalOptions,
            answerKey: targetIndex,
            hint: q.hint,
            explanation: q.explanation,
          };
        });

        return {
          topicId: lesson.id,
          title: lesson.topicTitle,
          subject: lesson.subjectTitle,
          keyStage: lesson.stageTitle,
          coreAxiom: lesson.axiom,
          cognitiveTrap: lesson.trap || 'Failing to apply the core principle consistently.',
          hook: lesson.hook || `How does ${lesson.topicTitle} operate in real world contexts?`,
          guidedStep: lesson.guidedStep || 'Review the core rules, observe key components, and verify results.',
          socraticPivot: lesson.socraticCheck || `Can you summarize the primary rule of ${lesson.topicTitle}?`,
          scaffoldHints: {
            level1: lesson.questions[0]?.hint || 'Review the foundational concept.',
            level2: lesson.questions[0]?.explanation || 'Check the primary principle and avoid common traps.',
            level3: `Remember: ${lesson.axiom}`,
          },
          questions: formattedQuestions,
        };
      }
    }
  }

  return null;
}

/**
 * Converts all installed custom packs into StandardStage tree format
 * so that they seamlessly appear in stage, subject, and topic dropdowns.
 */
export function getCustomStandardStages(): Record<string, StandardStage> {
  const packs = getInstalledCurriculumPacks();
  const stages: Record<string, StandardStage> = {};

  for (const pack of packs) {
    for (const [stageKey, stageDef] of Object.entries(pack.stages)) {
      const uniqueStageKey = `custom_${pack.id}_${stageKey}`;
      stages[uniqueStageKey] = {
        id: uniqueStageKey,
        title: `${stageDef.title} [${pack.countryOrRegion}]`,
        subjects: stageDef.subjects.map((sub): StandardSubject => ({
          id: sub.id,
          title: sub.title,
          domain: 'stem',
          topics: sub.topics.map((t): StandardTopic => ({
            id: t.id,
            title: t.title,
            scope: 'universal',
          })),
        })),
      };
    }
  }

  return stages;
}


