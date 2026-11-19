// src/data/earlyReaderLadderData.ts
/**
 * Non-Reader to Fluent Reader Progression Data
 *
 * Bridges UK DfE Letters & Sounds Phase 1 (Oral Phonemic Awareness) through
 * cumulative Phase 2-5 graphemes, SATPIN starter blending/segmenting words,
 * and 5 progressive 100% decodable illustrated mini-books with inline
 * tap-to-decode word analysis and picture comprehension checks.
 */

import {
  DECODABLE_WORDS,
  TRICKY_WORDS,
  getPhonemeSpokenText,
  type DecodableWord,
  type SoundSegment,
  type TrickyWord,
} from './phonicsCurriculumData';

export type PreReaderMode = 'initial-sound' | 'rhyme' | 'oral-blend';

export interface PreReaderOption {
  label: string;
  icon: string;
  isCorrect: boolean;
}

export interface PreReaderPrompt {
  id: string;
  mode: PreReaderMode;
  badge: string;
  displayCue: string;
  spokenPrompt: string;
  /** Optional individual phonemes to speak slowly in oral-blend ("Robot Talk") mode */
  robotPhonemes?: string[];
  successPraise: string;
  options: PreReaderOption[];
}

export interface CumulativeSoundGroup {
  id: string;
  title: string;
  phase: 2 | 3 | 5;
  setKey: string;
  graphemes: string[];
  unlocksHint: string;
}

export interface MiniBookPage {
  sceneEmoji: string;
  sceneCaption: string;
  text: string;
}

export interface MiniBookQuizQuestion {
  id: string;
  question: string;
  options: Array<{
    label: string;
    icon: string;
    isCorrect: boolean;
  }>;
}

export interface DecodableMiniBook {
  id: string;
  cartridgeId: string;
  level: number;
  levelLabel: string;
  title: string;
  subtitle: string;
  coverEmoji: string;
  targetSounds: string[];
  trickyPreview: string[];
  pages: MiniBookPage[];
  quiz: MiniBookQuizQuestion[];
}

export type DecodedReaderWord =
  | {
      kind: 'tricky';
      rawWord: string;
      cleanWord: string;
      tricky: TrickyWord;
    }
  | {
      kind: 'decodable';
      rawWord: string;
      cleanWord: string;
      segments: SoundSegment[];
      icon?: string;
    };

/**
 * Stage 0: Zero-Reading-Required Phonemic Awareness Games (Phase 1)
 * Purely audio + picture cards so a 4-6 year old or absolute beginner can start independently.
 */
