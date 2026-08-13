export const match3TutorialConceptIds = ['basic-swap', 'clear-blocker', 'drop-ingredient'] as const;

export type Match3TutorialConceptId = typeof match3TutorialConceptIds[number];
export type Match3TutorialCompletionEvent = 'valid-swap' | 'blocker-cleared' | 'ingredient-dropped';

export type Match3TutorialDefinition = Readonly<{
  id: Match3TutorialConceptId;
  completeOn: Match3TutorialCompletionEvent;
}>;

export const match3TutorialDefinitions: Readonly<Record<Match3TutorialConceptId, Match3TutorialDefinition>> = {
  'basic-swap': { id: 'basic-swap', completeOn: 'valid-swap' },
  'clear-blocker': { id: 'clear-blocker', completeOn: 'blocker-cleared' },
  'drop-ingredient': { id: 'drop-ingredient', completeOn: 'ingredient-dropped' },
};

export function nextPendingMatch3Tutorial(
  levelConcepts: readonly Match3TutorialConceptId[],
  completed: readonly Match3TutorialConceptId[],
): Match3TutorialConceptId | null {
  const completedSet = new Set(completed);
  return levelConcepts.find((concept) => !completedSet.has(concept)) ?? null;
}

export function tutorialCompletesOn(
  concept: Match3TutorialConceptId,
  event: Match3TutorialCompletionEvent,
): boolean {
  return match3TutorialDefinitions[concept].completeOn === event;
}

export function tutorialCompletionEventsForMove(result: Readonly<{
  valid: boolean;
  blockersCleared: number;
  ingredientsDropped: number;
}>): Match3TutorialCompletionEvent[] {
  if (!result.valid) return [];
  const events: Match3TutorialCompletionEvent[] = ['valid-swap'];
  if (result.blockersCleared > 0) events.push('blocker-cleared');
  if (result.ingredientsDropped > 0) events.push('ingredient-dropped');
  return events;
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
