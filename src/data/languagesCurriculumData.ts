// src/data/languagesCurriculumData.ts
/**
 * MFL & Polyglot Curriculum Data
 * Systematic phonics soundboards, verb conjugation paradigms,
 * and Latin-to-Romance-to-English etymology cognate trees.
 */

export interface LanguagePhoneme {
  id: string;
  lang: 'es' | 'fr' | 'la';
  langName: string;
  flag: string;
  grapheme: string;
  ipa: string;
  soundExample: string;
  audioText: string;
  mouthTip: string;
  englishContrast: string;
  category: 'vowel' | 'consonant' | 'nasal' | 'diphthong' | 'special';
}

export interface VerbConjugation {
  infinitive: string;
  meaning: string;
  lang: 'es' | 'fr' | 'la';
  langName: string;
  flag: string;
  stem: string;
  conjugationGroup: string;
  forms: {
    person: string;
    pronoun: string;
    suffix: string;
    fullWord: string;
    english: string;
    notes?: string;
  }[];
  proDropRule: string;
}

export interface EtymologyCognate {
  latinRoot: string;
  rootMeaning: string;
  category: string;
  icon: string;
  latinWord: string;
  spanishWord: string;
  frenchWord: string;
  englishAcademicWords: string[];
  historicalNote: string;
}

