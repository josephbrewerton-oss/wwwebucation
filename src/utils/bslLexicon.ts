/**
 * src/utils/bslLexicon.ts
 *
 * St Joseph's Educational Media Suite - British Sign Language (BSL) Lexicon & Sign Grammar Engine
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Authentic Phase 1 BSL Natural Sign Lexicon:
 * - 50+ High-Frequency School, STEM, and Catholic Life Whole-Word Signs
 * - Multi-keyframe procedural 3D trajectories
 * - Non-Manual Features (NMF: eyebrows, mouthing, head tilts)
 * - Seamless hybrid fallback to BANZSL 2-handed manual alphabet fingerspelling
 */

import {
  Point3D,
  BslHandPose,
  BslNmf,
  BslHandShape,
  BslPalmOrientation,
  BslEaseCurve,
  BslBaseHandMode,
  BslClassifierType,
  BslAspect,
  BslClassifierPredicate,
  DOMINANT_REST_POSE,
  DOMINANT_REST_KNUCKLE,
  DOMINANT_REST_WRIST,
  BSL_ALPHABET_POSES,
} from './bslAlphabet';

export type {
  BslNmf,
  BslHandShape,
  BslPalmOrientation,
  BslEaseCurve,
  BslBaseHandMode,
  BslClassifierType,
  BslAspect,
  BslClassifierPredicate,
};
export type BslCategory = 'faith' | 'school' | 'stem' | 'conversation' | 'grammar' | 'temporal' | 'classifier';

export interface BslSignKeyframe {
  label: string;
  rule: string;
  durationWeight?: number;
  targetTip: Point3D;
  targetKnuckle: Point3D;
  targetWrist: Point3D;
  shape?: BslHandShape;
  palm?: BslPalmOrientation;
  hold?: number;
  ease?: BslEaseCurve;
  baseHandMode?: BslBaseHandMode;
  activeVowelIndex?: number;
  baseHandOverride?: {
    wrist?: Point3D;
    palm?: Point3D;
    shiftX?: number;
    shiftY?: number;
    shiftZ?: number;
  };
  nmf?: BslNmf;
  classifier?: BslClassifierPredicate;
  aspect?: BslAspect;
}

export interface BslSign {
  id: string;
  word: string;
  category: BslCategory;
  englishLabel: string;
  gloss: string;
  description: string;
  keyframes: BslSignKeyframe[];
  aliases?: string[];
  isDirectional?: boolean;
  directionalType?: 'subject-to-object' | 'object-to-subject';
  defaultLoci?: { from: string; to: string };
  makatonStage?: number; // Makaton Core Vocabulary Stages 1-8 (UK SEN / Early Communication Standard)
  classifier?: BslClassifierPredicate;
  aspect?: BslAspect;
}

/**
 * Foundational BSL Curriculum Lexicon (Phase 1)
 * High-frequency vocabulary across Catholic Faith, STEM, Academic Study & Classroom Conversation.
 */
