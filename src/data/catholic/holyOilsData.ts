// src/data/catholic/holyOilsData.ts
// St Joseph's Catholic Life & Faith Sanctuary
// Complete Catechetical Knowledge: The Three Holy Oils (Olea Sancta) & The Sacred Ambry

export interface HolyOil {
  id: 'SC' | 'OC' | 'OI';
  code: string;
  name: string;
  latinName: string;
  traditionalInitials: string;
  colorTheme: string;
  borderClass: string;
  bgLightClass: string;
  badgeClass: string;
  composition: string;
  hasBalsam: boolean;
  fragrance: string;
  consecrationType: 'Solemnly Consecrated (Consecratio)' | 'Blessed (Benedictio)';
  consecrationRite: string;
  primarySacraments: string[];
  anointingLocations: string[];
  spiritualMeaning: string;
  biblicalTypology: string;
  scriptureReferences: string[];
  catechismRefs: string[];
  liturgicalForm: string;
  vesselSymbol: string;
  vesselColor: string;
}

export interface HolyAmbryInfo {
  latinName: string;
  meaning: string;
  locationInChurch: string;
  reverenceAndCare: string;
  disposalOfOldOils: string;
  pocketOilStocks: string;
  chrismMassRite: string;
}

export const HOLY_OILS: HolyOil[] = [
  {
    id: 'SC',
    code: 'SC',
    name: 'Sacred Chrism',
    latinName: 'Sanctum Chrisma',
    traditionalInitials: 'S.C. (or CHR)',
    colorTheme: 'amber',
    borderClass: 'border-amber-400',
    bgLightClass: 'bg-amber-500/10',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    composition: 'Pure olive oil mixed with sweet, fragrant aromatic balsam (balsamum).',
    hasBalsam: true,
    fragrance: 'Rich, sweet, floral and balsamic perfume — symbolizing the "sweet fragrance of Christ" (2 Corinthians 2:15) and the sweet odour of sanctity.',
    consecrationType: 'Solemnly Consecrated (Consecratio)',
    consecrationRite: 'Solemnly consecrated by the Diocesan Bishop at the Chrism Mass on Holy Thursday. The Bishop breathes over the vessel (Insufflatio), invoking the Holy Spirit, and prays the solemn Prayer of Consecration.',
    primarySacraments: [
      'Baptism (Post-baptismal crown anointing)',
      'Confirmation (Essential matter on the forehead)',
      'Holy Orders (Priest\'s palms and Bishop\'s head)',
      'Dedication of Churches and Altars (Mensa & 12 wall crosses)'
    ],
    anointingLocations: [
      'Crown of the head at Baptism (Priest, Prophet, King)',
      'Forehead at Confirmation (Sign of the Cross)',
      'Palms of the hands for newly ordained Priests',
      'Crown of the head for newly consecrated Bishops',
      'The Mensa and four corners of the Altar',
      'Twelve stone/bronze crosses set in the church walls'
    ],
    spiritualMeaning: 'Confers the indelible sacramental seal (character) of the Holy Spirit. Anointed Christians share in the threefold mission of Christ: Priest, Prophet, and Universal King.',
    biblicalTypology: 'Typified by the sacred anointing oil compounded by Moses (Exodus 30:22-33), the anointing of King David (1 Samuel 16:13), and the prophecy of Isaiah: "The Spirit of the Lord GOD is upon me, because He hath anointed me" (Isaiah 61:1).',
    scriptureReferences: [
      'Exodus 30:22-33',
      'Psalm 133:2',
      'Isaiah 61:1',
      '2 Corinthians 2:15',
      '1 John 2:20-27'
    ],
    catechismRefs: ['CCC 1241', 'CCC 1289', 'CCC 1294', 'CCC 1574'],
    liturgicalForm: '"Be sealed with the Gift of the Holy Spirit" (Accipe signaculum doni Spiritus Sancti).',
    vesselSymbol: '🏺',
    vesselColor: '#f59e0b'
  },
  {
    id: 'OC',
    code: 'OC',
    name: 'Oil of Catechumens',
    latinName: 'Oleum Catechumenorum',
    traditionalInitials: 'O.C. (or O.S. for Oleum Sanctum)',
    colorTheme: 'emerald',
    borderClass: 'border-emerald-400',
    bgLightClass: 'bg-emerald-500/10',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    composition: 'Pure unadulterated 100% olive oil (no added perfume).',
    hasBalsam: false,
    fragrance: 'Clean, neutral aroma of pure pressed olive oil.',
    consecrationType: 'Blessed (Benedictio)',
    consecrationRite: 'Blessed by the Bishop during the Chrism Mass before the recitation of the Eucharistic Prayer.',
    primarySacraments: [
      'Sacrament of Baptism (Pre-baptismal anointing)',
      'Order of Christian Initiation of Adults (RCIA / OCIA Scrutinies)'
    ],
    anointingLocations: [
      'Breast / chest of infants or catechumens right after the Prayer of Exorcism and before the baptismal water'
    ],
    spiritualMeaning: 'Strength for spiritual battle and armor against temptation. Just as ancient gladiators and athletes rubbed oil on their bodies to slip away from the grasp of adversaries, the catechumen is fortified against Satan and the spirits of wickedness.',
    biblicalTypology: 'Typified by the athlete and warrior prepared for combat; Noah’s dove returning with the fresh olive branch of peace after the deluge (Genesis 8:11); the protection of God against the snare of the hunter.',
    scriptureReferences: [
      'Genesis 8:11',
      'Psalm 23:5',
      'Ephesians 6:11-13',
      '1 Peter 5:8-9'
    ],
    catechismRefs: ['CCC 1237'],
    liturgicalForm: '"We anoint you with the oil of salvation in the name of Christ our Saviour; may He strengthen you with His power, Who lives and reigns for ever and ever."',
    vesselSymbol: '🛡️',
    vesselColor: '#10b981'
  },
  {
    id: 'OI',
    code: 'OI',
    name: 'Oil of the Sick',
    latinName: 'Oleum Infirmorum',
    traditionalInitials: 'O.I. (or INF)',
    colorTheme: 'sky',
    borderClass: 'border-sky-400',
    bgLightClass: 'bg-sky-500/10',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    composition: 'Pure unadulterated 100% olive oil (or other pure vegetable oil if necessary).',
    hasBalsam: false,
    fragrance: 'Gentle, soothing natural olive oil aroma.',
    consecrationType: 'Blessed (Benedictio)',
    consecrationRite: 'Blessed by the Bishop at the Chrism Mass during the Canon of the Mass before the Doxology. In urgent pastoral emergencies, any Catholic priest may bless olive oil for the sick.',
    primarySacraments: [
      'Sacrament of the Anointing of the Sick',
      'Viaticum & The Last Rites (Apostolic Pardon & Commendation of the Dying)'
    ],
    anointingLocations: [
      'Forehead of the sick or elderly person',
      'Palms of the hands (or outer hands if palms are injured)'
    ],
    spiritualMeaning: 'Healing of soul and body, pardon for sins, fortitude against the despair and terror of death, and supernatural comfort uniting the patient’s sufferings with the Passion of Christ.',
    biblicalTypology: 'The Good Samaritan pouring oil and wine into the wounds of the traveller (Luke 10:34); Christ sending the Apostles to heal: "they cast out many demons, and anointed with oil many that were sick, and healed them" (Mark 6:13); the Letter of St James.',
    scriptureReferences: [
      'James 5:14-15',
      'Mark 6:13',
      'Luke 10:34'
    ],
    catechismRefs: ['CCC 1513', 'CCC 1519', 'CCC 1520'],
    liturgicalForm: '"Through this holy anointing may the Lord in His love and mercy help you with the grace of the Holy Spirit. Amen. / May the Lord who frees you from sin save you and raise you up. Amen."',
    vesselSymbol: '🕊️',
    vesselColor: '#38bdf8'
  }
];

