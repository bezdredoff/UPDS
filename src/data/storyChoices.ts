export const storyChoiceGateIds = ['meeting-tone', 'apology-to-hinata', 'protect-gen-source'] as const;
export type StoryChoiceGateId = typeof storyChoiceGateIds[number];
export type StoryChoiceOptionId = 'A' | 'B' | 'C';
export type StoryChoiceSelections = Partial<Record<StoryChoiceGateId, StoryChoiceOptionId>>;

export type StoryChoiceGate = Readonly<{
  id: StoryChoiceGateId;
  checkpointLineId: string;
  options: readonly StoryChoiceOptionId[];
}>;

export const storyChoiceGates: readonly StoryChoiceGate[] = [
  { id: 'meeting-tone', checkpointLineId: 'VN0262', options: ['A', 'B', 'C'] },
  { id: 'apology-to-hinata', checkpointLineId: 'VN0356', options: ['A', 'B', 'C'] },
  { id: 'protect-gen-source', checkpointLineId: 'VN0480', options: ['A', 'B', 'C'] },
];

export const storyChoiceGateForLine = (lineId: string): StoryChoiceGate | null =>
  storyChoiceGates.find((gate) => gate.checkpointLineId === lineId) ?? null;
