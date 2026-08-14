export type Match3ReactionId =
  | 'objective-complete'
  | 'danger'
  | 'special-combo'
  | 'near-win'
  | 'low-moves'
  | 'special-activated'
  | 'special-created'
  | 'blocker-progress'
  | 'ingredient-context'
  | 'character-beat'
  | 'cascade';

export type Match3ReactionSpeaker = 'miku' | 'onoe' | 'ayuki' | 'emi' | 'kentaro' | 'norihiro';
export type Match3ReactionRepeat = 'once-per-attempt' | 'repeatable';
export type Match3RunMode = 'story' | 'campaign' | 'lab';

type Match3ReactionTrigger =
  | Readonly<{ kind: 'moves-left'; equals: number }>
  | Readonly<{ kind: 'specials-created'; min: number }>
  | Readonly<{ kind: 'blockers-cleared'; min: number }>
  | Readonly<{ kind: 'move-number'; equals: number }>
  | Readonly<{ kind: 'cascades'; min: number }>
  | Readonly<{ kind: 'objective-complete'; minCompleted: number }>
  | Readonly<{ kind: 'special-activated' }>
  | Readonly<{ kind: 'special-combo' }>
  | Readonly<{ kind: 'near-win'; minCompleted: number; maxUnitsRemaining: number }>;

export type Match3ReactionRule = Readonly<{
  id: Match3ReactionId;
  priority: number;
  repeat: Match3ReactionRepeat;
  speaker: Match3ReactionSpeaker;
  messageKey: string;
  trigger: Match3ReactionTrigger;
  narrativeProfile?: string;
  modes?: readonly Match3RunMode[];
  activeAttemptOnly?: boolean;
}>;

export type Match3ReactionContext = Readonly<{
  levelId: string;
  narrativeProfile: string;
  runMode: Match3RunMode;
  movesLeft: number;
  moveNumber: number;
  blockersCleared: number;
  specialsCreated: number;
  cascades: number;
  specialActivated: boolean;
  directSpecialCombo: boolean;
  objectivesCompleted: number;
  objectiveUnitsRemaining: number;
  won: boolean;
  lost: boolean;
  triggered: ReadonlySet<Match3ReactionId>;
}>;

export type Match3Reaction = Readonly<{
  id: Match3ReactionId;
  repeat: Match3ReactionRepeat;
  speaker: Match3ReactionSpeaker;
  messageKey: string;
  params?: Readonly<Record<string, string | number>>;
}>;

const commonSpecialCreatedRule = (): Match3ReactionRule => ({
  id: 'special-created',
  priority: 400,
  repeat: 'once-per-attempt',
  speaker: 'miku',
  messageKey: 'match3.bark.special',
  trigger: { kind: 'specials-created', min: 1 },
});

const commonCascadeRule = (): Match3ReactionRule => ({
  id: 'cascade',
  priority: 100,
  repeat: 'repeatable',
  speaker: 'ayuki',
  messageKey: 'match3.bark.cascade',
  trigger: { kind: 'cascades', min: 2 },
});

const f2Rules = (
  index: number,
  speakers: Readonly<{
    objective: Match3ReactionSpeaker;
    special: Match3ReactionSpeaker;
    combo: Match3ReactionSpeaker;
    nearWin: Match3ReactionSpeaker;
    danger: Match3ReactionSpeaker;
    beat: Match3ReactionSpeaker;
  }>,
): readonly Match3ReactionRule[] => [
  { id: 'objective-complete', priority: 700, repeat: 'once-per-attempt', activeAttemptOnly: true, speaker: speakers.objective, messageKey: `match3.reaction.objectiveComplete.${index}`, trigger: { kind: 'objective-complete', minCompleted: 1 } },
  { id: 'danger', priority: 650, repeat: 'once-per-attempt', activeAttemptOnly: true, speaker: speakers.danger, messageKey: `match3.reaction.danger.${index}`, trigger: { kind: 'moves-left', equals: 2 } },
  { id: 'special-combo', priority: 625, repeat: 'once-per-attempt', activeAttemptOnly: true, speaker: speakers.combo, messageKey: `match3.reaction.specialCombo.${index}`, trigger: { kind: 'special-combo' } },
  { id: 'near-win', priority: 600, repeat: 'once-per-attempt', activeAttemptOnly: true, speaker: speakers.nearWin, messageKey: `match3.reaction.nearWin.${index}`, trigger: { kind: 'near-win', minCompleted: 1, maxUnitsRemaining: 2 } },
  { id: 'special-activated', priority: 450, repeat: 'once-per-attempt', activeAttemptOnly: true, speaker: speakers.special, messageKey: `match3.reaction.specialActivated.${index}`, trigger: { kind: 'special-activated' } },
  { id: 'character-beat', priority: 150, repeat: 'once-per-attempt', activeAttemptOnly: true, speaker: speakers.beat, messageKey: `match3.reaction.characterBeat.${index}`, trigger: { kind: 'move-number', equals: 4 } },
];

