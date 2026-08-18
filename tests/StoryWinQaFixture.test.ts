import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';
import {
  STORY_WIN_QA_LEVEL_INDEX,
  STORY_WIN_QA_SWAP,
  storyWinQaLevel,
} from '../src/data/storyFlowQa';
import { Match3Game } from '../src/engine/Match3Game';

describe('ANM-023G8B Story win QA fixture', () => {
  it('wins through one real production Match3Game swap without force-win state', () => {
    const canonical = levels[STORY_WIN_QA_LEVEL_INDEX];
    expect(storyWinQaLevel).not.toBe(canonical);
    expect(storyWinQaLevel.id).toBe(canonical.id);
    expect(storyWinQaLevel.shortId).toBe('M3_00');
    expect(storyWinQaLevel.clueId).toBe(canonical.clueId);
    expect(storyWinQaLevel.context).toBe(canonical.context);

    const game = new Match3Game(storyWinQaLevel, storyWinQaLevel.seed);
    expect(game.hasImmediateMatches()).toBe(false);
    expect(game.won).toBe(false);
    expect(game.movesLeft).toBe(1);

    const result = game.attemptSwap(STORY_WIN_QA_SWAP.first, STORY_WIN_QA_SWAP.second);
    expect(result.valid).toBe(true);
    expect(result.blockersCleared).toBe(1);
    expect(result.won).toBe(true);
    expect(result.lost).toBe(false);
    expect(game.won).toBe(true);
    expect(game.movesLeft).toBe(0);

    expect(levels[STORY_WIN_QA_LEVEL_INDEX]).toBe(canonical);
    expect(levels[STORY_WIN_QA_LEVEL_INDEX].moves).toBe(24);
  });
});