export const PRE_READER_GAMES: PreReaderPrompt[] = [
  // Initial Sound Matching
  {
    id: 'pre-init-s',
    mode: 'initial-sound',
    badge: 'First Sound',
    displayCue: '/s/',
    spokenPrompt: 'Listen closely. Tap the picture that starts with ssss!',
    successPraise: 'Brilliant! Sun starts with ssss!',
    options: [
      { label: 'sun', icon: '☀️', isCorrect: true },
      { label: 'cat', icon: '🐱', isCorrect: false },
      { label: 'dog', icon: '🐶', isCorrect: false },
    ],
  },
  {
    id: 'pre-init-a',
    mode: 'initial-sound',
    badge: 'First Sound',
    displayCue: '/a/',
    spokenPrompt: 'Tap the picture that starts with ah!',
    successPraise: 'Well done! Ant starts with ah!',
    options: [
      { label: 'bus', icon: '🚌', isCorrect: false },
      { label: 'ant', icon: '🐜', isCorrect: true },
      { label: 'fish', icon: '🐟', isCorrect: false },
    ],
  },
  {
    id: 'pre-init-t',
    mode: 'initial-sound',
    badge: 'First Sound',
    displayCue: '/t/',
    spokenPrompt: 'Tap the picture that starts with tuh!',
    successPraise: 'Great ear! Tap starts with tuh!',
    options: [
      { label: 'pig', icon: '🐷', isCorrect: false },
      { label: 'moon', icon: '🌕', isCorrect: false },
      { label: 'tap', icon: '🚰', isCorrect: true },
    ],
  },
  {
    id: 'pre-init-p',
    mode: 'initial-sound',
    badge: 'First Sound',
    displayCue: '/p/',
    spokenPrompt: 'Tap the picture that starts with puh!',
    successPraise: 'Super! Pan starts with puh!',
    options: [
      { label: 'pan', icon: '🍳', isCorrect: true },
      { label: 'hat', icon: '🎩', isCorrect: false },
      { label: 'log', icon: '🪵', isCorrect: false },
    ],
  },
  {
    id: 'pre-init-m',
    mode: 'initial-sound',
    badge: 'First Sound',
    displayCue: '/m/',
    spokenPrompt: 'Tap the picture that starts with mmm!',
    successPraise: 'Yes! Moon starts with mmm!',
    options: [
      { label: 'cup', icon: '☕', isCorrect: false },
      { label: 'moon', icon: '🌕', isCorrect: true },
      { label: 'star', icon: '⭐', isCorrect: false },
    ],
  },
  {
    id: 'pre-init-d',
    mode: 'initial-sound',
    badge: 'First Sound',
    displayCue: '/d/',
    spokenPrompt: 'Tap the picture that starts with duh!',
    successPraise: 'Awesome! Duck starts with duh!',
    options: [
      { label: 'duck', icon: '🦆', isCorrect: true },
      { label: 'rain', icon: '🌧️', isCorrect: false },
      { label: 'bee', icon: '🐝', isCorrect: false },
    ],
  },

  // Rhyme Matching
  {
    id: 'pre-rhyme-cat',
    mode: 'rhyme',
    badge: 'Rhyme Time',
    displayCue: '🐱 cat',
    spokenPrompt: 'Which picture rhymes with cat?',
    successPraise: 'Yes! Cat and hat rhyme!',
    options: [
      { label: 'hat', icon: '🎩', isCorrect: true },
      { label: 'bus', icon: '🚌', isCorrect: false },
      { label: 'pig', icon: '🐷', isCorrect: false },
    ],
  },
  {
    id: 'pre-rhyme-dog',
    mode: 'rhyme',
    badge: 'Rhyme Time',
    displayCue: '🐶 dog',
    spokenPrompt: 'Which picture rhymes with dog?',
    successPraise: 'Brilliant! Dog and frog rhyme!',
    options: [
      { label: 'sun', icon: '☀️', isCorrect: false },
      { label: 'frog', icon: '🐸', isCorrect: true },
      { label: 'cup', icon: '☕', isCorrect: false },
    ],
  },
  {
    id: 'pre-rhyme-pan',
    mode: 'rhyme',
    badge: 'Rhyme Time',
    displayCue: '🍳 pan',
    spokenPrompt: 'Which picture rhymes with pan?',
    successPraise: 'Super! Pan and van rhyme!',
    options: [
      { label: 'van', icon: '🚐', isCorrect: true },
      { label: 'boat', icon: '⛵', isCorrect: false },
      { label: 'egg', icon: '🥚', isCorrect: false },
    ],
  },
  {
    id: 'pre-rhyme-star',
    mode: 'rhyme',
    badge: 'Rhyme Time',
    displayCue: '⭐ star',
    spokenPrompt: 'Which picture rhymes with star?',
    successPraise: 'Spot on! Star and car rhyme!',
    options: [
      { label: 'tree', icon: '🌳', isCorrect: false },
      { label: 'ship', icon: '🚢', isCorrect: false },
      { label: 'car', icon: '🚗', isCorrect: true },
    ],
  },

  // Oral Blending ("Robot Talk" — Phase 1 bridge to reading)
  {
    id: 'pre-blend-cat',
    mode: 'oral-blend',
    badge: 'Robot Talk',
    displayCue: '🤖 c · a · t',
    spokenPrompt: 'Listen to the robot sounds and tap the picture.',
    robotPhonemes: ['kuh', 'ah', 'tuh'],
    successPraise: 'You blended it! kuh, ah, tuh makes cat!',
    options: [
      { label: 'cat', icon: '🐱', isCorrect: true },
      { label: 'dog', icon: '🐶', isCorrect: false },
      { label: 'sun', icon: '☀️', isCorrect: false },
    ],
  },
  {
    id: 'pre-blend-sun',
    mode: 'oral-blend',
    badge: 'Robot Talk',
    displayCue: '🤖 s · u · n',
    spokenPrompt: 'Listen to the robot sounds and tap the picture.',
    robotPhonemes: ['ssss', 'uh', 'nnn'],
    successPraise: 'You blended it! ssss, uh, nnn makes sun!',
    options: [
      { label: 'pig', icon: '🐷', isCorrect: false },
      { label: 'sun', icon: '☀️', isCorrect: true },
      { label: 'hat', icon: '🎩', isCorrect: false },
    ],
  },
  {
    id: 'pre-blend-dog',
    mode: 'oral-blend',
    badge: 'Robot Talk',
    displayCue: '🤖 d · o · g',
    spokenPrompt: 'Listen to the robot sounds and tap the picture.',
    robotPhonemes: ['duh', 'off', 'guh'],
    successPraise: 'Well done! duh, off, guh makes dog!',
    options: [
      { label: 'cup', icon: '☕', isCorrect: false },
      { label: 'bus', icon: '🚌', isCorrect: false },
      { label: 'dog', icon: '🐶', isCorrect: true },
    ],
  },
  {
    id: 'pre-blend-ship',
    mode: 'oral-blend',
    badge: 'Robot Talk',
    displayCue: '🤖 sh · i · p',
    spokenPrompt: 'Listen to the robot sounds and tap the picture.',
    robotPhonemes: ['shhh', 'ih', 'puh'],
    successPraise: 'Amazing ear! shhh, ih, puh makes ship!',
    options: [
      { label: 'ship', icon: '🚢', isCorrect: true },
      { label: 'moon', icon: '🌕', isCorrect: false },
      { label: 'frog', icon: '🐸', isCorrect: false },
    ],
  },
];

/**
 * Stage 1: Cumulative DfE Letters & Sounds Sets
 * Prevents cognitive overload by introducing 4-5 pure sounds at a time.
 */
