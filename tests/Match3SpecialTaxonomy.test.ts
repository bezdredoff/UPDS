import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

describe('ANM-022D special shape taxonomy', () => {
  it('defines five narrative production special kinds and explicit creation priority', async () => {
    const source = await readFile(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');
    expect(source).toContain("export type SpecialKind = 'flash-row' | 'flash-column' | 'evidence' | 'lead' | 'insight'");
    const prism = source.indexOf("kind: 'insight'");
    const area = source.indexOf("kind: 'evidence'");
    const raven = source.indexOf("kind: 'lead'");
    const rocket = source.indexOf("kind: group.orientation === 'row' ? 'flash-row' : 'flash-column'");
    expect(prism).toBeGreaterThan(0);
    expect(prism).toBeLessThan(area);
    expect(area).toBeLessThan(raven);
    expect(raven).toBeLessThan(rocket);
  });

  it('creates specials only on the first player-authored resolution', async () => {
    const source = await readFile(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');
    expect(source).toContain('totals.cascades === 1');
    expect(source).toContain('playerCreations.map');
  });

  it('gives area, raven and prism their own deterministic activation effects', async () => {
    const source = await readFile(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');
    expect(source).toContain("special === 'evidence'");
    expect(source).toContain("special === 'lead'");
    expect(source).toContain('this.leadTargets(index)');
    expect(source).toContain('cell.tile === tile');
  });

  it('keeps special combinations out of this feature', async () => {
    const docs = await readFile(new URL('../docs/features/ANM022D_SPECIAL_SHAPE_TAXONOMY_RU.md', import.meta.url), 'utf8');
    expect(docs).toContain('ANM-022E');
    expect(docs).toContain('special-special');
  });
});
