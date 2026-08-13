export type Match3ReactionId =
  | 'low-moves'
  | 'special-created'
  | 'blocker-progress'
  | 'ingredient-context'
  | 'cascade';

export type Match3ReactionSpeaker = 'miku' | 'onoe' | 'ayuki' | 'emi' | 'kentaro' | 'norihiro';
export type Match3ReactionRepeat = 'once-per-attempt' | 'repeatable';
export type Match3RunMode = 'story' | 'campaign' | 'lab';

type Match3ReactionTrigger =
  | Readonly<{ kind: 'moves-left'; equals: number }>
  | Readonly<{ kind: 'specials-created'; min: number }>
  | Readonly<{ kind: 'blockers-cleared'; min: number }>
  | Readonly<{ kind: 'move-number'; equals: number }>
  | Readonly<{ kind: 'cascades'; min: number }>;

export type Match3ReactionRule = Readonly<{
  id: Match3ReactionId;
  priority: number;
  repeat: Match3ReactionRepeat;
  speaker: Match3ReactionSpeaker;
  messageKey: string;
  trigger: Match3ReactionTrigger;
  narrativeProfile?: string;
  modes?: readonly Match3RunMode[];
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
  triggered: ReadonlySet<Match3ReactionId>;
}>;

export type Match3Reaction = Readonly<{
  id: Match3ReactionId;
  repeat: Match3ReactionRepeat;
  speaker: Match3ReactionSpeaker;
  messageKey: string;
  params?: Readonly<Record<string, string | number>>;
}>;

const commonSpecialRule = (): Match3ReactionRule => ({
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

export const match3ReactionRulesByLevel: Readonly<Record<string, readonly Match3ReactionRule[]>> = {
  M3_00_LOCKER_TUTORIAL: [
    { id: 'low-moves', priority: 500, repeat: 'once-per-attempt', speaker: 'miku', messageKey: 'match3.bark.fiveMoves.0', trigger: { kind: 'moves-left', equals: 5 } },
    commonSpecialRule(),
    { id: 'blocker-progress', priority: 300, repeat: 'once-per-attempt', speaker: 'ayuki', messageKey: 'match3.bark.blockers.0', trigger: { kind: 'blockers-cleared', min: 3 } },
    { id: 'ingredient-context', priority: 200, repeat: 'once-per-attempt', speaker: 'onoe', messageKey: 'match3.bark.ingredient.0', trigger: { kind: 'move-number', equals: 1 } },
    commonCascadeRule(),
  ],
  M3_01_PHOTO_PROPS: [
    { id: 'low-moves', priority: 500, repeat: 'once-per-attempt', speaker: 'kentaro', messageKey: 'match3.bark.fiveMoves.1', trigger: { kind: 'moves-left', equals: 5 } },
    commonSpecialRule(),
    { id: 'blocker-progress', priority: 300, repeat: 'once-per-attempt', speaker: 'onoe', messageKey: 'match3.bark.blockers.1', trigger: { kind: 'blockers-cleared', min: 1 } },
    { id: 'ingredient-context', priority: 200, repeat: 'once-per-attempt', speaker: 'ayuki', messageKey: 'match3.bark.ingredient.1', trigger: { kind: 'move-number', equals: 1 } },
    commonCascadeRule(),
  ],
  M3_02_POOL_LAUNDRY: [
    { id: 'low-moves', priority: 500, repeat: 'once-per-attempt', speaker: 'miku', messageKey: 'match3.bark.fiveMoves.2', trigger: { kind: 'moves-left', equals: 5 } },
    commonSpecialRule(),
    { id: 'blocker-progress', priority: 300, repeat: 'once-per-attempt', speaker: 'miku', messageKey: 'match3.bark.blockers.2', trigger: { kind: 'blockers-cleared', min: 6 } },
    { id: 'ingredient-context', priority: 200, repeat: 'once-per-attempt', speaker: 'ayuki', messageKey: 'match3.bark.ingredient.2', trigger: { kind: 'move-number', equals: 1 } },
    commonCascadeRule(),
  ],
  M3_03_ORDERED_APARTMENT: [
    { id: 'low-moves', priority: 500, repeat: 'once-per-attempt', speaker: 'onoe', messageKey: 'match3.bark.fiveMoves.3', trigger: { kind: 'moves-left', equals: 5 } },
    commonSpecialRule(),
    { id: 'blocker-progress', priority: 300, repeat: 'once-per-attempt', speaker: 'ayuki', messageKey: 'match3.bark.blockers.3', trigger: { kind: 'blockers-cleared', min: 4 } },
    { id: 'ingredient-context', priority: 200, repeat: 'once-per-attempt', speaker: 'miku', messageKey: 'match3.bark.ingredient.3', trigger: { kind: 'move-number', equals: 1 } },
    commonCascadeRule(),
  ],
};

const matchesTrigger = (rule: Match3ReactionRule, context: Match3ReactionContext): boolean => {
  const trigger = rule.trigger;
  if (trigger.kind === 'moves-left') return context.movesLeft === trigger.equals;
  if (trigger.kind === 'specials-created') return context.specialsCreated >= trigger.min;
  if (trigger.kind === 'blockers-cleared') return context.blockersCleared >= trigger.min;
  if (trigger.kind === 'move-number') return context.moveNumber === trigger.equals;
  return context.cascades >= trigger.min;
};

export function resolveMatch3Reaction(context: Match3ReactionContext): Match3Reaction | null {
  const rules = match3ReactionRulesByLevel[context.levelId] ?? [];
  const rule = rules
    .filter((candidate) => !candidate.narrativeProfile || candidate.narrativeProfile === context.narrativeProfile)
    .filter((candidate) => !candidate.modes || candidate.modes.includes(context.runMode))
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
