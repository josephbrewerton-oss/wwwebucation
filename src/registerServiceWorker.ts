// src/registerServiceWorker.ts
// PWA Service Worker Registration & Lifecycle Management
import { getAssetUrl } from './utils/url';

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Defer SW registration until post-load idle so critical navigation & agent discovery fetches (/llms.txt) finish uncongested
  window.addEventListener('load', () => {
    const mountSw = () => {
      const swUrl = getAssetUrl('/sw.js');

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('[PWA] Service Worker active. Offline-first zero-data engine initialized.');

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('[PWA] Stored new curriculum substrate on device. Activating update...');
                  installingWorker.postMessage({ type: 'SKIP_WAITING' });
                } else {
                  console.log('[PWA] Content is permanently stored on device for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration note:', error);
        });
    };

    setTimeout(() => {
      if ('requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
          .requestIdleCallback(mountSw, { timeout: 4000 });
      } else {
        mountSw();
      }
    }, 2500);
  });
}
