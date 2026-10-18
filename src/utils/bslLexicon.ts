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

import { Point3D, BslHandPose, BslNmf, BslHandShape, DOMINANT_REST_POSE, DOMINANT_REST_KNUCKLE, DOMINANT_REST_WRIST, BSL_ALPHABET_POSES } from './bslAlphabet';

export type { BslNmf, BslHandShape };
export type BslCategory = 'faith' | 'school' | 'stem' | 'conversation';

export interface BslSignKeyframe {
  label: string;
  rule: string;
  durationWeight?: number;
  targetTip: Point3D;
  targetKnuckle: Point3D;
  targetWrist: Point3D;
  shape?: BslHandShape;
  activeVowelIndex?: number;
  baseHandOverride?: {
    wrist?: Point3D;
    palm?: Point3D;
    shiftX?: number;
    shiftY?: number;
    shiftZ?: number;
  };
  nmf?: BslNmf;
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
        nmf: { eyebrows: 'neutral', mouth: 'cross' },
      },
      {
        label: 'Vertical Base',
        rule: 'Index finger traces downward to base at lower chest',
        targetTip: { x: 0, y: 35, z: 25 },
        targetKnuckle: { x: 25, y: 65, z: 15 },
        targetWrist: { x: 65, y: 95, z: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'cross' },
      },
      {
        label: 'Horizontal Beam Left',
        rule: 'Index draws crossbeam starting from left',
        targetTip: { x: -45, y: -15, z: 22 },
        targetKnuckle: { x: -10, y: 15, z: 12 },
        targetWrist: { x: 40, y: 55, z: 0 },
        nmf: { eyebrows: 'neutral', mouth: 'cross' },
      },
      {
        label: 'Horizontal Beam Right',
        rule: 'Index draws across to right shoulder',
        targetTip: { x: 45, y: -15, z: 22 },
        targetKnuckle: { x: 75, y: 15, z: 12 },
        targetWrist: { x: 110, y: 55, z: 0 },
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
        nmf: { eyebrows: 'neutral', mouth: 'teach' },
      },
      {
        label: 'Extend Knowledge Out',
        rule: 'Hands extend forward sharing knowledge with pupils',
        targetTip: { x: 30, y: -20, z: 65 },
        targetKnuckle: { x: 55, y: 10, z: 45 },
        targetWrist: { x: 85, y: 50, z: 20 },
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
    category: 'school',
    englishLabel: 'Look / See / Watch',
    gloss: 'LOOK',
    description: 'Two fingers (V-shape) point outward from eyes toward the subject.',
    aliases: ['SEE', 'WATCH', 'VIEW', 'OBSERVE'],
    keyframes: [
      {
        label: 'From Eyes',
        rule: 'V-fingers start pointing near eyes',
        targetTip: { x: 35, y: -45, z: 25 },
        targetKnuckle: { x: 60, y: -15, z: 15 },
        targetWrist: { x: 90, y: 25, z: 0 },
        nmf: { eyebrows: 'raised', mouth: 'look' },
      },
      {
        label: 'Direct Outward',
        rule: 'V-fingers thrust forward directing gaze',
        targetTip: { x: 25, y: -25, z: 65 },
        targetKnuckle: { x: 50, y: 5, z: 45 },
        targetWrist: { x: 80, y: 45, z: 20 },
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
        nmf: { eyebrows: 'neutral', mouth: 'equal' },
      },
      {
        label: 'Press Equality',
        rule: 'Both horizontal fingers tap together confirming equality',
        targetTip: { x: -35, y: 15, z: 20 },
        targetKnuckle: { x: 15, y: 25, z: 10 },
        targetWrist: { x: 75, y: 55, z: 0 },
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
 * Looks up a BSL whole-word sign by word or phrase
 */
export function lookupBslSign(word: string): BslSign | null {
  if (!word || typeof word !== 'string') return null;
  const clean = word.trim().toUpperCase().replace(/[^A-Z\s-]/g, '');
  const id = ALIAS_MAP[clean];
  if (id && BSL_CURRICULUM_LEXICON[id]) {
    return BSL_CURRICULUM_LEXICON[id];
  }
  return null;
}

/**
 * Converts a BSL Sign Keyframe into a standardized BslHandPose for the render loop
 */
export function signKeyframeToHandPose(sign: BslSign, kf: BslSignKeyframe, index: number, total: number): BslHandPose {
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
  };
}

/**
 * Intelligent BSL Stream Decomposer (Phase 1 Hybrid Engine):
 * 1. Matches whole-word signs from the BSL Curriculum Lexicon.
 * 2. If a word has a designated sign, generates its fluid 3D keyframe sequence.
 * 3. If unknown, gracefully falls back to 2-handed fingerspelling letter by letter.
 */
export function decomposeTextToBslStreamWithLexicon(text: string): BslHandPose[] {
  if (!text || typeof text !== 'string') return [];
  const words = text.trim().split(/\s+/).filter(Boolean);
  const stream: BslHandPose[] = [];

  for (let wIdx = 0; wIdx < words.length; wIdx++) {
    const rawWord = words[wIdx];
    const cleanWord = rawWord.toUpperCase().replace(/[^A-Z-]/g, '');
    if (!cleanWord) continue;

    const matchedSign = lookupBslSign(cleanWord);

    if (matchedSign && matchedSign.keyframes.length > 0) {
      // Whole-Word Sign sequence
      const totalKf = matchedSign.keyframes.length;
      matchedSign.keyframes.forEach((kf, kfIdx) => {
        stream.push(signKeyframeToHandPose(matchedSign, kf, kfIdx, totalKf));
      });
    } else {
      // Fallback: BANZSL Fingerspelling
      for (const char of cleanWord) {
        if (BSL_ALPHABET_POSES[char]) {
          stream.push(BSL_ALPHABET_POSES[char]);
        }
      }
    }

    // Add brief neutral transition between words
    if (wIdx < words.length - 1) {
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

  return stream;
}
