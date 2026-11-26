// static/sw.js
// Ultra-Low-Bandwidth Offline Engine & Service Worker for St Joseph's Learning Portal
// Designed for developing nations, metered data plans, and air-gapped schools.
// Cache key is bound directly to the curriculum composite digest for content-addressed immutability.
const MANIFEST_HASH = '471b04099997';
const CACHE_NAME = `stj-manifest-v-${MANIFEST_HASH}`;

// Critical core assets to pre-cache on install for instant offline boot
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './manifest-digests.json',
  './favicon.ico',
  './img/logo.svg',
  './img/logo.png',
  './img/logo-512.png',
  './img/favicon-32x32.png',
  './img/favicon-16x16.png',
  './img/apple-touch-icon.png',
  './nano-map.ast',
  './patterns/mcq.ast',
  './patterns/fill-blank.ast',
  './patterns/numeric.ast',
  './patterns/pair-sort.ast',
  './patterns/harmony.ast',
  './manifests/catalog.json',
  './manifests/rag-index.json',
  './player.html',
  './player/index.html',
  './player/player.css',
  './player/ast-lazy-loader.js',
  './player/ast-local-store.js',
  './player/ast-render-boundary.js',
  './player/ast-compiler.js',
  './player/ast-phet-bridge.js',
  './player/ast-event-bus.js',
  './player/ast-avm1-vm.js',
  './player/ast-avm2-vm.js',
  './player/ast-registry.js',
  './player/ast-profiler.js',
  './player/ast-audio-speech.js',
  './player/ast-physics.js',
  './player/ast-expr.js',
  './player/ast-bytecode-decoder.js',
  './player/ast-parser.js',
  './player/ast-3d.js',
  './player/ast-bridge-playback.js',
  './player/ast-bridge-cartridge.js',
  './player/ast-bridge-telemetry.js',
  './player/ast-bridge.js',
  './player/ast-exporter.js',
  './player/ast-hud-controls.js',
  './player/ast-ai-director.js',
  './player/ast-file-ingest.js',
  './player/ast-svg-integrity.js',
  './player/ast-loader.js',
  './player/ast-state-scorm.js',
  './player/ast-lab-telemetry.js',
  './player/ast-scene-mount.js',
  './player/ast-binding-runtime.js',
  './player/ast-engine.js',
  './player/ast-webrtc-bus.js',
  './player/obs-controller.js',
  './player/player-ui-studio-matcher.js',
  './player/player-ui-studio-remix.js',
  './player/player-ui-studio.js',
  './player/player-ui-checkpoints.js',
  './player/player-ui-voice.js',
  './player/player-ui-broadcast.js',
  './player/player-ui-display.js',
  './player/player-ui-controls.js',
  './player/player-ui-events.js',
  './player/player-ui.js',
  './player/site-gestures-profile.js',
  './player/site-gestures-whiteboard.js',
  './player/site-gestures-hud.js',
  './player/site-gestures-actions.js',
  './player/site-gestures-input.js',
  './player/site-gestures.js',
  './player/player-gestures.ast'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Precache in small batches of 4 using HTTP cache so foreground fetches are never starved
      const batchSize = 4;
      for (let i = 0; i < PRECACHE_ASSETS.length; i += batchSize) {
        const batch = PRECACHE_ASSETS.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map((url) =>
            fetch(url)
              .then((res) => {
                if (res.ok) return cache.put(url, res);
              })
              .catch(() => {})
          )
        );
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if ('navigationPreload' in self.registration) {
        try {
          await self.registration.navigationPreload.enable();
        } catch {}
      }
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CACHE_URLS' && Array.isArray(event.data.urls)) {
    caches.open(CACHE_NAME).then((cache) => {
      event.data.urls.forEach((u) => {
        fetch(u).then((r) => {
          if (r.ok) cache.put(u, r);
        }).catch(() => {});
      });
    });
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept non-http protocols, crawler/agent discovery text files, or Vite dev server internals
  if (
    url.protocol !== 'http:' && url.protocol !== 'https:' ||
    url.pathname.endsWith('/llms.txt') ||
    url.pathname.endsWith('/llms-full.txt') ||
    url.pathname.endsWith('/agents.txt') ||
    url.pathname.endsWith('/robots.txt') ||
    url.pathname.endsWith('/sitemap.xml') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.search.includes('v=') ||
    url.search.includes('t=') ||
    url.search.includes('import') ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname.endsWith('.run.app') ||
    url.hostname.endsWith('.usercontent.goog') ||
    url.hostname.endsWith('.webcontainer.io') ||
    url.hostname.endsWith('.local')
  ) {
    return;
  }

  // Navigation requests (HTML pages): Network-first with Navigation Preload for sub-100ms mobile FCP
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // 1. Check if browser parallel preloaded the network response
          const preload = await event.preloadResponse;
          if (preload && preload.ok) {
            const clone = preload.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('./index.html', clone.clone());
              cache.put(request, clone);
            }).catch(() => {});
            return preload;
          }

          // 2. Direct network fetch
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('./index.html', clone.clone());
              cache.put(request, clone);
            }).catch(() => {});
          }
          return networkResponse;
        } catch {
          // 3. Instant offline fallback
          const cachedShell =
            (await caches.match('./index.html')) ||
            (await caches.match(request)) ||
            (await caches.match('./'));
          if (cachedShell) return cachedShell;
          return new Response('Offline Portal Ready', {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
          });
        }
      })()
    );
    return;
  }

  // Cache-First Strategy for all static assets (scripts, styles, player runtime, images, manifests, AST files)
  // This guarantees 0 bytes of cellular data and zero background network calls once cached.
  // This guarantees 0 bytes of cellular data are used for any asset already stored on the device.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not yet in cache, fetch once from network, clone into cache, then return
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback
          const fallback = await caches.match(request);
          if (fallback) return fallback;
          return new Response('Asset offline', { status: 503, statusText: 'Offline Resource' });
        });
    })
  );
});
