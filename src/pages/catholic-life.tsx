import {
  LITURGY_STEPS,
  SEVEN_SACRAMENTS,
  CST_PRINCIPLES,
  SCHOOL_VIRTUES,
  CATHOLIC_PRAYERS,
  LITURGICAL_SEASONS,
} from '../data/catholic';

const ROSARY_MYSTERIES = {
  Joyful: {
    days: 'Mondays & Saturdays',
    mysteries: [
      { num: 1, title: 'The Annunciation', scripture: 'Luke 1:26-38', fruit: 'Humility', desc: 'The Archangel Gabriel announces to Mary that she will conceive the Son of God.' },
      { num: 2, title: 'The Visitation', scripture: 'Luke 1:39-56', fruit: 'Love of Neighbour', desc: 'Mary visits her cousin Elizabeth who is pregnant with John the Baptist.' },
      { num: 3, title: 'The Nativity', scripture: 'Luke 2:1-20', fruit: 'Poverty of Spirit', desc: 'Jesus is born in a manger in Bethlehem amidst angels and shepherds.' },
      { num: 4, title: 'The Presentation in the Temple', scripture: 'Luke 2:22-38', fruit: 'Obedience & Purity', desc: 'Mary and Joseph present the infant Jesus to the Lord in the Temple.' },
      { num: 5, title: 'The Finding in the Temple', scripture: 'Luke 2:41-52', fruit: 'Joy in Finding Jesus', desc: 'After three days searching, Mary and Joseph find the 12-year-old Jesus teaching in the Temple.' }
    ]
  },
  Luminous: {
    days: 'Thursdays',
    mysteries: [
      { num: 1, title: 'The Baptism in the Jordan', scripture: 'Matthew 3:13-17', fruit: 'Openness to the Holy Spirit', desc: 'The heavens open and the Father proclaims Jesus His beloved Son.' },
      { num: 2, title: 'The Wedding at Cana', scripture: 'John 2:1-12', fruit: 'To Jesus through Mary', desc: 'At Mary\'s request, Jesus performs His first public miracle turning water into wine.' },
      { num: 3, title: 'The Proclamation of the Kingdom', scripture: 'Mark 1:14-15', fruit: 'Repentance & Trust', desc: 'Jesus calls all people to repent and believe in the Gospel.' },
      { num: 4, title: 'The Transfiguration', scripture: 'Luke 9:28-36', fruit: 'Desire for Holiness', desc: 'Jesus is transfigured in radiant glory on Mount Tabor before Peter, James, and John.' },
      { num: 5, title: 'The Institution of the Eucharist', scripture: 'Matthew 26:26-30', fruit: 'Eucharistic Adoration', desc: 'At the Last Supper, Jesus offers His Body and Blood under the signs of bread and wine.' }
    ]
  },
  Sorrowful: {
    days: 'Tuesdays & Fridays',
    mysteries: [
      { num: 1, title: 'The Agony in the Garden', scripture: 'Luke 22:39-46', fruit: 'Sorrow for Sin', desc: 'Jesus prays with bloody sweat in Gethsemane, submitting to the Father\'s will.' },
      { num: 2, title: 'The Scourging at the Pillar', scripture: 'Matthew 27:26', fruit: 'Mortification & Purity', desc: 'Pilate commands Jesus to be scourged before the soldiers.' },
      { num: 3, title: 'The Crowning with Thorns', scripture: 'Matthew 27:27-31', fruit: 'Moral Courage', desc: 'Soldiers mock Jesus with a crown of sharp thorns and a reed sceptre.' },
      { num: 4, title: 'The Carrying of the Cross', scripture: 'Luke 23:26-32', fruit: 'Patience in Suffering', desc: 'Jesus carries the heavy Cross through Jerusalem along the Via Dolorosa to Calvary.' },
      { num: 5, title: 'The Crucifixion and Death', scripture: 'Luke 23:33-46', fruit: 'Forgiveness & Salvation', desc: 'Jesus forgives His executioners and offers His life upon the Cross for the salvation of the world.' }
    ]
  },
  Glorious: {
    days: 'Wednesdays & Sundays',
    mysteries: [
      { num: 1, title: 'The Resurrection', scripture: 'Mark 16:1-8', fruit: 'Faith & Eternal Life', desc: 'Jesus rises victoriously from the tomb on Easter morning, conquering death forever.' },
      { num: 2, title: 'The Ascension into Heaven', scripture: 'Acts 1:9-11', fruit: 'Hope & Yearning for Heaven', desc: 'Forty days after Easter, Jesus ascends into heaven to sit at the right hand of the Father.' },
      { num: 3, title: 'The Descent of the Holy Spirit', scripture: 'Acts 2:1-4', fruit: 'Wisdom & Evangelization', desc: 'On Pentecost, the Holy Spirit descends like fire upon Mary and the Apostles.' },
      { num: 4, title: 'The Assumption of Mary', scripture: 'Revelation 12:1', fruit: 'Devotion to Our Lady', desc: 'At the end of her earthly life, Mary is taken up body and soul into heavenly glory.' },
      { num: 5, title: 'The Coronation of Mary', scripture: 'Luke 1:48-49', fruit: 'Grace & Perseverance', desc: 'Mary is crowned Queen of Heaven and Earth by her divine Son Jesus Christ.' }
    ]
  }
};

