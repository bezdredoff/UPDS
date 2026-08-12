import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

describe('ANM-022C Match-3 feedback semantics', () => {
  it('defines engine-owned MATCH / COMBO / CHAIN / SPECIAL semantics', async () => {
    const engine = await readFile(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');
    expect(engine).toContain("export type MatchFeedbackKind = 'match' | 'combo' | 'chain' | 'special'");
    expect(engine).toContain('private classifyPlayerMove(');
    expect(engine).toContain("if (activatedSpecials.length > 0) return 'special'");
    expect(engine).toContain("group.indices.length >= 4");
    expect(engine).toContain("totals.cascades >= 2");
  });

  it('renders feedback from frame semantics rather than re-deriving it in UI', async () => {
    const controller = await readFile(new URL('../src/features/match3/Match3Controller.ts', import.meta.url), 'utf8');
    expect(controller).toContain("const feedback = frame.feedback ?? 'match'");
    expect(controller).toContain("match3.feedback.combo");
    expect(controller).toContain("'chain-feedback'");
  });

  it('localizes COMBO separately from MATCH and CHAIN in RU/EN', async () => {
    const en = await readFile(new URL('../src/localization/catalogs/en.ts', import.meta.url), 'utf8');
    const ru = await readFile(new URL('../src/localization/catalogs/ru.ts', import.meta.url), 'utf8');
    expect(en).toContain("'match3.feedback.combo': 'COMBO!'");
    expect(ru).toContain("'match3.feedback.combo': 'КОМБО!'");
    expect(en).toContain("'match3.feedback.chain': 'CHAIN ×{count}'");
    expect(ru).toContain("'match3.feedback.chain': 'ЦЕПОЧКА ×{count}'");
  });
  it('keeps primary feedback on MoveResult rather than resolution totals', async () => {
    const engine = await readFile(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');
    const resultType = engine.slice(engine.indexOf('export type MoveResult'), engine.indexOf('type ResolutionTotals'));
    const totalsType = engine.slice(engine.indexOf('type ResolutionTotals'), engine.indexOf('const makeRng'));
    expect(resultType).toContain('primaryFeedback: MatchFeedbackKind | null');
    expect(totalsType).not.toContain('primaryFeedback');
    expect(engine).toContain('primaryFeedback: null');
  });

});
