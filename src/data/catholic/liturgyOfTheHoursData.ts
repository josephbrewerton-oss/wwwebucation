// src/data/catholic/liturgyOfTheHoursData.ts
// St Joseph's Catholic Life & Faith Sanctuary
// Complete Catechetical Knowledge: The Liturgy of the Hours (Liturgia Horarum / Divine Office / Breviary)

export interface CanonicalHour {
  id: string;
  name: string;
  latinName: string;
  traditionalTime: string;
  typicalClockRange: string;
  category: 'Major Hour' | 'Daytime Hour' | 'Night Prayer' | 'Extended Office';
  theologicalTheme: string;
  scripturalBiblicalEcho: string;
  structure: string[];
  gospelCanticle?: {
    title: string;
    latinTitle: string;
    canticleAuthor: string;
    scriptureCitation: string;
    latinText: string;
    englishText: string;
  };
  samplePsalm: {
    number: string;
    title: string;
    latinAntiphon: string;
    englishAntiphon: string;
    latinExcerpt: string;
    englishExcerpt: string;
  };
  closingCollect: {
    latin: string;
    english: string;
  };
  icon: string;
  colorTone: string;
}

export interface MarianAntiphon {
  id: string;
  name: string;
  season: string;
  latinText: string;
  englishText: string;
  spiritualMeaning: string;
}

