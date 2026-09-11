import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('iOS viewport diagnostics', () => {
  it('renders shared viewport evidence without becoming a geometry owner', () => {
    const controller = readFileSync(
      new URL('../src/features/diagnostics/DiagnosticsController.ts', import.meta.url),
      'utf8',
    );
    const evidence = readFileSync(
      new URL('../src/platform/ViewportEvidence.ts', import.meta.url),
      'utf8',
    );

    expect(controller).toContain("from '../../platform/ViewportEvidence'");
    expect(controller).toContain('collectViewportEvidence()');
    expect(controller).toContain('VIEWPORT_EVIDENCE_UNITS');
    expect(controller).not.toContain('measureCssHeight');
    expect(controller).not.toContain('measureSafeArea');
    expect(controller).not.toContain("matchMedia('(display-mode: standalone)')");
    expect(controller).not.toContain('globalThis.visualViewport');
    expect(evidence).toContain("env(safe-area-inset-top,0px)");
    expect(evidence).toContain("globalThis.matchMedia('(display-mode: standalone)')");
    expect(evidence).toContain('resolveDisplayMode(displaySignals)');
    expect(evidence).toContain('resolveRuntimeLane()');
    expect(controller).toContain('viewport-shell-size');
    expect(controller).toContain('game-viewport-size');
    expect(controller).toContain('Обновить viewport-метрики');
    expect(controller).toContain('screen is evidence only');
    expect(controller).not.toContain("getPropertyValue('--physical-viewport-height')");
    expect(controller).not.toContain("style.setProperty('--upds-viewport-height'");
  });
});
