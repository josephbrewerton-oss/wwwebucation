[{stage:`Year 3`,subject:`Mathematics`,title:`Unit Fractions & Finding Parts of a Set`,description:`Cut pizzas and chocolate bars into equal shares: 1/2, 1/3, 1/4, and 1/8.`,preset:`fractions`},{stage:`Year 3`,subject:`Catholic RE`,title:`The Liturgy of the Eucharist & Real Presence`,description:`Master the Mass parts, liturgical colours, and spiritual preparation.`,preset:`catholic-life`}].map(e=>`
  <div class="lesson-card">
    <span class="badge">${e.stage} · ${e.subject}</span>
    <h3>${e.title}</h3>
    <p>${e.description}</p>
    <a href="${base}player.html?preset=${e.preset}">Teach Me</a>
  </div>
`).join(``);