// src/pages/catholic/LatinPrayersChapel.ts
// St Joseph's Catholic Life & Faith Sanctuary
// Latin Mass Prayers Chapel (Zero React, Pure Native TypeScript)

import { LATIN_PRAYERS_DATA, LatinPrayerItem, LatinPrayerVerse } from '../../data/catholic';
import { broadcastBslSpeech } from '../../services/bslGlobalStore';

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderLatinPrayersChapel(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'latin-mass-prayers-chapel';

  let activeCategory: 'All' | 'Ordinary of the Mass' | 'Universal Prayers' | 'Thanksgiving & Adoration' = 'All';
  let searchQuery = '';
  let activePlayingId: string | null = null;
  let activeExpandedPrayerId: string = 'pater-noster';

  function stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    broadcastBslSpeech({ isSpeaking: false });
    activePlayingId = null;
  }

  function reciteLatinPrayer(prayer: LatinPrayerItem) {
    if (!('speechSynthesis' in window)) return;
    stopSpeech();

    const englishText = prayer.verses.map(v => v.english).join(' ');
    broadcastBslSpeech({ subtitle: `${prayer.titleEnglish}: ${englishText}`, isSpeaking: true });

    const fullLatinText = prayer.verses.map(v => v.latin).join(' ... ');
    const utter = new SpeechSynthesisUtterance(fullLatinText);
    utter.rate = 0.82;
    utter.pitch = 0.98;

    const voices = window.speechSynthesis.getVoices();
    const latinVoice = voices.find(v => v.lang.startsWith('la') || v.lang.startsWith('it'));
    if (latinVoice) utter.voice = latinVoice;
    utter.lang = latinVoice ? latinVoice.lang : 'it-IT';

    activePlayingId = prayer.id;
    updateView();

    utter.onend = () => {
      broadcastBslSpeech({ isSpeaking: false });
      activePlayingId = null;
      updateView();
    };

    utter.onerror = () => {
      broadcastBslSpeech({ isSpeaking: false });
      activePlayingId = null;
      updateView();
    };

    window.speechSynthesis.speak(utter);
  }

  function filterPrayers(): LatinPrayerItem[] {
    return LATIN_PRAYERS_DATA.filter(p => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        p.titleLatin.toLowerCase().includes(q) || 
        p.titleEnglish.toLowerCase().includes(q) ||
        p.verses.some(v => v.latin.toLowerCase().includes(q) || v.english.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }

  function updateView() {
    const prayers = filterPrayers();

    container.innerHTML = `
      <!-- Header Banner -->
      <section style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:1.5rem;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.4rem;">🇻🇦</span>
            <span style="font-size:0.76rem; font-weight:800; color:#ca8a04; text-transform:uppercase; letter-spacing:0.06em;">
              Lingua Latina &bull; The Universal Tongue of the Church
            </span>
          </div>
          <h2 style="font-size:1.85rem; font-weight:800; color:#0f172a; margin:4px 0 0; letter-spacing:-0.02em;">
            Latin Mass Prayers &amp; Universal Canticles Chapel
          </h2>
          <p style="font-size:0.92rem; color:#64748b; margin:4px 0 0; max-width:820px; line-height:1.5;">
            Pray the ancient prayers of the Roman Rite with Latin text, ecclesiastical pronunciation phonetics, and faithful English translations. Preserving 2,000 years of apostolic tradition.
          </p>
        </div>

        <div style="display:flex; gap:8px;">
          <button type="button" id="btn-stop-all-audio" style="display:${activePlayingId ? 'inline-flex' : 'none'}; align-items:center; gap:6px; padding:8px 14px; border-radius:8px; background:#dc2626; color:#fff; border:none; font-weight:700; font-size:0.8rem; cursor:pointer;">
            <span>⏹</span> Stop Recitation
          </button>
        </div>
      </section>

      <!-- Category Filter Pills & Search Bar -->
      <div style="background:#0f172a; border-radius:12px; padding:1rem 1.25rem; margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; color:#f8fafc; border:1px solid #1e293b;">
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <span style="font-size:0.75rem; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-right:4px;">Filter:</span>
          ${(['All', 'Ordinary of the Mass', 'Universal Prayers', 'Thanksgiving & Adoration'] as const).map(cat => `
            <button 
              type="button" 
              class="btn-latin-cat" 
              data-cat="${cat}" 
              style="padding:5px 12px; border-radius:6px; font-size:0.78rem; font-weight:700; cursor:pointer; border:1px solid ${activeCategory === cat ? '#facc15' : '#334155'}; background:${activeCategory === cat ? '#ca8a04' : '#1e293b'}; color:#ffffff;">
              ${cat === 'All' ? 'All Prayers (15)' : cat}
            </button>
          `).join('')}
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <input 
            type="text" 
            id="latin-search-input" 
            placeholder="Search Latin or English text..." 
            value="${escapeHtml(searchQuery)}" 
            style="background:#1e293b; color:#ffffff; border:1px solid #334155; border-radius:6px; padding:6px 12px; font-size:0.82rem; width:220px; outline:none;" />
        </div>
      </div>

      <!-- Prayers List -->
      <div style="display:flex; flex-direction:column; gap:1.25rem; margin-bottom:2.5rem;">
        ${prayers.length === 0 ? `
          <div style="text-align:center; padding:3rem; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1; color:#64748b;">
            No Latin prayers match your current filter or search term.
          </div>
        ` : prayers.map(p => {
          const isPlaying = activePlayingId === p.id;
          const isExpanded = activeExpandedPrayerId === p.id;

          return `
            <div style="background:#ffffff; border:1.5px solid ${isPlaying ? '#ca8a04' : '#e2e8f0'}; border-radius:14px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.03); transition:all 0.15s ease;">
              <!-- Header Bar -->
              <div style="padding:1.25rem; background:${isPlaying ? '#fefce8' : '#ffffff'}; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-size:1.6rem;">📜</span>
                  <div>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <h3 style="font-size:1.25rem; font-weight:800; color:#0f172a; margin:0; font-family:serif;">
                        ${p.titleLatin}
                      </h3>
                      <span style="font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:999px; background:${p.category === 'Ordinary of the Mass' ? '#dbeafe' : p.category === 'Universal Prayers' ? '#fef3c7' : '#fce7f3'}; color:${p.category === 'Ordinary of the Mass' ? '#1e40af' : p.category === 'Universal Prayers' ? '#92400e' : '#9d174d'};">
                        ${p.category}
                      </span>
                    </div>
                    <div style="font-size:0.86rem; color:#64748b; font-weight:600; margin-top:2px;">
                      ${p.titleEnglish} &bull; <span style="color:#0284c7;">${p.liturgicalMoment}</span>
                    </div>
                  </div>
                </div>

                <div style="display:flex; gap:8px; align-items:center;">
                  <button 
                    type="button" 
                    class="btn-recite-prayer" 
                    data-id="${p.id}" 
                    style="display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:8px; background:${isPlaying ? '#ca8a04' : '#0284c7'}; color:#ffffff; border:none; font-weight:700; font-size:0.8rem; cursor:pointer;">
                    <span>${isPlaying ? '⏹ Stop' : '🔊 Recite in Latin'}</span>
                  </button>
                  <button 
                    type="button" 
                    class="btn-toggle-expand" 
                    data-id="${p.id}" 
                    style="padding:6px 10px; border-radius:8px; background:#f1f5f9; color:#475569; border:none; font-weight:700; font-size:0.8rem; cursor:pointer;">
                    ${isExpanded ? '▲ Hide' : '▼ Details'}
                  </button>
                </div>
              </div>

              <!-- Verses Grid (Latin / Phonetic / English) -->
              <div style="padding:1.25rem; background:#fafafa;">
                <div style="display:flex; flex-direction:column; gap:0.85rem;">
                  ${p.verses.map((v, idx) => `
                    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:0.85rem 1rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px; align-items:start;">
                      <!-- Latin Text -->
                      <div>
                        <span style="font-size:0.7rem; font-weight:800; color:#ca8a04; text-transform:uppercase; letter-spacing:0.04em;">Latin (Ecclesiastical):</span>
                        <div style="font-size:0.96rem; font-weight:800; color:#0f172a; margin-top:2px; font-family:serif; line-height:1.45;">
                          ${v.latin}
                        </div>
                      </div>
                      <!-- Phonetic Pronunciation -->
                      <div>
                        <span style="font-size:0.7rem; font-weight:800; color:#0284c7; text-transform:uppercase; letter-spacing:0.04em;">Phonetic Guide:</span>
                        <div style="font-size:0.86rem; color:#0369a1; font-style:italic; margin-top:2px; line-height:1.45;">
                          ${v.phonetic}
                        </div>
                      </div>
                      <!-- English Translation -->
                      <div>
                        <span style="font-size:0.7rem; font-weight:800; color:#15803d; text-transform:uppercase; letter-spacing:0.04em;">English Translation:</span>
                        <div style="font-size:0.88rem; color:#334155; margin-top:2px; line-height:1.45;">
                          ${v.english}
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>

                ${isExpanded ? `
                  <!-- Catechetical & Historical Context Drawer -->
                  <div style="margin-top:1rem; padding-top:1rem; border-top:1px dashed #e2e8f0; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
                    <div style="background:#eff6ff; border-radius:8px; padding:0.85rem 1rem; border-left:4px solid #0284c7;">
                      <strong style="color:#1e40af; font-size:0.8rem; text-transform:uppercase; display:block; margin-bottom:2px;">Sacred Liturgical Context:</strong>
                      <p style="font-size:0.82rem; color:#1e3a8a; line-height:1.45; margin:0;">
                        ${p.sacredContext}
                      </p>
                    </div>
                    <div style="background:#fffbeb; border-radius:8px; padding:0.85rem 1rem; border-left:4px solid #ca8a04;">
                      <strong style="color:#92400e; font-size:0.8rem; text-transform:uppercase; display:block; margin-bottom:2px;">Historical Note:</strong>
                      <p style="font-size:0.82rem; color:#78350f; line-height:1.45; margin:0;">
                        ${p.historicalNote}
                      </p>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Vatican II & Latin Language Catechesis Box -->
      <section style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; margin-bottom:2rem;">
        <h3 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">
          Why Does the Catholic Church Cherish Latin? (Sacrosanctum Concilium §36)
        </h3>
        <p style="font-size:0.88rem; color:#475569; line-height:1.55; margin:0;">
          The Second Vatican Council declared: <em>"Particular law remaining in force, the use of the Latin language is to be preserved in the Latin rites"</em> (SC 36). Latin provides an immutable, sacred language that unites Catholics of every tribe, tongue, and nation across 2,000 years in one unchanged voice of worship before God.
        </p>
      </section>
    `;

    // Bind Category filter buttons
    container.querySelectorAll('.btn-latin-cat').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat') as any;
        if (cat) {
          activeCategory = cat;
          updateView();
        }
      });
    });

    // Search input
    const searchInput = container.querySelector<HTMLInputElement>('#latin-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = (e.target as HTMLInputElement).value;
        updateView();
      });
    }

    // Recite / Stop prayer buttons
    container.querySelectorAll('.btn-recite-prayer').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const prayer = LATIN_PRAYERS_DATA.find(p => p.id === id);
        if (prayer) {
          if (activePlayingId === prayer.id) {
            stopSpeech();
            updateView();
          } else {
            reciteLatinPrayer(prayer);
          }
        }
      });
    });

    // Stop all audio button
    const btnStop = container.querySelector('#btn-stop-all-audio');
    if (btnStop) {
      btnStop.addEventListener('click', () => {
        stopSpeech();
        updateView();
      });
    }

    // Toggle expand details buttons
    container.querySelectorAll('.btn-toggle-expand').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id) {
          activeExpandedPrayerId = activeExpandedPrayerId === id ? '' : id;
          updateView();
        }
      });
    });
  }

  updateView();
  return container;
}
