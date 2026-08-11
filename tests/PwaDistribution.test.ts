import { readFileSync } from 'node:fs';
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
    expect(worker).toContain("data.type === 'SKIP_WAITING'");
    expect(worker).toContain("data.type !== 'CACHE_URLS'");
    expect(worker).toContain("type: 'CACHE_READY'");
  });

  it('registers the worker at relative scope and warms runtime assets without blocking startup', () => {
    const controller = read('src/platform/PwaController.ts');
    expect(controller).toContain("navigator.serviceWorker.register(`./sw.js?v=${version}`, { scope: './' })");
    expect(controller).toContain("'./manifest.webmanifest', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'");
    expect(controller).toContain("performance.getEntriesByType('resource')");
    expect(controller).toContain("worker.postMessage({ type: 'CACHE_URLS'");
    expect(controller).toContain("waiting.postMessage({ type: 'SKIP_WAITING' })");
  });
});
