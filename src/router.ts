// src/router.ts - Native Micro-Router (30 lines, zero dependencies)
type RouteHandler = () => Promise<HTMLElement | string>;

// src/router.ts - Flexible Native Micro-Router
type RouteHandler = () => Promise<HTMLElement | string>;

const routes: Record<string, RouteHandler> = {
  '/': () => import('./pages/index').then(m => m.renderHomePage ? m.renderHomePage() : (m.default ? String(m.default) : '')),
  '/player': () => import('./pages/media-player').then(m => m.renderPlayerPage ? m.renderPlayerPage() : (m.default ? String(m.default) : '')),
  '/practice-lab': () => import('./pages/practice-lab').then(m => m.renderPracticePage ? m.renderPracticePage() : (m.default ? String(m.default) : '')),
  '/learning-zone': () => import('./pages/learning-zone').then(m => m.renderLearningZonePage ? m.renderLearningZonePage() : (m.default ? String(m.default) : '')),
  '/settings': () => import('./pages/settings').then(m => m.renderSettingsPage ? m.renderSettingsPage() : (m.default ? String(m.default) : '')),
};

export async function navigate(path: string) {
  window.history.pushState({}, '', path);
  await handleRouteChange();
}

export async function handleRouteChange() {
  const path = window.location.pathname || '/';
  const outlet = document.getElementById('page-outlet');
  if (!outlet) return;

  const handler = routes[path] || routes['/'];
  try {
    const view = await handler();
    if (typeof view === 'string') {
      outlet.innerHTML = view;
    } else {
      outlet.innerHTML = '';
      outlet.appendChild(view);
    }
    outlet.scrollTop = 0;
  } catch (err) {
    console.error('Route navigation error:', err);
  }
}

export function initRouter() {
  window.addEventListener('popstate', handleRouteChange);
  // Intercept normal anchor clicks
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('a');
    if (target && target.href && target.origin === window.location.origin && !target.hasAttribute('download')) {
      e.preventDefault();
      navigate(target.pathname + target.search + target.hash);
    }
  });
  handleRouteChange();
}