export const BSL_CURRICULUM_LEXICON: Record<string, BslSign> = {
  // =========================================================================
  // CATHOLIC LIFE & LITURGY
  // =========================================================================
  'JESUS': {
    id: 'jesus',
    word: 'JESUS',
    category: 'faith',
    englishLabel: 'Jesus Christ',
    gloss: 'JESUS',
    description: 'Index touches center of non-dominant palm, then dominant palm (the crucifixion nails in the hands).',
    aliases: ['CHRIST', 'LORD', 'SAVIOUR', 'SAVIOR'],
    keyframes: [
      {
        label: 'Nail in Left Palm',
        rule: 'Dominant index touches center of non-dominant open palm',
        targetTip: { x: -50, y: 30, z: 12 },
        targetKnuckle: { x: 5, y: 40, z: 5 },
        targetWrist: { x: 65, y: 75, z: -10 },
        nmf: { eyebrows: 'neutral', mouth: 'Jesus' },
      },
      {
        label: 'Nail in Right Palm',
        rule: 'Hands cross: index touches opposite palm center',
        targetTip: { x: 35, y: 25, z: 14 },
        targetKnuckle: { x: 60, y: 45, z: 5 },
        targetWrist: { x: 100, y: 80, z: -10 },
        baseHandOverride: { shiftX: 20, shiftY: -10, shiftZ: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'Christ' },
      },
    ],
  },

  'GOD': {
    id: 'god',
    word: 'GOD',
    category: 'faith',
    englishLabel: 'God the Father',
    gloss: 'GOD',
    description: 'Dominant index points reverently upward toward heaven with upward gaze.',
    aliases: ['FATHER', 'ALMIGHTY', 'CREATOR'],
    keyframes: [
      {
        label: 'Raise Pointing Hand',
        rule: 'Dominant index points upward at upper chest level',
        targetTip: { x: 25, y: -50, z: 25 },
        targetKnuckle: { x: 45, y: -15, z: 15 },
        targetWrist: { x: 75, y: 35, z: 0 },
        nmf: { eyebrows: 'raised', mouth: 'God' },
      },
      {
        label: 'Reverent Point to Heaven',
        rule: 'Dominant index extends higher toward the heavens',
        targetTip: { x: 30, y: -85, z: 35 },
        targetKnuckle: { x: 50, y: -40, z: 20 },
        targetWrist: { x: 80, y: 10, z: 5 },
        nmf: { eyebrows: 'raised', mouth: 'God' },
      },
    ],
  },

  'PRAY': {
    id: 'pray',
    word: 'PRAY',
    category: 'faith',
    englishLabel: 'Pray / Prayer',
    gloss: 'PRAY',
    description: 'Both flat palms join together at chest level in prayer steeple, bowing slightly.',
    aliases: ['PRAYER', 'PRAYING', 'PRAYS', 'AMEN'],
    keyframes: [
      {
        label: 'Palms Together at Chest',
        rule: 'Both flat hands press palms together pointing upward in front of heart',
        targetTip: { x: -15, y: -15, z: 25 },
        targetKnuckle: { x: 20, y: 20, z: 12 },
        targetWrist: { x: 55, y: 65, z: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'pray' },
      },
      {
        label: 'Reverent Dip',
        rule: 'Prayer steeple hands dip forward in reverent contemplation',
        targetTip: { x: -15, y: 5, z: 30 },
        targetKnuckle: { x: 20, y: 35, z: 18 },
        targetWrist: { x: 55, y: 75, z: 5 },
        nmf: { eyebrows: 'neutral', mouth: 'Amen', headTilt: 'nod' },
      },
    ],
  },

  'CHURCH': {
    id: 'church',
    word: 'CHURCH',
    category: 'faith',
    englishLabel: 'Church / Cathedral',
    gloss: 'CHURCH',
    description: 'Both hands form a peaked steeple/roof above chest, tapping together twice.',
    aliases: ['CHAPEL', 'CATHEDRAL', 'SANCTUARY', 'BASILICA'],
    keyframes: [
      {
        label: 'Form Steeples',
        rule: 'Fingertips join in a triangular church roof spire',
        targetTip: { x: -5, y: -40, z: 22 },
        targetKnuckle: { x: 35, y: -5, z: 12 },
        targetWrist: { x: 75, y: 45, z: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'church' },
      },
      {
        label: 'Steeple Tap',
        rule: 'Roof tap confirms the consecrated sacred architecture',
        targetTip: { x: -5, y: -30, z: 22 },
        targetKnuckle: { x: 35, y: 5, z: 12 },
        targetWrist: { x: 75, y: 55, z: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'church' },
      },
    ],
  },

  'CROSS': {
    id: 'cross',
    word: 'CROSS',
    category: 'faith',
    englishLabel: 'Cross / Crucifix',
    gloss: 'CROSS',
    description: 'Dominant index traces the vertical and horizontal beams of the Cross.',
    aliases: ['CRUCIFIX', 'CRUCIFIXION'],
    keyframes: [
      {
        label: 'Vertical Top',
        rule: 'Index finger begins at top of cross near forehead',
        targetTip: { x: 0, y: -60, z: 25 },
        targetKnuckle: { x: 25, y: -25, z: 15 },
        targetWrist: { x: 65, y: 25, z: 0 },
        shape: 'point',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'cross' },
      },
      {
        label: 'Vertical Base',
        rule: 'Index finger traces downward to base at lower chest',
        targetTip: { x: 0, y: 35, z: 25 },
        targetKnuckle: { x: 25, y: 65, z: 15 },
        targetWrist: { x: 65, y: 95, z: 0 },
        shape: 'point',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'cross' },
      },
      {
        label: 'Horizontal Beam Left',
        rule: 'Index draws crossbeam starting from left',
        targetTip: { x: -45, y: -15, z: 22 },
        targetKnuckle: { x: -10, y: 15, z: 12 },
        targetWrist: { x: 40, y: 55, z: 0 },
        shape: 'point',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'cross' },
      },
      {
        label: 'Horizontal Beam Right',
        rule: 'Index draws across to right shoulder',
        targetTip: { x: 45, y: -15, z: 22 },
        targetKnuckle: { x: 75, y: 15, z: 12 },
        targetWrist: { x: 110, y: 55, z: 0 },
        shape: 'point',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'cross' },
      },
    ],
  },

  'BIBLE': {
    id: 'bible',
    word: 'BIBLE',
    category: 'faith',
    englishLabel: 'Bible / Holy Scripture',
    gloss: 'HOLY BOOK',
    description: 'Hands join together and open like a book, indicating Sacred Scripture.',
    aliases: ['SCRIPTURE', 'GOSPEL', 'TESTAMENT'],
    keyframes: [
      {
        label: 'Closed Book',
        rule: 'Palms pressed together vertically',
        targetTip: { x: -10, y: 15, z: 20 },
        targetKnuckle: { x: 25, y: 45, z: 10 },
        targetWrist: { x: 65, y: 80, z: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'holy' },
      },
      {
        label: 'Open Scripture Book',
        rule: 'Palms open upward side by side like pages of the Bible',
        targetTip: { x: 25, y: 20, z: 15 },
        targetKnuckle: { x: 55, y: 50, z: 10 },
        targetWrist: { x: 95, y: 85, z: 0 },
        baseHandOverride: { shiftX: -30, shiftY: 0, shiftZ: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'book' },
      },
    ],
  },

  'HOLY': {
    id: 'holy',
    word: 'HOLY',
    category: 'faith',
    englishLabel: 'Holy / Sacred',
    gloss: 'HOLY',
    description: 'Flat open hand brushes upward from heart in a pure elevating gesture.',
    aliases: ['SACRED', 'BLESSED', 'SANCTUS'],
    keyframes: [
      {
        label: 'At Heart',
        rule: 'Open flat hand rests near heart',
        targetTip: { x: -10, y: 0, z: 20 },
        targetKnuckle: { x: 30, y: 35, z: 10 },
        targetWrist: { x: 75, y: 70, z: 0 },
        nmf: { eyebrows: 'raised', mouth: 'holy' },
      },
      {
        label: 'Elevate Upward',
        rule: 'Hand sweeps upward in divine radiance',
        targetTip: { x: 15, y: -45, z: 30 },
        targetKnuckle: { x: 50, y: -10, z: 15 },
        targetWrist: { x: 90, y: 35, z: 0 },
        nmf: { eyebrows: 'raised', mouth: 'holy' },
      },
    ],
  },

  'LOVE': {
    id: 'love',
    word: 'LOVE',
    category: 'faith',
    englishLabel: 'Love / Charity',
    gloss: 'LOVE',
    description: 'Fists crossed over heart in a warm embracing cross.',
    aliases: ['CHARITY', 'LOVING', 'LOVES'],
    keyframes: [
      {
        label: 'Fists at Shoulders',
        rule: 'Both hands loosely closed in front of chest',
        targetTip: { x: 10, y: 10, z: 15 },
        targetKnuckle: { x: 45, y: 40, z: 8 },
        targetWrist: { x: 85, y: 75, z: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'love' },
      },
      {
        label: 'Crossed Over Heart',
        rule: 'Fists cross snugly over chest',
        targetTip: { x: -25, y: -5, z: 22 },
        targetKnuckle: { x: 15, y: 25, z: 12 },
        targetWrist: { x: 60, y: 65, z: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'love', headTilt: 'nod' },
      },
    ],
  },

  'PEACE': {
    id: 'peace',
    word: 'PEACE',
    category: 'faith',
    englishLabel: 'Peace / Pax',
    gloss: 'PEACE',
    description: 'Both palms touch center then glide smoothly outward and downward.',
    aliases: ['PAX', 'CALM', 'SERENITY'],
    keyframes: [
      {
        label: 'Joined Center',
        rule: 'Open hands touch palms together in center',
        targetTip: { x: -10, y: 5, z: 20 },
        targetKnuckle: { x: 25, y: 35, z: 10 },
        targetWrist: { x: 65, y: 70, z: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'peace' },
      },
      {
        label: 'Glide Outward',
        rule: 'Hands smooth outward into serene open space',
        targetTip: { x: 55, y: 30, z: 20 },
        targetKnuckle: { x: 85, y: 55, z: 10 },
        targetWrist: { x: 120, y: 85, z: 0 },
        baseHandOverride: { shiftX: -40, shiftY: 20, shiftZ: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'peace' },
      },
    ],
  },

  // =========================================================================
  // SCHOOL & ACADEMIC LIFE
  // =========================================================================
  'SCHOOL': {
    id: 'school',
    word: 'SCHOOL',
    category: 'school',
    englishLabel: 'School',
    gloss: 'SCHOOL',
    description: 'Dominant flat palm claps twice across non-dominant palm.',
    aliases: ['CLASSROOM', 'COLLEGE', 'ACADEMY'],
    keyframes: [
      {
        label: 'First Palm Clap',
        rule: 'Dominant flat hand claps down onto non-dominant palm',
        targetTip: { x: -45, y: 20, z: 12 },
        targetKnuckle: { x: 5, y: 35, z: 5 },
        targetWrist: { x: 65, y: 70, z: -10 },
        nmf: { eyebrows: 'neutral', mouth: 'school' },
      },
      {
        label: 'Lift',
        rule: 'Hand rebounds upward slightly',
        targetTip: { x: -35, y: -10, z: 25 },
        targetKnuckle: { x: 15, y: 15, z: 15 },
        targetWrist: { x: 75, y: 50, z: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'school' },
      },
      {
        label: 'Second Palm Clap',
        rule: 'Second rhythmic clap confirming school activity',
        targetTip: { x: -45, y: 20, z: 12 },
        targetKnuckle: { x: 5, y: 35, z: 5 },
        targetWrist: { x: 65, y: 70, z: -10 },
        nmf: { eyebrows: 'neutral', mouth: 'school' },
      },
    ],
  },

  'TEACHER': {
    id: 'teacher',
    word: 'TEACHER',
    category: 'school',
    englishLabel: 'Teacher / Educator',
    gloss: 'TEACH PERSON',
    description: 'Pinched fingers move forward from temples (teaching) then hands move down (person).',
    aliases: ['TEACH', 'TEACHING', 'EDUCATOR', 'INSTRUCTOR'],
    keyframes: [
      {
        label: 'From Mind',
        rule: 'Pinched hands positioned near temples',
        targetTip: { x: 50, y: -65, z: 28 },
        targetKnuckle: { x: 70, y: -35, z: 15 },
        targetWrist: { x: 95, y: 10, z: 0 },
        shape: 'claw',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'neutral', mouth: 'teach' },
      },
      {
        label: 'Extend Knowledge Out',
        rule: 'Hands extend forward sharing knowledge with pupils',
        targetTip: { x: 30, y: -20, z: 65 },
        targetKnuckle: { x: 55, y: 10, z: 45 },
        targetWrist: { x: 85, y: 50, z: 20 },
        shape: 'spread',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'neutral', mouth: 'teacher' },
      },
    ],
  },

  'LEARN': {
    id: 'learn',
    word: 'LEARN',
    category: 'school',
    englishLabel: 'Learn / Student',
    gloss: 'LEARN',
    description: 'Hand gathers knowledge from open palm book and places it into the mind/forehead.',
    aliases: ['LEARNING', 'STUDENT', 'PUPIL', 'STUDY'],
    keyframes: [
      {
        label: 'Gather from Book',
        rule: 'Fingertips take knowledge from flat non-dominant palm',
        targetTip: { x: -45, y: 25, z: 14 },
        targetKnuckle: { x: 0, y: 35, z: 5 },
        targetWrist: { x: 60, y: 70, z: -10 },
        nmf: { eyebrows: 'neutral', mouth: 'learn' },
      },
      {
        label: 'Place into Forehead',
        rule: 'Hand moves up and touches forehead with knowledge',
        targetTip: { x: 15, y: -65, z: 30 },
        targetKnuckle: { x: 45, y: -30, z: 15 },
        targetWrist: { x: 80, y: 15, z: 0 },
        nmf: { eyebrows: 'raised', mouth: 'learn', headTilt: 'nod' },
      },
    ],
  },

  'BOOK': {
    id: 'book',
    word: 'BOOK',
    category: 'school',
    englishLabel: 'Book / Text',
    gloss: 'BOOK',
    description: 'Palms pressed together vertically then opened like a book.',
    aliases: ['TEXTBOOK', 'READER', 'PAGES'],
    keyframes: [
      {
        label: 'Closed Book',
        rule: 'Palms pressed together',
        targetTip: { x: -10, y: 15, z: 20 },
        targetKnuckle: { x: 25, y: 45, z: 10 },
        targetWrist: { x: 65, y: 80, z: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'book' },
      },
      {
        label: 'Open Pages',
        rule: 'Palms swing open upward',
        targetTip: { x: 25, y: 20, z: 15 },
        targetKnuckle: { x: 55, y: 50, z: 10 },
        targetWrist: { x: 95, y: 85, z: 0 },
        baseHandOverride: { shiftX: -30, shiftY: 0, shiftZ: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'book' },
      },
    ],
  },

  'READ': {
    id: 'read',
    word: 'READ',
    category: 'school',
    englishLabel: 'Read / Reading',
    gloss: 'READ',
    description: 'V-fingers (eyes) scan down the non-dominant flat palm page.',
    aliases: ['READING', 'READS'],
    keyframes: [
      {
        label: 'Scan Top of Page',
        rule: 'V-fingers point to top of non-dominant palm page',
        targetTip: { x: -60, y: -25, z: 20 },
        targetKnuckle: { x: -10, y: -5, z: 10 },
        targetWrist: { x: 50, y: 40, z: -10 },
        nmf: { eyebrows: 'neutral', mouth: 'read' },
      },
      {
        label: 'Scan Down Page',
        rule: 'V-fingers scan down to bottom of palm page',
        targetTip: { x: -50, y: 35, z: 18 },
        targetKnuckle: { x: 0, y: 50, z: 8 },
        targetWrist: { x: 60, y: 85, z: -10 },
        nmf: { eyebrows: 'neutral', mouth: 'read' },
      },
    ],
  },

  'WRITE': {
    id: 'write',
    word: 'WRITE',
    category: 'school',
    englishLabel: 'Write / Writing',
    gloss: 'WRITE',
    description: 'Dominant pinched fingers pretend to write a pen stroke across non-dominant palm.',
    aliases: ['WRITING', 'PEN', 'PENCIL'],
    keyframes: [
      {
        label: 'Pen Start',
        rule: 'Pinched writing fingers touch left side of palm',
        targetTip: { x: -70, y: 20, z: 14 },
        targetKnuckle: { x: -20, y: 30, z: 8 },
        targetWrist: { x: 45, y: 65, z: -10 },
        nmf: { eyebrows: 'neutral', mouth: 'write' },
      },
      {
        label: 'Pen Stroke Across',
        rule: 'Fingers scribble across to right side of palm',
        targetTip: { x: -30, y: 25, z: 14 },
        targetKnuckle: { x: 15, y: 35, z: 8 },
        targetWrist: { x: 75, y: 70, z: -10 },
        nmf: { eyebrows: 'neutral', mouth: 'write' },
      },
    ],
  },

  'QUESTION': {
    id: 'question',
    word: 'QUESTION',
    category: 'school',
    englishLabel: 'Question / Ask',
    gloss: 'QUESTION',
    description: 'Dominant index traces a question mark hook in the air and dots it.',
    aliases: ['ASK', 'QUERY', 'QUIZ'],
    keyframes: [
      {
        label: 'Hook Top',
        rule: 'Index finger curves upper hook in air',
        targetTip: { x: 25, y: -35, z: 30 },
        targetKnuckle: { x: 45, y: -5, z: 18 },
        targetWrist: { x: 80, y: 40, z: 0 },
        nmf: { eyebrows: 'furrowed', mouth: 'question' },
      },
      {
        label: 'Stem',
        rule: 'Index curves down straight',
        targetTip: { x: 25, y: -5, z: 30 },
        targetKnuckle: { x: 45, y: 25, z: 18 },
        targetWrist: { x: 80, y: 65, z: 0 },
        nmf: { eyebrows: 'furrowed', mouth: 'question' },
      },
      {
        label: 'Question Dot',
        rule: 'Index jabs dot cleanly underneath',
        targetTip: { x: 25, y: 25, z: 30 },
        targetKnuckle: { x: 45, y: 55, z: 18 },
        targetWrist: { x: 80, y: 90, z: 0 },
        nmf: { eyebrows: 'raised', mouth: 'question' },
      },
    ],
  },

  'LISTEN': {
    id: 'listen',
    word: 'LISTEN',
    category: 'school',
    englishLabel: 'Listen / Hear',
    gloss: 'LISTEN',
    description: 'Dominant cupped hand placed near ear, tilting head to listen attentively.',
    aliases: ['HEAR', 'HEARING', 'LISTENING'],
    keyframes: [
      {
        label: 'Cup Ear',
        rule: 'Cupped hand brought alongside right ear',
        targetTip: { x: 75, y: -55, z: 25 },
        targetKnuckle: { x: 95, y: -20, z: 15 },
        targetWrist: { x: 120, y: 25, z: 0 },
        nmf: { eyebrows: 'raised', mouth: 'listen', headTilt: 'tilt-right' },
      },
      {
        label: 'Attentive Ear',
        rule: 'Hand cups closer focusing sound',
        targetTip: { x: 65, y: -55, z: 22 },
        targetKnuckle: { x: 85, y: -20, z: 12 },
        targetWrist: { x: 110, y: 25, z: 0 },
        nmf: { eyebrows: 'raised', mouth: 'listen', headTilt: 'tilt-right' },
      },
    ],
  },

  'LOOK': {
    id: 'look',
    word: 'LOOK',
    category: 'grammar',
    englishLabel: 'Look / See / Watch',
    gloss: 'LOOK',
    description: 'Two fingers (V-shape) point outward from eyes toward the target locus.',
    aliases: ['SEE', 'WATCH', 'VIEW', 'OBSERVE', 'LOOKS', 'LOOKED', 'LOOKING'],
    isDirectional: true,
    directionalType: 'subject-to-object',
    defaultLoci: { from: 'ME', to: 'YOU' },
    keyframes: [
      {
        label: 'From Eyes',
        rule: 'V-fingers start pointing near eyes',
        targetTip: { x: 35, y: -45, z: 25 },
        targetKnuckle: { x: 60, y: -15, z: 15 },
        targetWrist: { x: 90, y: 25, z: 0 },
        shape: 'v',
        nmf: { eyebrows: 'raised', mouth: 'look' },
      },
      {
        label: 'Direct Outward',
        rule: 'V-fingers thrust forward directing gaze to target locus',
        targetTip: { x: 25, y: -25, z: 65 },
        targetKnuckle: { x: 50, y: 5, z: 45 },
        targetWrist: { x: 80, y: 45, z: 20 },
        shape: 'v',
        nmf: { eyebrows: 'raised', mouth: 'look' },
      },
    ],
  },

  'HELP': {
    id: 'help',
    word: 'HELP',
    category: 'school',
    englishLabel: 'Help / Support',
    gloss: 'HELP',
    description: 'Dominant closed fist with thumb up rests on open non-dominant palm, lifting forward.',
    aliases: ['ASSIST', 'SUPPORT'],
    keyframes: [
      {
        label: 'Rest on Palm',
        rule: 'Dominant thumbs-up fist rests on flat non-dominant palm',
        targetTip: { x: -40, y: 30, z: 14 },
        targetKnuckle: { x: -5, y: 40, z: 5 },
        targetWrist: { x: 55, y: 75, z: -10 },
        nmf: { eyebrows: 'raised', mouth: 'help' },
      },
      {
        label: 'Lift Forward Together',
        rule: 'Both hands move forward together offering supportive help',
        targetTip: { x: -25, y: 5, z: 45 },
        targetKnuckle: { x: 10, y: 15, z: 35 },
        targetWrist: { x: 70, y: 50, z: 15 },
        baseHandOverride: { shiftX: 15, shiftY: -20, shiftZ: 30 },
        nmf: { eyebrows: 'raised', mouth: 'help', headTilt: 'nod' },
      },
    ],
  },

  // =========================================================================
  // STEM & SCIENCE
  // =========================================================================
  'SCIENCE': {
    id: 'science',
    word: 'SCIENCE',
    category: 'stem',
    englishLabel: 'Science / Lab',
    gloss: 'SCIENCE',
    description: 'Alternating pouring gestures of two imaginary beaker test tubes.',
    aliases: ['SCIENTIFIC', 'CHEMISTRY', 'BIOLOGY', 'PHYSICS'],
    keyframes: [
      {
        label: 'Pour Right Beaker',
        rule: 'Dominant hand tilts down pouring test tube',
        targetTip: { x: 30, y: -10, z: 25 },
        targetKnuckle: { x: 60, y: 15, z: 15 },
        targetWrist: { x: 95, y: 50, z: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'science' },
      },
      {
        label: 'Pour Left Beaker',
        rule: 'Hands alternate pouring into opposite vessel',
        targetTip: { x: -30, y: 0, z: 25 },
        targetKnuckle: { x: 10, y: 25, z: 15 },
        targetWrist: { x: 60, y: 60, z: 0 },
        baseHandOverride: { shiftX: 20, shiftY: -15, shiftZ: 10 },
        nmf: { eyebrows: 'neutral', mouth: 'science' },
      },
    ],
  },

  'MATHS': {
    id: 'maths',
    word: 'MATHS',
    category: 'stem',
    englishLabel: 'Maths / Arithmetic',
    gloss: 'MATHS',
    description: 'M-letter fingers tapping rhythmically across palm.',
    aliases: ['MATH', 'MATHEMATICS', 'ARITHMETIC'],
    keyframes: [
      {
        label: 'Tap M Fingers',
        rule: 'Three fingers of dominant hand tap non-dominant palm',
        targetTip: { x: -50, y: 25, z: 12 },
        targetKnuckle: { x: 0, y: 35, z: 5 },
        targetWrist: { x: 60, y: 70, z: -10 },
        nmf: { eyebrows: 'neutral', mouth: 'maths' },
      },
      {
        label: 'Tap Second Stroke',
        rule: 'Second tap calculation rhythm',
        targetTip: { x: -40, y: 20, z: 12 },
        targetKnuckle: { x: 10, y: 30, z: 5 },
        targetWrist: { x: 70, y: 65, z: -10 },
        nmf: { eyebrows: 'neutral', mouth: 'maths' },
      },
    ],
  },

  'NUMBER': {
    id: 'number',
    word: 'NUMBER',
    category: 'stem',
    englishLabel: 'Number / Count',
    gloss: 'NUMBER',
    description: 'Fingertips tap together counting rhythmically.',
    aliases: ['NUMBERS', 'COUNT', 'COUNTING'],
    keyframes: [
      {
        label: 'Fingertip Pinch',
        rule: 'Dominant thumb and index pinch tapping non-dominant index',
        targetTip: { x: -65, y: -10, z: 18 },
        targetKnuckle: { x: -10, y: 15, z: 8 },
        targetWrist: { x: 50, y: 60, z: -10 },
        nmf: { eyebrows: 'neutral', mouth: 'number' },
      },
      {
        label: 'Count Step',
        rule: 'Rebound count tap',
        targetTip: { x: -55, y: 10, z: 18 },
        targetKnuckle: { x: 0, y: 25, z: 8 },
        targetWrist: { x: 60, y: 65, z: -10 },
        nmf: { eyebrows: 'neutral', mouth: 'count' },
      },
    ],
  },

  'EQUAL': {
    id: 'equal',
    word: 'EQUAL',
    category: 'stem',
    englishLabel: 'Equals / Same',
    gloss: 'EQUAL',
    description: 'Both index fingers held parallel horizontally like an equals sign (=).',
    aliases: ['EQUALS', 'SAME', 'EQUIVALENT'],
    keyframes: [
      {
        label: 'Parallel Index Bars',
        rule: 'Dominant index placed parallel just above non-dominant index',
        targetTip: { x: -35, y: 0, z: 20 },
        targetKnuckle: { x: 15, y: 10, z: 10 },
        targetWrist: { x: 75, y: 45, z: 0 },
        shape: 'point',
        palm: 'in',
        hold: 150,
        ease: 'ease-out',
        baseHandMode: 'vowel-board',
        baseHandOverride: { shiftX: 0, shiftY: 15, shiftZ: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'equal' },
      },
      {
        label: 'Press Equality',
        rule: 'Both horizontal fingers tap together confirming equality',
        targetTip: { x: -35, y: 15, z: 20 },
        targetKnuckle: { x: 15, y: 25, z: 10 },
        targetWrist: { x: 75, y: 55, z: 0 },
        shape: 'point',
        palm: 'in',
        hold: 100,
        ease: 'snap',
        baseHandMode: 'vowel-board',
        baseHandOverride: { shiftX: 0, shiftY: 15, shiftZ: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'equal' },
      },
    ],
  },

  'WATER': {
    id: 'water',
    word: 'WATER',
    category: 'stem',
    englishLabel: 'Water / Liquid',
    gloss: 'WATER',
    description: 'Index finger taps side of chin twice (BSL water sign).',
    aliases: ['LIQUID', 'DRINK'],
    keyframes: [
      {
        label: 'Tap Chin 1',
        rule: 'Index finger touches right side of chin',
        targetTip: { x: 25, y: -45, z: 22 },
        targetKnuckle: { x: 55, y: -15, z: 12 },
        targetWrist: { x: 90, y: 25, z: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'water' },
      },
      {
        label: 'Tap Chin 2',
        rule: 'Index finger taps chin second time',
        targetTip: { x: 25, y: -45, z: 22 },
        targetKnuckle: { x: 55, y: -15, z: 12 },
        targetWrist: { x: 90, y: 25, z: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'water' },
      },
    ],
  },

  'LIGHT': {
    id: 'light',
    word: 'LIGHT',
    category: 'stem',
    englishLabel: 'Light / Shine',
    gloss: 'LIGHT',
    description: 'Pinched hand near temple opens outward into bright radiating fingers.',
    aliases: ['SUNLIGHT', 'SHINE', 'BRIGHT'],
    keyframes: [
      {
        label: 'Spark Point',
        rule: 'Fingers pinched near temple',
        targetTip: { x: 50, y: -55, z: 25 },
        targetKnuckle: { x: 75, y: -25, z: 15 },
        targetWrist: { x: 105, y: 15, z: 0 },
        nmf: { eyebrows: 'raised', mouth: 'light' },
      },
      {
        label: 'Radiate Light Rays',
        rule: 'Fingers splay open wide projecting light downward and outward',
        targetTip: { x: 30, y: -10, z: 55 },
        targetKnuckle: { x: 55, y: 20, z: 35 },
        targetWrist: { x: 85, y: 60, z: 15 },
        nmf: { eyebrows: 'raised', mouth: 'light' },
      },
    ],
  },

  // =========================================================================
  // CONVERSATIONAL & CLASSROOM ESSENTIALS
  // =========================================================================
  'HELLO': {
    id: 'hello',
    word: 'HELLO',
    category: 'conversation',
    englishLabel: 'Hello / Welcome',
    gloss: 'HELLO',
    description: 'Dominant open flat hand waves warmly from temple forward.',
    aliases: ['HI', 'WELCOME', 'GREETINGS'],
    keyframes: [
      {
        label: 'Temple Salute',
        rule: 'Open flat hand near right temple',
        targetTip: { x: 60, y: -55, z: 28 },
        targetKnuckle: { x: 85, y: -25, z: 15 },
        targetWrist: { x: 110, y: 15, z: 0 },
        nmf: { eyebrows: 'raised', mouth: 'hello' },
      },
      {
        label: 'Wave Forward',
        rule: 'Hand sweeps warmly forward with open welcome',
        targetTip: { x: 85, y: -40, z: 50 },
        targetKnuckle: { x: 110, y: -10, z: 30 },
        targetWrist: { x: 135, y: 30, z: 10 },
        nmf: { eyebrows: 'raised', mouth: 'hello', headTilt: 'nod' },
      },
    ],
  },

  'THANK YOU': {
    id: 'thank-you',
    word: 'THANK YOU',
    category: 'conversation',
    englishLabel: 'Thank You / Thanks',
    gloss: 'THANK-YOU',
    description: 'Flat hand fingertips touch chin and move forward toward conversational partner.',
    aliases: ['THANKS', 'THANK', 'GRATITUDE'],
    keyframes: [
      {
        label: 'Touch Chin',
        rule: 'Fingertips of flat dominant hand touch chin/lips',
        targetTip: { x: 0, y: -45, z: 24 },
        targetKnuckle: { x: 35, y: -10, z: 12 },
        targetWrist: { x: 80, y: 35, z: 0 },
        nmf: { eyebrows: 'raised', mouth: 'thank you' },
      },
      {
        label: 'Extend Gratitude Forward',
        rule: 'Hand moves smoothly forward toward receiver',
        targetTip: { x: 0, y: 5, z: 65 },
        targetKnuckle: { x: 25, y: 35, z: 45 },
        targetWrist: { x: 70, y: 70, z: 20 },
        nmf: { eyebrows: 'raised', mouth: 'thank you', headTilt: 'nod' },
      },
    ],
  },

  'PLEASE': {
    id: 'please',
    word: 'PLEASE',
    category: 'conversation',
    englishLabel: 'Please',
    gloss: 'PLEASE',
    description: 'Flat hand fingertips touch chin and move forward (identical root to thank you with please mouthing).',
    aliases: ['PRAY-THEE'],
    keyframes: [
      {
        label: 'Touch Lips/Chin',
        rule: 'Flat fingertips rest at lips/chin',
        targetTip: { x: 0, y: -45, z: 24 },
        targetKnuckle: { x: 35, y: -10, z: 12 },
        targetWrist: { x: 80, y: 35, z: 0 },
        nmf: { eyebrows: 'raised', mouth: 'please' },
      },
      {
        label: 'Extend Forward',
        rule: 'Hand moves forward gracefully',
        targetTip: { x: 0, y: 15, z: 60 },
        targetKnuckle: { x: 25, y: 45, z: 40 },
        targetWrist: { x: 70, y: 80, z: 15 },
        nmf: { eyebrows: 'raised', mouth: 'please', headTilt: 'nod' },
      },
    ],
  },

  'YES': {
    id: 'yes',
    word: 'YES',
    category: 'conversation',
    englishLabel: 'Yes / Agree',
    gloss: 'YES',
    description: 'Dominant fist nods up and down like an agreeing head.',
    aliases: ['AGREE', 'CORRECT', 'TRUE'],
    keyframes: [
      {
        label: 'Fist Up',
        rule: 'Closed fist tilts back ready to nod',
        targetTip: { x: 35, y: -10, z: 25 },
        targetKnuckle: { x: 60, y: 15, z: 15 },
        targetWrist: { x: 95, y: 55, z: 0 },
        nmf: { eyebrows: 'raised', mouth: 'yes' },
      },
      {
        label: 'Fist Nod Down',
        rule: 'Fist nods down decisively like a head nod',
        targetTip: { x: 35, y: 30, z: 25 },
        targetKnuckle: { x: 60, y: 55, z: 15 },
        targetWrist: { x: 95, y: 85, z: 0 },
        nmf: { eyebrows: 'raised', mouth: 'yes', headTilt: 'nod' },
      },
    ],
  },

  'NO': {
    id: 'no',
    word: 'NO',
    category: 'conversation',
    englishLabel: 'No / Disagree',
    gloss: 'NO',
    description: 'Index and middle fingers snap shut against thumb twice.',
    aliases: ['DISAGREE', 'INCORRECT', 'FALSE'],
    keyframes: [
      {
        label: 'Beak Open',
        rule: 'Index and middle fingers extend open from thumb',
        targetTip: { x: 35, y: -25, z: 25 },
        targetKnuckle: { x: 60, y: 5, z: 15 },
        targetWrist: { x: 95, y: 45, z: 0 },
        nmf: { eyebrows: 'furrowed', mouth: 'no' },
      },
      {
        label: 'Snap Shut',
        rule: 'Fingers snap closed against thumb',
        targetTip: { x: 35, y: 0, z: 25 },
        targetKnuckle: { x: 60, y: 25, z: 15 },
        targetWrist: { x: 95, y: 65, z: 0 },
        nmf: { eyebrows: 'furrowed', mouth: 'no' },
      },
    ],
  },

  'GOOD': {
    id: 'good',
    word: 'GOOD',
    category: 'conversation',
    englishLabel: 'Good / Well',
    gloss: 'GOOD',
    description: 'Dominant thumbs up rests on flat non-dominant palm with affirmation.',
    aliases: ['WELL', 'EXCELLENT', 'FINE'],
    keyframes: [
      {
        label: 'Thumb Up at Chest',
        rule: 'Thumbs up gesture held in front of heart',
        targetTip: { x: 25, y: 0, z: 25 },
        targetKnuckle: { x: 50, y: 25, z: 15 },
        targetWrist: { x: 85, y: 65, z: 0 },
        nmf: { eyebrows: 'raised', mouth: 'good' },
      },
      {
        label: 'Affirmative Thrust',
        rule: 'Thumbs up moves forward with bright affirmation',
        targetTip: { x: 20, y: 10, z: 50 },
        targetKnuckle: { x: 45, y: 35, z: 35 },
        targetWrist: { x: 80, y: 70, z: 15 },
        nmf: { eyebrows: 'raised', mouth: 'good', headTilt: 'nod' },
      },
    ],
  },

  'FRIEND': {
    id: 'friend',
    word: 'FRIEND',
    category: 'conversation',
    englishLabel: 'Friend / Companionship',
    gloss: 'FRIEND',
    description: 'Dominant index hooks into non-dominant index in an affectionate interlocking clasp.',
    aliases: ['FRIENDS', 'COMPANION', 'PARTNER'],
    keyframes: [
      {
        label: 'Approach Hook',
        rule: 'Dominant hooked index approaches non-dominant hooked index',
        targetTip: { x: -45, y: -10, z: 20 },
        targetKnuckle: { x: 5, y: 15, z: 10 },
        targetWrist: { x: 65, y: 55, z: -10 },
        nmf: { eyebrows: 'raised', mouth: 'friend' },
      },
      {
        label: 'Interlock Clasp',
        rule: 'Both index fingers lock together warmly',
        targetTip: { x: -55, y: 5, z: 16 },
        targetKnuckle: { x: -10, y: 20, z: 8 },
        targetWrist: { x: 50, y: 65, z: -10 },
        nmf: { eyebrows: 'raised', mouth: 'friend', headTilt: 'nod' },
      },
    ],
  },

  // =========================================================================
  // PHASE 2: STEM, ASTRONOMY & KEPLER LAWS EXPANSION
  // =========================================================================
  'SUN': {
    id: 'sun',
    word: 'SUN',
    category: 'stem',
    englishLabel: 'Sun / Solar',
    gloss: 'SUN',
    description: 'Dominant index traces a circle above head, then opens into a radiating open palm.',
    aliases: ['SOLAR', 'SUNLIGHT', 'SUNSHINE'],
    keyframes: [
      {
        label: 'Trace Sun Circle',
        rule: 'Index finger circles clockwise overhead',
        targetTip: { x: 20, y: -70, z: 30 },
        targetKnuckle: { x: 45, y: -35, z: 20 },
        targetWrist: { x: 75, y: 10, z: 0 },
        shape: 'point',
        nmf: { eyebrows: 'raised', mouth: 'sun' },
      },
      {
        label: 'Radiate Solar Rays',
        rule: 'Hand opens wide into spread claw shining down on solar system',
        targetTip: { x: 35, y: -40, z: 50 },
        targetKnuckle: { x: 60, y: -10, z: 35 },
        targetWrist: { x: 90, y: 35, z: 15 },
        shape: 'spread',
        nmf: { eyebrows: 'raised', mouth: 'sun', headTilt: 'tilt-right' },
      },
    ],
  },

  'PLANET': {
    id: 'planet',
    word: 'PLANET',
    category: 'stem',
    englishLabel: 'Planet / World',
    gloss: 'PLANET',
    description: 'Curved dominant hand traces an orbital arc around a spherical non-dominant base.',
    aliases: ['PLANETS', 'WORLD', 'GLOBE'],
    keyframes: [
      {
        label: 'Orbital Approach',
        rule: 'Curved claw hand positions above spherical base fist',
        targetTip: { x: -25, y: 0, z: 25 },
        targetKnuckle: { x: 10, y: 20, z: 15 },
        targetWrist: { x: 60, y: 65, z: 0 },
        shape: 'claw',
        baseHandOverride: { shiftX: -10, shiftY: 10, shiftZ: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'planet' },
      },
      {
        label: 'Orbital Sweep',
        rule: 'Dominant hand sweeps in a semi-circular orbital path around base',
        targetTip: { x: 35, y: 10, z: 30 },
        targetKnuckle: { x: 65, y: 30, z: 18 },
        targetWrist: { x: 105, y: 70, z: 5 },
        shape: 'claw',
        baseHandOverride: { shiftX: -10, shiftY: 10, shiftZ: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'planet' },
      },
    ],
  },

  'ORBIT': {
    id: 'orbit',
    word: 'ORBIT',
    category: 'stem',
    englishLabel: 'Orbit / Revolution',
    gloss: 'ORBIT',
    description: 'Dominant index revolves continuously around non-dominant vertical index core.',
    aliases: ['REVOLVE', 'REVOLUTION', 'ORBITAL'],
    keyframes: [
      {
        label: 'Start Behind Axis',
        rule: 'Dominant index arcs behind non-dominant anchor axis',
        targetTip: { x: -40, y: 10, z: 15 },
        targetKnuckle: { x: -5, y: 25, z: 10 },
        targetWrist: { x: 55, y: 65, z: -5 },
        shape: 'point',
        baseHandOverride: { shiftX: -15, shiftY: 20, shiftZ: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'orbit' },
      },
      {
        label: 'Sweep Across Front',
        rule: 'Dominant index sweeps forward in a broad horizontal elliptic curve',
        targetTip: { x: 25, y: 15, z: 45 },
        targetKnuckle: { x: 55, y: 35, z: 30 },
        targetWrist: { x: 90, y: 70, z: 15 },
        shape: 'point',
        baseHandOverride: { shiftX: -15, shiftY: 20, shiftZ: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'orbit' },
      },
      {
        label: 'Complete Loop',
        rule: 'Returns to start point confirming continuous closed Keplerian orbit',
        targetTip: { x: -35, y: 10, z: 20 },
        targetKnuckle: { x: 0, y: 25, z: 12 },
        targetWrist: { x: 60, y: 65, z: -5 },
        shape: 'point',
        baseHandOverride: { shiftX: -15, shiftY: 20, shiftZ: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'orbit' },
      },
    ],
  },

  'EARTH': {
    id: 'earth',
    word: 'EARTH',
    category: 'stem',
    englishLabel: 'Earth / Terra',
    gloss: 'EARTH',
    description: 'Both curved open hands form a sphere, tilting slightly on its axial plane.',
    aliases: ['GLOBE', 'TERRA', 'WORLD'],
    keyframes: [
      {
        label: 'Form Top Hemispheres',
        rule: 'Both curved hands frame the northern sphere',
        targetTip: { x: -10, y: 5, z: 30 },
        targetKnuckle: { x: 25, y: 25, z: 18 },
        targetWrist: { x: 70, y: 60, z: 5 },
        shape: 'claw',
        baseHandOverride: { shiftX: -30, shiftY: 0, shiftZ: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'earth' },
      },
      {
        label: 'Rotate Axis',
        rule: 'Hands tilt diagonally denoting axial tilt',
        targetTip: { x: 15, y: 15, z: 32 },
        targetKnuckle: { x: 45, y: 35, z: 20 },
        targetWrist: { x: 85, y: 70, z: 5 },
        shape: 'claw',
        baseHandOverride: { shiftX: -30, shiftY: -10, shiftZ: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'earth', headTilt: 'tilt-left' },
      },
    ],
  },

  'MOON': {
    id: 'moon',
    word: 'MOON',
    category: 'stem',
    englishLabel: 'Moon / Lunar',
    gloss: 'MOON',
    description: 'C-hand (crescent shape) positioned near eye/temple, moving slightly upward.',
    aliases: ['LUNAR', 'CRESCENT'],
    keyframes: [
      {
        label: 'Crescent at Eye',
        rule: 'Thumb and index form C-shape near dominant eye',
        targetTip: { x: 55, y: -50, z: 28 },
        targetKnuckle: { x: 80, y: -20, z: 18 },
        targetWrist: { x: 110, y: 20, z: 0 },
        shape: 'claw',
        nmf: { eyebrows: 'raised', mouth: 'moon' },
      },
      {
        label: 'Ascend Lunar Arc',
        rule: 'Crescent moves gently outward and upward into the night sky',
        targetTip: { x: 70, y: -70, z: 35 },
        targetKnuckle: { x: 95, y: -40, z: 22 },
        targetWrist: { x: 125, y: 0, z: 5 },
        shape: 'claw',
        nmf: { eyebrows: 'raised', mouth: 'moon', headTilt: 'tilt-right' },
      },
    ],
  },

  'GRAVITY': {
    id: 'gravity',
    word: 'GRAVITY',
    category: 'stem',
    englishLabel: 'Gravity / Attraction',
    gloss: 'GRAVITY',
    description: 'Open flat hand drops abruptly downward into flat base palm with authoritative weight.',
    aliases: ['GRAVITATIONAL', 'WEIGHT', 'PULL'],
    keyframes: [
      {
        label: 'Suspended High',
        rule: 'Dominant open hand suspended flat above base',
        targetTip: { x: -20, y: -20, z: 30 },
        targetKnuckle: { x: 15, y: 0, z: 20 },
        targetWrist: { x: 65, y: 40, z: 10 },
        shape: 'flat',
        baseHandOverride: { shiftX: -10, shiftY: 25, shiftZ: 0 },
        nmf: { eyebrows: 'furrowed', mouth: 'gravity' },
      },
      {
        label: 'Sudden Downward Drop',
        rule: 'Hand plunges straight down striking the base with gravitational mass',
        targetTip: { x: -40, y: 30, z: 15 },
        targetKnuckle: { x: -5, y: 40, z: 5 },
        targetWrist: { x: 55, y: 75, z: -5 },
        shape: 'flat',
        baseHandOverride: { shiftX: -10, shiftY: 25, shiftZ: 0 },
        nmf: { eyebrows: 'furrowed', mouth: 'down', headTilt: 'nod' },
      },
    ],
  },

  'FAST': {
    id: 'fast',
    word: 'FAST',
    category: 'stem',
    englishLabel: 'Fast / Rapid / Quick',
    gloss: 'FAST',
    description: 'Dominant index flicks rapidly across non-dominant index in a high-velocity spark.',
    aliases: ['QUICK', 'RAPID', 'SPEED', 'FASTEST'],
    keyframes: [
      {
        label: 'Cock Finger',
        rule: 'Dominant hooked index poised right behind base index',
        targetTip: { x: -45, y: 0, z: 20 },
        targetKnuckle: { x: 0, y: 15, z: 12 },
        targetWrist: { x: 60, y: 55, z: 0 },
        shape: 'point',
        baseHandOverride: { shiftX: -15, shiftY: 10, shiftZ: 0 },
        nmf: { eyebrows: 'raised', mouth: 'fast' },
      },
      {
        label: 'High-Velocity Flick',
        rule: 'Dominant index snaps rapidly forward in an instant strike',
        targetTip: { x: 10, y: -10, z: 50 },
        targetKnuckle: { x: 40, y: 10, z: 35 },
        targetWrist: { x: 85, y: 45, z: 15 },
        shape: 'point',
        baseHandOverride: { shiftX: -15, shiftY: 10, shiftZ: 0 },
        nmf: { eyebrows: 'raised', mouth: 'fast', headTilt: 'nod' },
      },
    ],
  },

  'TIME': {
    id: 'time',
    word: 'TIME',
    category: 'stem',
    englishLabel: 'Time / Period',
    gloss: 'TIME',
    description: 'Dominant index finger taps the wrist watch face twice on non-dominant carpal.',
    aliases: ['CLOCK', 'PERIOD', 'DURATION', 'HOUR'],
    keyframes: [
      {
        label: 'Tap Wrist 1',
        rule: 'Dominant index taps outer wrist face of base hand',
        targetTip: { x: -55, y: 35, z: 10 },
        targetKnuckle: { x: -10, y: 40, z: 5 },
        targetWrist: { x: 45, y: 70, z: -10 },
        shape: 'point',
        baseHandOverride: { shiftX: -20, shiftY: 20, shiftZ: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'time' },
      },
      {
        label: 'Lift',
        rule: 'Slight rebound lift',
        targetTip: { x: -50, y: 15, z: 20 },
        targetKnuckle: { x: -5, y: 25, z: 12 },
        targetWrist: { x: 50, y: 60, z: -5 },
        shape: 'point',
        baseHandOverride: { shiftX: -20, shiftY: 20, shiftZ: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'time' },
      },
      {
        label: 'Tap Wrist 2',
        rule: 'Second tap confirming temporal measurement',
        targetTip: { x: -55, y: 35, z: 10 },
        targetKnuckle: { x: -10, y: 40, z: 5 },
        targetWrist: { x: 45, y: 70, z: -10 },
        shape: 'point',
        baseHandOverride: { shiftX: -20, shiftY: 20, shiftZ: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'time' },
      },
    ],
  },

  'ENERGY': {
    id: 'energy',
    word: 'ENERGY',
    category: 'stem',
    englishLabel: 'Energy / Power',
    gloss: 'ENERGY',
    description: 'E-finger shape brushes firmly down the inner dominant forearm twice.',
    aliases: ['POWER', 'FORCE-FIELD'],
    keyframes: [
      {
        label: 'High Arm Start',
        rule: 'Clawed fingertips touch upper forearm',
        targetTip: { x: 40, y: -15, z: 20 },
        targetKnuckle: { x: 65, y: 10, z: 12 },
        targetWrist: { x: 100, y: 50, z: 0 },
        shape: 'claw',
        nmf: { eyebrows: 'neutral', mouth: 'energy' },
      },
      {
        label: 'Power Stroke Down',
        rule: 'Hand pulls down flexing wrist with kinetic vigor',
        targetTip: { x: 25, y: 25, z: 25 },
        targetKnuckle: { x: 50, y: 45, z: 15 },
        targetWrist: { x: 85, y: 80, z: 0 },
        shape: 'claw',
        nmf: { eyebrows: 'raised', mouth: 'energy', headTilt: 'nod' },
      },
    ],
  },

  'FORCE': {
    id: 'force',
    word: 'FORCE',
    category: 'stem',
    englishLabel: 'Force / Push',
    gloss: 'FORCE',
    description: 'Both flat open palms face forward at shoulder height and push outward with muscular effort.',
    aliases: ['PUSH', 'PRESSURE'],
    keyframes: [
      {
        label: 'Poised at Chest',
        rule: 'Both flat hands held vertical in front of shoulders',
        targetTip: { x: 0, y: -10, z: 20 },
        targetKnuckle: { x: 30, y: 15, z: 10 },
        targetWrist: { x: 75, y: 55, z: 0 },
        shape: 'flat',
        baseHandOverride: { shiftX: -30, shiftY: 0, shiftZ: 0 },
        nmf: { eyebrows: 'furrowed', mouth: 'force' },
      },
      {
        label: 'Muscular Push Out',
        rule: 'Both palms thrust forward driving against resistance',
        targetTip: { x: 0, y: -5, z: 65 },
        targetKnuckle: { x: 25, y: 20, z: 50 },
        targetWrist: { x: 70, y: 60, z: 25 },
        shape: 'flat',
        baseHandOverride: { shiftX: -30, shiftY: 0, shiftZ: 0 },
        nmf: { eyebrows: 'furrowed', mouth: 'force', headTilt: 'nod' },
      },
    ],
  },

  // =========================================================================
  // PHASE 2 FOUNDATIONAL CONVERSATIONAL & CLASSROOM BASIC SIGNS
  // =========================================================================
  'WHAT': {
    id: 'what',
    word: 'WHAT',
    category: 'conversation',
    englishLabel: 'What / Query',
    gloss: 'WHAT',
    description: 'Both open hands held forward palms up, swinging gently side to side with inquisitive furrowed brows.',
    aliases: ['WHATS', 'QUERY'],
    keyframes: [
      {
        label: 'Palms Up Chest Level',
        rule: 'Both open flat hands held forward palms up at chest',
        targetTip: { x: 15, y: 10, z: 30 },
        targetKnuckle: { x: 45, y: 30, z: 20 },
        targetWrist: { x: 80, y: 65, z: 5 },
        shape: 'flat',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'furrowed', mouth: 'what' },
      },
      {
        label: 'Inquisitive Side Swing',
        rule: 'Both open palms swing outward slightly in inquiry',
        targetTip: { x: 45, y: 15, z: 35 },
        targetKnuckle: { x: 75, y: 35, z: 25 },
        targetWrist: { x: 110, y: 70, z: 10 },
        shape: 'flat',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'furrowed', mouth: 'what', headTilt: 'nod' },
      },
    ],
  },

  'WHERE': {
    id: 'where',
    word: 'WHERE',
    category: 'conversation',
    englishLabel: 'Where / Location',
    gloss: 'WHERE',
    description: 'Both flat palms facing upward held at chest level move in small horizontal circles with furrowed brows.',
    aliases: ['WHERES'],
    keyframes: [
      {
        label: 'Palms Up Center',
        rule: 'Open palms face upward held at mid chest',
        targetTip: { x: 20, y: 15, z: 25 },
        targetKnuckle: { x: 50, y: 35, z: 15 },
        targetWrist: { x: 85, y: 70, z: 0 },
        shape: 'flat',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'furrowed', mouth: 'where' },
      },
      {
        label: 'Horizontal Search Circles',
        rule: 'Hands circle slightly outward searching for location',
        targetTip: { x: 40, y: 15, z: 35 },
        targetKnuckle: { x: 70, y: 35, z: 25 },
        targetWrist: { x: 105, y: 70, z: 10 },
        shape: 'flat',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'furrowed', mouth: 'where', headTilt: 'tilt-left' },
      },
    ],
  },

  'WHO': {
    id: 'who',
    word: 'WHO',
    category: 'conversation',
    englishLabel: 'Who / Person',
    gloss: 'WHO',
    description: 'Dominant index finger circles in small clockwise circles beside chin with furrowed inquisitive brows.',
    aliases: ['WHOM', 'WHOSE'],
    keyframes: [
      {
        label: 'Index Near Chin',
        rule: 'Dominant index points upward beside right side of chin',
        targetTip: { x: 30, y: -45, z: 24 },
        targetKnuckle: { x: 55, y: -15, z: 14 },
        targetWrist: { x: 90, y: 25, z: 0 },
        shape: 'point',
        nmf: { eyebrows: 'furrowed', mouth: 'who' },
      },
      {
        label: 'Inquisitive Circle',
        rule: 'Dominant index circles gently beside mouth',
        targetTip: { x: 25, y: -40, z: 26 },
        targetKnuckle: { x: 50, y: -10, z: 16 },
        targetWrist: { x: 85, y: 30, z: 0 },
        shape: 'point',
        nmf: { eyebrows: 'furrowed', mouth: 'who', headTilt: 'nod' },
      },
    ],
  },

  'WHY': {
    id: 'why',
    word: 'WHY',
    category: 'conversation',
    englishLabel: 'Why / Reason',
    gloss: 'WHY',
    description: 'Dominant index finger points and touches non-dominant chest/shoulder with furrowed inquiring brows.',
    aliases: ['REASON'],
    keyframes: [
      {
        label: 'Touch Chest',
        rule: 'Dominant index finger taps left upper chest',
        targetTip: { x: -20, y: -10, z: 20 },
        targetKnuckle: { x: 15, y: 15, z: 12 },
        targetWrist: { x: 65, y: 55, z: 0 },
        shape: 'point',
        nmf: { eyebrows: 'furrowed', mouth: 'why' },
      },
      {
        label: 'Inquiring Rebound',
        rule: 'Dominant index rebounds slightly outward with quizzical expression',
        targetTip: { x: -5, y: -20, z: 35 },
        targetKnuckle: { x: 30, y: 5, z: 25 },
        targetWrist: { x: 80, y: 45, z: 10 },
        shape: 'point',
        nmf: { eyebrows: 'furrowed', mouth: 'why', headTilt: 'tilt-right' },
      },
    ],
  },

  'WHEN': {
    id: 'when',
    word: 'WHEN',
    category: 'conversation',
    englishLabel: 'When / Time Point',
    gloss: 'WHEN',
    description: 'Dominant fingers flutter lightly forward across cheek from right to left like passing time.',
    aliases: ['WHENEVER'],
    keyframes: [
      {
        label: 'Cheek Flutter Start',
        rule: 'Fingertips poised near right cheekbone',
        targetTip: { x: 45, y: -50, z: 25 },
        targetKnuckle: { x: 70, y: -20, z: 15 },
        targetWrist: { x: 100, y: 20, z: 0 },
        shape: 'spread',
        nmf: { eyebrows: 'furrowed', mouth: 'when' },
      },
      {
        label: 'Temporal Flutter Forward',
        rule: 'Fingers flutter forward with furrowed questioning brows',
        targetTip: { x: 55, y: -35, z: 45 },
        targetKnuckle: { x: 80, y: -5, z: 30 },
        targetWrist: { x: 110, y: 35, z: 15 },
        shape: 'spread',
        nmf: { eyebrows: 'furrowed', mouth: 'when', headTilt: 'nod' },
      },
    ],
  },

  'HOW': {
    id: 'how',
    word: 'HOW',
    category: 'conversation',
    englishLabel: 'How / Manner',
    gloss: 'HOW',
    description: 'Both curved hands with knuckles touching twist inward and outward from wrists, questioning brows.',
    aliases: ['MANNER'],
    keyframes: [
      {
        label: 'Knuckles Touching',
        rule: 'Both curved hands held knuckles together at chest',
        targetTip: { x: -10, y: 10, z: 25 },
        targetKnuckle: { x: 25, y: 30, z: 15 },
        targetWrist: { x: 70, y: 65, z: 0 },
        shape: 'claw',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'furrowed', mouth: 'how' },
      },
      {
        label: 'Twist Outward',
        rule: 'Wrists rotate turning palms upward in inquiry',
        targetTip: { x: 25, y: 20, z: 35 },
        targetKnuckle: { x: 55, y: 40, z: 25 },
        targetWrist: { x: 95, y: 75, z: 10 },
        shape: 'flat',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'furrowed', mouth: 'how', headTilt: 'tilt-left' },
      },
    ],
  },

  'GOODBYE': {
    id: 'goodbye',
    word: 'GOODBYE',
    category: 'conversation',
    englishLabel: 'Goodbye / Farewell',
    gloss: 'GOODBYE',
    description: 'Dominant open flat hand waves warmly side-to-side at shoulder height.',
    aliases: ['BYE', 'FAREWELL', 'SEE-YOU'],
    keyframes: [
      {
        label: 'Wave Left',
        rule: 'Open flat hand tilts toward left at upper shoulder level',
        targetTip: { x: 45, y: -50, z: 30 },
        targetKnuckle: { x: 70, y: -20, z: 20 },
        targetWrist: { x: 100, y: 20, z: 5 },
        shape: 'flat',
        nmf: { eyebrows: 'raised', mouth: 'bye' },
      },
      {
        label: 'Wave Right',
        rule: 'Open flat hand tilts smoothly toward right with warm farewell smile',
        targetTip: { x: 75, y: -45, z: 35 },
        targetKnuckle: { x: 95, y: -15, z: 25 },
        targetWrist: { x: 120, y: 25, z: 10 },
        shape: 'flat',
        nmf: { eyebrows: 'raised', mouth: 'goodbye', headTilt: 'tilt-right' },
      },
    ],
  },

  'NAME': {
    id: 'name',
    word: 'NAME',
    category: 'conversation',
    englishLabel: 'Name / Called',
    gloss: 'NAME',
    description: 'Dominant index and middle finger (H/V shape) brush across the forehead from left to right.',
    aliases: ['NAMES', 'CALLED', 'NAMED'],
    keyframes: [
      {
        label: 'Forehead Left',
        rule: 'Two fingers touch left side of forehead',
        targetTip: { x: -15, y: -65, z: 25 },
        targetKnuckle: { x: 20, y: -35, z: 15 },
        targetWrist: { x: 65, y: 5, z: 0 },
        shape: 'v',
        nmf: { eyebrows: 'neutral', mouth: 'name' },
      },
      {
        label: 'Forehead Sweep Across',
        rule: 'Two fingers sweep across to right side of forehead',
        targetTip: { x: 45, y: -65, z: 25 },
        targetKnuckle: { x: 70, y: -35, z: 15 },
        targetWrist: { x: 100, y: 5, z: 0 },
        shape: 'v',
        nmf: { eyebrows: 'neutral', mouth: 'name', headTilt: 'nod' },
      },
    ],
  },

  'SORRY': {
    id: 'sorry',
    word: 'SORRY',
    category: 'conversation',
    englishLabel: 'Sorry / Apology',
    gloss: 'SORRY',
    description: 'Dominant closed fist makes gentle circular rubbing motion over heart with apologetic expression.',
    aliases: ['APOLOGY', 'APOLOGISE', 'APOLOGIZE', 'FORGIVE'],
    keyframes: [
      {
        label: 'Fist at Heart',
        rule: 'Closed fist placed against left chest over heart',
        targetTip: { x: -15, y: 0, z: 20 },
        targetKnuckle: { x: 15, y: 25, z: 10 },
        targetWrist: { x: 60, y: 60, z: 0 },
        shape: 'fist',
        nmf: { eyebrows: 'furrowed', mouth: 'sorry' },
      },
      {
        label: 'Circular Rub Over Heart',
        rule: 'Fist rubs circularly over heart with sincere head bow',
        targetTip: { x: -20, y: 10, z: 22 },
        targetKnuckle: { x: 10, y: 35, z: 12 },
        targetWrist: { x: 55, y: 70, z: 0 },
        shape: 'fist',
        nmf: { eyebrows: 'furrowed', mouth: 'sorry', headTilt: 'nod' },
      },
    ],
  },

  'WELCOME': {
    id: 'welcome',
    word: 'WELCOME',
    category: 'conversation',
    englishLabel: 'Welcome / Receive',
    gloss: 'WELCOME',
    description: 'Both open hands with palms facing inward sweep from outside inward toward heart in a welcoming embrace.',
    aliases: ['HOSPITALITY', 'WELCOME-ALL'],
    keyframes: [
      {
        label: 'Open Arms Wide',
        rule: 'Both open hands spread outward welcoming visitor',
        targetTip: { x: 65, y: 0, z: 30 },
        targetKnuckle: { x: 90, y: 25, z: 20 },
        targetWrist: { x: 120, y: 60, z: 5 },
        shape: 'flat',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'welcome' },
      },
      {
        label: 'Gather to Heart',
        rule: 'Hands sweep inward toward chest warmly receiving guest',
        targetTip: { x: 15, y: 5, z: 25 },
        targetKnuckle: { x: 45, y: 30, z: 15 },
        targetWrist: { x: 80, y: 65, z: 0 },
        shape: 'flat',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'welcome', headTilt: 'nod' },
      },
    ],
  },

  'START': {
    id: 'start',
    word: 'START',
    category: 'school',
    englishLabel: 'Start / Begin',
    gloss: 'START',
    description: 'Dominant index finger twists clockwise between non-dominant index and middle fingers like turning a key.',
    aliases: ['BEGIN', 'COMMENCE', 'STARTS'],
    keyframes: [
      {
        label: 'Key in Ignition',
        rule: 'Dominant index inserted between non-dominant index and middle',
        targetTip: { x: -45, y: 15, z: 16 },
        targetKnuckle: { x: 5, y: 25, z: 8 },
        targetWrist: { x: 60, y: 65, z: -10 },
        shape: 'point',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'raised', mouth: 'start' },
      },
      {
        label: 'Twist Ignition Key',
        rule: 'Dominant wrist rotates sharply turning key forward to initiate',
        targetTip: { x: -35, y: 10, z: 25 },
        targetKnuckle: { x: 15, y: 20, z: 15 },
        targetWrist: { x: 70, y: 55, z: 0 },
        shape: 'point',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'raised', mouth: 'begin', headTilt: 'nod' },
      },
    ],
  },

  'STOP': {
    id: 'stop',
    word: 'STOP',
    category: 'school',
    englishLabel: 'Stop / Halt',
    gloss: 'STOP',
    description: 'Dominant flat open hand chops down vertically onto flat horizontal palm of non-dominant hand.',
    aliases: ['HALT', 'CEASE', 'STOPS', 'FREEZE'],
    keyframes: [
      {
        label: 'Raise Chopping Hand',
        rule: 'Dominant flat hand poised vertically above horizontal base palm',
        targetTip: { x: -40, y: -10, z: 25 },
        targetKnuckle: { x: 0, y: 10, z: 15 },
        targetWrist: { x: 55, y: 50, z: 0 },
        shape: 'flat',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'furrowed', mouth: 'stop' },
      },
      {
        label: 'Decisive Palm Chop',
        rule: 'Dominant hand chops firmly down striking base palm into complete halt',
        targetTip: { x: -45, y: 25, z: 12 },
        targetKnuckle: { x: 5, y: 35, z: 5 },
        targetWrist: { x: 65, y: 70, z: -10 },
        shape: 'flat',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'furrowed', mouth: 'stop', headTilt: 'nod' },
      },
    ],
  },

  'SIT': {
    id: 'sit',
    word: 'SIT',
    category: 'school',
    englishLabel: 'Sit / Be Seated',
    gloss: 'SIT',
    description: 'Dominant hooked two fingers press downward onto non-dominant horizontal fingers like legs sitting down.',
    aliases: ['SIT-DOWN', 'SEAT', 'SEATED'],
    keyframes: [
      {
        label: 'Legs Poised Above Seat',
        rule: 'Hooked two fingers hover above base fingers',
        targetTip: { x: -45, y: 0, z: 22 },
        targetKnuckle: { x: 0, y: 15, z: 12 },
        targetWrist: { x: 55, y: 55, z: 0 },
        shape: 'claw',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'sit' },
      },
      {
        label: 'Press Down to Sit',
        rule: 'Fingers press firmly down onto base denoting sitting down',
        targetTip: { x: -45, y: 25, z: 14 },
        targetKnuckle: { x: 5, y: 35, z: 5 },
        targetWrist: { x: 65, y: 70, z: -10 },
        shape: 'claw',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'sit', headTilt: 'nod' },
      },
    ],
  },

  'STAND': {
    id: 'stand',
    word: 'STAND',
    category: 'school',
    englishLabel: 'Stand / Stand Up',
    gloss: 'STAND',
    description: 'Dominant inverted V-fingers stand upright on non-dominant flat palm, then elevate upward.',
    aliases: ['STAND-UP', 'UPRIGHT'],
    keyframes: [
      {
        label: 'Standing on Palm',
        rule: 'Inverted V-fingers stand upright on non-dominant palm',
        targetTip: { x: -45, y: 20, z: 14 },
        targetKnuckle: { x: 0, y: 0, z: 20 },
        targetWrist: { x: 55, y: -20, z: 25 },
        shape: 'v',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'raised', mouth: 'stand' },
      },
      {
        label: 'Rise Tall',
        rule: 'Hand lifts upward asserting tall upright posture',
        targetTip: { x: -35, y: -25, z: 30 },
        targetKnuckle: { x: 10, y: -45, z: 35 },
        targetWrist: { x: 65, y: -65, z: 40 },
        shape: 'v',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'raised', mouth: 'up', headTilt: 'nod' },
      },
    ],
  },

  'WAIT': {
    id: 'wait',
    word: 'WAIT',
    category: 'school',
    englishLabel: 'Wait / Hold On',
    gloss: 'WAIT',
    description: 'Both flat open hands held out palm forward at mid-chest in reassuring calm posture.',
    aliases: ['HOLD-ON', 'PAUSE', 'PATIENCE'],
    keyframes: [
      {
        label: 'Palm Forward Halt',
        rule: 'Both flat hands pushed forward facing listener at mid-chest',
        targetTip: { x: 25, y: -10, z: 45 },
        targetKnuckle: { x: 55, y: 15, z: 30 },
        targetWrist: { x: 90, y: 55, z: 10 },
        shape: 'flat',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'neutral', mouth: 'wait' },
      },
      {
        label: 'Calm Reassurance',
        rule: 'Hands pulse gently forward reminding student to hold on',
        targetTip: { x: 25, y: -5, z: 55 },
        targetKnuckle: { x: 55, y: 20, z: 40 },
        targetWrist: { x: 90, y: 60, z: 20 },
        shape: 'flat',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'neutral', mouth: 'wait', headTilt: 'nod' },
      },
    ],
  },

  'FINISH': {
    id: 'finish',
    word: 'FINISH',
    category: 'school',
    englishLabel: 'Finish / Completed',
    gloss: 'FINISH',
    description: 'Both flat open hands held out in front flick outward from wrists decisively confirming completion.',
    aliases: ['DONE', 'COMPLETED', 'FINISHED', 'END'],
    keyframes: [
      {
        label: 'Hands Poised Inward',
        rule: 'Both open flat hands held facing inward at chest level',
        targetTip: { x: -10, y: 5, z: 25 },
        targetKnuckle: { x: 25, y: 25, z: 15 },
        targetWrist: { x: 70, y: 60, z: 0 },
        shape: 'flat',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'finish' },
      },
      {
        label: 'Flick Outward Done',
        rule: 'Both hands flick outward shaking off tasks in finality',
        targetTip: { x: 45, y: 20, z: 35 },
        targetKnuckle: { x: 75, y: 40, z: 25 },
        targetWrist: { x: 110, y: 75, z: 10 },
        shape: 'spread',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'done', headTilt: 'nod' },
      },
    ],
  },

  'CORRECT': {
    id: 'correct',
    word: 'CORRECT',
    category: 'school',
    englishLabel: 'Correct / Right',
    gloss: 'CORRECT',
    description: 'Dominant extended index finger taps firmly onto non-dominant index finger twice in clear affirmation.',
    aliases: ['RIGHT', 'ACCURATE', 'EXACT'],
    keyframes: [
      {
        label: 'Align Index Fingers',
        rule: 'Dominant index taps down onto non-dominant index',
        targetTip: { x: -45, y: 15, z: 18 },
        targetKnuckle: { x: 5, y: 25, z: 8 },
        targetWrist: { x: 65, y: 60, z: -10 },
        shape: 'point',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'raised', mouth: 'correct' },
      },
      {
        label: 'Affirmative Second Tap',
        rule: 'Rebounds and strikes index firmly confirming correct answer',
        targetTip: { x: -45, y: 15, z: 18 },
        targetKnuckle: { x: 5, y: 25, z: 8 },
        targetWrist: { x: 65, y: 60, z: -10 },
        shape: 'point',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'raised', mouth: 'right', headTilt: 'nod' },
      },
    ],
  },

  'WRONG': {
    id: 'wrong',
    word: 'WRONG',
    category: 'school',
    englishLabel: 'Wrong / Incorrect',
    gloss: 'WRONG',
    description: 'Dominant crooked finger taps against chin/cheek, shaking head with furrowed brows.',
    aliases: ['INCORRECT', 'MISTAKE', 'ERROR', 'FALSE'],
    keyframes: [
      {
        label: 'Tap Chin',
        rule: 'Dominant hooked index finger touches side of chin',
        targetTip: { x: 25, y: -45, z: 24 },
        targetKnuckle: { x: 55, y: -15, z: 14 },
        targetWrist: { x: 90, y: 25, z: 0 },
        shape: 'claw',
        nmf: { eyebrows: 'furrowed', mouth: 'wrong', headTilt: 'tilt-left' },
      },
      {
        label: 'Correction Tap',
        rule: 'Hooked finger taps second time with head shake',
        targetTip: { x: 25, y: -45, z: 24 },
        targetKnuckle: { x: 55, y: -15, z: 14 },
        targetWrist: { x: 90, y: 25, z: 0 },
        shape: 'claw',
        nmf: { eyebrows: 'furrowed', mouth: 'no', headTilt: 'tilt-right' },
      },
    ],
  },

  'HAPPY': {
    id: 'happy',
    word: 'HAPPY',
    category: 'conversation',
    englishLabel: 'Happy / Joyful',
    gloss: 'HAPPY',
    description: 'Dominant flat open hand brushes upward twice across the chest in cheerful light strokes with broad smile.',
    aliases: ['GLAD', 'JOY', 'JOYFUL', 'DELIGHT'],
    keyframes: [
      {
        label: 'Brush Up Chest 1',
        rule: 'Flat open hand brushes up across chest',
        targetTip: { x: -10, y: 10, z: 20 },
        targetKnuckle: { x: 25, y: 35, z: 10 },
        targetWrist: { x: 70, y: 70, z: 0 },
        shape: 'flat',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'raised', mouth: 'happy' },
      },
      {
        label: 'Brush Up Chest 2',
        rule: 'Second light buoyant upward stroke beaming with joyful enthusiasm',
        targetTip: { x: 10, y: -25, z: 30 },
        targetKnuckle: { x: 45, y: 0, z: 18 },
        targetWrist: { x: 85, y: 40, z: 5 },
        shape: 'flat',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'raised', mouth: 'happy', headTilt: 'nod' },
      },
    ],
  },

  'SAD': {
    id: 'sad',
    word: 'SAD',
    category: 'conversation',
    englishLabel: 'Sad / Unhappy',
    gloss: 'SAD',
    description: 'Dominant open hand fingertips stroke slowly downward past cheek and chest with downcast expression.',
    aliases: ['UNHAPPY', 'SORROW', 'GLUM', 'DOWN'],
    keyframes: [
      {
        label: 'Touch High Cheek',
        rule: 'Fingertips gently touch upper cheek near eye',
        targetTip: { x: 40, y: -50, z: 25 },
        targetKnuckle: { x: 65, y: -20, z: 15 },
        targetWrist: { x: 95, y: 20, z: 0 },
        shape: 'flat',
        nmf: { eyebrows: 'furrowed', mouth: 'sad' },
      },
      {
        label: 'Slow Downward Draw',
        rule: 'Hand draws slowly down toward lower chest reflecting downcast emotion',
        targetTip: { x: 20, y: 25, z: 20 },
        targetKnuckle: { x: 45, y: 50, z: 10 },
        targetWrist: { x: 80, y: 85, z: 0 },
        shape: 'flat',
        nmf: { eyebrows: 'furrowed', mouth: 'sad', headTilt: 'nod' },
      },
    ],
  },

  'MORE': {
    id: 'more',
    word: 'MORE',
    category: 'conversation',
    englishLabel: 'More / Additional',
    gloss: 'MORE',
    description: 'Dominant flat hand rests on non-dominant flat hand then scoops forward adding more.',
    aliases: ['ADDITIONAL', 'EXTRA', 'PLUS'],
    keyframes: [
      {
        label: 'Rest on Base Hand',
        rule: 'Dominant flat hand rests on horizontal base palm',
        targetTip: { x: -45, y: 20, z: 14 },
        targetKnuckle: { x: 5, y: 35, z: 5 },
        targetWrist: { x: 65, y: 70, z: -10 },
        shape: 'flat',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'raised', mouth: 'more' },
      },
      {
        label: 'Scoop Forward Adding More',
        rule: 'Hand sweeps forward and upward gathering additional quantity',
        targetTip: { x: -20, y: 0, z: 45 },
        targetKnuckle: { x: 15, y: 15, z: 35 },
        targetWrist: { x: 75, y: 50, z: 15 },
        shape: 'flat',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'raised', mouth: 'more', headTilt: 'nod' },
      },
    ],
  },

  'AGAIN': {
    id: 'again',
    word: 'AGAIN',
    category: 'conversation',
    englishLabel: 'Again / Repeat',
    gloss: 'AGAIN',
    description: 'Dominant two fingers (V-shape) arc over and tap non-dominant palm in repetition.',
    aliases: ['REPEAT', 'ONCE-MORE', 'ENCORE'],
    keyframes: [
      {
        label: 'Arc Above Palm',
        rule: 'Two fingers arc above non-dominant open palm',
        targetTip: { x: -45, y: -10, z: 25 },
        targetKnuckle: { x: 0, y: 10, z: 15 },
        targetWrist: { x: 55, y: 50, z: 0 },
        shape: 'v',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'raised', mouth: 'again' },
      },
      {
        label: 'Tap Palm Again',
        rule: 'Two fingers tap down decisively onto base palm confirming repetition',
        targetTip: { x: -45, y: 25, z: 14 },
        targetKnuckle: { x: 5, y: 35, z: 5 },
        targetWrist: { x: 65, y: 70, z: -10 },
        shape: 'v',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'raised', mouth: 'again', headTilt: 'nod' },
      },
    ],
  },

  'SLOW': {
    id: 'slow',
    word: 'SLOW',
    category: 'stem',
    englishLabel: 'Slow / Deliberate',
    gloss: 'SLOW',
    description: 'Dominant flat hand glides slowly and smoothly up the back of non-dominant forearm.',
    aliases: ['SLOWLY', 'DELAY', 'GENTLE'],
    keyframes: [
      {
        label: 'Glide Start at Wrist',
        rule: 'Dominant fingertips touch back of non-dominant wrist',
        targetTip: { x: -65, y: 35, z: 10 },
        targetKnuckle: { x: -20, y: 40, z: 5 },
        targetWrist: { x: 35, y: 70, z: -10 },
        shape: 'flat',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'slow' },
      },
      {
        label: 'Smooth Upward Stroke',
        rule: 'Hand glides slowly up forearm toward elbow',
        targetTip: { x: -30, y: 15, z: 16 },
        targetKnuckle: { x: 15, y: 25, z: 8 },
        targetWrist: { x: 70, y: 55, z: 0 },
        shape: 'flat',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'slow', headTilt: 'nod' },
      },
    ],
  },

  'BIG': {
    id: 'big',
    word: 'BIG',
    category: 'stem',
    englishLabel: 'Big / Large',
    gloss: 'BIG',
    description: 'Both curved claw hands start together in center and spread widely apart indicating vast scale.',
    aliases: ['LARGE', 'HUGE', 'GREAT', 'GIANT'],
    keyframes: [
      {
        label: 'Center Bounds',
        rule: 'Curved hands held together framing moderate boundary',
        targetTip: { x: -10, y: 0, z: 25 },
        targetKnuckle: { x: 20, y: 20, z: 15 },
        targetWrist: { x: 65, y: 55, z: 0 },
        shape: 'claw',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'big' },
      },
      {
        label: 'Expand Wide Apart',
        rule: 'Hands push widely outward with puffed cheeks indicating immense size',
        targetTip: { x: 75, y: -15, z: 40 },
        targetKnuckle: { x: 105, y: 10, z: 28 },
        targetWrist: { x: 140, y: 45, z: 12 },
        shape: 'claw',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'huge', headTilt: 'nod' },
      },
    ],
  },

  'SMALL': {
    id: 'small',
    word: 'SMALL',
    category: 'stem',
    englishLabel: 'Small / Little',
    gloss: 'SMALL',
    description: 'Dominant thumb and index finger pinch close together showing a tiny gap with squinted eyes.',
    aliases: ['LITTLE', 'TINY', 'MINIATURE'],
    keyframes: [
      {
        label: 'Measure Tiny Gap',
        rule: 'Thumb and index pinched closely apart in front of eye',
        targetTip: { x: 35, y: -35, z: 30 },
        targetKnuckle: { x: 60, y: -10, z: 18 },
        targetWrist: { x: 95, y: 35, z: 0 },
        shape: 'claw',
        nmf: { eyebrows: 'furrowed', mouth: 'small' },
      },
      {
        label: 'Pinch Narrower',
        rule: 'Fingers narrow gap closer showing minuscule dimension',
        targetTip: { x: 30, y: -30, z: 35 },
        targetKnuckle: { x: 55, y: -5, z: 22 },
        targetWrist: { x: 90, y: 40, z: 5 },
        shape: 'claw',
        nmf: { eyebrows: 'furrowed', mouth: 'tiny', headTilt: 'nod' },
      },
    ],
  },

  'ALL': {
    id: 'all',
    word: 'ALL',
    category: 'conversation',
    englishLabel: 'All / Everyone',
    gloss: 'ALL',
    description: 'Both open hands sweep from outward inward in a broad inclusive embrace gathering everything.',
    aliases: ['EVERYONE', 'EVERYBODY', 'WHOLE'],
    keyframes: [
      {
        label: 'Broad Perimeter',
        rule: 'Both open hands reach out wide encompassing entire perimeter',
        targetTip: { x: 60, y: -10, z: 30 },
        targetKnuckle: { x: 85, y: 15, z: 20 },
        targetWrist: { x: 115, y: 50, z: 5 },
        shape: 'flat',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'all' },
      },
      {
        label: 'Inclusive Circle Inward',
        rule: 'Hands sweep inward completing circle to join at center',
        targetTip: { x: -10, y: 10, z: 25 },
        targetKnuckle: { x: 25, y: 30, z: 15 },
        targetWrist: { x: 70, y: 65, z: 0 },
        shape: 'flat',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'all', headTilt: 'nod' },
      },
    ],
  },

  // =========================================================================
  // LEVEL 2/3 DIRECTIONAL & AGREEMENT VERBS (SPATIAL LOCI MODULATED)
  // =========================================================================
  'GIVE': {
    id: 'give',
    word: 'GIVE',
    category: 'grammar',
    englishLabel: 'Give / Provide',
    gloss: 'GIVE',
    description: 'Flat cupped hand sweeps forward from sender locus to recipient locus with slight wrist flick.',
    aliases: ['PROVIDE', 'GIVES', 'GAVE', 'GIVING'],
    isDirectional: true,
    directionalType: 'subject-to-object',
    defaultLoci: { from: 'ME', to: 'YOU' },
    keyframes: [
      {
        label: 'Source Origin',
        rule: 'Hand holds open palm up near body at origin locus',
        targetTip: { x: 20, y: 25, z: 20 },
        targetKnuckle: { x: 45, y: 45, z: 12 },
        targetWrist: { x: 80, y: 75, z: 0 },
        shape: 'flat',
        nmf: { eyebrows: 'neutral', mouth: 'give' },
      },
      {
        label: 'Deliver to Destination',
        rule: 'Hand sweeps outward and presents palm to destination locus',
        targetTip: { x: 10, y: -15, z: 60 },
        targetKnuckle: { x: 35, y: 10, z: 45 },
        targetWrist: { x: 75, y: 45, z: 30 },
        shape: 'flat',
        nmf: { eyebrows: 'neutral', mouth: 'give', headTilt: 'nod' },
      },
    ],
  },

  'TELL': {
    id: 'tell',
    word: 'TELL',
    category: 'grammar',
    englishLabel: 'Tell / Inform',
    gloss: 'TELL',
    description: 'Dominant index fingertip touches side of chin/lips and projects forward towards recipient.',
    aliases: ['INFORM', 'TELLS', 'TOLD', 'TELLING'],
    isDirectional: true,
    directionalType: 'subject-to-object',
    defaultLoci: { from: 'ME', to: 'YOU' },
    keyframes: [
      {
        label: 'Touch Lips',
        rule: 'Index finger touches side of chin below bottom lip',
        targetTip: { x: 12, y: -52, z: 24 },
        targetKnuckle: { x: 38, y: -25, z: 15 },
        targetWrist: { x: 75, y: 25, z: 0 },
        shape: 'point',
        nmf: { eyebrows: 'neutral', mouth: 'tell' },
      },
      {
        label: 'Project Forward to Addressee',
        rule: 'Index finger flicks forward from lips straight toward recipient locus',
        targetTip: { x: 8, y: -25, z: 58 },
        targetKnuckle: { x: 32, y: 0, z: 40 },
        targetWrist: { x: 70, y: 35, z: 25 },
        shape: 'point',
        nmf: { eyebrows: 'neutral', mouth: 'tell' },
      },
    ],
  },

  'ASK': {
    id: 'ask',
    word: 'ASK',
    category: 'grammar',
    englishLabel: 'Ask / Inquire',
    gloss: 'ASK',
    description: 'Hooked index finger points towards recipient locus with inquisitive slight forward head tilt.',
    aliases: ['INQUIRE', 'QUESTION', 'ASKS', 'ASKED', 'ASKING'],
    isDirectional: true,
    directionalType: 'subject-to-object',
    defaultLoci: { from: 'ME', to: 'YOU' },
    keyframes: [
      {
        label: 'Inquisitive Origin',
        rule: 'Hooked index points forward from chest',
        targetTip: { x: 15, y: 10, z: 30 },
        targetKnuckle: { x: 42, y: 32, z: 20 },
        targetWrist: { x: 80, y: 65, z: 5 },
        shape: 'point',
        nmf: { eyebrows: 'furrowed', mouth: 'ask' },
      },
      {
        label: 'Direct Query to Locus',
        rule: 'Index extends forward reaching toward destination locus',
        targetTip: { x: 5, y: -15, z: 62 },
        targetKnuckle: { x: 30, y: 8, z: 45 },
        targetWrist: { x: 72, y: 40, z: 28 },
        shape: 'point',
        nmf: { eyebrows: 'furrowed', mouth: 'ask', headTilt: 'nod' },
      },
    ],
  },

  'SHOW': {
    id: 'show',
    word: 'SHOW',
    category: 'grammar',
    englishLabel: 'Show / Demonstrate',
    gloss: 'SHOW',
    description: 'Non-dominant flat palm faces forward, dominant index presses palm pushing forward towards recipient.',
    aliases: ['DEMONSTRATE', 'DISPLAY', 'SHOWS', 'SHOWED', 'SHOWING'],
    isDirectional: true,
    directionalType: 'subject-to-object',
    defaultLoci: { from: 'ME', to: 'YOU' },
    keyframes: [
      {
        label: 'Index to Base Palm',
        rule: 'Dominant index presses into center of open non-dominant palm facing target',
        targetTip: { x: -35, y: 5, z: 25 },
        targetKnuckle: { x: 5, y: 20, z: 15 },
        targetWrist: { x: 55, y: 60, z: 0 },
        shape: 'point',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'show' },
      },
      {
        label: 'Push Outward Together',
        rule: 'Both hands push forward in unison presenting the evidence to destination locus',
        targetTip: { x: -20, y: -20, z: 55 },
        targetKnuckle: { x: 15, y: -2, z: 42 },
        targetWrist: { x: 60, y: 30, z: 25 },
        shape: 'point',
        baseHandMode: 'vowel-board',
        baseHandOverride: { shiftX: 15, shiftY: -20, shiftZ: 30 },
        nmf: { eyebrows: 'raised', mouth: 'show', headTilt: 'nod' },
      },
    ],
  },

  'EXPLAIN': {
    id: 'explain',
    word: 'EXPLAIN',
    category: 'grammar',
    englishLabel: 'Explain / Clarify',
    gloss: 'EXPLAIN',
    description: 'Both hands open and close alternating fingers pushing forward towards recipient.',
    aliases: ['CLARIFY', 'DESCRIBE', 'EXPLAINS', 'EXPLAINED', 'EXPLAINING'],
    isDirectional: true,
    keyframes: [
      {
        label: 'Alternating Right Forward',
        rule: 'Right hand pushes forward with fingers fluttering open',
        targetTip: { x: 25, y: -10, z: 45 },
        targetKnuckle: { x: 50, y: 15, z: 30 },
        targetWrist: { x: 85, y: 50, z: 15 },
        shape: 'spread',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'neutral', mouth: 'explain' },
      },
      {
        label: 'Alternating Left Forward',
        rule: 'Left hand pushes forward while right recedes',
        targetTip: { x: 10, y: 5, z: 30 },
        targetKnuckle: { x: 40, y: 25, z: 20 },
        targetWrist: { x: 75, y: 60, z: 5 },
        shape: 'claw',
        baseHandMode: 'mirror',
        baseHandOverride: { shiftX: 25, shiftY: -15, shiftZ: 20 },
        nmf: { eyebrows: 'neutral', mouth: 'explain' },
      },
    ],
  },


  // =========================================================================
  // LEVEL 2/3 TEMPORAL & TIMELINE SIGNS (CHRONOLOGICAL PRIMACY)
  // =========================================================================
  'YESTERDAY': {
    id: 'yesterday',
    word: 'YESTERDAY',
    category: 'temporal',
    englishLabel: 'Yesterday / Past Day',
    gloss: 'YESTERDAY',
    description: 'Thumb of dominant fist points backwards over shoulder into the past timeline.',
    aliases: ['PAST-DAY'],
    keyframes: [
      {
        label: 'Thumb at Cheek',
        rule: 'Fist with extended thumb begins beside cheek',
        targetTip: { x: 45, y: -45, z: 22 },
        targetKnuckle: { x: 65, y: -20, z: 12 },
        targetWrist: { x: 95, y: 20, z: -5 },
        shape: 'fist',
        nmf: { eyebrows: 'neutral', mouth: 'yesterday' },
      },
      {
        label: 'Thumb Points Over Shoulder',
        rule: 'Thumb flicks backward past shoulder into past timeline',
        targetTip: { x: 60, y: -60, z: -10 },
        targetKnuckle: { x: 80, y: -30, z: -15 },
        targetWrist: { x: 105, y: 10, z: -25 },
        shape: 'fist',
        nmf: { eyebrows: 'neutral', mouth: 'yesterday', headTilt: 'tilt-right' },
      },
    ],
  },

  'TODAY': {
    id: 'today',
    word: 'TODAY',
    category: 'temporal',
    englishLabel: 'Today / Present Day',
    gloss: 'TODAY',
    description: 'Both open hands palm up drop firmly twice in front of waist indicating this day.',
    aliases: ['THIS-DAY', 'CURRENT-DAY'],
    keyframes: [
      {
        label: 'Hands Raised',
        rule: 'Both open flat hands palm up held at waist level',
        targetTip: { x: 35, y: 15, z: 25 },
        targetKnuckle: { x: 60, y: 35, z: 15 },
        targetWrist: { x: 95, y: 65, z: 0 },
        shape: 'flat',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'neutral', mouth: 'today' },
      },
      {
        label: 'Firm Downward Pulse',
        rule: 'Both hands drop firmly downward asserting the present moment',
        targetTip: { x: 35, y: 40, z: 25 },
        targetKnuckle: { x: 60, y: 55, z: 15 },
        targetWrist: { x: 95, y: 85, z: 0 },
        shape: 'flat',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'neutral', mouth: 'today', headTilt: 'nod' },
      },
    ],
  },

  'TOMORROW': {
    id: 'tomorrow',
    word: 'TOMORROW',
    category: 'temporal',
    englishLabel: 'Tomorrow / Next Day',
    gloss: 'TOMORROW',
    description: 'Thumb of dominant fist flicks forward from cheek into the future timeline.',
    aliases: ['NEXT-DAY'],
    keyframes: [
      {
        label: 'Thumb at Jawline',
        rule: 'Thumb tip touches side of jaw near ear',
        targetTip: { x: 42, y: -40, z: 18 },
        targetKnuckle: { x: 65, y: -18, z: 10 },
        targetWrist: { x: 95, y: 25, z: -5 },
        shape: 'fist',
        nmf: { eyebrows: 'neutral', mouth: 'tomorrow' },
      },
      {
        label: 'Forward Arc into Future',
        rule: 'Thumb arches forward away from jawline into upcoming future space',
        targetTip: { x: 30, y: -30, z: 52 },
        targetKnuckle: { x: 55, y: -5, z: 35 },
        targetWrist: { x: 90, y: 30, z: 18 },
        shape: 'fist',
        nmf: { eyebrows: 'neutral', mouth: 'tomorrow' },
      },
    ],
  },

  'NOW': {
    id: 'now',
    word: 'NOW',
    category: 'temporal',
    englishLabel: 'Now / Immediately',
    gloss: 'NOW',
    description: 'Both hands bend downward firmly in front of body at present waist level.',
    aliases: ['CURRENTLY', 'PRESENT', 'IMMEDIATELY'],
    keyframes: [
      {
        label: 'Wrists Poised',
        rule: 'Both flat hands point slightly upward at lower chest',
        targetTip: { x: 30, y: 10, z: 25 },
        targetKnuckle: { x: 55, y: 30, z: 15 },
        targetWrist: { x: 90, y: 60, z: 0 },
        shape: 'flat',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'now' },
      },
      {
        label: 'Crisp Downward Drop',
        rule: 'Both hands drop crisply downward snapping into present plane',
        targetTip: { x: 30, y: 35, z: 25 },
        targetKnuckle: { x: 55, y: 50, z: 15 },
        targetWrist: { x: 90, y: 80, z: 0 },
        shape: 'flat',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'now', headTilt: 'nod' },
      },
    ],
  },

  'FUTURE': {
    id: 'future',
    word: 'FUTURE',
    category: 'temporal',
    englishLabel: 'Future / Ahead',
    gloss: 'FUTURE',
    description: 'Flat open hand sweeps forward from side of temple into distant space.',
    aliases: ['AHEAD', 'LATER', 'UPCOMING', 'SOON'],
    keyframes: [
      {
        label: 'Temple Origin',
        rule: 'Flat open hand held vertical beside eye/temple',
        targetTip: { x: 35, y: -55, z: 22 },
        targetKnuckle: { x: 58, y: -25, z: 12 },
        targetWrist: { x: 90, y: 15, z: 0 },
        shape: 'flat',
        nmf: { eyebrows: 'raised', mouth: 'future' },
      },
      {
        label: 'Long Forward Sweep',
        rule: 'Flat hand sweeps far forward slicing through upcoming future timeline',
        targetTip: { x: 20, y: -35, z: 70 },
        targetKnuckle: { x: 45, y: -5, z: 50 },
        targetWrist: { x: 80, y: 25, z: 30 },
        shape: 'flat',
        nmf: { eyebrows: 'raised', mouth: 'future' },
      },
    ],
  },

  'PAST': {
    id: 'past',
    word: 'PAST',
    category: 'temporal',
    englishLabel: 'Past / Ago',
    gloss: 'PAST',
    description: 'Flat hand waves backward over dominant shoulder into history.',
    aliases: ['AGO', 'BEFORE', 'PREVIOUSLY', 'HISTORY'],
    keyframes: [
      {
        label: 'At Shoulder',
        rule: 'Flat hand vertical in front of dominant shoulder',
        targetTip: { x: 40, y: -30, z: 20 },
        targetKnuckle: { x: 62, y: -5, z: 10 },
        targetWrist: { x: 90, y: 35, z: 0 },
        shape: 'flat',
        nmf: { eyebrows: 'neutral', mouth: 'past' },
      },
      {
        label: 'Wave Backward Over Shoulder',
        rule: 'Hand sweeps backward past shoulder into past timeline',
        targetTip: { x: 55, y: -50, z: -15 },
        targetKnuckle: { x: 75, y: -20, z: -20 },
        targetWrist: { x: 100, y: 15, z: -30 },
        shape: 'flat',
        nmf: { eyebrows: 'neutral', mouth: 'past', headTilt: 'tilt-right' },
      },
    ],
  },

  'MORNING': {
    id: 'morning',
    word: 'MORNING',
    category: 'temporal',
    englishLabel: 'Morning / Dawn',
    gloss: 'MORNING',
    description: 'Dominant hand rises like the dawn sun rising above horizontal non-dominant arm.',
    aliases: ['DAWN', 'AM'],
    keyframes: [
      {
        label: 'Below Horizon',
        rule: 'Cupped hand rests beneath non-dominant forearm',
        targetTip: { x: -10, y: 35, z: 20 },
        targetKnuckle: { x: 20, y: 55, z: 12 },
        targetWrist: { x: 60, y: 85, z: 0 },
        shape: 'flat',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'morning' },
      },
      {
        label: 'Sun Rises Above Horizon',
        rule: 'Hand rises upward above forearm spreading light',
        targetTip: { x: 0, y: -20, z: 32 },
        targetKnuckle: { x: 25, y: 10, z: 20 },
        targetWrist: { x: 65, y: 50, z: 5 },
        shape: 'spread',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'raised', mouth: 'morning', headTilt: 'nod' },
      },
    ],
  },

  'AFTERNOON': {
    id: 'afternoon',
    word: 'AFTERNOON',
    category: 'temporal',
    englishLabel: 'Afternoon / PM',
    gloss: 'AFTERNOON',
    description: 'Dominant flat hand rests on non-dominant arm and tilts gently downward.',
    aliases: ['PM', 'MIDDAY'],
    keyframes: [
      {
        label: 'Arm Rest High',
        rule: 'Dominant elbow rests on non-dominant fingertips pointing slightly up',
        targetTip: { x: 15, y: -30, z: 30 },
        targetKnuckle: { x: 40, y: 0, z: 20 },
        targetWrist: { x: 75, y: 40, z: 5 },
        shape: 'flat',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'afternoon' },
      },
      {
        label: 'Tilt Downward',
        rule: 'Hand tilts gently downward as afternoon progresses',
        targetTip: { x: 25, y: 5, z: 30 },
        targetKnuckle: { x: 45, y: 25, z: 18 },
        targetWrist: { x: 75, y: 55, z: 5 },
        shape: 'flat',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'afternoon' },
      },
    ],
  },

  // =========================================================================
  // LEVEL 2/3 COGNITION, REASONING & DISCOURSE SIGNS
  // =========================================================================
  'UNDERSTAND': {
    id: 'understand',
    word: 'UNDERSTAND',
    category: 'grammar',
    englishLabel: 'Understand / Comprehend',
    gloss: 'UNDERSTAND',
    description: 'Index finger flicks upward next to temple like an enlightened spark of comprehension.',
    aliases: ['COMPREHEND', 'GET-IT', 'UNDERSTOOD'],
    keyframes: [
      {
        label: 'Fist at Temple',
        rule: 'Fist held beside temple with index curled',
        targetTip: { x: 32, y: -48, z: 18 },
        targetKnuckle: { x: 55, y: -25, z: 10 },
        targetWrist: { x: 85, y: 18, z: 0 },
        shape: 'fist',
        nmf: { eyebrows: 'raised', mouth: 'understand' },
      },
      {
        label: 'Index Sparks Upward',
        rule: 'Index finger springs upright in comprehension',
        targetTip: { x: 32, y: -72, z: 25 },
        targetKnuckle: { x: 55, y: -40, z: 15 },
        targetWrist: { x: 85, y: 5, z: 0 },
        shape: 'point',
        nmf: { eyebrows: 'raised', mouth: 'understand', headTilt: 'nod' },
      },
    ],
  },

  'AGREE': {
    id: 'agree',
    word: 'AGREE',
    category: 'grammar',
    englishLabel: 'Agree / Concur',
    gloss: 'AGREE',
    description: 'Index points to head, then dominant flat hand drops firmly onto non-dominant palm.',
    aliases: ['CONCUR', 'CONSENT', 'AGREES', 'AGREED'],
    keyframes: [
      {
        label: 'Point to Head',
        rule: 'Dominant index touches temple (same thought)',
        targetTip: { x: 30, y: -52, z: 20 },
        targetKnuckle: { x: 55, y: -25, z: 10 },
        targetWrist: { x: 85, y: 18, z: 0 },
        shape: 'point',
        nmf: { eyebrows: 'raised', mouth: 'agree' },
      },
      {
        label: 'Hands Unite in Agreement',
        rule: 'Dominant flat hand drops firmly into non-dominant open palm',
        targetTip: { x: -30, y: 15, z: 22 },
        targetKnuckle: { x: 5, y: 32, z: 12 },
        targetWrist: { x: 55, y: 68, z: 0 },
        shape: 'flat',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'raised', mouth: 'agree', headTilt: 'nod' },
      },
    ],
  },

  'DISAGREE': {
    id: 'disagree',
    word: 'DISAGREE',
    category: 'grammar',
    englishLabel: 'Disagree / Differ',
    gloss: 'DISAGREE',
    description: 'Index points to head then index fingers cross with a firm head shake.',
    aliases: ['DIFFER', 'DISAGREES', 'DISAGREED'],
    keyframes: [
      {
        label: 'Point to Head',
        rule: 'Index points to temple',
        targetTip: { x: 30, y: -52, z: 20 },
        targetKnuckle: { x: 55, y: -25, z: 10 },
        targetWrist: { x: 85, y: 18, z: 0 },
        shape: 'point',
        nmf: { eyebrows: 'furrowed', mouth: 'differ' },
      },
      {
        label: 'Cross Fingers No',
        rule: 'Both index fingers cross in negation with head shake',
        targetTip: { x: 0, y: 5, z: 28 },
        targetKnuckle: { x: 30, y: 25, z: 18 },
        targetWrist: { x: 70, y: 60, z: 5 },
        shape: 'point',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'furrowed', mouth: 'no', headTilt: 'shake' },
      },
    ],
  },

  'REMEMBER': {
    id: 'remember',
    word: 'REMEMBER',
    category: 'grammar',
    englishLabel: 'Remember / Recall',
    gloss: 'REMEMBER',
    description: 'Dominant thumb touches forehead then drops to join non-dominant thumb in memory locked.',
    aliases: ['RECALL', 'MEMORIZE', 'REMEMBERS'],
    keyframes: [
      {
        label: 'Touch Forehead',
        rule: 'Thumb of dominant fist touches side of forehead',
        targetTip: { x: 25, y: -55, z: 22 },
        targetKnuckle: { x: 50, y: -28, z: 12 },
        targetWrist: { x: 80, y: 15, z: 0 },
        shape: 'fist',
        nmf: { eyebrows: 'raised', mouth: 'remember' },
      },
      {
        label: 'Lock Thumbs Together',
        rule: 'Dominant thumb drops and locks onto non-dominant thumb',
        targetTip: { x: -15, y: 10, z: 25 },
        targetKnuckle: { x: 15, y: 30, z: 15 },
        targetWrist: { x: 60, y: 65, z: 0 },
        shape: 'fist',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'remember', headTilt: 'nod' },
      },
    ],
  },

  'FORGET': {
    id: 'forget',
    word: 'FORGET',
    category: 'grammar',
    englishLabel: 'Forget / Blank',
    gloss: 'FORGET',
    description: 'Flat open hand wipes across forehead as if clearing thoughts from mind.',
    aliases: ['FORGOT', 'FORGOTTEN'],
    keyframes: [
      {
        label: 'Hand at Temple',
        rule: 'Open flat hand rests across temple and forehead',
        targetTip: { x: 0, y: -60, z: 25 },
        targetKnuckle: { x: 35, y: -35, z: 15 },
        targetWrist: { x: 75, y: 5, z: 0 },
        shape: 'flat',
        nmf: { eyebrows: 'furrowed', mouth: 'forget' },
      },
      {
        label: 'Wipe Across',
        rule: 'Hand sweeps laterally across forehead into space',
        targetTip: { x: 45, y: -60, z: 25 },
        targetKnuckle: { x: 75, y: -35, z: 15 },
        targetWrist: { x: 105, y: 5, z: 0 },
        shape: 'flat',
        nmf: { eyebrows: 'furrowed', mouth: 'blank', headTilt: 'shake' },
      },
    ],
  },

  'THINK': {
    id: 'think',
    word: 'THINK',
    category: 'grammar',
    englishLabel: 'Think / Ponder',
    gloss: 'THINK',
    description: 'Dominant index finger taps or gently circles temple in reflection.',
    aliases: ['PONDER', 'CONSIDER', 'THINKS', 'THOUGHT'],
    keyframes: [
      {
        label: 'Index at Temple',
        rule: 'Index finger touches side of temple',
        targetTip: { x: 28, y: -52, z: 22 },
        targetKnuckle: { x: 55, y: -25, z: 12 },
        targetWrist: { x: 85, y: 18, z: 0 },
        shape: 'point',
        nmf: { eyebrows: 'raised', mouth: 'think' },
      },
      {
        label: 'Reflective Tap',
        rule: 'Index finger taps temple in contemplation',
        targetTip: { x: 28, y: -50, z: 20 },
        targetKnuckle: { x: 55, y: -23, z: 10 },
        targetWrist: { x: 85, y: 20, z: 0 },
        shape: 'point',
        nmf: { eyebrows: 'raised', mouth: 'think' },
      },
    ],
  },

  'KNOW': {
    id: 'know',
    word: 'KNOW',
    category: 'grammar',
    englishLabel: 'Know / Aware',
    gloss: 'KNOW',
    description: 'Fingertips of dominant flat hand touch side of forehead twice.',
    aliases: ['AWARE', 'KNOWS', 'KNEW', 'KNOWN'],
    keyframes: [
      {
        label: 'Touch Forehead',
        rule: 'Fingertips of bent flat hand tap side of forehead',
        targetTip: { x: 25, y: -55, z: 22 },
        targetKnuckle: { x: 52, y: -30, z: 12 },
        targetWrist: { x: 82, y: 15, z: 0 },
        shape: 'flat',
        nmf: { eyebrows: 'raised', mouth: 'know' },
      },
      {
        label: 'Second Tap',
        rule: 'Fingertips confirm contact on forehead with head nod',
        targetTip: { x: 25, y: -53, z: 20 },
        targetKnuckle: { x: 52, y: -28, z: 10 },
        targetWrist: { x: 82, y: 17, z: 0 },
        shape: 'flat',
        nmf: { eyebrows: 'raised', mouth: 'know', headTilt: 'nod' },
      },
    ],
  },

  'WANT': {
    id: 'want',
    word: 'WANT',
    category: 'grammar',
    englishLabel: 'Want / Desire',
    gloss: 'WANT',
    description: 'Both clawed hands palm up pull smoothly inwards toward the chest.',
    aliases: ['DESIRE', 'WANTS', 'WANTED'],
    keyframes: [
      {
        label: 'Reach Outward',
        rule: 'Both hands open clawed palms up reaching forward',
        targetTip: { x: 25, y: 0, z: 45 },
        targetKnuckle: { x: 50, y: 25, z: 30 },
        targetWrist: { x: 85, y: 60, z: 15 },
        shape: 'claw',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'want' },
      },
      {
        label: 'Pull Inward',
        rule: 'Both clawed hands pull inward towards body',
        targetTip: { x: 20, y: 20, z: 25 },
        targetKnuckle: { x: 45, y: 40, z: 15 },
        targetWrist: { x: 80, y: 70, z: 0 },
        shape: 'claw',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'neutral', mouth: 'want', headTilt: 'nod' },
      },
    ],
  },

  'NEED': {
    id: 'need',
    word: 'NEED',
    category: 'grammar',
    englishLabel: 'Need / Require',
    gloss: 'NEED',
    description: 'Bent index finger nods firmly downward in front of body in requirement.',
    aliases: ['REQUIRE', 'MUST-HAVE', 'NEEDS', 'NEEDED'],
    keyframes: [
      {
        label: 'Hook Up',
        rule: 'Bent hooked index finger held at mid chest',
        targetTip: { x: 20, y: 5, z: 30 },
        targetKnuckle: { x: 45, y: 25, z: 20 },
        targetWrist: { x: 80, y: 60, z: 5 },
        shape: 'point',
        nmf: { eyebrows: 'furrowed', mouth: 'need' },
      },
      {
        label: 'Firm Downward Bend',
        rule: 'Hooked index nods firmly downward expressing imperative necessity',
        targetTip: { x: 20, y: 28, z: 30 },
        targetKnuckle: { x: 45, y: 45, z: 20 },
        targetWrist: { x: 80, y: 75, z: 5 },
        shape: 'point',
        nmf: { eyebrows: 'furrowed', mouth: 'need', headTilt: 'nod' },
      },
    ],
  },

  'CAN': {
    id: 'can',
    word: 'CAN',
    category: 'grammar',
    englishLabel: 'Can / Able',
    gloss: 'CAN',
    description: 'Both fists nod downward firmly in affirmative capability.',
    aliases: ['ABLE', 'COULD', 'POSSIBLE'],
    keyframes: [
      {
        label: 'Fists Poised',
        rule: 'Both fists held in front of body at waist level',
        targetTip: { x: 25, y: 15, z: 25 },
        targetKnuckle: { x: 50, y: 35, z: 15 },
        targetWrist: { x: 85, y: 65, z: 0 },
        shape: 'fist',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'can' },
      },
      {
        label: 'Affirmative Nod Down',
        rule: 'Both fists drop firmly downward confirming ability',
        targetTip: { x: 25, y: 38, z: 25 },
        targetKnuckle: { x: 50, y: 55, z: 15 },
        targetWrist: { x: 85, y: 85, z: 0 },
        shape: 'fist',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'can', headTilt: 'nod' },
      },
    ],
  },

  'CANNOT': {
    id: 'cannot',
    word: 'CANNOT',
    category: 'grammar',
    englishLabel: 'Cannot / Unable',
    gloss: 'CANNOT',
    description: 'Dominant index crosses and strikes down off non-dominant index with head shake.',
    aliases: ["CAN'T", 'UNABLE', 'IMPOSSIBLE'],
    keyframes: [
      {
        label: 'Index Raised Above Non-Dominant',
        rule: 'Dominant index raised above non-dominant extended index finger',
        targetTip: { x: -25, y: -5, z: 25 },
        targetKnuckle: { x: 5, y: 15, z: 15 },
        targetWrist: { x: 50, y: 55, z: 0 },
        shape: 'point',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'furrowed', mouth: 'cant' },
      },
      {
        label: 'Strike Down and Past',
        rule: 'Dominant index strikes past non-dominant index with emphatic head shake',
        targetTip: { x: -25, y: 30, z: 25 },
        targetKnuckle: { x: 5, y: 45, z: 15 },
        targetWrist: { x: 50, y: 80, z: 0 },
        shape: 'point',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'furrowed', mouth: 'no', headTilt: 'shake' },
      },
    ],
  },

  'MUST': {
    id: 'must',
    word: 'MUST',
    category: 'grammar',
    englishLabel: 'Must / Obligation',
    gloss: 'MUST',
    description: 'Index finger points down firmly with strong downward thrust.',
    aliases: ['HAVE-TO', 'OBLIGATED'],
    keyframes: [
      {
        label: 'Point Raised',
        rule: 'Index finger points forward at chest level',
        targetTip: { x: 20, y: -10, z: 30 },
        targetKnuckle: { x: 45, y: 15, z: 20 },
        targetWrist: { x: 80, y: 55, z: 5 },
        shape: 'point',
        nmf: { eyebrows: 'furrowed', mouth: 'must' },
      },
      {
        label: 'Forceful Downward Thrust',
        rule: 'Index thrusts firmly downward in absolute mandate',
        targetTip: { x: 20, y: 35, z: 30 },
        targetKnuckle: { x: 45, y: 55, z: 20 },
        targetWrist: { x: 80, y: 85, z: 5 },
        shape: 'point',
        nmf: { eyebrows: 'furrowed', mouth: 'must', headTilt: 'nod' },
      },
    ],
  },

  'BECAUSE': {
    id: 'because',
    word: 'BECAUSE',
    category: 'grammar',
    englishLabel: 'Because / Reason',
    gloss: 'BECAUSE',
    description: 'Index finger taps side of forehead then drops into open flat hand.',
    aliases: ['REASON', 'WHY-BECAUSE'],
    keyframes: [
      {
        label: 'Tap Forehead',
        rule: 'Dominant index taps side of forehead',
        targetTip: { x: 28, y: -52, z: 22 },
        targetKnuckle: { x: 55, y: -25, z: 12 },
        targetWrist: { x: 85, y: 18, z: 0 },
        shape: 'point',
        nmf: { eyebrows: 'raised', mouth: 'because' },
      },
      {
        label: 'Present Reason',
        rule: 'Hand opens into flat palm up explaining the cause',
        targetTip: { x: 25, y: 10, z: 35 },
        targetKnuckle: { x: 50, y: 35, z: 25 },
        targetWrist: { x: 85, y: 65, z: 10 },
        shape: 'flat',
        nmf: { eyebrows: 'neutral', mouth: 'reason' },
      },
    ],
  },

  'IF': {
    id: 'if',
    word: 'IF',
    category: 'grammar',
    englishLabel: 'If / Conditional',
    gloss: 'IF',
    description: 'Dominant little finger taps cheek twice in classical BSL conditional marker.',
    aliases: ['SUPPOSE', 'WHETHER'],
    keyframes: [
      {
        label: 'Pinky at Cheek',
        rule: 'Pinky finger touches upper cheekbone',
        targetTip: { x: 30, y: -45, z: 20 },
        targetKnuckle: { x: 55, y: -20, z: 10 },
        targetWrist: { x: 85, y: 22, z: -5 },
        shape: 'point',
        nmf: { eyebrows: 'raised', mouth: 'if' },
      },
      {
        label: 'Pinky Tap',
        rule: 'Pinky taps cheek twice with raised eyebrows indicating conditional clause',
        targetTip: { x: 30, y: -43, z: 18 },
        targetKnuckle: { x: 55, y: -18, z: 8 },
        targetWrist: { x: 85, y: 24, z: -5 },
        shape: 'point',
        nmf: { eyebrows: 'raised', mouth: 'if' },
      },
    ],
  },

  // =========================================================================
  // LEVEL 2/3 PRONOUNS & ENTITY REFERENCES
  // =========================================================================
  'ME': {
    id: 'me',
    word: 'ME',
    category: 'grammar',
    englishLabel: 'Me / I',
    gloss: 'ME',
    description: 'Dominant index points directly to the center of own chest.',
    aliases: ['I', 'MYSELF'],
    keyframes: [
      {
        label: 'Approach Chest',
        rule: 'Dominant index points towards heart',
        targetTip: { x: 10, y: 0, z: 15 },
        targetKnuckle: { x: 40, y: 20, z: 10 },
        targetWrist: { x: 75, y: 55, z: 0 },
        shape: 'point',
        nmf: { eyebrows: 'neutral', mouth: 'me' },
      },
      {
        label: 'Touch Center Chest',
        rule: 'Index touches center of own chest establishing 1st person locus',
        targetTip: { x: 0, y: 10, z: 8 },
        targetKnuckle: { x: 30, y: 25, z: 5 },
        targetWrist: { x: 70, y: 60, z: -5 },
        shape: 'point',
        nmf: { eyebrows: 'neutral', mouth: 'me' },
      },
    ],
  },

  'YOU': {
    id: 'you',
    word: 'YOU',
    category: 'grammar',
    englishLabel: 'You / Addressee',
    gloss: 'YOU',
    description: 'Dominant index points directly forward to the addressee (2nd person locus).',
    aliases: ['YOURSELF'],
    keyframes: [
      {
        label: 'Raise Point',
        rule: 'Dominant index points forward at upper chest level',
        targetTip: { x: 10, y: -10, z: 35 },
        targetKnuckle: { x: 35, y: 15, z: 25 },
        targetWrist: { x: 75, y: 50, z: 10 },
        shape: 'point',
        nmf: { eyebrows: 'neutral', mouth: 'you' },
      },
      {
        label: 'Direct Point to Addressee',
        rule: 'Index finger extends forward directly toward 2nd person locus',
        targetTip: { x: 0, y: -20, z: 65 },
        targetKnuckle: { x: 25, y: 0, z: 45 },
        targetWrist: { x: 65, y: 35, z: 25 },
        shape: 'point',
        nmf: { eyebrows: 'neutral', mouth: 'you' },
      },
    ],
  },

  'THEY': {
    id: 'they',
    word: 'THEY',
    category: 'grammar',
    englishLabel: 'They / Them',
    gloss: 'THEY',
    description: 'Dominant index sweeps horizontally across 3rd person space.',
    aliases: ['THEM', 'THOSE-PEOPLE'],
    keyframes: [
      {
        label: 'Start Sweep Left',
        rule: 'Index points towards Locus A on left',
        targetTip: { x: -45, y: -5, z: 35 },
        targetKnuckle: { x: -15, y: 15, z: 25 },
        targetWrist: { x: 35, y: 55, z: 10 },
        shape: 'point',
        nmf: { eyebrows: 'neutral', mouth: 'they' },
      },
      {
        label: 'Sweep to Locus B Right',
        rule: 'Index sweeps across to Locus B on right encompassing the group',
        targetTip: { x: 45, y: -5, z: 35 },
        targetKnuckle: { x: 70, y: 15, z: 25 },
        targetWrist: { x: 105, y: 55, z: 10 },
        shape: 'point',
        nmf: { eyebrows: 'neutral', mouth: 'they' },
      },
    ],
  },

  'PUPIL': {
    id: 'pupil',
    word: 'PUPIL',
    category: 'school',
    englishLabel: 'Pupil / Student',
    gloss: 'PUPIL',
    description: 'Sign for LEARN (taps forehead from palm) followed by person drop.',
    aliases: ['STUDENT', 'LEARNER', 'SCHOLAR'],
    keyframes: [
      {
        label: 'Gather from Palm',
        rule: 'Dominant fingertips touch non-dominant open palm (gathering knowledge)',
        targetTip: { x: -40, y: 20, z: 15 },
        targetKnuckle: { x: 0, y: 35, z: 10 },
        targetWrist: { x: 50, y: 70, z: 0 },
        shape: 'claw',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'student' },
      },
      {
        label: 'Knowledge to Forehead',
        rule: 'Hand rises and touches forehead (internalizing learning)',
        targetTip: { x: 22, y: -52, z: 22 },
        targetKnuckle: { x: 48, y: -25, z: 12 },
        targetWrist: { x: 80, y: 18, z: 0 },
        shape: 'flat',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'raised', mouth: 'pupil', headTilt: 'nod' },
      },
    ],
  },

  'FAMILY': {
    id: 'family',
    word: 'FAMILY',
    category: 'conversation',
    englishLabel: 'Family / Relatives',
    gloss: 'FAMILY',
    description: 'Both curved hands draw an inclusive horizontal circle and join pinkies together.',
    aliases: ['HOUSEHOLD', 'RELATIVES'],
    keyframes: [
      {
        label: 'Hands Apart',
        rule: 'Both curved hands in front of chest facing each other',
        targetTip: { x: 30, y: 5, z: 30 },
        targetKnuckle: { x: 55, y: 25, z: 20 },
        targetWrist: { x: 90, y: 60, z: 5 },
        shape: 'claw',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'family' },
      },
      {
        label: 'Circle Together',
        rule: 'Both hands sweep in a circle and unite together in loving unity',
        targetTip: { x: 0, y: 15, z: 25 },
        targetKnuckle: { x: 30, y: 35, z: 15 },
        targetWrist: { x: 70, y: 70, z: 0 },
        shape: 'claw',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'family', headTilt: 'nod' },
      },
    ],
  },

  // =========================================================================
  // MAKATON CORE VOCABULARY (STAGES 1-4 ESSENTIALS)
  // Key word signing repertoire for Special Educational Needs (SEN) and early language
  // =========================================================================
  'EAT': {
    id: 'eat',
    word: 'EAT',
    category: 'conversation',
    englishLabel: 'Eat / Food',
    gloss: 'EAT',
    makatonStage: 1,
    description: 'Dominant hand brings pinched fingertips to mouth twice in authentic UK Makaton eating gesture.',
    aliases: ['FOOD', 'EATING', 'EATS', 'MEAL', 'DINNER', 'LUNCH', 'BREAKFAST'],
    keyframes: [
      {
        label: 'Hand to Mouth',
        rule: 'Fingertips brought close to lips',
        targetTip: { x: 5, y: -45, z: 22 },
        targetKnuckle: { x: 25, y: -20, z: 12 },
        targetWrist: { x: 60, y: 15, z: 0 },
        shape: 'fist',
        palm: 'in',
        nmf: { eyebrows: 'neutral', mouth: 'eat' },
        hold: 120,
      },
      {
        label: 'Double Tap Food',
        rule: 'Second tap at lips confirming nourishment request',
        targetTip: { x: 0, y: -46, z: 24 },
        targetKnuckle: { x: 20, y: -22, z: 14 },
        targetWrist: { x: 55, y: 10, z: 0 },
        shape: 'fist',
        palm: 'in',
        nmf: { eyebrows: 'neutral', mouth: 'eat', headTilt: 'nod' },
        hold: 150,
      },
    ],
  },

  'DRINK': {
    id: 'drink',
    word: 'DRINK',
    category: 'conversation',
    englishLabel: 'Drink / Cup',
    gloss: 'DRINK',
    makatonStage: 1,
    description: 'Dominant C-shape hand tilts upward towards mouth as if holding and sipping from a cup.',
    aliases: ['DRINKING', 'DRINKS', 'BEVERAGE', 'CUP', 'THIRSTY'],
    keyframes: [
      {
        label: 'Hold Cup',
        rule: 'C-handshape holding cup at chin level',
        targetTip: { x: 10, y: -38, z: 20 },
        targetKnuckle: { x: 30, y: -15, z: 12 },
        targetWrist: { x: 65, y: 20, z: 0 },
        shape: 'c-shape',
        palm: 'side',
        nmf: { eyebrows: 'neutral', mouth: 'drink' },
        hold: 100,
      },
      {
        label: 'Tilt and Sip',
        rule: 'Tilt hand towards lips as drinking',
        targetTip: { x: 5, y: -44, z: 24 },
        targetKnuckle: { x: 22, y: -22, z: 16 },
        targetWrist: { x: 50, y: 10, z: 2 },
        shape: 'c-shape',
        palm: 'in',
        nmf: { eyebrows: 'neutral', mouth: 'drink', headTilt: 'nod' },
        hold: 150,
      },
    ],
  },

  'TOILET': {
    id: 'toilet',
    word: 'TOILET',
    category: 'school',
    englishLabel: 'Toilet / Bathroom',
    gloss: 'TOILET',
    makatonStage: 1,
    description: 'Dominant middle finger taps the opposite shoulder twice in standard UK Makaton/BSL.',
    aliases: ['BATHROOM', 'RESTROOM', 'WASHROOM', 'LOO'],
    keyframes: [
      {
        label: 'Touch Shoulder',
        rule: 'Middle finger reaches across chest to touch opposite shoulder',
        targetTip: { x: -35, y: -18, z: 15 },
        targetKnuckle: { x: -5, y: 5, z: 10 },
        targetWrist: { x: 35, y: 45, z: 0 },
        shape: 'point',
        palm: 'in',
        nmf: { eyebrows: 'neutral', mouth: 'toilet' },
        hold: 120,
      },
      {
        label: 'Double Tap Shoulder',
        rule: 'Tap shoulder second time clearly',
        targetTip: { x: -38, y: -18, z: 12 },
        targetKnuckle: { x: -8, y: 5, z: 8 },
        targetWrist: { x: 32, y: 45, z: -2 },
        shape: 'point',
        palm: 'in',
        nmf: { eyebrows: 'neutral', mouth: 'toilet' },
        hold: 150,
      },
    ],
  },

  'BED': {
    id: 'bed',
    word: 'BED',
    category: 'conversation',
    englishLabel: 'Bed / Sleep',
    gloss: 'BED',
    makatonStage: 1,
    description: 'Both flat palms together placed against the side of the tilted face/cheek like a resting pillow.',
    aliases: ['SLEEP', 'SLEEPING', 'BEDTIME', 'REST', 'ASLEEP'],
    keyframes: [
      {
        label: 'Hands to Cheek',
        rule: 'Flat hands together brought up to cheek',
        targetTip: { x: 35, y: -45, z: 20 },
        targetKnuckle: { x: 55, y: -20, z: 12 },
        targetWrist: { x: 80, y: 15, z: 0 },
        shape: 'flat',
        palm: 'side',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'neutral', mouth: 'bed', headTilt: 'tilt-right' },
        hold: 150,
      },
      {
        label: 'Pillow Rest',
        rule: 'Head tilts gently resting on hands',
        targetTip: { x: 38, y: -42, z: 22 },
        targetKnuckle: { x: 58, y: -18, z: 14 },
        targetWrist: { x: 82, y: 18, z: 2 },
        shape: 'flat',
        palm: 'side',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'neutral', mouth: 'sleep', headTilt: 'tilt-right' },
        hold: 200,
      },
    ],
  },

  'MUM': {
    id: 'mum',
    word: 'MUM',
    category: 'conversation',
    englishLabel: 'Mum / Mother',
    gloss: 'MUM',
    makatonStage: 2,
    description: 'Dominant index finger taps the right corner of the mouth/chin twice rhythmically.',
    aliases: ['MOTHER', 'MOM', 'MAMMY', 'MUMMY'],
    keyframes: [
      {
        label: 'Tap Corner of Mouth',
        rule: 'Index finger touches corner of mouth',
        targetTip: { x: 18, y: -42, z: 22 },
        targetKnuckle: { x: 38, y: -18, z: 12 },
        targetWrist: { x: 70, y: 20, z: 0 },
        shape: 'point',
        palm: 'in',
        nmf: { eyebrows: 'neutral', mouth: 'Mum' },
        hold: 120,
      },
      {
        label: 'Second M Tap',
        rule: 'Repeat tap for the double M syllable',
        targetTip: { x: 20, y: -40, z: 22 },
        targetKnuckle: { x: 40, y: -16, z: 12 },
        targetWrist: { x: 72, y: 22, z: 0 },
        shape: 'point',
        palm: 'in',
        nmf: { eyebrows: 'neutral', mouth: 'Mother', headTilt: 'nod' },
        hold: 150,
      },
    ],
  },

  'DAD': {
    id: 'dad',
    word: 'DAD',
    category: 'conversation',
    englishLabel: 'Dad / Father',
    gloss: 'DAD',
    makatonStage: 2,
    description: 'Dominant index and middle fingers tap the non-dominant index and middle fingers twice.',
    aliases: ['FATHER', 'DADDY', 'PAPA'],
    keyframes: [
      {
        label: 'Two-Finger Tap',
        rule: 'Dominant index and middle tap non-dominant two fingers',
        targetTip: { x: -5, y: 10, z: 25 },
        targetKnuckle: { x: 25, y: 30, z: 15 },
        targetWrist: { x: 65, y: 65, z: 0 },
        shape: 'point',
        palm: 'down',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'Dad' },
        hold: 120,
      },
      {
        label: 'Second Tap',
        rule: 'Second rhythmic tap for double D syllable',
        targetTip: { x: -5, y: 8, z: 26 },
        targetKnuckle: { x: 25, y: 28, z: 16 },
        targetWrist: { x: 65, y: 62, z: 2 },
        shape: 'point',
        palm: 'down',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'Father', headTilt: 'nod' },
        hold: 150,
      },
    ],
  },

  'HOME': {
    id: 'home',
    word: 'HOME',
    category: 'conversation',
    englishLabel: 'Home / House',
    gloss: 'HOME',
    makatonStage: 2,
    description: 'Both flat hands touch at fingertips forming an apex triangular roof over the chest.',
    aliases: ['HOUSE', 'HOMES'],
    keyframes: [
      {
        label: 'Form Roof Apex',
        rule: 'Both flat hands touch fingertips forming pitched roof',
        targetTip: { x: 0, y: -15, z: 28 },
        targetKnuckle: { x: 30, y: 10, z: 18 },
        targetWrist: { x: 70, y: 50, z: 5 },
        shape: 'flat',
        palm: 'in',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'home' },
        hold: 150,
      },
      {
        label: 'Shelter Hold',
        rule: 'Firm hold establishing warmth and security',
        targetTip: { x: 0, y: -12, z: 28 },
        targetKnuckle: { x: 30, y: 12, z: 18 },
        targetWrist: { x: 70, y: 52, z: 5 },
        shape: 'flat',
        palm: 'in',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'neutral', mouth: 'home', headTilt: 'nod' },
        hold: 180,
      },
    ],
  },

  'PLAY': {
    id: 'play',
    word: 'PLAY',
    category: 'school',
    englishLabel: 'Play / Game',
    gloss: 'PLAY',
    makatonStage: 3,
    description: 'Both open flat hands with palms facing upward rotate forward in alternating joyful cycles.',
    aliases: ['PLAYING', 'GAME', 'GAMES', 'PLAYED'],
    keyframes: [
      {
        label: 'Open Palms Up',
        rule: 'Both hands open palms upward at waist level',
        targetTip: { x: 25, y: 20, z: 25 },
        targetKnuckle: { x: 50, y: 40, z: 15 },
        targetWrist: { x: 80, y: 70, z: 0 },
        shape: 'flat',
        palm: 'up',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'play' },
        hold: 120,
      },
      {
        label: 'Playful Rotation',
        rule: 'Hands cycle forward in alternating play motion',
        targetTip: { x: 35, y: 15, z: 30 },
        targetKnuckle: { x: 60, y: 35, z: 20 },
        targetWrist: { x: 85, y: 65, z: 5 },
        shape: 'flat',
        palm: 'up',
        baseHandMode: 'mirror',
        nmf: { eyebrows: 'raised', mouth: 'game', headTilt: 'nod' },
        hold: 150,
      },
    ],
  },

  'LIKE': {
    id: 'like',
    word: 'LIKE',
    category: 'conversation',
    englishLabel: 'Like / Enjoy',
    gloss: 'LIKE',
    makatonStage: 4,
    description: 'Dominant flat hand rests over chest and moves forward with appreciation.',
    aliases: ['LIKING', 'LIKES', 'ENJOY', 'PREFER'],
    keyframes: [
      {
        label: 'Hand on Chest',
        rule: 'Flat hand rests over heart locus',
        targetTip: { x: -10, y: -5, z: 20 },
        targetKnuckle: { x: 15, y: 15, z: 12 },
        targetWrist: { x: 50, y: 50, z: 0 },
        shape: 'flat',
        palm: 'in',
        nmf: { eyebrows: 'raised', mouth: 'like' },
        hold: 120,
      },
      {
        label: 'Move Forward Warmly',
        rule: 'Hand pushes forward with appreciative nod',
        targetTip: { x: 5, y: -5, z: 35 },
        targetKnuckle: { x: 25, y: 15, z: 22 },
        targetWrist: { x: 60, y: 45, z: 8 },
        shape: 'flat',
        palm: 'in',
        nmf: { eyebrows: 'raised', mouth: 'like', headTilt: 'nod' },
        hold: 150,
      },
    ],
  },

  'WASH': {
    id: 'wash',
    word: 'WASH',
    category: 'school',
    englishLabel: 'Wash / Clean',
    gloss: 'WASH',
    makatonStage: 4,
    description: 'Dominant fist rubs over the back of the non-dominant hand in a circular hand-washing motion.',
    aliases: ['WASHING', 'WASHED', 'CLEAN', 'SOAP'],
    keyframes: [
      {
        label: 'Fist on Hand Back',
        rule: 'Dominant fist touches back of non-dominant hand',
        targetTip: { x: -5, y: 15, z: 20 },
        targetKnuckle: { x: 20, y: 35, z: 12 },
        targetWrist: { x: 55, y: 70, z: 0 },
        shape: 'fist',
        palm: 'down',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'wash' },
        hold: 130,
      },
      {
        label: 'Circular Scrub',
        rule: 'Fist circular scrub cleaning hands',
        targetTip: { x: 5, y: 12, z: 22 },
        targetKnuckle: { x: 30, y: 32, z: 14 },
        targetWrist: { x: 65, y: 68, z: 2 },
        shape: 'fist',
        palm: 'down',
        baseHandMode: 'vowel-board',
        nmf: { eyebrows: 'neutral', mouth: 'wash' },
        hold: 150,
      },
    ],
  },

  'WALK': {
    id: 'walk',
    word: 'WALK',
    category: 'conversation',
    englishLabel: 'Walk / Step',
    gloss: 'WALK',
    makatonStage: 4,
    description: 'Dominant inverted V-handshape moves downward and forward like legs stepping along a path.',
    aliases: ['WALKING', 'WALKED', 'STEP', 'GO-OUT'],
    keyframes: [
      {
        label: 'First Leg Forward',
        rule: 'Inverted V fingers pointing down stepping forward',
        targetTip: { x: 10, y: 25, z: 25 },
        targetKnuckle: { x: 25, y: 0, z: 18 },
        targetWrist: { x: 55, y: -20, z: 5 },
        shape: 'v',
        palm: 'in',
        nmf: { eyebrows: 'neutral', mouth: 'walk' },
        hold: 120,
      },
      {
        label: 'Second Leg Step',
        rule: 'Second finger steps forward completing walking motion',
        targetTip: { x: 20, y: 28, z: 32 },
        targetKnuckle: { x: 35, y: 2, z: 22 },
        targetWrist: { x: 65, y: -18, z: 8 },
        shape: 'v',
        palm: 'in',
        nmf: { eyebrows: 'neutral', mouth: 'walk', headTilt: 'nod' },
        hold: 150,
      },
    ],
  },
};

