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
  { id: 'simulators', path: 'player', label: 'AST Vector Simulators', icon: '🎮', description: '60 FPS interactive physics & STEM apparatus' },
  { id: 'lessons', path: 'learning-zone', label: 'Lessons & Units', icon: '📖', description: 'Oak National Curriculum syllabus' },
  { id: 'constellation', path: 'learning-zone?tab=constellation', label: 'Concept Constellation', icon: '✨', description: 'Interactive visual topic knowledge graph' },
  { id: 'practice-lab', path: 'practice-lab', label: 'Practice Lab Drills', icon: '⚡', description: 'Diagnostic questions & misconception coaching' },
  { id: 'languages', path: 'languages', label: 'Languages & MFL', icon: '🌍', description: 'Polyglot verb wheels & pronunciation' },
  { id: 'phonics', path: 'phonics', label: 'EYFS / KS1 Phonics', icon: '🔤', description: 'Sound mats & synthetic phonics drills' },
  { id: 'shakespeare', path: 'shakespeare', label: 'Shakespeare Theatre', icon: '🎭', description: 'Interactive drama & textual analysis' },
];

export const SCHOOL_GOVERNANCE_ITEMS: NavRouteItem[] = [
  { id: 'teacher-beacon', path: 'teacher-beacon', label: 'Teacher Beacon', icon: '📡', description: 'Classroom mesh broadcast console' },
  { id: 'curriculum-studio', path: 'curriculum-studio', label: 'Curriculum Studio', icon: '🛠️', description: 'Authoring & S-Expression tooling' },
  { id: 'licensing', path: 'licensing', label: 'Licensing & MAT SLA', icon: '⚖️', description: 'Dual-license charter & commercial MAT covenant' },
  { id: 'privacy', path: 'privacy', label: 'Edge Privacy Guard', icon: '🛡️', description: 'UK GDPR Art. 25 zero-cloud data guarantees' },
  { id: 'child-safety', path: 'child-safety', label: 'Child Safety & KCSIE', icon: '🔒', description: 'Statutory safeguarding compliance' },
  { id: 'settings', path: 'settings', label: 'System Settings', icon: '⚙️', description: 'Sensory preferences & accessibility controls' },
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
