import { getBaseUrl } from '../utils/url';
import { SHAKESPEARE_PLAY_STORIES } from '../data/shakespearePlays';

export function renderShakespearePage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'shakespeare-theatre-stage';
  container.style.cssText = 'max-width: 1240px; margin: 0 auto; padding: 2rem 1.25rem 4rem; color: #0f172a;';

  let selectedPlay = SHAKESPEARE_PLAY_STORIES[0] || {
    id: 'macbeth',
    title: 'Macbeth',
    tagline: 'Ambition, Guilt & Prophecy on the Scottish Heath',
    acts: []
  };

  function render() {
    container.innerHTML = `
      <!-- Header -->
      <div style="margin-bottom: 2rem;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <a href="${base}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
          <span style="color:#cbd5e1;">/</span>
          <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">🎭 Shakespeare Globe Theatre</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">Shakespeare's Globe Theatre &amp; 5-Act Play-Throughs</h1>
            <p style="font-size:0.95rem; color:#64748b; margin:0;">
              Interactive 5-Act play-throughs, blank verse spoken audio, and 1599 Elizabethan stage architecture.
            </p>
          </div>
          <a href="${base}player?preset=shakespeare" style="padding:8px 16px; border-radius:8px; background:#7f1d1d; color:#fff; font-weight:700; font-size:0.84rem; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
            <span>🎬 Launch Globe 3D Stage</span> &rarr;
          </a>
        </div>
      </div>

      <!-- Play Selector -->
      <div style="display:flex; gap:8px; margin-bottom:1.5rem; flex-wrap:wrap; align-items:center;">
        <span style="font-size:0.84rem; font-weight:700; color:#64748b;">Select GCSE Play:</span>
        ${SHAKESPEARE_PLAY_STORIES.map(p => `
          <button type="button" class="play-select-btn" data-id="${p.id}" style="padding:6px 14px; border-radius:999px; font-size:0.8rem; font-weight:700; cursor:pointer; border:1px solid ${p.id === selectedPlay.id ? '#7f1d1d' : '#cbd5e1'}; background:${p.id === selectedPlay.id ? '#7f1d1d' : '#ffffff'}; color:${p.id === selectedPlay.id ? '#ffffff' : '#475569'};">
            ${p.title}
          </button>
        `).join('')}
      </div>

      <!-- Live Stage Frame -->
      <div style="background:#090d16; border-radius:16px; border:1px solid #1e293b; overflow:hidden; box-shadow:0 12px 36px rgba(0,0,0,0.35); margin-bottom:2rem;">
        <div style="padding:10px 16px; background:#0f172a; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; font-weight:800; color:#f87171;">
            🎭 1599 Globe Theatre Simulation: ${selectedPlay.title}
          </span>
          <span style="font-size:0.75rem; color:#94a3b8;">60 FPS &bull; Spoken Blank Verse</span>
        </div>
        <iframe src="${base}player.html?preset=shakespeare" style="width:100%; height:460px; border:none; display:block;" title="Shakespeare Globe Stage"></iframe>
      </div>

      <!-- Play Details & Acts -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.75rem; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
        <h2 style="font-size:1.35rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">${selectedPlay.title}</h2>
        <p style="font-size:0.92rem; color:#64748b; margin:0 0 1.25rem 0; font-style:italic;">${selectedPlay.tagline || ''}</p>

        <div style="display:flex; flex-direction:column; gap:1rem;">
          ${(selectedPlay.acts || []).map(act => `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1.2rem;">
              <strong style="color:#7f1d1d; font-size:1rem; display:block; margin-bottom:4px;">${act.actRoman || 'Act ' + act.act}: ${act.title}</strong>
              <p style="font-size:0.85rem; color:#475569; margin:0 0 8px 0; line-height:1.5;">${act.summary}</p>
              ${act.iconicQuote ? `
                <div style="font-size:0.78rem; background:#fff1f2; border:1px solid #fecdd3; color:#9f1239; padding:6px 10px; border-radius:6px; line-height:1.4;">
                  <strong>Iconic Quote:</strong> "${act.iconicQuote.verse}" (${act.iconicQuote.speaker})
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Play select button listeners
    container.querySelectorAll('.play-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const play = SHAKESPEARE_PLAY_STORIES.find(p => p.id === id);
        if (play) {
          selectedPlay = play;
          render();
        }
      });
    });
  }

  render();
  return container;
}

export default renderShakespearePage;
