// src/data/catholic/altarData.ts
// St Joseph's Catholic Life & Faith Sanctuary
// Complete Catechetical Knowledge: Sacred Anatomy of the Catholic Altar & Types of Altars

export interface AltarTypeInfo {
  id: string;
  name: string;
  latinName: string;
  subtitle: string;
  description: string;
  theologicalSignificance: string;
  canonicalNorm: string;
  architecturalFeatures: string[];
  historicalContext: string;
  icon: string;
}

export interface AltarCandleRule {
  count: number;
  mode: 'daily' | 'sunday' | 'bishop';
  title: string;
  latinTitle: string;
  occasion: string;
  canonicalCitation: string;
  theologicalReason: string;
  placementPattern: string;
  historicalContext: string;
  badge: string;
}

export interface AltarAppointment {
  id: string;
  name: string;
  latinName: string;
  category: 'Structure' | 'Linen' | 'Vessel' | 'Book' | 'Light & Reverence' | 'Credence' | 'Sacrament & Reservation';
  placement: string;
  description: string;
  spiritualMeaning: string;
  catechismRef: string;
  icon: string;
  hotspot: { x: number; y: number; r: number };
}

export interface AltarDressingStep {
  step: number;
  title: string;
  latinTitle: string;
  action: string;
  catecheticalReason: string;
  itemKey: string;
}

export interface LiturgicalSeasonTheme {
  season: string;
  latinSeason: string;
  colorName: string;
  hex: string;
  borderHex: string;
  textHex: string;
  meaning: string;
  whenUsed: string;
}

export const LITURGICAL_SEASON_THEMES: Record<string, LiturgicalSeasonTheme> = {
  green: {
    season: 'Ordinary Time',
    latinSeason: 'Tempus per Annum',
    colorName: 'Liturgical Green (Viridis)',
    hex: '#15803d',
    borderHex: '#22c55e',
    textHex: '#bbf7d0',
    meaning: 'Spiritual growth, hope, renewal, and the life of grace flourishing in daily discipleship.',
    whenUsed: 'Sundays and weekdays between Epiphany and Lent, and between Pentecost and Advent.',
  },
  purple: {
    season: 'Advent & Lent',
    latinSeason: 'Adventus & Quadragesima',
    colorName: 'Liturgical Violet / Purple (Violaceus)',
    hex: '#6b21a8',
    borderHex: '#a855f7',
    textHex: '#f3e8ff',
    meaning: 'Penance, preparation, spiritual vigilance, examination of conscience, and longing for redemption.',
    whenUsed: 'The 4 weeks of Advent preparing for the Nativity, and the 40 days of Lent preparing for Easter.',
  },
  white: {
    season: 'Easter & Christmas Solemnities',
    latinSeason: 'Pascha & Nativitas Domini',
    colorName: 'Liturgical White & Gold (Albus / Aureus)',
    hex: '#ca8a04',
    borderHex: '#facc15',
    textHex: '#fef08a',
    meaning: 'Purity, triumphant joy, heavenly light, resurrection victory, and the majesty of the Lord.',
    whenUsed: 'Easter Sunday and the 50 days of Eastertide, Christmas Season, Feasts of Our Lord, Our Lady, Angels, and Non-Martyr Saints.',
  },
  red: {
    season: 'Pentecost & Passion',
    latinSeason: 'Pentecoste & Passio Domini',
    colorName: 'Liturgical Red (Ruber)',
    hex: '#b91c1c',
    borderHex: '#ef4444',
    textHex: '#fecaca',
    meaning: 'The fire of the Holy Spirit, burning divine charity, and the sacrificial blood shed for Christ.',
    whenUsed: 'Palm Sunday, Good Friday, Pentecost Sunday, Confirmation liturgies, and feasts of the Holy Apostles and Martyrs.',
  },
  rose: {
    season: 'Gaudete & Laetare',
    latinSeason: 'Gaudete & Laetare',
    colorName: 'Liturgical Rose / Pink (Rosaceus)',
    hex: '#be185d',
    borderHex: '#f472b6',
    textHex: '#fce7f3',
    meaning: 'Joyful anticipation breaking through the violet period of penance—the light of Easter and Christmas is near.',
    whenUsed: 'Third Sunday of Advent (Gaudete Sunday) and Fourth Sunday of Lent (Laetare Sunday).',
  },
};

export const ALTAR_CANDLE_RULES: Record<'daily' | 'sunday' | 'bishop', AltarCandleRule> = {
  daily: {
    count: 2,
    mode: 'daily',
    title: 'Daily / Ferial Mass (Normal Celebration)',
    latinTitle: 'Missa Quotidiana / Ferialis (Duae Candelae)',
    occasion: 'Standard weekday Masses, memorials of saints, and ordinary ferial liturgies.',
    canonicalCitation: 'GIRM 117 & GIRM 307',
    theologicalReason:
      'The minimum requirement is two candles flanking the altar. These two candles symbolize the two natures of Jesus Christ: True God and True Man hypostatically united in one Divine Person. Christ offers Himself as divine Priest and human Victim.',
    placementPattern: 'One candle on the left (Gospel side) and one candle on the right (Epistle side).',
    historicalContext:
      'In early Christian practice, candles carried in the entrance procession were placed on or around the mensa to illuminate the sacred mysteries and express liturgical honor.',
    badge: '🕯️ 2 Candles • Normal Weekday Mass',
  },
  sunday: {
    count: 6,
    mode: 'sunday',
    title: 'Sunday Mass & High Solemnities',
    latinTitle: 'Missa Solemnis / Dominicalis (Sex Candelae)',
    occasion: 'Sundays, Holy Days of Obligation, Solemnities of Our Lord and the Blessed Virgin Mary.',
    canonicalCitation: 'GIRM 117 ("or even four or six, especially for a Sunday Mass or a Holyday of Obligation")',
    theologicalReason:
      'Six candles flank the central Crucifix (three on the Gospel side, three on the Epistle side). They signify the six days of Creation fulfilled in the Sabbath resurrection of Christ, the cosmic majesty of the Lord’s Day, and the high solemnity of the Eucharistic banquet.',
    placementPattern:
      'Three candles on the left and three on the right, arranged symmetrically on the mensa or surrounding candelabra, framing the Crucifix.',
    historicalContext:
      'Traditional Roman Rite High Mass historically mandated six candles on the high altar gradine. GIRM 117 maintains four or six as the solemn standard for every parish Sunday celebration.',
    badge: '✨ 6 Candles • Sunday Mass & Solemnities',
  },
  bishop: {
    count: 7,
    mode: 'bishop',
    title: 'Pontifical Mass: Diocesan Bishop in the House!',
    latinTitle: 'Missa Pontificalis (Septem Candelae cum Episcopo Dioecesano)',
    occasion: 'Whenever the Diocesan Bishop celebrates Mass within his own diocese (Cathedral or parish visitation).',
    canonicalCitation: 'GIRM 117 & Caeremoniale Episcoporum (Ceremonial of Bishops) §125',
    theologicalReason:
      'The seventh candle (candela septima) proclaims that the Diocesan Bishop possesses the fullness of Holy Orders (plenitudo sacerdotii) as the chief shepherd, high priest, and successor to the Apostles in his local Church. It directly evokes Revelation 1:12–20, where Christ the High Priest walks in the midst of the seven golden lampstands, and the seven gifts of the Holy Spirit (Isaiah 11:2).',
    placementPattern:
      'Six candles flanking the altar plus a prominent seventh candlestick placed in the center, directly in line with or beside the Crucifix. (Only lit when the Diocesan Bishop himself celebrates, not for auxiliary bishops or visiting prelates outside their territory unless specially granted).',
    historicalContext:
      'Traced to ancient Roman papal and stational liturgies where seven acolytes carrying seven torches led the Bishop of Rome into the basilica, placing their lamps around the altar as a sign of apostolic fullness.',
    badge: '👑 7 Candles • Diocesan Bishop in the House!',
  },
};

