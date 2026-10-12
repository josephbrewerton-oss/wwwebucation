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

export interface AltarAppointment {
  id: string;
  name: string;
  latinName: string;
  category: 'Structure' | 'Linen' | 'Vessel' | 'Book' | 'Light & Reverence' | 'Credence';
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
    name: 'Altar Candles (Pure Beeswax)',
    latinName: 'Candelae Altaris',
    category: 'Light & Reverence',
    placement: 'Arranged symmetrically on or beside the altar',
    description:
      'At least two candles for daily Mass, four or six for Sundays and Solemnities, and seven when the diocesan Bishop celebrates. Liturgical candles must contain pure beeswax.',
    spiritualMeaning:
      'The pure beeswax produced by virgin bees represents Christ’s pure, sinless humanity born of the Virgin Mary. The burning wick represents His human soul, and the bright flame His divine nature: Christ, the Light of the World.',
    catechismRef: 'GIRM 307',
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
