import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resolveDisplayMode, resolveRuntimeLane } from '../src/platform/PlatformIdentity';

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('G2a-ARCH-007 platform identity', () => {
  it('resolves standalone from either supported browser signal', () => {
    expect(resolveDisplayMode({ navigatorStandalone: true, mediaStandalone: false })).toBe('standalone');
    expect(resolveDisplayMode({ navigatorStandalone: false, mediaStandalone: true })).toBe('standalone');
    expect(resolveDisplayMode({ navigatorStandalone: false, mediaStandalone: false })).toBe('browser');
  });

  it('uses one exact preview path boundary for bootstrap and PWA identity', () => {
    expect(resolveRuntimeLane('/UPDS/preview/', 'https:')).toBe('preview');
    expect(resolveRuntimeLane('/UPDS/preview', 'https:')).toBe('preview');
    expect(resolveRuntimeLane('/UPDS/preview/story', 'https:')).toBe('preview');
    expect(resolveRuntimeLane('/UPDS/previewish', 'https:')).toBe('stable');
    expect(resolveRuntimeLane('/UPDS/', 'https:')).toBe('stable');
    expect(resolveRuntimeLane('/UPDS/', 'file:')).toBe('local');
  });

  it('keeps display mode and runtime lane resolution in one platform module', () => {
    const identity = read('src/platform/PlatformIdentity.ts');
    const viewport = read('src/platform/ViewportRuntime.ts');
    const pwa = read('src/platform/PwaController.ts');
    const main = read('src/main.ts');
    const diagnostics = read('src/features/diagnostics/DiagnosticsController.ts');

    expect(identity).toContain("matchMedia('(display-mode: standalone)')");
    expect(identity).toContain('/\\/preview(?:\\/|$)/');
    expect(viewport).toContain('resolveDisplayMode()');
    expect(viewport).not.toContain("matchMedia('(display-mode: standalone)')");
    expect(pwa).toContain('resolveDisplayMode()');
    expect(pwa).toContain('resolveRuntimeLane()');
    expect(pwa).not.toContain('laneForPath');
    expect(pwa).not.toContain("matchMedia('(display-mode: standalone)')");
    expect(main).toContain('resolveRuntimeLane(pathname');
    expect(main).not.toContain('/\\/preview(?:\\/|$)/');
    expect(diagnostics).toContain('resolveDisplayMode()');
    expect(diagnostics).toContain('resolveRuntimeLane()');
  });
});