export const CUMULATIVE_SOUND_GROUPS: CumulativeSoundGroup[] = [
  {
    id: 'set-1',
    title: 'Set 1 · s, a, t, p',
    phase: 2,
    setKey: 'Set 1',
    graphemes: ['s', 'a', 't', 'p'],
    unlocksHint: 'Your first 4 pure sounds — unlocks real words immediately: sat, tap, pat.',
  },
  {
    id: 'set-2',
    title: 'Set 2 · i, n, m, d',
    phase: 2,
    setKey: 'Set 2',
    graphemes: ['i', 'n', 'm', 'd'],
    unlocksHint: 'Unlocks Book 1 ("Pat Sat") and words like pin, tin, pan, nap, mat, dad.',
  },
  {
    id: 'set-3',
    title: 'Set 3 · g, o, c, k',
    phase: 2,
    setKey: 'Set 3',
    graphemes: ['g', 'o', 'c', 'k'],
    unlocksHint: 'Unlocks cat, dog, pot, pig, map, and kit.',
  },
  {
    id: 'set-4',
    title: 'Set 4 · ck, e, u, r',
    phase: 2,
    setKey: 'Set 4',
    graphemes: ['ck', 'e', 'u', 'r'],
    unlocksHint: 'Introduces your first digraph (ck) and unlocks duck, red, cup, run, sun.',
  },
  {
    id: 'set-5',
    title: 'Set 5 · h, b, f, l, ss',
    phase: 2,
    setKey: 'Set 5',
    graphemes: ['h', 'b', 'f', 'l', 'ss'],
    unlocksHint: 'Completes Phase 2 and unlocks Book 2 ("The Red Dog").',
  },
  {
    id: 'p3-letters',
    title: 'Phase 3 · j, v, w, x, y, z, qu',
    phase: 3,
    setKey: 'Set 6',
    graphemes: ['j', 'v', 'w', 'x', 'y', 'z', 'qu'],
    unlocksHint: 'Completes the full alphabet with jam, van, web, box, zip, and queen.',
  },
  {
    id: 'p3-digraphs',
    title: 'Phase 3 · Consonant Digraphs',
    phase: 3,
    setKey: 'Digraphs',
    graphemes: ['ch', 'sh', 'th', 'ng'],
    unlocksHint: 'Two letters making one sound (— bar): ship, chip, moth, ring.',
  },
  {
    id: 'p3-vowels',
    title: 'Phase 3 · Vowel Digraphs & Trigraphs',
    phase: 3,
    setKey: 'Vowels',
    graphemes: ['ai', 'ee', 'igh', 'oa', 'oo (short)', 'oo (long)', 'ar', 'or', 'ur', 'ow', 'oi', 'ear', 'air', 'er'],
    unlocksHint: 'Long vowels and r-controlled sounds — unlocks Book 3 ("A Ship in the Rain").',
  },
  {
    id: 'p5-alt',
    title: 'Phase 5 · Alternative Spellings',
    phase: 5,
    setKey: 'Alternatives',
    graphemes: ['ay', 'ou', 'ie', 'ea', 'oy', 'ir', 'ue', 'aw', 'wh', 'ph'],
    unlocksHint: 'New ways to spell vowel sounds you already know: play, cloud, beach, dolphin.',
  },
  {
    id: 'p5-split',
    title: 'Phase 5 · Split Digraphs (Magic e)',
    phase: 5,
    setKey: 'Split Digraphs',
    graphemes: ['a-e', 'e-e', 'i-e', 'o-e', 'u-e'],
    unlocksHint: 'Connected vowel + final e — unlocks Book 5 ("The Cake by the Lake").',
  },
];

/**
 * Starter SATPIN CVC words so children can blend & build words right after Set 1-2!
 */
export const SATPIN_STARTER_WORDS: DecodableWord[] = [
  {
    word: 'sat',
    phase: 2,
    category: 'SATPIN Starter',
    icon: '🪑',
    segments: [
      { letters: 's', type: 'single', soundHint: 'ssss' },
      { letters: 'a', type: 'single', soundHint: 'ah' },
      { letters: 't', type: 'single', soundHint: 'tuh' },
    ],
  },
  {
    word: 'tap',
    phase: 2,
    category: 'SATPIN Starter',
    icon: '🚰',
    segments: [
      { letters: 't', type: 'single', soundHint: 'tuh' },
      { letters: 'a', type: 'single', soundHint: 'ah' },
      { letters: 'p', type: 'single', soundHint: 'puh' },
    ],
  },
  {
    word: 'pan',
    phase: 2,
    category: 'SATPIN Starter',
    icon: '🍳',
    segments: [
      { letters: 'p', type: 'single', soundHint: 'puh' },
      { letters: 'a', type: 'single', soundHint: 'ah' },
      { letters: 'n', type: 'single', soundHint: 'nnn' },
    ],
  },
  {
    word: 'pin',
    phase: 2,
    category: 'SATPIN Starter',
    icon: '📌',
    segments: [
      { letters: 'p', type: 'single', soundHint: 'puh' },
      { letters: 'i', type: 'single', soundHint: 'ih' },
      { letters: 'n', type: 'single', soundHint: 'nnn' },
    ],
  },
  {
    word: 'tin',
    phase: 2,
    category: 'SATPIN Starter',
    icon: '🥫',
    segments: [
      { letters: 't', type: 'single', soundHint: 'tuh' },
      { letters: 'i', type: 'single', soundHint: 'ih' },
      { letters: 'n', type: 'single', soundHint: 'nnn' },
    ],
  },
  {
    word: 'nap',
    phase: 2,
    category: 'SATPIN Starter',
    icon: '😴',
    segments: [
      { letters: 'n', type: 'single', soundHint: 'nnn' },
      { letters: 'a', type: 'single', soundHint: 'ah' },
      { letters: 'p', type: 'single', soundHint: 'puh' },
    ],
  },
  {
    word: 'mat',
    phase: 2,
    category: 'SATPIN Starter',
    icon: '🧶',
    segments: [
      { letters: 'm', type: 'single', soundHint: 'mmm' },
      { letters: 'a', type: 'single', soundHint: 'ah' },
      { letters: 't', type: 'single', soundHint: 'tuh' },
    ],
  },
  {
    word: 'dad',
    phase: 2,
    category: 'SATPIN Starter',
    icon: '👨',
    segments: [
      { letters: 'd', type: 'single', soundHint: 'duh' },
      { letters: 'a', type: 'single', soundHint: 'ah' },
      { letters: 'd', type: 'single', soundHint: 'duh' },
    ],
  },
  {
    word: 'sad',
    phase: 2,
    category: 'SATPIN Starter',
    icon: '😢',
    segments: [
      { letters: 's', type: 'single', soundHint: 'ssss' },
      { letters: 'a', type: 'single', soundHint: 'ah' },
      { letters: 'd', type: 'single', soundHint: 'duh' },
    ],
  },
  {
    word: 'sit',
    phase: 2,
    category: 'SATPIN Starter',
    icon: '🧘',
    segments: [
      { letters: 's', type: 'single', soundHint: 'ssss' },
      { letters: 'i', type: 'single', soundHint: 'ih' },
      { letters: 't', type: 'single', soundHint: 'tuh' },
    ],
  },
];