export const HOLY_AMBRY_INFO: HolyAmbryInfo = {
  latinName: 'Ambriarium Sacrum (The Holy Ambry)',
  meaning: 'The dedicated wall niche or consecrated cabinet in a Catholic church where the Three Holy Oils are securely and reverently reserved throughout the liturgical year.',
  locationInChurch: 'Customarily built into the sanctuary wall near the Altar, or located within the Baptistery near the Baptismal Font. It often features a lockable glass door so the faithful can see the silver or crystal ampullae.',
  reverenceAndCare: 'The Ambry is inscribed with "Olea Sancta" (Holy Oils) or "O.I. • O.C. • S.C.". A small light or candle may burn near it, and purple or white silk veils may line the interior.',
  disposalOfOldOils: 'Every year, holy oils must be renewed at the Chrism Mass. The old oils are never poured down an ordinary sink; they are either burned in the parish Easter Vigil Fire, or absorbed in cotton wool and burned reverently, or poured into the Sacrarium (the special church drain that flows directly into clean earth).',
  pocketOilStocks: 'For pastoral hospital visits, hospice calls, and emergencies, Catholic priests carry a compact silver three-compartment pocket oil stock (Olearium / Chrismarium). Each threaded tier is marked with "I" (Infirmorum), "B" or "C" (Catechumenorum), and "CHR" (Chrism), packed with cotton wool saturated in the oils to prevent leakage.',
  chrismMassRite: 'Celebrated annually during Holy Week (traditionally Holy Thursday morning) by the Diocesan Bishop and all the priests of the diocese concelebrating at the Cathedral. During this Mass, priests renew their ordination vows, and the holy oils are blessed and distributed to every parish.'
};