/**
 * Fast alias lookup index for instant O(1) matching of inflected forms
 */
const ALIAS_MAP: Record<string, string> = {};
for (const [canonicalId, sign] of Object.entries(BSL_CURRICULUM_LEXICON)) {
  ALIAS_MAP[canonicalId] = canonicalId;
  ALIAS_MAP[sign.word] = canonicalId;
  if (sign.aliases) {
    for (const alias of sign.aliases) {
      ALIAS_MAP[alias.toUpperCase()] = canonicalId;
    }
  }
}

/**
 * Registers new signs into the active in-memory curriculum lexicon at runtime
 */
export function registerBslSigns(signs: Record<string, BslSign>): number {
  let count = 0;
  for (const [id, sign] of Object.entries(signs)) {
    if (!sign || !sign.word) continue;
    const key = sign.word.toUpperCase();
    BSL_CURRICULUM_LEXICON[key] = sign;
    ALIAS_MAP[key] = key;
    if (sign.id) ALIAS_MAP[sign.id.toUpperCase()] = key;
    if (sign.aliases) {
      for (const alias of sign.aliases) {
        ALIAS_MAP[alias.toUpperCase()] = key;
      }
    }
    count++;
  }
  return count;
}

/**
 * Looks up a BSL whole-word sign by word or phrase with lemmatization & inflection rules
 */
