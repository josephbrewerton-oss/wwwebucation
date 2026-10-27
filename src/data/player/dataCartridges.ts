// src/data/player/dataCartridges.ts
/**
 * St. Joseph's Canonical Decentralized Data Cartridges
 * 
 * Modular question banks and diagnostic curriculum decks for:
 * 1. KS2 Science: States of Matter & Particle Theory
 * 2. KS2 Mathematics: Fractions, Decimals & Equivalence
 * 3. KS1 Science: Seasonal Changes & Earth Cycles
 * 4. KS2 Catholic RE: The Seven Sacraments & Real Presence
 * 5. KS2 Computing: Algorithms, Sequencing & Computational Logic
 * 
 * Invariants:
 * - Decouples question banks from hardcoded bundle memory heaps into modular cartridges.
 * - Sub-1ms retrieval, zero cloud LLM latency, 100% curriculum fidelity.
 * - S-Expression round-trip serializability (:cartridge :type :data ...).
 */

import { serializeDataCartridgeToAst, type DataCartridgePayload } from "../../utils/astQuestionExtractor";


export interface BuiltinDataCartridgeDefinition {
  id: string;
  title: string;
  stage: string;
  subject: string;
  oakId: string;
  oakUnit: string;
  category: string;
  icon: string;
  desc: string;
  dataPayload: DataCartridgePayload;
  svgMarkup: string;
  astSource: string;
}

function createDataCartridgeSvg(title: string, stage: string, subject: string, count: number, icon: string): string {
  return `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="data-bg-${count}" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090d16" />
    </radialGradient>
    <linearGradient id="data-accent-${count}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>
  <rect width="800" height="480" fill="url(#data-bg-${count})" rx="16" />
  <rect x="40" y="40" width="720" height="400" rx="12" fill="#0f172a" fill-opacity="0.85" stroke="#0284c7" stroke-width="2" stroke-dasharray="6,4" />
  <circle cx="400" cy="140" r="50" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="3" />
  <text x="400" y="156" font-size="42" text-anchor="middle">${icon}</text>
  <text x="400" y="235" fill="#f8fafc" font-size="22" font-weight="900" text-anchor="middle">${title}</text>
  <text x="400" y="270" fill="#38bdf8" font-size="13" font-weight="800" text-anchor="middle" letter-spacing="2">${stage.toUpperCase()} • ${subject.toUpperCase()}</text>
  <rect x="260" y="300" width="280" height="38" rx="19" fill="url(#data-accent-${count})" />
  <text x="400" y="324" fill="#ffffff" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="1">📊 ${count} DIAGNOSTIC QUESTIONS</text>
  <text x="400" y="375" fill="#94a3b8" font-size="12" font-weight="600" text-anchor="middle">⚡ Zero-Latency Modular Data Deck • Mounts Instantly in Practice Lab</text>
</svg>`;
}

// 1. KS2 Science: States of Matter
const STATES_OF_MATTER_PAYLOAD: DataCartridgePayload = {
  stage: 'Key Stage 2',
  subject: 'Science',
  unit: 'States of Matter',
  axiom: 'Matter consists of particles in continuous motion; thermal energy transfers alter physical state without changing chemical identity.',
  trap: 'Believing that gases have zero mass, or confusing boiling with smoke.',
  socraticPivot: 'What happens to the spacing and speed of particles when thermal energy is transferred to a solid?',
  hook: 'Why does an ice lolly melt in the summer sun, but puddle water disappears without boiling?',
  guidedStep: 'Trace particle kinetic velocity and intermolecular bonding across solid, liquid, and gas phases.',
  questions: [
    {
      id: 'som-1',
      prompt: 'Why does liquid water take the shape of its container, whereas ice retains a rigid fixed shape?',
      options: [
        'Water particles can slide past each other, while ice particles are fixed in a vibrating lattice',
        'Ice particles are completely motionless with zero kinetic energy',
        'Water molecules are physically smaller and lighter than ice molecules',
        'Ice particles are held together by gravitational pull rather than chemical bonds'
      ],
      answer: 0,
      hint: 'Think about whether the particles are locked in place or free to move around one another.',
      explanation: 'In a solid (ice), particles vibrate in fixed positions within a rigid lattice. In a liquid (water), particles have enough kinetic energy to slide past each other while remaining in contact.',
      tier: 'application',
      misconceptions: [
        'Correct! Fluidity emerges from particles being able to slide past one another.',
        'Misconception: Solid particles continuously vibrate at all temperatures above absolute zero (-273.15°C).',
        'Misconception: Ice and liquid water consist of identical H2O molecules with the same mass.',
        'Misconception: Intermolecular forces, not gravity, hold microscopic particles together.'
      ]
    },
    {
      id: 'som-2',
      prompt: 'When water boils at 100°C in an open kettle, what happens to the bubbles that rise to the surface?',
      options: [
        'They are gaseous water vapor (steam) produced by liquid water changing state',
        'They are trapped air bubbles that were dissolved in the cold water',
        'They are pure heat energy that has separated from the water',
        'They are pockets of hydrogen and oxygen gas broken into separate elements'
      ],
      answer: 0,
      hint: 'A physical phase change does not split the water molecule into separate chemicals.',
      explanation: 'Boiling is a bulk phase transition. The bubbles consist of gaseous water (steam) formed when liquid water turns into gas throughout the liquid.',
      tier: 'analysis',
      misconceptions: [
        'Correct! Steam is water in its gaseous state.',
        'Misconception: Dissolved air leaves during early heating; rapid continuous boiling bubbles are 100% water vapor.',
        'Misconception: Heat is energy transfer, not a physical substance that forms bubbles.',
        'Misconception: Boiling is a physical change, not chemical electrolysis.'
      ]
    },
    {
      id: 'som-3',
      prompt: 'If you place 100 grams of solid ice into a sealed, airtight container and allow it to melt completely into water, what will the total mass be?',
      options: [
        'Exactly 100 grams, because mass is conserved during physical phase changes',
        'Less than 100 grams, because liquid water is denser than ice',
        'More than 100 grams, because the container warms up and adds thermal weight',
        'Zero grams, because solids lose all mass when they transition to liquid'
      ],
      answer: 0,
      hint: 'Recall the Law of Conservation of Mass in a closed system.',
      explanation: 'In any closed system, the total mass remains constant during a physical change. The number of water particles remains identical.',
      tier: 'recall',
      misconceptions: [
        'Correct! The Law of Conservation of Mass applies across all phase changes.',
        'Misconception: Density affects volume, not mass. 100g of ice becomes 100g of liquid water.',
        'Misconception: Thermal energy does not add measurable mass in chemical or physical systems.',
        'Misconception: Matter never loses mass simply by changing state.'
      ]
    },
    {
      id: 'som-4',
      prompt: 'Which process describes water vapor in the atmosphere turning directly into tiny liquid water droplets that form clouds?',
      options: [
        'Condensation, where gas particles lose thermal energy and move closer together',
        'Evaporation, where liquid particles gain energy and escape into the air',
        'Precipitation, where water falls from clouds due to gravity',
        'Transpiration, where plants release water vapor through their stomata'
      ],
      answer: 0,
      hint: 'Think about the phase transition from gas back to liquid when cooling occurs.',
      explanation: 'Condensation occurs when water vapor cools down, loses kinetic energy, and transitions into tiny liquid droplets that suspend in air as clouds.',
      tier: 'recall',
      misconceptions: [
        'Correct! Cooling causes water vapor to condense into liquid cloud droplets.',
        'Misconception: Evaporation is the opposite phase change (liquid turning into gas).',
        'Misconception: Precipitation is the subsequent falling of rain, snow, or hail to the ground.',
        'Misconception: Transpiration is biological release of vapor from plant leaves.'
      ]
    },
    {
      id: 'som-5',
      prompt: 'Why does an inflated balloon expand when placed in a warm room and shrink when placed in a cold freezer?',
      options: [
        'Gas particles move faster and collide with greater force against the balloon walls when heated',
        'New gas particles are created inside the balloon by the ambient heat',
        'The rubber elastic naturally stretches more when cooled down',
        'Cold air destroys gas particles, reducing the internal particle count'
      ],
      answer: 0,
      hint: 'Think about kinetic particle theory and how temperature relates to particle speed and collisions.',
      explanation: 'According to kinetic gas theory, temperature is a measure of average particle kinetic energy. Heating causes gas particles to move faster and collide harder, exerting outward pressure.',
      tier: 'application',
      misconceptions: [
        'Correct! Increased particle kinetic velocity generates higher internal pressure, expanding the balloon.',
        'Misconception: Thermal energy cannot create matter or generate new particles in a sealed balloon.',
        'Misconception: Rubber contracts slightly when cooled, but the primary driver is internal gas pressure change.',
        'Misconception: Particles are never destroyed by cooling; they merely slow down.'
      ]
    },
    {
      id: 'som-6',
      prompt: 'What happens to the temperature of pure water while it is actively boiling at standard atmospheric pressure?',
      options: [
        'The temperature remains constant at 100°C until all liquid has vaporized',
        'The temperature rapidly rises to 150°C to push the steam out',
        'The temperature drops to 50°C because boiling releases all trapped heat',
        'The temperature fluctuates wildly between 0°C and 200°C every few seconds'
      ],
      answer: 0,
      hint: 'During a phase transition, additional thermal energy is used to break intermolecular bonds rather than increase kinetic speed.',
      explanation: 'During a phase change (latent heat of vaporization), added thermal energy breaks intermolecular forces rather than increasing particle temperature. The temperature stays constant at 100°C until boiling finishes.',
      tier: 'analysis',
      misconceptions: [
        'Correct! Latent heat of vaporization keeps the temperature flat at 100°C throughout the boiling transition.',
        'Misconception: Liquid water under normal pressure cannot exceed 100°C; extra heat accelerates vaporization.',
        'Misconception: Boiling requires continuous energy input and does not drop in temperature.',
        'Misconception: Pure substances have fixed, deterministic boiling points under steady pressure.'
      ]
    }
  ]
};

