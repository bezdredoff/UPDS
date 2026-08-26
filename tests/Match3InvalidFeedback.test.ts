import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { match3InvalidFeedbackKey } from '../src/features/match3/Match3InvalidFeedback';

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('ANM-025G3C reason-specific invalid-move feedback', () => {
  it('maps the four player-action failure reasons to specific feedback keys', () => {
    expect(match3InvalidFeedbackKey('no-match')).toBe('match3.feedback.noMatch');
    expect(match3InvalidFeedbackKey('blocked')).toBe('match3.feedback.moveBlocked');
    expect(match3InvalidFeedbackKey('ingredient')).toBe('match3.feedback.storyObjectLocked');
    expect(match3InvalidFeedbackKey('not-adjacent')).toBe('match3.feedback.adjacentOnly');
  });

  it('keeps a generic fallback for non-swap or terminal failure reasons', () => {
    for (const reason of ['same-cell', 'no-special', 'finished', undefined] as const) {
      expect(match3InvalidFeedbackKey(reason)).toBe('match3.feedback.swapUnavailable');
    }
  });

  it('ships concise reason text in RU, EN and BE', () => {
    const ru = read('src/localization/catalogs/ru.ts');
    const en = read('src/localization/catalogs/en.ts');
    const be = read('src/localization/catalogs/be.ts');

    for (const [catalog, tokens] of [
      [ru, ['ПЕРЕМЕЩЕНИЕ ЗАБЛОКИРОВАНО', 'СЮЖЕТНЫЙ ОБЪЕКТ НЕЛЬЗЯ ПЕРЕМЕЩАТЬ', 'ВЫБЕРИТЕ СОСЕДНЮЮ ФИШКУ']],
      [en, ['MOVE BLOCKED', 'STORY OBJECT CANNOT BE MOVED', 'CHOOSE AN ADJACENT TILE']],
      [be, ['ПЕРАМЯШЧЭННЕ ЗАБЛАКІРАВАНА', "СЮЖЭТНЫ АБ'ЕКТ НЕЛЬГА ПЕРАМЯШЧАЦЬ", 'ВЫБЕРЫЦЕ СУСЕДНЮЮ ФІШКУ']],
    ] as const) {
      for (const token of tokens) expect(catalog).toContain(token);
    }
  });

  it('routes the runtime banner through the typed resolver while preserving explanatory barks', () => {
    const controller = read('src/features/match3/Match3Controller.ts');
    expect(controller).toContain('this.t(match3InvalidFeedbackKey(result.reason))');
    expect(controller).toContain("this.matchBark = this.bark('notAdjacentInvalid', 'miku')");
    expect(controller).toContain("this.matchBark = this.bark('ingredientInvalid', 'miku')");
    expect(controller).toContain("this.matchBark = this.bark('blockedInvalid', 'onoe')");
    expect(controller).toContain("this.matchBark = this.bark('noMatchInvalid', 'onoe')");
  });
});