export const LANGUAGE_PHONEMES: LanguagePhoneme[] = [
  // ==================== SPANISH ====================
  {
    id: 'es-a',
    lang: 'es',
    langName: 'Spanish',
    flag: '🇪🇸',
    grapheme: 'a',
    ipa: '/a/',
    soundExample: 'casa (house)',
    audioText: 'casa',
    mouthTip: 'Open mouth wide and relaxed. Pure vowel with zero glide.',
    englishContrast: 'Unlike English "cat" or "car", Spanish /a/ is always bright, crisp, and unchanging.',
    category: 'vowel',
  },
  {
    id: 'es-e',
    lang: 'es',
    langName: 'Spanish',
    flag: '🇪🇸',
    grapheme: 'e',
    ipa: '/e/',
    soundExample: 'mesa (table)',
    audioText: 'mesa',
    mouthTip: 'Smile gently with relaxed jaw. Crisp short "eh".',
    englishContrast: 'Never turns into the English diphthong "ay" (no trailing "y" sound).',
    category: 'vowel',
  },
  {
    id: 'es-i',
    lang: 'es',
    langName: 'Spanish',
    flag: '🇪🇸',
    grapheme: 'i',
    ipa: '/i/',
    soundExample: 'libro (book)',
    audioText: 'libro',
    mouthTip: 'Wide flat smile, tongue close to palate.',
    englishContrast: 'Pure "ee" sound like "see", never the relaxed short "ih" of English "pin".',
    category: 'vowel',
  },
  {
    id: 'es-o',
    lang: 'es',
    langName: 'Spanish',
    flag: '🇪🇸',
    grapheme: 'o',
    ipa: '/o/',
    soundExample: 'sol (sun)',
    audioText: 'sol',
    mouthTip: 'Lips rounded into a tight oval without moving your lips as you say it.',
    englishContrast: 'English "oh" glides into "oo" (go -> go-oo); Spanish /o/ stays perfectly stationary.',
    category: 'vowel',
  },
  {
    id: 'es-u',
    lang: 'es',
    langName: 'Spanish',
    flag: '🇪🇸',
    grapheme: 'u',
    ipa: '/u/',
    soundExample: 'luna (moon)',
    audioText: 'luna',
    mouthTip: 'Lips pursed tightly forward into a small circle.',
    englishContrast: 'Pure "oo" sound. Note: silent after "q" (queso) and in "gu" before e/i (guitarra).',
    category: 'vowel',
  },
  {
    id: 'es-rr',
    lang: 'es',
    langName: 'Spanish',
    flag: '🇪🇸',
    grapheme: 'rr / r-',
    ipa: '/r/',
    soundExample: 'perro (dog)',
    audioText: 'perro',
    mouthTip: 'Relaxed tongue tip vibrates against the upper alveolar ridge (alveolar trill).',
    englishContrast: 'Distinct from single "r" (tap: pero = but vs perro = dog!). Starts words with full trill.',
    category: 'consonant',
  },
  {
    id: 'es-nn',
    lang: 'es',
    langName: 'Spanish',
    flag: '🇪🇸',
    grapheme: 'ñ',
    ipa: '/ɲ/',
    soundExample: 'niño (child)',
    audioText: 'niño',
    mouthTip: 'Blade of tongue presses broad against roof of mouth with nasal airflow.',
    englishContrast: 'Similar to "ny" in English "canyon" or "onion", but treated as its own independent statutory letter.',
    category: 'special',
  },
  {
    id: 'es-ll',
    lang: 'es',
    langName: 'Spanish',
    flag: '🇪🇸',
    grapheme: 'll',
    ipa: '/ʝ/ or /ʎ/',
    soundExample: 'lluvia (rain)',
    audioText: 'lluvia',
    mouthTip: 'Soft palatal friction like English "y" in yellow.',
    englishContrast: 'Never sounds like English double "L" (not "l-l"). Calle sounds like "cah-yeh".',
    category: 'consonant',
  },
  {
    id: 'es-j',
    lang: 'es',
    langName: 'Spanish',
    flag: '🇪🇸',
    grapheme: 'j / ge, gi',
    ipa: '/x/',
    soundExample: 'rojo (red)',
    audioText: 'rojo',
    mouthTip: 'Back of tongue raises toward velum creating friction, like a strong Scottish "loch".',
    englishContrast: 'Never sounds like English "j" in jump. "Jardín" begins with an aspirated throat sound.',
    category: 'consonant',
  },

  // ==================== FRENCH ====================
  {
    id: 'fr-u',
    lang: 'fr',
    langName: 'French',
    flag: '🇫🇷',
    grapheme: 'u',
    ipa: '/y/',
    soundExample: 'tu (you)',
    audioText: 'tu',
    mouthTip: 'Say "ee" with your tongue, but round your lips into a tight circle as if whistling.',
    englishContrast: 'Does not exist in standard English. Crucial contrast: "tu" (/y/ you) vs "tout" (/u/ all).',
    category: 'vowel',
  },
  {
    id: 'fr-on',
    lang: 'fr',
    langName: 'French',
    flag: '🇫🇷',
    grapheme: 'on / om',
    ipa: '/ɔ̃/',
    soundExample: 'bon (good)',
    audioText: 'bon',
    mouthTip: 'Round lips into "o" and drop your soft palate so air flows through your nose without saying "n".',
    englishContrast: 'Pure nasal vowel. Do not pronounce the letter "n" at the end!',
    category: 'nasal',
  },
  {
    id: 'fr-an',
    lang: 'fr',
    langName: 'French',
    flag: '🇫🇷',
    grapheme: 'an / en',
    ipa: '/ɑ̃/',
    soundExample: 'enfant (child)',
    audioText: 'enfant',
    mouthTip: 'Open mouth into broad "ah", air resonates in nasal cavity.',
    englishContrast: 'Silent final "n" and "t" in "enfant" — two pure nasal vowel beats!',
    category: 'nasal',
  },
  {
    id: 'fr-in',
    lang: 'fr',
    langName: 'French',
    flag: '🇫🇷',
    grapheme: 'in / ain / ein',
    ipa: '/ɛ̃/',
    soundExample: 'pain (bread)',
    audioText: 'pain',
    mouthTip: 'Smile saying "eh" with air diverted through nasal cavity.',
    englishContrast: '"Pain" sounds like "peh(n)" with nasal tone, completely distinct from English bread.',
    category: 'nasal',
  },
  {
    id: 'fr-r',
    lang: 'fr',
    langName: 'French',
    flag: '🇫🇷',
    grapheme: 'r',
    ipa: '/ʁ/',
    soundExample: 'rouge (red)',
    audioText: 'rouge',
    mouthTip: 'Uvula vibrates gently against back of tongue (uvular fricative).',
    englishContrast: 'Formed in the throat, unlike English "r" which uses the curled tongue tip.',
    category: 'consonant',
  },
  {
    id: 'fr-silent',
    lang: 'fr',
    langName: 'French',
    flag: '🇫🇷',
    grapheme: '-e, -s, -t, -d',
    ipa: 'silent',
    soundExample: 'parlent (they speak)',
    audioText: 'parlent',
    mouthTip: 'Consonants at the end of French words are generally silent unless followed by a vowel (liaison).',
    englishContrast: 'The third person plural ending "-ent" in verbs is 100% silent! "Ils parlent" sounds identical to "il parle".',
    category: 'special',
  },

  // ==================== LATIN ====================
  {
    id: 'la-v',
    lang: 'la',
    langName: 'Latin',
    flag: '🏛️',
    grapheme: 'v / u',
    ipa: '/w/ (Class.) / /v/ (Eccl.)',
    soundExample: 'veni, vidi, vici',
    audioText: 'veni vidi vici',
    mouthTip: 'In Classical Latin, V is pronounced like English "W" (Weni, Widi, Wici). In Ecclesiastical Church Latin, pronounced /v/.',
    englishContrast: 'Romans used the letter V for both the vowel U and the consonant W sound.',
    category: 'consonant',
  },
  {
    id: 'la-c',
    lang: 'la',
    langName: 'Latin',
    flag: '🏛️',
    grapheme: 'c',
    ipa: '/k/ (Class.) / /tʃ/ (Eccl.)',
    soundExample: 'Caesar (Kaiser / Chay-zar)',
    audioText: 'Caesar',
    mouthTip: 'Classical Latin C was ALWAYS hard /k/ (even before e/i: Cicero = Kikero). Church Latin softens before e/i into "ch".',
    englishContrast: 'Source of German "Kaiser" and Russian "Tsar" from Classical hard /k/ pronunciation.',
    category: 'consonant',
  },
  {
    id: 'la-ae',
    lang: 'la',
    langName: 'Latin',
    flag: '🏛️',
    grapheme: 'ae',
    ipa: '/aɪ/ (Class.) / /e/ (Eccl.)',
    soundExample: 'rosa (rose) -> rosae',
    audioText: 'rosae',
    mouthTip: 'Diphthong: Classical Latin glides from "ah" to "ee" (sounding like "eye"). Church Latin sounds like "ay".',
    englishContrast: 'Diphthong indicating 1st declension genitive and nominative plural.',
    category: 'diphthong',
  },
];