// 2. KS2 Mathematics: Fractions, Decimals & Percentages
const FRACTIONS_DECIMALS_PAYLOAD: DataCartridgePayload = {
  stage: 'Key Stage 2',
  subject: 'Mathematics',
  unit: 'Fractions and Decimals',
  axiom: 'A fraction represents equal parts of a whole; multiplying or dividing both numerator and denominator by the same non-zero number produces an equivalent fraction.',
  trap: 'Adding denominators together when adding fractions (e.g. 1/3 + 1/3 = 2/6), or thinking 0.45 is larger than 0.5 because 45 > 5.',
  socraticPivot: 'If you cut a pizza into 4 slices and eat 2, is that the same amount as cutting it into 8 slices and eating 4?',
  hook: 'Sharing chocolate bars fairly among friends without leaving crumb remainders.',
  guidedStep: 'Align denominators using lowest common multiples before attempting addition or subtraction.',
  questions: [
    {
      id: 'fd-1',
      prompt: 'Which fraction is equivalent to 3/4?',
      options: ['9/12', '6/10', '4/5', '7/8'],
      answer: 0,
      hint: 'Multiply both the numerator (3) and the denominator (4) by the same integer.',
      explanation: 'Multiplying top and bottom by 3 yields (3 × 3) / (4 × 3) = 9/12. Both express the exact same mathematical value (0.75).',
      tier: 'recall',
      misconceptions: [
        'Correct! Multiplying numerator and denominator by 3 gives 9/12.',
        'Misconception: 6/10 simplifies to 3/5, not 3/4.',
        'Misconception: Adding 1 to numerator and denominator changes the fraction value (3/4 = 0.75, 4/5 = 0.8).',
        'Misconception: Adding 4 to both numbers changes the proportion (7/8 = 0.875).'
      ]
    },
    {
      id: 'fd-2',
      prompt: 'What is 2/5 + 1/10 expressed in its simplest form?',
      options: ['1/2', '3/15', '3/10', '3/5'],
      answer: 0,
      hint: 'Convert 2/5 to tenths first so both fractions have a common denominator.',
      explanation: '2/5 = 4/10. Adding 4/10 + 1/10 gives 5/10, which simplifies by dividing top and bottom by 5 to equal 1/2.',
      tier: 'application',
      misconceptions: [
        'Correct! 4/10 + 1/10 = 5/10 = 1/2.',
        'Misconception: You must never add denominators together (2+1)/(5+10) = 3/15 is mathematically invalid.',
        'Misconception: 2/5 was forgotten or treated as 2/10 instead of converting to 4/10.',
        'Misconception: 1/10 was overlooked during common denominator alignment.'
      ]
    },
    {
      id: 'fd-3',
      prompt: 'Which decimal represents the exact value of the fraction 7/100?',
      options: ['0.07', '0.7', '0.70', '7.0'],
      answer: 0,
      hint: 'Seven hundredths occupies the second digit after the decimal point.',
      explanation: 'The first place after the decimal point is tenths; the second is hundredths. 7 hundredths is written as 0.07.',
      tier: 'recall',
      misconceptions: [
        'Correct! 7 hundredths is 0.07.',
        'Misconception: 0.7 is 7 tenths (7/10), which is 10 times larger than 7/100.',
        'Misconception: 0.70 is also 7 tenths (70/100 = 7/10).',
        'Misconception: 7.0 is seven whole units.'
      ]
    },
    {
      id: 'fd-4',
      prompt: 'Which comparison statement between 0.45 and 0.5 is correct?',
      options: [
        '0.5 is greater than 0.45 because 0.5 is equal to 0.50 (50 hundredths > 45 hundredths)',
        '0.45 is greater than 0.5 because 45 is a larger number than 5',
        'They are equal because 0.5 and 0.45 both round to 0',
        '0.45 is greater because it has more digits after the decimal point'
      ],
      answer: 0,
      hint: 'Pad 0.5 with a zero to make it 0.50, then compare the hundredths.',
      explanation: 'Looking at place value: 0.5 has 5 tenths (0.50 = 50 hundredths), whereas 0.45 only has 4 tenths and 5 hundredths (45 hundredths). Therefore, 0.5 > 0.45.',
      tier: 'analysis',
      misconceptions: [
        'Correct! Comparing digits by place value shows 5 tenths exceeds 4 tenths.',
        'Misconception: Whole-number thinking trap (believing longer decimals are automatically larger numbers).',
        'Misconception: Decimal values are continuous numbers, not rounded approximations.',
        'Misconception: Number of digits indicates precision, not magnitude.'
      ]
    },
    {
      id: 'fd-5',
      prompt: 'What is 3/8 of 48?',
      options: ['18', '16', '24', '6'],
      answer: 0,
      hint: 'Divide 48 by the denominator (8) to find 1/8, then multiply by the numerator (3).',
      explanation: 'First find one eighth: 48 ÷ 8 = 6. Then multiply by three: 6 × 3 = 18.',
      tier: 'application',
      misconceptions: [
        'Correct! (48 ÷ 8) × 3 = 6 × 3 = 18.',
        'Misconception: 48 ÷ 3 = 16, which calculates 1/3 of 48 instead of 3/8.',
        'Misconception: 24 is half of 48 (4/8).',
        'Misconception: 6 is only 1/8 of 48; you still need to multiply by 3.'
      ]
    },
    {
      id: 'fd-6',
      prompt: 'A shirt originally costing £40 is discounted by 25%. What is the sale price?',
      options: ['£30', '£35', '£10', '£25'],
      answer: 0,
      hint: '25% is equivalent to 1/4. Find 1/4 of £40, then subtract it from £40.',
      explanation: '25% = 1/4. One quarter of £40 is £10. Subtracting the discount (£40 - £10) gives the sale price of £30.',
      tier: 'application',
      misconceptions: [
        'Correct! £40 - (25% of £40) = £40 - £10 = £30.',
        'Misconception: Subtracting £5 rather than 25%.',
        'Misconception: £10 is the amount of the discount, not the final price.',
        'Misconception: Confusing the percentage value with the price amount.'
      ]
    }
  ]
};