export const ALTAR_TYPES: AltarTypeInfo[] = [
  {
    id: 'freestanding',
    name: 'Free-Standing Altar of Sacrifice',
    latinName: 'Altare Versus Populum',
    subtitle: 'Primary Eucharistic Table of the Holy Sacrifice',
    icon: '⛪',
    description:
      'The central altar mandated by modern Catholic liturgical norms (GIRM 299). It is built free-standing from the sanctuary back wall so the priest and sacred ministers can walk entirely around it, cense it on all sides, and celebrate the Holy Mass facing towards the gathered people (versus populum) or ad orientem.',
    theologicalSignificance:
      'The altar is the sign of Christ Himself standing in the midst of His assembly. It is both the sacrificial altar where the eternal sacrifice of Calvary is made sacramentally present, and the banquet table of the Lord where the family of God is nourished with the Bread of Angels.',
    canonicalNorm:
      'General Instruction of the Roman Missal (GIRM) 299: "The altar should be built separate from the wall, in such a way that it is possible to walk around it easily and that Mass can be celebrated at it facing the people, which is desirable wherever possible."',
    architecturalFeatures: [
      'Placed centrally in the sanctuary, slightly elevated by one to three steps (suppedaneum)',
      'Constructed ideally of natural stone (mensa) representing Christ the Living Rock',
      'Consecrated by the diocesan Bishop with Sacred Chrism poured onto five cross points',
      'Encloses an altar stone containing verified first-class relics of martyrs/saints',
      'Draped in clean white linen cloths and adorned with an antependium in the seasonal liturgical color',
    ],
    historicalContext:
      'While free-standing altars were used in ancient Roman basilicas (such as St. Peter’s and St. John Lateran), the liturgical reforms of the Second Vatican Council restored the free-standing altar as the universal norm for parish sanctuaries across the world.',
  },
  {
    id: 'high-altar',
    name: 'High Altar & Reredos',
    latinName: 'Altare Maius cum Retabulo',
    subtitle: 'Historic High Altar Ad Orientem with Sacred Retable',
    icon: '🏛️',
    description:
      'The historic, ornate high altar situated against the eastern apse of traditional Catholic basilicas. The priest stands facing in the same liturgical direction as the congregation (ad orientem—towards the rising sun, symbolizing the expectant wait for Christ’s Second Coming).',
    theologicalSignificance:
      'It emphasizes the cosmic and sacrificial dimensions of the Holy Mass. Priest and people together turn towards the liturgical East, offering prayer towards God rather than looking inward at each other. The towering reredos visually lifts human eyes toward Heaven.',
    canonicalNorm:
      'GIRM 303: In churches where an older high altar cannot be moved without artistic damage, it should be kept adorned with dignity, while the celebration of the Eucharist takes place at the free-standing altar.',
    architecturalFeatures: [
      'Built against or near the sanctuary apse, often surmounted by a magnificent carved reredos or retable',
      'Features stepped tiers (gradines) holding numerous beeswax candles, flower vases, and reliquaries',
      'Frequently crowned by an integral Tabernacle throne for the reservation of the Blessed Sacrament',
      'Often sheltered by a carved stone or wooden canopy known as a ciborium or baldacchino (e.g. Bernini’s at St. Peter’s)',
    ],
    historicalContext:
      'Prevalent throughout the Medieval, Renaissance, Baroque, and Neo-Gothic eras of church architecture. Many historic English Catholic churches (such as those designed by Augustus Pugin) feature breathtaking high altars crafted in Caen stone and gold leaf.',
  },
  {
    id: 'altar-stone',
    name: 'The Consecrated Altar Stone & Relics',
    latinName: 'Ara / Petra Sacra cum Reliquiis',
    subtitle: 'The Sacred Relic Inset of Martyrs and the Five Wounds',
    icon: '🪨',
    description:
      'A rectangular slab of solid marble or natural stone consecrated directly by the Bishop. It is inset into the center of the wooden or stone mensa. At its center lies a small hollow chamber called the Sepulchrum, sealed with mortar and containing the first-class relics of Catholic martyrs or saints.',
    theologicalSignificance:
      'Recalls the ancient catacombs where the early Christians celebrated Mass directly upon the tombs of holy martyrs who shed their blood for Christ. The five engraved crosses cut into the stone represent the Five Sacred Wounds of Jesus on the Cross (hands, feet, and pierced heart).',
    canonicalNorm:
      'Canon Law (CIC Can. 1237 §2) & GIRM 302: "The ancient practice of placing relics of Martyrs or other Saints under a fixed altar or beneath the altar stone is fittingly retained, provided the relics are authentic."',
    architecturalFeatures: [
      'Solid natural marble or stone, typically 12×12 inches or 18×18 inches',
      'Five distinct crosses incised into the four corners and center, anointed with holy chrism during consecration',
      'Sepulchrum (hollow cavity) sealed by the Bishop containing relics wrapped in silk along with an official parchment certificate',
      'Protected beneath the waxed cloth (chrismale) and altar linens directly where the chalice and paten sit',
    ],
    historicalContext:
      'Revelation 6:9: "I saw under the altar the souls of those who had been slaughtered for the word of God and for the testimony they had given." This scriptural passage established the 2,000-year uninterrupted Catholic tradition of celebrating Mass over the martyrs.',
  },
  {
    id: 'side-altar',
    name: 'Devotional Side Altars & Shrines',
    latinName: 'Altaria Minora (Marianum & S. Josephi)',
    subtitle: 'Lady Altar, St. Joseph Altar & Sacred Heart Shrines',
    icon: '🌹',
    description:
      'Auxiliary altars situated in side chapels or the transepts of the church. The most prominent are the Lady Altar (dedicated to the Blessed Virgin Mary, traditionally in the northern transept) and the St. Joseph Altar (dedicated to the Foster Father of Jesus and Patron of the Universal Church).',
    theologicalSignificance:
      'They provide sacred havens for personal meditation, the recitation of the Holy Rosary, private novenas, and the lighting of devotional votive candles. They honor the communion of saints who intercede for us before the throne of God.',
    canonicalNorm:
      'GIRM 318: "In the building of new churches or the renovation of old ones, side altars should be fewer in number and arranged so that they do not distract from the central focus on the high altar of sacrifice."',
    architecturalFeatures: [
      'Placed in dedicated side chapels or transept niches away from the central sanctuary axis',
      'Adorned with statues, icons, stained glass, and votive candle stands (vigil lights)',
      'Equipped with their own consecrated mensa, crucifix, and altar cloths for the celebration of Masses for small groups or feast days',
      'Surrounded by kneeler rails for quiet family prayer and thanksgiving',
    ],
    historicalContext:
      'Throughout the centuries, parish guilds and families maintained side altars dedicated to their patron saints. At St Joseph’s, the Lady Chapel and St Joseph’s shrine form the daily heartbeat of pupil intercessory prayer.',
  },
];

