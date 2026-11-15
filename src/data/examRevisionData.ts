// src/data/examRevisionData.ts
// UK National Curriculum & GCSE (AQA / Edexcel / OCR) Exam Prep, Mark Schemes,
// Active-Recall Flashcards & Audio Dictation Decks (100% Offline, Lazy-Loaded)

import { ALL_CURRICULUM_ROUTES, type CurriculumRouteNode } from '../curriculum/curriculumMesh';

export type ExamBoardId = 'AQA' | 'Edexcel' | 'OCR';

export interface CommandWordGuide {
  word: string;
  meaning: string;
  howToScoreFullMarks: string;
  starterPhrase: string;
}

export interface MarkSchemePoint {
  id: string;
  markLabel: string;
  criterion: string;
  keywords: string[];
}

export interface GcseExamQuestion {
  id: string;
  topicId: string;
  subject: string;
  topicTitle: string;
  boards: ExamBoardId[];
  paperHint: string;
  tier: 'Higher & Foundation' | 'Higher' | 'Core GCSE';
  marks: number;
  commandWord: string;
  prompt: string;
  contextNote?: string;
  sentenceStarter: string;
  markPoints: MarkSchemePoint[];
  modelAnswer: string;
  examinerTip: string;
  simPresetId?: string;
}

export interface RevisionFlashcard {
  id: string;
  deckId: string;
  subject: string;
  stage: string;
  boards?: ExamBoardId[];
  front: string;
  back: string;
  clue?: string;
  speechLang?: string;
}

export interface DictationItem {
  id: string;
  deckId: string;
  deckTitle: string;
  subject: string;
  stage: string;
  word: string;
  acceptableVariants?: string[];
  spokenSentence: string;
  clue: string;
  speechLang: string;
}

export const UK_COMMAND_WORDS: CommandWordGuide[] = [
  {
    word: 'State / Give',
    meaning: 'Recall a single fact, name, or value concisely—no explanation needed.',
    howToScoreFullMarks: 'Write a short, exact phrase or number with units. One point per mark.',
    starterPhrase: 'The value / name is...',
  },
  {
    word: 'Describe',
    meaning: 'Say what you see happening, step by step, or give the trend shown in data.',
    howToScoreFullMarks: 'Follow the pattern from start to finish and quote figures if a graph or table is given.',
    starterPhrase: 'As [X] increases, [Y]...',
  },
  {
    word: 'Explain',
    meaning: 'Give scientific or textual reasons why something happens—cause and effect.',
    howToScoreFullMarks: 'Link every statement with "because", "so that", or "which causes...". Describing alone caps your marks.',
    starterPhrase: 'This happens because..., which causes...',
  },
  {
    word: 'Compare',
    meaning: 'Give both similarities AND differences between two things.',
    howToScoreFullMarks: 'Use linking words like "whereas", "both", and "in contrast" in every sentence—do not just list one then the other.',
    starterPhrase: 'Both have..., whereas [A] has... while [B] has...',
  },
  {
    word: 'Evaluate',
    meaning: 'Weigh up arguments for and against, then reach a justified conclusion.',
    howToScoreFullMarks: 'Give clear points on both sides (or Catholic/other views in RE), and end with "Overall, I conclude..." backed by a reason.',
    starterPhrase: 'On the one hand... However... Overall, the strongest argument is...',
  },
  {
    word: 'Calculate',
    meaning: 'Work out a numerical answer using a formula or data from the question.',
    howToScoreFullMarks: 'Write the formula, show substitution, show your final value to the requested significant figures, and include units.',
    starterPhrase: 'Formula: ... | Substitute: ... | Answer + unit: ...',
  },
];

