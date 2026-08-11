import { characterForSpeaker, placeholderForSpeaker, type CharacterKey, type PlaceholderKey } from '../data/characterRigs';

export type VnStorySpeakerLine = Readonly<{ speaker: string }>;

export type VnStageActor = CharacterKey | PlaceholderKey;
export type VnStageSide = 'left' | 'right' | 'center';

export type VnStaging = Readonly<{
  actor: VnStageActor;
  counterpart: VnStageActor | null;
  side: VnStageSide;
}>;

const externalActors = new Set<VnStageActor>(['emi', 'kentaro', 'norihiro', 'mayu']);

export function actorForStorySpeaker(speaker: string): VnStageActor | null {
  return characterForSpeaker(speaker) ?? placeholderForSpeaker(speaker);
}

function nearestCounterpart(story: readonly VnStorySpeakerLine[], lineIndex: number, actor: VnStageActor): VnStageActor | null {
  // Prefer the person who spoke immediately before us, because that preserves
  // shot/reverse-shot continuity. Fall forward when a new exchange starts.
  for (let distance = 1; distance <= 5; distance += 1) {
    const previous = story[lineIndex - distance];
    const previousActor = previous ? actorForStorySpeaker(previous.speaker) : null;
    if (previousActor && previousActor !== actor) return previousActor;

    const next = story[lineIndex + distance];
    const nextActor = next ? actorForStorySpeaker(next.speaker) : null;
    if (nextActor && nextActor !== actor) return nextActor;
  }
  return null;
}

function pairSide(actor: VnStageActor, counterpart: VnStageActor | null): VnStageSide {
  if (!counterpart) {
    if (actor === 'miku') return 'left';
    if (actor === 'onoe') return 'right';
    if (actor === 'ayuki') return 'right';
    return 'right';
  }

  const actorExternal = externalActors.has(actor);
  const counterpartExternal = externalActors.has(counterpart);
  if (actorExternal !== counterpartExternal) return actorExternal ? 'right' : 'left';

  // Stable shot/reverse-shot lanes for the core trio.
  if ((actor === 'miku' && counterpart === 'onoe') || (actor === 'miku' && counterpart === 'ayuki')) return 'left';
  if ((counterpart === 'miku' && (actor === 'onoe' || actor === 'ayuki'))) return 'right';
  if (actor === 'onoe' && counterpart === 'ayuki') return 'left';
  if (actor === 'ayuki' && counterpart === 'onoe') return 'right';

  // Two external characters are rare in the vertical slice. Keep the active
  // speaker on the right so the layout remains deterministic.
  return 'right';
}

export function resolveVnStaging(story: readonly VnStorySpeakerLine[], lineIndex: number): VnStaging | null {
  const line = story[lineIndex];
  if (!line) return null;
  const actor = actorForStorySpeaker(line.speaker);
  if (!actor) return null;

  // Thoughts are intentionally composed as a close internal shot rather than
  // a dialogue reverse-shot.
  if (line.speaker.includes('МЫСЛИ')) return { actor, counterpart: null, side: 'center' };

  const counterpart = nearestCounterpart(story, lineIndex, actor);
  return { actor, counterpart, side: pairSide(actor, counterpart) };
}