export const CANONICAL_HOURS: CanonicalHour[] = [
  {
    id: 'matins',
    name: 'Office of Readings',
    latinName: 'Officium Lectionis (Matutinum)',
    traditionalTime: 'Midnight / Pre-dawn / Flexible',
    typicalClockRange: '00:00 - 05:59',
    category: 'Extended Office',
    theologicalTheme: 'Meditative contemplation of Sacred Scripture and the Church Fathers. Keeping watch with the Lord in sacred silence while the world sleeps.',
    scripturalBiblicalEcho: 'At midnight I rise to praise You for Your righteous laws. (Psalm 119:62) / Watch and pray that you may not enter into temptation. (Matthew 26:41)',
    structure: [
      '1. Invitatory verse: "Lord, open my lips, and my mouth will proclaim Your praise." (Domine, labia mea aperies)',
      '2. Invitatory Psalm (Psalm 95, 100, 67, or 24) with seasonal antiphon',
      '3. Hymn suited to the character of the day or season',
      '4. Psalmody: Three psalms (or sections of long psalms) with proper antiphons',
      '5. First Reading: Substantial passage from the Old or New Testament (Lectio)',
      '6. First Responsory meditating on the biblical passage',
      '7. Second Reading: Patristic text from the Church Fathers, Doctors, or Conciliar documents',
      '8. Second Responsory meditating on the patristic teaching',
      '9. Te Deum Laudamus (Solemn hymn of praise on Sundays and feast days)',
      '10. Concluding Prayer (Collect of the Day)',
    ],
    samplePsalm: {
      number: 'Psalm 1',
      title: 'The Two Paths: The Tree Planted Beside Flowing Waters',
      latinAntiphon: 'Beatus vir qui in lege Domini meditatur die ac nocte.',
      englishAntiphon: 'Blessed is the man who meditates on the law of the Lord day and night.',
      latinExcerpt: 'Beatus vir, qui non abiit in consilio impiorum, et in via peccatorum non stetit, sed in lege Domini voluntas eius, et in lege eius meditabitur die ac nocte.',
      englishExcerpt: 'Blessed is the man who walks not in the counsel of the wicked, but his delight is in the law of the Lord, and on His law he meditates day and night.',
    },
    closingCollect: {
      latin: 'Deus, qui illuminas noctem et facis post tenebras splendescere lucem, praesta, ut per noctis spatia a peccato tuti, ad lucem novam pervenire mereamur. Per Christum Dominum nostrum. Amen.',
      english: 'O God, who lighten the night and cause the light to shine after darkness, grant that, preserved from sin through the hours of night, we may be found worthy to enter upon the new day. Through Christ our Lord. Amen.',
    },
    icon: '🕯️',
    colorTone: '#38bdf8',
  },
  {
    id: 'lauds',
    name: 'Morning Prayer',
    latinName: 'Laudes Matutinae (Lauds)',
    traditionalTime: 'Sunrise / Dawn (~6:00 AM - 8:30 AM)',
    typicalClockRange: '06:00 - 08:59',
    category: 'Major Hour',
    theologicalTheme: 'Greeting Jesus Christ, the Orient from on high and the True Sun that never sets. Dedicated to the Resurrection of our Lord and the praise of God as creation awakes.',
    scripturalBiblicalEcho: 'O God, You are my God; early will I seek You; my soul thirsts for You in a dry and weary land. (Psalm 63:1)',
    structure: [
      '1. Introductory verse: "O God, come to my assistance; O Lord, make haste to help me." with Sign of the Cross',
      '2. Morning Hymn of praise',
      '3. Morning Psalm expressing thirst for God and early adoration',
      '4. Old Testament Canticle (e.g. Song of the Three Youths Daniel 3, Canticle of Isaiah)',
      '5. Psalm of Praise (Laudate Psalms: 148, 149, or 150)',
      '6. Short Scripture Reading (Lectio brevis)',
      '7. Short Responsory (Responsorium breve)',
      '8. The Benedictus (Gospel Canticle of Zechariah) with solemn Sign of the Cross',
      '9. Intercessions (Preces) offering the day’s work and praising God’s providence',
      '10. The Lord’s Prayer (Pater Noster)',
      '11. Concluding Prayer (Collect)',
      '12. Blessing and Dismissal',
    ],
    gospelCanticle: {
      title: 'The Benedictus (Canticle of Zechariah)',
      latinTitle: 'Canticum Zachariae',
      canticleAuthor: 'Zechariah, father of St. John the Baptist',
      scriptureCitation: 'Luke 1:68-79',
      latinText:
        'Benedictus Dominus Deus Israel, quia visitavit et fecit redemptionem plebis suae: Et erexit cornu salutis nobis in domo David pueri sui: Sicut locutus est per os sanctorum, qui a saeculo sunt, prophetarum eius... Per viscera misericordiae Dei nostri, in quibus visitabit nos Oriens ex alto: Illuminare his, qui in tenebris et in umbra mortis sedent: ad dirigendos pedes nostros in viam pacis.',
      englishText:
        'Blessed be the Lord, the God of Israel; He has come to His people and set them free. He has raised up for us a mighty Saviour, born of the house of His servant David. Through His holy prophets He promised of old that He would save us from our enemies... In the tender compassion of our God the dawn from on high shall break upon us, to shine on those who dwell in darkness and the shadow of death, and to guide our feet into the way of peace.',
    },
    samplePsalm: {
      number: 'Psalm 63:2-9',
      title: 'Thirst for God at Daybreak',
      latinAntiphon: 'Deus, Deus meus es tu; ad te de luce vigilo.',
      englishAntiphon: 'O God, You are my God; eagerly I seek You from the dawn.',
      latinExcerpt: 'Deus, Deus meus, ad te de luce vigilo. Sitivit in te anima mea; te desideravit caro mea in terra deserta, arida et inaquosa.',
      englishExcerpt: 'O God, You are my God, for You I long; for You my soul is thirsting. My body pines for You like a dry, weary land without water.',
    },
    closingCollect: {
      latin: 'Domine Deus omnipotens, qui ad principium huius diei nos pervenire fecisti: tua nos hodie salva virtute; ut in hac die ad nullum declinemus peccatum, sed semper ad tuam iustitiam faciendam nostra procedant eloquia, dirigantur cogitationes et opera. Per Christum Dominum nostrum. Amen.',
      english: 'Lord God almighty, who brought us safely to the beginning of this day: protect us today by Your mighty power, that we may fall into no sin, but that all our words, thoughts, and deeds may be guided to fulfill Your holy will. Through Christ our Lord. Amen.',
    },
    icon: '🌅',
    colorTone: '#f59e0b',
  },
  {
    id: 'terce',
    name: 'Mid-Morning Prayer (Terce)',
    latinName: 'Tertia (Hora Tertia)',
    traditionalTime: '9:00 AM (Third Hour of Daylight)',
    typicalClockRange: '09:00 - 11:29',
    category: 'Daytime Hour',
    theologicalTheme: 'Recalling the descent of the Holy Spirit at Pentecost (Acts 2:15) and Christ being led before Pilate. Invoking the Holy Spirit for strength in daily schoolwork and vocational labor.',
    scripturalBiblicalEcho: 'These men are not drunk, as you suppose, since it is only the third hour of the day. But this is what was spoken by the prophet Joel: I will pour out My Spirit. (Acts 2:15-16)',
    structure: [
      '1. Introductory verse: "O God, come to my assistance..." with Sign of the Cross',
      '2. Daytime Hymn (e.g. Nunc Sancte nobis Spiritus)',
      '3. Psalmody: Three psalms or sections with antiphons',
      '4. Short Scripture Reading (e.g. 1 John 4:16 "God is love")',
      '5. Versicle and Response',
      '6. Concluding Prayer for the Holy Spirit’s wisdom and fortitude',
    ],
    samplePsalm: {
      number: 'Psalm 119:33-40',
      title: 'The Beauty of God’s Law',
      latinAntiphon: 'Legem pone mihi, Domine, viam iustificationum tuarum.',
      englishAntiphon: 'Teach me, O Lord, the way of Your decrees.',
      latinExcerpt: 'Legem pone mihi, Domine, viam praeceptorum tuorum, et custodiam eam semper. Da mihi intellectum, et scrutabor legem tuam.',
      englishExcerpt: 'Teach me, Lord, the way of Your statutes, and I will keep them to the end. Give me understanding, that I may keep Your law and observe it with my whole heart.',
    },
    closingCollect: {
      latin: 'Deus, qui sanctissimum Spiritum tuum hora tertia Apostolis orantibus immisisti: nos eiusdem gratiae concede participes, ut verum coram hominibus testimonium perhibeamus. Per Christum Dominum nostrum. Amen.',
      english: 'O God, who sent Your Holy Spirit at the third hour upon the Apostles as they prayed: grant us a share in that same grace, that we may bear faithful witness to Your Gospel before all mankind. Through Christ our Lord. Amen.',
    },
    icon: '🕊️',
    colorTone: '#10b981',
  },
  {
    id: 'sext',
    name: 'Midday Prayer (Sext)',
    latinName: 'Sexta (Hora Sexta)',
    traditionalTime: '12:00 PM (Noon / Sixth Hour of Daylight)',
    typicalClockRange: '11:30 - 13:59',
    category: 'Daytime Hour',
    theologicalTheme: 'Recalling the Crucifixion: the hour when Jesus was nailed to the Cross and darkness fell over the whole earth. Pausing amid the heat and busyness of the day to find refuge in Christ.',
    scripturalBiblicalEcho: 'Now from the sixth hour there was darkness over all the land until the ninth hour. (Matthew 27:45) / Peter went up on the housetop to pray about the sixth hour. (Acts 10:9)',
    structure: [
      '1. Introductory verse: "O God, come to my assistance..."',
      '2. Midday Hymn (e.g. Rector potens, verax Deus)',
      '3. Psalmody: Three psalms or gradual psalm sections',
      '4. Short Scripture Reading (e.g. Galatians 6:14 "Far be it from me to glory except in the cross of our Lord Jesus Christ")',
      '5. Versicle and Response',
      '6. Concluding Prayer for strength against the midday devil and renewed zeal',
    ],
    samplePsalm: {
      number: 'Psalm 121',
      title: 'The Lord Your Guardian and Keeper',
      latinAntiphon: 'Dominus custodiat te ab omni malo; custodiat animam tuam Dominus.',
      englishAntiphon: 'The Lord will guard you from all evil; the Lord will guard your life.',
      latinExcerpt: 'Levavi oculos meos in montes: unde veniet auxilium mihi? Auxilium meum a Domino, qui fecit caelum et terram. Non dabit in commotionem pedem tuum, neque dormitabit qui custodit te.',
      englishExcerpt: 'I lift up my eyes to the hills; from where shall come my help? My help comes from the Lord, who made heaven and earth. He will not suffer your foot to stumble; He who keeps you will not slumber.',
    },
    closingCollect: {
      latin: 'Domine Iesu Christe, qui hora sexta pro mundi salute crucis lignum ascendisti: concede nobis, ut in crucis tuae virtute gloriamur, et a cunctis adversitatibus liberemur. Qui vivis et regnas in saecula saeculorum. Amen.',
      english: 'Lord Jesus Christ, who at the sixth hour ascended the wood of the Cross for the salvation of the world: grant that we may boast in the power of Your Cross and be delivered from all adversity. Who live and reign forever and ever. Amen.',
    },
    icon: '☀️',
    colorTone: '#eab308',
  },
  {
    id: 'none',
    name: 'Mid-Afternoon Prayer (None)',
    latinName: 'Nona (Hora Nona)',
    traditionalTime: '3:00 PM (Ninth Hour of Daylight)',
    typicalClockRange: '14:00 - 16:59',
    category: 'Daytime Hour',
    theologicalTheme: 'The Hour of Great Mercy. Commemorating the moment our Saviour died upon the Cross and bowed His head. Entrusting our fatigue and the approaching close of the workday to His infinite mercy.',
    scripturalBiblicalEcho: 'And at the ninth hour Jesus cried with a loud voice: "Eloi, Eloi, lema sabachthani?"... and yielded up His spirit. (Mark 15:34-37) / Peter and John were going up to the temple at the hour of prayer, the ninth hour. (Acts 3:1)',
    structure: [
      '1. Introductory verse: "O God, come to my assistance..."',
      '2. Daytime Hymn (e.g. Rerum, Deus, tenax vigor)',
      '3. Psalmody: Three psalms of trust and thanksgiving',
      '4. Short Scripture Reading (e.g. 1 Peter 1:18-19 "You were ransomed with the precious blood of Christ")',
      '5. Versicle and Response',
      '6. Concluding Prayer offering the labours of the day in union with Christ’s sacrifice',
    ],
    samplePsalm: {
      number: 'Psalm 126',
      title: 'Those Who Sow in Tears Shall Reap in Joy',
      latinAntiphon: 'Qui seminant in lacrimis, in exsultatione metent.',
      englishAntiphon: 'Those who sow in tears shall reap in joy.',
      latinExcerpt: 'Magnificavit Dominus facere nobiscum; facti sumus laetantes. Converte, Domine, captivitatem nostram, sicut torrentes in austro. Qui seminant in lacrimis, in exsultatione metent.',
      englishExcerpt: 'The Lord has done great things for us; we are glad indeed! Restore our fortunes, O Lord, like the torrents in the southern desert. Those who sow in tears shall reap with shouts of joy.',
    },
    closingCollect: {
      latin: 'Domine Iesu Christe, qui hora nona emisso spiritu vitam mundo contulisti: da nobis, ut peccatis mortui, tibi iugiter vivamus. Qui vivis et regnas in saecula saeculorum. Amen.',
      english: 'Lord Jesus Christ, who at the ninth hour breathed forth Your spirit and bestowed life upon the world: grant that, being dead to sin, we may live continually for You. Who live and reign forever and ever. Amen.',
    },
    icon: '✝️',
    colorTone: '#ec4899',
  },
  {
    id: 'vespers',
    name: 'Evening Prayer',
    latinName: 'Vesperae (Vespers)',
    traditionalTime: 'Sunset / Dusk (~5:30 PM - 7:30 PM)',
    typicalClockRange: '17:00 - 20:29',
    category: 'Major Hour',
    theologicalTheme: 'The evening sacrifice of thanksgiving. Recalling the Last Supper, the Institution of the Holy Eucharist, and Christ’s burial. Offering incense-like prayers as the light of day fades into evening.',
    scripturalBiblicalEcho: 'Let my prayer be set forth before You as incense, the lifting up of my hands as the evening sacrifice. (Psalm 141:2)',
    structure: [
      '1. Introductory verse: "O God, come to my assistance..." with Sign of the Cross',
      '2. Evening Hymn (e.g. Lucis Creator optime)',
      '3. Psalmody: Two Psalms of praise and petition suited to evening',
      '4. New Testament Canticle (e.g. Philippians 2:6-11, Revelation 19:1-7, Colossians 1:12-20, Ephesians 1:3-10)',
      '5. Short Scripture Reading (Lectio brevis)',
      '6. Short Responsory (Responsorium breve)',
      '7. The Magnificat (Gospel Canticle of the Blessed Virgin Mary) with solemn Sign of the Cross',
      '8. Intercessions (Preces) for the Church, civil leaders, the sick, and the faithful departed',
      '9. The Lord’s Prayer (Pater Noster)',
      '10. Concluding Prayer (Collect of the Day)',
      '11. Blessing and Dismissal',
    ],
    gospelCanticle: {
      title: 'The Magnificat (Canticle of Mary)',
      latinTitle: 'Canticum Beatae Mariae Virginis',
      canticleAuthor: 'The Blessed Virgin Mary at the Visitation',
      scriptureCitation: 'Luke 1:46-55',
      latinText:
        'Magnificat anima mea Dominum, et exsultavit spiritus meus in Deo salvatore meo, quia respexit humilitatem ancillae suae: ecce enim ex hoc beatam me dicent omnes generationes, quia fecit mihi magna, qui potens est, et sanctum nomen eius... Suscepit Israel puerum suum, recordatus misericordiae suae, sicut locutus est ad patres nostros, Abraham et semini eius in saecula.',
      englishText:
        'My soul proclaims the greatness of the Lord, my spirit rejoices in God my Savior; for He has looked with favor on His lowly servant. From this day all generations will call me blessed: the Almighty has done great things for me, and holy is His Name. He has mercy on those who fear Him in every generation. He has shown the strength of His arm, He has scattered the proud in their conceit. He has cast down the mighty from their thrones, and has lifted up the lowly. He has filled the hungry with good things, and the rich He has sent away empty. He has come to the help of His servant Israel for He has remembered His promise of mercy, the promise He made to our fathers, to Abraham and his children forever.',
    },
    samplePsalm: {
      number: 'Psalm 141:1-3',
      title: 'Evening Prayer of Trust and Protection',
      latinAntiphon: 'Dirigatur, Domine, oratio mea sicut incensum in conspectu tuo.',
      englishAntiphon: 'Let my prayer arise like incense before You, O Lord.',
      latinExcerpt: 'Domine, clamavi ad te, exaudi me; intende voci meae, cum clamavero ad te. Dirigatur oratio mea sicut incensum in conspectu tuo, elevatio manuum mearum sacrificium vespertinum.',
      englishExcerpt: 'I have called to You, Lord; make haste to help me; hear my voice when I cry to You. Let my prayer arise before You like incense, the raising of my hands like an evening oblation.',
    },
    closingCollect: {
      latin: 'Gratias tibi agimus, Domine, qui nos ad vesperum pervenire fecisti: te suppliciter deprecantes, ut per intercessionem beatae Mariae semper Virginis, a peccatis universis emundati, tuae pacis dona percipiamus. Per Christum Dominum nostrum. Amen.',
      english: 'We give You thanks, Lord, who have brought us to the evening hour: humbly begging that through the intercession of the Blessed Virgin Mary, cleansed from all sin, we may receive the gifts of Your peace. Through Christ our Lord. Amen.',
    },
    icon: '🌆',
    colorTone: '#8b5cf6',
  },
  {
    id: 'compline',
    name: 'Night Prayer',
    latinName: 'Completorium (Compline)',
    traditionalTime: 'Before Sleep (~8:30 PM - 11:59 PM)',
    typicalClockRange: '20:30 - 23:59',
    category: 'Night Prayer',
    theologicalTheme: 'Holy peaceful surrender into the Father’s hands. Examination of conscience, resting under the angels’ wings, and readiness for eternal life.',
    scripturalBiblicalEcho: 'Into Your hands I commit my spirit; You have redeemed me, O Lord, God of truth. (Psalm 31:5) / Lord, now You let Your servant depart in peace. (Luke 2:29)',
    structure: [
      '1. Introductory verse: "The Lord grant us a quiet night and a perfect end. Amen." (Noctem quietam et finem perfectum concedat nobis Dominus omnipotens)',
      '2. Brief Examination of Conscience (Examen) followed by the Confiteor ("I confess to almighty God...") or Kyrie Eleison',
      '3. Night Hymn (e.g. Te lucis ante terminum / Christ, mighty Savior)',
      '4. Night Psalm: Psalm 91 ("Under His wings you will trust"), Psalm 4, or Psalm 134',
      '5. Short Scripture Reading (e.g. Jeremiah 14:9 "You are in our midst, O Lord; do not forsake us" or 1 Thessalonians 5:9-10)',
      '6. Short Responsory: "Into Your hands, Lord, I commend my spirit." (In manus tuas, Domine, commendo spiritum meum)',
      '7. The Nunc Dimittis (Gospel Canticle of Simeon) with solemn Sign of the Cross: "Protect us, Lord, as we stay awake; watch over us as we sleep, that awake we may keep watch with Christ, and asleep, rest in His peace."',
      '8. Concluding Night Prayer (Collect)',
      '9. Final Blessing: "May the all-powerful Lord grant us a restful night and a peaceful death. Amen."',
      '10. Marian Antiphon sung or recited to Our Lady (Salve Regina, Alma Redemptoris Mater, Ave Regina Caelorum, or Regina Caeli)',
    ],
    gospelCanticle: {
      title: 'The Nunc Dimittis (Canticle of Simeon)',
      latinTitle: 'Canticum Simeonis',
      canticleAuthor: 'Holy Simeon the Elder at the Presentation of the Lord in the Temple',
      scriptureCitation: 'Luke 2:29-32',
      latinText:
        'Nunc dimittis servum tuum, Domine, secundum verbum tuum in pace: Quia viderunt oculi mei salutare tuum: Quod parasti ante faciem omnium populorum: Lumen ad revelationem gentium, et gloriam plebis tuae Israel.',
      englishText:
        'Lord, now You let Your servant go in peace; Your word has been fulfilled. My own eyes have seen the salvation which You have prepared in the sight of every people: a light to reveal You to the nations and the glory of Your people Israel.',
    },
    samplePsalm: {
      number: 'Psalm 91',
      title: 'Dwelling Under the Protection of the Most High',
      latinAntiphon: 'Scapulis suis obumbrabit tibi, et sub pennis eius sperabis.',
      englishAntiphon: 'He will conceal you with His wings; you will not fear the terror of the night.',
      latinExcerpt: 'Qui habitat in adiutorio Altissimi, in protectione Dei caeli commorabitur. Dicet Domino: Susceptor meus es tu et refugium meum; Deus meus, sperabo in eum.',
      englishExcerpt: 'He who dwells in the shelter of the Most High, who abides in the shadow of the Almighty, will say to the Lord: "My refuge and my fortress; my God, in whom I trust."',
    },
    closingCollect: {
      latin: 'Visita, quaesumus, Domine, habitationem istam, et omnes insidias inimici ab ea longe repelle: Angeli tui sancti habitent in ea, qui nos in pace custodiant; et benedictio tua sit super nos semper. Per Christum Dominum nostrum. Amen.',
      english: 'Visit, we beseech You, Lord, this dwelling, and drive far from it all snares of the enemy. May Your holy angels dwell herein to preserve us in peace; and may Your blessing be always upon us. Through Christ our Lord. Amen.',
    },
    icon: '🌙',
    colorTone: '#a855f7',
  },
];