export const ALTAR_APPOINTMENTS: AltarAppointment[] = [
  {
    id: 'mensa',
    name: 'The Mensa (Altar Top)',
    latinName: 'Mensa Altaris',
    category: 'Structure',
    placement: 'Top horizontal surface of the altar',
    description:
      'The flat table surface of the altar, strictly made of natural stone or hardwood containing an altar stone. Consecrated with Holy Chrism, it is the foundational bedrock upon which the Eucharistic mystery unfolds.',
    spiritualMeaning:
      'Represents Jesus Christ Himself, the "Cornerstone" rejected by the builders which has become the head of the corner (1 Peter 2:7). Christ is simultaneously the Priest, the Altar, and the Sacrificial Lamb.',
    catechismRef: 'CCC 1182',
    icon: '🪵',
    hotspot: { x: 400, y: 130, r: 24 },
  },
  {
    id: 'antependium',
    name: 'The Altar Frontal (Antependium)',
    latinName: 'Antependium / Frontale',
    category: 'Structure',
    placement: 'Hanging across the entire front face of the altar',
    description:
      'A rich textile hanging that covers the front face of the altar. It is embroidered with sacred monograms (IHS, Chi-Rho, Pelican, Lamb of God) and matches the prevailing liturgical colour of the liturgical season or feast.',
    spiritualMeaning:
      'Clothes the altar with royal dignity, mirroring the vestments of the priest and teaching the faithful the current spiritual season of grace through visual beauty.',
    catechismRef: 'CCC 1155',
    icon: '🎨',
    hotspot: { x: 400, y: 165, r: 28 },
  },
  {
    id: 'altar-cloth',
    name: 'The White Altar Linen',
    latinName: 'Linteum Altaris',
    category: 'Linen',
    placement: 'Spread over the entire mensa',
    description:
      'Out of supreme reverence for the celebration of the Eucharistic sacrifice, the mensa is covered with at least one pure white linen cloth (traditionally three layers) falling gracefully over both sides.',
    spiritualMeaning:
      'Symbolizes the clean burial shroud of Jesus in which St. Joseph of Arimathea reverently wrapped Christ’s sacred Body in the garden tomb (Matthew 27:59).',
    catechismRef: 'GIRM 304, CCC 1383',
    icon: '📜',
    hotspot: { x: 400, y: 122, r: 20 },
  },
  {
    id: 'altar-crucifix',
    name: 'The Central Altar Crucifix',
    latinName: 'Crux Altaris',
    category: 'Light & Reverence',
    placement: 'In the center on or immediately near the altar',
    description:
      'A cross with the figure of Christ crucified clearly depicted. It must be positioned on or near the altar so as to be clearly visible not only to the celebrating priest but to the entire gathered congregation.',
    spiritualMeaning:
      'Unmistakably proclaims that the Holy Sacrifice of the Mass is one and the same sacrifice as Calvary. The priest does not offer a new sacrifice; he re-presents Christ’s once-for-all self-offering on the Cross.',
    catechismRef: 'GIRM 308, CCC 1366',
    icon: '✝️',
    hotspot: { x: 400, y: 88, r: 18 },
  },
  {
    id: 'altar-candles',
    name: 'Altar Candles (2, 6, or 7 Beeswax Candles)',
    latinName: 'Candelae Altaris (2, 6 vel 7 Candelae)',
    category: 'Light & Reverence',
    placement: 'Arranged symmetrically on or beside the altar framing the Crucifix',
    description:
      'The number of altar candles is strictly regulated by the Roman Missal (GIRM 117): AT LEAST 2 for normal daily Mass; 4 or 6 for Sunday Mass and Holy Days of Obligation; and SEVEN CANDLES whenever the Diocesan Bishop celebrates Mass in his own diocese! Liturgical candles must contain pure beeswax.',
    spiritualMeaning:
      'The number of candles communicates the liturgical rank and order: 2 candles honor Christ’s dual natures (God and Man); 6 candles recall the six days of Creation fulfilled in the Lord’s Day Resurrection; 7 candles proclaim the fullness of the priesthood residing in the Bishop (Revelation 1:12-20, seven golden lampstands; Isaiah 11:2, seven gifts of the Spirit). Virgin beeswax symbolizes Christ’s sinless Flesh born of the Virgin Mary, the wick His human soul, and the flame His divinity.',
    catechismRef: 'GIRM 117, 307; Caeremoniale Episcoporum 125',
    icon: '🕯️',
    hotspot: { x: 345, y: 105, r: 16 },
  },
  {
    id: 'corporal',
    name: 'The Corporal',
    latinName: 'Corporale',
    category: 'Linen',
    placement: 'Unfolded squarely in the center of the altar table',
    description:
      'A square white linen cloth folded into 9 neat squares. It is unfolded by the priest or deacon at the Offertory right in the center of the mensa. The chalice, paten, and ciborium rest directly upon it.',
    spiritualMeaning:
      'Derived from the Latin "corpus" (body). It is specifically designed to catch any sacred microscopic particles or drops of the consecrated Body and Blood of Christ, ensuring infinite reverence for the Real Presence.',
    catechismRef: 'CCC 1385',
    icon: '⬜',
    hotspot: { x: 400, y: 126, r: 16 },
  },
  {
    id: 'chalice',
    name: 'The Sacred Chalice',
    latinName: 'Calix Sanguinis Christi',
    category: 'Vessel',
    placement: 'Set upon the corporal in the center of the altar',
    description:
      'The consecrated golden cup made of noble, precious metal that holds the pure grape wine mixed with water that becomes the Precious Blood of Jesus Christ during the Eucharistic Prayer.',
    spiritualMeaning:
      'Directly fulfills the command of Christ at the Last Supper: "Drink of it, all of you; for this is my blood of the covenant, which is poured out for many for the remission of sins" (Matthew 26:27-28).',
    catechismRef: 'CCC 1334',
    icon: '🏆',
    hotspot: { x: 418, y: 120, r: 14 },
  },
  {
    id: 'paten',
    name: 'The Paten with Consecration Host',
    latinName: 'Patena cum Hostia',
    category: 'Vessel',
    placement: 'Placed on the corporal in front of the chalice',
    description:
      'A circular plate of polished gold or silver that holds the large unleavened wheaten host that the priest elevates, breaks during the Fraction rite, and consumes at Holy Communion.',
    spiritualMeaning:
      'Holds the bread of sacrifice that becomes the living Flesh of the Son of God. Derived from Latin "patina", representing the platter of the Last Supper.',
    catechismRef: 'CCC 1150',
    icon: '🪙',
    hotspot: { x: 382, y: 124, r: 14 },
  },
  {
    id: 'purificator',
    name: 'The Purificator',
    latinName: 'Purificatorium',
    category: 'Linen',
    placement: 'Draped across the chalice beneath the paten',
    description:
      'A rectangular linen cloth embroidered with a small red cross in its center. The priest and deacon use it to wipe the lip of the chalice and dry the sacred vessels after the ablutions.',
    spiritualMeaning:
      'Demonstrates meticulous care that no drop of the Precious Blood or Eucharistic particle is treated casually or discarded.',
    catechismRef: 'GIRM 118',
    icon: '📜',
    hotspot: { x: 428, y: 114, r: 12 },
  },
  {
    id: 'pall',
    name: 'The Sacred Pall',
    latinName: 'Palla',
    category: 'Linen',
    placement: 'Placed directly on top of the chalice and paten',
    description:
      'A stiffened square of cardboard or plastic covered in pure white linen, often embroidered with a gold cross or IHS monogram. It rests squarely on the rim of the chalice.',
    spiritualMeaning:
      'Protects the Precious Blood from any falling dust, lint, or insects during the celebration of Mass. Symbolizes the stone rolled against Christ’s sepulchre.',
    catechismRef: 'GIRM 118',
    icon: '🛡️',
    hotspot: { x: 418, y: 110, r: 12 },
  },
  {
    id: 'roman-missal',
    name: 'The Roman Missal & Stand',
    latinName: 'Missale Romanum cum Pulvinari',
    category: 'Book',
    placement: 'On the left side of the altar facing the priest',
    description:
      'The official liturgical book containing the prayers, entrance antiphons, prefaces, and Eucharistic Prayers for the celebration of Holy Mass, supported by a wooden or brass missal stand (or cushion).',
    spiritualMeaning:
      'Unifies the global Catholic Church across 2,000 years in one voice of worship, ensuring that the ancient apostolic prayers are proclaimed faithfully.',
    catechismRef: 'CCC 1154',
    icon: '📖',
    hotspot: { x: 340, y: 122, r: 16 },
  },
  {
    id: 'cruets-lavabo',
    name: 'Cruets, Lavabo Dish & Finger Towel',
    latinName: 'Ampullae, Pelvis & Manutergium',
    category: 'Credence',
    placement: 'Credence table on the liturgical south side',
    description:
      'Two glass cruets holding pure grape wine (V) and water (A), accompanied by the lavabo basin and white finger towel used when the priest washes his hands after the Offertory.',
    spiritualMeaning:
      'When the drop of water is mixed into the wine, the priest whispers: "By the mystery of this water and wine may we come to share in the divinity of Christ who humbled himself to share in our humanity." The handwashing echoes Psalm 26: "Wash me, O Lord, from my iniquity."',
    catechismRef: 'GIRM 118, CCC 1333',
    icon: '🏺',
    hotspot: { x: 472, y: 138, r: 16 },
  },
  {
    id: 'sanctus-bells',
    name: 'Sanctuary Bells (Sanctus Chimes)',
    latinName: 'Campanae Sanctuarii',
    category: 'Light & Reverence',
    placement: 'Near the altar steps or sanctuary floor',
    description:
      'A set of handheld brass bells rung by the altar server at the Sanctus, at the Epiclesis (when the priest extends his hands over the gifts), and during the high Elevation of the Sacred Host and Chalice.',
    spiritualMeaning:
      'Alerts the whole congregation: "Look up! Adore Christ! The mystery of transubstantiation is taking place right now before your eyes!"',
    catechismRef: 'GIRM 150',
    icon: '🔔',
    hotspot: { x: 462, y: 154, r: 14 },
  },
  {
    id: 'tabernacle',
    name: 'The Sacred Tabernacle of the Blessed Sacrament',
    latinName: 'Tabernaculum Sanctissimi Sacramenti',
    category: 'Sacrament & Reservation',
    placement: 'Noble, conspicuous location in the sanctuary or dedicated Eucharistic chapel; traditionally centered on the High Altar',
    description:
      'The inviolable, consecrated dwelling place (from Latin tabernaculum, meaning "tent") where the consecrated Holy Eucharist—the Real, Substantial Body, Blood, Soul, and Divinity of Jesus Christ—is reserved in the golden Ciborium. Secured by a key, veiled by the Conopeum, and guarded day and night by the burning red Sanctuary Lamp.',
    spiritualMeaning:
      'Directly fulfills the Old Testament Mishkan (Tent of Meeting) where God’s Shekinah Glory dwelt in the desert (Exodus 40:34–38). St. John declares: "The Word was made flesh and pitched His tent (tabernacled) among us" (John 1:14). It is the living heart of every Catholic parish church.',
    catechismRef: 'CCC 1379, CIC Can. 938, GIRM 314–317',
    icon: '🏛️',
    hotspot: { x: 400, y: 72, r: 24 },
  },
  {
    id: 'sanctuary-lamp',
    name: 'The Red Sanctuary Lamp (Perpetual Presence Light)',
    latinName: 'Lampas Sanctuarii',
    category: 'Light & Reverence',
    placement: 'Suspended near or standing immediately beside the Tabernacle',
    description:
      'A vigil light enclosed in deep red glass, fueled by wax or pure olive oil, that burns unceasingly day and night beside the Tabernacle whenever the Blessed Sacrament is reserved. It is extinguished only on Good Friday when the Tabernacle stands empty and bare.',
    spiritualMeaning:
      'Canon Law (CIC Can. 940) mandates that this flame burn continuously to honor and signal the physical Real Presence of Jesus Christ in the Holy Eucharist to all who enter the temple: "The Master is here and calling for you" (John 11:28).',
    catechismRef: 'CIC Can. 940, CCC 1183, GIRM 316',
    icon: '🔴',
    hotspot: { x: 440, y: 55, r: 16 },
  },
  {
    id: 'ciborium',
    name: 'The Ciborium (Holding the Consecrated Hosts)',
    latinName: 'Ciborium cum Hostiarum',
    category: 'Vessel',
    placement: 'Enclosed securely inside the Tabernacle upon a consecrated corporal',
    description:
      'A chalice-like sacred vessel crafted of precious gold or silver, fitted with an arched lid and surmounted by a cross. Derived from Latin cibus ("food"), it holds the consecrated Eucharistic Hosts reserved for distribution at Holy Communion and for the sick and dying (Viaticum).',
    spiritualMeaning:
      'Prefigured by the Golden Jar of Manna placed inside the Ark of the Covenant (Hebrews 9:4). The true Heavenly Bread that came down from Heaven to give eternal life to the world.',
    catechismRef: 'CCC 1379, GIRM 327',
    icon: '✨',
    hotspot: { x: 400, y: 80, r: 16 },
  },
  {
    id: 'thurible-navicula',
    name: 'The Thurible (Censer) & Incense Boat',
    latinName: 'Thuribulum & Navicula Incensi',
    category: 'Credence',
    placement: 'On the incense stand or credence table near the sanctuary; carried by the Thurifer',
    description:
      'The chained metal censer containing glowing charcoal onto which fragrant grains of frankincense are spooned from the ship-shaped boat (navicula). Used by the priest and the thurifer during solemn processions, at the Gospel, at the Offertory, and at the high elevations of the Consecration.',
    spiritualMeaning:
      'Symbolizes our prayers rising into heaven like sweet perfume before the throne of God: "Let my prayer rise before you like incense, the lifting up of my hands like the evening sacrifice" (Psalm 141:2, Revelation 8:3–4). Honours Christ\'s Real Presence, purifies the sanctuary, and sanctifies the congregation.',
    catechismRef: 'CCC 1154, GIRM 276–277',
    icon: '🏺',
    hotspot: { x: 480, y: 170, r: 16 },
  },
  {
    id: 'aspersorium-aspergillum',
    name: 'The Aspersorium & Aspergillum (Holy Water Vat & Sprinkler)',
    latinName: 'Aspersorium cum Aspergillo',
    category: 'Credence',
    placement: 'Credence table or entrance stoup, carried during the Sunday Sprinkling Rite (Asperges)',
    description:
      'The portable metal bucket (situla / aspersorium) containing holy water and the hyssop sprinkler (aspergillum). Used on Sundays for the Asperges / Vidi Aquam rite replacing the Penitential Act, as well as for liturgical blessings of people and objects.',
    spiritualMeaning:
      'Drawn from Psalm 51: "Purge me with hyssop, and I shall be clean; wash me, and I shall be whiter than snow." Sprinkling with holy water recalls our Holy Baptism, washes away venial faults, and renews our baptismal dignity as beloved sons and daughters of God.',
    catechismRef: 'GIRM 51, CCC 1668, CCC 1213',
    icon: '🌿',
    hotspot: { x: 450, y: 170, r: 15 },
  },
];

