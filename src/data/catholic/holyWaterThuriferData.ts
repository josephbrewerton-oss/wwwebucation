// src/data/catholic/holyWaterThuriferData.ts
// St Joseph's Catholic Life & Faith Sanctuary
// Complete Catechesis: Holy Water (Aqua Benedicta), The Asperges, The Thurifer (Thuriferarius), & The Thurible (Thuribulum)

export interface HolyWaterFact {
  id: string;
  title: string;
  latinTitle: string;
  icon: string;
  summary: string;
  catechismRef: string;
  scriptureRef: string;
  theologicalDepth: string;
  practicalAction: string;
}

export interface ThuriferRoleFact {
  id: string;
  title: string;
  latinTitle: string;
  icon: string;
  serverRole: string;
  rubricRef: string;
  description: string;
  swingPattern: string;
  spiritualSignificance: string;
}

export interface IncensationMoment {
  order: number;
  moment: string;
  latinMoment: string;
  target: string;
  swings: string;
  girmRule: string;
  purpose: string;
}

export interface HolyWaterThuriferQuiz {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  citation: string;
}

export const HOLY_WATER_CATECHESIS: HolyWaterFact[] = [
  {
    id: 'sacramental-nature',
    title: 'Holy Water as a Sacred Sacramental',
    latinTitle: 'Aqua Benedicta Sacramentale',
    icon: '💧',
    summary: 'Holy water is not a Sacrament (like Baptism or Eucharist), but a Sacramental instituted by the Church to prepare our souls for grace.',
    catechismRef: 'CCC 1667–1670',
    scriptureRef: 'Numbers 5:17, 2 Kings 2:20–22',
    theologicalDepth: 'While the 7 Sacraments confer grace ex opere operato (by the very action performed by Christ), Sacramentals bear fruit through the intercession of the Church and the spiritual disposition of the believer (ex opere operantis Ecclesiae). Holy water sanctifies the everyday moments of Catholic life.',
    practicalAction: 'Keep a small holy water font by your bedroom door or entrance at home to bless yourself as you leave and return.'
  },
  {
    id: 'stoup-entrance',
    title: 'The Entrance Stoup & Sign of the Cross',
    latinTitle: 'Pila Aquae Benedictae ad Limen',
    icon: '⛪',
    summary: 'The holy water basin placed at every church door for entering and leaving the house of God.',
    catechismRef: 'CCC 1185, CCC 1213',
    scriptureRef: 'Ezekiel 36:25 — "I will sprinkle clean water upon you, and you shall be clean."',
    theologicalDepth: 'As we cross the church threshold from the secular world into the sanctuary of God, we dip the fingers of our right hand into the stoup and trace the Sign of the Cross over our forehead, chest, and shoulders. This physically recalls our Baptism, renounces worldly distractions, cleanses daily venial faults, and re-consecrates us to the Father, Son, and Holy Spirit.',
    practicalAction: 'Never rush past the stoup. Touch the water, pause, look toward the altar, and make the Sign of the Cross with deep, intentional reverence.'
  },
  {
    id: 'exorcised-salt',
    title: 'Blessed Salt & Water Preparation',
    latinTitle: 'Sal et Aqua Exorcizata',
    icon: '🧂',
    summary: 'Traditionally, pure water is blessed by the priest alongside exorcised salt before liturgical use.',
    catechismRef: 'Roman Ritual, De Benedictione Aquae',
    scriptureRef: '2 Kings 2:21 — Elisha cast salt into the spring: "Thus says the Lord, I have healed this water; there shall be no more death or miscarriage from it."',
    theologicalDepth: 'In the traditional Roman blessing, salt (the universal preservative that halts decay and adds flavour) is exorcised and mingled in the form of a triple cross into the water. This symbolizes spiritual incorruptibility, wisdom, the driving away of demonic oppression, and healing.',
    practicalAction: 'Reflect on Jesus saying: "You are the salt of the earth... you are the light of the world" (Matthew 5:13).'
  },
  {
    id: 'asperges-rite',
    title: 'The Asperges (Sunday Sprinkling Rite)',
    latinTitle: 'Ritus Aspersionis Aquae Benedictae',
    icon: '🌿',
    summary: 'On Sundays, the priest may replace the Penitential Act by walking through the church sprinkling the faithful with holy water.',
    catechismRef: 'GIRM 51, CCC 1154',
    scriptureRef: 'Psalm 51:7 — "Asperges me hyssopo, et mundabor: lavabis me, et super nivem dealbabor."',
    theologicalDepth: 'The priest carries the portable water vat (Aspersorium) and uses the sprinkler (Aspergillum). During the year, the choir chants Psalm 51 ("Purge me with hyssop, and I shall be clean; wash me, and I shall be whiter than snow"). During Eastertide, the chant shifts to "Vidi Aquam" (Ezekiel 47), seeing the river of life springing from Christ\'s pierced side.',
    practicalAction: 'When the priest sprinkles holy water over your pew during the Asperges, make the Sign of the Cross and bow your head in thanksgiving.'
  },
  {
    id: 'spiritual-protection',
    title: 'Spiritual Shield & Saint Teresa\'s Testimony',
    latinTitle: 'Scutum Spirituale Contra Malum',
    icon: '🛡️',
    summary: 'Holy water has unique sacramental power to drive away evil spirits, bad dreams, and spiritual anxiety.',
    catechismRef: 'CCC 1673',
    scriptureRef: 'James 4:7 — "Submit yourselves therefore to God. Resist the devil, and he will flee from you."',
    theologicalDepth: 'St Teresa of Ávila wrote in her autobiography (Chapter 31): "From nothing do the evil spirits flee more, nor more never to return, than from holy water. From the cross they also flee, but they return again: therefore the power of holy water must be great!" The Church empowers it with the prayers of all the faithful.',
    practicalAction: 'Sprinkle holy water in your bedroom or during times of temptation, illness, fear, or spiritual battle.'
  },
  {
    id: 'epiphany-home-blessing',
    title: 'Epiphany & Domestic Blessings',
    latinTitle: 'Benedictio Domorum in Epiphania',
    icon: '🚪',
    summary: 'The annual Catholic tradition of blessing homes with holy water and marking doors with blessed chalk.',
    catechismRef: 'Directory on Popular Piety §118',
    scriptureRef: 'Joshua 24:15 — "As for me and my house, we will serve the Lord."',
    theologicalDepth: 'At Epiphany (January 6), families mark the lintel with chalk: "20 + C + M + B + 26", representing Caspar, Melchior, Balthasar, and the Latin prayer "Christus Mansionem Benedicat" ("May Christ bless this house"). Holy water is sprinkled in every room to sanctify family life and invite Christ\'s peace.',
    practicalAction: 'Bless your family home every Epiphany and keep blessed chalk and holy water in your domestic prayer corner.'
  }
];

