// src/data/catholic/triduumEasterData.ts
// St Joseph's Catholic Life & Faith Sanctuary
// The Sacred Paschal Triduum & The Glory of Easter (Sacrum Triduum Paschale)
// Complete Catechetical, Liturgical & Scriptural Guide: From the Upper Room to the Empty Tomb & Pentecost

export interface TriduumCeremony {
  title: string;
  latinTitle?: string;
  description: string;
  theologicalMeaning: string;
  symbolIcon: string;
}

export interface TriduumMovement {
  id: 'holy-thursday' | 'good-friday' | 'holy-saturday' | 'easter-vigil' | 'easter-sunday-50days';
  order: number;
  dayTitle: string;
  latinTitle: string;
  subtitle: string;
  timeContext: string;
  liturgicalColor: string;
  colorHex: string;
  bgGradient: string;
  badgeText: string;
  scriptureReference: string;
  scriptureText: string;
  scriptureLatin: string;
  sacredVersicle: {
    prompt: string;
    response: string;
    latinPrompt: string;
    latinResponse: string;
  };
  theologicalSummary: string;
  ceremonies: TriduumCeremony[];
  liturgicalActionGuidance: string;
  curriculumKeyStageAlignment: string;
  recdConcept: string;
}

export interface LumenChristiStep {
  stepNumber: number;
  title: string;
  latinTitle: string;
  location: string;
  ritualAction: string;
  wordsSpoken: string;
  wordsLatin: string;
  wordsResponse: string;
  wordsResponseLatin: string;
  theologicalMeaning: string;
  pedagogicalNote: string;
  elevationPitchNote?: 'F4 / G4 / A4 (Low)' | 'G4 / A4 / B4 (Mid)' | 'A4 / B4 / C#5 (Triumphant High)';
}

