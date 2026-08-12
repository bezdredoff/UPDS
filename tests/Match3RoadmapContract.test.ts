import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

describe('ANM-022A Match-3 roadmap contract', () => {
  it('documents atomic mechanics before balance and playtest', async () => {
    const target = await readFile(new URL('../docs/design/MATCH3_MECHANICS_TARGET_RU.md', import.meta.url), 'utf8');
    expect(target).toContain('ANM-022B — Shared Move Legality');
    expect(target).toContain('ANM-022C — Feedback Semantics');
    expect(target).toContain('ANM-022D — Special Shape Taxonomy');
    expect(target).toContain('ANM-022E — Special Combination Matrix');
    expect(target).toContain('ANM-023 — Balance');
    expect(target).toContain('COMBO');
    expect(target).toContain('CHAIN ×N');
  });

  it('retires the stale face-overlay roadmap wording', async () => {
    const roadmap = await readFile(new URL('../docs/ROADMAP_RU.md', import.meta.url), 'utf8');
    expect(roadmap).toContain('precomposed 1024×1536 expression frames');
    expect(roadmap).toContain('ANM-022B shared move-legality');
    expect(roadmap).not.toContain('Replace remaining portrait placeholders');
  });
});