export const MARIAN_ANTIPHONS: MarianAntiphon[] = [
  {
    id: 'salve-regina',
    name: 'Salve Regina (Hail, Holy Queen)',
    season: 'Ordinary Time (Trinity Sunday to First Sunday of Advent)',
    latinText:
      'Salve, Regina, Mater misericordiae, vita, dulcedo, et spes nostra, salve. Ad te clamamus exsules filii Hevae, ad te suspiramus gementes et flentes in hac lacrimarum valle. Eia, ergo, advocata nostra, illos tuos misericordes oculos ad nos converte; et Iesum, benedictum fructum ventris tui, nobis post hoc exsilium ostende. O clemens, o pia, o dulcis Virgo Maria.',
    englishText:
      'Hail, Holy Queen, Mother of Mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us; and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.',
    spiritualMeaning: 'The classic prayer acknowledging Mary as Queen Mother and loving intercessor who leads her pilgrim children home to Jesus.',
  },
  {
    id: 'alma-redemptoris',
    name: 'Alma Redemptoris Mater (Loving Mother of the Redeemer)',
    season: 'Advent & Christmastide (First Sunday of Advent to Candlemas / Feb 2)',
    latinText:
      'Alma Redemptoris Mater, quae pervia caeli porta manes, et stella maris, succurre cadenti, surgere qui curat, populo: tu quae genuisti, natura mirante, tuum sanctum Genitorem, Virgo prius ac posterius, Gabrielis ab ore sumens illud Ave, peccatorum miserere.',
    englishText:
      'Loving Mother of the Redeemer, gate of heaven, star of the sea, assist your people who have fallen yet strive to rise again. To the wonderment of nature you bore your Creator, yet remained a virgin after as before. You who heard Gabriel’s joyful greeting, have mercy on us sinners.',
    spiritualMeaning: 'Celebrates the Incarnation of Christ and Mary’s maiden motherhood during the Advent expectation and Christmas joy.',
  },
  {
    id: 'ave-regina-caelorum',
    name: 'Ave Regina Caelorum (Hail, Queen of Heaven)',
    season: 'Lent & Purification (Candlemas / Feb 2 to Wednesday of Holy Week)',
    latinText:
      'Ave, Regina Caelorum, Ave, Domina Angelorum: Salve, radix, salve, porta, ex qua mundo lux est orta: Gaude, Virgo gloriosa, super omnes speciosa, vale, o valde decora, et pro nobis Christum exora.',
    englishText:
      'Hail, O Queen of Heaven enthroned. Hail, by angels mistress owned. Root of Jesse, Gate of Morn, whence the world’s true light was born: Glorious Virgin, joy to thee, loveliest whom in heaven they see; fairest thou, where all are fair, plead with Christ our sins to spare.',
    spiritualMeaning: 'Venerates Mary as the Queen of Angels and the Gate from which the true Light of the World entered our darkness.',
  },
  {
    id: 'regina-caeli',
    name: 'Regina Caeli (Queen of Heaven, Rejoice!)',
    season: 'Eastertide (Easter Sunday to Pentecost Sunday)',
    latinText:
      'Regina caeli, laetare, alleluia; quia quem meruisti portare, alleluia; resurrexit, sicut dixit, alleluia; ora pro nobis Deum, alleluia. Gaude et laetare, Virgo Maria, alleluia, quia surrexit Dominus vere, alleluia.',
    englishText:
      'Queen of Heaven, rejoice, alleluia; for He whom you did merit to bear, alleluia; has risen as He said, alleluia; pray for us to God, alleluia. Rejoice and be glad, O Virgin Mary, alleluia, for the Lord is truly risen, alleluia!',
    spiritualMeaning: 'Filled with Easter jubilant Alleluias, congratulating Our Lady upon the glorious Resurrection of her divine Son.',
  },
];

