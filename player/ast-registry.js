/**
 * static/player/ast-registry.js
 *
 * St Joseph's Educational Media Suite - Zero-Bloat AST Scene Registry
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Declarative catalog loader for .ast and .svg curriculum scenes.
 * Replaces legacy monolithic ast-scenes.js with on-demand streaming.
 */

(function (global) {
  'use strict';

  const BUILTIN_CATALOG = [
    { id: "welcome", type: "Sim", title: "Welcome to AST Vector Player & Educational Simulator", stage: "PORTAL SHOWCASE", duration: 16, svgFile: "scenes/welcome.svg", astFile: "scenes/welcome.ast" },
    { id: "algebra-balance", type: "Sim", title: "⚖️ Algebraic Balance Scale (2x + 5 = 15)", stage: "KS2/KS3 MATHS", duration: 14, svgFile: "scenes/algebra-balance.svg", astFile: "scenes/algebra-balance.ast" },
    { id: "altar-anatomy", type: "Slide", title: "The Catholic Altar: Sacred Anatomy, Types & Appointments", stage: "CATHOLIC LIFE", duration: 18, svgFile: "scenes/altar-anatomy.svg", astFile: "scenes/altar-anatomy.ast" },
    { id: "atom", type: "Sim", title: "Atomic Structure: Bohr Electron Shells", stage: "KS3 CHEMISTRY", duration: 12, has3D: true, svgFile: "scenes/atom.svg", astFile: "scenes/atom.ast" },
    { id: "bodmas", type: "Slide", title: "BODMAS / BIDMAS: Forcefield Clamping & Area Physics", stage: "KS2/KS3 MATHS", duration: 14, svgFile: "scenes/bodmas.svg", astFile: "scenes/bodmas.ast" },
    { id: "calculus-curves", type: "Sim", title: "Calculus: Tangent Slopes & Definite Integrals", stage: "GCSE & A-LEVEL MATHS", duration: 14, svgFile: "scenes/calculus-curves.svg", astFile: "scenes/calculus-curves.ast" },
    { id: "church-tour", type: "Slide", title: "Tour of a Catholic Church: Sacred Architecture & Sacred Spaces", stage: "CATHOLIC LIFE", duration: 16, svgFile: "scenes/church-tour.svg", astFile: "scenes/church-tour.ast" },
    { id: "holy-oils", type: "Slide", title: "The Three Holy Oils & The Sacred Ambry (Olea Sancta)", stage: "CATHOLIC LIFE", duration: 18, svgFile: "scenes/holy-oils.svg", astFile: "scenes/holy-oils.ast" },
    { id: "dna-helix", type: "Sim", title: "Genetics: DNA Base Pairing & Transcription", stage: "KS3 GENETICS", duration: 12, has3D: true, svgFile: "scenes/dna-helix.svg", astFile: "scenes/dna-helix.ast" },
    { id: "electric-circuits", type: "Sim", title: "💡 Electrical Circuits & Ohm's Law (V = I × R)", stage: "KS2/KS3 PHYSICS", duration: 12, svgFile: "scenes/electric-circuits.svg", astFile: "scenes/electric-circuits.ast" },
    { id: "fish-tank", type: "App", title: "Aquarium Stress Benchmark: Vector Point & FPS Limiter", stage: "BENCHMARK & STRESS LAB", duration: 12, svgFile: "scenes/fish-tank.svg", astFile: "scenes/fish-tank.ast" },
    { id: "fractions", type: "Slide", title: "Fractions: Why Common Denominators Rule", stage: "KS2 MATHS", duration: 12, svgFile: "scenes/fractions.svg", astFile: "scenes/fractions.ast" },
    { id: "kinetic-gas", type: "Sim", title: "Kinetic Gas Theory & Boyle's Law", stage: "KS3/KS4 PHYSICS & CHEMISTRY", duration: 14, svgFile: "scenes/kinetic-gas.svg", astFile: "scenes/kinetic-gas.ast" },
    { id: "languages", type: "App", title: "MFL & Polyglot Studio: Spanish, French & Latin", stage: "KS2/KS3 MFL", duration: 15, svgFile: "scenes/languages.svg", astFile: "scenes/languages.ast" },
    { id: "math-fishing", type: "App", title: "Math Pond: Number Bonds Fishing Game", stage: "KS1/KS2 MATHS", duration: 14, svgFile: "scenes/math-fishing.svg", astFile: "scenes/math-fishing.ast" },
    { id: "mountain-elevation", type: "Sim", title: "Mountain Altitude: Elevation, Hypotenuse & Atmospheric Science", stage: "KS2/KS3 MATHS & GEOGRAPHY", duration: 16, svgFile: "scenes/mountain-elevation.svg", astFile: "scenes/mountain-elevation.ast" },
    { id: "phonics-lab", type: "App", title: "Early Phonics: Sound Buttons & Blending Mat", stage: "EYFS/KS1 ENGLISH", duration: 12, svgFile: "scenes/phonics-lab.svg", astFile: "scenes/phonics-lab.ast" },
    { id: "photosynthesis", type: "Slide", title: "Photosynthesis: The Green Solar Engine", stage: "KS3 BIOLOGY", duration: 10, svgFile: "scenes/photosynthesis.svg", astFile: "scenes/photosynthesis.ast" },
    { id: "pythagoras", type: "Sim", title: "Pythagoras' Theorem (a² + b² = c²)", stage: "KS3 GEOMETRY", duration: 11, svgFile: "scenes/pythagoras.svg", astFile: "scenes/pythagoras.ast" },
    { id: "shakespeare", type: "Slide", title: "The Globe Theatre: Shakespeare & Iambic Pentameter", stage: "KS3/KS4 ENGLISH LITERATURE", duration: 15, svgFile: "scenes/shakespeare.svg", astFile: "scenes/shakespeare.ast" },
    { id: "solar-system", type: "Sim", title: "Solar System: Heliocentric Planetary Motion", stage: "KS3 SCIENCE", duration: 14, has3D: true, svgFile: "scenes/solar-system.svg", astFile: "scenes/solar-system.ast" },
    { id: "spelling-bee", type: "App", title: "Spelling Bee Championship: KS1 to KS3 Orthography", stage: "KS1/KS2/KS3 ENGLISH", duration: 14, svgFile: "scenes/spelling-bee.svg", astFile: "scenes/spelling-bee.ast" },
    { id: "times-tables", type: "Sim", title: "Times Tables: 2× to 12× Array & Distributive Splitter", stage: "KS1/KS2 MATHS", duration: 14, svgFile: "scenes/times-tables.svg", astFile: "scenes/times-tables.ast" },
    { id: "velocity", type: "Sim", title: "Kinematics: Velocity & Distance-Time Vectors", stage: "KS3 PHYSICS", duration: 10, svgFile: "scenes/velocity.svg", astFile: "scenes/velocity.ast" },
    { id: "water-cycle", type: "Slide", title: "Water Cycle: Continuous Earth Cycle", stage: "KS2 GEOGRAPHY", duration: 10, svgFile: "scenes/water-cycle.svg", astFile: "scenes/water-cycle.ast" },
    { id: "bsl-fingerspelling", type: "Sim", title: "BSL: 3D British Sign Language Two-Handed Fingerspelling", stage: "ACCESSIBILITY & LANGUAGES", duration: 14, has3D: true, svgFile: "scenes/bsl-fingerspelling.svg", astFile: "scenes/bsl-fingerspelling.ast" },
    { id: "phonics-screening", type: "Sim", title: "Year 1 Phonics Screening Check & Alien Words", stage: "EYFS/KS1 PHONICS", duration: 12, svgFile: "scenes/phonics-screening.svg", astFile: "scenes/phonics-screening.ast" },
    { id: "shakespeare-macbeth", type: "Slide", title: "Macbeth: 5-Act Dramatic Soliloquy & Moral Fall", stage: "KS3/KS4 ENGLISH LITERATURE", duration: 16, svgFile: "scenes/shakespeare-macbeth.svg", astFile: "scenes/shakespeare-macbeth.ast" },
    { id: "rosary-mysteries", type: "Sim", title: "The Holy Rosary: 3D Beads & 20 Scriptural Mysteries", stage: "CATHOLIC LIFE", duration: 16, has3D: true, oakId: "OAK-KS2-RE-019", oakUnit: "ks2-re-catholic-rosary-twenty-mysteries", svgFile: "scenes/rosary-mysteries.svg", astFile: "scenes/rosary-mysteries.ast" },
    { id: "eucharistic-procession-film", type: "Film", video: "/media/eucharistic-procession.mp4", videoFit: "contain", title: "Solemn Eucharistic Procession: Liturgical Film & Sacred Vectors", stage: "CATHOLIC LIFE", duration: 26, oakId: "OAK-KS2-RE-018", oakUnit: "ks2-re-catholic-eucharistic-procession", svgFile: "scenes/eucharistic-procession-film.svg", astFile: "scenes/eucharistic-procession-film.ast" },
    { id: "holy-water-thurifer", type: "Sim", title: "Holy Water & The Thurible: Asperges, Incense & Sacramental Purification", stage: "CATHOLIC LIFE", duration: 18, oakId: "OAK-KS2-RE-004", oakUnit: "ks2-re-catholic-asperges-incensations", svgFile: "scenes/holy-water-thurifer.svg", astFile: "scenes/holy-water-thurifer.ast" },
    { id: "first-communion", type: "Sim", title: "First Holy Communion & Eucharistic Adoration: Receiving Jesus with Reverence & Love", stage: "CATHOLIC LIFE", duration: 16, oakId: "OAK-KS2-RE-005", oakUnit: "ks2-re-catholic-first-holy-communion", svgFile: "scenes/first-communion.svg", astFile: "scenes/first-communion.ast" },
    { id: "triduum-easter", type: "Sim", title: "The Sacred Paschal Triduum & Easter: Upper Room, Cross & Lumen Christi", stage: "CATHOLIC LIFE", duration: 22, oakId: "OAK-KS2-RE-006", oakUnit: "ks2-re-catholic-paschal-triduum", svgFile: "scenes/triduum-easter.svg", astFile: "scenes/triduum-easter.ast" },
    { id: "seven-sacraments", type: "Sim", title: "The Seven Holy Sacraments: Visible Signs of Invisible Grace", stage: "CATHOLIC LIFE", duration: 20, oakId: "OAK-KS2-RE-008", oakUnit: "ks2-re-catholic-seven-sacraments", svgFile: "scenes/seven-sacraments.svg", astFile: "scenes/seven-sacraments.ast" },
    { id: "liturgical-calendar", type: "Sim", title: "The Catholic Liturgical Year: Sacred Seasons & Colors", stage: "CATHOLIC LIFE", duration: 18, oakId: "OAK-KS2-RE-009", oakUnit: "ks2-re-catholic-liturgical-seasons", svgFile: "scenes/liturgical-calendar.svg", astFile: "scenes/liturgical-calendar.ast" },
    { id: "liturgical-postures", type: "Sim", title: "Sacred Postures & Gestures: Praying with Mind, Heart & Body", stage: "CATHOLIC LIFE", duration: 16, oakId: "OAK-KS2-RE-010", oakUnit: "ks2-re-catholic-liturgical-postures-prayer", svgFile: "scenes/liturgical-postures.svg", astFile: "scenes/liturgical-postures.ast" },
    { id: "ten-commandments", type: "Sim", title: "The Ten Commandments & Moral Law: The Two Tablets of Sinai", stage: "CATHOLIC LIFE", duration: 18, oakId: "OAK-KS2-RE-015", oakUnit: "ks2-re-catholic-decalogue-moral-law", svgFile: "scenes/ten-commandments.svg", astFile: "scenes/ten-commandments.ast" },
    { id: "order-of-the-mass", type: "Sim", title: "The Order of the Holy Mass: Source & Summit of Catholic Life", stage: "CATHOLIC LIFE", duration: 20, oakId: "OAK-KS2-RE-016", oakUnit: "ks2-re-catholic-order-of-mass", svgFile: "scenes/order-of-the-mass.svg", astFile: "scenes/order-of-the-mass.ast" },
    { id: "sacred-objects", type: "Sim", title: "Sacred Vessels, Linens & Vestments of the Catholic Church", stage: "CATHOLIC LIFE", duration: 16, oakId: "OAK-KS2-RE-017", oakUnit: "ks2-re-catholic-sacred-vessels-vestments", svgFile: "scenes/sacred-objects.svg", astFile: "scenes/sacred-objects.ast" },
    { id: "stations-of-the-cross", type: "Slide", title: "The Stations of the Cross: Via Crucis & Sacred Passion", stage: "CATHOLIC LIFE", duration: 28, oakId: "OAK-KS2-RE-020", oakUnit: "ks2-re-catholic-via-crucis-stations", svgFile: "scenes/stations-of-the-cross.svg", astFile: "scenes/stations-of-the-cross.ast" },
    { id: "liturgy-of-the-hours", type: "Sim", title: "The Liturgy of the Hours: Divine Office & Daily Sanctification", stage: "CATHOLIC LIFE", duration: 18, oakId: "OAK-KS3-RE-007", oakUnit: "ks3-re-catholic-divine-office-psalms", svgFile: "scenes/liturgy-of-the-hours.svg", astFile: "scenes/liturgy-of-the-hours.ast" },
    { id: "catholic-rites", type: "Sim", title: "The 24 Catholic Rites & Churches: Universal Communion across East & West", stage: "CATHOLIC LIFE", duration: 18, oakId: "OAK-KS3-RE-011", oakUnit: "ks3-re-catholic-sacramental-rites", svgFile: "scenes/catholic-rites.svg", astFile: "scenes/catholic-rites.ast" },
    { id: "cst-virtues", type: "Sim", title: "Catholic Social Teaching & Virtues: Gospel Love in Daily Action", stage: "CATHOLIC LIFE", duration: 18, oakId: "OAK-KS3-RE-012", oakUnit: "ks3-re-catholic-social-teaching-virtues", svgFile: "scenes/cst-virtues.svg", astFile: "scenes/cst-virtues.ast" },
    { id: "latin-mass-prayers", type: "Sim", title: "Latin Prayers & Gregorian Chant: The Universal Voice of the Church", stage: "CATHOLIC LIFE", duration: 18, oakId: "OAK-KS3-RE-013", oakUnit: "ks3-re-catholic-traditional-latin-prayers", svgFile: "scenes/latin-mass-prayers.svg", astFile: "scenes/latin-mass-prayers.ast" },
    { id: "nicene-creed", type: "Sim", title: "The Nicene & Apostles' Creed: The Profession of Faith", stage: "CATHOLIC LIFE", duration: 18, oakId: "OAK-KS3-RE-014", oakUnit: "ks3-re-catholic-creed-profession-faith", svgFile: "scenes/nicene-creed.svg", astFile: "scenes/nicene-creed.ast" }
  ];

  const scenes = Object.create(null);
  BUILTIN_CATALOG.forEach(s => { scenes[s.id] = s; });

  // Embedded Zero-Network Fallback for Core Cartridges (guarantees 100% determinism on GitHub Pages)
  const EMBEDDED_FALLBACKS = {
    "church-tour": {
      id: "church-tour",
      type: "Slide",
      title: "Tour of a Catholic Church: Sacred Architecture & Sacred Spaces",
      stage: "CATHOLIC LIFE",
      duration: 16.0,
      svgMarkup: "<svg viewBox=\"0 0 800 480\" xmlns=\"http://www.w3.org/2000/svg\">\n  <defs>\n    <filter id=\"glow\" x=\"-30%\" y=\"-30%\" width=\"160%\" height=\"160%\">\n      <feGaussianBlur stdDeviation=\"3.5\" result=\"blur\" />\n      <feComposite in=\"SourceGraphic\" in2=\"blur\" operator=\"over\" />\n    </filter>\n    <linearGradient id=\"gold-grad\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#fef08a\" />\n      <stop offset=\"50%\" stop-color=\"#eab308\" />\n      <stop offset=\"100%\" stop-color=\"#a16207\" />\n    </linearGradient>\n    <linearGradient id=\"rose-grad\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#38bdf8\" />\n      <stop offset=\"50%\" stop-color=\"#818cf8\" />\n      <stop offset=\"100%\" stop-color=\"#c084fc\" />\n    </linearGradient>\n    <radialGradient id=\"sanctuary-glow\" cx=\"50%\" cy=\"40%\" r=\"60%\">\n      <stop offset=\"0%\" stop-color=\"rgba(250, 204, 21, 0.22)\" />\n      <stop offset=\"60%\" stop-color=\"rgba(15, 23, 42, 0.08)\" />\n      <stop offset=\"100%\" stop-color=\"transparent\" />\n    </radialGradient>\n  </defs>\n\n  <!-- Deep Sacred Interior Atmosphere Backdrop -->\n  <rect x=\"0\" y=\"0\" width=\"800\" height=\"480\" fill=\"#0a0f1d\" />\n  <circle cx=\"400\" cy=\"200\" r=\"340\" fill=\"url(#sanctuary-glow)\" />\n\n  <!-- 1. Deep Sacred Basilica Floor Architecture (Luminous Limestone Stone & Blue Drafting Contour) -->\n  <path d=\"M 310 440 L 310 240 L 160 240 L 160 160 L 310 160 L 310 50 Q 400 30, 490 50 L 490 160 L 640 160 L 640 240 L 490 240 L 490 440 Z\" fill=\"#111827\" stroke=\"#38bdf8\" stroke-width=\"3\" filter=\"url(#glow)\" />\n  <path d=\"M 310 390 L 490 390 M 310 340 L 490 340 M 310 290 L 490 290 M 310 240 L 490 240\" stroke=\"#334155\" stroke-width=\"1.5\" stroke-dasharray=\"3 4\" />\n\n  <!-- 2. Nave Central Royal Carpet & Pews (Vibrant Crimson with Gold Boundary Ribbons) -->\n  <g class=\"ast-hotspot\" data-target-t=\"0.20\" data-label=\"2. The Nave &amp; Central Aisle\" data-pedagogical=\"church-nave\" style=\"cursor: pointer;\">\n    <rect x=\"375\" y=\"180\" width=\"50\" height=\"260\" fill=\"#991b1b\" stroke=\"#f59e0b\" stroke-width=\"1.5\" rx=\"3\" />\n    <line x1=\"375\" y1=\"180\" x2=\"375\" y2=\"440\" stroke=\"#fbbf24\" stroke-width=\"2\" />\n    <line x1=\"425\" y1=\"180\" x2=\"425\" y2=\"440\" stroke=\"#fbbf24\" stroke-width=\"2\" />\n    <!-- 10 Detailed Wooden Pews with Warm Timber Grain -->\n    <rect x=\"320\" y=\"250\" width=\"46\" height=\"18\" rx=\"3\" fill=\"#78350f\" stroke=\"#b45309\" stroke-width=\"1.5\" />\n    <line x1=\"324\" y1=\"254\" x2=\"362\" y2=\"254\" stroke=\"#fde68a\" stroke-width=\"1\" />\n    <rect x=\"434\" y=\"250\" width=\"46\" height=\"18\" rx=\"3\" fill=\"#78350f\" stroke=\"#b45309\" stroke-width=\"1.5\" />\n    <line x1=\"438\" y1=\"254\" x2=\"476\" y2=\"254\" stroke=\"#fde68a\" stroke-width=\"1\" />\n\n    <rect x=\"320\" y=\"286\" width=\"46\" height=\"18\" rx=\"3\" fill=\"#78350f\" stroke=\"#b45309\" stroke-width=\"1.5\" />\n    <line x1=\"324\" y1=\"290\" x2=\"362\" y2=\"290\" stroke=\"#fde68a\" stroke-width=\"1\" />\n    <rect x=\"434\" y=\"286\" width=\"46\" height=\"18\" rx=\"3\" fill=\"#78350f\" stroke=\"#b45309\" stroke-width=\"1.5\" />\n    <line x1=\"438\" y1=\"290\" x2=\"476\" y2=\"290\" stroke=\"#fde68a\" stroke-width=\"1\" />\n\n    <rect x=\"320\" y=\"322\" width=\"46\" height=\"18\" rx=\"3\" fill=\"#78350f\" stroke=\"#b45309\" stroke-width=\"1.5\" />\n    <line x1=\"324\" y1=\"326\" x2=\"362\" y2=\"326\" stroke=\"#fde68a\" stroke-width=\"1\" />\n    <rect x=\"434\" y=\"322\" width=\"46\" height=\"18\" rx=\"3\" fill=\"#78350f\" stroke=\"#b45309\" stroke-width=\"1.5\" />\n    <line x1=\"438\" y1=\"326\" x2=\"476\" y2=\"326\" stroke=\"#fde68a\" stroke-width=\"1\" />\n\n    <rect x=\"320\" y=\"358\" width=\"46\" height=\"18\" rx=\"3\" fill=\"#78350f\" stroke=\"#b45309\" stroke-width=\"1.5\" />\n    <line x1=\"324\" y1=\"362\" x2=\"362\" y2=\"362\" stroke=\"#fde68a\" stroke-width=\"1\" />\n    <rect x=\"434\" y=\"358\" width=\"46\" height=\"18\" rx=\"3\" fill=\"#78350f\" stroke=\"#b45309\" stroke-width=\"1.5\" />\n    <line x1=\"438\" y1=\"362\" x2=\"476\" y2=\"362\" stroke=\"#fde68a\" stroke-width=\"1\" />\n\n    <rect x=\"320\" y=\"394\" width=\"46\" height=\"18\" rx=\"3\" fill=\"#78350f\" stroke=\"#b45309\" stroke-width=\"1.5\" />\n    <line x1=\"324\" y1=\"398\" x2=\"362\" y2=\"398\" stroke=\"#fde68a\" stroke-width=\"1\" />\n    <rect x=\"434\" y=\"394\" width=\"46\" height=\"18\" rx=\"3\" fill=\"#78350f\" stroke=\"#b45309\" stroke-width=\"1.5\" />\n    <line x1=\"438\" y1=\"398\" x2=\"476\" y2=\"398\" stroke=\"#fde68a\" stroke-width=\"1\" />\n  </g>\n\n  <!-- 3. Elevated Sanctuary Platform &amp; Altar of Sacrifice -->\n  <path d=\"M 310 180 L 490 180 L 490 60 Q 400 45, 310 60 Z\" fill=\"#1e293b\" stroke=\"#475569\" stroke-width=\"2\" />\n  <path d=\"M 325 170 L 475 170 L 475 70 Q 400 58, 325 70 Z\" fill=\"#0f172a\" stroke=\"#64748b\" stroke-width=\"1.5\" />\n  <g class=\"ast-hotspot\" data-target-t=\"0.60\" data-label=\"4. The Altar of Sacrifice\" data-pedagogical=\"church-altar\" style=\"cursor: pointer;\">\n    <rect x=\"360\" y=\"115\" width=\"80\" height=\"34\" rx=\"4\" fill=\"#e2e8f0\" stroke=\"#f8fafc\" stroke-width=\"2\" />\n    <rect x=\"366\" y=\"119\" width=\"68\" height=\"26\" rx=\"2\" fill=\"#cbd5e1\" />\n    <circle cx=\"372\" cy=\"128\" r=\"3.5\" fill=\"#facc15\" filter=\"url(#glow)\" />\n    <circle cx=\"428\" cy=\"128\" r=\"3.5\" fill=\"#facc15\" filter=\"url(#glow)\" />\n    <line x1=\"400\" y1=\"110\" x2=\"400\" y2=\"124\" stroke=\"#eab308\" stroke-width=\"2.5\" />\n    <line x1=\"394\" y1=\"115\" x2=\"406\" y2=\"115\" stroke=\"#eab308\" stroke-width=\"2\" />\n    <text x=\"400\" y=\"138\" fill=\"#0f172a\" font-size=\"9\" font-weight=\"900\" text-anchor=\"middle\">ALTAR</text>\n  </g>\n\n  <!-- 4. Tabernacle of the Blessed Sacrament &amp; Red Sanctuary Lamp -->\n  <g class=\"ast-hotspot\" data-target-t=\"0.80\" data-label=\"5. The Tabernacle &amp; Sanctuary Lamp\" data-pedagogical=\"church-tabernacle\" style=\"cursor: pointer;\">\n    <rect x=\"382\" y=\"58\" width=\"36\" height=\"28\" rx=\"3\" fill=\"#eab308\" stroke=\"#fef08a\" stroke-width=\"2\" filter=\"url(#glow)\" />\n    <line x1=\"400\" y1=\"62\" x2=\"400\" y2=\"76\" stroke=\"#78350f\" stroke-width=\"2\" />\n    <line x1=\"392\" y1=\"68\" x2=\"408\" y2=\"68\" stroke=\"#78350f\" stroke-width=\"1.5\" />\n    <text x=\"400\" y=\"82\" fill=\"#78350f\" font-size=\"7\" font-weight=\"900\" text-anchor=\"middle\">IHS</text>\n    <circle id=\"church-lamp\" cx=\"432\" cy=\"72\" r=\"7.5\" fill=\"#ef4444\" filter=\"url(#glow)\" data-pedagogical=\"church-lamp\" />\n    <circle cx=\"432\" cy=\"72\" r=\"4\" fill=\"#fee2e2\" />\n    <line x1=\"432\" y1=\"52\" x2=\"432\" y2=\"66\" stroke=\"#94a3b8\" stroke-width=\"1\" />\n  </g>\n\n  <!-- 5. Ambo (Table of the Word) -->\n  <g class=\"ast-hotspot\" data-target-t=\"0.40\" data-label=\"3. The Ambo (Lectern)\" data-pedagogical=\"church-ambo\" style=\"cursor: pointer;\">\n    <rect x=\"330\" y=\"125\" width=\"22\" height=\"24\" rx=\"2\" fill=\"#2563eb\" stroke=\"#60a5fa\" stroke-width=\"1.5\" />\n    <path d=\"M 333 130 L 341 127 L 349 130\" stroke=\"#ffffff\" stroke-width=\"1.5\" fill=\"none\" />\n    <text x=\"341\" y=\"145\" fill=\"#ffffff\" font-size=\"7\" font-weight=\"800\" text-anchor=\"middle\">AMBO</text>\n  </g>\n\n  <!-- 6. Lady Chapel Devotional Shrine (North Transept) -->\n  <g class=\"ast-hotspot\" data-target-t=\"0.94\" data-label=\"6A. Lady Chapel\" data-pedagogical=\"church-lady-chapel\" style=\"cursor: pointer;\">\n    <rect x=\"175\" y=\"175\" width=\"120\" height=\"50\" rx=\"4\" fill=\"#172554\" stroke=\"#2563eb\" stroke-width=\"1.5\" />\n    <circle cx=\"205\" cy=\"200\" r=\"10\" fill=\"#38bdf8\" filter=\"url(#glow)\" />\n    <text x=\"205\" y=\"204\" fill=\"#ffffff\" font-size=\"11\" font-weight=\"bold\" text-anchor=\"middle\">★</text>\n    <text x=\"245\" y=\"196\" fill=\"#93c5fd\" font-size=\"9\" font-weight=\"bold\">LADY CHAPEL</text>\n    <text x=\"245\" y=\"208\" fill=\"#bfdbfe\" font-size=\"8\">Devotional Prayer</text>\n  </g>\n\n  <!-- 7. Baptismal Font (South Transept) -->\n  <g class=\"ast-hotspot\" data-target-t=\"1.00\" data-label=\"6B. Baptismal Font\" data-pedagogical=\"church-font\" style=\"cursor: pointer;\">\n    <rect x=\"505\" y=\"175\" width=\"120\" height=\"50\" rx=\"4\" fill=\"#14532d\" stroke=\"#16a34a\" stroke-width=\"1.5\" />\n    <polygon points=\"535,190 545,190 552,197 552,205 545,212 535,212 528,205 528,197\" fill=\"#0284c7\" stroke=\"#38bdf8\" stroke-width=\"2\" filter=\"url(#glow)\" />\n    <circle cx=\"540\" cy=\"201\" r=\"4\" fill=\"#e0f2fe\" />\n    <text x=\"562\" y=\"196\" fill=\"#86efac\" font-size=\"9\" font-weight=\"bold\">BAPTISMAL FONT</text>\n    <text x=\"562\" y=\"208\" fill=\"#bbf7d0\" font-size=\"8\">Sacrament of Initiation</text>\n  </g>\n\n  <!-- 8. Narthex &amp; Holy Water Stoup (Entrance) -->\n  <g class=\"ast-hotspot\" data-target-t=\"0.00\" data-label=\"1. Narthex &amp; Holy Water Stoup\" data-pedagogical=\"church-narthex\" style=\"cursor: pointer;\">\n    <rect x=\"310\" y=\"415\" width=\"180\" height=\"30\" rx=\"3\" fill=\"#1e293b\" stroke=\"#475569\" stroke-width=\"1.5\" />\n    <circle cx=\"330\" cy=\"430\" r=\"6\" fill=\"#0284c7\" stroke=\"#38bdf8\" stroke-width=\"1.5\" />\n    <circle cx=\"470\" cy=\"430\" r=\"6\" fill=\"#0284c7\" stroke=\"#38bdf8\" stroke-width=\"1.5\" />\n    <text x=\"400\" y=\"434\" fill=\"#cbd5e1\" font-size=\"10\" font-weight=\"bold\" text-anchor=\"middle\">NARTHEX • ENTRANCE</text>\n  </g>\n\n  <!-- 9. Moving Pilgrim Spotlight &amp; Avatar -->\n  <g id=\"spot-avatar\" data-pedagogical=\"church-pilgrim\" style=\"cursor: grab;\">\n    <circle id=\"spot-halo\" cx=\"400\" cy=\"430\" r=\"38\" fill=\"rgba(56, 189, 248, 0.14)\" stroke=\"#38bdf8\" stroke-width=\"2\" stroke-dasharray=\"4 3\" filter=\"url(#glow)\" />\n    <circle id=\"spot-dot\" cx=\"400\" cy=\"430\" r=\"8\" fill=\"#38bdf8\" filter=\"url(#glow)\" />\n    <circle id=\"spot-core\" cx=\"400\" cy=\"430\" r=\"4\" fill=\"#ffffff\" />\n  </g>\n\n  <!-- 10. Architectural Sacred Space HUD Banner -->\n  <rect x=\"110\" y=\"12\" width=\"580\" height=\"42\" rx=\"8\" fill=\"#090d16\" stroke=\"#38bdf8\" stroke-width=\"1.5\" />\n  <text id=\"church-hud-title\" x=\"130\" y=\"29\" fill=\"#38bdf8\" font-size=\"12\" font-weight=\"800\">1. NARTHEX &amp; HOLY WATER STOUP</text>\n  <text id=\"church-hud-desc\" x=\"130\" y=\"44\" fill=\"#94a3b8\" font-size=\"10\">Vestibulum &amp; Aqua Benedicta • Blessing ourselves with Holy Water...</text>\n  <circle cx=\"664\" cy=\"33\" r=\"11\" fill=\"#2563eb\" />\n  <text x=\"664\" y=\"37\" fill=\"#ffffff\" font-size=\"11\" font-weight=\"900\" text-anchor=\"middle\">⛪</text>\n</svg>\n",
      astSource: "(:scene :id \"church-tour\" :type \"Slide\" :oak-id \"OAK-KS2-RE-001\" :oak-unit \"ks2-re-catholic-sacred-architecture\" :title \"Tour of a Catholic Church: Sacred Architecture & Sacred Spaces\" :stage \"CATHOLIC LIFE\" :duration 16.0\n  (:vars (\n    (:var :name \"candleGlow\" :val 1.0 :min 0.2 :max 1.5 :step 0.1 :label \"Sanctuary Lamp Flame\")\n    (:var :name \"pilgrimSpeed\" :val 1.0 :min 0.5 :max 2.0 :step 0.25 :label \"Tour Progression Pace\")\n  ))\n  (:inputs (\n    (:slider :var \"candleGlow\" :label \"Sanctuary Lamp Flame\" :min 0.2 :max 1.5 :step 0.1)\n    (:slider :var \"pilgrimSpeed\" :label \"Pilgrim Walk Pace\" :min 0.5 :max 2.0 :step 0.25)\n  ))\n  (:gestures (\n    (:draggable :target \"#spot-dot\" :axis \"xy\" :min 80 :max 440)\n  ))\n  (:subtitles (\n    (:start 0.00 :end 0.20 :en \"We enter through the Narthex, blessing ourselves with Holy Water in the Name of the Father, Son, and Holy Spirit.\" :es \"Entramos por el Nártex, bendiciéndonos con Agua Bendita en el Nombre del Padre, del Hijo y del Espíritu Santo.\" :la \"In nomine Patris, et Filii, et Spiritus Sancti. Aqua benedicta ad memoriam baptismi.\")\n    (:start 0.20 :end 0.40 :en \"Walking up the central aisle of the Nave, we genuflect on our right knee toward the Tabernacle before entering our pew.\" :es \"Por el pasillo de la Nave, hacemos una genuflexión con la rodilla derecha hacia el Sagrario antes de sentarnos.\" :la \"Ad Tabernaculum flectamus genua, Christum Dominum verum Deum adorantes.\")\n    (:start 0.40 :end 0.60 :en \"The Ambo is the Table of the Word, where the Holy Gospel and readings of Sacred Scripture are proclaimed.\" :es \"El Ambón es la Mesa de la Palabra, donde se proclaman las lecturas de la Sagrada Escritura y el Evangelio.\" :la \"Ambo est mensa Verbi Dei, unde Sanctum Evangelium fidelibus annuntiatur.\")\n    (:start 0.60 :end 0.80 :en \"The Altar is the sacred center representing Christ Himself, where the bread and wine become His Body and Blood.\" :es \"El Altar es el centro sagrado que representa a Cristo, donde el pan y el vino se convierten en Su Cuerpo y Sangre.\" :la \"Altare est Christus: hic sacrificium eucharisticum in remissionem peccatorum offertur.\")\n    (:start 0.80 :end 0.92 :en \"The golden Tabernacle holds the Real Presence of Christ in the Eucharist, watched over by the burning red Sanctuary Lamp.\" :es \"El Sagrario dorado guarda la Presencia Real de Jesús en la Eucaristía, acompañado por la lámpara roja del Santuario.\" :la \"In Tabernaculo Christus vere et substantialiter praesens permanet.\")\n    (:start 0.92 :end 1.00 :en \"We visit the Lady Chapel for quiet prayer with Our Lady, and contemplate the Baptismal Font where eternal life begins.\" :es \"Visitamos la Capilla de la Virgen para la oración, y contemplamos la Pila Bautismal donde comienza la vida eterna.\" :la \"Fons baptismatis et sacellum beatae Mariae Virginis.\")\n  ))\n  (:keyframes (\n    (:t 0.00 :title \"1. Narthex & Holy Water Stoup\" :rule \"Vestibulum: We bless ourselves with Holy Water to recall our Baptism.\")\n    (:t 0.20 :title \"2. Nave & Central Aisle\" :rule \"Navis: The Pilgrim People of God; we genuflect towards the Tabernacle before entering our pew.\")\n    (:t 0.40 :title \"3. Ambo (Lectern)\" :rule \"Mensa Verbi: The Table of the Word from which the Holy Gospel is proclaimed.\")\n    (:t 0.60 :title \"4. High Altar of Sacrifice\" :rule \"Altare Christi: Represents Christ Himself and the Holy Sacrifice of the Mass.\")\n    (:t 0.80 :title \"5. Tabernacle & Sanctuary Lamp\" :rule \"Tabernaculum: Houses the Blessed Sacrament; red lamp indicates Christ's Real Presence.\")\n    (:t 0.92 :title \"6. Lady Chapel & Baptismal Font\" :rule \"Fons & Sacellum: Devotional side chapel of Our Lady and the waters of new birth.\")\n  ))\n  (:interactive (\n    (:checkpoint :t 0.20\n      :prompt \"Why do Catholics genuflect on the right knee toward the Tabernacle when entering the Nave?\"\n      :options (\"To adore Jesus Christ truly and substantially present in the Blessed Sacrament\" \"As a greeting to the choir in the loft\" \"To test the church kneeler alignment\" \"To stretch before long liturgies\")\n      :answer 0\n      :explanation \"Genuflecting on our right knee is a sacred act of adoration directed specifically to Jesus Christ physically and divinely present in the consecrated Eucharist within the Tabernacle.\")\n    (:checkpoint :t 0.60\n      :prompt \"What does the High Altar represent in Catholic sacred architecture?\"\n      :options (\"Christ Himself, the living stone and center of the Eucharistic Sacrifice\" \"A podium for secular parish announcements\" \"A storage table exclusively for liturgical books\" \"A commemorative plaque to ancient benefactors\")\n      :answer 0\n      :explanation \"The altar represents Christ Himself, who is Priest, Altar, and Lamb of Sacrifice. The General Instruction of the Roman Missal emphasizes that the altar is the center of the thanksgiving accomplished through the Eucharist.\")\n    (:checkpoint :t 0.81\n      :prompt \"Why does a red Sanctuary Lamp burn day and night beside the Catholic Tabernacle?\"\n      :options (\"To signify the Real Presence of Jesus Christ in the Blessed Sacrament\" \"To provide night illumination for the sacristan\" \"To mark where incense is stored\" \"As an architectural fire exit indicator\")\n      :answer 0\n      :explanation \"Canon Law specifies that a special lamp or candle must shine continuously beside the Tabernacle to honor and signify the Eucharistic Real Presence of Christ.\")\n  ))\n  (:bindings (\n    (:target \"#church-lamp\" :attr \"opacity\" :expr \"(0.70 + Math.sin(t * Math.PI * 8) * 0.30) * (vars.candleGlow || 1.0)\")\n    (:target \"#spot-dot\" :attr \"cx\" :expr \"t < 0.20 ? 400 : (t < 0.40 ? 400 : (t < 0.60 ? 400 - ((t - 0.40)/0.20)*59 : (t < 0.80 ? 341 + ((t - 0.60)/0.20)*59 : (t < 0.92 ? 400 : 400 - Math.cos(((t - 0.92)/0.08)*Math.PI)*180))))\")\n    (:target \"#spot-dot\" :attr \"cy\" :expr \"t < 0.20 ? 435 - (t/0.20)*35 : (t < 0.40 ? 400 - ((t - 0.20)/0.20)*120 : (t < 0.60 ? 280 - ((t - 0.40)/0.20)*140 : (t < 0.80 ? 140 - ((t - 0.60)/0.20)*12 : (t < 0.92 ? 128 - ((t - 0.80)/0.12)*56 : 190))))\")\n    (:target \"#spot-halo\" :attr \"cx\" :expr \"t < 0.20 ? 400 : (t < 0.40 ? 400 : (t < 0.60 ? 400 - ((t - 0.40)/0.20)*59 : (t < 0.80 ? 341 + ((t - 0.60)/0.20)*59 : (t < 0.92 ? 400 : 400 - Math.cos(((t - 0.92)/0.08)*Math.PI)*180))))\")\n    (:target \"#spot-halo\" :attr \"cy\" :expr \"t < 0.20 ? 435 - (t/0.20)*35 : (t < 0.40 ? 400 - ((t - 0.20)/0.20)*120 : (t < 0.60 ? 280 - ((t - 0.40)/0.20)*140 : (t < 0.80 ? 140 - ((t - 0.60)/0.20)*12 : (t < 0.92 ? 128 - ((t - 0.80)/0.12)*56 : 190))))\")\n    (:target \"#spot-core\" :attr \"cx\" :expr \"t < 0.20 ? 400 : (t < 0.40 ? 400 : (t < 0.60 ? 400 - ((t - 0.40)/0.20)*59 : (t < 0.80 ? 341 + ((t - 0.60)/0.20)*59 : (t < 0.92 ? 400 : 400 - Math.cos(((t - 0.92)/0.08)*Math.PI)*180))))\")\n    (:target \"#spot-core\" :attr \"cy\" :expr \"t < 0.20 ? 435 - (t/0.20)*35 : (t < 0.40 ? 400 - ((t - 0.20)/0.20)*120 : (t < 0.60 ? 280 - ((t - 0.40)/0.20)*140 : (t < 0.80 ? 140 - ((t - 0.60)/0.20)*12 : (t < 0.92 ? 128 - ((t - 0.80)/0.12)*56 : 190))))\")\n    (:target \"#church-hud-title\" :attr \"textContent\" :expr \"t < 0.20 ? '1. NARTHEX & HOLY WATER STOUP' : (t < 0.40 ? '2. THE NAVE & PEWS' : (t < 0.60 ? '3. THE AMBO (LECTERN)' : (t < 0.80 ? '4. THE HIGH ALTAR OF SACRIFICE' : (t < 0.92 ? '5. THE TABERNACLE & SANCTUARY LAMP' : '6. LADY CHAPEL & BAPTISMAL FONT'))))\")\n    (:target \"#church-hud-desc\" :attr \"textContent\" :expr \"t < 0.20 ? 'Vestibulum & Aqua Benedicta • Blessing ourselves with Holy Water...' : (t < 0.40 ? 'Navis Ecclesiae • The Pilgrim People of God genuflect to Tabernacle...' : (t < 0.60 ? 'Mensa Verbi Dei • Proclaiming Sacred Scriptures & Holy Gospel...' : (t < 0.80 ? 'Altare Christi • Holy Sacrifice of the Mass & Eucharist...' : (t < 0.92 ? 'Tabernaculum Domini • Real Presence watched by burning red lamp...' : 'Sacellum Marianum & Fons • Devotional prayer & new birth...'))))\")\n  ))\n)\n"
    },
    "catholic-rites": {
      id: "catholic-rites",
      type: "Slide",
      title: "The 24 Catholic Rites & Churches: Unity in Diversity Across East & West",
      stage: "CATHOLIC LIFE",
      duration: 28.0,
      svgMarkup: "<svg viewBox=\"0 0 800 480\" xmlns=\"http://www.w3.org/2000/svg\">\n  <defs>\n    <!-- Sacred Ambience & Gradients -->\n    <radialGradient id=\"communion-sky\" cx=\"50%\" cy=\"35%\" r=\"70%\">\n      <stop offset=\"0%\" stop-color=\"#1e1b4b\" />\n      <stop offset=\"45%\" stop-color=\"#0f172a\" />\n      <stop offset=\"100%\" stop-color=\"#020617\" />\n    </radialGradient>\n\n    <radialGradient id=\"gold-halo-grad\" cx=\"50%\" cy=\"50%\" r=\"50%\">\n      <stop offset=\"0%\" stop-color=\"rgba(250, 204, 21, 0.95)\" />\n      <stop offset=\"60%\" stop-color=\"rgba(217, 119, 6, 0.5)\" />\n      <stop offset=\"100%\" stop-color=\"rgba(180, 83, 9, 0)\" />\n    </radialGradient>\n\n    <linearGradient id=\"gold-cross-grad\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">\n      <stop offset=\"0%\" stop-color=\"#fef08a\" />\n      <stop offset=\"40%\" stop-color=\"#eab308\" />\n      <stop offset=\"100%\" stop-color=\"#ca8a04\" />\n    </linearGradient>\n\n    <linearGradient id=\"byzantine-mosaic-grad\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n      <stop offset=\"0%\" stop-color=\"#3b82f6\" />\n      <stop offset=\"50%\" stop-color=\"#1d4ed8\" />\n      <stop offset=\"100%\" stop-color=\"#1e3a8a\" />\n    </linearGradient>\n\n    <linearGradient id=\"alexandrian-coptic-grad\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n      <stop offset=\"0%\" stop-color=\"#059669\" />\n      <stop offset=\"60%\" stop-color=\"#047857\" />\n      <stop offset=\"100%\" stop-color=\"#064e3b\" />\n    </linearGradient>\n\n    <linearGradient id=\"antioch-cedar-grad\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n      <stop offset=\"0%\" stop-color=\"#dc2626\" />\n      <stop offset=\"60%\" stop-color=\"#b91c1c\" />\n      <stop offset=\"100%\" stop-color=\"#7f1d1d\" />\n    </linearGradient>\n\n    <linearGradient id=\"chaldean-lotus-grad\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n      <stop offset=\"0%\" stop-color=\"#7c3aed\" />\n      <stop offset=\"60%\" stop-color=\"#6d28d9\" />\n      <stop offset=\"100%\" stop-color=\"#4c1d95\" />\n    </linearGradient>\n\n    <linearGradient id=\"armenian-stone-grad\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\n      <stop offset=\"0%\" stop-color=\"#ea580c\" />\n      <stop offset=\"60%\" stop-color=\"#c2410c\" />\n      <stop offset=\"100%\" stop-color=\"#7c2d12\" />\n    </linearGradient>\n\n    <linearGradient id=\"pedestal-grad\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">\n      <stop offset=\"0%\" stop-color=\"#334155\" />\n      <stop offset=\"50%\" stop-color=\"#475569\" />\n      <stop offset=\"100%\" stop-color=\"#1e293b\" />\n    </linearGradient>\n\n    <filter id=\"soft-glow\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\">\n      <feGaussianBlur stdDeviation=\"4\" result=\"blur\" />\n      <feComposite in=\"SourceGraphic\" in2=\"blur\" operator=\"over\" />\n    </filter>\n\n    <!-- Clip path to keep scrolling pavilions within stage bounds -->\n    <clipPath id=\"stage-viewport-clip\">\n      <rect x=\"0\" y=\"55\" width=\"800\" height=\"345\" />\n    </clipPath>\n  </defs>\n\n  <!-- Background Canvas -->\n  <rect width=\"800\" height=\"480\" fill=\"url(#communion-sky)\" />\n\n  <!-- Architectural Background: Roman Basilica Arches & Byzantine Domes -->\n  <g opacity=\"0.22\">\n    <path d=\"M 40,400 L 40,220 C 40,160 180,160 180,220 L 180,400 Z\" fill=\"none\" stroke=\"#64748b\" stroke-width=\"2.5\" />\n    <path d=\"M 60,400 L 60,230 C 60,180 160,180 160,230 L 160,400 Z\" fill=\"none\" stroke=\"#475569\" stroke-width=\"1.5\" />\n    <path d=\"M 620,400 L 620,240 C 620,180 670,140 700,90 C 730,140 780,180 780,240 L 780,400 Z\" fill=\"none\" stroke=\"#ca8a04\" stroke-width=\"2\" />\n    <line x1=\"700\" y1=\"90\" x2=\"700\" y2=\"55\" stroke=\"#facc15\" stroke-width=\"2.5\" />\n    <line x1=\"690\" y1=\"70\" x2=\"710\" y2=\"70\" stroke=\"#facc15\" stroke-width=\"2.5\" />\n  </g>\n\n  <!-- TOP SHOWCASE MARQUEE: Active Liturgical Tradition Display -->\n  <g id=\"rite-showcase-panel\" transform=\"translate(400, 26)\">\n    <rect x=\"-310\" y=\"-16\" width=\"620\" height=\"36\" rx=\"18\" fill=\"rgba(15, 23, 42, 0.92)\" stroke=\"#334155\" stroke-width=\"1.5\" filter=\"url(#soft-glow)\" />\n    <!-- Active Rite Title -->\n    <text id=\"active-rite-title\" x=\"0\" y=\"0\" text-anchor=\"middle\" fill=\"#facc15\" font-size=\"12\" font-weight=\"900\" font-family=\"sans-serif\">\n      1. Western Latin Rite (Roman, Ambrosian, Mozarabic)\n    </text>\n    <!-- Active Rite Subtitle / Heartland -->\n    <text id=\"active-rite-desc\" x=\"0\" y=\"13\" text-anchor=\"middle\" fill=\"#cbd5e1\" font-size=\"9\" font-family=\"sans-serif\">\n      1 Western Church (&gt;1.3B) &bull; Unleavened Host (Hostia Pura) &bull; Statues &amp; Gregorian Chant\n    </text>\n  </g>\n\n  <!-- CENTER: The Holy See Cathedra & Communion Beacon (Unity with Peter) -->\n  <g id=\"communion-beacon-group\" transform=\"translate(400, 92)\">\n    <!-- Expanding Halo Pulse -->\n    <circle id=\"beacon-halo\" cx=\"0\" cy=\"0\" r=\"30\" fill=\"url(#gold-halo-grad)\" opacity=\"0.8\" filter=\"url(#soft-glow)\" />\n    <circle id=\"beacon-pulse\" cx=\"0\" cy=\"0\" r=\"48\" fill=\"none\" stroke=\"#facc15\" stroke-width=\"1.2\" opacity=\"0.5\" />\n\n    <!-- Communion Ray straight down to the center-stage shrine -->\n    <line id=\"beacon-ray-down\" x1=\"0\" y1=\"18\" x2=\"0\" y2=\"90\" stroke=\"#facc15\" stroke-width=\"2\" stroke-dasharray=\"3 3\" opacity=\"0.85\" />\n\n    <!-- Keys of Saint Peter (Decussate) -->\n    <g id=\"communion-beacon-core\" cursor=\"grab\" filter=\"url(#soft-glow)\">\n      <!-- Golden Key -->\n      <path d=\"M -12,-12 L 12,12 M 9,9 L 14,4 M 6,12 L 11,7\" stroke=\"#facc15\" stroke-width=\"2.5\" stroke-linecap=\"round\" />\n      <circle cx=\"-14\" cy=\"-14\" r=\"4.5\" fill=\"none\" stroke=\"#facc15\" stroke-width=\"2.5\" />\n\n      <!-- Silver Key -->\n      <path d=\"M 12,-12 L -12,12 M -9,9 L -14,4 M -6,12 L -11,7\" stroke=\"#e2e8f0\" stroke-width=\"2.5\" stroke-linecap=\"round\" />\n      <circle cx=\"14\" cy=\"-14\" r=\"4.5\" fill=\"none\" stroke=\"#e2e8f0\" stroke-width=\"2.5\" />\n\n      <!-- Papal Tiara / Mitre Accent -->\n      <path d=\"M -9,-20 Q 0,-28 9,-20 L 6,-14 Q 0,-17 -6,-14 Z\" fill=\"#eab308\" stroke=\"#ca8a04\" stroke-width=\"1\" />\n    </g>\n\n    <text x=\"0\" y=\"26\" text-anchor=\"middle\" fill=\"#fef08a\" font-size=\"9\" font-weight=\"bold\" font-family=\"sans-serif\">\n      CATHEDRA PETRI &bull; 24 CHURCHES IN COMMUNION\n    </text>\n  </g>\n\n  <!-- ===================================================================== -->\n  <!-- HORIZONTAL SCROLLING PANORAMA: 6 Dedicated Liturgical Pavilions       -->\n  <!-- Translates along X (-0, -800, -1600, -2400, -3200, -4000)             -->\n  <!-- ===================================================================== -->\n  <g id=\"panoramic-rites-viewport\" clip-path=\"url(#stage-viewport-clip)\">\n    <g id=\"panoramic-rites-strip\" transform=\"translate(0, 0)\">\n\n      <!-- ================================================================= -->\n      <!-- STATION 1: Western Latin Rite (Centered at X = 400)               -->\n      <!-- ================================================================= -->\n      <g id=\"shrine-station-1\" transform=\"translate(400, 255)\">\n        <!-- Basilica Arch Architecture -->\n        <path d=\"M -170,120 L -170,-20 C -170,-80 170,-80 170,-20 L 170,120 Z\" fill=\"rgba(30, 41, 59, 0.45)\" stroke=\"#3b82f6\" stroke-width=\"2\" />\n        <path d=\"M -150,120 L -150,-15 C -150,-65 150,-65 150,-15 L 150,120 Z\" fill=\"none\" stroke=\"#1d4ed8\" stroke-width=\"1\" stroke-dasharray=\"4 4\" />\n\n        <!-- Altar Stone Table -->\n        <rect x=\"-140\" y=\"32\" width=\"280\" height=\"85\" rx=\"8\" fill=\"url(#pedestal-grad)\" stroke=\"#475569\" stroke-width=\"2\" />\n        <rect x=\"-130\" y=\"36\" width=\"260\" height=\"7\" fill=\"#e2e8f0\" />\n\n        <!-- Golden Roman Chalice -->\n        <path d=\"M -36,32 Q -36,-4 -18,-4 Q 0,-4 0,32 Z\" fill=\"url(#gold-cross-grad)\" stroke=\"#ca8a04\" stroke-width=\"1.5\" />\n        <rect x=\"-21\" y=\"18\" width=\"6\" height=\"14\" fill=\"#ca8a04\" />\n        <ellipse cx=\"-18\" cy=\"32\" rx=\"14\" ry=\"4\" fill=\"#a16207\" />\n\n        <!-- Pure White Unleavened Host (Hostia Pura) with IHS -->\n        <circle cx=\"22\" cy=\"10\" r=\"22\" fill=\"#ffffff\" stroke=\"#cbd5e1\" stroke-width=\"2\" filter=\"url(#soft-glow)\" />\n        <text x=\"22\" y=\"15\" text-anchor=\"middle\" fill=\"#b45309\" font-size=\"12\" font-weight=\"900\" font-family=\"serif\">IHS</text>\n        <circle cx=\"22\" cy=\"10\" r=\"20\" fill=\"none\" stroke=\"#f1f5f9\" stroke-width=\"1\" stroke-dasharray=\"2 2\" />\n\n        <!-- Tradition Info Header -->\n        <text x=\"0\" y=\"66\" text-anchor=\"middle\" fill=\"#93c5fd\" font-size=\"13\" font-weight=\"900\" font-family=\"sans-serif\">\n          1. WESTERN LATIN TRADITION\n        </text>\n        <text x=\"0\" y=\"82\" text-anchor=\"middle\" fill=\"#f8fafc\" font-size=\"10\" font-weight=\"700\" font-family=\"sans-serif\">\n          Roman, Ambrosian (Milan) &amp; Mozarabic (Toledo) Rites\n        </text>\n        <text x=\"0\" y=\"98\" text-anchor=\"middle\" fill=\"#cbd5e1\" font-size=\"8.5\" font-family=\"sans-serif\">\n          Unleavened Bread &bull; Gregorian Chant &bull; Statues &bull; 1.3 Billion Catholics\n        </text>\n      </g>\n\n      <!-- ================================================================= -->\n      <!-- STATION 2: Byzantine Tradition (Centered at X = 1200)             -->\n      <!-- ================================================================= -->\n      <g id=\"shrine-station-2\" transform=\"translate(1200, 255)\">\n        <!-- Byzantine Onion Dome Arch -->\n        <path d=\"M -170,120 L -170,0 C -170,-45 -90,-85 0,-105 C 90,-85 170,-45 170,0 L 170,120 Z\" fill=\"rgba(30, 41, 59, 0.45)\" stroke=\"#f59e0b\" stroke-width=\"2\" />\n        <circle cx=\"0\" cy=\"-105\" r=\"5\" fill=\"#facc15\" />\n        <line x1=\"0\" y1=\"-105\" x2=\"0\" y2=\"-120\" stroke=\"#facc15\" stroke-width=\"2\" />\n        <line x1=\"-6\" y1=\"-113\" x2=\"6\" y2=\"-113\" stroke=\"#facc15\" stroke-width=\"2\" />\n\n        <!-- Iconostasis Base Pedestal -->\n        <rect x=\"-140\" y=\"32\" width=\"280\" height=\"85\" rx=\"8\" fill=\"url(#pedestal-grad)\" stroke=\"#b45309\" stroke-width=\"2\" />\n        <rect x=\"-130\" y=\"36\" width=\"260\" height=\"7\" fill=\"#ca8a04\" />\n\n        <!-- Holy Icon of Christ Pantocrator -->\n        <rect id=\"icon-gold-glow\" x=\"-50\" y=\"-8\" width=\"42\" height=\"50\" rx=\"4\" fill=\"#ca8a04\" opacity=\"0.95\" filter=\"url(#soft-glow)\" />\n        <rect x=\"-47\" y=\"-5\" width=\"36\" height=\"44\" rx=\"3\" fill=\"url(#byzantine-mosaic-grad)\" stroke=\"#facc15\" stroke-width=\"1.5\" />\n        <circle cx=\"-29\" cy=\"12\" r=\"12\" fill=\"#facc15\" opacity=\"0.85\" />\n        <path d=\"M -34,12 C -34,4 -24,4 -24,12 C -24,18 -34,18 -34,12 Z\" fill=\"#991b1b\" />\n        <text x=\"-29\" y=\"3\" text-anchor=\"middle\" fill=\"#fef08a\" font-size=\"7\" font-weight=\"bold\">IC XC</text>\n\n        <!-- Leavened Prosphora Bread with Seal -->\n        <circle cx=\"28\" cy=\"12\" r=\"23\" fill=\"#fed7aa\" stroke=\"#d97706\" stroke-width=\"2\" filter=\"url(#soft-glow)\" />\n        <rect x=\"16\" y=\"0\" width=\"24\" height=\"24\" fill=\"#ffedd5\" stroke=\"#b45309\" stroke-width=\"1\" />\n        <text x=\"28\" y=\"10\" text-anchor=\"middle\" fill=\"#9a3412\" font-size=\"7.5\" font-weight=\"bold\">IC XC</text>\n        <text x=\"28\" y=\"20\" text-anchor=\"middle\" fill=\"#9a3412\" font-size=\"7.5\" font-weight=\"bold\">NI KA</text>\n\n        <!-- Tradition Info Header -->\n        <text x=\"0\" y=\"66\" text-anchor=\"middle\" fill=\"#facc15\" font-size=\"13\" font-weight=\"900\" font-family=\"sans-serif\">\n          2. BYZANTINE TRADITION\n        </text>\n        <text x=\"0\" y=\"82\" text-anchor=\"middle\" fill=\"#fef08a\" font-size=\"10\" font-weight=\"700\" font-family=\"sans-serif\">\n          14 Autonomous Eastern Catholic Churches\n        </text>\n        <text x=\"0\" y=\"98\" text-anchor=\"middle\" fill=\"#cbd5e1\" font-size=\"8.5\" font-family=\"sans-serif\">\n          Sacred Icons &bull; Leavened Prosphora &bull; Liturgy of St. John Chrysostom\n        </text>\n      </g>\n\n      <!-- ================================================================= -->\n      <!-- STATION 3: Alexandrian Tradition (Centered at X = 2000)           -->\n      <!-- ================================================================= -->\n      <g id=\"shrine-station-3\" transform=\"translate(2000, 255)\">\n        <!-- Coptic Triple Arch Architecture -->\n        <path d=\"M -170,120 L -170,-10 C -170,-60 -50,-80 0,-80 C 50,-80 170,-60 170,-10 L 170,120 Z\" fill=\"rgba(6, 78, 59, 0.45)\" stroke=\"#10b981\" stroke-width=\"2\" />\n        \n        <!-- Altar Base Pedestal -->\n        <rect x=\"-140\" y=\"32\" width=\"280\" height=\"85\" rx=\"8\" fill=\"url(#pedestal-grad)\" stroke=\"#047857\" stroke-width=\"2\" />\n        <rect x=\"-130\" y=\"36\" width=\"260\" height=\"7\" fill=\"#10b981\" />\n\n        <!-- Coptic Cross with Radiant Sunburst Loop -->\n        <g transform=\"translate(-25, 12)\" filter=\"url(#soft-glow)\">\n          <circle cx=\"0\" cy=\"-12\" r=\"11\" fill=\"none\" stroke=\"#facc15\" stroke-width=\"2.5\" />\n          <line x1=\"0\" y1=\"-1\" x2=\"0\" y2=\"18\" stroke=\"#facc15\" stroke-width=\"3\" />\n          <line x1=\"-12\" y1=\"6\" x2=\"12\" y2=\"6\" stroke=\"#facc15\" stroke-width=\"2.5\" />\n          <!-- Ray Flares -->\n          <circle cx=\"-12\" cy=\"6\" r=\"2.5\" fill=\"#facc15\" />\n          <circle cx=\"12\" cy=\"6\" r=\"2.5\" fill=\"#facc15\" />\n          <circle cx=\"0\" cy=\"18\" r=\"2.5\" fill=\"#facc15\" />\n        </g>\n\n        <!-- Swinging Ethiopian Thurible with Bells -->\n        <g transform=\"translate(30, 8)\" filter=\"url(#soft-glow)\">\n          <path d=\"M -12,20 C -12,8 12,8 12,20 Z\" fill=\"#ca8a04\" stroke=\"#facc15\" stroke-width=\"1.5\" />\n          <line x1=\"-10\" y1=\"8\" x2=\"0\" y2=\"-12\" stroke=\"#eab308\" stroke-width=\"1.2\" />\n          <line x1=\"10\" y1=\"8\" x2=\"0\" y2=\"-12\" stroke=\"#eab308\" stroke-width=\"1.2\" />\n          <line x1=\"0\" y1=\"8\" x2=\"0\" y2=\"-12\" stroke=\"#eab308\" stroke-width=\"1.2\" />\n          <circle cx=\"0\" cy=\"-12\" r=\"3\" fill=\"#facc15\" />\n          <!-- Fragrant Incense Clouds -->\n          <circle cx=\"-6\" cy=\"-18\" r=\"4\" fill=\"#e2e8f0\" opacity=\"0.6\" />\n          <circle cx=\"4\" cy=\"-24\" r=\"5\" fill=\"#e2e8f0\" opacity=\"0.5\" />\n        </g>\n\n        <!-- Tradition Info Header -->\n        <text x=\"0\" y=\"66\" text-anchor=\"middle\" fill=\"#6ee7b7\" font-size=\"13\" font-weight=\"900\" font-family=\"sans-serif\">\n          3. ALEXANDRIAN TRADITION\n        </text>\n        <text x=\"0\" y=\"82\" text-anchor=\"middle\" fill=\"#a7f3d0\" font-size=\"10\" font-weight=\"700\" font-family=\"sans-serif\">\n          Coptic (Egypt), Ethiopian &amp; Eritrean Catholic Churches\n        </text>\n        <text x=\"0\" y=\"98\" text-anchor=\"middle\" fill=\"#cbd5e1\" font-size=\"8.5\" font-family=\"sans-serif\">\n          Ge'ez &amp; Coptic Chant &bull; Liturgy of St. Mark &bull; Desert Monasticism\n        </text>\n      </g>\n\n      <!-- ================================================================= -->\n      <!-- STATION 4: Antiochian Tradition (Centered at X = 2800)            -->\n      <!-- ================================================================= -->\n      <g id=\"shrine-station-4\" transform=\"translate(2800, 255)\">\n        <!-- Cedar of Lebanon Arch Profile -->\n        <path d=\"M -170,120 L -170,-15 C -170,-70 170,-70 170,-15 L 170,120 Z\" fill=\"rgba(127, 29, 29, 0.45)\" stroke=\"#ef4444\" stroke-width=\"2\" />\n        \n        <!-- Altar Base Pedestal -->\n        <rect x=\"-140\" y=\"32\" width=\"280\" height=\"85\" rx=\"8\" fill=\"url(#pedestal-grad)\" stroke=\"#991b1b\" stroke-width=\"2\" />\n        <rect x=\"-130\" y=\"36\" width=\"260\" height=\"7\" fill=\"#ef4444\" />\n\n        <!-- Maronite Cedar of Lebanon Altar Cross -->\n        <g transform=\"translate(-30, 10)\" filter=\"url(#soft-glow)\">\n          <!-- Cedar Tree Silhouette behind cross -->\n          <path d=\"M 0,-18 L -14,-4 L -4,-4 L -18,8 L 18,8 L 4,-4 L 14,-4 Z\" fill=\"#047857\" opacity=\"0.8\" />\n          <rect x=\"-2\" y=\"8\" width=\"4\" height=\"6\" fill=\"#78350f\" />\n          <!-- Golden Cross -->\n          <line x1=\"0\" y1=\"-20\" x2=\"0\" y2=\"16\" stroke=\"#facc15\" stroke-width=\"3\" stroke-linecap=\"round\" />\n          <line x1=\"-12\" y1=\"-8\" x2=\"12\" y2=\"-8\" stroke=\"#facc15\" stroke-width=\"2.5\" stroke-linecap=\"round\" />\n        </g>\n\n        <!-- Aramaic Words of Consecration Scroll -->\n        <g transform=\"translate(30, 10)\">\n          <rect x=\"-35\" y=\"-14\" width=\"70\" height=\"30\" rx=\"4\" fill=\"#fef08a\" stroke=\"#ca8a04\" stroke-width=\"1.5\" />\n          <text x=\"0\" y=\"-1\" text-anchor=\"middle\" fill=\"#78350f\" font-size=\"8\" font-weight=\"900\" font-family=\"serif\">ܗܢܐ ܗܘ ܦܓܪܝ</text>\n          <text x=\"0\" y=\"10\" text-anchor=\"middle\" fill=\"#92400e\" font-size=\"6.5\" font-weight=\"bold\" font-family=\"sans-serif\">Hano haw phaghro dil</text>\n        </g>\n\n        <!-- Tradition Info Header -->\n        <text x=\"0\" y=\"66\" text-anchor=\"middle\" fill=\"#fca5a5\" font-size=\"13\" font-weight=\"900\" font-family=\"sans-serif\">\n          4. ANTIOCHIAN TRADITION\n        </text>\n        <text x=\"0\" y=\"82\" text-anchor=\"middle\" fill=\"#fecaca\" font-size=\"10\" font-weight=\"700\" font-family=\"sans-serif\">\n          Maronite (Unbroken Communion), Syrian &amp; Malankara Churches\n        </text>\n        <text x=\"0\" y=\"98\" text-anchor=\"middle\" fill=\"#cbd5e1\" font-size=\"8.5\" font-family=\"sans-serif\">\n          Aramaic Language of Christ &bull; Liturgy of St. James &bull; St. Ephrem the Syrian\n        </text>\n      </g>\n\n      <!-- ================================================================= -->\n      <!-- STATION 5: Chaldean Tradition (Centered at X = 3600)              -->\n      <!-- ================================================================= -->\n      <g id=\"shrine-station-5\" transform=\"translate(3600, 255)\">\n        <!-- Mesopotamian & Indian Sanctuary Arch -->\n        <path d=\"M -170,120 L -170,-15 C -170,-75 170,-75 170,-15 L 170,120 Z\" fill=\"rgba(76, 29, 149, 0.45)\" stroke=\"#8b5cf6\" stroke-width=\"2\" />\n        \n        <!-- Altar Base Pedestal -->\n        <rect x=\"-140\" y=\"32\" width=\"280\" height=\"85\" rx=\"8\" fill=\"url(#pedestal-grad)\" stroke=\"#6d28d9\" stroke-width=\"2\" />\n        <rect x=\"-130\" y=\"36\" width=\"260\" height=\"7\" fill=\"#8b5cf6\" />\n\n        <!-- Ancient Saint Thomas Nasrani Cross (Blooming Lotus Flower & Dove) -->\n        <g transform=\"translate(0, 8)\" filter=\"url(#soft-glow)\">\n          <!-- Lotus Petals at Base -->\n          <path d=\"M -18,16 Q 0,8 18,16 Q 0,22 -18,16 Z\" fill=\"#f472b6\" stroke=\"#db2777\" stroke-width=\"1.2\" />\n          <!-- The Four-Pointed Nasrani Cross -->\n          <line x1=\"0\" y1=\"-14\" x2=\"0\" y2=\"16\" stroke=\"#facc15\" stroke-width=\"3.5\" stroke-linecap=\"round\" />\n          <line x1=\"-14\" y1=\"-2\" x2=\"14\" y2=\"-2\" stroke=\"#facc15\" stroke-width=\"3\" stroke-linecap=\"round\" />\n          <!-- Trefoil Buds on Cross Arms -->\n          <circle cx=\"-14\" cy=\"-2\" r=\"2.5\" fill=\"#fef08a\" />\n          <circle cx=\"14\" cy=\"-2\" r=\"2.5\" fill=\"#fef08a\" />\n          <circle cx=\"0\" cy=\"-14\" r=\"2.5\" fill=\"#fef08a\" />\n          <!-- Holy Spirit Dove Descending at Peak -->\n          <path d=\"M 0,-24 L -5,-19 L 0,-17 L 5,-19 Z\" fill=\"#ffffff\" />\n        </g>\n\n        <!-- Tradition Info Header -->\n        <text x=\"0\" y=\"66\" text-anchor=\"middle\" fill=\"#c4b5fd\" font-size=\"13\" font-weight=\"900\" font-family=\"sans-serif\">\n          5. CHALDEAN TRADITION\n        </text>\n        <text x=\"0\" y=\"82\" text-anchor=\"middle\" fill=\"#ddd6fe\" font-size=\"10\" font-weight=\"700\" font-family=\"sans-serif\">\n          Chaldean (Iraq) &amp; Syro-Malabar Catholic Church (India, AD 52)\n        </text>\n        <text x=\"0\" y=\"98\" text-anchor=\"middle\" fill=\"#cbd5e1\" font-size=\"8.5\" font-family=\"sans-serif\">\n          St. Thomas Nasranis &bull; Anaphora of Addai &amp; Mari &bull; East Syriac Heritage\n        </text>\n      </g>\n\n      <!-- ================================================================= -->\n      <!-- STATION 6: Armenian Tradition (Centered at X = 4400)              -->\n      <!-- ================================================================= -->\n      <g id=\"shrine-station-6\" transform=\"translate(4400, 255)\">\n        <!-- Armenian Stone Church Conical Dome Arch -->\n        <path d=\"M -170,120 L -170,-10 L 0,-90 L 170,-10 L 170,120 Z\" fill=\"rgba(124, 45, 18, 0.45)\" stroke=\"#f97316\" stroke-width=\"2\" />\n        \n        <!-- Altar Base Pedestal -->\n        <rect x=\"-140\" y=\"32\" width=\"280\" height=\"85\" rx=\"8\" fill=\"url(#pedestal-grad)\" stroke=\"#9a3412\" stroke-width=\"2\" />\n        <rect x=\"-130\" y=\"36\" width=\"260\" height=\"7\" fill=\"#f97316\" />\n\n        <!-- Armenian Stone Khachkar (Intricately Carved Cross of Life) -->\n        <g transform=\"translate(-25, 10)\" filter=\"url(#soft-glow)\">\n          <rect x=\"-15\" y=\"-22\" width=\"30\" height=\"42\" rx=\"4\" fill=\"#78350f\" stroke=\"#ca8a04\" stroke-width=\"1.5\" />\n          <!-- Carved Cross -->\n          <line x1=\"0\" y1=\"-18\" x2=\"0\" y2=\"14\" stroke=\"#facc15\" stroke-width=\"2.5\" />\n          <line x1=\"-10\" y1=\"-8\" x2=\"10\" y2=\"-8\" stroke=\"#facc15\" stroke-width=\"2.5\" />\n          <!-- Grapevine and Rosette Motifs -->\n          <circle cx=\"0\" cy=\"12\" r=\"3\" fill=\"#fde047\" />\n          <circle cx=\"0\" cy=\"-18\" r=\"2.5\" fill=\"#fde047\" />\n        </g>\n\n        <!-- Consecrated Chalice of Unmixed Wine -->\n        <g transform=\"translate(30, 10)\" filter=\"url(#soft-glow)\">\n          <path d=\"M -12,18 Q -12,0 0,0 Q 12,0 12,18 Z\" fill=\"#991b1b\" stroke=\"#facc15\" stroke-width=\"1.5\" />\n          <rect x=\"-2\" y=\"10\" width=\"4\" height=\"8\" fill=\"#ca8a04\" />\n          <ellipse cx=\"0\" cy=\"18\" rx=\"8\" ry=\"3\" fill=\"#ca8a04\" />\n        </g>\n\n        <!-- Tradition Info Header -->\n        <text x=\"0\" y=\"66\" text-anchor=\"middle\" fill=\"#fdba74\" font-size=\"13\" font-weight=\"900\" font-family=\"sans-serif\">\n          6. ARMENIAN TRADITION\n        </text>\n        <text x=\"0\" y=\"82\" text-anchor=\"middle\" fill=\"#fed7aa\" font-size=\"10\" font-weight=\"700\" font-family=\"sans-serif\">\n          Armenian Catholic Church (Holy See of Cilicia)\n        </text>\n        <text x=\"0\" y=\"98\" text-anchor=\"middle\" fill=\"#cbd5e1\" font-size=\"8.5\" font-family=\"sans-serif\">\n          First Christian Nation (AD 301) &bull; Stone Khachkars &bull; Unmixed Wine\n        </text>\n      </g>\n\n    </g>\n  </g>\n\n  <!-- Sanctuary Floor Perspective Grid -->\n  <path d=\"M 0,395 L 800,395 M 0,425 L 800,425 M 0,455 L 800,455\" stroke=\"#1e293b\" stroke-width=\"1\" />\n  <path d=\"M 100,395 L 40,480 M 250,395 L 210,480 M 400,395 L 400,480 M 550,395 L 590,480 M 700,395 L 760,480\" stroke=\"#1e293b\" stroke-width=\"1\" opacity=\"0.6\" />\n\n  <!-- Interactive Rite Family Dial at Bottom (Stations: 140, 244, 348, 452, 556, 660) -->\n  <g id=\"rite-selector-container\" transform=\"translate(0, 412)\">\n    <!-- Header Marquee Label above track -->\n    <text x=\"400\" y=\"-3\" text-anchor=\"middle\" fill=\"#94a3b8\" font-size=\"8.5\" font-weight=\"700\" letter-spacing=\"0.06em\" font-family=\"sans-serif\">\n      HORIZONTAL SCROLLING TRADITION PANORAMA (DRAG SLIDER OR CLICK A RITE)\n    </text>\n\n    <!-- Selector Track -->\n    <rect x=\"90\" y=\"6\" width=\"620\" height=\"24\" rx=\"12\" fill=\"#0f172a\" stroke=\"#334155\" stroke-width=\"2\" />\n    \n    <!-- Station 1: Roman (x=140) -->\n    <g id=\"station-1-btn\" cursor=\"pointer\">\n      <rect id=\"tick-1-pill\" x=\"100\" y=\"8\" width=\"80\" height=\"20\" rx=\"10\" fill=\"#2563eb\" opacity=\"0.9\" />\n      <text id=\"tick-1-text\" x=\"140\" y=\"22\" text-anchor=\"middle\" fill=\"#fef08a\" font-size=\"10\" font-weight=\"bold\" font-family=\"sans-serif\">1. Roman</text>\n    </g>\n\n    <!-- Station 2: Byzantine (x=244) -->\n    <g id=\"station-2-btn\" cursor=\"pointer\">\n      <rect id=\"tick-2-pill\" x=\"198\" y=\"8\" width=\"92\" height=\"20\" rx=\"10\" fill=\"#d97706\" opacity=\"0.0\" />\n      <text id=\"tick-2-text\" x=\"244\" y=\"22\" text-anchor=\"middle\" fill=\"#94a3b8\" font-size=\"10\" font-weight=\"bold\" font-family=\"sans-serif\">2. Byzantine</text>\n    </g>\n\n    <!-- Station 3: Alexandrian (x=348) -->\n    <g id=\"station-3-btn\" cursor=\"pointer\">\n      <rect id=\"tick-3-pill\" x=\"300\" y=\"8\" width=\"96\" height=\"20\" rx=\"10\" fill=\"#059669\" opacity=\"0.0\" />\n      <text id=\"tick-3-text\" x=\"348\" y=\"22\" text-anchor=\"middle\" fill=\"#94a3b8\" font-size=\"10\" font-weight=\"bold\" font-family=\"sans-serif\">3. Alexandrian</text>\n    </g>\n\n    <!-- Station 4: Antiochian (x=452) -->\n    <g id=\"station-4-btn\" cursor=\"pointer\">\n      <rect id=\"tick-4-pill\" x=\"406\" y=\"8\" width=\"92\" height=\"20\" rx=\"10\" fill=\"#dc2626\" opacity=\"0.0\" />\n      <text id=\"tick-4-text\" x=\"452\" y=\"22\" text-anchor=\"middle\" fill=\"#94a3b8\" font-size=\"10\" font-weight=\"bold\" font-family=\"sans-serif\">4. Antiochian</text>\n    </g>\n\n    <!-- Station 5: Chaldean (x=556) -->\n    <g id=\"station-5-btn\" cursor=\"pointer\">\n      <rect id=\"tick-5-pill\" x=\"510\" y=\"8\" width=\"92\" height=\"20\" rx=\"10\" fill=\"#7c3aed\" opacity=\"0.0\" />\n      <text id=\"tick-5-text\" x=\"556\" y=\"22\" text-anchor=\"middle\" fill=\"#94a3b8\" font-size=\"10\" font-weight=\"bold\" font-family=\"sans-serif\">5. Chaldean</text>\n    </g>\n\n    <!-- Station 6: Armenian (x=660) -->\n    <g id=\"station-6-btn\" cursor=\"pointer\">\n      <rect id=\"tick-6-pill\" x=\"614\" y=\"8\" width=\"92\" height=\"20\" rx=\"10\" fill=\"#ea580c\" opacity=\"0.0\" />\n      <text id=\"tick-6-text\" x=\"660\" y=\"22\" text-anchor=\"middle\" fill=\"#94a3b8\" font-size=\"10\" font-weight=\"bold\" font-family=\"sans-serif\">6. Armenian</text>\n    </g>\n\n    <!-- Draggable Knob (x starts at 140) -->\n    <g id=\"rite-selector-knob\" cursor=\"ew-resize\" transform=\"translate(140, 18)\">\n      <circle cx=\"0\" cy=\"0\" r=\"15\" fill=\"#facc15\" stroke=\"#ca8a04\" stroke-width=\"2.5\" filter=\"url(#soft-glow)\" />\n      <circle cx=\"0\" cy=\"0\" r=\"6\" fill=\"#1e1b4b\" />\n      <path d=\"M -3,0 L 3,0 M 0,-3 L 0,3\" stroke=\"#facc15\" stroke-width=\"1.5\" />\n    </g>\n  </g>\n</svg>\n",
      astSource: "(:scene :id \"catholic-rites\" :type \"Slide\" :oak-id \"OAK-KS3-RE-011\" :oak-unit \"ks3-re-catholic-sacramental-rites\" :title \"The 24 Catholic Rites & Churches: Unity in Diversity Across East & West\" :stage \"CATHOLIC LIFE\" :duration 28.0\n  (:vars (\n    (:var :name \"selectedRite\" :val 1.0 :min 1.0 :max 6.0 :step 1.0 :label \"Selected Liturgical Rite\")\n    (:var :name \"communionGlow\" :val 1.0 :min 0.2 :max 2.0 :step 0.1 :label \"Communion with Holy See Beacon\")\n    (:var :name \"iconShimmer\" :val 0.8 :min 0.0 :max 1.5 :step 0.1 :label \"Iconostasis & Mosaic Shimmer\")\n  ))\n\n  (:inputs (\n    (:slider :var \"selectedRite\" :label \"Liturgical Tradition\" :min 1.0 :max 6.0 :step 1.0)\n    (:slider :var \"communionGlow\" :label \"Peter's Beacon\" :min 0.2 :max 2.0 :step 0.1)\n    (:slider :var \"iconShimmer\" :label \"Icon Shimmer\" :min 0.0 :max 1.5 :step 0.1)\n  ))\n\n  (:gestures (\n    (:draggable :target \"#rite-selector-knob\" :axis \"x\" :min 140 :max 660 :var \"selectedRite\")\n  ))\n\n  (:subtitles (\n    (:start 0.00 :end 0.20 :en \"The Catholic Church is a global communion of 24 autonomous (sui iuris) Churches united under the Bishop of Rome.\" :es \"La Iglesia Católica es una comunión global de 24 Iglesias autónomas (sui iuris) unidas bajo el Obispo de Roma.\" :la \"Ecclesia Catholica est communio viginti quattuor Ecclesiarum sui iuris sub Romano Pontifice.\")\n    (:start 0.20 :end 0.45 :en \"The Latin (Western) Church shares full communion with 23 ancient Eastern Catholic Churches spanning 6 Liturgical Traditions.\" :es \"La Iglesia Latina comparte plena comunión con 23 Iglesias Católicas Orientales a través de 6 Tradiciones Litúrgicas.\" :la \"Una Ecclesia Occidentalis et viginti tres Ecclesiae Orientales sex traditiones liturgicas participant.\")\n    (:start 0.45 :end 0.70 :en \"From the Byzantine Divine Liturgy with sacred icons to Alexandrian Ge'ez chant, Christ's Church breathes with two lungs: East and West.\" :es \"Desde la Divina Liturgia bizantina con iconos hasta el canto ge'ez alejandrino, la Iglesia respira con dos pulmones.\" :la \"Ecclesia duobus pulmonibus respirat: Oriente et Occidente in sacra liturgia et iconibus concordibus.\")\n    (:start 0.70 :end 0.88 :en \"Ancient Eastern traditions use leavened prosphora bread symbolizing the Resurrection, alongside holy icons and fragrant incense.\" :es \"Las tradiciones orientales usan pan leudado prosfora simbolizando la Resurrección, con iconos e incienso.\" :la \"Panis fermentatus prosphora Resurrectionem Christi significat una cum thure et sanctis iconibus.\")\n    (:start 0.88 :end 1.00 :en \"In all 24 Churches, the same true Sacraments, apostolic faith, and communion with the Successor of Peter are fully preserved.\" :es \"En las 24 Iglesias se preservan los mismos verdaderos Sacramentos, la fe apostólica y la comunión con Pedro.\" :la \"In omnibus viginti quattuor Ecclesiis eadem sacramenta et communio cum Successore Petri servantur.\")\n  ))\n\n  (:keyframes (\n    (:t 0.00 :title \"1. The Universal Catholic Communion (24 Churches)\" :rule \"Una Ecclesia: 24 autonomous Churches (1 Western Latin + 23 Eastern Catholic) in one faith.\")\n    (:t 0.20 :title \"2. The Six Liturgical Families\" :rule \"Traditiones: Latin, Byzantine, Alexandrian, Antiochene, Chaldean, and Armenian rites.\")\n    (:t 0.45 :title \"3. Breathing with Two Lungs (East & West)\" :rule \"Duo Pulmones: Saint John Paul II taught the Church breathes with both East and West.\")\n    (:t 0.70 :title \"4. Prosphora, Icons & Eastern Sacramental Rites\" :rule \"Mysterium: Leavened Eucharistic Prosphora and sacred Iconostasis reflecting heavenly liturgy.\")\n    (:t 0.88 :title \"5. Unbroken Apostolic Unity with Peter\" :rule \"Cathedra Petri: Plenary communion with the Holy See preserving Catholic diversity in unity.\")\n  ))\n\n  (:interactive (\n    (:checkpoint :t 0.35\n      :prompt \"How many autonomous (sui iuris) Churches make up the one Universal Catholic Church in full communion with the Pope?\"\n      :options (\"24 autonomous Churches across 6 Liturgical Traditions\" \"Only 1 (The Roman Church alone)\" \"6 regional dioceses\" \"Over 500 divided denominations\")\n      :answer 0\n      :explanation \"The Catholic Church is a magnificent communion of 24 autonomous Churches (1 Western Latin + 23 Eastern Catholic Churches) all united in one faith under the Pope.\")\n    (:checkpoint :t 0.75\n      :prompt \"Why do Byzantine and Eastern Catholic Churches use leavened bread (Prosphora) for the Holy Eucharist?\"\n      :options (\"Because yeast represents the Risen Life of Christ and the Holy Spirit breathing life into creation\" \"Because unleavened bread was forbidden in ancient times\" \"Because flat wafers were invented only recently\" \"Only to make the bread softer for the priest\")\n      :answer 0\n      :explanation \"Leaven symbolizes Christ rising from the dead and the Holy Spirit breathing life into the bread! Both leavened and unleavened traditions are holy, ancient, and fully valid.\")\n  ))\n\n  (:bindings (\n    (:target \"#beacon-pulse\" :attr \"opacity\" :expr \"0.3 + 0.4 * (vars.communionGlow || 1.0)\")\n    (:target \"#beacon-halo\" :attr \"r\" :expr \"26 + 18 * (vars.communionGlow || 1.0)\")\n    (:target \"#icon-gold-glow\" :attr \"opacity\" :expr \"0.4 + 0.5 * (vars.iconShimmer || 0.8)\")\n    (:target \"#panoramic-rites-strip\" :attr \"transform\" :expr \"'translate(' + (-((vars.selectedRite ? (vars.selectedRite - 1) : Math.min(5, t / 0.18)) * 800)) + ', 0)'\")\n    (:target \"#rite-selector-knob\" :attr \"transform\" :expr \"'translate(' + (vars.selectedRite ? (140 + (vars.selectedRite - 1) * 104) : (140 + Math.min(1.0, t / 0.90) * 520)) + ', 18)'\")\n    (:target \"#active-rite-title\" :attr \"textContent\" :expr \"['1. Western Latin Rite (Roman, Ambrosian, Mozarabic)', '2. Byzantine Tradition (Constantinopolitan)', '3. Alexandrian Tradition (Coptic & Ge\\\\'ez)', '4. Antiochian Tradition (West Syriac & Maronite)', '5. Chaldean Tradition (East Syriac & St. Thomas)', '6. Armenian Tradition (Holy See of Cilicia)'][(vars.selectedRite ? Math.round(vars.selectedRite) : Math.min(6, 1 + Math.floor(t / 0.16))) - 1] || '1. Western Latin Rite'\")\n    (:target \"#active-rite-desc\" :attr \"textContent\" :expr \"['1 Western Church (>1.3B) • Unleavened Host (Hostia Pura) • Statues & Gregorian Chant', '14 Eastern Catholic Churches • Sacred Icons • Leavened Prosphora • Divine Liturgy', '3 Eastern Churches: Coptic (Egypt), Ethiopian & Eritrean • Ancient Liturgy of St. Mark', '3 Eastern Churches: Maronite (Lebanon), Syriac, Syro-Malankara • West Syriac Aramaic', '2 Eastern Churches: Chaldean (Iraq) & Syro-Malabar (India, AD 52) • Addai & Mari', '1 Eastern Church: Armenian Catholic Church (Cilicia) • First Christian Nation (AD 301)'][(vars.selectedRite ? Math.round(vars.selectedRite) : Math.min(6, 1 + Math.floor(t / 0.16))) - 1] || ''\")\n    (:target \"#tick-1-pill\" :attr \"opacity\" :expr \"(vars.selectedRite ? vars.selectedRite === 1 : t < 0.18) ? 0.9 : 0.0\")\n    (:target \"#tick-2-pill\" :attr \"opacity\" :expr \"(vars.selectedRite ? vars.selectedRite === 2 : (t >= 0.18 && t < 0.36)) ? 0.9 : 0.0\")\n    (:target \"#tick-3-pill\" :attr \"opacity\" :expr \"(vars.selectedRite ? vars.selectedRite === 3 : (t >= 0.36 && t < 0.54)) ? 0.9 : 0.0\")\n    (:target \"#tick-4-pill\" :attr \"opacity\" :expr \"(vars.selectedRite ? vars.selectedRite === 4 : (t >= 0.54 && t < 0.72)) ? 0.9 : 0.0\")\n    (:target \"#tick-5-pill\" :attr \"opacity\" :expr \"(vars.selectedRite ? vars.selectedRite === 5 : (t >= 0.72 && t < 0.88)) ? 0.9 : 0.0\")\n    (:target \"#tick-6-pill\" :attr \"opacity\" :expr \"(vars.selectedRite ? vars.selectedRite === 6 : t >= 0.88) ? 0.9 : 0.0\")\n    (:target \"#tick-1-text\" :attr \"fill\" :expr \"(vars.selectedRite ? vars.selectedRite === 1 : t < 0.18) ? '#fef08a' : '#94a3b8'\")\n    (:target \"#tick-2-text\" :attr \"fill\" :expr \"(vars.selectedRite ? vars.selectedRite === 2 : (t >= 0.18 && t < 0.36)) ? '#fef08a' : '#94a3b8'\")\n    (:target \"#tick-3-text\" :attr \"fill\" :expr \"(vars.selectedRite ? vars.selectedRite === 3 : (t >= 0.36 && t < 0.54)) ? '#fef08a' : '#94a3b8'\")\n    (:target \"#tick-4-text\" :attr \"fill\" :expr \"(vars.selectedRite ? vars.selectedRite === 4 : (t >= 0.54 && t < 0.72)) ? '#fef08a' : '#94a3b8'\")\n    (:target \"#tick-5-text\" :attr \"fill\" :expr \"(vars.selectedRite ? vars.selectedRite === 5 : (t >= 0.72 && t < 0.88)) ? '#fef08a' : '#94a3b8'\")\n    (:target \"#tick-6-text\" :attr \"fill\" :expr \"(vars.selectedRite ? vars.selectedRite === 6 : t >= 0.88) ? '#fef08a' : '#94a3b8'\")\n  ))\n)\n"
    },
    welcome: {
      id: 'welcome',
      type: 'Sim',
      title: 'Welcome to AST Vector Player & Educational Simulator',
      stage: 'PORTAL SHOWCASE',
      duration: 16.0,
      svgMarkup: `<svg id="stage-svg" viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="welcome-bg-glow" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#070c18" />
      <stop offset="100%" stop-color="#02040a" />
    </radialGradient>
    <radialGradient id="welcome-orb-glow" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#7dd3fc" />
      <stop offset="40%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </radialGradient>
    <linearGradient id="welcome-cyan-gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#fbbf24" />
    </linearGradient>
  </defs>
  <rect width="800" height="480" fill="url(#welcome-bg-glow)" />
  <g opacity="0.45">
    <line x1="80" y1="80" x2="720" y2="80" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="80" y1="160" x2="720" y2="160" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="80" y1="240" x2="720" y2="240" stroke="#334155" stroke-width="1.5" />
    <line x1="80" y1="320" x2="720" y2="320" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="80" y1="400" x2="720" y2="400" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="120" y1="60" x2="120" y2="420" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="260" y1="60" x2="260" y2="420" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="400" y1="60" x2="400" y2="420" stroke="#334155" stroke-width="1.5" />
    <line x1="540" y1="60" x2="540" y2="420" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="680" y1="60" x2="680" y2="420" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />
  </g>
  <g transform="translate(400, 38)">
    <rect x="-240" y="-18" width="480" height="36" rx="18" fill="#0f172a" stroke="#38bdf8" stroke-width="1.2" stroke-opacity="0.6" />
    <circle cx="-216" cy="0" r="6" fill="#10b981" />
    <text x="-196" y="5" fill="#f8fafc" font-size="13" font-weight="800" letter-spacing="1">AST VECTOR MOTION &amp; SIMULATION APPARATUS</text>
    <rect x="156" y="-10" width="66" height="20" rx="10" fill="#38bdf8" fill-opacity="0.2" stroke="#38bdf8" stroke-width="1" />
    <text x="189" y="4" fill="#38bdf8" font-size="10" font-weight="900" text-anchor="middle">v2.6.0</text>
  </g>
  <g id="welcome-wave-container">
    <path id="welcome-sine-path" d="M 80 240 Q 240 180, 400 240 T 720 240" fill="none" stroke="url(#welcome-cyan-gold)" stroke-width="3.5" stroke-linecap="round" filter="url(#ast-glow-cyan)" />
  </g>
  <g transform="translate(400, 240)">
    <circle id="welcome-energy-node" cx="0" cy="0" r="28" fill="url(#welcome-orb-glow)" opacity="0.85" filter="url(#ast-glow-cyan)" />
    <circle cx="0" cy="0" r="14" fill="#f0f9ff" opacity="0.9" />
    <circle cx="0" cy="0" r="6" fill="#0284c7" />
  </g>
  <g id="welcome-probe-group">
    <circle id="welcome-probe" cx="120" cy="240" r="18" fill="#fbbf24" stroke="#ffffff" stroke-width="3" filter="url(#ast-glow-gold)" style="cursor: grab;" data-pedagogical="Direct In-Stage Grabbing: Drag this probe to explore coordinates" />
    <circle cx="120" cy="240" r="6" fill="#78350f" pointer-events="none" />
  </g>
  <g transform="translate(80, 360)">
    <rect x="0" y="0" width="145" height="54" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.2" />
    <text x="14" y="22" fill="#94a3b8" font-size="10" font-weight="700">COLD START</text>
    <text x="14" y="42" fill="#38bdf8" font-size="15" font-weight="900">&lt; 15 ms</text>
    <text x="76" y="42" fill="#64748b" font-size="10">/ 0% CDN</text>
  </g>
  <g transform="translate(240, 360)">
    <rect x="0" y="0" width="150" height="54" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.2" />
    <text x="14" y="22" fill="#94a3b8" font-size="10" font-weight="700">FRAME RATE</text>
    <text x="14" y="42" fill="#10b981" font-size="15" font-weight="900">60 FPS</text>
    <text x="76" y="42" fill="#64748b" font-size="10">SVG Vectors</text>
  </g>
  <g transform="translate(405, 360)">
    <rect x="0" y="0" width="155" height="54" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.2" />
    <text x="14" y="22" fill="#94a3b8" font-size="10" font-weight="700">RUNTIME ENGINE</text>
    <text x="14" y="42" fill="#c084fc" font-size="15" font-weight="900">&lt; 35 KB</text>
    <text x="76" y="42" fill="#64748b" font-size="10">Zero Deps</text>
  </g>
  <g transform="translate(575, 360)">
    <rect x="0" y="0" width="145" height="54" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1.2" />
    <text x="14" y="22" fill="#94a3b8" font-size="10" font-weight="700">EDGE AI CO-PILOT</text>
    <text x="14" y="42" fill="#f59e0b" font-size="14" font-weight="900">Gemini Nano</text>
  </g>
  <g transform="translate(80, 80)">
    <text x="0" y="0" fill="#64748b" font-size="10" font-weight="800">RESONANCE:</text>
    <text id="welcome-freq-readout" x="80" y="0" fill="#38bdf8" font-size="12" font-weight="800">2.0 Hz</text>
  </g>
  <g transform="translate(620, 80)">
    <text x="0" y="0" fill="#64748b" font-size="10" font-weight="800">AMPLITUDE:</text>
    <text id="welcome-amp-readout" x="78" y="0" fill="#fbbf24" font-size="12" font-weight="800">35 px</text>
  </g>
  <g transform="translate(80, 436)">
    <rect x="0" y="0" width="640" height="6" rx="3" fill="#1e293b" />
    <rect id="welcome-progress-fill" x="0" y="0" width="0" height="6" rx="3" fill="url(#welcome-cyan-gold)" />
  </g>
</svg>`,
      astSource: `(:scene :id "welcome" :type "Sim" :title "Welcome to AST Vector Player & Educational Simulator" :stage "PORTAL APPARATUS & SIMULATOR" :duration 16.0
  (:vars ((:var :name "harmonicFreq" :val 2.0 :min 0.5 :max 6.0 :step 0.5 :label "Harmonic Resonance") (:var :name "waveAmplitude" :val 35.0 :min 10.0 :max 80.0 :step 5.0 :label "Wave Amplitude") (:var :name "pulseSpeed" :val 1.0 :min 0.2 :max 3.0 :step 0.2 :label "Time Dilation Clock")))
  (:inputs ((:slider :var "harmonicFreq" :label "Harmonic Frequency" :min 0.5 :max 6.0 :step 0.5) (:slider :var "waveAmplitude" :label "Signal Power" :min 10.0 :max 80.0 :step 5.0) (:slider :var "pulseSpeed" :label "Timeline Warp" :min 0.2 :max 3.0 :step 0.2)))
  (:gestures ((:draggable :target "#welcome-probe" :axis "xy" :min 80 :max 720)))
  (:subtitles ((:start 0.00 :end 0.25 :en "Welcome to AST Vector Player: An autonomous, zero-bloat educational motion and direct-manipulation simulator." :es "Bienvenido al reproductor vectorial AST: Un simulador educativo autónomo y sin sobrecarga." :la "Salve ad AST Vector Player: Machina dynamica et vectorialis ad doctrinam veram.") (:start 0.25 :end 0.55 :en "Flash-Caliber Vector Simulation: Running at 60 FPS in pure SVG DOM with zero external runtime dependencies and sub-15ms cold start." :es "Simulación vectorial calibre Flash: 60 FPS en SVG puro con cero dependencias externas y arranque sub-15ms." :la "Simulatio Vectorialis: Motus continuus ad sexaginta quadros per secundum sine oneribus externis.") (:start 0.55 :end 0.80 :en "Direct In-Stage Grabbing & Smartboard Stylus: Grab and drag interactive physics nodes or draw with Promethean and SMART pens." :es "Manipulación directa en pantalla y pizarra digital: Arrastra nodos físicos o escribe con lápiz óptico." :la "Tactus Directus et Calamus: Trahe elementa viva vel scribe cum calamo digitali super tabulam.") (:start 0.80 :end 1.00 :en "On-Device Gemini Nano AI & W3C WebMCP: Formative assessment and S-Expression logic running purely in the browser with zero cloud leakage." :es "Inteligencia artificial en el dispositivo Gemini Nano: Evaluación formativa y lógica pura sin salida a la nube." :la "Intelligentia Localis: Disciplina et responsa fidelia in machina tua conservata.")))
  (:keyframes ((:t 0.00 :title "1. Autonomous Vector Engine" :rule "Zero Bloat • Native SVG DOM vector apparatus with sub-15ms cold start.") (:t 0.25 :title "2. Harmonic Frequency & Oscillations" :rule "Kinematic Resonance • 60 FPS procedural waveforms with zero video streaming.") (:t 0.55 :title "3. Direct Manipulation & Classroom Stylus" :rule "Interactive Invariants • Drag in-stage nodes or annotate directly with digital ink.") (:t 0.80 :title "4. On-Device Edge Intelligence" :rule "Zero Cloud Leakage • Local Chrome Prompt API / Gemini Nano formative tutoring.")))
  (:interactive ((:checkpoint :t 0.60 :prompt "What architectural feature enables AST Vector Player to boot 70× faster than legacy PhET simulations and video players?" :options ("Declarative Lisp S-Expressions & .astb Bytecode with Zero-Asset Web Audio" "External Cloud Video CDNs" "Gigabyte WebGL textures" "Heavy server-side rendering") :answer 0 :explanation "AST cartridges use micro-payload declarative S-Expressions and compiled binary bytecode (< 15 KB) with procedural Web Audio synthesis, executing in < 0.2 ms with zero cloud dependencies.")))
  (:bindings ((:target "#welcome-probe" :attr "cx" :expr "120 + t * 560") (:target "#welcome-probe" :attr "cy" :expr "240 + Math.sin(t * Math.PI * (vars.harmonicFreq || 2.0) * 2) * (vars.waveAmplitude || 35.0)") (:target "#welcome-energy-node" :attr "r" :expr "24 + Math.sin(t * Math.PI * 8) * 8") (:target "#welcome-energy-node" :attr "opacity" :expr "0.75 + Math.sin(t * 10) * 0.2") (:target "#welcome-sine-path" :attr "d" :expr "'M 80 ' + (240 + Math.sin(t * 4) * 15) + ' Q 240 ' + (240 - (vars.waveAmplitude || 35.0) * 2) + ', 400 240 T 720 ' + (240 + Math.sin(t * 4 + 2) * 15)") (:target "#welcome-freq-readout" :attr "textContent" :expr "(vars.harmonicFreq || 2.0).toFixed(1) + ' Hz'") (:target "#welcome-amp-readout" :attr "textContent" :expr "(vars.waveAmplitude || 35.0).toFixed(0) + ' px'") (:target "#welcome-progress-fill" :attr "width" :expr "t * 640")))
)`
    },
    pythagoras: {
      id: 'pythagoras',
      title: "Pythagoras' Theorem (a² + b² = c²)",
      stage: 'KS3 GEOMETRY',
      duration: 11.0,
      svgMarkup: `<svg viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Blueprint Vignette -->
    <radialGradient id="pyth-bg-glow" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="60%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>

    <!-- Blueprint Grid Pattern (28px unit grid matching simulation scale) -->
    <pattern id="pyth-blueprint-grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#1e293b" stroke-width="0.75" stroke-opacity="0.6" />
      <circle cx="28" cy="28" r="1" fill="#334155" fill-opacity="0.8" />
    </pattern>

    <!-- Precision Drop Shadows and Neon Halos -->
    <filter id="pyth-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="pyth-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.65" />
    </filter>

    <!-- Color Gradients -->
    <!-- Leg a: Emerald -->
    <linearGradient id="pyth-grad-a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34d399" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#059669" stop-opacity="0.75" />
    </linearGradient>

    <!-- Leg b: Sapphire -->
    <linearGradient id="pyth-grad-b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.75" />
    </linearGradient>

    <!-- Hypotenuse c: Amber / Gold -->
    <linearGradient id="pyth-grad-c" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#d97706" stop-opacity="0.75" />
    </linearGradient>

    <!-- HUD Glass Gradient -->
    <linearGradient id="pyth-hud-glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#1e293b" stop-opacity="0.90" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95" />
    </linearGradient>
  </defs>

  <!-- Stage Background & Engineering Grid -->
  <rect width="800" height="480" fill="url(#pyth-bg-glow)" />
  <rect width="800" height="480" fill="url(#pyth-blueprint-grid)" />

  <!-- Technical Axis Origin Guides -->
  <g opacity="0.35">
    <line x1="40" y1="280" x2="760" y2="280" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3 3" />
    <line x1="360" y1="40" x2="360" y2="440" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3 3" />
  </g>

  <!-- Interactive Precision Formula Header HUD -->
  <g id="pyth-hud-banner" transform="translate(130, 16)">
    <rect width="540" height="52" rx="14" fill="url(#pyth-hud-glass)" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.8" filter="url(#pyth-shadow)" />
    <!-- Subtle Top Rim Highlight -->
    <path d="M 14 1 L 526 1" stroke="#ffffff" stroke-width="1" stroke-opacity="0.25" />
    
    <text x="270" y="33" fill="#f8fafc" font-size="16" font-weight="900" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" text-rendering="geometricPrecision">
      <tspan fill="#34d399">a² (9)</tspan> + <tspan fill="#60a5fa">b² (16)</tspan> = <tspan fill="#fbbf24">c² (25)</tspan> ➔ 3² + 4² = 5²
    </text>
  </g>

  <!-- Square a² (Emerald Leg A) -->
  <g id="pyth-group-a">
    <rect id="pyth-rect-a" x="276" y="196" width="84" height="84" rx="6" fill="url(#pyth-grad-a)" stroke="#10b981" stroke-width="2.5" filter="url(#pyth-shadow)" data-draggable="pyth-handle-a" style="cursor:ns-resize;" />
    <!-- Pre-rendered 3x3 Unit Tiles for immediate cold-start pedagogical proof -->
    <g id="pyth-grid-a" opacity="0.5" stroke="#ffffff" stroke-width="1" pointer-events="none">
      <line x1="304" y1="196" x2="304" y2="280" />
      <line x1="332" y1="196" x2="332" y2="280" />
      <line x1="276" y1="224" x2="360" y2="224" />
      <line x1="276" y1="252" x2="360" y2="252" />
    </g>
    <!-- Square Area Badge -->
    <rect id="pyth-badge-a" x="286" y="226" width="64" height="26" rx="6" fill="#064e3b" fill-opacity="0.9" stroke="#34d399" stroke-width="1.5" pointer-events="none" />
    <text id="pyth-txt-a" x="318" y="244" fill="#ffffff" font-size="14" font-weight="900" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" text-rendering="geometricPrecision" pointer-events="none">a² = 9</text>
  </g>

  <!-- Square b² (Sapphire Leg B) -->
  <g id="pyth-group-b">
    <rect id="pyth-rect-b" x="360" y="280" width="112" height="112" rx="6" fill="url(#pyth-grad-b)" stroke="#3b82f6" stroke-width="2.5" filter="url(#pyth-shadow)" data-draggable="pyth-handle-b" style="cursor:ew-resize;" />
    <!-- Pre-rendered 4x4 Unit Tiles for immediate cold-start pedagogical proof -->
    <g id="pyth-grid-b" opacity="0.5" stroke="#ffffff" stroke-width="1" pointer-events="none">
      <line x1="388" y1="280" x2="388" y2="392" />
      <line x1="416" y1="280" x2="416" y2="392" />
      <line x1="444" y1="280" x2="444" y2="392" />
      <line x1="360" y1="308" x2="472" y2="308" />
      <line x1="360" y1="336" x2="472" y2="336" />
      <line x1="360" y1="364" x2="472" y2="364" />
    </g>
    <!-- Square Area Badge -->
    <rect id="pyth-badge-b" x="382" y="323" width="68" height="26" rx="6" fill="#1e3a8a" fill-opacity="0.9" stroke="#60a5fa" stroke-width="1.5" pointer-events="none" />
    <text id="pyth-txt-b" x="416" y="341" fill="#ffffff" font-size="14" font-weight="900" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" text-rendering="geometricPrecision" pointer-events="none">b² = 16</text>
  </g>

  <!-- Square c² (Amber Hypotenuse C) -->
  <g id="pyth-group-c" transform="translate(360, 196) rotate(36.87)">
    <g id="pyth-rot-c">
      <rect id="pyth-rect-c" x="0" y="-140" width="140" height="140" rx="6" fill="url(#pyth-grad-c)" stroke="#f59e0b" stroke-width="2.5" filter="url(#pyth-shadow)" />
      <!-- Pre-rendered 5x5 Unit Tiles for immediate cold-start pedagogical proof -->
      <g id="pyth-grid-c" opacity="0.5" stroke="#ffffff" stroke-width="1" pointer-events="none">
        <line x1="28" y1="-140" x2="28" y2="0" />
        <line x1="56" y1="-140" x2="56" y2="0" />
        <line x1="84" y1="-140" x2="84" y2="0" />
        <line x1="112" y1="-140" x2="112" y2="0" />
        <line x1="0" y1="-112" x2="140" y2="-112" />
        <line x1="0" y1="-84" x2="140" y2="-84" />
        <line x1="0" y1="-56" x2="140" y2="-56" />
        <line x1="0" y1="-28" x2="140" y2="-28" />
      </g>
      <!-- Square Area Badge -->
      <rect id="pyth-badge-c" x="15" y="-83" width="110" height="28" rx="6" fill="#78350f" fill-opacity="0.9" stroke="#fbbf24" stroke-width="1.5" pointer-events="none" />
      <text id="pyth-txt-c" x="70" y="-64" fill="#ffffff" font-size="14" font-weight="900" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" text-rendering="geometricPrecision" pointer-events="none">c² = 25 (c = 5)</text>
    </g>
  </g>

  <!-- Central Euclidean Right Triangle -->
  <polygon id="pyth-triangle" points="360,280 472,280 360,196" fill="#0e7490" fill-opacity="0.25" stroke="#38bdf8" stroke-width="3.5" stroke-linejoin="round" filter="url(#pyth-glow)" />

  <!-- Precision Drafting Right-Angle Symbol -->
  <g id="pyth-right-angle-group">
    <rect id="pyth-right-angle" x="360" y="262" width="18" height="18" fill="none" stroke="#94a3b8" stroke-width="2" />
    <circle cx="369" cy="271" r="2" fill="#38bdf8" />
  </g>

  <!-- Side Dimension Badges -->
  <g id="pyth-labels-group" pointer-events="none" font-family="system-ui, -apple-system, sans-serif">
    <!-- Leg a Label -->
    <rect x="365" y="226" width="46" height="22" rx="4" fill="#0f172a" fill-opacity="0.8" stroke="#10b981" stroke-width="1" />
    <text id="pyth-label-a" x="388" y="242" fill="#34d399" font-size="12" font-weight="900" text-anchor="middle">a = 3</text>

    <!-- Leg b Label -->
    <rect x="400" y="252" width="46" height="22" rx="4" fill="#0f172a" fill-opacity="0.8" stroke="#3b82f6" stroke-width="1" />
    <text id="pyth-label-b" x="423" y="268" fill="#60a5fa" font-size="12" font-weight="900" text-anchor="middle">b = 4</text>

    <!-- Hypotenuse c Label -->
    <rect x="425" y="218" width="56" height="22" rx="4" fill="#0f172a" fill-opacity="0.8" stroke="#f59e0b" stroke-width="1" />
    <text id="pyth-label-c" x="453" y="234" fill="#fbbf24" font-size="12" font-weight="900" text-anchor="middle">c = 5.00</text>
  </g>

  <!-- Manipulator Handle A (Top Vertex / Leg a Controller) -->
  <g id="pyth-handle-a" transform="translate(360, 196)" data-draggable="pyth-handle-a" style="cursor:ns-resize;">
    <!-- Pulse Ring -->
    <circle cx="0" cy="0" r="22" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="1" stroke-dasharray="3 3" />
    <!-- Tactile Handle Bead -->
    <circle cx="0" cy="0" r="15" fill="#10b981" stroke="#ffffff" stroke-width="2.5" filter="url(#pyth-glow)" />
    <!-- Vertical Drag Icon & Label -->
    <text x="0" y="5" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle" pointer-events="none">↕</text>
  </g>

  <!-- Manipulator Handle B (Right Vertex / Leg b Controller) -->
  <g id="pyth-handle-b" transform="translate(472, 280)" data-draggable="pyth-handle-b" style="cursor:ew-resize;">
    <!-- Pulse Ring -->
    <circle cx="0" cy="0" r="22" fill="#3b82f6" fill-opacity="0.2" stroke="#3b82f6" stroke-width="1" stroke-dasharray="3 3" />
    <!-- Tactile Handle Bead -->
    <circle cx="0" cy="0" r="15" fill="#3b82f6" stroke="#ffffff" stroke-width="2.5" filter="url(#pyth-glow)" />
    <!-- Horizontal Drag Icon & Label -->
    <text x="0" y="5" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle" pointer-events="none">↔</text>
  </g>
</svg>`,
      astSource: `(:scene :id "pythagoras" :type "Sim" :title "Pythagoras' Theorem (a² + b² = c²)" :stage "KS3 GEOMETRY" :duration 11.0
  (:vars (
    (:var :name "sideA" :val 3 :min 1 :max 15 :step 1 :unit "units" :label "Leg a")
    (:var :name "sideB" :val 4 :min 1 :max 15 :step 1 :unit "units" :label "Leg b")
  ))
  (:inputs (
    (:number :var "sideA" :label "Triangle Leg a" :min 1 :max 15 :step 1)
    (:number :var "sideB" :label "Triangle Leg b" :min 1 :max 15 :step 1)
  ))
  (:computed (
    (:name "hypotenuse" :expr "Math.sqrt(vars.sideA * vars.sideA + vars.sideB * vars.sideB).toFixed(2)")
    (:name "areaA" :expr "vars.sideA * vars.sideA")
    (:name "areaB" :expr "vars.sideB * vars.sideB")
    (:name "areaC" :expr "vars.sideA * vars.sideA + vars.sideB * vars.sideB")
  ))
  (:gestures (
    (:draggable :target "#pyth-handle-a" :axis "y" :min 100 :max 350)
    (:draggable :target "#pyth-handle-b" :axis "x" :min 360 :max 680)
    (:draggable :target "#pyth-rect-a" :axis "y" :min 100 :max 350)
    (:draggable :target "#pyth-rect-b" :axis "x" :min 360 :max 680)
  ))
  (:subtitles (
    (:start 0.00 :end 0.35 :en "Drag the handles or select Pythagorean triples to test right triangles." :es "Arrastra los controles o selecciona ternas pitagóricas para probar triángulos rectángulos.")
    (:start 0.35 :end 0.70 :en "Observe area conservation: square a² (emerald) plus square b² (sapphire) always equals square c² (amber)." :es "Observa la conservación de área: el cuadrado a² más el cuadrado b² siempre es igual a c².")
    (:start 0.70 :end 1.00 :en "a² + b² = c². The total number of unit square tiles is strictly conserved for all right triangles." :es "a² + b² = c². El número total de baldosas unitarias se conserva estrictamente.")
  ))
  (:keyframes (
    (:t 0.00 :title "Interactive Manipulative" :rule "Drag handles or enter custom figures to test Pythagorean triples")
    (:t 0.35 :title "Area Conservation" :rule "Square of side a has area a²; square of side b has area b²")
    (:t 0.70 :title "Vector Area Sum" :rule "Total square units: a² + b² = c²")
    (:t 1.00 :title "Hypotenuse Square c²" :rule "c = √(a² + b²) preserved across continuous geometry")
  ))
  (:interactive false)
  (:questions false)
  (:bindings (
    (:target "#pyth-txt-a" :attr "text" :expr "'a² = ' + (vars.sideA * vars.sideA)")
    (:target "#pyth-txt-b" :attr "text" :expr "'b² = ' + (vars.sideB * vars.sideB)")
    (:target "#pyth-txt-c" :attr "text" :expr "'c² = ' + (vars.sideA * vars.sideA + vars.sideB * vars.sideB)")
    (:target "#pyth-label-a" :attr "text" :expr "'a = ' + vars.sideA")
    (:target "#pyth-label-b" :attr "text" :expr "'b = ' + vars.sideB")
    (:target "#pyth-label-c" :attr "text" :expr "'c = ' + Math.sqrt(vars.sideA * vars.sideA + vars.sideB * vars.sideB).toFixed(2)")
  ))
)`
    }
  };

  const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

  const SceneRegistry = {
    isUnsafeKey(key) {
      return typeof key === 'string' && UNSAFE_KEYS.has(key);
    },

    register(id, scene) {
      if (!id) return;
      const norm = this.normalizeId(id);
      if (!norm || this.isUnsafeKey(norm) || this.isUnsafeKey(id)) return null;
      scenes[norm] = Object.assign({ id: norm }, scene);
      if (norm !== id) scenes[id] = scenes[norm];
      return scenes[norm];
    },

    get(id) {
      if (!id || this.isUnsafeKey(id)) return null;
      const norm = this.normalizeId(id);
      if (!norm || this.isUnsafeKey(norm)) return null;
      
      // If found in catalog but missing embedded markup, check fallback
      if (scenes[norm] && !scenes[norm].svgMarkup && !scenes[norm].svgText && EMBEDDED_FALLBACKS[norm]) {
        Object.assign(scenes[norm], EMBEDDED_FALLBACKS[norm]);
      }
      if (scenes[norm] && (scenes[norm].svgMarkup || scenes[norm].svgText)) return scenes[norm];
      if (!this.isUnsafeKey(id) && scenes[id] && (scenes[id].svgMarkup || scenes[id].svgText)) return scenes[id];

      // Check decentralized localStorage for custom or imported PhET cartridges
      if (typeof localStorage !== 'undefined') {
        try {
          const raw = localStorage.getItem('stj_custom_cartridges_v1');
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const found = list.find(c => c && (c.id === norm || c.id === id));
              if (found) {
                return this.register(found.id, {
                  id: found.id,
                  title: found.title || found.id,
                  stage: found.stage || 'CUSTOM CARTRIDGE',
                  duration: found.duration || 12.0,
                  svgMarkup: found.svgMarkup || found.svgText,
                  svgText: found.svgMarkup || found.svgText,
                  astSource: found.astSource || found.astText,
                  astText: found.astSource || found.astText,
                });
              }
            }
          }
        } catch (_) {}
      }

      // Check embedded fallbacks (e.g. pythagoras on GitHub Pages)
      if (EMBEDDED_FALLBACKS[norm]) {
        return this.register(norm, EMBEDDED_FALLBACKS[norm]);
      }

      return null;
    },

    getScene(id) {
      return this.get(id);
    },

    has(id) {
      if (!id || this.isUnsafeKey(id)) return false;
      const norm = this.normalizeId(id);
      if (!norm || this.isUnsafeKey(norm)) return false;
      return Boolean(scenes[norm] || (!this.isUnsafeKey(id) && scenes[id]) || EMBEDDED_FALLBACKS[norm]);
    },

    list() {
      const seen = new Set();
      const result = [];
      Object.keys(scenes).forEach(k => {
        const s = scenes[k];
        if (s && s.id && !seen.has(s.id)) {
          seen.add(s.id);
          result.push({
            id: s.id,
            title: s.title || s.id,
            stage: s.stage || 'CURRICULUM',
            duration: s.duration || 14.0,
            has3D: Boolean(s.has3D),
            svgFile: s.svgFile || `scenes/${s.id}.svg`,
            astFile: s.astFile || `scenes/${s.id}.ast`,
            keyframeCount: s.keyframeCount || (s.keyframes ? s.keyframes.length : 0),
            subtitleCount: s.subtitleCount || (s.subtitles ? s.subtitles.length : 0)
          });
        }
      });
      return result;
    },

    normalizeId(id) {
      if (!id || typeof id !== 'string') return '';
      const clean = id.toLowerCase().trim()
        .replace(/^(demo-|scene-|preset-)/, '')
        .replace(/\.(ast|svg|json)$/, '');
      if (this.isUnsafeKey(clean)) return '';
      const aliases = {
        'pythagorus': 'pythagoras',
        'pythagoras-theorem': 'pythagoras',
        'pythagoras-proof': 'pythagoras',
        'ohms-law': 'electric-circuits',
        'phet-ohms-law': 'electric-circuits',
        'circuits': 'electric-circuits',
        'circuit': 'electric-circuits',
        'gas': 'kinetic-gas',
        'boyles-law': 'kinetic-gas',
        'curves': 'calculus-curves',
        'calculus': 'calculus-curves',
        'aquarium': 'fish-tank',
        'fish': 'fish-tank',
        'fishing': 'math-fishing',
        'mountain': 'mountain-elevation',
        'climber': 'mountain-elevation',
        'photosynth': 'photosynthesis',
        'leaf': 'photosynthesis',
        'stars': 'solar-system',
        'space': 'solar-system',
        'atom': 'atom',
        'atomic-structure': 'atom',
        'bohr': 'atom',
        'spelling': 'spelling-bee',
        'spelling-bee': 'spelling-bee',
        'bee': 'spelling-bee',
        // Oak National Curriculum RE Codes & Unit Slugs
        'oak-ks2-re-001': 'church-tour',
        'ks2-re-catholic-sacred-architecture': 'church-tour',
        'oak-ks2-re-002': 'altar-anatomy',
        'ks2-re-catholic-altar-mensa-relics': 'altar-anatomy',
        'oak-ks2-re-003': 'holy-oils',
        'ks2-re-catholic-holy-oils-ambry': 'holy-oils',
        'oak-ks2-re-004': 'holy-water-thurifer',
        'ks2-re-catholic-asperges-incensations': 'holy-water-thurifer',
        'oak-ks2-re-005': 'first-communion',
        'ks2-re-catholic-first-holy-communion': 'first-communion',
        'oak-ks2-re-006': 'triduum-easter',
        'ks2-re-catholic-paschal-triduum': 'triduum-easter',
        'oak-ks2-re-008': 'seven-sacraments',
        'ks2-re-catholic-seven-sacraments': 'seven-sacraments',
        'oak-ks2-re-009': 'liturgical-calendar',
        'ks2-re-catholic-liturgical-seasons': 'liturgical-calendar',
        'oak-ks2-re-010': 'liturgical-postures',
        'ks2-re-catholic-liturgical-postures-prayer': 'liturgical-postures',
        'oak-ks2-re-015': 'ten-commandments',
        'ks2-re-catholic-decalogue-moral-law': 'ten-commandments',
        'oak-ks2-re-016': 'order-of-the-mass',
        'ks2-re-catholic-order-of-mass': 'order-of-the-mass',
        'oak-ks2-re-017': 'sacred-objects',
        'ks2-re-catholic-sacred-vessels-vestments': 'sacred-objects',
        'oak-ks2-re-018': 'eucharistic-procession-film',
        'ks2-re-catholic-eucharistic-procession': 'eucharistic-procession-film',
        'oak-ks2-re-019': 'rosary-mysteries',
        'ks2-re-catholic-rosary-twenty-mysteries': 'rosary-mysteries',
        'oak-ks2-re-020': 'stations-of-the-cross',
        'ks2-re-catholic-via-crucis-stations': 'stations-of-the-cross',
        'oak-ks3-re-007': 'liturgy-of-the-hours',
        'ks3-re-catholic-divine-office-psalms': 'liturgy-of-the-hours',
        'oak-ks3-re-011': 'catholic-rites',
        'ks3-re-catholic-sacramental-rites': 'catholic-rites',
        'oak-ks3-re-012': 'cst-virtues',
        'ks3-re-catholic-social-teaching-virtues': 'cst-virtues',
        'oak-ks3-re-013': 'latin-mass-prayers',
        'ks3-re-catholic-traditional-latin-prayers': 'latin-mass-prayers',
        'oak-ks3-re-014': 'nicene-creed',
        'ks3-re-catholic-creed-profession-faith': 'nicene-creed'
      };
      if (aliases[clean]) return aliases[clean];

      // Resolve by Oak Curriculum ID or Unit name (e.g. OAK-KS4-MAT-002 -> calculus-curves)
      for (const k in scenes) {
        const sc = scenes[k];
        if (sc) {
          if (sc.oakId && sc.oakId.toLowerCase() === clean) return sc.id;
          if (sc.oakUnit && sc.oakUnit.toLowerCase() === clean) return sc.id;
        }
      }

      return clean;
    },

    parseAstMetadata(content, id) {
      if (!content || typeof content !== 'string') return null;
      const typeMatch = content.match(/:type\s+("Sim"|"Slide"|"App"|"[^"]+"|[^\s\)]+)/i);
      let type = 'Sim';
      if (typeMatch) {
        const norm = typeMatch[1].replace(/^"|"$/g, '').toLowerCase();
        if (norm === 'slide') type = 'Slide';
        else if (norm === 'app') type = 'App';
        else type = 'Sim';
      } else {
        const hasSubtitles = /:subtitles\s*\(/i.test(content);
        const hasGestures = /:gestures\s*\(/i.test(content) || /:draggable\s+/i.test(content);
        const hasCheckpoints = /:interactive\s*\(/i.test(content) || /:checkpoint\s+/i.test(content);
        const hasPhysics = /:physics\s*\(/i.test(content) || /:emitter\s+/i.test(content);
        if (hasSubtitles && !hasGestures && !hasPhysics) {
          type = 'Slide';
        } else if (hasGestures || hasPhysics || hasCheckpoints) {
          type = 'Sim';
        } else {
          type = 'App';
        }
      }
      const titleMatch = content.match(/:title\s+"([^"]+)"/i);
      const stageMatch = content.match(/:stage\s+"([^"]+)"/i);
      const durationMatch = content.match(/:duration\s+([\d\.]+)/i);
      const keyframeCount = (content.match(/\(:t\s+[\d\.]+/gi) || []).length;
      const subtitleCount = (content.match(/\(:start\s+[\d\.]+/gi) || []).length;
      const has3D = content.includes(':3d-') || content.includes(':camera');

      return {
        id: id || 'custom-scene',
        type,
        title: titleMatch ? titleMatch[1] : (id || 'Custom Scene'),
        stage: stageMatch ? stageMatch[1] : 'CURRICULUM',
        duration: durationMatch ? parseFloat(durationMatch[1]) : 14.0,
        has3D: Boolean(has3D),
        keyframeCount,
        subtitleCount,
        svgFile: `scenes/${id}.svg`,
        astFile: `scenes/${id}.ast`
      };
    },

    registerFromAstText(id, content) {
      const meta = this.parseAstMetadata(content, id);
      if (meta) {
        return this.register(id, meta);
      }
      return null;
    },

    /**
     * Auto-Finds available scenes dynamically without requiring teachers to edit index files:
     * 1. Probes live dynamic API (/api/scenes or /player/api/scenes)
     * 2. Scrapes HTML directory index (e.g. static server directory listing)
     * 3. Falls back to pre-compiled manifest
     */
    async autoDiscover(basePath = './') {
      if (this._hasDiscovered) {
        return { totalScenes: Object.keys(scenes).length, scenes: SceneRegistry.list() };
      }
      this._hasDiscovered = true;
      const currentDir = (typeof window !== 'undefined' && window.location && window.location.pathname)
        ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)
        : './';
      const base = (basePath || currentDir || './').replace(/\/?$/, '/');

      // 1. Try Live Dynamic Discovery Endpoints (Vite / Dev / API Server)
      const dynamicUrls = ['/api/scenes', '/player/api/scenes', `${base}api/scenes`];
      for (const endpoint of dynamicUrls) {
        try {
          const res = await fetch(endpoint).catch(() => null);
          if (res && res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.scenes) && data.scenes.length > 0) {
              data.scenes.forEach(sc => {
                if (sc && sc.id) SceneRegistry.register(sc.id, sc);
              });
              return data;
            }
          }
        } catch (_) {}
      }

      // 2. Try HTML directory index probe on scenes/ (Nginx autoindex, Python http.server, Apache)
      try {
        const scenesIndexRes = await fetch(`${base}scenes/`).catch(() => null);
        if (scenesIndexRes && scenesIndexRes.ok) {
          const html = await scenesIndexRes.text();
          const hrefRegex = /href=["']([^"']+\.ast)["']/gi;
          let match;
          let discovered = 0;
          while ((match = hrefRegex.exec(html)) !== null) {
            const rawFile = match[1].split('/').pop();
            const id = rawFile.replace('.ast', '');
            if (id && !SceneRegistry.has(id)) {
              SceneRegistry.register(id, {
                id,
                title: id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                stage: 'CURRICULUM',
                duration: 14.0,
                svgFile: `scenes/${id}.svg`,
                astFile: `scenes/${id}.ast`
              });
              discovered++;
            }
          }
          if (discovered > 0) {
            return { totalScenes: Object.keys(scenes).length, scenes: SceneRegistry.list() };
          }
        }
      } catch (_) {}

      // 3. Fallback: Load static configuration manifest with resilient fallback cascade
      const candidateUrls = [
        './scenes.manifest.json',
        './scenes-config.json',
        `${currentDir}scenes.manifest.json`,
        `${currentDir}scenes-config.json`,
        `${base}player/scenes.manifest.json`,
        `${base}player/scenes-config.json`,
        `${base}scenes.manifest.json`,
        `${base}scenes-config.json`,
        '/player/scenes.manifest.json',
        '/player/scenes-config.json',
        '/scenes.manifest.json',
        '/scenes-config.json'
      ];

      for (const url of candidateUrls) {
        const manifestRes = await this.loadConfig(url);
        if (manifestRes) return manifestRes;
      }

      return { totalScenes: Object.keys(scenes).length, scenes: SceneRegistry.list() };
    },

    async loadConfig(url = './scenes.manifest.json') {
      try {
        const res = await fetch(url).catch(() => null);
        if (!res || !res.ok) return null;

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/html')) return null;

        const text = await res.text();
        const trimmed = (text || '').trim();
        if (!trimmed || trimmed.startsWith('<') || trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
          return null; // Reject SPA HTML fallbacks
        }

        const config = JSON.parse(trimmed);
        if (config && Array.isArray(config.scenes) && config.scenes.length > 0) {
          config.scenes.forEach(sc => {
            if (sc && sc.id) {
              SceneRegistry.register(sc.id, sc);
            }
          });
          return config;
        }
        return null;
      } catch (err) {
        return null;
      }
    }
  };

  global.ASTScenes = scenes;
  global.ASTSceneRegistry = SceneRegistry;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { scenes, SceneRegistry };
  }
})(typeof window !== 'undefined' ? window : globalThis);