// 3. KS1 Science: Seasonal Changes
const SEASONAL_CHANGES_PAYLOAD: DataCartridgePayload = {
  stage: 'Key Stage 1',
  subject: 'Science',
  unit: 'Seasonal Changes',
  axiom: 'Earth experiences four continuous seasons (Spring, Summer, Autumn, Winter) caused by its tilted orbit around the Sun, altering daylight hours and weather.',
  trap: 'Thinking summer is warmer because Earth is physically closer to the Sun, or that trees die in winter rather than entering dormancy.',
  socraticPivot: 'Why do we wear warm woollen coats and see the sun set earlier in winter than in summer?',
  hook: 'Noticing shadows growing long and leaves turning crimson gold in Autumn.',
  guidedStep: 'Observe changes in daylight duration, temperature, and tree foliage across the yearly cycle.',
  questions: [
    {
      id: 'sc-1',
      prompt: 'Which season has the longest daylight hours and the warmest average weather in the United Kingdom?',
      options: ['Summer', 'Winter', 'Spring', 'Autumn'],
      answer: 0,
      hint: 'Think about the season when schools have the long holiday and bedtime is still light outside.',
      explanation: 'In Summer, the UK is tilted towards the Sun, giving us long daylight hours and more direct sunlight, making it the warmest season.',
      tier: 'recall',
      misconceptions: [
        'Correct! Summer brings the longest days and highest temperatures.',
        'Misconception: Winter has the shortest daylight hours and coldest temperatures.',
        'Misconception: Spring is warming up, but daylight is still shorter than Summer.',
        'Misconception: Autumn daylight hours are decreasing.'
      ]
    },
    {
      id: 'sc-2',
      prompt: 'What happens to deciduous trees during Autumn in the UK?',
      options: [
        'Their leaves change colour to red, orange, and brown before falling off',
        'They grow bright new green leaves and colourful flower blossoms',
        'They produce juicy ripe strawberries on their branches',
        'Their tree trunks shrink into the ground until springtime'
      ],
      answer: 0,
      hint: 'Think about kicking piles of crunchy leaves in the park in October.',
      explanation: 'Deciduous trees lose their leaves in Autumn to conserve water and protect themselves against cold winter frost and storms.',
      tier: 'recall',
      misconceptions: [
        'Correct! Deciduous leaves change colour and fall in Autumn.',
        'Misconception: Growing new leaves and blossoms happens in Spring.',
        'Misconception: Strawberries are summer fruit that grow on small ground plants.',
        'Misconception: Tree trunks remain standing tall throughout the year.'
      ]
    },
    {
      id: 'sc-3',
      prompt: 'How do daylight hours change as we move from Autumn into Winter?',
      options: [
        'Daylight hours become shorter, so it gets dark earlier in the afternoon',
        'Daylight hours stay exactly 12 hours long every single day',
        'Daylight hours get longer, with bright sun shining until 9 o’clock at night',
        'The Sun stops rising completely for three whole months in England'
      ],
      answer: 0,
      hint: 'Think about when streetlights turn on when walking home from school in December.',
      explanation: 'As Winter approaches, the Northern Hemisphere tilts away from the Sun, making daylight hours steadily shorter and nights longer.',
      tier: 'application',
      misconceptions: [
        'Correct! Days get shorter and nights get longer in Winter.',
        'Misconception: Day length only balances at 12 hours during the Equinoxes in Spring and Autumn.',
        'Misconception: Long evenings until 9pm happen in mid-Summer (around the Summer Solstice).',
        'Misconception: The Sun still rises every day in the UK in winter, although day length is short.'
      ]
    },
    {
      id: 'sc-4',
      prompt: 'What type of tree keeps its green needles all through the cold winter months?',
      options: ['Evergreen tree', 'Deciduous tree', 'Dead tree', 'Desert palm tree'],
      answer: 0,
      hint: 'Think of a Christmas pine tree that stays green all year round.',
      explanation: 'Evergreen trees (like pines and firs) have tough, waxy needles that survive freezing weather and stay green all year round.',
      tier: 'recall',
      misconceptions: [
        'Correct! Evergreen trees stay green through all four seasons.',
        'Misconception: Deciduous trees shed their leaves completely in Autumn.',
        'Misconception: Dormant winter trees are alive, not dead.',
        'Misconception: Palm trees thrive in warm tropical climates.'
      ]
    },
    {
      id: 'sc-5',
      prompt: 'Which weather pattern is most typical of a British Winter?',
      options: [
        'Cold temperatures, frost, snow, and icy morning puddles',
        'Hot sunny heatwaves with beach weather every day',
        'Warm gentle breezes with cherry blossom petals falling',
        'Tropical monsoon thunderstorms with humid 35°C heat'
      ],
      answer: 0,
      hint: 'Think of scraping frost off car windscreens and wearing gloves.',
      explanation: 'Winter in the UK brings cold temperatures, freezing frost on grass, icy roads, and occasional snowfall due to low solar heating.',
      tier: 'recall',
      misconceptions: [
        'Correct! Cold temperatures, frost, and ice characterise British winter.',
        'Misconception: Heatwaves occur during Summer.',
        'Misconception: Cherry blossoms bloom in early Spring.',
        'Misconception: Tropical monsoons happen in equatorial climates.'
      ]
    }
  ]
};

// 4. KS2 Catholic RE: Sacraments & Real Presence
const CATHOLIC_SACRAMENTS_PAYLOAD: DataCartridgePayload = {
  stage: 'Key Stage 2',
  subject: 'Religious Education (Catholic)',
  unit: 'The Holy Eucharist & Sacraments',
  axiom: 'A Sacrament is an outward, visible sign of inward grace instituted by Christ to confer divine life upon the soul.',
  trap: 'Confusing the Holy Eucharist with a mere symbolic cracker, or believing sacraments are only human rituals without divine efficacy.',
  socraticPivot: 'Why did Jesus say at the Last Supper "This IS my Body", and how does the priest act in persona Christi at Mass?',
  hook: 'Stepping into church and seeing the red sanctuary lamp flickering beside the Tabernacle.',
  guidedStep: 'Identify the three categories of Sacraments: Christian Initiation, Healing, and Service of Communion.',
  questions: [
    {
      id: 're-1',
      prompt: 'What is the doctrinal Catholic definition of a Sacrament?',
      options: [
        'An outward and visible sign of invisible divine grace instituted by Jesus Christ',
        'A human tradition invented by medieval monks for church recordkeeping',
        'A graduation certificate awarded to students who pass Sunday school exams',
        'A personal opinion about morality that changes from year to year'
      ],
      answer: 0,
      hint: 'Recall the classic Catechism definition: an outward sign instituted by Christ to give grace.',
      explanation: 'The Catholic Church teaches that Sacraments are efficacious signs of grace, instituted by Christ and entrusted to the Church, by which divine life is dispensed to us (CCC 1131).',
      tier: 'recall',
      misconceptions: [
        'Correct! A Sacrament is an outward sign of inward grace instituted by Christ.',
        'Misconception: Sacraments were instituted by Jesus Christ Himself in the Gospels.',
        'Misconception: Sacraments are encounters with God’s grace, not academic tests.',
        'Misconception: Sacraments convey objective divine grace through the Holy Spirit.'
      ]
    },
    {
      id: 're-2',
      prompt: 'Which three sacraments make up the Sacraments of Christian Initiation, laying the foundation of Christian life?',
      options: [
        'Baptism, Confirmation, and the Holy Eucharist',
        'Reconciliation, Anointing of the Sick, and Holy Orders',
        'Matrimony, Holy Orders, and Confession',
        'Baptism, Funerals, and Sunday Collection'
      ],
      answer: 0,
      hint: 'Think of the three sacraments by which a believer is reborn, strengthened by the Holy Spirit, and nourished by Christ’s Body and Blood.',
      explanation: 'The Sacraments of Christian Initiation are Baptism (new birth in Christ), Confirmation (strengthening with the Holy Spirit), and the Holy Eucharist (nourishment with the Bread of Life).',
      tier: 'recall',
      misconceptions: [
        'Correct! Baptism, Confirmation, and Eucharist are the three Sacraments of Initiation.',
        'Misconception: Reconciliation and Anointing are the two Sacraments of Healing.',
        'Misconception: Holy Orders and Matrimony are the Sacraments at the Service of Communion.',
        'Misconception: Funerals are liturgical rites, not one of the Seven Sacraments.'
      ]
    },
    {
      id: 're-3',
      prompt: 'What does the Catholic Church teach occurs during the Eucharistic Consecration at Mass (Transubstantiation)?',
      options: [
        'The substance of bread and wine becomes truly and substantially the Body, Blood, Soul, and Divinity of Jesus Christ',
        'The bread and wine remain ordinary food but serve as a mental reminder or metaphor',
        'The bread turns into breadcrumbs with holy water sprinkled over it',
        'The priest performs a magic trick where the host disappears into thin air'
      ],
      answer: 0,
      hint: 'Consider the doctrine of Real Presence affirmed by the Council of Trent and the words of Christ.',
      explanation: 'Catholic doctrine teaches the Real Presence through Transubstantiation: while the physical appearances (accidents) of bread and wine remain, their underlying substance becomes truly the Body and Blood of Christ.',
      tier: 'analysis',
      misconceptions: [
        'Correct! Transubstantiation affirms the Real Presence of Christ in the Eucharist.',
        'Misconception: Catholic doctrine explicitly rejects the view that the Eucharist is merely a symbol or metaphor.',
        'Misconception: Holy water is a sacramental, not part of Eucharistic consecration.',
        'Misconception: The Eucharist is a divine mystery of faith, not an optical illusion.'
      ]
    },
    {
      id: 're-4',
      prompt: 'What essential physical matter and words (form) are required for a valid Christian Baptism?',
      options: [
        'Pouring of water while saying "I baptise you in the name of the Father, and of the Son, and of the Holy Spirit"',
        'Sprinkling salt while reciting the Ten Commandments in English',
        'Lighting seven candles while waving incense three times',
        'Writing the baby’s name in the parish registry without any prayer'
      ],
      answer: 0,
      hint: 'Jesus commanded in Matthew 28:19: "Baptise them in the name of the Father, and of the Son, and of the Holy Spirit."',
      explanation: 'The essential matter of Baptism is true water (by immersion or pouring), and the essential form is the Trinitarian formula commanded by Christ: "I baptise you in the name of the Father, and of the Son, and of the Holy Spirit."',
      tier: 'application',
      misconceptions: [
        'Correct! Water and the Trinitarian formula are strictly required for valid baptism.',
        'Misconception: Salt was historically an optional baptismal rite, but never the essential sacramental matter.',
        'Misconception: Candles and incense are liturgical symbols, not the essential matter of baptism.',
        'Misconception: Civil or parish registration cannot substitute for sacramental washing with water.'
      ]
    },
    {
      id: 're-5',
      prompt: 'Which sacrament gives spiritual healing, forgiveness of sins committed after baptism, and reconciliation with God and the Church?',
      options: [
        'The Sacrament of Reconciliation (Penance / Confession)',
        'The Sacrament of Confirmation',
        'The Sacrament of Holy Orders',
        'The Sacrament of Matrimony'
      ],
      answer: 0,
      hint: 'Jesus breathed on the apostles and said: "Receive the Holy Spirit; whose sins you forgive are forgiven them" (John 20:23).',
      explanation: 'In the Sacrament of Reconciliation, Christ’s mercy is mediated through the priest, granting absolution for sins to those who are contrite and confess.',
      tier: 'recall',
      misconceptions: [
        'Correct! Reconciliation provides forgiveness, healing, and peace of conscience.',
        'Misconception: Confirmation imparts the fullness of the Holy Spirit for Christian witness.',
        'Misconception: Holy Orders ordains deacons, priests, and bishops to sacred ministry.',
        'Misconception: Matrimony sanctifies the marital covenant between husband and wife.'
      ]
    },
    {
      id: 're-6',
      prompt: 'What is the purpose of the one-hour Eucharistic fast before receiving Holy Communion at Mass?',
      options: [
        'To prepare our minds, bodies, and hearts with reverence and spiritual hunger for the Blessed Sacrament',
        'To save food money for the parish heating fund',
        'Because eating food is sinful on Sundays',
        'To make sure people feel faint and tired during the homily'
      ],
      answer: 0,
      hint: 'Think about spiritual reverence and bodily discipline when preparing to receive Christ.',
      explanation: 'Canon law asks Catholics to abstain from food and drink (except water and medicine) for at least one hour before Communion as an act of bodily preparation and reverence for the Lord.',
      tier: 'analysis',
      misconceptions: [
        'Correct! The Eucharistic fast fosters spiritual reverence and physical readiness.',
        'Misconception: The fast is a spiritual discipline, not a financial measure.',
        'Misconception: Food is a good gift from God; fasting is a temporary exercise in spiritual preparation.',
        'Misconception: Fasting is intended to promote prayerful attentiveness, not fatigue.'
      ]
    }
  ]
};

