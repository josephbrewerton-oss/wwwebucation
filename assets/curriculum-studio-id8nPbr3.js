import{c as e,v as t}from"./cartridge-vault-B8xr7N8Y.js";import{c as n,d as r,f as i,i as a,l as o,n as s,o as c,r as l,s as u,t as d,u as f}from"./localCartridgeBuilder-CzLBUne8.js";import{executeSiteDirective as ee,getSiteManifest as p,t as m}from"./nanoSiteManager-CwEEckag.js";import{a as h,i as g,n as _,r as v}from"./index-DnaM-8kN.js";import{n as y}from"./curriculumMesh-H5iV85HA.js";function b(e){let t=_().find(e=>e.id===`teacher-custom-anchors`),n=e=>(e||``).toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/(^-|-$)/g,``),r=n(e.keyStage)||`ks3`,i=n(e.subject)||`general-studies`,a=n(e.topic)||`lesson`,o=e.questions&&e.questions.length>0?e.questions:[{questionText:`Which statement accurately represents the foundational curriculum truth of "${e.topic}"?`,correctAnswer:[e.axiom],hint:`Focus on the primary truth: ${e.axiom.slice(0,60)}...`,explanation:`Correct! ${e.axiom}`,distractors:[{answerText:e.trap,feedback:`Common trap: ${e.trap}`},{answerText:`It operates inversely, causing the opposite outcome for ${e.topic}.`,feedback:`This inverts the essential cause-and-effect relationship.`},{answerText:`It remains completely static and has no observable effect on surrounding conditions.`,feedback:`This assumes isolation without interaction.`}]},{questionText:`When analyzing "${e.topic}", which common misconception or error must be identified and avoided?`,correctAnswer:[e.trap],hint:`Look out for the intuitive misconception that leads students into error.`,explanation:`Correct! A widespread error is: "${e.trap}". The verified curriculum axiom is: "${e.axiom}"`,distractors:[{answerText:e.axiom,feedback:`This is actually the correct curriculum axiom, not a misconception!`},{answerText:`Carefully evaluating empirical evidence and logical definitions.`,feedback:`Careful evaluation is the right methodology.`},{answerText:`Applying standard domain definitions systematically.`,feedback:`Systematic application is standard good practice.`}]}],s={id:`${r}-${i}-${a}`,stageTitle:e.keyStage,subjectTitle:e.subject,topicTitle:e.topic,unitTitle:e.subject,axiom:e.axiom,trap:e.trap,hook:e.hook||`How does ${e.topic} apply in real-world scenarios?`,guidedStep:e.guidedStep||`Examine the core components of ${e.topic} and verify with evidence.`,socraticCheck:e.socraticPivot||`How would you explain the core rule of ${e.topic} in your own words?`,questions:o};if(!t)t={id:`teacher-custom-anchors`,title:`Teacher Custom Anchor Bank`,countryOrRegion:`Local School / Custom`,authorOrMinistry:`Classroom Teacher / Department`,description:`Locally authored axiomatic curriculum anchors (Truth + Trap backward design).`,version:`1.0.0`,installedAt:Date.now(),stages:{[r]:{id:r,title:e.keyStage,subjects:[{id:i,title:e.subject,topics:[{id:a,title:e.topic}]}]}},lessons:[s]};else{t={...t,stages:{...t.stages},lessons:[...t.lessons]},t.stages[r]?t.stages[r]={...t.stages[r],subjects:[...t.stages[r].subjects]}:t.stages[r]={id:r,title:e.keyStage,subjects:[]};let n=t.stages[r].subjects.find(e=>e.id===i);if(!n)n={id:i,title:e.subject,topics:[]},t.stages[r].subjects.push(n);else{let e=t.stages[r].subjects.findIndex(e=>e.id===i);n={...n,topics:[...n.topics]},t.stages[r].subjects[e]=n}n.topics.find(e=>e.id===a)||n.topics.push({id:a,title:e.topic}),t.lessons=t.lessons.filter(e=>e.id!==s.id),t.lessons.push(s),t.installedAt=Date.now()}return h(t),t}function x(e){let t=_().find(e=>e.id===`teacher-custom-anchors`);if(!t)return;let n=t.lessons.filter(t=>t.id!==e);if(n.length===0){g(`teacher-custom-anchors`);return}let r={...t,lessons:n,installedAt:Date.now()};h(r)}function S(){return`Grade or Stage,Subject,Topic or Lesson Title,Core Axiom (The Rule),Cognitive Trap (Common Mistake),Question,Correct Answer,Distractor 1,Distractor 1 Feedback,Distractor 2,Distractor 2 Feedback,Distractor 3,Distractor 3 Feedback,Hint,Explanation
Grade 7 (JSS),Integrated Science,Separation of Soil Mixtures,Filtration separates insoluble solids from liquids via a porous medium.,Confusing evaporation (which evaporates liquid) with filtration (which catches solid).,Which method is best to separate muddy sand from water while keeping both?,filtration,evaporation,Evaporation turns the water into vapor rather than collecting it as liquid.,magnetic separation,Sand and water are not magnetic substances.,dissolution,Dissolving will not separate an insoluble solid from liquid.,Think about using a porous filter that holds back solid sand particles.,Filtration allows the liquid filtrate to pass through while retaining the solid residue.
Grade 7 (JSS),Agriculture & Nutrition,Soil Water Conservation,Mulching preserves soil moisture and suppresses weed germination.,Believing mulching deprives crops of sunlight or air.,What is the primary benefit of organic mulching around crop beds?,conserving soil moisture,attracting harmful insects,Mulch helps soil health and does not primarily serve to attract pests.,reducing root growth,Mulch keeps the soil cool and moist which promotes healthy root growth.,increasing soil erosion,Mulching protects topsoil from wind and rain runoff.,Think about covering the soil with organic matter to prevent evaporation.,Organic mulches reduce evaporation from the soil surface and moderate soil temperatures.
Grade 8 (JSS),Social Studies,Water Resources in Africa,Sustainable water management balances agricultural irrigation and community access.,Assuming river water is limitless and never needs rationing.,Why is drip irrigation preferred over flood irrigation in arid zones?,it delivers water directly to plant roots with minimal evaporation,it is much noisier,Noise has no relation to water conservation benefits.,it requires flooding the entire field,That is flood irrigation which wastes water through high evaporation.,it only works in winter,Drip systems operate year-round to deliver precise moisture.,Consider how delivering water droplet by droplet prevents surface loss.,Drip irrigation targets crop roots directly, cutting evaporation waste by up to 60%.`}function te(){return JSON.stringify({id:`kenya-kicd-jss-sample`,title:`Kenya Junior Secondary Curriculum (KICD Sample)`,countryOrRegion:`Kenya`,authorOrMinistry:`Ministry of Education / KICD`,description:`Grade 7-8 Competency-Based Curriculum for Integrated Science and Agriculture.`,version:`1.0.0`,stages:{"grade-7":{id:`grade-7`,title:`Junior Secondary (Grade 7)`,subjects:[{id:`integrated-science`,title:`Integrated Science`,topics:[{id:`separation-of-mixtures`,title:`Separation of Soil Mixtures`}]},{id:`agriculture`,title:`Agriculture & Nutrition`,topics:[{id:`soil-water-conservation`,title:`Soil Water Conservation`}]}]}},lessons:[{id:`separation-of-mixtures`,stageTitle:`Junior Secondary (Grade 7)`,subjectTitle:`Integrated Science`,topicTitle:`Separation of Soil Mixtures`,axiom:`Filtration separates insoluble solids from liquids via a porous medium.`,trap:`Confusing evaporation with filtration.`,hook:`How can we turn muddy river water into clear water for filtering?`,guidedStep:`Identify insoluble particulate matter, set up filter funnel, and collect filtrate.`,socraticCheck:`What physical property allows filtration to separate sand from water?`,questions:[{questionText:`Which method is best to separate muddy sand from water while keeping both?`,correctAnswer:[`filtration`,`filtering`],hint:`Think about using a porous filter that holds back solid sand particles.`,explanation:`Filtration allows the liquid filtrate to pass through while retaining the solid residue.`,distractors:[{answerText:`evaporation`,feedback:`Evaporation turns the water into vapor rather than collecting it as liquid.`},{answerText:`magnetic separation`,feedback:`Sand and water are not magnetic substances.`},{answerText:`freezing`,feedback:`Freezing solidifies both without separating the particles.`}]}]}]},null,2)}function ne(e,t){let n=e.split(/\r?\n/).filter(e=>e.trim().length>0);if(n.length<2)throw Error(`CSV file must have a header row and at least one data row.`);let r=e=>{let t=[],n=``,r=!1;for(let i=0;i<e.length;i++){let a=e[i];a===`"`?r=!r:a===`,`&&!r?(t.push(n.trim().replace(/^"|"$/g,``).replace(/""/g,`"`)),n=``):n+=a}return t.push(n.trim().replace(/^"|"$/g,``).replace(/""/g,`"`)),t},i=r(n[0]).map(e=>e.toLowerCase().trim()),a=(...e)=>{for(let t of e){let e=i.findIndex(e=>e.includes(t));if(e!==-1)return e}return-1},o=a(`grade`,`stage`,`year`,`level`),s=a(`subject`,`discipline`),c=a(`topic`,`title`,`lesson`,`unit`),l=a(`axiom`,`rule`,`concept`,`summary`),u=a(`trap`,`mistake`,`misconception`),d=a(`question`,`prompt`),f=a(`correct`,`answer`),ee=a(`distractor 1`,`wrong 1`,`incorrect 1`),p=a(`distractor 1 feed`,`feedback 1`,`mistake 1 explanation`),m=a(`distractor 2`,`wrong 2`,`incorrect 2`),h=a(`distractor 2 feed`,`feedback 2`,`mistake 2 explanation`),g=a(`distractor 3`,`wrong 3`,`incorrect 3`),_=a(`distractor 3 feed`,`feedback 3`,`mistake 3 explanation`),v=a(`hint`,`clue`),y=a(`explanation`,`reason`);if(d===-1||f===-1)throw Error(`CSV must contain columns for "Question" and "Correct Answer".`);let b={},x=new Map;for(let e=1;e<n.length;e++){let t=r(n[e]);if(t.length<=Math.max(d,f))continue;let i=o!==-1&&t[o]?t[o]:`General Stage`,a=s!==-1&&t[s]?t[s]:`General Studies`,S=c!==-1&&t[c]?t[c]:`Lesson ${e}`,te=l!==-1&&t[l]?t[l]:`Core principles of ${S}.`,ne=u!==-1&&t[u]?t[u]:`Common confusion regarding ${S}.`,C=t[d],w=t[f],T=v!==-1&&t[v]?t[v]:`Review the fundamental concept.`,E=y!==-1&&t[y]?t[y]:`Review the underlying rule.`;if(!C||!w)continue;let D=[];ee!==-1&&t[ee]&&D.push({answerText:t[ee],feedback:p!==-1&&t[p]?t[p]:`This is a common misconception.`}),m!==-1&&t[m]&&D.push({answerText:t[m],feedback:h!==-1&&t[h]?t[h]:`Incorrect based on foundational definitions.`}),g!==-1&&t[g]&&D.push({answerText:t[g],feedback:_!==-1&&t[_]?t[_]:`Does not satisfy the requirements.`});let O=e=>e.toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/(^-|-$)/g,``),k=O(i),A=O(a),j=O(S);b[k]||(b[k]={id:k,title:i,subjects:new Map});let M=b[k].subjects;M.has(A)||M.set(A,{id:A,title:a,topics:new Map});let N=M.get(A).topics;N.has(j)||N.set(j,{id:j,title:S});let P=`${k}_${A}_${j}`,F=x.get(P),I={questionText:C,correctAnswer:[w],hint:T,explanation:E,distractors:D};F?F.questions.push(I):x.set(P,{id:j,stageTitle:i,subjectTitle:a,topicTitle:S,axiom:te,trap:ne,hook:`How does ${S} apply in real life?`,guidedStep:`Carefully examine the definitions and practical applications of ${S}.`,socraticCheck:`What is the key takeaway of ${S}?`,questions:[I]})}let S={};for(let[e,t]of Object.entries(b))S[e]={id:t.id,title:t.title,subjects:Array.from(t.subjects.values()).map(e=>({id:e.id,title:e.title,topics:Array.from(e.topics.values())}))};return{id:t.packId||`custom-${Date.now()}`,title:t.packTitle||`Imported Curriculum Pack`,countryOrRegion:t.countryOrRegion||`International / Regional`,authorOrMinistry:t.authorOrMinistry||`Local School / Ministry of Education`,description:t.description||`Custom imported educational curriculum pack for offline learning.`,version:`1.0.0`,installedAt:Date.now(),stages:S,lessons:Array.from(x.values())}}var C=[{id:`kenya-kicd-jss`,title:`Kenya Junior Secondary School (CBC / KICD Standards)`,countryOrRegion:`Kenya`,authorOrMinistry:`Kenya Institute of Curriculum Development (KICD)`,description:`Aligned with the Kenyan Competency-Based Curriculum (CBC) for Grade 7 & 8 in Integrated Science, Agriculture, and Social Studies.`,version:`2026.1`,installedAt:Date.now(),stages:{"kenya-grade-7":{id:`kenya-grade-7`,title:`Grade 7 (Kenya Junior Secondary)`,subjects:[{id:`integrated-science`,title:`Integrated Science`,topics:[{id:`separation-of-mixtures`,title:`Separation of Soil Mixtures`},{id:`human-circulatory-system`,title:`The Human Circulatory System`}]},{id:`agriculture-nutrition`,title:`Agriculture & Nutrition`,topics:[{id:`soil-water-conservation`,title:`Soil Water Conservation & Mulching`},{id:`indigenous-food-crops`,title:`Nutritional Value of Indigenous Vegetables`}]}]},"kenya-grade-8":{id:`kenya-grade-8`,title:`Grade 8 (Kenya Junior Secondary)`,subjects:[{id:`social-studies`,title:`Social Studies`,topics:[{id:`african-physical-environment`,title:`The Great Rift Valley & Drainage Systems`},{id:`sustainable-water-management`,title:`Water Resource Stewardship in Arid Lands`}]}]}},lessons:[{id:`separation-of-mixtures`,stageTitle:`Grade 7 (Kenya Junior Secondary)`,subjectTitle:`Integrated Science`,topicTitle:`Separation of Soil Mixtures`,axiom:`Filtration separates insoluble solids from liquids via a porous medium.`,trap:`Confusing evaporation with filtration.`,hook:`How can communities purify water collected from turbid seasonal rivers?`,guidedStep:`Assemble filter paper, funnel, and collection beaker. Pour the suspended solution carefully.`,socraticCheck:`Why does filtration leave clear water in the flask while trapping sand on the paper?`,questions:[{questionText:`Which separation method is most suitable for recovering both water and clean sand from a river silt mixture?`,correctAnswer:[`filtration`,`filtering`],hint:`Think of using a porous barrier that blocks sand grains while letting water pass.`,explanation:`Filtration retains the solid residue on the filter while the liquid filtrate collects in the beaker.`,distractors:[{answerText:`evaporation to dryness`,feedback:`Evaporation vaporizes water into the atmosphere, so the water liquid is lost unless complex condensing equipment is used.`},{answerText:`magnetic extraction`,feedback:`Soil sand and water are non-magnetic substances.`},{answerText:`chemical neutralization`,feedback:`Neutralization is for acid-base reactions, not separating insoluble suspended solids.`}]}]},{id:`soil-water-conservation`,stageTitle:`Grade 7 (Kenya Junior Secondary)`,subjectTitle:`Agriculture & Nutrition`,topicTitle:`Soil Water Conservation & Mulching`,axiom:`Mulching minimizes moisture evaporation, regulates soil temperature, and enriches soil organic matter upon decay.`,trap:`Believing that mulching suffocates plant roots.`,hook:`Why do farms with dry maize stalks spread across their beds survive long dry spells better?`,guidedStep:`Spread dry organic matter evenly around crop stems without piling directly against the plant crown.`,socraticCheck:`How does a layer of organic mulch reduce the rate of capillary water loss from topsoil?`,questions:[{questionText:`What is the primary agronomic benefit of applying organic grass mulch to kitchen garden beds during drought?`,correctAnswer:[`conserving soil moisture and reducing evaporation`,`soil moisture conservation`,`reducing water evaporation`],hint:`Consider how shielding the bare ground from the tropical sun prevents moisture loss.`,explanation:`Mulch forms an insulating barrier that shields the soil surface from direct solar radiation, drastically curbing evaporation.`,distractors:[{answerText:`attracting foraging rodents to the garden`,feedback:`Rodents are a pest concern; the primary intended agricultural purpose of mulching is moisture retention and weed control.`},{answerText:`accelerating soil compaction by rain`,feedback:`Mulch actually cushions the soil against torrential rain impact, reducing compaction.`}]}]},{id:`sustainable-water-management`,stageTitle:`Grade 8 (Kenya Junior Secondary)`,subjectTitle:`Social Studies`,topicTitle:`Water Resource Stewardship in Arid Lands`,axiom:`Micro-irrigation and sand dams capture seasonal runoff to provide drought-resilient community water supply.`,trap:`Assuming groundwater in arid regions is infinite and automatically replenished.`,hook:`How do dry sand riverbeds retain fresh drinkable water months after the rains stop?`,guidedStep:`Map catchment areas, construct low concrete weirs to trap coarse sand, and extract water via sub-surface wells.`,socraticCheck:`Why do sand dams prevent evaporation better than open surface reservoirs in tropical climates?`,questions:[{questionText:`Why are sand dams particularly effective for community water security in arid and semi-arid lands (ASALs)?`,correctAnswer:[`water is stored beneath the sand, which protects it from extreme evaporation and mosquito breeding`,`sub-surface storage prevents evaporation`,`it protects water under sand from evaporation`],hint:`Think about what happens to open water under 35°C equatorial sun compared to water buried in deep coarse sand.`,explanation:`By holding water beneath coarse sand, sand dams prevent high evaporative loss and eliminate open breeding grounds for malaria-carrying mosquitoes.`,distractors:[{answerText:`they generate hydroelectric power for the national grid`,feedback:`Sand dams are small seasonal community water-storage weirs, not large hydroelectric facilities.`},{answerText:`they make riverbeds completely dry permanently`,feedback:`Sand dams actually elevate the local water table, recharging surrounding vegetation and boreholes.`}]}]}]},{id:`india-cbse-middle-school`,title:`India National Curriculum (CBSE / NCERT Standards Class 6–8)`,countryOrRegion:`India`,authorOrMinistry:`NCERT / Central Board of Secondary Education (CBSE)`,description:`Standardized modules for Class 6–8 in General Science, Mathematics (Algebraic Equations & Vedic Geometry), and Environmental Studies.`,version:`2026.2`,installedAt:Date.now(),stages:{"cbse-class-7":{id:`cbse-class-7`,title:`Class 7 (CBSE / NCERT)`,subjects:[{id:`science`,title:`Science`,topics:[{id:`nutrition-in-plants`,title:`Nutrition in Plants: Autotrophs & Photosynthesis`},{id:`acids-bases-salts`,title:`Acids, Bases & Indicators: Litmus & Turmeric`}]},{id:`mathematics`,title:`Mathematics`,topics:[{id:`algebraic-expressions`,title:`Algebraic Expressions & Like Terms`},{id:`lines-and-angles`,title:`Parallel Lines & Transversals: Angle Relationships`}]}]},"cbse-class-8":{id:`cbse-class-8`,title:`Class 8 (CBSE / NCERT)`,subjects:[{id:`science`,title:`Science`,topics:[{id:`crop-production-management`,title:`Crop Production & Kharif/Rabi Crops`},{id:`conservation-plants-animals`,title:`Biodiversity & Wildlife Sanctuaries`}]}]}},lessons:[{id:`nutrition-in-plants`,stageTitle:`Class 7 (CBSE / NCERT)`,subjectTitle:`Science`,topicTitle:`Nutrition in Plants: Autotrophs & Photosynthesis`,axiom:`Autotrophic nutrition utilizes chlorophyll, sunlight, carbon dioxide, and water to synthesize glucose and release oxygen (6CO2 + 6H2O -> C6H12O6 + 6O2).`,trap:`Believing plants take in food directly from soil rather than manufacturing it in leaves.`,hook:`Why do non-green plants like Cuscuta (Amarbel) have to cling onto host trees to survive?`,guidedStep:`Observe stomatal pore function, chloroplast pigments, and test starch formation using iodine solution.`,socraticCheck:`What happens to the rate of photosynthesis if stomata are blocked by heavy road dust?`,questions:[{questionText:`What are the essential raw materials required by green leaves to synthesize carbohydrates during photosynthesis?`,correctAnswer:[`carbon dioxide, water, sunlight, and chlorophyll`,`carbon dioxide water and sunlight`,`co2 h2o sunlight chlorophyll`],hint:`Recall the gas absorbed from air, liquid absorbed by roots, and solar energy captured by leaf pigments.`,explanation:`Leaves absorb CO2 through stomata, draw water via xylem vessels, and capture sunlight with chlorophyll to produce glucose and oxygen (NCERT Class 7 Ch. 1).`,distractors:[{answerText:`oxygen, glucose, and soil fertilizer only`,feedback:`Oxygen and glucose are the products of photosynthesis, not the initial reactants.`},{answerText:`nitrogen gas and mineral oils`,feedback:`Plants cannot directly fix atmospheric nitrogen through leaves for photosynthesis; they require carbon dioxide.`}]}]},{id:`acids-bases-salts`,stageTitle:`Class 7 (CBSE / NCERT)`,subjectTitle:`Science`,topicTitle:`Acids, Bases & Indicators: Litmus & Turmeric`,axiom:`Acids turn blue litmus red; bases turn red litmus blue; turmeric turns reddish-brown in basic solutions.`,trap:`Thinking all acids are dangerous poisons (lemon juice and curd contain edible citric and lactic acids).`,hook:`Why does a yellow curry stain on a white shirt turn reddish-brown when washed with soap?`,guidedStep:`Apply soap solution (a base) to turmeric indicator and observe the rapid chromic shift.`,socraticCheck:`What is formed when hydrochloric acid is precisely neutralized with sodium hydroxide?`,questions:[{questionText:`When a piece of turmeric paper indicator comes into contact with a basic cleaning solution (like soap or lime water), what color change occurs?`,correctAnswer:[`it turns reddish-brown`,`reddish brown`,`turns red`],hint:`Turmeric is a natural indicator that remains yellow in acids, but shifts in bases.`,explanation:`Turmeric paper is yellow in acidic and neutral media, but turns reddish-brown in the presence of basic substances like soap (NCERT Class 7 Ch. 5).`,distractors:[{answerText:`it turns bright blue`,feedback:`Litmus turns blue in bases, but turmeric turns reddish-brown.`},{answerText:`it becomes completely colorless`,feedback:`Phenolphthalein is colorless in acids, not turmeric in bases.`}]}]}]},{id:`ghana-ges-basic`,title:`Ghana National Curriculum (GES / NaCCA Basic 7–9)`,countryOrRegion:`Ghana`,authorOrMinistry:`Ghana Education Service (GES) / NaCCA`,description:`Standards-based syllabus for Junior High School (Basic 7 to 9) in Integrated Science, Computing, and Religious & Moral Education (RME).`,version:`2026.1`,installedAt:Date.now(),stages:{"ghana-basic-7":{id:`ghana-basic-7`,title:`Basic 7 (JHS 1 - Ghana)`,subjects:[{id:`integrated-science`,title:`Integrated Science`,topics:[{id:`water-pollution-galamsey`,title:`Water Body Conservation & River Siltation`},{id:`cells-and-living-systems`,title:`Plant and Animal Cell Structures`}]},{id:`computing-ict`,title:`Computing & ICT`,topics:[{id:`data-security-privacy`,title:`Computer Hardware, Malware & Data Safety`}]}]},"ghana-basic-8":{id:`ghana-basic-8`,title:`Basic 8 (JHS 2 - Ghana)`,subjects:[{id:`religious-moral-education`,title:`Religious & Moral Education (RME)`,topics:[{id:`stewardship-creation`,title:`God as Creator & Human Stewardship in Indigenous Traditions`}]}]}},lessons:[{id:`water-pollution-galamsey`,stageTitle:`Basic 7 (JHS 1 - Ghana)`,subjectTitle:`Integrated Science`,topicTitle:`Water Body Conservation & River Siltation`,axiom:`Illegal alluvial mining and industrial effluent contaminate rivers with heavy metals (mercury and lead) and excessive suspended solids, destroying aquatic ecosystems.`,trap:`Believing that settling turbid water in a bucket makes heavy metal contaminants safe to drink.`,hook:`Why have historical rivers like the Pra, Ankobra, and Birim become turbid and yellow-brown?`,guidedStep:`Examine turbidity samples, distinguish between physical silt suspension and chemical toxicity, and review watershed reclamation.`,socraticCheck:`Can boiling remove toxic dissolved heavy metals like mercury from contaminated river water?`,questions:[{questionText:`Why is boiling water insufficient to make river water contaminated by illegal alluvial mining safe for drinking?`,correctAnswer:[`boiling kills biological microbes but does not remove toxic dissolved heavy metals like mercury or arsenic`,`boiling cannot remove heavy metals`,`heavy metals remain in water after boiling`],hint:`Consider the difference between living bacteria and dissolved chemical elements.`,explanation:`Boiling disinfects water by eliminating pathogenic bacteria, but heavy metals like mercury and lead do not boil off; boiling actually concentrates them as water evaporates (GES Basic 7 Science).`,distractors:[{answerText:`boiling turns pure water into dangerous poison`,feedback:`Boiling pure water is safe; the issue is that it does not neutralize chemical toxins already present.`},{answerText:`heavy metals are living creatures that thrive in boiling water`,feedback:`Heavy metals are chemical elements, not biological organisms.`}]}]}]},{id:`philippines-deped-matatag`,title:`Philippines Basic Education (DepEd MATATAG Curriculum)`,countryOrRegion:`Philippines`,authorOrMinistry:`Department of Education (DepEd Philippines)`,description:`MATATAG Curriculum for Junior High School in General Science (Disaster Preparedness & Typhoon Meteorology), Mathematics, and Values Education.`,version:`2026.1`,installedAt:Date.now(),stages:{"deped-grade-7":{id:`deped-grade-7`,title:`Grade 7 (DepEd Philippines)`,subjects:[{id:`science`,title:`Science`,topics:[{id:`typhoons-weather-systems`,title:`Typhoons, Tropical Cyclones & PAGASA Warning Signals`},{id:`philippine-fault-systems`,title:`Earthquakes & Active Fault Lines along the Ring of Fire`}]},{id:`values-education`,title:`Values Education (Edukasyon sa Pagpapakatao)`,topics:[{id:`bayanihan-community-solidarity`,title:`Bayanihan & Disaster Risk Reduction in Communities`}]}]}},lessons:[{id:`typhoons-weather-systems`,stageTitle:`Grade 7 (DepEd Philippines)`,subjectTitle:`Science`,topicTitle:`Typhoons, Tropical Cyclones & PAGASA Warning Signals`,axiom:`Tropical cyclones gain energy from warm ocean waters (26.5°C or higher) and lose strength when making landfall over mountainous terrain.`,trap:`Thinking the eye of the typhoon is the most violent part of the storm (the eye is calm; the eye wall has the strongest winds).`,hook:`Why do typhoons that form over the warm Philippine Sea weaken significantly after crossing the Sierra Madre mountain range?`,guidedStep:`Track typhoon coordinates on the Philippine Area of Responsibility (PAR) map and correlate barometric pressure with wind intensity.`,socraticCheck:`What weather conditions characterize the eye of a tropical cyclone compared to its eyewall?`,questions:[{questionText:`What causes a powerful tropical cyclone (bagyo) to rapidly lose strength after making landfall over large landmasses like Luzon or Mindanao?`,correctAnswer:[`loss of warm ocean moisture that fuels the storm and increased surface friction from terrain`,`loss of warm ocean water and land friction`,`cutting off the warm moisture source`],hint:`Think about what heat engine powers tropical storms and what happens when they leave the open ocean.`,explanation:`Typhoons are fueled by latent heat released from warm ocean water; upon landfall, they are cut off from moisture and experience intense friction from mountains and trees (DepEd Grade 7 Science).`,distractors:[{answerText:`land masses are colder than the stratosphere`,feedback:`Surface temperature contrast is not the main reason; loss of evaporating ocean water and friction are the key factors.`},{answerText:`the moon pushes the typhoon backward into the sea`,feedback:`Lunar gravity causes ocean tides, but does not extinguish atmospheric cyclone vorticity.`}]}]}]}],w={Kenya:`🇰🇪`,India:`🇮🇳`,Ghana:`🇬🇭`,Philippines:`🇵🇭`};function T(e,t,n){let r=new Blob([t],{type:n}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=e,a.style.display=`none`,document.body.appendChild(a),a.click(),setTimeout(()=>{URL.revokeObjectURL(i),a.remove()},500)}function E(e){return String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function D(){let D=t(),O=document.createElement(`div`);O.className=`curriculum-studio-stage`,O.style.cssText=`max-width: 1160px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;`;let k=null,A=``,j=`none`,M=!0,N=null,P=null,F=`Ready for offline .ast + .svg Duo compilation & local folder builds.`,I=(new URLSearchParams(window.location.search).get(`tab`)||``).toLowerCase(),re=window.location.pathname.toLowerCase(),ie=I===`packager`||I===`astb`||I===`duo`?`packager`:(I===`overseas`||I===`import`||re.includes(`overseas`)||re.includes(`import`)||re.includes(`international`),`overseas`),ae=`Install 1-click overseas Ministry packs (Kenya, India, Ghana, Philippines) or import your own school CSV / JSON syllabus — 100% offline in IndexedDB.`,L=new r,R=null;O.innerHTML=`
    <!-- Header -->
    <div style="margin-bottom: 1.5rem;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <a href="${D}" style="font-size:0.84rem; color:#475569; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <span style="font-size:0.84rem; color:#0369a1; font-weight:700;">🌍 Curriculum &amp; Lesson Author Studio</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">
            Overseas Curriculums &amp; Offline Lesson Studio
          </h1>
          <p style="font-size:0.95rem; color:#475569; margin:0; max-width:780px; line-height:1.5;">
            Import international Ministry syllabi (Kenya KICD, India CBSE/NCERT, Ghana GES/NaCCA, Philippines DepEd MATATAG), upload custom school CSV/JSON packs, or compile paired <code>.ast + .svg</code> labs into offline <code>.astb</code> cartridges.
          </p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a href="${D}learning-zone" style="padding:10px 14px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700; font-size:0.84rem; text-decoration:none;">
            📖 Learning Zone
          </a>
          <a href="${D}player" style="padding:10px 16px; border-radius:8px; background:#0284c7; color:#fff; font-weight:700; font-size:0.84rem; text-decoration:none;">
            🎮 Interactive Player &rarr;
          </a>
        </div>
      </div>

      <!-- Studio Mode Tabs -->
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:1.25rem; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
        <button type="button" id="studio-tab-overseas" style="padding:9px 18px; border-radius:8px; font-weight:800; font-size:0.86rem; cursor:pointer; border:1px solid #0284c7; background:#0284c7; color:#ffffff;">
          🌍 Overseas &amp; Custom Curriculums (CSV / JSON / Ministry Packs)
        </button>
        <button type="button" id="studio-tab-packager" style="padding:9px 18px; border-radius:8px; font-weight:800; font-size:0.86rem; cursor:pointer; border:1px solid #cbd5e1; background:#ffffff; color:#334155;">
          🧩 Interactive Lab Packager (.ast + .svg &rarr; .astb)
        </button>
      </div>
    </div>

    <!-- ===================================================================== -->
    <!-- TAB 1: OVERSEAS & CUSTOM CURRICULUM IMPORTER                          -->
    <!-- ===================================================================== -->
    <div id="studio-pane-overseas">
      <div id="overseas-status-banner" role="status" style="background:#f0f9ff; border:1px solid #bae6fd; color:#075985; border-radius:10px; padding:10px 14px; font-size:0.84rem; font-weight:600; margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
        <span id="overseas-status-text">${E(ae)}</span>
        <span style="font-size:0.74rem; font-weight:800; color:#065f46; background:#ecfdf5; border:1px solid #a7f3d0; padding:2px 8px; border-radius:999px;">
          Zero Cloud &bull; IndexedDB Persistent
        </span>
      </div>

      <!-- 1. One-Click Overseas Ministry Preset Packs -->
      <section style="margin-bottom:1.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
          <div>
            <span style="font-size:0.72rem; font-weight:800; letter-spacing:0.06em; color:#0369a1; text-transform:uppercase;">
              One-Click International Syllabi
            </span>
            <h2 style="font-size:1.25rem; font-weight:800; color:#0f172a; margin:2px 0 0 0;">
              🌍 Overseas Ministry Curriculum Packs
            </h2>
          </div>
          <button type="button" id="btn-install-all-overseas" style="padding:7px 14px; border-radius:8px; border:1px solid #0284c7; background:#f0f9ff; color:#0369a1; font-weight:700; font-size:0.8rem; cursor:pointer;">
            ⬇️ Install All 4 Ministry Packs
          </button>
        </div>

        <div id="overseas-presets-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(265px, 1fr)); gap:14px;"></div>
      </section>

      <!-- 2. CSV / JSON Pack Importer + Teacher Axiom Anchor Author -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(340px, 1fr)); gap:16px; margin-bottom:1.75rem;">
        <!-- Left Card: CSV & JSON Importer -->
        <section style="background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:1.35rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
          <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.06em; color:#065f46; text-transform:uppercase;">
            Spreadsheet &amp; Schema Importer
          </span>
          <h2 style="font-size:1.15rem; font-weight:800; margin:2px 0 6px 0; color:#0f172a;">
            📄 Import School / Ministry CSV or JSON Pack
          </h2>
          <p style="font-size:0.84rem; color:#475569; margin:0 0 12px 0; line-height:1.45;">
            Upload a spreadsheet (<code>.csv</code>) or structured curriculum pack (<code>.json</code>) to add local grades, regional subjects, lessons, and misconception drills into the Learning Zone and Practice Lab.
          </p>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
            <div>
              <label for="inp-pack-title" style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:3px;">Pack Title (for CSV)</label>
              <input id="inp-pack-title" type="text" placeholder="e.g. Diocese Grade 7 Science" style="width:100%; box-sizing:border-box; padding:7px 10px; font-size:0.82rem; border-radius:7px; border:1px solid #cbd5e1; color:#0f172a; background:#ffffff;" />
            </div>
            <div>
              <label for="inp-pack-country" style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:3px;">Country / Region</label>
              <input id="inp-pack-country" type="text" placeholder="e.g. Uganda / Nigeria / Parish" style="width:100%; box-sizing:border-box; padding:7px 10px; font-size:0.82rem; border-radius:7px; border:1px solid #cbd5e1; color:#0f172a; background:#ffffff;" />
            </div>
          </div>
          <div style="margin-bottom:12px;">
            <label for="inp-pack-ministry" style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:3px;">Ministry / Curriculum Board / Author</label>
            <input id="inp-pack-ministry" type="text" placeholder="e.g. NCDC / WAEC / Science Department" style="width:100%; box-sizing:border-box; padding:7px 10px; font-size:0.82rem; border-radius:7px; border:1px solid #cbd5e1; color:#0f172a; background:#ffffff;" />
          </div>

          <div id="overseas-file-dropzone" style="border:2px dashed #64748b; border-radius:10px; padding:18px 14px; text-align:center; background:#f8fafc; cursor:pointer;">
            <div style="font-size:1.35rem; margin-bottom:3px;">📥</div>
            <div style="font-weight:700; font-size:0.86rem; color:#0f172a;">Drop a .csv or .json curriculum file here</div>
            <div style="font-size:0.76rem; color:#475569; margin-top:3px;">or click to browse local device files</div>
            <input type="file" id="input-overseas-pack-file" accept=".csv,.json,text/csv,application/json" style="display:none;" />
          </div>

          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px;">
            <button type="button" id="btn-dl-sample-csv" style="padding:6px 11px; border-radius:7px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700; font-size:0.76rem; cursor:pointer;">
              ⬇ Sample CSV Template
            </button>
            <button type="button" id="btn-dl-sample-json" style="padding:6px 11px; border-radius:7px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700; font-size:0.76rem; cursor:pointer;">
              ⬇ Sample JSON Template
            </button>
          </div>
        </section>

        <!-- Right Card: Quick Teacher Axiom + Misconception Trap Author -->
        <section style="background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:1.35rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
          <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.06em; color:#7c3aed; text-transform:uppercase;">
            Backward-Design Topic Builder
          </span>
          <h2 style="font-size:1.15rem; font-weight:800; margin:2px 0 6px 0; color:#0f172a;">
            ✍️ Quick Teacher Topic Anchor
          </h2>
          <p style="font-size:0.84rem; color:#475569; margin:0 0 10px 0; line-height:1.45;">
            Enter a Grade/Stage, Subject, Core Rule, and Common Misconception to auto-generate offline diagnostic practice questions immediately.
          </p>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
            <div>
              <label for="inp-anchor-stage" style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:2px;">Stage / Grade *</label>
              <input id="inp-anchor-stage" type="text" value="Grade 7 (JSS)" style="width:100%; box-sizing:border-box; padding:6px 10px; font-size:0.82rem; border-radius:7px; border:1px solid #cbd5e1; color:#0f172a;" />
            </div>
            <div>
              <label for="inp-anchor-subject" style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:2px;">Subject *</label>
              <input id="inp-anchor-subject" type="text" placeholder="e.g. Integrated Science" style="width:100%; box-sizing:border-box; padding:6px 10px; font-size:0.82rem; border-radius:7px; border:1px solid #cbd5e1; color:#0f172a;" />
            </div>
          </div>
          <div style="margin-bottom:8px;">
            <label for="inp-anchor-topic" style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:2px;">Topic / Lesson Title *</label>
            <input id="inp-anchor-topic" type="text" placeholder="e.g. Rainwater Harvesting & Filtration" style="width:100%; box-sizing:border-box; padding:6px 10px; font-size:0.82rem; border-radius:7px; border:1px solid #cbd5e1; color:#0f172a;" />
          </div>
          <div style="margin-bottom:8px;">
            <label for="inp-anchor-axiom" style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:2px;">Core Curriculum Rule (Axiom) *</label>
            <textarea id="inp-anchor-axiom" rows="2" placeholder="e.g. First-flush diverters discard contaminated initial roof runoff before storing clean rainwater." style="width:100%; box-sizing:border-box; padding:6px 10px; font-size:0.82rem; border-radius:7px; border:1px solid #cbd5e1; color:#0f172a; font-family:inherit;"></textarea>
          </div>
          <div style="margin-bottom:10px;">
            <label for="inp-anchor-trap" style="display:block; font-size:0.75rem; font-weight:700; color:#334155; margin-bottom:2px;">Common Pupil Misconception (Trap) *</label>
            <input id="inp-anchor-trap" type="text" placeholder="e.g. Assuming clear roof runoff is automatically free of dissolved bird or dust pathogens." style="width:100%; box-sizing:border-box; padding:6px 10px; font-size:0.82rem; border-radius:7px; border:1px solid #cbd5e1; color:#0f172a;" />
          </div>
          <button type="button" id="btn-save-anchor-topic" style="width:100%; padding:9px 14px; border-radius:8px; border:none; background:#0f172a; color:#ffffff; font-weight:700; font-size:0.82rem; cursor:pointer;">
            ➕ Save Topic &amp; Generate Diagnostic Questions
          </button>
        </section>
      </div>

      <!-- 3. Installed Overseas & Custom Packs Manager -->
      <section style="background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:1.35rem; margin-bottom:2rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
          <div>
            <h2 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0;">
              📦 Installed Overseas &amp; Custom Curriculum Packs
            </h2>
            <p style="font-size:0.82rem; color:#475569; margin:3px 0 0 0;">
              Installed packs appear automatically in the <strong>Learning Zone</strong>, <strong>Practice Lab</strong>, and <strong>Revision Flashcards</strong>.
            </p>
          </div>
        </div>
        <div id="installed-packs-container"></div>
      </section>
    </div>

    <!-- ===================================================================== -->
    <!-- TAB 2: .AST + .SVG DUO PACKAGER & 448 KiB WASM INSPECTOR              -->
    <!-- ===================================================================== -->
    <div id="studio-pane-packager" style="display:none;">
    <!-- Section 1: Nominated Local Folder Build Pipeline + Duo Dropzone -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; margin-bottom: 1.5rem;">
      <!-- Card A: Nominated Local Folder -->
      <section style="background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:1.35rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:10px;">
          <div>
            <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.06em; color:#0369a1; text-transform:uppercase;">
              Local Classroom Sync (Offline Storage)
            </span>
            <h2 style="font-size:1.15rem; font-weight:800; margin:2px 0 0 0; color:#0f172a;">
              School Lesson Build Folder
            </h2>
          </div>
          <span id="fs-api-badge" style="font-size:0.72rem; font-weight:700; padding:3px 8px; border-radius:6px; background:${a()?`#dcfce7; color:#166534;`:`#fef3c7; color:#92400e;`}">
            ${a()?`Folder Sync Ready`:`Read-Only Mode`}
          </span>
        </div>
        <p style="font-size:0.84rem; color:#475569; margin:0 0 12px 0; line-height:1.45;">
          Pick your local <code>cartridges/</code> folder once to remember it offline and rebuild lesson packages (<code>bytecode/*.astb</code>) and manifests straight to disk with zero cloud uploads.
        </p>

        <div id="nominated-folder-box" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px; margin-bottom:12px; font-size:0.82rem;">
          <div style="color:#64748b;">No folder chosen yet.</div>
        </div>

        <label style="display:flex; align-items:center; gap:8px; font-size:0.82rem; color:#334155; font-weight:600; margin-bottom:12px; cursor:pointer;">
          <input type="checkbox" id="chk-write-disk" checked />
          Save rebuilt lesson packages back into the chosen folder
        </label>

        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <button type="button" id="btn-nominate-folder" style="padding:8px 14px; border-radius:8px; border:none; background:#0f172a; color:#fff; font-weight:700; font-size:0.82rem; cursor:pointer;">
            📁 Pick School Folder
          </button>
          <button type="button" id="btn-run-folder-build" disabled style="padding:8px 14px; border-radius:8px; border:none; background:#0284c7; color:#fff; font-weight:700; font-size:0.82rem; cursor:pointer; opacity:0.55;">
            ⚡ Build All Lessons in Folder
          </button>
          <button type="button" id="btn-fallback-dir" style="padding:8px 12px; border-radius:8px; border:1px solid #cbd5e1; background:#fff; color:#334155; font-weight:700; font-size:0.8rem; cursor:pointer;">
            📂 Scan Folder (Read-Only)
          </button>
          <button type="button" id="btn-forget-folder" style="display:none; padding:8px 10px; border-radius:8px; border:1px solid #fecaca; background:#fef2f2; color:#991b1b; font-weight:700; font-size:0.78rem; cursor:pointer;">
            Forget
          </button>
          <input type="file" id="input-fallback-dir" webkitdirectory directory multiple style="display:none;" />
        </div>
      </section>

      <!-- Card B: Instant .ast + .svg Duo Compiler -->
      <section style="background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:1.35rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
        <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.06em; color:#7c3aed; text-transform:uppercase;">
          Offline Activity Packager
        </span>
        <h2 style="font-size:1.15rem; font-weight:800; margin:2px 0 6px 0; color:#0f172a;">
          Package Lesson + Diagram (.ast + .svg)
        </h2>
        <p style="font-size:0.84rem; color:#475569; margin:0 0 12px 0; line-height:1.45;">
          Select or drop matching lesson (<code>.ast</code>) and diagram (<code>.svg</code>) files to pack them into a portable offline <code>.astb</code> activity and preview it immediately.
        </p>

        <div id="duo-dropzone" style="border:2px dashed #94a3b8; border-radius:10px; padding:22px 16px; text-align:center; background:#f8fafc; cursor:pointer; transition:border-color 0.15s, background 0.15s;">
          <div style="font-size:1.5rem; margin-bottom:4px;">🧩</div>
          <div style="font-weight:700; font-size:0.88rem; color:#0f172a;">Drop lesson (.ast) + diagram (.svg) files here</div>
          <div style="font-size:0.78rem; color:#64748b; margin-top:4px;">or click to browse local files (multiple allowed)</div>
          <input type="file" id="input-duo-files" accept=".ast,.svg,.ast.svg" multiple style="display:none;" />
        </div>

        <div style="margin-top:12px; display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap;">
          <span id="studio-status-line" style="font-size:0.8rem; font-weight:600; color:#0369a1;">
            ${E(F)}
          </span>
          <button type="button" id="btn-test-built-sample" style="padding:6px 12px; border-radius:6px; border:1px solid #cbd5e1; background:#fff; color:#0f172a; font-weight:700; font-size:0.76rem; cursor:pointer;">
            🧪 Test Built Sample Duo
          </button>
        </div>
      </section>
    </div>

    <!-- Section 2: Compiled Duo Build Results Table -->
    <section id="build-report-section" style="display:none; background:#ffffff; border:1px solid #cbd5e1; border-radius:14px; padding:1.35rem; margin-bottom:1.5rem; box-shadow:0 2px 10px rgba(15,23,42,0.04);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <div>
          <h2 style="font-size:1.15rem; font-weight:800; margin:0; color:#0f172a;">Compiled Build Output</h2>
          <p id="build-summary-stats" style="font-size:0.82rem; color:#475569; margin:4px 0 0 0;"></p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" id="btn-mount-all-vault" style="padding:7px 12px; border-radius:7px; border:none; background:#059669; color:#fff; font-weight:700; font-size:0.78rem; cursor:pointer;">
            💾 Mount All to Offline Vault
          </button>
          <button type="button" id="btn-download-manifest" style="padding:7px 12px; border-radius:7px; border:1px solid #cbd5e1; background:#fff; color:#0f172a; font-weight:700; font-size:0.78rem; cursor:pointer;">
            📄 Export scenes.manifest.json
          </button>
        </div>
      </div>

      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.82rem; text-align:left;">
          <thead>
            <tr style="border-bottom:2px solid #e2e8f0; color:#475569;">
              <th style="padding:8px 6px;">Cartridge</th>
              <th style="padding:8px 6px;">Mode</th>
              <th style="padding:8px 6px;">Size (Src &rarr; .astb)</th>
              <th style="padding:8px 6px;">448 KiB WASM Kernel</th>
              <th style="padding:8px 6px;">SHA-256</th>
              <th style="padding:8px 6px; text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody id="build-results-tbody"></tbody>
        </table>
      </div>
    </section>

    <!-- Section 3: Everyman Chassis 448 KiB WASM Kernel Live Inspector & Dumb Canvas Blitter -->
    <section id="everyman-bios-panel" style="display:none; background:#0f172a; color:#f8fafc; border:1px solid #334155; border-radius:14px; padding:1.35rem; margin-bottom:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
        <div>
          <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.06em; color:#38bdf8; text-transform:uppercase;">
            Zero-Domain JS BIOS + Pure WASM Kernel (448 KiB Fixed Pool)
          </span>
          <h2 id="bios-panel-title" style="font-size:1.15rem; font-weight:800; margin:2px 0 0 0; color:#fff;">
            Everyman Kernel Inspector
          </h2>
        </div>
        <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
          <select id="sel-bios-render-mode" aria-label="Shared Render Boundary Mode" style="padding:5px 8px; border-radius:6px; border:1px solid #475569; background:#1e293b; color:#38bdf8; font-weight:700; font-size:0.76rem; cursor:pointer;">
            <option value="canvas">Mode: WASM Canvas</option>
            <option value="svg">Mode: Companion SVG</option>
            <option value="hybrid">Mode: Hybrid Shared</option>
          </select>
          <button type="button" id="btn-bios-nano-manifest" style="padding:6px 10px; border-radius:6px; border:1px solid #7c3aed; background:#1e1b4b; color:#ddd6fe; font-weight:700; font-size:0.76rem; cursor:pointer;">
            🤖 Nano Manifest
          </button>
          <button type="button" id="btn-bios-play-pause" style="padding:6px 12px; border-radius:6px; border:none; background:#0284c7; color:#fff; font-weight:700; font-size:0.78rem; cursor:pointer;">
            ⏯ Play / Pause (Op 6)
          </button>
          <button type="button" id="btn-bios-reset" style="padding:6px 12px; border-radius:6px; border:1px solid #475569; background:#1e293b; color:#e2e8f0; font-weight:700; font-size:0.78rem; cursor:pointer;">
            ↺ Reset (Op 5)
          </button>
          <button type="button" id="btn-bios-close" style="padding:6px 10px; border-radius:6px; border:none; background:#334155; color:#cbd5e1; font-weight:700; font-size:0.78rem; cursor:pointer;">
            ✕
          </button>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: minmax(320px, 1.4fr) minmax(280px, 1fr); gap:14px;">
        <div>
          <div style="position:relative; width:100%; aspect-ratio:800/480; background:#090d16; border:1px solid #334155; border-radius:8px; overflow:hidden;">
            <svg id="everyman-bios-svg" viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg" style="position:absolute; inset:0; width:100%; height:100%; display:none;">
              <g id="everyman-bios-svg-root"></g>
            </svg>
            <canvas id="everyman-bios-canvas" width="800" height="480" style="position:relative; width:100%; height:100%; display:block; cursor:pointer;"></canvas>
          </div>
          <div id="bios-telemetry-strip" style="margin-top:8px; font-family:ui-monospace, monospace; font-size:0.74rem; color:#94a3b8; display:flex; flex-wrap:wrap; gap:12px;"></div>
        </div>
        <div style="background:#1e293b; border:1px solid #334155; border-radius:8px; padding:10px; max-height:360px; overflow-y:auto;">
          <div style="font-size:0.74rem; font-weight:800; color:#38bdf8; margin-bottom:6px; text-transform:uppercase;">
            3-Column Gemini Nano / WebMCP Manifest (0x00C00)
          </div>
          <div id="bios-manifest-list" style="display:flex; flex-direction:column; gap:6px; font-family:ui-monospace, monospace; font-size:0.72rem;"></div>
          <pre id="bios-nano-manifest-pre" style="display:none; margin:8px 0 0 0; padding:8px; background:#090d16; border:1px solid #4c1d95; border-radius:6px; color:#e9d5ff; font-size:0.68rem; overflow-x:auto; white-space:pre-wrap;"></pre>
        </div>
      </div>
    </section>

    <!-- Active Cartridges Inventory -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; margin-bottom:2rem; box-shadow:0 2px 8px rgba(0,0,0,0.03);">
      <h2 style="font-size:1.2rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0;">
        Active Controlled Cartridges (${e.length} Registered)
      </h2>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px; max-height:360px; overflow-y:auto;">
        ${e.map(e=>`
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-size:0.7rem; font-weight:800; background:#e0f2fe; color:#0369a1; padding:1px 6px; border-radius:4px;">${e.type||`Sim`}</span>
              <span style="font-size:0.7rem; color:#64748b; font-weight:600;">${e.stage}</span>
            </div>
            <strong style="font-size:0.85rem; color:#0f172a; display:block; margin-bottom:4px;">${e.label}</strong>
            <a href="${D}player?preset=${e.id}" style="font-size:0.75rem; color:#0284c7; font-weight:700; text-decoration:none;">Test in Player &rarr;</a>
          </div>
        `).join(``)}
      </div>
    </div>
    </div>
  `;let z=O.querySelector(`#studio-tab-overseas`),B=O.querySelector(`#studio-tab-packager`),oe=O.querySelector(`#studio-pane-overseas`),se=O.querySelector(`#studio-pane-packager`),V=O.querySelector(`#overseas-status-banner`),ce=O.querySelector(`#overseas-status-text`),le=O.querySelector(`#overseas-presets-grid`),ue=O.querySelector(`#installed-packs-container`),de=O.querySelector(`#btn-install-all-overseas`),fe=O.querySelector(`#inp-pack-title`),pe=O.querySelector(`#inp-pack-country`),me=O.querySelector(`#inp-pack-ministry`),H=O.querySelector(`#overseas-file-dropzone`),U=O.querySelector(`#input-overseas-pack-file`),he=O.querySelector(`#btn-dl-sample-csv`),ge=O.querySelector(`#btn-dl-sample-json`),_e=O.querySelector(`#inp-anchor-stage`),ve=O.querySelector(`#inp-anchor-subject`),ye=O.querySelector(`#inp-anchor-topic`),be=O.querySelector(`#inp-anchor-axiom`),xe=O.querySelector(`#inp-anchor-trap`),Se=O.querySelector(`#btn-save-anchor-topic`),Ce=(e,t=!1)=>{if(ie=e,oe.style.display=e===`overseas`?`block`:`none`,se.style.display=e===`packager`?`block`:`none`,z.style.background=e===`overseas`?`#0284c7`:`#ffffff`,z.style.color=e===`overseas`?`#ffffff`:`#334155`,z.style.borderColor=e===`overseas`?`#0284c7`:`#cbd5e1`,B.style.background=e===`packager`?`#0284c7`:`#ffffff`,B.style.color=e===`packager`?`#ffffff`:`#334155`,B.style.borderColor=e===`packager`?`#0284c7`:`#cbd5e1`,t){let t=`${window.location.pathname}?tab=${e}`;window.history.replaceState({},``,t)}},W=(e,t=!1)=>{ae=e,ce.textContent=e,t?(V.style.background=`#fef2f2`,V.style.borderColor=`#fecaca`,V.style.color=`#991b1b`):(V.style.background=`#f0f9ff`,V.style.borderColor=`#bae6fd`,V.style.color=`#075985`)},we=e=>{let t=Object.values(e.stages||{})[0];return t?.title?t.title:e.lessons?.[0]?.stageTitle?e.lessons[0].stageTitle:`All`},G=()=>{let e=_(),t=new Set(e.map(e=>e.id));le.innerHTML=C.map(e=>{let n=t.has(e.id),r=w[e.countryOrRegion]||`🌍`,i=Object.values(e.stages||{}).map(e=>e.title),a=Object.values(e.stages||{}).reduce((e,t)=>e+(t.subjects||[]).reduce((e,t)=>e+(t.topics?.length||0),0),0),o=we(e);return`
        <article style="background:#ffffff; border:1px solid ${n?`#86efac`:`#cbd5e1`}; border-radius:12px; padding:1.15rem; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 2px 6px rgba(15,23,42,0.03);">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:8px;">
              <span style="font-size:0.74rem; font-weight:800; color:#0369a1; background:#e0f2fe; padding:2px 8px; border-radius:999px;">
                ${r} ${E(e.countryOrRegion)} &bull; v${E(e.version)}
              </span>
              ${n?`<span style="font-size:0.7rem; font-weight:800; color:#166534; background:#dcfce7; padding:2px 8px; border-radius:999px;">✓ Installed</span>`:`<span style="font-size:0.7rem; font-weight:700; color:#475569;">${a} Units</span>`}
            </div>
            <h3 style="font-size:1rem; font-weight:800; color:#0f172a; margin:0 0 4px 0; line-height:1.35;">
              ${E(e.title)}
            </h3>
            <div style="font-size:0.74rem; font-weight:700; color:#475569; margin-bottom:6px;">
              ${E(e.authorOrMinistry)}
            </div>
            <p style="font-size:0.8rem; color:#475569; line-height:1.45; margin:0 0 10px 0;">
              ${E(e.description)}
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:12px;">
              ${i.map(e=>`<span style="font-size:0.68rem; font-weight:700; background:#f1f5f9; color:#334155; padding:2px 7px; border-radius:5px;">${E(e)}</span>`).join(``)}
            </div>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:6px; padding-top:8px; border-top:1px solid #f1f5f9;">
            ${n?`
                  <a href="${D}learning-zone?stage=${encodeURIComponent(o)}" style="flex:1; text-align:center; padding:7px 10px; border-radius:7px; background:#0284c7; color:#ffffff; font-weight:700; font-size:0.76rem; text-decoration:none;">
                    📖 Lessons
                  </a>
                  <a href="${D}practice-lab?stage=${encodeURIComponent(o)}" style="flex:1; text-align:center; padding:7px 10px; border-radius:7px; background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46; font-weight:700; font-size:0.76rem; text-decoration:none;">
                    🎯 Drills
                  </a>
                  <button type="button" data-remove-pack="${E(e.id)}" style="padding:7px 10px; border-radius:7px; border:1px solid #fecaca; background:#fef2f2; color:#991b1b; font-weight:700; font-size:0.75rem; cursor:pointer;">
                    Remove
                  </button>
                `:`
                  <button type="button" data-install-preset="${E(e.id)}" style="width:100%; padding:8px 12px; border-radius:7px; border:none; background:#0284c7; color:#ffffff; font-weight:700; font-size:0.8rem; cursor:pointer;">
                    ⬇️ Install Offline Ministry Pack
                  </button>
                `}
          </div>
        </article>
      `}).join(``),e.length===0?ue.innerHTML=`
        <div style="background:#f8fafc; border:1px dashed #cbd5e1; border-radius:10px; padding:1.5rem; text-align:center; color:#475569; font-size:0.85rem;">
          No overseas or custom packs installed yet. Click <strong>Install Offline Ministry Pack</strong> above or upload a <code>.csv</code> / <code>.json</code> syllabus file.
        </div>
      `:ue.innerHTML=`
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${e.map(e=>{let t=w[e.countryOrRegion]||`🌍`,n=we(e),r=(e.lessons||[]).reduce((e,t)=>e+(t.questions?.length||0),0),i=e.id===`teacher-custom-anchors`;return`
                <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:12px 14px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <div>
                      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                        <strong style="font-size:0.95rem; color:#0f172a;">${t} ${E(e.title)}</strong>
                        <span style="font-size:0.7rem; font-weight:800; color:#065f46; background:#ecfdf5; border:1px solid #a7f3d0; padding:1px 7px; border-radius:999px;">
                          ${E(e.countryOrRegion)}
                        </span>
                      </div>
                      <div style="font-size:0.78rem; color:#475569; margin-top:2px;">
                        ${E(e.authorOrMinistry)} &bull; <strong>${(e.lessons||[]).length}</strong> lesson(s) &bull; <strong>${r}</strong> diagnostic question(s)
                      </div>
                    </div>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                      <a href="${D}learning-zone?stage=${encodeURIComponent(n)}" style="padding:6px 11px; border-radius:7px; background:#0284c7; color:#ffffff; font-weight:700; font-size:0.76rem; text-decoration:none;">
                        📖 Learning Zone
                      </a>
                      <a href="${D}practice-lab?stage=${encodeURIComponent(n)}" style="padding:6px 11px; border-radius:7px; border:1px solid #a7f3d0; background:#ecfdf5; color:#065f46; font-weight:700; font-size:0.76rem; text-decoration:none;">
                        🎯 Practice Lab
                      </a>
                      <button type="button" data-export-pack="${E(e.id)}" style="padding:6px 10px; border-radius:7px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700; font-size:0.75rem; cursor:pointer;">
                        ⬇ Export .json
                      </button>
                      <button type="button" data-remove-pack="${E(e.id)}" style="padding:6px 10px; border-radius:7px; border:1px solid #fecaca; background:#fef2f2; color:#991b1b; font-weight:700; font-size:0.75rem; cursor:pointer;">
                        🗑 Remove
                      </button>
                    </div>
                  </div>
                  ${i&&e.lessons.length>0?`
                        <div style="margin-top:8px; padding-top:8px; border-top:1px dashed #cbd5e1; display:flex; flex-wrap:wrap; gap:6px;">
                          ${e.lessons.map(e=>`
                                <span style="display:inline-flex; align-items:center; gap:6px; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:3px 8px; font-size:0.74rem; color:#0f172a; font-weight:600;">
                                  ${E(e.stageTitle)}: ${E(e.topicTitle)}
                                  <button type="button" data-del-anchor="${E(e.id)}" title="Delete topic" style="border:none; background:none; color:#991b1b; font-weight:800; cursor:pointer; padding:0 2px;">✕</button>
                                </span>
                              `).join(``)}
                        </div>
                      `:``}
                </div>
              `}).join(``)}
        </div>
      `,O.querySelectorAll(`[data-install-preset]`).forEach(e=>{e.onclick=()=>{let t=e.dataset.installPreset,n=C.find(e=>e.id===t);n&&(h({...n,installedAt:Date.now()}),y(),G(),W(`Installed "${n.title}" (${n.countryOrRegion}). Ready in Learning Zone & Practice Lab.`))}}),O.querySelectorAll(`[data-remove-pack]`).forEach(e=>{e.onclick=()=>{let t=e.dataset.removePack;t&&(g(t),y(),G(),W(`Removed curriculum pack "${t}" from local IndexedDB.`))}}),O.querySelectorAll(`[data-export-pack]`).forEach(e=>{e.onclick=()=>{let t=e.dataset.exportPack,n=_().find(e=>e.id===t);n&&(T(`${n.id}.json`,JSON.stringify(n,null,2),`application/json`),W(`Exported "${n.title}" as ${n.id}.json.`))}}),O.querySelectorAll(`[data-del-anchor]`).forEach(e=>{e.onclick=()=>{let t=e.dataset.delAnchor;t&&(x(t),y(),G(),W(`Removed custom topic "${t}" from Teacher Custom Anchor Bank.`))}})};z.onclick=()=>Ce(`overseas`,!0),B.onclick=()=>Ce(`packager`,!0),de.onclick=()=>{for(let e of C)h({...e,installedAt:Date.now()});y(),G(),W(`Installed all 4 Overseas Ministry Packs (Kenya, India, Ghana, Philippines) into offline storage.`)},he.onclick=()=>{T(`sample-overseas-curriculum.csv`,S(),`text/csv;charset=utf-8`),W(`Downloaded starter CSV template (sample-overseas-curriculum.csv).`)},ge.onclick=()=>{T(`sample-overseas-curriculum.json`,te(),`application/json`),W(`Downloaded starter JSON template (sample-overseas-curriculum.json).`)};let Te=async e=>{try{let t=await e.text(),n=e.name.toLowerCase(),r;if(n.endsWith(`.json`)){let n=JSON.parse(t);if(!n||typeof n!=`object`||!n.stages&&!Array.isArray(n.lessons))throw Error(`JSON file must contain "stages" and/or "lessons" fields matching CustomCurriculumPack.`);let i=fe.value.trim()||n.title||e.name.replace(/\.json$/i,``);r={id:n.id||`json-pack-${Date.now()}`,title:i,countryOrRegion:pe.value.trim()||n.countryOrRegion||`International / Custom`,authorOrMinistry:me.value.trim()||n.authorOrMinistry||`Imported JSON Pack`,description:n.description||`Imported custom curriculum JSON pack.`,version:n.version||`1.0.0`,installedAt:Date.now(),stages:n.stages||{},lessons:Array.isArray(n.lessons)?n.lessons:[]}}else{let n=e.name.replace(/\.csv$/i,``);r=ne(t,{packId:`csv-${n.toLowerCase().replace(/[^a-z0-9]+/g,`-`)}-${Date.now()}`,packTitle:fe.value.trim()||`${n} Curriculum Pack`,countryOrRegion:pe.value.trim()||`International / Regional`,authorOrMinistry:me.value.trim()||`Ministry / School CSV Import`})}h(r),y(),G(),W(`Imported "${r.title}" (${r.lessons.length} lesson(s)) — now live in Learning Zone & Practice Lab.`)}catch(e){W(`Import error: ${e?.message||e}`,!0)}};H.onclick=()=>U.click(),H.ondragover=e=>{e.preventDefault(),H.style.borderColor=`#0284c7`,H.style.background=`#eff6ff`},H.ondragleave=()=>{H.style.borderColor=`#64748b`,H.style.background=`#f8fafc`},H.ondrop=async e=>{e.preventDefault(),H.style.borderColor=`#64748b`,H.style.background=`#f8fafc`;let t=e.dataTransfer?.files?.[0];t&&await Te(t)},U.onchange=async()=>{let e=U.files?.[0];e&&(await Te(e),U.value=``)},Se.onclick=()=>{let e=_e.value.trim(),t=ve.value.trim(),n=ye.value.trim(),r=be.value.trim(),i=xe.value.trim();!e||!t||!n||!r||!i?W(`Please complete Stage/Grade, Subject, Topic Title, Core Rule, and Common Misconception.`,!0):(b({keyStage:e,subject:t,topic:n,axiom:r,trap:i}),y(),G(),ye.value=``,be.value=``,xe.value=``,W(`Saved custom topic "${n}" (${e} • ${t}) with auto-generated diagnostic questions.`))},Ce(ie,!1),G(),v().then(()=>{O.isConnected&&(y(),G())});let Ee=O.querySelector(`#nominated-folder-box`),De=O.querySelector(`#chk-write-disk`),Oe=O.querySelector(`#btn-nominate-folder`),K=O.querySelector(`#btn-run-folder-build`),ke=O.querySelector(`#btn-fallback-dir`),Ae=O.querySelector(`#btn-forget-folder`),q=O.querySelector(`#input-fallback-dir`),J=O.querySelector(`#duo-dropzone`),Y=O.querySelector(`#input-duo-files`),je=O.querySelector(`#studio-status-line`),Me=O.querySelector(`#btn-test-built-sample`),Ne=O.querySelector(`#build-report-section`),Pe=O.querySelector(`#build-summary-stats`),X=O.querySelector(`#build-results-tbody`),Fe=O.querySelector(`#btn-mount-all-vault`),Ie=O.querySelector(`#btn-download-manifest`),Le=O.querySelector(`#everyman-bios-panel`),Re=O.querySelector(`#bios-panel-title`),ze=O.querySelector(`#everyman-bios-svg`),Be=O.querySelector(`#everyman-bios-svg-root`),Ve=O.querySelector(`#everyman-bios-canvas`),He=O.querySelector(`#bios-telemetry-strip`),Ue=O.querySelector(`#bios-manifest-list`),Z=O.querySelector(`#bios-nano-manifest-pre`),We=O.querySelector(`#sel-bios-render-mode`),Ge=O.querySelector(`#btn-bios-nano-manifest`),Ke=O.querySelector(`#btn-bios-play-pause`),qe=O.querySelector(`#btn-bios-reset`),Je=O.querySelector(`#btn-bios-close`),Q=(e,t=!1)=>{F=e,je.textContent=e,je.style.color=t?`#dc2626`:`#0369a1`},$=()=>{k&&A?(Ee.innerHTML=`
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <div>
            <strong style="color:#0f172a;">📂 ${E(A)}</strong>
            <div style="font-size:0.75rem; color:#475569; margin-top:2px;">
              Permission: <strong>${j}</strong> &middot; Output: <code>${E(A)}/bytecode/</code>
            </div>
          </div>
          <span style="font-size:0.72rem; font-weight:700; color:${j===`granted`?`#166534`:`#92400e`};">
            ${j===`granted`?`✓ Read/Write`:`⚠ Re-grant on Build`}
          </span>
        </div>
      `,K.disabled=!1,K.style.opacity=`1`,Ae.style.display=`inline-block`):(Ee.innerHTML=`<div style="color:#64748b;">No folder chosen yet. Click <strong>Pick School Folder</strong> or use Read-Only Folder Scan.</div>`,K.disabled=!0,K.style.opacity=`0.55`,Ae.style.display=`none`)},Ye=async e=>{P=e,Le.style.display=`block`,Re.textContent=`Everyman 448 KiB Kernel — ${e.title} (${e.id}.astb)`,R&&=(R(),null);try{await L.init();let t=L.bootCartridge(e.astbData),n=e=>{He.innerHTML=`
          <span><strong>Mem:</strong> ${(e.linearMemoryBytes/1024).toFixed(0)} KiB (${e.linearMemoryPages} pages)</span>
          <span><strong>t:</strong> ${e.t.toFixed(3)}</span>
          <span><strong>Tick:</strong> ${e.tickCount}</span>
          <span><strong>Tuples:</strong> ${e.tupleCount}</span>
          <span><strong>Hitboxes:</strong> ${e.hitboxCount}</span>
          <span><strong>DL Ops:</strong> ${e.displayListCount}</span>
          <span><strong>StateHex:</strong> ${e.stateHex}</span>
        `},r=()=>{let e=L.readManifest();Ue.innerHTML=e.map(e=>`
            <div style="background:#0f172a; border:1px solid #334155; border-radius:6px; padding:6px 8px; display:flex; justify-content:space-between; align-items:center; gap:6px;">
              <div style="min-width:0;">
                <div style="color:#38bdf8; font-weight:700;">#${e.slotId} [${e.stageState}] &middot; ${e.kind}</div>
                <div style="color:#f8fafc; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${E(e.semanticTag)} &rarr; ${E(e.payload)}</div>
                <div style="color:#94a3b8;">val=${Number(e.value).toFixed(2)} (${e.min}..${e.max})</div>
              </div>
              <button type="button" data-focus-slot="${e.slotId}" style="padding:3px 7px; border-radius:4px; border:1px solid #475569; background:#1e293b; color:#e2e8f0; cursor:pointer; font-size:0.68rem;">
                Focus
              </button>
            </div>
          `).join(``),Ue.querySelectorAll(`[data-focus-slot]`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.focusSlot||`0`,10);L.dispatchTuple(t,i.FOCUS,0,0),r()}})},a=We.value||(t.telemetry.hasEmbeddedSvg?`hybrid`:`canvas`);L.mountCompanionSvg(Be,ze,a),r(),n(t.telemetry),R=L.startCanvasLoop(Ve,e=>{n(e)},a),We.value=m().getSurface(L.surfaceId)?.renderMode||a}catch(e){He.textContent=`Kernel boot error: ${e?.message||e}`}},Xe=e=>{N=e,Ne.style.display=`block`;let t=e.totalSourceBytes>0?((e.totalSourceBytes-e.totalBytecodeBytes)/e.totalSourceBytes*100).toFixed(1):`0.0`;Pe.textContent=`Source: ${e.folderName} • ${e.totalArtifacts} built (${e.duoCount} Duos) • ${e.totalSourceBytes.toLocaleString()} B → ${e.totalBytecodeBytes.toLocaleString()} B (-${t}%) • ${e.wroteToLocalFolder?`Written to bytecode/ on local disk`:`Ready in memory / download`}`+(e.failedCount>0?` • ${e.failedCount} failed`:``),X.innerHTML=e.artifacts.map((e,t)=>`
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:9px 6px;">
          <strong style="color:#0f172a;">${E(e.title)}</strong>
          <div style="font-size:0.74rem; color:#64748b;"><code>${E(e.id)}.astb</code> &middot; ${E(e.type)}</div>
        </td>
        <td style="padding:9px 6px;">
          <span style="font-size:0.72rem; font-weight:700; padding:2px 7px; border-radius:5px; background:${e.mode===`duo`?`#dbeafe; color:#1d4ed8;`:`#f1f5f9; color:#475569;`}">
            ${e.mode===`duo`?`AST+SVG Duo`:e.mode===`hybrid-capsule`?`.ast.svg`:`AST Only`}
          </span>
          ${e.writtenToDisk?`<div style="font-size:0.7rem; color:#15803d; margin-top:2px;">✓ saved to disk</div>`:``}
        </td>
        <td style="padding:9px 6px; font-family:ui-monospace, monospace; font-size:0.76rem;">
          ${e.sourceBytes.toLocaleString()} B &rarr; <strong>${e.bytecodeBytes.toLocaleString()} B</strong>
          <div style="color:#0369a1;">(${e.savingsPercent>=0?`-${e.savingsPercent}%`:`+${Math.abs(e.savingsPercent)}%`})</div>
        </td>
        <td style="padding:9px 6px; font-family:ui-monospace, monospace; font-size:0.74rem;">
          ${e.wasmBootOk?`<span style="color:#15803d; font-weight:700;">✓ 448 KiB Boot OK</span><div style="color:#64748b;">${e.wasmManifestCount} rows &middot; ${e.wasmStateHex.slice(0,12)}…</div>`:`<span style="color:#dc2626; font-weight:700;">✕ ${E(e.wasmError||`Boot error`)}</span>`}
        </td>
        <td style="padding:9px 6px; font-family:ui-monospace, monospace; font-size:0.72rem; color:#475569;">
          ${e.sha256.slice(0,12)}…
        </td>
        <td style="padding:9px 6px; text-align:right; white-space:nowrap;">
          <button type="button" data-dl-idx="${t}" style="padding:4px 8px; border-radius:5px; border:1px solid #cbd5e1; background:#fff; color:#0f172a; font-weight:700; font-size:0.74rem; cursor:pointer;">⬇ .astb</button>
          <button type="button" data-wasm-idx="${t}" style="padding:4px 8px; border-radius:5px; border:none; background:#0f172a; color:#38bdf8; font-weight:700; font-size:0.74rem; cursor:pointer;">⚡ WASM</button>
          <button type="button" data-mount-idx="${t}" style="padding:4px 8px; border-radius:5px; border:none; background:#0284c7; color:#fff; font-weight:700; font-size:0.74rem; cursor:pointer;">▶ Player</button>
        </td>
      </tr>
    `).join(``),X.querySelectorAll(`[data-dl-idx]`).forEach(t=>{t.onclick=()=>{let n=e.artifacts[Number(t.dataset.dlIdx)];n&&l(n.id,n.astbData)}}),X.querySelectorAll(`[data-wasm-idx]`).forEach(t=>{t.onclick=()=>{let n=e.artifacts[Number(t.dataset.wasmIdx)];n&&Ye(n)}}),X.querySelectorAll(`[data-mount-idx]`).forEach(t=>{t.onclick=async()=>{let n=e.artifacts[Number(t.dataset.mountIdx)];n&&(await c(n),window.location.href=`${D}player?preset=${encodeURIComponent(n.id)}`)}}),e.artifacts.length>0&&!P&&Ye(e.artifacts[0])};n(!1).then(e=>{e.handle&&e.name&&(k=e.handle,A=e.name,j=e.permission,$())}),De.onchange=()=>{M=De.checked},Oe.onclick=async()=>{try{let e=await u();k=e.handle,A=e.name,j=e.permission,$(),Q(`Nominated folder "${e.name}". Click "Build All Duos in Folder" to compile.`)}catch(e){Q(e?.message||`Folder selection cancelled.`,!0)}},Ae.onclick=async()=>{await d(),k=null,A=``,j=`none`,$(),Q(`Removed persisted folder handle from IndexedDB.`)},K.onclick=async()=>{if(k){Q(`Scanning "${A}" and compiling .ast + .svg Duos into .astb...`);try{let e=await o({folderName:A,dirHandle:k,writeToDisk:M});j=e.wroteToLocalFolder?`granted`:j,$(),Xe(e),Q(`Built ${e.totalArtifacts} cartridges (${e.duoCount} Duos)`+(e.wroteToLocalFolder?` directly into ${A}/bytecode/`:` in memory.`))}catch(e){Q(`Build failed: ${e?.message||e}`,!0)}}},ke.onclick=()=>q.click(),q.onchange=async()=>{if(!q.files||q.files.length===0)return;let e=q.files[0].webkitRelativePath||``,t=e.includes(`/`)?e.split(`/`)[0]:`Selected Folder`;Q(`Compiling files from "${t}"...`);let n=await o({folderName:t,fileList:q.files,writeToDisk:!1});Xe(n),Q(`Compiled ${n.totalArtifacts} cartridges from "${t}".`),q.value=``};let Ze=async e=>{let t=await f(e);if(t.length===0){Q(`No .ast / .ast.svg source files found in selection.`,!0);return}let n=await o({folderName:`Selected Duo Files`,entries:t,writeToDisk:!!(k&&M),dirHandle:k||void 0});Xe(n),Q(`Compiled ${n.totalArtifacts} Duo cartridge(s) to .astb (${n.totalBytecodeBytes} B total).`)};return J.onclick=()=>Y.click(),J.ondragover=e=>{e.preventDefault(),J.style.borderColor=`#0284c7`,J.style.background=`#eff6ff`},J.ondragleave=()=>{J.style.borderColor=`#94a3b8`,J.style.background=`#f8fafc`},J.ondrop=async e=>{e.preventDefault(),J.style.borderColor=`#94a3b8`,J.style.background=`#f8fafc`,e.dataTransfer?.files&&e.dataTransfer.files.length>0&&await Ze(e.dataTransfer.files)},Y.onchange=async()=>{Y.files&&Y.files.length>0&&(await Ze(Y.files),Y.value=``)},Me.onclick=async()=>{let e=await s({id:`ohm-duo-demo`,astText:`(:scene :id "ohm-duo-demo" :type "Sim" :title "Ohm's Law Duo Sample" :stage "KS3 PHYSICS" :duration 12.0
      (:vars ((:var :name "voltage" :val 9.0 :min 1 :max 24 :step 0.5 :label "Voltage (V)")
              (:var :name "resistance" :val 3.0 :min 1 :max 12 :step 0.5 :label "Resistance (Ω)")))
      (:keyframes ((:t 0.0 :title "Circuit Closed" :rule "I = V / R")
                   (:t 0.5 :title "Steady Current" :rule "Ammeter steady at 3.0 A")))
      (:bindings ((:target "#bulb-glow" :attr "opacity" :expr "Math.min(1, (vars.voltage / vars.resistance) / 8)")))
      (:gestures ((:draggable :target "#voltage-slider" :axis "x" :min 1 :max 24))))`,svgText:`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#0f172a"/><rect x="120" y="140" width="560" height="200" rx="24" fill="none" stroke="#38bdf8" stroke-width="4"/><circle id="bulb-glow" cx="680" cy="240" r="36" fill="#facc15"/><circle id="voltage-slider" cx="400" cy="140" r="14" fill="#38bdf8"/></svg>`});Xe({folderName:`Built-in Sample Duo`,wroteToLocalFolder:!1,builtAt:Date.now(),totalArtifacts:1,duoCount:1,failedCount:0,totalSourceBytes:e.sourceBytes,totalBytecodeBytes:e.bytecodeBytes,artifacts:[e],manifestJson:{schemaVersion:`everyman-astb-duo/1.0`,entries:[{id:e.id,bytecodeBytes:e.bytecodeBytes,sha256:e.sha256}]},checksumsJson:{[`${e.id}.astb`]:e.sha256},errors:[]}),Q(`Compiled & booted Sample Duo (${e.bytecodeBytes} B .astb, OP_SVG_COMPANION embedded).`)},Fe.onclick=async()=>{if(N){for(let e of N.artifacts)await c(e);Q(`Mounted ${N.artifacts.length} compiled Duo cartridge(s) into local IndexedDB Vault.`)}},Ie.onclick=()=>{if(!N)return;let e=new Blob([JSON.stringify(N.manifestJson,null,2)],{type:`application/json`}),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`scenes.manifest.json`,n.style.display=`none`,document.body.appendChild(n),n.click(),setTimeout(()=>{URL.revokeObjectURL(t),n.remove()},500)},We.onchange=()=>{let e=We.value;ee({action:`set_render_mode`,surfaceId:L.surfaceId,mode:e})},Ge.onclick=()=>{if(Z.style.display!==`none`){Z.style.display=`none`;return}let e=JSON.stringify(p(L.surfaceId),null,2);Z.textContent=e,Z.style.display=`block`},Ke.onclick=()=>{L.dispatchTuple(0,i.TOGGLE_PLAY,0,0)},qe.onclick=()=>{L.dispatchTuple(0,i.RESET,0,0)},Je.onclick=()=>{R&&=(R(),null),Le.style.display=`none`,P=null},$(),O}export{D as default,D as renderCurriculumStudioPage};