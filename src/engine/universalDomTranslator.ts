// src/engine/universalDomTranslator.ts
import {
  SUPPORTED_LANGUAGES,
  getSavedLanguage,
  listenToLanguageChange,
  setSavedLanguage,
  isRtlLanguage,
} from './operational-language';
import { translateText, speakInLanguage, OFFLINE_LEXICON } from './translationService';

// WeakMap storing original English text of DOM text nodes for 100% fidelity restoration
const ORIGINAL_TEXT_NODES = new WeakMap<Text, string>();
const TRANSLATED_TEXT_NODES = new WeakMap<Text, { lang: string; text: string }>();

// Comprehensive educational dictionary for instant zero-latency universal UI translation
export const UNIVERSAL_UI_LEXICON: Record<string, Record<string, string>> = {
  "St Joseph's": {
    es: "San José",
    fr: "Saint-Joseph",
    de: "St. Joseph",
    pl: "Św. Józefa",
    uk: "Святого Йосипа",
    ar: "سانت جوزيف",
    ur: "سینٹ جوزف",
    bn: "সেন্ট জোসেফ",
    hi: "सेंट जोसेफ",
    zh: "圣约瑟夫",
  },
  "St Joseph's Interactive Learning Portal": {
    es: "Portal de Aprendizaje Interactivo San José",
    fr: "Portail d'Apprentissage Interactif Saint-Joseph",
    de: "St. Joseph Interaktives Lernportal",
    pl: "Interaktywny Portal Edukacyjny Św. Józefa",
    uk: "Інтерактивний Навчальний Портал Святого Йосипа",
    ar: "بوابة سانت جوزيف للتعلم التفاعلي",
    ur: "سینٹ جوزف انٹرایکٹو لرننگ پورٹل",
    bn: "সেন্ট জোসেফ ইন্টারেক্টিভ লার্নিং পোর্টাল",
    hi: "सेंट जोसेफ इंटरैक्टिव लर्निंग पोर्टल",
    zh: "圣约瑟夫互动学习平台",
  },
  "Adaptive Practice Lab": {
    es: "Laboratorio de Práctica Adaptativo",
    fr: "Laboratoire de Pratique Adaptatif",
    de: "Adaptives Übungslabor",
    pl: "Adaptacyjne Laboratorium Ćwiczeń",
    uk: "Адаптивна Практична Лабораторія",
    ar: "مختبر تدريب تكيّفي",
    ur: "انکولی مشق کی لیب",
    bn: "অভিযোজিত অনুশীলন ল্যাব",
    hi: "अनुकूली अभ्यास प्रयोगशाला",
    zh: "自适应实践实验室",
  },
  "Prof. Turing Socratic Tutor": {
    es: "Tutor Socrático Prof. Turing",
    fr: "Tuteur Socratique Prof. Turing",
    de: "Sokratischer Tutor Prof. Turing",
    pl: "Sokratejski Korepetytor Prof. Turing",
    uk: "Сократівський Репетитор Проф. Тюрінг",
    ar: "المعلم السقراطي البروفيسور تورينج",
    ur: "پروفیسر ٹیورنگ سقراطی ٹیوٹر",
    bn: "প্রফেসর টিউরিং সক্রেটিক শিক্ষক",
    hi: "प्रोफेसर ट्यूरिंग सुकराती शिक्षक",
    zh: "图灵教授苏格拉底式导师",
  },
  "Deterministic Guardrails": {
    es: "Barreras Deterministas",
    fr: "Garde-fous Déterministes",
    de: "Deterministische Leitplanken",
    pl: "Deterministyczne Bariery Ochronne",
    uk: "Детерміновані Захисні Бар'єри",
    ar: "حواجز وقائية حتمية",
    ur: "حتمی حفاظتی تدابیر",
    bn: "নির্ধারিত সুরক্ষা ব্যবস্থা",
    hi: "निश्चित सुरक्षा दिशानिर्देश",
    zh: "确定性防护栏",
  },
  "Practice Lab": {
    es: "Laboratorio de Práctica",
    fr: "Laboratoire de Pratique",
    de: "Übungslabor",
    pl: "Laboratorium Ćwiczeń",
    uk: "Практична Лабораторія",
    ar: "مختبر التدريب",
    ur: "مشق کی لیب",
    bn: "অনুশীলন ল্যাব",
    hi: "अभ्यास प्रयोगशाला",
    zh: "练习实验室",
  },
  "Learning Zone": {
    es: "Zona de Aprendizaje",
    fr: "Zone d'Apprentissage",
    de: "Lernbereich",
    pl: "Strefa Nauki",
    uk: "Зона Навчання",
    ar: "منطقة التعلم",
    ur: "سیکھنے کا زون",
    bn: "শেখার অঞ্চল",
    hi: "अध्ययन क्षेत्र",
    zh: "学习区",
  },
  "Learner Profile": {
    es: "Perfil del Estudiante",
    fr: "Profil de l'Élève",
    de: "Schülerprofil",
    pl: "Profil Ucznia",
    uk: "Профіль Учня",
    ar: "ملف المتعلم",
    ur: "طالب علم کا پروفائل",
    bn: "শিক্ষার্থীর প্রোফাইল",
    hi: "शिक्षार्थी प्रोफ़ाइल",
    zh: "学习者档案",
  },
  "Settings": {
    es: "Configuración",
    fr: "Paramètres",
    de: "Einstellungen",
    pl: "Ustawienia",
    uk: "Налаштування",
    ar: "الإعدادات",
    ur: "ترتیبات",
    bn: "সেটিংস",
    hi: "सेटिंग्स",
    zh: "设置",
  },
  "News": {
    es: "Noticias",
    fr: "Actualités",
    de: "Neuigkeiten",
    pl: "Aktualności",
    uk: "Новини",
    ar: "الأخبار",
    ur: "خبریں",
    bn: "সংবাদ",
    hi: "समाचार",
    zh: "新闻",
  },
  "What We Offer": {
    es: "Lo Que Ofrecemos",
    fr: "Ce Que Nous Proposons",
    de: "Unser Angebot",
    pl: "Co Oferujemy",
    uk: "Що Ми Пропонуємо",
    ar: "ما نقدمه",
    ur: "ہم کیا پیش کرتے ہیں",
    bn: "আমরা যা অফার করি",
    hi: "हम क्या प्रदान करते हैं",
    zh: "我们提供的服务",
  },
  "Generate Lesson": {
    es: "Generar Lección",
    fr: "Générer la Leçon",
    de: "Lektion Erstellen",
    pl: "Generuj Lekcję",
    uk: "Створити Урок",
    ar: "إنشاء درس",
    ur: "سبق بنائیں",
    bn: "পাঠ তৈরি করুন",
    hi: "पाठ तैयार करें",
    zh: "生成课程",
  },
  "Compiling...": {
    es: "Compilando...",
    fr: "Compilation...",
    de: "Kompiliere...",
    pl: "Kompilowanie...",
    uk: "Компіляція...",
    ar: "جارٍ التحضير...",
    ur: "تیاری جاری ہے...",
    bn: "সংকলন হচ্ছে...",
    hi: "तैयार हो रहा है...",
    zh: "正在编译...",
  },
  "Interactive Practice Lab": {
    es: "Laboratorio de Práctica Interactivo",
    fr: "Laboratoire de Pratique Interactif",
    de: "Interaktives Übungslabor",
    pl: "Interaktywne Laboratorium Ćwiczeń",
    uk: "Інтерактивна Практична Лабораторія",
    ar: "مختبر تدريب تفاعلي",
    ur: "انٹرایکٹو پریکٹس لیب",
    bn: "ইন্টারেক্টিভ অনুশীলন ল্যাব",
    hi: "इंटरैक्टिव अभ्यास प्रयोगशाला",
    zh: "互动实践实验室",
  },
  "Curriculum Learning Zone": {
    es: "Zona de Aprendizaje Curricular",
    fr: "Zone d'Apprentissage Curriculaire",
    de: "Lehrplan-Lernbereich",
    pl: "Strefa Nauki Programowej",
    uk: "Зона Вивчення Навчальної Програми",
    ar: "منطقة تعلم المنهج الدراسي",
    ur: "نصاب سیکھنے کا زون",
    bn: "পাঠ্যক্রম শেখার অঞ্চল",
    hi: "पाठ्यक्रम अध्ययन क्षेत्र",
    zh: "课程学习区",
  },
  "Read Aloud": {
    es: "Leer en Voz Alta",
    fr: "Lire à Haute Voix",
    de: "Vorlesen",
    pl: "Czytaj na Głos",
    uk: "Читати Вголос",
    ar: "قراءة بصوت عالٍ",
    ur: "بلند آواز میں پڑھیں",
    bn: "জোরে পড়ুন",
    hi: "ज़ोर से पढ़ें",
    zh: "大声朗读",
  },
  "Expand Full Lesson (AI)": {
    es: "Ampliar Lección Completa (IA)",
    fr: "Développer la Leçon Complète (IA)",
    de: "Vollständige Lektion Erweitern (KI)",
    pl: "Rozwiń Pełną Lekcję (AI)",
    uk: "Розгорнути Повний Урок (ШІ)",
    ar: "توسيع الدرس بالكامل (ذكاء اصطناعي)",
    ur: "مکمل سبق پھیلائیں (AI)",
    bn: "সম্পূর্ণ পাঠ প্রসারিত করুন (AI)",
    hi: "पूरा पाठ विस्तार से देखें (AI)",
    zh: "展开完整课程 (AI)",
  },
  "Test in Practice Lab": {
    es: "Probar en Laboratorio de Práctica",
    fr: "Tester dans le Laboratoire",
    de: "Im Übungslabor Testen",
    pl: "Testuj w Laboratorium",
    uk: "Перевірити в Лабораторії",
    ar: "اختبار في مختبر التدريب",
    ur: "پریکٹس لیب میں ٹیسٹ کریں",
    bn: "অনুশীলন ল্যাবে পরীক্ষা করুন",
    hi: "अभ्यास लैब में परीक्षण करें",
    zh: "在实践实验室测试",
  },
  "Core Axiom": {
    es: "Axioma Central",
    fr: "Axiome Principal",
    de: "Kernaxiom",
    pl: "Główny Aksjomat",
    uk: "Основна Аксіома",
    ar: "المبدأ الأساسي",
    ur: "بنیادی اصول",
    bn: "মূল স্বতঃসিদ্ধ",
    hi: "मूल सिद्धांत",
    zh: "核心公理",
  },
  "Cognitive Trap (Common Error)": {
    es: "Trampa Cognitiva (Error Común)",
    fr: "Piège Cognitif (Erreur Courante)",
    de: "Denkfalle (Häufiger Fehler)",
    pl: "Pułapka Poznawcza (Częsty Błąd)",
    uk: "Когнітивна Пастка (Поширена Помилка)",
    ar: "فخ معرفي (خطأ شائع)",
    ur: "علمی غلط فہمی (عام غلطی)",
    bn: "জ্ঞানীয় ফাঁদ (সাধারণ ভুল)",
    hi: "संज्ञानात्मक जाल (सामान्य त्रुटि)",
    zh: "认知陷阱 (常见错误)",
  },
  "Structured Lesson Steps": {
    es: "Pasos Estructurados de la Lección",
    fr: "Étapes Structurées de la Leçon",
    de: "Strukturierte Lektionsschritte",
    pl: "Ustrukturyzowane Kroki Lekcji",
    uk: "Структуровані Кроки Уроку",
    ar: "خطوات الدرس المنهجية",
    ur: "سبق کے منظم مراحل",
    bn: "পাঠের কাঠামোগত পদক্ষেপ",
    hi: "पाठ के संरचित चरण",
    zh: "结构化课程步骤",
  },
  "Step 1: Inquiry Hook": {
    es: "Paso 1: Pregunta Disparadora",
    fr: "Étape 1 : Accroche d'Enquête",
    de: "Schritt 1: Einführende Frage",
    pl: "Krok 1: Wprowadzenie i Pytanie",
    uk: "Крок 1: Дослідницький Гачок",
    ar: "الخطوة 1: مدخل استكشافي",
    ur: "مرحلہ 1: تحقیقی آغاز",
    bn: "ধাপ ১: অনুসন্ধানী সূচনা",
    hi: "चरण 1: अन्वेषण बिंदु",
    zh: "步骤 1: 探究引子",
  },
  "Step 2: Guided Practice & Activity": {
    es: "Paso 2: Práctica Guiada y Actividad",
    fr: "Étape 2 : Pratique Guidée et Activité",
    de: "Schritt 2: Angeleitete Übung & Aktivität",
    pl: "Krok 2: Ćwiczenia z Przewodnikiem",
    uk: "Крок 2: Керована Практика та Завдання",
    ar: "الخطوة 2: تدريب موجه ونشاط",
    ur: "مرحلہ 2: رہنمائی کے ساتھ مشق و سرگرمی",
    bn: "ধাপ ২: নির্দেশিত অনুশীলন এবং কার্যকলাপ",
    hi: "चरण 2: निर्देशित अभ्यास और गतिविधि",
    zh: "步骤 2: 引导式练习与活动",
  },
  "Step 3: Socratic Check for Understanding": {
    es: "Paso 3: Verificación Socrática de Comprensión",
    fr: "Étape 3 : Vérification Socratique de la Compréhension",
    de: "Schritt 3: Sokratische Verständnisprüfung",
    pl: "Krok 3: Sokratejskie Sprawdzenie Zrozumienia",
    uk: "Крок 3: Сократівська Перевірка Розуміння",
    ar: "الخطوة 3: فحص سقراطي للفهم",
    ur: "مرحلہ 3: تفہیم کی سقراطی جانچ",
    bn: "ধাপ ৩: বোঝার সক্রেটিক যাচাইকরণ",
    hi: "चरण 3: समझ की सुकराती जाँच",
    zh: "步骤 3: 苏格拉底式理解检查",
  },
  "Synthesized Comprehensive Lesson": {
    es: "Lección Integral Sintetizada",
    fr: "Leçon Complète Synthétisée",
    de: "Synthetisierte Umfassende Lektion",
    pl: "Zsyntetyzowana Kompleksowa Lekcja",
    uk: "Синтезований Повний Урок",
    ar: "درس شامل مُركّب",
    ur: "جامع تیار کردہ سبق",
    bn: "সমন্বিত বিস্তৃত পাঠ",
    hi: "संश्लेषित व्यापक पाठ",
    zh: "综合生成课程",
  },
  "Key Stage": {
    es: "Etapa Clave",
    fr: "Cycle Scolaire",
    de: "Schulstufe",
    pl: "Etap Edukacyjny",
    uk: "Ключовий Етап",
    ar: "المرحلة الدراسية",
    ur: "تعلیمی مرحلہ",
    bn: "মূল পর্যায়",
    hi: "मुख्य चरण",
    zh: "关键学段",
  },
  "Subject": {
    es: "Materia",
    fr: "Matière",
    de: "Fach",
    pl: "Przedmiot",
    uk: "Предмет",
    ar: "المادة",
    ur: "مضمون",
    bn: "বিষয়",
    hi: "विषय",
    zh: "科目",
    sw: "Somo",
  },
  "Unit": {
    es: "Unidad",
    fr: "Unité",
    de: "Einheit",
    pl: "Jednostka",
    uk: "Розділ",
    ar: "الوحدة",
    ur: "یونٹ",
    bn: "একক",
    hi: "इकाई",
    zh: "单元",
  },
  "Mathematics": {
    es: "Matemáticas",
    fr: "Mathématiques",
    de: "Mathematik",
    pl: "Matematyka",
    uk: "Математика",
    ar: "الرياضيات",
    ur: "ریاضی",
    bn: "গণিত",
    hi: "गणित",
    zh: "数学",
  },
  "Science": {
    es: "Ciencias",
    fr: "Sciences",
    de: "Naturwissenschaften",
    pl: "Nauki Przyrodnicze",
    uk: "Природничі Науки",
    ar: "العلوم",
    ur: "سائنس",
    bn: "বিজ্ঞান",
    hi: "विज्ञान",
    zh: "科学",
  },
  "Computing": {
    es: "Informática",
    fr: "Informatique",
    de: "Informatik",
    pl: "Informatyka",
    uk: "Інформатика",
    ar: "الحوسبة",
    ur: "کمپیوٹنگ",
    bn: "কম্পিউটিং",
    hi: "कंप्यूटिंग",
    zh: "计算机科学",
  },
  "History": {
    es: "Historia",
    fr: "Histoire",
    de: "Geschichte",
    pl: "Historia",
    uk: "Історія",
    ar: "التاريخ",
    ur: "تاریخ",
    bn: "ইতিহাস",
    hi: "इतिहास",
    zh: "历史",
  },
  "Geography": {
    es: "Geografía",
    fr: "Géographie",
    de: "Geografie",
    pl: "Geografia",
    uk: "Географія",
    ar: "الجغرافيا",
    ur: "جغرافیہ",
    bn: "ভূগোল",
    hi: "भूगोल",
    zh: "地理",
  },
  "English": {
    es: "Inglés",
    fr: "Anglais",
    de: "Englisch",
    pl: "Język Angielski",
    uk: "Англійська Мова",
    ar: "اللغة الإنجليزية",
    ur: "انگریزی",
    bn: "ইংরেজি",
    hi: "अंग्रेजी",
    zh: "英语",
  },
  "Score": {
    es: "Puntuación",
    fr: "Score",
    de: "Punktzahl",
    pl: "Wynik",
    uk: "Рахунок",
    ar: "النتيجة",
    ur: "اسکور",
    bn: "স্কোর",
    hi: "स्कोर",
    zh: "得分",
  },
  "Streak": {
    es: "Racha",
    fr: "Série",
    de: "Serie",
    pl: "Seria",
    uk: "Серія",
    ar: "التتابع",
    ur: "مسلسل اسکور",
    bn: "ধারাবাহিকতা",
    hi: "सिलसिला",
    zh: "连胜",
  },
  "Difficulty": {
    es: "Dificultad",
    fr: "Difficulté",
    de: "Schwierigkeit",
    pl: "Poziom Trudności",
    uk: "Рівень Складності",
    ar: "مستوى الصعوبة",
    ur: "مشکل کا درجہ",
    bn: "কঠিনতার স্তর",
    hi: "कठिनाई स्तर",
    zh: "难度",
  },
  "Warmup": {
    es: "Calentamiento",
    fr: "Échauffement",
    de: "Aufwärmen",
    pl: "Rozgrzewka",
    uk: "Розминка",
    ar: "إحماء",
    ur: "ابتدائی مشق",
    bn: "ওয়ার্ম-আপ",
    hi: "अभ्यास शुरुआत",
    zh: "热身",
  },
  "Challenger": {
    es: "Desafío",
    fr: "Défi",
    de: "Herausforderer",
    pl: "Wyzwanie",
    uk: "Виклик",
    ar: "المتحدي",
    ur: "چیلنجر",
    bn: "চ্যালেঞ্জার",
    hi: "चैलेंजर",
    zh: "挑战",
  },
  "Brainbuster": {
    es: "Rompecabezas",
    fr: "Casse-Tête",
    de: "Gehirnjogging",
    pl: "Łamigłówka",
    uk: "Головоломка",
    ar: "اختبار العباقرة",
    ur: "ذہنی آزمائش",
    bn: "মগজ ধোলাই",
    hi: "दिमागी कसरत",
    zh: "高难度烧脑",
  },
  "Show Original": {
    es: "Ver Original",
    fr: "Voir l'Original",
    de: "Original Anzeigen",
    pl: "Pokaż Oryginał",
    uk: "Показати Оригінал",
    ar: "عرض الأصل",
    ur: "اصل دیکھیں",
    bn: "মূল দেখুন",
    hi: "मूल देखें",
    zh: "显示原版",
  },
  "Show Translated": {
    es: "Ver Traducido",
    fr: "Voir Traduit",
    de: "Übersetzung Anzeigen",
    pl: "Pokaż Tłumaczenie",
    uk: "Показати Переклад",
    ar: "عرض المترجم",
    ur: "ترجمہ دیکھیں",
    bn: "অনূদিত দেখুন",
    hi: "अनुवादित देखें",
    zh: "显示翻译",
  },
  "Translate Portal": {
    es: "Traducir Portal",
    fr: "Traduire le Portail",
    de: "Portal Übersetzen",
    pl: "Przetłumacz Portal",
    uk: "Перекласти Портал",
    ar: "ترجمة البوابة",
    ur: "پورٹل کا ترجمہ کریں",
    bn: "পোর্টাল অনুবাদ করুন",
    hi: "पोर्टल का अनुवाद करें",
    zh: "翻译整个平台",
  },
  "Home": {
    es: "Inicio",
    fr: "Accueil",
    de: "Startseite",
    pl: "Strona Główna",
    uk: "Головна",
    ar: "الرئيسية",
    ur: "ہوم",
    bn: "হোম",
    hi: "मुख्य पृष्ठ",
    zh: "首页",
  },
  "Learning": {
    es: "Aprendizaje",
    fr: "Apprentissage",
    de: "Lernen",
    pl: "Nauka",
    uk: "Навчання",
    ar: "التعلم",
    ur: "تعلیم",
    bn: "শেখা",
    hi: "अध्ययन",
    zh: "学习",
  },
  "Curriculum Grid": {
    es: "Cuadrícula Curricular",
    fr: "Grille Pédagogique",
    de: "Lehrplanübersicht",
    pl: "Siatka Programowa",
    uk: "Сітка Навчальних Програм",
    ar: "شبكة المناهج الدراسية",
    ur: "نصاب کا گرڈ",
    bn: "পাঠ্যক্রম গ্রিড",
    hi: "पाठ्यक्रम ग्रिड",
    zh: "课程矩阵",
  },
  "Curriculum": {
    es: "Currículo",
    fr: "Programme",
    de: "Lehrplan",
    pl: "Program Nauczania",
    uk: "Навчальна Програма",
    ar: "المنهج الدراسي",
    ur: "نصاب",
    bn: "পাঠ্যক্রম",
    hi: "पाठ्यक्रम",
    zh: "课程",
  },
  "Practice Arena": {
    es: "Arena de Práctica",
    fr: "Arène d'Entraînement",
    de: "Übungsarena",
    pl: "Arena Ćwiczeń",
    uk: "Арена Практики",
    ar: "ميدان التدريب",
    ur: "مشق کا میدان",
    bn: "অনুশীলন ক্ষেত্র",
    hi: "अभ्यास क्षेत्र",
    zh: "实践竞技场",
  },
  "Daily Affirmations": {
    es: "Afirmaciones Diarias",
    fr: "Affirmations Quotidiennes",
    de: "Tägliche Affirmationen",
    pl: "Codzienne Afirmacje",
    uk: "Щоденні Афірмації",
    ar: "تأكيدات يومية",
    ur: "روزانہ کے مثبت جملے",
    bn: "দৈনিক ইতিবাচক বাণী",
    hi: "दैनिक सकारात्मक विचार",
    zh: "每日寄语",
  },
  "School News": {
    es: "Noticias Escolares",
    fr: "Actualités de l'École",
    de: "Schulnachrichten",
    pl: "Aktualności Szkolne",
    uk: "Шкільні Новини",
    ar: "أخبار المدرسة",
    ur: "اسکول کی خبریں",
    bn: "বিদ্যালয়ের সংবাদ",
    hi: "स्कूल समाचार",
    zh: "学校新闻",
  },
  "Pupil Profile": {
    es: "Perfil del Alumno",
    fr: "Profil de l'Élève",
    de: "Schülerprofil",
    pl: "Profil Ucznia",
    uk: "Профіль Учня",
    ar: "ملف الطالب",
    ur: "طالب علم کا پروفائل",
    bn: "শিক্ষার্থী প্রোফাইল",
    hi: "छात्र प्रोफाइल",
    zh: "学生档案",
  },
  "Profile": {
    es: "Perfil",
    fr: "Profil",
    de: "Profil",
    pl: "Profil",
    uk: "Профіль",
    ar: "الملف الشخصي",
    ur: "پروفائل",
    bn: "প্রোফাইল",
    hi: "प्रोफाइल",
    zh: "档案",
  },
  "Catholic Life": {
    es: "Vida Católica",
    fr: "Vie Catholique",
    de: "Katholisches Leben",
    pl: "Życie Katolickie",
    uk: "Католицьке Життя",
    ar: "الحياة الكاثوليكية",
    ur: "کیتھولک زندگی",
    bn: "ক্যাথলিক জীবন",
    hi: "कैथोलिक जीवन",
    zh: "天主教生活",
  },
  "Catholic Ethos & Prayer": {
    es: "Valores Católicos y Oración",
    fr: "Éthique Catholique & Prière",
    de: "Katholischer Ethos & Gebet",
    pl: "Etos Katolicki i Modlitwa",
    uk: "Католицький Етос та Молитва",
    ar: "القيم الكاثوليكية والصلاة",
    ur: "کیتھولک اقدار اور دعا",
    bn: "ক্যাথলিক মূল্যবোধ ও প্রার্থনা",
    hi: "कैथोलिक संस्कार और प्रार्थना",
    zh: "天主教精神与祈祷",
  },
  "Teacher Beacon": {
    es: "Baliza del Docente",
    fr: "Balise Enseignant",
    de: "Lehrer-Beacon",
    pl: "Sygnał Nauczyciela",
    uk: "Маяк Вчителя",
    ar: "منارة المعلم",
    ur: "استاد کا بیکن",
    bn: "শিক্ষক বীকন",
    hi: "शिक्षक बीकन",
    zh: "教师信标",
  },
  "Offline Storage": {
    es: "Almacenamiento Local",
    fr: "Stockage Hors-Ligne",
    de: "Offline-Speicher",
    pl: "Pamięć Offline",
    uk: "Автономне Сховище",
    ar: "التخزين دون اتصال",
    ur: "آف لائن اسٹوریج",
    bn: "অফলাইন স্টোরেজ",
    hi: "ऑफ़लाइन संग्रहण",
    zh: "离线存储",
  },
  "Data Saver": {
    es: "Ahorro de Datos",
    fr: "Économiseur de Données",
    de: "Datensparmodus",
    pl: "Oszczędzanie Danych",
    uk: "Економія Трафіку",
    ar: "توفير البيانات",
    ur: "ڈیٹا سیور",
    bn: "ডাটা সেভার",
    hi: "डेटा बचत",
    zh: "流量节省",
  },
  "Education should be free": {
    es: "La educación debe ser gratuita",
    fr: "L'éducation doit être gratuite",
    de: "Bildung sollte frei sein",
    pl: "Edukacja powinna być darmowa",
    uk: "Освіта має бути безкоштовною",
    ar: "التعليم يجب أن يكون مجانياً",
    ur: "تعلیم مفت ہونی چاہیے",
    bn: "শিক্ষা বিনামূল্যে হওয়া উচিত",
    hi: "शिक्षा निःशुल्क होनी चाहिए",
    zh: "教育应当完全免费",
  },
  "New Question": {
    es: "Nueva Pregunta",
    fr: "Nouvelle Question",
    de: "Neue Frage",
    pl: "Nowe Pytanie",
    uk: "Нове Питання",
    ar: "سؤال جديد",
    ur: "نیا سوال",
    bn: "নতুন প্রশ্ন",
    hi: "नया प्रश्न",
    zh: "新题目",
  },
  "Next Question": {
    es: "Siguiente Pregunta",
    fr: "Question Suivante",
    de: "Nächste Frage",
    pl: "Następne Pytanie",
    uk: "Наступне Питання",
    ar: "السؤال التالي",
    ur: "اگلا سوال",
    bn: "পরবর্তী প্রশ্ন",
    hi: "अगला प्रश्न",
    zh: "下一题",
  },
  "Submit Answer": {
    es: "Enviar Respuesta",
    fr: "Valider la Réponse",
    de: "Antwort Bestätigen",
    pl: "Zatwierdź Odpowiedź",
    uk: "Надіслати Відповідь",
    ar: "إرسال الإجابة",
    ur: "جواب جمع کریں",
    bn: "উত্তর জমা দিন",
    hi: "उत्तर जमा करें",
    zh: "提交答案",
  },
  "Check Answer": {
    es: "Comprobar Respuesta",
    fr: "Vérifier la Réponse",
    de: "Antwort Prüfen",
    pl: "Sprawdź Odpowiedź",
    uk: "Перевірити Відповідь",
    ar: "تحقق من الإجابة",
    ur: "جواب چیک کریں",
    bn: "উত্তর পরীক্ষা করুন",
    hi: "उत्तर जांचें",
    zh: "检查答案",
  },
  "Explanation": {
    es: "Explicación",
    fr: "Explication",
    de: "Erklärung",
    pl: "Wyjaśnienie",
    uk: "Пояснення",
    ar: "الشرح والتوضيح",
    ur: "وضاحت",
    bn: "ব্যাখ্যা",
    hi: "व्याख्या",
    zh: "解析",
  },
  "Hint": {
    es: "Pista",
    fr: "Indice",
    de: "Hinweis",
    pl: "Wskazówka",
    uk: "Підказка",
    ar: "تلميح",
    ur: "اشارہ",
    bn: "ইঙ্গিত",
    hi: "संकेत",
    zh: "提示",
  },
  "Socratic Hint": {
    es: "Pista Socrática",
    fr: "Indice Socratique",
    de: "Sokratischer Hinweis",
    pl: "Wskazówka Sokratejska",
    uk: "Сократівська Підказка",
    ar: "تلميح سقراطي",
    ur: "سقراطی اشارہ",
    bn: "সক্রেটিক ইঙ্গিত",
    hi: "सुकराती संकेत",
    zh: "苏格拉底式启发",
  },
  "Key Stage 1": {
    es: "Etapa Clave 1",
    fr: "Cycle 1",
    de: "Schulstufe 1",
    pl: "Etap Edukacyjny 1",
    uk: "Ключовий Етап 1",
    ar: "المرحلة الأولى (KS1)",
    ur: "تعلیمی مرحلہ 1",
    bn: "মূল পর্যায় ১",
    hi: "मुख्य चरण 1",
    zh: "第一学段 (KS1)",
  },
  "Key Stage 2": {
    es: "Etapa Clave 2",
    fr: "Cycle 2",
    de: "Schulstufe 2",
    pl: "Etap Edukacyjny 2",
    uk: "Ключовий Етап 2",
    ar: "المرحلة الثانية (KS2)",
    ur: "تعلیمی مرحلہ 2",
    bn: "মূল পর্যায় ২",
    hi: "मुख्य चरण 2",
    zh: "第二学段 (KS2)",
  },
  "Key Stage 3": {
    es: "Etapa Clave 3",
    fr: "Cycle 3",
    de: "Schulstufe 3",
    pl: "Etap Edukacyjny 3",
    uk: "Ключовий Етап 3",
    ar: "المرحلة الثالثة (KS3)",
    ur: "تعلیمی مرحلہ 3",
    bn: "মূল পর্যায় ৩",
    hi: "मुख्य चरण 3",
    zh: "第三学段 (KS3)",
  },
  "Key Stage 4 (GCSE)": {
    es: "Etapa Clave 4 (GCSE)",
    fr: "Cycle 4 (GCSE)",
    de: "Schulstufe 4 (GCSE)",
    pl: "Etap Edukacyjny 4 (GCSE)",
    uk: "Ключовий Етап 4 (GCSE)",
    ar: "المرحلة الرابعة (GCSE)",
    ur: "تعلیمی مرحلہ 4 (GCSE)",
    bn: "মূল পর্যায় ৪ (GCSE)",
    hi: "मुख्य चरण 4 (GCSE)",
    zh: "第四学段 (GCSE)",
  },
  "Religious Education (Catholic)": {
    es: "Educación Religiosa (Católica)",
    fr: "Éducation Religieuse (Catholique)",
    de: "Religionsunterricht (Katholisch)",
    pl: "Edukacja Religijna (Katolicka)",
    uk: "Релігійна Освіта (Католицька)",
    ar: "التربية الدينية (الكاثوليكية)",
    ur: "مذہبی تعلیم (کیتھولک)",
    bn: "ধর্মীয় শিক্ষা (ক্যাথলিক)",
    hi: "धार्मिक शिक्षा (कैथोलिक)",
    zh: "宗教教育 (天主教)",
  },
  "St Joseph's Portal": {
    es: "Portal San José",
    fr: "Portail Saint-Joseph",
    de: "St. Joseph Portal",
    pl: "Portal Św. Józefa",
    uk: "Портал Святого Йосипа",
    ar: "بوابة سانت جوزيف",
    ur: "سینٹ جوزف پورٹل",
    bn: "সেন্ট জোসেফ পোর্টাল",
    hi: "सेंट जोसेफ पोर्टल",
    zh: "圣约瑟夫平台",
    sw: "Tovuti ya San Joseph",
  },
  "Practice Arena & Neural Lab": {
    es: "Arena de Práctica y Laboratorio Neuronal",
    fr: "Arène de Pratique et Labo Neuronal",
    de: "Übungsarena & Neuronales Labor",
    pl: "Arena Ćwiczeń i Laboratorium Neuronowe",
    uk: "Арена Практики та Нейронна Лабораторія",
    ar: "ساحة التدريب والمختبر العصبي",
    ur: "مشق کا میدان اور نیورل لیب",
    bn: "অনুশীলন ক্ষেত্র ও নিউরাল ল্যাব",
    hi: "अभ्यास क्षेत्र और न्यूरल लैब",
    zh: "实践竞技场与神经实验室",
    sw: "Uwanja wa Mazoezi na Maabara ya Neural",
  },
  "Interactive curriculum drills, adaptive question mastery, and on-device Socratic guidance.": {
    es: "Ejercicios curriculares interactivos, dominio adaptativo de preguntas y guía socrática en el dispositivo.",
    fr: "Exercices interactifs, maîtrise adaptative des questions et guidage socratique sur l'appareil.",
    de: "Interaktive Lehrplanübungen, adaptive Fragenbeherrschung und sokratische Anleitung auf dem Gerät.",
    pl: "Interaktywne ćwiczenia programowe, adaptacyjne opanowanie pytań i sokratejskie przewodnictwo na urządzeniu.",
    uk: "Інтерактивні вправи, адаптивне засвоєння питань та сократичне керівництво на пристрої.",
    ar: "تدريبات تفاعلية للمناهج، إتقان تكيفي للأسئلة، وتوجيه سقراطي على الجهاز.",
    ur: "انٹرایکٹو نصابی مشقیں، موافقت پذیر سوالات کی مہارت، اور ڈیوائس پر سقراطی رہنمائی۔",
    bn: "ইন্টারেক্টিভ পাঠ্যক্রম ড্রিল, অভিযোজিত প্রশ্ন দক্ষতা এবং ডিভাইসে সোক্রেটিক গাইডেন্স।",
    hi: "इंटरैक्टिव पाठ्यक्रम अभ्यास, अनुकूली प्रश्न निपुणता, और ऑन-डिवाइस सुकराती मार्गदर्शन।",
    zh: "互动式课程训练、自适应题目掌握以及端侧苏格拉底式辅导。",
    sw: "Mazoezi shirikishi ya mtaala, umilisi wa maswali yanayobadilika, na mwongozo wa Kisokrasi kwenye kifaa.",
  },
  "Universal Translator": {
    es: "Traductor Universal",
    fr: "Traducteur Universel",
    de: "Universal-Übersetzer",
    pl: "Uniwersalny Tłumacz",
    uk: "Універсальний Перекладач",
    ar: "المترجم الشامل",
    ur: "عالمگیر مترجم",
    bn: "সার্বজনীন অনুবাদক",
    hi: "सार्वभौमिक अनुवादक",
    zh: "通用翻译器",
    sw: "Mfasiri wa Ulimwengu",
  },
  "English Original": {
    es: "Original en Inglés",
    fr: "Original en Anglais",
    de: "Englisches Original",
    pl: "Oryginał Angielski",
    uk: "Англійський Оригінал",
    ar: "الأصل الإنجليزي",
    ur: "انگریزی اصل",
    bn: "ইংরেজি মূল",
    hi: "अंग्रेजी मूल",
    zh: "英文原版",
    sw: "Asili ya Kiingereza",
  },
  "Translate to:": {
    es: "Traducir a:",
    fr: "Traduire en :",
    de: "Übersetzen nach:",
    pl: "Przetłumacz na:",
    uk: "Перекласти на:",
    ar: "ترجمة إلى:",
    ur: "ترجمہ کریں:",
    bn: "অনুবাদ করুন:",
    hi: "में अनुवाद करें:",
    zh: "翻译为：",
    sw: "Tafsiri kwa:",
  },
  "Read Page": {
    es: "Leer Página",
    fr: "Lire la Page",
    de: "Seite Vorlesen",
    pl: "Przeczytaj Stronę",
    uk: "Прочитати Сторінку",
    ar: "قراءة الصفحة",
    ur: "صفحہ پڑھیں",
    bn: "পৃষ্ঠা পড়ুন",
    hi: "पृष्ठ पढ़ें",
    zh: "朗读页面",
    sw: "Soma Ukurasa",
  },
  "Dual-Language": {
    es: "Modo Bilingüe",
    fr: "Bilingue",
    de: "Zweisprachig",
    pl: "Dwujęzyczny",
    uk: "Двомовний",
    ar: "ثنائي اللغة",
    ur: "دو لسانی",
    bn: "দ্বিভাষিক",
    hi: "द्विभाषी",
    zh: "双语对照",
    sw: "Lugha Mbili",
  },
  "Teacher Mode": {
    es: "Modo Profesor",
    fr: "Mode Enseignant",
    de: "Lehrermodus",
    pl: "Tryb Nauczyciela",
    uk: "Режим Вчителя",
    ar: "وضع المعلم",
    ur: "استاد موڈ",
    bn: "শিক্ষক মোড",
    hi: "शिक्षक मोड",
    zh: "教师模式",
    sw: "Hali ya Mwalimu",
  },
  "Mind Space": {
    es: "Espacio Mental",
    fr: "Espace Mental",
    de: "Gedankenraum",
    pl: "Przestrzeń Myśli",
    uk: "Простір Думок",
    ar: "فضاء الفكر",
    ur: "ذہنی فضا",
    bn: "মাইন্ড স্পেস",
    hi: "माइंड स्पेस",
    zh: "思维空间",
    sw: "Nafasi ya Fikra",
  },
  "Challenge Level:": {
    es: "Nivel de Desafío:",
    fr: "Niveau de Défi :",
    de: "Herausforderungsstufe:",
    pl: "Poziom Wyzwania:",
    uk: "Рівень Виклику:",
    ar: "مستوى التحدي:",
    ur: "چیلنج کی سطح:",
    bn: "চ্যালেঞ্জ স্তর:",
    hi: "चुनौती स्तर:",
    zh: "挑战难度：",
    sw: "Kiwango cha Changamoto:",
  },
  "Warm-Up": {
    es: "Calentamiento",
    fr: "Échauffement",
    de: "Aufwärmen",
    pl: "Rozgrzewka",
    uk: "Розминка",
    ar: "إحماء",
    ur: "ابتدائی مشق",
    bn: "ওয়ার্ম-আপ",
    hi: "अभ्यास शुरुआत",
    zh: "热身",
    sw: "Kupasha Joto",
  },
  "Brain Buster": {
    es: "Rompecabezas",
    fr: "Casse-Tête",
    de: "Gehirnjogging",
    pl: "Łamigłówka",
    uk: "Головоломка",
    ar: "اختبار العباقرة",
    ur: "ذہنی آزمائش",
    bn: "মগজ ধোলাই",
    hi: "दिमागी कसरत",
    zh: "高难度烧脑",
    sw: "Kupasua Kichwa",
  },
  "Real-world problems and clever distractors": {
    es: "Problemas del mundo real y distractores inteligentes",
    fr: "Problèmes du monde réel et pièges astucieux",
    de: "Reale Aufgaben und clevere Distraktoren",
    pl: "Zadania z życia i sprytne dystraktory",
    uk: "Реальні задачі та розумні пастки",
    ar: "مشكلات واقعية ومشتتات ذكية",
    ur: "حقیقی دنیا کے مسائل اور ذہین متبادلات",
    bn: "বাস্তব জীবনের সমস্যা ও কৌশলী বিভ্রান্তি",
    hi: "वास्तविक दुनिया की समस्याएं और चतुर विकल्प",
    zh: "真实生活情景问题与巧妙的干扰项",
    sw: "Matatizo ya ulimwengu halisi na mitego janja",
  },
  "Download Report": {
    es: "Descargar Informe",
    fr: "Télécharger le Rapport",
    de: "Bericht Herunterladen",
    pl: "Pobierz Raport",
    uk: "Завантажити Звіт",
    ar: "تنزيل التقرير",
    ur: "رپورٹ ڈاؤن لوڈ کریں",
    bn: "প্রতিবেদন ডাউনলোড করুন",
    hi: "रिपोर्ट डाउनलोड करें",
    zh: "下载报告",
    sw: "Pakua Ripoti",
  },
  "Generating...": {
    es: "Generando...",
    fr: "Génération...",
    de: "Wird generiert...",
    pl: "Generowanie...",
    uk: "Генерація...",
    ar: "جارٍ الإنشاء...",
    ur: "تخلیق ہو رہا ہے...",
    bn: "তৈরি হচ্ছে...",
    hi: "तैयार हो रहा है...",
    zh: "正在生成...",
    sw: "Inazalisha...",
  },
  "Ready": {
    es: "Listo",
    fr: "Prêt",
    de: "Bereit",
    pl: "Gotowy",
    uk: "Готово",
    ar: "جاهز",
    ur: "تیار",
    bn: "প্রস্তুত",
    hi: "तैयार",
    zh: "准备就绪",
    sw: "Tayari",
  },
  "Stage": {
    es: "Etapa",
    fr: "Cycle",
    de: "Stufe",
    pl: "Etap",
    uk: "Етап",
    ar: "المرحلة",
    ur: "مرحلہ",
    bn: "পর্যায়",
    hi: "चरण",
    zh: "学段",
    sw: "Hatua",
  },
  "Lesson": {
    es: "Lección",
    fr: "Leçon",
    de: "Lektion",
    pl: "Lekcja",
    uk: "Урок",
    ar: "الدرس",
    ur: "سبق",
    bn: "পাঠ",
    hi: "पाठ",
    zh: "课程",
    sw: "Somo Ndogo",
  },
  "Fractions and Decimals": {
    es: "Fracciones y Decimales",
    fr: "Fractions et Décimales",
    de: "Brüche und Dezimalzahlen",
    pl: "Ułamki i Liczby Dziesiętne",
    uk: "Дроби та Десяткові Числа",
    ar: "الكسور والأعداد العشرية",
    ur: "کسور اور اعشاریہ",
    bn: "ভগ্নাংশ এবং দশমিক",
    hi: "भिन्न और दशमलव",
    zh: "分数与小数",
    sw: "Sehemu na Desimali",
  },
  "Seasonal Changes": {
    es: "Cambios Estacionales",
    fr: "Changements Saisonniers",
    de: "Jahreszeitenwechsel",
    pl: "Zmiany Pór Roku",
    uk: "Сезонні Зміни",
    ar: "التغيرات الموسمية",
    ur: "موسمی تبدیلیاں",
    bn: "ঋতুগত পরিবর্তন",
    hi: "मौसमी परिवर्तन",
    zh: "季节变化",
    sw: "Mabadiliko ya Majira",
  },
  "States of Matter": {
    es: "Estados de la Materia",
    fr: "États de la Matière",
    de: "Aggregatzustände",
    pl: "Stany Skupienia Materii",
    uk: "Агрегатні Стани Речовини",
    ar: "حالات المادة",
    ur: "مادے کی حالتیں",
    bn: "পদার্থের অবস্থা",
    hi: "पदार्थ की अवस्थाएं",
    zh: "物质的状态",
    sw: "Hali za Maada",
  },
  "Animals and Humans": {
    es: "Animales y Humanos",
    fr: "Animaux et Humains",
    de: "Tiere und Menschen",
    pl: "Zwierzęta i Ludzie",
    uk: "Тварини та Люди",
    ar: "الحيوانات والبشر",
    ur: "جانور اور انسان",
    bn: "প্রাণী এবং মানুষ",
    hi: "जानवर और इंसान",
    zh: "动物与人类",
    sw: "Wanyama na Binadamu",
  },
};