export const THURIFER_AND_INCENSE_CATECHESIS: ThuriferRoleFact[] = [
  {
    id: 'thurifer-identity',
    title: 'The Thurifer (Thuriferarius)',
    latinTitle: 'Thuriferarius Minister',
    icon: '🧑‍🤝‍🧑',
    serverRole: 'Leading Liturgical Altar Server',
    rubricRef: 'GIRM 100, 120, 276–277',
    description: 'The trained altar server entrusted to hold, swing, and maintain the burning thurible (censer) with dignity and precision throughout the Sacred Liturgy.',
    swingPattern: 'Walks at the head of processions with gentle rhythmic swings; stands gracefully beside the ambo and altar.',
    spiritualSignificance: 'The thurifer leads the entire assembly into the presence of God. Just as the pillar of smoke guided the Israelites through the desert (Exodus 13:21), the thurifer\'s smoking censer guides the Pilgrim Church into the Heavenly Jerusalem.'
  },
  {
    id: 'boat-bearer',
    title: 'The Boat Bearer (Navicularius)',
    latinTitle: 'Navicularius cum Navicula',
    icon: '⛵',
    serverRole: 'Junior Altar Server & Companion',
    rubricRef: 'GIRM 100, Ceremonial of Bishops §74',
    description: 'The companion server who carries the Incense Boat (Navicula) and the little liturgical spoon (cochlear), walking on the left of the thurifer.',
    swingPattern: 'Holds the boat steadily with both hands against the breast; opens the boat cover for the priest or bishop.',
    spiritualSignificance: 'The boat is shaped like a vessel (navis / church barque). The unburnt grains of frankincense await the spark of fire, symbolizing our human lives waiting to be transformed and consumed by the fire of divine charity.'
  },
  {
    id: 'thurible-anatomy',
    title: 'The Thurible & Charcoal Fire',
    latinTitle: 'Thuribulum & Igne Carbo',
    icon: '🏺',
    serverRole: 'Liturgical Vessel of Sacred Fire',
    rubricRef: 'CCC 1154, GIRM 327',
    description: 'A pierced metal censer suspended from chains: three chains guide the outer canopy lid, and a center chain raises or lowers the glowing charcoal firebowl.',
    swingPattern: 'Swung by the upper ring and chain with the right hand, with the left hand resting reverently upon the chest.',
    spiritualSignificance: 'The burning charcoal represents the fire of the Holy Spirit. Incense grains sprinkled on the coals immediately produce fragrant, rising smoke, representing our prayers ascending directly before the Throne of God (Psalm 141:2).'
  },
  {
    id: 'incense-grains-composition',
    title: 'Sacred Gums: Frankincense & Myrrh',
    latinTitle: 'Olibanum, Myrrha & Thymiama',
    icon: '🌿',
    serverRole: 'Natural Resin of the Earth',
    rubricRef: 'CCC 1154, Matthew 2:11',
    description: 'Pure aromatic tree resin harvested from Boswellia trees (frankincense / olibanum), historically blended with myrrh, cedar, and floral essences.',
    swingPattern: 'Spooned in 3 distinct measures onto the burning coals by the celebrant: "In the name of the Father, and of the Son, and of the Holy Spirit."',
    spiritualSignificance: 'One of the three gifts of the Magi: Gold for the King, Frankincense for God, and Myrrh for His redemptive death. Burning incense acknowledges that Jesus Christ is not merely a prophet, but the True Living God.'
  },
  {
    id: 'swing-rubrics',
    title: 'Liturgical Swings: Ductus & Ictus',
    latinTitle: 'Ductus et Ictus Thuribuli',
    icon: '🔄',
    serverRole: 'Precision Rubrics of Reverence',
    rubricRef: 'GIRM 277',
    description: 'The General Instruction of the Roman Missal specifies exact counts: 3 Double Swings for the Blessed Sacrament, the Altar Crucifix, the Gospel Book, the celebrating Priest, and the Congregation.',
    swingPattern: 'Ductus (raising the censer towards the sacred object) followed by two distinct Ictus (forward thrusts/clicks of the chain), repeated three times.',
    spiritualSignificance: 'Every swing is not mere performance; it is a profound physical confession of reverence for the divine presence, whether in the Eucharist, the Word, the ordained minister, or the baptised body of the congregation.'
  }
];