export const LUMEN_CHRISTI_CEREMONY_STEPS: LumenChristiStep[] = [
  {
    stepNumber: 1,
    title: 'The Blessing of the New Fire (Lucernarium)',
    latinTitle: 'Benedictio Novi Ignis',
    location: 'Outside the church doors in pitch darkness',
    ritualAction: 'A blazing fire is prepared in a brazier outside. The priest and ministers gather with the people in total darkness. The priest blesses the fresh flame, which dispels the gloom of night.',
    wordsSpoken: 'O God, who through your Son bestowed upon the faithful the fire of your glory, sanctify this new fire, we pray.',
    wordsLatin: 'Deus, qui per Filium tuum ignem claritatis tuae fidelibus contulisti, hunc novum ignem sanctifica.',
    wordsResponse: 'Amen.',
    wordsResponseLatin: 'Amen.',
    theologicalMeaning: 'Christ is the Light of the World rising out of the cold shadow of the tomb. Fire purifies, warms, and consumes darkness.',
    pedagogicalNote: 'Notice that fire is struck from flint—a fresh, living fire rather than a stale light carried over from earlier.',
  },
  {
    stepNumber: 2,
    title: 'The Preparation & Inscription of the Paschal Candle',
    latinTitle: 'Praeparatio Cerei Paschalis',
    location: 'Beside the New Fire before entering the sanctuary',
    ritualAction: 'With a stylus, the priest traces the Cross, the Greek letters Alpha (Α) and Omega (Ω), and the four numerals of the current year into the virgin beeswax candle. He then inserts five grains of incense enclosed in wax nails.',
    wordsSpoken: 'Christ yesterday and today, the Beginning and the End, Alpha and Omega. All time belongs to him, and all the ages. To him be glory and power through every age and for ever.',
    wordsLatin: 'Christus heri et hodie, Principium et Finis, Alpha et Omega. Ipsius sunt tempora et saecula. Ipsi gloria et imperium per universa aeternitatis saecula.',
    wordsResponse: 'Amen. By his holy and glorious wounds may Christ the Lord guard us and protect us.',
    wordsResponseLatin: 'Per sua sancta et gloriosa vulnera custodiat et conservet nos Christus Dominus. Amen.',
    theologicalMeaning: 'The candle is a figure of the pillar of fire that led Israel out of Egypt and an image of Christ’s risen body bearing the five glorious wounds.',
    pedagogicalNote: 'The current year inscribed on the wax teaches that Christ’s redemption is not ancient history—it redeems this very day, month, and year.',
  },
  {
    stepNumber: 3,
    title: 'First Elevation: At the Church Threshold',
    latinTitle: 'Prima Elevatio ad Portam',
    location: 'At the entrance doors of the dark church',
    ritualAction: 'The deacon holds aloft the ignited Paschal Candle in the doorway. He pauses and sings for the first time.',
    wordsSpoken: 'The Light of Christ!',
    wordsLatin: 'Lumen Christi!',
    wordsResponse: 'Thanks be to God!',
    wordsResponseLatin: 'Deo gratias!',
    theologicalMeaning: 'The initial spark of resurrection entering the darkened universe. The priest lights his individual taper from the Paschal Candle.',
    pedagogicalNote: 'The chant begins at a low, solemn pitch. Only the priest lights his candle here, showing that light originates from Christ alone.',
    elevationPitchNote: 'F4 / G4 / A4 (Low)',
  },
  {
    stepNumber: 4,
    title: 'Second Elevation: In the Middle of the Nave',
    latinTitle: 'Secunda Elevatio in Medio Ecclesiae',
    location: 'Halfway down the main aisle (Nave) among the congregation',
    ritualAction: 'The deacon advances to the center of the nave, lifts the candle higher, and sings a second time at a higher musical pitch.',
    wordsSpoken: 'The Light of Christ!',
    wordsLatin: 'Lumen Christi!',
    wordsResponse: 'Thanks be to God!',
    wordsResponseLatin: 'Deo gratias!',
    theologicalMeaning: 'The flame is shared hand to person across the pews. In moments, hundreds of individual tapers are burning, transforming the dark stone church into a sea of living light.',
    pedagogicalNote: 'A single candle can light thousands of other candles without losing any of its own flame—a brilliant visual parable of grace and baptism.',
    elevationPitchNote: 'G4 / A4 / B4 (Mid)',
  },
  {
    stepNumber: 5,
    title: 'Third Elevation: Before the High Altar',
    latinTitle: 'Tertia Elevatio Ante Altare',
    location: 'At the foot of the Sanctuary facing the assembly',
    ritualAction: 'The deacon stands before the high altar, lifts the Paschal Candle to its highest zenith, and sings the third proclamation at the highest pitch. All church lights and altar candles blaze forth!',
    wordsSpoken: 'The Light of Christ!',
    wordsLatin: 'Lumen Christi!',
    wordsResponse: 'Thanks be to God!',
    wordsResponseLatin: 'Deo gratias!',
    theologicalMeaning: 'The triumph of Christ is complete. The darkness cannot overcome the light (John 1:5). The candle is set into its ornate stand next to the Ambo.',
    pedagogicalNote: 'The sudden flood of sanctuary lights symbolizes the explosive power of the Resurrection shattering death and the grave.',
    elevationPitchNote: 'A4 / B4 / C#5 (Triumphant High)',
  },
  {
    stepNumber: 6,
    title: 'The Exsultet: The Paschal Proclamation',
    latinTitle: 'Praeconium Paschale (Exsultet)',
    location: 'At the Ambo beside the towering Paschal Candle',
    ritualAction: 'The deacon incenses the candle and the book, then chants the ancient, poetic Exsultet in the candlelit sanctuary.',
    wordsSpoken: 'Exult, let them exult, the hosts of heaven, exult, let Angel ministers of God exult! Be glad, let earth be glad, as glory floods her, ablaze with light from her eternal King!',
    wordsLatin: 'Exsultet iam angelica turba caelorum: exsultent divina mysteria: et pro tanti Regis victoria tuba insonet salutaris! Gaudeat et tellus tantis irradiata fulgoribus!',
    wordsResponse: 'The Lord be with you. And with your spirit. Lift up your hearts! We lift them up to the Lord!',
    wordsResponseLatin: 'Dominus vobiscum. Et cum spiritu tuo. Sursum corda! Habemus ad Dominum!',
    theologicalMeaning: 'The pinnacle of Christian hymnody. It celebrates the "O felix culpa" (O happy fault) that won for humanity so great and glorious a Redeemer.',
    pedagogicalNote: 'Composed between the 4th and 7th century, the Exsultet links the Exodus night of Israel to the night of Christ rising from the tomb.',
  },
];