export function renderCatholicLifePage(): HTMLElement {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  const container = document.createElement('div');
  container.className = 'catholic-life-sanctuary-stage';
  container.style.cssText = 'max-width: 1200px; margin: 0 auto; padding: 2rem 1rem 4rem;';

  let currentTab: 'overview' | 'mass' | 'sacraments' | 'rosary' | 'cst' | 'tour' = 'overview';
  let activeRosaryCycle: 'Joyful' | 'Luminous' | 'Sorrowful' | 'Glorious' = 'Joyful';

  function renderHeader(): string {
    return `
      <!-- Catholic Life Header Banner -->
      <section style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e293b 100%); border-radius: 16px; border: 1.5px solid #ca8a04; padding: 2.25rem 2rem; color: #ffffff; margin-bottom: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:0.75rem;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.6rem;">⛪</span>
            <span style="font-size:0.8rem; font-weight:800; color:#fde047; text-transform:uppercase; letter-spacing:0.06em;">
              St Joseph's Catholic Sanctuary &bull; All Key Stages
            </span>
          </div>
          <span style="font-size:0.76rem; background:rgba(250, 204, 21, 0.15); color:#fde047; border:1px solid rgba(250, 204, 21, 0.35); padding:3px 10px; border-radius:999px; font-weight:700;">
            Ad Majorem Dei Gloriam (AMDG)
          </span>
        </div>

        <h1 style="font-size:2.2rem; font-weight:800; margin:0 0 0.75rem 0; color:#ffffff; letter-spacing:-0.02em;">
          Catholic Life, Liturgy &amp; Faith Sanctuary
        </h1>
        <p style="font-size:1.05rem; color:#cbd5e1; max-width:840px; margin:0 0 1.5rem 0; line-height:1.6;">
          Explore the living heartbeat of our Catholic faith: the Holy Mass step-by-step, the Seven Sacraments, the Holy Rosary, and Catholic Social Teaching (CST) in accordance with the Curriculum Directory.
        </p>

        <!-- Navigation Tabs Bar -->
        <div style="display:flex; gap:8px; flex-wrap:wrap;" id="catholic-nav-tabs">
          <button type="button" class="sanctuary-tab-btn" data-tab="overview" style="padding:8px 16px; border-radius:8px; font-weight:700; font-size:0.85rem; cursor:pointer; border:none; background:${currentTab === 'overview' ? '#facc15' : '#334155'}; color:${currentTab === 'overview' ? '#0f172a' : '#ffffff'};">
            📖 Sanctuary Overview
          </button>
          <button type="button" class="sanctuary-tab-btn" data-tab="mass" style="padding:8px 16px; border-radius:8px; font-weight:700; font-size:0.85rem; cursor:pointer; border:none; background:${currentTab === 'mass' ? '#facc15' : '#334155'}; color:${currentTab === 'mass' ? '#0f172a' : '#ffffff'};">
            🍞 The Holy Mass
          </button>
          <button type="button" class="sanctuary-tab-btn" data-tab="sacraments" style="padding:8px 16px; border-radius:8px; font-weight:700; font-size:0.85rem; cursor:pointer; border:none; background:${currentTab === 'sacraments' ? '#facc15' : '#334155'}; color:${currentTab === 'sacraments' ? '#0f172a' : '#ffffff'};">
            🕊️ 7 Sacraments
          </button>
          <button type="button" class="sanctuary-tab-btn" data-tab="rosary" style="padding:8px 16px; border-radius:8px; font-weight:700; font-size:0.85rem; cursor:pointer; border:none; background:${currentTab === 'rosary' ? '#facc15' : '#334155'}; color:${currentTab === 'rosary' ? '#0f172a' : '#ffffff'};">
            📿 The Holy Rosary
          </button>
          <button type="button" class="sanctuary-tab-btn" data-tab="cst" style="padding:8px 16px; border-radius:8px; font-weight:700; font-size:0.85rem; cursor:pointer; border:none; background:${currentTab === 'cst' ? '#facc15' : '#334155'}; color:${currentTab === 'cst' ? '#0f172a' : '#ffffff'};">
            🌱 Catholic Social Teaching (CST)
          </button>
          <button type="button" class="sanctuary-tab-btn" data-tab="tour" style="padding:8px 16px; border-radius:8px; font-weight:700; font-size:0.85rem; cursor:pointer; border:none; background:${currentTab === 'tour' ? '#facc15' : '#334155'}; color:${currentTab === 'tour' ? '#0f172a' : '#ffffff'};">
            ⛪ Interactive Church Sim
          </button>
        </div>
      </section>
    `;
  }

  function renderOverview(): string {
    return `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem; margin-bottom:2.5rem;">
        <!-- Mass Card -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.5rem; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <div style="font-size:1.8rem; margin-bottom:0.5rem;">🍞</div>
          <h3 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">1. The Holy Mass Walkthrough</h3>
          <p style="font-size:0.85rem; color:#64748b; margin:0 0 12px 0; line-height:1.5;">
            Step-by-step liturgical exploration of the Introductory Rites, Liturgy of the Word, Liturgy of the Eucharist, and Concluding Rites with real postures and responses.
          </p>
          <button type="button" class="view-tab-direct" data-target="mass" style="padding:6px 14px; border-radius:6px; background:#0284c7; color:#fff; border:none; font-weight:700; font-size:0.8rem; cursor:pointer;">
            Explore The Mass &rarr;
          </button>
        </div>

        <!-- Sacraments Card -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.5rem; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <div style="font-size:1.8rem; margin-bottom:0.5rem;">🕊️</div>
          <h3 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">2. The Seven Sacraments</h3>
          <p style="font-size:0.85rem; color:#64748b; margin:0 0 12px 0; line-height:1.5;">
            Sacraments of Christian Initiation (Baptism, Confirmation, Eucharist), Healing (Reconciliation, Anointing), and Service of Communion (Holy Orders, Matrimony).
          </p>
          <button type="button" class="view-tab-direct" data-target="sacraments" style="padding:6px 14px; border-radius:6px; background:#0284c7; color:#fff; border:none; font-weight:700; font-size:0.8rem; cursor:pointer;">
            Explore Sacraments &rarr;
          </button>
        </div>

        <!-- Rosary Card -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.5rem; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <div style="font-size:1.8rem; margin-bottom:0.5rem;">📿</div>
          <h3 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">3. The Holy Rosary Walk</h3>
          <p style="font-size:0.85rem; color:#64748b; margin:0 0 12px 0; line-height:1.5;">
            Contemplate the mysteries of Christ through Mary’s eyes: the Joyful, Luminous, Sorrowful, and Glorious mysteries with scripture and daily devotion guide.
          </p>
          <button type="button" class="view-tab-direct" data-target="rosary" style="padding:6px 14px; border-radius:6px; background:#0284c7; color:#fff; border:none; font-weight:700; font-size:0.8rem; cursor:pointer;">
            Pray The Rosary &rarr;
          </button>
        </div>

        <!-- CST Card -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.5rem; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <div style="font-size:1.8rem; margin-bottom:0.5rem;">🌱</div>
          <h3 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">4. Catholic Social Teaching (CST)</h3>
          <p style="font-size:0.85rem; color:#64748b; margin:0 0 12px 0; line-height:1.5;">
            Human dignity, the common good, solidarity, care for God’s creation (Laudato Si’), and preferential option for the poor, lived daily through St Joseph’s virtues.
          </p>
          <button type="button" class="view-tab-direct" data-target="cst" style="padding:6px 14px; border-radius:6px; background:#0284c7; color:#fff; border:none; font-weight:700; font-size:0.8rem; cursor:pointer;">
            Discover CST &rarr;
          </button>
        </div>
      </div>

      <!-- Foundational Prayers Spotlight -->
      <section style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:1.75rem; margin-bottom:2.5rem;">
        <h3 style="font-size:1.25rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0; display:flex; align-items:center; gap:8px;">
          <span>🙏</span> Foundational Prayers for Pupils &amp; First Holy Communion
        </h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1rem;">
          ${CATHOLIC_PRAYERS.map(p => `
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:1.2rem;">
              <strong style="color:#0369a1; font-size:0.95rem; display:block; margin-bottom:4px;">${p.title}</strong>
              <span style="font-size:0.75rem; color:#ca8a04; font-weight:700; display:block; margin-bottom:8px;">${p.occasion}</span>
              <p style="font-size:0.85rem; color:#334155; line-height:1.5; margin:0; font-style:italic;">"${p.text}"</p>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderMass(): string {
    const parts = ['Introductory Rites', 'Liturgy of the Word', 'Liturgy of the Eucharist', 'Concluding Rites'];
    return `
      <section style="margin-bottom:3rem;">
        <div style="margin-bottom:1.5rem;">
          <h2 style="font-size:1.6rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">The Order of the Mass: Step-by-Step</h2>
          <p style="font-size:0.95rem; color:#64748b; margin:0;">
            The Holy Sacrifice of the Mass is the source and summit of Christian life (CCC 1324). Follow each stage in chronological order.
          </p>
        </div>

        <div style="display:flex; flex-direction:column; gap:1.5rem;">
          ${parts.map((partName, idx) => {
            const stepsInPart = LITURGY_STEPS.filter(s => s.part === partName);
            return `
              <div style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:14px; padding:1.5rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid #f1f5f9;">
                  <span style="font-size:0.8rem; font-weight:800; padding:3px 10px; border-radius:999px; background:#0284c7; color:#fff;">
                    Part ${idx + 1}
                  </span>
                  <h3 style="font-size:1.2rem; font-weight:800; color:#0f172a; margin:0;">${partName}</h3>
                </div>

                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
                  ${stepsInPart.map(step => `
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1rem;">
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <strong style="color:#0f172a; font-size:0.92rem;">${step.title}</strong>
                        ${step.catechismRef ? `<span style="font-size:0.7rem; color:#0284c7; font-weight:700;">${step.catechismRef}</span>` : ''}
                      </div>
                      <p style="font-size:0.82rem; color:#475569; margin:0 0 8px 0; line-height:1.4;">${step.mystery}</p>
                      <div style="font-size:0.76rem; background:#eff6ff; color:#1e40af; padding:6px 8px; border-radius:6px; margin-bottom:6px;">
                        <strong>Posture &amp; Gesture:</strong> ${step.gesture}
                      </div>
                      ${step.dialogue ? `
                        <div style="font-size:0.74rem; background:#f0fdf4; color:#166534; padding:6px 8px; border-radius:6px;">
                          <div><strong>Priest:</strong> "${step.dialogue.priest}"</div>
                          <div style="margin-top:2px;"><strong>People:</strong> "${step.dialogue.response}"</div>
                        </div>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  function renderSacraments(): string {
    return `
      <section style="margin-bottom:3rem;">
        <div style="margin-bottom:1.5rem;">
          <h2 style="font-size:1.6rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">The Seven Sacraments of the Church</h2>
          <p style="font-size:0.95rem; color:#64748b; margin:0;">
            Instituted by Christ and entrusted to the Church to dispense divine life through visible signs that impart grace (CCC 1113–1134).
          </p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:1.25rem;">
          ${SEVEN_SACRAMENTS.map(sac => `
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.4rem; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:1.5rem;">${sac.icon}</span>
                  <div>
                    <h3 style="font-size:1.1rem; font-weight:800; color:#0f172a; margin:0;">${sac.name}</h3>
                    <span style="font-size:0.75rem; color:#64748b; font-style:italic;">${sac.latinName}</span>
                  </div>
                </div>
                <span style="font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:999px; background:${sac.category === 'Initiation' ? '#dbeafe' : sac.category === 'Healing' ? '#fef3c7' : '#fce7f3'}; color:${sac.category === 'Initiation' ? '#1e40af' : sac.category === 'Healing' ? '#92400e' : '#9d174d'};">
                  ${sac.category}
                </span>
              </div>

              <p style="font-size:0.85rem; color:#334155; line-height:1.5; margin:0 0 10px 0;">${sac.summary}</p>
              
              <div style="font-size:0.78rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 10px; margin-bottom:8px; line-height:1.4;">
                <div style="color:#0284c7; font-weight:700; margin-bottom:2px;">Biblical Foundation:</div>
                <div style="color:#475569;">${sac.biblicalAnchor}</div>
              </div>

              <div style="font-size:0.76rem; color:#475569; display:flex; flex-direction:column; gap:3px;">
                <div><strong>Essential Matter:</strong> ${sac.matterAndForm.matter}</div>
                <div><strong>Sacramental Form:</strong> "${sac.matterAndForm.form}"</div>
                <div><strong>Ordinary Minister:</strong> ${sac.minister}</div>
                <div><strong>Grace / Effect:</strong> ${sac.effect}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderRosary(): string {
    const cycleData = ROSARY_MYSTERIES[activeRosaryCycle];
    return `
      <section style="margin-bottom:3rem;">
        <div style="margin-bottom:1.5rem;">
          <h2 style="font-size:1.6rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">The Holy Rosary of the Blessed Virgin Mary</h2>
          <p style="font-size:0.95rem; color:#64748b; margin:0 0 1rem 0;">
            A scriptural prayer meditating on the life, death, and resurrection of Jesus Christ through the loving heart of His Mother.
          </p>

          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${(['Joyful', 'Luminous', 'Sorrowful', 'Glorious'] as const).map(c => `
              <button type="button" class="rosary-cycle-btn" data-cycle="${c}" style="padding:6px 14px; border-radius:8px; font-weight:700; font-size:0.84rem; cursor:pointer; border:1px solid ${c === activeRosaryCycle ? '#0284c7' : '#cbd5e1'}; background:${c === activeRosaryCycle ? '#0284c7' : '#ffffff'}; color:${c === activeRosaryCycle ? '#ffffff' : '#334155'};">
                ${c} Mysteries
              </button>
            `).join('')}
          </div>
        </div>

        <div style="background:#f8fafc; border:1.5px solid #0284c7; border-radius:14px; padding:1.5rem; margin-bottom:1.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:8px;">
            <h3 style="font-size:1.25rem; font-weight:800; color:#0369a1; margin:0;">
              The ${activeRosaryCycle} Mysteries
            </h3>
            <span style="font-size:0.78rem; background:#e0f2fe; color:#0369a1; padding:3px 10px; border-radius:999px; font-weight:700;">
              Traditionally prayed on: ${cycleData.days}
            </span>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
            ${cycleData.mysteries.map(m => `
              <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:1.2rem; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <span style="font-size:0.75rem; font-weight:800; background:#fef3c7; color:#92400e; padding:1px 7px; border-radius:4px;">
                    Decade ${m.num}
                  </span>
                  <span style="font-size:0.75rem; color:#64748b; font-weight:600;">${m.scripture}</span>
                </div>
                <strong style="font-size:1rem; color:#0f172a; display:block; margin-bottom:4px;">${m.title}</strong>
                <p style="font-size:0.82rem; color:#475569; margin:0 0 8px 0; line-height:1.4;">${m.desc}</p>
                <div style="font-size:0.75rem; color:#15803d; font-weight:700;">
                  Spiritual Fruit: ${m.fruit}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderCST(): string {
    return `
      <section style="margin-bottom:3rem;">
        <div style="margin-bottom:1.5rem;">
          <h2 style="font-size:1.6rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">Catholic Social Teaching (CST) &amp; School Virtues</h2>
          <p style="font-size:0.95rem; color:#64748b; margin:0;">
            Putting the Gospel into action: love for God mirrored in love, justice, and solidarity for all humanity and creation.
          </p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:1.25rem; margin-bottom:2.5rem;">
          ${CST_PRINCIPLES.map(cst => `
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.4rem; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                <span style="font-size:1.5rem;">${cst.icon}</span>
                <div>
                  <h3 style="font-size:1.05rem; font-weight:800; color:#0f172a; margin:0;">${cst.title}</h3>
                  <span style="font-size:0.74rem; color:#0284c7; font-weight:600;">${cst.childTitle}</span>
                </div>
              </div>
              <p style="font-size:0.84rem; color:#475569; line-height:1.5; margin:0 0 10px 0;">${cst.summary}</p>
              
              <div style="font-size:0.76rem; background:#fffbeb; color:#92400e; padding:6px 8px; border-radius:6px; margin-bottom:6px;">
                <strong>Scripture Anchor:</strong> ${cst.scripture}
              </div>
              <div style="font-size:0.76rem; background:#ecfdf5; color:#065f46; padding:6px 8px; border-radius:6px;">
                <strong>In Our School:</strong> ${cst.schoolAction}
              </div>
            </div>
          `).join('')}
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem;">
          <h3 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0;">St Joseph's School Patron Virtues</h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1rem;">
            ${SCHOOL_VIRTUES.map(v => `
              <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:1rem;">
                <div style="font-size:1.4rem; margin-bottom:4px;">${v.icon}</div>
                <strong style="color:#0f172a; font-size:0.95rem; display:block; margin-bottom:4px;">${v.name}</strong>
                <p style="font-size:0.82rem; color:#64748b; line-height:1.4; margin:0 0 6px 0;">${v.definition}</p>
                <span style="font-size:0.74rem; color:#15803d; font-weight:700;">Example: ${v.patronExample}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderTour(): string {
    return `
      <section style="margin-bottom:3rem;">
        <div style="margin-bottom:1.5rem;">
          <h2 style="font-size:1.6rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">Interactive Catholic Church Sanctuary Simulator</h2>
          <p style="font-size:0.95rem; color:#64748b; margin:0 0 1rem 0;">
            Explore the sacred anatomy of the altar, tabernacle, sanctuary lamp, ambo, and baptistery in real-time vector graphics.
          </p>
        </div>

        <div style="background:#090d16; border-radius:16px; border:1px solid #1e293b; overflow:hidden; box-shadow:0 12px 36px rgba(0,0,0,0.35);">
          <iframe 
            src="${base}player.html?preset=church-tour" 
            style="width:100%; height:540px; border:none; display:block;" 
            title="Catholic Church Sanctuary Interactive Tour">
          </iframe>
        </div>
      </section>
    `;
  }

  function updateView() {
    container.innerHTML = `
      ${renderHeader()}
      <div id="sanctuary-content-body">
        ${currentTab === 'overview' ? renderOverview() :
          currentTab === 'mass' ? renderMass() :
          currentTab === 'sacraments' ? renderSacraments() :
          currentTab === 'rosary' ? renderRosary() :
          currentTab === 'cst' ? renderCST() :
          renderTour()}
      </div>
    `;

    // Bind tab button listeners
    container.querySelectorAll('.sanctuary-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentTab = (btn.getAttribute('data-tab') as any) || 'overview';
        updateView();
      });
    });

    // Direct overview card links
    container.querySelectorAll('.view-tab-direct').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentTab = (btn.getAttribute('data-target') as any) || 'overview';
        updateView();
      });
    });

    // Rosary cycle toggle buttons
    container.querySelectorAll('.rosary-cycle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeRosaryCycle = (btn.getAttribute('data-cycle') as any) || 'Joyful';
        updateView();
      });
    });
  }

  updateView();
  return container;
}

export default renderCatholicLifePage;
