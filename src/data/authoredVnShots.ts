import type { BackgroundKey } from './narrative';
import type { CharacterKey, RuntimeExpression } from './characterRigs';
import { sceneStagingManifest, sceneStagingPresetIds, type SceneStagingPresetId } from './sceneStaging';

export const AUTHORED_VN_SHOTS_FORMAT = 'upds-authored-vn-shots-v1' as const;

export type AuthoredVnShotActor = Readonly<{
  character: CharacterKey;
  expression: RuntimeExpression;
  pose?: 'pose-a' | 'pose-b';
}>;

export type AuthoredVnShotDefinition = Readonly<{
  lineId: string;
  background: BackgroundKey;
  presetId: SceneStagingPresetId;
  actors: readonly AuthoredVnShotActor[];
  note: string;
}>;

export type AuthoredVnShotManifest = Readonly<{
  format: typeof AUTHORED_VN_SHOTS_FORMAT;
  sourceStory: 'ANM-003';
  adoption: 'bounded-runtime';
  shots: readonly AuthoredVnShotDefinition[];
}>;

/**
 * ANM-028B2 starts with a deliberately bounded set of already-authored lines.
 * These are Golden Sample runtime shots, not a request to restage every line at once.
 * Unlisted lines continue to use the stable legacy speaker-side resolver.
 */
export const authoredVnShotManifest: AuthoredVnShotManifest = {
  format: AUTHORED_VN_SHOTS_FORMAT,
  sourceStory: 'ANM-003',
  adoption: 'bounded-runtime',
  shots: [
    {
      lineId: 'VN0008',
      background: 'clubroom',
      presetId: 'trio-central-speaker',
      actors: [
        { character: 'miku', expression: 'neutral' },
        { character: 'onoe', expression: 'serious' },
        { character: 'ayuki', expression: 'smile' },
      ],
      note: 'Miku joins the club; central speaker with the established duo supporting.',
    },
    {
      lineId: 'VN0013',
      background: 'clubroom',
      presetId: 'trio-reaction',
      actors: [
        { character: 'miku', expression: 'surprised' },
        { character: 'onoe', expression: 'neutral' },
        { character: 'ayuki', expression: 'smile' },
      ],
      note: 'Miku reacts to the instant unanimous vote.',
    },
    {
      lineId: 'VN0026',
      background: 'clubroom',
      presetId: 'two-shot-conflict',
      actors: [
        { character: 'onoe', expression: 'serious' },
        { character: 'emi', expression: 'embarrassed' },
      ],
      note: 'First sensitive disclosure: procedural interviewer versus embarrassed witness.',
    },
    {
      lineId: 'VN0034',
      background: 'clubroom',
      presetId: 'two-shot-alliance',
      actors: [
        { character: 'miku', expression: 'neutral' },
        { character: 'emi', expression: 'embarrassed' },
      ],
      note: 'Miku switches the interview from procedure to empathy.',
    },
    {
      lineId: 'VN0038',
      background: 'clubroom',
      presetId: 'two-shot-alliance',
      actors: [
        { character: 'ayuki', expression: 'neutral', pose: 'pose-b' },
        { character: 'emi', expression: 'embarrassed' },
      ],
      note: 'Pose B proof: Ayuki proposes the anonymous warning while Emi listens.',
    },
  ],
};

export const authoredVnShotLineIds = authoredVnShotManifest.shots.map((shot) => shot.lineId) as readonly string[];

export const authoredVnShotForLine = (lineId: string): AuthoredVnShotDefinition | null =>
  authoredVnShotManifest.shots.find((shot) => shot.lineId === lineId) ?? null;

export function validateAuthoredVnShotManifest(
  manifest: AuthoredVnShotManifest = authoredVnShotManifest,
): readonly string[] {
  const issues: string[] = [];
  if (manifest.format !== AUTHORED_VN_SHOTS_FORMAT) issues.push(`format must be ${AUTHORED_VN_SHOTS_FORMAT}`);
  if (manifest.adoption !== 'bounded-runtime') issues.push('adoption must remain bounded-runtime until visual QA expands coverage');

  const seen = new Set<string>();
  for (const shot of manifest.shots) {
    if (seen.has(shot.lineId)) issues.push(`${shot.lineId}: duplicate authored shot`);
    seen.add(shot.lineId);
    if (!/^VN\d{4}[A-Z]?$/.test(shot.lineId)) issues.push(`${shot.lineId}: invalid stable VN line id`);
    if (!sceneStagingPresetIds.includes(shot.presetId)) issues.push(`${shot.lineId}: unknown preset ${shot.presetId}`);

    const preset = sceneStagingManifest.presets[shot.presetId];
    const actorSlots = preset.slots.filter((slot) => slot.kind === 'actor');
    const nonActorSlots = preset.slots.filter((slot) => slot.kind !== 'actor');
    if (nonActorSlots.length > 0) issues.push(`${shot.lineId}: B2 authored runtime shots may use actor-only presets; guest/native slots belong to B3`);
    if (actorSlots.length !== shot.actors.length) issues.push(`${shot.lineId}: ${shot.presetId} requires ${actorSlots.length} actors, got ${shot.actors.length}`);
    if (new Set(shot.actors.map((actor) => actor.character)).size !== shot.actors.length) issues.push(`${shot.lineId}: duplicate character assignment`);
  }
  return issues;
}