export const TRIDUUM_MOVEMENTS: TriduumMovement[] = [
  {
    id: 'holy-thursday',
    order: 1,
    dayTitle: 'Holy Thursday: Evening Mass of the Lord’s Supper',
    latinTitle: 'Feria V in Coena Domini',
    subtitle: 'The Upper Room, The Priesthood, The Eucharist & The Gethsemane Watch',
    timeContext: 'Thursday Evening (approx. 7:00 PM – Midnight)',
    liturgicalColor: 'White & Gold (transitioning to Bare Stone)',
    colorHex: '#d97706',
    bgGradient: 'from-amber-950/70 via-stone-900 to-slate-950',
    badgeText: 'Movement I: Institution & The Watch',
    scriptureReference: 'John 13:1–15; 1 Corinthians 11:23–26',
    scriptureText: 'Jesus rose from supper and laid aside his outer garments. He poured water into a basin and began to wash the disciples’ feet... "Do you understand what I have done for you? I have given you an example, that you also should do just as I have done to you."',
    scriptureLatin: 'Surgit a cena et ponit vestimenta sua; et cum accepisset linteum, praecinxit se. Deinde mittit aquam in pelvim et coepit lavare pedes discipulorum... "Exemplum enim dedi vobis, ut, quemadmodum ego feci vobis, ita et vos faciatis."',
    sacredVersicle: {
      prompt: 'Mandatum novum do vobis: ut diligatis invicem, sicut dilexi vos.',
      response: 'A new commandment I give you: that you love one another, as I have loved you.',
      latinPrompt: 'Mandatum novum do vobis.',
      latinResponse: 'Ut diligatis invicem sicut dilexi vos.',
    },
    theologicalSummary: 'Holy Thursday opens the Sacred Paschal Triduum. In the Upper Room, Christ institutes the Holy Eucharist and the Ministerial Priesthood, offering Himself in bread and wine before offering Himself on the Cross. By washing the disciples’ feet (the Mandatum), He establishes that Christian authority is rooted in humble, sacrificial servant leadership.',
    ceremonies: [
      {
        title: 'The Washing of the Feet (The Mandatum)',
        latinTitle: 'Lavatio Pedum',
        description: 'The priest removes his chasuble and washes the feet of twelve parish representatives, mirroring Christ washing the apostles.',
        theologicalMeaning: 'Radical humility and charity. The Master kneels as a servant, inaugurating the New Commandment of mutual love.',
        symbolIcon: '🦶',
      },
      {
        title: 'Institution of the Holy Eucharist',
        latinTitle: 'Institutio Sanctissimae Eucharistiae',
        description: 'Christ speaks the Words of Institution: "This is my Body... This is the Chalice of my Blood."',
        theologicalMeaning: 'The unbloody anticipation of the sacrifice of Calvary, given as eternal spiritual food for the Church.',
        symbolIcon: '🍞',
      },
      {
        title: 'The Stripping of the Altar',
        latinTitle: 'Denudatio Altaris',
        description: 'Immediately following Mass, the candles, altar cloths, crucifix, and altar books are removed in solemn silence.',
        theologicalMeaning: 'Symbolizes Christ being stripped of His garments by the Roman soldiers and His abandonment by the disciples.',
        symbolIcon: '🪨',
      },
      {
        title: 'Solemn Procession & The Watch at the Altar of Repose',
        latinTitle: 'Translatio Sanctissimi Sacramenti',
        description: 'The Blessed Sacrament is carried in procession under a humeral veil through the darkened church to an Altar of Repose. The faithful keep silent watch late into the night.',
        theologicalMeaning: 'Accompanying Christ in the Garden of Gethsemane in His agony: "Could you not watch one hour with me?"',
        symbolIcon: '🕯️',
      },
    ],
    liturgicalActionGuidance: 'The Mass ends with NO blessing and NO dismissal. The priest and ministers depart in deep silence. The liturgy has begun and remains in session.',
    curriculumKeyStageAlignment: 'KS2/KS3/GCSE RE: The Last Supper, Catholic Sacramental Theology (Real Presence), Servant Leadership, Holy Orders.',
    recdConcept: 'Covenant, Sacramental Institution, and Christ’s Agony in the Garden.',
  },
  {
    id: 'good-friday',
    order: 2,
    dayTitle: 'Good Friday: Celebration of the Passion of the Lord',
    latinTitle: 'Feria VI in Passione Domini',
    subtitle: 'Prostration, The Passion according to St. John, The Adoration of the Cross & Solemn Intercessions',
    timeContext: 'Friday Afternoon (traditionally 3:00 PM, the Hour of Mercy)',
    liturgicalColor: 'Liturgical Red (Blood of the Martyrs & Christ the King)',
    colorHex: '#dc2626',
    bgGradient: 'from-red-950/80 via-stone-950 to-neutral-950',
    badgeText: 'Movement II: The Sacrifice on Calvary',
    scriptureReference: 'Isaiah 52:13–53:12; John 18:1–19:42',
    scriptureText: 'He was pierced for our transgressions, crushed for our iniquities; upon him was the chastisement that brought us peace, and with his wounds we are healed... Jesus said, "It is finished"; and he bowed his head and gave up his spirit.',
    scriptureLatin: 'Ipse autem vulneratus est propter iniquitates nostras, attritus est propter scelera nostra: disciplina pacis nostrae super eum, et livore eius sanati sumus... Jesus dixit: "Consummatum est." Et inclinato capite tradidit spiritum.',
    sacredVersicle: {
      prompt: 'Ecce lignum Crucis, in quo salus mundi pependit.',
      response: 'Venite, adoremus! (Behold the wood of the Cross, on which hung the Salvation of the World. Come, let us adore!)',
      latinPrompt: 'Ecce lignum Crucis, in quo salus mundi pependit.',
      latinResponse: 'Venite, adoremus.',
    },
    theologicalSummary: 'Good Friday is the day of supreme sacrifice. No Mass is celebrated anywhere on earth today—the altar is completely bare without linens, candles, or cross. The liturgy consists of three solemn parts: the Liturgy of the Word (including the chanting of St. John’s Passion), the Adoration of the Holy Cross, and Holy Communion consecrated the evening before.',
    ceremonies: [
      {
        title: 'The Silent Prostration',
        latinTitle: 'Prostratio Sacerdotum',
        description: 'The priest and ministers enter in total silence and prostrate themselves flat on the ground before the bare altar.',
        theologicalMeaning: 'The deepest expression of human unworthiness, total grief, and adoration before the mystery of God’s self-giving love.',
        symbolIcon: '🙇',
      },
      {
        title: 'The Solemn Universal Intercessions',
        latinTitle: 'Orationes Sollemnes',
        description: 'Ten expansive prayers offered for the Holy Church, the Pope, all clergy and faithful, catechumens, Christian unity, the Jewish people, non-believers, and those in public office.',
        theologicalMeaning: 'From the Cross, Christ stretches His arms wide to embrace all humanity. The Church prays with universal scope.',
        symbolIcon: '🌍',
      },
      {
        title: 'The Unveiling & Adoration of the Holy Cross',
        latinTitle: 'Adoratio Sanctae Crucis',
        description: 'A veiled crucifix is carried into the church. In three stages, the veil is removed as the priest sings "Ecce lignum Crucis" (Behold the wood of the Cross). The faithful approach to genuflect and kiss the sacred wounds.',
        theologicalMeaning: 'The instrument of brutal execution is transformed into the throne of mercy and the tree of eternal life.',
        symbolIcon: '✝️',
      },
      {
        title: 'Communion from the Altar of Repose & Silent Departure',
        latinTitle: 'Sacra Communio ex Altaris Repositione',
        description: 'Holy Communion is brought back from the Altar of Repose. After reception, the tabernacle remains wide open and empty, and everyone departs in absolute silence.',
        theologicalMeaning: 'The Church participates in Christ’s death. Again, there is no final blessing or song—the journey continues.',
        symbolIcon: '🕊️',
      },
    ],
    liturgicalActionGuidance: 'Strict fasting and abstinence are observed by all Catholics. The organ is silenced, no bells are rung, and the tabernacle lamp is extinguished.',
    curriculumKeyStageAlignment: 'KS3/GCSE RE: Atonement Theories (Substitution, Exemplar, Christus Victor), The Problem of Evil & Suffering, The Crucifixion.',
    recdConcept: 'Sacrifice, Redemptive Suffering, and the Universal Intercession of the Church.',
  },
  {
    id: 'holy-saturday',
    order: 3,
    dayTitle: 'Holy Saturday: The Great Silence & Harrowing of Hades',
    latinTitle: 'Sabbatum Sanctum: Magnum Silentium',
    subtitle: 'Christ Resting in the Tomb, The Descensus Christi ad Inferos & The Blessed Virgin’s Vigil',
    timeContext: 'All day Saturday until sundown',
    liturgicalColor: 'Deep Violet / Midnight Twilight',
    colorHex: '#475569',
    bgGradient: 'from-slate-950 via-stone-900 to-indigo-950',
    badgeText: 'Movement III: The Sacred Silence',
    scriptureReference: '1 Peter 3:18–19; Matthew 27:62–66',
    scriptureText: 'He was put to death in the flesh, but made alive in the spirit, in which he went and proclaimed to the spirits in prison... Something strange is happening: there is a great silence on earth today, a great silence and stillness.',
    scriptureLatin: 'Mortificatus quidem carne, vivificatus autem spiritu; in quo et his, qui in carcere erant, spiritibus veniens praedicavit... Magnum silentium est hodie in terra, silentium magnum et solitudo.',
    sacredVersicle: {
      prompt: 'Surge, qui dormis, et exsurge a mortuis, et illuminabit te Christus.',
      response: 'Awake, O sleeper, and rise from the dead, and Christ will give you light!',
      latinPrompt: 'Surge, qui dormis, et exsurge a mortuis.',
      latinResponse: 'Et illuminabit te Christus.',
    },
    theologicalSummary: 'Holy Saturday is the quietest day of the entire liturgical year. The Church waits at the tomb in prayer and fasting. Christ’s human body rests in the rock-hewn sepulchre, while His divine soul descends to the realm of the dead (the "Harrowing of Hell" / Descensus ad inferos) to smash the gates of bronze and rescue Adam, Eve, and all the righteous who awaited redemption.',
    ceremonies: [
      {
        title: 'The Great Liturgical Silence',
        latinTitle: 'Magnum Silentium',
        description: 'No sacraments are celebrated today (except Confession and Anointing of the Sick in danger of death). The sanctuary remains stripped bare.',
        theologicalMeaning: 'The true Sabbath rest of the Creator. Having completed the work of redemption on the sixth day (Friday), God rests on the seventh day (Saturday).',
        symbolIcon: '⏳',
      },
      {
        title: 'The Harrowing of Hell (Descensus ad Inferos)',
        latinTitle: 'Descensus Christi ad Inferos',
        description: 'Christ descends into the abode of the dead, grasps Adam and Eve by the wrist, and raises them into eternal life.',
        theologicalMeaning: 'Death is conquered from within. No human soul, from the dawn of creation onward, is beyond the reach of Christ’s redeeming mercy.',
        symbolIcon: '🗝️',
      },
      {
        title: 'The Mother of Faith (The Virgin Mary’s Vigil)',
        latinTitle: 'Fides Sanctae Mariae',
        description: 'According to ancient Catholic tradition, when the faith of all the apostles was shaken, the faith of the Blessed Virgin Mary remained steadfast and unbroken.',
        theologicalMeaning: 'Mary is the figure and archetype of the Church, believing with serene certainty in the promised Resurrection.',
        symbolIcon: '🌹',
      },
    ],
    liturgicalActionGuidance: 'A day of prayerful anticipation. The ancient Holy Saturday homily is read in the Office of Readings. Preparations begin in secret for the Great Vigil after nightfall.',
    curriculumKeyStageAlignment: 'KS3/GCSE RE: The Apostles’ Creed ("He descended into hell"), The Nature of Death and Resurrection, The Role of Mary in Salvation.',
    recdConcept: 'Sabbath Fulfillment, Eschatology, and the Liberation of Captives.',
  },
  {
    id: 'easter-vigil',
    order: 4,
    dayTitle: 'The Easter Vigil in the Holy Night: The Mother of All Vigils',
    latinTitle: 'Vigilia Paschalis in Nocte Sancta',
    subtitle: 'The Lucernarium, Lumen Christi, The Exsultet, The 7 Readings, The Waters of Baptism & The Return of the Alleluia',
    timeContext: 'Saturday Night after complete darkness (approx. 8:30 PM – Midnight)',
    liturgicalColor: 'Radiant Gold & Brilliant White',
    colorHex: '#eab308',
    bgGradient: 'from-amber-950/60 via-stone-900 to-amber-900/40',
    badgeText: 'Movement IV: The Triumphant Vigil',
    scriptureReference: 'Genesis 1:1–2:2; Exodus 14:15–15:1; Romans 6:3–11; Mark 16:1–7',
    scriptureText: 'Do not be amazed! You seek Jesus of Nazareth, the crucified. He has risen; he is not here. See the place where they laid him... Death no longer has dominion over him!',
    scriptureLatin: 'Nolite expavescere! Jesum quaeritis Nazarenum crucifixum. Surrexit, non est hic; ecce locus ubi posuerunt eum... Mors illi ultra non dominabitur!',
    sacredVersicle: {
      prompt: 'Alleluia, alleluia, alleluia!',
      response: 'Surrexit Dominus vere, alleluia! (The Lord is risen indeed, alleluia!)',
      latinPrompt: 'Alleluia, alleluia, alleluia.',
      latinResponse: 'Surrexit Dominus vere, et apparuit Simoni. Alleluia!',
    },
    theologicalSummary: 'St. Augustine called the Easter Vigil "the Mother of all Holy Vigils." It is the summit of the Church’s liturgical life. The darkness of the church is pierced by the New Fire and the three elevations of Lumen Christi. Seven Old Testament readings recount the history of salvation. At the Gloria, every bell in the church rings after forty days of Lent. New catechumens are baptized, confirmed, and receive Holy Communion.',
    ceremonies: [
      {
        title: 'The Lucernarium & Three Elevations of Lumen Christi',
        latinTitle: 'Lucernarium et Processio',
        description: 'The New Fire is struck from flint, the Paschal Candle is inscribed and lit, and processed into the church with the threefold chant of Lumen Christi.',
        theologicalMeaning: 'Christ dispels all cosmic darkness. The light spreads until the entire church is blazing with warm candlelight.',
        symbolIcon: '🕯️',
      },
      {
        title: 'The Chanting of the Exsultet',
        latinTitle: 'Praeconium Paschale',
        description: 'The deacon or cantor chants the ancient Easter proclamation, exulting over the night that saw Christ break the chains of death.',
        theologicalMeaning: '"O felix culpa!" The fall of Adam is redeemed by the infinitely greater grace of Christ’s resurrection.',
        symbolIcon: '📜',
      },
      {
        title: 'The Great Alleluia & Restoration of Bells',
        latinTitle: 'Magnum Alleluia et Gloria',
        description: 'During the Gloria in Excelsis, the church bells ring continuously, the organ plays with all stops pulled, and the priest intones the solemn triple Alleluia.',
        theologicalMeaning: 'The 40-day fast from the word Alleluia is ended with cosmic celebration and jubilation.',
        symbolIcon: '🔔',
      },
      {
        title: 'The Blessing of the Baptismal Font & Easter Water',
        latinTitle: 'Benedictio Fontis Baptismalis',
        description: 'The Paschal Candle is plunged three times into the baptismal water. Adults and children are baptized, and all faithful renew their baptismal promises.',
        theologicalMeaning: 'Baptism is dying and rising with Christ. The waters of regeneration cleanse and rebirth the children of God.',
        symbolIcon: '💧',
      },
    ],
    liturgicalActionGuidance: 'The Triduum reaches its triumphant resolution. At the end of Mass, the solemn dismissal with double Alleluia is sung for the first time: "Ite, missa est, alleluia, alleluia!"',
    curriculumKeyStageAlignment: 'KS2/KS3/GCSE RE: Sacraments of Initiation (Baptism & Confirmation), Salvation History, Typology of the Red Sea crossing.',
    recdConcept: 'Paschal Mystery, New Creation, and Sacramental Rebirth.',
  },
  {
    id: 'easter-sunday-50days',
    order: 5,
    dayTitle: 'Easter Sunday & The 50-Day Glory of Eastertide',
    latinTitle: 'Dominica Paschatis & Tempus Paschale',
    subtitle: 'Victimae Paschali Laudes, The Empty Tomb, Emmaus, Divine Mercy, Ascension & Pentecost',
    timeContext: 'Easter Sunday morning through Pentecost Sunday (50 Days)',
    liturgicalColor: 'Brilliant Gold, Pure White & Spring Garland',
    colorHex: '#10b981',
    bgGradient: 'from-emerald-950/60 via-stone-900 to-amber-900/40',
    badgeText: 'Movement V: The Fullness of Easter',
    scriptureReference: 'John 20:1–18; Luke 24:13–35; Acts 2:1–4',
    scriptureText: 'Early on the first day of the week, while it was still dark, Mary Magdalene came to the tomb and saw that the stone had been taken away... Jesus said to her, "Mary!" She turned and said to him in Aramaic, "Rabboni!" (which means Teacher).',
    scriptureLatin: 'Una autem sabbati, Maria Magdalene venit mane, cum adhuc tenebrae essent, ad monumentum, et videt lapidem sublatum a monumento... Dicit ei Jesus: "Maria!" Conversa illa dicit ei hebraice: "Rabboni!" (quod dicitur Magister).',
    sacredVersicle: {
      prompt: 'Surrexit Christus, spes mea: praecedet suos in Galilaeam.',
      response: 'Christ, my hope, has arisen: He goes before His own into Galilee! (Victimae Paschali Laudes)',
      latinPrompt: 'Surrexit Christus spes mea.',
      latinResponse: 'Praecedet suos in Galilaeam.',
    },
    theologicalSummary: 'Easter is not merely a single day—it is a fifty-day festival of glory ("a week of weeks") celebrated as one continuous Great Sunday. It begins with the Octave of Easter (where every single day for eight days is liturgically celebrated as Easter Sunday itself), encompasses Divine Mercy Sunday, the walk to Emmaus, the Ascension of Christ on the 40th day, and culminates in the outpouring of the Holy Spirit at Pentecost.',
    ceremonies: [
      {
        title: 'The Easter Sequence: Victimae Paschali Laudes',
        latinTitle: 'Sequentia: Victimae Paschali Laudes',
        description: 'Chanted or sung immediately before the Gospel at Easter Mass. Mary Magdalene is questioned: "Tell us, Mary: what did you see on the way?"',
        theologicalMeaning: 'The historical testimony of the Risen Lord. Mary Magdalene is the "Apostle to the Apostles" (Apostolorum Apostola).',
        symbolIcon: '🎶',
      },
      {
        title: 'The Octave of Easter & Divine Mercy Sunday',
        latinTitle: 'Octava Paschalis & Dominica in Albis',
        description: 'Eight unbroken days of supreme festivity, concluding on the Second Sunday of Easter (Divine Mercy Sunday, when Christ breathes peace and the Holy Spirit upon the disciples).',
        theologicalMeaning: 'The boundless ocean of divine mercy poured out upon sinners through the pierced heart of the Risen Christ.',
        symbolIcon: '❤️',
      },
      {
        title: 'The Road to Emmaus & The Breaking of Bread',
        latinTitle: 'In Via ad Emmaus',
        description: 'Christ walks incognito with two disciples whose hearts burn within them as He opens the Scriptures, recognizing Him in the "fractio panis" (breaking of the bread).',
        theologicalMeaning: 'The structure of every Catholic Mass: Liturgy of the Word (hearts burning) followed by Liturgy of the Eucharist (eyes opened).',
        symbolIcon: '🍞',
      },
      {
        title: 'The Ascension (Day 40) & Pentecost (Day 50)',
        latinTitle: 'Ascensio Domini & Pentecoste',
        description: 'Christ ascends in glory to the right hand of the Father, and on the fiftieth day sends down the Holy Spirit in tongues of fire upon the Apostles and Our Lady.',
        theologicalMeaning: 'The birth of the Catholic Church. The Paschal Mystery bears its ultimate fruit: the divinization of human hearts and the worldwide missionary mandate.',
        symbolIcon: '🔥',
      },
    ],
    liturgicalActionGuidance: 'The Paschal Candle remains prominently beside the Ambo for all 50 days of Eastertide, burning at every Mass until Pentecost Sunday evening.',
    curriculumKeyStageAlignment: 'KS2/KS3/GCSE RE: The Resurrection as the cornerstone of Christian faith, The Emmaus narrative, The Holy Spirit at Pentecost, Evangelisation.',
    recdConcept: 'Resurrection Faith, Divine Mercy, the Mission of the Church, and the Holy Spirit.',
  },
];