export function lookupBslSign(word: string): BslSign | null {
  if (!word || typeof word !== 'string') return null;
  const clean = word.trim().toUpperCase().replace(/[^A-Z\s-]/g, '');
  if (!clean) return null;

  // 1. Exact match in canonical IDs or alias index
  const directId = ALIAS_MAP[clean];
  if (directId && BSL_CURRICULUM_LEXICON[directId]) {
    return BSL_CURRICULUM_LEXICON[directId];
  }

  // 2. English Lemmatization / Inflection normalization
  // -S / -ES (plurals & 3rd-person: PLANETS -> PLANET, ORBITS -> ORBIT, STARS -> STAR)
  if (clean.length > 3 && clean.endsWith('S')) {
    const root = clean.endsWith('ES') ? clean.slice(0, -2) : clean.slice(0, -1);
    const id = ALIAS_MAP[root];
    if (id && BSL_CURRICULUM_LEXICON[id]) return BSL_CURRICULUM_LEXICON[id];
  }

  // -ING (continuous participle: PRAYING -> PRAY, LEARNING -> LEARN, ORBITING -> ORBIT)
  if (clean.length > 4 && clean.endsWith('ING')) {
    const root = clean.slice(0, -3);
    const id = ALIAS_MAP[root];
    if (id && BSL_CURRICULUM_LEXICON[id]) return BSL_CURRICULUM_LEXICON[id];
    // Double consonant check (e.g. TAPPING -> TAP)
    if (root.length > 2 && root[root.length - 1] === root[root.length - 2]) {
      const single = root.slice(0, -1);
      const id2 = ALIAS_MAP[single];
      if (id2 && BSL_CURRICULUM_LEXICON[id2]) return BSL_CURRICULUM_LEXICON[id2];
    }
  }

  // -ED (past tense: PRAYED -> PRAY, ORBITED -> ORBIT, LEARNED -> LEARN)
  if (clean.length > 3 && clean.endsWith('ED')) {
    const root = clean.slice(0, -2);
    const id = ALIAS_MAP[root];
    if (id && BSL_CURRICULUM_LEXICON[id]) return BSL_CURRICULUM_LEXICON[id];
  }

  return null;
}

