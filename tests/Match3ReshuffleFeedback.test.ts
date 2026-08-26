import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MATCH_MOTION_MS, matchMotionDuration } from '../src/ui/matchMotion';

const controller = readFileSync(new URL('../src/features/match3/Match3Controller.ts', import.meta.url), 'utf8');
const engine = readFileSync(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');
const ru = readFileSync(new URL('../src/localization/catalogs/ru.ts', import.meta.url), 'utf8');
const en = readFileSync(new URL('../src/localization/catalogs/en.ts', import.meta.url), 'utf8');
const be = readFileSync(new URL('../src/localization/catalogs/be.ts', import.meta.url), 'utf8');

describe('ANM-025G3D explained reshuffle UX', () => {
  it('explains both dead-board cause and reshuffle outcome in every release locale', () => {
    expect(ru).toContain("'match3.feedback.reshuffled': 'НЕТ ХОДОВ · ПОЛЕ ПЕРЕМЕШАНО'");
    expect(en).toContain("'match3.feedback.reshuffled': 'NO MOVES · BOARD SHUFFLED'");
    expect(be).toContain("'match3.feedback.reshuffled': 'НЯМА ХАДОЎ · ПОЛЕ ПЕРАМЕШАНА'");
  });

  it('holds reshuffle feedback instead of letting a redundant final chain summary overwrite it', () => {
    expect(controller).toContain("if (result.reshuffled) {\nthis.setMatchFeedback(this.t('match3.feedback.reshuffled'), 'reshuffle-feedback');\nawait this.matchDelay(matchMotionDuration('feedbackHold', false));\n} else if (result.cascades >= 2)");
  });

  it('keeps a readable reduced-motion hold while skipping zero-duration animation phases', () => {
    expect(MATCH_MOTION_MS.feedbackHold).toBe(420);
    expect(matchMotionDuration('feedbackHold', true)).toBe(160);
    expect(controller).toContain("await this.matchDelay(matchMotionDuration('feedbackHold', true));");
    expect(controller).toContain('if (milliseconds <= 0) return Promise.resolve();');
    expect(controller).not.toContain('if (this.prefersReducedMatchMotion()) return Promise.resolve();');
  });

  it('leaves dead-board detection and engine reshuffle ownership unchanged', () => {
    expect(engine).toContain('if (!this.won && !this.lost && !this.hasAvailableMove()) {');
    expect(engine).toContain('this.shuffle();');
    expect(engine).toContain('reshuffled = true;');
    expect(engine).toContain("phase: 'reshuffle'");
  });
});