// Developing-World & Global South UI Dictionary (merged into UNIVERSAL_UI_LEXICON)
const DEVELOPING_WORLD_UI_LEXICON: Record<string, Record<string, string>> = {
  "Home": {
    sw: "Nyumbani", yo: "Ilé", ig: "Ụlọ", ha: "Gida", ak: "Fie", zu: "Ikhaya", am: "መነሻ",
    so: "Bogga Hore", rw: "Ahabanza", sn: "Kumba", ny: "Kunyumbako", om: "Fuula Duraa", lg: "Awaka",
    hi: "होम", bn: "হোম", ur: "ہوم", ta: "முகப்பு", te: "హోమ్", mr: "मुख्यपृष्ठ", pa: "ਮੁੱਖ ਪੰਨਾ", gu: "હોમ", ne: "गृहपृष्ठ", si: "මුල් පිටුව",
    tl: "Tahanan", id: "Beranda", ms: "Utama", vi: "Trang chủ", my: "ပင်မစာမျက်နှာ", km: "ទំព័រដើម", zh: "首页",
    ar: "الرئيسية", fa: "خانه", ps: "کورپاڼه", ht: "Akèy", es: "Inicio", pt: "Início", fr: "Accueil",
    de: "Startseite", pl: "Strona główna", uk: "Головна", it: "Home", tr: "Ana Sayfa", la: "Domus",
  },
  "Learning Zone": {
    sw: "Eneo la Kujifunza", yo: "Agbègbè Ẹ̀kọ́", ig: "Ebe Mmụta", ha: "Yankin Koyo", ak: "Adesua Bea", zu: "Indawo Yokufunda", am: "የትምህርት ክፍል",
    so: "Goobta Waxbarashada", rw: "Ahantu ho Kwiga", sn: "Nzvimbo Yekudzidza", ny: "Malo Ophunzirira",
    hi: "लर्निंग ज़ोन", bn: "শেখার অঞ্চল", ur: "سیکھنے کا زون", ta: "கற்றல் பகுதி", te: "అభ్యాస ప్రాంతం", mr: "शिक्षण क्षेत्र", ne: "सिकाइ क्षेत्र",
    tl: "Sona ng Pagkatuto", id: "Zona Belajar", ms: "Zon Pembelajaran", vi: "Khu Học Tập", zh: "学习区",
    ar: "منطقة التعلم", fa: "بخش یادگیری", ps: "د زده کړې برخه", ht: "Zòn Aprantisaj", es: "Zona de Aprendizaje", pt: "Zona de Aprendizagem", fr: "Espace d'Apprentissage",
    de: "Lernbereich", pl: "Strefa Nauki", uk: "Зона Навчання", it: "Area di Apprendimento", tr: "Öğrenme Alanı", la: "Zona Discendi",
  },
  "Practice Lab": {
    sw: "Maabara ya Mazoezi", yo: "Yàrá Ìdánwò", ig: "Ụlọ Nnwale", ha: "Dakin Gwaji", ak: "Nsɔhwɛ Dan", zu: "Ilebhu Yokuzilolonga", am: "የልምምድ ላብራቶሪ",
    so: "Shaybaarka Tababarka", rw: "Laboratwari y'Imyitozo", sn: "Imba Yekudzidzira", ny: "Malo Oyesera",
    hi: "अभ्यास प्रयोगशाला", bn: "অনুশীলন ল্যাব", ur: "مشق لیب", ta: "பயிற்சி ஆய்வகம்", te: "అభ్యాస ప్రయోగశాల", mr: "सराव प्रयोगशाळा", ne: "अभ्यास प्रयोगशाला",
    tl: "Laboratoryo ng Pagsasanay", id: "Lab Latihan", ms: "Makmal Latihan", vi: "Phòng Thực Hành", zh: "练习实验室",
    ar: "مختبر التدريب", fa: "آزمایشگاه تمرین", ps: "د تمرین لابراتوار", ht: "Laboratwa Pratik", es: "Laboratorio de Práctica", pt: "Laboratório de Prática", fr: "Laboratoire d'Exercices",
    de: "Übungslabor", pl: "Laboratorium Ćwiczeń", uk: "Лабораторія Практики", it: "Laboratorio di Pratica", tr: "Uygulama Laboratuvarı", la: "Officina Exercitationis",
  },
  "Interactive Labs": {
    sw: "Maabara za Maingiliano", yo: "Yàrá Ìbáṣepọ̀", ig: "Ụlọ Nnwale Mmekọrịta", ha: "Dakunan Gwaji", ak: "Nyansahu Dan", zu: "Amalebhu Asebenzisanayo", am: "በይነተገናኝ ላብራቶሪዎች",
    so: "Shaybaarada Isdhexgalka", rw: "Laboratwari Zikora", sn: "Marabhoritari", ny: "Zoyesera",
    hi: "इंटरैक्टिव लैब्स", bn: "ইন্টারেক্টিভ ল্যাব", ur: "انٹرایکٹو لیبز", ta: "ஊடாடும் ஆய்வகங்கள்", te: "ఇంటరాక్టివ్ ల్యాబ్స్", mr: "संवादात्मक प्रयोगशाळा", ne: "अन्तरक्रियात्मक प्रयोगशाला",
    tl: "Mga Interaktibong Lab", id: "Lab Interaktif", ms: "Makmal Interaktif", vi: "Phòng Thí Nghiệm Tương Tác", zh: "互动实验室",
    ar: "المختبرات التفاعلية", fa: "آزمایشگاه‌های تعاملی", ps: "متقابل لابراتوارونه", ht: "Laboratwa Entèaktif", es: "Laboratorios Interactivos", pt: "Laboratórios Interativos", fr: "Laboratoires Interactifs",
    de: "Interaktive Labore", pl: "Interaktywne Laboratoria", uk: "Інтерактивні Лабораторії", it: "Laboratori Interattivi", tr: "Etkileşimli Laboratuvarlar", la: "Officinae Interactivae",
  },
  "Teaching & Curriculum": {
    sw: "Ufundishaji na Mtaala", yo: "Ìkọ́ni àti Ètò Ẹ̀kọ́", ig: "Nkuzi na Usoro Mmụta", ha: "Koyarwa da Manhaja", ak: "Nkyerɛkyerɛ ne Adesua", zu: "Ukufundisa Nekharikhulamu", am: "ማስተማር እና ሥርዓተ ትምህርት",
    so: "Baridda & Manhajka", rw: "Kwigisha n'Integanyanyigisho",
    hi: "शिक्षण और पाठ्यक्रम", bn: "শিক্ষাদান ও পাঠ্যক্রম", ur: "تدریس اور نصاب", ta: "கற்பித்தல் மற்றும் பாடத்திட்டம்", te: "బోధన & పాఠ్యప్రణాళిక", mr: "शिक्षण आणि अभ्यासक्रम", ne: "शिक्षण र पाठ्यक्रम",
    tl: "Pagtuturo at Kurikulum", id: "Pengajaran & Kurikulum", ms: "Pengajaran & Kurikulum", vi: "Giảng Dạy & Chương Trình", zh: "教学与课程",
    ar: "التدريس والمنهج", fa: "آموزش و برنامه درسی", ps: "تدریس او نصاب", ht: "Ansèyman ak Kourikoulòm", es: "Enseñanza y Currículo", pt: "Ensino e Currículo", fr: "Enseignement et Programme",
    de: "Unterricht & Lehrplan", pl: "Nauczanie i Program", uk: "Навчання та Програма", la: "Doctrina et Curriculum",
  },
  "Catholic Sanctuary": {
    sw: "Patakatifu pa Kikatoliki", yo: "Ibi Mímọ́ Kátólíìkì", ig: "Ebe Nsọ Katọlik", ha: "Wurin Ibada na Katolika", zu: "Indawo Engcwele YamaKhatholika", am: "የካቶሊክ መቅደስ",
    hi: "कैथोलिक अभयारण्य", bn: "ক্যাথলিক উপাসনালয়", ur: "کیتھولک مقدس مقام", ta: "கத்தோலிக்க திருத்தலம்",
    tl: "Santuwaryong Katoliko", id: "Ruang Suci Katolik", vi: "Thánh Đường Công Giáo", zh: "天主教圣所",
    ar: "الحرم الكاثوليكي", fa: "مقدس‌سرای کاتولیک", ht: "Sanktyè Katolik", es: "Santuario Católico", pt: "Santuário Católico", fr: "Sanctuaire Catholique",
    de: "Katholisches Heiligtum", pl: "Sanktuarium Katolickie", uk: "Католицька Святиня", la: "Sanctuarium Catholicum",
  },
  "Overseas Curriculums": {
    sw: "Mitaala ya Kimataifa", yo: "Ètò Ẹ̀kọ́ Àgbáyé", ig: "Usoro Mmụta Mba Ọzọ", ha: "Manhajar Ƙasashen Waje", ak: "Amanɔne Adesua Nhyehyɛe", zu: "Amakharikhulamu Aphesheya", am: "ዓለም አቀፍ ሥርዓተ ትምህርት",
    so: "Manhajyada Caalamiga ah", rw: "Integanyanyigisho Mpuzamahanga",
    hi: "अंतर्राष्ट्रीय पाठ्यक्रम", bn: "আন্তর্জাতিক পাঠ্যক্রম", ur: "بین الاقوامی نصاب", ta: "பன்னாட்டுப் பாடத்திட்டங்கள்", te: "అంతర్జాతీయ పాఠ్యప్రణాళికలు", mr: "आंतरराष्ट्रीय अभ्यासक्रम", ne: "अन्तर्राष्ट्रिय पाठ्यक्रम",
    tl: "Mga Kurikulum sa Ibang Bansa", id: "Kurikulum Internasional", ms: "Kurikulum Antarabangsa", vi: "Chương Trình Quốc Tế", zh: "国际课程",
    ar: "المناهج الدولية", fa: "برنامه‌های درسی بین‌المللی", ps: "نړیوال نصابونه", ht: "Kourikoulòm Entènasyonal", es: "Currículos Internacionales", pt: "Currículos Internacionais", fr: "Programmes Internationaux",
    de: "Internationale Lehrpläne", pl: "Programy Międzynarodowe", uk: "Міжнародні Програми", la: "Curricula Extera",
  },
  "Settings": {
    sw: "Mipangilio", yo: "Àwọn Ètò", ig: "Ntọala", ha: "Saituna", ak: "Nhyehyɛe", zu: "Izilungiselelo", am: "ቅንብሮች",
    so: "Dejinta", rw: "Igenamiterere", sn: "Zvirongwa", ny: "Zokonda",
    hi: "सेटिंग्स", bn: "সেটিংস", ur: "ترتیبات", ta: "அமைப்புகள்", te: "సెట్టింగ్‌లు", mr: "सेटिंग्ज", pa: "ਸੈਟਿੰਗਾਂ", gu: "સેટિંગ્સ", ne: "सेटिङहरू", si: "සැකසුම්",
    tl: "Mga Setting", id: "Pengaturan", ms: "Tetapan", vi: "Cài đặt", my: "ဆက်တင်များ", km: "ការកំណត់", zh: "设置",
    ar: "الإعدادات", fa: "تنظیمات", ps: "تنظیمات", ht: "Paramèt", es: "Configuración", pt: "Configurações", fr: "Paramètres",
    de: "Einstellungen", pl: "Ustawienia", uk: "Налаштування", it: "Impostazioni", tr: "Ayarlar", la: "Optiones",
  },
  "Save Offline": {
    sw: "Hifadhi Nje ya Mtandao", yo: "Fipamọ́ láìsí Íńtánẹ́ẹ̀tì", ig: "Chekwaa na-enweghị Ịntanetị", ha: "Ajiye Ba Tare da Intanet ba", ak: "Sie Wɔ Intanɛt Akyi", zu: "Londoloza Ungaxhunyiwe", am: "ከመስመር ውጭ አስቀምጥ",
    so: "Kaydi Offline", rw: "Bika Udafite Interineti",
    hi: "ऑफ़लाइन सहेजें", bn: "অফলাইনে সংরক্ষণ করুন", ur: "آف لائن محفوظ کریں", ta: "ஆஃப்லைனில் சேமி", te: "ఆఫ్‌లైన్‌లో సేవ్ చేయండి", mr: "ऑफलाइन जतन करा", ne: "अफलाइन सुरक्षित गर्नुहोस्",
    tl: "I-save nang Offline", id: "Simpan Offline", ms: "Simpan Luar Talian", vi: "Lưu Ngoại Tuyến", zh: "离线保存",
    ar: "حفظ دون إنترنت", fa: "ذخیره آفلاین", ps: "آفلاین خوندي کړئ", ht: "Anrejistre San Entènèt", es: "Guardar sin conexión", pt: "Salvar Offline", fr: "Enregistrer hors ligne",
    de: "Offline speichern", pl: "Zapisz offline", uk: "Зберегти офлайн", la: "Serva Sine Rete",
  },
  "Data Saver": {
    sw: "Kiokoa Data", yo: "Olùpamọ́ Dátà", ig: "Nchekwa Data", ha: "Adana Bayanai", ak: "Data Korafo", zu: "Isilondolozi Sedatha", am: "ዳታ ቆጣቢ",
    so: "Kaydiyaha Xogta", rw: "Kuzigama Interineti",
    hi: "डेटा सेवर", bn: "ডেটা সেভার", ur: "ڈیٹا سیور", ta: "டேட்டா சேவர்", te: "డేటా సేవర్", mr: "डेटा सेव्हर", ne: "डाटा बचत",
    tl: "Tipid sa Data", id: "Hemat Data", ms: "Penjimat Data", vi: "Tiết kiệm dữ liệu", zh: "省流模式",
    ar: "توفير البيانات", fa: "صرفه‌جویی داده", ps: "د معلوماتو سپما", ht: "Ekonomize Done", es: "Ahorro de datos", pt: "Economia de Dados", fr: "Économiseur de données",
    de: "Datensparmodus", pl: "Oszczędzanie danych", uk: "Економія трафіку", la: "Parcimonia Datorum",
  },
  "News": {
    sw: "Habari", yo: "Ìròyìn", ig: "Akụkọ", ha: "Labarai", ak: "Kaseɛbɔ", zu: "Izindaba", am: "ዜና",
    so: "Wararka", rw: "Amakuru",
    hi: "समाचार", bn: "সংবাদ", ur: "خبریں", ta: "செய்திகள்", te: "వార్తలు", mr: "बातम्या", ne: "समाचार",
    tl: "Balita", id: "Berita", ms: "Berita", vi: "Tin tức", zh: "新闻",
    ar: "الأخبار", fa: "اخبار", ps: "خبرونه", ht: "Nouvèl", es: "Noticias", pt: "Notícias", fr: "Actualités",
    de: "Neuigkeiten", pl: "Aktualności", uk: "Новини", it: "Notizie", tr: "Haberler", la: "Nuntii",
  },
  "Educator": {
    sw: "Mwalimu", yo: "Olùkọ́", ig: "Onye Nkuzi", ha: "Malami", ak: "Ɔkyerɛkyerɛfo", zu: "Uthisha", am: "አስተማሪ",
    so: "Macallin", rw: "Umwarimu",
    hi: "शिक्षक", bn: "শিক্ষক", ur: "معلم", ta: "ஆசிரியர்", te: "ఉపాధ్యాయుడు", mr: "शिक्षक", ne: "शिक्षक",
    tl: "Guro", id: "Pendidik", ms: "Pendidik", vi: "Giáo viên", zh: "教师",
    ar: "المعلم", fa: "آموزگار", ps: "ښوونکی", ht: "Edikatè", es: "Docente", pt: "Educador", fr: "Enseignant",
    de: "Lehrkraft", pl: "Nauczyciel", uk: "Вчитель", la: "Magister",
  },
  "Education should be free": {
    sw: "Elimu inapaswa kuwa bure", yo: "Ẹ̀kọ́ yẹ kí ó jẹ́ ọ̀fẹ́", ig: "Agụmakwụkwọ kwesịrị ịbụ n'efu", ha: "Ilimi ya kamata ya zama kyauta", ak: "Adesua sɛ sɛ ɛyɛ kwa", zu: "Imfundo kufanele ibe mahhala", am: "ትምህርት ነፃ መሆን አለበት",
    so: "Waxbarashadu waa inay noqoto bilaash", rw: "Uburezi bukwiye kuba ubuntu",
    hi: "शिक्षा निःशुल्क होनी चाहिए", bn: "শিক্ষা বিনামূল্যে হওয়া উচিত", ur: "تعلیم مفت ہونی چاہیے", ta: "கல்வி இலவசமாக இருக்க வேண்டும்", te: "విద్య ఉచితంగా ఉండాలి", mr: "शिक्षण मोफत असावे", ne: "शिक्षा निःशुल्क हुनुपर्छ",
    tl: "Ang edukasyon ay dapat libre", id: "Pendidikan harus gratis", ms: "Pendidikan harus percuma", vi: "Giáo dục phải miễn phí", zh: "教育应当免费",
    ar: "يجب أن يكون التعليم مجانياً", fa: "آموزش باید رایگان باشد", ps: "زده کړه باید وړیا وي", ht: "Edikasyon ta dwe gratis", es: "La educación debe ser gratuita", pt: "A educação deve ser gratuita", fr: "L'éducation doit être gratuite",
    de: "Bildung sollte kostenlos sein", pl: "Edukacja powinna być bezpłatna", uk: "Освіта має бути безкоштовною", la: "Educatio gratuita esse debet",
  },
  "Science": {
    sw: "Sayansi", yo: "Sáyẹ́ǹsì", ig: "Sayensị", ha: "Kimiyya", ak: "Abɔdeɛ Mu Nyansapɛ", zu: "Isayensi", am: "ሳይንስ",
    so: "Sayniska", rw: "Siyansi",
    hi: "विज्ञान", bn: "বিজ্ঞান", ur: "سائنس", ta: "அறிவியல்", te: "విజ్ఞాన శాస్త్రం", mr: "विज्ञान", ne: "विज्ञान",
    tl: "Agham", id: "Sains", ms: "Sains", vi: "Khoa học", zh: "科学",
    ar: "العلوم", fa: "علوم", ps: "ساینس", ht: "Syans", es: "Ciencias", pt: "Ciências", fr: "Sciences",
    de: "Naturwissenschaften", pl: "Nauki ścisłe", uk: "Природознавство", la: "Scientia",
  },
  "Mathematics": {
    sw: "Hisabati", yo: "Ìṣirò", ig: "Mgbakọ na Mwepụ", ha: "Lissafi", ak: "Akontaabu", zu: "Izibalo", am: "ሒሳብ",
    so: "Xisaabta", rw: "Imibare",
    hi: "गणित", bn: "গণিত", ur: "ریاضی", ta: "கணிதம்", te: "గణితం", mr: "गणित", ne: "गणित",
    tl: "Matematika", id: "Matematika", ms: "Matematik", vi: "Toán học", zh: "数学",
    ar: "الرياضيات", fa: "ریاضیات", ps: "ریاضي", ht: "Matematik", es: "Matemáticas", pt: "Matemática", fr: "Mathématiques",
    de: "Mathematik", pl: "Matematyka", uk: "Математика", la: "Mathematica",
  },
  "History": {
    sw: "Historia", yo: "Ìtàn", ig: "Akụkọ Ihe Mere Eme", ha: "Tarihi", ak: "Abakɔsɛm", zu: "Umlando", am: "ታሪክ",
    so: "Taariikhda", rw: "Amateka",
    hi: "इतिहास", bn: "ইतिहास", ur: "تاریخ", ta: "வரலாறு", te: "చరిత్ర", mr: "इतिहास", ne: "इतिहास",
    tl: "Kasaysayan", id: "Sejarah", ms: "Sejarah", vi: "Lịch sử", zh: "历史",
    ar: "التاريخ", fa: "تاریخ", ps: "تاریخ", ht: "Istwa", es: "Historia", pt: "História", fr: "Histoire",
    de: "Geschichte", pl: "Historia", uk: "Історія", la: "Historia",
  },
  "Geography": {
    sw: "Jiografia", yo: "Jọ́gíráfì", ig: "Ọdịdị Ala", ha: "Labarin Ƙasa", ak: "Asase Ho Adesua", zu: "IJografi", am: "ጂኦግራፊ",
    so: "Juqraafi", rw: "Ubumenyi bw'Isi",
    hi: "भूगोल", bn: "ভূগোল", ur: "جغرافیہ", ta: "புவியியல்", te: "భూగోళశాస్త్రం", mr: "भूगोल", ne: "भूगोल",
    tl: "Heograpiya", id: "Geografi", ms: "Geografi", vi: "Địa lý", zh: "地理",
    ar: "الجغرافيا", fa: "جغرافیا", ps: "جغرافیه", ht: "Jewografi", es: "Geografía", pt: "Geografia", fr: "Géographie",
    de: "Geografie", pl: "Geografia", uk: "Географія", la: "Geographia",
  },
  "Lessons & Units": {
    sw: "Masomo na Mada", yo: "Àwọn Ẹ̀kọ́", ig: "Ihe Ọmụmụ", ha: "Darussa da Sashe", ak: "Adesua Afa", zu: "Izifundo", am: "ትምህርቶች እና ምዕራፎች",
    hi: "पाठ और इकाइयाँ", bn: "পাঠ ও অধ্যায়", ur: "اسباق اور یونٹس", ta: "பாடங்கள் மற்றும் அலகுகள்",
    tl: "Mga Aralin at Yunit", id: "Pelajaran & Unit", ms: "Pelajaran & Unit", vi: "Bài học & Chủ đề", zh: "课程与单元",
    ar: "الدروس والوحدات", fa: "درس‌ها و بخش‌ها", ht: "Leson ak Inite", es: "Lecciones y Unidades", pt: "Lições e Unidades", fr: "Leçons et Unités",
    de: "Lektionen & Einheiten", pl: "Lekcje i Działy", uk: "Уроки та Розділи", la: "Lectiones et Unitates",
  },
};

