import { describe, expect, it } from 'vitest';
import { levels, validateLevelDefinitions } from '../src/data/levels';
import {
  nextPendingMatch3Tutorial,
  tutorialCompletionEventsForMove,
  tutorialRevealEventsForBoard,
  tutorialCompletesOn,
} from '../src/data/match3Tutorials';

const comboConcept = 'combine-specials' as const;

describe('ANM-025D4 special combo tutorial', () => {
  it('keeps combo teaching after direct activation and available across the campaign', () => {
    for (const level of levels) {
      expect(level.tutorialConcepts).toContain(comboConcept);
      expect(level.tutorialConcepts.indexOf(comboConcept)).toBeGreaterThan(level.tutorialConcepts.indexOf('activate-special'));
    }
    expect(validateLevelDefinitions(levels)).toEqual([]);
  });

  it('reveals only while two special tiles are currently adjacent', () => {
    const empty = () => ({ special: null as string | null });
    const board = Array.from({ length: 9 }, empty);
    board[0] = { special: 'flash-row' };
    board[4] = { special: 'evidence' };
    expect(tutorialRevealEventsForBoard(board, 3)).toEqual([]);
    board[1] = { special: 'lead' };
    expect(tutorialRevealEventsForBoard(board, 3)).toEqual(['special-combo-ready']);
  });

  it('does not skip the activation lesson when both concepts are ready', () => {
    const concepts = ['activate-special', comboConcept] as const;
    const revealed = ['level-start', 'special-created', 'special-combo-ready'] as const;
    expect(nextPendingMatch3Tutorial(concepts, [], revealed)).toBe('activate-special');
    expect(nextPendingMatch3Tutorial(concepts, ['activate-special'], revealed)).toBe(comboConcept);
  });

  it('completes only after a successful special-to-special swap', () => {
    expect(tutorialCompletesOn(comboConcept, 'special-combined')).toBe(true);
    const plain = tutorialCompletionEventsForMove({ valid: true, blockersCleared: 0, ingredientsDropped: 0 });
    expect(plain).not.toContain('special-combined');
    const directActivation = tutorialCompletionEventsForMove({ valid: true, blockersCleared: 0, ingredientsDropped: 0 }, true, false);
    expect(directActivation).not.toContain('special-combined');
    const combo = tutorialCompletionEventsForMove({ valid: true, blockersCleared: 0, ingredientsDropped: 0 }, false, true);
    expect(combo).toContain('special-combined');
  });
});
