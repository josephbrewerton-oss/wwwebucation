import{h as e}from"./cartridge-vault-BPdGmEvy.js";import{t}from"./curriculumMesh-BjJFOtWF.js";import{o as n}from"./nanoAvailability-BVxBw7uM.js";import{A as r,E as i,_ as a,r as o,v as s,y as c}from"./bsl-engine-8gonIpiB.js";import{recordAssessmentAttempt as l}from"./studentProfileStore-DzqMqcx0.js";import{t as u}from"./jotter-db-DMLS5HxK.js";import{t as d}from"./aicaller-CMap3bQW.js";var ee=[{word:`State / Give`,meaning:`Recall a single fact, name, or value concisely—no explanation needed.`,howToScoreFullMarks:`Write a short, exact phrase or number with units. One point per mark.`,starterPhrase:`The value / name is...`},{word:`Describe`,meaning:`Say what you see happening, step by step, or give the trend shown in data.`,howToScoreFullMarks:`Follow the pattern from start to finish and quote figures if a graph or table is given.`,starterPhrase:`As [X] increases, [Y]...`},{word:`Explain`,meaning:`Give scientific or textual reasons why something happens—cause and effect.`,howToScoreFullMarks:`Link every statement with "because", "so that", or "which causes...". Describing alone caps your marks.`,starterPhrase:`This happens because..., which causes...`},{word:`Compare`,meaning:`Give both similarities AND differences between two things.`,howToScoreFullMarks:`Use linking words like "whereas", "both", and "in contrast" in every sentence—do not just list one then the other.`,starterPhrase:`Both have..., whereas [A] has... while [B] has...`},{word:`Evaluate`,meaning:`Weigh up arguments for and against, then reach a justified conclusion.`,howToScoreFullMarks:`Give clear points on both sides (or Catholic/other views in RE), and end with "Overall, I conclude..." backed by a reason.`,starterPhrase:`On the one hand... However... Overall, the strongest argument is...`},{word:`Calculate`,meaning:`Work out a numerical answer using a formula or data from the question.`,howToScoreFullMarks:`Write the formula, show substitution, show your final value to the requested significant figures, and include units.`,starterPhrase:`Formula: ... | Substitute: ... | Answer + unit: ...`}],f=[{id:`exam-phys-newtons-second`,topicId:`newtonian-mechanics`,subject:`Physics`,topicTitle:`Newton's Second Law & Braking Forces`,boards:[`AQA`,`Edexcel`,`OCR`],paperHint:`Paper 2 • Forces & Motion`,tier:`Higher & Foundation`,marks:6,commandWord:`Explain`,prompt:`A car of mass 1,200 kg travels at 20 m/s before braking sharply to a halt on a wet road. Explain how Newton’s Second Law (F = ma) applies to the car’s deceleration, and explain two factors that increase the total stopping distance on a wet road.`,contextNote:`6 marks: aim for 2 marks on F = ma & deceleration, 2 marks on thinking distance, 2 marks on wet-road braking distance.`,sentenceStarter:`According to Newton’s Second Law (F = ma), a resultant backwards braking force causes negative acceleration (deceleration) because... On a wet road, water reduces friction between tyres and road, so...`,markPoints:[{id:`m1`,markLabel:`Mark 1`,criterion:`States Newton’s 2nd Law links resultant force, mass, and deceleration (F = ma or a = F/m).`,keywords:[`resultant`,`f = ma`,`f=ma`,`a = f`,`mass`,`force`]},{id:`m2`,markLabel:`Mark 2`,criterion:`Explains a braking/opposing force produces negative acceleration (or larger mass/speed requires larger braking force).`,keywords:[`decelerat`,`oppos`,`backwards`,`negative acceleration`,`slows down`]},{id:`m3`,markLabel:`Mark 3`,criterion:`Defines stopping distance = thinking distance + braking distance.`,keywords:[`thinking`,`braking`,`stopping distance`]},{id:`m4`,markLabel:`Mark 4`,criterion:`Identifies wet road reduces friction / grip between tyres and road surface.`,keywords:[`friction`,`grip`,`wet`,`water`,`lubricat`,`skid`]},{id:`m5`,markLabel:`Mark 5`,criterion:`Explains lower friction means a smaller maximum braking force, giving smaller deceleration and longer braking distance.`,keywords:[`smaller braking force`,`less friction`,`longer braking`,`takes longer`,`further`]},{id:`m6`,markLabel:`Mark 6`,criterion:`Identifies a second factor (e.g. higher initial speed, worn tyres/brakes, or longer reaction time / tiredness / distractions).`,keywords:[`reaction`,`tired`,`distract`,`alcohol`,`speed`,`worn tyres`,`brakes`]}],modelAnswer:`Total stopping distance equals thinking distance plus braking distance. By Newton’s Second Law (F = ma, so a = F / m), a resultant braking force acting opposite to motion causes the car to decelerate. On a wet road, a layer of water reduces friction between the tyres and the road surface. This lowers the maximum braking force available, reducing the rate of deceleration and increasing braking distance. Stopping distance also increases if the driver has a slower reaction time (e.g. due to tiredness or distractions), increasing thinking distance, or if initial speed or worn tyres are present.`,examinerTip:`Examiners award zero cause-and-effect marks if you only list "wet road" without stating it reduces friction between tyres and tarmac.`,simPresetId:`velocity`},{id:`exam-phys-half-life`,topicId:`radioactivity`,subject:`Physics`,topicTitle:`Radioactivity, Half-Life & Medical Tracers`,boards:[`AQA`,`Edexcel`,`OCR`],paperHint:`Paper 1 • Atomic Structure & Radiation`,tier:`Higher & Foundation`,marks:6,commandWord:`Compare & Evaluate`,prompt:`A hospital needs a radioactive isotope to inject into a patient as a medical tracer for a 4-hour organ scan. Compare alpha and gamma radiation, and evaluate which type of emitter and half-life would be safest and most effective.`,sentenceStarter:`Gamma radiation should be chosen rather than alpha because... For a 4-hour scan, the half-life should be around a few hours (e.g. 6 hours) rather than years because...`,markPoints:[{id:`m1`,markLabel:`Mark 1`,criterion:`Selects a gamma emitter rather than an alpha emitter.`,keywords:[`gamma`]},{id:`m2`,markLabel:`Mark 2`,criterion:`Explains gamma is weakly ionising (causes much less cell/DNA damage inside the body).`,keywords:[`weakly ionising`,`less ionising`,`less damage`,`dna`,`cells`]},{id:`m3`,markLabel:`Mark 3`,criterion:`Explains gamma is highly penetrating so it can pass out of the body to reach the external detector.`,keywords:[`penetrat`,`pass out`,`leave the body`,`detector`,`camera`]},{id:`m4`,markLabel:`Mark 4`,criterion:`Contrasts with alpha: strongly ionising (very dangerous inside cells) and stopped by skin/tissue.`,keywords:[`alpha`,`strongly ionising`,`stopped by`,`absorbed`]},{id:`m5`,markLabel:`Mark 5`,criterion:`Selects a short half-life (~a few hours, e.g. 6 hours) long enough to complete the 4-hour scan.`,keywords:[`short half-life`,`few hours`,`6 hours`,`long enough`]},{id:`m6`,markLabel:`Mark 6`,criterion:`Explains the short half-life ensures activity drops quickly afterwards so the patient receives a minimal radiation dose.`,keywords:[`decays quickly`,`safe`,`dose`,`activity drops`,`not radioactive for long`]}],modelAnswer:`A gamma emitter with a short half-life of around 6 hours should be used. Gamma radiation is highly penetrating, whereas alpha particles are absorbed by body tissue; therefore gamma rays can escape the patient’s body to be detected by an external gamma camera. Crucially, gamma is much more weakly ionising than alpha, which is strongly ionising and would severely damage living cells inside organs. A half-life of several hours keeps activity high enough throughout the 4-hour scan, then decays quickly afterwards so the patient is not exposed to harmful radiation for days or years.`,examinerTip:`Always link BOTH properties of alpha vs gamma: ionising power (internal cell damage) AND penetration (getting out to the detector).`,simPresetId:`atom`},{id:`exam-chem-electrolysis`,topicId:`electrolysis`,subject:`Chemistry`,topicTitle:`Electrolysis of Aqueous Solutions`,boards:[`AQA`,`Edexcel`,`OCR`],paperHint:`Paper 1 • Chemical Changes`,tier:`Higher & Foundation`,marks:6,commandWord:`Explain`,prompt:`A student passes an electric current through concentrated aqueous sodium chloride solution (NaCl(aq)) using inert graphite electrodes. Explain what products form at the cathode and anode, including the reactivity rule and half-equations.`,sentenceStarter:`In aqueous sodium chloride, the solution contains Na⁺, Cl⁻, H⁺, and OH⁻ ions. At the negative cathode, hydrogen gas is produced instead of sodium because...`,markPoints:[{id:`m1`,markLabel:`Mark 1`,criterion:`Identifies the four ions present: Na⁺, Cl⁻, H⁺, and OH⁻ (from water).`,keywords:[`h+`,`oh-`,`na+`,`cl-`,`water`,`four ions`]},{id:`m2`,markLabel:`Mark 2`,criterion:`States hydrogen gas (H₂) is produced at the negative cathode.`,keywords:[`hydrogen`,`cathode`]},{id:`m3`,markLabel:`Mark 3`,criterion:`Explains sodium is more reactive than hydrogen, so H⁺ ions are discharged/reduced instead (2H⁺ + 2e⁻ → H₂).`,keywords:[`more reactive`,`reactivity`,`discharged`,`reduced`,`gain electrons`]},{id:`m4`,markLabel:`Mark 4`,criterion:`States chlorine gas (Cl₂) is produced at the positive anode.`,keywords:[`chlorine`,`anode`]},{id:`m5`,markLabel:`Mark 5`,criterion:`Explains halide ions (Cl⁻) are oxidised at the anode when present (2Cl⁻ → Cl₂ + 2e⁻).`,keywords:[`halide`,`oxidised`,`lose electrons`,`2cl-`]},{id:`m6`,markLabel:`Mark 6`,criterion:`Identifies sodium hydroxide (NaOH) / alkaline solution remains in the beaker.`,keywords:[`sodium hydroxide`,`naoh`,`alkali`]}],modelAnswer:`Aqueous sodium chloride contains Na⁺ and Cl⁻ ions alongside H⁺ and OH⁻ ions from water. Positive cations move to the negative cathode; because sodium is more reactive than hydrogen, H⁺ ions are discharged (reduced) to form hydrogen gas: 2H⁺ + 2e⁻ → H₂. Negative anions move to the positive anode; because a halide ion (Cl⁻) is present in solution, Cl⁻ ions are oxidised to produce chlorine gas: 2Cl⁻ → Cl₂ + 2e⁻. The remaining Na⁺ and OH⁻ ions stay in solution, forming alkaline sodium hydroxide (NaOH).`,examinerTip:`Use OIL RIG (Oxidation Is Loss, Reduction Is Gain of electrons) to double-check which side of each half-equation the electrons (e⁻) sit on.`,simPresetId:`electric-circuits`},{id:`exam-bio-photosynthesis`,topicId:`photosynthesis-transport`,subject:`Biology`,topicTitle:`Photosynthesis Rate & Limiting Factors`,boards:[`AQA`,`Edexcel`,`OCR`],paperHint:`Paper 1 • Bioenergetics`,tier:`Higher & Foundation`,marks:6,commandWord:`Explain`,prompt:`Pondweed is placed in water and a lamp is moved gradually further away from the beaker while temperature is kept constant at 25 °C. Explain the effect on the rate of oxygen bubble production and why commercial growers heat and add CO₂ to greenhouses.`,sentenceStarter:`As the lamp is moved further away, light intensity decreases (following the inverse square law), so the rate of photosynthesis... In a greenhouse, heating and adding CO₂ prevents them from becoming limiting factors...`,markPoints:[{id:`m1`,markLabel:`Mark 1`,criterion:`States moving the lamp further away decreases light intensity.`,keywords:[`light intensity`,`decreases`,`less light`,`further`]},{id:`m2`,markLabel:`Mark 2`,criterion:`Links lower light intensity to fewer oxygen bubbles / lower rate of photosynthesis (light is the limiting factor).`,keywords:[`fewer bubbles`,`rate decreases`,`slower`,`limiting factor`]},{id:`m3`,markLabel:`Mark 3`,criterion:`States photosynthesis is an endothermic reaction requiring light energy absorbed by chlorophyll.`,keywords:[`endothermic`,`chlorophyll`,`energy`,`glucose`]},{id:`m4`,markLabel:`Mark 4`,criterion:`Explains raising temperature increases kinetic energy / enzyme collisions up to an optimum (without denaturing).`,keywords:[`enzyme`,`kinetic`,`collisions`,`optimum`,`denatur`]},{id:`m5`,markLabel:`Mark 5`,criterion:`Explains adding CO₂ removes CO₂ concentration as a limiting factor since CO₂ is a reactant.`,keywords:[`co2`,`carbon dioxide`,`reactant`,`limiting`]},{id:`m6`,markLabel:`Mark 6`,criterion:`Evaluates cost vs yield: growers balance extra heating/CO₂ costs against faster plant growth and higher profit.`,keywords:[`profit`,`cost`,`yield`,`grow faster`,`crop`]}],modelAnswer:`Moving the lamp further away reduces light intensity. Because photosynthesis is an endothermic reaction using light energy absorbed by chlorophyll, light becomes the limiting factor, so the rate of photosynthesis falls and fewer oxygen bubbles are released per minute. In commercial greenhouses, growers burn fuel or use heaters to raise temperature towards the enzyme optimum (increasing successful enzyme-substrate collisions without denaturing enzymes) and supply extra CO₂ so carbon dioxide does not limit the reaction. This maximises glucose production for faster growth, balanced carefully against fuel and CO₂ costs to maximise profit.`,examinerTip:`If a question asks about temperature in biology, always mention enzymes—never just say "heat speeds particles up" without linking to enzyme activity and denaturation.`,simPresetId:`photosynthesis`},{id:`exam-bio-glucose-homeostasis`,topicId:`homeostasis-response`,subject:`Biology`,topicTitle:`Blood Glucose Control & Negative Feedback`,boards:[`AQA`,`Edexcel`,`OCR`],paperHint:`Paper 2 • Homeostasis & Response`,tier:`Higher`,marks:6,commandWord:`Explain`,prompt:`Explain how the human body lowers blood glucose concentration after a carbohydrate-rich meal, and how a different hormone raises it again during intense exercise (Higher Tier negative feedback).`,sentenceStarter:`When blood glucose rises after a meal, the pancreas detects the increase and secretes the hormone insulin into the blood, which causes...`,markPoints:[{id:`m1`,markLabel:`Mark 1`,criterion:`States the pancreas detects high blood glucose and secretes insulin.`,keywords:[`pancreas`,`insulin`]},{id:`m2`,markLabel:`Mark 2`,criterion:`Explains insulin causes liver and muscle cells to absorb glucose from the blood.`,keywords:[`absorb`,`take in`,`liver`,`muscle`]},{id:`m3`,markLabel:`Mark 3`,criterion:`Explains excess glucose is converted into insoluble glycogen for storage.`,keywords:[`glycogen`,`insoluble`,`stored`]},{id:`m4`,markLabel:`Mark 4`,criterion:`States when blood glucose falls too low, the pancreas secretes glucagon.`,keywords:[`glucagon`]},{id:`m5`,markLabel:`Mark 5`,criterion:`Explains glucagon causes stored glycogen to convert back into glucose and enter the blood.`,keywords:[`glycogen back to glucose`,`converted back`,`broken down`,`into glucose`]},{id:`m6`,markLabel:`Mark 6`,criterion:`Identifies this corrective loop as negative feedback.`,keywords:[`negative feedback`]}],modelAnswer:`After a meal, high blood glucose is detected by the pancreas, which secretes the hormone insulin into the bloodstream. Insulin causes liver and muscle cells to absorb more glucose from the blood and convert excess glucose into insoluble glycogen for storage, returning blood glucose to normal. During exercise, if blood glucose drops too low, the pancreas secretes a different hormone, glucagon. Glucagon causes the liver to break down stored glycogen back into glucose and release it into the blood. This automatic restorative system is an example of negative feedback.`,examinerTip:`Watch your spelling: Glucagon (hormone) vs Glycogen (storage carbohydrate) vs Glucose (sugar). Misspelling them in GCSE Biology often costs the mark!`},{id:`exam-maths-quadratics`,topicId:`quadratic-equations`,subject:`Mathematics`,topicTitle:`Quadratic Equations & Turning Points`,boards:[`Edexcel`,`AQA`,`OCR`],paperHint:`Higher Tier • Algebra`,tier:`Higher`,marks:5,commandWord:`Calculate & Explain`,prompt:`Consider the quadratic curve y = x² − 6x + 5. (a) Find the coordinates of the roots where the curve crosses the x-axis. (b) By completing the square, find the exact coordinates of the minimum turning point.`,sentenceStarter:`(a) Factorise x² − 6x + 5 = 0 to get (x − ...)(x − ...) = 0, so the roots are... (b) Completing the square gives y = (x − 3)² − ..., so the minimum point is...`,markPoints:[{id:`m1`,markLabel:`Mark 1`,criterion:`Correctly factorises x² − 6x + 5 = (x − 1)(x − 5).`,keywords:[`(x - 1)`,`(x-1)`,`(x − 1)`,`(x - 5)`,`(x-5)`,`(x − 5)`]},{id:`m2`,markLabel:`Mark 2`,criterion:`States both x-intercepts / roots as (1, 0) and (5, 0).`,keywords:[`1, 0`,`(1,0)`,`5, 0`,`(5,0)`,`x = 1`,`x = 5`,`x=1`,`x=5`]},{id:`m3`,markLabel:`Mark 3`,criterion:`Completes the square correctly: y = (x − 3)² − 9 + 5.`,keywords:[`(x - 3)^2`,`(x-3)^2`,`(x − 3)²`,`(x-3)²`]},{id:`m4`,markLabel:`Mark 4`,criterion:`Simplifies constant term to −4: y = (x − 3)² − 4.`,keywords:[`- 4`,`-4`,`− 4`,`−4`]},{id:`m5`,markLabel:`Mark 5`,criterion:`Identifies the minimum turning point coordinates as (3, −4).`,keywords:[`(3, -4)`,`(3,-4)`,`(3, −4)`]}],modelAnswer:`(a) Set y = 0: x² − 6x + 5 = 0. Factorising gives (x − 1)(x − 5) = 0, so x = 1 or x = 5. The curve crosses the x-axis at (1, 0) and (5, 0).
(b) Halving the coefficient of x gives −3: y = (x − 3)² − 3² + 5 = (x − 3)² − 9 + 5 = (x − 3)² − 4. Since (x − 3)² ≥ 0, its minimum occurs when x − 3 = 0 (x = 3), giving y = −4. The minimum turning point is (3, −4).`,examinerTip:`Remember the sign flip inside the bracket: for (x − 3)² − 4, the x-coordinate of the turning point is +3, not −3.`,simPresetId:`calculus-curves`},{id:`exam-re-sources-authority`,topicId:`catholic-sources-of-authority`,subject:`Catholic Christianity`,topicTitle:`Sources of Authority: Scripture, Tradition & Magisterium`,boards:[`AQA`,`Edexcel`,`OCR`],paperHint:`GCSE Religious Studies • Catholic Christianity`,tier:`Core GCSE`,marks:6,commandWord:`Evaluate`,prompt:`"The Bible alone is all a Catholic needs to know how to live today." Evaluate this statement with reference to Sacred Scripture, Sacred Tradition, and the Magisterium.`,contextNote:`Use balanced PEEL paragraphs: why Scripture is central, why Catholics also rely on Tradition and the Magisterium, and a clear conclusion.`,sentenceStarter:`Some Christians agree with this statement because Sacred Scripture is the inspired Word of God... However, Catholics teach that Scripture must be read alongside Sacred Tradition and the Magisterium because...`,markPoints:[{id:`m1`,markLabel:`Mark 1`,criterion:`Explains why Scripture is respected as the inspired Word of God (e.g. Gospels, Ten Commandments, 2 Timothy 3:16).`,keywords:[`scripture`,`bible`,`word of god`,`inspired`,`gospel`]},{id:`m2`,markLabel:`Mark 2`,criterion:`Explains Sacred Tradition as the living handing-on of Jesus’ teachings from the Apostles.`,keywords:[`tradition`,`apostles`,`handed down`]},{id:`m3`,markLabel:`Mark 3`,criterion:`Defines the Magisterium (the Pope and bishops) as the teaching authority that interprets Scripture accurately.`,keywords:[`magisterium`,`pope`,`bishops`,`interpret`,`teaching authority`]},{id:`m4`,markLabel:`Mark 4`,criterion:`Uses a specific modern example or Catechism / Vatican II reference (e.g. Laudato Si’, bioethics, modern issues not named directly in the Bible).`,keywords:[`modern`,`catechism`,`vatican`,`laudato`,`encyclical`,`dei verbum`]},{id:`m5`,markLabel:`Mark 5`,criterion:`Includes a contrasting view (e.g. Sola Scriptura / Protestant emphasis on Scripture alone).`,keywords:[`protestant`,`sola scriptura`,`some christians`,`however`,`on the other hand`]},{id:`m6`,markLabel:`Mark 6`,criterion:`Reaches a reasoned personal/theological conclusion weighing both sides.`,keywords:[`conclusion`,`overall`,`therefore`,`strongest`]}],modelAnswer:`Many Christians, especially from Protestant traditions (Sola Scriptura), would argue the Bible alone is sufficient because Sacred Scripture is the inspired Word of God and contains Jesus’ moral teachings such as the Beatitudes and the Two Great Commandments. However, the Catholic Church teaches (as stated in Dei Verbum) that Scripture and Sacred Tradition form a single sacred deposit of faith handed down from the Apostles. The Magisterium—the Pope and bishops in communion with him—provides living guidance to interpret Scripture faithfully and apply unchanging Gospel principles to modern questions like climate ethics (Laudato Si’) or medical technology. Overall, while the Bible is foundational, Catholics hold that Scripture, Tradition, and the Magisterium work together rather than in isolation.`,examinerTip:`In GCSE RE Evaluate questions, always use specialist terms accurately (Magisterium, Sacred Tradition, Dei Verbum) and include a clear reasoned conclusion.`,simPresetId:`nicene-creed`},{id:`exam-eng-macbeth-ambition`,topicId:`macbeth`,subject:`English Literature`,topicTitle:`Shakespeare: Ambition & Guilt in Macbeth`,boards:[`AQA`,`Edexcel`,`OCR`],paperHint:`Paper 1 • Shakespeare`,tier:`Core GCSE`,marks:6,commandWord:`Explain`,prompt:`Explain how Shakespeare presents Macbeth’s conflict between ambition and conscience in Act 1 Scene 7 ("I have no spur / To prick the sides of my intent, but only / Vaulting ambition, which o’erleaps itself").`,sentenceStarter:`Shakespeare uses an extended horse-riding metaphor to show that Macbeth recognises his ambition is dangerous because...`,markPoints:[{id:`m1`,markLabel:`Mark 1`,criterion:`Identifies the metaphorical language ("spur", "prick", "vaulting ambition").`,keywords:[`metaphor`,`horse`,`riding`,`spur`,`vaulting`]},{id:`m2`,markLabel:`Mark 2`,criterion:`Explains "no spur" shows Macbeth admits he has no moral justification to murder Duncan—only ambition.`,keywords:[`no justification`,`no reason`,`only ambition`,`conscience`,`moral`]},{id:`m3`,markLabel:`Mark 3`,criterion:`Analyses "o’erleaps itself / And falls on th’ other" as foreshadowing his tragic downfall (hubris / hamartia).`,keywords:[`foreshadow`,`downfall`,`fall`,`hamartia`,`hubris`,`tragic`]},{id:`m4`,markLabel:`Mark 4`,criterion:`Links to Jacobean context: Divine Right of Kings / regicide as an unnatural sin.`,keywords:[`jacobean`,`king james`,`divine right`,`regicide`,`sin`,`unnatural`]},{id:`m5`,markLabel:`Mark 5`,criterion:`Notes structural/dramatic effect of the soliloquy revealing inner turmoil directly to the audience.`,keywords:[`soliloquy`,`audience`,`internal conflict`,`turmoil`,`hesitation`]},{id:`m6`,markLabel:`Mark 6`,criterion:`Uses embedded short quotations accurately.`,keywords:[`"no spur"`,`"vaulting ambition"`,`"o'erleaps"`,`quote`,`spur`]}],modelAnswer:`In this soliloquy, Shakespeare exposes Macbeth’s acute internal conflict directly to the audience. By admitting he has "no spur" except "vaulting ambition", Macbeth confesses that King Duncan has been virtuous and that regicide has no moral justification. Shakespeare’s extended equestrian metaphor ("o’erleaps itself / And falls on th’ other") illustrates that unchecked ambition overreaches and causes self-destruction, foreshadowing Macbeth’s tragic downfall (hamartia). For a Jacobean audience under King James I, murdering an anointed monarch violated the Divine Right of Kings, highlighting the moral peril of Macbeth’s desire for power.`,examinerTip:`Name the dramatic form ("soliloquy") and connect short embedded quotes directly to Shakespeare’s warning to a Jacobean audience.`,simPresetId:`shakespeare-macbeth`}],p=[{id:`fc-phys-fma`,deckId:`gcse-science-equations`,subject:`Physics`,stage:`Key Stage 4 (GCSE)`,boards:[`AQA`,`Edexcel`,`OCR`],front:`State Newton's Second Law equation (with units).`,back:`F = m × a — Resultant Force (N) = mass (kg) × acceleration (m/s²).`,clue:`Think of F, m, and a.`},{id:`fc-phys-vflambda`,deckId:`gcse-science-equations`,subject:`Physics`,stage:`Key Stage 4 (GCSE)`,boards:[`AQA`,`Edexcel`,`OCR`],front:`What is the wave speed equation (with standard SI units)?`,back:`v = f × λ — Wave speed (m/s) = frequency (Hz) × wavelength (m).`,clue:`Speed connects frequency and wavelength.`},{id:`fc-phys-ohm`,deckId:`gcse-science-equations`,subject:`Physics`,stage:`Key Stage 4 (GCSE)`,boards:[`AQA`,`Edexcel`,`OCR`],front:`State the equation linking potential difference, current, and resistance.`,back:`V = I × R — Potential difference (V) = current (A) × resistance (Ω).`,clue:`Ohm's Law triangle.`},{id:`fc-chem-moles`,deckId:`gcse-science-equations`,subject:`Chemistry`,stage:`Key Stage 4 (GCSE)`,boards:[`AQA`,`Edexcel`,`OCR`],front:`How do you calculate number of moles from mass and relative formula mass?`,back:`Moles (mol) = Mass (g) ÷ Relative Formula Mass (Mr).`,clue:`n = m / Mr.`},{id:`fc-bio-photo`,deckId:`gcse-science-equations`,subject:`Biology`,stage:`Key Stage 4 (GCSE)`,boards:[`AQA`,`Edexcel`,`OCR`],front:`Give the balanced symbol equation for photosynthesis.`,back:`6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (light energy absorbed by chlorophyll).`,clue:`Six carbon dioxide + six water makes glucose + six oxygen.`},{id:`fc-bio-limiting`,deckId:`gcse-science-equations`,subject:`Biology`,stage:`Key Stage 4 (GCSE)`,boards:[`AQA`,`Edexcel`,`OCR`],front:`What are the four main factors that can limit the rate of photosynthesis?`,back:`Light intensity, carbon dioxide concentration, temperature, and amount of chlorophyll.`,clue:`Three external factors plus one inside the leaf.`},{id:`fc-re-magisterium`,deckId:`catholic-theology`,subject:`Catholic Christianity`,stage:`Key Stage 4 (GCSE)`,boards:[`AQA`,`Edexcel`,`OCR`],front:`What is the Magisterium?`,back:`The living teaching authority of the Catholic Church (the Pope and bishops in communion with him) that faithfully interprets Scripture and Tradition.`,clue:`From Latin "magister" (teacher).`},{id:`fc-re-transub`,deckId:`catholic-theology`,subject:`Catholic Christianity`,stage:`Key Stage 4 (GCSE)`,boards:[`AQA`,`Edexcel`,`OCR`],front:`What does Transubstantiation mean in Catholic belief?`,back:`At the Consecration in Mass, the whole substance of bread and wine changes into the Body and Blood of Christ, while the appearances remain.`,clue:`Takes place during the Eucharistic Prayer.`},{id:`fc-re-imago`,deckId:`catholic-theology`,subject:`Catholic Christianity`,stage:`Key Stage 4 (GCSE)`,boards:[`AQA`,`Edexcel`,`OCR`],front:`What is "Imago Dei" and why is it central to Catholic Social Teaching?`,back:`Literally "Image of God" (Genesis 1:27): every human person has inherent, inviolable dignity from conception to natural death.`,clue:`Latin phrase meaning made in God’s likeness.`},{id:`fc-re-eschatology`,deckId:`catholic-theology`,subject:`Catholic Christianity`,stage:`Key Stage 4 (GCSE)`,boards:[`AQA`,`Edexcel`,`OCR`],front:`Define Eschatology and name the "Four Last Things".`,back:`The study of the end times and life after death: Death, Judgement, Heaven, and Hell (plus Catholic teaching on Purgatory as final purification).`,clue:`From Greek "eschatos" (last).`},{id:`fc-mfl-es-1`,deckId:`mfl-core-vocab`,subject:`Languages (Spanish & French)`,stage:`Key Stage 3 & 4`,front:`🇪🇸 "Sin embargo" — What does this Spanish connective mean?`,back:`However / Nevertheless (essential higher-tier connective for GCSE writing & speaking).`,speechLang:`es-ES`},{id:`fc-mfl-es-2`,deckId:`mfl-core-vocab`,subject:`Languages (Spanish & French)`,stage:`Key Stage 3 & 4`,front:`🇪🇸 "Suelo + infinitive" (e.g. Suelo estudiar por la tarde)`,back:`I usually... (e.g. "I usually study in the afternoon" — great GCSE idiom!).`,speechLang:`es-ES`},{id:`fc-mfl-fr-1`,deckId:`mfl-core-vocab`,subject:`Languages (Spanish & French)`,stage:`Key Stage 3 & 4`,front:`🇫🇷 "Cependant / Néanmoins" — What do these French connectives mean?`,back:`However / Nevertheless — raises writing/speaking complexity straight into GCSE Grade 7–9.`,speechLang:`fr-FR`},{id:`fc-mfl-fr-2`,deckId:`mfl-core-vocab`,subject:`Languages (Spanish & French)`,stage:`Key Stage 3 & 4`,front:`🇫🇷 "Si j’avais le choix, je voudrais..."`,back:`If I had the choice, I would like... (imperfect + conditional complex structure).`,speechLang:`fr-FR`}];function m(){let e=t.map(e=>({id:`fc-route-${e.stageId}-${e.subjectId}-${e.topicId}`,deckId:`curriculum-mesh`,subject:e.subjectTitle,stage:e.stageTitle,boards:e.stageId===`ks4`?[`AQA`,`Edexcel`,`OCR`]:void 0,front:`${e.topicTitle} (${e.stageTitle}): What is the core big idea?`,back:`${e.axiom}${e.cognitiveTrap?`\n\n⚠️ Watch out: ${e.cognitiveTrap}`:``}`,clue:e.hook||e.guidedStep}));return[...p,...e]}var h=[{id:`dic-sci-photo`,deckId:`science-spelling`,deckTitle:`Science Key Terms (KS2–GCSE)`,subject:`Science`,stage:`Key Stage 3 & 4`,word:`photosynthesis`,spokenSentence:`Plants make glucose from carbon dioxide and water using photosynthesis.`,clue:`14 letters: begins with "photo-" (light).`,speechLang:`en-GB`},{id:`dic-sci-electrolysis`,deckId:`science-spelling`,deckTitle:`Science Key Terms (KS2–GCSE)`,subject:`Chemistry`,stage:`Key Stage 4 (GCSE)`,word:`electrolysis`,spokenSentence:`Splitting an ionic compound using electricity is called electrolysis.`,clue:`12 letters: "electro-" + "-lysis".`,speechLang:`en-GB`},{id:`dic-sci-mitochondria`,deckId:`science-spelling`,deckTitle:`Science Key Terms (KS2–GCSE)`,subject:`Biology`,stage:`Key Stage 3 & 4`,word:`mitochondria`,spokenSentence:`Aerobic respiration releases energy inside the mitochondria.`,clue:`12 letters: cell organelle where respiration occurs.`,speechLang:`en-GB`},{id:`dic-sci-acceleration`,deckId:`science-spelling`,deckTitle:`Science Key Terms (KS2–GCSE)`,subject:`Physics`,stage:`Key Stage 3 & 4`,word:`acceleration`,spokenSentence:`Resultant force equals mass multiplied by acceleration.`,clue:`Double "c", single "l": a-c-c-e-l...`,speechLang:`en-GB`},{id:`dic-re-eucharist`,deckId:`catholic-spelling`,deckTitle:`Catholic RE & Liturgy Vocabulary`,subject:`Catholic Christianity`,stage:`Key Stage 2–4`,word:`Eucharist`,spokenSentence:`Catholics celebrate the Real Presence of Jesus in the Eucharist.`,clue:`9 letters: starts with "Eu-" (from Greek meaning thanksgiving).`,speechLang:`en-GB`},{id:`dic-re-magisterium`,deckId:`catholic-spelling`,deckTitle:`Catholic RE & Liturgy Vocabulary`,subject:`Catholic Christianity`,stage:`Key Stage 4 (GCSE)`,word:`Magisterium`,spokenSentence:`The Pope and bishops form the Magisterium of the Church.`,clue:`11 letters: ends in "-ium".`,speechLang:`en-GB`},{id:`dic-re-tabernacle`,deckId:`catholic-spelling`,deckTitle:`Catholic RE & Liturgy Vocabulary`,subject:`Catholic Christianity`,stage:`Key Stage 2–4`,word:`tabernacle`,spokenSentence:`The consecrated hosts are reserved inside the tabernacle on the sanctuary.`,clue:`10 letters: ends in "-acle".`,speechLang:`en-GB`},{id:`dic-pri-necessary`,deckId:`primary-spelling`,deckTitle:`KS2 Statutory Spelling & Phonics`,subject:`English`,stage:`Key Stage 2`,word:`necessary`,spokenSentence:`It is necessary to show all your working in maths.`,clue:`One collar (c), two sleeves (ss).`,speechLang:`en-GB`},{id:`dic-pri-rhythm`,deckId:`primary-spelling`,deckTitle:`KS2 Statutory Spelling & Phonics`,subject:`English`,stage:`Key Stage 2`,word:`rhythm`,spokenSentence:`Listen carefully to the steady rhythm of the poem.`,clue:`6 letters, no standard vowels (uses "y")!`,speechLang:`en-GB`},{id:`dic-pri-separate`,deckId:`primary-spelling`,deckTitle:`KS2 Statutory Spelling & Phonics`,subject:`English`,stage:`Key Stage 2`,word:`separate`,spokenSentence:`Use a filter to separate sand from salty water.`,clue:`Remember: there is "a rat" in sep-a-rat-e.`,speechLang:`en-GB`},{id:`dic-mfl-es-sinembargo`,deckId:`mfl-dictation`,deckTitle:`MFL Listen & Type (Spanish & French)`,subject:`Spanish`,stage:`Key Stage 3 & 4`,word:`sin embargo`,spokenSentence:`sin embargo`,clue:`Two Spanish words meaning "however".`,speechLang:`es-ES`},{id:`dic-mfl-es-megusta`,deckId:`mfl-dictation`,deckTitle:`MFL Listen & Type (Spanish & French)`,subject:`Spanish`,stage:`Key Stage 3 & 4`,word:`me gusta mucho`,spokenSentence:`me gusta mucho`,clue:`Three Spanish words meaning "I like it a lot".`,speechLang:`es-ES`},{id:`dic-mfl-fr-cependant`,deckId:`mfl-dictation`,deckTitle:`MFL Listen & Type (Spanish & French)`,subject:`French`,stage:`Key Stage 3 & 4`,word:`cependant`,spokenSentence:`cependant`,clue:`9-letter French word meaning "however".`,speechLang:`fr-FR`},{id:`dic-mfl-fr-jaime`,deckId:`mfl-dictation`,deckTitle:`MFL Listen & Type (Spanish & French)`,subject:`French`,stage:`Key Stage 3 & 4`,word:`j'aime beaucoup`,acceptableVariants:[`jaime beaucoup`],spokenSentence:`j'aime beaucoup`,clue:`French phrase meaning "I like a lot" (with apostrophe).`,speechLang:`fr-FR`}],g=`stj_flashcard_mastered_ids_v1`,_=`stj_gcse_exam_drafts_v1`;function v(e){return String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function y(){try{let e=i(g);if(!e)return new Set;let t=JSON.parse(e);return Array.isArray(t)?new Set(t.map(String)):new Set}catch{return new Set}}function b(e){try{r(g,JSON.stringify(Array.from(e)))}catch{}}function x(){try{let e=i(_);if(!e)return{};let t=JSON.parse(e);return t&&typeof t==`object`?t:{}}catch{return{}}}function S(e){try{r(_,JSON.stringify(e))}catch{}}function C(e,t=`en-GB`){if(typeof window<`u`){if(o({subtitle:e,isSpeaking:!0}),!(`speechSynthesis`in window))setTimeout(()=>o({isSpeaking:!1}),1500);else try{window.speechSynthesis.cancel();let n=new SpeechSynthesisUtterance(e);n.lang=t,n.rate=t===`en-GB`?.92:.85,n.onend=()=>o({isSpeaking:!1}),n.onerror=()=>o({isSpeaking:!1}),window.speechSynthesis.speak(n)}catch{o({isSpeaking:!1})}}}function w(e,t){let n=(t||``).toLowerCase(),r=[],i=[];for(let t of e.markPoints)t.keywords.some(e=>n.includes(e.toLowerCase()))?r.push(t.id):i.push(`${t.markLabel}: ${t.criterion}`);let a=``,o=e.commandWord.toLowerCase();o.includes(`explain`)&&!/\b(because|so|causes|therefore|since|means|leads to)\b/i.test(t)?a=`Command-word tip ("Explain"): add cause-and-effect words like "because", "therefore", or "which causes" to unlock full marks.`:o.includes(`evaluate`)&&!/\b(however|although|on the other hand|overall|conclusion|therefore)\b/i.test(t)?a=`Command-word tip ("Evaluate"): make sure you include a contrasting viewpoint ("However...") and end with an "Overall..." conclusion.`:o.includes(`compare`)&&!/\b(whereas|both|while|contrast|unlike|similar)\b/i.test(t)&&(a=`Command-word tip ("Compare"): connect similarities and differences directly using "whereas", "both", or "in contrast".`);let s=`Deterministic Mark-Scheme Check: estimated ${r.length} / ${e.marks} key points matched.`,c=i.length===0?`Strong coverage! Review the mark-scheme wording below to double-check accuracy.`:`Focus next on: ${i.slice(0,2).join(` | `)}`,l=[s,a,c].filter(Boolean).join(`
`);return{matchedIds:r,missingPoints:i,commandAdvice:a,summary:l}}async function T(e,t){let r=w(e,t);if(!d.isPromptApiAvailableSync()||!n())return{matchedIds:r.matchedIds,feedback:r.summary,usedNano:!1};try{let n=e.markPoints.map(e=>`- ${e.markLabel}: ${e.criterion}`).join(`
`),i=[`GCSE Question (${e.marks} marks, Command Word: ${e.commandWord}): ${e.prompt}`,`Mark Scheme:\n${n}`,`Pupil Draft:\n"${t.slice(0,1200)}"`,`Deterministic estimate: ${r.matchedIds.length}/${e.marks}.`,`Give encouraging UK examiner coaching in 3 concise bullet points: (1) what marks are earned, (2) one specific missing mark-scheme point to add, (3) one tip for "${e.commandWord}". Under 75 words.`].join(`

`),a=await d.promptText({prompt:i,systemPrompt:`You are a supportive UK GCSE Examiner and classroom tutor. Be clear, encouraging, and aligned strictly to the supplied mark scheme.`,timeoutMs:12e3});if(a&&a.trim().length>12)return{matchedIds:r.matchedIds,feedback:`🤖 On-Device Examiner Coaching:\n${a.trim()}`,usedNano:!0}}catch{}return{matchedIds:r.matchedIds,feedback:r.summary,usedNano:!1}}function E(){let t=e(),n=document.createElement(`div`);n.className=`revision-suite-stage`,n.style.cssText=`max-width: 1160px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;`;let r=new URLSearchParams(window.location.search),i=r.get(`tab`)||`exam`,o=i===`flashcards`?`flashcards`:i===`dictation`?`dictation`:`exam`,d=r.get(`board`)||`All`,p=d===`AQA`||d===`Edexcel`||d===`OCR`?d:`All`,g=(r.get(`subject`)||`All`).replace(/[<>"'&]/g,``),_=!1,w=m(),E=r.get(`deck`)||`gcse-science-equations`,D=r.get(`stage`)||`All`,O=!1,k=0,A=!1,j=!1,M=y(),N=x(),P=new Set,F=new Set,I=new Set,L=new Map,R=`all`,z=0,B=!1,V=null,H=``,U=0,W=new Set,G=[`All`,...Array.from(new Set(f.map(e=>e.subject)))];function K(){return f.filter(e=>{let t=p===`All`||e.boards.includes(p),n=g===`All`||e.subject===g;return t&&n})}function q(){return w.filter(e=>!(E!==`all`&&e.deckId!==E||D!==`All`&&e.stage!==D||O&&M.has(e.id)))}function J(){return R===`all`?h:h.filter(e=>e.deckId===R)}function Y(){return`
      <header style="margin-bottom: 1.75rem;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
          <a href="${t}" style="font-size:0.82rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
          <span style="color:#cbd5e1;">/</span>
          <a href="${t}learning-zone" style="font-size:0.82rem; color:#64748b; text-decoration:none; font-weight:600;">Curriculum Library</a>
          <span style="color:#cbd5e1;">/</span>
          <span style="font-size:0.82rem; color:#0284c7; font-weight:700;">📝 Exam Prep &amp; Flashcards</span>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
          <div style="max-width:760px;">
            <span style="display:inline-block; font-size:0.74rem; font-weight:800; color:#0369a1; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:4px;">
              AQA &bull; Edexcel &bull; OCR &bull; Active Recall &amp; Dictation
            </span>
            <h1 style="font-size:2.15rem; font-weight:800; color:#0f172a; margin:0 0 6px 0; letter-spacing:-0.02em;">
              GCSE Exam Prep, Flashcards &amp; Spelling
            </h1>
            <p style="font-size:0.98rem; color:#475569; margin:0; line-height:1.55;">
              Practise 4–6 mark extended exam questions with real mark schemes and on-device tutor feedback, flip active-recall flashcards, or train with audio dictation—100% offline.
            </p>
          </div>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px 18px; display:flex; gap:18px; align-items:center;">
            <div>
              <div style="font-size:1.3rem; font-weight:800; color:#0284c7; line-height:1;">${f.length}</div>
              <div style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Exam Tasks</div>
            </div>
            <div style="width:1px; height:28px; background:#e2e8f0;"></div>
            <div>
              <div style="font-size:1.3rem; font-weight:800; color:#10b981; line-height:1;">${M.size}/${w.length}</div>
              <div style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Cards Known</div>
            </div>
            <div style="width:1px; height:28px; background:#e2e8f0;"></div>
            <div>
              <div style="font-size:1.3rem; font-weight:800; color:#7c3aed; line-height:1;">${h.length}</div>
              <div style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Audio Words</div>
            </div>
          </div>
        </div>

        <!-- Mode Tabs -->
        <div style="display:flex; gap:8px; margin-top:1.5rem; border-bottom:1px solid #e2e8f0; padding-bottom:12px; flex-wrap:wrap;">
          <button type="button" id="rev-tab-exam" style="padding:9px 18px; border-radius:8px; font-weight:700; font-size:0.88rem; cursor:pointer; border:1px solid ${o===`exam`?`#0284c7`:`#cbd5e1`}; background:${o===`exam`?`#0284c7`:`#ffffff`}; color:${o===`exam`?`#ffffff`:`#334155`};">
            📝 GCSE 6-Mark Walkthroughs
          </button>
          <button type="button" id="rev-tab-flashcards" style="padding:9px 18px; border-radius:8px; font-weight:700; font-size:0.88rem; cursor:pointer; border:1px solid ${o===`flashcards`?`#0284c7`:`#cbd5e1`}; background:${o===`flashcards`?`#0284c7`:`#ffffff`}; color:${o===`flashcards`?`#ffffff`:`#334155`};">
            🃏 Active-Recall Flashcards
          </button>
          <button type="button" id="rev-tab-dictation" style="padding:9px 18px; border-radius:8px; font-weight:700; font-size:0.88rem; cursor:pointer; border:1px solid ${o===`dictation`?`#0284c7`:`#cbd5e1`}; background:${o===`dictation`?`#0284c7`:`#ffffff`}; color:${o===`dictation`?`#ffffff`:`#334155`};">
            🎧 Listen &amp; Spell Dictation
          </button>
        </div>
      </header>
    `}function X(){let e=K();return`
      <!-- Exam Filters + Command Word Guide Toggle -->
      <section style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.15rem 1.35rem; margin-bottom:1.5rem; display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;">
        <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:0.8rem; font-weight:800; color:#475569;">Exam Board:</span>
            ${[`All`,`AQA`,`Edexcel`,`OCR`].map(e=>`
              <button type="button" class="exam-board-btn" data-board="${e}" style="padding:5px 12px; border-radius:999px; font-size:0.78rem; font-weight:700; cursor:pointer; border:1px solid ${p===e?`#0284c7`:`#cbd5e1`}; background:${p===e?`#0284c7`:`#f8fafc`}; color:${p===e?`#ffffff`:`#334155`};">
                ${e}
              </button>
            `).join(``)}
          </div>

          <div style="display:flex; align-items:center; gap:6px;">
            <label for="exam-subject-select" style="font-size:0.8rem; font-weight:800; color:#475569;">Subject:</label>
            <select id="exam-subject-select" style="padding:5px 10px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-size:0.82rem; font-weight:600;">
              ${G.map(e=>`<option value="${v(e)}" ${g===e?`selected`:``}>${v(e)}</option>`).join(``)}
            </select>
          </div>
        </div>

        <button type="button" id="btn-toggle-command-guide" style="padding:6px 14px; border-radius:8px; border:1px solid #0284c7; background:${_?`#0284c7`:`#eff6ff`}; color:${_?`#ffffff`:`#0369a1`}; font-size:0.8rem; font-weight:700; cursor:pointer;">
          📘 ${_?`Hide`:`Show`} UK Command-Word Guide
        </button>
      </section>

      ${_?`
        <section style="background:#0f172a; color:#f8fafc; border-radius:14px; padding:1.35rem; margin-bottom:1.5rem; border:1px solid #1e293b;">
          <h2 style="font-size:1.1rem; font-weight:800; margin:0 0 10px 0; color:#38bdf8;">
            UK GCSE Command Words — How Examiners Award Full Marks
          </h2>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:10px;">
            ${ee.map(e=>`
              <div style="background:#1e293b; border:1px solid #334155; border-radius:10px; padding:10px 12px;">
                <strong style="color:#fde047; font-size:0.9rem; display:block; margin-bottom:4px;">${v(e.word)}</strong>
                <p style="font-size:0.8rem; color:#e2e8f0; margin:0 0 6px 0; line-height:1.45;">${v(e.meaning)}</p>
                <div style="font-size:0.76rem; color:#94a3b8; line-height:1.4;"><strong>Full-mark tip:</strong> ${v(e.howToScoreFullMarks)}</div>
                <div style="font-size:0.74rem; color:#38bdf8; margin-top:4px;">Starter: <em>${v(e.starterPhrase)}</em></div>
              </div>
            `).join(``)}
          </div>
        </section>
      `:``}

      <div style="display:flex; flex-direction:column; gap:1.5rem;">
        ${e.map(e=>{let n=N[e.id]||{text:``,checkedMarkIds:[],tutorFeedback:``},r=P.has(e.id),i=F.has(e.id),a=I.has(e.id),o=L.get(e.id)||``;return`
            <article class="exam-question-card" data-qid="${v(e.id)}" style="background:#ffffff; border:1px solid #cbd5e1; border-radius:16px; padding:1.5rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
                <div>
                  <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:6px;">
                    <span style="font-size:0.72rem; font-weight:800; background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:999px;">
                      ${v(e.subject)}
                    </span>
                    <span style="font-size:0.72rem; font-weight:800; background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:999px;">
                      ${e.marks} Marks &bull; ${v(e.commandWord)}
                    </span>
                    <span style="font-size:0.72rem; font-weight:700; background:#f1f5f9; color:#334155; padding:2px 8px; border-radius:999px;">
                      ${e.boards.join(` / `)}
                    </span>
                    <span style="font-size:0.72rem; color:#64748b; font-weight:600;">
                      ${v(e.paperHint)} &bull; ${v(e.tier)}
                    </span>
                  </div>
                  <h2 style="font-size:1.25rem; font-weight:800; color:#0f172a; margin:0;">
                    ${v(e.topicTitle)}
                  </h2>
                </div>

                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                  <button type="button" class="exam-speak-btn" data-qid="${v(e.id)}" style="padding:6px 10px; border-radius:6px; border:1px solid #cbd5e1; background:#f8fafc; color:#334155; font-size:0.78rem; font-weight:700; cursor:pointer;">
                    🔊 Read Aloud + BSL
                  </button>
                  ${e.simPresetId?`
                    <a href="${t}player?preset=${encodeURIComponent(e.simPresetId)}" style="padding:6px 12px; border-radius:6px; background:#0284c7; color:#ffffff; text-decoration:none; font-size:0.78rem; font-weight:700;">
                      🎮 Open Linked Lab &rarr;
                    </a>
                  `:``}
                </div>
              </div>

              <div style="background:#f8fafc; border-left:4px solid #0284c7; padding:12px 16px; border-radius:0 10px 10px 0; margin-bottom:12px;">
                <p style="font-size:0.98rem; color:#0f172a; font-weight:600; margin:0; line-height:1.55;">
                  ${v(e.prompt)}
                </p>
                ${e.contextNote?`
                  <p style="font-size:0.78rem; color:#475569; margin:6px 0 0 0;">${v(e.contextNote)}</p>
                `:``}
              </div>

              <!-- Starter toggle + Textarea -->
              <div style="margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:8px;">
                  <label for="exam-textarea-${v(e.id)}" style="font-size:0.8rem; font-weight:700; color:#334155;">
                    Your Extended Response (${n.text.trim()?n.text.trim().split(/\s+/).length:0} words)
                  </label>
                  <button type="button" class="exam-starter-btn" data-qid="${v(e.id)}" style="background:none; border:none; color:#0284c7; font-size:0.78rem; font-weight:700; cursor:pointer; padding:0;">
                    💡 ${i?`Hide Sentence Starter`:`Need a Sentence Starter?`}
                  </button>
                </div>

                ${i?`
                  <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:8px 12px; margin-bottom:8px; font-size:0.82rem; color:#1e3a8a;">
                    <strong>Sentence Starter:</strong> ${v(e.sentenceStarter)}
                  </div>
                `:``}

                <textarea
                  id="exam-textarea-${v(e.id)}"
                  class="exam-draft-textarea"
                  data-qid="${v(e.id)}"
                  rows="4"
                  placeholder="Write your full GCSE answer here before checking the mark scheme..."
                  style="width:100%; box-sizing:border-box; padding:10px 12px; border-radius:10px; border:1.5px solid #cbd5e1; font-family:inherit; font-size:0.9rem; line-height:1.5; color:#0f172a; resize:vertical;"
                >${v(n.text)}</textarea>
              </div>

              <!-- Tutor / Mark Actions -->
              <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:12px;">
                <button type="button" class="exam-check-nano-btn" data-qid="${v(e.id)}" ${a?`disabled`:``} style="padding:8px 14px; border-radius:8px; border:1px solid #7c3aed; background:#7c3aed; color:#ffffff; font-size:0.82rem; font-weight:700; cursor:pointer;">
                  ${a?`⏳ Checking against mark scheme...`:`🤖 Check My Answer Against Mark Scheme`}
                </button>
                <button type="button" class="exam-model-btn" data-qid="${v(e.id)}" style="padding:8px 14px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-size:0.82rem; font-weight:700; cursor:pointer;">
                  ${r?`🙈 Hide Model Full-Mark Answer`:`📄 Reveal Model Full-Mark Answer`}
                </button>
                <button type="button" class="exam-save-jotter-btn" data-qid="${v(e.id)}" style="padding:8px 14px; border-radius:8px; border:1px solid #059669; background:#ecfdf5; color:#065f46; font-size:0.82rem; font-weight:700; cursor:pointer;">
                  💾 Save Marks (${n.checkedMarkIds.length}/${e.marks}) &amp; Log to Jotter
                </button>
              </div>

              ${n.tutorFeedback?`
                <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-radius:10px; padding:10px 14px; margin-bottom:12px; font-size:0.84rem; color:#4c1d95; white-space:pre-line; line-height:1.5;">
                  ${v(n.tutorFeedback)}
                </div>
              `:``}

              ${o?`
                <div style="background:#dcfce7; border:1px solid #86efac; border-radius:8px; padding:8px 12px; margin-bottom:12px; font-size:0.82rem; color:#166534; font-weight:700;">
                  ${v(o)}
                </div>
              `:``}

              <!-- Interactive Self-Mark Checklist -->
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
                  <strong style="font-size:0.82rem; color:#0f172a; text-transform:uppercase; letter-spacing:0.04em;">
                    ✓ Official Mark-Scheme Self-Check (${n.checkedMarkIds.length} / ${e.marks} Marks)
                  </strong>
                  <span style="font-size:0.75rem; color:#64748b;">Tick each point clearly explained in your answer</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  ${e.markPoints.map(t=>{let r=n.checkedMarkIds.includes(t.id);return`
                      <label style="display:flex; align-items:flex-start; gap:8px; padding:6px 8px; border-radius:6px; background:${r?`#dcfce7`:`#ffffff`}; border:1px solid ${r?`#86efac`:`#e2e8f0`}; cursor:pointer; font-size:0.84rem; color:#1e293b;">
                        <input type="checkbox" class="exam-mark-checkbox" data-qid="${v(e.id)}" data-mid="${v(t.id)}" ${r?`checked`:``} style="margin-top:3px; cursor:pointer;" />
                        <span><strong>${v(t.markLabel)}:</strong> ${v(t.criterion)}</span>
                      </label>
                    `}).join(``)}
                </div>
              </div>

              ${r?`
                <div style="margin-top:12px; background:#0f172a; color:#f8fafc; border-radius:10px; padding:12px 16px;">
                  <div style="font-size:0.76rem; font-weight:800; color:#4ade80; text-transform:uppercase; margin-bottom:4px;">
                    Full-Mark Model Response (${e.marks}/${e.marks})
                  </div>
                  <p style="font-size:0.88rem; color:#e2e8f0; margin:0 0 8px 0; line-height:1.55; white-space:pre-line;">
                    ${v(e.modelAnswer)}
                  </p>
                  <div style="font-size:0.78rem; color:#fde047; border-top:1px solid #334155; padding-top:6px;">
                    <strong>Examiner Tip:</strong> ${v(e.examinerTip)}
                  </div>
                </div>
              `:``}
            </article>
          `}).join(``)}
      </div>
    `}function Z(){let e=q();k>=e.length&&(k=0);let t=e[k],n=[`All`,...Array.from(new Set(w.map(e=>e.stage)))];return`
      <!-- Flashcard Controls -->
      <section style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.15rem 1.35rem; margin-bottom:1.5rem; display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;">
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
          <div style="display:flex; align-items:center; gap:6px;">
            <label for="fc-deck-select" style="font-size:0.8rem; font-weight:800; color:#475569;">Deck:</label>
            <select id="fc-deck-select" style="padding:6px 10px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-size:0.84rem; font-weight:600;">
              <option value="gcse-science-equations" ${E===`gcse-science-equations`?`selected`:``}>🔬 GCSE Science Equations &amp; Facts</option>
              <option value="catholic-theology" ${E===`catholic-theology`?`selected`:``}>✝️ GCSE Catholic Christianity Terms</option>
              <option value="mfl-core-vocab" ${E===`mfl-core-vocab`?`selected`:``}>🌍 MFL Spanish &amp; French Phrases</option>
              <option value="curriculum-mesh" ${E===`curriculum-mesh`?`selected`:``}>📚 All Curriculum Key Ideas (KS1–KS4)</option>
              <option value="all" ${E===`all`?`selected`:``}>🌟 Every Flashcard</option>
            </select>
          </div>

          <div style="display:flex; align-items:center; gap:6px;">
            <label for="fc-stage-select" style="font-size:0.8rem; font-weight:800; color:#475569;">Key Stage:</label>
            <select id="fc-stage-select" style="padding:6px 10px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-size:0.84rem; font-weight:600;">
              ${n.map(e=>`<option value="${v(e)}" ${D===e?`selected`:``}>${v(e)}</option>`).join(``)}
            </select>
          </div>

          <label style="display:inline-flex; align-items:center; gap:6px; font-size:0.8rem; font-weight:700; color:#0369a1; cursor:pointer;">
            <input type="checkbox" id="fc-hide-mastered" ${O?`checked`:``} />
            <span>Hide "Got It" Cards</span>
          </label>
        </div>

        <button type="button" id="fc-reset-mastery" style="padding:6px 12px; border-radius:8px; border:1px solid #cbd5e1; background:#f8fafc; color:#475569; font-size:0.78rem; font-weight:700; cursor:pointer;">
          ↺ Reset Card Progress
        </button>
      </section>

      ${t?`
        <div style="max-width:720px; margin:0 auto;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font-size:0.84rem; color:#475569; font-weight:700;">
            <span>Card ${k+1} of ${e.length} &bull; ${v(t.subject)} (${v(t.stage)})</span>
            <span>${M.has(t.id)?`✅ Marked Got It`:`📖 Active Recall`}</span>
          </div>

          <div
            id="flashcard-surface"
            role="button"
            tabindex="0"
            aria-label="Flip flashcard"
            style="background:${A?`#0f172a`:`#ffffff`}; color:${A?`#f8fafc`:`#0f172a`}; border:2px solid ${A?`#0284c7`:`#cbd5e1`}; border-radius:18px; padding:2.5rem 2rem; min-height:240px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer; box-shadow:0 8px 24px rgba(15,23,42,0.08); transition:background 0.15s ease;"
          >
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
              <span style="font-size:0.74rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:${A?`#38bdf8`:`#0284c7`};">
                ${A?`ANSWER / EXPLANATION`:`QUESTION / PROMPT`}
              </span>
              ${t.boards?`
                <span style="font-size:0.72rem; font-weight:700; background:${A?`#1e293b`:`#f1f5f9`}; color:${A?`#cbd5e1`:`#475569`}; padding:2px 8px; border-radius:999px;">
                  ${t.boards.join(` / `)}
                </span>
              `:``}
            </div>

            <div style="font-size:1.3rem; font-weight:800; line-height:1.5; margin:1.25rem 0; white-space:pre-line;">
              ${v(A?t.back:t.front)}
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <span style="font-size:0.78rem; color:${A?`#94a3b8`:`#64748b`};">
                Click card (or press Space) to flip ${A?`back to question`:`for answer`}
              </span>
              ${!A&&t.clue&&j?`
                <span style="font-size:0.8rem; color:#b45309; background:#fef3c7; padding:3px 10px; border-radius:6px; font-weight:600;">
                  💡 Clue: ${v(t.clue)}
                </span>
              `:``}
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:1rem;">
            <div style="display:flex; gap:8px;">
              <button type="button" id="fc-prev-btn" style="padding:8px 14px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700; cursor:pointer;">
                &larr; Prev
              </button>
              <button type="button" id="fc-speak-btn" style="padding:8px 14px; border-radius:8px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a; font-weight:700; cursor:pointer;">
                🔊 Read Aloud + BSL
              </button>
              ${!A&&t.clue?`
                <button type="button" id="fc-clue-btn" style="padding:8px 12px; border-radius:8px; border:1px solid #fde68a; background:#fffbeb; color:#92400e; font-weight:700; cursor:pointer;">
                  💡 Clue
                </button>
              `:``}
            </div>

            <div style="display:flex; gap:8px;">
              <button type="button" id="fc-again-btn" style="padding:8px 14px; border-radius:8px; border:1px solid #fca5a5; background:#fef2f2; color:#991b1b; font-weight:700; cursor:pointer;">
                🔁 Practise Again
              </button>
              <button type="button" id="fc-gotit-btn" style="padding:8px 16px; border-radius:8px; border:none; background:#16a34a; color:#ffffff; font-weight:800; cursor:pointer;">
                ✓ Got It
              </button>
            </div>
          </div>
        </div>
      `:`
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:3rem 1.5rem; text-align:center;">
          <div style="font-size:2.2rem; margin-bottom:8px;">🎉</div>
          <h2 style="margin:0 0 6px 0; font-size:1.3rem; color:#0f172a;">All cards in this filter marked "Got It"!</h2>
          <p style="margin:0 0 1rem 0; color:#64748b; font-size:0.9rem;">Uncheck "Hide Got It Cards" or switch decks to keep revising.</p>
          <button type="button" id="fc-show-all-btn" style="padding:8px 16px; border-radius:8px; border:none; background:#0284c7; color:#ffffff; font-weight:700; cursor:pointer;">
            Show All Cards Again
          </button>
        </div>
      `}
    `}function Q(){let e=J();z>=e.length&&(z=0);let t=e[z];return`
      <section style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.15rem 1.35rem; margin-bottom:1.5rem; display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <label for="dic-deck-select" style="font-size:0.82rem; font-weight:800; color:#475569;">Spelling Deck:</label>
          <select id="dic-deck-select" style="padding:6px 12px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-size:0.84rem; font-weight:600;">
            ${[{id:`all`,title:`🌟 All Audio Spelling Decks`},{id:`science-spelling`,title:`🔬 Science Key Terms (KS2–GCSE)`},{id:`catholic-spelling`,title:`✝️ Catholic RE & Liturgy Vocabulary`},{id:`primary-spelling`,title:`📖 KS2 Statutory Spelling`},{id:`mfl-dictation`,title:`🌍 MFL Listen & Type (Spanish & French)`}].map(e=>`<option value="${e.id}" ${R===e.id?`selected`:``}>${e.title}</option>`).join(``)}
          </select>
        </div>
        <div style="font-size:0.86rem; font-weight:800; color:#166534; background:#dcfce7; border:1px solid #86efac; padding:5px 12px; border-radius:999px;">
          🎧 Dictation Score: ${U} pts
        </div>
      </section>

      ${t?`
        <div style="max-width:700px; margin:0 auto; background:#ffffff; border:1px solid #cbd5e1; border-radius:18px; padding:2rem; box-shadow:0 4px 16px rgba(15,23,42,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
            <span style="font-size:0.78rem; font-weight:800; color:#0284c7; text-transform:uppercase;">
              ${v(t.deckTitle)} &bull; Word ${z+1} of ${e.length}
            </span>
            <span style="font-size:0.74rem; font-weight:700; color:#475569; background:#f1f5f9; padding:2px 8px; border-radius:999px;">
              ${v(t.subject)} (${v(t.stage)})
            </span>
          </div>

          <p style="font-size:0.95rem; color:#334155; margin:0 0 1rem 0; line-height:1.5;">
            Press <strong>Play Audio</strong>, listen carefully to the word or sentence, then type the exact spelling below.
          </p>

          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:1.25rem;">
            <button type="button" id="dic-play-word-btn" style="padding:10px 16px; border-radius:8px; border:none; background:#0284c7; color:#ffffff; font-weight:800; font-size:0.88rem; cursor:pointer;">
              🔊 Play Word
            </button>
            <button type="button" id="dic-play-sentence-btn" style="padding:10px 16px; border-radius:8px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a; font-weight:700; font-size:0.86rem; cursor:pointer;">
              🗣️ Hear in Sentence
            </button>
            <button type="button" id="dic-clue-btn" style="padding:10px 14px; border-radius:8px; border:1px solid #fde68a; background:#fffbeb; color:#92400e; font-weight:700; font-size:0.84rem; cursor:pointer;">
              💡 ${B?`Hide Clue`:`Show Spelling Clue`}
            </button>
          </div>

          ${B?`
            <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:8px 12px; margin-bottom:1rem; font-size:0.84rem; color:#78350f;">
              <strong>Clue:</strong> ${v(t.clue)}
            </div>
          `:``}

          <form id="dic-check-form" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:1rem;">
            <input
              type="text"
              id="dic-answer-input"
              value="${v(H)}"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="Type what you heard..."
              style="flex:1; min-width:220px; padding:10px 14px; border-radius:8px; border:1.5px solid #cbd5e1; font-size:1rem; font-weight:700; color:#0f172a;"
            />
            <button type="submit" style="padding:10px 18px; border-radius:8px; border:none; background:#16a34a; color:#ffffff; font-weight:800; font-size:0.9rem; cursor:pointer;">
              Check Spelling
            </button>
          </form>

          ${V?`
            <div style="background:${V.ok?`#dcfce7`:`#fee2e2`}; border:1px solid ${V.ok?`#86efac`:`#fca5a5`}; color:${V.ok?`#166534`:`#991b1b`}; border-radius:10px; padding:10px 14px; font-size:0.88rem; font-weight:700; margin-bottom:1rem;">
              ${v(V.msg)}
            </div>
          `:``}

          <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid #f1f5f9;">
            <button type="button" id="dic-prev-btn" style="padding:7px 14px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700; cursor:pointer;">
              &larr; Previous Word
            </button>
            <button type="button" id="dic-next-btn" style="padding:7px 16px; border-radius:8px; border:1px solid #0284c7; background:#eff6ff; color:#0369a1; font-weight:700; cursor:pointer;">
              Next Word &rarr;
            </button>
          </div>
        </div>
      `:``}
    `}function $(){if(n.innerHTML=`
      ${Y()}
      ${o===`exam`?X():o===`flashcards`?Z():Q()}
    `,n.querySelector(`#rev-tab-exam`)?.addEventListener(`click`,()=>{o=`exam`,$()}),n.querySelector(`#rev-tab-flashcards`)?.addEventListener(`click`,()=>{o=`flashcards`,$()}),n.querySelector(`#rev-tab-dictation`)?.addEventListener(`click`,()=>{o=`dictation`,$()}),o===`exam`){n.querySelectorAll(`.exam-board-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-board`)||`All`;p=t===`AQA`||t===`Edexcel`||t===`OCR`?t:`All`,$()})});let e=n.querySelector(`#exam-subject-select`);e?.addEventListener(`change`,()=>{g=e.value||`All`,$()}),n.querySelector(`#btn-toggle-command-guide`)?.addEventListener(`click`,()=>{_=!_,$()}),n.querySelectorAll(`.exam-speak-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-qid`)||``,n=f.find(e=>e.id===t);n&&C(`${n.topicTitle}. ${n.prompt}`)})}),n.querySelectorAll(`.exam-starter-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-qid`)||``;F.has(t)?F.delete(t):F.add(t),$()})}),n.querySelectorAll(`.exam-model-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-qid`)||``;P.has(t)?P.delete(t):P.add(t),$()})}),n.querySelectorAll(`.exam-draft-textarea`).forEach(e=>{e.addEventListener(`input`,()=>{let t=e.getAttribute(`data-qid`)||``,n=N[t]||{text:``,checkedMarkIds:[],tutorFeedback:``};n.text=e.value,N[t]=n,S(N)})}),n.querySelectorAll(`.exam-mark-checkbox`).forEach(e=>{e.addEventListener(`change`,()=>{let t=e.getAttribute(`data-qid`)||``,n=e.getAttribute(`data-mid`)||``,r=N[t]||{text:``,checkedMarkIds:[],tutorFeedback:``},i=new Set(r.checkedMarkIds);e.checked?i.add(n):i.delete(n),r.checkedMarkIds=Array.from(i),N[t]=r,S(N),$()})}),n.querySelectorAll(`.exam-check-nano-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.getAttribute(`data-qid`)||``,n=f.find(e=>e.id===t);if(!n)return;let r=N[t]||{text:``,checkedMarkIds:[],tutorFeedback:``};if(!r.text.trim()){r.tutorFeedback=`Write at least a couple of sentences first, then check against the mark scheme!`,N[t]=r,S(N),$();return}I.add(t),$();let i=await T(n,r.text);I.delete(t);let o=new Set([...r.checkedMarkIds,...i.matchedIds]);r.checkedMarkIds=Array.from(o),r.tutorFeedback=i.feedback,N[t]=r,S(N),i.matchedIds.length>=Math.ceil(n.marks/2)?c():a(),$()})}),n.querySelectorAll(`.exam-save-jotter-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.getAttribute(`data-qid`)||``,n=f.find(e=>e.id===t);if(!n)return;let r=N[t]||{text:``,checkedMarkIds:[],tutorFeedback:``},i=r.checkedMarkIds.length,a=i>=Math.ceil(n.marks*.6);await l({challengeId:n.id,topicId:`ks4:${n.subject.toLowerCase().replace(/[^a-z0-9]+/g,``)}:${n.topicId}`,isCorrect:a,userAnswer:`${i}/${n.marks} marks (${r.text.slice(0,80)})`}),await u({sessionId:`exam-${n.id}`,nodePath:`ks4/${n.subject.toLowerCase()}/${n.topicId}`,actor:`student`,payload:`Exam Practice (${n.boards.join(`/`)}) ${i}/${n.marks}: ${r.text||`(self-marked)`}`}).catch(()=>{}),L.set(t,`Saved ${i}/${n.marks} marks to your Student Passport & Jotter!`),c(),$()})})}else if(o===`flashcards`){let e=n.querySelector(`#fc-deck-select`);e?.addEventListener(`change`,()=>{E=e.value,k=0,A=!1,j=!1,$()});let t=n.querySelector(`#fc-stage-select`);t?.addEventListener(`change`,()=>{D=t.value,k=0,A=!1,j=!1,$()});let r=n.querySelector(`#fc-hide-mastered`);r?.addEventListener(`change`,()=>{O=r.checked,k=0,A=!1,$()}),n.querySelector(`#fc-show-all-btn`)?.addEventListener(`click`,()=>{O=!1,k=0,$()}),n.querySelector(`#fc-reset-mastery`)?.addEventListener(`click`,()=>{M.clear(),b(M),O=!1,k=0,A=!1,$()});let i=q(),o=i[k],s=()=>{A=!A,a(),$()},u=n.querySelector(`#flashcard-surface`);u?.addEventListener(`click`,s),u?.addEventListener(`keydown`,e=>{let t=e;(t.key===` `||t.key===`Enter`)&&(t.preventDefault(),s())}),n.querySelector(`#fc-prev-btn`)?.addEventListener(`click`,()=>{i.length&&(k=(k-1+i.length)%i.length,A=!1,j=!1,$())}),n.querySelector(`#fc-speak-btn`)?.addEventListener(`click`,()=>{o&&C(A?o.back:o.front,!A&&o.speechLang?o.speechLang:`en-GB`)}),n.querySelector(`#fc-clue-btn`)?.addEventListener(`click`,()=>{j=!j,$()}),n.querySelector(`#fc-again-btn`)?.addEventListener(`click`,()=>{i.length&&o&&(M.delete(o.id),b(M),k=(k+1)%i.length,A=!1,j=!1,a(),$())}),n.querySelector(`#fc-gotit-btn`)?.addEventListener(`click`,()=>{if(!i.length||!o)return;let e=!M.has(o.id);M.add(o.id),b(M),e&&l({challengeId:o.id,topicId:`flashcards:${o.subject.toLowerCase().replace(/[^a-z0-9]+/g,``)}`,isCorrect:!0,userAnswer:`Got It`}),c(),k=O?k:(k+1)%i.length,A=!1,j=!1,$()})}else{let e=n.querySelector(`#dic-deck-select`);e?.addEventListener(`change`,()=>{R=e.value,z=0,H=``,V=null,B=!1,$()});let t=J(),r=t[z];n.querySelector(`#dic-play-word-btn`)?.addEventListener(`click`,()=>{r&&C(r.word,r.speechLang)}),n.querySelector(`#dic-play-sentence-btn`)?.addEventListener(`click`,()=>{r&&C(r.spokenSentence,r.speechLang)}),n.querySelector(`#dic-clue-btn`)?.addEventListener(`click`,()=>{B=!B,$()});let i=n.querySelector(`#dic-answer-input`);i?.addEventListener(`input`,()=>{H=i.value}),n.querySelector(`#dic-check-form`)?.addEventListener(`submit`,e=>{if(e.preventDefault(),!r)return;let t=(i?.value??H).trim().toLowerCase();[r.word,...r.acceptableVariants||[]].map(e=>e.toLowerCase()).includes(t)?(c(),W.has(r.id)||(W.add(r.id),U+=10,l({challengeId:r.id,topicId:`dictation:${r.subject.toLowerCase().replace(/[^a-z0-9]+/g,``)}`,isCorrect:!0,userAnswer:t})),V={ok:!0,msg:`🎉 Correct! "${r.word}" is spelt accurately.`}):(s(),V={ok:!1,msg:`Not quite (${t||`blank`}). Target spelling: "${r.word}". Look closely at the letters and try the next word or retry!`}),$()}),n.querySelector(`#dic-prev-btn`)?.addEventListener(`click`,()=>{t.length&&(z=(z-1+t.length)%t.length,H=``,V=null,B=!1,$())}),n.querySelector(`#dic-next-btn`)?.addEventListener(`click`,()=>{t.length&&(z=(z+1)%t.length,H=``,V=null,B=!1,$())})}}return $(),n}export{E as default,E as renderRevisionSuitePage};