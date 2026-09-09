import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('iOS viewport diagnostics', () => {
  it('exposes independent viewport sources without changing layout geometry', () => {
    const controller = readFileSync(
      new URL('../src/features/diagnostics/DiagnosticsController.ts', import.meta.url),
      'utf8',
    );

    expect(controller).toContain("measureCssHeight('100vh')");
    expect(controller).toContain("measureCssHeight('100dvh')");
    expect(controller).toContain("measureCssHeight('100svh')");
    expect(controller).toContain("measureCssHeight('100lvh')");
    expect(controller).toContain('env(safe-area-inset-top, 0px)');
    expect(controller).toContain('globalThis.visualViewport');
    expect(controller).toContain('globalThis.innerHeight');
    expect(controller).toContain("matchMedia('(display-mode: standalone)')");
    expect(controller).toContain('viewport-shell-size');
    expect(controller).toContain('game-viewport-size');
    expect(controller).toContain('Обновить viewport-метрики');
    expect(controller).not.toContain("style.setProperty('--upds-viewport-height'");
  });
});