/**
 * Converts a BSL Sign Keyframe into a standardized BslHandPose for the render loop
 */
export function signKeyframeToHandPose(sign: BslSign, kf: BslSignKeyframe, index: number, total: number): BslHandPose {
  // Determine anatomical role of the non-dominant hand in natural BSL
  let baseHandMode: BslBaseHandMode = kf.baseHandMode || 'rest';
  if (!kf.baseHandMode) {
    if (kf.baseHandOverride) {
      baseHandMode = 'override';
    } else if ([
      'PRAY', 'CHURCH', 'FORCE', 'LOVE', 'PEACE', 'BIBLE', 'BOOK', 'EARTH', 'SCIENCE', 'EQUAL', 'HEAT', 'FAST',
      'WHAT', 'WHERE', 'HOW', 'WELCOME', 'WAIT', 'FINISH', 'BIG', 'ALL', 'HOLY', 'TEACHER',
      'GIVE', 'EXPLAIN', 'TODAY', 'NOW', 'DISAGREE', 'WANT', 'CAN', 'FAMILY', 'HOME', 'PLAY', 'BED'
    ].includes(sign.word)) {
      baseHandMode = 'mirror';
    } else if ([
      'SCHOOL', 'HELP', 'LEARN', 'READ', 'WRITE', 'MATHS', 'NUMBER', 'GOOD', 'FRIEND', 'PLANET', 'ORBIT', 'GRAVITY', 'TIME', 'JESUS',
      'CROSS', 'START', 'STOP', 'SIT', 'STAND', 'CORRECT', 'HAPPY', 'MORE', 'AGAIN', 'SLOW',
      'SHOW', 'MORNING', 'AFTERNOON', 'AGREE', 'REMEMBER', 'CANNOT', 'PUPIL', 'DAD', 'WASH'
    ].includes(sign.word)) {
      baseHandMode = 'vowel-board';
    } else {
      baseHandMode = 'rest'; // One-handed signs (GOD, SUN, MOON, HELLO, THANK YOU, PLEASE, YES, NO, LIGHT, WATER, ENERGY, WHO, WHY, WHEN, GOODBYE, NAME, SORRY, WRONG, SAD, SMALL, TELL, ASK, LOOK, YESTERDAY, TOMORROW, FUTURE, PAST, UNDERSTAND, FORGET, THINK, KNOW, NEED, MUST, BECAUSE, IF, ME, YOU, THEY, EAT, DRINK, TOILET, MUM, LIKE, WALK)
    }
  }

  return {
    letter: `${sign.word} [${index + 1}/${total}]`,
    label: `${sign.englishLabel} • ${kf.label}`,
    rule: kf.rule,
    isVowel: Boolean(kf.activeVowelIndex !== undefined),
    activeVowelIndex: kf.activeVowelIndex,
    targetTip: kf.targetTip,
    targetKnuckle: kf.targetKnuckle,
    targetWrist: kf.targetWrist,
    nmf: kf.nmf,
    shape: kf.shape,
    isWholeWordSign: true,
    baseHandMode,
    baseHandOverride: kf.baseHandOverride,
  };
}

