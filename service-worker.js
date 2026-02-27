// Bump this on every deploy to invalidate the old cache.
const CACHE_VERSION = 'bonds-20260226-1720';

// Derive base path from the service worker's own location.
// Test branch: /version-434vi/service-worker.js → basePath = /version-434vi/
// Live:        /service-worker.js                → basePath = /
const basePath = self.location.pathname.replace(/service-worker\.js$/, '');

// Assets to precache (relative to service worker location).
const ASSET_NAMES = ['bundle.js', 'bundle.css'];
const PRECACHE_URLS = ASSET_NAMES.map((name) => basePath + name);

// External origins to cache on first fetch (runtime cache, cache-first).
const CACHEABLE_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://0fc323560b9c4d8afc3a7d487716abb6.cdn.bubble.io',
];

// --- Install: precache bundle assets ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('[SW] Precaching bundle assets at', basePath);
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// --- Activate: delete old caches, take control ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// --- Fetch: route by request type ---
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Same-origin static assets (bundle.js, bundle.css) → cache-first
  if (url.origin === self.location.origin && PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // 2. External assets (Google Fonts, Bubble CDN images) → cache-first (runtime cached on first fetch)
  if (CACHEABLE_ORIGINS.some((origin) => url.href.startsWith(origin))) {
    event.respondWith(
      caches.open(CACHE_VERSION).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // 3. Everything else (Bubble HTML, API calls) → network only, no caching
});
