/**
 * Ops Handbook Service Worker
 *
 * Caching Strategy:
 * - HTML Pages: Network-First with Cache Fallback (online users always get fresh content).
 * - Content-Hashed Bundles (/_astro/*): Cache-First (immutable assets with content hashes).
 * - Static Assets (icons, logos, images, fonts): Network-First with Cache Fallback (prefers fresh assets online).
 * - Search Index (/search-index.json): Network-First with Cache Fallback.
 * - Shell Assets & Offline Fallback (/offline.html): Pre-cached on install.
 *
 * Cache Limits:
 * - Documentation pages: Max 20 pages.
 * - Static assets: Max 100 assets.
 * - Serialized FIFO (First-In, First-Out) eviction based on Cache Storage insertion order.
 */

const CACHE_VERSION = 'v1';
const SHELL_CACHE = `ops-handbook-shell-${CACHE_VERSION}`;
const PAGES_CACHE = `ops-handbook-pages-${CACHE_VERSION}`;
const ASSETS_CACHE = `ops-handbook-assets-${CACHE_VERSION}`;

const CURRENT_CACHES = [SHELL_CACHE, PAGES_CACHE, ASSETS_CACHE];

const PRECACHE_SHELL = [
  '/offline.html',
  '/manifest.webmanifest',
  '/logo/mark-light.svg',
  '/logo/mark-dark.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
];

const MAX_PAGES = 20;
const MAX_ASSETS = 100;

// Serialized FIFO cache eviction queue to prevent concurrent race conditions
let trimQueue = Promise.resolve();

function queueTrim(cacheName, maxItems) {
  trimQueue = trimQueue.catch(() => {}).then(async () => {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      if (keys.length > maxItems) {
        const excess = keys.length - maxItems;
        for (let i = 0; i < excess; i++) {
          await cache.delete(keys[i]);
        }
      }
    } catch (err) {
      console.warn(`[SW] Cache trim error for ${cacheName}:`, err);
    }
  });
  return trimQueue;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_SHELL))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] Shell precache failed:', err);
      }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('ops-handbook-') && !CURRENT_CACHES.includes(name))
            .map((name) => caches.delete(name)),
        );
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests from the same origin
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 1. Navigation requests (HTML pages) — Network-First with Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Never cache failed responses, error pages, or non-HTML responses
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic' &&
            networkResponse.headers.get('content-type')?.includes('text/html')
          ) {
            const clone = networkResponse.clone();
            event.waitUntil(
              (async () => {
                try {
                  const cache = await caches.open(PAGES_CACHE);
                  await cache.put(request, clone);
                  await queueTrim(PAGES_CACHE, MAX_PAGES);
                } catch (e) {
                  // Ignore background cache write errors
                }
              })(),
            );
          }
          return networkResponse;
        })
        .catch(async () => {
          // Network failed (offline or network error) — fallback to cache
          const cache = await caches.open(PAGES_CACHE);
          let cachedResponse = await cache.match(request);

          // If not matched directly, check with/without trailing slash
          if (!cachedResponse) {
            const pathname = url.pathname;
            const alternatePath = pathname.endsWith('/')
              ? pathname.slice(0, -1)
              : `${pathname}/`;
            cachedResponse = await cache.match(alternatePath);
          }

          if (cachedResponse) {
            return cachedResponse;
          }

          // Page not cached: serve branded offline fallback
          const shellCache = await caches.open(SHELL_CACHE);
          const fallback = await shellCache.match('/offline.html');
          return (
            fallback ||
            new Response('Ops Handbook is currently offline.', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            })
          );
        }),
    );
    return;
  }

  // 2. Search index — Network-First with Cache Fallback
  if (url.pathname === '/search-index.json') {
    event.respondWith(
      fetch(request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            event.waitUntil(
              (async () => {
                try {
                  const cache = await caches.open(ASSETS_CACHE);
                  await cache.put(request, clone);
                  await queueTrim(ASSETS_CACHE, MAX_ASSETS);
                } catch (e) {}
              })(),
            );
            return networkResponse;
          }
          const cached = await caches.match(request);
          if (cached) return cached;
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return (
            cached ||
            new Response('[]', {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }),
    );
    return;
  }

  // 3. Immutable content-hashed Astro bundles (/_astro/*) — Cache-First with Network Fallback
  if (url.pathname.startsWith('/_astro/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            event.waitUntil(
              (async () => {
                try {
                  const cache = await caches.open(ASSETS_CACHE);
                  await cache.put(request, clone);
                  await queueTrim(ASSETS_CACHE, MAX_ASSETS);
                } catch (e) {}
              })(),
            );
          }
          return networkResponse;
        });
      }),
    );
    return;
  }

  // 4. Mutable static brand assets (icons, logo, og image, web fonts) — Network-First with Cache Fallback
  // Prefers fresh assets online so brand/image updates reflect immediately on deployment.
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/logo/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/og/') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      fetch(request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            event.waitUntil(
              (async () => {
                try {
                  const cache = await caches.open(ASSETS_CACHE);
                  await cache.put(request, clone);
                  await queueTrim(ASSETS_CACHE, MAX_ASSETS);
                } catch (e) {}
              })(),
            );
            return networkResponse;
          }

          // Network returned an unsuccessful status (e.g. 500, 404):
          // Check if a valid cached response exists
          const cached = await caches.match(request);
          if (cached) return cached;

          // No cached response exists: return the original network response
          return networkResponse;
        })
        .catch(async (fetchError) => {
          // Network failed completely (offline, DNS failure, connection refused):
          const cached = await caches.match(request);
          if (cached) return cached;

          // Propagate the fetch error rather than fabricating a misleading 404
          throw fetchError;
        }),
    );
    return;
  }

  // All other requests (e.g. /pdf/*, /rss.xml, /sitemap.xml) pass through directly to network
  event.respondWith(fetch(request));
});
