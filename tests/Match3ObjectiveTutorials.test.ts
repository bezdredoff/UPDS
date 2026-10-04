import { describe, expect, it } from 'vitest';
import { levels, validateLevelDefinitions } from '../src/data/levels';
import {
  match3TutorialConceptIds,
  nextPendingMatch3Tutorial,
  tutorialCompletionEventsForMove,
  tutorialConceptsCompletedByEvents,
  tutorialCompletesOn,
} from '../src/data/match3Tutorials';

const locker = levels.find((level) => level.shortId === 'M3_00')!;

describe('ANM-025D2 objective mechanics tutorials', () => {
  it('keeps M3_00 focused on the basic swap and introduces each blocker at its first level', () => {
    expect(match3TutorialConceptIds.slice(0, 4)).toEqual(['basic-swap', 'clear-blocker', 'clear-package', 'clear-foam']);
    expect(locker.tutorialConcepts).toEqual(['basic-swap']);
    expect(levels.find((level) => level.shortId === 'M3_01')?.tutorialConcepts).toContain('clear-package');
    expect(levels.find((level) => level.shortId === 'M3_02')?.tutorialConcepts).toContain('clear-foam');
    expect(nextPendingMatch3Tutorial(locker.tutorialConcepts, [])).toBe('basic-swap');
    expect(nextPendingMatch3Tutorial(locker.tutorialConcepts, ['basic-swap'])).toBeNull();
    expect(nextPendingMatch3Tutorial(['clear-package'], [])).toBe('clear-package');
    expect(nextPendingMatch3Tutorial(['clear-foam'], [])).toBe('clear-foam');
    expect(validateLevelDefinitions(levels)).toEqual([]);
  });

  it('maps real move progress to tutorial mastery without changing Match3Game', () => {
    expect(tutorialCompletesOn('clear-blocker', 'blocker-cleared')).toBe(true);
    expect(tutorialCompletesOn('drop-ingredient', 'ingredient-dropped')).toBe(true);
    expect(tutorialCompletionEventsForMove({ valid: false, blockersCleared: 1, ingredientsDropped: 1 })).toEqual([]);
    expect(tutorialCompletionEventsForMove({ valid: true, blockersCleared: 0, ingredientsDropped: 0 })).toEqual(['valid-swap']);
    expect(tutorialCompletionEventsForMove({ valid: true, blockersCleared: 1, ingredientsDropped: 1 })).toEqual([
      'valid-swap',
      'blocker-cleared',
      'ingredient-dropped',
    ]);
  });

  it('skips redundant coachmarks when the player demonstrates a later mechanic before its prompt', () => {
    const concepts = ['basic-swap', 'clear-package', 'drop-ingredient'] as const;
    const masteredInOneMove = tutorialConceptsCompletedByEvents(concepts, [], [
      'valid-swap',
      'blocker-cleared',
      'ingredient-dropped',
    ]);
    expect(masteredInOneMove).toEqual(['basic-swap', 'clear-package', 'drop-ingredient']);
    expect(nextPendingMatch3Tutorial(concepts, masteredInOneMove)).toBeNull();

    const ingredientFirst = tutorialConceptsCompletedByEvents(concepts, ['basic-swap'], ['ingredient-dropped']);
    expect(ingredientFirst).toEqual(['drop-ingredient']);
    expect(nextPendingMatch3Tutorial(concepts, ['basic-swap', ...ingredientFirst])).toBe('clear-package');
  });
});