export const GCSE_EXAM_QUESTIONS: GcseExamQuestion[] = [
  {
    id: 'exam-phys-newtons-second',
    topicId: 'newtonian-mechanics',
    subject: 'Physics',
    topicTitle: "Newton's Second Law & Braking Forces",
    boards: ['AQA', 'Edexcel', 'OCR'],
    paperHint: 'Paper 2 • Forces & Motion',
    tier: 'Higher & Foundation',
    marks: 6,
    commandWord: 'Explain',
    prompt:
      'A car of mass 1,200 kg travels at 20 m/s before braking sharply to a halt on a wet road. Explain how Newton’s Second Law (F = ma) applies to the car’s deceleration, and explain two factors that increase the total stopping distance on a wet road.',
    contextNote: '6 marks: aim for 2 marks on F = ma & deceleration, 2 marks on thinking distance, 2 marks on wet-road braking distance.',
    sentenceStarter:
      'According to Newton’s Second Law (F = ma), a resultant backwards braking force causes negative acceleration (deceleration) because... On a wet road, water reduces friction between tyres and road, so...',
    markPoints: [
      {
        id: 'm1',
        markLabel: 'Mark 1',
        criterion: 'States Newton’s 2nd Law links resultant force, mass, and deceleration (F = ma or a = F/m).',
        keywords: ['resultant', 'f = ma', 'f=ma', 'a = f', 'mass', 'force'],
      },
      {
        id: 'm2',
        markLabel: 'Mark 2',
        criterion: 'Explains a braking/opposing force produces negative acceleration (or larger mass/speed requires larger braking force).',
        keywords: ['decelerat', 'oppos', 'backwards', 'negative acceleration', 'slows down'],
      },
      {
        id: 'm3',
        markLabel: 'Mark 3',
        criterion: 'Defines stopping distance = thinking distance + braking distance.',
        keywords: ['thinking', 'braking', 'stopping distance'],
      },
      {
        id: 'm4',
        markLabel: 'Mark 4',
        criterion: 'Identifies wet road reduces friction / grip between tyres and road surface.',
        keywords: ['friction', 'grip', 'wet', 'water', 'lubricat', 'skid'],
      },
      {
        id: 'm5',
        markLabel: 'Mark 5',
        criterion: 'Explains lower friction means a smaller maximum braking force, giving smaller deceleration and longer braking distance.',
        keywords: ['smaller braking force', 'less friction', 'longer braking', 'takes longer', 'further'],
      },
      {
        id: 'm6',
        markLabel: 'Mark 6',
        criterion: 'Identifies a second factor (e.g. higher initial speed, worn tyres/brakes, or longer reaction time / tiredness / distractions).',
        keywords: ['reaction', 'tired', 'distract', 'alcohol', 'speed', 'worn tyres', 'brakes'],
      },
    ],
    modelAnswer:
      'Total stopping distance equals thinking distance plus braking distance. By Newton’s Second Law (F = ma, so a = F / m), a resultant braking force acting opposite to motion causes the car to decelerate. On a wet road, a layer of water reduces friction between the tyres and the road surface. This lowers the maximum braking force available, reducing the rate of deceleration and increasing braking distance. Stopping distance also increases if the driver has a slower reaction time (e.g. due to tiredness or distractions), increasing thinking distance, or if initial speed or worn tyres are present.',
    examinerTip:
      'Examiners award zero cause-and-effect marks if you only list "wet road" without stating it reduces friction between tyres and tarmac.',
    simPresetId: 'velocity',
  },
  {
    id: 'exam-phys-half-life',
    topicId: 'radioactivity',
    subject: 'Physics',
    topicTitle: 'Radioactivity, Half-Life & Medical Tracers',
    boards: ['AQA', 'Edexcel', 'OCR'],
    paperHint: 'Paper 1 • Atomic Structure & Radiation',
    tier: 'Higher & Foundation',
    marks: 6,
    commandWord: 'Compare & Evaluate',
    prompt:
      'A hospital needs a radioactive isotope to inject into a patient as a medical tracer for a 4-hour organ scan. Compare alpha and gamma radiation, and evaluate which type of emitter and half-life would be safest and most effective.',
    sentenceStarter:
      'Gamma radiation should be chosen rather than alpha because... For a 4-hour scan, the half-life should be around a few hours (e.g. 6 hours) rather than years because...',
    markPoints: [
      {
        id: 'm1',
        markLabel: 'Mark 1',
        criterion: 'Selects a gamma emitter rather than an alpha emitter.',
        keywords: ['gamma'],
      },
      {
        id: 'm2',
        markLabel: 'Mark 2',
        criterion: 'Explains gamma is weakly ionising (causes much less cell/DNA damage inside the body).',
        keywords: ['weakly ionising', 'less ionising', 'less damage', 'dna', 'cells'],
      },
      {
        id: 'm3',
        markLabel: 'Mark 3',
        criterion: 'Explains gamma is highly penetrating so it can pass out of the body to reach the external detector.',
        keywords: ['penetrat', 'pass out', 'leave the body', 'detector', 'camera'],
      },
      {
        id: 'm4',
        markLabel: 'Mark 4',
        criterion: 'Contrasts with alpha: strongly ionising (very dangerous inside cells) and stopped by skin/tissue.',
        keywords: ['alpha', 'strongly ionising', 'stopped by', 'absorbed'],
      },
      {
        id: 'm5',
        markLabel: 'Mark 5',
        criterion: 'Selects a short half-life (~a few hours, e.g. 6 hours) long enough to complete the 4-hour scan.',
        keywords: ['short half-life', 'few hours', '6 hours', 'long enough'],
      },
      {
        id: 'm6',
        markLabel: 'Mark 6',
        criterion: 'Explains the short half-life ensures activity drops quickly afterwards so the patient receives a minimal radiation dose.',
        keywords: ['decays quickly', 'safe', 'dose', 'activity drops', 'not radioactive for long'],
      },
    ],
    modelAnswer:
      'A gamma emitter with a short half-life of around 6 hours should be used. Gamma radiation is highly penetrating, whereas alpha particles are absorbed by body tissue; therefore gamma rays can escape the patient’s body to be detected by an external gamma camera. Crucially, gamma is much more weakly ionising than alpha, which is strongly ionising and would severely damage living cells inside organs. A half-life of several hours keeps activity high enough throughout the 4-hour scan, then decays quickly afterwards so the patient is not exposed to harmful radiation for days or years.',
    examinerTip:
      'Always link BOTH properties of alpha vs gamma: ionising power (internal cell damage) AND penetration (getting out to the detector).',
    simPresetId: 'atom',
  },
  {
    id: 'exam-chem-electrolysis',
    topicId: 'electrolysis',
    subject: 'Chemistry',
    topicTitle: 'Electrolysis of Aqueous Solutions',
    boards: ['AQA', 'Edexcel', 'OCR'],
    paperHint: 'Paper 1 • Chemical Changes',
    tier: 'Higher & Foundation',
    marks: 6,
    commandWord: 'Explain',
    prompt:
      'A student passes an electric current through concentrated aqueous sodium chloride solution (NaCl(aq)) using inert graphite electrodes. Explain what products form at the cathode and anode, including the reactivity rule and half-equations.',
    sentenceStarter:
      'In aqueous sodium chloride, the solution contains Na⁺, Cl⁻, H⁺, and OH⁻ ions. At the negative cathode, hydrogen gas is produced instead of sodium because...',
    markPoints: [
      {
        id: 'm1',
        markLabel: 'Mark 1',
        criterion: 'Identifies the four ions present: Na⁺, Cl⁻, H⁺, and OH⁻ (from water).',
        keywords: ['h+', 'oh-', 'na+', 'cl-', 'water', 'four ions'],
      },
      {
        id: 'm2',
        markLabel: 'Mark 2',
        criterion: 'States hydrogen gas (H₂) is produced at the negative cathode.',
        keywords: ['hydrogen', 'cathode'],
      },
      {
        id: 'm3',
        markLabel: 'Mark 3',
        criterion: 'Explains sodium is more reactive than hydrogen, so H⁺ ions are discharged/reduced instead (2H⁺ + 2e⁻ → H₂).',
        keywords: ['more reactive', 'reactivity', 'discharged', 'reduced', 'gain electrons'],
      },
      {
        id: 'm4',
        markLabel: 'Mark 4',
        criterion: 'States chlorine gas (Cl₂) is produced at the positive anode.',
        keywords: ['chlorine', 'anode'],
      },
      {
        id: 'm5',
        markLabel: 'Mark 5',
        criterion: 'Explains halide ions (Cl⁻) are oxidised at the anode when present (2Cl⁻ → Cl₂ + 2e⁻).',
        keywords: ['halide', 'oxidised', 'lose electrons', '2cl-'],
      },
      {
        id: 'm6',
        markLabel: 'Mark 6',
        criterion: 'Identifies sodium hydroxide (NaOH) / alkaline solution remains in the beaker.',
        keywords: ['sodium hydroxide', 'naoh', 'alkali'],
      },
    ],
    modelAnswer:
      'Aqueous sodium chloride contains Na⁺ and Cl⁻ ions alongside H⁺ and OH⁻ ions from water. Positive cations move to the negative cathode; because sodium is more reactive than hydrogen, H⁺ ions are discharged (reduced) to form hydrogen gas: 2H⁺ + 2e⁻ → H₂. Negative anions move to the positive anode; because a halide ion (Cl⁻) is present in solution, Cl⁻ ions are oxidised to produce chlorine gas: 2Cl⁻ → Cl₂ + 2e⁻. The remaining Na⁺ and OH⁻ ions stay in solution, forming alkaline sodium hydroxide (NaOH).',
    examinerTip:
      'Use OIL RIG (Oxidation Is Loss, Reduction Is Gain of electrons) to double-check which side of each half-equation the electrons (e⁻) sit on.',
    simPresetId: 'electric-circuits',
  },
  {
    id: 'exam-bio-photosynthesis',
    topicId: 'photosynthesis-transport',
    subject: 'Biology',
    topicTitle: 'Photosynthesis Rate & Limiting Factors',
    boards: ['AQA', 'Edexcel', 'OCR'],
    paperHint: 'Paper 1 • Bioenergetics',
    tier: 'Higher & Foundation',
    marks: 6,
    commandWord: 'Explain',
    prompt:
      'Pondweed is placed in water and a lamp is moved gradually further away from the beaker while temperature is kept constant at 25 °C. Explain the effect on the rate of oxygen bubble production and why commercial growers heat and add CO₂ to greenhouses.',
    sentenceStarter:
      'As the lamp is moved further away, light intensity decreases (following the inverse square law), so the rate of photosynthesis... In a greenhouse, heating and adding CO₂ prevents them from becoming limiting factors...',
    markPoints: [
      {
        id: 'm1',
        markLabel: 'Mark 1',
        criterion: 'States moving the lamp further away decreases light intensity.',
        keywords: ['light intensity', 'decreases', 'less light', 'further'],
      },
      {
        id: 'm2',
        markLabel: 'Mark 2',
        criterion: 'Links lower light intensity to fewer oxygen bubbles / lower rate of photosynthesis (light is the limiting factor).',
        keywords: ['fewer bubbles', 'rate decreases', 'slower', 'limiting factor'],
      },
      {
        id: 'm3',
        markLabel: 'Mark 3',
        criterion: 'States photosynthesis is an endothermic reaction requiring light energy absorbed by chlorophyll.',
        keywords: ['endothermic', 'chlorophyll', 'energy', 'glucose'],
      },
      {
        id: 'm4',
        markLabel: 'Mark 4',
        criterion: 'Explains raising temperature increases kinetic energy / enzyme collisions up to an optimum (without denaturing).',
        keywords: ['enzyme', 'kinetic', 'collisions', 'optimum', 'denatur'],
      },
      {
        id: 'm5',
        markLabel: 'Mark 5',
        criterion: 'Explains adding CO₂ removes CO₂ concentration as a limiting factor since CO₂ is a reactant.',
        keywords: ['co2', 'carbon dioxide', 'reactant', 'limiting'],
      },
      {
        id: 'm6',
        markLabel: 'Mark 6',
        criterion: 'Evaluates cost vs yield: growers balance extra heating/CO₂ costs against faster plant growth and higher profit.',
        keywords: ['profit', 'cost', 'yield', 'grow faster', 'crop'],
      },
    ],
    modelAnswer:
      'Moving the lamp further away reduces light intensity. Because photosynthesis is an endothermic reaction using light energy absorbed by chlorophyll, light becomes the limiting factor, so the rate of photosynthesis falls and fewer oxygen bubbles are released per minute. In commercial greenhouses, growers burn fuel or use heaters to raise temperature towards the enzyme optimum (increasing successful enzyme-substrate collisions without denaturing enzymes) and supply extra CO₂ so carbon dioxide does not limit the reaction. This maximises glucose production for faster growth, balanced carefully against fuel and CO₂ costs to maximise profit.',
    examinerTip:
      'If a question asks about temperature in biology, always mention enzymes—never just say "heat speeds particles up" without linking to enzyme activity and denaturation.',
    simPresetId: 'photosynthesis',
  },
  {
    id: 'exam-bio-glucose-homeostasis',
    topicId: 'homeostasis-response',
    subject: 'Biology',
    topicTitle: 'Blood Glucose Control & Negative Feedback',
    boards: ['AQA', 'Edexcel', 'OCR'],
    paperHint: 'Paper 2 • Homeostasis & Response',
    tier: 'Higher',
    marks: 6,
    commandWord: 'Explain',
    prompt:
      'Explain how the human body lowers blood glucose concentration after a carbohydrate-rich meal, and how a different hormone raises it again during intense exercise (Higher Tier negative feedback).',
    sentenceStarter:
      'When blood glucose rises after a meal, the pancreas detects the increase and secretes the hormone insulin into the blood, which causes...',
    markPoints: [
      {
        id: 'm1',
        markLabel: 'Mark 1',
        criterion: 'States the pancreas detects high blood glucose and secretes insulin.',
        keywords: ['pancreas', 'insulin'],
      },
      {
        id: 'm2',
        markLabel: 'Mark 2',
        criterion: 'Explains insulin causes liver and muscle cells to absorb glucose from the blood.',
        keywords: ['absorb', 'take in', 'liver', 'muscle'],
      },
      {
        id: 'm3',
        markLabel: 'Mark 3',
        criterion: 'Explains excess glucose is converted into insoluble glycogen for storage.',
        keywords: ['glycogen', 'insoluble', 'stored'],
      },
      {
        id: 'm4',
        markLabel: 'Mark 4',
        criterion: 'States when blood glucose falls too low, the pancreas secretes glucagon.',
        keywords: ['glucagon'],
      },
      {
        id: 'm5',
        markLabel: 'Mark 5',
        criterion: 'Explains glucagon causes stored glycogen to convert back into glucose and enter the blood.',
        keywords: ['glycogen back to glucose', 'converted back', 'broken down', 'into glucose'],
      },
      {
        id: 'm6',
        markLabel: 'Mark 6',
        criterion: 'Identifies this corrective loop as negative feedback.',
        keywords: ['negative feedback'],
      },
    ],
    modelAnswer:
      'After a meal, high blood glucose is detected by the pancreas, which secretes the hormone insulin into the bloodstream. Insulin causes liver and muscle cells to absorb more glucose from the blood and convert excess glucose into insoluble glycogen for storage, returning blood glucose to normal. During exercise, if blood glucose drops too low, the pancreas secretes a different hormone, glucagon. Glucagon causes the liver to break down stored glycogen back into glucose and release it into the blood. This automatic restorative system is an example of negative feedback.',
    examinerTip:
      'Watch your spelling: Glucagon (hormone) vs Glycogen (storage carbohydrate) vs Glucose (sugar). Misspelling them in GCSE Biology often costs the mark!',
  },
  {
    id: 'exam-maths-quadratics',
    topicId: 'quadratic-equations',
    subject: 'Mathematics',
    topicTitle: 'Quadratic Equations & Turning Points',
    boards: ['Edexcel', 'AQA', 'OCR'],
    paperHint: 'Higher Tier • Algebra',
    tier: 'Higher',
    marks: 5,
    commandWord: 'Calculate & Explain',
    prompt:
      'Consider the quadratic curve y = x² − 6x + 5. (a) Find the coordinates of the roots where the curve crosses the x-axis. (b) By completing the square, find the exact coordinates of the minimum turning point.',
    sentenceStarter:
      '(a) Factorise x² − 6x + 5 = 0 to get (x − ...)(x − ...) = 0, so the roots are... (b) Completing the square gives y = (x − 3)² − ..., so the minimum point is...',
    markPoints: [
      {
        id: 'm1',
        markLabel: 'Mark 1',
        criterion: 'Correctly factorises x² − 6x + 5 = (x − 1)(x − 5).',
        keywords: ['(x - 1)', '(x-1)', '(x − 1)', '(x - 5)', '(x-5)', '(x − 5)'],
      },
      {
        id: 'm2',
        markLabel: 'Mark 2',
        criterion: 'States both x-intercepts / roots as (1, 0) and (5, 0).',
        keywords: ['1, 0', '(1,0)', '5, 0', '(5,0)', 'x = 1', 'x = 5', 'x=1', 'x=5'],
      },
      {
        id: 'm3',
        markLabel: 'Mark 3',
        criterion: 'Completes the square correctly: y = (x − 3)² − 9 + 5.',
        keywords: ['(x - 3)^2', '(x-3)^2', '(x − 3)²', '(x-3)²'],
      },
      {
        id: 'm4',
        markLabel: 'Mark 4',
        criterion: 'Simplifies constant term to −4: y = (x − 3)² − 4.',
        keywords: ['- 4', '-4', '− 4', '−4'],
      },
      {
        id: 'm5',
        markLabel: 'Mark 5',
        criterion: 'Identifies the minimum turning point coordinates as (3, −4).',
        keywords: ['(3, -4)', '(3,-4)', '(3, −4)'],
      },
    ],
    modelAnswer:
      '(a) Set y = 0: x² − 6x + 5 = 0. Factorising gives (x − 1)(x − 5) = 0, so x = 1 or x = 5. The curve crosses the x-axis at (1, 0) and (5, 0).\n(b) Halving the coefficient of x gives −3: y = (x − 3)² − 3² + 5 = (x − 3)² − 9 + 5 = (x − 3)² − 4. Since (x − 3)² ≥ 0, its minimum occurs when x − 3 = 0 (x = 3), giving y = −4. The minimum turning point is (3, −4).',
    examinerTip:
      'Remember the sign flip inside the bracket: for (x − 3)² − 4, the x-coordinate of the turning point is +3, not −3.',
    simPresetId: 'calculus-curves',
  },
  {
    id: 'exam-re-sources-authority',
    topicId: 'catholic-sources-of-authority',
    subject: 'Catholic Christianity',
    topicTitle: 'Sources of Authority: Scripture, Tradition & Magisterium',
    boards: ['AQA', 'Edexcel', 'OCR'],
    paperHint: 'GCSE Religious Studies • Catholic Christianity',
    tier: 'Core GCSE',
    marks: 6,
    commandWord: 'Evaluate',
    prompt:
      '"The Bible alone is all a Catholic needs to know how to live today." Evaluate this statement with reference to Sacred Scripture, Sacred Tradition, and the Magisterium.',
    contextNote: 'Use balanced PEEL paragraphs: why Scripture is central, why Catholics also rely on Tradition and the Magisterium, and a clear conclusion.',
    sentenceStarter:
      'Some Christians agree with this statement because Sacred Scripture is the inspired Word of God... However, Catholics teach that Scripture must be read alongside Sacred Tradition and the Magisterium because...',
    markPoints: [
      {
        id: 'm1',
        markLabel: 'Mark 1',
        criterion: 'Explains why Scripture is respected as the inspired Word of God (e.g. Gospels, Ten Commandments, 2 Timothy 3:16).',
        keywords: ['scripture', 'bible', 'word of god', 'inspired', 'gospel'],
      },
      {
        id: 'm2',
        markLabel: 'Mark 2',
        criterion: 'Explains Sacred Tradition as the living handing-on of Jesus’ teachings from the Apostles.',
        keywords: ['tradition', 'apostles', 'handed down'],
      },
      {
        id: 'm3',
        markLabel: 'Mark 3',
        criterion: 'Defines the Magisterium (the Pope and bishops) as the teaching authority that interprets Scripture accurately.',
        keywords: ['magisterium', 'pope', 'bishops', 'interpret', 'teaching authority'],
      },
      {
        id: 'm4',
        markLabel: 'Mark 4',
        criterion: 'Uses a specific modern example or Catechism / Vatican II reference (e.g. Laudato Si’, bioethics, modern issues not named directly in the Bible).',
        keywords: ['modern', 'catechism', 'vatican', 'laudato', 'encyclical', 'dei verbum'],
      },
      {
        id: 'm5',
        markLabel: 'Mark 5',
        criterion: 'Includes a contrasting view (e.g. Sola Scriptura / Protestant emphasis on Scripture alone).',
        keywords: ['protestant', 'sola scriptura', 'some christians', 'however', 'on the other hand'],
      },
      {
        id: 'm6',
        markLabel: 'Mark 6',
        criterion: 'Reaches a reasoned personal/theological conclusion weighing both sides.',
        keywords: ['conclusion', 'overall', 'therefore', 'strongest'],
      },
    ],
    modelAnswer:
      'Many Christians, especially from Protestant traditions (Sola Scriptura), would argue the Bible alone is sufficient because Sacred Scripture is the inspired Word of God and contains Jesus’ moral teachings such as the Beatitudes and the Two Great Commandments. However, the Catholic Church teaches (as stated in Dei Verbum) that Scripture and Sacred Tradition form a single sacred deposit of faith handed down from the Apostles. The Magisterium—the Pope and bishops in communion with him—provides living guidance to interpret Scripture faithfully and apply unchanging Gospel principles to modern questions like climate ethics (Laudato Si’) or medical technology. Overall, while the Bible is foundational, Catholics hold that Scripture, Tradition, and the Magisterium work together rather than in isolation.',
    examinerTip:
      'In GCSE RE Evaluate questions, always use specialist terms accurately (Magisterium, Sacred Tradition, Dei Verbum) and include a clear reasoned conclusion.',
    simPresetId: 'nicene-creed',
  },
  {
    id: 'exam-eng-macbeth-ambition',
    topicId: 'macbeth',
    subject: 'English Literature',
    topicTitle: 'Shakespeare: Ambition & Guilt in Macbeth',
    boards: ['AQA', 'Edexcel', 'OCR'],
    paperHint: 'Paper 1 • Shakespeare',
    tier: 'Core GCSE',
    marks: 6,
    commandWord: 'Explain',
    prompt:
      'Explain how Shakespeare presents Macbeth’s conflict between ambition and conscience in Act 1 Scene 7 ("I have no spur / To prick the sides of my intent, but only / Vaulting ambition, which o’erleaps itself").',
    sentenceStarter:
      'Shakespeare uses an extended horse-riding metaphor to show that Macbeth recognises his ambition is dangerous because...',
    markPoints: [
      {
        id: 'm1',
        markLabel: 'Mark 1',
        criterion: 'Identifies the metaphorical language ("spur", "prick", "vaulting ambition").',
        keywords: ['metaphor', 'horse', 'riding', 'spur', 'vaulting'],
      },
      {
        id: 'm2',
        markLabel: 'Mark 2',
        criterion: 'Explains "no spur" shows Macbeth admits he has no moral justification to murder Duncan—only ambition.',
        keywords: ['no justification', 'no reason', 'only ambition', 'conscience', 'moral'],
      },
      {
        id: 'm3',
        markLabel: 'Mark 3',
        criterion: 'Analyses "o’erleaps itself / And falls on th’ other" as foreshadowing his tragic downfall (hubris / hamartia).',
        keywords: ['foreshadow', 'downfall', 'fall', 'hamartia', 'hubris', 'tragic'],
      },
      {
        id: 'm4',
        markLabel: 'Mark 4',
        criterion: 'Links to Jacobean context: Divine Right of Kings / regicide as an unnatural sin.',
        keywords: ['jacobean', 'king james', 'divine right', 'regicide', 'sin', 'unnatural'],
      },
      {
        id: 'm5',
        markLabel: 'Mark 5',
        criterion: 'Notes structural/dramatic effect of the soliloquy revealing inner turmoil directly to the audience.',
        keywords: ['soliloquy', 'audience', 'internal conflict', 'turmoil', 'hesitation'],
      },
      {
        id: 'm6',
        markLabel: 'Mark 6',
        criterion: 'Uses embedded short quotations accurately.',
        keywords: ['"no spur"', '"vaulting ambition"', '"o\'erleaps"', 'quote', 'spur'],
      },
    ],
    modelAnswer:
      'In this soliloquy, Shakespeare exposes Macbeth’s acute internal conflict directly to the audience. By admitting he has "no spur" except "vaulting ambition", Macbeth confesses that King Duncan has been virtuous and that regicide has no moral justification. Shakespeare’s extended equestrian metaphor ("o’erleaps itself / And falls on th’ other") illustrates that unchecked ambition overreaches and causes self-destruction, foreshadowing Macbeth’s tragic downfall (hamartia). For a Jacobean audience under King James I, murdering an anointed monarch violated the Divine Right of Kings, highlighting the moral peril of Macbeth’s desire for power.',
    examinerTip:
      'Name the dramatic form ("soliloquy") and connect short embedded quotes directly to Shakespeare’s warning to a Jacobean audience.',
    simPresetId: 'shakespeare-macbeth',
  },
];

