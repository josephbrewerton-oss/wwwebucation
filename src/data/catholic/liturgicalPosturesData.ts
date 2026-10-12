// src/data/catholic/liturgicalPosturesData.ts
// St Joseph's Catholic Life & Faith Sanctuary
// Authoritative Doctrinal & Rubrical Guide: Eucharistic Reception & The Our Father Across All Catholic Rites

export interface ReceptionMethod {
  id: string;
  name: string;
  latinOrGreekTerm: string;
  ritesPracticed: string[];
  isUniversalNorm: boolean;
  stepByStepGuide: string[];
  theologicalSignificance: string;
  scripturalAndPatristicRoots: string;
  rubricalCitations: string[];
  criticalRulesAndErrorsToAvoid: string[];
  diagramEmoji: string;
}

export interface OurFatherPosture {
  id: string;
  name: string;
  term: string;
  whoIsPrescribedFor: string;
  ritesContext: string;
  isRubricallyMandatedForLaity: boolean;
  description: string;
  theologicalRationale: string;
  commonMisconception: string;
  officialChurchGuidance: string;
  citations: string[];
  visualIcon: string;
}

export interface LiturgicalMyth {
  id: string;
  myth: string;
  verdict: 'FALSE' | 'MISUNDERSTOOD' | 'PERMITTED_BY_INDULT' | 'UNIVERSAL_NORM';
  explanation: string;
  officialDoc: string;
  riteContext: string;
}

