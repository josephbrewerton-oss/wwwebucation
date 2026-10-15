// src/data/catholic/sacredObjects.ts
// St Joseph's Catholic Life & Faith Sanctuary
// Sacred Vessels, Linens, Sanctuary Appointments & Vestments

export interface SacredObject {
  id: string;
  name: string;
  icon: string;
  category: 'Vessel' | 'Linen' | 'Sanctuary' | 'Vestment';
  description: string;
  spiritualMeaning: string;
  catechismRef: string;
}

export const SACRED_OBJECTS: SacredObject[] = [
  {
    id: 'chalice',
    name: 'The Chalice',
    icon: '🏆',
    category: 'Vessel',
    description: 'The sacred cup made of precious metal (usually gold or silver) used to hold the wine that becomes the Precious Blood of Jesus.',
    spiritualMeaning: 'Echoes the cup Jesus lifted at the Last Supper: "This is my blood of the covenant, which is poured out for many."',
    catechismRef: 'CCC 1334'
  },
  {
    id: 'paten',
    name: 'The Paten',
    icon: '🪙',
    category: 'Vessel',
    description: 'A shallow golden plate that holds the large sacred Host that the priest breaks during the consecration.',
    spiritualMeaning: 'Derived from the Latin "patina" (dish), it holds the living Bread that came down from Heaven.',
    catechismRef: 'CCC 1150'
  },
  {
    id: 'ciborium',
    name: 'The Ciborium',
    icon: '👑',
    category: 'Vessel',
    description: 'A sacred cup with a lid used to hold the consecrated Hosts for distribution at Holy Communion and reservation in the Tabernacle.',
    spiritualMeaning: 'Safeguards the holy Sacrament so Jesus can be brought to the sick and adored in prayer.',
    catechismRef: 'CCC 1379'
  },
  {
    id: 'tabernacle',
    name: 'The Tabernacle',
    icon: '⛪',
    category: 'Sanctuary',
    description: 'The sacred, secure dwelling place in the church where the Blessed Sacrament is reserved.',
    spiritualMeaning: 'The word means "tent". Jesus truly dwells in our parish church 24/7. Whenever we pass it, we genuflect on our right knee.',
    catechismRef: 'CCC 1379'
  },
  {
    id: 'sanctuary-lamp',
    name: 'The Sanctuary Lamp',
    icon: '🕯️',
    category: 'Sanctuary',
    description: 'A candle encased in red glass burning continuously day and night beside or above the Tabernacle.',
    spiritualMeaning: 'A bright beacon reminding everyone that Jesus is truly present in the Tabernacle right now.',
    catechismRef: 'CCC 1183'
  },
  {
    id: 'cruets',
    name: 'The Cruets',
    icon: '🏺',
    category: 'Vessel',
    description: 'Two small glass pitchers: one containing water and the other containing pure grape wine for the Mass.',
    spiritualMeaning: 'When the priest mingles a drop of water into the wine, it signifies Christ sharing our human nature so we may share in His divinity.',
    catechismRef: 'CCC 1333'
  },
  {
    id: 'purificator',
    name: 'The Purificator',
    icon: '📜',
    category: 'Linen',
    description: 'A white linen cloth marked with a small red cross in the centre, used to dry and purify the Chalice, Paten, and Ciborium.',
    spiritualMeaning: 'Ensures that every tiny particle of the Body of Christ and drop of the Precious Blood is treated with supreme reverence.',
    catechismRef: 'CCC 1385'
  },
  {
    id: 'corporal',
    name: 'The Corporal',
    icon: '⬜',
    category: 'Linen',
    description: 'A square white linen cloth placed on the altar altar cloth where the Chalice, Paten, and Ciborium stand during the Mass.',
    spiritualMeaning: 'From the Latin "corpus" (body), it catches any tiny sacred crumbs that might fall during the consecration.',
    catechismRef: 'CCC 1385'
  },
  {
    id: 'monstrance',
    name: 'The Monstrance',
    icon: '☀️',
    category: 'Vessel',
    description: 'A tall, sunburst-shaped golden vessel holding a consecrated Host behind glass for Eucharistic Adoration and Benediction.',
    spiritualMeaning: 'From Latin "monstrare" (to show). It allows the faithful to gaze in silent awe at Jesus in the Blessed Sacrament.',
    catechismRef: 'CCC 1378'
  },
  {
    id: 'alb',
    name: 'The Alb',
    icon: '🥋',
    category: 'Vestment',
    description: 'A full-length, pure white linen tunic worn by the priest, deacon, and altar servers, reaching from the neck down to the feet.',
    spiritualMeaning: 'Recalls the white baptismal garment. It represents the soul cleansed from sin, putting on Jesus Christ in holiness and purity.',
    catechismRef: 'CCC 1155'
  },
  {
    id: 'cincture',
    name: 'The Cincture',
    icon: '🎗️',
    category: 'Vestment',
    description: 'A thick rope or cord belt with tassels at the ends, tied securely around the waist over the white alb.',
    spiritualMeaning: 'Symbolizes self-control, purity of heart, and spiritual vigilance—being girded and ready to serve Christ at the altar.',
    catechismRef: 'CCC 1155'
  },
  {
    id: 'stole',
    name: 'The Stole',
    icon: '🧣',
    category: 'Vestment',
    description: 'A long, narrow scarf-like band of coloured silk worn around the neck and over the shoulders by the priest during Mass and the sacraments.',
    spiritualMeaning: 'The essential badge of priestly authority and ministerial power granted by Christ to celebrate the Holy Sacrifice of the Mass and grant forgiveness.',
    catechismRef: 'CCC 1155'
  },
  {
    id: 'chasuble',
    name: 'The Chasuble',
    icon: '👘',
    category: 'Vestment',
    description: 'The flowing, sleeveless outer vestment worn by the priest over the alb and stole during the Holy Sacrifice of the Mass.',
    spiritualMeaning: 'Symbolizes the sweet yoke of Christ and Christian charity covering all things. Its liturgical colour changes with church seasons (Green, Purple, White/Gold, Red, Rose).',
    catechismRef: 'CCC 1155'
  },
  {
    id: 'humeral-veil',
    name: 'The Humeral Veil',
    icon: '✨',
    category: 'Vestment',
    description: 'A rich silk shawl worn over the shoulders and hands of the priest when holding the Monstrance during Eucharistic Adoration and Benediction.',
    spiritualMeaning: 'Hides the priest’s human hands so the faithful recognize that it is Jesus Himself in the Blessed Sacrament Who is blessing them.',
    catechismRef: 'CCC 1378'
  },
  {
    id: 'mensa',
    name: 'The Consecrated Mensa',
    icon: '🪵',
    category: 'Sanctuary',
    description: 'The flat stone table of the altar, anointed with holy chrism, upon which the Eucharistic Sacrifice of the Mass is offered.',
    spiritualMeaning: 'Represents Christ Himself, the living Cornerstone. Whenever the priest approaches the mensa, he kisses it in reverence to Christ.',
    catechismRef: 'CCC 1182'
  },
  {
    id: 'altar-stone',
    name: 'The Altar Stone & Relics',
    icon: '🪨',
    category: 'Sanctuary',
    description: 'A consecrated marble slab inset into the altar, incised with five crosses for Christ’s wounds and sealing relics of the martyrs.',
    spiritualMeaning: 'Honours the ancient tradition of the Roman catacombs where early Christians celebrated Mass directly on the tombs of martyrs.',
    catechismRef: 'CIC Can. 1237, Rev 6:9'
  },
  {
    id: 'pall',
    name: 'The Sacred Pall',
    icon: '🛡️',
    category: 'Linen',
    description: 'A stiffened linen square placed directly over the chalice and paten to protect the Precious Blood from dust and insects.',
    spiritualMeaning: 'Symbolizes the stone rolled in front of Christ’s tomb, and safeguards the holy mysteries with utmost vigilance.',
    catechismRef: 'GIRM 118'
  },
  {
    id: 'roman-missal',
    name: 'The Roman Missal',
    icon: '📖',
    category: 'Sanctuary',
    description: 'The liturgical volume on the altar containing all the official prayers, prefaces, and Eucharistic Prayers for the celebration of Mass.',
    spiritualMeaning: 'Preserves the unbroken apostolic prayer of the universal Catholic Church across two millennia in one liturgical voice.',
    catechismRef: 'CCC 1154'
  },
  {
    id: 'altar-crucifix',
    name: 'The Altar Crucifix',
    icon: '✝️',
    category: 'Sanctuary',
    description: 'The crucifix positioned centrally on or beside the altar, clearly visible to both the celebrating priest and the congregation.',
    spiritualMeaning: 'Reminds all that the Sacrifice of the Mass is one and the same sacrifice as Calvary—Christ’s once-for-all offering of love.',
    catechismRef: 'GIRM 308, CCC 1366'
  },
  {
    id: 'antependium',
    name: 'The Altar Frontal (Antependium)',
    icon: '🎨',
    category: 'Linen',
    description: 'An embroidered fabric hanging covering the front of the altar in the liturgical colour of the season (Green, Purple, White, Red).',
    spiritualMeaning: 'Clothes the altar of Christ in royal vesture, visually proclaiming the spiritual rhythm of the Catholic liturgical year.',
    catechismRef: 'CCC 1155'
  },
  {
    id: 'sanctus-bells',
    name: 'Sanctuary Bells (Sanctus Chimes)',
    icon: '🔔',
    category: 'Sanctuary',
    description: 'Handheld bells rung by the altar server at the Sanctus, Epiclesis, and the high elevations of the Sacred Host and Chalice.',
    spiritualMeaning: 'Calls our attention to the supreme moment of Transubstantiation, bidding all to kneel and adore the Eucharistic Lord.',
    catechismRef: 'GIRM 150'
  },
  {
    id: 'holy-ambry',
    name: 'The Holy Ambry (Ambriarium)',
    icon: '🏺',
    category: 'Sanctuary',
    description: 'A consecrated wall niche or glass-fronted cabinet in the sanctuary or baptistery, reverently securing the three Holy Oils (O.I., O.C., S.C.).',
    spiritualMeaning: 'Marks the continuous sacramental presence of the Holy Spirit’s healing, strengthening, and consecrating grace within the parish church.',
    catechismRef: 'CCC 1183, 1241'
  },
  {
    id: 'oil-stocks',
    name: 'Holy Oil Stocks (Chrismarium)',
    icon: '⚱️',
    category: 'Vessel',
    description: 'A three-tiered silver pocket cylinder carried by priests for sick calls and emergencies, marked with I (Sick), B (Catechumens), and CHR (Chrism).',
    spiritualMeaning: 'Allows the priest to bring sacramental grace and the anointing of salvation directly to hospital beds and the homes of the dying.',
    catechismRef: 'CCC 1513'
  },
  {
    id: 'holy-water-stoup',
    name: 'Holy Water Stoup (Pila Aquae Benedictae)',
    icon: '💧',
    category: 'Sanctuary',
    description: 'The stone, marble, or bronze basin situated at church entrances containing sanctified water blessed with exorcised salt.',
    spiritualMeaning: 'Recalls our Holy Baptism. Dipping our right hand and tracing the Sign of the Cross washes away venial faults and cleanses our hearts as we cross into God’s temple.',
    catechismRef: 'CCC 1668, CCC 1213'
  },
  {
    id: 'aspersorium-aspergillum',
    name: 'The Aspersorium & Aspergillum',
    icon: '🌿',
    category: 'Vessel',
    description: 'The portable holy water bucket (situla / aspersorium) and sprinkler (aspergillum) used by the priest for the Sunday Asperges and blessing of persons and objects.',
    spiritualMeaning: 'Echoes Psalm 51: "Purge me with hyssop, and I shall be clean; wash me, and I shall be whiter than snow." Sprinkles divine protection over the faithful.',
    catechismRef: 'GIRM 51, CCC 1668'
  },
  {
    id: 'thurible',
    name: 'The Thurible (Censer / Thuribulum)',
    icon: '🏺',
    category: 'Vessel',
    description: 'The metal censer suspended on chains containing burning charcoal onto which pure grains of frankincense and aromatic gums are placed to produce sweet clouds of smoke.',
    spiritualMeaning: 'Symbolizes the prayers of the saints rising straight to the throne of God (Psalm 141:2, Rev 8:3–4). The fragrant smoke honours Christ\'s Real Presence, purifies the sanctuary, and sanctifies the people.',
    catechismRef: 'CCC 1154, GIRM 276–277'
  },
  {
    id: 'incense-boat',
    name: 'The Incense Boat & Spoon (Navicula)',
    icon: '⛵',
    category: 'Vessel',
    description: 'A small ship-shaped vessel containing the grains of incense (frankincense / olibanum) and the small spoon (cochlear) used by the priest to charge the glowing coals of the thurible.',
    spiritualMeaning: 'The ship shape recalls the Barque of Peter (the Church). Unburnt grains await the spark of divine fire, symbolizing hearts ready to be transformed by God\'s love.',
    catechismRef: 'GIRM 100, GIRM 276'
  },
  {
    id: 'thurifer-server',
    name: 'The Thurifer & Boat Bearer',
    icon: '🧑‍🤝‍🧑',
    category: 'Sanctuary',
    description: 'The leading liturgical altar servers appointed to carry the smoking thurible and boat, guiding the entrance procession and incensing the priest, people, and Blessed Sacrament.',
    spiritualMeaning: 'Leads the Christian assembly in reverence and awe, guiding the sacred liturgy like the biblical pillar of cloud and standing vigil during the consecration elevations.',
    catechismRef: 'GIRM 100, GIRM 120'
  }
];