// Grammatical English function words dropped in natural BSL spatial topic-comment structure
const BSL_GRAMMAR_PARTICLES = new Set([
  'THE', 'A', 'AN', 'IS', 'ARE', 'AM', 'WAS', 'WERE', 'BE', 'BEEN', 'BEING',
  'OF', 'TO', 'IN', 'ON', 'AT', 'IT', 'ITS', 'THAT', 'THIS', 'THESE', 'THOSE',
  'WITH', 'AS', 'FOR', 'BY', 'FROM', 'AND', 'BUT', 'OR', 'NOR', 'SO', 'YET',
  'INTO', 'OVER', 'UNDER', 'ABOUT', 'THROUGH', 'DURING', 'BEFORE', 'AFTER',
  'WILL', 'WOULD', 'SHALL', 'SHOULD', 'CAN', 'COULD', 'MAY', 'MIGHT', 'MUST',
  'HAVE', 'HAS', 'HAD', 'DO', 'DOES', 'DID', 'THERE', 'HERE', 'THEIR', 'THEIRS',
  'THEM', 'THEY', 'WE', 'US', 'OUR', 'OURS', 'YOU', 'YOUR', 'YOURS', 'HE', 'HIM',
  'HIS', 'SHE', 'HER', 'HERS', 'MY', 'MINE', 'ME', 'I'
]);