export const ALTAR_DRESSING_STEPS: AltarDressingStep[] = [
  {
    step: 1,
    title: 'Dress the Mensa with the White Altar Cloth',
    latinTitle: 'Impositio Lintei Altaris',
    action: 'Spread the consecrated, clean white linen cloth over the bare mensa, smoothing it flat so it hangs over both edges.',
    catecheticalReason: 'The altar represents Christ. We clothe it in pure white linen to recall Christ’s holy burial shroud and the radiant purity of the Paschal Mystery.',
    itemKey: 'altar-cloth',
  },
  {
    step: 2,
    title: 'Adorn the Front with the Seasonal Antependium',
    latinTitle: 'Affixio Antependii Secundum Colorem',
    action: 'Attach the liturgical frontal (Green for Ordinary Time, Purple for Advent/Lent, White for Easter/Christmas, Red for Pentecost).',
    catecheticalReason: 'The antependium proclaims the liturgical season of the Church Year and honours the altar as the banquet table of the King.',
    itemKey: 'antependium',
  },
  {
    step: 3,
    title: 'Erect the Central Altar Crucifix & Beeswax Candles',
    latinTitle: 'Collocatio Crucis et Candelarum',
    action: 'Position the Crucifix centrally so it is seen by priest and people. Place the beeswax candles symmetrically on either side.',
    catecheticalReason: 'Mass is the very same sacrifice as the Cross. The pure beeswax candles represent Christ, the Light of the World, burning with sacrificial love.',
    itemKey: 'altar-crucifix',
  },
  {
    step: 4,
    title: 'Position the Roman Missal on its Stand',
    latinTitle: 'Collocatio Missalis Romani',
    action: 'Rest the Roman Missal on the missal stand on the left-hand side of the altar, opened to the proper prayers of the Mass.',
    catecheticalReason: 'The Missal preserves the apostolic prayer of the universal Church, directing the priest through the Collect, Preface, and Eucharistic Prayer.',
    itemKey: 'roman-missal',
  },
  {
    step: 5,
    title: 'Unfold the Corporal in the Center',
    latinTitle: 'Explicatio Corporalis in Medio',
    action: 'Unfold the nine-square white linen corporal precisely in the center of the mensa directly over the consecrated altar stone.',
    catecheticalReason: 'The corporal (from Latin corpus) is sacred ground where the Body of Christ will rest. Its folds catch any microscopic particles of the Holy Eucharist.',
    itemKey: 'corporal',
  },
  {
    step: 6,
    title: 'Bring the Sacred Vessels & Credence Table Appointments',
    latinTitle: 'Apparatus Calicis, Patenae et Ampullarum',
    action: 'Place the Chalice assembled with Purificator, Paten with Host, and Pall upon the Corporal. Set Cruets, Lavabo, and Bells on the Credence Table.',
    catecheticalReason: 'All is now ready for the Liturgy of the Eucharist, where ordinary bread and wine become the Real, Substantial Body, Blood, Soul, and Divinity of Jesus Christ.',
    itemKey: 'chalice',
  },
];