// 5. KS2 Computing: Algorithms, Sequencing & Computational Logic
const COMPUTING_ALGORITHMS_PAYLOAD: DataCartridgePayload = {
  stage: 'Key Stage 2',
  subject: 'Computing',
  unit: 'Algorithms and Sequencing',
  axiom: 'An algorithm is an unambiguous, finite sequence of precise instructions designed to solve a problem or accomplish a specific task.',
  trap: 'Assuming a computer knows what you mean without explicit instructions, or thinking bugs are hardware defects rather than logic errors.',
  socraticPivot: 'If you tell a robot "make a jam sandwich", why will it fail unless you specify "pick up the knife with your right hand"?',
  hook: 'Programming a rover robot to navigate a volcanic obstacle course on Mars.',
  guidedStep: 'Decompose complex tasks into linear steps, condition checks (selection), and loops (iteration).',
  questions: [
    {
      id: 'comp-1',
      prompt: 'What is the computer science definition of an algorithm?',
      options: [
        'A precise, step-by-step set of instructions to solve a problem or complete a task',
        'The physical glass screen of a tablet computer',
        'A computer virus that steals passwords from websites',
        'A keyboard shortcut used to delete a whole paragraph'
      ],
      answer: 0,
      hint: 'Think of a recipe in cooking or a Lego construction manual.',
      explanation: 'An algorithm is an ordered, unambiguous set of rules or steps that takes an input and reliably produces the desired output.',
      tier: 'recall',
      misconceptions: [
        'Correct! An algorithm is a precise, ordered sequence of instructions.',
        'Misconception: A tablet screen is physical display hardware.',
        'Misconception: A virus is malicious software, not the definition of an algorithm.',
        'Misconception: A keyboard shortcut is an input event, not an algorithm.'
      ]
    },
    {
      id: 'comp-2',
      prompt: 'In computer programming, what does the process of "debugging" mean?',
      options: [
        'Finding and fixing errors or logical mistakes in program code',
        'Cleaning dust and crumbs out of a computer keyboard',
        'Downloading free games from an internet browser',
        'Unplugging the power cable while the computer is saving a file'
      ],
      answer: 0,
      hint: 'When a code script doesn’t behave as expected, programmers trace the error step-by-step.',
      explanation: 'Debugging is the systematic process of finding, tracing, and resolving bugs (errors or unintended behaviors) in computer software code.',
      tier: 'recall',
      misconceptions: [
        'Correct! Debugging is finding and resolving software code defects.',
        'Misconception: Physical cleaning is hardware maintenance, not code debugging.',
        'Misconception: Downloading software is file transfer.',
        'Misconception: Abruptly unplugging power can corrupt data files.'
      ]
    },
    {
      id: 'comp-3',
      prompt: 'Which programming construct allows a set of instructions to be repeated multiple times without writing them out again?',
      options: [
        'A loop (iteration)',
        'An IF statement (selection)',
        'A variable assignment',
        'A print statement'
      ],
      answer: 0,
      hint: 'Think of "repeat 4 times [move forward 10 steps, turn right 90 degrees]" to draw a square.',
      explanation: 'Iteration (loops, such as "repeat 10 times" or "while condition is true") executes a block of code repeatedly, keeping algorithms efficient and concise.',
      tier: 'application',
      misconceptions: [
        'Correct! Loops and iteration handle repeated code execution.',
        'Misconception: Selection (IF-THEN-ELSE) branches execution based on a condition rather than repeating.',
        'Misconception: Variables store values in memory.',
        'Misconception: Print statements output text to the screen.'
      ]
    },
    {
      id: 'comp-4',
      prompt: 'Why is the exact sequence (order) of commands critical in an algorithm?',
      options: [
        'Executing commands in the wrong order produces incorrect results or complete failure',
        'Computers shuffle commands randomly to make execution faster',
        'Order only matters in human languages, not in binary code',
        'Commands always execute from bottom to top automatically'
      ],
      answer: 0,
      hint: 'What happens if you put your shoes on before your socks?',
      explanation: 'Computers execute instructions sequentially. Changing the order (e.g. putting shoes on before socks, or moving forward before checking for a wall) breaks the logic.',
      tier: 'analysis',
      misconceptions: [
        'Correct! Sequential order is fundamental to deterministic algorithm execution.',
        'Misconception: Computers execute code strictly in program counter sequence, never randomly.',
        'Misconception: Order is even more rigorous in code than natural languages.',
        'Misconception: Standard code executes sequentially from top to bottom.'
      ]
    },
    {
      id: 'comp-5',
      prompt: 'A smart thermostat has the rule: "IF room temperature < 18°C, THEN turn heating ON; ELSE turn heating OFF." What computational concept is this?',
      options: [
        'Selection (conditional branching based on a test condition)',
        'An infinite loop',
        'A hardware memory crash',
        'Data encryption'
      ],
      answer: 0,
      hint: 'The program decides which path to follow depending on whether the temperature is below 18°C.',
      explanation: 'Selection allows a computer program to make decisions and execute different paths based on whether a condition evaluates to TRUE or FALSE.',
      tier: 'application',
      misconceptions: [
        'Correct! Selection uses IF/ELSE conditional logic to branch behavior.',
        'Misconception: An infinite loop repeats endlessly without a termination condition.',
        'Misconception: A memory crash occurs when resources are exhausted.',
        'Misconception: Encryption scrambles data for cybersecurity.'
      ]
    }
  ]
};

