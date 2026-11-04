import { parseSExpr } from '../utils/sexprParser';

interface CartridgeRoute {
  id: string;
  title: string;
  mount: string;
  tier?: string;
}

export function renderHomePage(): HTMLElement {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  const container = document.createElement('div');
  container.className = 'home-landing-stage';
  container.style.cssText = 'padding: 3rem 1.5rem; max-width: 1140px; margin: 0 auto;';

  // 1. Initial State
  let activePreset = 'welcome';
  let cartridges: CartridgeRoute[] = [
    { id: 'welcome', title: 'Welcome to AST Vector Player', mount: '/curriculum/general/welcome' },
    { id: 'church-tour', title: 'Tour of a Catholic Church', mount: '/curriculum/religious/church-tour' },
    { id: 'altar-anatomy', title: 'The Catholic Altar', mount: '/curriculum/science/altar-anatomy' },
    { id: 'kinetic-gas', title: 'Kinetic Gas Theory', mount: '/curriculum/science/kinetic-gas' },
    { id: 'pythagoras', title: "Pythagoras' Theorem", mount: '/curriculum/mathematics/pythagoras' },
    { id: 'fractions', title: 'Fractions', mount: '/curriculum/mathematics/fractions' },
    { id: 'electric-circuits', title: 'Electrical Circuits', mount: '/curriculum/science/electric-circuits' },
    { id: 'solar-system', title: 'Solar System', mount: '/curriculum/science/solar-system' },
    { id: 'algebra-balance', title: 'Algebraic Balance Scale', mount: '/curriculum/mathematics/algebra-balance' },
    { id: 'bbc-model-b', title: 'BBC Micro Model B', mount: '/curriculum/computing/bbc-model-b' },
    { id: 'bsl-fingerspelling', title: 'BSL Fingerspelling', mount: '/curriculum/english/bsl-fingerspelling' }
  ];

  // 2. Render Semantic Shell
  container.innerHTML = `
    <header style="text-align: center; margin-bottom: 3.5rem;">
      <div style="margin-bottom: 1.25rem; display: flex; gap: 8px; justify-content: center; font-size: 0.85rem; color: #64748b;">
        <span style="color: #16a34a; font-weight: 600;">Education should be free</span> · 
        <span>UK National Curriculum</span> · 
        <span>Works Offline</span> · 
        <a href="${base}news" style="color: #0284c7; font-weight: 600; text-decoration: none;">AST Vector Player Release →</a>
      </div>
      <h1 style="font-size: 2.75rem; font-weight: 800; color: #0f172a; margin: 0 0 1rem; letter-spacing: -0.025em;">
        Learn with Confidence at St Joseph's
      </h1>
      <p style="font-size: 1.15rem; color: #475569; max-width: 720px; margin: 0 auto 2.25rem; line-height: 1.6;">
        Interactive practice with instant feedback, step-by-step clues, and diagnostic mistake checks.
      </p>
      <div style="display: flex; gap: 0.85rem; justify-content: center; flex-wrap: wrap;">
        <a href="${base}player" style="padding: 10px 22px; background: #0284c7; color: #fff; border-radius: 8px; font-weight: 700; text-decoration: none;">
          🎮 Launch Simulator Studio →
        </a>
        <a href="#featured-simulations" style="padding: 10px 20px; background: #0f172a; color: #fff; border-radius: 8px; font-weight: 700; text-decoration: none;">
          Live Stage Demo ↓
        </a>
      </div>
    </header>

    <!-- Stage Simulation Viewport -->
    <section id="featured-simulations" style="background: #090d16; border-radius: 16px; border: 1px solid #1e293b; padding: 1.25rem; margin-bottom: 3rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #1e293b;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.4rem;">🎮</span>
          <div>
            <span style="display: block; font-size: 0.74rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;">Curriculum Simulation Selector</span>
            <strong style="font-size: 0.98rem; color: #f8fafc;">Live Apparatus Stage</strong>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <select id="sim-selector" aria-label="Select Curriculum Simulation" style="padding: 8px 14px; border-radius: 8px; background: #1e293b; color: #fff; border: 1.5px solid #0284c7; font-weight: 700; font-size: 0.86rem; cursor: pointer;">
          </select>
          <a href="${base}player" style="padding: 7px 12px; font-size: 0.78rem; background: #334155; color: #ffffff; border-radius: 6px; text-decoration: none; font-weight: 700;">↗ Fullscreen</a>
        </div>
      </div>

      <nav id="sim-pill-nav" aria-label="Quick simulation selector" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;"></nav>

      <div style="border-radius: 12px; overflow: hidden; min-height: 480px; background: #090d16;">
        <iframe 
          id="stage-viewport"
          src="${base}player.html?preset=welcome" 
          style="width: 100%; height: 480px; border: none; display: block;" 
          title="Featured Interactive Simulation">
        </iframe>
      </div>
    </section>
  `;

  // 3. Elements
  const iframe = container.querySelector<HTMLIFrameElement>('#stage-viewport');
  const select = container.querySelector<HTMLSelectElement>('#sim-selector');
  const pillNav = container.querySelector<HTMLElement>('#sim-pill-nav');

  function updateActivePreset(id: string) {
    activePreset = id;
    if (iframe) iframe.src = `${base}player.html?preset=${id}`;
    if (select) select.value = id;

    // Update pill buttons visual state
    pillNav?.querySelectorAll<HTMLButtonElement>('.sim-pill').forEach((btn) => {
      const isSelected = btn.dataset.id === id;
      btn.style.background = isSelected ? '#0284c7' : '#1e293b';
      btn.style.color = isSelected ? '#ffffff' : '#94a3b8';
      btn.style.borderColor = isSelected ? '#38bdf8' : '#334155';
    });
  }

  function renderSelectors() {
    if (!select || !pillNav) return;

    // Dropdown options
    select.innerHTML = cartridges.map(c => `
      <option value="${c.id}" ${c.id === activePreset ? 'selected' : ''}>${c.title}</option>
    `).join('');

    // Quick selection pills
    pillNav.innerHTML = cartridges.slice(0, 10).map(c => `
      <button type="button" class="sim-pill" data-id="${c.id}" style="background: ${c.id === activePreset ? '#0284c7' : '#1e293b'}; color: ${c.id === activePreset ? '#ffffff' : '#94a3b8'}; border: 1px solid ${c.id === activePreset ? '#38bdf8' : '#334155'}; border-radius: 9999px; padding: 4px 12px; font-size: 0.74rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease;">
        ${c.title.split(':')[0]}
      </button>
    `).join('');

    // Re-attach listeners
    pillNav.querySelectorAll<HTMLButtonElement>('.sim-pill').forEach(btn => {
      btn.onclick = () => btn.dataset.id && updateActivePreset(btn.dataset.id);
    });
  }

  select?.addEventListener('change', (e) => {
    updateActivePreset((e.target as HTMLSelectElement).value);
  });

  // 4. Async Ingestion from sitemap.ast (falls back instantly to local list if offline)
  fetch(`${base}sitemap.ast`)
    .then(r => r.ok ? r.text() : Promise.reject())
    .then(raw => {
      const ast = parseSExpr(raw);
      // Find (:cartridges (...)) section in the AST
      const cartridgeNode = ast.find((node: any) => node[0] === ':sitemap')
        ?.find((sub: any) => sub[0] === ':cartridges');

      if (cartridgeNode && Array.isArray(cartridgeNode[1])) {
        cartridges = cartridgeNode[1].map((c: any) => ({
          id: c.find((attr: any) => attr[0] === ':id')?.[1] || '',
          title: c.find((attr: any) => attr[0] === ':title')?.[1] || '',
          mount: c.find((attr: any) => attr[0] === ':mount')?.[1] || '',
          tier: c.find((attr: any) => attr[0] === ':tier')?.[1] || 'core'
        })).filter((c: CartridgeRoute) => c.id);

        renderSelectors();
      }
    })
    .catch(() => {
      // Fallback is already loaded
    });

  renderSelectors();
  return container;
}

export default renderHomePage;
