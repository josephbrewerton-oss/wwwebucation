// src/router.ts - Native Micro-Router (Zero Dependencies, Zero React)
export type RouteView = HTMLElement | string;
export type RouteHandler = () => Promise<RouteView>;

function resolveView(mod: any, namedFn?: string): RouteView {
  if (namedFn && typeof mod[namedFn] === 'function') {
    return mod[namedFn]();
  }
  if (typeof mod.default === 'function') {
    return mod.default();
  }
  if (mod.default instanceof HTMLElement) {
    return mod.default;
  }
  if (typeof mod.default === 'string') {
    return mod.default;
  }
  return '';
}

const routes: Record<string, RouteHandler> = {
  '/': () => import('./pages/index').then(m => resolveView(m, 'renderHomePage')),
  '/player': () => import('./pages/media-player').then(m => resolveView(m, 'renderPlayerPage')),
  '/media-player': () => import('./pages/media-player').then(m => resolveView(m, 'renderPlayerPage')),
  '/simulator': () => import('./pages/media-player').then(m => resolveView(m, 'renderPlayerPage')),
  '/catholic-life': () => import('./pages/catholic-life').then(m => resolveView(m, 'renderCatholicLifePage')),
  '/first-communion': () => import('./pages/catholic-life').then(m => resolveView(m, 'renderCatholicLifePage')),
  '/practice-lab': () => import('./pages/practice-lab').then(m => resolveView(m, 'renderPracticePage')),
  '/learning-zone': () => import('./pages/learning-zone').then(m => resolveView(m, 'renderLearningZonePage')),
  '/settings': () => import('./pages/settings').then(m => resolveView(m, 'renderSettingsPage')),
  '/phonics': () => import('./pages/phonics-suite').then(m => resolveView(m, 'renderPhonicsPage')),
  '/languages': () => import('./pages/languages-suite').then(m => resolveView(m, 'renderLanguagesPage')),
  '/shakespeare': () => import('./pages/shakespeare-theatre').then(m => resolveView(m, 'renderShakespearePage')),
  '/news': () => import('./pages/blog').then(m => resolveView(m, 'renderBlogPage')),
  '/blog': () => import('./pages/blog').then(m => resolveView(m, 'renderBlogPage')),
  '/teacher-beacon': () => import('./pages/teacher-beacon').then(m => resolveView(m, 'renderTeacherBeaconPage')),
  '/curriculum-studio': () => import('./pages/curriculum-studio').then(m => resolveView(m, 'renderCurriculumStudioPage')),
  '/licensing': () => import('./pages/licensing').then(m => resolveView(m, 'renderLicensingPage')),
  '/privacy': () => import('./pages/privacy').then(m => resolveView(m, 'renderPrivacyPage')),
  '/child-safety': () => import('./pages/child-safety').then(m => resolveView(m, 'renderChildSafetyPage')),
  '/profile': () => import('./pages/profile').then(m => resolveView(m, 'renderProfilePage')),
};

export function normalizePath(rawPath: string): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  let path = rawPath.split('?')[0].split('#')[0];
  if (base !== '/' && path.startsWith(base)) {
    path = '/' + path.slice(base.length);
  }
  if (!path.startsWith('/')) path = '/' + path;
  path = path.replace(/\/+$/, '') || '/';
  return path;
}

export async function navigate(path: string) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  let targetUrl = path;
  if (!path.startsWith('http://') && !path.startsWith('https://')) {
    if (base !== '/' && !path.startsWith(base)) {
      targetUrl = base + path.replace(/^\//, '');
    }
  }
  window.history.pushState({}, '', targetUrl);
  await handleRouteChange();
}

export const navigateTo = navigate;

export async function handleRouteChange() {
  const normalized = normalizePath(window.location.pathname);
  const outlet = document.getElementById('page-outlet');
  if (!outlet) return;

  const handler = routes[normalized] || routes['/'];
  try {
    const view = await handler();
    if (typeof view === 'string') {
      outlet.innerHTML = view;
    } else if (view instanceof HTMLElement) {
      outlet.innerHTML = '';
      outlet.appendChild(view);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  } catch (err) {
    console.error('Route navigation error:', err);
    outlet.innerHTML = `
      <div style="padding: 3rem 1.5rem; text-align: center; max-width: 600px; margin: 0 auto;">
        <h2 style="font-size: 1.5rem; color: #dc2626; font-weight: 800; margin-bottom: 0.5rem;">Navigation Notice</h2>
        <p style="color: #64748b; margin-bottom: 1.5rem;">An unexpected issue occurred while rendering this curriculum module.</p>
        <button type="button" onclick="window.location.href='${import.meta.env.BASE_URL || '/'}'" style="padding: 8px 16px; background: #0284c7; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
          Return to Portal Home
        </button>
      </div>
    `;
  }
}

export function initRouter() {
  window.addEventListener('popstate', handleRouteChange);

  // Intercept standard anchor clicks
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('a');
    if (
      target &&
      target.href &&
      target.origin === window.location.origin &&
      !target.hasAttribute('download') &&
      target.target !== '_blank'
    ) {
      e.preventDefault();
      const url = new URL(target.href);
      navigate(url.pathname + url.search + url.hash);
    }
  });

  handleRouteChange();
}
