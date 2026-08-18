import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { hasPublishedBuildUpdate } from '../src/platform/PwaController';

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('ANM-023G8E1 PWA update reliability', () => {
  it('uses the published application build as update truth instead of service-worker waiting state', () => {
    expect(hasPublishedBuildUpdate('candidate-b', 'candidate-a')).toBe(true);
    expect(hasPublishedBuildUpdate('candidate-a', 'candidate-a')).toBe(false);
    expect(hasPublishedBuildUpdate('', 'candidate-a')).toBe(false);

    const controller = read('src/platform/PwaController.ts');
    expect(controller).toContain("new URL('./build.json', globalThis.location.href)");
    expect(controller).toContain("fetch(url.href, { cache: 'no-store' })");
    expect(controller).toContain('updateAvailable: this.updateAvailable');
    expect(controller).toContain('this.updateAvailable = hasPublishedBuildUpdate(publishedBuild)');
    expect(controller).not.toContain('updateAvailable: this.updateAvailable || Boolean(registration?.waiting)');
    expect(controller).not.toContain('markUpdateAvailable');
  });

  it('emits one lane-relative build identity and keeps it outside the offline cache', () => {
    const config = read('vite.config.ts');
    const worker = read('public/sw.js');
    expect(config).toContain("name: 'upds-build-identity'");
    expect(config).toContain("fileName: 'build.json'");
    expect(config).toContain('JSON.stringify({ buildId, buildTimestamp }');
    expect(worker).toContain("new URL('./build.json', self.registration.scope).pathname");
    expect(worker).toContain('isBuildIdentityRequest');
    expect(worker).toContain("fetch(request, { cache: 'no-store' })");
    expect(worker).toContain('!isBuildIdentityRequest(url)');
  });

  it('guarantees that Update reloads even when no worker is waiting and Later dismisses only that published build', () => {
    const controller = read('src/platform/PwaController.ts');
    const app = read('src/ui/AnimeDetectiveApp.ts');
    expect(controller).toContain('if (!waiting) {');
    expect(controller).toContain('this.reloadPage();');
    expect(controller).toContain("window.setTimeout(() => this.reloadPage(), 600)");
    expect(controller).toContain("waiting.postMessage({ type: 'SKIP_WAITING' })");
    expect(app).toContain('private dismissedPwaBuild: string | null = null');
    expect(app).toContain('pwa.publishedBuild === this.dismissedPwaBuild');
    expect(app).toContain('this.dismissedPwaBuild = pwa.publishedBuild');
  });
});
