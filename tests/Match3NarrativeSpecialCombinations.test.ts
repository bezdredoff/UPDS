import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

describe('ANM-022E narrative direct special combinations', () => {
  it('defines only UPDS narrative combo vocabulary', async () => {
    const source = await readFile(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');
    for (const combo of ['flash-flash', 'flash-evidence', 'evidence-evidence', 'lead-flash', 'lead-evidence', 'insight-normal', 'insight-special', 'fallback']) {
      expect(source).toContain(`'${combo}'`);
    }
    expect(source).not.toContain("'line-line'");
    expect(source).not.toContain("'raven-line'");
    expect(source).not.toContain("'prism-normal'");
  });

  it('keeps the Flash family symmetric', async () => {
    const source = await readFile(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');
    expect(source).toContain("kind === 'flash-row' || kind === 'flash-column'");
    expect(source).toContain("return 'flash-flash'");
  });

  it('applies direct combos only on the first resolution', async () => {
    const source = await readFile(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');
    expect(source).toContain('totals.cascades === 1 && directCombo');
    expect(source).toContain('expandDirectSpecialCombo');
  });

  it('keeps Lead objective-aware targeting in Lead combos', async () => {
    const source = await readFile(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');
    expect(source).toContain('this.leadTargets(centre)');
  });

  it('uses deterministic fallback for unsupported special pairs', async () => {
    const source = await readFile(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');
    expect(source).toContain("return 'fallback'");
    expect(source).toContain('clear.add(first)');
    expect(source).toContain('clear.add(second)');
  });
});
