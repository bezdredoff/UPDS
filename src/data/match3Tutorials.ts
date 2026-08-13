export const match3TutorialConceptIds = ['basic-swap'] as const;

export type Match3TutorialConceptId = typeof match3TutorialConceptIds[number];
export type Match3TutorialCompletionEvent = 'valid-swap';

export type Match3TutorialDefinition = Readonly<{
  id: Match3TutorialConceptId;
  completeOn: Match3TutorialCompletionEvent;
}>;

export const match3TutorialDefinitions: Readonly<Record<Match3TutorialConceptId, Match3TutorialDefinition>> = {
  'basic-swap': { id: 'basic-swap', completeOn: 'valid-swap' },
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
