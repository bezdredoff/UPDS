import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('PWA distribution contract', () => {
  it('ships a relative-scope installable manifest for both stable root and /preview/', () => {
    const manifest = JSON.parse(read('public/manifest.webmanifest')) as Record<string, unknown>;
    expect(manifest.start_url).toBe('./');
    expect(manifest.scope).toBe('./');
    expect(manifest.display).toBe('standalone');
    expect(manifest.orientation).toBe('portrait');
    expect(JSON.stringify(manifest.icons)).toContain('./icons/icon-192.png');
    expect(JSON.stringify(manifest.icons)).toContain('./icons/icon-512.png');
    const html = read('index.html');
    expect(html).toContain('rel="manifest" href="./manifest.webmanifest"');
    expect(html).toContain('rel="apple-touch-icon" href="./icons/icon-180.png"');
  });

  it('keeps stable service-worker fetch handling out of /preview/ and namespaces lane caches', () => {
    const worker = read('public/sw.js');
    expect(worker).toContain("const lane = isPreview ? 'preview' : 'stable'");
    expect(worker).toContain('const cachePrefix = `upds-${lane}-`');
    expect(worker).toContain('const isStablePreviewRequest');
    expect(worker).toContain('if (!sameOrigin(url) || isStablePreviewRequest(url)) return;');
    expect(worker).toContain('if (isPreview) {');
    expect(worker).toContain("fetch(request, isPreview ? { cache: 'reload' } : undefined)");
    expect(worker).toContain("fetch(request, { cache: 'reload' })");
    expect(worker).toContain("data.type === 'SKIP_WAITING'");
    expect(worker).toContain("data.type !== 'CACHE_URLS'");
    expect(worker).toContain("type: 'CACHE_READY'");
    expect(worker).toContain('const CACHE_WARM_CONCURRENCY = 4');
    expect(worker).toContain('cacheUrlsWithConcurrency(cache, urls)');
    expect(worker).toContain('Math.min(CACHE_WARM_CONCURRENCY, urls.length)');
    expect(worker).not.toContain('Promise.allSettled(urls.map');
  });

  it('counts already-cached assets as ready when an offline warm-up is retried', async () => {
    type CacheMessageEvent = Readonly<{
      data: Readonly<{ type: string; urls: string[] }>;
      waitUntil: (promise: Promise<void>) => void;
    }>;
    const worker = read('public/sw.js');
    const cachedUrl = 'https://game.test/UPDS/assets/ready.png';
    const missingUrl = 'https://game.test/UPDS/assets/missing.png';
    const messages: unknown[] = [];
    const handlers = new Map<string, (event: CacheMessageEvent) => void>();
    let fetchCalls = 0;
    let messageWork: Promise<void> | undefined;
    const cache = {
      match: async (url: string) => url === cachedUrl ? ({}) : undefined,
      put: async () => undefined,
    };
    const context = {
      URL,
      Promise,
      Set,
      Math,
      fetch: async () => { fetchCalls += 1; throw new Error('offline'); },
      caches: { open: async () => cache },
      self: {
        location: { href: 'https://game.test/UPDS/sw.js?v=test', origin: 'https://game.test' },
        registration: { scope: 'https://game.test/UPDS/', active: {} },
        clients: { matchAll: async () => [{ postMessage: (message: unknown) => messages.push(message) }] },
        addEventListener: (name: string, handler: (event: CacheMessageEvent) => void) => handlers.set(name, handler),
      },
    };

    runInNewContext(worker, context);
    handlers.get('message')?.({
      data: { type: 'CACHE_URLS', urls: [cachedUrl, missingUrl] },
      waitUntil: (promise: Promise<void>) => { messageWork = promise; },
    });
    await messageWork;

    expect(fetchCalls).toBe(1);
    expect(messages).toEqual([expect.objectContaining({ type: 'CACHE_READY', cached: 1, failed: 1 })]);
  });

  it('versions the worker by deployment build id and warms runtime assets without blocking startup', () => {
    const controller = read('src/platform/PwaController.ts');
    expect(controller).toContain("import { BUILD_ID } from '../appVersion'");
    expect(controller).toContain('const version = encodeURIComponent(BUILD_ID)');
    expect(controller).toContain("navigator.serviceWorker.register(`./sw.js?v=${version}`, { scope: './' })");
    expect(controller).toContain("'./manifest.webmanifest', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'");
    expect(controller).toContain("performance.getEntriesByType('resource')");
    expect(controller).toContain("worker.postMessage({ type: 'CACHE_URLS', urls, build: BUILD_ID })");
    expect(controller).toContain("waiting.postMessage({ type: 'SKIP_WAITING' })");
  });
});