export interface TabernacleCatechesis {
  title: string;
  subtitle: string;
  theCoreQuestion: string;
  canonicalAnswer: {
    girm315: string;
    whySeparated: string;
    actionVsReservation: string;
  };
  twoApprovedLocations: Array<{
    id: string;
    location: string;
    latinName: string;
    canonicalBasis: string;
    description: string;
    advantages: string;
    icon: string;
  }>;
  historicalEvolution: Array<{
    era: string;
    timeframe: string;
    practice: string;
    significance: string;
  }>;
  tabernacleAppointments: Array<{
    name: string;
    latinName: string;
    rule: string;
    theologicalMeaning: string;
    icon: string;
  }>;
  reverenceRules: {
    genuflection: string;
    profoundBow: string;
    theologicalDistinction: string;
  };
}

export const TABERNACLE_CATECHESIS: TabernacleCatechesis = {
  title: 'The Sacred Tabernacle & The Altar: The Great Liturgical Harmony',
  subtitle: 'Understanding Why the Tabernacle Has Its Own Place in Catholic Church Architecture',
  theCoreQuestion: 'Why is the Tabernacle not sitting directly on the modern Altar of Celebration?',
  canonicalAnswer: {
    girm315:
      'GIRM §315: "It is more appropriate that on the altar on which Mass is celebrated there NOT be a tabernacle in which the Most Holy Eucharist is reserved."',
    whySeparated:
      'In traditional High Altars (pre-1969), the tabernacle was fixed at the center of the reredos. Following the Second Vatican Council, the Church restored the free-standing altar of sacrifice (mensa) so the priest could celebrate Mass facing the people (versus populum) and walk completely around the altar.',
    actionVsReservation:
      'The Altar is the table of the Eucharistic Action and Sacrifice—where Christ’s once-for-all sacrifice on Calvary is made sacramentally present through the action of the priest. The Tabernacle is the place of Eucharistic Reservation and Perpetual Adoration—where the consecrated Sacrament remains at rest for the sick, the dying (Viaticum), and the private prayer of the faithful. Separating the two highlights both distinct aspects of Eucharistic mystery without one obscuring the other.',
  },
  twoApprovedLocations: [
    {
      id: 'sanctuary-noble-place',
      location: 'In the Sanctuary (Apart from the Altar of Sacrifice)',
      latinName: 'In Sanctuario Extra Mensam Celebrationis',
      canonicalBasis: 'GIRM §315(a) & CIC Can. 938 §2',
      description:
        'Elevated in a truly noble, prominent, and conspicuously decorated place within the main sanctuary—such as on the historic High Altar in the apse behind the freestanding altar, or on an ornate marble column or stone pedestal.',
      advantages:
        'Keeps the Blessed Sacrament immediately visible to the entire congregation entering the church, inviting everyone to genuflect and kneel in adoration.',
      icon: '🏛️',
    },
    {
      id: 'blessed-sacrament-chapel',
      location: 'In a Dedicated Blessed Sacrament Chapel',
      latinName: 'In Sacello Sanctissimi Sacramenti',
      canonicalBasis: 'GIRM §315(b) & CIC Can. 938 §2',
      description:
        'In an architecturally distinguished chapel organically connected to the church, specifically designed for quiet adoration, Eucharistic Holy Hours, and private prayer away from the noise and movement of tourist visits or liturgical preparation in the main nave.',
      advantages:
        'Fosters deep, contemplative silence and intimacy before the Lord, free from the distractions of the main assembly hall.',
      icon: '🌹',
    },
  ],
  historicalEvolution: [
    {
      era: 'Early Church (Catacombs & Domestic Churches)',
      timeframe: '1st – 4th Century',
      practice: 'Reserved in linen pouches or private homes by deacons to carry Holy Communion to martyrs in prison and the homebound sick.',
      significance: 'Focus was strictly on charitable distribution to the sick and imprisoned.',
    },
    {
      era: 'Medieval Era (Hanging Eucharistic Doves & Wall Sacrament Houses)',
      timeframe: '5th – 15th Century',
      practice: 'The Eucharist was suspended above the altar inside a silver or gold hanging dove (Peristerium) or inside a carved stone wall tower (Sakramentshaus).',
      significance: 'High Gothic architectural reverence; protected the Blessed Sacrament from theft and fire.',
    },
    {
      era: 'Counter-Reformation & Council of Trent',
      timeframe: '16th – Mid 20th Century',
      practice: 'Promoted by St. Charles Borromeo, the Tabernacle was mandated directly upon the center of the High Altar (Altare Maius).',
      significance: 'A bold, unmistakable architectural counter-affirmation of the True, Real, and Substantial Presence against Protestant denial.',
    },
    {
      era: 'Post-Conciliar Renewal (Vatican II & GIRM)',
      timeframe: '1969 – Present',
      practice: 'Free-standing altar restored as the central focus of the Mass; Tabernacle given an elevated, distinguished sanctuary throne or dedicated adoration chapel.',
      significance: 'Clear liturgical distinction between the Eucharistic Action (the Mass) and the Eucharistic Reservation (the Divine Dwelling).',
    },
  ],
  tabernacleAppointments: [
    {
      name: 'The Conopeum (Tabernacle Veil)',
      latinName: 'Conopeum Tabernaculi',
      rule: 'A tent-like silk veil draped entirely over the exterior or inside doors of the Tabernacle.',
      theologicalMeaning:
        'Recalls the "tent of meeting" (Mishkan) of Moses and the Shekinah cloud of glory in Exodus. It changes with the liturgical seasons (Green, Purple, White, Red, Rose) and is the ultimate exterior liturgical sign that the Tabernacle contains consecrated Hosts.',
      icon: '⛺',
    },
    {
      name: 'The Red Sanctuary Lamp',
      latinName: 'Lampas Sanctuarii',
      rule: 'Canon 940: Must burn unceasingly day and night beside the Tabernacle fueled by olive oil or beeswax.',
      theologicalMeaning:
        'An undying flame of love and vigilance. It cries out to every pilgrim: "The Master is here and calling for you!" It is extinguished and the Tabernacle door left wide open only on Good Friday to mark the death of Christ.',
      icon: '🔴',
    },
    {
      name: 'The Golden Ciborium',
      latinName: 'Ciborium cum Hostiarum',
      rule: 'Consecrated vessel with tight-fitting cross-topped lid, resting upon a corporal inside the tabernacle.',
      theologicalMeaning:
        'The Golden Urn of the New Manna (Hebrews 9:4). Holds the living Bread from Heaven that nourishes the faithful.',
      icon: '✨',
    },
    {
      name: 'The Tabernacle Key',
      latinName: 'Clavis Tabernaculi',
      rule: 'Canon 938 §5: "The key of the tabernacle is to be guarded with the greatest diligence by the priest who is in charge of the church."',
      theologicalMeaning:
        'Solemn pastoral custody of the greatest treasure on earth: the physical Body of the Lord.',
      icon: '🗝️',
    },
  ],
  reverenceRules: {
    genuflection:
      'Genuflect on the RIGHT knee touching the floor towards the Tabernacle whenever entering, leaving, or passing in front of the reserved Blessed Sacrament (GIRM §274). This posture is an act of adoration reserved strictly for God Himself.',
    profoundBow:
      'A deep, profound bow from the waist is made to the Altar during the Holy Mass whenever the ministers approach, cross, or leave the sanctuary (GIRM §275). This venerates the altar as Christ the Living Rock and table of the sacrifice.',
    theologicalDistinction:
      'If the Tabernacle is situated in the main sanctuary, the ministers genuflect to it when arriving at and leaving the altar, but DURING the celebration of Mass itself, they bow to the altar where the sacrifice is being actively offered.',
  },
};