export const ALL_DECODABLE_WORDS: DecodableWord[] = (() => {
  const seen = new Set<string>();
  const combined: DecodableWord[] = [];
  for (const w of [...SATPIN_STARTER_WORDS, ...DECODABLE_WORDS]) {
    const key = w.word.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(w);
    }
  }
  return combined;
})();

/**
 * Stage 5: 5 Progressive 100% Decodable Illustrated Mini-Books
 * Every story sentence is tightly controlled to its phonics level + declared Tricky Words.
 */
export const DECODABLE_MINI_BOOKS: DecodableMiniBook[] = [
  {
    id: 'book-1-satpin',
    cartridgeId: 'reader-pat-sat',
    level: 1,
    levelLabel: 'Level 1 · Set 1 & 2 (SATPIN)',
    title: 'Pat Sat',
    subtitle: 'Your very first book using just s, a, t, p, i, n, m, d!',
    coverEmoji: '🚰',
    targetSounds: ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd'],
    trickyPreview: ['a'],
    pages: [
      {
        sceneEmoji: '🧒🪑',
        sceneCaption: 'Pat sits down on a mat.',
        text: 'Pat sat on a mat.',
      },
      {
        sceneEmoji: '🚰🧒',
        sceneCaption: 'Pat sits next to a tap.',
        text: 'Pat sat at a tap.',
      },
      {
        sceneEmoji: '🍳🚰',
        sceneCaption: 'A tin pan sits by the tap.',
        text: 'A tin pan is at the tap.',
      },
      {
        sceneEmoji: '💧🍳',
        sceneCaption: 'Drips hit the tin pan!',
        text: 'Tap, tap, tap! A tin pan did tip.',
      },
      {
        sceneEmoji: '😴🧶',
        sceneCaption: 'Pat rests on the mat.',
        text: 'Pat is in a nap on a mat.',
      },
    ],
    quiz: [
      {
        id: 'b1-q1',
        question: 'Where did Pat sit at the start?',
        options: [
          { label: 'On a mat', icon: '🧶', isCorrect: true },
          { label: 'In a ship', icon: '🚢', isCorrect: false },
          { label: 'On a frog', icon: '🐸', isCorrect: false },
        ],
      },
      {
        id: 'b1-q2',
        question: 'What was next to the tap?',
        options: [
          { label: 'A red dog', icon: '🐶', isCorrect: false },
          { label: 'A tin pan', icon: '🍳', isCorrect: true },
          { label: 'A cake', icon: '🎂', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'book-2-phase2',
    cartridgeId: 'reader-red-dog',
    level: 2,
    levelLabel: 'Level 2 · Phase 2 CVC',
    title: 'The Red Dog',
    subtitle: 'Full Phase 2 sounds plus tricky words: the, to, no, go, into.',
    coverEmoji: '🐶',
    targetSounds: ['r', 'e', 'd', 'g', 'b', 'u', 'h', 'c', 'ck'],
    trickyPreview: ['the', 'to', 'no', 'go', 'into'],
    pages: [
      {
        sceneEmoji: '🐶☀️',
        sceneCaption: 'A big red dog runs in the sun.',
        text: 'The big red dog ran in the sun.',
      },
      {
        sceneEmoji: '🐶🪵',
        sceneCaption: 'The dog hops onto a big log.',
        text: 'The dog can hop on a big log.',
      },
      {
        sceneEmoji: '🐶🦆',
        sceneCaption: 'A duck is in the mud.',
        text: 'A duck is in the mud. No, dog, no!',
      },
      {
        sceneEmoji: '🐶🛁',
        sceneCaption: 'The dog hops into a tub.',
        text: 'Go into the tub, red dog!',
      },
      {
        sceneEmoji: '🐶🎩',
        sceneCaption: 'The dog sits on a bed with a hat.',
        text: 'The dog sat on a bed in a red hat.',
      },
    ],
    quiz: [
      {
        id: 'b2-q1',
        question: 'Who was in the mud?',
        options: [
          { label: 'A duck', icon: '🦆', isCorrect: true },
          { label: 'A cat', icon: '🐱', isCorrect: false },
          { label: 'A bee', icon: '🐝', isCorrect: false },
        ],
      },
      {
        id: 'b2-q2',
        question: 'Where did the red dog go to get clean?',
        options: [
          { label: 'Into a box', icon: '📦', isCorrect: false },
          { label: 'Into the tub', icon: '🛁', isCorrect: true },
          { label: 'Into a bus', icon: '🚌', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'book-3-phase3',
    cartridgeId: 'reader-ship-rain',
    level: 3,
    levelLabel: 'Level 3 · Phase 3 Digraphs',
    title: 'A Ship in the Rain',
    subtitle: 'Practise sh, ai, ee, oo, ar, oa, and igh in a sea adventure.',
    coverEmoji: '🚢',
    targetSounds: ['sh', 'ai', 'ee', 'oo', 'ar', 'oa', 'igh'],
    trickyPreview: ['the', 'we', 'see', 'to', 'he'],
    pages: [
      {
        sceneEmoji: '🚢🌧️',
        sceneCaption: 'A big ship sails in the rain.',
        text: 'We see a big ship in the rain.',
      },
      {
        sceneEmoji: '⛵🐟',
        sceneCaption: 'A fish swims past the boat.',
        text: 'A deep fish can zoom by the boat.',
      },
      {
        sceneEmoji: '🌙⭐',
        sceneCaption: 'It gets dark at night.',
        text: 'At night we see the moon and a bright star.',
      },
      {
        sceneEmoji: '🚢💡',
        sceneCaption: 'A bright light shines far away.',
        text: 'He can see a high light on the dark rock.',
      },
      {
        sceneEmoji: '⛵☀️',
        sceneCaption: 'The rain stops and the sun shines.',
        text: 'The rain is off! The ship is back at the dock.',
      },
    ],
    quiz: [
      {
        id: 'b3-q1',
        question: 'What was the weather when the ship set off?',
        options: [
          { label: 'Rain', icon: '🌧️', isCorrect: true },
          { label: 'Snow', icon: '❄️', isCorrect: false },
          { label: 'Hot wind', icon: '🌬️', isCorrect: false },
        ],
      },
      {
        id: 'b3-q2',
        question: 'What did they see in the sky at night?',
        options: [
          { label: 'A red bus', icon: '🚌', isCorrect: false },
          { label: 'The moon and a star', icon: '🌙', isCorrect: true },
          { label: 'A pink pig', icon: '🐷', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'book-4-phase4',
    cartridgeId: 'reader-frog-log',
    level: 4,
    levelLabel: 'Level 4 · Consonant Blends',
    title: 'The Frog on a Log',
    subtitle: 'Read adjacent consonants (fr, gr, st, mp, sw, cl) smoothly.',
    coverEmoji: '🐸',
    targetSounds: ['fr', 'gr', 'st', 'mp', 'sw', 'cl', 'nd'],
    trickyPreview: ['the', 'said', 'was', 'they', 'have'],
    pages: [
      {
        sceneEmoji: '🐸🪵',
        sceneCaption: 'A green frog sits on a damp log.',
        text: 'A green frog sat on a damp log by the pond.',
      },
      {
        sceneEmoji: '🐸💦',
        sceneCaption: 'The frog jumps with a splash!',
        text: 'The frog did a big jump and went splash in the pond.',
      },
      {
        sceneEmoji: '🦀🪨',
        sceneCaption: 'A small crab creeps past a rock.',
        text: 'A red crab crept past a flat rock on the sand.',
      },
      {
        sceneEmoji: '🐸🦀',
        sceneCaption: 'They swim and play together.',
        text: 'Stop and swim with me, said the frog.',
      },
      {
        sceneEmoji: '🐸🌟',
        sceneCaption: 'Best friends rest on the grass.',
        text: 'They had the best swim and sat on the soft grass.',
      },
    ],
    quiz: [
      {
        id: 'b4-q1',
        question: 'What colour was the frog?',
        options: [
          { label: 'Green', icon: '🐸', isCorrect: true },
          { label: 'Blue', icon: '🐳', isCorrect: false },
          { label: 'Pink', icon: '🐷', isCorrect: false },
        ],
      },
      {
        id: 'b4-q2',
        question: 'Who did the frog meet by the rock?',
        options: [
          { label: 'A duck', icon: '🦆', isCorrect: false },
          { label: 'A crab', icon: '🦀', isCorrect: true },
          { label: 'A dog', icon: '🐶', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'book-5-phase5',
    cartridgeId: 'reader-cake-lake',
    level: 5,
    levelLabel: 'Level 5 · Split Digraphs & Alternatives',
    title: 'The Cake by the Lake',
    subtitle: 'Master magic-e split digraphs (a-e, i-e, o-e) and ay, ea, ou.',
    coverEmoji: '🎂',
    targetSounds: ['a-e', 'i-e', 'o-e', 'ay', 'ea', 'ou'],
    trickyPreview: ['the', 'said', 'like', 'some', 'come'],
    pages: [
      {
        sceneEmoji: '🚴🏞️',
        sceneCaption: 'Jake rides his bike to the lake.',
        text: 'Jake rode his bike to the wide blue lake.',
      },
      {
        sceneEmoji: '🪁☁️',
        sceneCaption: 'A bright kite flies up near a cloud.',
        text: 'He had a bright kite up by a white cloud.',
      },
      {
        sceneEmoji: '🎂🧺',
        sceneCaption: 'Kate brings a sweet cake on a plate.',
        text: 'Come and eat some sweet cake, said Kate.',
      },
      {
        sceneEmoji: '😊🎂',
        sceneCaption: 'They share a treat by the water.',
        text: 'We like to play and eat cake by the lake.',
      },
      {
        sceneEmoji: '🏡🌅',
        sceneCaption: 'Time to ride home with a smile.',
        text: 'It was time to ride home with a big smile.',
      },
    ],
    quiz: [
      {
        id: 'b5-q1',
        question: 'How did Jake get to the lake?',
        options: [
          { label: 'On a bike', icon: '🚲', isCorrect: true },
          { label: 'On a ship', icon: '🚢', isCorrect: false },
          { label: 'In a van', icon: '🚐', isCorrect: false },
        ],
      },
      {
        id: 'b5-q2',
        question: 'What treat did Kate bring?',
        options: [
          { label: 'A bone', icon: '🦴', isCorrect: false },
          { label: 'A cake', icon: '🎂', isCorrect: true },
          { label: 'A fish', icon: '🐟', isCorrect: false },
        ],
      },
    ],
  },
];

// Explicit sound-button overrides for story words not already in DECODABLE_WORDS
const EXTRA_STORY_SEGMENTS: Record<string, SoundSegment[]> = {
  pat: [
    { letters: 'p', type: 'single', soundHint: 'puh' },
    { letters: 'a', type: 'single', soundHint: 'ah' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
  ],
  on: [
    { letters: 'o', type: 'single', soundHint: 'off' },
    { letters: 'n', type: 'single', soundHint: 'nnn' },
  ],
  at: [
    { letters: 'a', type: 'single', soundHint: 'ah' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
  ],
  is: [
    { letters: 'i', type: 'single', soundHint: 'ih' },
    { letters: 's', type: 'single', soundHint: 'zzz' },
  ],
  in: [
    { letters: 'i', type: 'single', soundHint: 'ih' },
    { letters: 'n', type: 'single', soundHint: 'nnn' },
  ],
  it: [
    { letters: 'i', type: 'single', soundHint: 'ih' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
  ],
  did: [
    { letters: 'd', type: 'single', soundHint: 'duh' },
    { letters: 'i', type: 'single', soundHint: 'ih' },
    { letters: 'd', type: 'single', soundHint: 'duh' },
  ],
  tip: [
    { letters: 't', type: 'single', soundHint: 'tuh' },
    { letters: 'i', type: 'single', soundHint: 'ih' },
    { letters: 'p', type: 'single', soundHint: 'puh' },
  ],
  a: [{ letters: 'a', type: 'single', soundHint: 'uh' }],
  big: [
    { letters: 'b', type: 'single', soundHint: 'buh' },
    { letters: 'i', type: 'single', soundHint: 'ih' },
    { letters: 'g', type: 'single', soundHint: 'guh' },
  ],
  red: [
    { letters: 'r', type: 'single', soundHint: 'rrr' },
    { letters: 'e', type: 'single', soundHint: 'eh' },
    { letters: 'd', type: 'single', soundHint: 'duh' },
  ],
  ran: [
    { letters: 'r', type: 'single', soundHint: 'rrr' },
    { letters: 'a', type: 'single', soundHint: 'ah' },
    { letters: 'n', type: 'single', soundHint: 'nnn' },
  ],
  can: [
    { letters: 'c', type: 'single', soundHint: 'kuh' },
    { letters: 'a', type: 'single', soundHint: 'ah' },
    { letters: 'n', type: 'single', soundHint: 'nnn' },
  ],
  hop: [
    { letters: 'h', type: 'single', soundHint: 'huh' },
    { letters: 'o', type: 'single', soundHint: 'off' },
    { letters: 'p', type: 'single', soundHint: 'puh' },
  ],
  log: [
    { letters: 'l', type: 'single', soundHint: 'lll' },
    { letters: 'o', type: 'single', soundHint: 'off' },
    { letters: 'g', type: 'single', soundHint: 'guh' },
  ],
  mud: [
    { letters: 'm', type: 'single', soundHint: 'mmm' },
    { letters: 'u', type: 'single', soundHint: 'uh' },
    { letters: 'd', type: 'single', soundHint: 'duh' },
  ],
  tub: [
    { letters: 't', type: 'single', soundHint: 'tuh' },
    { letters: 'u', type: 'single', soundHint: 'uh' },
    { letters: 'b', type: 'single', soundHint: 'buh' },
  ],
  bed: [
    { letters: 'b', type: 'single', soundHint: 'buh' },
    { letters: 'e', type: 'single', soundHint: 'eh' },
    { letters: 'd', type: 'single', soundHint: 'duh' },
  ],
  hat: [
    { letters: 'h', type: 'single', soundHint: 'huh' },
    { letters: 'a', type: 'single', soundHint: 'ah' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
  ],
  see: [
    { letters: 's', type: 'single', soundHint: 'ssss' },
    { letters: 'ee', type: 'digraph', soundHint: 'ee' },
  ],
  deep: [
    { letters: 'd', type: 'single', soundHint: 'duh' },
    { letters: 'ee', type: 'digraph', soundHint: 'ee' },
    { letters: 'p', type: 'single', soundHint: 'puh' },
  ],
  fish: [
    { letters: 'f', type: 'single', soundHint: 'fff' },
    { letters: 'i', type: 'single', soundHint: 'ih' },
    { letters: 'sh', type: 'digraph', soundHint: 'shhh' },
  ],
  zoom: [
    { letters: 'z', type: 'single', soundHint: 'zzz' },
    { letters: 'oo', type: 'digraph', soundHint: 'ooo' },
    { letters: 'm', type: 'single', soundHint: 'mmm' },
  ],
  by: [
    { letters: 'b', type: 'single', soundHint: 'buh' },
    { letters: 'y', type: 'single', soundHint: 'eye' },
  ],
  and: [
    { letters: 'a', type: 'single', soundHint: 'ah' },
    { letters: 'n', type: 'single', soundHint: 'nnn' },
    { letters: 'd', type: 'single', soundHint: 'duh' },
  ],
  bright: [
    { letters: 'b', type: 'single', soundHint: 'buh' },
    { letters: 'r', type: 'single', soundHint: 'rrr' },
    { letters: 'igh', type: 'trigraph', soundHint: 'eye' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
  ],
  high: [
    { letters: 'h', type: 'single', soundHint: 'huh' },
    { letters: 'igh', type: 'trigraph', soundHint: 'eye' },
  ],
  dark: [
    { letters: 'd', type: 'single', soundHint: 'duh' },
    { letters: 'ar', type: 'digraph', soundHint: 'ar' },
    { letters: 'k', type: 'single', soundHint: 'kuh' },
  ],
  rock: [
    { letters: 'r', type: 'single', soundHint: 'rrr' },
    { letters: 'o', type: 'single', soundHint: 'off' },
    { letters: 'ck', type: 'digraph', soundHint: 'kuh' },
  ],
  off: [
    { letters: 'o', type: 'single', soundHint: 'off' },
    { letters: 'ff', type: 'digraph', soundHint: 'fff' },
  ],
  back: [
    { letters: 'b', type: 'single', soundHint: 'buh' },
    { letters: 'a', type: 'single', soundHint: 'ah' },
    { letters: 'ck', type: 'digraph', soundHint: 'kuh' },
  ],
  dock: [
    { letters: 'd', type: 'single', soundHint: 'duh' },
    { letters: 'o', type: 'single', soundHint: 'off' },
    { letters: 'ck', type: 'digraph', soundHint: 'kuh' },
  ],
  green: [
    { letters: 'g', type: 'single', soundHint: 'guh' },
    { letters: 'r', type: 'single', soundHint: 'rrr' },
    { letters: 'ee', type: 'digraph', soundHint: 'ee' },
    { letters: 'n', type: 'single', soundHint: 'nnn' },
  ],
  damp: [
    { letters: 'd', type: 'single', soundHint: 'duh' },
    { letters: 'a', type: 'single', soundHint: 'ah' },
    { letters: 'm', type: 'single', soundHint: 'mmm' },
    { letters: 'p', type: 'single', soundHint: 'puh' },
  ],
  pond: [
    { letters: 'p', type: 'single', soundHint: 'puh' },
    { letters: 'o', type: 'single', soundHint: 'off' },
    { letters: 'n', type: 'single', soundHint: 'nnn' },
    { letters: 'd', type: 'single', soundHint: 'duh' },
  ],
  jump: [
    { letters: 'j', type: 'single', soundHint: 'juh' },
    { letters: 'u', type: 'single', soundHint: 'uh' },
    { letters: 'm', type: 'single', soundHint: 'mmm' },
    { letters: 'p', type: 'single', soundHint: 'puh' },
  ],
  went: [
    { letters: 'w', type: 'single', soundHint: 'wuh' },
    { letters: 'e', type: 'single', soundHint: 'eh' },
    { letters: 'n', type: 'single', soundHint: 'nnn' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
  ],
  splash: [
    { letters: 's', type: 'single', soundHint: 'ssss' },
    { letters: 'p', type: 'single', soundHint: 'puh' },
    { letters: 'l', type: 'single', soundHint: 'lll' },
    { letters: 'a', type: 'single', soundHint: 'ah' },
    { letters: 'sh', type: 'digraph', soundHint: 'shhh' },
  ],
  crab: [
    { letters: 'c', type: 'single', soundHint: 'kuh' },
    { letters: 'r', type: 'single', soundHint: 'rrr' },
    { letters: 'a', type: 'single', soundHint: 'ah' },
    { letters: 'b', type: 'single', soundHint: 'buh' },
  ],
  crept: [
    { letters: 'c', type: 'single', soundHint: 'kuh' },
    { letters: 'r', type: 'single', soundHint: 'rrr' },
    { letters: 'e', type: 'single', soundHint: 'eh' },
    { letters: 'p', type: 'single', soundHint: 'puh' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
  ],
  past: [
    { letters: 'p', type: 'single', soundHint: 'puh' },
    { letters: 'a', type: 'single', soundHint: 'ah' },
    { letters: 's', type: 'single', soundHint: 'ssss' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
  ],
  flat: [
    { letters: 'f', type: 'single', soundHint: 'fff' },
    { letters: 'l', type: 'single', soundHint: 'lll' },
    { letters: 'a', type: 'single', soundHint: 'ah' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
  ],
  sand: [
    { letters: 's', type: 'single', soundHint: 'ssss' },
    { letters: 'a', type: 'single', soundHint: 'ah' },
    { letters: 'n', type: 'single', soundHint: 'nnn' },
    { letters: 'd', type: 'single', soundHint: 'duh' },
  ],
  stop: [
    { letters: 's', type: 'single', soundHint: 'ssss' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
    { letters: 'o', type: 'single', soundHint: 'off' },
    { letters: 'p', type: 'single', soundHint: 'puh' },
  ],
  swim: [
    { letters: 's', type: 'single', soundHint: 'ssss' },
    { letters: 'w', type: 'single', soundHint: 'wuh' },
    { letters: 'i', type: 'single', soundHint: 'ih' },
    { letters: 'm', type: 'single', soundHint: 'mmm' },
  ],
  with: [
    { letters: 'w', type: 'single', soundHint: 'wuh' },
    { letters: 'i', type: 'single', soundHint: 'ih' },
    { letters: 'th', type: 'digraph', soundHint: 'thuh' },
  ],
  had: [
    { letters: 'h', type: 'single', soundHint: 'huh' },
    { letters: 'a', type: 'single', soundHint: 'ah' },
    { letters: 'd', type: 'single', soundHint: 'duh' },
  ],
  best: [
    { letters: 'b', type: 'single', soundHint: 'buh' },
    { letters: 'e', type: 'single', soundHint: 'eh' },
    { letters: 's', type: 'single', soundHint: 'ssss' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
  ],
  soft: [
    { letters: 's', type: 'single', soundHint: 'ssss' },
    { letters: 'o', type: 'single', soundHint: 'off' },
    { letters: 'f', type: 'single', soundHint: 'fff' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
  ],
  grass: [
    { letters: 'g', type: 'single', soundHint: 'guh' },
    { letters: 'r', type: 'single', soundHint: 'rrr' },
    { letters: 'a', type: 'single', soundHint: 'ah' },
    { letters: 'ss', type: 'digraph', soundHint: 'ssss' },
  ],
  jake: [
    { letters: 'j', type: 'single', soundHint: 'juh' },
    { letters: 'a-e', type: 'split', soundHint: 'ay' },
    { letters: 'k', type: 'single', soundHint: 'kuh' },
  ],
  kate: [
    { letters: 'k', type: 'single', soundHint: 'kuh' },
    { letters: 'a-e', type: 'split', soundHint: 'ay' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
  ],
  rode: [
    { letters: 'r', type: 'single', soundHint: 'rrr' },
    { letters: 'o-e', type: 'split', soundHint: 'oh' },
    { letters: 'd', type: 'single', soundHint: 'duh' },
  ],
  ride: [
    { letters: 'r', type: 'single', soundHint: 'rrr' },
    { letters: 'i-e', type: 'split', soundHint: 'eye' },
    { letters: 'd', type: 'single', soundHint: 'duh' },
  ],
  his: [
    { letters: 'h', type: 'single', soundHint: 'huh' },
    { letters: 'i', type: 'single', soundHint: 'ih' },
    { letters: 's', type: 'single', soundHint: 'zzz' },
  ],
  wide: [
    { letters: 'w', type: 'single', soundHint: 'wuh' },
    { letters: 'i-e', type: 'split', soundHint: 'eye' },
    { letters: 'd', type: 'single', soundHint: 'duh' },
  ],
  blue: [
    { letters: 'b', type: 'single', soundHint: 'buh' },
    { letters: 'l', type: 'single', soundHint: 'lll' },
    { letters: 'ue', type: 'digraph', soundHint: 'ooo' },
  ],
  lake: [
    { letters: 'l', type: 'single', soundHint: 'lll' },
    { letters: 'a-e', type: 'split', soundHint: 'ay' },
    { letters: 'k', type: 'single', soundHint: 'kuh' },
  ],
  kite: [
    { letters: 'k', type: 'single', soundHint: 'kuh' },
    { letters: 'i-e', type: 'split', soundHint: 'eye' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
  ],
  up: [
    { letters: 'u', type: 'single', soundHint: 'uh' },
    { letters: 'p', type: 'single', soundHint: 'puh' },
  ],
  white: [
    { letters: 'wh', type: 'digraph', soundHint: 'wuh' },
    { letters: 'i-e', type: 'split', soundHint: 'eye' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
  ],
  eat: [
    { letters: 'ea', type: 'digraph', soundHint: 'ee' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
  ],
  sweet: [
    { letters: 's', type: 'single', soundHint: 'ssss' },
    { letters: 'w', type: 'single', soundHint: 'wuh' },
    { letters: 'ee', type: 'digraph', soundHint: 'ee' },
    { letters: 't', type: 'single', soundHint: 'tuh' },
  ],
  time: [
    { letters: 't', type: 'single', soundHint: 'tuh' },
    { letters: 'i-e', type: 'split', soundHint: 'eye' },
    { letters: 'm', type: 'single', soundHint: 'mmm' },
  ],
  home: [
    { letters: 'h', type: 'single', soundHint: 'huh' },
    { letters: 'o-e', type: 'split', soundHint: 'oh' },
    { letters: 'm', type: 'single', soundHint: 'mmm' },
  ],
  smile: [
    { letters: 's', type: 'single', soundHint: 'ssss' },
    { letters: 'm', type: 'single', soundHint: 'mmm' },
    { letters: 'i-e', type: 'split', soundHint: 'eye' },
    { letters: 'l', type: 'single', soundHint: 'lll' },
  ],
};

const TRICKY_MAP = new Map<string, TrickyWord>(
  TRICKY_WORDS.map((tw) => [tw.word.toLowerCase(), tw])
);

const DECODABLE_MAP = new Map<string, DecodableWord>(
  ALL_DECODABLE_WORDS.map((dw) => [dw.word.toLowerCase(), dw])
);

const TRIGRAPHS = new Set(['igh', 'ear', 'air']);
const DIGRAPHS = new Set([
  'ck', 'ss', 'll', 'ff', 'zz', 'qu', 'ch', 'sh', 'th', 'ng',
  'ai', 'ee', 'oa', 'oo', 'ar', 'or', 'ur', 'ow', 'oi', 'er',
  'ay', 'ou', 'ie', 'ea', 'oy', 'ir', 'ue', 'aw', 'wh', 'ph',
]);

/**
 * Automatically decodes ANY word in a mini-book sentence into either:
 * 1) A Tricky "Heart" Word with explanation, or
 * 2) Exact DfE sound-button segments (• single, — digraph/trigraph, or split-digraph).
 */
export function decodeWordForReader(rawWord: string): DecodedReaderWord {
  const cleanWord = rawWord.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '');
  const lower = cleanWord.toLowerCase();

  // 1. Check Tricky Words first (except single-letter "a" which is handled cleanly)
  const tricky = TRICKY_MAP.get(lower);
  if (tricky) {
    return { kind: 'tricky', rawWord, cleanWord, tricky };
  }

  // 2. Check curated DECODABLE_WORDS + SATPIN starters
  const curated = DECODABLE_MAP.get(lower);
  if (curated) {
    return {
      kind: 'decodable',
      rawWord,
      cleanWord,
      segments: curated.segments,
      icon: curated.icon,
    };
  }

  // 3. Check explicit story vocabulary
  if (EXTRA_STORY_SEGMENTS[lower]) {
    return {
      kind: 'decodable',
      rawWord,
      cleanWord,
      segments: EXTRA_STORY_SEGMENTS[lower],
    };
  }

  // 4. Fallback greedy grapheme tokenizer (never fails on any English word)
  const segments: SoundSegment[] = [];
  let i = 0;
  while (i < lower.length) {
    const tri = lower.slice(i, i + 3);
    const di = lower.slice(i, i + 2);
    if (tri.length === 3 && TRIGRAPHS.has(tri)) {
      segments.push({ letters: tri, type: 'trigraph', soundHint: getPhonemeSpokenText(tri) });
      i += 3;
    } else if (di.length === 2 && DIGRAPHS.has(di)) {
      segments.push({ letters: di, type: 'digraph', soundHint: getPhonemeSpokenText(di) });
      i += 2;
    } else {
      const ch = lower[i];
      segments.push({ letters: ch, type: 'single', soundHint: getPhonemeSpokenText(ch) });
      i += 1;
    }
  }

  return { kind: 'decodable', rawWord, cleanWord, segments };
}