export const VERB_CONJUGATIONS: VerbConjugation[] = [
  // SPANISH: Hablar
  {
    infinitive: 'hablar',
    meaning: 'to speak',
    lang: 'es',
    langName: 'Spanish',
    flag: '🇪🇸',
    stem: 'habl-',
    conjugationGroup: 'Regular -AR Verb (Present Indicative)',
    proDropRule: 'Because each suffix (-o, -as, -a, -amos, -áis, -an) is unique, Spanish is a "pro-drop" language: you do not need to say "yo"; "hablo" already means "I speak"!',
    forms: [
      { person: '1st Sing.', pronoun: 'yo', suffix: '-o', fullWord: 'hablo', english: 'I speak' },
      { person: '2nd Sing.', pronoun: 'tú', suffix: '-as', fullWord: 'hablas', english: 'you speak (informal)' },
      { person: '3rd Sing.', pronoun: 'él / ella / usted', suffix: '-a', fullWord: 'habla', english: 'he / she speaks' },
      { person: '1st Plur.', pronoun: 'nosotros', suffix: '-amos', fullWord: 'hablamos', english: 'we speak' },
      { person: '2nd Plur.', pronoun: 'vosotros', suffix: '-áis', fullWord: 'habláis', english: 'you all speak (Spain)' },
      { person: '3rd Plur.', pronoun: 'ellos / ustedes', suffix: '-an', fullWord: 'hablan', english: 'they speak' },
    ],
  },

  // SPANISH: Comer
  {
    infinitive: 'comer',
    meaning: 'to eat',
    lang: 'es',
    langName: 'Spanish',
    flag: '🇪🇸',
    stem: 'com-',
    conjugationGroup: 'Regular -ER Verb (Present Indicative)',
    proDropRule: 'Regular -ER verbs change the thematic vowel from "a" to "e": -o, -es, -e, -emos, -éis, -en.',
    forms: [
      { person: '1st Sing.', pronoun: 'yo', suffix: '-o', fullWord: 'como', english: 'I eat' },
      { person: '2nd Sing.', pronoun: 'tú', suffix: '-es', fullWord: 'comes', english: 'you eat' },
      { person: '3rd Sing.', pronoun: 'él / ella', suffix: '-e', fullWord: 'come', english: 'he / she eats' },
      { person: '1st Plur.', pronoun: 'nosotros', suffix: '-emos', fullWord: 'comemos', english: 'we eat' },
      { person: '2nd Plur.', pronoun: 'vosotros', suffix: '-éis', fullWord: 'coméis', english: 'you all eat' },
      { person: '3rd Plur.', pronoun: 'ellos', suffix: '-en', fullWord: 'comen', english: 'they eat' },
    ],
  },

  // FRENCH: Parler
  {
    infinitive: 'parler',
    meaning: 'to speak',
    lang: 'fr',
    langName: 'French',
    flag: '🇫🇷',
    stem: 'parl-',
    conjugationGroup: 'Regular 1st Group -ER Verb',
    proDropRule: 'Unlike Spanish, French CANNOT drop pronouns because "parle", "parles", and "parlent" all sound identical in speech (/paʁl/)! Pronouns are mandatory.',
    forms: [
      { person: '1st Sing.', pronoun: 'je', suffix: '-e', fullWord: 'je parle', english: 'I speak', notes: 'Silent -e' },
      { person: '2nd Sing.', pronoun: 'tu', suffix: '-es', fullWord: 'tu parles', english: 'you speak', notes: 'Silent -es' },
      { person: '3rd Sing.', pronoun: 'il / elle', suffix: '-e', fullWord: 'il parle', english: 'he / she speaks', notes: 'Silent -e' },
      { person: '1st Plur.', pronoun: 'nous', suffix: '-ons', fullWord: 'nous parlons', english: 'we speak', notes: 'Nasal -ons' },
      { person: '2nd Plur.', pronoun: 'vous', suffix: '-ez', fullWord: 'vous parlez', english: 'you all speak', notes: 'Sounds like /e/ (ay)' },
      { person: '3rd Plur.', pronoun: 'ils / elles', suffix: '-ent', fullWord: 'ils parlent', english: 'they speak', notes: '-ent is completely silent!' },
    ],
  },

  // LATIN: Amare
  {
    infinitive: 'amāre',
    meaning: 'to love',
    lang: 'la',
    langName: 'Latin',
    flag: '🏛️',
    stem: 'am-',
    conjugationGroup: '1st Conjugation (-ARE)',
    proDropRule: 'Classical and Ecclesiastical Latin are intensely pro-drop. The personal endings (-o, -as, -at, -amus, -atis, -ant) carry all person, number, and tense information.',
    forms: [
      { person: '1st Sing.', pronoun: '(ego)', suffix: '-o', fullWord: 'amo', english: 'I love (source of "amiable")', notes: 'Latin root of "amour"' },
      { person: '2nd Sing.', pronoun: '(tu)', suffix: '-as', fullWord: 'amas', english: 'you love' },
      { person: '3rd Sing.', pronoun: '(is / ea)', suffix: '-at', fullWord: 'amat', english: 'he / she loves' },
      { person: '1st Plur.', pronoun: '(nos)', suffix: '-amus', fullWord: 'amamus', english: 'we love' },
      { person: '2nd Plur.', pronoun: '(vos)', suffix: '-atis', fullWord: 'amatis', english: 'you all love' },
      { person: '3rd Plur.', pronoun: '(ei / eae)', suffix: '-ant', fullWord: 'amant', english: 'they love' },
    ],
  },
];