export const match3ReactionRulesByLevel: Readonly<Record<string, readonly Match3ReactionRule[]>> = {
  M3_00_LOCKER_TUTORIAL: [
    ...f2Rules(0, { objective: 'onoe', special: 'miku', combo: 'ayuki', nearWin: 'emi', danger: 'miku', beat: 'emi' }),
    { id: 'low-moves', priority: 500, repeat: 'once-per-attempt', speaker: 'miku', messageKey: 'match3.bark.fiveMoves.0', trigger: { kind: 'moves-left', equals: 5 } },
    commonSpecialCreatedRule(),
    { id: 'blocker-progress', priority: 300, repeat: 'once-per-attempt', speaker: 'ayuki', messageKey: 'match3.bark.blockers.0', trigger: { kind: 'blockers-cleared', min: 3 } },
    { id: 'ingredient-context', priority: 200, repeat: 'once-per-attempt', speaker: 'onoe', messageKey: 'match3.bark.ingredient.0', trigger: { kind: 'move-number', equals: 1 } },
    commonCascadeRule(),
  ],
  M3_01_PHOTO_PROPS: [
    ...f2Rules(1, { objective: 'onoe', special: 'kentaro', combo: 'ayuki', nearWin: 'miku', danger: 'kentaro', beat: 'kentaro' }),
    { id: 'low-moves', priority: 500, repeat: 'once-per-attempt', speaker: 'kentaro', messageKey: 'match3.bark.fiveMoves.1', trigger: { kind: 'moves-left', equals: 5 } },
    commonSpecialCreatedRule(),
    { id: 'blocker-progress', priority: 300, repeat: 'once-per-attempt', speaker: 'onoe', messageKey: 'match3.bark.blockers.1', trigger: { kind: 'blockers-cleared', min: 1 } },
    { id: 'ingredient-context', priority: 200, repeat: 'once-per-attempt', speaker: 'ayuki', messageKey: 'match3.bark.ingredient.1', trigger: { kind: 'move-number', equals: 1 } },
    commonCascadeRule(),
  ],
  M3_02_POOL_LAUNDRY: [
    ...f2Rules(2, { objective: 'norihiro', special: 'miku', combo: 'ayuki', nearWin: 'onoe', danger: 'norihiro', beat: 'norihiro' }),
    { id: 'low-moves', priority: 500, repeat: 'once-per-attempt', speaker: 'miku', messageKey: 'match3.bark.fiveMoves.2', trigger: { kind: 'moves-left', equals: 5 } },
    commonSpecialCreatedRule(),
    { id: 'blocker-progress', priority: 300, repeat: 'once-per-attempt', speaker: 'miku', messageKey: 'match3.bark.blockers.2', trigger: { kind: 'blockers-cleared', min: 6 } },
    { id: 'ingredient-context', priority: 200, repeat: 'once-per-attempt', speaker: 'ayuki', messageKey: 'match3.bark.ingredient.2', trigger: { kind: 'move-number', equals: 1 } },
    commonCascadeRule(),
  ],
  M3_03_ORDERED_APARTMENT: [
    ...f2Rules(3, { objective: 'norihiro', special: 'miku', combo: 'ayuki', nearWin: 'onoe', danger: 'norihiro', beat: 'norihiro' }),
    { id: 'low-moves', priority: 500, repeat: 'once-per-attempt', speaker: 'onoe', messageKey: 'match3.bark.fiveMoves.3', trigger: { kind: 'moves-left', equals: 5 } },
    commonSpecialCreatedRule(),
    { id: 'blocker-progress', priority: 300, repeat: 'once-per-attempt', speaker: 'ayuki', messageKey: 'match3.bark.blockers.3', trigger: { kind: 'blockers-cleared', min: 4 } },
    { id: 'ingredient-context', priority: 200, repeat: 'once-per-attempt', speaker: 'miku', messageKey: 'match3.bark.ingredient.3', trigger: { kind: 'move-number', equals: 1 } },
    commonCascadeRule(),
  ],
  M3_04_EMERGENCY_MEETING: [
    ...f2Rules(4, { objective: 'onoe', special: 'miku', combo: 'ayuki', nearWin: 'miku', danger: 'onoe', beat: 'ayuki' }),
    { id: 'low-moves', priority: 500, repeat: 'once-per-attempt', speaker: 'miku', messageKey: 'match3.bark.fiveMoves.4', trigger: { kind: 'moves-left', equals: 5 } }, commonSpecialCreatedRule(),
    { id: 'blocker-progress', priority: 300, repeat: 'once-per-attempt', speaker: 'ayuki', messageKey: 'match3.bark.blockers.4', trigger: { kind: 'blockers-cleared', min: 4 } },
    { id: 'ingredient-context', priority: 200, repeat: 'once-per-attempt', speaker: 'onoe', messageKey: 'match3.bark.ingredient.4', trigger: { kind: 'move-number', equals: 1 } }, commonCascadeRule(),
  ],
  M3_05_BASKETBALL_LOCKERS: [
    ...f2Rules(5, { objective: 'onoe', special: 'miku', combo: 'ayuki', nearWin: 'miku', danger: 'onoe', beat: 'ayuki' }),
    { id: 'low-moves', priority: 500, repeat: 'once-per-attempt', speaker: 'onoe', messageKey: 'match3.bark.fiveMoves.5', trigger: { kind: 'moves-left', equals: 5 } }, commonSpecialCreatedRule(),
    { id: 'blocker-progress', priority: 300, repeat: 'once-per-attempt', speaker: 'miku', messageKey: 'match3.bark.blockers.5', trigger: { kind: 'blockers-cleared', min: 5 } },
    { id: 'ingredient-context', priority: 200, repeat: 'once-per-attempt', speaker: 'ayuki', messageKey: 'match3.bark.ingredient.5', trigger: { kind: 'move-number', equals: 1 } }, commonCascadeRule(),
  ],
  M3_06_TEXTILE_WORKSHOP: [
    ...f2Rules(6, { objective: 'miku', special: 'onoe', combo: 'ayuki', nearWin: 'miku', danger: 'onoe', beat: 'ayuki' }),
    { id: 'low-moves', priority: 500, repeat: 'once-per-attempt', speaker: 'miku', messageKey: 'match3.bark.fiveMoves.6', trigger: { kind: 'moves-left', equals: 5 } }, commonSpecialCreatedRule(),
    { id: 'blocker-progress', priority: 300, repeat: 'once-per-attempt', speaker: 'onoe', messageKey: 'match3.bark.blockers.6', trigger: { kind: 'blockers-cleared', min: 4 } },
    { id: 'ingredient-context', priority: 200, repeat: 'once-per-attempt', speaker: 'ayuki', messageKey: 'match3.bark.ingredient.6', trigger: { kind: 'move-number', equals: 1 } }, commonCascadeRule(),
  ],
};

