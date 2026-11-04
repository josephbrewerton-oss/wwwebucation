import { getBaseUrl } from '../../utils/url';
// src/pages/catholic/AltarExplorer.ts
// St Joseph's Catholic Life & Faith Sanctuary
// Interactive High Altar & Sanctuary Explorer (Zero React, Pure Native TypeScript)

import {
  ALTAR_APPOINTMENTS,
  ALTAR_CANDLE_RULES,
  ALTAR_TYPES,
  ALTAR_DRESSING_STEPS,
  LITURGICAL_SEASON_THEMES,
  TABERNACLE_CATECHESIS,
  AltarAppointment,
} from '../../data/catholic';

export function renderAltarExplorer(onLaunchStudio?: () => void): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'altar-sanctuary-explorer';

  let selectedSeasonKey = 'white';
  let candleRuleMode: 'daily' | 'sunday' | 'bishop' = 'sunday';
  let selectedAppointmentId: string = 'tabernacle';
  let dressingStepIndex: number = 0;
  let activeViewMode: 'hotspots' | 'dressing' | 'types' = 'hotspots';
  let xrayRelics: boolean = false;

  function speakText(text: string) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.85;
    utter.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith('la') || v.lang.startsWith('it'));
    if (voice) utter.voice = voice;
    utter.lang = voice ? voice.lang : 'it-IT';
    window.speechSynthesis.speak(utter);
  }

  function getSelectedAppointment(): AltarAppointment {
    return ALTAR_APPOINTMENTS.find(a => a.id === selectedAppointmentId) || ALTAR_APPOINTMENTS[0];
  }

  function renderAltarSvg(): string {
    const season = LITURGICAL_SEASON_THEMES[selectedSeasonKey] || LITURGICAL_SEASON_THEMES['white'];
    const candleRule = ALTAR_CANDLE_RULES[candleRuleMode];
    const candleCount = candleRule.count; // 2, 6, or 7
    const app = getSelectedAppointment();

    // Symmetrical candle positions across width 800 (altar table from x=200 to x=600, center at 400)
    // Left side: x ~ 230, 270, 310; Right side: x ~ 490, 530, 570; Bishop center: x=400
    const candles: Array<{ x: number; y: number; isBishop?: boolean }> = [];
    if (candleCount === 2) {
      candles.push({ x: 260, y: 155 }, { x: 540, y: 155 });
    } else if (candleCount === 6) {
      candles.push(
        { x: 235, y: 155 }, { x: 275, y: 155 }, { x: 315, y: 155 },
        { x: 485, y: 155 }, { x: 525, y: 155 }, { x: 565, y: 155 }
      );
    } else if (candleCount === 7) {
      candles.push(
        { x: 235, y: 155 }, { x: 275, y: 155 }, { x: 315, y: 155 },
        { x: 485, y: 155 }, { x: 525, y: 155 }, { x: 565, y: 155 },
        { x: 400, y: 130, isBishop: true }
      );
    }

    return `
      <svg viewBox="0 0 800 440" style="width:100%; height:auto; display:block; background:radial-gradient(ellipse at 50% 20%, #172554 0%, #090d16 80%); border-radius:12px;" aria-label="Interactive Catholic High Altar Diagram">
        <defs>
          <linearGradient id="sanctuary-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e1b4b" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#090d16" stop-opacity="1" />
          </linearGradient>
          <radialGradient id="lamp-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ef4444" stop-opacity="0.9" />
            <stop offset="40%" stop-color="#b91c1c" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#7f1d1d" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="candle-flame" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="1" />
            <stop offset="40%" stop-color="#f59e0b" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#d97706" stop-opacity="0" />
          </radialGradient>
          <filter id="halo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Sanctuary Apse Arch & Wall -->
        <path d="M 120 440 L 120 180 Q 400 40 680 180 L 680 440 Z" fill="#0f172a" stroke="#334155" stroke-width="2" />
        <path d="M 160 440 L 160 200 Q 400 80 640 200 L 640 440 Z" fill="#1e1b4b" opacity="0.4" />

        <!-- High Altar Retable / Reredos Wall -->
        <rect x="240" y="80" width="320" height="130" fill="#1e293b" rx="8" stroke="#ca8a04" stroke-width="1.5" />
        <path d="M 280 80 Q 400 30 520 80 Z" fill="#ca8a04" opacity="0.3" />

        <!-- Conopeum & Sacred Tabernacle (Center) -->
        <g id="svg-tabernacle" class="altar-svg-node" data-id="tabernacle" style="cursor:pointer;">
          <rect x="360" y="70" width="80" height="95" rx="6" fill="#ca8a04" stroke="#facc15" stroke-width="2" />
          <!-- Tabernacle Dome / Crown -->
          <path d="M 360 70 Q 400 35 440 70 Z" fill="#eab308" stroke="#facc15" stroke-width="1.5" />
          <path d="M 400 35 L 400 20 M 394 26 L 406 26" stroke="#fef08a" stroke-width="2" stroke-linecap="round" />
          <!-- Tabernacle Veil / Conopeum -->
          <path d="M 364 74 Q 400 85 436 74 L 436 160 L 364 160 Z" fill="${season.hex}" opacity="0.9" stroke="${season.borderHex}" stroke-width="1" />
          <!-- Golden Doors -->
          <line x1="400" y1="88" x2="400" y2="155" stroke="#facc15" stroke-width="1.5" stroke-dasharray="2 2" />
          <!-- Sacred Monogram IHS -->
          <text x="400" y="125" fill="#ffffff" font-size="11" font-weight="800" text-anchor="middle" font-family="serif">IHS</text>
        </g>

        <!-- Red Sanctuary Lamp (Perpetual Light on Right of Tabernacle) -->
        <g id="svg-sanctuary-lamp" class="altar-svg-node" data-id="sanctuary-lamp" style="cursor:pointer;">
          <!-- Suspended chain -->
          <line x1="470" y1="20" x2="470" y2="78" stroke="#ca8a04" stroke-width="1" stroke-dasharray="3 2" />
          <!-- Red Lamp Glow Halo -->
          <circle cx="470" cy="85" r="22" fill="url(#lamp-glow)" />
          <!-- Glass Vessel -->
          <ellipse cx="470" cy="85" rx="9" ry="12" fill="#ef4444" stroke="#fca5a5" stroke-width="1.5" />
          <ellipse cx="470" cy="82" rx="4" ry="6" fill="#ffffff" opacity="0.7" />
          <!-- Brass Holder -->
          <path d="M 462 88 Q 470 96 478 88 L 474 96 L 466 96 Z" fill="#ca8a04" />
        </g>

        <!-- Central Altar Crucifix -->
        <g id="svg-altar-crucifix" class="altar-svg-node" data-id="altar-crucifix" style="cursor:pointer;">
          <rect x="396" y="80" width="8" height="60" fill="#78350f" rx="1" />
          <rect x="382" y="94" width="36" height="6" fill="#78350f" rx="1" />
          <!-- Golden Corpus of Christ -->
          <circle cx="400" cy="95" r="3.5" fill="#facc15" />
          <line x1="400" y1="98" x2="400" y2="114" stroke="#facc15" stroke-width="2.5" stroke-linecap="round" />
          <line x1="388" y1="97" x2="412" y2="97" stroke="#facc15" stroke-width="2" stroke-linecap="round" />
          <!-- INRI scroll -->
          <rect x="395" y="84" width="10" height="5" fill="#fef08a" rx="1" />
        </g>

        <!-- Pure Beeswax Candles -->
        <g id="svg-altar-candles" class="altar-svg-node" data-id="altar-candles" style="cursor:pointer;">
          ${candles.map(c => `
            <!-- Candle Candlestick -->
            <rect x="${c.x - 3}" y="${c.y + 12}" width="6" height="24" fill="#fef08a" stroke="#ca8a04" stroke-width="1" />
            <!-- Brass Base -->
            <ellipse cx="${c.x}" cy="${c.y + 36}" rx="7" ry="3" fill="#ca8a04" />
            <!-- Candle Wick -->
            <line x1="${c.x}" y1="${c.y + 12}" x2="${c.x}" y2="${c.y + 8}" stroke="#451a03" stroke-width="1" />
            <!-- Flame Glow -->
            <circle cx="${c.x}" cy="${c.y + 4}" r="12" fill="url(#candle-flame)" />
            <!-- Flame Teardrop -->
            <path d="M ${c.x - 2.5} ${c.y + 6} Q ${c.x} ${c.y - 4} ${c.x + 2.5} ${c.y + 6} Q ${c.x} ${c.y + 8} ${c.x - 2.5} ${c.y + 6} Z" fill="#fef08a" />
          `).join('')}
        </g>

        <!-- Predella Steps (Sanctuary Altar Steps) -->
        <polygon points="120,380 680,380 720,440 80,440" fill="#0f172a" stroke="#334155" stroke-width="1.5" />
        <polygon points="150,330 650,330 680,380 120,380" fill="#1e293b" stroke="#334155" stroke-width="1" />
        <polygon points="180,280 620,280 650,330 150,330" fill="#334155" stroke="#475569" stroke-width="1" />

        <!-- High Altar Stone Base (Stipes) & Antependium -->
        <rect x="210" y="220" width="380" height="110" fill="#475569" rx="4" stroke="#1e293b" stroke-width="2" />
        <!-- Antependium (Seasonal Frontal Cloth) -->
        <g id="svg-antependium" class="altar-svg-node" data-id="antependium" style="cursor:pointer;">
          <rect x="220" y="230" width="360" height="96" fill="${season.hex}" rx="4" stroke="${season.borderHex}" stroke-width="2" />
          <!-- Embroidered Gold Cross / Chi-Rho Monogram -->
          <circle cx="400" cy="278" r="26" fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="4 2" />
          <!-- Chi-Rho (☧) -->
          <text x="400" y="286" fill="#facc15" font-size="24" font-weight="800" text-anchor="middle" font-family="serif">☧</text>
          <!-- Fringe Gold Trim -->
          <line x1="220" y1="324" x2="580" y2="324" stroke="#ca8a04" stroke-width="4" stroke-dasharray="6 3" />
        </g>

        <!-- Consecrated Stone Table: The Mensa -->
        <g id="svg-mensa" class="altar-svg-node" data-id="mensa" style="cursor:pointer;">
          <!-- Thick Stone Slab -->
          <polygon points="190,205 610,205 630,225 170,225" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2" />
          <!-- Mensa Edge -->
          <rect x="170" y="222" width="460" height="10" fill="#94a3b8" stroke="#64748b" stroke-width="1" />
        </g>

        <!-- White Altar Linen (Linteum Altaris) Covering Mensa -->
        <g id="svg-altar-cloth" class="altar-svg-node" data-id="altar-cloth" style="cursor:pointer;">
          <polygon points="194,206 606,206 626,224 174,224" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
          <!-- Linens hanging gracefully over the left and right sides -->
          <polygon points="174,224 190,224 190,290 174,285" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
          <polygon points="626,224 610,224 610,290 626,285" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
        </g>

        <!-- Altar Stone with 5 Crosses (X-Ray Overlay) -->
        <g id="svg-altar-stone" opacity="${xrayRelics ? '0.95' : '0.15'}" style="pointer-events:none;">
          <rect x="350" y="209" width="100" height="14" fill="#64748b" stroke="#facc15" stroke-width="1" rx="2" />
          <!-- Five Crosses representing the Sacred Wounds of Christ -->
          <text x="360" y="220" fill="#facc15" font-size="8" font-weight="800">✚</text>
          <text x="432" y="220" fill="#facc15" font-size="8" font-weight="800">✚</text>
          <text x="396" y="220" fill="#facc15" font-size="9" font-weight="900">✚</text>
          <text x="360" y="215" fill="#facc15" font-size="8" font-weight="800">✚</text>
          <text x="432" y="215" fill="#facc15" font-size="8" font-weight="800">✚</text>
        </g>

        <!-- The Corporal (White Linen 9-Square in Center) -->
        <g id="svg-corporal" class="altar-svg-node" data-id="corporal" style="cursor:pointer;">
          <polygon points="360,210 440,210 448,222 352,222" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" />
          <!-- Red cross in front fold -->
          <text x="400" y="221" fill="#dc2626" font-size="9" font-weight="800" text-anchor="middle">✝</text>
        </g>

        <!-- The Roman Missal & Stand (Left Hand Side of Altar) -->
        <g id="svg-roman-missal" class="altar-svg-node" data-id="roman-missal" style="cursor:pointer;">
          <!-- Wooden/Brass Cushion Stand -->
          <polygon points="260,208 300,208 306,218 254,218" fill="#ca8a04" stroke="#854d0e" stroke-width="1" />
          <!-- Open Red/Gold Missal -->
          <polygon points="256,204 298,204 302,214 252,214" fill="#991b1b" stroke="#facc15" stroke-width="1" />
          <!-- White Pages with Red Text Columns -->
          <polygon points="259,206 295,206 298,212 255,212" fill="#fffbeb" />
          <line x1="277" y1="206" x2="277" y2="212" stroke="#ca8a04" stroke-width="0.8" />
        </g>

        <!-- The Sacred Golden Chalice & Paten with Host (Center on Corporal) -->
        <g id="svg-chalice" class="altar-svg-node" data-id="chalice" style="cursor:pointer;">
          <!-- Golden Chalice Stem & Cup -->
          <ellipse cx="414" cy="216" rx="8" ry="3" fill="#ca8a04" />
          <line x1="414" y1="204" x2="414" y2="216" stroke="#facc15" stroke-width="2.5" />
          <path d="M 406 204 Q 414 210 422 204 L 420 196 L 408 196 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1" />
          <!-- Pall Resting on Top -->
          <polygon points="405,195 423,195 424,197 404,197" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8" />
        </g>

        <g id="svg-paten" class="altar-svg-node" data-id="paten" style="cursor:pointer;">
          <!-- Golden Paten Plate -->
          <ellipse cx="386" cy="216" rx="9" ry="3.5" fill="#facc15" stroke="#ca8a04" stroke-width="1" />
          <!-- Consecration Wheaten Host with Cross -->
          <circle cx="386" cy="207" r="7" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
          <text x="386" y="210" fill="#ca8a04" font-size="8" font-weight="900" text-anchor="middle">✝</text>
        </g>

        <!-- Credence Table on Sanctuary Right (Abacus) -->
        <g id="svg-credence-table" class="altar-svg-node" data-id="cruets-lavabo" style="cursor:pointer;">
          <polygon points="650,250 740,250 750,266 640,266" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5" />
          <rect x="642" y="266" width="106" height="60" fill="#334155" stroke="#1e293b" stroke-width="1" />
          <!-- Cruet Wine (V) & Water (A) -->
          <ellipse cx="665" cy="245" rx="5" ry="9" fill="#991b1b" opacity="0.8" stroke="#ffffff" stroke-width="1" />
          <ellipse cx="680" cy="245" rx="5" ry="9" fill="#0284c7" opacity="0.6" stroke="#ffffff" stroke-width="1" />
          <!-- Lavabo Basin & Hand Towel -->
          <ellipse cx="705" cy="247" rx="8" ry="4" fill="#f8fafc" stroke="#94a3b8" stroke-width="1" />
          <rect x="718" y="243" width="10" height="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8" rx="1" />
          <!-- Sanctuary Bells (Sanctus Chimes) -->
          <circle cx="665" cy="258" r="4" fill="#facc15" stroke="#ca8a04" stroke-width="1" />
          <circle cx="673" cy="258" r="4" fill="#facc15" stroke="#ca8a04" stroke-width="1" />
          <circle cx="669" cy="254" r="4" fill="#facc15" stroke="#ca8a04" stroke-width="1" />
        </g>

        <!-- Thurible & Aspergillum on Stand (Sanctuary Floor Right) -->
        <g id="svg-thurible" class="altar-svg-node" data-id="thurible-navicula" style="cursor:pointer;">
          <!-- Stand -->
          <line x1="720" y1="340" x2="720" y2="400" stroke="#ca8a04" stroke-width="2" />
          <ellipse cx="720" cy="400" rx="14" ry="5" fill="#ca8a04" />
          <!-- Thurible Censer -->
          <path d="M 714 340 L 726 340 L 724 352 Q 720 358 716 352 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1" />
          <!-- Rising Incense Swirls -->
          <path d="M 720 336 Q 716 324 722 314 T 720 298" stroke="#ffffff" stroke-width="1.5" fill="none" opacity="0.5" stroke-dasharray="3 3" />
        </g>

        <!-- Hotspot Pin Overlay Rings with IDs -->
        ${ALTAR_APPOINTMENTS.map(item => {
          const isSelected = item.id === selectedAppointmentId;
          const { x, y } = item.hotspot;
          return `
            <g class="altar-hotspot-pin" data-id="${item.id}" style="cursor:pointer;" transform="translate(${x}, ${y})">
              <circle cx="0" cy="0" r="${isSelected ? 16 : 11}" fill="${isSelected ? '#facc15' : '#0284c7'}" opacity="${isSelected ? 0.35 : 0.2}" filter="url(#halo-glow)" />
              <circle cx="0" cy="0" r="${isSelected ? 9 : 7}" fill="${isSelected ? '#fde047' : '#38bdf8'}" stroke="#ffffff" stroke-width="${isSelected ? 2 : 1.5}" />
              <text x="0" y="3.5" font-size="8" font-weight="900" fill="#0f172a" text-anchor="middle" font-family="sans-serif">●</text>
            </g>
          `;
        }).join('')}
      </svg>
    `;
  }

  function renderInspectorCard(): string {
    const app = getSelectedAppointment();
    const season = LITURGICAL_SEASON_THEMES[selectedSeasonKey] || LITURGICAL_SEASON_THEMES['white'];

    return `
      <div style="background:#ffffff; border:1.5px solid #ca8a04; border-radius:14px; padding:1.5rem; box-shadow:0 10px 25px -5px rgba(0,0,0,0.08);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:2rem; background:#fef3c7; border:1px solid #fde047; padding:6px 12px; border-radius:12px;">
              ${app.icon}
            </span>
            <div>
              <span style="font-size:0.75rem; font-weight:800; color:#ca8a04; text-transform:uppercase; letter-spacing:0.04em;">
                ${app.category} &bull; Sanctuary Appointment
              </span>
              <h3 style="font-size:1.35rem; font-weight:800; color:#0f172a; margin:2px 0 2px 0;">
                ${app.name}
              </h3>
              <div style="font-size:0.88rem; font-style:italic; color:#0369a1; font-weight:700;">
                ${app.latinName}
              </div>
            </div>
          </div>

          <div style="display:flex; gap:6px;">
            <button type="button" id="btn-speak-latin" style="display:inline-flex; align-items:center; gap:5px; padding:6px 12px; border-radius:8px; background:#0284c7; color:#fff; border:none; font-weight:700; font-size:0.78rem; cursor:pointer;" title="Pronounce Latin Title in Ecclesiastical Latin">
              <span>🔊</span> Pronounce Latin
            </button>
            <span style="font-size:0.75rem; background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; padding:4px 10px; border-radius:999px; font-weight:700; align-self:center;">
              ${app.catechismRef}
            </span>
          </div>
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1rem; margin-bottom:1rem;">
          <div style="font-size:0.76rem; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:3px;">
            Physical Placement in Sanctuary:
          </div>
          <div style="font-size:0.86rem; color:#334155; font-weight:600;">
            📍 ${app.placement}
          </div>
        </div>

        <div style="margin-bottom:1rem;">
          <h4 style="font-size:0.9rem; font-weight:800; color:#0f172a; margin:0 0 4px 0;">Description &amp; Liturgical Function</h4>
          <p style="font-size:0.86rem; color:#475569; line-height:1.55; margin:0;">
            ${app.description}
          </p>
        </div>

        <div style="background:#fffbeb; border-left:4px solid #ca8a04; border-radius:0 8px 8px 0; padding:0.85rem 1rem;">
          <div style="font-size:0.76rem; font-weight:800; color:#92400e; text-transform:uppercase; margin-bottom:3px;">
            Theological &amp; Spiritual Meaning:
          </div>
          <p style="font-size:0.85rem; color:#78350f; line-height:1.5; margin:0; font-style:italic;">
            "${app.spiritualMeaning}"
          </p>
        </div>
      </div>
    `;
  }

  function renderAltarDressingSection(): string {
    const step = ALTAR_DRESSING_STEPS[dressingStepIndex];
    return `
      <div style="background:#ffffff; border:1.5px solid #0284c7; border-radius:14px; padding:1.5rem; margin-bottom:2rem; box-shadow:0 4px 16px rgba(2,132,199,0.08);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:8px;">
          <div>
            <span style="font-size:0.75rem; font-weight:800; color:#0284c7; text-transform:uppercase; letter-spacing:0.04em;">
              Altar Server &amp; Sacristan Training Mode
            </span>
            <h3 style="font-size:1.25rem; font-weight:800; color:#0f172a; margin:2px 0 0;">
              Dressing the Altar for Holy Mass (Step ${step.step} of ${ALTAR_DRESSING_STEPS.length})
            </h3>
          </div>
          <div style="display:flex; gap:6px;">
            <button type="button" id="btn-prev-step" ${dressingStepIndex === 0 ? 'disabled' : ''} style="padding:6px 14px; border-radius:6px; background:${dressingStepIndex === 0 ? '#e2e8f0' : '#0284c7'}; color:${dressingStepIndex === 0 ? '#94a3b8' : '#fff'}; border:none; font-weight:700; font-size:0.8rem; cursor:${dressingStepIndex === 0 ? 'not-allowed' : 'pointer'};">
              &larr; Previous Step
            </button>
            <button type="button" id="btn-next-step" ${dressingStepIndex === ALTAR_DRESSING_STEPS.length - 1 ? 'disabled' : ''} style="padding:6px 14px; border-radius:6px; background:${dressingStepIndex === ALTAR_DRESSING_STEPS.length - 1 ? '#e2e8f0' : '#0284c7'}; color:${dressingStepIndex === ALTAR_DRESSING_STEPS.length - 1 ? '#94a3b8' : '#fff'}; border:none; font-weight:700; font-size:0.8rem; cursor:${dressingStepIndex === ALTAR_DRESSING_STEPS.length - 1 ? 'not-allowed' : 'pointer'};">
              Next Step &rarr;
            </button>
          </div>
        </div>

        <!-- Progress Steps Bar -->
        <div style="display:flex; gap:6px; margin-bottom:1.25rem;">
          ${ALTAR_DRESSING_STEPS.map((s, idx) => `
            <div style="flex:1; height:6px; border-radius:3px; background:${idx <= dressingStepIndex ? '#0284c7' : '#e2e8f0'};"></div>
          `).join('')}
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1.25rem;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <span style="font-size:0.78rem; font-weight:800; background:#dbeafe; color:#1e40af; padding:2px 8px; border-radius:4px;">
              ${step.latinTitle}
            </span>
          </div>
          <h4 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 8px 0;">
            ${step.title}
          </h4>
          <p style="font-size:0.88rem; color:#334155; line-height:1.5; margin:0 0 10px 0;">
            <strong>Liturgical Action:</strong> ${step.action}
          </p>
          <div style="font-size:0.84rem; color:#15803d; background:#f0fdf4; border:1px solid #bbf7d0; padding:8px 12px; border-radius:8px;">
            <strong>Catechetical Reason:</strong> ${step.catecheticalReason}
          </div>
        </div>
      </div>
    `;
  }

  function renderAltarTypes(): string {
    return `
      <div style="margin-bottom:2.5rem;">
        <h3 style="font-size:1.35rem; font-weight:800; color:#0f172a; margin:0 0 0.5rem 0;">
          The Four Canonical Types of Catholic Altars
        </h3>
        <p style="font-size:0.9rem; color:#64748b; margin:0 0 1.25rem 0;">
          The Church’s Code of Canon Law (Can. 1235–1239) and GIRM classify altars by their physical construction and holy purpose.
        </p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(270px, 1fr)); gap:1rem;">
          ${ALTAR_TYPES.map(t => `
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; box-shadow:0 1px 4px rgba(0,0,0,0.03);">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <span style="font-size:1.6rem;">${t.icon}</span>
                <div>
                  <h4 style="font-size:1.05rem; font-weight:800; color:#0f172a; margin:0;">${t.name}</h4>
                  <span style="font-size:0.75rem; color:#0284c7; font-weight:700; font-style:italic;">${t.latinName}</span>
                </div>
              </div>
              <p style="font-size:0.82rem; color:#475569; line-height:1.45; margin:0 0 8px 0;">${t.description}</p>
              <div style="font-size:0.76rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px 8px; color:#334155;">
                <strong>Canonical Norm:</strong> ${t.canonicalNorm}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function updateView() {
    const season = LITURGICAL_SEASON_THEMES[selectedSeasonKey] || LITURGICAL_SEASON_THEMES['white'];
    const candleRule = ALTAR_CANDLE_RULES[candleRuleMode];

    container.innerHTML = `
      <!-- Top Title Strip & Live Studio Link -->
      <section style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:1.5rem;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.4rem;">🕯️</span>
            <span style="font-size:0.76rem; font-weight:800; color:#ca8a04; text-transform:uppercase; letter-spacing:0.06em;">
              Liturgical Architecture &amp; Altar Anatomy
            </span>
          </div>
          <h2 style="font-size:1.85rem; font-weight:800; color:#0f172a; margin:4px 0 0; letter-spacing:-0.02em;">
            Interactive High Altar &amp; Sanctuary Explorer
          </h2>
          <p style="font-size:0.92rem; color:#64748b; margin:4px 0 0;">
            Click on any sacred object or hotspot pin to inspect its Latin name, spiritual symbolism, and canonical regulations (GIRM &amp; CCC).
          </p>
        </div>

        <div style="display:flex; gap:8px; align-items:center;">
          <a href="${base}player?preset=altar-anatomy" style="padding:8px 16px; background:#ca8a04; color:#fff; border-radius:8px; font-weight:700; text-decoration:none; font-size:0.85rem; display:inline-flex; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(202,138,4,0.3);">
            <span>🎬 Launch 60 FPS Vector Simulation</span>
            <span>&rarr;</span>
          </a>
        </div>
      </section>

      <!-- Live Altar Controls Toolbar -->
      <div style="background:#0f172a; border-radius:12px; padding:1rem 1.25rem; margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; color:#f8fafc; border:1px solid #1e293b;">
        <!-- Liturgical Season Color Switcher -->
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span style="font-size:0.75rem; font-weight:800; color:#94a3b8; text-transform:uppercase;">Seasonal Antependium:</span>
          ${Object.entries(LITURGICAL_SEASON_THEMES).map(([k, s]) => `
            <button 
              type="button" 
              class="btn-season-select" 
              data-season="${k}" 
              style="padding:4px 10px; border-radius:6px; font-size:0.76rem; font-weight:700; cursor:pointer; border:1.5px solid ${selectedSeasonKey === k ? '#facc15' : 'transparent'}; background:${s.hex}; color:#ffffff; display:inline-flex; align-items:center; gap:4px;">
              <span>●</span> ${s.season.split(' ')[0]}
            </button>
          `).join('')}
        </div>

        <!-- Candle Rules Mode Switcher (GIRM 117) -->
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span style="font-size:0.75rem; font-weight:800; color:#94a3b8; text-transform:uppercase;">Candle Rule (GIRM 117):</span>
          <button type="button" class="btn-candle-rule" data-mode="daily" style="padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer; border:1px solid ${candleRuleMode === 'daily' ? '#facc15' : '#334155'}; background:${candleRuleMode === 'daily' ? '#ca8a04' : '#1e293b'}; color:#ffffff;">
            2 Daily
          </button>
          <button type="button" class="btn-candle-rule" data-mode="sunday" style="padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer; border:1px solid ${candleRuleMode === 'sunday' ? '#facc15' : '#334155'}; background:${candleRuleMode === 'sunday' ? '#ca8a04' : '#1e293b'}; color:#ffffff;">
            6 Sunday
          </button>
          <button type="button" class="btn-candle-rule" data-mode="bishop" style="padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer; border:1px solid ${candleRuleMode === 'bishop' ? '#facc15' : '#334155'}; background:${candleRuleMode === 'bishop' ? '#ca8a04' : '#1e293b'}; color:#ffffff;">
            7 Bishop
          </button>
        </div>

        <!-- X-Ray Relic Stone Toggle -->
        <div>
          <button type="button" id="btn-toggle-xray" style="padding:5px 12px; border-radius:6px; font-size:0.76rem; font-weight:700; cursor:pointer; border:1px solid ${xrayRelics ? '#38bdf8' : '#334155'}; background:${xrayRelics ? '#0284c7' : '#1e293b'}; color:#ffffff;">
            🔬 Relic Stone X-Ray: ${xrayRelics ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <!-- Main Stage Grid: Interactive SVG Viewport + Live Inspector Card -->
      <div style="display:grid; grid-template-columns:1fr; gap:1.5rem; margin-bottom:2rem;">
        <div style="border-radius:14px; overflow:hidden; border:2px solid #1e293b; box-shadow:0 12px 30px rgba(0,0,0,0.35);">
          ${renderAltarSvg()}
        </div>
        ${renderInspectorCard()}
      </div>

      <!-- Mode Selector Tabs: Appointments Directory | Step-by-Step Dressing | 4 Altar Types -->
      <div style="display:flex; gap:8px; margin-bottom:1.25rem; border-bottom:2px solid #e2e8f0; padding-bottom:8px; flex-wrap:wrap;">
        <button type="button" class="btn-view-mode" data-mode="hotspots" style="padding:8px 16px; border-radius:8px; font-weight:800; font-size:0.85rem; cursor:pointer; border:none; background:${activeViewMode === 'hotspots' ? '#0f172a' : '#f1f5f9'}; color:${activeViewMode === 'hotspots' ? '#ffffff' : '#475569'};">
          📋 All Altar Appointments (${ALTAR_APPOINTMENTS.length})
        </button>
        <button type="button" class="btn-view-mode" data-mode="dressing" style="padding:8px 16px; border-radius:8px; font-weight:800; font-size:0.85rem; cursor:pointer; border:none; background:${activeViewMode === 'dressing' ? '#0f172a' : '#f1f5f9'}; color:${activeViewMode === 'dressing' ? '#ffffff' : '#475569'};">
          🧺 Altar Dressing Trainer (6 Steps)
        </button>
        <button type="button" class="btn-view-mode" data-mode="types" style="padding:8px 16px; border-radius:8px; font-weight:800; font-size:0.85rem; cursor:pointer; border:none; background:${activeViewMode === 'types' ? '#0f172a' : '#f1f5f9'}; color:${activeViewMode === 'types' ? '#ffffff' : '#475569'};">
          🏛️ 4 Types of Altars (Can. 1235)
        </button>
      </div>

      <!-- Dynamic Sub-view Section -->
      ${activeViewMode === 'dressing' ? renderAltarDressingSection() : 
        activeViewMode === 'types' ? renderAltarTypes() : `
        <!-- Categorized Appointments Directory Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:0.9rem; margin-bottom:2.5rem;">
          ${ALTAR_APPOINTMENTS.map(item => `
            <div 
              class="appointment-card" 
              data-id="${item.id}" 
              style="padding:1rem; border-radius:10px; border:1.5px solid ${item.id === selectedAppointmentId ? '#ca8a04' : '#e2e8f0'}; background:${item.id === selectedAppointmentId ? '#fefce8' : '#ffffff'}; cursor:pointer; transition:all 0.15s ease;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span style="font-size:1.4rem;">${item.icon}</span>
                <div>
                  <strong style="font-size:0.92rem; color:#0f172a; display:block;">${item.name}</strong>
                  <span style="font-size:0.75rem; color:#0284c7; font-style:italic;">${item.latinName}</span>
                </div>
              </div>
              <p style="font-size:0.78rem; color:#64748b; line-height:1.4; margin:4px 0 0;">
                ${item.description.slice(0, 95)}...
              </p>
            </div>
          `).join('')}
        </div>
      `}

      <!-- Canonical Tabernacle & Altar Catechesis Accordion -->
      <section style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; margin-bottom:2rem;">
        <h3 style="font-size:1.25rem; font-weight:800; color:#0f172a; margin:0 0 0.5rem 0;">
          ${TABERNACLE_CATECHESIS.title}
        </h3>
        <p style="font-size:0.86rem; color:#64748b; margin:0 0 1rem 0;">
          ${TABERNACLE_CATECHESIS.theCoreQuestion}
        </p>
        <div style="background:#ffffff; border-left:4px solid #0284c7; border-radius:0 8px 8px 0; padding:1rem; font-size:0.84rem; color:#334155; line-height:1.55;">
          ${TABERNACLE_CATECHESIS.canonicalAnswer.girm315}
        </div>
      </section>
    `;

    // Bind Hotspot Pins & SVG Nodes
    container.querySelectorAll('.altar-hotspot-pin, .altar-svg-node, .appointment-card').forEach(node => {
      node.addEventListener('click', () => {
        const id = node.getAttribute('data-id');
        if (id) {
          selectedAppointmentId = id;
          updateView();
          const targetCard = container.querySelector(`.appointment-card[data-id="${id}"]`);
          if (targetCard) targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });

    // Season switcher buttons
    container.querySelectorAll('.btn-season-select').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = btn.getAttribute('data-season');
        if (s) {
          selectedSeasonKey = s;
          updateView();
        }
      });
    });

    // Candle rule switcher buttons
    container.querySelectorAll('.btn-candle-rule').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode') as any;
        if (mode) {
          candleRuleMode = mode;
          updateView();
        }
      });
    });

    // X-Ray toggle button
    const btnXray = container.querySelector('#btn-toggle-xray');
    if (btnXray) {
      btnXray.addEventListener('click', () => {
        xrayRelics = !xrayRelics;
        updateView();
      });
    }

    // View mode selector buttons
    container.querySelectorAll('.btn-view-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = btn.getAttribute('data-mode') as any;
        if (m) {
          activeViewMode = m;
          updateView();
        }
      });
    });

    // Dressing step next/prev buttons
    const btnPrev = container.querySelector('#btn-prev-step');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (dressingStepIndex > 0) {
          dressingStepIndex--;
          updateView();
        }
      });
    }
    const btnNext = container.querySelector('#btn-next-step');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (dressingStepIndex < ALTAR_DRESSING_STEPS.length - 1) {
          dressingStepIndex++;
          updateView();
        }
      });
    }

    // Pronounce Latin Button
    const btnSpeak = container.querySelector('#btn-speak-latin');
    if (btnSpeak) {
      btnSpeak.addEventListener('click', () => {
        const app = getSelectedAppointment();
        speakText(app.latinName);
      });
    }
  }

  updateView();
  return container;
}
