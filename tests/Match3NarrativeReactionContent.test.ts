import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';
import {
  match3ReactionRulesByLevel,
  resolveMatch3Reaction,
  type Match3ReactionContext,
  type Match3ReactionId,
} from '../src/data/match3Reactions';
import { match3ReactionCatalogs } from '../src/localization/catalogs/match3Reactions';

const context = (overrides: Partial<Match3ReactionContext> = {}): Match3ReactionContext => ({
  levelId: 'M3_00_LOCKER_TUTORIAL',
  narrativeProfile: 'locker-search',
  runMode: 'story',
  movesLeft: 10,
  moveNumber: 2,
  blockersCleared: 0,
  specialsCreated: 0,
  cascades: 1,
  specialActivated: false,
  directSpecialCombo: false,
  objectivesCompleted: 0,
  objectiveUnitsRemaining: 7,
  won: false,
  lost: false,
  triggered: new Set<Match3ReactionId>(),
  ...overrides,
});

const f2Ids = [
  'objective-complete',
  'danger',
  'special-combo',
  'near-win',
  'special-activated',
  'character-beat',
] as const satisfies readonly Match3ReactionId[];

describe('ANM-025F2 Match-3 narrative reaction content', () => {
  it('ships every F2 reaction family for every production level with localized message keys', () => {
    for (const level of levels) {
      const rules = match3ReactionRulesByLevel[level.id];
      for (const id of f2Ids) {
        const rule = rules.find((candidate) => candidate.id === id);
        expect(rule, `${level.id}:${id}`).toBeTruthy();
        expect(match3ReactionCatalogs.ru[rule!.messageKey as keyof typeof match3ReactionCatalogs.ru]).toBeTruthy();
        expect(match3ReactionCatalogs.en[rule!.messageKey as keyof typeof match3ReactionCatalogs.en]).toBeTruthy();
      }
    }
  });

  it('uses deterministic F2 priority without turning the resolver into a queue', () => {
    const eligible = context({
      movesLeft: 2,
      moveNumber: 4,
      specialActivated: true,
      directSpecialCombo: true,
      objectivesCompleted: 1,
      objectiveUnitsRemaining: 1,
    });
    expect(resolveMatch3Reaction(eligible)?.id).toBe('objective-complete');
    expect(resolveMatch3Reaction({ ...eligible, triggered: new Set<Match3ReactionId>(['objective-complete']) })?.id).toBe('danger');
    expect(resolveMatch3Reaction({ ...eligible, triggered: new Set<Match3ReactionId>(['objective-complete', 'danger']) })?.id).toBe('special-combo');
    expect(resolveMatch3Reaction({ ...eligible, triggered: new Set<Match3ReactionId>(['objective-complete', 'danger', 'special-combo']) })?.id).toBe('near-win');
    expect(resolveMatch3Reaction({ ...eligible, triggered: new Set<Match3ReactionId>(['objective-complete', 'danger', 'special-combo', 'near-win']) })?.id).toBe('special-activated');
  });

  it('recognizes near-win state only after objective progress and suppresses F2 barks on finished moves', () => {
    expect(resolveMatch3Reaction(context({ objectivesCompleted: 0, objectiveUnitsRemaining: 2 }))).toBeNull();
    expect(resolveMatch3Reaction(context({ objectivesCompleted: 1, objectiveUnitsRemaining: 2, triggered: new Set<Match3ReactionId>(['objective-complete']) }))?.id).toBe('near-win');
    expect(resolveMatch3Reaction(context({ objectivesCompleted: 1, objectiveUnitsRemaining: 1, won: true, movesLeft: 2, specialActivated: true, directSpecialCombo: true }))).toBeNull();
    expect(resolveMatch3Reaction(context({ objectivesCompleted: 1, objectiveUnitsRemaining: 1, lost: true, movesLeft: 2, specialActivated: true, directSpecialCombo: true }))).toBeNull();
  });

  it('uses explicit runtime facts rather than level-index heuristics for new reactions', () => {
    const controllerSource = readFileSync(resolve(process.cwd(), 'src/features/match3/Match3Controller.ts'), 'utf8');
    expect(controllerSource).toContain('objectiveUnitsRemaining');
    expect(controllerSource).toContain("const specialActivated = result.primaryFeedback === 'special'");
    expect(controllerSource).toContain('this.updateNarrativeReaction(result, directSpecialCombo)');
    expect(controllerSource).not.toContain('objectiveCompleteThresholds');
    expect(controllerSource).not.toContain('nearWinThresholds');
  });
});