// 6. KS1 English: Phonics & Alien Words Screening
const PHONICS_SCREENING_PAYLOAD: DataCartridgePayload = {
  stage: 'Key Stage 1',
  subject: 'English',
  unit: 'Phonics & Simple Sentences',
  axiom: 'Spoken English words are constructed from individual sound units (phonemes) represented by letters or letter groups (graphemes) decoded through synthetic blending.',
  trap: 'Guessing whole words from initial letters or shapes rather than decoding grapheme-phoneme correspondences sequentially.',
  socraticPivot: 'Can you sound out each phoneme button individually before blending them into the whole word?',
  hook: 'Helping friendly alien monsters decode alien words before launching their spaceship.',
  guidedStep: 'Identify single letters, digraphs, and trigraphs, press the sound buttons, then blend left to right.',
  questions: [
    {
      id: 'ph-1',
      prompt: 'In the word "ship", how many distinct phonemes (speech sounds) can you hear when sounding it out?',
      options: ['3 phonemes: /sh/ - /i/ - /p/', '4 phonemes: /s/ - /h/ - /i/ - /p/', '2 phonemes: /shi/ - /p/', '1 phoneme: /ship/'],
      answer: 0,
      hint: 'The letters "s" and "h" combine into a consonant digraph making one single sound.',
      explanation: '"sh" is a digraph representing one single phoneme /sh/. Together with /i/ and /p/, "ship" contains exactly 3 phonemes: /sh/-/i/-/p/.',
      tier: 'recall',
      misconceptions: [
        'Correct! "sh" forms a single digraph phoneme, giving 3 sounds in total.',
        'Misconception: Counting individual letters rather than phonemes (sounds). "sh" is two letters but one sound.',
        'Misconception: Grouping /sh/ and /i/ together instead of separating the vowel.',
        'Misconception: Hearing the whole word without segmenting into individual phonemes.'
      ]
    },
    {
      id: 'ph-2',
      prompt: 'Which of the following is a pseudo-word ("alien word") used to test pure phonetic decoding without sight memory?',
      options: ['plog', 'frog', 'flag', 'plug'],
      answer: 0,
      hint: 'An alien word follows real English phonics rules but has no real meaning in the dictionary.',
      explanation: '"plog" is a valid decodable non-word (/p/-/l/-/o/-/g/). It tests whether a child can apply grapheme-phoneme correspondences without relying on memorised vocabulary.',
      tier: 'application',
      misconceptions: [
        'Correct! "plog" is a pseudo-word used in the Year 1 Phonics Screening Check.',
        'Misconception: "frog" is a real English noun for an amphibian.',
        'Misconception: "flag" is a real English noun.',
        'Misconception: "plug" is a real English word.'
      ]
    },
    {
      id: 'ph-3',
      prompt: 'Which vowel digraph correctly completes the word "r _ _ n" for water falling from clouds?',
      options: ['ai (rain)', 'ee (reen)', 'oa (roan)', 'oo (roon)'],
      answer: 0,
      hint: 'Think of the /eɪ/ sound found in snail, train, and paint.',
      explanation: 'The vowel sound /eɪ/ in the middle of words is commonly spelled with the digraph "ai", spelling "rain".',
      tier: 'recall',
      misconceptions: [
        'Correct! "ai" produces the long /eɪ/ vowel sound in "rain".',
        'Misconception: "ee" produces the long /iː/ vowel sound (as in tree).',
        'Misconception: "oa" produces the /oʊ/ sound (as in boat).',
        'Misconception: "oo" produces /uː/ or /ʊ/ (as in moon or book).'
      ]
    },
    {
      id: 'ph-4',
      prompt: 'What type of grapheme is "igh" in the word "night"?',
      options: ['A trigraph (three letters making one sound)', 'A split digraph', 'A consonant cluster', 'A silent letter'],
      answer: 0,
      hint: 'Count how many letters work together to create the single /aɪ/ vowel sound.',
      explanation: 'A trigraph is a group of three letters that represent a single phoneme. In "night", the letters i-g-h represent the single vowel phoneme /aɪ/.',
      tier: 'recall',
      misconceptions: [
        'Correct! "igh" is a trigraph because three letters produce one vowel sound.',
        'Misconception: A split digraph has a consonant separating the vowels (e.g. "a-e" in cake).',
        'Misconception: "igh" contains vowels and consonants forming a vowel phoneme, not a consonant cluster.',
        'Misconception: The letters "gh" are part of the trigraph, not an isolated silent artifact.'
      ]
    },
    {
      id: 'ph-5',
      prompt: 'When blending the split digraph in the word "b-i-k-e", which sound does the "i-e" make?',
      options: ['Long /aɪ/ sound (like in "pie" or "time")', 'Short /ɪ/ sound (like in "pin" or "sit")', 'Long /iː/ sound (like in "bee")', 'Short /e/ sound (like in "bed")'],
      answer: 0,
      hint: 'The magic "e" at the end tells the preceding vowel to say its name.',
      explanation: 'The split digraph "i-e" modifies the vowel so it produces the long vowel sound /aɪ/, making /b/-/aɪ/-/k/ ("bike").',
      tier: 'application',
      misconceptions: [
        'Correct! The split digraph "i-e" produces the long /aɪ/ phoneme.',
        'Misconception: Without the final "e", the word would be "bik" with a short /ɪ/ sound.',
        'Misconception: /iː/ is spelled with "ee" or "ea".',
        'Misconception: /e/ is spelled with "e" as in "bed".'
      ]
    }
  ]
};

// 7. KS2 Science: Electric Circuits & Conductors
const ELECTRIC_CIRCUITS_PAYLOAD: DataCartridgePayload = {
  stage: 'Key Stage 2',
  subject: 'Science',
  unit: 'Circuits and Conductors',
  axiom: 'An electric current requires a continuous unbroken loop of conducting material driven by a voltage source (cell) for electrons to flow.',
  trap: 'Believing electricity "gets used up" by a component, or confusing an open switch with a working connection.',
  socraticPivot: 'If you remove one bulb from a simple series circuit, why do all the other bulbs immediately go dark?',
  hook: 'Why does flipping a single plastic knife switch instantly illuminate every bulb on the runway?',
  guidedStep: 'Trace the unbroken conductive pathway from the positive cell terminal, through switches and loads, to the negative terminal.',
  questions: [
    {
      id: 'circ-1',
      prompt: 'Why must an electrical circuit form a complete, unbroken loop for a lightbulb to shine?',
      options: [
        'Electric current requires a continuous closed pathway for electrical charge to flow from one terminal of the cell to the other',
        'Bulbs need air pressure inside the wire to push the light out',
        'Electricity gathers in open gaps and evaporates into the air',
        'Wires only work when tied in circular knots'
      ],
      answer: 0,
      hint: 'Consider what happens to the flow of electrons when there is a break or gap in the wire.',
      explanation: 'Electric current is the continuous drift of charged particles (electrons). If there is any break in the loop (an open switch or loose wire), charge cannot circulate and current drops to zero.',
      tier: 'recall',
      misconceptions: [
        'Correct! An unbroken closed circuit is required for charge to circulate.',
        'Misconception: Electricity is moving electrical charge, not pneumatic air pressure.',
        'Misconception: Charge does not evaporate; an open circuit simply prevents current from starting.',
        'Misconception: Physical geometry does not require knots; it requires conductive continuity.'
      ]
    },
    {
      id: 'circ-2',
      prompt: 'Which of the following materials is an electrical conductor that will allow current to flow when inserted into a circuit gap?',
      options: ['A copper coin', 'A wooden ruler', 'A plastic drinking straw', 'A glass marble'],
      answer: 0,
      hint: 'Metals generally contain free, delocalised electrons that allow electrical charge to move easily.',
      explanation: 'Metals such as copper, iron, and aluminium have free electrons that easily move, making them excellent electrical conductors. Wood, plastic, and glass are electrical insulators.',
      tier: 'application',
      misconceptions: [
        'Correct! Copper is a metal with free electrons, making it a good conductor.',
        'Misconception: Wood is an electrical insulator because its electrons are tightly bound in chemical bonds.',
        'Misconception: Plastic is an insulator used to coat cables safely.',
        'Misconception: Glass is an electrical insulator.'
      ]
    },
    {
      id: 'circ-3',
      prompt: 'What happens to the brightness of two identical bulbs in a series circuit when you add a second identical 1.5V cell?',
      options: [
        'Both bulbs glow noticeably brighter because the total voltage and current increase',
        'Both bulbs become much dimmer because the second cell absorbs electrical energy',
        'The first bulb glows brighter but the second bulb turns completely off',
        'Nothing changes because bulb brightness is fixed at the factory'
      ],
      answer: 0,
      hint: 'Think about how adding more electromotive force (volts) pushes more current through the resistive filaments.',
      explanation: 'Connecting cells in series adds their voltages together (1.5V + 1.5V = 3.0V). The higher voltage pushes greater current through the bulbs, increasing power and brightness.',
      tier: 'analysis',
      misconceptions: [
        'Correct! Doubling voltage in a simple series circuit increases current and filament brightness.',
        'Misconception: Cells supply electrical energy; they do not absorb it.',
        'Misconception: In a series circuit, identical current flows through every component equally.',
        'Misconception: Brightness is governed by voltage and current, not fixed factory settings.'
      ]
    },
    {
      id: 'circ-4',
      prompt: 'In standard electrical circuit diagrams, what does a straight line with a break where a slanted line is lifted up represent?',
      options: ['An open switch', 'A burnt-out battery', 'A solar panel', 'A buzzer'],
      answer: 0,
      hint: 'When a bridge is lifted, cars cannot cross. When a switch is open, current cannot cross.',
      explanation: 'A slanted line lifted away from a contact represents an open switch. When open, it creates a physical gap that halts the current flow.',
      tier: 'recall',
      misconceptions: [
        'Correct! The lifted line symbolises an open switch breaking the circuit.',
        'Misconception: A battery is represented by parallel long and short lines.',
        'Misconception: A buzzer has a semi-circular umbrella symbol.',
        'Misconception: A solar panel or cell has distinct plate lines.'
      ]
    },
    {
      id: 'circ-5',
      prompt: 'Why are household electrical appliance cords coated with flexible plastic or rubber?',
      options: [
        'Plastic and rubber are electrical insulators that prevent electric shocks by blocking current leakage',
        'Plastic makes the wires heavier so they don\'t blow away in the wind',
        'Plastic speeds up the electricity flowing inside the copper wire',
        'Plastic cools down the room like a tiny refrigerator'
      ],
      answer: 0,
      hint: 'Think about electrical safety and touching live cables.',
      explanation: 'Plastic and rubber have extremely high electrical resistance, acting as insulators. They prevent electrical current from flowing into our hands, protecting against hazardous electric shocks.',
      tier: 'application',
      misconceptions: [
        'Correct! Electrical insulators prevent hazardous shocks and short-circuits.',
        'Misconception: Insulation is for electrical safety, not structural ballast.',
        'Misconception: Current speed is determined by material resistivity and electric fields, not outer plastic.',
        'Misconception: Plastic does not act as a refrigeration unit.'
      ]
    }
  ]
};

