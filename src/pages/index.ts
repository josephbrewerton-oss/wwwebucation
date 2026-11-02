import { FEATURED_LESSONS } from '../data/homeCurriculum';

const cardsHtml = FEATURED_LESSONS.map(lesson => `
  <div class="lesson-card">
    <span class="badge">${lesson.stage} · ${lesson.subject}</span>
    <h3>${lesson.title}</h3>
    <p>${lesson.description}</p>
    <a href="${base}player.html?preset=${lesson.preset}">Teach Me</a>
  </div>
`).join('');
