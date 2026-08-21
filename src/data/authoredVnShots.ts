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
  sourceStory: 'ANM-003+ANM-027G';
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
  sourceStory: 'ANM-003+ANM-027G',
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
    {
      lineId: 'VN0254', background: 'studentCouncilAuditorium', presetId: 'trio-central-speaker',
      actors: [{ character: 'miku', expression: 'serious' }, { character: 'onoe', expression: 'neutral' }, { character: 'ayuki', expression: 'smile' }],
      note: 'Episode 4 Golden Sample: Miku takes control of the emergency meeting while the core trio remains readable.',
    },
    {
      lineId: 'VN0273', background: 'studentCouncilAuditorium', presetId: 'trio-reaction',
      actors: [{ character: 'ayuki', expression: 'surprised' }, { character: 'miku', expression: 'neutral' }, { character: 'onoe', expression: 'serious' }],
      note: 'Episode 4 reaction shot after the laundry cadence becomes visible.',
    },
    {
      lineId: 'VN0341', background: 'textileWorkshop', presetId: 'trio-central-speaker',
      actors: [{ character: 'miku', expression: 'neutral' }, { character: 'onoe', expression: 'serious' }, { character: 'ayuki', expression: 'smile' }],
      note: 'Episode 6 core-trio workshop shot; Hinata remains on the separate B3 guest path on her own lines.',
    },
    {
      lineId: 'VN0389', background: 'asterionLab', presetId: 'two-shot-alliance',
      actors: [{ character: 'onoe', expression: 'serious' }, { character: 'miku', expression: 'neutral' }],
      note: 'Episode 7 technical comparison: Onoe leads; Kurose uses his production rig on his own lines.',
    },
    {
      lineId: 'VN0427', background: 'lostFoundWarehouse', presetId: 'trio-central-speaker',
      actors: [{ character: 'onoe', expression: 'serious' }, { character: 'miku', expression: 'neutral' }, { character: 'ayuki', expression: 'neutral' }],
      note: 'Episode 8 core-trio analysis beat; Rina uses her production rig on her own lines.',
    },
    {
      lineId: 'VN0482', background: 'maintenanceRoom', presetId: 'two-shot-conflict',
      actors: [{ character: 'onoe', expression: 'serious' }, { character: 'miku', expression: 'neutral' }],
      note: 'Episode 9 report decision aftermath; Gen remains on the dedicated B3 guest-testimony-card path.',
    },

    {
      lineId: 'VN0505', background: 'combatClubHall', presetId: 'trio-central-speaker',
      actors: [{ character: 'miku', expression: 'serious' }, { character: 'onoe', expression: 'neutral' }, { character: 'ayuki', expression: 'neutral' }],
      note: 'Episode 10 control-sample task framing; Aoi remains on the B3 guest path and Kentaro uses his production rig on his own lines.',
    },
    {
      lineId: 'VN0535', background: 'serviceYard', presetId: 'trio-reaction',
      actors: [{ character: 'miku', expression: 'neutral' }, { character: 'onoe', expression: 'serious' }, { character: 'ayuki', expression: 'smile' }],
      note: 'Episode 11 conspicuous control-bag reaction before the team follows the container route.',
    },
    {
      lineId: 'VN0594', background: 'oldGymNight', presetId: 'trio-central-speaker',
      actors: [{ character: 'miku', expression: 'serious' }, { character: 'onoe', expression: 'serious' }, { character: 'ayuki', expression: 'surprised' }],
      note: 'Episode 12 technical reveal after the occult bait resolves into a Second Skin radio tag.',
    },
    {
      lineId: 'VN0625', background: 'combatClubHall', presetId: 'trio-central-speaker',
      actors: [{ character: 'miku', expression: 'serious' }, { character: 'onoe', expression: 'serious' }, { character: 'ayuki', expression: 'neutral' }],
      note: 'Episode 13 task framing while Kubo remains on the B3 guest testimony path.',
    },
    {
      lineId: 'VN0663', background: 'textileWorkshop', presetId: 'trio-central-speaker',
      actors: [{ character: 'onoe', expression: 'serious' }, { character: 'miku', expression: 'neutral' }, { character: 'ayuki', expression: 'embarrassed' }],
      note: 'Episode 14 ledger reconstruction; Kubo and his mother stay on B3 guest presentation.',
    },
    {
      lineId: 'VN0721', background: 'abandonedLaundry', presetId: 'trio-central-speaker',
      actors: [{ character: 'miku', expression: 'serious' }, { character: 'onoe', expression: 'serious' }, { character: 'ayuki', expression: 'neutral' }],
      note: 'Episode 15 core-trio restraint after Rina appears across the anonymous-lead timeline.',
    },
    {
      lineId: 'VN0753', background: 'gymnasticsCostume', presetId: 'trio-central-speaker',
      actors: [{ character: 'miku', expression: 'serious' }, { character: 'onoe', expression: 'serious' }, { character: 'ayuki', expression: 'neutral' }],
      note: 'Episode 16 core-trio technical conclusion while Vincent remains on the B3 guest testimony path.',
    },
    {
      lineId: 'VN0795', background: 'oldArchive', presetId: 'two-shot-conflict',
      actors: [{ character: 'miku', expression: 'serious' }, { character: 'onoe', expression: 'serious' }],
      note: 'Episode 17 evidence-restraint beat in the old archive while Rina remains on her recurring-stage path.',
    },
    {
      lineId: 'VN0833', background: 'clubroomNight', presetId: 'trio-central-speaker',
      actors: [{ character: 'miku', expression: 'serious' }, { character: 'onoe', expression: 'serious' }, { character: 'ayuki', expression: 'neutral' }],
      note: 'Episode 18 strategy pivot: the core trio separates the physical thief from the continuing Second Skin system.',
    },
    {
      lineId: 'VN0878', background: 'clubroom', presetId: 'two-shot-conflict',
      actors: [{ character: 'miku', expression: 'serious' }, { character: 'onoe', expression: 'serious' }],
      note: 'Ending B core conflict: the thefts are closed formally while Miku keeps the unresolved Second Skin distinction visible.',
    },
    {
      lineId: 'VN0913', background: 'disciplinaryAssembly', presetId: 'trio-central-speaker',
      actors: [{ character: 'miku', expression: 'serious' }, { character: 'onoe', expression: 'serious' }, { character: 'ayuki', expression: 'neutral' }],
      note: 'Ending A hearing: Miku separates Rina’s thefts from Kurose’s consent violations in front of the commission.',
    },
    {
      lineId: 'VN0957', background: 'clubroom', presetId: 'trio-reaction',
      actors: [{ character: 'miku', expression: 'serious' }, { character: 'onoe', expression: 'neutral' }, { character: 'ayuki', expression: 'embarrassed' }],
      note: 'Ending C aftermath: the larger clubroom cannot hide the cost of the consciously convenient accusation.',
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
