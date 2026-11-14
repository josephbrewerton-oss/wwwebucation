// Auto-generated Domain Substrate: SERVICES
export const SERVICES_AST_STRING = ";; Domain AST Manifest: services\n(:domain-substrate :services\n  (:symbol \"initCurriculumDB\" :from \"lib/browser-rag.ts\" :kind :function :return \"Promise<IDBDatabase>\" :params ())\n  (:symbol \"syncCurriculumIndex\" :from \"lib/browser-rag.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"db\" :type \"IDBDatabase\")))\n  (:symbol \"searchCurriculum\" :from \"lib/browser-rag.ts\" :kind :function :return \"Promise<RAGMatch[]>\" :params ((:param \"db\" :type \"IDBDatabase\") (:param \"query\" :type \"string\") (:param \"topK\" :type \"number\")))\n  (:symbol \"getLessonManifest\" :from \"lib/browser-rag.ts\" :kind :function :return \"Promise<any>\" :params ((:param \"db\" :type \"IDBDatabase\") (:param \"id\" :type \"string\") (:param \"manifestPath\" :type \"string\")))\n  (:symbol \"RAGMatch\" :from \"lib/browser-rag.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"FOLDER_MANIFEST\" :from \"lib/engine.ts\" :kind :const :return \"{ readonly folder: \"src/lib\"; readonly timestamp: 1787937755144; readonly totalModules: 1; readonly exports: readonly [{ readonly name: \"RAGMatch\"; readonly isType: true; readonly sourceFile: \"browser-rag\"; }, { ...; }, { ...; }, { ...; }, { ...; }]; }\" :params ())\n  (:symbol \"FolderExportNames\" :from \"lib/engine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"initCurriculumDB\" :from \"lib/engine.ts\" :kind :function :return \"Promise<IDBDatabase>\" :params ())\n  (:symbol \"syncCurriculumIndex\" :from \"lib/engine.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"db\" :type \"IDBDatabase\")))\n  (:symbol \"searchCurriculum\" :from \"lib/engine.ts\" :kind :function :return \"Promise<RAGMatch[]>\" :params ((:param \"db\" :type \"IDBDatabase\") (:param \"query\" :type \"string\") (:param \"topK\" :type \"number\")))\n  (:symbol \"getLessonManifest\" :from \"lib/engine.ts\" :kind :function :return \"Promise<any>\" :params ((:param \"db\" :type \"IDBDatabase\") (:param \"id\" :type \"string\") (:param \"manifestPath\" :type \"string\")))\n  (:symbol \"RAGMatch\" :from \"lib/engine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"getSignLanguage\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"SignLanguageCode\" :params ())\n  (:symbol \"setSignLanguage\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"void\" :params ((:param \"code\" :type \"SignLanguageCode\")))\n  (:symbol \"getLanguageTuple\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"LanguageTuple\" :params ())\n  (:symbol \"setLanguageTuple\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"void\" :params ((:param \"tuple\" :type \"LanguageTuple\")))\n  (:symbol \"subscribeLanguageTuple\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"() => void\" :params ((:param \"callback\" :type \"(tuple: LanguageTuple) => void\")))\n  (:symbol \"subscribeSignLanguage\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"() => void\" :params ((:param \"callback\" :type \"(code: SignLanguageCode) => void\")))\n  (:symbol \"getBslEnabled\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"boolean\" :params ())\n  (:symbol \"setBslEnabled\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"void\" :params ((:param \"enabled\" :type \"boolean\")))\n  (:symbol \"toggleBsl\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"boolean\" :params ())\n  (:symbol \"subscribeBsl\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"() => void\" :params ((:param \"callback\" :type \"(enabled: boolean) => void\")))\n  (:symbol \"getVoiceEnabled\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"boolean\" :params ())\n  (:symbol \"setVoiceEnabled\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"void\" :params ((:param \"enabled\" :type \"boolean\")))\n  (:symbol \"toggleVoice\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"boolean\" :params ())\n  (:symbol \"subscribeVoice\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"() => void\" :params ((:param \"callback\" :type \"(enabled: boolean) => void\")))\n  (:symbol \"broadcastBslSpeech\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"void\" :params ((:param \"payload\" :type \"BslSpeechPayload\")))\n  (:symbol \"subscribeBslSpeech\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"() => void\" :params ((:param \"callback\" :type \"(payload: BslSpeechPayload) => void\")))\n  (:symbol \"openBslSignStudio\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"void\" :params ((:param \"wordToEdit\" :type \"string\")))\n  (:symbol \"closeBslSignStudio\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"void\" :params ())\n  (:symbol \"subscribeBslSignStudio\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"() => void\" :params ((:param \"callback\" :type \"(payload: SignStudioEventPayload) => void\")))\n  (:symbol \"initCodebookIntoLexicon\" :from \"services/bslGlobalStore.ts\" :kind :function :return \"void\" :params ((:param \"_codebook\" :type \"any\")))\n  (:symbol \"SignLanguageCode\" :from \"services/bslGlobalStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SpokenLanguageCode\" :from \"services/bslGlobalStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LanguageTuple\" :from \"services/bslGlobalStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SignLanguageInfo\" :from \"services/bslGlobalStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SUPPORTED_SIGN_LANGUAGES\" :from \"services/bslGlobalStore.ts\" :kind :const :return \"Record<SignLanguageCode, SignLanguageInfo>\" :params ())\n  (:symbol \"BslSpeechPayload\" :from \"services/bslGlobalStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"SignStudioEventPayload\" :from \"services/bslGlobalStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CodebookKeyframe\" :from \"services/bslGlobalStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CodebookSign\" :from \"services/bslGlobalStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"initCartridgeVault\" :from \"services/cartridgeStore.ts\" :kind :function :return \"Promise<void>\" :params ())\n  (:symbol \"inflateCartridgeToVault\" :from \"services/cartridgeStore.ts\" :kind :function :return \"Promise<CartridgeDefinition>\" :params ((:param \"cartridgeId\" :type \"string\")))\n  (:symbol \"getCustomCartridges\" :from \"services/cartridgeStore.ts\" :kind :function :return \"CartridgeDefinition[]\" :params ())\n  (:symbol \"normalizeCartridgeId\" :from \"services/cartridgeStore.ts\" :kind :function :return \"string\" :params ((:param \"id\" :type \"string\")))\n  (:symbol \"getAllCartridges\" :from \"services/cartridgeStore.ts\" :kind :function :return \"CartridgeDefinition[]\" :params ())\n  (:symbol \"getDefaultMountForCartridge\" :from \"services/cartridgeStore.ts\" :kind :function :return \"string\" :params ((:param \"id\" :type \"string\")))\n  (:symbol \"getDefaultSectionForCartridge\" :from \"services/cartridgeStore.ts\" :kind :function :return \"string\" :params ((:param \"id\" :type \"string\") (:param \"category\" :type \"string\")))\n  (:symbol \"getCartridgeByMount\" :from \"services/cartridgeStore.ts\" :kind :function :return \"CartridgeDefinition\" :params ((:param \"mountPath\" :type \"string\")))\n  (:symbol \"getCartridgeNavigationSections\" :from \"services/cartridgeStore.ts\" :kind :function :return \"{ section: string; icon: string; cartridges: CartridgeDefinition[]; }[]\" :params ())\n  (:symbol \"getCartridge\" :from \"services/cartridgeStore.ts\" :kind :function :return \"CartridgeDefinition\" :params ((:param \"idOrAlias\" :type \"string\")))\n  (:symbol \"getDataCartridges\" :from \"services/cartridgeStore.ts\" :kind :function :return \"CartridgeDefinition[]\" :params ())\n  (:symbol \"getDataCartridge\" :from \"services/cartridgeStore.ts\" :kind :function :return \"CartridgeDefinition\" :params ((:param \"idOrAlias\" :type \"string\")))\n  (:symbol \"findDataCartridgeForTopic\" :from \"services/cartridgeStore.ts\" :kind :function :return \"CartridgeDefinition\" :params ((:param \"stage\" :type \"string\") (:param \"subject\" :type \"string\") (:param \"unit\" :type \"string\")))\n  (:symbol \"exportDataCartridgeAsAst\" :from \"services/cartridgeStore.ts\" :kind :function :return \"string\" :params ((:param \"cartridgeId\" :type \"string\")))\n  (:symbol \"saveCustomCartridge\" :from \"services/cartridgeStore.ts\" :kind :function :return \"void\" :params ((:param \"cartridge\" :type \"CartridgeDefinition\")))\n  (:symbol \"deleteCustomCartridge\" :from \"services/cartridgeStore.ts\" :kind :function :return \"void\" :params ((:param \"cartridgeId\" :type \"string\")))\n  (:symbol \"expandCompressedCartridgeToVault\" :from \"services/cartridgeStore.ts\" :kind :function :return \"Promise<CartridgeDefinition>\" :params ((:param \"compressedData\" :type \"string | Uint8Array<ArrayBufferLike>\")))\n  (:symbol \"expandCompressedBundleToVault\" :from \"services/cartridgeStore.ts\" :kind :function :return \"Promise<CartridgeDefinition[]>\" :params ((:param \"compressedPayload\" :type \"string | Uint8Array<ArrayBufferLike>\")))\n  (:symbol \"exportCompressedCartridge\" :from \"services/cartridgeStore.ts\" :kind :function :return \"Promise<{ cartridge: CartridgeDefinition; compressedBytes: Uint8Array<ArrayBufferLike>; base64: string; metadata: CompressedCartridgeMetadata; }>\" :params ((:param \"cartridgeId\" :type \"string\")))\n  (:symbol \"getVaultStats\" :from \"services/cartridgeStore.ts\" :kind :function :return \"Promise<{ isInitialized: boolean; vaultCount: number; memoryCount: number; }>\" :params ())\n  (:symbol \"importCartridgeFile\" :from \"services/cartridgeStore.ts\" :kind :function :return \"Promise<CartridgeDefinition>\" :params ((:param \"file\" :type \"File\")))\n  (:symbol \"createCustomCartridge\" :from \"services/cartridgeStore.ts\" :kind :function :return \"CartridgeDefinition\" :params ((:param \"input\" :type \"{ title: string; category: string; stage: string; desc?: string; icon?: string; type?: \"Sim\" | \"Slide\" | \"App\" | \"Film\" | \"Data\"; dataPayload?: DataCartridgePayload; svgMarkup?: string; astSource?: string; }\")))\n  (:symbol \"DataCartridgeQuestion\" :from \"services/cartridgeStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"DataCartridgePayload\" :from \"services/cartridgeStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CartridgeDefinition\" :from \"services/cartridgeStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CartridgeBundle\" :from \"services/cartridgeStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CARTRIDGE_ALIASES\" :from \"services/cartridgeStore.ts\" :kind :const :return \"Record<string, string>\" :params ())\n  (:symbol \"BUILTIN_CARTRIDGES\" :from \"services/cartridgeStore.ts\" :kind :const :return \"CartridgeDefinition[]\" :params ())\n  (:symbol \"EMBEDDED_CORE_CARTRIDGES\" :from \"services/cartridgeStore.ts\" :kind :const :return \"Record<string, EmbeddedCartridgeData>\" :params ())\n  (:symbol \"resolveChallengeForTopic\" :from \"services/challengeLauncher.ts\" :kind :function :return \"ChallengeMetadata\" :params ((:param \"subject\" :type \"string\") (:param \"unit\" :type \"string\") (:param \"topic\" :type \"string\") (:param \"keyStage\" :type \"string\")))\n  (:symbol \"openChallengeModal\" :from \"services/challengeLauncher.ts\" :kind :function :return \"void\" :params ((:param \"options\" :type \"ChallengeCallOptions\")))\n  (:symbol \"closeChallengeModal\" :from \"services/challengeLauncher.ts\" :kind :function :return \"void\" :params ())\n  (:symbol \"subscribeToChallengeCalls\" :from \"services/challengeLauncher.ts\" :kind :function :return \"() => void\" :params ((:param \"listener\" :type \"ChallengeListener\")))\n  (:symbol \"ChallengeType\" :from \"services/challengeLauncher.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ChallengeMetadata\" :from \"services/challengeLauncher.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"ChallengeCallOptions\" :from \"services/challengeLauncher.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"validateStudentInput\" :from \"services/childSafetyFilter.ts\" :kind :function :return \"SafetyCheckResult\" :params ((:param \"input\" :type \"string\")))\n  (:symbol \"sanitizeAiOutput\" :from \"services/childSafetyFilter.ts\" :kind :function :return \"string\" :params ((:param \"output\" :type \"string\") (:param \"fallbackContext\" :type \"string\")))\n  (:symbol \"SafetyCheckResult\" :from \"services/childSafetyFilter.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CHILD_SAFEGUARDING_SYSTEM_PROMPT\" :from \"services/childSafetyFilter.ts\" :kind :const :return \"\"\\nCRITICAL CHILD SAFEGUARDING & SAFETY MANDATE:\\n1. You are speaking directly to primary or secondary school children (ages 5 to 16).\\n2. You MUST always maintain a warm, gentle, encouraging, and 100% wholesome tone.\\n3. NEVER produce or discuss: violence, weapons, adult content, profanity, drugs, romantic relation...\" :params ())\n  (:symbol \"StudentBeaconTelemetry\" :from \"services/classroomBeacon.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"TeacherBroadcastCommand\" :from \"services/classroomBeacon.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"classroomBeacon\" :from \"services/classroomBeacon.ts\" :kind :const :return \"ClassroomBeaconManager\" :params ())\n  (:symbol \"default\" :from \"services/classroomBeacon.ts\" :kind :const :return \"ClassroomBeaconManager\" :params ())\n  (:symbol \"initCurriculumPackStore\" :from \"services/curriculumPackStore.ts\" :kind :function :return \"Promise<void>\" :params ())\n  (:symbol \"getInstalledCurriculumPacks\" :from \"services/curriculumPackStore.ts\" :kind :function :return \"CustomCurriculumPack[]\" :params ())\n  (:symbol \"saveCurriculumPack\" :from \"services/curriculumPackStore.ts\" :kind :function :return \"void\" :params ((:param \"pack\" :type \"CustomCurriculumPack\")))\n  (:symbol \"removeCurriculumPack\" :from \"services/curriculumPackStore.ts\" :kind :function :return \"void\" :params ((:param \"packId\" :type \"string\")))\n  (:symbol \"findCustomTopicKnowledge\" :from \"services/curriculumPackStore.ts\" :kind :function :return \"CurriculumTopicKnowledge\" :params ((:param \"stage\" :type \"string\") (:param \"subject\" :type \"string\") (:param \"topic\" :type \"string\")))\n  (:symbol \"saveAxiomAnchorTopic\" :from \"services/curriculumPackStore.ts\" :kind :function :return \"CustomCurriculumPack\" :params ((:param \"data\" :type \"{ keyStage: string; subject: string; topic: string; axiom: string; trap: string; hook?: string; guidedStep?: string; socraticPivot?: string; questions?: CustomQuestionItem[]; }\")))\n  (:symbol \"deleteAxiomAnchorTopic\" :from \"services/curriculumPackStore.ts\" :kind :function :return \"void\" :params ((:param \"lessonId\" :type \"string\")))\n  (:symbol \"getCustomStandardStages\" :from \"services/curriculumPackStore.ts\" :kind :function :return \"Record<string, StandardStage>\" :params ())\n  (:symbol \"generateSampleCsvTemplate\" :from \"services/curriculumPackStore.ts\" :kind :function :return \"string\" :params ())\n  (:symbol \"generateSampleJsonTemplate\" :from \"services/curriculumPackStore.ts\" :kind :function :return \"string\" :params ())\n  (:symbol \"parseCsvToCurriculumPack\" :from \"services/curriculumPackStore.ts\" :kind :function :return \"CustomCurriculumPack\" :params ((:param \"csvContent\" :type \"string\") (:param \"metadata\" :type \"{ packId?: string; packTitle?: string; countryOrRegion?: string; authorOrMinistry?: string; description?: string; }\")))\n  (:symbol \"CustomQuestionDistractor\" :from \"services/curriculumPackStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CustomQuestionItem\" :from \"services/curriculumPackStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CustomCurriculumLesson\" :from \"services/curriculumPackStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CustomCurriculumPack\" :from \"services/curriculumPackStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"PRESET_OVERSEAS_PACKS\" :from \"services/curriculumPackStore.ts\" :kind :const :return \"CustomCurriculumPack[]\" :params ())\n  (:symbol \"loadCustomBslSigns\" :from \"services/customSignStore.ts\" :kind :function :return \"Promise<Record<string, BslSign>>\" :params ())\n  (:symbol \"saveCustomBslSign\" :from \"services/customSignStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"sign\" :type \"BslSign\")))\n  (:symbol \"deleteCustomBslSign\" :from \"services/customSignStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"word\" :type \"string\")))\n  (:symbol \"getCustomBslSign\" :from \"services/customSignStore.ts\" :kind :function :return \"Promise<BslSign>\" :params ((:param \"word\" :type \"string\")))\n  (:symbol \"initCustomSignsIntoLexicon\" :from \"services/customSignStore.ts\" :kind :function :return \"Promise<number>\" :params ())\n  (:symbol \"exportCustomSignsAst\" :from \"services/customSignStore.ts\" :kind :function :return \"Promise<string>\" :params ())\n  (:symbol \"importCustomSignsFromAst\" :from \"services/customSignStore.ts\" :kind :function :return \"Promise<number>\" :params ((:param \"astText\" :type \"string\")))\n  (:symbol \"subscribeCustomSigns\" :from \"services/customSignStore.ts\" :kind :function :return \"() => void\" :params ((:param \"callback\" :type \"() => void\")))\n  (:symbol \"isDataSaverActive\" :from \"services/dataSaverStore.ts\" :kind :function :return \"boolean\" :params ())\n  (:symbol \"setDataSaverMode\" :from \"services/dataSaverStore.ts\" :kind :function :return \"void\" :params ((:param \"enabled\" :type \"boolean\")))\n  (:symbol \"applyDataSaverToDOM\" :from \"services/dataSaverStore.ts\" :kind :function :return \"void\" :params ((:param \"enabled\" :type \"boolean\")))\n  (:symbol \"listenToDataSaverChanges\" :from \"services/dataSaverStore.ts\" :kind :function :return \"() => void\" :params ((:param \"callback\" :type \"(enabled: boolean) => void\")))\n  (:symbol \"isConstrainedEnvironment\" :from \"services/dataSaverStore.ts\" :kind :function :return \"boolean\" :params ())\n  (:symbol \"isCoreSyllabusPinned\" :from \"services/dbStore.ts\" :kind :function :return \"boolean\" :params ((:param \"keyOrDomain\" :type \"string\")))\n  (:symbol \"openLocalDB\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<IDBDatabase>\" :params ())\n  (:symbol \"getAllAppStateRecords\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<AppStateRecord[]>\" :params ())\n  (:symbol \"putAppStateRecord\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"key\" :type \"string\") (:param \"value\" :type \"string\")))\n  (:symbol \"deleteAppStateRecord\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"key\" :type \"string\")))\n  (:symbol \"getAllCurriculumPackRecords\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<T[]>\" :params ())\n  (:symbol \"putCurriculumPackRecord\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"pack\" :type \"T\")))\n  (:symbol \"deleteCurriculumPackRecord\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"packId\" :type \"string\")))\n  (:symbol \"getBufferedLesson\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<CachedLessonRecord>\" :params ((:param \"key\" :type \"string\")))\n  (:symbol \"putBufferedLesson\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"lesson\" :type \"CachedLessonRecord\")))\n  (:symbol \"saveManifest\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"manifest\" :type \"DomainManifest\")))\n  (:symbol \"getManifest\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<DomainManifest>\" :params ((:param \"domainId\" :type \"string\")))\n  (:symbol \"logProgress\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"record\" :type \"StudentRecord\")))\n  (:symbol \"getAllProgressRecords\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<StudentRecord[]>\" :params ())\n  (:symbol \"clearAllStudentProgress\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ())\n  (:symbol \"getTuringDiagnosticSummary\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<{ accuracy: number; commonErrors: string[]; }>\" :params ((:param \"topicId\" :type \"string\")))\n  (:symbol \"saveTopicAdapter\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"adapter\" :type \"TopicAdapterRecord\")))\n  (:symbol \"getTopicAdapter\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<TopicAdapterRecord>\" :params ((:param \"topicKey\" :type \"string\")))\n  (:symbol \"bootstrapTopicAdapters\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ())\n  (:symbol \"saveVerifiedAST\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"topicKey\" :type \"string\") (:param \"rawAST\" :type \"string\")))\n  (:symbol \"getBufferedQuestion\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<string>\" :params ((:param \"topicKey\" :type \"string\") (:param \"excludePrompt\" :type \"string\")))\n  (:symbol \"checkAndReplenishBuffer\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"topicKey\" :type \"string\") (:param \"minThreshold\" :type \"number\") (:param \"triggerWorker\" :type \"(key: string) => Promise<void>\")))\n  (:symbol \"getRandomCachedAST\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<string>\" :params ((:param \"topicKey\" :type \"string\")))\n  (:symbol \"saveVfsView\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"path\" :type \"string\") (:param \"content\" :type \"string\")))\n  (:symbol \"getVfsView\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<string>\" :params ((:param \"path\" :type \"string\")))\n  (:symbol \"bootstrapVfsViews\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"defaultViews\" :type \"Record<string, string>\")))\n  (:symbol \"enforceStorageQuotaLRU\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<StorageQuotaLRUMetrics>\" :params ())\n  (:symbol \"getStorageQuotaMetrics\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<StorageQuotaLRUMetrics>\" :params ())\n  (:symbol \"purgeInactiveManifests\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"activeDomainId\" :type \"string\") (:param \"preservedDomains\" :type \"string[]\")))\n  (:symbol \"putVaultCartridge\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"cartridge\" :type \"VaultCartridgeRecord\")))\n  (:symbol \"getVaultCartridge\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<VaultCartridgeRecord>\" :params ((:param \"id\" :type \"string\")))\n  (:symbol \"getAllVaultCartridges\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<VaultCartridgeRecord[]>\" :params ())\n  (:symbol \"deleteVaultCartridge\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"id\" :type \"string\")))\n  (:symbol \"countVaultCartridges\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<number>\" :params ())\n  (:symbol \"hasVaultCartridge\" :from \"services/dbStore.ts\" :kind :function :return \"Promise<boolean>\" :params ((:param \"id\" :type \"string\")))\n  (:symbol \"STORE_VIEWS\" :from \"services/dbStore.ts\" :kind :const :return \"\"vfs_views\"\" :params ())\n  (:symbol \"STORE_CARTRIDGES_VAULT\" :from \"services/dbStore.ts\" :kind :const :return \"\"cartridges_vault\"\" :params ())\n  (:symbol \"STORE_APP_STATE\" :from \"services/dbStore.ts\" :kind :const :return \"\"app_state\"\" :params ())\n  (:symbol \"STORE_CURRICULUM_PACKS\" :from \"services/dbStore.ts\" :kind :const :return \"\"curriculum_packs\"\" :params ())\n  (:symbol \"AppStateRecord\" :from \"services/dbStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"StudentRecord\" :from \"services/dbStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"VfsViewRecord\" :from \"services/dbStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"TopicAdapterRecord\" :from \"services/dbStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CachedASTRecord\" :from \"services/dbStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"CachedLessonRecord\" :from \"services/dbStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"PINNED_CORE_MANIFESTS\" :from \"services/dbStore.ts\" :kind :const :return \"Set<string>\" :params ())\n  (:symbol \"getDB\" :from \"services/dbStore.ts\" :kind :const :return \"Promise<IDBDatabase>\" :params ())\n  (:symbol \"DEFAULT_TOPIC_ADAPTERS\" :from \"services/dbStore.ts\" :kind :const :return \"TopicAdapterRecord[]\" :params ())\n  (:symbol \"StorageQuotaLRUMetrics\" :from \"services/dbStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"MAX_UNPINNED_LESSON_TRACES\" :from \"services/dbStore.ts\" :kind :const :return \"35\" :params ())\n  (:symbol \"TARGET_UNPINNED_LESSON_TRACES\" :from \"services/dbStore.ts\" :kind :const :return \"25\" :params ())\n  (:symbol \"MAX_UNPINNED_AST_ITEMS\" :from \"services/dbStore.ts\" :kind :const :return \"60\" :params ())\n  (:symbol \"TARGET_UNPINNED_AST_ITEMS\" :from \"services/dbStore.ts\" :kind :const :return \"40\" :params ())\n  (:symbol \"VaultCartridgeRecord\" :from \"services/dbStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"openJotterDB\" :from \"services/jotter-db.ts\" :kind :function :return \"Promise<IDBDatabase>\" :params ())\n  (:symbol \"appendJotter\" :from \"services/jotter-db.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"entry\" :type \"Omit<JotterEntry, \"timestamp\">\")))\n  (:symbol \"getRecentJotterEntries\" :from \"services/jotter-db.ts\" :kind :function :return \"Promise<JotterEntry[]>\" :params ((:param \"sessionId\" :type \"string\") (:param \"limit\" :type \"number\")))\n  (:symbol \"appendLabCsvToJotter\" :from \"services/jotter-db.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"presetId\" :type \"string\") (:param \"csv\" :type \"string\") (:param \"nodePath\" :type \"string\")))\n  (:symbol \"getLabCsvEntries\" :from \"services/jotter-db.ts\" :kind :function :return \"Promise<JotterEntry[]>\" :params ((:param \"presetId\" :type \"string\") (:param \"limit\" :type \"number\")))\n  (:symbol \"clearJotterDB\" :from \"services/jotter-db.ts\" :kind :function :return \"Promise<void>\" :params ())\n  (:symbol \"JotterEntry\" :from \"services/jotter-db.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"initLocalStateStore\" :from \"services/localStateStore.ts\" :kind :function :return \"Promise<void>\" :params ())\n  (:symbol \"isLocalStateHydrated\" :from \"services/localStateStore.ts\" :kind :function :return \"boolean\" :params ())\n  (:symbol \"getLocalState\" :from \"services/localStateStore.ts\" :kind :function :return \"string\" :params ((:param \"key\" :type \"string\")))\n  (:symbol \"setLocalState\" :from \"services/localStateStore.ts\" :kind :function :return \"void\" :params ((:param \"key\" :type \"string\") (:param \"value\" :type \"string\")))\n  (:symbol \"removeLocalState\" :from \"services/localStateStore.ts\" :kind :function :return \"void\" :params ((:param \"key\" :type \"string\")))\n  (:symbol \"getLocalJson\" :from \"services/localStateStore.ts\" :kind :function :return \"T\" :params ((:param \"key\" :type \"string\")))\n  (:symbol \"setLocalJson\" :from \"services/localStateStore.ts\" :kind :function :return \"void\" :params ((:param \"key\" :type \"string\") (:param \"value\" :type \"T\")))\n  (:symbol \"subscribeLocalState\" :from \"services/localStateStore.ts\" :kind :function :return \"() => void\" :params ((:param \"callback\" :type \"(detail: LocalStateChangeDetail) => void\") (:param \"filterKey\" :type \"string\")))\n  (:symbol \"flushLocalStateWrites\" :from \"services/localStateStore.ts\" :kind :function :return \"Promise<void>\" :params ())\n  (:symbol \"LOCAL_STATE_EVENT\" :from \"services/localStateStore.ts\" :kind :const :return \"\"stj_local_state_changed\"\" :params ())\n  (:symbol \"LocalStateChangeDetail\" :from \"services/localStateStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"sendMflChatMessage\" :from \"services/mflConversationEngine.ts\" :kind :function :return \"Promise<{ targetText: string; translation: string; coachingTip?: string; isAiGenerated: boolean; }>\" :params ((:param \"userInput\" :type \"string\") (:param \"lang\" :type \"string\") (:param \"previousHistory\" :type \"MflChatMessage[]\")))\n  (:symbol \"MflPartnerPersona\" :from \"services/mflConversationEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"MflChatMessage\" :from \"services/mflConversationEngine.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"MFL_PERSONAS\" :from \"services/mflConversationEngine.ts\" :kind :const :return \"Record<string, MflPartnerPersona>\" :params ())\n  (:symbol \"getActiveManifestCacheName\" :from \"services/offlineSync.ts\" :kind :function :return \"Promise<string>\" :params ())\n  (:symbol \"isOfflineSyncComplete\" :from \"services/offlineSync.ts\" :kind :function :return \"boolean\" :params ())\n  (:symbol \"getOfflineSyncDate\" :from \"services/offlineSync.ts\" :kind :function :return \"string\" :params ())\n  (:symbol \"checkDeviceStorageSupport\" :from \"services/offlineSync.ts\" :kind :function :return \"Promise<{ supported: boolean; persisted: boolean; quotaMb?: number; usageMb?: number; }>\" :params ())\n  (:symbol \"syncEntireCurriculumOffline\" :from \"services/offlineSync.ts\" :kind :function :return \"Promise<boolean>\" :params ((:param \"onProgress\" :type \"(progress: SyncProgress) => void\")))\n  (:symbol \"CORE_OFFLINE_URLS\" :from \"services/offlineSync.ts\" :kind :const :return \"string[]\" :params ())\n  (:symbol \"SyncProgress\" :from \"services/offlineSync.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"getOfflineStatus\" :from \"services/offlineSyncService.ts\" :kind :function :return \"Promise<OfflineStatus>\" :params ())\n  (:symbol \"downloadCurriculumForOffline\" :from \"services/offlineSyncService.ts\" :kind :function :return \"Promise<{ success: boolean; count: number; error?: string; }>\" :params ((:param \"onProgress\" :type \"(progress: SyncProgress) => void\")))\n  (:symbol \"SyncProgress\" :from \"services/offlineSyncService.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"OfflineStatus\" :from \"services/offlineSyncService.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"resolvePresetForTopic\" :from \"services/playerLauncher.ts\" :kind :function :return \"VectorPresetId\" :params ((:param \"subject\" :type \"string\") (:param \"unit\" :type \"string\") (:param \"topic\" :type \"string\")))\n  (:symbol \"openPlayerModal\" :from \"services/playerLauncher.ts\" :kind :function :return \"void\" :params ((:param \"options\" :type \"PlayerCallOptions\")))\n  (:symbol \"closePlayerModal\" :from \"services/playerLauncher.ts\" :kind :function :return \"void\" :params ())\n  (:symbol \"subscribeToPlayerCalls\" :from \"services/playerLauncher.ts\" :kind :function :return \"() => void\" :params ((:param \"listener\" :type \"PlayerListener\")))\n  (:symbol \"VectorPresetId\" :from \"services/playerLauncher.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"PlayerCheckpointOption\" :from \"services/playerLauncher.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"PlayerCallOptions\" :from \"services/playerLauncher.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"isStrictAirGapMode\" :from \"services/privacyGuard.ts\" :kind :function :return \"boolean\" :params ())\n  (:symbol \"setStrictAirGapMode\" :from \"services/privacyGuard.ts\" :kind :function :return \"void\" :params ((:param \"enabled\" :type \"boolean\")))\n  (:symbol \"listenToAirGapChanges\" :from \"services/privacyGuard.ts\" :kind :function :return \"() => void\" :params ((:param \"callback\" :type \"(enabled: boolean) => void\")))\n  (:symbol \"isSoundEnabled\" :from \"services/soundHaptics.ts\" :kind :function :return \"boolean\" :params ())\n  (:symbol \"setSoundEnabled\" :from \"services/soundHaptics.ts\" :kind :function :return \"void\" :params ((:param \"enabled\" :type \"boolean\")))\n  (:symbol \"isHapticsEnabled\" :from \"services/soundHaptics.ts\" :kind :function :return \"boolean\" :params ())\n  (:symbol \"setHapticsEnabled\" :from \"services/soundHaptics.ts\" :kind :function :return \"void\" :params ((:param \"enabled\" :type \"boolean\")))\n  (:symbol \"playSuccessChime\" :from \"services/soundHaptics.ts\" :kind :function :return \"void\" :params ())\n  (:symbol \"playIncorrectTone\" :from \"services/soundHaptics.ts\" :kind :function :return \"void\" :params ())\n  (:symbol \"playClickTone\" :from \"services/soundHaptics.ts\" :kind :function :return \"void\" :params ())\n  (:symbol \"playCelebrationFanfare\" :from \"services/soundHaptics.ts\" :kind :function :return \"void\" :params ())\n  (:symbol \"triggerHapticSuccess\" :from \"services/soundHaptics.ts\" :kind :function :return \"void\" :params ())\n  (:symbol \"triggerHapticError\" :from \"services/soundHaptics.ts\" :kind :function :return \"void\" :params ())\n  (:symbol \"triggerHapticClick\" :from \"services/soundHaptics.ts\" :kind :function :return \"void\" :params ())\n  (:symbol \"playLumenChristiChant\" :from \"services/soundHaptics.ts\" :kind :function :return \"void\" :params ((:param \"elevation\" :type \"2 | 1 | 3\")))\n  (:symbol \"playEasterBells\" :from \"services/soundHaptics.ts\" :kind :function :return \"void\" :params ())\n  (:symbol \"playCrotalusClapper\" :from \"services/soundHaptics.ts\" :kind :function :return \"void\" :params ())\n  (:symbol \"generateRandomAlias\" :from \"services/studentProfileStore.ts\" :kind :function :return \"{ alias: string; avatar: string; }\" :params ())\n  (:symbol \"getLearnerProfile\" :from \"services/studentProfileStore.ts\" :kind :function :return \"LearnerProfile\" :params ())\n  (:symbol \"saveLearnerProfile\" :from \"services/studentProfileStore.ts\" :kind :function :return \"LearnerProfile\" :params ((:param \"updates\" :type \"Partial<LearnerProfile>\")))\n  (:symbol \"formatTopicTitle\" :from \"services/studentProfileStore.ts\" :kind :function :return \"string\" :params ((:param \"rawTopicId\" :type \"string\")))\n  (:symbol \"inferMisSubjectDomain\" :from \"services/studentProfileStore.ts\" :kind :function :return \"string\" :params ((:param \"rawTopicId\" :type \"string\")))\n  (:symbol \"computeAttainmentBand\" :from \"services/studentProfileStore.ts\" :kind :function :return \"string\" :params ((:param \"accuracyPercent\" :type \"number\")))\n  (:symbol \"recordAssessmentAttempt\" :from \"services/studentProfileStore.ts\" :kind :function :return \"Promise<void>\" :params ((:param \"input\" :type \"RecordAttemptInput\")))\n  (:symbol \"getLearnerAnalytics\" :from \"services/studentProfileStore.ts\" :kind :function :return \"Promise<LearnerAnalytics>\" :params ())\n  (:symbol \"purgeAllLearnerData\" :from \"services/studentProfileStore.ts\" :kind :function :return \"Promise<void>\" :params ())\n  (:symbol \"exportLearnerPassportJson\" :from \"services/studentProfileStore.ts\" :kind :function :return \"Promise<void>\" :params ())\n  (:symbol \"exportLearnerArborCsv\" :from \"services/studentProfileStore.ts\" :kind :function :return \"Promise<void>\" :params ())\n  (:symbol \"downloadLearnerCertificateHtml\" :from \"services/studentProfileStore.ts\" :kind :function :return \"Promise<void>\" :params ())\n  (:symbol \"LearnerProfile\" :from \"services/studentProfileStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"TopicMasteryStat\" :from \"services/studentProfileStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"LearnerAnalytics\" :from \"services/studentProfileStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"RecordAttemptInput\" :from \"services/studentProfileStore.ts\" :kind :const :return \"any\" :params ())\n  (:symbol \"isWebMcpSupported\" :from \"services/webMcpBridge.ts\" :kind :function :return \"boolean\" :params ())\n  (:symbol \"getRegisteredWebMcpTools\" :from \"services/webMcpBridge.ts\" :kind :function :return \"readonly string[]\" :params ())\n  (:symbol \"setWebMcpNavigator\" :from \"services/webMcpBridge.ts\" :kind :function :return \"void\" :params ((:param \"navigator\" :type \"NavigateFunction\")))\n  (:symbol \"registerWebMcpTools\" :from \"services/webMcpBridge.ts\" :kind :function :return \"Promise<boolean>\" :params ((:param \"navigator\" :type \"NavigateFunction\")))\n  (:symbol \"unregisterWebMcpTools\" :from \"services/webMcpBridge.ts\" :kind :function :return \"void\" :params ())\n  (:symbol \"initWebMcpBridge\" :from \"services/webMcpBridge.ts\" :kind :function :return \"() => void\" :params ((:param \"navigator\" :type \"NavigateFunction\")))\n  (:symbol \"NavigateFunction\" :from \"services/webMcpBridge.ts\" :kind :const :return \"any\" :params ())\n)\n";
export const SERVICES_EXPORT_CATALOG = [
  {
    "name": "initCurriculumDB",
    "kind": "function",
    "returnType": "Promise<IDBDatabase>",
    "params": [],
    "sourceFile": "browser-rag.ts",
    "relPath": "lib/browser-rag.ts"
  },
  {
    "name": "syncCurriculumIndex",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "db",
        "type": "IDBDatabase"
      }
    ],
    "sourceFile": "browser-rag.ts",
    "relPath": "lib/browser-rag.ts"
  },
  {
    "name": "searchCurriculum",
    "kind": "function",
    "returnType": "Promise<RAGMatch[]>",
    "params": [
      {
        "name": "db",
        "type": "IDBDatabase"
      },
      {
        "name": "query",
        "type": "string"
      },
      {
        "name": "topK",
        "type": "number"
      }
    ],
    "sourceFile": "browser-rag.ts",
    "relPath": "lib/browser-rag.ts"
  },
  {
    "name": "getLessonManifest",
    "kind": "function",
    "returnType": "Promise<any>",
    "params": [
      {
        "name": "db",
        "type": "IDBDatabase"
      },
      {
        "name": "id",
        "type": "string"
      },
      {
        "name": "manifestPath",
        "type": "string"
      }
    ],
    "sourceFile": "browser-rag.ts",
    "relPath": "lib/browser-rag.ts"
  },
  {
    "name": "RAGMatch",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "browser-rag.ts",
    "relPath": "lib/browser-rag.ts"
  },
  {
    "name": "FOLDER_MANIFEST",
    "kind": "const",
    "returnType": "{ readonly folder: \"src/lib\"; readonly timestamp: 1787937755144; readonly totalModules: 1; readonly exports: readonly [{ readonly name: \"RAGMatch\"; readonly isType: true; readonly sourceFile: \"browser-rag\"; }, { ...; }, { ...; }, { ...; }, { ...; }]; }",
    "params": [],
    "sourceFile": "engine.ts",
    "relPath": "lib/engine.ts"
  },
  {
    "name": "FolderExportNames",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "engine.ts",
    "relPath": "lib/engine.ts"
  },
  {
    "name": "initCurriculumDB",
    "kind": "function",
    "returnType": "Promise<IDBDatabase>",
    "params": [],
    "sourceFile": "engine.ts",
    "relPath": "lib/engine.ts"
  },
  {
    "name": "syncCurriculumIndex",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "db",
        "type": "IDBDatabase"
      }
    ],
    "sourceFile": "engine.ts",
    "relPath": "lib/engine.ts"
  },
  {
    "name": "searchCurriculum",
    "kind": "function",
    "returnType": "Promise<RAGMatch[]>",
    "params": [
      {
        "name": "db",
        "type": "IDBDatabase"
      },
      {
        "name": "query",
        "type": "string"
      },
      {
        "name": "topK",
        "type": "number"
      }
    ],
    "sourceFile": "engine.ts",
    "relPath": "lib/engine.ts"
  },
  {
    "name": "getLessonManifest",
    "kind": "function",
    "returnType": "Promise<any>",
    "params": [
      {
        "name": "db",
        "type": "IDBDatabase"
      },
      {
        "name": "id",
        "type": "string"
      },
      {
        "name": "manifestPath",
        "type": "string"
      }
    ],
    "sourceFile": "engine.ts",
    "relPath": "lib/engine.ts"
  },
  {
    "name": "RAGMatch",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "engine.ts",
    "relPath": "lib/engine.ts"
  },
  {
    "name": "getSignLanguage",
    "kind": "function",
    "returnType": "SignLanguageCode",
    "params": [],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "setSignLanguage",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "code",
        "type": "SignLanguageCode"
      }
    ],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "getLanguageTuple",
    "kind": "function",
    "returnType": "LanguageTuple",
    "params": [],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "setLanguageTuple",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "tuple",
        "type": "LanguageTuple"
      }
    ],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "subscribeLanguageTuple",
    "kind": "function",
    "returnType": "() => void",
    "params": [
      {
        "name": "callback",
        "type": "(tuple: LanguageTuple) => void"
      }
    ],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "subscribeSignLanguage",
    "kind": "function",
    "returnType": "() => void",
    "params": [
      {
        "name": "callback",
        "type": "(code: SignLanguageCode) => void"
      }
    ],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "getBslEnabled",
    "kind": "function",
    "returnType": "boolean",
    "params": [],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "setBslEnabled",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "enabled",
        "type": "boolean"
      }
    ],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "toggleBsl",
    "kind": "function",
    "returnType": "boolean",
    "params": [],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "subscribeBsl",
    "kind": "function",
    "returnType": "() => void",
    "params": [
      {
        "name": "callback",
        "type": "(enabled: boolean) => void"
      }
    ],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "getVoiceEnabled",
    "kind": "function",
    "returnType": "boolean",
    "params": [],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "setVoiceEnabled",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "enabled",
        "type": "boolean"
      }
    ],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "toggleVoice",
    "kind": "function",
    "returnType": "boolean",
    "params": [],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "subscribeVoice",
    "kind": "function",
    "returnType": "() => void",
    "params": [
      {
        "name": "callback",
        "type": "(enabled: boolean) => void"
      }
    ],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "broadcastBslSpeech",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "payload",
        "type": "BslSpeechPayload"
      }
    ],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "subscribeBslSpeech",
    "kind": "function",
    "returnType": "() => void",
    "params": [
      {
        "name": "callback",
        "type": "(payload: BslSpeechPayload) => void"
      }
    ],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "openBslSignStudio",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "wordToEdit",
        "type": "string"
      }
    ],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "closeBslSignStudio",
    "kind": "function",
    "returnType": "void",
    "params": [],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "subscribeBslSignStudio",
    "kind": "function",
    "returnType": "() => void",
    "params": [
      {
        "name": "callback",
        "type": "(payload: SignStudioEventPayload) => void"
      }
    ],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "initCodebookIntoLexicon",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "_codebook",
        "type": "any"
      }
    ],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "SignLanguageCode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "SpokenLanguageCode",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "LanguageTuple",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "SignLanguageInfo",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "SUPPORTED_SIGN_LANGUAGES",
    "kind": "const",
    "returnType": "Record<SignLanguageCode, SignLanguageInfo>",
    "params": [],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "BslSpeechPayload",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "SignStudioEventPayload",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "CodebookKeyframe",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "CodebookSign",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "bslGlobalStore.ts",
    "relPath": "services/bslGlobalStore.ts"
  },
  {
    "name": "initCartridgeVault",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "inflateCartridgeToVault",
    "kind": "function",
    "returnType": "Promise<CartridgeDefinition>",
    "params": [
      {
        "name": "cartridgeId",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "getCustomCartridges",
    "kind": "function",
    "returnType": "CartridgeDefinition[]",
    "params": [],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "normalizeCartridgeId",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "id",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "getAllCartridges",
    "kind": "function",
    "returnType": "CartridgeDefinition[]",
    "params": [],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "getDefaultMountForCartridge",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "id",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "getDefaultSectionForCartridge",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "id",
        "type": "string"
      },
      {
        "name": "category",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "getCartridgeByMount",
    "kind": "function",
    "returnType": "CartridgeDefinition",
    "params": [
      {
        "name": "mountPath",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "getCartridgeNavigationSections",
    "kind": "function",
    "returnType": "{ section: string; icon: string; cartridges: CartridgeDefinition[]; }[]",
    "params": [],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "getCartridge",
    "kind": "function",
    "returnType": "CartridgeDefinition",
    "params": [
      {
        "name": "idOrAlias",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "getDataCartridges",
    "kind": "function",
    "returnType": "CartridgeDefinition[]",
    "params": [],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "getDataCartridge",
    "kind": "function",
    "returnType": "CartridgeDefinition",
    "params": [
      {
        "name": "idOrAlias",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "findDataCartridgeForTopic",
    "kind": "function",
    "returnType": "CartridgeDefinition",
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
        "name": "unit",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "exportDataCartridgeAsAst",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "cartridgeId",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "saveCustomCartridge",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "cartridge",
        "type": "CartridgeDefinition"
      }
    ],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "deleteCustomCartridge",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "cartridgeId",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "expandCompressedCartridgeToVault",
    "kind": "function",
    "returnType": "Promise<CartridgeDefinition>",
    "params": [
      {
        "name": "compressedData",
        "type": "string | Uint8Array<ArrayBufferLike>"
      }
    ],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "expandCompressedBundleToVault",
    "kind": "function",
    "returnType": "Promise<CartridgeDefinition[]>",
    "params": [
      {
        "name": "compressedPayload",
        "type": "string | Uint8Array<ArrayBufferLike>"
      }
    ],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "exportCompressedCartridge",
    "kind": "function",
    "returnType": "Promise<{ cartridge: CartridgeDefinition; compressedBytes: Uint8Array<ArrayBufferLike>; base64: string; metadata: CompressedCartridgeMetadata; }>",
    "params": [
      {
        "name": "cartridgeId",
        "type": "string"
      }
    ],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "getVaultStats",
    "kind": "function",
    "returnType": "Promise<{ isInitialized: boolean; vaultCount: number; memoryCount: number; }>",
    "params": [],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "importCartridgeFile",
    "kind": "function",
    "returnType": "Promise<CartridgeDefinition>",
    "params": [
      {
        "name": "file",
        "type": "File"
      }
    ],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "createCustomCartridge",
    "kind": "function",
    "returnType": "CartridgeDefinition",
    "params": [
      {
        "name": "input",
        "type": "{ title: string; category: string; stage: string; desc?: string; icon?: string; type?: \"Sim\" | \"Slide\" | \"App\" | \"Film\" | \"Data\"; dataPayload?: DataCartridgePayload; svgMarkup?: string; astSource?: string; }"
      }
    ],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "DataCartridgeQuestion",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "DataCartridgePayload",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "CartridgeDefinition",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "CartridgeBundle",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "CARTRIDGE_ALIASES",
    "kind": "const",
    "returnType": "Record<string, string>",
    "params": [],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "BUILTIN_CARTRIDGES",
    "kind": "const",
    "returnType": "CartridgeDefinition[]",
    "params": [],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "EMBEDDED_CORE_CARTRIDGES",
    "kind": "const",
    "returnType": "Record<string, EmbeddedCartridgeData>",
    "params": [],
    "sourceFile": "cartridgeStore.ts",
    "relPath": "services/cartridgeStore.ts"
  },
  {
    "name": "resolveChallengeForTopic",
    "kind": "function",
    "returnType": "ChallengeMetadata",
    "params": [
      {
        "name": "subject",
        "type": "string"
      },
      {
        "name": "unit",
        "type": "string"
      },
      {
        "name": "topic",
        "type": "string"
      },
      {
        "name": "keyStage",
        "type": "string"
      }
    ],
    "sourceFile": "challengeLauncher.ts",
    "relPath": "services/challengeLauncher.ts"
  },
  {
    "name": "openChallengeModal",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "options",
        "type": "ChallengeCallOptions"
      }
    ],
    "sourceFile": "challengeLauncher.ts",
    "relPath": "services/challengeLauncher.ts"
  },
  {
    "name": "closeChallengeModal",
    "kind": "function",
    "returnType": "void",
    "params": [],
    "sourceFile": "challengeLauncher.ts",
    "relPath": "services/challengeLauncher.ts"
  },
  {
    "name": "subscribeToChallengeCalls",
    "kind": "function",
    "returnType": "() => void",
    "params": [
      {
        "name": "listener",
        "type": "ChallengeListener"
      }
    ],
    "sourceFile": "challengeLauncher.ts",
    "relPath": "services/challengeLauncher.ts"
  },
  {
    "name": "ChallengeType",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "challengeLauncher.ts",
    "relPath": "services/challengeLauncher.ts"
  },
  {
    "name": "ChallengeMetadata",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "challengeLauncher.ts",
    "relPath": "services/challengeLauncher.ts"
  },
  {
    "name": "ChallengeCallOptions",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "challengeLauncher.ts",
    "relPath": "services/challengeLauncher.ts"
  },
  {
    "name": "validateStudentInput",
    "kind": "function",
    "returnType": "SafetyCheckResult",
    "params": [
      {
        "name": "input",
        "type": "string"
      }
    ],
    "sourceFile": "childSafetyFilter.ts",
    "relPath": "services/childSafetyFilter.ts"
  },
  {
    "name": "sanitizeAiOutput",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "output",
        "type": "string"
      },
      {
        "name": "fallbackContext",
        "type": "string"
      }
    ],
    "sourceFile": "childSafetyFilter.ts",
    "relPath": "services/childSafetyFilter.ts"
  },
  {
    "name": "SafetyCheckResult",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "childSafetyFilter.ts",
    "relPath": "services/childSafetyFilter.ts"
  },
  {
    "name": "CHILD_SAFEGUARDING_SYSTEM_PROMPT",
    "kind": "const",
    "returnType": "\"\\nCRITICAL CHILD SAFEGUARDING & SAFETY MANDATE:\\n1. You are speaking directly to primary or secondary school children (ages 5 to 16).\\n2. You MUST always maintain a warm, gentle, encouraging, and 100% wholesome tone.\\n3. NEVER produce or discuss: violence, weapons, adult content, profanity, drugs, romantic relation...",
    "params": [],
    "sourceFile": "childSafetyFilter.ts",
    "relPath": "services/childSafetyFilter.ts"
  },
  {
    "name": "StudentBeaconTelemetry",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "classroomBeacon.ts",
    "relPath": "services/classroomBeacon.ts"
  },
  {
    "name": "TeacherBroadcastCommand",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "classroomBeacon.ts",
    "relPath": "services/classroomBeacon.ts"
  },
  {
    "name": "classroomBeacon",
    "kind": "const",
    "returnType": "ClassroomBeaconManager",
    "params": [],
    "sourceFile": "classroomBeacon.ts",
    "relPath": "services/classroomBeacon.ts"
  },
  {
    "name": "default",
    "kind": "const",
    "returnType": "ClassroomBeaconManager",
    "params": [],
    "sourceFile": "classroomBeacon.ts",
    "relPath": "services/classroomBeacon.ts"
  },
  {
    "name": "initCurriculumPackStore",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [],
    "sourceFile": "curriculumPackStore.ts",
    "relPath": "services/curriculumPackStore.ts"
  },
  {
    "name": "getInstalledCurriculumPacks",
    "kind": "function",
    "returnType": "CustomCurriculumPack[]",
    "params": [],
    "sourceFile": "curriculumPackStore.ts",
    "relPath": "services/curriculumPackStore.ts"
  },
  {
    "name": "saveCurriculumPack",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "pack",
        "type": "CustomCurriculumPack"
      }
    ],
    "sourceFile": "curriculumPackStore.ts",
    "relPath": "services/curriculumPackStore.ts"
  },
  {
    "name": "removeCurriculumPack",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "packId",
        "type": "string"
      }
    ],
    "sourceFile": "curriculumPackStore.ts",
    "relPath": "services/curriculumPackStore.ts"
  },
  {
    "name": "findCustomTopicKnowledge",
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
    "sourceFile": "curriculumPackStore.ts",
    "relPath": "services/curriculumPackStore.ts"
  },
  {
    "name": "saveAxiomAnchorTopic",
    "kind": "function",
    "returnType": "CustomCurriculumPack",
    "params": [
      {
        "name": "data",
        "type": "{ keyStage: string; subject: string; topic: string; axiom: string; trap: string; hook?: string; guidedStep?: string; socraticPivot?: string; questions?: CustomQuestionItem[]; }"
      }
    ],
    "sourceFile": "curriculumPackStore.ts",
    "relPath": "services/curriculumPackStore.ts"
  },
  {
    "name": "deleteAxiomAnchorTopic",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "lessonId",
        "type": "string"
      }
    ],
    "sourceFile": "curriculumPackStore.ts",
    "relPath": "services/curriculumPackStore.ts"
  },
  {
    "name": "getCustomStandardStages",
    "kind": "function",
    "returnType": "Record<string, StandardStage>",
    "params": [],
    "sourceFile": "curriculumPackStore.ts",
    "relPath": "services/curriculumPackStore.ts"
  },
  {
    "name": "generateSampleCsvTemplate",
    "kind": "function",
    "returnType": "string",
    "params": [],
    "sourceFile": "curriculumPackStore.ts",
    "relPath": "services/curriculumPackStore.ts"
  },
  {
    "name": "generateSampleJsonTemplate",
    "kind": "function",
    "returnType": "string",
    "params": [],
    "sourceFile": "curriculumPackStore.ts",
    "relPath": "services/curriculumPackStore.ts"
  },
  {
    "name": "parseCsvToCurriculumPack",
    "kind": "function",
    "returnType": "CustomCurriculumPack",
    "params": [
      {
        "name": "csvContent",
        "type": "string"
      },
      {
        "name": "metadata",
        "type": "{ packId?: string; packTitle?: string; countryOrRegion?: string; authorOrMinistry?: string; description?: string; }"
      }
    ],
    "sourceFile": "curriculumPackStore.ts",
    "relPath": "services/curriculumPackStore.ts"
  },
  {
    "name": "CustomQuestionDistractor",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "curriculumPackStore.ts",
    "relPath": "services/curriculumPackStore.ts"
  },
  {
    "name": "CustomQuestionItem",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "curriculumPackStore.ts",
    "relPath": "services/curriculumPackStore.ts"
  },
  {
    "name": "CustomCurriculumLesson",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "curriculumPackStore.ts",
    "relPath": "services/curriculumPackStore.ts"
  },
  {
    "name": "CustomCurriculumPack",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "curriculumPackStore.ts",
    "relPath": "services/curriculumPackStore.ts"
  },
  {
    "name": "PRESET_OVERSEAS_PACKS",
    "kind": "const",
    "returnType": "CustomCurriculumPack[]",
    "params": [],
    "sourceFile": "curriculumPackStore.ts",
    "relPath": "services/curriculumPackStore.ts"
  },
  {
    "name": "loadCustomBslSigns",
    "kind": "function",
    "returnType": "Promise<Record<string, BslSign>>",
    "params": [],
    "sourceFile": "customSignStore.ts",
    "relPath": "services/customSignStore.ts"
  },
  {
    "name": "saveCustomBslSign",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "sign",
        "type": "BslSign"
      }
    ],
    "sourceFile": "customSignStore.ts",
    "relPath": "services/customSignStore.ts"
  },
  {
    "name": "deleteCustomBslSign",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "word",
        "type": "string"
      }
    ],
    "sourceFile": "customSignStore.ts",
    "relPath": "services/customSignStore.ts"
  },
  {
    "name": "getCustomBslSign",
    "kind": "function",
    "returnType": "Promise<BslSign>",
    "params": [
      {
        "name": "word",
        "type": "string"
      }
    ],
    "sourceFile": "customSignStore.ts",
    "relPath": "services/customSignStore.ts"
  },
  {
    "name": "initCustomSignsIntoLexicon",
    "kind": "function",
    "returnType": "Promise<number>",
    "params": [],
    "sourceFile": "customSignStore.ts",
    "relPath": "services/customSignStore.ts"
  },
  {
    "name": "exportCustomSignsAst",
    "kind": "function",
    "returnType": "Promise<string>",
    "params": [],
    "sourceFile": "customSignStore.ts",
    "relPath": "services/customSignStore.ts"
  },
  {
    "name": "importCustomSignsFromAst",
    "kind": "function",
    "returnType": "Promise<number>",
    "params": [
      {
        "name": "astText",
        "type": "string"
      }
    ],
    "sourceFile": "customSignStore.ts",
    "relPath": "services/customSignStore.ts"
  },
  {
    "name": "subscribeCustomSigns",
    "kind": "function",
    "returnType": "() => void",
    "params": [
      {
        "name": "callback",
        "type": "() => void"
      }
    ],
    "sourceFile": "customSignStore.ts",
    "relPath": "services/customSignStore.ts"
  },
  {
    "name": "isDataSaverActive",
    "kind": "function",
    "returnType": "boolean",
    "params": [],
    "sourceFile": "dataSaverStore.ts",
    "relPath": "services/dataSaverStore.ts"
  },
  {
    "name": "setDataSaverMode",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "enabled",
        "type": "boolean"
      }
    ],
    "sourceFile": "dataSaverStore.ts",
    "relPath": "services/dataSaverStore.ts"
  },
  {
    "name": "applyDataSaverToDOM",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "enabled",
        "type": "boolean"
      }
    ],
    "sourceFile": "dataSaverStore.ts",
    "relPath": "services/dataSaverStore.ts"
  },
  {
    "name": "listenToDataSaverChanges",
    "kind": "function",
    "returnType": "() => void",
    "params": [
      {
        "name": "callback",
        "type": "(enabled: boolean) => void"
      }
    ],
    "sourceFile": "dataSaverStore.ts",
    "relPath": "services/dataSaverStore.ts"
  },
  {
    "name": "isConstrainedEnvironment",
    "kind": "function",
    "returnType": "boolean",
    "params": [],
    "sourceFile": "dataSaverStore.ts",
    "relPath": "services/dataSaverStore.ts"
  },
  {
    "name": "isCoreSyllabusPinned",
    "kind": "function",
    "returnType": "boolean",
    "params": [
      {
        "name": "keyOrDomain",
        "type": "string"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "openLocalDB",
    "kind": "function",
    "returnType": "Promise<IDBDatabase>",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "getAllAppStateRecords",
    "kind": "function",
    "returnType": "Promise<AppStateRecord[]>",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "putAppStateRecord",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "key",
        "type": "string"
      },
      {
        "name": "value",
        "type": "string"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "deleteAppStateRecord",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "key",
        "type": "string"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "getAllCurriculumPackRecords",
    "kind": "function",
    "returnType": "Promise<T[]>",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "putCurriculumPackRecord",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "pack",
        "type": "T"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "deleteCurriculumPackRecord",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "packId",
        "type": "string"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "getBufferedLesson",
    "kind": "function",
    "returnType": "Promise<CachedLessonRecord>",
    "params": [
      {
        "name": "key",
        "type": "string"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "putBufferedLesson",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "lesson",
        "type": "CachedLessonRecord"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "saveManifest",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "manifest",
        "type": "DomainManifest"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "getManifest",
    "kind": "function",
    "returnType": "Promise<DomainManifest>",
    "params": [
      {
        "name": "domainId",
        "type": "string"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "logProgress",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "record",
        "type": "StudentRecord"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "getAllProgressRecords",
    "kind": "function",
    "returnType": "Promise<StudentRecord[]>",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "clearAllStudentProgress",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "getTuringDiagnosticSummary",
    "kind": "function",
    "returnType": "Promise<{ accuracy: number; commonErrors: string[]; }>",
    "params": [
      {
        "name": "topicId",
        "type": "string"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "saveTopicAdapter",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "adapter",
        "type": "TopicAdapterRecord"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "getTopicAdapter",
    "kind": "function",
    "returnType": "Promise<TopicAdapterRecord>",
    "params": [
      {
        "name": "topicKey",
        "type": "string"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "bootstrapTopicAdapters",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "saveVerifiedAST",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "topicKey",
        "type": "string"
      },
      {
        "name": "rawAST",
        "type": "string"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "getBufferedQuestion",
    "kind": "function",
    "returnType": "Promise<string>",
    "params": [
      {
        "name": "topicKey",
        "type": "string"
      },
      {
        "name": "excludePrompt",
        "type": "string"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "checkAndReplenishBuffer",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "topicKey",
        "type": "string"
      },
      {
        "name": "minThreshold",
        "type": "number"
      },
      {
        "name": "triggerWorker",
        "type": "(key: string) => Promise<void>"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "getRandomCachedAST",
    "kind": "function",
    "returnType": "Promise<string>",
    "params": [
      {
        "name": "topicKey",
        "type": "string"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "saveVfsView",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "path",
        "type": "string"
      },
      {
        "name": "content",
        "type": "string"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "getVfsView",
    "kind": "function",
    "returnType": "Promise<string>",
    "params": [
      {
        "name": "path",
        "type": "string"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "bootstrapVfsViews",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "defaultViews",
        "type": "Record<string, string>"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "enforceStorageQuotaLRU",
    "kind": "function",
    "returnType": "Promise<StorageQuotaLRUMetrics>",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "getStorageQuotaMetrics",
    "kind": "function",
    "returnType": "Promise<StorageQuotaLRUMetrics>",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "purgeInactiveManifests",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "activeDomainId",
        "type": "string"
      },
      {
        "name": "preservedDomains",
        "type": "string[]"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "putVaultCartridge",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "cartridge",
        "type": "VaultCartridgeRecord"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "getVaultCartridge",
    "kind": "function",
    "returnType": "Promise<VaultCartridgeRecord>",
    "params": [
      {
        "name": "id",
        "type": "string"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "getAllVaultCartridges",
    "kind": "function",
    "returnType": "Promise<VaultCartridgeRecord[]>",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "deleteVaultCartridge",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "id",
        "type": "string"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "countVaultCartridges",
    "kind": "function",
    "returnType": "Promise<number>",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "hasVaultCartridge",
    "kind": "function",
    "returnType": "Promise<boolean>",
    "params": [
      {
        "name": "id",
        "type": "string"
      }
    ],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "STORE_VIEWS",
    "kind": "const",
    "returnType": "\"vfs_views\"",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "STORE_CARTRIDGES_VAULT",
    "kind": "const",
    "returnType": "\"cartridges_vault\"",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "STORE_APP_STATE",
    "kind": "const",
    "returnType": "\"app_state\"",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "STORE_CURRICULUM_PACKS",
    "kind": "const",
    "returnType": "\"curriculum_packs\"",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "AppStateRecord",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "StudentRecord",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "VfsViewRecord",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "TopicAdapterRecord",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "CachedASTRecord",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "CachedLessonRecord",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "PINNED_CORE_MANIFESTS",
    "kind": "const",
    "returnType": "Set<string>",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "getDB",
    "kind": "const",
    "returnType": "Promise<IDBDatabase>",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "DEFAULT_TOPIC_ADAPTERS",
    "kind": "const",
    "returnType": "TopicAdapterRecord[]",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "StorageQuotaLRUMetrics",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "MAX_UNPINNED_LESSON_TRACES",
    "kind": "const",
    "returnType": "35",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "TARGET_UNPINNED_LESSON_TRACES",
    "kind": "const",
    "returnType": "25",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "MAX_UNPINNED_AST_ITEMS",
    "kind": "const",
    "returnType": "60",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "TARGET_UNPINNED_AST_ITEMS",
    "kind": "const",
    "returnType": "40",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "VaultCartridgeRecord",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "dbStore.ts",
    "relPath": "services/dbStore.ts"
  },
  {
    "name": "openJotterDB",
    "kind": "function",
    "returnType": "Promise<IDBDatabase>",
    "params": [],
    "sourceFile": "jotter-db.ts",
    "relPath": "services/jotter-db.ts"
  },
  {
    "name": "appendJotter",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "entry",
        "type": "Omit<JotterEntry, \"timestamp\">"
      }
    ],
    "sourceFile": "jotter-db.ts",
    "relPath": "services/jotter-db.ts"
  },
  {
    "name": "getRecentJotterEntries",
    "kind": "function",
    "returnType": "Promise<JotterEntry[]>",
    "params": [
      {
        "name": "sessionId",
        "type": "string"
      },
      {
        "name": "limit",
        "type": "number"
      }
    ],
    "sourceFile": "jotter-db.ts",
    "relPath": "services/jotter-db.ts"
  },
  {
    "name": "appendLabCsvToJotter",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "presetId",
        "type": "string"
      },
      {
        "name": "csv",
        "type": "string"
      },
      {
        "name": "nodePath",
        "type": "string"
      }
    ],
    "sourceFile": "jotter-db.ts",
    "relPath": "services/jotter-db.ts"
  },
  {
    "name": "getLabCsvEntries",
    "kind": "function",
    "returnType": "Promise<JotterEntry[]>",
    "params": [
      {
        "name": "presetId",
        "type": "string"
      },
      {
        "name": "limit",
        "type": "number"
      }
    ],
    "sourceFile": "jotter-db.ts",
    "relPath": "services/jotter-db.ts"
  },
  {
    "name": "clearJotterDB",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [],
    "sourceFile": "jotter-db.ts",
    "relPath": "services/jotter-db.ts"
  },
  {
    "name": "JotterEntry",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "jotter-db.ts",
    "relPath": "services/jotter-db.ts"
  },
  {
    "name": "initLocalStateStore",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [],
    "sourceFile": "localStateStore.ts",
    "relPath": "services/localStateStore.ts"
  },
  {
    "name": "isLocalStateHydrated",
    "kind": "function",
    "returnType": "boolean",
    "params": [],
    "sourceFile": "localStateStore.ts",
    "relPath": "services/localStateStore.ts"
  },
  {
    "name": "getLocalState",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "key",
        "type": "string"
      }
    ],
    "sourceFile": "localStateStore.ts",
    "relPath": "services/localStateStore.ts"
  },
  {
    "name": "setLocalState",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "key",
        "type": "string"
      },
      {
        "name": "value",
        "type": "string"
      }
    ],
    "sourceFile": "localStateStore.ts",
    "relPath": "services/localStateStore.ts"
  },
  {
    "name": "removeLocalState",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "key",
        "type": "string"
      }
    ],
    "sourceFile": "localStateStore.ts",
    "relPath": "services/localStateStore.ts"
  },
  {
    "name": "getLocalJson",
    "kind": "function",
    "returnType": "T",
    "params": [
      {
        "name": "key",
        "type": "string"
      }
    ],
    "sourceFile": "localStateStore.ts",
    "relPath": "services/localStateStore.ts"
  },
  {
    "name": "setLocalJson",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "key",
        "type": "string"
      },
      {
        "name": "value",
        "type": "T"
      }
    ],
    "sourceFile": "localStateStore.ts",
    "relPath": "services/localStateStore.ts"
  },
  {
    "name": "subscribeLocalState",
    "kind": "function",
    "returnType": "() => void",
    "params": [
      {
        "name": "callback",
        "type": "(detail: LocalStateChangeDetail) => void"
      },
      {
        "name": "filterKey",
        "type": "string"
      }
    ],
    "sourceFile": "localStateStore.ts",
    "relPath": "services/localStateStore.ts"
  },
  {
    "name": "flushLocalStateWrites",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [],
    "sourceFile": "localStateStore.ts",
    "relPath": "services/localStateStore.ts"
  },
  {
    "name": "LOCAL_STATE_EVENT",
    "kind": "const",
    "returnType": "\"stj_local_state_changed\"",
    "params": [],
    "sourceFile": "localStateStore.ts",
    "relPath": "services/localStateStore.ts"
  },
  {
    "name": "LocalStateChangeDetail",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "localStateStore.ts",
    "relPath": "services/localStateStore.ts"
  },
  {
    "name": "sendMflChatMessage",
    "kind": "function",
    "returnType": "Promise<{ targetText: string; translation: string; coachingTip?: string; isAiGenerated: boolean; }>",
    "params": [
      {
        "name": "userInput",
        "type": "string"
      },
      {
        "name": "lang",
        "type": "string"
      },
      {
        "name": "previousHistory",
        "type": "MflChatMessage[]"
      }
    ],
    "sourceFile": "mflConversationEngine.ts",
    "relPath": "services/mflConversationEngine.ts"
  },
  {
    "name": "MflPartnerPersona",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "mflConversationEngine.ts",
    "relPath": "services/mflConversationEngine.ts"
  },
  {
    "name": "MflChatMessage",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "mflConversationEngine.ts",
    "relPath": "services/mflConversationEngine.ts"
  },
  {
    "name": "MFL_PERSONAS",
    "kind": "const",
    "returnType": "Record<string, MflPartnerPersona>",
    "params": [],
    "sourceFile": "mflConversationEngine.ts",
    "relPath": "services/mflConversationEngine.ts"
  },
  {
    "name": "getActiveManifestCacheName",
    "kind": "function",
    "returnType": "Promise<string>",
    "params": [],
    "sourceFile": "offlineSync.ts",
    "relPath": "services/offlineSync.ts"
  },
  {
    "name": "isOfflineSyncComplete",
    "kind": "function",
    "returnType": "boolean",
    "params": [],
    "sourceFile": "offlineSync.ts",
    "relPath": "services/offlineSync.ts"
  },
  {
    "name": "getOfflineSyncDate",
    "kind": "function",
    "returnType": "string",
    "params": [],
    "sourceFile": "offlineSync.ts",
    "relPath": "services/offlineSync.ts"
  },
  {
    "name": "checkDeviceStorageSupport",
    "kind": "function",
    "returnType": "Promise<{ supported: boolean; persisted: boolean; quotaMb?: number; usageMb?: number; }>",
    "params": [],
    "sourceFile": "offlineSync.ts",
    "relPath": "services/offlineSync.ts"
  },
  {
    "name": "syncEntireCurriculumOffline",
    "kind": "function",
    "returnType": "Promise<boolean>",
    "params": [
      {
        "name": "onProgress",
        "type": "(progress: SyncProgress) => void"
      }
    ],
    "sourceFile": "offlineSync.ts",
    "relPath": "services/offlineSync.ts"
  },
  {
    "name": "CORE_OFFLINE_URLS",
    "kind": "const",
    "returnType": "string[]",
    "params": [],
    "sourceFile": "offlineSync.ts",
    "relPath": "services/offlineSync.ts"
  },
  {
    "name": "SyncProgress",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "offlineSync.ts",
    "relPath": "services/offlineSync.ts"
  },
  {
    "name": "getOfflineStatus",
    "kind": "function",
    "returnType": "Promise<OfflineStatus>",
    "params": [],
    "sourceFile": "offlineSyncService.ts",
    "relPath": "services/offlineSyncService.ts"
  },
  {
    "name": "downloadCurriculumForOffline",
    "kind": "function",
    "returnType": "Promise<{ success: boolean; count: number; error?: string; }>",
    "params": [
      {
        "name": "onProgress",
        "type": "(progress: SyncProgress) => void"
      }
    ],
    "sourceFile": "offlineSyncService.ts",
    "relPath": "services/offlineSyncService.ts"
  },
  {
    "name": "SyncProgress",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "offlineSyncService.ts",
    "relPath": "services/offlineSyncService.ts"
  },
  {
    "name": "OfflineStatus",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "offlineSyncService.ts",
    "relPath": "services/offlineSyncService.ts"
  },
  {
    "name": "resolvePresetForTopic",
    "kind": "function",
    "returnType": "VectorPresetId",
    "params": [
      {
        "name": "subject",
        "type": "string"
      },
      {
        "name": "unit",
        "type": "string"
      },
      {
        "name": "topic",
        "type": "string"
      }
    ],
    "sourceFile": "playerLauncher.ts",
    "relPath": "services/playerLauncher.ts"
  },
  {
    "name": "openPlayerModal",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "options",
        "type": "PlayerCallOptions"
      }
    ],
    "sourceFile": "playerLauncher.ts",
    "relPath": "services/playerLauncher.ts"
  },
  {
    "name": "closePlayerModal",
    "kind": "function",
    "returnType": "void",
    "params": [],
    "sourceFile": "playerLauncher.ts",
    "relPath": "services/playerLauncher.ts"
  },
  {
    "name": "subscribeToPlayerCalls",
    "kind": "function",
    "returnType": "() => void",
    "params": [
      {
        "name": "listener",
        "type": "PlayerListener"
      }
    ],
    "sourceFile": "playerLauncher.ts",
    "relPath": "services/playerLauncher.ts"
  },
  {
    "name": "VectorPresetId",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "playerLauncher.ts",
    "relPath": "services/playerLauncher.ts"
  },
  {
    "name": "PlayerCheckpointOption",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "playerLauncher.ts",
    "relPath": "services/playerLauncher.ts"
  },
  {
    "name": "PlayerCallOptions",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "playerLauncher.ts",
    "relPath": "services/playerLauncher.ts"
  },
  {
    "name": "isStrictAirGapMode",
    "kind": "function",
    "returnType": "boolean",
    "params": [],
    "sourceFile": "privacyGuard.ts",
    "relPath": "services/privacyGuard.ts"
  },
  {
    "name": "setStrictAirGapMode",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "enabled",
        "type": "boolean"
      }
    ],
    "sourceFile": "privacyGuard.ts",
    "relPath": "services/privacyGuard.ts"
  },
  {
    "name": "listenToAirGapChanges",
    "kind": "function",
    "returnType": "() => void",
    "params": [
      {
        "name": "callback",
        "type": "(enabled: boolean) => void"
      }
    ],
    "sourceFile": "privacyGuard.ts",
    "relPath": "services/privacyGuard.ts"
  },
  {
    "name": "isSoundEnabled",
    "kind": "function",
    "returnType": "boolean",
    "params": [],
    "sourceFile": "soundHaptics.ts",
    "relPath": "services/soundHaptics.ts"
  },
  {
    "name": "setSoundEnabled",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "enabled",
        "type": "boolean"
      }
    ],
    "sourceFile": "soundHaptics.ts",
    "relPath": "services/soundHaptics.ts"
  },
  {
    "name": "isHapticsEnabled",
    "kind": "function",
    "returnType": "boolean",
    "params": [],
    "sourceFile": "soundHaptics.ts",
    "relPath": "services/soundHaptics.ts"
  },
  {
    "name": "setHapticsEnabled",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "enabled",
        "type": "boolean"
      }
    ],
    "sourceFile": "soundHaptics.ts",
    "relPath": "services/soundHaptics.ts"
  },
  {
    "name": "playSuccessChime",
    "kind": "function",
    "returnType": "void",
    "params": [],
    "sourceFile": "soundHaptics.ts",
    "relPath": "services/soundHaptics.ts"
  },
  {
    "name": "playIncorrectTone",
    "kind": "function",
    "returnType": "void",
    "params": [],
    "sourceFile": "soundHaptics.ts",
    "relPath": "services/soundHaptics.ts"
  },
  {
    "name": "playClickTone",
    "kind": "function",
    "returnType": "void",
    "params": [],
    "sourceFile": "soundHaptics.ts",
    "relPath": "services/soundHaptics.ts"
  },
  {
    "name": "playCelebrationFanfare",
    "kind": "function",
    "returnType": "void",
    "params": [],
    "sourceFile": "soundHaptics.ts",
    "relPath": "services/soundHaptics.ts"
  },
  {
    "name": "triggerHapticSuccess",
    "kind": "function",
    "returnType": "void",
    "params": [],
    "sourceFile": "soundHaptics.ts",
    "relPath": "services/soundHaptics.ts"
  },
  {
    "name": "triggerHapticError",
    "kind": "function",
    "returnType": "void",
    "params": [],
    "sourceFile": "soundHaptics.ts",
    "relPath": "services/soundHaptics.ts"
  },
  {
    "name": "triggerHapticClick",
    "kind": "function",
    "returnType": "void",
    "params": [],
    "sourceFile": "soundHaptics.ts",
    "relPath": "services/soundHaptics.ts"
  },
  {
    "name": "playLumenChristiChant",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "elevation",
        "type": "2 | 1 | 3"
      }
    ],
    "sourceFile": "soundHaptics.ts",
    "relPath": "services/soundHaptics.ts"
  },
  {
    "name": "playEasterBells",
    "kind": "function",
    "returnType": "void",
    "params": [],
    "sourceFile": "soundHaptics.ts",
    "relPath": "services/soundHaptics.ts"
  },
  {
    "name": "playCrotalusClapper",
    "kind": "function",
    "returnType": "void",
    "params": [],
    "sourceFile": "soundHaptics.ts",
    "relPath": "services/soundHaptics.ts"
  },
  {
    "name": "generateRandomAlias",
    "kind": "function",
    "returnType": "{ alias: string; avatar: string; }",
    "params": [],
    "sourceFile": "studentProfileStore.ts",
    "relPath": "services/studentProfileStore.ts"
  },
  {
    "name": "getLearnerProfile",
    "kind": "function",
    "returnType": "LearnerProfile",
    "params": [],
    "sourceFile": "studentProfileStore.ts",
    "relPath": "services/studentProfileStore.ts"
  },
  {
    "name": "saveLearnerProfile",
    "kind": "function",
    "returnType": "LearnerProfile",
    "params": [
      {
        "name": "updates",
        "type": "Partial<LearnerProfile>"
      }
    ],
    "sourceFile": "studentProfileStore.ts",
    "relPath": "services/studentProfileStore.ts"
  },
  {
    "name": "formatTopicTitle",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "rawTopicId",
        "type": "string"
      }
    ],
    "sourceFile": "studentProfileStore.ts",
    "relPath": "services/studentProfileStore.ts"
  },
  {
    "name": "inferMisSubjectDomain",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "rawTopicId",
        "type": "string"
      }
    ],
    "sourceFile": "studentProfileStore.ts",
    "relPath": "services/studentProfileStore.ts"
  },
  {
    "name": "computeAttainmentBand",
    "kind": "function",
    "returnType": "string",
    "params": [
      {
        "name": "accuracyPercent",
        "type": "number"
      }
    ],
    "sourceFile": "studentProfileStore.ts",
    "relPath": "services/studentProfileStore.ts"
  },
  {
    "name": "recordAssessmentAttempt",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [
      {
        "name": "input",
        "type": "RecordAttemptInput"
      }
    ],
    "sourceFile": "studentProfileStore.ts",
    "relPath": "services/studentProfileStore.ts"
  },
  {
    "name": "getLearnerAnalytics",
    "kind": "function",
    "returnType": "Promise<LearnerAnalytics>",
    "params": [],
    "sourceFile": "studentProfileStore.ts",
    "relPath": "services/studentProfileStore.ts"
  },
  {
    "name": "purgeAllLearnerData",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [],
    "sourceFile": "studentProfileStore.ts",
    "relPath": "services/studentProfileStore.ts"
  },
  {
    "name": "exportLearnerPassportJson",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [],
    "sourceFile": "studentProfileStore.ts",
    "relPath": "services/studentProfileStore.ts"
  },
  {
    "name": "exportLearnerArborCsv",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [],
    "sourceFile": "studentProfileStore.ts",
    "relPath": "services/studentProfileStore.ts"
  },
  {
    "name": "downloadLearnerCertificateHtml",
    "kind": "function",
    "returnType": "Promise<void>",
    "params": [],
    "sourceFile": "studentProfileStore.ts",
    "relPath": "services/studentProfileStore.ts"
  },
  {
    "name": "LearnerProfile",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "studentProfileStore.ts",
    "relPath": "services/studentProfileStore.ts"
  },
  {
    "name": "TopicMasteryStat",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "studentProfileStore.ts",
    "relPath": "services/studentProfileStore.ts"
  },
  {
    "name": "LearnerAnalytics",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "studentProfileStore.ts",
    "relPath": "services/studentProfileStore.ts"
  },
  {
    "name": "RecordAttemptInput",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "studentProfileStore.ts",
    "relPath": "services/studentProfileStore.ts"
  },
  {
    "name": "isWebMcpSupported",
    "kind": "function",
    "returnType": "boolean",
    "params": [],
    "sourceFile": "webMcpBridge.ts",
    "relPath": "services/webMcpBridge.ts"
  },
  {
    "name": "getRegisteredWebMcpTools",
    "kind": "function",
    "returnType": "readonly string[]",
    "params": [],
    "sourceFile": "webMcpBridge.ts",
    "relPath": "services/webMcpBridge.ts"
  },
  {
    "name": "setWebMcpNavigator",
    "kind": "function",
    "returnType": "void",
    "params": [
      {
        "name": "navigator",
        "type": "NavigateFunction"
      }
    ],
    "sourceFile": "webMcpBridge.ts",
    "relPath": "services/webMcpBridge.ts"
  },
  {
    "name": "registerWebMcpTools",
    "kind": "function",
    "returnType": "Promise<boolean>",
    "params": [
      {
        "name": "navigator",
        "type": "NavigateFunction"
      }
    ],
    "sourceFile": "webMcpBridge.ts",
    "relPath": "services/webMcpBridge.ts"
  },
  {
    "name": "unregisterWebMcpTools",
    "kind": "function",
    "returnType": "void",
    "params": [],
    "sourceFile": "webMcpBridge.ts",
    "relPath": "services/webMcpBridge.ts"
  },
  {
    "name": "initWebMcpBridge",
    "kind": "function",
    "returnType": "() => void",
    "params": [
      {
        "name": "navigator",
        "type": "NavigateFunction"
      }
    ],
    "sourceFile": "webMcpBridge.ts",
    "relPath": "services/webMcpBridge.ts"
  },
  {
    "name": "NavigateFunction",
    "kind": "const",
    "returnType": "any",
    "params": [],
    "sourceFile": "webMcpBridge.ts",
    "relPath": "services/webMcpBridge.ts"
  }
] as const;
