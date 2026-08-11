import { describe, expect, it } from 'vitest';
import { getScene } from '../src/data/narrative';
import { isUsableDialogueViewport } from '../src/ui/dialogueMeasurement';
import {
  dialogueContinuationText,
  paginateDialogueText,
  paginateDialogueTextMeasured,
  type DialoguePageProfile,
} from '../src/ui/vnDialoguePaging';

const compactProfile: DialoguePageProfile = { width: 320, height: 568, textScale: 'large' };
const normalize = (value: string): string => value.replace(/\s+/g, ' ').trim();

describe('VN dialogue paging', () => {
  it('keeps the deterministic headless fallback lossless for every authored branch', () => {
    for (const choice of ['A', 'B', 'C'] as const) {
      for (let scene = 0; scene < 9; scene += 1) {
        for (const line of getScene(scene, choice)) {
          const pages = paginateDialogueText(line.text, compactProfile);
          expect(pages.length, `${choice} ${line.id}`).toBeGreaterThan(0);
          expect(pages.join(' '), `${choice} ${line.id}`).toBe(normalize(line.text));
        }
      }
    }
  });

  it('prefers a natural sentence boundary in the fallback paginator', () => {
    const text = 'Первая короткая мысль заканчивается здесь. Затем начинается вторая мысль, которая специально достаточно длинная для следующей страницы.';
    const pages = paginateDialogueText(text, compactProfile);
    expect(pages.length).toBeGreaterThan(1);
    expect(pages[0]).toBe('Первая короткая мысль заканчивается здесь.');
  });

  it('uses the measured fit predicate and preserves Russian, German and Japanese text', () => {
    const cases = [
      ['ru', 'Первая фраза помещается. Вторая фраза заметно длиннее и должна перейти на следующую страницу.', 33],
      ['de', 'Die Donaudampfschifffahrtsgesellschaftskapitänin untersucht den ungewöhnlichen Hinweis.', 24],
      ['ja', 'これは非常に長い台詞なので一つの画面には収まりません。次の画面にも続きます。', 14],
    ] as const;
    for (const [locale, text, limit] of cases) {
      const pages = paginateDialogueTextMeasured(text, (candidate) => Array.from(candidate).length <= limit, locale);
      expect(pages.length).toBeGreaterThan(1);
      expect(pages.join('').replace(/\s+/g, '')).toBe(text.replace(/\s+/g, ''));
    }
  });

  it('adds ellipsis only to non-final pages and avoids tiny whitespace-language continuation tails', () => {
    expect(dialogueContinuationText('Продолжение будет дальше.', true)).toBe('Продолжение будет дальше…');
    expect(dialogueContinuationText('Последняя страница.', false)).toBe('Последняя страница.');

    const text = 'Один два три четыре пять шесть семь восемь девять десять одиннадцать двенадцать тринадцать.';
    const pages = paginateDialogueTextMeasured(text, (candidate) => candidate.length <= 34, 'ru');
    for (const continuation of pages.slice(1)) {
      expect(continuation.trim().split(/\s+/u).length).toBeGreaterThanOrEqual(3);
    }
    expect(pages.join(' ').replace(/\s+/gu, ' ').trim()).toBe(text);
  });

  it('rejects collapsed measurement geometry and accepts a normal two-line mobile viewport', () => {
    expect(isUsableDialogueViewport(0, 120, 24)).toBe(false);
    expect(isUsableDialogueViewport(100, 120, 24)).toBe(false);
    expect(isUsableDialogueViewport(280, 55, 24)).toBe(false);
    expect(isUsableDialogueViewport(280, 96, 24)).toBe(true);
  });
});
