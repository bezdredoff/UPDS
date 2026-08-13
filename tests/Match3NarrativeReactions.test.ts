import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';
import {
  match3ReactionRulesByLevel,
  resolveMatch3Reaction,
  type Match3ReactionContext,
  type Match3ReactionId,
  type Match3RunMode,
} from '../src/data/match3Reactions';

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

const f1Ids = new Set<Match3ReactionId>([
  'low-moves',
  'special-created',
  'blocker-progress',
  'ingredient-context',
  'cascade',
]);

describe('ANM-025F1 Match-3 narrative reaction contract', () => {
  it('keys production reactions by stable level id and preserves the migrated F1 rules', () => {
    expect(Object.keys(match3ReactionRulesByLevel).sort()).toEqual(levels.map((level) => level.id).sort());
    const migrated = match3ReactionRulesByLevel.M3_00_LOCKER_TUTORIAL
      .filter((rule) => f1Ids.has(rule.id))
      .map((rule) => [rule.id, rule.speaker, rule.messageKey, rule.trigger]);
    expect(migrated).toEqual([
      ['low-moves', 'miku', 'match3.bark.fiveMoves.0', { kind: 'moves-left', equals: 5 }],
      ['special-created', 'miku', 'match3.bark.special', { kind: 'specials-created', min: 1 }],
      ['blocker-progress', 'ayuki', 'match3.bark.blockers.0', { kind: 'blockers-cleared', min: 3 }],
      ['ingredient-context', 'onoe', 'match3.bark.ingredient.0', { kind: 'move-number', equals: 1 }],
      ['cascade', 'ayuki', 'match3.bark.cascade', { kind: 'cascades', min: 2 }],
    ]);
    expect(match3ReactionRulesByLevel.M3_01_PHOTO_PROPS.find((rule) => rule.id === 'blocker-progress')?.trigger).toEqual({ kind: 'blockers-cleared', min: 1 });
    expect(match3ReactionRulesByLevel.M3_02_POOL_LAUNDRY.find((rule) => rule.id === 'blocker-progress')?.trigger).toEqual({ kind: 'blockers-cleared', min: 6 });
    expect(match3ReactionRulesByLevel.M3_03_ORDERED_APARTMENT.find((rule) => rule.id === 'blocker-progress')?.trigger).toEqual({ kind: 'blockers-cleared', min: 4 });
  });

  it('keeps F1 priority deterministic when F2 signals are not eligible', () => {
    const allEligible = context({ movesLeft: 5, moveNumber: 1, blockersCleared: 6, specialsCreated: 1, cascades: 3 });
    expect(resolveMatch3Reaction(allEligible)?.id).toBe('low-moves');
    expect(resolveMatch3Reaction({ ...allEligible, triggered: new Set<Match3ReactionId>(['low-moves']) })?.id).toBe('special-created');
    expect(resolveMatch3Reaction({ ...allEligible, triggered: new Set<Match3ReactionId>(['low-moves', 'special-created']) })?.id).toBe('blocker-progress');
    expect(resolveMatch3Reaction({ ...allEligible, triggered: new Set<Match3ReactionId>(['low-moves', 'special-created', 'blocker-progress']) })?.id).toBe('ingredient-context');
    expect(resolveMatch3Reaction({ ...allEligible, triggered: new Set<Match3ReactionId>(['low-moves', 'special-created', 'blocker-progress', 'ingredient-context']) })?.id).toBe('cascade');
  });

  it('keeps cascade repeatable and resolves the same pure contract in Story, Campaign and Level Lab', () => {
    for (const runMode of ['story', 'campaign', 'lab'] as const satisfies readonly Match3RunMode[]) {
      const reaction = resolveMatch3Reaction(context({ runMode, cascades: 4, triggered: new Set<Match3ReactionId>(['cascade']) }));
      expect(reaction).toMatchObject({ id: 'cascade', repeat: 'repeatable', speaker: 'ayuki', params: { count: 4 } });
    }
  });

  it('keeps reaction selection pure and removes level-index reaction tables from the controller', () => {
    const reactionSource = readFileSync(resolve(process.cwd(), 'src/data/match3Reactions.ts'), 'utf8');
    const controllerSource = readFileSync(resolve(process.cwd(), 'src/features/match3/Match3Controller.ts'), 'utf8');
    for (const forbidden of ['HTMLElement', 'document.', 'RuntimeServices', 'AppSession', 'Match3Game']) expect(reactionSource).not.toContain(forbidden);
    expect(controllerSource).toContain('resolveMatch3Reaction');
    expect(controllerSource).not.toContain('blockerThresholds');
    expect(controllerSource).not.toContain("this.bark('fiveMoves.0'");
    expect(controllerSource).not.toContain("this.bark('blockers.0'");
    expect(controllerSource).not.toContain("this.bark('ingredient.0'");
  });
});
