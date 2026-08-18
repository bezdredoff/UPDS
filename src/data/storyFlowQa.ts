import { levels, type LevelDefinition } from './levels';

export const STORY_WIN_QA_LEVEL_INDEX = 0;
export const STORY_WIN_QA_SWAP = { first: 2, second: 10 } as const;

const canonicalFirstLevel = levels[STORY_WIN_QA_LEVEL_INDEX];
if (!canonicalFirstLevel || canonicalFirstLevel.shortId !== 'M3_00') {
  throw new Error('Story win QA fixture requires M3_00 at level index 0');
}

/**
 * Deterministic one-move Story boundary fixture.
 *
 * It keeps the canonical M3_00 identity/context/clue metadata, but narrows the
 * board objective to one locked cell. Swapping 2 ↔ 10 creates a real match
 * beside that blocker, so Match3Game itself produces won=true.
 *
 * The fixture is passed to Match3Controller.startMatch as an explicit
 * levelOverride. The exported production `levels` registry is never mutated.
 */
export const storyWinQaLevel: LevelDefinition = {
  ...canonicalFirstLevel,
  tutorialConcepts: [],
  moves: 1,
  objectives: [
    { kind: 'clearBlockers', target: 1, label: 'Клетки' },
  ],
  blockers: [{ index: 3, layers: 1 }],
  ingredients: [],
  initialTiles: [
    { index: 0, tile: 'pantiesSportWhite' },
    { index: 1, tile: 'pantiesSportWhite' },
    { index: 2, tile: 'pantiesLacePink' },
    { index: 10, tile: 'pantiesSportWhite' },
  ],
  seed: 23081,
};
