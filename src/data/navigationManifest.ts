// src/data/navigationManifest.ts
/**
 * Canonical Navigation & Site Hierarchy Manifest
 * Single point of truth driving the persistent navbar, dropdowns, mobile drawer, and footer.
 */

export interface NavRouteItem {
  id: string;
  path: string;
  label: string;
  icon: string;
  description?: string;
  badge?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: string;
  color?: string;
  items: NavRouteItem[];
}

export const CATHOLIC_SANCTUARY_ITEMS: NavRouteItem[] = [
  { id: 'catholic-overview', path: 'catholic-life', label: 'Sanctuary Overview', icon: '📖', description: 'Faith formation & liturgical life' },
  { id: 'altar-anatomy', path: 'catholic-life?tab=altar-anatomy', label: 'High Altar Explorer', icon: '🕯️', description: '3D exploration of sacred altar objects' },
  { id: 'church-tour', path: 'catholic-life?tab=church-tour', label: 'Church 3D Tour', icon: '🏛️', description: 'Interactive walkthrough of Catholic sanctuary' },
  { id: 'latin-prayers', path: 'catholic-life?tab=latin-prayers', label: 'Latin Mass Prayers', icon: '🇻🇦', description: 'Ecclesiastical pronunciation & chants' },
  { id: 'mass-order', path: 'catholic-life?tab=mass', label: 'The Holy Mass', icon: '🍞', description: 'Step-by-step liturgy guide' },
  { id: 'first-communion', path: 'first-communion', label: 'First Holy Communion', icon: '🕊️', description: 'Sacramental preparation pathway' },
];

export const CURRICULUM_LAB_ITEMS: NavRouteItem[] = [
  { id: 'simulators', path: 'player', label: 'Interactive Labs & Models', icon: '🎮', description: 'Hands-on physics, chemistry, maths & faith models' },
  { id: 'lessons', path: 'learning-zone', label: 'Lessons & Units', icon: '📖', description: 'Oak National Curriculum syllabus' },
  { id: 'constellation', path: 'learning-zone?tab=constellation', label: 'Topic Map', icon: '✨', description: 'Visual map linking school subjects and topics' },
  { id: 'practice-lab', path: 'practice-lab', label: 'Practice Lab Drills', icon: '⚡', description: 'Diagnostic questions & misconception coaching' },
  { id: 'revision', path: 'revision', label: 'GCSE Exam & Flashcards', icon: '📝', description: 'AQA, Edexcel & OCR mark schemes, flashcards & spelling' },
  { id: 'languages', path: 'languages', label: 'Languages & MFL', icon: '🌍', description: 'Polyglot verb wheels & pronunciation' },
  { id: 'phonics', path: 'phonics', label: 'EYFS / KS1 Phonics', icon: '🔤', description: 'Sound mats & synthetic phonics drills' },
  { id: 'shakespeare', path: 'shakespeare', label: 'Shakespeare Theatre', icon: '🎭', description: 'Interactive drama & textual analysis' },
  { id: 'upgrade-swf', path: 'player?import=swf', label: 'Upgrade Legacy Flash (.swf)', icon: '⚡', description: 'Convert retired .swf resources into open pure-SVG .ast offline cartridges' },
  { id: 'overseas-curriculums', path: 'curriculum-studio?tab=overseas', label: 'Overseas Curriculums', icon: '🌍', description: 'Import Kenya, India, Ghana, Philippines, CSV & JSON syllabi' },
];

export const SCHOOL_GOVERNANCE_ITEMS: NavRouteItem[] = [
  { id: 'teacher-beacon', path: 'teacher-beacon', label: 'Classroom Beacon', icon: '📡', description: 'Share live class activities across pupil screens' },
  { id: 'curriculum-studio', path: 'curriculum-studio', label: 'Curriculum & Author Studio', icon: '🛠️', description: 'Import overseas syllabi (CSV/JSON) & package .astb labs' },
  { id: 'licensing', path: 'licensing', label: 'School Licensing & Terms', icon: '⚖️', description: 'Free school charter & trust SLA' },
  { id: 'privacy', path: 'privacy', label: 'Pupil Privacy (Zero Cloud)', icon: '🛡️', description: 'UK GDPR Art. 25 on-device privacy guarantees' },
  { id: 'child-safety', path: 'child-safety', label: 'Child Safety & KCSIE', icon: '🔒', description: 'Statutory safeguarding compliance' },
  { id: 'settings', path: 'settings', label: 'Accessibility & Settings', icon: '⚙️', description: 'Sensory preferences & accessibility controls' },
];

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'catholic',
    label: 'Catholic Sanctuary',
    icon: '✝️',
    color: '#ca8a04',
    items: CATHOLIC_SANCTUARY_ITEMS,
  },
  {
    id: 'curriculum',
    label: 'Teaching & Labs',
    icon: '📚',
    color: '#0284c7',
    items: CURRICULUM_LAB_ITEMS,
  },
  {
    id: 'school',
    label: 'School & Governance',
    icon: '🛡️',
    color: '#10b981',
    items: SCHOOL_GOVERNANCE_ITEMS,
  },
];
