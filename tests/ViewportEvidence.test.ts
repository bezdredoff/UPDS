import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { VIEWPORT_EVIDENCE_UNITS } from '../src/platform/ViewportEvidence';

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('G2a-ARCH-008 shared viewport evidence', () => {
  it('keeps one bounded CSS-height/safe-area probe contract', () => {
    expect(VIEWPORT_EVIDENCE_UNITS).toEqual(['vh', 'dvh', 'svh', 'lvh']);
    const evidence = read('src/platform/ViewportEvidence.ts');
    expect(evidence).toContain("probeHost.dataset.viewportDebug = 'evidence-probes'");
    expect(evidence).toContain('contain:strict');
    expect(evidence).toContain('height:100${unit}');
    expect(evidence).toContain('env(safe-area-inset-top,0px)');
  });

  it('makes Diagnostics and ViewportDebug consumers of the same read-only snapshot', () => {
    const diagnostics = read('src/features/diagnostics/DiagnosticsController.ts');
    const debug = read('src/platform/ViewportDebug.ts');
    expect(diagnostics).toContain('collectViewportEvidence()');
    expect(debug).toContain('collectViewportEvidence()');
    expect(debug).toContain('prepareViewportEvidence()');
    expect(debug).not.toContain("probes.get('safe')");
    expect(debug).not.toContain('const probes = new Map');
    expect(diagnostics).not.toContain('measureSafeArea');
    expect(diagnostics).not.toContain('measureCssHeight');
  });

  it('keeps evidence read-only with respect to runtime geometry', () => {
    const evidence = read('src/platform/ViewportEvidence.ts');
    expect(evidence).toContain('resolveDisplayMode(displaySignals)');
    expect(evidence).toContain('resolveRuntimeLane()');
    expect(evidence).not.toContain("style.setProperty('--upds-viewport-height'");
    expect(evidence).not.toContain("style.setProperty('--physical-viewport-height'");
    expect(evidence).not.toContain("dataset.updsDisplayMode =");
  });
});
