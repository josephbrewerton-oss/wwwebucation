export interface LessonCard {
  stage: string;
  subject: string;
  title: string;
  description: string;
  preset: string;
}

export const FEATURED_LESSONS: LessonCard[] = [
  {
    stage: 'Year 3',
    subject: 'Mathematics',
    title: 'Unit Fractions & Finding Parts of a Set',
    description: 'Cut pizzas and chocolate bars into equal shares: 1/2, 1/3, 1/4, and 1/8.',
    preset: 'fractions',
  },
  {
    stage: 'Year 3',
    subject: 'Catholic RE',
    title: 'The Liturgy of the Eucharist & Real Presence',
    description: 'Master the Mass parts, liturgical colours, and spiritual preparation.',
    preset: 'catholic-life',
  },
  // Adding or editing a lesson never touches HTML
];