// 1. RECEPTION OF THE HOLY EUCHARIST ACROSS RITES
export const EUCHARISTIC_RECEPTION_METHODS: ReceptionMethod[] = [
  {
    id: 'on-the-tongue-roman',
    name: 'On the Tongue (Universal Norm of the Roman Rite)',
    latinOrGreekTerm: 'In Ore / Sub Lingua',
    ritesPracticed: ['Roman (Latin) Rite', 'Maronite Rite', 'Chaldean Rite (Traditional)', 'All Western Rites'],
    isUniversalNorm: true,
    stepByStepGuide: [
      '1. Approach the Altar or Altar Rail with hands joined (palms together, thumbs crossed).',
      '2. Make a profound bow of reverence before the Blessed Sacrament (or kneel if kneeling is customary).',
      '3. When the Priest or Deacon says "The Body of Christ", respond with a clear, audible "Amen!" ("I believe!").',
      '4. Tilt your head back slightly, open your mouth wide, and extend your tongue steadily over the lower lip.',
      '5. Do NOT bite, snap at the Host, or reach forward with your teeth; allow the minister to place the Sacred Host reverently on your tongue.',
      '6. Close your mouth reverently, consume the Host, and return to your pew with hands folded in silent thanksgiving.',
    ],
    theologicalSignificance:
      'Emphasizes the total receptivity of the human soul before Almighty God. Like an infant fed by its parent, we do not grasp or take God; we receive Him as pure gift and sacrifice.',
    scripturalAndPatristicRoots:
      'Psalm 81:10 ("Open wide your mouth and I will fill it"); St. Thomas Aquinas (Summa Theologiae III, q. 82, a. 3: consecrated hands alone touch the sacred species for safeguard).',
    rubricalCitations: [
      'General Instruction of the Roman Missal (GIRM) 161: "The communicant may receive the Sacrament either kneeling or standing... on the tongue, which is the universal practice."',
      'Redemptionis Sacramentum (2004) 92: "Each of the faithful always has the right to receive Holy Communion on the tongue, at his or her choice."',
      'Memoriale Domini (1969): Confirmed the preservation of the traditional practice on the tongue.',
    ],
    criticalRulesAndErrorsToAvoid: [
      'Never stick out tongue too far or move head abruptly as the priest lowers the Host.',
      'Do not say "Amen" after the Host is placed on your tongue; say "Amen" BEFORE opening your mouth.',
      'A communion paten should be held under the chin by an altar server to catch any microscopic particles (every fragment is fully Jesus).',
    ],
    diagramEmoji: '👅🕊️',
  },
  {
    id: 'in-the-hand-roman',
    name: 'In the Hand (Permitted by Indult in the Roman Rite)',
    latinOrGreekTerm: 'In Manu (Permissio Specialis)',
    ritesPracticed: ['Roman (Latin) Rite (Where Bishops’ Conferences have obtained an indult from the Holy See)'],
    isUniversalNorm: false,
    stepByStepGuide: [
      '1. Approach with clean hands, free of gloves, rosaries, or books.',
      '2. Make a profound bow of adoration before stepping forward to the priest.',
      '3. When the minister says "The Body of Christ", respond with a clear, heartfelt "Amen!"',
      '4. Extend your non-dominant hand flat (usually the left hand) supported beneath by your dominant hand (right hand), forming a "throne for the King".',
      '5. Keep fingers flat and together so no fragment falls between them.',
      '6. Once the priest places the Sacred Host on your open palm, STEP ASIDE BUT DO NOT WALK AWAY.',
      '7. Using your dominant (right) hand, pick up the Host and place It in your mouth IMMEDIATELY in front of the priest or minister.',
      '8. Inspect both palms for any remaining sacred particles and consume them reverently before folding your hands.',
    ],
    theologicalSignificance:
      'Recalls the ancient patristic imagery taught by St. Cyril of Jerusalem in the 4th century: making the hands a royal throne to welcome the King of Kings with utmost reverence and vigil.',
    scripturalAndPatristicRoots:
      'St. Cyril of Jerusalem (Mystagogical Catechesis V, 21: "Making your left hand a throne for the right, as about to receive a King, receive the Body of Christ in the hollow of your hand...").',
    rubricalCitations: [
      'Memoriale Domini (Congregation for Divine Worship, 1969): Granted episcopal conferences permission to request indults.',
      'Redemptionis Sacramentum (2004) 92: "If there is a risk of profanation, then Holy Communion should not be given in the hand to the faithful."',
      'GIRM 161: "As soon as the communicant receives the host, he or she consumes the whole of it immediately."',
    ],
    criticalRulesAndErrorsToAvoid: [
      'CRITICAL: NEVER walk away carrying the Host! Walking away with the Sacred Host is grave sacrilege and grounds for immediate intervention.',
      'CRITICAL: NEVER snatch or grab the Host from the priest’s fingers. You do not "take"; you "receive".',
      'CRITICAL: Strictly check your palm! If any crumb or particle remains, consume it immediately. The fullness of Christ’s Body, Blood, Soul, and Divinity is present in every fragment.',
      'NO GLOVES: Communion in the hand can never be received while wearing gloves.',
    ],
    diagramEmoji: '🤲👑',
  },
  {
    id: 'byzantine-liturgical-spoon',
    name: 'Via Liturgical Spoon (Labis) — Byzantine Rite',
    latinOrGreekTerm: 'Λαβίς (Labis / Cochlear)',
    ritesPracticed: [
      'Ukrainian Greek Catholic Church',
      'Melkite Greek Catholic Church',
      'Ruthenian Byzantine Catholic Church',
      'All 14 Byzantine Catholic Churches',
    ],
    isUniversalNorm: true,
    stepByStepGuide: [
      '1. Approach the Holy Doors standing upright. In Byzantine theology, Christians stand as resurrected children of God.',
      '2. Cross your arms over your chest in the form of St. Andrew’s Cross (❌) with hands resting on opposite shoulders.',
      '3. Tell the priest your baptismal name when you step forward (e.g., "The servant of God, Joseph").',
      '4. Tilt your head back slightly and open your mouth WIDE.',
      '5. KEEP YOUR TONGUE INSIDE YOUR MOUTH. Do NOT stick your tongue out!',
      '6. The priest takes a piece of consecrated leavened bread (the Lamb) dipped in the Precious Blood with the golden spoon (*Labis*) and drops it into your mouth.',
      '7. CRITICAL: DO NOT CLOSE YOUR LIPS ON THE SPOON. Do NOT suck or kiss the spoon. Let the Body and Blood slide in.',
      '8. The altar server or deacon holds the red cloth (*platidion* / *rushnyk*) under your chin. Wipe your lips on the red cloth only if touched, swallow reverently, step aside, and make a profound bow.',
    ],
    theologicalSignificance:
      'The golden spoon represents the tongs used by the Seraph angel in Isaiah 6:6 to touch the live burning coal to the prophet’s lips, purging iniquity with the fiery divine love of God.',
    scripturalAndPatristicRoots:
      'Isaiah 6:6-7 ("Then one of the seraphim flew to me with a live coal in his hand... he touched my mouth and said, Behold, this has touched your lips; your guilt is taken away").',
    rubricalCitations: [
      'Code of Canons of the Eastern Churches (CCEO) Can. 709 §1.',
      'Divine Liturgy of St. John Chrysostom Rubrics: "The priest communes the people from the holy chalice using the holy spoon."',
      'Reception in the hand is completely alien and strictly prohibited in the Byzantine liturgical tradition.',
    ],
    criticalRulesAndErrorsToAvoid: [
      'NEVER attempt to touch the Host or reach out hands; keep arms locked in St. Andrew’s cross (❌).',
      'DO NOT STICK OUT YOUR TONGUE — in the Byzantine Rite, sticking out the tongue blocks the spoon and risks spilling the Precious Blood!',
      'DO NOT CLOSE TEETH OR LIPS ON THE SPOON — the spoon must be lifted cleanly without your mouth biting it.',
    ],
    diagramEmoji: '🥄✨',
  },
  {
    id: 'intinction-by-priest',
    name: 'Intinction Administered by the Priest',
    latinOrGreekTerm: 'Intinctio Sacerdotalis',
    ritesPracticed: [
      'Maronite Church',
      'Syro-Malabar Church (frequently)',
      'Armenian Catholic Church',
      'Roman Rite (when permitted by GIRM 287)',
    ],
    isUniversalNorm: false,
    stepByStepGuide: [
      '1. The communicant approaches standing with hands joined or crossed over chest.',
      '2. Make a bow of reverence and say "Amen" to the proclamation.',
      '3. The priest dips the Host partially into the Chalice containing the Precious Blood.',
      '4. The priest places the intincted Host directly ONTO THE COMMUNICANT’S TONGUE.',
      '5. The communicant receives with mouth open wide while a communion paten is held beneath.',
    ],
    theologicalSignificance:
      'Allows both species (Body and Blood) to be received simultaneously with highest reverence and zero risk of spilling from an open cup.',
    scripturalAndPatristicRoots:
      'John 6:53-54 ("Whoever eats my flesh and drinks my blood has eternal life"). St. John Chrysostom on the indivisible unity of the banquet.',
    rubricalCitations: [
      'GIRM 287: "If Communion from the chalice is carried out by intinction, the communicant receives only on the tongue."',
      'Redemptionis Sacramentum 103-104.',
    ],
    criticalRulesAndErrorsToAvoid: [
      'CRITICAL: NO SELF-INTINCTION! The communicant may NEVER take the Host and dip it into the chalice themselves.',
      'Intinction can NEVER be placed in the hand; it must be received directly on the tongue to prevent the Precious Blood dripping onto hands or floor.',
    ],
    diagramEmoji: '🍷🍞',
  },
];

