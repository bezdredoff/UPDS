import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getScene } from '../src/data/narrative';
import {
  dialogueContinuationText,
  dialoguePageBudget,
  paginateDialogueText,
  paginateDialogueTextMeasured,
  type DialoguePageProfile,
} from '../src/ui/vnDialoguePaging';

const profiles: readonly DialoguePageProfile[] = [
  { width: 320, height: 568, textScale: 'normal' },
  { width: 320, height: 568, textScale: 'large' },
  { width: 375, height: 667, textScale: 'normal' },
  { width: 390, height: 844, textScale: 'normal' },
  { width: 390, height: 844, textScale: 'large' },
  { width: 430, height: 932, textScale: 'normal' },
] as const;

const normalize = (value: string): string => value.replace(/\s+/g, ' ').trim();

describe('ANM-016B VN dialogue paging', () => {
  it('round-trips every authored branch without changing or dropping words', () => {
    for (const choice of ['A', 'B', 'C'] as const) {
      for (let scene = 0; scene < 9; scene += 1) {
        for (const line of getScene(scene, choice)) {
          for (const profile of profiles) {
            const pages = paginateDialogueText(line.text, profile);
            expect(pages.length, `${choice} ${line.id}`).toBeGreaterThan(0);
            expect(pages.join(' '), `${choice} ${line.id}`).toBe(normalize(line.text));
          }
        }
      }
    }
  });

  it('keeps every generated page inside the deterministic viewport budget', () => {
    for (const choice of ['A', 'B', 'C'] as const) {
      for (let scene = 0; scene < 9; scene += 1) {
        for (const line of getScene(scene, choice)) {
          for (const profile of profiles) {
            const budget = dialoguePageBudget(profile);
            for (const page of paginateDialogueText(line.text, profile)) {
              expect(page.split(' ').length, `${line.id} words @ ${profile.width}x${profile.height}`).toBeLessThanOrEqual(budget.maxWords);
              expect(page.length, `${line.id} chars @ ${profile.width}x${profile.height}`).toBeLessThanOrEqual(budget.maxChars);
            }
          }
        }
      }
    }
  });

  it('uses fewer words for compact or large-text layouts', () => {
    const compact = dialoguePageBudget({ width: 320, height: 568, textScale: 'normal' });
    const regular = dialoguePageBudget({ width: 390, height: 844, textScale: 'normal' });
    const large = dialoguePageBudget({ width: 390, height: 844, textScale: 'large' });
    expect(compact.maxWords).toBeLessThan(regular.maxWords);
    expect(large.maxWords).toBeLessThan(regular.maxWords);
  });

  it('prefers a nearby sentence boundary instead of splitting mechanically mid-thought', () => {
    const text = 'Первая короткая мысль заканчивается здесь. Затем начинается вторая мысль, которая специально достаточно длинная для следующей страницы.';
    const pages = paginateDialogueText(text, { width: 320, height: 568, textScale: 'large' });
    expect(pages.length).toBeGreaterThan(1);
    expect(pages[0]).toBe('Первая короткая мысль заканчивается здесь.');
  });
});

describe('ANM-016B R3 render-measured paging', () => {
  it('uses the actual fit predicate rather than a language-specific word budget', () => {
    const text = 'Первая фраза помещается. Вторая фраза заметно длиннее и должна перейти на следующую страницу.';
    const pages = paginateDialogueTextMeasured(text, (candidate) => candidate.length <= 33, 'ru');
    expect(pages[0]).toBe('Первая фраза помещается.');
    expect(pages.length).toBeGreaterThan(1);
    expect(pages.join(' ').replace(/\s+/g, ' ').trim()).toBe(text);
  });

  it('splits an oversized German sentence without losing a long compound word', () => {
    const text = 'Die Donaudampfschifffahrtsgesellschaftskapitänin untersucht den ungewöhnlichen Hinweis.';
    const pages = paginateDialogueTextMeasured(text, (candidate) => candidate.length <= 24, 'de');
    expect(pages.length).toBeGreaterThan(1);
    expect(pages.every((page) => page.length <= 24)).toBe(true);
    expect(pages.join('').replace(/\s+/g, '')).toBe(text.replace(/\s+/g, ''));
  });

  it('supports text without whitespace such as Japanese by falling back to locale-aware graphemes', () => {
    const text = 'これは非常に長い台詞なので一つの画面には収まりません。次の画面にも続きます。';
    const pages = paginateDialogueTextMeasured(text, (candidate) => Array.from(candidate).length <= 14, 'ja');
    expect(pages.length).toBeGreaterThan(1);
    expect(pages.every((page) => Array.from(page).length <= 14)).toBe(true);
    expect(pages.join('').replace(/\s+/g, '')).toBe(text.replace(/\s+/g, ''));
  });

  it('does not inject Latin-style spaces between Japanese sentence segments', () => {
    const text = '短い一文です。次も短い文です。さらに続きます。';
    const pages = paginateDialogueTextMeasured(text, (candidate) => Array.from(candidate).length <= 20, 'ja');
    expect(pages.join('')).toBe(text);
    expect(pages.some((page) => /。\s/u.test(page))).toBe(false);
  });

  it('keeps a full localized line on one page whenever the measured viewport says it fits', () => {
    const text = 'A translated line can be longer in characters and still fit if the glyphs and viewport allow it.';
    expect(paginateDialogueTextMeasured(text, () => true, 'en')).toEqual([text]);
  });
});

