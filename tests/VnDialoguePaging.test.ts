import { describe, expect, it } from 'vitest';
import { getScene } from '../src/data/narrative';
import { dialoguePageBudget, paginateDialogueText, type DialoguePageProfile } from '../src/ui/vnDialoguePaging';

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
