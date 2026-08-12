import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

describe('ANM-022 Match-3 mechanics contract', () => {
  it('keeps the atomic mechanics sequence and semantic vocabulary without owning later roadmap numbering', async () => {
    const target = await readFile(new URL('../docs/design/MATCH3_MECHANICS_TARGET_RU.md', import.meta.url), 'utf8');
    const stages = [
      'ANM-022B — Shared Move Legality',
      'ANM-022C — Feedback Semantics',
      'ANM-022D — Special Shape Taxonomy',
      'ANM-022E — Special Combination Matrix',
      'ANM-022F — Interaction Guidance',
    ];

    let previous = -1;
    for (const stage of stages) {
      const index = target.indexOf(stage);
      expect(index, stage).toBeGreaterThan(previous);
      previous = index;
    }

    expect(target).toContain('COMBO');
    expect(target).toContain('CHAIN ×N');
    expect(target).toContain('docs/ROADMAP_RU.md');
    expect(target).not.toContain('### ANM-023 — Balance');
  });
});