export const FOUR_WEEK_PSALTER_EXPLANATION = {
  title: 'The 4-Week Psalter Cycle',
  description:
    'Before the reforms of the Second Vatican Council, the 150 Psalms of King David were recited in their entirety within a single week (often burdening priests with hours of rapid recitation). Pope St. Paul VI in the Apostolic Constitution Laudis Canticum (1971) distributed the 150 Psalms over a peaceful four-week cycle. This allows every psalm to be prayed with deep meditation, spiritual understanding, and reverence.',
  structureRules: [
    'Week I, II, III, and IV rotate continuously throughout Ordinary Time, Lent, and Advent.',
    'Sunday Lauds always features Psalms of joyful praise and resurrection.',
    'Friday offices focus on repentance, Christ’s Passion, and the penitential psalms.',
    'Old Testament canticles are prayed every morning; New Testament canticles every evening.',
    'The 3 Gospel Canticles (Benedictus, Magnificat, Nunc Dimittis) are prayed every single day without fail.',
  ],
};

export const BREVIARY_FAQS = [
  {
    question: 'Can lay people pray the Liturgy of the Hours, or is it only for priests and religious?',
    answer:
      'Absolutely! The Second Vatican Council explicitly taught in Sacrosanctum Concilium (#100): "The laity, too, are encouraged to recite the divine office, either with the priests, or among themselves, or even individually." The Liturgy of the Hours is not a private devotion; it is the official liturgical prayer of the entire Mystical Body of Christ. When a lay person or student prays it, they pray in the name of the universal Church.',
  },
  {
    question: 'How is the Liturgy of the Hours different from Holy Mass?',
    answer:
      'The Mass is the Eucharistic sacrifice of Calvary renewed on the altar, the source and summit of the Christian life. The Liturgy of the Hours extends the sanctifying grace, praise, and thanksgiving of the Mass into every hour of the clock, fulfilling St. Paul’s instruction to "pray without ceasing" (1 Thess 5:17).',
  },
  {
    question: 'What books are used to pray the Divine Office?',
    answer:
      'Priests and consecrated religious traditionally use the complete 4-Volume Liturgy of the Hours. Families, teachers, and beginners typically start with "Christian Prayer" (a 1-volume edition containing Lauds, Vespers, and Compline) or "Shorter Christian Prayer" (a pocket-sized edition containing the 4-week psalter and Night Prayer). Today, digital breviaries (such as Universalis and iBreviary) allow Catholics worldwide to pray the proper texts anywhere on their phone or tablet.',
  },
  {
    question: 'Why do we make the Sign of the Cross during the Benedictus, Magnificat, and Nunc Dimittis?',
    answer:
      'Because these three canticles are taken directly from the Holy Gospel (the Gospel of St. Luke). Just as we stand and sign ourselves at the proclamation of the Gospel at Holy Mass, we reverently make the Sign of the Cross at the first words of each Gospel Canticle to honor Christ speaking in His Gospel.',
  },
];

/**
 * Returns the currently active canonical hour based on local system clock.
 */
export function getCurrentCanonicalHour(date = new Date()): CanonicalHour {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // 00:00 - 05:59 -> Matins (Office of Readings)
  if (totalMinutes < 6 * 60) return CANONICAL_HOURS[0];
  // 06:00 - 08:59 -> Lauds (Morning Prayer)
  if (totalMinutes < 9 * 60) return CANONICAL_HOURS[1];
  // 09:00 - 11:29 -> Terce (Mid-Morning)
  if (totalMinutes < 11 * 60 + 30) return CANONICAL_HOURS[2];
  // 11:30 - 13:59 -> Sext (Midday)
  if (totalMinutes < 14 * 60) return CANONICAL_HOURS[3];
  // 14:00 - 16:59 -> None (Mid-Afternoon)
  if (totalMinutes < 17 * 60) return CANONICAL_HOURS[4];
  // 17:00 - 20:29 -> Vespers (Evening Prayer)
  if (totalMinutes < 20 * 60 + 30) return CANONICAL_HOURS[5];
  // 20:30 - 23:59 -> Compline (Night Prayer)
  return CANONICAL_HOURS[6];
}