export const INCENSATION_MOMENTS: IncensationMoment[] = [
  {
    order: 1,
    moment: 'Entrance Procession',
    latinMoment: 'Processio Introitus',
    target: 'Processional Way & Sacred Space',
    swings: 'Gentle forward and back continuous swinging',
    girmRule: 'GIRM 120',
    purpose: 'Purifies the aisle and sanctifies the path as the cross, acolytes, deacons, and priest enter the sanctuary.'
  },
  {
    order: 2,
    moment: 'Opening of Mass: Altar & Cross',
    latinMoment: 'Incensatio Altaris et Crucis',
    target: 'High Altar, Altar Stone, Relics & Crucifix',
    swings: '3 double swings for the Crucifix; single swings while circling the Altar table',
    girmRule: 'GIRM 277a',
    purpose: 'Honours the Altar as the symbol of Christ the Living Stone, and venerates the holy relics of the martyrs enclosed within.'
  },
  {
    order: 3,
    moment: 'The Holy Gospel at the Ambo',
    latinMoment: 'Proclamatio Sancti Evangelii',
    target: 'The Book of the Gospels (Evangeliarium)',
    swings: '3 double swings (left, center, right)',
    girmRule: 'GIRM 277b',
    purpose: 'Proclaims that Christ Himself is about to speak to His people through the proclamation of the Good News.'
  },
  {
    order: 4,
    moment: 'The Offertory: Bread & Wine',
    latinMoment: 'Incensatio Oblationum',
    target: 'The Bread, Chalice, Altar, and Cross',
    swings: '3 signs of the cross over the gifts, circling gifts, then circling altar',
    girmRule: 'GIRM 277c',
    purpose: 'Offers the sacrifice with the words of Psalm 141: "May this incense, blessed by Thee, ascend unto Thee, O Lord, and may Thy mercy descend upon us."'
  },
  {
    order: 5,
    moment: 'Incensation of Priest & Congregation',
    latinMoment: 'Incensatio Sacerdotis et Populi',
    target: 'Celebrating Priest, Concelebrants, and the faithful',
    swings: '3 double swings for Priest; 3 double swings for the People',
    girmRule: 'GIRM 277d, 277e',
    purpose: 'The thurifer incenses the priest acting in persona Christi, then turns and incenses the congregation, honouring them as temples of the Holy Spirit.'
  },
  {
    order: 6,
    moment: 'The Consecration: Sacred Elevations',
    latinMoment: 'Elevatio Sanctissimi Sacramenti',
    target: 'Sacred Host & Chalice of Precious Blood',
    swings: '3 double swings at each elevation while kneeling',
    girmRule: 'GIRM 150, 277a',
    purpose: 'The thurifer kneels before the altar steps, incensing the True Body and Blood of Christ as the Sanctus bells chime in supreme Eucharistic adoration.'
  },
  {
    order: 7,
    moment: 'Eucharistic Adoration & Benediction',
    latinMoment: 'Benedictio cum Sanctissimo',
    target: 'Monstrance during Tantum Ergo',
    swings: '3 double swings while chanting Genitori Genitoque',
    girmRule: 'Holy Communion and Worship of the Eucharist §97',
    purpose: 'Adoration of the Blessed Sacrament exposed in the golden Monstrance, expressing praise to the hidden God.'
  }
];

