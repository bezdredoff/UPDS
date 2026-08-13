export const match3TutorialConceptIds = ['basic-swap', 'clear-blocker', 'drop-ingredient', 'activate-special', 'combine-specials'] as const;

export type Match3TutorialConceptId = typeof match3TutorialConceptIds[number];
export type Match3TutorialCompletionEvent = 'valid-swap' | 'blocker-cleared' | 'ingredient-dropped' | 'special-activated' | 'special-combined';
export type Match3TutorialRevealEvent = 'level-start' | 'special-created' | 'special-combo-ready';

export type Match3TutorialDefinition = Readonly<{
  id: Match3TutorialConceptId;
  revealOn: Match3TutorialRevealEvent;
  completeOn: Match3TutorialCompletionEvent;
}>;

export const match3TutorialDefinitions: Readonly<Record<Match3TutorialConceptId, Match3TutorialDefinition>> = {
  'basic-swap': { id: 'basic-swap', revealOn: 'level-start', completeOn: 'valid-swap' },
  'clear-blocker': { id: 'clear-blocker', revealOn: 'level-start', completeOn: 'blocker-cleared' },
  'drop-ingredient': { id: 'drop-ingredient', revealOn: 'level-start', completeOn: 'ingredient-dropped' },
  'activate-special': { id: 'activate-special', revealOn: 'special-created', completeOn: 'special-activated' },
  'combine-specials': { id: 'combine-specials', revealOn: 'special-combo-ready', completeOn: 'special-combined' },
};

export function nextPendingMatch3Tutorial(
  levelConcepts: readonly Match3TutorialConceptId[],
  completed: readonly Match3TutorialConceptId[],
  revealed: readonly Match3TutorialRevealEvent[] = ['level-start'],
): Match3TutorialConceptId | null {
  const completedSet = new Set(completed);
  const revealedSet = new Set(revealed);
  return levelConcepts.find((concept) => (
    !completedSet.has(concept) && revealedSet.has(match3TutorialDefinitions[concept].revealOn)
  )) ?? null;
}

export function tutorialCompletesOn(
  concept: Match3TutorialConceptId,
  event: Match3TutorialCompletionEvent,
): boolean {
  return match3TutorialDefinitions[concept].completeOn === event;
}

export function tutorialCompletionEventsForMove(
  result: Readonly<{
    valid: boolean;
    blockersCleared: number;
    ingredientsDropped: number;
  }>,
  directSpecialActivation = false,
  directSpecialCombo = false,
): Match3TutorialCompletionEvent[] {
  if (!result.valid) return [];
  const events: Match3TutorialCompletionEvent[] = directSpecialActivation ? [] : ['valid-swap'];
  if (result.blockersCleared > 0) events.push('blocker-cleared');
  if (result.ingredientsDropped > 0) events.push('ingredient-dropped');
  if (directSpecialActivation) events.push('special-activated');
  if (directSpecialCombo) events.push('special-combined');
  return events;
}

export function tutorialRevealEventsForMove(result: Readonly<{
  valid: boolean;
  specialsCreated: number;
}>): Match3TutorialRevealEvent[] {
  if (!result.valid || result.specialsCreated <= 0) return [];
  return ['special-created'];
}

export function tutorialRevealEventsForBoard(
  board: readonly Readonly<{ special: string | null }>[],
  boardSize: number,
): Match3TutorialRevealEvent[] {
  if (!Number.isInteger(boardSize) || boardSize <= 0) return [];
  for (let index = 0; index < board.length; index += 1) {
    if (!board[index]?.special) continue;
    const row = Math.floor(index / boardSize);
    const column = index % boardSize;
    for (const neighbour of [
      column + 1 < boardSize ? index + 1 : -1,
      row + 1 < boardSize ? index + boardSize : -1,
    ]) {
      if (neighbour >= 0 && neighbour < board.length && board[neighbour]?.special) return ['special-combo-ready'];
    }
  }
  return [];
}

export function tutorialConceptsCompletedByEvents(
  levelConcepts: readonly Match3TutorialConceptId[],
  completed: readonly Match3TutorialConceptId[],
  events: readonly Match3TutorialCompletionEvent[],
): Match3TutorialConceptId[] {
  const completedSet = new Set(completed);
  const eventSet = new Set(events);
  return levelConcepts.filter((concept) => !completedSet.has(concept) && eventSet.has(match3TutorialDefinitions[concept].completeOn));
}
