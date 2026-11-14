// Auto-generated Domain Substrate: CORE
export const CORE_AST_STRING = ";; Domain AST Manifest: core\n(:domain-substrate :core\n  (:symbol \"ConceptGraphNode\" :from \"curriculum/conceptGraphEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ConceptGraphEdge\" :from \"curriculum/conceptGraphEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"DiagnosticRemediationRoute\" :from \"curriculum/conceptGraphEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ConceptGraphEngine\" :from \"curriculum/conceptGraphEngine.ts\" :kind :const :return \"ConceptGraphEngineSingleton\" :params ())\n  (:symbol \"adaptOakStage\" :from \"curriculum/curriculumAdapter.ts\" :kind :function :return \"StandardStage\" :params ((:param \"stage\" :type \"any\")))\n  (:symbol \"StandardTopic\" :from \"curriculum/curriculumAdapter.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"StandardSubject\" :from \"curriculum/curriculumAdapter.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"StandardStage\" :from \"curriculum/curriculumAdapter.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"generateCurriculumStockNumber\" :from \"curriculum/curriculumMesh.ts\" :kind :function :return \"string\" :params ((:param \"stageId\" :type \"string\") (:param \"subjectId\" :type \"string\") (:param \"topicId\" :type \"string\")))\n  (:symbol \"registerRouteNode\" :from \"curriculum/curriculumMesh.ts\" :kind :function :return \"void\" :params ((:param \"node\" :type \"CurriculumRouteNode\")))\n  (:symbol \"ingestCustomCurriculumPack\" :from \"curriculum/curriculumMesh.ts\" :kind :function :return \"number\" :params ((:param \"pack\" :type \"any\")))\n  (:symbol \"syncMeshToIndexedDB\" :from \"curriculum/curriculumMesh.ts\" :kind :function :return \"Promise<void>\" :params ())\n  (:symbol \"resolveCurriculumRoute\" :from \"curriculum/curriculumMesh.ts\" :kind :function :return \"CurriculumRouteNode\" :params ((:param \"stage\" :type \"string\") (:param \"subject\" :type \"string\") (:param \"topic\" :type \"string\") (:param \"lessonTitleOrId\" :type \"string\")))\n  (:symbol \"getQuestionForRoute\" :from \"curriculum/curriculumMesh.ts\" :kind :function :return \"CurriculumQuestionItem\" :params ((:param \"route\" :type \"CurriculumRouteNode\") (:param \"lessonTitleOrId\" :type \"string\") (:param \"forceVariation\" :type \"boolean\") (:param \"seedToken\" :type \"string\") (:param \"excludePrompt\" :type \"string\")))\n  (:symbol \"exportCurriculumMeshToSExpr\" :from \"curriculum/curriculumMesh.ts\" :kind :function :return \"string\" :params ())\n  (:symbol \"exportCurriculumMeshToJSON\" :from \"curriculum/curriculumMesh.ts\" :kind :function :return \"object\" :params ())\n  (:symbol \"ExecutionEngineType\" :from \"curriculum/curriculumMesh.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CurriculumQuestionItem\" :from \"curriculum/curriculumMesh.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CurriculumLessonNode\" :from \"curriculum/curriculumMesh.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CurriculumRouteNode\" :from \"curriculum/curriculumMesh.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ALL_CURRICULUM_ROUTES\" :from \"curriculum/curriculumMesh.ts\" :kind :const :return \"CurriculumRouteNode[]\" :params ())\n  (:symbol \"resolveTopicSimulator\" :from \"curriculum/curriculumSimMapping.ts\" :kind :function :return \"SimPresetBadge\" :params ((:param \"topicId\" :type \"string\") (:param \"topicTitle\" :type \"string\") (:param \"subjectTitle\" :type \"string\")))\n  (:symbol \"hasDataCartridge\" :from \"curriculum/curriculumSimMapping.ts\" :kind :function :return \"boolean\" :params ((:param \"topicId\" :type \"string\")))\n  (:symbol \"SimPresetBadge\" :from \"curriculum/curriculumSimMapping.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"FOLDER_MANIFEST\" :from \"curriculum/engine.ts\" :kind :const :return \"{ readonly folder: \"src/curriculum\"; readonly timestamp: 1787937755228; readonly totalModules: 2; readonly exports: readonly [{ readonly name: \"StandardTopic\"; readonly isType: true; readonly sourceFile: \"curriculumAdapter\"; }, ... 8 more ..., { ...; }]; }\" :params ())\n  (:symbol \"FolderExportNames\" :from \"curriculum/engine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"adaptOakStage\" :from \"curriculum/engine.ts\" :kind :function :return \"StandardStage\" :params ((:param \"stage\" :type \"any\")))\n  (:symbol \"StandardTopic\" :from \"curriculum/engine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"StandardSubject\" :from \"curriculum/engine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"StandardStage\" :from \"curriculum/engine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"findTopicLessons\" :from \"curriculum/engine.ts\" :kind :function :return \"OakLesson[]\" :params ((:param \"stageKey\" :type \"string\") (:param \"subjectTitle\" :type \"string\") (:param \"topicTitle\" :type \"string\")))\n  (:symbol \"OakLesson\" :from \"curriculum/engine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"OakTopic\" :from \"curriculum/engine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"OakSubject\" :from \"curriculum/engine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"OakStage\" :from \"curriculum/engine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"OAK_CURRICULUM_CATALOGUE\" :from \"curriculum/engine.ts\" :kind :const :return \"Record<string, OakStage>\" :params ())\n  (:symbol \"OakCatalogue\" :from \"curriculum/engine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"DEFAULT_OAK_CATALOGUE\" :from \"curriculum/engine.ts\" :kind :const :return \"OakCatalogue\" :params ())\n  (:symbol \"getActiveCurriculum\" :from \"curriculum/index.ts\" :kind :function :return \"CurriculumPackage\" :params ((:param \"id\" :type \"string\")))\n  (:symbol \"dispatchAstIntent\" :from \"curriculum/index.ts\" :kind :function :return \"T\" :params ((:param \"symbolName\" :type \"string\") (:param \"args\" :type \"any[]\")))\n  (:symbol \"CurriculumPackage\" :from \"curriculum/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CurriculumRegistry\" :from \"curriculum/index.ts\" :kind :const :return \"Record<string, CurriculumPackage>\" :params ())\n  (:symbol \"generateCurriculumStockNumber\" :from \"curriculum/index.ts\" :kind :function :return \"string\" :params ((:param \"stageId\" :type \"string\") (:param \"subjectId\" :type \"string\") (:param \"topicId\" :type \"string\")))\n  (:symbol \"registerRouteNode\" :from \"curriculum/index.ts\" :kind :function :return \"void\" :params ((:param \"node\" :type \"CurriculumRouteNode\")))\n  (:symbol \"ingestCustomCurriculumPack\" :from \"curriculum/index.ts\" :kind :function :return \"number\" :params ((:param \"pack\" :type \"any\")))\n  (:symbol \"syncMeshToIndexedDB\" :from \"curriculum/index.ts\" :kind :function :return \"Promise<void>\" :params ())\n  (:symbol \"resolveCurriculumRoute\" :from \"curriculum/index.ts\" :kind :function :return \"CurriculumRouteNode\" :params ((:param \"stage\" :type \"string\") (:param \"subject\" :type \"string\") (:param \"topic\" :type \"string\") (:param \"lessonTitleOrId\" :type \"string\")))\n  (:symbol \"getQuestionForRoute\" :from \"curriculum/index.ts\" :kind :function :return \"CurriculumQuestionItem\" :params ((:param \"route\" :type \"CurriculumRouteNode\") (:param \"lessonTitleOrId\" :type \"string\") (:param \"forceVariation\" :type \"boolean\") (:param \"seedToken\" :type \"string\") (:param \"excludePrompt\" :type \"string\")))\n  (:symbol \"exportCurriculumMeshToSExpr\" :from \"curriculum/index.ts\" :kind :function :return \"string\" :params ())\n  (:symbol \"exportCurriculumMeshToJSON\" :from \"curriculum/index.ts\" :kind :function :return \"object\" :params ())\n  (:symbol \"ExecutionEngineType\" :from \"curriculum/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CurriculumQuestionItem\" :from \"curriculum/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CurriculumLessonNode\" :from \"curriculum/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CurriculumRouteNode\" :from \"curriculum/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ALL_CURRICULUM_ROUTES\" :from \"curriculum/index.ts\" :kind :const :return \"CurriculumRouteNode[]\" :params ())\n  (:symbol \"generateCurriculumAst\" :from \"curriculum/mineCurriculumAst.ts\" :kind :function :return \"void\" :params ((:param \"dirPath\" :type \"string\") (:param \"outputPath\" :type \"string\")))\n  (:symbol \"findTopicLessons\" :from \"curriculum/oakCatalogue.ts\" :kind :function :return \"OakLesson[]\" :params ((:param \"stageKey\" :type \"string\") (:param \"subjectTitle\" :type \"string\") (:param \"topicTitle\" :type \"string\")))\n  (:symbol \"OakLesson\" :from \"curriculum/oakCatalogue.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"OakTopic\" :from \"curriculum/oakCatalogue.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"OakSubject\" :from \"curriculum/oakCatalogue.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"OakStage\" :from \"curriculum/oakCatalogue.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"OAK_CURRICULUM_CATALOGUE\" :from \"curriculum/oakCatalogue.ts\" :kind :const :return \"Record<string, OakStage>\" :params ())\n  (:symbol \"OakCatalogue\" :from \"curriculum/oakCatalogue.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"DEFAULT_OAK_CATALOGUE\" :from \"curriculum/oakCatalogue.ts\" :kind :const :return \"OakCatalogue\" :params ())\n  (:symbol \"AltarTypeInfo\" :from \"data/catholic/altarData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AltarCandleRule\" :from \"data/catholic/altarData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AltarAppointment\" :from \"data/catholic/altarData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AltarDressingStep\" :from \"data/catholic/altarData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LiturgicalSeasonTheme\" :from \"data/catholic/altarData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LITURGICAL_SEASON_THEMES\" :from \"data/catholic/altarData.ts\" :kind :const :return \"Record<string, LiturgicalSeasonTheme>\" :params ())\n  (:symbol \"ALTAR_CANDLE_RULES\" :from \"data/catholic/altarData.ts\" :kind :const :return \"Record<\"daily\" | \"sunday\" | \"bishop\", AltarCandleRule>\" :params ())\n  (:symbol \"ALTAR_TYPES\" :from \"data/catholic/altarData.ts\" :kind :const :return \"AltarTypeInfo[]\" :params ())\n  (:symbol \"ALTAR_APPOINTMENTS\" :from \"data/catholic/altarData.ts\" :kind :const :return \"AltarAppointment[]\" :params ())\n  (:symbol \"ALTAR_DRESSING_STEPS\" :from \"data/catholic/altarData.ts\" :kind :const :return \"AltarDressingStep[]\" :params ())\n  (:symbol \"TabernacleCatechesis\" :from \"data/catholic/altarData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"TABERNACLE_CATECHESIS\" :from \"data/catholic/altarData.ts\" :kind :const :return \"TabernacleCatechesis\" :params ())\n  (:symbol \"RiteAltarTradition\" :from \"data/catholic/altarData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"RITE_ALTAR_TRADITIONS\" :from \"data/catholic/altarData.ts\" :kind :const :return \"RiteAltarTradition[]\" :params ())\n  (:symbol \"CatholicPrayer\" :from \"data/catholic/catholicPrayers.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CATHOLIC_PRAYERS\" :from \"data/catholic/catholicPrayers.ts\" :kind :const :return \"CatholicPrayer[]\" :params ())\n  (:symbol \"SuiIurisChurch\" :from \"data/catholic/catholicRitesData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LiturgicalRiteFamily\" :from \"data/catholic/catholicRitesData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LiturgicalComparisonTopic\" :from \"data/catholic/catholicRitesData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ConsecrationVoiceSample\" :from \"data/catholic/catholicRitesData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LITURGICAL_RITE_FAMILIES\" :from \"data/catholic/catholicRitesData.ts\" :kind :const :return \"LiturgicalRiteFamily[]\" :params ())\n  (:symbol \"SUI_IURIS_CHURCHES\" :from \"data/catholic/catholicRitesData.ts\" :kind :const :return \"SuiIurisChurch[]\" :params ())\n  (:symbol \"LITURGICAL_COMPARISONS\" :from \"data/catholic/catholicRitesData.ts\" :kind :const :return \"LiturgicalComparisonTopic[]\" :params ())\n  (:symbol \"CONSECRATION_VOICES\" :from \"data/catholic/catholicRitesData.ts\" :kind :const :return \"ConsecrationVoiceSample[]\" :params ())\n  (:symbol \"CSTPrinciple\" :from \"data/catholic/cstAndVirtues.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CST_PRINCIPLES\" :from \"data/catholic/cstAndVirtues.ts\" :kind :const :return \"CSTPrinciple[]\" :params ())\n  (:symbol \"SchoolVirtue\" :from \"data/catholic/cstAndVirtues.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SCHOOL_VIRTUES\" :from \"data/catholic/cstAndVirtues.ts\" :kind :const :return \"SchoolVirtue[]\" :params ())\n  (:symbol \"HolyOil\" :from \"data/catholic/holyOilsData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"HolyAmbryInfo\" :from \"data/catholic/holyOilsData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"HOLY_OILS\" :from \"data/catholic/holyOilsData.ts\" :kind :const :return \"HolyOil[]\" :params ())\n  (:symbol \"HOLY_AMBRY_INFO\" :from \"data/catholic/holyOilsData.ts\" :kind :const :return \"HolyAmbryInfo\" :params ())\n  (:symbol \"SacramentalOilQuizQuestion\" :from \"data/catholic/holyOilsData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"HOLY_OILS_QUIZ\" :from \"data/catholic/holyOilsData.ts\" :kind :const :return \"SacramentalOilQuizQuestion[]\" :params ())\n  (:symbol \"HolyWaterFact\" :from \"data/catholic/holyWaterThuriferData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ThuriferRoleFact\" :from \"data/catholic/holyWaterThuriferData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"IncensationMoment\" :from \"data/catholic/holyWaterThuriferData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"HolyWaterThuriferQuiz\" :from \"data/catholic/holyWaterThuriferData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"HOLY_WATER_CATECHESIS\" :from \"data/catholic/holyWaterThuriferData.ts\" :kind :const :return \"HolyWaterFact[]\" :params ())\n  (:symbol \"THURIFER_AND_INCENSE_CATECHESIS\" :from \"data/catholic/holyWaterThuriferData.ts\" :kind :const :return \"ThuriferRoleFact[]\" :params ())\n  (:symbol \"INCENSATION_MOMENTS\" :from \"data/catholic/holyWaterThuriferData.ts\" :kind :const :return \"IncensationMoment[]\" :params ())\n  (:symbol \"HOLY_WATER_THURIFER_QUIZ\" :from \"data/catholic/holyWaterThuriferData.ts\" :kind :const :return \"HolyWaterThuriferQuiz[]\" :params ())\n  (:symbol \"CSTPrinciple\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CST_PRINCIPLES\" :from \"data/catholic/index.ts\" :kind :const :return \"CSTPrinciple[]\" :params ())\n  (:symbol \"SchoolVirtue\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SCHOOL_VIRTUES\" :from \"data/catholic/index.ts\" :kind :const :return \"SchoolVirtue[]\" :params ())\n  (:symbol \"LiturgyStep\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LITURGY_STEPS\" :from \"data/catholic/index.ts\" :kind :const :return \"LiturgyStep[]\" :params ())\n  (:symbol \"CORRECT_LITURGY_SEQUENCE_IDS\" :from \"data/catholic/index.ts\" :kind :const :return \"string[]\" :params ())\n  (:symbol \"SacredObject\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SACRED_OBJECTS\" :from \"data/catholic/index.ts\" :kind :const :return \"SacredObject[]\" :params ())\n  (:symbol \"CatholicPrayer\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CATHOLIC_PRAYERS\" :from \"data/catholic/index.ts\" :kind :const :return \"CatholicPrayer[]\" :params ())\n  (:symbol \"LatinPrayerVerse\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LatinPrayerItem\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LATIN_PRAYERS_DATA\" :from \"data/catholic/index.ts\" :kind :const :return \"LatinPrayerItem[]\" :params ())\n  (:symbol \"StationQuest\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SANCTUARY_QUESTS\" :from \"data/catholic/index.ts\" :kind :const :return \"StationQuest[]\" :params ())\n  (:symbol \"SacramentData\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SacramentQuizQuestion\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SEVEN_SACRAMENTS\" :from \"data/catholic/index.ts\" :kind :const :return \"SacramentData[]\" :params ())\n  (:symbol \"SACRAMENTS_QUIZ_QUESTIONS\" :from \"data/catholic/index.ts\" :kind :const :return \"SacramentQuizQuestion[]\" :params ())\n  (:symbol \"getCurrentSeasonByDate\" :from \"data/catholic/index.ts\" :kind :function :return \"LiturgicalSeason\" :params ())\n  (:symbol \"LiturgicalSeason\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LiturgicalQuizItem\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LITURGICAL_SEASONS\" :from \"data/catholic/index.ts\" :kind :const :return \"LiturgicalSeason[]\" :params ())\n  (:symbol \"LITURGICAL_QUIZ_QUESTIONS\" :from \"data/catholic/index.ts\" :kind :const :return \"LiturgicalQuizItem[]\" :params ())\n  (:symbol \"CATHOLIC_KS2_KNOWLEDGE\" :from \"data/catholic/index.ts\" :kind :const :return \"Record<string, CurriculumTopicKnowledge>\" :params ())\n  (:symbol \"CATHOLIC_KS3_KNOWLEDGE\" :from \"data/catholic/index.ts\" :kind :const :return \"Record<string, CurriculumTopicEntry>\" :params ())\n  (:symbol \"AltarTypeInfo\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AltarCandleRule\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AltarAppointment\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AltarDressingStep\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LiturgicalSeasonTheme\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LITURGICAL_SEASON_THEMES\" :from \"data/catholic/index.ts\" :kind :const :return \"Record<string, LiturgicalSeasonTheme>\" :params ())\n  (:symbol \"ALTAR_CANDLE_RULES\" :from \"data/catholic/index.ts\" :kind :const :return \"Record<\"daily\" | \"sunday\" | \"bishop\", AltarCandleRule>\" :params ())\n  (:symbol \"ALTAR_TYPES\" :from \"data/catholic/index.ts\" :kind :const :return \"AltarTypeInfo[]\" :params ())\n  (:symbol \"ALTAR_APPOINTMENTS\" :from \"data/catholic/index.ts\" :kind :const :return \"AltarAppointment[]\" :params ())\n  (:symbol \"ALTAR_DRESSING_STEPS\" :from \"data/catholic/index.ts\" :kind :const :return \"AltarDressingStep[]\" :params ())\n  (:symbol \"TabernacleCatechesis\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"TABERNACLE_CATECHESIS\" :from \"data/catholic/index.ts\" :kind :const :return \"TabernacleCatechesis\" :params ())\n  (:symbol \"RiteAltarTradition\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"RITE_ALTAR_TRADITIONS\" :from \"data/catholic/index.ts\" :kind :const :return \"RiteAltarTradition[]\" :params ())\n  (:symbol \"HolyOil\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"HolyAmbryInfo\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"HOLY_OILS\" :from \"data/catholic/index.ts\" :kind :const :return \"HolyOil[]\" :params ())\n  (:symbol \"HOLY_AMBRY_INFO\" :from \"data/catholic/index.ts\" :kind :const :return \"HolyAmbryInfo\" :params ())\n  (:symbol \"SacramentalOilQuizQuestion\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"HOLY_OILS_QUIZ\" :from \"data/catholic/index.ts\" :kind :const :return \"SacramentalOilQuizQuestion[]\" :params ())\n  (:symbol \"ReceptionMethod\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"OurFatherPosture\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LiturgicalMyth\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"EUCHARISTIC_RECEPTION_METHODS\" :from \"data/catholic/index.ts\" :kind :const :return \"ReceptionMethod[]\" :params ())\n  (:symbol \"OUR_FATHER_POSTURES\" :from \"data/catholic/index.ts\" :kind :const :return \"OurFatherPosture[]\" :params ())\n  (:symbol \"LITURGICAL_MYTHS\" :from \"data/catholic/index.ts\" :kind :const :return \"LiturgicalMyth[]\" :params ())\n  (:symbol \"HolyWaterFact\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ThuriferRoleFact\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"IncensationMoment\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"HolyWaterThuriferQuiz\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"HOLY_WATER_CATECHESIS\" :from \"data/catholic/index.ts\" :kind :const :return \"HolyWaterFact[]\" :params ())\n  (:symbol \"THURIFER_AND_INCENSE_CATECHESIS\" :from \"data/catholic/index.ts\" :kind :const :return \"ThuriferRoleFact[]\" :params ())\n  (:symbol \"INCENSATION_MOMENTS\" :from \"data/catholic/index.ts\" :kind :const :return \"IncensationMoment[]\" :params ())\n  (:symbol \"HOLY_WATER_THURIFER_QUIZ\" :from \"data/catholic/index.ts\" :kind :const :return \"HolyWaterThuriferQuiz[]\" :params ())\n  (:symbol \"StationOfTheCross\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"OPENING_DEVOTIONAL_VERSICLE\" :from \"data/catholic/index.ts\" :kind :const :return \"{ leaderLatin: string; leaderEnglish: string; responseLatin: string; responseEnglish: string; }\" :params ())\n  (:symbol \"STATIONS_OF_THE_CROSS\" :from \"data/catholic/index.ts\" :kind :const :return \"StationOfTheCross[]\" :params ())\n  (:symbol \"STATIONS_HISTORY_AND_THEOLOGY\" :from \"data/catholic/index.ts\" :kind :const :return \"{ historicalOrigins: string; traditionalNumber: string; scripturalAndTraditionalStations: string; plenaryIndulgence: string; }\" :params ())\n  (:symbol \"getCurrentCanonicalHour\" :from \"data/catholic/index.ts\" :kind :function :return \"CanonicalHour\" :params ((:param \"date\" :type \"Date\")))\n  (:symbol \"CanonicalHour\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"MarianAntiphon\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CANONICAL_HOURS\" :from \"data/catholic/index.ts\" :kind :const :return \"CanonicalHour[]\" :params ())\n  (:symbol \"MARIAN_ANTIPHONS\" :from \"data/catholic/index.ts\" :kind :const :return \"MarianAntiphon[]\" :params ())\n  (:symbol \"FOUR_WEEK_PSALTER_EXPLANATION\" :from \"data/catholic/index.ts\" :kind :const :return \"{ title: string; description: string; structureRules: string[]; }\" :params ())\n  (:symbol \"BREVIARY_FAQS\" :from \"data/catholic/index.ts\" :kind :const :return \"{ question: string; answer: string; }[]\" :params ())\n  (:symbol \"TriduumCeremony\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"TriduumMovement\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LumenChristiStep\" :from \"data/catholic/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LUMEN_CHRISTI_CEREMONY_STEPS\" :from \"data/catholic/index.ts\" :kind :const :return \"LumenChristiStep[]\" :params ())\n  (:symbol \"TRIDUUM_MOVEMENTS\" :from \"data/catholic/index.ts\" :kind :const :return \"TriduumMovement[]\" :params ())\n  (:symbol \"EXSULTET_SACRED_TEXT\" :from \"data/catholic/index.ts\" :kind :const :return \"{ latinTitle: string; englishTitle: string; openingInvocation: { latin: string; english: string; spanish: string; }; felixCulpaStanza: { latin: string; english: string; spanish: string; }; pillarOfFireStanza: { ...; }; }\" :params ())\n  (:symbol \"VICTIMAE_PASCHALI_SEQUENCE\" :from \"data/catholic/index.ts\" :kind :const :return \"{ latinTitle: string; englishTitle: string; stanzas: { latin: string; english: string; spanish: string; }[]; }\" :params ())\n  (:symbol \"LatinPrayerVerse\" :from \"data/catholic/latinPrayers.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LatinPrayerItem\" :from \"data/catholic/latinPrayers.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LATIN_PRAYERS_DATA\" :from \"data/catholic/latinPrayers.ts\" :kind :const :return \"LatinPrayerItem[]\" :params ())\n  (:symbol \"getCurrentSeasonByDate\" :from \"data/catholic/liturgicalCalendar.ts\" :kind :function :return \"LiturgicalSeason\" :params ())\n  (:symbol \"LiturgicalSeason\" :from \"data/catholic/liturgicalCalendar.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LiturgicalQuizItem\" :from \"data/catholic/liturgicalCalendar.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LITURGICAL_SEASONS\" :from \"data/catholic/liturgicalCalendar.ts\" :kind :const :return \"LiturgicalSeason[]\" :params ())\n  (:symbol \"LITURGICAL_QUIZ_QUESTIONS\" :from \"data/catholic/liturgicalCalendar.ts\" :kind :const :return \"LiturgicalQuizItem[]\" :params ())\n  (:symbol \"ReceptionMethod\" :from \"data/catholic/liturgicalPosturesData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"OurFatherPosture\" :from \"data/catholic/liturgicalPosturesData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LiturgicalMyth\" :from \"data/catholic/liturgicalPosturesData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"EUCHARISTIC_RECEPTION_METHODS\" :from \"data/catholic/liturgicalPosturesData.ts\" :kind :const :return \"ReceptionMethod[]\" :params ())\n  (:symbol \"OUR_FATHER_POSTURES\" :from \"data/catholic/liturgicalPosturesData.ts\" :kind :const :return \"OurFatherPosture[]\" :params ())\n  (:symbol \"LITURGICAL_MYTHS\" :from \"data/catholic/liturgicalPosturesData.ts\" :kind :const :return \"LiturgicalMyth[]\" :params ())\n  (:symbol \"getCurrentCanonicalHour\" :from \"data/catholic/liturgyOfTheHoursData.ts\" :kind :function :return \"CanonicalHour\" :params ((:param \"date\" :type \"Date\")))\n  (:symbol \"CanonicalHour\" :from \"data/catholic/liturgyOfTheHoursData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"MarianAntiphon\" :from \"data/catholic/liturgyOfTheHoursData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CANONICAL_HOURS\" :from \"data/catholic/liturgyOfTheHoursData.ts\" :kind :const :return \"CanonicalHour[]\" :params ())\n  (:symbol \"MARIAN_ANTIPHONS\" :from \"data/catholic/liturgyOfTheHoursData.ts\" :kind :const :return \"MarianAntiphon[]\" :params ())\n  (:symbol \"FOUR_WEEK_PSALTER_EXPLANATION\" :from \"data/catholic/liturgyOfTheHoursData.ts\" :kind :const :return \"{ title: string; description: string; structureRules: string[]; }\" :params ())\n  (:symbol \"BREVIARY_FAQS\" :from \"data/catholic/liturgyOfTheHoursData.ts\" :kind :const :return \"{ question: string; answer: string; }[]\" :params ())\n  (:symbol \"LiturgyStep\" :from \"data/catholic/liturgySteps.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LITURGY_STEPS\" :from \"data/catholic/liturgySteps.ts\" :kind :const :return \"LiturgyStep[]\" :params ())\n  (:symbol \"CORRECT_LITURGY_SEQUENCE_IDS\" :from \"data/catholic/liturgySteps.ts\" :kind :const :return \"string[]\" :params ())\n  (:symbol \"CATHOLIC_KS2_KNOWLEDGE\" :from \"data/catholic/reCurriculumKnowledge.ts\" :kind :const :return \"Record<string, CurriculumTopicKnowledge>\" :params ())\n  (:symbol \"CATHOLIC_KS3_KNOWLEDGE\" :from \"data/catholic/reKs3CurriculumKnowledge.ts\" :kind :const :return \"Record<string, CurriculumTopicEntry>\" :params ())\n  (:symbol \"SacredObject\" :from \"data/catholic/sacredObjects.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SACRED_OBJECTS\" :from \"data/catholic/sacredObjects.ts\" :kind :const :return \"SacredObject[]\" :params ())\n  (:symbol \"StationQuest\" :from \"data/catholic/sanctuaryQuests.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SANCTUARY_QUESTS\" :from \"data/catholic/sanctuaryQuests.ts\" :kind :const :return \"StationQuest[]\" :params ())\n  (:symbol \"SacramentData\" :from \"data/catholic/sevenSacraments.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SacramentQuizQuestion\" :from \"data/catholic/sevenSacraments.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SEVEN_SACRAMENTS\" :from \"data/catholic/sevenSacraments.ts\" :kind :const :return \"SacramentData[]\" :params ())\n  (:symbol \"SACRAMENTS_QUIZ_QUESTIONS\" :from \"data/catholic/sevenSacraments.ts\" :kind :const :return \"SacramentQuizQuestion[]\" :params ())\n  (:symbol \"StationOfTheCross\" :from \"data/catholic/stationsOfTheCrossData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"OPENING_DEVOTIONAL_VERSICLE\" :from \"data/catholic/stationsOfTheCrossData.ts\" :kind :const :return \"{ leaderLatin: string; leaderEnglish: string; responseLatin: string; responseEnglish: string; }\" :params ())\n  (:symbol \"STATIONS_OF_THE_CROSS\" :from \"data/catholic/stationsOfTheCrossData.ts\" :kind :const :return \"StationOfTheCross[]\" :params ())\n  (:symbol \"STATIONS_HISTORY_AND_THEOLOGY\" :from \"data/catholic/stationsOfTheCrossData.ts\" :kind :const :return \"{ historicalOrigins: string; traditionalNumber: string; scripturalAndTraditionalStations: string; plenaryIndulgence: string; }\" :params ())\n  (:symbol \"TriduumCeremony\" :from \"data/catholic/triduumEasterData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"TriduumMovement\" :from \"data/catholic/triduumEasterData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LumenChristiStep\" :from \"data/catholic/triduumEasterData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LUMEN_CHRISTI_CEREMONY_STEPS\" :from \"data/catholic/triduumEasterData.ts\" :kind :const :return \"LumenChristiStep[]\" :params ())\n  (:symbol \"TRIDUUM_MOVEMENTS\" :from \"data/catholic/triduumEasterData.ts\" :kind :const :return \"TriduumMovement[]\" :params ())\n  (:symbol \"EXSULTET_SACRED_TEXT\" :from \"data/catholic/triduumEasterData.ts\" :kind :const :return \"{ latinTitle: string; englishTitle: string; openingInvocation: { latin: string; english: string; spanish: string; }; felixCulpaStanza: { latin: string; english: string; spanish: string; }; pillarOfFireStanza: { ...; }; }\" :params ())\n  (:symbol \"VICTIMAE_PASCHALI_SEQUENCE\" :from \"data/catholic/triduumEasterData.ts\" :kind :const :return \"{ latinTitle: string; englishTitle: string; stanzas: { latin: string; english: string; spanish: string; }[]; }\" :params ())\n  (:symbol \"getComplianceCaveat\" :from \"data/complianceCaveats.ts\" :kind :function :return \"ComplianceCaveat\" :params ((:param \"langCode\" :type \"string\")))\n  (:symbol \"ComplianceCaveat\" :from \"data/complianceCaveats.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"COMPLIANCE_CAVEATS\" :from \"data/complianceCaveats.ts\" :kind :const :return \"Record<string, ComplianceCaveat>\" :params ())\n  (:symbol \"CURRICULUM_COMPLETE_BASE\" :from \"data/curriculumKnowledgeComplete.ts\" :kind :const :return \"Record<string, CurriculumTopicEntry>\" :params ())\n  (:symbol \"CurriculumTopicEntry\" :from \"data/curriculumKnowledgeExpansion.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CURRICULUM_EXPANSION_BASE\" :from \"data/curriculumKnowledgeExpansion.ts\" :kind :const :return \"Record<string, CurriculumTopicEntry>\" :params ())\n  (:symbol \"getActiveCurriculumTree\" :from \"data/curriculumRegistry.ts\" :kind :function :return \"Record<string, StandardStage>\" :params ((:param \"providerKey\" :type \"CurriculumProviderKey\")))\n  (:symbol \"CurriculumProviderKey\" :from \"data/curriculumRegistry.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CURRICULUM_PROVIDERS\" :from \"data/curriculumRegistry.ts\" :kind :const :return \"Record<CurriculumProviderKey, () => Record<string, StandardStage>>\" :params ())\n  (:symbol \"LessonCard\" :from \"data/homeCurriculum.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"FEATURED_LESSONS\" :from \"data/homeCurriculum.ts\" :kind :const :return \"LessonCard[]\" :params ())\n  (:symbol \"LanguagePhoneme\" :from \"data/languagesCurriculumData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"VerbConjugation\" :from \"data/languagesCurriculumData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"EtymologyCognate\" :from \"data/languagesCurriculumData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LANGUAGE_PHONEMES\" :from \"data/languagesCurriculumData.ts\" :kind :const :return \"LanguagePhoneme[]\" :params ())\n  (:symbol \"VERB_CONJUGATIONS\" :from \"data/languagesCurriculumData.ts\" :kind :const :return \"VerbConjugation[]\" :params ())\n  (:symbol \"ETYMOLOGY_COGNATES\" :from \"data/languagesCurriculumData.ts\" :kind :const :return \"EtymologyCognate[]\" :params ())\n  (:symbol \"NavRouteItem\" :from \"data/navigationManifest.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"NavGroup\" :from \"data/navigationManifest.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CATHOLIC_SANCTUARY_ITEMS\" :from \"data/navigationManifest.ts\" :kind :const :return \"NavRouteItem[]\" :params ())\n  (:symbol \"CURRICULUM_LAB_ITEMS\" :from \"data/navigationManifest.ts\" :kind :const :return \"NavRouteItem[]\" :params ())\n  (:symbol \"SCHOOL_GOVERNANCE_ITEMS\" :from \"data/navigationManifest.ts\" :kind :const :return \"NavRouteItem[]\" :params ())\n  (:symbol \"NAV_GROUPS\" :from \"data/navigationManifest.ts\" :kind :const :return \"NavGroup[]\" :params ())\n  (:symbol \"findCurriculumKnowledge\" :from \"data/oakCurriculumKnowledge.ts\" :kind :function :return \"CurriculumTopicKnowledge\" :params ((:param \"stage\" :type \"string\") (:param \"subject\" :type \"string\") (:param \"topic\" :type \"string\")))\n  (:symbol \"CurriculumQuestion\" :from \"data/oakCurriculumKnowledge.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CurriculumTopicKnowledge\" :from \"data/oakCurriculumKnowledge.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CURRICULUM_KNOWLEDGE_BASE\" :from \"data/oakCurriculumKnowledge.ts\" :kind :const :return \"Record<string, CurriculumTopicKnowledge>\" :params ())\n  (:symbol \"OakLessonSeed\" :from \"data/oakCurriculumSeeds.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"OAK_CURRICULUM_SEEDS\" :from \"data/oakCurriculumSeeds.ts\" :kind :const :return \"Record<string, OakLessonSeed>\" :params ())\n  (:symbol \"getPhonemeSpokenText\" :from \"data/phonicsCurriculumData.ts\" :kind :function :return \"string\" :params ((:param \"grapheme\" :type \"string\") (:param \"fallbackHint\" :type \"string\")))\n  (:symbol \"PhonicGrapheme\" :from \"data/phonicsCurriculumData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SoundSegment\" :from \"data/phonicsCurriculumData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"DecodableWord\" :from \"data/phonicsCurriculumData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ScreeningWord\" :from \"data/phonicsCurriculumData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"TrickyWord\" :from \"data/phonicsCurriculumData.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"PHONETIC_AUDIO_MAP\" :from \"data/phonicsCurriculumData.ts\" :kind :const :return \"Record<string, string>\" :params ())\n  (:symbol \"PHONICS_GRAPHEMES\" :from \"data/phonicsCurriculumData.ts\" :kind :const :return \"PhonicGrapheme[]\" :params ())\n  (:symbol \"DECODABLE_WORDS\" :from \"data/phonicsCurriculumData.ts\" :kind :const :return \"DecodableWord[]\" :params ())\n  (:symbol \"OFFICIAL_SCREENING_POOL\" :from \"data/phonicsCurriculumData.ts\" :kind :const :return \"ScreeningWord[]\" :params ())\n  (:symbol \"TRICKY_WORDS\" :from \"data/phonicsCurriculumData.ts\" :kind :const :return \"TrickyWord[]\" :params ())\n  (:symbol \"getRelatedConcepts\" :from \"data/player/astConceptGraph.ts\" :kind :function :return \"{ id: string; title: string; stage: string; icon: string; reason: string; relationshipType: string; invariantConcept: string; }[]\" :params ((:param \"presetId\" :type \"string\")))\n  (:symbol \"ConceptNode\" :from \"data/player/astConceptGraph.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AST_CONCEPT_GRAPH\" :from \"data/player/astConceptGraph.ts\" :kind :const :return \"Record<string, ConceptNode>\" :params ())\n  (:symbol \"getOfficialCartridgeRecord\" :from \"data/player/cartridgeChecksums.ts\" :kind :function :return \"CartridgeChecksumEntry\" :params ((:param \"id\" :type \"string\")))\n  (:symbol \"isOfficialNativeCartridge\" :from \"data/player/cartridgeChecksums.ts\" :kind :function :return \"boolean\" :params ((:param \"id\" :type \"string\")))\n  (:symbol \"CartridgeChecksumEntry\" :from \"data/player/cartridgeChecksums.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CartridgeRegistryManifest\" :from \"data/player/cartridgeChecksums.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CARTRIDGE_CHECKSUMS\" :from \"data/player/cartridgeChecksums.ts\" :kind :const :return \"CartridgeRegistryManifest\" :params ())\n  (:symbol \"OFFICIAL_AUTHORITY\" :from \"data/player/cartridgeChecksums.ts\" :kind :const :return \"\"St Joseph's Catholic Primary School Curriculum Authority\"\" :params ())\n  (:symbol \"BuiltinDataCartridgeDefinition\" :from \"data/player/dataCartridges.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BUILTIN_DATA_CARTRIDGES\" :from \"data/player/dataCartridges.ts\" :kind :const :return \"BuiltinDataCartridgeDefinition[]\" :params ())\n  (:symbol \"EmbeddedCartridgeData\" :from \"data/player/embeddedCoreCartridges.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"EMBEDDED_CORE_CARTRIDGES\" :from \"data/player/embeddedCoreCartridges.ts\" :kind :const :return \"Record<string, EmbeddedCartridgeData>\" :params ())\n  (:symbol \"CartridgeType\" :from \"data/player/generatedScenes.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ScenePresetOption\" :from \"data/player/generatedScenes.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"PRESET_OPTIONS\" :from \"data/player/generatedScenes.ts\" :kind :const :return \"ScenePresetOption[]\" :params ())\n  (:symbol \"DramaticChoice\" :from \"data/shakespearePlays.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"PlayAct\" :from \"data/shakespearePlays.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ShakespearePlayStory\" :from \"data/shakespearePlays.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SHAKESPEARE_PLAY_STORIES\" :from \"data/shakespearePlays.ts\" :kind :const :return \"ShakespearePlayStory[]\" :params ())\n  (:symbol \"COMMUNION_MANIFEST\" :from \"manifests/communion.ts\" :kind :const :return \"DomainManifest\" :params ())\n  (:symbol \"SCHOOL_MANIFEST\" :from \"manifests/school.ts\" :kind :const :return \"DomainManifest\" :params ())\n  (:symbol \"VFS_CURRICULUM_SEEDS\" :from \"manifests/vfsSeedModules.ts\" :kind :const :return \"Record<string, string>\" :params ())\n  (:symbol \"registerServiceWorker\" :from \"registerServiceWorker.ts\" :kind :function :return \"void\" :params ())\n  (:symbol \"normalizePath\" :from \"router.ts\" :kind :function :return \"string\" :params ((:param \"rawPath\" :type \"string\")))\n  (:symbol \"navigate\" :from \"router.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"path\" :type \"string\")))\n  (:symbol \"handleRouteChange\" :from \"router.ts\" :kind :function :return \"Promise<void>\" :params ())\n  (:symbol \"initRouter\" :from \"router.ts\" :kind :function :return \"void\" :params ())\n  (:symbol \"RouteView\" :from \"router.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"RouteHandler\" :from \"router.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"navigateTo\" :from \"router.ts\" :kind :const :return \"Promise<void>\" :params ((:param \"path\" :type \"string\")))\n  (:symbol \"getRuleSet\" :from \"rules/index.ts\" :kind :function :return \"RulePackage\" :params ((:param \"name\" :type \"string\")))\n  (:symbol \"RulePackage\" :from \"rules/index.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"RulesRegistry\" :from \"rules/index.ts\" :kind :const :return \"Record<string, RulePackage>\" :params ())\n  (:symbol \"SemanticRule\" :from \"types/learning-ast.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"Challenge\" :from \"types/learning-ast.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"Cohort\" :from \"types/learning-ast.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"TutorPersona\" :from \"types/learning-ast.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"DomainManifest\" :from \"types/learning-ast.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LearningStream\" :from \"types/learning-ast.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CatalogItem\" :from \"types/learning-ast.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"StreamCategory\" :from \"types/learning-ast.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"MasterCatalog\" :from \"types/learning-ast.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"defineASTScene\" :from \"types/mediaPlayer.ts\" :kind :function :return \"ASTSceneDefinition\" :params ((:param \"scene\" :type \"ASTSceneDefinition\")))\n  (:symbol \"ASTKeyframe\" :from \"types/mediaPlayer.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ASTSubtitle\" :from \"types/mediaPlayer.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ASTAudioCue\" :from \"types/mediaPlayer.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ASTSceneDefinition\" :from \"types/mediaPlayer.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ASTPlayerCommand\" :from \"types/mediaPlayer.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ASTPlayerTelemetry\" :from \"types/mediaPlayer.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"getPresetConfig\" :from \"types/playerConfig.ts\" :kind :function :return \"PlayerDisplayConfig\" :params ((:param \"mode\" :type \"PlayerDisplayMode\")))\n  (:symbol \"loadSavedPlayerConfig\" :from \"types/playerConfig.ts\" :kind :function :return \"PlayerDisplayConfig\" :params ())\n  (:symbol \"savePlayerConfig\" :from \"types/playerConfig.ts\" :kind :function :return \"void\" :params ((:param \"config\" :type \"PlayerDisplayConfig\")))\n  (:symbol \"PlayerDisplayMode\" :from \"types/playerConfig.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"PlayerDisplayConfig\" :from \"types/playerConfig.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"MODE_METADATA\" :from \"types/playerConfig.ts\" :kind :const :return \"Record<PlayerDisplayMode, { label: string; icon: string; tag: string; description: string; }>\" :params ())\n  (:symbol \"SUITE_PRESET\" :from \"types/playerConfig.ts\" :kind :const :return \"PlayerDisplayConfig\" :params ())\n  (:symbol \"CLASSROOM_PRESET\" :from \"types/playerConfig.ts\" :kind :const :return \"PlayerDisplayConfig\" :params ())\n  (:symbol \"STUDENT_PRESET\" :from \"types/playerConfig.ts\" :kind :const :return \"PlayerDisplayConfig\" :params ())\n  (:symbol \"BROADCAST_PRESET\" :from \"types/playerConfig.ts\" :kind :const :return \"PlayerDisplayConfig\" :params ())\n  (:symbol \"DEVELOPER_PRESET\" :from \"types/playerConfig.ts\" :kind :const :return \"PlayerDisplayConfig\" :params ())\n  (:symbol \"EMBEDDED_PRESET\" :from \"types/playerConfig.ts\" :kind :const :return \"PlayerDisplayConfig\" :params ())\n  (:symbol \"CONFIG_STORAGE_KEY\" :from \"types/playerConfig.ts\" :kind :const :return \"\"stj_player_display_config\"\" :params ())\n  (:symbol \"isAstQuestion\" :from \"types/sexpr.ts\" :kind :function :return \"boolean\" :params ((:param \"node\" :type \"any\")))\n  (:symbol \"isAstScene\" :from \"types/sexpr.ts\" :kind :function :return \"boolean\" :params ((:param \"node\" :type \"any\")))\n  (:symbol \"isAstLesson\" :from \"types/sexpr.ts\" :kind :function :return \"boolean\" :params ((:param \"node\" :type \"any\")))\n  (:symbol \"SExprAtom\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SExprNode\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SExprAST\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AstQuestionNode\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ParsedAstNode\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AstCameraOrbit\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AstKeyframeNode\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AstBindingType\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AstBindingNode\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AstSubtitleNode\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AstPhysicsBody\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AstPhysicsConfig\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AstSceneNode\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AstLessonNode\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"UnifiedAstUnit\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BackendTier\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"EngineExecutionResult\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"EngineOptions\" :from \"types/sexpr.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"Projected3DPoint\" :from \"utils/ast3dWasmBridge.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AST3DWasmBridge\" :from \"utils/ast3dWasmBridge.ts\" :kind :class :return \"typeof AST3DWasmBridge\" :params ())\n  (:symbol \"isAstBytecode\" :from \"utils/astBytecode.ts\" :kind :function :return \"boolean\" :params ((:param \"buffer\" :type \"ArrayBuffer | Uint8Array<ArrayBufferLike>\")))\n  (:symbol \"compileSceneToBytecode\" :from \"utils/astBytecode.ts\" :kind :function :return \"Uint8Array<ArrayBufferLike>\" :params ((:param \"scene\" :type \"BytecodeCompiledScene\")))\n  (:symbol \"decompileBytecodeToScene\" :from \"utils/astBytecode.ts\" :kind :function :return \"BytecodeCompiledScene\" :params ((:param \"buffer\" :type \"ArrayBuffer | Uint8Array<ArrayBufferLike>\")))\n  (:symbol \"compileAstTextToBytecode\" :from \"utils/astBytecode.ts\" :kind :function :return \"Uint8Array<ArrayBufferLike>\" :params ((:param \"astText\" :type \"string\")))\n  (:symbol \"ASTB_MAGIC\" :from \"utils/astBytecode.ts\" :kind :const :return \"number[]\" :params ())\n  (:symbol \"ASTB_VERSION\" :from \"utils/astBytecode.ts\" :kind :const :return \"1\" :params ())\n  (:symbol \"ARCHETYPE_SIM\" :from \"utils/astBytecode.ts\" :kind :const :return \"1\" :params ())\n  (:symbol \"ARCHETYPE_SLIDE\" :from \"utils/astBytecode.ts\" :kind :const :return \"2\" :params ())\n  (:symbol \"ARCHETYPE_APP\" :from \"utils/astBytecode.ts\" :kind :const :return \"3\" :params ())\n  (:symbol \"ARCHETYPE_FILM\" :from \"utils/astBytecode.ts\" :kind :const :return \"4\" :params ())\n  (:symbol \"FLAG_HAS_3D\" :from \"utils/astBytecode.ts\" :kind :const :return \"1\" :params ())\n  (:symbol \"FLAG_HAS_VIDEO\" :from \"utils/astBytecode.ts\" :kind :const :return \"2\" :params ())\n  (:symbol \"FLAG_HAS_CHECKPOINTS\" :from \"utils/astBytecode.ts\" :kind :const :return \"4\" :params ())\n  (:symbol \"FLAG_HAS_SUBTITLES\" :from \"utils/astBytecode.ts\" :kind :const :return \"8\" :params ())\n  (:symbol \"OP_SCENE_META\" :from \"utils/astBytecode.ts\" :kind :const :return \"1\" :params ())\n  (:symbol \"OP_KEYFRAME\" :from \"utils/astBytecode.ts\" :kind :const :return \"16\" :params ())\n  (:symbol \"OP_SUBTITLE\" :from \"utils/astBytecode.ts\" :kind :const :return \"32\" :params ())\n  (:symbol \"OP_BINDING\" :from \"utils/astBytecode.ts\" :kind :const :return \"48\" :params ())\n  (:symbol \"OP_CHECKPOINT\" :from \"utils/astBytecode.ts\" :kind :const :return \"64\" :params ())\n  (:symbol \"OP_CHECKPOINT_GOAL\" :from \"utils/astBytecode.ts\" :kind :const :return \"65\" :params ())\n  (:symbol \"OP_GESTURE\" :from \"utils/astBytecode.ts\" :kind :const :return \"80\" :params ())\n  (:symbol \"OP_VAR\" :from \"utils/astBytecode.ts\" :kind :const :return \"96\" :params ())\n  (:symbol \"OP_INPUT\" :from \"utils/astBytecode.ts\" :kind :const :return \"112\" :params ())\n  (:symbol \"OP_CAMERA\" :from \"utils/astBytecode.ts\" :kind :const :return \"128\" :params ())\n  (:symbol \"OP_SCOPE\" :from \"utils/astBytecode.ts\" :kind :const :return \"144\" :params ())\n  (:symbol \"OP_LEDGER\" :from \"utils/astBytecode.ts\" :kind :const :return \"145\" :params ())\n  (:symbol \"OP_EOF\" :from \"utils/astBytecode.ts\" :kind :const :return \"255\" :params ())\n  (:symbol \"AstScopeConfig\" :from \"utils/astBytecode.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AstLedgerTerm\" :from \"utils/astBytecode.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AstLedgerConfig\" :from \"utils/astBytecode.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AstCheckpointConfig\" :from \"utils/astBytecode.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BytecodeCompiledScene\" :from \"utils/astBytecode.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"escapeAstValue\" :from \"utils/astCartridgeSerializer.ts\" :kind :function :return \"string\" :params ((:param \"str\" :type \"unknown\")))\n  (:symbol \"valueToAst\" :from \"utils/astCartridgeSerializer.ts\" :kind :function :return \"string\" :params ((:param \"val\" :type \"any\") (:param \"indentLevel\" :type \"number\")))\n  (:symbol \"serializeEntityNode\" :from \"utils/astCartridgeSerializer.ts\" :kind :function :return \"string\" :params ((:param \"tag\" :type \"string\") (:param \"props\" :type \"Record<string, any>\") (:param \"children\" :type \"any[]\") (:param \"indentLevel\" :type \"number\")))\n  (:symbol \"serializeDatasetToCartridge\" :from \"utils/astCartridgeSerializer.ts\" :kind :function :return \"string\" :params ((:param \"metadata\" :type \"{ id: string; category: string; title: string; version?: string; itemTag?: string; items: Record<string, any>[]; }\")))\n  (:symbol \"parseCartridgeToDataset\" :from \"utils/astCartridgeSerializer.ts\" :kind :function :return \"{ id: string; category: string; title: string; version: string; count: number; items: T[]; }\" :params ((:param \"astContent\" :type \"string\")))\n  (:symbol \"compileExpressionToMathKernel\" :from \"utils/astMathCompiler.ts\" :kind :function :return \"MathDecomposition\" :params ((:param \"expr\" :type \"string\") (:param \"targetAttr\" :type \"string\")))\n  (:symbol \"evaluateAffine\" :from \"utils/astMathCompiler.ts\" :kind :function :return \"number\" :params ((:param \"m\" :type \"number\") (:param \"c\" :type \"number\") (:param \"t\" :type \"number\")))\n  (:symbol \"evaluateMap\" :from \"utils/astMathCompiler.ts\" :kind :function :return \"number\" :params ((:param \"val\" :type \"number\") (:param \"inMin\" :type \"number\") (:param \"inMax\" :type \"number\") (:param \"outMin\" :type \"number\") (:param \"outMax\" :type \"number\")))\n  (:symbol \"evaluateAffineMatrix6\" :from \"utils/astMathCompiler.ts\" :kind :function :return \"void\" :params ((:param \"affine\" :type \"AffineDecomposition\") (:param \"t\" :type \"number\") (:param \"outMatrix\" :type \"Float32Array<ArrayBufferLike>\")))\n  (:symbol \"formatSvgMatrix6\" :from \"utils/astMathCompiler.ts\" :kind :function :return \"string\" :params ((:param \"m\" :type \"Float32Array<ArrayBufferLike>\")))\n  (:symbol \"evaluateSquashStretchMatrix6\" :from \"utils/astMathCompiler.ts\" :kind :function :return \"void\" :params ((:param \"vx\" :type \"number\") (:param \"vy\" :type \"number\") (:param \"squash\" :type \"number\") (:param \"tx\" :type \"number\") (:param \"ty\" :type \"number\") (:param \"outMatrix\" :type \"Float32Array<ArrayBufferLike>\") (:param \"originX\" :type \"number\") (:param \"originY\" :type \"number\")))\n  (:symbol \"TransformKind\" :from \"utils/astMathCompiler.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AffineDecomposition\" :from \"utils/astMathCompiler.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"MapDecomposition\" :from \"utils/astMathCompiler.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"FallbackDecomposition\" :from \"utils/astMathCompiler.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"MathDecomposition\" :from \"utils/astMathCompiler.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"healSExprString\" :from \"utils/astQuestionExtractor.ts\" :kind :function :return \"string\" :params ((:param \"raw\" :type \"string\")))\n  (:symbol \"extractQuestionFromAst\" :from \"utils/astQuestionExtractor.ts\" :kind :function :return \"ExtractedQuestion\" :params ((:param \"rawLisp\" :type \"string\")))\n  (:symbol \"stripPromptDecorators\" :from \"utils/astQuestionExtractor.ts\" :kind :function :return \"string\" :params ((:param \"prompt\" :type \"string\")))\n  (:symbol \"extractDataPayloadFromAst\" :from \"utils/astQuestionExtractor.ts\" :kind :function :return \"DataCartridgePayload\" :params ((:param \"raw\" :type \"string\")))\n  (:symbol \"serializeDataCartridgeToAst\" :from \"utils/astQuestionExtractor.ts\" :kind :function :return \"string\" :params ((:param \"payload\" :type \"DataCartridgePayload\") (:param \"id\" :type \"string\") (:param \"title\" :type \"string\")))\n  (:symbol \"DataCartridgeQuestion\" :from \"utils/astQuestionExtractor.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"DataCartridgePayload\" :from \"utils/astQuestionExtractor.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ExtractedQuestion\" :from \"utils/astQuestionExtractor.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"compileAstStyle\" :from \"utils/astStyleCompiler.ts\" :kind :function :return \"CSSProperties\" :params ((:param \"styleAst\" :type \"SExprAST | CSSProperties\") (:param \"nodeProps\" :type \"Record<string, any>\")))\n  (:symbol \"CSSProperties\" :from \"utils/astStyleCompiler.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LITURGICAL_AST_PALETTE\" :from \"utils/astStyleCompiler.ts\" :kind :const :return \"Record<string, { bg: string; border: string; text: string; accent: string; }>\" :params ())\n  (:symbol \"DecodedSwfHeader\" :from \"utils/astTranspilerWasmBridge.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SwfTagScanResult\" :from \"utils/astTranspilerWasmBridge.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"PhetScanResult\" :from \"utils/astTranspilerWasmBridge.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ASTTranspilerWasmBridge\" :from \"utils/astTranspilerWasmBridge.ts\" :kind :class :return \"typeof ASTTranspilerWasmBridge\" :params ())\n  (:symbol \"transpilerWasm\" :from \"utils/astTranspilerWasmBridge.ts\" :kind :const :return \"ASTTranspilerWasmBridge\" :params ())\n  (:symbol \"isBinaryFrame\" :from \"utils/binaryStreamProtocol.ts\" :kind :function :return \"boolean\" :params ((:param \"data\" :type \"unknown\")))\n  (:symbol \"encodeBinaryFrame\" :from \"utils/binaryStreamProtocol.ts\" :kind :function :return \"ArrayBuffer\" :params ((:param \"opcode\" :type \"number\") (:param \"payload\" :type \"string | Uint8Array<ArrayBufferLike>\") (:param \"streamId\" :type \"number\") (:param \"flags\" :type \"number\")))\n  (:symbol \"decodeBinaryFrame\" :from \"utils/binaryStreamProtocol.ts\" :kind :function :return \"DecodedBinaryFrame\" :params ((:param \"buffer\" :type \"ArrayBuffer\")))\n  (:symbol \"createTokenChunkFrame\" :from \"utils/binaryStreamProtocol.ts\" :kind :function :return \"ArrayBuffer\" :params ((:param \"token\" :type \"string\") (:param \"streamId\" :type \"number\") (:param \"isFinal\" :type \"boolean\")))\n  (:symbol \"createAstNodeFrame\" :from \"utils/binaryStreamProtocol.ts\" :kind :function :return \"ArrayBuffer\" :params ((:param \"rawAst\" :type \"string\") (:param \"streamId\" :type \"number\") (:param \"isGoverned\" :type \"boolean\") (:param \"metadata\" :type \"Record<string, any>\")))\n  (:symbol \"createEofFrame\" :from \"utils/binaryStreamProtocol.ts\" :kind :function :return \"ArrayBuffer\" :params ((:param \"streamId\" :type \"number\")))\n  (:symbol \"PROTOCOL_MAGIC_0\" :from \"utils/binaryStreamProtocol.ts\" :kind :const :return \"83\" :params ())\n  (:symbol \"PROTOCOL_MAGIC_1\" :from \"utils/binaryStreamProtocol.ts\" :kind :const :return \"74\" :params ())\n  (:symbol \"PROTOCOL_VERSION\" :from \"utils/binaryStreamProtocol.ts\" :kind :const :return \"2\" :params ())\n  (:symbol \"OP_TOKEN_CHUNK\" :from \"utils/binaryStreamProtocol.ts\" :kind :const :return \"1\" :params ())\n  (:symbol \"OP_AST_NODE_CHUNK\" :from \"utils/binaryStreamProtocol.ts\" :kind :const :return \"2\" :params ())\n  (:symbol \"OP_AST_NODE_COMPLETE\" :from \"utils/binaryStreamProtocol.ts\" :kind :const :return \"3\" :params ())\n  (:symbol \"OP_HEARTBEAT_PING\" :from \"utils/binaryStreamProtocol.ts\" :kind :const :return \"4\" :params ())\n  (:symbol \"OP_HEARTBEAT_PONG\" :from \"utils/binaryStreamProtocol.ts\" :kind :const :return \"5\" :params ())\n  (:symbol \"OP_STATUS\" :from \"utils/binaryStreamProtocol.ts\" :kind :const :return \"6\" :params ())\n  (:symbol \"OP_ERROR\" :from \"utils/binaryStreamProtocol.ts\" :kind :const :return \"7\" :params ())\n  (:symbol \"OP_STREAM_EOF\" :from \"utils/binaryStreamProtocol.ts\" :kind :const :return \"15\" :params ())\n  (:symbol \"FLAG_IS_FINAL\" :from \"utils/binaryStreamProtocol.ts\" :kind :const :return \"1\" :params ())\n  (:symbol \"FLAG_IS_GOVERNED\" :from \"utils/binaryStreamProtocol.ts\" :kind :const :return \"2\" :params ())\n  (:symbol \"FLAG_IS_JSON\" :from \"utils/binaryStreamProtocol.ts\" :kind :const :return \"4\" :params ())\n  (:symbol \"DecodedBinaryFrame\" :from \"utils/binaryStreamProtocol.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"lerp3D\" :from \"utils/bslAlphabet.ts\" :kind :function :return \"Point3D\" :params ((:param \"a\" :type \"Point3D\") (:param \"b\" :type \"Point3D\") (:param \"t\" :type \"number\")))\n  (:symbol \"decomposeTextToBslStream\" :from \"utils/bslAlphabet.ts\" :kind :function :return \"BslHandPose[]\" :params ((:param \"text\" :type \"string\")))\n  (:symbol \"project3DToSvg\" :from \"utils/bslAlphabet.ts\" :kind :function :return \"{ x: number; y: number; scale: number; depth: number; }\" :params ((:param \"point\" :type \"Point3D\") (:param \"camera\" :type \"{ yaw: number; pitch: number; distance: number; fov: number; }\") (:param \"originX\" :type \"number\") (:param \"originY\" :type \"number\")))\n  (:symbol \"evaluateBslEase\" :from \"utils/bslAlphabet.ts\" :kind :function :return \"number\" :params ((:param \"ease\" :type \"string\") (:param \"t\" :type \"number\")))\n  (:symbol \"solveHandKinematics\" :from \"utils/bslAlphabet.ts\" :kind :function :return \"BslSolvedDominantHand\" :params ((:param \"wrist\" :type \"Point3D\") (:param \"knuckle\" :type \"Point3D\") (:param \"tip\" :type \"Point3D\") (:param \"shapeInput\" :type \"BslHandShape\") (:param \"palmInput\" :type \"BslPalmOrientation\")))\n  (:symbol \"encodePhonemicTuple\" :from \"utils/bslAlphabet.ts\" :kind :function :return \"Uint8Array<ArrayBufferLike>\" :params ((:param \"params\" :type \"{ dez?: BslHandShape; tab?: string | number; sig?: string | number; ori?: BslPalmOrientation; nmfIndex?: number; aspect?: BslAspect; baseMode?: BslBaseHandMode; holdMs?: number; }\")))\n  (:symbol \"decodePhonemicTuple\" :from \"utils/bslAlphabet.ts\" :kind :function :return \"BslHandPose\" :params ((:param \"tuple\" :type \"number[] | Uint8Array<ArrayBufferLike>\")))\n  (:symbol \"Point3D\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslMouthMorpheme\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslRoleShift\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslNmf\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslHandShape\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslPalmOrientation\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslEaseCurve\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslBaseHandMode\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslBuoyType\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslBuoy\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslDirectionalVerbType\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslDirectionalAgreement\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslLevel6InstructionTuple\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslClassifierType\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslAspect\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslClassifierPredicate\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslHandPose\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BSL_BASE_HAND\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"{ wrist: { x: number; y: number; z: number; }; palm: { x: number; y: number; z: number; }; fingertips: { id: string; name: string; x: number; y: number; z: number; }[]; }\" :params ())\n  (:symbol \"BSL_BASE_REST_HAND\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"{ wrist: { x: number; y: number; z: number; }; palm: { x: number; y: number; z: number; }; fingertips: { id: string; name: string; x: number; y: number; z: number; }[]; }\" :params ())\n  (:symbol \"DOMINANT_REST_POSE\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"Point3D\" :params ())\n  (:symbol \"DOMINANT_REST_KNUCKLE\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"Point3D\" :params ())\n  (:symbol \"DOMINANT_REST_WRIST\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"Point3D\" :params ())\n  (:symbol \"BSL_ALPHABET_POSES\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"Record<string, BslHandPose>\" :params ())\n  (:symbol \"interpolatePoint3D\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"Point3D\" :params ((:param \"a\" :type \"Point3D\") (:param \"b\" :type \"Point3D\") (:param \"t\" :type \"number\")))\n  (:symbol \"BslSolvedDominantHand\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SolvedHand3D\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"PHONEMIC_DEZ_REGISTERS\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"readonly BslHandShape[]\" :params ())\n  (:symbol \"PHONEMIC_TAB_REGISTERS\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"readonly { name: string; pos: Point3D; }[]\" :params ())\n  (:symbol \"PHONEMIC_SIG_REGISTERS\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"readonly [\"static-hold\", \"linear-fwd\", \"linear-sweep\", \"arc-up\", \"arc-down\", \"cycle-ellipse\", \"snap-halt\", \"recoil\"]\" :params ())\n  (:symbol \"PHONEMIC_ORI_REGISTERS\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"readonly BslPalmOrientation[]\" :params ())\n  (:symbol \"PHONEMIC_NMF_REGISTERS\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"readonly BslNmf[]\" :params ())\n  (:symbol \"PHONEMIC_ASPECT_REGISTERS\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"readonly BslAspect[]\" :params ())\n  (:symbol \"PHONEMIC_BASE_MODES\" :from \"utils/bslAlphabet.ts\" :kind :const :return \"readonly BslBaseHandMode[]\" :params ())\n  (:symbol \"point3DToAstVector\" :from \"utils/bslAstCodec.ts\" :kind :function :return \"string\" :params ((:param \"p\" :type \"Point3D\")))\n  (:symbol \"astVectorToPoint3D\" :from \"utils/bslAstCodec.ts\" :kind :function :return \"Point3D\" :params ((:param \"vec\" :type \"any\")))\n  (:symbol \"escapeAstString\" :from \"utils/bslAstCodec.ts\" :kind :function :return \"string\" :params ((:param \"str\" :type \"string\")))\n  (:symbol \"serializeSignToAst\" :from \"utils/bslAstCodec.ts\" :kind :function :return \"string\" :params ((:param \"sign\" :type \"BslSign\")))\n  (:symbol \"serializeLexiconToAst\" :from \"utils/bslAstCodec.ts\" :kind :function :return \"string\" :params ((:param \"lexicon\" :type \"Record<string, BslSign>\") (:param \"metadata\" :type \"{ version?: string; standard?: string; title?: string; }\")))\n  (:symbol \"parseAstNodeToSign\" :from \"utils/bslAstCodec.ts\" :kind :function :return \"BslSign\" :params ((:param \"node\" :type \"any\")))\n  (:symbol \"parseAstToLexicon\" :from \"utils/bslAstCodec.ts\" :kind :function :return \"Record<string, BslSign>\" :params ((:param \"astContent\" :type \"string\")))\n  (:symbol \"generateClassifierPredicate\" :from \"utils/bslGrammarEngine.ts\" :kind :function :return \"BslSign\" :params ((:param \"type\" :type \"BslClassifierType\") (:param \"options\" :type \"{ fromLocus?: BslLocusId; toLocus?: BslLocusId; aspect?: BslAspect; manner?: \"slow\" | \"fast\" | \"stumble\" | \"steady\" | \"zig-zag\"; entityLabel?: string; }\")))\n  (:symbol \"mapWordToClassifier\" :from \"utils/bslGrammarEngine.ts\" :kind :function :return \"{ type: BslClassifierType; options?: any; }\" :params ((:param \"word\" :type \"string\")))\n  (:symbol \"modulateDirectionalKeyframes\" :from \"utils/bslGrammarEngine.ts\" :kind :function :return \"BslSignKeyframe[]\" :params ((:param \"sign\" :type \"BslSign\") (:param \"fromLocus\" :type \"Point3D\") (:param \"toLocus\" :type \"Point3D\")))\n  (:symbol \"generateDirectionalAgreementSign\" :from \"utils/bslGrammarEngine.ts\" :kind :function :return \"BslSign\" :params ((:param \"verb\" :type \"BslDirectionalVerbType\") (:param \"options\" :type \"{ fromLocus?: BslLocusId; toLocus?: BslLocusId; aspect?: BslAspect; manner?: \"slow\" | \"fast\" | \"steady\" | \"reverent\" | \"continuous\"; }\")))\n  (:symbol \"parseBslInstructionTuple\" :from \"utils/bslGrammarEngine.ts\" :kind :function :return \"BslSign[]\" :params ((:param \"tuple\" :type \"BslLevel6InstructionTuple\")))\n  (:symbol \"analyzeAndTransformBslGrammar\" :from \"utils/bslGrammarEngine.ts\" :kind :function :return \"BslGrammarAnalysis\" :params ((:param \"text\" :type \"string\") (:param \"options\" :type \"BslGrammarMode | { mode?: BslGrammarMode; }\")))\n  (:symbol \"BslClassifierType\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslAspect\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslClassifierPredicate\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslDirectionalVerbType\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslDirectionalAgreement\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslLevel6InstructionTuple\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslBuoyType\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslBuoy\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslGrammarMode\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslLocusId\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslElevation\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslLocus\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"DEFAULT_BSL_LOCI\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"Record<BslLocusId, BslLocus>\" :params ())\n  (:symbol \"BslGrammarRole\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslGrammarToken\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslGrammarAnalysis\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"DIRECTIONAL_VERB_MAP\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"Record<string, BslDirectionalVerbType>\" :params ())\n  (:symbol \"HIERARCHICAL_HIGH_ENTITIES\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"Set<string>\" :params ())\n  (:symbol \"HIERARCHICAL_LOW_ENTITIES\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"Set<string>\" :params ())\n  (:symbol \"ADVERB_MOUTH_MAP\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"Record<string, string>\" :params ())\n  (:symbol \"CLASSIFIER_VERB_MAP\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"Record<string, BslClassifierType>\" :params ())\n  (:symbol \"ASPECT_MARKER_MAP\" :from \"utils/bslGrammarEngine.ts\" :kind :const :return \"Record<string, BslAspect>\" :params ())\n  (:symbol \"computeHeadCenter\" :from \"utils/bslKinematicsEngine.ts\" :kind :function :return \"Point3D\" :params ((:param \"headTilt\" :type \"string\") (:param \"progress\" :type \"number\")))\n  (:symbol \"projectPoint\" :from \"utils/bslKinematicsEngine.ts\" :kind :function :return \"{ x: number; y: number; scale: number; }\" :params ((:param \"pt\" :type \"Point3D\") (:param \"camera\" :type \"CameraConfig\") (:param \"panX\" :type \"number\") (:param \"panY\" :type \"number\") (:param \"cameraMode\" :type \"\"split\" | \"body\" | \"face\"\") (:param \"zone\" :type \"\"body\" | \"hands\"\") (:param \"headY\" :type \"number\") (:param \"headZ\" :type \"number\") (:param \"roleYaw\" :type \"number\")))\n  (:symbol \"projectSolvedHand\" :from \"utils/bslKinematicsEngine.ts\" :kind :function :return \"SolvedHand2D\" :params ((:param \"hand\" :type \"BslSolvedDominantHand\") (:param \"camera\" :type \"CameraConfig\") (:param \"panX\" :type \"number\") (:param \"panY\" :type \"number\") (:param \"cameraMode\" :type \"\"split\" | \"body\" | \"face\"\") (:param \"headY\" :type \"number\") (:param \"headZ\" :type \"number\")))\n  (:symbol \"solveBaseHandKinematics\" :from \"utils/bslKinematicsEngine.ts\" :kind :function :return \"BslSolvedDominantHand\" :params ((:param \"domHand3D\" :type \"BslSolvedDominantHand\") (:param \"currentPose\" :type \"BslHandPose\")))\n  (:symbol \"computeBslFrame\" :from \"utils/bslKinematicsEngine.ts\" :kind :function :return \"BslSolvedFrame\" :params ((:param \"currentPose\" :type \"BslHandPose\") (:param \"prevPose\" :type \"BslHandPose\") (:param \"interpolatedWrist\" :type \"Point3D\") (:param \"interpolatedKnuckle\" :type \"Point3D\") (:param \"interpolatedTip\" :type \"Point3D\") (:param \"progress\" :type \"number\") (:param \"camera\" :type \"CameraConfig\") (:param \"panX\" :type \"number\") (:param \"panY\" :type \"number\") (:param \"cameraMode\" :type \"\"split\" | \"body\" | \"face\"\")))\n  (:symbol \"CameraConfig\" :from \"utils/bslKinematicsEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SolvedHand2D\" :from \"utils/bslKinematicsEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SolvedFacialLandmarks2D\" :from \"utils/bslKinematicsEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslSolvedFrame\" :from \"utils/bslKinematicsEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"registerBslSigns\" :from \"utils/bslLexicon.ts\" :kind :function :return \"number\" :params ((:param \"signs\" :type \"Record<string, BslSign>\")))\n  (:symbol \"lookupBslSign\" :from \"utils/bslLexicon.ts\" :kind :function :return \"BslSign\" :params ((:param \"word\" :type \"string\")))\n  (:symbol \"signKeyframeToHandPose\" :from \"utils/bslLexicon.ts\" :kind :function :return \"BslHandPose\" :params ((:param \"sign\" :type \"BslSign\") (:param \"kf\" :type \"BslSignKeyframe\") (:param \"index\" :type \"number\") (:param \"total\" :type \"number\")))\n  (:symbol \"decomposeTextToBslStreamWithLexicon\" :from \"utils/bslLexicon.ts\" :kind :function :return \"BslHandPose[]\" :params ((:param \"text\" :type \"string\") (:param \"options\" :type \"{ mode?: \"fingerspell\" | \"concept\"; }\")))\n  (:symbol \"getMakatonSigns\" :from \"utils/bslLexicon.ts\" :kind :function :return \"BslSign[]\" :params ((:param \"stage\" :type \"number\")))\n  (:symbol \"isMakatonWord\" :from \"utils/bslLexicon.ts\" :kind :function :return \"boolean\" :params ((:param \"word\" :type \"string\")))\n  (:symbol \"lookupMakatonSign\" :from \"utils/bslLexicon.ts\" :kind :function :return \"{ sign: BslSign; stage: number; }\" :params ((:param \"word\" :type \"string\")))\n  (:symbol \"BslNmf\" :from \"utils/bslLexicon.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslHandShape\" :from \"utils/bslLexicon.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslPalmOrientation\" :from \"utils/bslLexicon.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslEaseCurve\" :from \"utils/bslLexicon.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslBaseHandMode\" :from \"utils/bslLexicon.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslClassifierType\" :from \"utils/bslLexicon.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslAspect\" :from \"utils/bslLexicon.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslClassifierPredicate\" :from \"utils/bslLexicon.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslBuoyType\" :from \"utils/bslLexicon.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslBuoy\" :from \"utils/bslLexicon.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslCategory\" :from \"utils/bslLexicon.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslSignKeyframe\" :from \"utils/bslLexicon.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BslSign\" :from \"utils/bslLexicon.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"BSL_CURRICULUM_LEXICON\" :from \"utils/bslLexicon.ts\" :kind :const :return \"Record<string, BslSign>\" :params ())\n  (:symbol \"MakatonStageInfo\" :from \"utils/bslLexicon.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"MAKATON_CORE_STAGES\" :from \"utils/bslLexicon.ts\" :kind :const :return \"Record<number, MakatonStageInfo>\" :params ())\n  (:symbol \"parseMathExpression\" :from \"utils/calculusPlotter.ts\" :kind :function :return \"(x: number) => number\" :params ((:param \"expr\" :type \"string\")))\n  (:symbol \"PlotCoordinate\" :from \"utils/calculusPlotter.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"TangentAnalysis\" :from \"utils/calculusPlotter.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"IntegralAnalysis\" :from \"utils/calculusPlotter.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ViewportTransform\" :from \"utils/calculusPlotter.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CalculusPlotter\" :from \"utils/calculusPlotter.ts\" :kind :class :return \"typeof CalculusPlotter\" :params ())\n  (:symbol \"CALCULUS_PRESETS\" :from \"utils/calculusPlotter.ts\" :kind :const :return \"{ id: string; name: string; category: string; latex: string; fn: (x: number) => number; derivativeStr: string; defaultX0: number; defaultA: number; defaultB: number; }[]\" :params ())\n  (:symbol \"compressStringToGzip\" :from \"utils/cartridgeCompression.ts\" :kind :function :return \"Promise<Uint8Array<ArrayBufferLike>>\" :params ((:param \"text\" :type \"string\")))\n  (:symbol \"decompressGzipToString\" :from \"utils/cartridgeCompression.ts\" :kind :function :return \"Promise<string>\" :params ((:param \"compressedBytes\" :type \"Uint8Array<ArrayBufferLike>\")))\n  (:symbol \"uint8ArrayToBase64\" :from \"utils/cartridgeCompression.ts\" :kind :function :return \"string\" :params ((:param \"bytes\" :type \"Uint8Array<ArrayBufferLike>\")))\n  (:symbol \"base64ToUint8Array\" :from \"utils/cartridgeCompression.ts\" :kind :function :return \"Uint8Array<ArrayBufferLike>\" :params ((:param \"base64\" :type \"string\")))\n  (:symbol \"compressCartridge\" :from \"utils/cartridgeCompression.ts\" :kind :function :return \"Promise<{ compressedBytes: Uint8Array<ArrayBufferLike>; base64: string; metadata: CompressedCartridgeMetadata; }>\" :params ((:param \"cartridge\" :type \"CartridgeDefinition\")))\n  (:symbol \"decompressCartridge\" :from \"utils/cartridgeCompression.ts\" :kind :function :return \"Promise<CartridgeDefinition>\" :params ((:param \"data\" :type \"string | ArrayBuffer | Uint8Array<ArrayBufferLike>\")))\n  (:symbol \"compressCartridgeBundle\" :from \"utils/cartridgeCompression.ts\" :kind :function :return \"Promise<CompressedBundlePayload>\" :params ((:param \"bundleId\" :type \"string\") (:param \"title\" :type \"string\") (:param \"cartridges\" :type \"CartridgeDefinition[]\")))\n  (:symbol \"decompressCartridgeBundle\" :from \"utils/cartridgeCompression.ts\" :kind :function :return \"Promise<CartridgeDefinition[]>\" :params ((:param \"payload\" :type \"string | Uint8Array<ArrayBufferLike> | CompressedBundlePayload\")))\n  (:symbol \"CompressedCartridgeMetadata\" :from \"utils/cartridgeCompression.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CompressedCartridgePayload\" :from \"utils/cartridgeCompression.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CompressedBundlePayload\" :from \"utils/cartridgeCompression.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"computeSha256\" :from \"utils/cartridgeIntegrity.ts\" :kind :function :return \"Promise<string>\" :params ((:param \"data\" :type \"string | ArrayBuffer | Uint8Array<ArrayBufferLike>\")))\n  (:symbol \"computeAuthoritySeal\" :from \"utils/cartridgeIntegrity.ts\" :kind :function :return \"Promise<string>\" :params ((:param \"id\" :type \"string\") (:param \"astHash\" :type \"string\") (:param \"svgHash\" :type \"string\")))\n  (:symbol \"formatShortHash\" :from \"utils/cartridgeIntegrity.ts\" :kind :function :return \"string\" :params ((:param \"hash\" :type \"string\") (:param \"length\" :type \"number\")))\n  (:symbol \"isNativeCartridge\" :from \"utils/cartridgeIntegrity.ts\" :kind :function :return \"boolean\" :params ((:param \"id\" :type \"string\")))\n  (:symbol \"getRegisteredRecord\" :from \"utils/cartridgeIntegrity.ts\" :kind :function :return \"CartridgeChecksumEntry\" :params ((:param \"id\" :type \"string\")))\n  (:symbol \"getMasterRegistryChecksum\" :from \"utils/cartridgeIntegrity.ts\" :kind :function :return \"string\" :params ())\n  (:symbol \"getTotalCertifiedCartridges\" :from \"utils/cartridgeIntegrity.ts\" :kind :function :return \"number\" :params ())\n  (:symbol \"verifyCartridgeIntegrity\" :from \"utils/cartridgeIntegrity.ts\" :kind :function :return \"Promise<CartridgeIntegrityResult>\" :params ((:param \"cartridgeId\" :type \"string\") (:param \"content\" :type \"string | { ast?: string | ArrayBuffer; svg?: string | ArrayBuffer; astb?: ArrayBuffer; }\")))\n  (:symbol \"CURRICULUM_AUTHORITY_NAME\" :from \"utils/cartridgeIntegrity.ts\" :kind :const :return \"\"St Joseph's Catholic Primary School Curriculum Authority\"\" :params ())\n  (:symbol \"AUTHORITY_SEAL_SALT\" :from \"utils/cartridgeIntegrity.ts\" :kind :const :return \"\"ST_JOSEPHS_CURRICULUM_SEAL_V1_2026_AGPL\"\" :params ())\n  (:symbol \"IntegrityStatus\" :from \"utils/cartridgeIntegrity.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CartridgeIntegrityResult\" :from \"utils/cartridgeIntegrity.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CartridgeStateVector\" :from \"utils/cartridgeStateHex.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CartridgeStateHex\" :from \"utils/cartridgeStateHex.ts\" :kind :const :return \"{ SCHEMA_VERSION: number; BUFFER_SIZE: number; pack(state?: CartridgeStateVector): string; unpack(hexStr: string): CartridgeStateVector; saveToHash(state: CartridgeStateVector): void; loadFromHash(): CartridgeStateVector; }\" :params ())\n  (:symbol \"Channel\" :from \"utils/channelBus.ts\" :kind :class :return \"typeof Channel\" :params ())\n  (:symbol \"Channels\" :from \"utils/channelBus.ts\" :kind :const :return \"{ UI_ACTIONS: Channel<{ action: string; payload: any; }>; AI_DIAGNOSTICS: Channel<{ studentId: string; challengeId: string; answer: string; isCorrect: boolean; }>; PROGRESS_LOG: Channel<...>; }\" :params ())\n  (:symbol \"encryptLocalData\" :from \"utils/cryptoVault.ts\" :kind :function :return \"Promise<EncryptedPayload>\" :params ((:param \"plainText\" :type \"string\") (:param \"passphrase\" :type \"string\")))\n  (:symbol \"decryptLocalData\" :from \"utils/cryptoVault.ts\" :kind :function :return \"Promise<string>\" :params ((:param \"payload\" :type \"EncryptedPayload\") (:param \"passphrase\" :type \"string\")))\n  (:symbol \"computeSha256\" :from \"utils/cryptoVault.ts\" :kind :function :return \"Promise<string>\" :params ((:param \"text\" :type \"string\")))\n  (:symbol \"EncryptedPayload\" :from \"utils/cryptoVault.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"exportAirgapHtmlBundle\" :from \"utils/exportAirgapHtmlBundle.ts\" :kind :function :return \"void\" :params ((:param \"presetId\" :type \"string\") (:param \"presetTitle\" :type \"string\")))\n  (:symbol \"exportSubjectCartridge\" :from \"utils/exportSubjectCartridge.ts\" :kind :function :return \"void\" :params ((:param \"cartridgeIdOrPackageId\" :type \"string\")))\n  (:symbol \"exportCustomCartridgeBundle\" :from \"utils/exportSubjectCartridge.ts\" :kind :function :return \"void\" :params ((:param \"scenes\" :type \"{ id: string; title: string; category: string; svgMarkup?: string; astSource?: string; }[]\") (:param \"title\" :type \"string\") (:param \"description\" :type \"string\") (:param \"filename\" :type \"string\")))\n  (:symbol \"CartridgePackage\" :from \"utils/exportSubjectCartridge.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"DEFAULT_CARTRIDGE_PACKAGES\" :from \"utils/exportSubjectCartridge.ts\" :kind :const :return \"CartridgePackage[]\" :params ())\n  (:symbol \"AVAILABLE_CARTRIDGES\" :from \"utils/exportSubjectCartridge.ts\" :kind :const :return \"CartridgePackage[]\" :params ())\n  (:symbol \"resolveHarmonisedRoute\" :from \"utils/harmonisedRouteResolver.ts\" :kind :function :return \"RouteResolution\" :params ((:param \"rawPath\" :type \"string\") (:param \"search\" :type \"string\")))\n  (:symbol \"RouteResolution\" :from \"utils/harmonisedRouteResolver.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"serializeTopicToLisp\" :from \"utils/lispCurriculumCodec.ts\" :kind :function :return \"string\" :params ((:param \"entry\" :type \"CurriculumTopicEntry\")))\n  (:symbol \"parseLispTopic\" :from \"utils/lispCurriculumCodec.ts\" :kind :function :return \"CurriculumTopicEntry\" :params ((:param \"lispText\" :type \"string\")))\n  (:symbol \"serializeCatalogueToLisp\" :from \"utils/lispCurriculumCodec.ts\" :kind :function :return \"string\" :params ((:param \"catalogue\" :type \"Record<string, CurriculumTopicEntry>\")))\n  (:symbol \"LispCurriculumQuestion\" :from \"utils/lispCurriculumCodec.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"isPhetBundle\" :from \"utils/phetBridge.ts\" :kind :function :return \"boolean\" :params ((:param \"content\" :type \"string\")))\n  (:symbol \"extractPhetMetadata\" :from \"utils/phetBridge.ts\" :kind :function :return \"{ title: string; simName: string; version: string; locales: string[]; }\" :params ((:param \"content\" :type \"string\") (:param \"fileName\" :type \"string\")))\n  (:symbol \"extractPhetProperties\" :from \"utils/phetBridge.ts\" :kind :function :return \"ExtractedPhetProperty[]\" :params ((:param \"content\" :type \"string\")))\n  (:symbol \"synthesizeUniversalPhetSim\" :from \"utils/phetBridge.ts\" :kind :function :return \"{ svgMarkup: string; astSource: string; invariants: string[]; }\" :params ((:param \"fileContent\" :type \"string\") (:param \"fileName\" :type \"string\") (:param \"meta\" :type \"{ title: string; simName: string; version: string; locales: string[]; }\")))\n  (:symbol \"transpilePhetFile\" :from \"utils/phetBridge.ts\" :kind :function :return \"Promise<PhetTranspileResult>\" :params ((:param \"fileContent\" :type \"string\") (:param \"fileName\" :type \"string\")))\n  (:symbol \"transpileSwfBinary\" :from \"utils/phetBridge.ts\" :kind :function :return \"Promise<PhetTranspileResult>\" :params ((:param \"buffer\" :type \"ArrayBuffer | Uint8Array<ArrayBufferLike>\") (:param \"fileName\" :type \"string\")))\n  (:symbol \"PhetMetadata\" :from \"utils/phetBridge.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"PhetTranspileResult\" :from \"utils/phetBridge.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SupportedPhetPreset\" :from \"utils/phetBridge.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"PHET_BUILTIN_MODELS\" :from \"utils/phetBridge.ts\" :kind :const :return \"Record<SupportedPhetPreset, { title: string; subject: string; stage: string; invariants: string[]; generateSvg: () => string; generateAst: () => string; }>\" :params ())\n  (:symbol \"ExtractedPhetProperty\" :from \"utils/phetBridge.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"generateSessionReport\" :from \"utils/sessionReporter.ts\" :kind :function :return \"Promise<SessionReportSummary>\" :params ((:param \"sessionId\" :type \"string\")))\n  (:symbol \"downloadReportAsHtml\" :from \"utils/sessionReporter.ts\" :kind :function :return \"void\" :params ((:param \"summary\" :type \"SessionReportSummary\")))\n  (:symbol \"SessionReportSummary\" :from \"utils/sessionReporter.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"stripSExprComments\" :from \"utils/sexprParser.ts\" :kind :function :return \"string\" :params ((:param \"str\" :type \"string\")))\n  (:symbol \"parseSExpr\" :from \"utils/sexprParser.ts\" :kind :function :return \"SExprAST\" :params ((:param \"input\" :type \"string\")))\n  (:symbol \"tokenize\" :from \"utils/sexprParser.ts\" :kind :function :return \"string[]\" :params ((:param \"str\" :type \"string\")))\n  (:symbol \"parseAstNode\" :from \"utils/sexprParser.ts\" :kind :function :return \"ParsedAstNode\" :params ((:param \"input\" :type \"SExprAST\")))\n  (:symbol \"parseCartridgeHeader\" :from \"utils/sexprParser.ts\" :kind :function :return \"CartridgeHeaderMetadata\" :params ((:param \"astContent\" :type \"string\")))\n  (:symbol \"ParsedAstNode\" :from \"utils/sexprParser.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CartridgeHeaderMetadata\" :from \"utils/sexprParser.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"AstParser\" :from \"utils/sexprParser.ts\" :kind :class :return \"typeof AstParser\" :params ())\n  (:symbol \"transpileSwfToAst\" :from \"utils/swfAstParser.ts\" :kind :function :return \"Promise<SwfTranspileResult>\" :params ((:param \"fileData\" :type \"ArrayBuffer | Uint8Array<ArrayBufferLike>\") (:param \"sceneId\" :type \"string\")))\n  (:symbol \"SwfMetadata\" :from \"utils/swfAstParser.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SwfTranspileResult\" :from \"utils/swfAstParser.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SwfMorphShape\" :from \"utils/swfAstParser.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SwfActionRecord\" :from \"utils/swfAstParser.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"getBaseUrl\" :from \"utils/url.ts\" :kind :function :return \"string\" :params ())\n  (:symbol \"getAssetUrl\" :from \"utils/url.ts\" :kind :function :return \"string\" :params ((:param \"path\" :type \"string\")))\n)\n";
export const CORE_EXPORT_CATALOG = [
  {
    "name": "ConceptGraphNode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "conceptGraphEngine.ts",
    "relPath": "curriculum/conceptGraphEngine.ts"
  },
  {
    "name": "ConceptGraphEdge",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "conceptGraphEngine.ts",
    "relPath": "curriculum/conceptGraphEngine.ts"
  },
  {
    "name": "DiagnosticRemediationRoute",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "conceptGraphEngine.ts",
    "relPath": "curriculum/conceptGraphEngine.ts"
  },
  {
    "name": "ConceptGraphEngine",
    "kind": "const",
    "returnType": "ConceptGraphEngineSingleton",
    "params": [],
    "sourceFile": "conceptGraphEngine.ts",
    "relPath": "curriculum/conceptGraphEngine.ts"
  },
  {
    "name": "adaptOakStage",
    "kind": "function",
    "returnType": "StandardStage",
    "params": [
      {
        "name": "stage",
        "type": "any"
      }
    ],
    "sourceFile": "curriculumAdapter.ts",
    "relPath": "curriculum/curriculumAdapter.ts"
  },
  {
    "name": "StandardTopic",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "curriculumAdapter.ts",
    "relPath": "curriculum/curriculumAdapter.ts"
  },
  {
    "name": "StandardSubject",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "curriculumAdapter.ts",
    "relPath": "curriculum/curriculumAdapter.ts"
  },
  {
    "name": "StandardStage",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "curriculumAdapter.ts",
    "relPath": "curriculum/curriculumAdapter.ts"
  },
  {
    "name": "generateCurriculumStockNumber",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "stageId",
        "type": "string"
      },
      {
        "name": "subjectId",
        "type": "string"
      },
      {
        "name": "topicId",
        "type": "string"
      }
    ],
    "sourceFile": "curriculumMesh.ts",
    "relPath": "curriculum/curriculumMesh.ts"
  },
  {
    "name": "registerRouteNode",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "node",
        "type": "CurriculumRouteNode"
      }
    ],
    "sourceFile": "curriculumMesh.ts",
    "relPath": "curriculum/curriculumMesh.ts"
  },
  {
    "name": "ingestCustomCurriculumPack",
    "kind": "function",
    "returnType": "number",
    "params": [
      {
        "name": "pack",
        "type": "any"
      }
    ],
    "sourceFile": "curriculumMesh.ts",
    "relPath": "curriculum/curriculumMesh.ts"
  },
  {
    "name": "syncMeshToIndexedDB",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [],
    "sourceFile": "curriculumMesh.ts",
    "relPath": "curriculum/curriculumMesh.ts"
  },
  {
    "name": "resolveCurriculumRoute",
    "kind": "function",
    "returnType": "CurriculumRouteNode",
    "params": [
      {
        "name": "stage",
        "type": "string"
      },
      {
        "name": "subject",
        "type": "string"
      },
      {
        "name": "topic",
        "type": "string"
      },
      {
        "name": "lessonTitleOrId",
        "type": "string"
      }
    ],
    "sourceFile": "curriculumMesh.ts",
    "relPath": "curriculum/curriculumMesh.ts"
  },
  {
    "name": "getQuestionForRoute",
    "kind": "function",
    "returnType": "CurriculumQuestionItem",
    "params": [
      {
        "name": "route",
        "type": "CurriculumRouteNode"
      },
      {
        "name": "lessonTitleOrId",
        "type": "string"
      },
      {
        "name": "forceVariation",
        "type": "boolean"
      },
      {
        "name": "seedToken",
        "type": "string"
      },
      {
        "name": "excludePrompt",
        "type": "string"
      }
    ],
    "sourceFile": "curriculumMesh.ts",
    "relPath": "curriculum/curriculumMesh.ts"
  },
  {
    "name": "exportCurriculumMeshToSExpr",
    "kind": "function",
    "returnType": "string",
    "params": [],
    "sourceFile": "curriculumMesh.ts",
    "relPath": "curriculum/curriculumMesh.ts"
  },
  {
    "name": "exportCurriculumMeshToJSON",
    "kind": "function",
    "returnType": "object",
    "params": [],
    "sourceFile": "curriculumMesh.ts",
    "relPath": "curriculum/curriculumMesh.ts"
  },
  {
    "name": "ExecutionEngineType",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "curriculumMesh.ts",
    "relPath": "curriculum/curriculumMesh.ts"
  },
  {
    "name": "CurriculumQuestionItem",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "curriculumMesh.ts",
    "relPath": "curriculum/curriculumMesh.ts"
  },
  {
    "name": "CurriculumLessonNode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "curriculumMesh.ts",
    "relPath": "curriculum/curriculumMesh.ts"
  },
  {
    "name": "CurriculumRouteNode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "curriculumMesh.ts",
    "relPath": "curriculum/curriculumMesh.ts"
  },
  {
    "name": "ALL_CURRICULUM_ROUTES",
    "kind": "const",
    "returnType": "CurriculumRouteNode[]",
    "params": [],
    "sourceFile": "curriculumMesh.ts",
    "relPath": "curriculum/curriculumMesh.ts"
  },
  {
    "name": "resolveTopicSimulator",
    "kind": "function",
    "returnType": "SimPresetBadge",
    "params": [
      {
        "name": "topicId",
        "type": "string"
      },
      {
        "name": "topicTitle",
        "type": "string"
      },
      {
        "name": "subjectTitle",
        "type": "string"
      }
    ],
    "sourceFile": "curriculumSimMapping.ts",
    "relPath": "curriculum/curriculumSimMapping.ts"
  },
  {
    "name": "hasDataCartridge",
    "kind": "function",
    "returnType": "boolean",
    "params": [
      {
        "name": "topicId",
        "type": "string"
      }
    ],
    "sourceFile": "curriculumSimMapping.ts",
    "relPath": "curriculum/curriculumSimMapping.ts"
  },
  {
    "name": "SimPresetBadge",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "curriculumSimMapping.ts",
    "relPath": "curriculum/curriculumSimMapping.ts"
  },
  {
    "name": "FOLDER_MANIFEST",
    "kind": "const",
    "returnType": "{ readonly folder: \"src/curriculum\"; readonly timestamp: 1787937755228; readonly totalModules: 2; readonly exports: readonly [{ readonly name: \"StandardTopic\"; readonly isType: true; readonly sourceFile: \"curriculumAdapter\"; }, ... 8 more ..., { ...; }]; }",
    "params": [],
    "sourceFile": "engine.ts",
    "relPath": "curriculum/engine.ts"
  },
  {
    "name": "FolderExportNames",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "engine.ts",
    "relPath": "curriculum/engine.ts"
  },
  {
    "name": "adaptOakStage",
    "kind": "function",
    "returnType": "StandardStage",
    "params": [
      {
        "name": "stage",
        "type": "any"
      }
    ],
    "sourceFile": "engine.ts",
    "relPath": "curriculum/engine.ts"
  },
  {
    "name": "StandardTopic",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "engine.ts",
    "relPath": "curriculum/engine.ts"
  },
  {
    "name": "StandardSubject",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "engine.ts",
    "relPath": "curriculum/engine.ts"
  },
  {
    "name": "StandardStage",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "engine.ts",
    "relPath": "curriculum/engine.ts"
  },
  {
    "name": "findTopicLessons",
    "kind": "function",
    "returnType": "OakLesson[]",
    "params": [
      {
        "name": "stageKey",
        "type": "string"
      },
      {
        "name": "subjectTitle",
        "type": "string"
      },
      {
        "name": "topicTitle",
        "type": "string"
      }
    ],
    "sourceFile": "engine.ts",
    "relPath": "curriculum/engine.ts"
  },
  {
    "name": "OakLesson",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "engine.ts",
    "relPath": "curriculum/engine.ts"
  },
  {
    "name": "OakTopic",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "engine.ts",
    "relPath": "curriculum/engine.ts"
  },
  {
    "name": "OakSubject",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "engine.ts",
    "relPath": "curriculum/engine.ts"
  },
  {
    "name": "OakStage",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "engine.ts",
    "relPath": "curriculum/engine.ts"
  },
  {
    "name": "OAK_CURRICULUM_CATALOGUE",
    "kind": "const",
    "returnType": "Record<string, OakStage>",
    "params": [],
    "sourceFile": "engine.ts",
    "relPath": "curriculum/engine.ts"
  },
  {
    "name": "OakCatalogue",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "engine.ts",
    "relPath": "curriculum/engine.ts"
  },
  {
    "name": "DEFAULT_OAK_CATALOGUE",
    "kind": "const",
    "returnType": "OakCatalogue",
    "params": [],
    "sourceFile": "engine.ts",
    "relPath": "curriculum/engine.ts"
  },
  {
    "name": "getActiveCurriculum",
    "kind": "function",
    "returnType": "CurriculumPackage",
    "params": [
      {
        "name": "id",
        "type": "string"
      }
    ],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "dispatchAstIntent",
    "kind": "function",
    "returnType": "T",
    "params": [
      {
        "name": "symbolName",
        "type": "string"
      },
      {
        "name": "args",
        "type": "any[]"
      }
    ],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "CurriculumPackage",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "CurriculumRegistry",
    "kind": "const",
    "returnType": "Record<string, CurriculumPackage>",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "generateCurriculumStockNumber",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "stageId",
        "type": "string"
      },
      {
        "name": "subjectId",
        "type": "string"
      },
      {
        "name": "topicId",
        "type": "string"
      }
    ],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "registerRouteNode",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "node",
        "type": "CurriculumRouteNode"
      }
    ],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "ingestCustomCurriculumPack",
    "kind": "function",
    "returnType": "number",
    "params": [
      {
        "name": "pack",
        "type": "any"
      }
    ],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "syncMeshToIndexedDB",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "resolveCurriculumRoute",
    "kind": "function",
    "returnType": "CurriculumRouteNode",
    "params": [
      {
        "name": "stage",
        "type": "string"
      },
      {
        "name": "subject",
        "type": "string"
      },
      {
        "name": "topic",
        "type": "string"
      },
      {
        "name": "lessonTitleOrId",
        "type": "string"
      }
    ],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "getQuestionForRoute",
    "kind": "function",
    "returnType": "CurriculumQuestionItem",
    "params": [
      {
        "name": "route",
        "type": "CurriculumRouteNode"
      },
      {
        "name": "lessonTitleOrId",
        "type": "string"
      },
      {
        "name": "forceVariation",
        "type": "boolean"
      },
      {
        "name": "seedToken",
        "type": "string"
      },
      {
        "name": "excludePrompt",
        "type": "string"
      }
    ],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "exportCurriculumMeshToSExpr",
    "kind": "function",
    "returnType": "string",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "exportCurriculumMeshToJSON",
    "kind": "function",
    "returnType": "object",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "ExecutionEngineType",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "CurriculumQuestionItem",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "CurriculumLessonNode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "CurriculumRouteNode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "ALL_CURRICULUM_ROUTES",
    "kind": "const",
    "returnType": "CurriculumRouteNode[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "curriculum/index.ts"
  },
  {
    "name": "generateCurriculumAst",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "dirPath",
        "type": "string"
      },
      {
        "name": "outputPath",
        "type": "string"
      }
    ],
    "sourceFile": "mineCurriculumAst.ts",
    "relPath": "curriculum/mineCurriculumAst.ts"
  },
  {
    "name": "findTopicLessons",
    "kind": "function",
    "returnType": "OakLesson[]",
    "params": [
      {
        "name": "stageKey",
        "type": "string"
      },
      {
        "name": "subjectTitle",
        "type": "string"
      },
      {
        "name": "topicTitle",
        "type": "string"
      }
    ],
    "sourceFile": "oakCatalogue.ts",
    "relPath": "curriculum/oakCatalogue.ts"
  },
  {
    "name": "OakLesson",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "oakCatalogue.ts",
    "relPath": "curriculum/oakCatalogue.ts"
  },
  {
    "name": "OakTopic",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "oakCatalogue.ts",
    "relPath": "curriculum/oakCatalogue.ts"
  },
  {
    "name": "OakSubject",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "oakCatalogue.ts",
    "relPath": "curriculum/oakCatalogue.ts"
  },
  {
    "name": "OakStage",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "oakCatalogue.ts",
    "relPath": "curriculum/oakCatalogue.ts"
  },
  {
    "name": "OAK_CURRICULUM_CATALOGUE",
    "kind": "const",
    "returnType": "Record<string, OakStage>",
    "params": [],
    "sourceFile": "oakCatalogue.ts",
    "relPath": "curriculum/oakCatalogue.ts"
  },
  {
    "name": "OakCatalogue",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "oakCatalogue.ts",
    "relPath": "curriculum/oakCatalogue.ts"
  },
  {
    "name": "DEFAULT_OAK_CATALOGUE",
    "kind": "const",
    "returnType": "OakCatalogue",
    "params": [],
    "sourceFile": "oakCatalogue.ts",
    "relPath": "curriculum/oakCatalogue.ts"
  },
  {
    "name": "AltarTypeInfo",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "altarData.ts",
    "relPath": "data/catholic/altarData.ts"
  },
  {
    "name": "AltarCandleRule",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "altarData.ts",
    "relPath": "data/catholic/altarData.ts"
  },
  {
    "name": "AltarAppointment",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "altarData.ts",
    "relPath": "data/catholic/altarData.ts"
  },
  {
    "name": "AltarDressingStep",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "altarData.ts",
    "relPath": "data/catholic/altarData.ts"
  },
  {
    "name": "LiturgicalSeasonTheme",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "altarData.ts",
    "relPath": "data/catholic/altarData.ts"
  },
  {
    "name": "LITURGICAL_SEASON_THEMES",
    "kind": "const",
    "returnType": "Record<string, LiturgicalSeasonTheme>",
    "params": [],
    "sourceFile": "altarData.ts",
    "relPath": "data/catholic/altarData.ts"
  },
  {
    "name": "ALTAR_CANDLE_RULES",
    "kind": "const",
    "returnType": "Record<\"daily\" | \"sunday\" | \"bishop\", AltarCandleRule>",
    "params": [],
    "sourceFile": "altarData.ts",
    "relPath": "data/catholic/altarData.ts"
  },
  {
    "name": "ALTAR_TYPES",
    "kind": "const",
    "returnType": "AltarTypeInfo[]",
    "params": [],
    "sourceFile": "altarData.ts",
    "relPath": "data/catholic/altarData.ts"
  },
  {
    "name": "ALTAR_APPOINTMENTS",
    "kind": "const",
    "returnType": "AltarAppointment[]",
    "params": [],
    "sourceFile": "altarData.ts",
    "relPath": "data/catholic/altarData.ts"
  },
  {
    "name": "ALTAR_DRESSING_STEPS",
    "kind": "const",
    "returnType": "AltarDressingStep[]",
    "params": [],
    "sourceFile": "altarData.ts",
    "relPath": "data/catholic/altarData.ts"
  },
  {
    "name": "TabernacleCatechesis",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "altarData.ts",
    "relPath": "data/catholic/altarData.ts"
  },
  {
    "name": "TABERNACLE_CATECHESIS",
    "kind": "const",
    "returnType": "TabernacleCatechesis",
    "params": [],
    "sourceFile": "altarData.ts",
    "relPath": "data/catholic/altarData.ts"
  },
  {
    "name": "RiteAltarTradition",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "altarData.ts",
    "relPath": "data/catholic/altarData.ts"
  },
  {
    "name": "RITE_ALTAR_TRADITIONS",
    "kind": "const",
    "returnType": "RiteAltarTradition[]",
    "params": [],
    "sourceFile": "altarData.ts",
    "relPath": "data/catholic/altarData.ts"
  },
  {
    "name": "CatholicPrayer",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "catholicPrayers.ts",
    "relPath": "data/catholic/catholicPrayers.ts"
  },
  {
    "name": "CATHOLIC_PRAYERS",
    "kind": "const",
    "returnType": "CatholicPrayer[]",
    "params": [],
    "sourceFile": "catholicPrayers.ts",
    "relPath": "data/catholic/catholicPrayers.ts"
  },
  {
    "name": "SuiIurisChurch",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "catholicRitesData.ts",
    "relPath": "data/catholic/catholicRitesData.ts"
  },
  {
    "name": "LiturgicalRiteFamily",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "catholicRitesData.ts",
    "relPath": "data/catholic/catholicRitesData.ts"
  },
  {
    "name": "LiturgicalComparisonTopic",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "catholicRitesData.ts",
    "relPath": "data/catholic/catholicRitesData.ts"
  },
  {
    "name": "ConsecrationVoiceSample",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "catholicRitesData.ts",
    "relPath": "data/catholic/catholicRitesData.ts"
  },
  {
    "name": "LITURGICAL_RITE_FAMILIES",
    "kind": "const",
    "returnType": "LiturgicalRiteFamily[]",
    "params": [],
    "sourceFile": "catholicRitesData.ts",
    "relPath": "data/catholic/catholicRitesData.ts"
  },
  {
    "name": "SUI_IURIS_CHURCHES",
    "kind": "const",
    "returnType": "SuiIurisChurch[]",
    "params": [],
    "sourceFile": "catholicRitesData.ts",
    "relPath": "data/catholic/catholicRitesData.ts"
  },
  {
    "name": "LITURGICAL_COMPARISONS",
    "kind": "const",
    "returnType": "LiturgicalComparisonTopic[]",
    "params": [],
    "sourceFile": "catholicRitesData.ts",
    "relPath": "data/catholic/catholicRitesData.ts"
  },
  {
    "name": "CONSECRATION_VOICES",
    "kind": "const",
    "returnType": "ConsecrationVoiceSample[]",
    "params": [],
    "sourceFile": "catholicRitesData.ts",
    "relPath": "data/catholic/catholicRitesData.ts"
  },
  {
    "name": "CSTPrinciple",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "cstAndVirtues.ts",
    "relPath": "data/catholic/cstAndVirtues.ts"
  },
  {
    "name": "CST_PRINCIPLES",
    "kind": "const",
    "returnType": "CSTPrinciple[]",
    "params": [],
    "sourceFile": "cstAndVirtues.ts",
    "relPath": "data/catholic/cstAndVirtues.ts"
  },
  {
    "name": "SchoolVirtue",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "cstAndVirtues.ts",
    "relPath": "data/catholic/cstAndVirtues.ts"
  },
  {
    "name": "SCHOOL_VIRTUES",
    "kind": "const",
    "returnType": "SchoolVirtue[]",
    "params": [],
    "sourceFile": "cstAndVirtues.ts",
    "relPath": "data/catholic/cstAndVirtues.ts"
  },
  {
    "name": "HolyOil",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "holyOilsData.ts",
    "relPath": "data/catholic/holyOilsData.ts"
  },
  {
    "name": "HolyAmbryInfo",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "holyOilsData.ts",
    "relPath": "data/catholic/holyOilsData.ts"
  },
  {
    "name": "HOLY_OILS",
    "kind": "const",
    "returnType": "HolyOil[]",
    "params": [],
    "sourceFile": "holyOilsData.ts",
    "relPath": "data/catholic/holyOilsData.ts"
  },
  {
    "name": "HOLY_AMBRY_INFO",
    "kind": "const",
    "returnType": "HolyAmbryInfo",
    "params": [],
    "sourceFile": "holyOilsData.ts",
    "relPath": "data/catholic/holyOilsData.ts"
  },
  {
    "name": "SacramentalOilQuizQuestion",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "holyOilsData.ts",
    "relPath": "data/catholic/holyOilsData.ts"
  },
  {
    "name": "HOLY_OILS_QUIZ",
    "kind": "const",
    "returnType": "SacramentalOilQuizQuestion[]",
    "params": [],
    "sourceFile": "holyOilsData.ts",
    "relPath": "data/catholic/holyOilsData.ts"
  },
  {
    "name": "HolyWaterFact",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "holyWaterThuriferData.ts",
    "relPath": "data/catholic/holyWaterThuriferData.ts"
  },
  {
    "name": "ThuriferRoleFact",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "holyWaterThuriferData.ts",
    "relPath": "data/catholic/holyWaterThuriferData.ts"
  },
  {
    "name": "IncensationMoment",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "holyWaterThuriferData.ts",
    "relPath": "data/catholic/holyWaterThuriferData.ts"
  },
  {
    "name": "HolyWaterThuriferQuiz",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "holyWaterThuriferData.ts",
    "relPath": "data/catholic/holyWaterThuriferData.ts"
  },
  {
    "name": "HOLY_WATER_CATECHESIS",
    "kind": "const",
    "returnType": "HolyWaterFact[]",
    "params": [],
    "sourceFile": "holyWaterThuriferData.ts",
    "relPath": "data/catholic/holyWaterThuriferData.ts"
  },
  {
    "name": "THURIFER_AND_INCENSE_CATECHESIS",
    "kind": "const",
    "returnType": "ThuriferRoleFact[]",
    "params": [],
    "sourceFile": "holyWaterThuriferData.ts",
    "relPath": "data/catholic/holyWaterThuriferData.ts"
  },
  {
    "name": "INCENSATION_MOMENTS",
    "kind": "const",
    "returnType": "IncensationMoment[]",
    "params": [],
    "sourceFile": "holyWaterThuriferData.ts",
    "relPath": "data/catholic/holyWaterThuriferData.ts"
  },
  {
    "name": "HOLY_WATER_THURIFER_QUIZ",
    "kind": "const",
    "returnType": "HolyWaterThuriferQuiz[]",
    "params": [],
    "sourceFile": "holyWaterThuriferData.ts",
    "relPath": "data/catholic/holyWaterThuriferData.ts"
  },
  {
    "name": "CSTPrinciple",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "CST_PRINCIPLES",
    "kind": "const",
    "returnType": "CSTPrinciple[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "SchoolVirtue",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "SCHOOL_VIRTUES",
    "kind": "const",
    "returnType": "SchoolVirtue[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "LiturgyStep",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "LITURGY_STEPS",
    "kind": "const",
    "returnType": "LiturgyStep[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "CORRECT_LITURGY_SEQUENCE_IDS",
    "kind": "const",
    "returnType": "string[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "SacredObject",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "SACRED_OBJECTS",
    "kind": "const",
    "returnType": "SacredObject[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "CatholicPrayer",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "CATHOLIC_PRAYERS",
    "kind": "const",
    "returnType": "CatholicPrayer[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "LatinPrayerVerse",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "LatinPrayerItem",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "LATIN_PRAYERS_DATA",
    "kind": "const",
    "returnType": "LatinPrayerItem[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "StationQuest",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "SANCTUARY_QUESTS",
    "kind": "const",
    "returnType": "StationQuest[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "SacramentData",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "SacramentQuizQuestion",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "SEVEN_SACRAMENTS",
    "kind": "const",
    "returnType": "SacramentData[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "SACRAMENTS_QUIZ_QUESTIONS",
    "kind": "const",
    "returnType": "SacramentQuizQuestion[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "getCurrentSeasonByDate",
    "kind": "function",
    "returnType": "LiturgicalSeason",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "LiturgicalSeason",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "LiturgicalQuizItem",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "LITURGICAL_SEASONS",
    "kind": "const",
    "returnType": "LiturgicalSeason[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "LITURGICAL_QUIZ_QUESTIONS",
    "kind": "const",
    "returnType": "LiturgicalQuizItem[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "CATHOLIC_KS2_KNOWLEDGE",
    "kind": "const",
    "returnType": "Record<string, CurriculumTopicKnowledge>",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "CATHOLIC_KS3_KNOWLEDGE",
    "kind": "const",
    "returnType": "Record<string, CurriculumTopicEntry>",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "AltarTypeInfo",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "AltarCandleRule",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "AltarAppointment",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "AltarDressingStep",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "LiturgicalSeasonTheme",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "LITURGICAL_SEASON_THEMES",
    "kind": "const",
    "returnType": "Record<string, LiturgicalSeasonTheme>",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "ALTAR_CANDLE_RULES",
    "kind": "const",
    "returnType": "Record<\"daily\" | \"sunday\" | \"bishop\", AltarCandleRule>",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "ALTAR_TYPES",
    "kind": "const",
    "returnType": "AltarTypeInfo[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "ALTAR_APPOINTMENTS",
    "kind": "const",
    "returnType": "AltarAppointment[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "ALTAR_DRESSING_STEPS",
    "kind": "const",
    "returnType": "AltarDressingStep[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "TabernacleCatechesis",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "TABERNACLE_CATECHESIS",
    "kind": "const",
    "returnType": "TabernacleCatechesis",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "RiteAltarTradition",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "RITE_ALTAR_TRADITIONS",
    "kind": "const",
    "returnType": "RiteAltarTradition[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "HolyOil",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "HolyAmbryInfo",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "HOLY_OILS",
    "kind": "const",
    "returnType": "HolyOil[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "HOLY_AMBRY_INFO",
    "kind": "const",
    "returnType": "HolyAmbryInfo",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "SacramentalOilQuizQuestion",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "HOLY_OILS_QUIZ",
    "kind": "const",
    "returnType": "SacramentalOilQuizQuestion[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "ReceptionMethod",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "OurFatherPosture",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "LiturgicalMyth",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "EUCHARISTIC_RECEPTION_METHODS",
    "kind": "const",
    "returnType": "ReceptionMethod[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "OUR_FATHER_POSTURES",
    "kind": "const",
    "returnType": "OurFatherPosture[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "LITURGICAL_MYTHS",
    "kind": "const",
    "returnType": "LiturgicalMyth[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "HolyWaterFact",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "ThuriferRoleFact",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "IncensationMoment",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "HolyWaterThuriferQuiz",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "HOLY_WATER_CATECHESIS",
    "kind": "const",
    "returnType": "HolyWaterFact[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "THURIFER_AND_INCENSE_CATECHESIS",
    "kind": "const",
    "returnType": "ThuriferRoleFact[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "INCENSATION_MOMENTS",
    "kind": "const",
    "returnType": "IncensationMoment[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "HOLY_WATER_THURIFER_QUIZ",
    "kind": "const",
    "returnType": "HolyWaterThuriferQuiz[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "StationOfTheCross",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "OPENING_DEVOTIONAL_VERSICLE",
    "kind": "const",
    "returnType": "{ leaderLatin: string; leaderEnglish: string; responseLatin: string; responseEnglish: string; }",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "STATIONS_OF_THE_CROSS",
    "kind": "const",
    "returnType": "StationOfTheCross[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "STATIONS_HISTORY_AND_THEOLOGY",
    "kind": "const",
    "returnType": "{ historicalOrigins: string; traditionalNumber: string; scripturalAndTraditionalStations: string; plenaryIndulgence: string; }",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "getCurrentCanonicalHour",
    "kind": "function",
    "returnType": "CanonicalHour",
    "params": [
      {
        "name": "date",
        "type": "Date"
      }
    ],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "CanonicalHour",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "MarianAntiphon",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "CANONICAL_HOURS",
    "kind": "const",
    "returnType": "CanonicalHour[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "MARIAN_ANTIPHONS",
    "kind": "const",
    "returnType": "MarianAntiphon[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "FOUR_WEEK_PSALTER_EXPLANATION",
    "kind": "const",
    "returnType": "{ title: string; description: string; structureRules: string[]; }",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "BREVIARY_FAQS",
    "kind": "const",
    "returnType": "{ question: string; answer: string; }[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "TriduumCeremony",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "TriduumMovement",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "LumenChristiStep",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "LUMEN_CHRISTI_CEREMONY_STEPS",
    "kind": "const",
    "returnType": "LumenChristiStep[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "TRIDUUM_MOVEMENTS",
    "kind": "const",
    "returnType": "TriduumMovement[]",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "EXSULTET_SACRED_TEXT",
    "kind": "const",
    "returnType": "{ latinTitle: string; englishTitle: string; openingInvocation: { latin: string; english: string; spanish: string; }; felixCulpaStanza: { latin: string; english: string; spanish: string; }; pillarOfFireStanza: { ...; }; }",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "VICTIMAE_PASCHALI_SEQUENCE",
    "kind": "const",
    "returnType": "{ latinTitle: string; englishTitle: string; stanzas: { latin: string; english: string; spanish: string; }[]; }",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "data/catholic/index.ts"
  },
  {
    "name": "LatinPrayerVerse",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "latinPrayers.ts",
    "relPath": "data/catholic/latinPrayers.ts"
  },
  {
    "name": "LatinPrayerItem",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "latinPrayers.ts",
    "relPath": "data/catholic/latinPrayers.ts"
  },
  {
    "name": "LATIN_PRAYERS_DATA",
    "kind": "const",
    "returnType": "LatinPrayerItem[]",
    "params": [],
    "sourceFile": "latinPrayers.ts",
    "relPath": "data/catholic/latinPrayers.ts"
  },
  {
    "name": "getCurrentSeasonByDate",
    "kind": "function",
    "returnType": "LiturgicalSeason",
    "params": [],
    "sourceFile": "liturgicalCalendar.ts",
    "relPath": "data/catholic/liturgicalCalendar.ts"
  },
  {
    "name": "LiturgicalSeason",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "liturgicalCalendar.ts",
    "relPath": "data/catholic/liturgicalCalendar.ts"
  },
  {
    "name": "LiturgicalQuizItem",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "liturgicalCalendar.ts",
    "relPath": "data/catholic/liturgicalCalendar.ts"
  },
  {
    "name": "LITURGICAL_SEASONS",
    "kind": "const",
    "returnType": "LiturgicalSeason[]",
    "params": [],
    "sourceFile": "liturgicalCalendar.ts",
    "relPath": "data/catholic/liturgicalCalendar.ts"
  },
  {
    "name": "LITURGICAL_QUIZ_QUESTIONS",
    "kind": "const",
    "returnType": "LiturgicalQuizItem[]",
    "params": [],
    "sourceFile": "liturgicalCalendar.ts",
    "relPath": "data/catholic/liturgicalCalendar.ts"
  },
  {
    "name": "ReceptionMethod",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "liturgicalPosturesData.ts",
    "relPath": "data/catholic/liturgicalPosturesData.ts"
  },
  {
    "name": "OurFatherPosture",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "liturgicalPosturesData.ts",
    "relPath": "data/catholic/liturgicalPosturesData.ts"
  },
  {
    "name": "LiturgicalMyth",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "liturgicalPosturesData.ts",
    "relPath": "data/catholic/liturgicalPosturesData.ts"
  },
  {
    "name": "EUCHARISTIC_RECEPTION_METHODS",
    "kind": "const",
    "returnType": "ReceptionMethod[]",
    "params": [],
    "sourceFile": "liturgicalPosturesData.ts",
    "relPath": "data/catholic/liturgicalPosturesData.ts"
  },
  {
    "name": "OUR_FATHER_POSTURES",
    "kind": "const",
    "returnType": "OurFatherPosture[]",
    "params": [],
    "sourceFile": "liturgicalPosturesData.ts",
    "relPath": "data/catholic/liturgicalPosturesData.ts"
  },
  {
    "name": "LITURGICAL_MYTHS",
    "kind": "const",
    "returnType": "LiturgicalMyth[]",
    "params": [],
    "sourceFile": "liturgicalPosturesData.ts",
    "relPath": "data/catholic/liturgicalPosturesData.ts"
  },
  {
    "name": "getCurrentCanonicalHour",
    "kind": "function",
    "returnType": "CanonicalHour",
    "params": [
      {
        "name": "date",
        "type": "Date"
      }
    ],
    "sourceFile": "liturgyOfTheHoursData.ts",
    "relPath": "data/catholic/liturgyOfTheHoursData.ts"
  },
  {
    "name": "CanonicalHour",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "liturgyOfTheHoursData.ts",
    "relPath": "data/catholic/liturgyOfTheHoursData.ts"
  },
  {
    "name": "MarianAntiphon",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "liturgyOfTheHoursData.ts",
    "relPath": "data/catholic/liturgyOfTheHoursData.ts"
  },
  {
    "name": "CANONICAL_HOURS",
    "kind": "const",
    "returnType": "CanonicalHour[]",
    "params": [],
    "sourceFile": "liturgyOfTheHoursData.ts",
    "relPath": "data/catholic/liturgyOfTheHoursData.ts"
  },
  {
    "name": "MARIAN_ANTIPHONS",
    "kind": "const",
    "returnType": "MarianAntiphon[]",
    "params": [],
    "sourceFile": "liturgyOfTheHoursData.ts",
    "relPath": "data/catholic/liturgyOfTheHoursData.ts"
  },
  {
    "name": "FOUR_WEEK_PSALTER_EXPLANATION",
    "kind": "const",
    "returnType": "{ title: string; description: string; structureRules: string[]; }",
    "params": [],
    "sourceFile": "liturgyOfTheHoursData.ts",
    "relPath": "data/catholic/liturgyOfTheHoursData.ts"
  },
  {
    "name": "BREVIARY_FAQS",
    "kind": "const",
    "returnType": "{ question: string; answer: string; }[]",
    "params": [],
    "sourceFile": "liturgyOfTheHoursData.ts",
    "relPath": "data/catholic/liturgyOfTheHoursData.ts"
  },
  {
    "name": "LiturgyStep",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "liturgySteps.ts",
    "relPath": "data/catholic/liturgySteps.ts"
  },
  {
    "name": "LITURGY_STEPS",
    "kind": "const",
    "returnType": "LiturgyStep[]",
    "params": [],
    "sourceFile": "liturgySteps.ts",
    "relPath": "data/catholic/liturgySteps.ts"
  },
  {
    "name": "CORRECT_LITURGY_SEQUENCE_IDS",
    "kind": "const",
    "returnType": "string[]",
    "params": [],
    "sourceFile": "liturgySteps.ts",
    "relPath": "data/catholic/liturgySteps.ts"
  },
  {
    "name": "CATHOLIC_KS2_KNOWLEDGE",
    "kind": "const",
    "returnType": "Record<string, CurriculumTopicKnowledge>",
    "params": [],
    "sourceFile": "reCurriculumKnowledge.ts",
    "relPath": "data/catholic/reCurriculumKnowledge.ts"
  },
  {
    "name": "CATHOLIC_KS3_KNOWLEDGE",
    "kind": "const",
    "returnType": "Record<string, CurriculumTopicEntry>",
    "params": [],
    "sourceFile": "reKs3CurriculumKnowledge.ts",
    "relPath": "data/catholic/reKs3CurriculumKnowledge.ts"
  },
  {
    "name": "SacredObject",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sacredObjects.ts",
    "relPath": "data/catholic/sacredObjects.ts"
  },
  {
    "name": "SACRED_OBJECTS",
    "kind": "const",
    "returnType": "SacredObject[]",
    "params": [],
    "sourceFile": "sacredObjects.ts",
    "relPath": "data/catholic/sacredObjects.ts"
  },
  {
    "name": "StationQuest",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sanctuaryQuests.ts",
    "relPath": "data/catholic/sanctuaryQuests.ts"
  },
  {
    "name": "SANCTUARY_QUESTS",
    "kind": "const",
    "returnType": "StationQuest[]",
    "params": [],
    "sourceFile": "sanctuaryQuests.ts",
    "relPath": "data/catholic/sanctuaryQuests.ts"
  },
  {
    "name": "SacramentData",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sevenSacraments.ts",
    "relPath": "data/catholic/sevenSacraments.ts"
  },
  {
    "name": "SacramentQuizQuestion",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sevenSacraments.ts",
    "relPath": "data/catholic/sevenSacraments.ts"
  },
  {
    "name": "SEVEN_SACRAMENTS",
    "kind": "const",
    "returnType": "SacramentData[]",
    "params": [],
    "sourceFile": "sevenSacraments.ts",
    "relPath": "data/catholic/sevenSacraments.ts"
  },
  {
    "name": "SACRAMENTS_QUIZ_QUESTIONS",
    "kind": "const",
    "returnType": "SacramentQuizQuestion[]",
    "params": [],
    "sourceFile": "sevenSacraments.ts",
    "relPath": "data/catholic/sevenSacraments.ts"
  },
  {
    "name": "StationOfTheCross",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "stationsOfTheCrossData.ts",
    "relPath": "data/catholic/stationsOfTheCrossData.ts"
  },
  {
    "name": "OPENING_DEVOTIONAL_VERSICLE",
    "kind": "const",
    "returnType": "{ leaderLatin: string; leaderEnglish: string; responseLatin: string; responseEnglish: string; }",
    "params": [],
    "sourceFile": "stationsOfTheCrossData.ts",
    "relPath": "data/catholic/stationsOfTheCrossData.ts"
  },
  {
    "name": "STATIONS_OF_THE_CROSS",
    "kind": "const",
    "returnType": "StationOfTheCross[]",
    "params": [],
    "sourceFile": "stationsOfTheCrossData.ts",
    "relPath": "data/catholic/stationsOfTheCrossData.ts"
  },
  {
    "name": "STATIONS_HISTORY_AND_THEOLOGY",
    "kind": "const",
    "returnType": "{ historicalOrigins: string; traditionalNumber: string; scripturalAndTraditionalStations: string; plenaryIndulgence: string; }",
    "params": [],
    "sourceFile": "stationsOfTheCrossData.ts",
    "relPath": "data/catholic/stationsOfTheCrossData.ts"
  },
  {
    "name": "TriduumCeremony",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "triduumEasterData.ts",
    "relPath": "data/catholic/triduumEasterData.ts"
  },
  {
    "name": "TriduumMovement",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "triduumEasterData.ts",
    "relPath": "data/catholic/triduumEasterData.ts"
  },
  {
    "name": "LumenChristiStep",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "triduumEasterData.ts",
    "relPath": "data/catholic/triduumEasterData.ts"
  },
  {
    "name": "LUMEN_CHRISTI_CEREMONY_STEPS",
    "kind": "const",
    "returnType": "LumenChristiStep[]",
    "params": [],
    "sourceFile": "triduumEasterData.ts",
    "relPath": "data/catholic/triduumEasterData.ts"
  },
  {
    "name": "TRIDUUM_MOVEMENTS",
    "kind": "const",
    "returnType": "TriduumMovement[]",
    "params": [],
    "sourceFile": "triduumEasterData.ts",
    "relPath": "data/catholic/triduumEasterData.ts"
  },
  {
    "name": "EXSULTET_SACRED_TEXT",
    "kind": "const",
    "returnType": "{ latinTitle: string; englishTitle: string; openingInvocation: { latin: string; english: string; spanish: string; }; felixCulpaStanza: { latin: string; english: string; spanish: string; }; pillarOfFireStanza: { ...; }; }",
    "params": [],
    "sourceFile": "triduumEasterData.ts",
    "relPath": "data/catholic/triduumEasterData.ts"
  },
  {
    "name": "VICTIMAE_PASCHALI_SEQUENCE",
    "kind": "const",
    "returnType": "{ latinTitle: string; englishTitle: string; stanzas: { latin: string; english: string; spanish: string; }[]; }",
    "params": [],
    "sourceFile": "triduumEasterData.ts",
    "relPath": "data/catholic/triduumEasterData.ts"
  },
  {
    "name": "getComplianceCaveat",
    "kind": "function",
    "returnType": "ComplianceCaveat",
    "params": [
      {
        "name": "langCode",
        "type": "string"
      }
    ],
    "sourceFile": "complianceCaveats.ts",
    "relPath": "data/complianceCaveats.ts"
  },
  {
    "name": "ComplianceCaveat",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "complianceCaveats.ts",
    "relPath": "data/complianceCaveats.ts"
  },
  {
    "name": "COMPLIANCE_CAVEATS",
    "kind": "const",
    "returnType": "Record<string, ComplianceCaveat>",
    "params": [],
    "sourceFile": "complianceCaveats.ts",
    "relPath": "data/complianceCaveats.ts"
  },
  {
    "name": "CURRICULUM_COMPLETE_BASE",
    "kind": "const",
    "returnType": "Record<string, CurriculumTopicEntry>",
    "params": [],
    "sourceFile": "curriculumKnowledgeComplete.ts",
    "relPath": "data/curriculumKnowledgeComplete.ts"
  },
  {
    "name": "CurriculumTopicEntry",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "curriculumKnowledgeExpansion.ts",
    "relPath": "data/curriculumKnowledgeExpansion.ts"
  },
  {
    "name": "CURRICULUM_EXPANSION_BASE",
    "kind": "const",
    "returnType": "Record<string, CurriculumTopicEntry>",
    "params": [],
    "sourceFile": "curriculumKnowledgeExpansion.ts",
    "relPath": "data/curriculumKnowledgeExpansion.ts"
  },
  {
    "name": "getActiveCurriculumTree",
    "kind": "function",
    "returnType": "Record<string, StandardStage>",
    "params": [
      {
        "name": "providerKey",
        "type": "CurriculumProviderKey"
      }
    ],
    "sourceFile": "curriculumRegistry.ts",
    "relPath": "data/curriculumRegistry.ts"
  },
  {
    "name": "CurriculumProviderKey",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "curriculumRegistry.ts",
    "relPath": "data/curriculumRegistry.ts"
  },
  {
    "name": "CURRICULUM_PROVIDERS",
    "kind": "const",
    "returnType": "Record<CurriculumProviderKey, () => Record<string, StandardStage>>",
    "params": [],
    "sourceFile": "curriculumRegistry.ts",
    "relPath": "data/curriculumRegistry.ts"
  },
  {
    "name": "LessonCard",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "homeCurriculum.ts",
    "relPath": "data/homeCurriculum.ts"
  },
  {
    "name": "FEATURED_LESSONS",
    "kind": "const",
    "returnType": "LessonCard[]",
    "params": [],
    "sourceFile": "homeCurriculum.ts",
    "relPath": "data/homeCurriculum.ts"
  },
  {
    "name": "LanguagePhoneme",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "languagesCurriculumData.ts",
    "relPath": "data/languagesCurriculumData.ts"
  },
  {
    "name": "VerbConjugation",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "languagesCurriculumData.ts",
    "relPath": "data/languagesCurriculumData.ts"
  },
  {
    "name": "EtymologyCognate",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "languagesCurriculumData.ts",
    "relPath": "data/languagesCurriculumData.ts"
  },
  {
    "name": "LANGUAGE_PHONEMES",
    "kind": "const",
    "returnType": "LanguagePhoneme[]",
    "params": [],
    "sourceFile": "languagesCurriculumData.ts",
    "relPath": "data/languagesCurriculumData.ts"
  },
  {
    "name": "VERB_CONJUGATIONS",
    "kind": "const",
    "returnType": "VerbConjugation[]",
    "params": [],
    "sourceFile": "languagesCurriculumData.ts",
    "relPath": "data/languagesCurriculumData.ts"
  },
  {
    "name": "ETYMOLOGY_COGNATES",
    "kind": "const",
    "returnType": "EtymologyCognate[]",
    "params": [],
    "sourceFile": "languagesCurriculumData.ts",
    "relPath": "data/languagesCurriculumData.ts"
  },
  {
    "name": "NavRouteItem",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "navigationManifest.ts",
    "relPath": "data/navigationManifest.ts"
  },
  {
    "name": "NavGroup",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "navigationManifest.ts",
    "relPath": "data/navigationManifest.ts"
  },
  {
    "name": "CATHOLIC_SANCTUARY_ITEMS",
    "kind": "const",
    "returnType": "NavRouteItem[]",
    "params": [],
    "sourceFile": "navigationManifest.ts",
    "relPath": "data/navigationManifest.ts"
  },
  {
    "name": "CURRICULUM_LAB_ITEMS",
    "kind": "const",
    "returnType": "NavRouteItem[]",
    "params": [],
    "sourceFile": "navigationManifest.ts",
    "relPath": "data/navigationManifest.ts"
  },
  {
    "name": "SCHOOL_GOVERNANCE_ITEMS",
    "kind": "const",
    "returnType": "NavRouteItem[]",
    "params": [],
    "sourceFile": "navigationManifest.ts",
    "relPath": "data/navigationManifest.ts"
  },
  {
    "name": "NAV_GROUPS",
    "kind": "const",
    "returnType": "NavGroup[]",
    "params": [],
    "sourceFile": "navigationManifest.ts",
    "relPath": "data/navigationManifest.ts"
  },
  {
    "name": "findCurriculumKnowledge",
    "kind": "function",
    "returnType": "CurriculumTopicKnowledge",
    "params": [
      {
        "name": "stage",
        "type": "string"
      },
      {
        "name": "subject",
        "type": "string"
      },
      {
        "name": "topic",
        "type": "string"
      }
    ],
    "sourceFile": "oakCurriculumKnowledge.ts",
    "relPath": "data/oakCurriculumKnowledge.ts"
  },
  {
    "name": "CurriculumQuestion",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "oakCurriculumKnowledge.ts",
    "relPath": "data/oakCurriculumKnowledge.ts"
  },
  {
    "name": "CurriculumTopicKnowledge",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "oakCurriculumKnowledge.ts",
    "relPath": "data/oakCurriculumKnowledge.ts"
  },
  {
    "name": "CURRICULUM_KNOWLEDGE_BASE",
    "kind": "const",
    "returnType": "Record<string, CurriculumTopicKnowledge>",
    "params": [],
    "sourceFile": "oakCurriculumKnowledge.ts",
    "relPath": "data/oakCurriculumKnowledge.ts"
  },
  {
    "name": "OakLessonSeed",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "oakCurriculumSeeds.ts",
    "relPath": "data/oakCurriculumSeeds.ts"
  },
  {
    "name": "OAK_CURRICULUM_SEEDS",
    "kind": "const",
    "returnType": "Record<string, OakLessonSeed>",
    "params": [],
    "sourceFile": "oakCurriculumSeeds.ts",
    "relPath": "data/oakCurriculumSeeds.ts"
  },
  {
    "name": "getPhonemeSpokenText",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "grapheme",
        "type": "string"
      },
      {
        "name": "fallbackHint",
        "type": "string"
      }
    ],
    "sourceFile": "phonicsCurriculumData.ts",
    "relPath": "data/phonicsCurriculumData.ts"
  },
  {
    "name": "PhonicGrapheme",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "phonicsCurriculumData.ts",
    "relPath": "data/phonicsCurriculumData.ts"
  },
  {
    "name": "SoundSegment",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "phonicsCurriculumData.ts",
    "relPath": "data/phonicsCurriculumData.ts"
  },
  {
    "name": "DecodableWord",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "phonicsCurriculumData.ts",
    "relPath": "data/phonicsCurriculumData.ts"
  },
  {
    "name": "ScreeningWord",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "phonicsCurriculumData.ts",
    "relPath": "data/phonicsCurriculumData.ts"
  },
  {
    "name": "TrickyWord",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "phonicsCurriculumData.ts",
    "relPath": "data/phonicsCurriculumData.ts"
  },
  {
    "name": "PHONETIC_AUDIO_MAP",
    "kind": "const",
    "returnType": "Record<string, string>",
    "params": [],
    "sourceFile": "phonicsCurriculumData.ts",
    "relPath": "data/phonicsCurriculumData.ts"
  },
  {
    "name": "PHONICS_GRAPHEMES",
    "kind": "const",
    "returnType": "PhonicGrapheme[]",
    "params": [],
    "sourceFile": "phonicsCurriculumData.ts",
    "relPath": "data/phonicsCurriculumData.ts"
  },
  {
    "name": "DECODABLE_WORDS",
    "kind": "const",
    "returnType": "DecodableWord[]",
    "params": [],
    "sourceFile": "phonicsCurriculumData.ts",
    "relPath": "data/phonicsCurriculumData.ts"
  },
  {
    "name": "OFFICIAL_SCREENING_POOL",
    "kind": "const",
    "returnType": "ScreeningWord[]",
    "params": [],
    "sourceFile": "phonicsCurriculumData.ts",
    "relPath": "data/phonicsCurriculumData.ts"
  },
  {
    "name": "TRICKY_WORDS",
    "kind": "const",
    "returnType": "TrickyWord[]",
    "params": [],
    "sourceFile": "phonicsCurriculumData.ts",
    "relPath": "data/phonicsCurriculumData.ts"
  },
  {
    "name": "getRelatedConcepts",
    "kind": "function",
    "returnType": "{ id: string; title: string; stage: string; icon: string; reason: string; relationshipType: string; invariantConcept: string; }[]",
    "params": [
      {
        "name": "presetId",
        "type": "string"
      }
    ],
    "sourceFile": "astConceptGraph.ts",
    "relPath": "data/player/astConceptGraph.ts"
  },
  {
    "name": "ConceptNode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astConceptGraph.ts",
    "relPath": "data/player/astConceptGraph.ts"
  },
  {
    "name": "AST_CONCEPT_GRAPH",
    "kind": "const",
    "returnType": "Record<string, ConceptNode>",
    "params": [],
    "sourceFile": "astConceptGraph.ts",
    "relPath": "data/player/astConceptGraph.ts"
  },
  {
    "name": "getOfficialCartridgeRecord",
    "kind": "function",
    "returnType": "CartridgeChecksumEntry",
    "params": [
      {
        "name": "id",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeChecksums.ts",
    "relPath": "data/player/cartridgeChecksums.ts"
  },
  {
    "name": "isOfficialNativeCartridge",
    "kind": "function",
    "returnType": "boolean",
    "params": [
      {
        "name": "id",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeChecksums.ts",
    "relPath": "data/player/cartridgeChecksums.ts"
  },
  {
    "name": "CartridgeChecksumEntry",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "cartridgeChecksums.ts",
    "relPath": "data/player/cartridgeChecksums.ts"
  },
  {
    "name": "CartridgeRegistryManifest",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "cartridgeChecksums.ts",
    "relPath": "data/player/cartridgeChecksums.ts"
  },
  {
    "name": "CARTRIDGE_CHECKSUMS",
    "kind": "const",
    "returnType": "CartridgeRegistryManifest",
    "params": [],
    "sourceFile": "cartridgeChecksums.ts",
    "relPath": "data/player/cartridgeChecksums.ts"
  },
  {
    "name": "OFFICIAL_AUTHORITY",
    "kind": "const",
    "returnType": "\"St Joseph's Catholic Primary School Curriculum Authority\"",
    "params": [],
    "sourceFile": "cartridgeChecksums.ts",
    "relPath": "data/player/cartridgeChecksums.ts"
  },
  {
    "name": "BuiltinDataCartridgeDefinition",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "dataCartridges.ts",
    "relPath": "data/player/dataCartridges.ts"
  },
  {
    "name": "BUILTIN_DATA_CARTRIDGES",
    "kind": "const",
    "returnType": "BuiltinDataCartridgeDefinition[]",
    "params": [],
    "sourceFile": "dataCartridges.ts",
    "relPath": "data/player/dataCartridges.ts"
  },
  {
    "name": "EmbeddedCartridgeData",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "embeddedCoreCartridges.ts",
    "relPath": "data/player/embeddedCoreCartridges.ts"
  },
  {
    "name": "EMBEDDED_CORE_CARTRIDGES",
    "kind": "const",
    "returnType": "Record<string, EmbeddedCartridgeData>",
    "params": [],
    "sourceFile": "embeddedCoreCartridges.ts",
    "relPath": "data/player/embeddedCoreCartridges.ts"
  },
  {
    "name": "CartridgeType",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "generatedScenes.ts",
    "relPath": "data/player/generatedScenes.ts"
  },
  {
    "name": "ScenePresetOption",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "generatedScenes.ts",
    "relPath": "data/player/generatedScenes.ts"
  },
  {
    "name": "PRESET_OPTIONS",
    "kind": "const",
    "returnType": "ScenePresetOption[]",
    "params": [],
    "sourceFile": "generatedScenes.ts",
    "relPath": "data/player/generatedScenes.ts"
  },
  {
    "name": "DramaticChoice",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "shakespearePlays.ts",
    "relPath": "data/shakespearePlays.ts"
  },
  {
    "name": "PlayAct",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "shakespearePlays.ts",
    "relPath": "data/shakespearePlays.ts"
  },
  {
    "name": "ShakespearePlayStory",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "shakespearePlays.ts",
    "relPath": "data/shakespearePlays.ts"
  },
  {
    "name": "SHAKESPEARE_PLAY_STORIES",
    "kind": "const",
    "returnType": "ShakespearePlayStory[]",
    "params": [],
    "sourceFile": "shakespearePlays.ts",
    "relPath": "data/shakespearePlays.ts"
  },
  {
    "name": "COMMUNION_MANIFEST",
    "kind": "const",
    "returnType": "DomainManifest",
    "params": [],
    "sourceFile": "communion.ts",
    "relPath": "manifests/communion.ts"
  },
  {
    "name": "SCHOOL_MANIFEST",
    "kind": "const",
    "returnType": "DomainManifest",
    "params": [],
    "sourceFile": "school.ts",
    "relPath": "manifests/school.ts"
  },
  {
    "name": "VFS_CURRICULUM_SEEDS",
    "kind": "const",
    "returnType": "Record<string, string>",
    "params": [],
    "sourceFile": "vfsSeedModules.ts",
    "relPath": "manifests/vfsSeedModules.ts"
  },
  {
    "name": "registerServiceWorker",
    "kind": "function",
    "returnType": "void",
    "params": [],
    "sourceFile": "registerServiceWorker.ts",
    "relPath": "registerServiceWorker.ts"
  },
  {
    "name": "normalizePath",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "rawPath",
        "type": "string"
      }
    ],
    "sourceFile": "router.ts",
    "relPath": "router.ts"
  },
  {
    "name": "navigate",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "path",
        "type": "string"
      }
    ],
    "sourceFile": "router.ts",
    "relPath": "router.ts"
  },
  {
    "name": "handleRouteChange",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [],
    "sourceFile": "router.ts",
    "relPath": "router.ts"
  },
  {
    "name": "initRouter",
    "kind": "function",
    "returnType": "void",
    "params": [],
    "sourceFile": "router.ts",
    "relPath": "router.ts"
  },
  {
    "name": "RouteView",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "router.ts",
    "relPath": "router.ts"
  },
  {
    "name": "RouteHandler",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "router.ts",
    "relPath": "router.ts"
  },
  {
    "name": "navigateTo",
    "kind": "const",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "path",
        "type": "string"
      }
    ],
    "sourceFile": "router.ts",
    "relPath": "router.ts"
  },
  {
    "name": "getRuleSet",
    "kind": "function",
    "returnType": "RulePackage",
    "params": [
      {
        "name": "name",
        "type": "string"
      }
    ],
    "sourceFile": "index.ts",
    "relPath": "rules/index.ts"
  },
  {
    "name": "RulePackage",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "rules/index.ts"
  },
  {
    "name": "RulesRegistry",
    "kind": "const",
    "returnType": "Record<string, RulePackage>",
    "params": [],
    "sourceFile": "index.ts",
    "relPath": "rules/index.ts"
  },
  {
    "name": "SemanticRule",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "learning-ast.ts",
    "relPath": "types/learning-ast.ts"
  },
  {
    "name": "Challenge",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "learning-ast.ts",
    "relPath": "types/learning-ast.ts"
  },
  {
    "name": "Cohort",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "learning-ast.ts",
    "relPath": "types/learning-ast.ts"
  },
  {
    "name": "TutorPersona",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "learning-ast.ts",
    "relPath": "types/learning-ast.ts"
  },
  {
    "name": "DomainManifest",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "learning-ast.ts",
    "relPath": "types/learning-ast.ts"
  },
  {
    "name": "LearningStream",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "learning-ast.ts",
    "relPath": "types/learning-ast.ts"
  },
  {
    "name": "CatalogItem",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "learning-ast.ts",
    "relPath": "types/learning-ast.ts"
  },
  {
    "name": "StreamCategory",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "learning-ast.ts",
    "relPath": "types/learning-ast.ts"
  },
  {
    "name": "MasterCatalog",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "learning-ast.ts",
    "relPath": "types/learning-ast.ts"
  },
  {
    "name": "defineASTScene",
    "kind": "function",
    "returnType": "ASTSceneDefinition",
    "params": [
      {
        "name": "scene",
        "type": "ASTSceneDefinition"
      }
    ],
    "sourceFile": "mediaPlayer.ts",
    "relPath": "types/mediaPlayer.ts"
  },
  {
    "name": "ASTKeyframe",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "mediaPlayer.ts",
    "relPath": "types/mediaPlayer.ts"
  },
  {
    "name": "ASTSubtitle",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "mediaPlayer.ts",
    "relPath": "types/mediaPlayer.ts"
  },
  {
    "name": "ASTAudioCue",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "mediaPlayer.ts",
    "relPath": "types/mediaPlayer.ts"
  },
  {
    "name": "ASTSceneDefinition",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "mediaPlayer.ts",
    "relPath": "types/mediaPlayer.ts"
  },
  {
    "name": "ASTPlayerCommand",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "mediaPlayer.ts",
    "relPath": "types/mediaPlayer.ts"
  },
  {
    "name": "ASTPlayerTelemetry",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "mediaPlayer.ts",
    "relPath": "types/mediaPlayer.ts"
  },
  {
    "name": "getPresetConfig",
    "kind": "function",
    "returnType": "PlayerDisplayConfig",
    "params": [
      {
        "name": "mode",
        "type": "PlayerDisplayMode"
      }
    ],
    "sourceFile": "playerConfig.ts",
    "relPath": "types/playerConfig.ts"
  },
  {
    "name": "loadSavedPlayerConfig",
    "kind": "function",
    "returnType": "PlayerDisplayConfig",
    "params": [],
    "sourceFile": "playerConfig.ts",
    "relPath": "types/playerConfig.ts"
  },
  {
    "name": "savePlayerConfig",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "config",
        "type": "PlayerDisplayConfig"
      }
    ],
    "sourceFile": "playerConfig.ts",
    "relPath": "types/playerConfig.ts"
  },
  {
    "name": "PlayerDisplayMode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "playerConfig.ts",
    "relPath": "types/playerConfig.ts"
  },
  {
    "name": "PlayerDisplayConfig",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "playerConfig.ts",
    "relPath": "types/playerConfig.ts"
  },
  {
    "name": "MODE_METADATA",
    "kind": "const",
    "returnType": "Record<PlayerDisplayMode, { label: string; icon: string; tag: string; description: string; }>",
    "params": [],
    "sourceFile": "playerConfig.ts",
    "relPath": "types/playerConfig.ts"
  },
  {
    "name": "SUITE_PRESET",
    "kind": "const",
    "returnType": "PlayerDisplayConfig",
    "params": [],
    "sourceFile": "playerConfig.ts",
    "relPath": "types/playerConfig.ts"
  },
  {
    "name": "CLASSROOM_PRESET",
    "kind": "const",
    "returnType": "PlayerDisplayConfig",
    "params": [],
    "sourceFile": "playerConfig.ts",
    "relPath": "types/playerConfig.ts"
  },
  {
    "name": "STUDENT_PRESET",
    "kind": "const",
    "returnType": "PlayerDisplayConfig",
    "params": [],
    "sourceFile": "playerConfig.ts",
    "relPath": "types/playerConfig.ts"
  },
  {
    "name": "BROADCAST_PRESET",
    "kind": "const",
    "returnType": "PlayerDisplayConfig",
    "params": [],
    "sourceFile": "playerConfig.ts",
    "relPath": "types/playerConfig.ts"
  },
  {
    "name": "DEVELOPER_PRESET",
    "kind": "const",
    "returnType": "PlayerDisplayConfig",
    "params": [],
    "sourceFile": "playerConfig.ts",
    "relPath": "types/playerConfig.ts"
  },
  {
    "name": "EMBEDDED_PRESET",
    "kind": "const",
    "returnType": "PlayerDisplayConfig",
    "params": [],
    "sourceFile": "playerConfig.ts",
    "relPath": "types/playerConfig.ts"
  },
  {
    "name": "CONFIG_STORAGE_KEY",
    "kind": "const",
    "returnType": "\"stj_player_display_config\"",
    "params": [],
    "sourceFile": "playerConfig.ts",
    "relPath": "types/playerConfig.ts"
  },
  {
    "name": "isAstQuestion",
    "kind": "function",
    "returnType": "boolean",
    "params": [
      {
        "name": "node",
        "type": "any"
      }
    ],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "isAstScene",
    "kind": "function",
    "returnType": "boolean",
    "params": [
      {
        "name": "node",
        "type": "any"
      }
    ],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "isAstLesson",
    "kind": "function",
    "returnType": "boolean",
    "params": [
      {
        "name": "node",
        "type": "any"
      }
    ],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "SExprAtom",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "SExprNode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "SExprAST",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "AstQuestionNode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "ParsedAstNode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "AstCameraOrbit",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "AstKeyframeNode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "AstBindingType",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "AstBindingNode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "AstSubtitleNode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "AstPhysicsBody",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "AstPhysicsConfig",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "AstSceneNode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "AstLessonNode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "UnifiedAstUnit",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "BackendTier",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "EngineExecutionResult",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "EngineOptions",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexpr.ts",
    "relPath": "types/sexpr.ts"
  },
  {
    "name": "Projected3DPoint",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "ast3dWasmBridge.ts",
    "relPath": "utils/ast3dWasmBridge.ts"
  },
  {
    "name": "AST3DWasmBridge",
    "kind": "class",
    "returnType": "typeof AST3DWasmBridge",
    "params": [],
    "sourceFile": "ast3dWasmBridge.ts",
    "relPath": "utils/ast3dWasmBridge.ts"
  },
  {
    "name": "isAstBytecode",
    "kind": "function",
    "returnType": "boolean",
    "params": [
      {
        "name": "buffer",
        "type": "ArrayBuffer | Uint8Array<ArrayBufferLike>"
      }
    ],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "compileSceneToBytecode",
    "kind": "function",
    "returnType": "Uint8Array<ArrayBufferLike>",
    "params": [
      {
        "name": "scene",
        "type": "BytecodeCompiledScene"
      }
    ],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "decompileBytecodeToScene",
    "kind": "function",
    "returnType": "BytecodeCompiledScene",
    "params": [
      {
        "name": "buffer",
        "type": "ArrayBuffer | Uint8Array<ArrayBufferLike>"
      }
    ],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "compileAstTextToBytecode",
    "kind": "function",
    "returnType": "Uint8Array<ArrayBufferLike>",
    "params": [
      {
        "name": "astText",
        "type": "string"
      }
    ],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "ASTB_MAGIC",
    "kind": "const",
    "returnType": "number[]",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "ASTB_VERSION",
    "kind": "const",
    "returnType": "1",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "ARCHETYPE_SIM",
    "kind": "const",
    "returnType": "1",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "ARCHETYPE_SLIDE",
    "kind": "const",
    "returnType": "2",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "ARCHETYPE_APP",
    "kind": "const",
    "returnType": "3",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "ARCHETYPE_FILM",
    "kind": "const",
    "returnType": "4",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "FLAG_HAS_3D",
    "kind": "const",
    "returnType": "1",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "FLAG_HAS_VIDEO",
    "kind": "const",
    "returnType": "2",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "FLAG_HAS_CHECKPOINTS",
    "kind": "const",
    "returnType": "4",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "FLAG_HAS_SUBTITLES",
    "kind": "const",
    "returnType": "8",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "OP_SCENE_META",
    "kind": "const",
    "returnType": "1",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "OP_KEYFRAME",
    "kind": "const",
    "returnType": "16",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "OP_SUBTITLE",
    "kind": "const",
    "returnType": "32",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "OP_BINDING",
    "kind": "const",
    "returnType": "48",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "OP_CHECKPOINT",
    "kind": "const",
    "returnType": "64",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "OP_CHECKPOINT_GOAL",
    "kind": "const",
    "returnType": "65",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "OP_GESTURE",
    "kind": "const",
    "returnType": "80",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "OP_VAR",
    "kind": "const",
    "returnType": "96",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "OP_INPUT",
    "kind": "const",
    "returnType": "112",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "OP_CAMERA",
    "kind": "const",
    "returnType": "128",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "OP_SCOPE",
    "kind": "const",
    "returnType": "144",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "OP_LEDGER",
    "kind": "const",
    "returnType": "145",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "OP_EOF",
    "kind": "const",
    "returnType": "255",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "AstScopeConfig",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "AstLedgerTerm",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "AstLedgerConfig",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "AstCheckpointConfig",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "BytecodeCompiledScene",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astBytecode.ts",
    "relPath": "utils/astBytecode.ts"
  },
  {
    "name": "escapeAstValue",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "str",
        "type": "unknown"
      }
    ],
    "sourceFile": "astCartridgeSerializer.ts",
    "relPath": "utils/astCartridgeSerializer.ts"
  },
  {
    "name": "valueToAst",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "val",
        "type": "any"
      },
      {
        "name": "indentLevel",
        "type": "number"
      }
    ],
    "sourceFile": "astCartridgeSerializer.ts",
    "relPath": "utils/astCartridgeSerializer.ts"
  },
  {
    "name": "serializeEntityNode",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "tag",
        "type": "string"
      },
      {
        "name": "props",
        "type": "Record<string, any>"
      },
      {
        "name": "children",
        "type": "any[]"
      },
      {
        "name": "indentLevel",
        "type": "number"
      }
    ],
    "sourceFile": "astCartridgeSerializer.ts",
    "relPath": "utils/astCartridgeSerializer.ts"
  },
  {
    "name": "serializeDatasetToCartridge",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "metadata",
        "type": "{ id: string; category: string; title: string; version?: string; itemTag?: string; items: Record<string, any>[]; }"
      }
    ],
    "sourceFile": "astCartridgeSerializer.ts",
    "relPath": "utils/astCartridgeSerializer.ts"
  },
  {
    "name": "parseCartridgeToDataset",
    "kind": "function",
    "returnType": "{ id: string; category: string; title: string; version: string; count: number; items: T[]; }",
    "params": [
      {
        "name": "astContent",
        "type": "string"
      }
    ],
    "sourceFile": "astCartridgeSerializer.ts",
    "relPath": "utils/astCartridgeSerializer.ts"
  },
  {
    "name": "compileExpressionToMathKernel",
    "kind": "function",
    "returnType": "MathDecomposition",
    "params": [
      {
        "name": "expr",
        "type": "string"
      },
      {
        "name": "targetAttr",
        "type": "string"
      }
    ],
    "sourceFile": "astMathCompiler.ts",
    "relPath": "utils/astMathCompiler.ts"
  },
  {
    "name": "evaluateAffine",
    "kind": "function",
    "returnType": "number",
    "params": [
      {
        "name": "m",
        "type": "number"
      },
      {
        "name": "c",
        "type": "number"
      },
      {
        "name": "t",
        "type": "number"
      }
    ],
    "sourceFile": "astMathCompiler.ts",
    "relPath": "utils/astMathCompiler.ts"
  },
  {
    "name": "evaluateMap",
    "kind": "function",
    "returnType": "number",
    "params": [
      {
        "name": "val",
        "type": "number"
      },
      {
        "name": "inMin",
        "type": "number"
      },
      {
        "name": "inMax",
        "type": "number"
      },
      {
        "name": "outMin",
        "type": "number"
      },
      {
        "name": "outMax",
        "type": "number"
      }
    ],
    "sourceFile": "astMathCompiler.ts",
    "relPath": "utils/astMathCompiler.ts"
  },
  {
    "name": "evaluateAffineMatrix6",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "affine",
        "type": "AffineDecomposition"
      },
      {
        "name": "t",
        "type": "number"
      },
      {
        "name": "outMatrix",
        "type": "Float32Array<ArrayBufferLike>"
      }
    ],
    "sourceFile": "astMathCompiler.ts",
    "relPath": "utils/astMathCompiler.ts"
  },
  {
    "name": "formatSvgMatrix6",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "m",
        "type": "Float32Array<ArrayBufferLike>"
      }
    ],
    "sourceFile": "astMathCompiler.ts",
    "relPath": "utils/astMathCompiler.ts"
  },
  {
    "name": "evaluateSquashStretchMatrix6",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "vx",
        "type": "number"
      },
      {
        "name": "vy",
        "type": "number"
      },
      {
        "name": "squash",
        "type": "number"
      },
      {
        "name": "tx",
        "type": "number"
      },
      {
        "name": "ty",
        "type": "number"
      },
      {
        "name": "outMatrix",
        "type": "Float32Array<ArrayBufferLike>"
      },
      {
        "name": "originX",
        "type": "number"
      },
      {
        "name": "originY",
        "type": "number"
      }
    ],
    "sourceFile": "astMathCompiler.ts",
    "relPath": "utils/astMathCompiler.ts"
  },
  {
    "name": "TransformKind",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astMathCompiler.ts",
    "relPath": "utils/astMathCompiler.ts"
  },
  {
    "name": "AffineDecomposition",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astMathCompiler.ts",
    "relPath": "utils/astMathCompiler.ts"
  },
  {
    "name": "MapDecomposition",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astMathCompiler.ts",
    "relPath": "utils/astMathCompiler.ts"
  },
  {
    "name": "FallbackDecomposition",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astMathCompiler.ts",
    "relPath": "utils/astMathCompiler.ts"
  },
  {
    "name": "MathDecomposition",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astMathCompiler.ts",
    "relPath": "utils/astMathCompiler.ts"
  },
  {
    "name": "healSExprString",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "raw",
        "type": "string"
      }
    ],
    "sourceFile": "astQuestionExtractor.ts",
    "relPath": "utils/astQuestionExtractor.ts"
  },
  {
    "name": "extractQuestionFromAst",
    "kind": "function",
    "returnType": "ExtractedQuestion",
    "params": [
      {
        "name": "rawLisp",
        "type": "string"
      }
    ],
    "sourceFile": "astQuestionExtractor.ts",
    "relPath": "utils/astQuestionExtractor.ts"
  },
  {
    "name": "stripPromptDecorators",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "prompt",
        "type": "string"
      }
    ],
    "sourceFile": "astQuestionExtractor.ts",
    "relPath": "utils/astQuestionExtractor.ts"
  },
  {
    "name": "extractDataPayloadFromAst",
    "kind": "function",
    "returnType": "DataCartridgePayload",
    "params": [
      {
        "name": "raw",
        "type": "string"
      }
    ],
    "sourceFile": "astQuestionExtractor.ts",
    "relPath": "utils/astQuestionExtractor.ts"
  },
  {
    "name": "serializeDataCartridgeToAst",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "payload",
        "type": "DataCartridgePayload"
      },
      {
        "name": "id",
        "type": "string"
      },
      {
        "name": "title",
        "type": "string"
      }
    ],
    "sourceFile": "astQuestionExtractor.ts",
    "relPath": "utils/astQuestionExtractor.ts"
  },
  {
    "name": "DataCartridgeQuestion",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astQuestionExtractor.ts",
    "relPath": "utils/astQuestionExtractor.ts"
  },
  {
    "name": "DataCartridgePayload",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astQuestionExtractor.ts",
    "relPath": "utils/astQuestionExtractor.ts"
  },
  {
    "name": "ExtractedQuestion",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astQuestionExtractor.ts",
    "relPath": "utils/astQuestionExtractor.ts"
  },
  {
    "name": "compileAstStyle",
    "kind": "function",
    "returnType": "CSSProperties",
    "params": [
      {
        "name": "styleAst",
        "type": "SExprAST | CSSProperties"
      },
      {
        "name": "nodeProps",
        "type": "Record<string, any>"
      }
    ],
    "sourceFile": "astStyleCompiler.ts",
    "relPath": "utils/astStyleCompiler.ts"
  },
  {
    "name": "CSSProperties",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astStyleCompiler.ts",
    "relPath": "utils/astStyleCompiler.ts"
  },
  {
    "name": "LITURGICAL_AST_PALETTE",
    "kind": "const",
    "returnType": "Record<string, { bg: string; border: string; text: string; accent: string; }>",
    "params": [],
    "sourceFile": "astStyleCompiler.ts",
    "relPath": "utils/astStyleCompiler.ts"
  },
  {
    "name": "DecodedSwfHeader",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astTranspilerWasmBridge.ts",
    "relPath": "utils/astTranspilerWasmBridge.ts"
  },
  {
    "name": "SwfTagScanResult",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astTranspilerWasmBridge.ts",
    "relPath": "utils/astTranspilerWasmBridge.ts"
  },
  {
    "name": "PhetScanResult",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "astTranspilerWasmBridge.ts",
    "relPath": "utils/astTranspilerWasmBridge.ts"
  },
  {
    "name": "ASTTranspilerWasmBridge",
    "kind": "class",
    "returnType": "typeof ASTTranspilerWasmBridge",
    "params": [],
    "sourceFile": "astTranspilerWasmBridge.ts",
    "relPath": "utils/astTranspilerWasmBridge.ts"
  },
  {
    "name": "transpilerWasm",
    "kind": "const",
    "returnType": "ASTTranspilerWasmBridge",
    "params": [],
    "sourceFile": "astTranspilerWasmBridge.ts",
    "relPath": "utils/astTranspilerWasmBridge.ts"
  },
  {
    "name": "isBinaryFrame",
    "kind": "function",
    "returnType": "boolean",
    "params": [
      {
        "name": "data",
        "type": "unknown"
      }
    ],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "encodeBinaryFrame",
    "kind": "function",
    "returnType": "ArrayBuffer",
    "params": [
      {
        "name": "opcode",
        "type": "number"
      },
      {
        "name": "payload",
        "type": "string | Uint8Array<ArrayBufferLike>"
      },
      {
        "name": "streamId",
        "type": "number"
      },
      {
        "name": "flags",
        "type": "number"
      }
    ],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "decodeBinaryFrame",
    "kind": "function",
    "returnType": "DecodedBinaryFrame",
    "params": [
      {
        "name": "buffer",
        "type": "ArrayBuffer"
      }
    ],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "createTokenChunkFrame",
    "kind": "function",
    "returnType": "ArrayBuffer",
    "params": [
      {
        "name": "token",
        "type": "string"
      },
      {
        "name": "streamId",
        "type": "number"
      },
      {
        "name": "isFinal",
        "type": "boolean"
      }
    ],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "createAstNodeFrame",
    "kind": "function",
    "returnType": "ArrayBuffer",
    "params": [
      {
        "name": "rawAst",
        "type": "string"
      },
      {
        "name": "streamId",
        "type": "number"
      },
      {
        "name": "isGoverned",
        "type": "boolean"
      },
      {
        "name": "metadata",
        "type": "Record<string, any>"
      }
    ],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "createEofFrame",
    "kind": "function",
    "returnType": "ArrayBuffer",
    "params": [
      {
        "name": "streamId",
        "type": "number"
      }
    ],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "PROTOCOL_MAGIC_0",
    "kind": "const",
    "returnType": "83",
    "params": [],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "PROTOCOL_MAGIC_1",
    "kind": "const",
    "returnType": "74",
    "params": [],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "PROTOCOL_VERSION",
    "kind": "const",
    "returnType": "2",
    "params": [],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "OP_TOKEN_CHUNK",
    "kind": "const",
    "returnType": "1",
    "params": [],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "OP_AST_NODE_CHUNK",
    "kind": "const",
    "returnType": "2",
    "params": [],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "OP_AST_NODE_COMPLETE",
    "kind": "const",
    "returnType": "3",
    "params": [],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "OP_HEARTBEAT_PING",
    "kind": "const",
    "returnType": "4",
    "params": [],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "OP_HEARTBEAT_PONG",
    "kind": "const",
    "returnType": "5",
    "params": [],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "OP_STATUS",
    "kind": "const",
    "returnType": "6",
    "params": [],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "OP_ERROR",
    "kind": "const",
    "returnType": "7",
    "params": [],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "OP_STREAM_EOF",
    "kind": "const",
    "returnType": "15",
    "params": [],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "FLAG_IS_FINAL",
    "kind": "const",
    "returnType": "1",
    "params": [],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "FLAG_IS_GOVERNED",
    "kind": "const",
    "returnType": "2",
    "params": [],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "FLAG_IS_JSON",
    "kind": "const",
    "returnType": "4",
    "params": [],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "DecodedBinaryFrame",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "binaryStreamProtocol.ts",
    "relPath": "utils/binaryStreamProtocol.ts"
  },
  {
    "name": "lerp3D",
    "kind": "function",
    "returnType": "Point3D",
    "params": [
      {
        "name": "a",
        "type": "Point3D"
      },
      {
        "name": "b",
        "type": "Point3D"
      },
      {
        "name": "t",
        "type": "number"
      }
    ],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "decomposeTextToBslStream",
    "kind": "function",
    "returnType": "BslHandPose[]",
    "params": [
      {
        "name": "text",
        "type": "string"
      }
    ],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "project3DToSvg",
    "kind": "function",
    "returnType": "{ x: number; y: number; scale: number; depth: number; }",
    "params": [
      {
        "name": "point",
        "type": "Point3D"
      },
      {
        "name": "camera",
        "type": "{ yaw: number; pitch: number; distance: number; fov: number; }"
      },
      {
        "name": "originX",
        "type": "number"
      },
      {
        "name": "originY",
        "type": "number"
      }
    ],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "evaluateBslEase",
    "kind": "function",
    "returnType": "number",
    "params": [
      {
        "name": "ease",
        "type": "string"
      },
      {
        "name": "t",
        "type": "number"
      }
    ],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "solveHandKinematics",
    "kind": "function",
    "returnType": "BslSolvedDominantHand",
    "params": [
      {
        "name": "wrist",
        "type": "Point3D"
      },
      {
        "name": "knuckle",
        "type": "Point3D"
      },
      {
        "name": "tip",
        "type": "Point3D"
      },
      {
        "name": "shapeInput",
        "type": "BslHandShape"
      },
      {
        "name": "palmInput",
        "type": "BslPalmOrientation"
      }
    ],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "encodePhonemicTuple",
    "kind": "function",
    "returnType": "Uint8Array<ArrayBufferLike>",
    "params": [
      {
        "name": "params",
        "type": "{ dez?: BslHandShape; tab?: string | number; sig?: string | number; ori?: BslPalmOrientation; nmfIndex?: number; aspect?: BslAspect; baseMode?: BslBaseHandMode; holdMs?: number; }"
      }
    ],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "decodePhonemicTuple",
    "kind": "function",
    "returnType": "BslHandPose",
    "params": [
      {
        "name": "tuple",
        "type": "number[] | Uint8Array<ArrayBufferLike>"
      }
    ],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "Point3D",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslMouthMorpheme",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslRoleShift",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslNmf",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslHandShape",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslPalmOrientation",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslEaseCurve",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslBaseHandMode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslBuoyType",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslBuoy",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslDirectionalVerbType",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslDirectionalAgreement",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslLevel6InstructionTuple",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslClassifierType",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslAspect",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslClassifierPredicate",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslHandPose",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BSL_BASE_HAND",
    "kind": "const",
    "returnType": "{ wrist: { x: number; y: number; z: number; }; palm: { x: number; y: number; z: number; }; fingertips: { id: string; name: string; x: number; y: number; z: number; }[]; }",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BSL_BASE_REST_HAND",
    "kind": "const",
    "returnType": "{ wrist: { x: number; y: number; z: number; }; palm: { x: number; y: number; z: number; }; fingertips: { id: string; name: string; x: number; y: number; z: number; }[]; }",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "DOMINANT_REST_POSE",
    "kind": "const",
    "returnType": "Point3D",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "DOMINANT_REST_KNUCKLE",
    "kind": "const",
    "returnType": "Point3D",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "DOMINANT_REST_WRIST",
    "kind": "const",
    "returnType": "Point3D",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BSL_ALPHABET_POSES",
    "kind": "const",
    "returnType": "Record<string, BslHandPose>",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "interpolatePoint3D",
    "kind": "const",
    "returnType": "Point3D",
    "params": [
      {
        "name": "a",
        "type": "Point3D"
      },
      {
        "name": "b",
        "type": "Point3D"
      },
      {
        "name": "t",
        "type": "number"
      }
    ],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "BslSolvedDominantHand",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "SolvedHand3D",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "PHONEMIC_DEZ_REGISTERS",
    "kind": "const",
    "returnType": "readonly BslHandShape[]",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "PHONEMIC_TAB_REGISTERS",
    "kind": "const",
    "returnType": "readonly { name: string; pos: Point3D; }[]",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "PHONEMIC_SIG_REGISTERS",
    "kind": "const",
    "returnType": "readonly [\"static-hold\", \"linear-fwd\", \"linear-sweep\", \"arc-up\", \"arc-down\", \"cycle-ellipse\", \"snap-halt\", \"recoil\"]",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "PHONEMIC_ORI_REGISTERS",
    "kind": "const",
    "returnType": "readonly BslPalmOrientation[]",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "PHONEMIC_NMF_REGISTERS",
    "kind": "const",
    "returnType": "readonly BslNmf[]",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "PHONEMIC_ASPECT_REGISTERS",
    "kind": "const",
    "returnType": "readonly BslAspect[]",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "PHONEMIC_BASE_MODES",
    "kind": "const",
    "returnType": "readonly BslBaseHandMode[]",
    "params": [],
    "sourceFile": "bslAlphabet.ts",
    "relPath": "utils/bslAlphabet.ts"
  },
  {
    "name": "point3DToAstVector",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "p",
        "type": "Point3D"
      }
    ],
    "sourceFile": "bslAstCodec.ts",
    "relPath": "utils/bslAstCodec.ts"
  },
  {
    "name": "astVectorToPoint3D",
    "kind": "function",
    "returnType": "Point3D",
    "params": [
      {
        "name": "vec",
        "type": "any"
      }
    ],
    "sourceFile": "bslAstCodec.ts",
    "relPath": "utils/bslAstCodec.ts"
  },
  {
    "name": "escapeAstString",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "str",
        "type": "string"
      }
    ],
    "sourceFile": "bslAstCodec.ts",
    "relPath": "utils/bslAstCodec.ts"
  },
  {
    "name": "serializeSignToAst",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "sign",
        "type": "BslSign"
      }
    ],
    "sourceFile": "bslAstCodec.ts",
    "relPath": "utils/bslAstCodec.ts"
  },
  {
    "name": "serializeLexiconToAst",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "lexicon",
        "type": "Record<string, BslSign>"
      },
      {
        "name": "metadata",
        "type": "{ version?: string; standard?: string; title?: string; }"
      }
    ],
    "sourceFile": "bslAstCodec.ts",
    "relPath": "utils/bslAstCodec.ts"
  },
  {
    "name": "parseAstNodeToSign",
    "kind": "function",
    "returnType": "BslSign",
    "params": [
      {
        "name": "node",
        "type": "any"
      }
    ],
    "sourceFile": "bslAstCodec.ts",
    "relPath": "utils/bslAstCodec.ts"
  },
  {
    "name": "parseAstToLexicon",
    "kind": "function",
    "returnType": "Record<string, BslSign>",
    "params": [
      {
        "name": "astContent",
        "type": "string"
      }
    ],
    "sourceFile": "bslAstCodec.ts",
    "relPath": "utils/bslAstCodec.ts"
  },
  {
    "name": "generateClassifierPredicate",
    "kind": "function",
    "returnType": "BslSign",
    "params": [
      {
        "name": "type",
        "type": "BslClassifierType"
      },
      {
        "name": "options",
        "type": "{ fromLocus?: BslLocusId; toLocus?: BslLocusId; aspect?: BslAspect; manner?: \"slow\" | \"fast\" | \"stumble\" | \"steady\" | \"zig-zag\"; entityLabel?: string; }"
      }
    ],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "mapWordToClassifier",
    "kind": "function",
    "returnType": "{ type: BslClassifierType; options?: any; }",
    "params": [
      {
        "name": "word",
        "type": "string"
      }
    ],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "modulateDirectionalKeyframes",
    "kind": "function",
    "returnType": "BslSignKeyframe[]",
    "params": [
      {
        "name": "sign",
        "type": "BslSign"
      },
      {
        "name": "fromLocus",
        "type": "Point3D"
      },
      {
        "name": "toLocus",
        "type": "Point3D"
      }
    ],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "generateDirectionalAgreementSign",
    "kind": "function",
    "returnType": "BslSign",
    "params": [
      {
        "name": "verb",
        "type": "BslDirectionalVerbType"
      },
      {
        "name": "options",
        "type": "{ fromLocus?: BslLocusId; toLocus?: BslLocusId; aspect?: BslAspect; manner?: \"slow\" | \"fast\" | \"steady\" | \"reverent\" | \"continuous\"; }"
      }
    ],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "parseBslInstructionTuple",
    "kind": "function",
    "returnType": "BslSign[]",
    "params": [
      {
        "name": "tuple",
        "type": "BslLevel6InstructionTuple"
      }
    ],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "analyzeAndTransformBslGrammar",
    "kind": "function",
    "returnType": "BslGrammarAnalysis",
    "params": [
      {
        "name": "text",
        "type": "string"
      },
      {
        "name": "options",
        "type": "BslGrammarMode | { mode?: BslGrammarMode; }"
      }
    ],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "BslClassifierType",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "BslAspect",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "BslClassifierPredicate",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "BslDirectionalVerbType",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "BslDirectionalAgreement",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "BslLevel6InstructionTuple",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "BslBuoyType",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "BslBuoy",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "BslGrammarMode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "BslLocusId",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "BslElevation",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "BslLocus",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "DEFAULT_BSL_LOCI",
    "kind": "const",
    "returnType": "Record<BslLocusId, BslLocus>",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "BslGrammarRole",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "BslGrammarToken",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "BslGrammarAnalysis",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "DIRECTIONAL_VERB_MAP",
    "kind": "const",
    "returnType": "Record<string, BslDirectionalVerbType>",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "HIERARCHICAL_HIGH_ENTITIES",
    "kind": "const",
    "returnType": "Set<string>",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "HIERARCHICAL_LOW_ENTITIES",
    "kind": "const",
    "returnType": "Set<string>",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "ADVERB_MOUTH_MAP",
    "kind": "const",
    "returnType": "Record<string, string>",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "CLASSIFIER_VERB_MAP",
    "kind": "const",
    "returnType": "Record<string, BslClassifierType>",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "ASPECT_MARKER_MAP",
    "kind": "const",
    "returnType": "Record<string, BslAspect>",
    "params": [],
    "sourceFile": "bslGrammarEngine.ts",
    "relPath": "utils/bslGrammarEngine.ts"
  },
  {
    "name": "computeHeadCenter",
    "kind": "function",
    "returnType": "Point3D",
    "params": [
      {
        "name": "headTilt",
        "type": "string"
      },
      {
        "name": "progress",
        "type": "number"
      }
    ],
    "sourceFile": "bslKinematicsEngine.ts",
    "relPath": "utils/bslKinematicsEngine.ts"
  },
  {
    "name": "projectPoint",
    "kind": "function",
    "returnType": "{ x: number; y: number; scale: number; }",
    "params": [
      {
        "name": "pt",
        "type": "Point3D"
      },
      {
        "name": "camera",
        "type": "CameraConfig"
      },
      {
        "name": "panX",
        "type": "number"
      },
      {
        "name": "panY",
        "type": "number"
      },
      {
        "name": "cameraMode",
        "type": "\"split\" | \"body\" | \"face\""
      },
      {
        "name": "zone",
        "type": "\"body\" | \"hands\""
      },
      {
        "name": "headY",
        "type": "number"
      },
      {
        "name": "headZ",
        "type": "number"
      },
      {
        "name": "roleYaw",
        "type": "number"
      }
    ],
    "sourceFile": "bslKinematicsEngine.ts",
    "relPath": "utils/bslKinematicsEngine.ts"
  },
  {
    "name": "projectSolvedHand",
    "kind": "function",
    "returnType": "SolvedHand2D",
    "params": [
      {
        "name": "hand",
        "type": "BslSolvedDominantHand"
      },
      {
        "name": "camera",
        "type": "CameraConfig"
      },
      {
        "name": "panX",
        "type": "number"
      },
      {
        "name": "panY",
        "type": "number"
      },
      {
        "name": "cameraMode",
        "type": "\"split\" | \"body\" | \"face\""
      },
      {
        "name": "headY",
        "type": "number"
      },
      {
        "name": "headZ",
        "type": "number"
      }
    ],
    "sourceFile": "bslKinematicsEngine.ts",
    "relPath": "utils/bslKinematicsEngine.ts"
  },
  {
    "name": "solveBaseHandKinematics",
    "kind": "function",
    "returnType": "BslSolvedDominantHand",
    "params": [
      {
        "name": "domHand3D",
        "type": "BslSolvedDominantHand"
      },
      {
        "name": "currentPose",
        "type": "BslHandPose"
      }
    ],
    "sourceFile": "bslKinematicsEngine.ts",
    "relPath": "utils/bslKinematicsEngine.ts"
  },
  {
    "name": "computeBslFrame",
    "kind": "function",
    "returnType": "BslSolvedFrame",
    "params": [
      {
        "name": "currentPose",
        "type": "BslHandPose"
      },
      {
        "name": "prevPose",
        "type": "BslHandPose"
      },
      {
        "name": "interpolatedWrist",
        "type": "Point3D"
      },
      {
        "name": "interpolatedKnuckle",
        "type": "Point3D"
      },
      {
        "name": "interpolatedTip",
        "type": "Point3D"
      },
      {
        "name": "progress",
        "type": "number"
      },
      {
        "name": "camera",
        "type": "CameraConfig"
      },
      {
        "name": "panX",
        "type": "number"
      },
      {
        "name": "panY",
        "type": "number"
      },
      {
        "name": "cameraMode",
        "type": "\"split\" | \"body\" | \"face\""
      }
    ],
    "sourceFile": "bslKinematicsEngine.ts",
    "relPath": "utils/bslKinematicsEngine.ts"
  },
  {
    "name": "CameraConfig",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslKinematicsEngine.ts",
    "relPath": "utils/bslKinematicsEngine.ts"
  },
  {
    "name": "SolvedHand2D",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslKinematicsEngine.ts",
    "relPath": "utils/bslKinematicsEngine.ts"
  },
  {
    "name": "SolvedFacialLandmarks2D",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslKinematicsEngine.ts",
    "relPath": "utils/bslKinematicsEngine.ts"
  },
  {
    "name": "BslSolvedFrame",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslKinematicsEngine.ts",
    "relPath": "utils/bslKinematicsEngine.ts"
  },
  {
    "name": "registerBslSigns",
    "kind": "function",
    "returnType": "number",
    "params": [
      {
        "name": "signs",
        "type": "Record<string, BslSign>"
      }
    ],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "lookupBslSign",
    "kind": "function",
    "returnType": "BslSign",
    "params": [
      {
        "name": "word",
        "type": "string"
      }
    ],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "signKeyframeToHandPose",
    "kind": "function",
    "returnType": "BslHandPose",
    "params": [
      {
        "name": "sign",
        "type": "BslSign"
      },
      {
        "name": "kf",
        "type": "BslSignKeyframe"
      },
      {
        "name": "index",
        "type": "number"
      },
      {
        "name": "total",
        "type": "number"
      }
    ],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "decomposeTextToBslStreamWithLexicon",
    "kind": "function",
    "returnType": "BslHandPose[]",
    "params": [
      {
        "name": "text",
        "type": "string"
      },
      {
        "name": "options",
        "type": "{ mode?: \"fingerspell\" | \"concept\"; }"
      }
    ],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "getMakatonSigns",
    "kind": "function",
    "returnType": "BslSign[]",
    "params": [
      {
        "name": "stage",
        "type": "number"
      }
    ],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "isMakatonWord",
    "kind": "function",
    "returnType": "boolean",
    "params": [
      {
        "name": "word",
        "type": "string"
      }
    ],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "lookupMakatonSign",
    "kind": "function",
    "returnType": "{ sign: BslSign; stage: number; }",
    "params": [
      {
        "name": "word",
        "type": "string"
      }
    ],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "BslNmf",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "BslHandShape",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "BslPalmOrientation",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "BslEaseCurve",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "BslBaseHandMode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "BslClassifierType",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "BslAspect",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "BslClassifierPredicate",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "BslBuoyType",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "BslBuoy",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "BslCategory",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "BslSignKeyframe",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "BslSign",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "BSL_CURRICULUM_LEXICON",
    "kind": "const",
    "returnType": "Record<string, BslSign>",
    "params": [],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "MakatonStageInfo",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "MAKATON_CORE_STAGES",
    "kind": "const",
    "returnType": "Record<number, MakatonStageInfo>",
    "params": [],
    "sourceFile": "bslLexicon.ts",
    "relPath": "utils/bslLexicon.ts"
  },
  {
    "name": "parseMathExpression",
    "kind": "function",
    "returnType": "(x: number) => number",
    "params": [
      {
        "name": "expr",
        "type": "string"
      }
    ],
    "sourceFile": "calculusPlotter.ts",
    "relPath": "utils/calculusPlotter.ts"
  },
  {
    "name": "PlotCoordinate",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "calculusPlotter.ts",
    "relPath": "utils/calculusPlotter.ts"
  },
  {
    "name": "TangentAnalysis",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "calculusPlotter.ts",
    "relPath": "utils/calculusPlotter.ts"
  },
  {
    "name": "IntegralAnalysis",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "calculusPlotter.ts",
    "relPath": "utils/calculusPlotter.ts"
  },
  {
    "name": "ViewportTransform",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "calculusPlotter.ts",
    "relPath": "utils/calculusPlotter.ts"
  },
  {
    "name": "CalculusPlotter",
    "kind": "class",
    "returnType": "typeof CalculusPlotter",
    "params": [],
    "sourceFile": "calculusPlotter.ts",
    "relPath": "utils/calculusPlotter.ts"
  },
  {
    "name": "CALCULUS_PRESETS",
    "kind": "const",
    "returnType": "{ id: string; name: string; category: string; latex: string; fn: (x: number) => number; derivativeStr: string; defaultX0: number; defaultA: number; defaultB: number; }[]",
    "params": [],
    "sourceFile": "calculusPlotter.ts",
    "relPath": "utils/calculusPlotter.ts"
  },
  {
    "name": "compressStringToGzip",
    "kind": "function",
    "returnType": "Promise<Uint8Array<ArrayBufferLike>>",
    "params": [
      {
        "name": "text",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeCompression.ts",
    "relPath": "utils/cartridgeCompression.ts"
  },
  {
    "name": "decompressGzipToString",
    "kind": "function",
    "returnType": "Promise<string>",
    "params": [
      {
        "name": "compressedBytes",
        "type": "Uint8Array<ArrayBufferLike>"
      }
    ],
    "sourceFile": "cartridgeCompression.ts",
    "relPath": "utils/cartridgeCompression.ts"
  },
  {
    "name": "uint8ArrayToBase64",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "bytes",
        "type": "Uint8Array<ArrayBufferLike>"
      }
    ],
    "sourceFile": "cartridgeCompression.ts",
    "relPath": "utils/cartridgeCompression.ts"
  },
  {
    "name": "base64ToUint8Array",
    "kind": "function",
    "returnType": "Uint8Array<ArrayBufferLike>",
    "params": [
      {
        "name": "base64",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeCompression.ts",
    "relPath": "utils/cartridgeCompression.ts"
  },
  {
    "name": "compressCartridge",
    "kind": "function",
    "returnType": "Promise<{ compressedBytes: Uint8Array<ArrayBufferLike>; base64: string; metadata: CompressedCartridgeMetadata; }>",
    "params": [
      {
        "name": "cartridge",
        "type": "CartridgeDefinition"
      }
    ],
    "sourceFile": "cartridgeCompression.ts",
    "relPath": "utils/cartridgeCompression.ts"
  },
  {
    "name": "decompressCartridge",
    "kind": "function",
    "returnType": "Promise<CartridgeDefinition>",
    "params": [
      {
        "name": "data",
        "type": "string | ArrayBuffer | Uint8Array<ArrayBufferLike>"
      }
    ],
    "sourceFile": "cartridgeCompression.ts",
    "relPath": "utils/cartridgeCompression.ts"
  },
  {
    "name": "compressCartridgeBundle",
    "kind": "function",
    "returnType": "Promise<CompressedBundlePayload>",
    "params": [
      {
        "name": "bundleId",
        "type": "string"
      },
      {
        "name": "title",
        "type": "string"
      },
      {
        "name": "cartridges",
        "type": "CartridgeDefinition[]"
      }
    ],
    "sourceFile": "cartridgeCompression.ts",
    "relPath": "utils/cartridgeCompression.ts"
  },
  {
    "name": "decompressCartridgeBundle",
    "kind": "function",
    "returnType": "Promise<CartridgeDefinition[]>",
    "params": [
      {
        "name": "payload",
        "type": "string | Uint8Array<ArrayBufferLike> | CompressedBundlePayload"
      }
    ],
    "sourceFile": "cartridgeCompression.ts",
    "relPath": "utils/cartridgeCompression.ts"
  },
  {
    "name": "CompressedCartridgeMetadata",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "cartridgeCompression.ts",
    "relPath": "utils/cartridgeCompression.ts"
  },
  {
    "name": "CompressedCartridgePayload",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "cartridgeCompression.ts",
    "relPath": "utils/cartridgeCompression.ts"
  },
  {
    "name": "CompressedBundlePayload",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "cartridgeCompression.ts",
    "relPath": "utils/cartridgeCompression.ts"
  },
  {
    "name": "computeSha256",
    "kind": "function",
    "returnType": "Promise<string>",
    "params": [
      {
        "name": "data",
        "type": "string | ArrayBuffer | Uint8Array<ArrayBufferLike>"
      }
    ],
    "sourceFile": "cartridgeIntegrity.ts",
    "relPath": "utils/cartridgeIntegrity.ts"
  },
  {
    "name": "computeAuthoritySeal",
    "kind": "function",
    "returnType": "Promise<string>",
    "params": [
      {
        "name": "id",
        "type": "string"
      },
      {
        "name": "astHash",
        "type": "string"
      },
      {
        "name": "svgHash",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeIntegrity.ts",
    "relPath": "utils/cartridgeIntegrity.ts"
  },
  {
    "name": "formatShortHash",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "hash",
        "type": "string"
      },
      {
        "name": "length",
        "type": "number"
      }
    ],
    "sourceFile": "cartridgeIntegrity.ts",
    "relPath": "utils/cartridgeIntegrity.ts"
  },
  {
    "name": "isNativeCartridge",
    "kind": "function",
    "returnType": "boolean",
    "params": [
      {
        "name": "id",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeIntegrity.ts",
    "relPath": "utils/cartridgeIntegrity.ts"
  },
  {
    "name": "getRegisteredRecord",
    "kind": "function",
    "returnType": "CartridgeChecksumEntry",
    "params": [
      {
        "name": "id",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeIntegrity.ts",
    "relPath": "utils/cartridgeIntegrity.ts"
  },
  {
    "name": "getMasterRegistryChecksum",
    "kind": "function",
    "returnType": "string",
    "params": [],
    "sourceFile": "cartridgeIntegrity.ts",
    "relPath": "utils/cartridgeIntegrity.ts"
  },
  {
    "name": "getTotalCertifiedCartridges",
    "kind": "function",
    "returnType": "number",
    "params": [],
    "sourceFile": "cartridgeIntegrity.ts",
    "relPath": "utils/cartridgeIntegrity.ts"
  },
  {
    "name": "verifyCartridgeIntegrity",
    "kind": "function",
    "returnType": "Promise<CartridgeIntegrityResult>",
    "params": [
      {
        "name": "cartridgeId",
        "type": "string"
      },
      {
        "name": "content",
        "type": "string | { ast?: string | ArrayBuffer; svg?: string | ArrayBuffer; astb?: ArrayBuffer; }"
      }
    ],
    "sourceFile": "cartridgeIntegrity.ts",
    "relPath": "utils/cartridgeIntegrity.ts"
  },
  {
    "name": "CURRICULUM_AUTHORITY_NAME",
    "kind": "const",
    "returnType": "\"St Joseph's Catholic Primary School Curriculum Authority\"",
    "params": [],
    "sourceFile": "cartridgeIntegrity.ts",
    "relPath": "utils/cartridgeIntegrity.ts"
  },
  {
    "name": "AUTHORITY_SEAL_SALT",
    "kind": "const",
    "returnType": "\"ST_JOSEPHS_CURRICULUM_SEAL_V1_2026_AGPL\"",
    "params": [],
    "sourceFile": "cartridgeIntegrity.ts",
    "relPath": "utils/cartridgeIntegrity.ts"
  },
  {
    "name": "IntegrityStatus",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "cartridgeIntegrity.ts",
    "relPath": "utils/cartridgeIntegrity.ts"
  },
  {
    "name": "CartridgeIntegrityResult",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "cartridgeIntegrity.ts",
    "relPath": "utils/cartridgeIntegrity.ts"
  },
  {
    "name": "CartridgeStateVector",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "cartridgeStateHex.ts",
    "relPath": "utils/cartridgeStateHex.ts"
  },
  {
    "name": "CartridgeStateHex",
    "kind": "const",
    "returnType": "{ SCHEMA_VERSION: number; BUFFER_SIZE: number; pack(state?: CartridgeStateVector): string; unpack(hexStr: string): CartridgeStateVector; saveToHash(state: CartridgeStateVector): void; loadFromHash(): CartridgeStateVector; }",
    "params": [],
    "sourceFile": "cartridgeStateHex.ts",
    "relPath": "utils/cartridgeStateHex.ts"
  },
  {
    "name": "Channel",
    "kind": "class",
    "returnType": "typeof Channel",
    "params": [],
    "sourceFile": "channelBus.ts",
    "relPath": "utils/channelBus.ts"
  },
  {
    "name": "Channels",
    "kind": "const",
    "returnType": "{ UI_ACTIONS: Channel<{ action: string; payload: any; }>; AI_DIAGNOSTICS: Channel<{ studentId: string; challengeId: string; answer: string; isCorrect: boolean; }>; PROGRESS_LOG: Channel<...>; }",
    "params": [],
    "sourceFile": "channelBus.ts",
    "relPath": "utils/channelBus.ts"
  },
  {
    "name": "encryptLocalData",
    "kind": "function",
    "returnType": "Promise<EncryptedPayload>",
    "params": [
      {
        "name": "plainText",
        "type": "string"
      },
      {
        "name": "passphrase",
        "type": "string"
      }
    ],
    "sourceFile": "cryptoVault.ts",
    "relPath": "utils/cryptoVault.ts"
  },
  {
    "name": "decryptLocalData",
    "kind": "function",
    "returnType": "Promise<string>",
    "params": [
      {
        "name": "payload",
        "type": "EncryptedPayload"
      },
      {
        "name": "passphrase",
        "type": "string"
      }
    ],
    "sourceFile": "cryptoVault.ts",
    "relPath": "utils/cryptoVault.ts"
  },
  {
    "name": "computeSha256",
    "kind": "function",
    "returnType": "Promise<string>",
    "params": [
      {
        "name": "text",
        "type": "string"
      }
    ],
    "sourceFile": "cryptoVault.ts",
    "relPath": "utils/cryptoVault.ts"
  },
  {
    "name": "EncryptedPayload",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "cryptoVault.ts",
    "relPath": "utils/cryptoVault.ts"
  },
  {
    "name": "exportAirgapHtmlBundle",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "presetId",
        "type": "string"
      },
      {
        "name": "presetTitle",
        "type": "string"
      }
    ],
    "sourceFile": "exportAirgapHtmlBundle.ts",
    "relPath": "utils/exportAirgapHtmlBundle.ts"
  },
  {
    "name": "exportSubjectCartridge",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "cartridgeIdOrPackageId",
        "type": "string"
      }
    ],
    "sourceFile": "exportSubjectCartridge.ts",
    "relPath": "utils/exportSubjectCartridge.ts"
  },
  {
    "name": "exportCustomCartridgeBundle",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "scenes",
        "type": "{ id: string; title: string; category: string; svgMarkup?: string; astSource?: string; }[]"
      },
      {
        "name": "title",
        "type": "string"
      },
      {
        "name": "description",
        "type": "string"
      },
      {
        "name": "filename",
        "type": "string"
      }
    ],
    "sourceFile": "exportSubjectCartridge.ts",
    "relPath": "utils/exportSubjectCartridge.ts"
  },
  {
    "name": "CartridgePackage",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "exportSubjectCartridge.ts",
    "relPath": "utils/exportSubjectCartridge.ts"
  },
  {
    "name": "DEFAULT_CARTRIDGE_PACKAGES",
    "kind": "const",
    "returnType": "CartridgePackage[]",
    "params": [],
    "sourceFile": "exportSubjectCartridge.ts",
    "relPath": "utils/exportSubjectCartridge.ts"
  },
  {
    "name": "AVAILABLE_CARTRIDGES",
    "kind": "const",
    "returnType": "CartridgePackage[]",
    "params": [],
    "sourceFile": "exportSubjectCartridge.ts",
    "relPath": "utils/exportSubjectCartridge.ts"
  },
  {
    "name": "resolveHarmonisedRoute",
    "kind": "function",
    "returnType": "RouteResolution",
    "params": [
      {
        "name": "rawPath",
        "type": "string"
      },
      {
        "name": "search",
        "type": "string"
      }
    ],
    "sourceFile": "harmonisedRouteResolver.ts",
    "relPath": "utils/harmonisedRouteResolver.ts"
  },
  {
    "name": "RouteResolution",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "harmonisedRouteResolver.ts",
    "relPath": "utils/harmonisedRouteResolver.ts"
  },
  {
    "name": "serializeTopicToLisp",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "entry",
        "type": "CurriculumTopicEntry"
      }
    ],
    "sourceFile": "lispCurriculumCodec.ts",
    "relPath": "utils/lispCurriculumCodec.ts"
  },
  {
    "name": "parseLispTopic",
    "kind": "function",
    "returnType": "CurriculumTopicEntry",
    "params": [
      {
        "name": "lispText",
        "type": "string"
      }
    ],
    "sourceFile": "lispCurriculumCodec.ts",
    "relPath": "utils/lispCurriculumCodec.ts"
  },
  {
    "name": "serializeCatalogueToLisp",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "catalogue",
        "type": "Record<string, CurriculumTopicEntry>"
      }
    ],
    "sourceFile": "lispCurriculumCodec.ts",
    "relPath": "utils/lispCurriculumCodec.ts"
  },
  {
    "name": "LispCurriculumQuestion",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "lispCurriculumCodec.ts",
    "relPath": "utils/lispCurriculumCodec.ts"
  },
  {
    "name": "isPhetBundle",
    "kind": "function",
    "returnType": "boolean",
    "params": [
      {
        "name": "content",
        "type": "string"
      }
    ],
    "sourceFile": "phetBridge.ts",
    "relPath": "utils/phetBridge.ts"
  },
  {
    "name": "extractPhetMetadata",
    "kind": "function",
    "returnType": "{ title: string; simName: string; version: string; locales: string[]; }",
    "params": [
      {
        "name": "content",
        "type": "string"
      },
      {
        "name": "fileName",
        "type": "string"
      }
    ],
    "sourceFile": "phetBridge.ts",
    "relPath": "utils/phetBridge.ts"
  },
  {
    "name": "extractPhetProperties",
    "kind": "function",
    "returnType": "ExtractedPhetProperty[]",
    "params": [
      {
        "name": "content",
        "type": "string"
      }
    ],
    "sourceFile": "phetBridge.ts",
    "relPath": "utils/phetBridge.ts"
  },
  {
    "name": "synthesizeUniversalPhetSim",
    "kind": "function",
    "returnType": "{ svgMarkup: string; astSource: string; invariants: string[]; }",
    "params": [
      {
        "name": "fileContent",
        "type": "string"
      },
      {
        "name": "fileName",
        "type": "string"
      },
      {
        "name": "meta",
        "type": "{ title: string; simName: string; version: string; locales: string[]; }"
      }
    ],
    "sourceFile": "phetBridge.ts",
    "relPath": "utils/phetBridge.ts"
  },
  {
    "name": "transpilePhetFile",
    "kind": "function",
    "returnType": "Promise<PhetTranspileResult>",
    "params": [
      {
        "name": "fileContent",
        "type": "string"
      },
      {
        "name": "fileName",
        "type": "string"
      }
    ],
    "sourceFile": "phetBridge.ts",
    "relPath": "utils/phetBridge.ts"
  },
  {
    "name": "transpileSwfBinary",
    "kind": "function",
    "returnType": "Promise<PhetTranspileResult>",
    "params": [
      {
        "name": "buffer",
        "type": "ArrayBuffer | Uint8Array<ArrayBufferLike>"
      },
      {
        "name": "fileName",
        "type": "string"
      }
    ],
    "sourceFile": "phetBridge.ts",
    "relPath": "utils/phetBridge.ts"
  },
  {
    "name": "PhetMetadata",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "phetBridge.ts",
    "relPath": "utils/phetBridge.ts"
  },
  {
    "name": "PhetTranspileResult",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "phetBridge.ts",
    "relPath": "utils/phetBridge.ts"
  },
  {
    "name": "SupportedPhetPreset",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "phetBridge.ts",
    "relPath": "utils/phetBridge.ts"
  },
  {
    "name": "PHET_BUILTIN_MODELS",
    "kind": "const",
    "returnType": "Record<SupportedPhetPreset, { title: string; subject: string; stage: string; invariants: string[]; generateSvg: () => string; generateAst: () => string; }>",
    "params": [],
    "sourceFile": "phetBridge.ts",
    "relPath": "utils/phetBridge.ts"
  },
  {
    "name": "ExtractedPhetProperty",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "phetBridge.ts",
    "relPath": "utils/phetBridge.ts"
  },
  {
    "name": "generateSessionReport",
    "kind": "function",
    "returnType": "Promise<SessionReportSummary>",
    "params": [
      {
        "name": "sessionId",
        "type": "string"
      }
    ],
    "sourceFile": "sessionReporter.ts",
    "relPath": "utils/sessionReporter.ts"
  },
  {
    "name": "downloadReportAsHtml",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "summary",
        "type": "SessionReportSummary"
      }
    ],
    "sourceFile": "sessionReporter.ts",
    "relPath": "utils/sessionReporter.ts"
  },
  {
    "name": "SessionReportSummary",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sessionReporter.ts",
    "relPath": "utils/sessionReporter.ts"
  },
  {
    "name": "stripSExprComments",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "str",
        "type": "string"
      }
    ],
    "sourceFile": "sexprParser.ts",
    "relPath": "utils/sexprParser.ts"
  },
  {
    "name": "parseSExpr",
    "kind": "function",
    "returnType": "SExprAST",
    "params": [
      {
        "name": "input",
        "type": "string"
      }
    ],
    "sourceFile": "sexprParser.ts",
    "relPath": "utils/sexprParser.ts"
  },
  {
    "name": "tokenize",
    "kind": "function",
    "returnType": "string[]",
    "params": [
      {
        "name": "str",
        "type": "string"
      }
    ],
    "sourceFile": "sexprParser.ts",
    "relPath": "utils/sexprParser.ts"
  },
  {
    "name": "parseAstNode",
    "kind": "function",
    "returnType": "ParsedAstNode",
    "params": [
      {
        "name": "input",
        "type": "SExprAST"
      }
    ],
    "sourceFile": "sexprParser.ts",
    "relPath": "utils/sexprParser.ts"
  },
  {
    "name": "parseCartridgeHeader",
    "kind": "function",
    "returnType": "CartridgeHeaderMetadata",
    "params": [
      {
        "name": "astContent",
        "type": "string"
      }
    ],
    "sourceFile": "sexprParser.ts",
    "relPath": "utils/sexprParser.ts"
  },
  {
    "name": "ParsedAstNode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexprParser.ts",
    "relPath": "utils/sexprParser.ts"
  },
  {
    "name": "CartridgeHeaderMetadata",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "sexprParser.ts",
    "relPath": "utils/sexprParser.ts"
  },
  {
    "name": "AstParser",
    "kind": "class",
    "returnType": "typeof AstParser",
    "params": [],
    "sourceFile": "sexprParser.ts",
    "relPath": "utils/sexprParser.ts"
  },
  {
    "name": "transpileSwfToAst",
    "kind": "function",
    "returnType": "Promise<SwfTranspileResult>",
    "params": [
      {
        "name": "fileData",
        "type": "ArrayBuffer | Uint8Array<ArrayBufferLike>"
      },
      {
        "name": "sceneId",
        "type": "string"
      }
    ],
    "sourceFile": "swfAstParser.ts",
    "relPath": "utils/swfAstParser.ts"
  },
  {
    "name": "SwfMetadata",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "swfAstParser.ts",
    "relPath": "utils/swfAstParser.ts"
  },
  {
    "name": "SwfTranspileResult",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "swfAstParser.ts",
    "relPath": "utils/swfAstParser.ts"
  },
  {
    "name": "SwfMorphShape",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "swfAstParser.ts",
    "relPath": "utils/swfAstParser.ts"
  },
  {
    "name": "SwfActionRecord",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "swfAstParser.ts",
    "relPath": "utils/swfAstParser.ts"
  },
  {
    "name": "getBaseUrl",
    "kind": "function",
    "returnType": "string",
    "params": [],
    "sourceFile": "url.ts",
    "relPath": "utils/url.ts"
  },
  {
    "name": "getAssetUrl",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "path",
        "type": "string"
      }
    ],
    "sourceFile": "url.ts",
    "relPath": "utils/url.ts"
  }
] as const;