export const CURATED_FLASHCARDS: RevisionFlashcard[] = [
  // GCSE Physics Equations & Definitions
  {
    id: 'fc-phys-fma',
    deckId: 'gcse-science-equations',
    subject: 'Physics',
    stage: 'Key Stage 4 (GCSE)',
    boards: ['AQA', 'Edexcel', 'OCR'],
    front: "State Newton's Second Law equation (with units).",
    back: 'F = m × a — Resultant Force (N) = mass (kg) × acceleration (m/s²).',
    clue: 'Think of F, m, and a.',
  },
  {
    id: 'fc-phys-vflambda',
    deckId: 'gcse-science-equations',
    subject: 'Physics',
    stage: 'Key Stage 4 (GCSE)',
    boards: ['AQA', 'Edexcel', 'OCR'],
    front: 'What is the wave speed equation (with standard SI units)?',
    back: 'v = f × λ — Wave speed (m/s) = frequency (Hz) × wavelength (m).',
    clue: 'Speed connects frequency and wavelength.',
  },
  {
    id: 'fc-phys-ohm',
    deckId: 'gcse-science-equations',
    subject: 'Physics',
    stage: 'Key Stage 4 (GCSE)',
    boards: ['AQA', 'Edexcel', 'OCR'],
    front: 'State the equation linking potential difference, current, and resistance.',
    back: 'V = I × R — Potential difference (V) = current (A) × resistance (Ω).',
    clue: "Ohm's Law triangle.",
  },
  {
    id: 'fc-chem-moles',
    deckId: 'gcse-science-equations',
    subject: 'Chemistry',
    stage: 'Key Stage 4 (GCSE)',
    boards: ['AQA', 'Edexcel', 'OCR'],
    front: 'How do you calculate number of moles from mass and relative formula mass?',
    back: 'Moles (mol) = Mass (g) ÷ Relative Formula Mass (Mr).',
    clue: 'n = m / Mr.',
  },
  {
    id: 'fc-bio-photo',
    deckId: 'gcse-science-equations',
    subject: 'Biology',
    stage: 'Key Stage 4 (GCSE)',
    boards: ['AQA', 'Edexcel', 'OCR'],
    front: 'Give the balanced symbol equation for photosynthesis.',
    back: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (light energy absorbed by chlorophyll).',
    clue: 'Six carbon dioxide + six water makes glucose + six oxygen.',
  },
  {
    id: 'fc-bio-limiting',
    deckId: 'gcse-science-equations',
    subject: 'Biology',
    stage: 'Key Stage 4 (GCSE)',
    boards: ['AQA', 'Edexcel', 'OCR'],
    front: 'What are the four main factors that can limit the rate of photosynthesis?',
    back: 'Light intensity, carbon dioxide concentration, temperature, and amount of chlorophyll.',
    clue: 'Three external factors plus one inside the leaf.',
  },
  // GCSE Catholic Christianity & Theology
  {
    id: 'fc-re-magisterium',
    deckId: 'catholic-theology',
    subject: 'Catholic Christianity',
    stage: 'Key Stage 4 (GCSE)',
    boards: ['AQA', 'Edexcel', 'OCR'],
    front: 'What is the Magisterium?',
    back: 'The living teaching authority of the Catholic Church (the Pope and bishops in communion with him) that faithfully interprets Scripture and Tradition.',
    clue: 'From Latin "magister" (teacher).',
  },
  {
    id: 'fc-re-transub',
    deckId: 'catholic-theology',
    subject: 'Catholic Christianity',
    stage: 'Key Stage 4 (GCSE)',
    boards: ['AQA', 'Edexcel', 'OCR'],
    front: 'What does Transubstantiation mean in Catholic belief?',
    back: 'At the Consecration in Mass, the whole substance of bread and wine changes into the Body and Blood of Christ, while the appearances remain.',
    clue: 'Takes place during the Eucharistic Prayer.',
  },
  {
    id: 'fc-re-imago',
    deckId: 'catholic-theology',
    subject: 'Catholic Christianity',
    stage: 'Key Stage 4 (GCSE)',
    boards: ['AQA', 'Edexcel', 'OCR'],
    front: 'What is "Imago Dei" and why is it central to Catholic Social Teaching?',
    back: 'Literally "Image of God" (Genesis 1:27): every human person has inherent, inviolable dignity from conception to natural death.',
    clue: 'Latin phrase meaning made in God’s likeness.',
  },
  {
    id: 'fc-re-eschatology',
    deckId: 'catholic-theology',
    subject: 'Catholic Christianity',
    stage: 'Key Stage 4 (GCSE)',
    boards: ['AQA', 'Edexcel', 'OCR'],
    front: 'Define Eschatology and name the "Four Last Things".',
    back: 'The study of the end times and life after death: Death, Judgement, Heaven, and Hell (plus Catholic teaching on Purgatory as final purification).',
    clue: 'From Greek "eschatos" (last).',
  },
  // MFL Core Vocabulary (with native TTS languages!)
  {
    id: 'fc-mfl-es-1',
    deckId: 'mfl-core-vocab',
    subject: 'Languages (Spanish & French)',
    stage: 'Key Stage 3 & 4',
    front: '🇪🇸 "Sin embargo" — What does this Spanish connective mean?',
    back: 'However / Nevertheless (essential higher-tier connective for GCSE writing & speaking).',
    speechLang: 'es-ES',
  },
  {
    id: 'fc-mfl-es-2',
    deckId: 'mfl-core-vocab',
    subject: 'Languages (Spanish & French)',
    stage: 'Key Stage 3 & 4',
    front: '🇪🇸 "Suelo + infinitive" (e.g. Suelo estudiar por la tarde)',
    back: 'I usually... (e.g. "I usually study in the afternoon" — great GCSE idiom!).',
    speechLang: 'es-ES',
  },
  {
    id: 'fc-mfl-fr-1',
    deckId: 'mfl-core-vocab',
    subject: 'Languages (Spanish & French)',
    stage: 'Key Stage 3 & 4',
    front: '🇫🇷 "Cependant / Néanmoins" — What do these French connectives mean?',
    back: 'However / Nevertheless — raises writing/speaking complexity straight into GCSE Grade 7–9.',
    speechLang: 'fr-FR',
  },
  {
    id: 'fc-mfl-fr-2',
    deckId: 'mfl-core-vocab',
    subject: 'Languages (Spanish & French)',
    stage: 'Key Stage 3 & 4',
    front: '🇫🇷 "Si j’avais le choix, je voudrais..."',
    back: 'If I had the choice, I would like... (imperfect + conditional complex structure).',
    speechLang: 'fr-FR',
  },
];