// 8. KS2 Mathematics: Angles, Triangles & Geometry
const ANGLES_TRIANGLES_PAYLOAD: DataCartridgePayload = {
  stage: 'Key Stage 2',
  subject: 'Mathematics',
  unit: 'Angles and Triangles',
  axiom: 'The interior angles of any planar triangle always sum to exactly 180 degrees (a straight line angle).',
  trap: 'Confusing obtuse angles (> 90°) with reflex angles (> 180°), or assuming longer triangle sides must contain larger total interior angles.',
  socraticPivot: 'If you tear the three corners off any paper triangle and line them up side-by-side, why do they always form a perfectly straight line?',
  hook: 'Roof truss carpenters and navigation compass bearings rely on fixed angle sums.',
  guidedStep: 'Identify right angles (90°), acute angles (< 90°), and obtuse angles (90°–180°), and subtract known angles from 180° to find missing angles.',
  questions: [
    {
      id: 'ang-1',
      prompt: 'What is the sum of the three interior angles inside ANY triangle on a flat plane?',
      options: ['Exactly 180°', 'Exactly 360°', 'Exactly 90°', 'It depends on whether the triangle is big or small'],
      answer: 0,
      hint: 'Tearing the three vertices of any triangle and putting them together creates a straight line.',
      explanation: 'In Euclidean geometry, the interior angles of every triangle always add up to exactly 180°, regardless of the size or shape of the triangle.',
      tier: 'recall',
      misconceptions: [
        'Correct! The interior angles of all planar triangles sum to 180°.',
        'Misconception: 360° is the angle sum of a four-sided quadrilateral (or a full turn).',
        'Misconception: 90° is a single right angle.',
        'Misconception: Angle sum is an invariant property of Euclidean triangles, independent of physical scale.'
      ]
    },
    {
      id: 'ang-2',
      prompt: 'A right-angled triangle has one angle measuring 90° and another measuring 35°. What is the measure of the third angle?',
      options: ['55°', '45°', '65°', '90°'],
      answer: 0,
      hint: 'Subtract the two known angles (90° and 35°) from the total triangle angle sum of 180°.',
      explanation: '180° - 90° - 35° = 55°. In any right triangle, the two non-right angles are complementary and always add to 90° (90° - 35° = 55°).',
      tier: 'application',
      misconceptions: [
        'Correct! 180° - (90° + 35°) = 55°.',
        'Misconception: 90° - 45° = 45° assumes both acute angles are equal (an isosceles right triangle).',
        'Misconception: Calculation error adding 10° too much.',
        'Misconception: A triangle cannot have two 90° interior angles on a flat plane (that would already total 180°).'
      ]
    },
    {
      id: 'ang-3',
      prompt: 'What classification is given to an angle that measures 135°?',
      options: ['An obtuse angle (between 90° and 180°)', 'An acute angle (less than 90°)', 'A right angle (exactly 90°)', 'A reflex angle (greater than 180°)'],
      answer: 0,
      hint: 'It is wider than an "L" shaped corner (90°) but smaller than a straight line (180°).',
      explanation: 'An obtuse angle is strictly greater than 90° and less than 180°. 135° falls squarely into this range.',
      tier: 'recall',
      misconceptions: [
        'Correct! 135° is between 90° and 180°, making it obtuse.',
        'Misconception: Acute angles are strictly less than 90°.',
        'Misconception: Right angles measure exactly 90°.',
        'Misconception: Reflex angles are strictly greater than 180° and less than 360°.'
      ]
    },
    {
      id: 'ang-4',
      prompt: 'An equilateral triangle has three sides of equal length. What is the size of each of its three interior angles?',
      options: ['60° each', '90° each', '45° each', '120° each'],
      answer: 0,
      hint: 'Because all three sides are equal, all three angles must be equal: divide 180° by 3.',
      explanation: 'An equilateral triangle has three congruent angles. Dividing 180° equally among the 3 angles gives 180° ÷ 3 = 60° for each angle.',
      tier: 'application',
      misconceptions: [
        'Correct! 180° ÷ 3 = 60° per angle.',
        'Misconception: 90° × 3 = 270°, which is impossible in a triangle.',
        'Misconception: 45° × 3 = 135°, which does not equal 180°.',
        'Misconception: 120° is the exterior angle of an equilateral triangle, not the interior angle.'
      ]
    },
    {
      id: 'ang-5',
      prompt: 'How many degrees are in a complete full turn (rotation)?',
      options: ['360°', '180°', '270°', '100°'],
      answer: 0,
      hint: 'A straight line is a half-turn (180°). Double that for a full turn.',
      explanation: 'A full circle rotation consists of 4 right angles or 2 straight lines, totalling exactly 360°.',
      tier: 'recall',
      misconceptions: [
        'Correct! A full circular turn measures 360°.',
        'Misconception: 180° is a half-turn (straight line).',
        'Misconception: 270° is a three-quarter turn.',
        'Misconception: Metric 100 is not used for angular degrees in standard geometry.'
      ]
    }
  ]
};

// 9. KS3 Science: Cell Biology & Microscopes
const CELL_BIOLOGY_PAYLOAD: DataCartridgePayload = {
  stage: 'Key Stage 3',
  subject: 'Science',
  unit: 'Cell Biology',
  axiom: 'Cells are the fundamental structural and functional units of all living organisms; eukaryotic plant and animal cells share organelles but plant cells possess unique rigid walls, chloroplasts, and permanent vacuoles.',
  trap: 'Confusing cell walls with cell membranes, or believing animal cells have chloroplasts.',
  socraticPivot: 'Why does a plant stem stand upright without a bony skeleton, whereas an animal cell will burst if placed in pure water?',
  hook: 'Viewing cheek cells under 400x magnification reveals tiny nucleus command centres.',
  guidedStep: 'Compare organelle structures: nucleus (DNA), mitochondria (aerobic respiration), ribosomes (protein synthesis), and chloroplasts (photosynthesis).',
  questions: [
    {
      id: 'cell-1',
      prompt: 'Which three structures are present in typical plant cells but absent in animal cells?',
      options: [
        'Cellulose cell wall, permanent large vacuole, and chloroplasts',
        'Nucleus, cytoplasm, and cell membrane',
        'Mitochondria, ribosomes, and endoplasmic reticulum',
        'Red blood cells, white blood cells, and platelets'
      ],
      answer: 0,
      hint: 'Think about what gives plants their green colour, rigid upright posture, and cell turgor.',
      explanation: 'Plant cells uniquely have a rigid cellulose cell wall for structural support, a large permanent sap vacuole for turgor, and chloroplasts containing chlorophyll for photosynthesis. Animal cells have none of these three.',
      tier: 'recall',
      misconceptions: [
        'Correct! Cell wall, chloroplasts, and permanent vacuole are unique to plant cells.',
        'Misconception: Nucleus, cytoplasm, and cell membrane are present in both plant and animal cells.',
        'Misconception: Mitochondria and ribosomes are universal eukaryotic organelles found in both.',
        'Misconception: Blood cells are specialized animal tissue cells.'
      ]
    },
    {
      id: 'cell-2',
      prompt: 'What is the primary function of the cell membrane in both plant and animal cells?',
      options: [
        'Controlling which substances enter and leave the cell (selective permeability)',
        'Storing the entire genetic code inside chromosomes',
        'Releasing energy through aerobic cellular respiration',
        'Producing glucose using light energy from the Sun'
      ],
      answer: 0,
      hint: 'The membrane acts like a security gate controlling traffic in and out of the cell.',
      explanation: 'The cell membrane is a partially permeable lipid bilayer that regulates the transport of nutrients, water, ions, and waste products into and out of the cell.',
      tier: 'recall',
      misconceptions: [
        'Correct! The cell membrane controls selective substance movement.',
        'Misconception: Storing genetic code is the function of the cell nucleus.',
        'Misconception: Releasing energy via aerobic respiration is the function of mitochondria.',
        'Misconception: Producing glucose via photosynthesis is the function of chloroplasts.'
      ]
    },
    {
      id: 'cell-3',
      prompt: 'Why are mitochondria often described as the "powerhouses" of eukaryotic cells?',
      options: [
        'They carry out aerobic respiration, transferring chemical energy from glucose into ATP',
        'They generate high-voltage electrical sparks to jump-start the cell',
        'They absorb direct sunlight to pump water out of the cell',
        'They digest toxic waste like miniature garbage disposal units'
      ],
      answer: 0,
      hint: 'Mitochondria combine glucose with oxygen to release usable chemical energy for cellular work.',
      explanation: 'Mitochondria are the site of aerobic cellular respiration, where glucose is oxidised to transfer energy into adenosine triphosphate (ATP), powering cellular functions.',
      tier: 'analysis',
      misconceptions: [
        'Correct! Mitochondria carry out aerobic respiration, supplying ATP energy.',
        'Misconception: Cellular respiration is chemical metabolism, not high-voltage electricity.',
        'Misconception: Sunlight absorption is performed by chloroplasts in plant cells.',
        'Misconception: Lysosomes perform digestive waste degradation.'
      ]
    },
    {
      id: 'cell-4',
      prompt: 'If a light microscope has a 10× eyepiece lens and a 40× objective lens, what is the total magnification of the specimen?',
      options: ['400×', '50×', '4×', '4,000×'],
      answer: 0,
      hint: 'Multiply the magnification of the eyepiece lens by the magnification of the objective lens.',
      explanation: 'Total magnification = Eyepiece magnification × Objective magnification. 10 × 40 = 400× magnification.',
      tier: 'application',
      misconceptions: [
        'Correct! 10 × 40 = 400× total magnification.',
        'Misconception: Adding 10 + 40 = 50 is a common mistake; optical lenses multiply magnification.',
        'Misconception: Dividing 40 ÷ 10 = 4 is incorrect.',
        'Misconception: 4,000× is an accidental extra zero.'
      ]
    }
  ]
};