export const ETYMOLOGY_COGNATES: EtymologyCognate[] = [
  {
    latinRoot: 'scribere / scriptus',
    rootMeaning: 'to write',
    category: 'Literature & Law',
    icon: '✍️',
    latinWord: 'scribo (I write)',
    spanishWord: 'escribir (to write)',
    frenchWord: 'écrire (to write)',
    englishAcademicWords: ['script', 'describe', 'prescription', 'inscription', 'manuscript', 'scribe'],
    historicalNote: 'Norman French and Renaissance scholars imported hundreds of Latin legal and writing terms directly into English grammar.',
  },
  {
    latinRoot: 'amare / amicus',
    rootMeaning: 'to love / friend',
    category: 'Human Relationships',
    icon: '❤️',
    latinWord: 'amicus (friend)',
    spanishWord: 'amigo (friend)',
    frenchWord: 'ami (friend)',
    englishAcademicWords: ['amiable', 'amicable', 'amorous', 'amateur (one who loves)'],
    historicalNote: 'An amateur originally meant a connoisseur who pursues an art out of pure love, not for financial gain.',
  },
  {
    latinRoot: 'corpus / corporis',
    rootMeaning: 'body',
    category: 'Science & Society',
    icon: '🏛️',
    latinWord: 'corpus (body)',
    spanishWord: 'cuerpo (body)',
    frenchWord: 'corps (body)',
    englishAcademicWords: ['corporation (legal body)', 'corpse', 'incorporate', 'corpus (body of texts)', 'corps'],
    historicalNote: 'In Catholic theology, "Corpus Christi" celebrates the Body of Christ. In civics, a "corporation" is treated as an artificial body under law.',
  },
  {
    latinRoot: 'lux / lucis',
    rootMeaning: 'light',
    category: 'Optics & Faith',
    icon: '💡',
    latinWord: 'lux (light)',
    spanishWord: 'luz (light)',
    frenchWord: 'lumière (light)',
    englishAcademicWords: ['lucid', 'illuminate', 'translucent', 'luminescence', 'elucidate'],
    historicalNote: 'The Gospel of John 1:5 in Latin: "Et lux in tenebris lucet" — And the light shines in the darkness.',
  },
  {
    latinRoot: 'aqua / aquae',
    rootMeaning: 'water',
    category: 'Geography & Science',
    icon: '💧',
    latinWord: 'aqua (water)',
    spanishWord: 'agua (water)',
    frenchWord: 'eau (water)',
    englishAcademicWords: ['aquarium', 'aqueduct', 'aquatic', 'aqueous', 'aquifer'],
    historicalNote: 'Roman engineering spread "aqueducts" (water conduits: aqua + ducere, to lead) across the European continent.',
  },
  {
    latinRoot: 'pater / patris',
    rootMeaning: 'father',
    category: 'Society & Heritage',
    icon: '👑',
    latinWord: 'pater (father)',
    spanishWord: 'padre (father)',
    frenchWord: 'père (father)',
    englishAcademicWords: ['paternal', 'patriot', 'patron', 'patriarch', 'patronise'],
    historicalNote: 'A "patron saint" acts with fatherly protection over a parish, school, or craft guild.',
  },
];