export function getAllRevisionFlashcards(): RevisionFlashcard[] {
  const curriculumCards: RevisionFlashcard[] = ALL_CURRICULUM_ROUTES.map((route: CurriculumRouteNode) => ({
    id: `fc-route-${route.stageId}-${route.subjectId}-${route.topicId}`,
    deckId: 'curriculum-mesh',
    subject: route.subjectTitle,
    stage: route.stageTitle,
    boards: route.stageId === 'ks4' ? ['AQA', 'Edexcel', 'OCR'] : undefined,
    front: `${route.topicTitle} (${route.stageTitle}): What is the core big idea?`,
    back: `${route.axiom}${route.cognitiveTrap ? `\n\n⚠️ Watch out: ${route.cognitiveTrap}` : ''}`,
    clue: route.hook || route.guidedStep,
  }));

  return [...CURATED_FLASHCARDS, ...curriculumCards];
}

export const DICTATION_ITEMS: DictationItem[] = [
  // Key Science Terms
  {
    id: 'dic-sci-photo',
    deckId: 'science-spelling',
    deckTitle: 'Science Key Terms (KS2–GCSE)',
    subject: 'Science',
    stage: 'Key Stage 3 & 4',
    word: 'photosynthesis',
    spokenSentence: 'Plants make glucose from carbon dioxide and water using photosynthesis.',
    clue: '14 letters: begins with "photo-" (light).',
    speechLang: 'en-GB',
  },
  {
    id: 'dic-sci-electrolysis',
    deckId: 'science-spelling',
    deckTitle: 'Science Key Terms (KS2–GCSE)',
    subject: 'Chemistry',
    stage: 'Key Stage 4 (GCSE)',
    word: 'electrolysis',
    spokenSentence: 'Splitting an ionic compound using electricity is called electrolysis.',
    clue: '12 letters: "electro-" + "-lysis".',
    speechLang: 'en-GB',
  },
  {
    id: 'dic-sci-mitochondria',
    deckId: 'science-spelling',
    deckTitle: 'Science Key Terms (KS2–GCSE)',
    subject: 'Biology',
    stage: 'Key Stage 3 & 4',
    word: 'mitochondria',
    spokenSentence: 'Aerobic respiration releases energy inside the mitochondria.',
    clue: '12 letters: cell organelle where respiration occurs.',
    speechLang: 'en-GB',
  },
  {
    id: 'dic-sci-acceleration',
    deckId: 'science-spelling',
    deckTitle: 'Science Key Terms (KS2–GCSE)',
    subject: 'Physics',
    stage: 'Key Stage 3 & 4',
    word: 'acceleration',
    spokenSentence: 'Resultant force equals mass multiplied by acceleration.',
    clue: 'Double "c", single "l": a-c-c-e-l...',
    speechLang: 'en-GB',
  },
  // Catholic RE Terms
  {
    id: 'dic-re-eucharist',
    deckId: 'catholic-spelling',
    deckTitle: 'Catholic RE & Liturgy Vocabulary',
    subject: 'Catholic Christianity',
    stage: 'Key Stage 2–4',
    word: 'Eucharist',
    spokenSentence: 'Catholics celebrate the Real Presence of Jesus in the Eucharist.',
    clue: '9 letters: starts with "Eu-" (from Greek meaning thanksgiving).',
    speechLang: 'en-GB',
  },
  {
    id: 'dic-re-magisterium',
    deckId: 'catholic-spelling',
    deckTitle: 'Catholic RE & Liturgy Vocabulary',
    subject: 'Catholic Christianity',
    stage: 'Key Stage 4 (GCSE)',
    word: 'Magisterium',
    spokenSentence: 'The Pope and bishops form the Magisterium of the Church.',
    clue: '11 letters: ends in "-ium".',
    speechLang: 'en-GB',
  },
  {
    id: 'dic-re-tabernacle',
    deckId: 'catholic-spelling',
    deckTitle: 'Catholic RE & Liturgy Vocabulary',
    subject: 'Catholic Christianity',
    stage: 'Key Stage 2–4',
    word: 'tabernacle',
    spokenSentence: 'The consecrated hosts are reserved inside the tabernacle on the sanctuary.',
    clue: '10 letters: ends in "-acle".',
    speechLang: 'en-GB',
  },
  // Primary Spelling (KS1/KS2 National Curriculum Statutory Words)
  {
    id: 'dic-pri-necessary',
    deckId: 'primary-spelling',
    deckTitle: 'KS2 Statutory Spelling & Phonics',
    subject: 'English',
    stage: 'Key Stage 2',
    word: 'necessary',
    spokenSentence: 'It is necessary to show all your working in maths.',
    clue: 'One collar (c), two sleeves (ss).',
    speechLang: 'en-GB',
  },
  {
    id: 'dic-pri-rhythm',
    deckId: 'primary-spelling',
    deckTitle: 'KS2 Statutory Spelling & Phonics',
    subject: 'English',
    stage: 'Key Stage 2',
    word: 'rhythm',
    spokenSentence: 'Listen carefully to the steady rhythm of the poem.',
    clue: '6 letters, no standard vowels (uses "y")!',
    speechLang: 'en-GB',
  },
  {
    id: 'dic-pri-separate',
    deckId: 'primary-spelling',
    deckTitle: 'KS2 Statutory Spelling & Phonics',
    subject: 'English',
    stage: 'Key Stage 2',
    word: 'separate',
    spokenSentence: 'Use a filter to separate sand from salty water.',
    clue: 'Remember: there is "a rat" in sep-a-rat-e.',
    speechLang: 'en-GB',
  },
  // MFL Dictation (Spanish & French GCSE phrases!)
  {
    id: 'dic-mfl-es-sinembargo',
    deckId: 'mfl-dictation',
    deckTitle: 'MFL Listen & Type (Spanish & French)',
    subject: 'Spanish',
    stage: 'Key Stage 3 & 4',
    word: 'sin embargo',
    spokenSentence: 'sin embargo',
    clue: 'Two Spanish words meaning "however".',
    speechLang: 'es-ES',
  },
  {
    id: 'dic-mfl-es-megusta',
    deckId: 'mfl-dictation',
    deckTitle: 'MFL Listen & Type (Spanish & French)',
    subject: 'Spanish',
    stage: 'Key Stage 3 & 4',
    word: 'me gusta mucho',
    spokenSentence: 'me gusta mucho',
    clue: 'Three Spanish words meaning "I like it a lot".',
    speechLang: 'es-ES',
  },
  {
    id: 'dic-mfl-fr-cependant',
    deckId: 'mfl-dictation',
    deckTitle: 'MFL Listen & Type (Spanish & French)',
    subject: 'French',
    stage: 'Key Stage 3 & 4',
    word: 'cependant',
    spokenSentence: 'cependant',
    clue: '9-letter French word meaning "however".',
    speechLang: 'fr-FR',
  },
  {
    id: 'dic-mfl-fr-jaime',
    deckId: 'mfl-dictation',
    deckTitle: 'MFL Listen & Type (Spanish & French)',
    subject: 'French',
    stage: 'Key Stage 3 & 4',
    word: "j'aime beaucoup",
    acceptableVariants: ['jaime beaucoup'],
    spokenSentence: "j'aime beaucoup",
    clue: 'French phrase meaning "I like a lot" (with apostrophe).',
    speechLang: 'fr-FR',
  },
];
