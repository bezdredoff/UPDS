export const storyChoiceGateIds = ['meeting-tone', 'apology-to-hinata', 'protect-gen-source', 'photo-permission', 'publish-tag', 'family-ledger-permission'] as const;
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
  { id: 'photo-permission', checkpointLineId: 'VN0560', options: ['A', 'B', 'C'] },
  { id: 'publish-tag', checkpointLineId: 'VN0601', options: ['A', 'B', 'C'] },
  { id: 'family-ledger-permission', checkpointLineId: 'VN0678', options: ['A', 'B', 'C'] },
];

export const storyChoiceGateForLine = (lineId: string): StoryChoiceGate | null =>
  storyChoiceGates.find((gate) => gate.checkpointLineId === lineId) ?? null;
