import { describe, expect, it } from 'vitest';
import { levels, validateLevelDefinitions } from '../src/data/levels';
import {
  nextPendingMatch3Tutorial,
  tutorialCompletionEventsForMove,
  tutorialRevealEventsForMove,
  tutorialCompletesOn,
} from '../src/data/match3Tutorials';

const specialConcept = 'activate-special' as const;

describe('ANM-025D3 special activation tutorial', () => {
  it('lets every campaign level introduce the special concept but keeps it hidden until a special is created', () => {
    for (const level of levels) expect(level.tutorialConcepts).toContain(specialConcept);
    expect(nextPendingMatch3Tutorial([specialConcept], [])).toBeNull();
    expect(nextPendingMatch3Tutorial([specialConcept], [], ['level-start', 'special-created'])).toBe(specialConcept);
    expect(validateLevelDefinitions(levels)).toEqual([]);
  });

  it('reveals the coachmark only from a successful move that creates a special', () => {
    expect(tutorialRevealEventsForMove({ valid: false, specialsCreated: 1 })).toEqual([]);
    expect(tutorialRevealEventsForMove({ valid: true, specialsCreated: 0 })).toEqual([]);
    expect(tutorialRevealEventsForMove({ valid: true, specialsCreated: 1 })).toEqual(['special-created']);
  });

  it('requires a successful direct activation rather than merely dismissing the coachmark', () => {
    expect(tutorialCompletesOn(specialConcept, 'special-activated')).toBe(true);
    expect(tutorialCompletionEventsForMove({ valid: true, blockersCleared: 0, ingredientsDropped: 0 }, false)).not.toContain('special-activated');
    const directEvents = tutorialCompletionEventsForMove({ valid: true, blockersCleared: 0, ingredientsDropped: 0 }, true);
    expect(directEvents).toContain('special-activated');
    expect(directEvents).not.toContain('valid-swap');
  });
});
