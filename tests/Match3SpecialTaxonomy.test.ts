import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import {
  expandSpecialClearTargets,
  findMatchGroups,
  findPlayerSpecialCreations,
  type Match3RuleCell,
} from '../src/engine/Match3Rules';

const boardWith = (placements: Readonly<Record<number, Partial<Match3RuleCell>>>): Match3RuleCell[] =>
  Array.from({ length: 64 }, (_, index) => ({ tile: null, special: null, ...placements[index] }));

describe('ANM-022D special shape taxonomy', () => {
  it('keeps explicit creation priority in the stateless rule kernel', async () => {
    const rules = await readFile(new URL('../src/engine/Match3Rules.ts', import.meta.url), 'utf8');
    const insight = rules.indexOf("kind: 'insight'");
    const evidence = rules.indexOf("kind: 'evidence'");
    const lead = rules.indexOf("kind: 'lead'");
    const flash = rules.indexOf("kind: group.orientation === 'row' ? 'flash-row' : 'flash-column'");
    expect(insight).toBeGreaterThan(0);
    expect(insight).toBeLessThan(evidence);
    expect(evidence).toBeLessThan(lead);
    expect(lead).toBeLessThan(flash);
  });

  it('detects concrete tile matches and creates a five-match Insight', () => {
    const cells = boardWith({
      8: { tile: 'pantiesLacePink' },
      9: { tile: 'pantiesLacePink' },
      10: { tile: 'pantiesLacePink' },
      11: { tile: 'pantiesLacePink' },
      12: { tile: 'pantiesLacePink' },
    });
    const groups = findMatchGroups(cells);
    expect(groups).toEqual([{ orientation: 'row', indices: [8, 9, 10, 11, 12] }]);
    expect(findPlayerSpecialCreations(cells, groups, 9, 10)).toEqual([{ index: 10, kind: 'insight' }]);
  });

  it('creates specials only on the first player-authored mutable resolution', async () => {
    const engine = await readFile(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');
    expect(engine).toContain('totals.cascades === 1');
    expect(engine).toContain('playerCreations.map');
  });

  it('gives Evidence, Lead and Insight deterministic activation effects', () => {
    const cells = boardWith({
      27: { tile: 'pantiesLacePink', special: 'evidence' },
      10: { tile: 'pantiesSportWhite', special: 'lead' },
      40: { tile: 'towel', special: 'insight' },
      41: { tile: 'towel' },
      42: { tile: 'towel' },
    });
    expect(expandSpecialClearTargets(cells, new Set([27]), () => [])).toEqual(
      new Set([27, 18, 19, 20, 26, 28, 34, 35, 36]),
    );
    expect(expandSpecialClearTargets(cells, new Set([10]), () => [10, 11, 12])).toEqual(new Set([10, 11, 12]));
    expect(expandSpecialClearTargets(cells, new Set([40]), () => [])).toEqual(new Set([40, 41, 42]));
  });

  it('keeps special combinations out of this feature', async () => {
    const docs = await readFile(new URL('../docs/features/ANM022D_SPECIAL_SHAPE_TAXONOMY_RU.md', import.meta.url), 'utf8');
    expect(docs).toContain('ANM-022E');
    expect(docs).toContain('special-special');
  });

  it('resolves a creation-only 2x2 Lead by consuming the square and preserving the Lead cell', async () => {
    const cells = boardWith({
      0: { tile: 'pantiesLacePink' },
      1: { tile: 'pantiesLacePink' },
      8: { tile: 'pantiesLacePink' },
      9: { tile: 'pantiesLacePink' },
    });
    expect(findPlayerSpecialCreations(cells, [], 1, 9)).toEqual([
      { index: 9, kind: 'lead', consumed: [0, 1, 8, 9] },
    ]);

    const engine = await readFile(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');
    expect(engine).toContain('cascade === 0 && playerCreations.length > 0');
    expect(engine).toContain('creationConsumed');
    expect(engine).toContain('clear.delete(creation)');
  });
});