// 10. KS2 Catholic RE: The Nicene Creed & Trinity
const NICENE_CREED_PAYLOAD: DataCartridgePayload = {
  stage: 'Key Stage 2',
  subject: 'Religious Education (Catholic)',
  unit: 'The Nicene Creed & Trinity',
  axiom: 'The central Christian mystery is the Most Holy Trinity: one God in three distinct Divine Persons (Father, Son, and Holy Spirit), co-equal, co-eternal, and of one substance (consubstantial).',
  trap: 'Modalism (believing God merely wears 3 different masks), or Tritheism (believing in 3 separate gods).',
  socraticPivot: 'Why does the Nicene Creed say Jesus is "consubstantial with the Father" (of the same divine essence)?',
  hook: 'Standing every Sunday at Mass to recite the ancient 1,700-year-old Creed formulated at the Council of Nicaea (AD 325).',
  guidedStep: 'Trace the four marks of the Church (One, Holy, Catholic, and Apostolic) and the Trinitarian confession of faith.',
  questions: [
    {
      id: 'creed-1',
      prompt: 'What does the Catholic dogma of the Holy Trinity profess?',
      options: [
        'There is one God in three co-equal Divine Persons: Father, Son, and Holy Spirit',
        'There are three separate gods who take turns ruling the universe',
        'God is one person who transforms into three different characters over time',
        'The Father created the Son as an angel, who then created the Holy Spirit'
      ],
      answer: 0,
      hint: 'We baptise in the singular "name" of the Father, and of the Son, and of the Holy Spirit.',
      explanation: 'The Catholic Church professes monotheism: one divine nature subsisting in three distinct persons—the Father, the Son, and the Holy Spirit—who are co-eternal and co-equal (CCC 253-255).',
      tier: 'recall',
      misconceptions: [
        'Correct! The Holy Trinity is One God in Three Divine Persons.',
        'Misconception: Polytheism / Tritheism contradicts Christian monotheism.',
        'Misconception: Modalism (Sabellianism) falsely claims God is one person wearing different masks.',
        'Misconception: Arianism falsely claimed the Son was a created being rather than God.'
      ]
    },
    {
      id: 'creed-2',
      prompt: 'In the Nicene Creed, what does the Greek theological term "consubstantial" (homoousios) mean regarding Jesus Christ and the Father?',
      options: [
        'Jesus is of the exact same divine substance and essence as God the Father',
        'Jesus was a very good human teacher who became God as a reward',
        'Jesus and the Father have completely opposite wills and desires',
        'Jesus is an illusion that merely appeared human'
      ],
      answer: 0,
      hint: 'The Council of Nicaea in AD 325 affirmed "God from God, Light from Light, true God from true God, consubstantial with the Father".',
      explanation: '"Consubstantial" (Latin: consubstantialis; Greek: homoousios) means of the same being or substance. Jesus is fully and truly God, possessing the identical divine nature as the Father.',
      tier: 'analysis',
      misconceptions: [
        'Correct! Consubstantial means sharing the identical divine essence with the Father.',
        'Misconception: Adoptionism falsely claimed Jesus was an ordinary man adopted by God.',
        'Misconception: The Trinity possesses one united divine will and nature.',
        'Misconception: Docetism falsely claimed Christ\'s humanity was merely an optical illusion.'
      ]
    },
    {
      id: 'creed-3',
      prompt: 'What are the four essential marks of the Church professed in the Nicene Creed?',
      options: [
        'One, Holy, Catholic, and Apostolic',
        'Rich, Powerful, Famous, and Ancient',
        'English, Latin, Greek, and Hebrew',
        'Baptised, Confirmed, Married, and Ordained'
      ],
      answer: 0,
      hint: '"I believe in one, holy, catholic and apostolic Church..."',
      explanation: 'The four marks of the Church are One (unity in Christ), Holy (sanctified by the Holy Spirit), Catholic (universal and complete across all nations), and Apostolic (founded on the apostles and their successors).',
      tier: 'recall',
      misconceptions: [
        'Correct! The four marks are One, Holy, Catholic, and Apostolic.',
        'Misconception: Material power and wealth are worldly qualities, not marks of the Church.',
        'Misconception: These are liturgical and historical languages, not marks of the Church.',
        'Misconception: These are sacraments, not marks of the Church.'
      ]
    }
  ]
};

// 11. KS2/KS3 Modern Foreign Languages: Spanish Foundations
const SPANISH_FOUNDATIONS_PAYLOAD: DataCartridgePayload = {
  stage: 'Key Stage 2',
  subject: 'Spanish',
  unit: 'Spanish Greetings & Introductions',
  axiom: 'In Spanish, noun gender (masculine/feminine) dictates article and adjective agreement, while verb inflection encodes subject person without requiring explicit pronouns.',
  trap: 'Assuming Spanish word order mirrors English literally, or forgetting agreement with feminine nouns ending in "-a".',
  socraticPivot: 'Why can you say "Tengo diez años" without using the word "yo" (I)?',
  hook: 'Greeting a pen-pal in Madrid with natural native fluency and correct formal/informal courtesy.',
  guidedStep: 'Select greetings based on time of day (días, tardes, noches), ask names with "¿Cómo te llamas?", and apply gendered adjectives.',
  questions: [
    {
      id: 'es-1',
      prompt: 'How do you say "Good afternoon" or "Good evening" (before dark) in Spanish?',
      options: ['Buenas tardes', 'Buenos días', 'Buenas noches', 'Hola amigo'],
      answer: 0,
      hint: '"Días" is masculine plural used in the morning, while "tardes" is feminine plural used in the afternoon.',
      explanation: '"Buenas tardes" is used from midday until nightfall. "Buenos días" is used in the morning, and "Buenas noches" is used at night.',
      tier: 'recall',
      misconceptions: [
        'Correct! "Buenas tardes" means Good afternoon / early evening.',
        'Misconception: "Buenos días" means Good morning.',
        'Misconception: "Buenas noches" means Good night / late evening.',
        'Misconception: "Hola amigo" means Hello friend.'
      ]
    },
    {
      id: 'es-2',
      prompt: 'When someone asks you "¿Cómo te llamas?" in Spanish, how do you correctly answer "My name is Carlos"?',
      options: ['Me llamo Carlos', 'Tengo Carlos', 'Soy llamo Carlos', 'Mi Carlos es'],
      answer: 0,
      hint: '"Me llamo" literally translates to "I call myself".',
      explanation: 'In Spanish, the reflexive verb phrase "Me llamo..." (literally "I call myself...") is the standard natural way to state your name.',
      tier: 'application',
      misconceptions: [
        'Correct! "Me llamo Carlos" is the natural Spanish idiom.',
        'Misconception: "Tengo" means "I have", used for age (e.g. Tengo 10 años).',
        'Misconception: "Soy llamo" incorrectly combines two verbs (I am I call).',
        'Misconception: "Mi Carlos es" is an incorrect literal English word-for-word word order.'
      ]
    },
    {
      id: 'es-3',
      prompt: 'In Spanish, why does the sentence "Vivo en Londres" NOT require the pronoun "Yo" (I) at the front?',
      options: [
        'The verb ending "-o" already indicates that the subject is first person singular ("I")',
        'Pronouns are forbidden by the Spanish Royal Academy',
        'Spanish only allows questions to have subject pronouns',
        '"Vivo" is an adjective that describes London'
      ],
      answer: 0,
      hint: 'Spanish is a "pro-drop" (null-subject) language where conjugated verb endings reveal who is performing the action.',
      explanation: 'Spanish is a pro-drop language: verb conjugation endings (such as "-o" in "vivo") clearly signal the subject ("I"), so subject pronouns like "yo" are omitted unless used for emphasis.',
      tier: 'analysis',
      misconceptions: [
        'Correct! The conjugated verb ending "-o" specifies the first-person subject.',
        'Misconception: Pronouns are permitted for emphasis or contrast, never forbidden.',
        'Misconception: Pronoun rules apply equally across statements and questions.',
        'Misconception: "Vivo" is a conjugated verb (from vivir, to live), not an adjective.'
      ]
    }
  ]
};

