/**
 * Resolves the application base path reliably across all deployment environments:
 * - GitHub Pages with any repository name (e.g. https://username.github.io/repo-name/)
 * - Custom domain root deployments (e.g. https://stjoseph.school/)
 * - AI Studio preview environments
 * - Local development
 */
export function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return (import.meta.env?.BASE_URL || '/').replace(/\/?$/, '/');
  }

  // 1. Explicit global runtime override if set
  if ((window as any).__AST_BASE_URL__) {
    return String((window as any).__AST_BASE_URL__).replace(/\/?$/, '/');
  }

  const currentPath = window.location.pathname;

  // 2. Auto-detect GitHub Pages repository name from pathname if hosted on github.io
  const hostname = window.location.hostname;
  if (hostname === 'github.io' || hostname.endsWith('.github.io')) {
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length > 0) {
      return `/${parts[0]}/`;
    }
    return '/';
  }

  // 3. If import.meta.env.BASE_URL is explicitly configured and matches the path
  const configuredBase = import.meta.env?.BASE_URL;
  if (configuredBase && configuredBase !== '/' && configuredBase !== './') {
    const cleanConfigured = configuredBase.replace(/\/?$/, '/');
    if (currentPath.startsWith(cleanConfigured) || (currentPath + '/') === cleanConfigured) {
      return cleanConfigured;
    }
  }

  return (configuredBase && configuredBase !== './' ? configuredBase : '/').replace(/\/?$/, '/');
}

/**
 * Resolves a public static asset URL relative to the active base path.
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = getBaseUrl().replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return base + cleanPath;
}