// 2. THE OUR FATHER: HAND POSTURES & THE GREAT RUBRICAL DEBATE
export const OUR_FATHER_POSTURES: OurFatherPosture[] = [
  {
    id: 'hands-joined-laity',
    name: 'Hands Joined in Prayer (The Prescribed Lay Posture)',
    term: 'Junctis Manibus',
    whoIsPrescribedFor: 'The Lay Faithful & Non-Presiding Ministers',
    ritesContext: 'Roman (Latin) Rite & Eastern Tradition',
    isRubricallyMandatedForLaity: true,
    description:
      'Palms pressed flat against each other, fingers pointing straight up toward heaven, right thumb crossed reverently over the left thumb in the form of a small cross.',
    theologicalRationale:
      'Reflects filial humility, collected interior devotion, and submission to the Divine Will. The crossed thumbs keep the mind tethered to the Sacrifice of Calvary, while fingers pointed upward direct the heart to heaven.',
    commonMisconception:
      'Many people believe that folding hands is "old fashioned" or merely for children, and assume they are required to do something with their arms during the Lord’s Prayer.',
    officialChurchGuidance:
      'The Roman Missal explicitly prescribes the Orans posture ONLY for the priest. For the congregation, the universal liturgical posture of prayer when standing is hands joined.',
    citations: [
      'General Instruction of the Roman Missal (GIRM) 237: "The priest, with hands extended, sings or says the prayer: Praeceptis salutaribus moniti... Pater noster."',
      'Caeremoniale Episcoporum (Ceremonial of Bishops) n. 107: Explains the normative posture of prayer for ministers and assistants is junctis manibus.',
      'Congregation for the Clergy & 7 Vatican Dicasteries (1997 Interdicasterial Instruction Ecclesiae de Mysterio, art. 6 §2): "Neither may non-ordained members of the faithful use gestures or actions which are proper to the celebration of the priest."',
    ],
    visualIcon: '🙏',
  },
  {
    id: 'orans-priest-alone',
    name: 'The Orans Posture (Sacerdotal / Priestly Gesture)',
    term: 'Manibus Extensis (Orans)',
    whoIsPrescribedFor: 'Ordained Bishop and Priest ALONE (in persona Christi)',
    ritesContext: 'Roman (Latin) Rite, Maronite, Syro-Malabar',
    isRubricallyMandatedForLaity: false,
    description:
      'Arms extended out to the sides at chest/shoulder level with elbows bent, hands elevated with open palms turned toward heaven.',
    theologicalRationale:
      'The priest is configured sacramentally to Christ the Head (*in persona Christi capitis*). He extends his arms as Christ extended His arms upon the Wood of the Cross, acting as an intercessor between God and mankind.',
    commonMisconception:
      'Widespread misconception: That lay people in the pews should imitate the priest by extending their hands outward during the Our Father. In reality, the rubrics of the Roman Missal NEVER ask the congregation to do this.',
    officialChurchGuidance:
      'The Roman Missal specifies "sacerdos extendit manus" (the priest extends his hands). Nowhere does it say "sacerdos et populus extendunt manus". The Holy See has clarified that liturgical gestures reserved to the priest should not be usurped by the congregation.',
    citations: [
      'Roman Missal, Order of Mass n. 124: "Sacerdos, manibus extensis, una cum populo pergit: Pater noster..."',
      'Congregation for Divine Worship, Notitiae (1975 & 1983): "The Orans posture is a sacerdotal gesture of priestly mediation."',
      'Cardinal Francis Arinze (Prefect of CDW): "The priest is acting in the person of Christ and of the whole Church; that is why he holds his hands out. The faithful do not have this liturgical rubric."',
    ],
    visualIcon: '🙌✝️',
  },
  {
    id: 'holding-hands-pews',
    name: 'Holding Hands Across Pews (Informal Popular Custom)',
    term: 'Nexus Manuum (Customary / Non-Rubrical)',
    whoIsPrescribedFor: 'Families & Pews (Spontaneous Practice)',
    ritesContext: 'Modern Western Parishes (principally North America & parts of UK)',
    isRubricallyMandatedForLaity: false,
    description:
      'People in the congregation reach across the pew or aisle to clasp hands with adjacent worshippers while reciting the Our Father.',
    theologicalRationale:
      'Intended by those who practice it as a warm sign of community, fraternal fellowship, and family solidarity under the one Fatherhood of God.',
    commonMisconception:
      'Many churchgoers mistakenly believe holding hands is an official Catholic rule, and look sideways or judge fellow parishioners who prefer to keep their hands reverently folded.',
    officialChurchGuidance:
      'Holding hands is NOT prescribed anywhere in the Roman Missal. Liturgists and bishops note that it anticipates the Sign of Peace (which occurs shortly after), shifts attention from God the Father horizontally to our neighbors, and can make visitors, neurodivergent worshippers, or newcomers uncomfortable.',
    citations: [
      'Sacred Congregation for the Sacraments and Divine Worship: Response in Notitiae (1981): "The gesture of holding hands is not found in the liturgical books. It is an extraneous introduction."',
      'USCCB Committee on the Liturgy (Newsletter): "No posture for the hands is indicated for the congregation during the Lord’s Prayer... hands joined is the standard posture."',
      'Liturgical principle: The Our Father is addressed vertically to our Heavenly Father; horizontal solidarity belongs properly to the upcoming Sign of Peace.',
    ],
    visualIcon: '🤝⛪',
  },
  {
    id: 'byzantine-arms-crossed',
    name: 'Hands Crossed on Chest / Reverent Metanies (Byzantine Rite)',
    term: 'Metania / Crux Sancti Andreae',
    whoIsPrescribedFor: 'Byzantine Catholic Faithful',
    ritesContext: 'Ukrainian, Melkite, Ruthenian, Romanian Greek Catholic Churches',
    isRubricallyMandatedForLaity: true,
    description:
      'Faithful stand at attention with hands crossed over the breast or held reverently at their sides. At the doxology ("For Thine is the kingdom..."), they make a profound waist-bow (metany) and sign of the cross.',
    theologicalRationale:
      'Expresses awe before the Heavenly King. In Byzantine theology, standing before God with hands crossed signals holy reverence, vigilance, and readiness to serve.',
    commonMisconception:
      'Visitors from the West sometimes assume Eastern Catholics are "stiff" because they do not hold hands; in reality, their posture is steeped in deep monastic solemnity.',
    officialChurchGuidance:
      'Eastern Canon Law and Typikon strictly forbid introducing Western devotional gestures (like holding hands) into the Byzantine Divine Liturgy.',
    citations: [
      'Typikon of St. Sabbas & Divine Liturgy of St. John Chrysostom.',
      'CCEO Can. 28: Eastern liturgical traditions must be religiously preserved and defended against Latinization.',
    ],
    visualIcon: '⚔️☦️',
  },
];