export const HOLY_WATER_THURIFER_QUIZ: HolyWaterThuriferQuiz[] = [
  {
    id: 'quiz-1',
    question: 'Why do Catholics bless themselves with Holy Water upon entering and leaving church?',
    options: [
      'To recall Holy Baptism, renounce worldly distractions, cleanse venial faults, and consecrate ourselves to the Trinity',
      'Because church air conditioning requires damp fingertips',
      'It is a medieval etiquette rule to show the parish priest you have arrived',
      'To test whether the parish heating is working properly'
    ],
    correctIndex: 0,
    explanation: 'Holy water is a primary sacramental recalling our Baptism, when we were freed from original sin and became children of God (CCC 1668, 1213).',
    citation: 'CCC 1668'
  },
  {
    id: 'quiz-2',
    question: 'What is the official Latin name of the altar server who carries and swings the censer of incense?',
    options: [
      'The Crucifer (Cruciferarius)',
      'The Thurifer (Thuriferarius)',
      'The Acolyte (Acolythus)',
      'The Cantor (Cantor)'
    ],
    correctIndex: 1,
    explanation: 'The Thurifer (Thuriferarius) carries and swings the thurible, assisted by the Boat Bearer (Navicularius) who carries the incense boat.',
    citation: 'GIRM 100'
  },
  {
    id: 'quiz-3',
    question: 'According to Psalm 141:2, what does the sweet-smelling smoke of incense symbolize?',
    options: [
      'The morning fog over the hills of Jerusalem',
      'Our prayers rising up directly before God’s heavenly throne',
      'The extinguishing of altar candles',
      'The passing of seasonal time in the parish calendar'
    ],
    correctIndex: 1,
    explanation: 'Psalm 141:2 declares: "Let my prayer rise before you like incense, the lifting up of my hands like an evening sacrifice." St John sees the same in Revelation 8:3.',
    citation: 'Psalm 141:2, Rev 8:3–4'
  },
  {
    id: 'quiz-4',
    question: 'How many double swings of the thurible are specified by the GIRM when incensing the Blessed Sacrament, the Altar Crucifix, the Gospel Book, and the Priest?',
    options: [
      '1 single swing',
      '2 double swings',
      '3 double swings (ductus and ictus)',
      '5 continuous rapid swings'
    ],
    correctIndex: 2,
    explanation: 'GIRM 277 specifies three double swings (ductus and ictus) for the Most Blessed Sacrament, the relics of the Holy Cross, the images of the Lord exposed for public veneration, the offerings, the altar cross, the Book of the Gospels, the Paschal candle, the priest, and the congregation.',
    citation: 'GIRM 277'
  },
  {
    id: 'quiz-5',
    question: 'What is the name of the portable holy water vat (bucket) and sprinkler used by the priest during the Sunday Asperges rite?',
    options: [
      'The Ciborium and Paten',
      'The Aspersorium (Situla) and Aspergillum',
      'The Thurible and Navicula',
      'The Monstrance and Humeral Veil'
    ],
    correctIndex: 1,
    explanation: 'The Aspersorium is the portable bucket holding holy water, and the Aspergillum is the sprinkler (with bristles or perforated metal) used to sprinkle the congregation.',
    citation: 'GIRM 51'
  },
  {
    id: 'quiz-6',
    question: 'What is the crucial theological difference between a Sacrament and a Sacramental (like Holy Water or blessed incense)?',
    options: [
      'Sacraments were instituted directly by Jesus Christ and confer grace ex opere operato; Sacramentals are instituted by the Church and prepare our souls for grace through prayer',
      'There is no difference; they are exact synonyms in Canon Law',
      'Sacramentals can only be celebrated by bishops in cathedrals',
      'Sacraments do not require faith, but sacramentals do'
    ],
    correctIndex: 0,
    explanation: 'The Catechism (CCC 1667–1670) teaches that Sacramentals do not confer grace of the Holy Spirit in the way Sacraments do, but by the Church\'s prayer they prepare us to receive grace and dispose us to cooperate with it.',
    citation: 'CCC 1667–1670'
  }
];