export interface SacramentalOilQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  oilId: 'SC' | 'OC' | 'OI';
}

export const HOLY_OILS_QUIZ: SacramentalOilQuizQuestion[] = [
  {
    id: 1,
    question: 'Which of the Three Holy Oils contains sweet aromatic balsam and is consecrated with the Bishop breathing over it?',
    options: ['Oil of the Sick (O.I.)', 'Sacred Chrism (S.C.)', 'Oil of Catechumens (O.C.)', 'Holy Water'],
    correctIndex: 1,
    explanation: 'Sacred Chrism (Sanctum Chrisma) is the only oil mixed with sweet-smelling balsam. It is solemnly consecrated by the Bishop through the Insufflatio (breathing of the Spirit).',
    oilId: 'SC'
  },
  {
    id: 2,
    question: 'Where is the Oil of Catechumens (O.C.) anointed during the Rite of Baptism?',
    options: ['On the palms of the hands', 'On the crown of the head', 'On the chest / breast of the recipient', 'On the soles of the feet'],
    correctIndex: 2,
    explanation: 'The priest or deacon anoints the chest/breast of the catechumen with O.C. right after the prayer of exorcism, giving spiritual armor before the water.',
    oilId: 'OC'
  },
  {
    id: 3,
    question: 'Which biblical Epistle gives the explicit instruction: "Is any among you sick? Let him call for the elders of the church..."?',
    options: ['Letter to the Hebrews', 'Epistle of St James (5:14)', 'First Letter of St Paul to Timothy', 'Gospel of St Matthew'],
    correctIndex: 1,
    explanation: 'James 5:14-15 forms the classic scriptural mandate for the Sacrament of the Anointing of the Sick using the Oleum Infirmorum.',
    oilId: 'OI'
  },
  {
    id: 4,
    question: 'What is the sacred cabinet in a church wall called where the three holy oils are kept?',
    options: ['The Tabernacle', 'The Ambry (Ambriarium)', 'The Ambo', 'The Sacrarium'],
    correctIndex: 1,
    explanation: 'The Ambry (Ambriarium) is the designated sanctuary or baptistery niche for the three holy oils, marked with Olea Sancta.',
    oilId: 'SC'
  },
  {
    id: 5,
    question: 'What happens to the remaining old holy oils when the new ones arrive from the Chrism Mass?',
    options: ['They are poured down the kitchen sink', 'They are sold to parishioners', 'They are burned in the Easter Fire or buried in the Sacrarium', 'They are kept in storage indefinitely'],
    correctIndex: 2,
    explanation: 'Old blessed oils are never discarded casually. They are burned in the Easter Vigil Fire or disposed into the Sacrarium directly into the earth.',
    oilId: 'SC'
  },
  {
    id: 6,
    question: 'What indelible mark does Sacred Chrism leave in Baptism, Confirmation, and Holy Orders?',
    options: ['A temporary blessing that expires', 'A visible physical scar', 'An indelible spiritual character (seal) that can never be repeated', 'A parish membership card'],
    correctIndex: 2,
    explanation: 'Sacred Chrism imparts an indelible sacramental character (CCC 1294). Therefore, Baptism, Confirmation, and Holy Orders cannot be repeated.',
    oilId: 'SC'
  }
];
