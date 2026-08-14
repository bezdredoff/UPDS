import type { ClueId } from './levels';
import { choices, type ChoiceId } from './narrative';
import type { StoryChoiceSelections } from './storyChoices';
import type { StoryEndingRequirement } from './storyGraph';

export const fullTruthRequirement = Object.freeze({ evidence: 7, teamTrust: 2, sourceTrust: 2 });

export const fullTruthEvidenceClueIds = [
  'CUE_010',
  'CUE_011',
  'CUE_012',
  'CUE_013',
  'CUE_014',
  'CUE_015',
  'CUE_016',
  'CUE_017',
  'CUE_018',
  'CUE_019',
] as const satisfies readonly ClueId[];

export type StoryOutcomeMetrics = Readonly<{
  evidence: number;
  teamTrust: number;
  sourceTrust: number;
}>;

export type StoryOutcomeInput = Readonly<{
  choice: ChoiceId;
  clues: readonly ClueId[];
  storyChoices: StoryChoiceSelections;
}>;

const optionIs = (selections: StoryChoiceSelections, gate: keyof StoryChoiceSelections, option: 'A' | 'B' | 'C'): boolean =>
  selections[gate] === option;

/**
 * Derives the three ending metrics from persisted player-visible decisions.
 * No hidden mutable relationship state is introduced: old schema-2 saves remain sufficient.
 */
export function storyOutcomeMetrics(input: StoryOutcomeInput): StoryOutcomeMetrics {
  const evidence = fullTruthEvidenceClueIds.filter((clueId) => input.clues.includes(clueId)).length;

  let sourceTrust = choices[input.choice].state.sourceTrust;
  if (optionIs(input.storyChoices, 'meeting-tone', 'C')) sourceTrust += 1;
  if (optionIs(input.storyChoices, 'apology-to-hinata', 'A')) sourceTrust += 1;
  if (optionIs(input.storyChoices, 'protect-gen-source', 'B')) sourceTrust += 1;
  if (optionIs(input.storyChoices, 'photo-permission', 'A')) sourceTrust += 1;
  if (optionIs(input.storyChoices, 'family-ledger-permission', 'A')) sourceTrust += 1;
  if (optionIs(input.storyChoices, 'trust-vincent', 'A')) sourceTrust += 1;

  let teamTrust = choices[input.choice].state.onoeTrust;
  if (optionIs(input.storyChoices, 'meeting-tone', 'A') || optionIs(input.storyChoices, 'meeting-tone', 'B')) teamTrust += 1;
  if (optionIs(input.storyChoices, 'apology-to-hinata', 'B') || optionIs(input.storyChoices, 'apology-to-hinata', 'C')) teamTrust += 1;
  if (optionIs(input.storyChoices, 'protect-gen-source', 'A')) teamTrust += 1;
  if (optionIs(input.storyChoices, 'publish-tag', 'A') || optionIs(input.storyChoices, 'publish-tag', 'B')) teamTrust += 1;
  if (optionIs(input.storyChoices, 'trust-vincent', 'C')) teamTrust += 1;

  return { evidence, teamTrust, sourceTrust };
}

export function meetsStoryEndingRequirement(metrics: StoryOutcomeMetrics, requirement: StoryEndingRequirement): boolean {
  return metrics.evidence >= requirement.evidence
    && metrics.teamTrust >= requirement.teamTrust
    && metrics.sourceTrust >= requirement.sourceTrust;
}

export function meetsFullTruthRequirement(metrics: StoryOutcomeMetrics): boolean {
  return meetsStoryEndingRequirement(metrics, fullTruthRequirement);
}
