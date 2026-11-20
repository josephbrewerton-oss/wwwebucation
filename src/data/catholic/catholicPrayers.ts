// src/data/catholic/catholicPrayers.ts
// St Joseph's Catholic Life & Faith Sanctuary
// Foundational Prayers for Pupils & First Holy Communion Preparation

export interface CatholicPrayer {
  id: string;
  title: string;
  occasion: string;
  text: string;
  missingWords: string[];
  coreFirstCommunion?: boolean;
}

export interface MassDialogueItem {
  id: string;
  moment: string;
  priestSays: string;
  correctReply: string;
  distractors: string[];
  tip: string;
}

export const CATHOLIC_PRAYERS: CatholicPrayer[] = [
  {
    id: 'sign-of-the-cross',
    title: 'The Sign of the Cross',
    occasion: 'Beginning and end of every prayer and Mass',
    text: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
    missingWords: ['Father', 'Son', 'Holy', 'Spirit', 'Amen'],
    coreFirstCommunion: true
  },
  {
    id: 'our-father',
    title: 'The Our Father',
    occasion: 'The prayer Jesus taught us — prayed together before Communion',
    text: 'Our Father, who art in heaven, hallowed be thy name; thy kingdom come, thy will be done on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.',
    missingWords: ['heaven', 'kingdom', 'bread', 'forgive', 'evil'],
    coreFirstCommunion: true
  },
  {
    id: 'hail-mary',
    title: 'The Hail Mary',
    occasion: 'Asking Our Lady to pray for us every day',
    text: 'Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
    missingWords: ['grace', 'blessed', 'Jesus', 'Mother', 'sinners'],
    coreFirstCommunion: true
  },
  {
    id: 'glory-be',
    title: 'The Glory Be',
    occasion: 'Praising the Holy Trinity — Father, Son, and Holy Spirit',
    text: 'Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.',
    missingWords: ['Glory', 'Father', 'Son', 'beginning', 'end'],
    coreFirstCommunion: true
  },
  {
    id: 'act-of-contrition',
    title: 'The Act of Contrition',
    occasion: 'During First Reconciliation / Before Holy Communion',
    text: 'O my God, I thank you for loving me. I am sorry for all my sins, for not loving others and not loving you. Help me to live like Jesus and not sin again. Amen.',
    missingWords: ['loving', 'sorry', 'sins', 'Jesus', 'sin'],
    coreFirstCommunion: true
  },
  {
    id: 'centurion-prayer',
    title: 'The Centurion’s Prayer of Humility',
    occasion: 'Right before receiving Holy Communion at every Mass',
    text: 'Lord, I am not worthy that you should enter under my roof, but only say the word and my soul shall be healed.',
    missingWords: ['worthy', 'roof', 'word', 'soul', 'healed'],
    coreFirstCommunion: true
  },
  {
    id: 'confiteor',
    title: 'The Confiteor (I Confess)',
    occasion: 'Penitential Rite at the start of Mass',
    text: 'I confess to almighty God and to you, my brothers and sisters, that I have greatly sinned, in my thoughts and in my words, in what I have done and in what I have failed to do, through my fault, through my fault, through my most grievous fault.',
    missingWords: ['confess', 'sinned', 'thoughts', 'words', 'fault']
  },
  {
    id: 'anima-christi',
    title: 'Thanksgiving Prayer (A Child’s Anima Christi)',
    occasion: 'Quiet reflection after receiving Holy Communion',
    text: 'Soul of Christ, make me holy. Body of Christ, save me. Blood of Christ, fill my heart with love. Water from the side of Christ, wash me clean. Passion of Christ, give me strength. O good Jesus, hear my prayer. Keep me close to you always, and never let me be separated from you. Amen.',
    missingWords: ['Soul', 'Body', 'love', 'Jesus', 'separated']
  },
  {
    id: 'guardian-angel',
    title: 'Prayer to My Guardian Angel',
    occasion: 'Morning and Evening Daily Protection',
    text: 'Angel of God, my guardian dear, to whom God’s love commits me here, ever this day be at my side, to light and guard, to rule and guide. Amen.',
    missingWords: ['Angel', 'love', 'side', 'guard', 'guide']
  }
];

export const MASS_DIALOGUE_RESPONSES: MassDialogueItem[] = [
  {
    id: 'greeting',
    moment: 'Introductory Rites (Greeting)',
    priestSays: 'The Lord be with you.',
    correctReply: 'And with your spirit.',
    distractors: ['Good morning, Father.', 'Thanks be to God.'],
    tip: 'We say this four times during Mass to acknowledge Christ acting through the priest.'
  },
  {
    id: 'gospel-announce',
    moment: 'Before the Gospel Reading',
    priestSays: 'A reading from the holy Gospel according to Matthew (or Mark, Luke, John).',
    correctReply: 'Glory to you, O Lord.',
    distractors: ['Praise to you, Lord Jesus Christ.', 'Lord, hear our prayer.'],
    tip: 'Trace three small crosses with your thumb: on your forehead, lips, and heart.'
  },
  {
    id: 'gospel-end',
    moment: 'After the Gospel Reading',
    priestSays: 'The Gospel of the Lord.',
    correctReply: 'Praise to you, Lord Jesus Christ.',
    distractors: ['Thanks be to God.', 'Glory to you, O Lord.'],
    tip: 'For the First and Second Readings we say "Thanks be to God", and for the Gospel we praise Jesus directly.'
  },
  {
    id: 'lift-hearts',
    moment: 'Start of the Eucharistic Prayer',
    priestSays: 'Lift up your hearts.',
    correctReply: 'We lift them up to the Lord.',
    distractors: ['It is right and just.', 'And with your spirit.'],
    tip: 'This invites our whole heart to turn toward heaven as the altar becomes Calvary and the Last Supper.'
  },
  {
    id: 'behold-lamb',
    moment: 'Invitation to Holy Communion',
    priestSays: 'Behold the Lamb of God, behold him who takes away the sins of the world. Blessed are those called to the supper of the Lamb.',
    correctReply: 'Lord, I am not worthy that you should enter under my roof, but only say the word and my soul shall be healed.',
    distractors: ['Glory to God in the highest.', 'Go in peace, glorifying the Lord by your life.'],
    tip: 'These humble words come from the Roman Centurion in the Gospel (Matthew 8:8).'
  },
  {
    id: 'body-of-christ',
    moment: 'Receiving Holy Communion',
    priestSays: 'The Body of Christ.',
    correctReply: 'Amen!',
    distractors: ['Thank you!', 'And with your spirit.'],
    tip: 'Bow your head first, then answer "Amen!" clearly — it means "Yes, I truly believe this is Jesus!"'
  }
];
