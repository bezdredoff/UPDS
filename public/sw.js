/* ANM-017 UPDS service worker: stable/preview-safe offline cache. */
const scriptUrl = new URL(self.location.href);
const build = scriptUrl.searchParams.get('v') || 'unknown';
const scopeUrl = new URL(self.registration.scope);
const scopePath = scopeUrl.pathname.endsWith('/') ? scopeUrl.pathname : `${scopeUrl.pathname}/`;
const isPreview = /\/preview\/$/.test(scopePath);
const lane = isPreview ? 'preview' : 'stable';
const cachePrefix = `upds-${lane}-`;
const cacheName = `${cachePrefix}${build}`;
const previewPath = `${scopePath}preview/`;
const buildIdentityPath = new URL('./build.json', self.registration.scope).pathname;

const sameOrigin = (url) => url.origin === self.location.origin;
const isStablePreviewRequest = (url) => !isPreview && url.pathname.startsWith(previewPath);
const isBuildIdentityRequest = (url) => url.pathname === buildIdentityPath;

const CACHE_WARM_CONCURRENCY = 4;

const cacheOne = async (cache, url) => {
  try {
    const response = await fetch(url.href, { cache: 'reload' });
    if (!(response.ok || response.type === 'opaque')) return false;
    await cache.put(url.href, response.clone());
    return true;
  } catch {
    return false;
  }
};

const cacheUrlsWithConcurrency = async (cache, urls) => {
  let cursor = 0;
  let cached = 0;
  const worker = async () => {
    while (cursor < urls.length) {
      const url = urls[cursor];
      cursor += 1;
      if (await cacheOne(cache, url)) cached += 1;
    }
  };
  const workerCount = Math.min(CACHE_WARM_CONCURRENCY, urls.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return cached;
};

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await Promise.allSettled([
      cache.add(new URL('./', self.registration.scope).href),
      cache.add(new URL('./index.html', self.registration.scope).href),
      cache.add(new URL('./manifest.webmanifest', self.registration.scope).href),
    ]);
    if (!self.registration.active) await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(cachePrefix) && key !== cacheName).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (data.type !== 'CACHE_URLS' || !Array.isArray(data.urls)) return;
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    const urls = [...new Set(data.urls)].map((value) => {
      try { return new URL(value, self.registration.scope); } catch { return null; }
    }).filter(Boolean).filter(sameOrigin).filter((url) => !isStablePreviewRequest(url) && !isBuildIdentityRequest(url));
    const cached = await cacheUrlsWithConcurrency(cache, urls);
    const failed = Math.max(0, urls.length - cached);
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    for (const client of clients) client.postMessage({ type: 'CACHE_READY', build, lane, cached, failed });
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!sameOrigin(url) || isStablePreviewRequest(url)) return;

  if (isBuildIdentityRequest(url)) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, isPreview ? { cache: 'reload' } : undefined);
        if (response.ok) {
          const cache = await caches.open(cacheName);
          await cache.put(new URL('./index.html', self.registration.scope).href, response.clone());
        }
        return response;
      } catch {
        const cache = await caches.open(cacheName);
        return (await cache.match(request))
          || (await cache.match(new URL('./index.html', self.registration.scope).href))
          || (await cache.match(new URL('./', self.registration.scope).href))
          || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (isPreview) {
      try {
        const response = await fetch(request, { cache: 'reload' });
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch {
        return cached || Response.error();
      }
    }
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      return cached || Response.error();
    }
  })());
});