export const EXSULTET_SACRED_TEXT = {
  latinTitle: 'Praeconium Paschale (Exsultet)',
  englishTitle: 'The Easter Proclamation (Exsultet)',
  openingInvocation: {
    latin: 'Exsultet iam angelica turba caelorum: exsultent divina mysteria: et pro tanti Regis victoria tuba insonet salutaris! Gaudeat et tellus tantis irradiata fulgoribus: et, aeterni Regis splendore lustrata, totius orbis se sentiat amisisse caliginem!',
    english: 'Exult, let them exult, the hosts of heaven, exult, let Angel ministers of God exult, let the trumpet of salvation sound aloud our mighty King’s triumph! Be glad, let earth be glad, as glory floods her, ablaze with light from her eternal King, let all corners of the earth be glad, knowing an end to gloom and darkness!',
    spanish: '¡Alégrense, por fin, los coros de los ángeles, alégrense las jerarquías del cielo y, por la victoria de rey tan grande, que las trompetas anuncien la salvación! Goce también la tierra, inundada de tanta claridad, y que, radiante con el brillo del Rey eterno, se sienta libre de la oscuridad que cubría el orbe entero.',
  },
  felixCulpaStanza: {
    latin: 'O certe necessarium Adae peccatum, quod Christi morte deletum est! O felix culpa, quae talem ac tantum meruit habere Redemptorem! O vere beata nox, quae sola meruit scire tempus et horam, in qua Christus ab inferis resurrexit!',
    english: 'O truly necessary sin of Adam, destroyed completely by the Death of Christ! O happy fault, that earned so great, so glorious a Redeemer! O truly blessed night, worthy alone to know the time and hour when Christ rose from the underworld!',
    spanish: '¡Oh certeza de la falta de Adán, que fue borrada con la muerte de Cristo! ¡Oh feliz culpa que mereció tal y tan grande Redentor! ¡Oh noche verdaderamente bienaventurada, la única que mereció saber el tiempo y la hora en que Cristo resucitó de los infiernos!',
  },
  pillarOfFireStanza: {
    latin: 'Haec nox est, de qua scriptum est: Et nox sicut dies illuminabitur: et nox illuminatio mea in deliciis meis. Huius igitur sanctificatio noctis fugat scelera, culpas lavat: et reddit innocentiam lapsis et maestis laetitiam.',
    english: 'This is the night of which it is written: The night shall be as bright as day, dazzling is the night for me, and full of gladness. The sanctifying power of this night dispels wickedness, washes faults away, restores innocence to the fallen, and joy to mourners.',
    spanish: 'Esta es la noche de la que está escrito: "Y la noche brillará como el día, y la noche será mi luz y mi gozo". El poder santificador de esta noche ahuyenta los pecados, lava las culpas, devuelve la inocencia a los caídos y la alegría a los tristes.',
  },
};

