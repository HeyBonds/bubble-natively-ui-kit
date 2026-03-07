// Static service worker — upload once to Bubble, never needs updating.
// Uses stale-while-revalidate for bundles: serves cached version instantly,
// fetches fresh copy in background, updates cache for next visit.
const CACHE_NAME = 'bonds-app-cache';

// Derive base path from the service worker's own location.
// Test branch: /version-434vi/service-worker.js → basePath = /version-434vi/
// Live:        /service-worker.js                → basePath = /
const basePath = self.location.pathname.replace(/service-worker\.js$/, '');

// Assets to cache (relative to service worker location).
const ASSET_NAMES = ['bundle.js', 'bundle.css'];
const ASSET_URLS = ASSET_NAMES.map((name) => basePath + name);

// Immutable external assets — cache-first (safe to cache forever).
// Note: these rules only apply when the browser sends a CORS request.
// Plain <script>/<link> tags without `crossorigin` produce opaque responses
// (status 0, not ok) which bypass our caching — the browser's HTTP cache
// handles them instead. This is correct behavior.
const IMMUTABLE_ORIGINS = [
  'https://fonts.gstatic.com',
  'https://0fc323560b9c4d8afc3a7d487716abb6.cdn.bubble.io',
  'https://d2tf8y1b8kxrzw.cloudfront.net',
  'https://meta.cdn.bubble.io',
];

// Mutable third-party scripts — stale-while-revalidate (serve cached, refresh in background).
// These CDNs may update script content at the same URL.
const MUTABLE_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://cdn.mxpnl.com',
  'https://connect.facebook.net',
  'https://scripts.clarity.ms',
  'https://www.clarity.ms',
  'https://www.googletagmanager.com',
];

// --- Install: precache bundle assets ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching bundle assets at', basePath);
      return cache.addAll(ASSET_URLS);
    }).then(() => self.skipWaiting())
  );
});

// --- Activate: delete old caches (migrates from old versioned caches), take control ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
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

  // 1. Same-origin bundles → stale-while-revalidate
  //    Serve cached instantly, fetch fresh in background, update cache for next visit.
  if (url.origin === self.location.origin && ASSET_URLS.includes(url.pathname)) {
    const networkUpdate = fetch(event.request, { cache: 'no-cache' })
      .then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, response.clone());
        }
        return response;
      })
      .catch(() => null);

    // Keep SW alive until background fetch + cache write completes
    event.waitUntil(networkUpdate);

    event.respondWith(
      caches.open(CACHE_NAME)
        .then((cache) => cache.match(event.request))
        .then((cached) => {
          if (cached) return cached;
          // No cache (first visit) — wait for network
          return networkUpdate.then((r) =>
            r || new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
          );
        })
    );
    return;
  }

  // 2. Bubble framework scripts (/package/*) → cache-first
  //    URLs contain content hashes, so they're immutable — safe to cache forever.
  //    e.g. /package/static_js/<hash>/static.js, /package/dynamic_js/<hash>/dynamic.js
  if (url.origin === self.location.origin && url.pathname.startsWith('/package/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
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

  // 3. Immutable external assets (fonts, CDN images) → cache-first
  if (IMMUTABLE_ORIGINS.some((origin) => url.href.startsWith(origin))) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
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

  // 4. Mutable third-party scripts (analytics, tracking) → stale-while-revalidate
  //    Serve cached instantly, fetch fresh in background for next visit.
  if (MUTABLE_ORIGINS.some((origin) => url.href.startsWith(origin))) {
    const networkUpdate = fetch(event.request)
      .then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, response.clone());
        }
        return response;
      })
      .catch(() => null);

    event.waitUntil(networkUpdate);

    event.respondWith(
      caches.open(CACHE_NAME)
        .then((cache) => cache.match(event.request))
        .then((cached) => {
          if (cached) return cached;
          return networkUpdate.then((r) =>
            r || new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
          );
        })
    );
    return;
  }

  // 5. Everything else (Bubble HTML, API calls) → network only, no caching
});