// 3. LITURGICAL MYTHBUSTERS
export const LITURGICAL_MYTHS: LiturgicalMyth[] = [
  {
    id: 'myth-communion-hand-mandatory',
    myth: 'Receiving Communion in the hand is the new mandatory standard in the Catholic Church.',
    verdict: 'FALSE',
    explanation:
      'Receiving on the tongue remains the UNIVERSAL LAW and norm of the Roman Rite. Receiving in the hand is an exception (indult) granted by permission. The Church guarantees every Catholic the unassailable right to receive on the tongue (Redemptionis Sacramentum 92).',
    officialDoc: 'Redemptionis Sacramentum 92 & GIRM 161',
    riteContext: 'Roman (Latin) Rite',
  },
  {
    id: 'myth-byzantine-in-hand',
    myth: 'You can hold out your hands to receive the host in a Ukrainian or Melkite Byzantine Catholic church.',
    verdict: 'FALSE',
    explanation:
      'In the Byzantine Rite, Communion is NEVER given in the hand! Both the consecrated leavened bread and Precious Blood are combined in the chalice and given exclusively via a golden liturgical spoon (*Labis*) directly into the mouth.',
    officialDoc: 'Divine Liturgy of St. John Chrysostom Rubrics',
    riteContext: 'Byzantine Rite',
  },
  {
    id: 'myth-walk-away-with-host',
    myth: 'When receiving in the hand, you can carry the Host back to your seat and eat it while kneeling.',
    verdict: 'FALSE',
    explanation:
      'GIRMS 161 and universal liturgical law strictly require that you consume the Host IMMEDIATELY in front of the priest before taking a single step away. Walking away with the Host creates a grave risk of theft or profanation.',
    officialDoc: 'GIRM 161 & Redemptionis Sacramentum 92',
    riteContext: 'Roman (Latin) Rite',
  },
  {
    id: 'myth-self-intinction',
    myth: 'If a chalice is present, you can take your own Host from the priest and dip it into the Precious Blood yourself.',
    verdict: 'FALSE',
    explanation:
      'Self-intinction is STRICTLY FORBIDDEN by the Holy See. The communicant may never dip the Host into the chalice. If Communion is by intinction, only the priest may dip the Host and place it directly on your tongue.',
    officialDoc: 'Redemptionis Sacramentum 104',
    riteContext: 'Roman (Latin) Rite',
  },
  {
    id: 'myth-orans-required-laity',
    myth: 'The congregation must hold their hands up like the priest during the Our Father.',
    verdict: 'FALSE',
    explanation:
      'The Roman Missal assigns the Orans gesture only to the priest, who prays in persona Christi capitis. The traditional, prescribed posture for the lay faithful is hands joined in prayer (junctis manibus).',
    officialDoc: 'GIRM 237 & Ecclesiae de Mysterio (1997)',
    riteContext: 'Roman (Latin) Rite',
  },
  {
    id: 'myth-holding-hands-rule',
    myth: 'You are disobeying the Mass rubrics if you refuse to hold hands during the Our Father.',
    verdict: 'FALSE',
    explanation:
      'Holding hands is not mentioned anywhere in any Catholic liturgical book on earth. It is an informal custom. No one should ever feel pressured or compelled to hold hands.',
    officialDoc: 'Notitiae (Congregation for Divine Worship 1981)',
    riteContext: 'Universal Catholic Church',
  },
];