// Update canonical built-in data cartridges with expanded Oak curriculum decks
export const BUILTIN_DATA_CARTRIDGES: BuiltinDataCartridgeDefinition[] = [
  {
    id: 'oak-data-states-of-matter',
    title: 'States of Matter & Particle Theory (Data Deck)',
    stage: 'Key Stage 2',
    subject: 'Science',
    oakId: 'SCI-KS2-MAT-01',
    oakUnit: 'States of Matter',
    category: 'Science',
    icon: '🧊',
    desc: 'Decentralized Oak curriculum question deck for KS2 States of Matter: solid, liquid, gas, heating curves, and kinetic theory.',
    dataPayload: STATES_OF_MATTER_PAYLOAD,
    svgMarkup: createDataCartridgeSvg('States of Matter & Particle Theory', 'Key Stage 2', 'Science', 6, '🧊'),
    astSource: serializeDataCartridgeToAst(STATES_OF_MATTER_PAYLOAD, 'oak-data-states-of-matter', 'States of Matter & Particle Theory'),
  },
  {
    id: 'oak-data-fractions-decimals',
    title: 'Fractions, Decimals & Percentages (Data Deck)',
    stage: 'Key Stage 2',
    subject: 'Mathematics',
    oakId: 'MAT-KS2-FRAC-02',
    oakUnit: 'Fractions and Decimals',
    category: 'Mathematics',
    icon: '🍰',
    desc: 'Decentralized Oak curriculum question deck for KS2 Fractions & Decimals: equivalence, common denominators, and decimal conversions.',
    dataPayload: FRACTIONS_DECIMALS_PAYLOAD,
    svgMarkup: createDataCartridgeSvg('Fractions, Decimals & Percentages', 'Key Stage 2', 'Mathematics', 6, '🍰'),
    astSource: serializeDataCartridgeToAst(FRACTIONS_DECIMALS_PAYLOAD, 'oak-data-fractions-decimals', 'Fractions, Decimals & Percentages'),
  },
  {
    id: 'oak-data-seasonal-changes',
    title: 'Seasonal Changes & Earth Rhythms (Data Deck)',
    stage: 'Key Stage 1',
    subject: 'Science',
    oakId: 'SCI-KS1-SEAS-01',
    oakUnit: 'Seasonal Changes',
    category: 'Science',
    icon: '🍂',
    desc: 'Decentralized Oak curriculum question deck for KS1 Seasonal Changes: four seasons, daylight patterns, and plant adaptation.',
    dataPayload: SEASONAL_CHANGES_PAYLOAD,
    svgMarkup: createDataCartridgeSvg('Seasonal Changes & Earth Cycles', 'Key Stage 1', 'Science', 5, '🍂'),
    astSource: serializeDataCartridgeToAst(SEASONAL_CHANGES_PAYLOAD, 'oak-data-seasonal-changes', 'Seasonal Changes & Earth Cycles'),
  },
  {
    id: 'oak-data-re-sacraments',
    title: 'The Seven Sacraments & Holy Eucharist (Data Deck)',
    stage: 'Key Stage 2',
    subject: 'Religious Education (Catholic)',
    oakId: 'RE-KS2-SACR-01',
    oakUnit: 'The Holy Eucharist & Sacraments',
    category: 'Catholic Faith',
    icon: '🍞',
    desc: 'Decentralized Oak & Diocesan question deck for Catholic Sacraments: Real Presence, Initiation, Healing, and Grace.',
    dataPayload: CATHOLIC_SACRAMENTS_PAYLOAD,
    svgMarkup: createDataCartridgeSvg('The Seven Sacraments & Holy Eucharist', 'Key Stage 2', 'Religious Education', 6, '🍞'),
    astSource: serializeDataCartridgeToAst(CATHOLIC_SACRAMENTS_PAYLOAD, 'oak-data-re-sacraments', 'The Seven Sacraments & Holy Eucharist'),
  },
  {
    id: 'oak-data-algorithms-sequencing',
    title: 'Algorithms, Sequencing & Logic (Data Deck)',
    stage: 'Key Stage 2',
    subject: 'Computing',
    oakId: 'COMP-KS2-ALGO-01',
    oakUnit: 'Algorithms and Sequencing',
    category: 'Computing',
    icon: '💻',
    desc: 'Decentralized Oak curriculum question deck for KS2 Computing: step-by-step algorithms, debugging traps, loops, and conditionals.',
    dataPayload: COMPUTING_ALGORITHMS_PAYLOAD,
    svgMarkup: createDataCartridgeSvg('Algorithms, Sequencing & Logic', 'Key Stage 2', 'Computing', 5, '💻'),
    astSource: serializeDataCartridgeToAst(COMPUTING_ALGORITHMS_PAYLOAD, 'oak-data-algorithms-sequencing', 'Algorithms, Sequencing & Logic'),
  },
  {
    id: 'oak-data-phonics-screening',
    title: 'Phonics, Digraphs & Alien Words (Data Deck)',
    stage: 'Key Stage 1',
    subject: 'English',
    oakId: 'ENG-KS1-PHON-01',
    oakUnit: 'Phonics & Simple Sentences',
    category: 'English Literature & Phonics',
    icon: '🔤',
    desc: 'Decentralized Oak curriculum question deck for KS1 Phonics: phoneme segmenting, digraphs, trigraphs, and alien pseudo-words.',
    dataPayload: PHONICS_SCREENING_PAYLOAD,
    svgMarkup: createDataCartridgeSvg('Phonics, Digraphs & Alien Words', 'Key Stage 1', 'English', 5, '🔤'),
    astSource: serializeDataCartridgeToAst(PHONICS_SCREENING_PAYLOAD, 'oak-data-phonics-screening', 'Phonics, Digraphs & Alien Words'),
  },
  {
    id: 'oak-data-electric-circuits',
    title: 'Electric Circuits & Conductors (Data Deck)',
    stage: 'Key Stage 2',
    subject: 'Science',
    oakId: 'SCI-KS2-CIRC-02',
    oakUnit: 'Circuits and Conductors',
    category: 'Science',
    icon: '💡',
    desc: 'Decentralized Oak curriculum question deck for KS2 Electric Circuits: complete loops, conductors vs insulators, and series voltage.',
    dataPayload: ELECTRIC_CIRCUITS_PAYLOAD,
    svgMarkup: createDataCartridgeSvg('Electric Circuits & Conductors', 'Key Stage 2', 'Science', 5, '💡'),
    astSource: serializeDataCartridgeToAst(ELECTRIC_CIRCUITS_PAYLOAD, 'oak-data-electric-circuits', 'Electric Circuits & Conductors'),
  },
  {
    id: 'oak-data-angles-triangles',
    title: 'Angles, Triangles & Geometry (Data Deck)',
    stage: 'Key Stage 2',
    subject: 'Mathematics',
    oakId: 'MAT-KS2-GEOM-03',
    oakUnit: 'Angles and Triangles',
    category: 'Mathematics',
    icon: '📐',
    desc: 'Decentralized Oak curriculum question deck for KS2 Angles: 180° triangle sum, acute/obtuse/reflex, and right angles.',
    dataPayload: ANGLES_TRIANGLES_PAYLOAD,
    svgMarkup: createDataCartridgeSvg('Angles, Triangles & Geometry', 'Key Stage 2', 'Mathematics', 5, '📐'),
    astSource: serializeDataCartridgeToAst(ANGLES_TRIANGLES_PAYLOAD, 'oak-data-angles-triangles', 'Angles, Triangles & Geometry'),
  },
  {
    id: 'oak-data-cell-biology',
    title: 'Cell Biology & Organelles (Data Deck)',
    stage: 'Key Stage 3',
    subject: 'Science',
    oakId: 'SCI-KS3-CELL-01',
    oakUnit: 'Cell Biology',
    category: 'Science',
    icon: '🔬',
    desc: 'Decentralized Oak curriculum question deck for KS3 Cell Biology: plant vs animal cells, organelles, and microscope magnification.',
    dataPayload: CELL_BIOLOGY_PAYLOAD,
    svgMarkup: createDataCartridgeSvg('Cell Biology & Organelles', 'Key Stage 3', 'Science', 4, '🔬'),
    astSource: serializeDataCartridgeToAst(CELL_BIOLOGY_PAYLOAD, 'oak-data-cell-biology', 'Cell Biology & Organelles'),
  },
  {
    id: 'oak-data-re-nicene-creed',
    title: 'The Nicene Creed & Trinity (Data Deck)',
    stage: 'Key Stage 2',
    subject: 'Religious Education (Catholic)',
    oakId: 'RE-KS2-CREED-01',
    oakUnit: 'The Nicene Creed & Trinity',
    category: 'Catholic Faith',
    icon: '📜',
    desc: 'Decentralized Oak & Diocesan question deck for Catholic Creed: Trinity, consubstantial nature, and four marks of the Church.',
    dataPayload: NICENE_CREED_PAYLOAD,
    svgMarkup: createDataCartridgeSvg('The Nicene Creed & Trinity', 'Key Stage 2', 'Religious Education', 3, '📜'),
    astSource: serializeDataCartridgeToAst(NICENE_CREED_PAYLOAD, 'oak-data-re-nicene-creed', 'The Nicene Creed & Trinity'),
  },
  {
    id: 'oak-data-spanish-foundations',
    title: 'Spanish Greetings & Verbs (Data Deck)',
    stage: 'Key Stage 2',
    subject: 'Spanish',
    oakId: 'MFL-KS2-SPAN-01',
    oakUnit: 'Spanish Greetings & Introductions',
    category: 'Modern & Classical Languages',
    icon: '🇪🇸',
    desc: 'Decentralized Oak curriculum question deck for KS2/KS3 Spanish: greetings, pro-drop verbs, and conversational introductions.',
    dataPayload: SPANISH_FOUNDATIONS_PAYLOAD,
    svgMarkup: createDataCartridgeSvg('Spanish Greetings & Verbs', 'Key Stage 2', 'Spanish', 3, '🇪🇸'),
    astSource: serializeDataCartridgeToAst(SPANISH_FOUNDATIONS_PAYLOAD, 'oak-data-spanish-foundations', 'Spanish Greetings & Verbs'),
  },
];
