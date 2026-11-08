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
  '/simulations': () => import('./pages/media-player').then(m => resolveView(m, 'renderPlayerPage')),
  '/simulators': () => import('./pages/media-player').then(m => resolveView(m, 'renderPlayerPage')),
  '/simulation': () => import('./pages/media-player').then(m => resolveView(m, 'renderPlayerPage')),
  '/church-tour': () => import('./pages/catholic-life').then(m => resolveView(m, 'renderCatholicLifePage')),
  '/altar': () => import('./pages/catholic-life').then(m => resolveView(m, 'renderCatholicLifePage')),
  '/altar-anatomy': () => import('./pages/catholic-life').then(m => resolveView(m, 'renderCatholicLifePage')),
  '/sanctuary': () => import('./pages/catholic-life').then(m => resolveView(m, 'renderCatholicLifePage')),
  '/latin-prayers': () => import('./pages/catholic-life').then(m => resolveView(m, 'renderCatholicLifePage')),
  '/latin-mass': () => import('./pages/catholic-life').then(m => resolveView(m, 'renderCatholicLifePage')),
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
  '/404': () => import('./pages/not-found').then(m => resolveView(m, 'renderNotFoundPage')),
};

import { getBaseUrl } from './utils/url';
import { resolveHarmonisedRoute } from './utils/harmonisedRouteResolver';
import { getCartridgeByMount } from './services/cartridgeStore';

export function normalizePath(rawPath: string): string {
  const base = getBaseUrl();
  const baseNoSlash = base.replace(/\/+$/, '');
  let path = rawPath.split('?')[0].split('#')[0];
  if (baseNoSlash && (path === baseNoSlash || path === baseNoSlash + '/')) {
    return '/';
  }
  if (base !== '/' && path.startsWith(base)) {
    path = '/' + path.slice(base.length);
  }
  if (!path.startsWith('/')) path = '/' + path;
  path = path.replace(/\/+$/, '') || '/';
  return path;
}

export async function navigate(path: string) {
  const base = getBaseUrl();
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
  let rawCurrentPath = window.location.pathname;
  if (window.location.hash && (normalizePath(rawCurrentPath) === '/' || !routes[normalizePath(rawCurrentPath)])) {
    const rawHash = window.location.hash.split('?')[0].replace(/^#\/?/, '/');
    const cleanHash = normalizePath(rawHash);
    if (routes[cleanHash]) {
      rawCurrentPath = cleanHash;
    }
  }
  const normalized = normalizePath(rawCurrentPath);
  const outlet = document.getElementById('page-outlet');
  if (!outlet) return;

  let handler = routes[normalized];

  if (!handler) {
    // 1. Check if route matches a declared cartridge mount address (e.g. /curriculum/geometry/pythagoras)
    const mountedCartridge = getCartridgeByMount(normalized);
    if (mountedCartridge) {
      window.history.replaceState({}, '', `${getBaseUrl()}player?preset=${mountedCartridge.id}`);
      handler = routes['/player'];
    } else {
      // 2. Check harmonised curriculum route resolver for fuzzy and legacy aliases
      const resolution = resolveHarmonisedRoute(normalized, window.location.search);
      if (resolution && resolution.targetPath && resolution.targetPath !== normalized && resolution.targetPath !== '/') {
        window.history.replaceState({}, '', `${getBaseUrl()}${resolution.targetPath.replace(/^\//, '')}`);
        const resolvedPath = normalizePath(resolution.targetPath);
        handler = routes[resolvedPath] || routes['/404'];
      } else {
        handler = routes['/404'];
      }
    }
  }

  try {
    const view = await handler();
    if (typeof view === 'string') {
      outlet.innerHTML = view;
    } else if (view instanceof HTMLElement) {
      outlet.innerHTML = '';
      outlet.appendChild(view);
    }

    if (window.location.hash) {
      const hashEl = document.querySelector(window.location.hash);
      if (hashEl) {
        hashEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  } catch (err) {
    console.error('Route navigation error:', err);
    outlet.innerHTML = `
      <div style="padding: 3rem 1.5rem; text-align: center; max-width: 600px; margin: 0 auto;">
        <h2 style="font-size: 1.5rem; color: #dc2626; font-weight: 800; margin-bottom: 0.5rem;">Navigation Notice</h2>
        <p style="color: #64748b; margin-bottom: 1.5rem;">An unexpected issue occurred while rendering this curriculum module.</p>
        <button type="button" onclick="window.location.href='${getBaseUrl()}'" style="padding: 8px 16px; background: #0284c7; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
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
      const rawHref = target.getAttribute('href') || '';
      const url = new URL(target.href);

      // Handle in-page fragment/hash navigation smoothly without full page reload
      if (rawHref.startsWith('#') || (url.pathname === window.location.pathname && url.hash)) {
        e.preventDefault();
        const hash = url.hash || rawHref;
        const targetEl = document.querySelector(hash);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', url.pathname + url.search + hash);
        }
        return;
      }

      e.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    }
  });

  handleRouteChange();
}