const matchesTrigger = (rule: Match3ReactionRule, context: Match3ReactionContext): boolean => {
  const trigger = rule.trigger;
  if (trigger.kind === 'moves-left') return context.movesLeft === trigger.equals;
  if (trigger.kind === 'specials-created') return context.specialsCreated >= trigger.min;
  if (trigger.kind === 'blockers-cleared') return context.blockersCleared >= trigger.min;
  if (trigger.kind === 'move-number') return context.moveNumber === trigger.equals;
  if (trigger.kind === 'cascades') return context.cascades >= trigger.min;
  if (trigger.kind === 'objective-complete') return !context.won && !context.lost && context.objectivesCompleted >= trigger.minCompleted;
  if (trigger.kind === 'special-activated') return context.specialActivated;
  if (trigger.kind === 'special-combo') return context.directSpecialCombo;
  return !context.won
    && !context.lost
    && context.objectivesCompleted >= trigger.minCompleted
    && context.objectiveUnitsRemaining > 0
    && context.objectiveUnitsRemaining <= trigger.maxUnitsRemaining;
};

export function resolveMatch3Reaction(context: Match3ReactionContext): Match3Reaction | null {
  const rules = match3ReactionRulesByLevel[context.levelId] ?? [];
  const rule = rules
    .filter((candidate) => !candidate.narrativeProfile || candidate.narrativeProfile === context.narrativeProfile)
    .filter((candidate) => !candidate.modes || candidate.modes.includes(context.runMode))
    .filter((candidate) => !candidate.activeAttemptOnly || (!context.won && !context.lost))
    .filter((candidate) => candidate.repeat === 'repeatable' || !context.triggered.has(candidate.id))
    .filter((candidate) => matchesTrigger(candidate, context))
    .sort((left, right) => right.priority - left.priority)[0];

  if (!rule) return null;
  return {
    id: rule.id,
    repeat: rule.repeat,
    speaker: rule.speaker,
    messageKey: rule.messageKey,
    params: rule.id === 'cascade' ? { count: context.cascades } : undefined,
  };
}