/**
 * Intelligent BSL Stream Decomposer:
 * 1. Greedy Multi-Word Phrase Matching (e.g. "THANK YOU", "HOLY BOOK", "SOLAR SYSTEM").
 * 2. Stemming and inflection resolution (e.g. "ORBITS" -> ORBIT, "PLANETS" -> PLANET).
 * 3. Natural BSL grammatical particle omission (avoids tedious spelling of 'T-H-E', 'I-S').
 * 4. Mode toggle: 'concept' (prioritizes whole-word conceptual signs) vs 'fingerspell' (manual alphabet).
 * 5. Fallback: Letter-by-letter manual alphabet fingerspelling for unknown proper nouns.
 */
export function decomposeTextToBslStreamWithLexicon(
  text: string,
  options?: { mode?: 'concept' | 'fingerspell' }
): BslHandPose[] {
  if (!text || typeof text !== 'string') return [];
  const words = text.trim().split(/\s+/).filter(Boolean);
  const stream: BslHandPose[] = [];
  const isExplicitFingerspell = options?.mode === 'fingerspell';

  for (let wIdx = 0; wIdx < words.length; wIdx++) {
    const rawWord = words[wIdx];
    const cleanWord = rawWord.toUpperCase().replace(/[^A-Z-]/g, '');
    if (!cleanWord) continue;

    // Explicit fingerspelling mode: spell every letter
    if (isExplicitFingerspell) {
      for (const char of cleanWord) {
        if (BSL_ALPHABET_POSES[char]) {
          stream.push(BSL_ALPHABET_POSES[char]);
        }
      }
      if (wIdx < words.length - 1) {
        stream.push({
          letter: ' ',
          label: 'Word Boundary',
          rule: 'Neutral transition between words',
          isVowel: false,
          targetTip: DOMINANT_REST_POSE,
          targetKnuckle: DOMINANT_REST_KNUCKLE,
          targetWrist: DOMINANT_REST_WRIST,
        });
      }
      continue;
    }

    // 1. Try Greedy 2-word phrase lookup (e.g. "THANK YOU", "SOLAR SYSTEM", "HOLY BOOK")
    if (wIdx < words.length - 1) {
      const nextClean = words[wIdx + 1].toUpperCase().replace(/[^A-Z-]/g, '');
      const twoWordPhrase = `${cleanWord} ${nextClean}`;
      const twoWordSign = lookupBslSign(twoWordPhrase);
      if (twoWordSign && twoWordSign.keyframes.length > 0) {
        const totalKf = twoWordSign.keyframes.length;
        twoWordSign.keyframes.forEach((kf, kfIdx) => {
          stream.push(signKeyframeToHandPose(twoWordSign, kf, kfIdx, totalKf));
        });
        wIdx++; // Consume next word as part of phrase
        continue;
      }
    }

    // 2. Single word lookup
    const matchedSign = lookupBslSign(cleanWord);

    if (matchedSign && matchedSign.keyframes.length > 0) {
      // Whole-Word Sign sequence
      const totalKf = matchedSign.keyframes.length;
      matchedSign.keyframes.forEach((kf, kfIdx) => {
        stream.push(signKeyframeToHandPose(matchedSign, kf, kfIdx, totalKf));
      });
    } else if (BSL_GRAMMAR_PARTICLES.has(cleanWord)) {
      // Natural BSL Grammatical Particle: skip English articles/auxiliaries in sentence flow
      continue;
    } else {
      // Un-lexiconed word:
      // If single isolated test word or short noun, fingerspell it.
      // If inside continuous narration sentence, fingerspell only if short (<= 6 chars) to avoid lagging behind speech
      if (words.length === 1 || cleanWord.length <= 6) {
        for (const char of cleanWord) {
          if (BSL_ALPHABET_POSES[char]) {
            stream.push(BSL_ALPHABET_POSES[char]);
          }
        }
      }
    }

    // Add brief neutral transition between words
    if (wIdx < words.length - 1 && stream.length > 0) {
      const lastPose = stream[stream.length - 1];
      if (lastPose && lastPose.letter !== ' ') {
        stream.push({
          letter: ' ',
          label: 'Word Boundary',
          rule: 'Neutral transition between signs',
          isVowel: false,
          targetTip: DOMINANT_REST_POSE,
          targetKnuckle: DOMINANT_REST_KNUCKLE,
          targetWrist: DOMINANT_REST_WRIST,
        });
      }
    }
  }

  return stream;
}