/**
 * Crucial Liturgical Distinction: The GIRM vs. Eastern Catholic Churches & Other Rites
 * 
 * The General Instruction of the Roman Missal (GIRM) is the liturgical law of the LATIN (ROMAN) RITE.
 * It does NOT bind the 23 Eastern Catholic Churches sui iuris (governed by the CCEO and their Liturgicons),
 * nor is it identical to the Extraordinary Form (1962 Missal) or other Western rites (Ambrosian, Mozarabic, Anglican Use).
 */
export interface RiteAltarTradition {
  id: string;
  traditionName: string;
  riteFamily: 'Latin' | 'Byzantine' | 'Antiochene' | 'East Syriac' | 'Alexandrian' | 'Armenian';
  governingNorms: string;
  altarTitle: string;
  altarOrientation: string;
  tabernacleFormAndLocation: string;
  candlesAndLighting: string;
  sacredLinensAndRelics: string;
  theologicalEmphasis: string;
  icon: string;
  churchesUsingThis: string;
}

export const RITE_ALTAR_TRADITIONS: RiteAltarTradition[] = [
  {
    id: 'roman-ordinary',
    traditionName: 'Roman Rite — Ordinary Form (Post-Conciliar)',
    riteFamily: 'Latin',
    governingNorms: 'General Instruction of the Roman Missal (GIRM 2002) & CIC (1983 Canons 1235–1239)',
    altarTitle: 'Altar of Celebration & Sacrifice (Mensa Sacrificii)',
    altarOrientation: 'Free-standing table (Versus Populum or Ad Orientem), separate from wall to allow walking around and incensing all sides (GIRM 299).',
    tabernacleFormAndLocation: 'Separate from the altar of celebration: placed on an elevated, noble sanctuary pillar/throne or in a dedicated Blessed Sacrament Chapel (GIRM 315).',
    candlesAndLighting: 'Strictly 2 (daily Mass), 4 or 6 (Sunday / Solemnity), or 7 (when Diocesan Bishop celebrates) per GIRM 117; plus perpetual red sanctuary lamp (Can. 940).',
    sacredLinensAndRelics: 'Single white mensa linen cloth, corporal, pall, purificator; martyr relics recommended beneath mensa (CIC 1237 §2).',
    theologicalEmphasis: 'Noble simplicity, clarity between the Eucharistic Action (the Mass) and Eucharistic Reservation (Perpetual Adoration).',
    icon: '✝️',
    churchesUsingThis: 'Latin Church (majority of 1.3 billion Roman Rite Catholics worldwide)',
  },
  {
    id: 'roman-extraordinary',
    traditionName: 'Roman Rite — Extraordinary Form (1962 Missal / TLM)',
    riteFamily: 'Latin',
    governingNorms: 'Rubricae Generales Missalis Romani (1962) & Codex Iuris Canonici (1917)',
    altarTitle: 'High Altar (Altare Maius) with Gradines & Reredos',
    altarOrientation: 'Ad Orientem: priest and congregation facing East together toward the crucifix and tabernacle at the altar.',
    tabernacleFormAndLocation: 'Permanently fixed at the very center of the High Altar gradine, covered with full seasonal conopeum veil, crowned by crucifix.',
    candlesAndLighting: '6 large beeswax candles on gradines for High Mass; 2 for Low Mass; 7 for Pontifical High Mass with Bishop.',
    sacredLinensAndRelics: 'Three linen cloths (two undercloths + long top cloth reaching floor on both sides); consecrated Altar Stone (petra sacra) with enclosed relics.',
    theologicalEmphasis: 'Sacrificial transcendence, vertical orientation, uninterrupted adoration before the High Altar.',
    icon: '🏛️',
    churchesUsingThis: 'Latin Church (Traditional Latin Mass communities, FSSP, ICKSP, personal parishes)',
  },
  {
    id: 'byzantine-rite',
    traditionName: 'Byzantine Rite (14 Eastern Catholic Churches)',
    riteFamily: 'Byzantine',
    governingNorms: 'Code of Canons of the Eastern Churches (CCEO) & Byzantine Liturgicon (St. John Chrysostom & St. Basil). GIRM DOES NOT APPLY.',
    altarTitle: 'The Holy Table (Hagia Trapeza) or Holy Throne',
    altarOrientation: 'Square consecrated table standing free behind the Iconostasis (Icon Screen with Royal Doors). Only ordained clergy may enter.',
    tabernacleFormAndLocation: 'The Artophorion (Ark / Kivotos) rests DIRECTLY ON THE HOLY TABLE itself, shaped like a miniature golden cathedral or descending dove. In Byzantine theology, separating reservation from the Holy Table is historically unknown!',
    candlesAndLighting: 'Seven-branched candelabrum (Semisvechnik / Menorah) behind or upon the Holy Table. Hierarch blesses with Dikirion (2 candles = Christ’s 2 natures) and Trikirion (3 candles = Holy Trinity).',
    sacredLinensAndRelics: 'The Antimension (consecrated silk icon cloth with martyr relics sewn in and signed by the Bishop) unfolded upon the Holy Table; Katasarkion (white linen) and Endyton (rich brocade).',
    theologicalEmphasis: 'Heaven on earth behind the veil; the Holy Table is the Throne of the King of Glory surrounded by heavenly angels.',
    icon: '👑',
    churchesUsingThis: 'Ukrainian Greek Catholic, Melkite Greek Catholic, Ruthenian, Romanian Greek Catholic, Greek Catholic (14 Churches sui iuris)',
  },
  {
    id: 'antiochene-maronite',
    traditionName: 'Antiochene & Maronite Traditions',
    riteFamily: 'Antiochene',
    governingNorms: 'CCEO & West Syriac Liturgicons (Liturgy of St. James). GIRM DOES NOT APPLY.',
    altarTitle: 'The Altar of Life (Madbho)',
    altarOrientation: 'Elevated sanctuary approached by three steps, often with sanctuary curtain (Sthro) or open chancel.',
    tabernacleFormAndLocation: 'The Tabernacle / Ark (Tabootho) or sanctuary niche. In Maronite parishes, prominent upon or behind the altar, illuminated by perpetual oil lamps.',
    candlesAndLighting: 'Beeswax candles flanking the altar cross (Sleebo); liturgical fans (Marwaho) with bells carried by subdeacons.',
    sacredLinensAndRelics: 'Tablitho (consecrated wooden slab signed by Patriarch/Bishop), multi-layered embroidered altar cloths.',
    theologicalEmphasis: 'Mystical Syriac poetry of St. Ephrem, sweet incense (B’smo) rising to the Trinity, Aramaic consecration words of Jesus.',
    icon: '🌿',
    churchesUsingThis: 'Maronite Catholic Church, Syriac Catholic Church, Syro-Malankara Catholic Church',
  },
  {
    id: 'east-syriac',
    traditionName: 'East Syriac Tradition (Chaldean & Syro-Malabar)',
    riteFamily: 'East Syriac',
    governingNorms: 'CCEO & East Syriac Holy Qurbana of Addai and Mari. GIRM DOES NOT APPLY.',
    altarTitle: 'The Holy Madbaha (Sanctuary Altar of the East)',
    altarOrientation: 'High elevated sanctuary separated by steps and rail; priest celebrates facing East.',
    tabernacleFormAndLocation: 'Sacred Ark or sanctuary tabernacle, guarded by curtains. In Syro-Malabar churches, situated with deep reverence in the sanctuary apse or on the high altar.',
    candlesAndLighting: 'Flanked by oil lamps and candles around the Mar Thoma Cross (St. Thomas Cross with floral buds, without a dead corpus, symbolizing the Risen Lord).',
    sacredLinensAndRelics: 'Consecrated altar stone/plaque, embroidered silk linens, sanctuary veil.',
    theologicalEmphasis: 'Apostolic patrimony of St. Thomas the Apostle in India & Mesopotamia, Christ’s victory over death and resurrection.',
    icon: '🕊️',
    churchesUsingThis: 'Syro-Malabar Catholic Church (5+ million faithful), Chaldean Catholic Church (Iraq, Middle East, Diaspora)',
  },
  {
    id: 'alexandrian-rite',
    traditionName: 'Alexandrian Tradition (Coptic, Ethiopian & Eritrean)',
    riteFamily: 'Alexandrian',
    governingNorms: 'CCEO & Liturgy of St. Mark/St. Cyril and Ge’ez Anaphoras. GIRM DOES NOT APPLY.',
    altarTitle: 'The Sacred Altar (Madbaha in Coptic, Menber in Ge’ez)',
    altarOrientation: 'Freestanding beneath an ornamental dome/canopy (Baldachin / Makwar), veiled during parts of the liturgy.',
    tabernacleFormAndLocation: 'The Kursi (Ark / Wooden Box holding the Chalice) or Tabot (Holy Slab of the Ark) resting directly upon the altar table.',
    candlesAndLighting: 'Pure olive oil lamps and beeswax candles; ostrich eggs suspended from ceiling symbolizing the unblinking vigilance of God.',
    sacredLinensAndRelics: 'Consecrated wooden or stone tablet (Tabot/Loh), consecrated chrism (Myron), fine white and colored linens.',
    theologicalEmphasis: 'Ancient Desert Fathers’ contemplative reverence, Exodus Ark of the Covenant typology, unceasing vigilance before God.',
    icon: '🏺',
    churchesUsingThis: 'Coptic Catholic Church, Ethiopian Catholic Church, Eritrean Catholic Church',
  },
  {
    id: 'armenian-rite',
    traditionName: 'Armenian Catholic Tradition',
    riteFamily: 'Armenian',
    governingNorms: 'CCEO & Armenian Divine Liturgy (Badarak) of St. Gregory the Illuminator. GIRM DOES NOT APPLY.',
    altarTitle: 'The Sacred Altar of the Temple (Bem)',
    altarOrientation: 'High elevated stone stage approached by steps, concealed during solemn moments by the magnificent great curtain (Varaguyr).',
    tabernacleFormAndLocation: 'Built directly into the stepped reredos (Ghab) of the altar, surmounted by the icon of the Theotokos (Mother of God) and Child Jesus.',
    candlesAndLighting: 'Multiple tiers of candles on the stepped reredos, blessing hand-cross (Tzerki Khach), liturgical flabella (Kshots).',
    sacredLinensAndRelics: 'Consecrated holy stone (Vemkar) anointed with Myron, rich Armenian woven brocades.',
    theologicalEmphasis: 'Temple of Solomon fulfilled in Christ, dramatic unveiling of the heavenly mystery behind the curtain.',
    icon: '⛰️',
    churchesUsingThis: 'Armenian Catholic Church (Lebanon, Armenia, Europe, Americas)',
  },
];

