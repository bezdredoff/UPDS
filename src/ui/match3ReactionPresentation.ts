import type { Match3Reaction, Match3ReactionId } from '../data/match3Reactions';

export type Match3ReactionEmphasis = 'urgent' | 'strong' | 'standard' | 'light';

export type Match3ReactionPresentationPolicy = Readonly<{
  durationMs: number;
  cooldownMs: number;
  emphasis: Match3ReactionEmphasis;
}>;

export type Match3ReactionPresentationDecision = Readonly<{
  show: boolean;
  policy: Match3ReactionPresentationPolicy;
  reason?: 'cooldown';
}>;

const policies: Readonly<Record<Match3ReactionId, Match3ReactionPresentationPolicy>> = {
  'objective-complete': { durationMs: 3200, cooldownMs: 0, emphasis: 'urgent' },
  danger: { durationMs: 3200, cooldownMs: 0, emphasis: 'urgent' },
  'special-combo': { durationMs: 2600, cooldownMs: 0, emphasis: 'strong' },
  'near-win': { durationMs: 3000, cooldownMs: 0, emphasis: 'strong' },
  'low-moves': { durationMs: 2800, cooldownMs: 0, emphasis: 'standard' },
  'special-activated': { durationMs: 2300, cooldownMs: 0, emphasis: 'strong' },
  'special-created': { durationMs: 2300, cooldownMs: 0, emphasis: 'standard' },
  'blocker-progress': { durationMs: 2600, cooldownMs: 0, emphasis: 'standard' },
  'ingredient-context': { durationMs: 2500, cooldownMs: 0, emphasis: 'standard' },
  'character-beat': { durationMs: 2800, cooldownMs: 0, emphasis: 'standard' },
  cascade: { durationMs: 1700, cooldownMs: 3600, emphasis: 'light' },
};

export function match3ReactionPresentationPolicy(id: Match3ReactionId): Match3ReactionPresentationPolicy {
  return policies[id];
}

export function resolveMatch3ReactionPresentation(
  reaction: Pick<Match3Reaction, 'id' | 'repeat'>,
  nowMs: number,
  lastPresentedAtMs?: number,
): Match3ReactionPresentationDecision {
  const policy = match3ReactionPresentationPolicy(reaction.id);
  if (reaction.repeat !== 'repeatable' || policy.cooldownMs <= 0 || lastPresentedAtMs === undefined) {
    return { show: true, policy };
  }
  if (nowMs - lastPresentedAtMs >= policy.cooldownMs) return { show: true, policy };
  return { show: false, policy, reason: 'cooldown' };
}