for (const [phrase, translations] of Object.entries(DEVELOPING_WORLD_UI_LEXICON)) {
  UNIVERSAL_UI_LEXICON[phrase] = {
    ...(UNIVERSAL_UI_LEXICON[phrase] || {}),
    ...translations,
  };
}

// Elements to strictly ignore during DOM tree traversal
const IGNORED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'CODE',
  'PRE',
  'TEXTAREA',
  'SELECT',
  'OPTION',
  'OPTGROUP',
  'INPUT',
  'SVG',
  'NOSCRIPT',
  'IFRAME',
]);

let isUniversalTranslationRunning = false;
let pendingTargetLang: string | null = null;
let universalObserver: MutationObserver | null = null;
let currentActiveTargetLang = 'en';

/**
 * Checks if an element or its ancestor has opted out of translation
 */
function isExcludedFromTranslation(node: Node): boolean {
  let parent = node.parentElement;
  while (parent) {
    if (
      IGNORED_TAGS.has(parent.tagName) ||
      parent.classList.contains('notranslate') ||
      parent.getAttribute('translate') === 'no' ||
      parent.hasAttribute('data-no-translate') ||
      parent.id === 'universal-translator-bar' ||
      parent.id === 'stj-universal-translator-bar' ||
      parent.id === 'stj-lang-select' ||
      parent.id === 'setting-lang' ||
      parent.id === 'neural-worker-guest-vm' ||
      parent.classList.contains('katex') ||
      parent.classList.contains('math-formula')
    ) {
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
}

/**
 * Looks up direct lexicon match with trimmed case-insensitivity and symbol/emoji extraction
 */
function getLexiconTranslation(text: string, targetLang: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // 1. Direct exact match in UNIVERSAL_UI_LEXICON
  if (UNIVERSAL_UI_LEXICON[trimmed] && UNIVERSAL_UI_LEXICON[trimmed][targetLang]) {
    return UNIVERSAL_UI_LEXICON[trimmed][targetLang];
  }

  // 2. Direct exact or lower match in OFFLINE_LEXICON
  const lower = trimmed.toLowerCase();
  if (OFFLINE_LEXICON[lower] && OFFLINE_LEXICON[lower][targetLang]) {
    return OFFLINE_LEXICON[lower][targetLang];
  }

  // 3. Direct case-insensitive match in UNIVERSAL_UI_LEXICON
  for (const [key, mapping] of Object.entries(UNIVERSAL_UI_LEXICON)) {
    if (key.toLowerCase() === lower && mapping[targetLang]) {
      return mapping[targetLang];
    }
  }

  // 4. Leading/Trailing Emoji or Symbol extraction (e.g. "🏠 Home" -> "🏠 Inicio", "📖 Learning" -> "📖 Aprendizaje")
  const symbolPrefixMatch = trimmed.match(/^([^\p{L}\p{N}]*\s*)([\p{L}\p{N}].*?)(\s*[^\p{L}\p{N}]*)$/u);
  if (symbolPrefixMatch) {
    const [, prefix, core, suffix] = symbolPrefixMatch;
    const coreTrimmed = core.trim();
    if (coreTrimmed) {
      if (UNIVERSAL_UI_LEXICON[coreTrimmed]?.[targetLang]) {
        return `${prefix}${UNIVERSAL_UI_LEXICON[coreTrimmed][targetLang]}${suffix}`;
      }
      const coreLower = coreTrimmed.toLowerCase();
      if (OFFLINE_LEXICON[coreLower]?.[targetLang]) {
        return `${prefix}${OFFLINE_LEXICON[coreLower][targetLang]}${suffix}`;
      }
      for (const [key, mapping] of Object.entries(UNIVERSAL_UI_LEXICON)) {
        if (key.toLowerCase() === coreLower && mapping[targetLang]) {
          return `${prefix}${mapping[targetLang]}${suffix}`;
        }
      }
    }
  }

  return null;
}

/**
 * Universal DOM Translator: walks through visible text nodes across the entire page DOM
 * (body, header, navigation, and viewport), stores the original English string,
 * and replaces it with the translated version.
 */
export async function translatePageDOM(targetLang: string): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  currentActiveTargetLang = targetLang;

  // Apply Direction & HTML attributes (covers Arabic, Urdu, Persian/Dari, Pashto)
  const isRTL = isRtlLanguage(targetLang);
  document.documentElement.lang = targetLang;
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

  // If returning to English, restore all nodes from the WeakMap
  if (!targetLang || targetLang === 'en') {
    restorePageDOM();
    return;
  }

  if (isUniversalTranslationRunning) {
    pendingTargetLang = targetLang;
    return;
  }
  isUniversalTranslationRunning = true;

  try {
    const rootScope = document.body;
    const walker = document.createTreeWalker(
      rootScope,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (isExcludedFromTranslation(node)) {
            return NodeFilter.FILTER_REJECT;
          }
          const val = node.nodeValue?.trim();
          // Filter out empty spaces, numbers only, or single punctuation
          if (!val || /^[0-9\s.,!?:;()[\]{}<>=+\-*\/%&|^~$#@]+$/.test(val)) {
            return NodeFilter.FILTER_SKIP;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const textNodesToTranslate: Text[] = [];
    let currentNode: Node | null = walker.nextNode();
    while (currentNode) {
      textNodesToTranslate.push(currentNode as Text);
      currentNode = walker.nextNode();
    }

    // Process nodes in fast chunks to avoid UI stutter
    const batchSize = 40;
    for (let i = 0; i < textNodesToTranslate.length; i += batchSize) {
      const batch = textNodesToTranslate.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (textNode) => {
          try {
            if (!textNode.parentElement) return;

            // Save original English text if not already saved
            if (!ORIGINAL_TEXT_NODES.has(textNode)) {
              ORIGINAL_TEXT_NODES.set(textNode, textNode.nodeValue || '');
            }

            const originalText = ORIGINAL_TEXT_NODES.get(textNode) || textNode.nodeValue || '';
            const trimmed = originalText.trim();
            if (!trimmed || trimmed.length < 2) return;

            // Check if already translated to this language
            const existing = TRANSLATED_TEXT_NODES.get(textNode);
            if (existing && existing.lang === targetLang) {
              return;
            }

            // 1. Instant dictionary lookup
            const dictMatch = getLexiconTranslation(trimmed, targetLang);
            if (dictMatch) {
              const leadingSpace = originalText.match(/^\s*/)?.[0] || '';
              const trailingSpace = originalText.match(/\s*$/)?.[0] || '';
              textNode.nodeValue = `${leadingSpace}${dictMatch}${trailingSpace}`;
              TRANSLATED_TEXT_NODES.set(textNode, { lang: targetLang, text: dictMatch });
              return;
            }

            // 2. Multi-tier translation (only for compact phrases to avoid blocking network limits)
            if (trimmed.length < 120) {
              const translated = await translateText(trimmed, targetLang, 'en');
              if (translated && translated !== trimmed) {
                const leadingSpace = originalText.match(/^\s*/)?.[0] || '';
                const trailingSpace = originalText.match(/\s*$/)?.[0] || '';
                textNode.nodeValue = `${leadingSpace}${translated}${trailingSpace}`;
                TRANSLATED_TEXT_NODES.set(textNode, { lang: targetLang, text: translated });
              }
            }
          } catch {
            // Keep original text
          }
        })
      );
    }
  } catch (err) {
    console.warn('[Universal Translator Error]:', err);
  } finally {
    isUniversalTranslationRunning = false;
    if (pendingTargetLang && pendingTargetLang !== currentActiveTargetLang) {
      const nextLang = pendingTargetLang;
      pendingTargetLang = null;
      translatePageDOM(nextLang);
    }
  }
}

/**
 * Restores all text nodes across the entire page back to their original English text.
 */
export function restorePageDOM(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  document.documentElement.lang = 'en';
  document.documentElement.dir = 'ltr';
  currentActiveTargetLang = 'en';

  const rootScope = document.body;
  const walker = document.createTreeWalker(
    rootScope,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        return ORIGINAL_TEXT_NODES.has(node as Text)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    }
  );

  let currentNode: Node | null = walker.nextNode();
  while (currentNode) {
    const textNode = currentNode as Text;
    const original = ORIGINAL_TEXT_NODES.get(textNode);
    if (original !== undefined) {
      textNode.nodeValue = original;
    }
    currentNode = walker.nextNode();
  }
}

/**
 * Starts a persistent MutationObserver on document.body so dynamically mounted elements,
 * navigation changes, and modals are automatically translated in real-time.
 */
export function enableUniversalObserver(targetLang: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (universalObserver) {
    universalObserver.disconnect();
    universalObserver = null;
  }

  if (!targetLang || targetLang === 'en') return;

  const targetContainer = document.body;
  let debounceTimer: any = null;
  universalObserver = new MutationObserver((mutations) => {
    // Only trigger if new element child nodes were added to avoid loops on text value replacements
    const hasAddedElements = mutations.some(
      (m) =>
        m.addedNodes &&
        Array.from(m.addedNodes).some((n) => {
          if (n.nodeType !== Node.ELEMENT_NODE) return false;
          const el = n as HTMLElement;
          return (
            el.id !== 'universal-translator-bar' &&
            el.id !== 'stj-universal-translator-bar' &&
            !el.closest('#stj-universal-translator-bar')
          );
        })
    );
    if (!hasAddedElements) return;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      translatePageDOM(targetLang);
    }, 250);
  });

  universalObserver.observe(targetContainer, {
    childList: true,
    subtree: true,
  });
}

/**
 * Read the main content of the current active page aloud in the selected language.
 */
export function speakCurrentPage(targetLang: string): void {
  if (typeof window === 'undefined') return;

  const main = document.querySelector('main') || document.body;
  const headings = Array.from(main.querySelectorAll('h1, h2, h3, p'))
    .slice(0, 6)
    .map((el) => el.textContent?.trim() || '')
    .filter((txt) => txt.length > 5)
    .join('. ');

  if (headings) {
    speakInLanguage(headings, targetLang);
  }
}