export const VICTIMAE_PASCHALI_SEQUENCE = {
  latinTitle: 'Victimae Paschali Laudes',
  englishTitle: 'The Easter Sequence (Praise to the Paschal Victim)',
  stanzas: [
    {
      latin: 'Victimae paschali laudes immolent Christiani. Agnus redemit oves: Christus innocens Patri reconciliavit peccatores.',
      english: 'Christians, to the Paschal Victim offer your sacrifice of praise. The sheep are ransomed by the Lamb; and Christ, the undefiled, has sinners to his Father reconciled.',
      spanish: 'A la Víctima Pascual ofrezcan los cristianos sacrificios de alabanza. El Cordero redimió a las ovejas: Cristo inocente reconcilió a los pecadores con el Padre.',
    },
    {
      latin: 'Mors et vita duello conflixere mirando: dux vitae mortuus, regnat vivus.',
      english: 'Death with life contended: combat strangely ended! Life’s own Champion, slain, yet lives to reign.',
      spanish: 'Muerte y vida se batieron en un prodigioso duelo: el Dueño de la vida, que había muerto, reina vivo.',
    },
    {
      latin: 'Dic nobis Maria, quid vidisti in via? Sepulcrum Christi viventis, et gloriam vidi resurgentis.',
      english: 'Tell us, Mary: say what thou didst see upon the way. The tomb the Living did enclose; I saw Christ’s glory as he rose!',
      spanish: 'Dinos, María, ¿qué viste en el camino? Vi el sepulcro de Cristo viviente y la gloria del que resucitó.',
    },
    {
      latin: 'Angelicos testes, sudarium, et vestes. Surrexit Christus spes mea: praecedet suos in Galilaeam.',
      english: 'The angels there attesting; shroud with grave-clothes resting. Christ, my hope, has arisen: he goes before you into Galilee.',
      spanish: 'Vi a los ángeles testigos, el sudario y los vestidos. Resucitó Cristo, mi esperanza; irá delante de los suyos a Galilea.',
    },
    {
      latin: 'Scimus Christum surrexisse a mortuis vere: tu nobis, victor Rex, miserere. Amen. Alleluia.',
      english: 'That Christ is truly risen from the dead we know. Victorious King, thy mercy show! Amen. Alleluia.',
      spanish: 'Sabemos que Cristo resucitó verdaderamente de entre los muertos: Tú, Rey victorioso, ten piedad de nosotros. Amén. Aleluya.',
    },
  ],
};
