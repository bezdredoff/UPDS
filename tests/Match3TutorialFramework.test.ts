import { describe, expect, it } from 'vitest';
import { levels, validateLevelDefinitions } from '../src/data/levels';
import {
  match3TutorialConceptIds,
  nextPendingMatch3Tutorial,
  tutorialCompletesOn,
} from '../src/data/match3Tutorials';

describe('ANM-025D1 Match-3 tutorial framework', () => {
  it('assigns the base interaction concept only to the first level', () => {
    expect(match3TutorialConceptIds).toEqual(['basic-swap']);
    expect(levels[0].tutorialConcepts).toEqual(['basic-swap']);
    for (const level of levels.slice(1)) expect(level.tutorialConcepts).toEqual([]);
    expect(validateLevelDefinitions(levels)).toEqual([]);
  });

  it('selects only unseen concepts and completes basic swap on a valid swap', () => {
    expect(nextPendingMatch3Tutorial(['basic-swap'], [])).toBe('basic-swap');
    expect(nextPendingMatch3Tutorial(['basic-swap'], ['basic-swap'])).toBeNull();
    expect(tutorialCompletesOn('basic-swap', 'valid-swap')).toBe(true);
  });
});