const appSourceR3 = readFileSync(new URL('../src/ui/AnimeDetectiveApp.ts', import.meta.url), 'utf8');
const styleR3 = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');

describe('ANM-016B R4 browser integration contract', () => {
  it('measures in an isolated probe instead of mutating the visible flex/grid item', () => {
    expect(appSourceR3).toContain('createDialogueRenderedFit(textElement)');
    expect(appSourceR3).toContain('paginateDialogueTextMeasured(text, measurement.fits, dialogueLocale())');
    expect(appSourceR3).toContain('measurement.dispose()');
    expect(appSourceR3).not.toContain('textElement.scrollHeight <= safeHeight');
    expect(appSourceR3).toContain('document.fonts.ready.then(() => requestReflow())');
    expect(appSourceR3).toContain("window.addEventListener('resize', requestReflow");
  });

  it('keeps a stable dialogue viewport and localization-friendly wrapping', () => {
    expect(styleR3).toContain('grid-template-rows: minmax(0, 1fr) auto;');
    expect(styleR3).toContain('height: calc(2.84em + 19px);');
    expect(styleR3).toContain('min-height: calc(2.84em + 19px);');
    expect(styleR3).toContain('max-height: calc(2.84em + 19px);');
    expect(styleR3).toContain('padding: 9px 1px 6px 0;');
    expect(styleR3).toContain('overflow-wrap: break-word;');
    expect(styleR3).toContain('line-break: auto;');
    expect(styleR3).toContain('hyphens: auto;');
    expect(appSourceR3).toContain('dialogueLocale()');
  });
});



describe('ANM-016B R6 two-line balanced paging', () => {
  it('adds a presentation ellipsis only to non-final internal pages', () => {
    expect(dialogueContinuationText('Продолжение будет дальше.', true)).toBe('Продолжение будет дальше…');
    expect(dialogueContinuationText('Продолжение будет дальше', true)).toBe('Продолжение будет дальше…');
    expect(dialogueContinuationText('Последняя страница.', false)).toBe('Последняя страница.');
  });

  it('reserves ellipsis width while measuring a continuation page', () => {
    const text = 'Раз два три четыре пять шесть семь восемь девять десять одиннадцать двенадцать.';
    const measured: string[] = [];
    const pages = paginateDialogueTextMeasured(text, (candidate) => {
      measured.push(candidate);
      return candidate.length <= 39;
    }, 'ru');
    expect(pages.length).toBeGreaterThan(1);
    expect(measured.some((candidate) => candidate.endsWith('…'))).toBe(true);
  });

  it('balances a short final remainder to at least three words when the fit allows it', () => {
    const text = 'Один два три четыре пять шесть семь восемь девять десять одиннадцать двенадцать тринадцать.';
    const pages = paginateDialogueTextMeasured(text, (candidate) => candidate.length <= 34, 'ru');
    expect(pages.length).toBeGreaterThan(1);
    for (const continuation of pages.slice(1)) {
      expect(continuation.trim().split(/\s+/u).length).toBeGreaterThanOrEqual(3);
    }
    expect(pages.join(' ').replace(/\s+/gu, ' ').trim()).toBe(text);
  });

  it('keeps Japanese continuation pages substantive without injecting spaces', () => {
    const text = 'これは長い台詞なので二行では全部入りません。次の画面にも十分な文章を残します。さらに自然に続きます。';
    const pages = paginateDialogueTextMeasured(text, (candidate) => Array.from(candidate).length <= 22, 'ja');
    expect(pages.length).toBeGreaterThan(1);
    expect(pages.join('')).toBe(text);
    for (const continuation of pages.slice(1)) {
      expect(Array.from(continuation.replace(/[。、！？…]/gu, '')).length).toBeGreaterThanOrEqual(4);
    }
  });

  it('wires the visible page through the presentation-only continuation marker', () => {
    expect(appSourceR3).toContain('dialogueContinuationText(dialoguePage, this.dialoguePageIndex < dialoguePages.length - 1)');
    expect(appSourceR3).toContain('dialogueContinuationText(currentPage, this.dialoguePageIndex < measuredPages.length - 1)');
  });
});