// =============================================================================
// MAKATON CORE VOCABULARY STAGES & SEN PEDAGOGY
// Makaton Language Programme: Keyword signing alongside speech in English word order
// =============================================================================

export interface MakatonStageInfo {
  stage: number;
  name: string;
  category: string;
  description: string;
  coreWords: string[];
}

export const MAKATON_CORE_STAGES: Record<number, MakatonStageInfo> = {
  1: {
    stage: 1,
    name: 'Immediate Needs & Greetings',
    category: 'Essential Communication',
    description: 'Basic daily survival, greetings, requests, and self-advocacy.',
    coreWords: ['HELLO', 'GOODBYE', 'PLEASE', 'THANK YOU', 'YES', 'NO', 'EAT', 'DRINK', 'MORE', 'AGAIN', 'BED', 'TOILET', 'HELP', 'SORRY'],
  },
  2: {
    stage: 2,
    name: 'People & Home',
    category: 'Family & Identity',
    description: 'Key family members, home environment, and personal identity.',
    coreWords: ['MUM', 'DAD', 'FAMILY', 'HOME', 'HOUSE', 'BABY', 'BOY', 'GIRL'],
  },
  3: {
    stage: 3,
    name: 'Food & Activities',
    category: 'Daily Living',
    description: 'Everyday nourishment, play, and engaging leisure activities.',
    coreWords: ['BOOK', 'PLAY', 'WATER', 'FOOD', 'MUSIC', 'BALL'],
  },
  4: {
    stage: 4,
    name: 'Actions & Daily Routines',
    category: 'Core Verbs & Directives',
    description: 'Classroom instructions, movement, hygiene, and guidance.',
    coreWords: ['LOOK', 'LISTEN', 'WAIT', 'STOP', 'START', 'GO', 'WASH', 'WALK', 'LIKE', 'STAND', 'SIT'],
  },
  5: {
    stage: 5,
    name: 'School, Feelings & Community',
    category: 'Education & Social-Emotional',
    description: 'School learning, educators, peers, and emotional states.',
    coreWords: ['SCHOOL', 'TEACHER', 'PUPIL', 'FRIEND', 'HAPPY', 'SAD', 'GOOD', 'WRITE', 'READ', 'LEARN'],
  },
  6: {
    stage: 6,
    name: 'Time & Natural World',
    category: 'Environment',
    description: 'Daily rhythms, weather, and the physical cosmos.',
    coreWords: ['SUN', 'MOON', 'EARTH', 'DAY', 'NIGHT', 'RAIN', 'STAR', 'TIME'],
  },
  7: {
    stage: 7,
    name: 'Faith, Prayer & Community Life',
    category: 'Spiritual & Catholic Life',
    description: 'Sacred life, worship, and reverence in Catholic education.',
    coreWords: ['JESUS', 'GOD', 'PRAY', 'CHURCH', 'BIBLE', 'CROSS', 'LOVE', 'PEACE'],
  },
  8: {
    stage: 8,
    name: 'Expanding Concepts & STEM',
    category: 'STEM & Reasoning',
    description: 'Higher curriculum concepts, quantification, and spatial logic.',
    coreWords: ['MATHS', 'NUMBER', 'EQUAL', 'SCIENCE', 'ENERGY', 'FORCE', 'GRAVITY', 'PLANET', 'ORBIT'],
  },
};

/**
 * Returns all signs in the curriculum lexicon belonging to a specific Makaton stage
 */
export function getMakatonSigns(stage?: number): BslSign[] {
  const allSigns = Object.values(BSL_CURRICULUM_LEXICON);
  if (stage === undefined) {
    return allSigns.filter(s => s.makatonStage !== undefined || Object.values(MAKATON_CORE_STAGES).some(stg => stg.coreWords.includes(s.word)));
  }
  const stageInfo = MAKATON_CORE_STAGES[stage];
  const targetWords = stageInfo ? new Set(stageInfo.coreWords) : new Set<string>();
  return allSigns.filter(s => s.makatonStage === stage || targetWords.has(s.word));
}

/**
 * Checks if a word is part of the Makaton core vocabulary
 */
export function isMakatonWord(word: string): boolean {
  if (!word) return false;
  const clean = word.trim().toUpperCase().replace(/[^A-Z-]/g, '');
  const sign = lookupBslSign(clean);
  if (sign && sign.makatonStage !== undefined) return true;
  return Object.values(MAKATON_CORE_STAGES).some(stg => stg.coreWords.includes(clean));
}

/**
 * Looks up a Makaton sign with stage metadata attached
 */
export function lookupMakatonSign(word: string): { sign: BslSign; stage: number } | null {
  const sign = lookupBslSign(word);
  if (!sign) return null;
  if (sign.makatonStage !== undefined) {
    return { sign, stage: sign.makatonStage };
  }
  for (const [stgNum, stgInfo] of Object.entries(MAKATON_CORE_STAGES)) {
    if (stgInfo.coreWords.includes(sign.word)) {
      return { sign, stage: Number(stgNum) };
    }
  }
  return { sign, stage: 1 };
}

