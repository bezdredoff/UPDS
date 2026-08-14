export const SCENE_STAGING_FORMAT = 'upds-scene-staging-v1' as const;

export const sceneStagingPresetIds = [
  'solo-close',
  'solo-medium',
  'two-shot-conflict',
  'two-shot-alliance',
  'trio-central-speaker',
  'trio-reaction',
  'evidence-cutaway',
  'guest-testimony-card',
] as const;

export type SceneStagingPresetId = typeof sceneStagingPresetIds[number];
export type SceneStagingActorRole = 'primary' | 'secondary' | 'tertiary';
export type SceneStagingSlotKind = 'actor' | 'native-evidence' | 'guest-shell' | 'testimony-card';

export type SceneStagingSafeBox = Readonly<{
  leftPercent: number;
  topPercent: number;
  rightPercent: number;
  bottomPercent: number;
}>;

type SceneStagingSlotBase = Readonly<{
  id: string;
  kind: SceneStagingSlotKind;
  anchorXPercent: number;
  anchorYPercent: number;
  safeBox: SceneStagingSafeBox;
  zIndex: number;
}>;

export type SceneStagingActorSlot = SceneStagingSlotBase & Readonly<{
  kind: 'actor';
  role: SceneStagingActorRole;
  emphasis: 'focus' | 'equal' | 'support';
  verticalAnchor: 'runtime-top' | 'background-focal-eye-line';
  shotScale: number;
}>;

export type SceneStagingGuestSlot = SceneStagingSlotBase & Readonly<{
  kind: 'guest-shell';
  shotScale: number;
}>;

export type SceneStagingNativeSlot = SceneStagingSlotBase & Readonly<{
  kind: 'native-evidence' | 'testimony-card';
}>;

export type SceneStagingSlot = SceneStagingActorSlot | SceneStagingGuestSlot | SceneStagingNativeSlot;

export type SceneStagingBudget = Readonly<{
  actorSlots: number;
  guestShells: number;
  nativeUiSlots: number;
  newRuntimeArtAssets: 0;
  newBackgroundMasters: 0;
  heroClueCloseups: 0;
}>;

export type SceneStagingPreset = Readonly<{
  id: SceneStagingPresetId;
  slots: readonly SceneStagingSlot[];
  budget: SceneStagingBudget;
}>;

export type SceneStagingManifest = Readonly<{
  format: typeof SCENE_STAGING_FORMAT;
  coordinateSpace: 'normalized-percent';
  characterScaleSource: 'upds-character-production-v2';
  actorSafeBoxSemantics: 'face-critical-lane';
  safeFrame: SceneStagingSafeBox;
  presets: Readonly<Record<SceneStagingPresetId, SceneStagingPreset>>;
}>;

const box = (
  leftPercent: number,
  topPercent: number,
  rightPercent: number,
  bottomPercent: number,
): SceneStagingSafeBox => ({ leftPercent, topPercent, rightPercent, bottomPercent });

const actor = (
  id: string,
  role: SceneStagingActorRole,
  anchorXPercent: number,
  shotScale: number,
  safeBox: SceneStagingSafeBox,
  emphasis: SceneStagingActorSlot['emphasis'],
  zIndex: number,
  verticalAnchor: SceneStagingActorSlot['verticalAnchor'] = 'runtime-top',
): SceneStagingActorSlot => ({
  id,
  kind: 'actor',
  role,
  emphasis,
  verticalAnchor,
  anchorXPercent,
  anchorYPercent: 28,
  shotScale,
  safeBox,
  zIndex,
});

const zeroArtBudget = (
  actorSlots: number,
  guestShells = 0,
  nativeUiSlots = 0,
): SceneStagingBudget => ({
  actorSlots,
  guestShells,
  nativeUiSlots,
  newRuntimeArtAssets: 0,
  newBackgroundMasters: 0,
  heroClueCloseups: 0,
});

export const sceneStagingManifest: SceneStagingManifest = {
  format: SCENE_STAGING_FORMAT,
  coordinateSpace: 'normalized-percent',
  characterScaleSource: 'upds-character-production-v2',
  actorSafeBoxSemantics: 'face-critical-lane',
  safeFrame: box(4, 4, 96, 96),
  presets: {
    'solo-close': {
      id: 'solo-close',
      slots: [actor('primary', 'primary', 50, 1, box(31, 6, 69, 45), 'focus', 3)],
      budget: zeroArtBudget(1),
    },
    'solo-medium': {
      id: 'solo-medium',
      slots: [actor('primary', 'primary', 50, 0.9, box(33, 8, 67, 48), 'focus', 3)],
      budget: zeroArtBudget(1),
    },
    'two-shot-conflict': {
      id: 'two-shot-conflict',
      slots: [
        actor('primary', 'primary', 25, 0.84, box(8, 8, 42, 48), 'equal', 3),
        actor('secondary', 'secondary', 75, 0.84, box(58, 8, 92, 48), 'equal', 3),
      ],
      budget: zeroArtBudget(2),
    },
    'two-shot-alliance': {
      id: 'two-shot-alliance',
      slots: [
        actor('primary', 'primary', 31, 0.8, box(14, 10, 46, 50), 'equal', 3),
        actor('secondary', 'secondary', 69, 0.8, box(54, 10, 86, 50), 'equal', 3),
      ],
      budget: zeroArtBudget(2),
    },
    'trio-central-speaker': {
      id: 'trio-central-speaker',
      slots: [
        actor('primary', 'primary', 50, 0.78, box(38, 7, 62, 45), 'focus', 4, 'background-focal-eye-line'),
        actor('secondary', 'secondary', 18, 0.72, box(5, 12, 31, 52), 'support', 2, 'background-focal-eye-line'),
        actor('tertiary', 'tertiary', 82, 0.72, box(69, 12, 95, 52), 'support', 2, 'background-focal-eye-line'),
      ],
      budget: zeroArtBudget(3),
    },
    'trio-reaction': {
      id: 'trio-reaction',
      slots: [
        actor('primary', 'primary', 19, 0.76, box(5, 8, 33, 48), 'focus', 4, 'background-focal-eye-line'),
        actor('secondary', 'secondary', 51, 0.72, box(38, 12, 64, 52), 'support', 3, 'background-focal-eye-line'),
        actor('tertiary', 'tertiary', 82, 0.7, box(69, 15, 95, 55), 'support', 2, 'background-focal-eye-line'),
      ],
      budget: zeroArtBudget(3),
    },
    'evidence-cutaway': {
      id: 'evidence-cutaway',
      slots: [{
        id: 'evidence',
        kind: 'native-evidence',
        anchorXPercent: 50,
        anchorYPercent: 49,
        safeBox: box(10, 14, 90, 84),
        zIndex: 3,
      }],
      budget: zeroArtBudget(0, 0, 1),
    },
    'guest-testimony-card': {
      id: 'guest-testimony-card',
      slots: [
        {
          id: 'guest',
          kind: 'guest-shell',
          anchorXPercent: 25,
          anchorYPercent: 96,
          shotScale: 0.62,
          safeBox: box(5, 24, 45, 96),
          zIndex: 3,
        },
        {
          id: 'testimony',
          kind: 'testimony-card',
          anchorXPercent: 73,
          anchorYPercent: 49,
          safeBox: box(51, 16, 95, 82),
          zIndex: 4,
        },
      ],
      budget: zeroArtBudget(0, 1, 1),
    },
  },
};

export type SceneStagingIssue = Readonly<{
  code: 'format' | 'preset-set' | 'slot-set' | 'coordinate' | 'safe-area' | 'overlap' | 'shot-scale' | 'camera-anchor' | 'budget' | 'guest-boundary';
  preset?: SceneStagingPresetId;
  slot?: string;
  detail: string;
}>;

const expectedSlotKinds: Readonly<Record<SceneStagingPresetId, readonly SceneStagingSlotKind[]>> = {
  'solo-close': ['actor'],
  'solo-medium': ['actor'],
  'two-shot-conflict': ['actor', 'actor'],
  'two-shot-alliance': ['actor', 'actor'],
  'trio-central-speaker': ['actor', 'actor', 'actor'],
  'trio-reaction': ['actor', 'actor', 'actor'],
  'evidence-cutaway': ['native-evidence'],
  'guest-testimony-card': ['guest-shell', 'testimony-card'],
};

const finite = (value: number): boolean => Number.isFinite(value);

function boxesOverlap(a: SceneStagingSafeBox, b: SceneStagingSafeBox): boolean {
  const horizontal = Math.min(a.rightPercent, b.rightPercent) - Math.max(a.leftPercent, b.leftPercent);
  const vertical = Math.min(a.bottomPercent, b.bottomPercent) - Math.max(a.topPercent, b.topPercent);
  return horizontal > 0 && vertical > 0;
}

export function validateSceneStagingManifest(
  manifest: SceneStagingManifest = sceneStagingManifest,
): readonly SceneStagingIssue[] {
  const issues: SceneStagingIssue[] = [];
  if (manifest.format !== SCENE_STAGING_FORMAT) {
    issues.push({ code: 'format', detail: `expected ${SCENE_STAGING_FORMAT}, got ${manifest.format}` });
  }
  if (manifest.actorSafeBoxSemantics !== 'face-critical-lane') {
    issues.push({ code: 'safe-area', detail: 'actor safe boxes must describe non-overlapping face-critical lanes, not full-body PNG bounds' });
  }

  const actualIds = Object.keys(manifest.presets);
  if (actualIds.join('|') !== sceneStagingPresetIds.join('|')) {
    issues.push({ code: 'preset-set', detail: 'preset set/order differs from the eight-preset production contract' });
  }

  for (const id of sceneStagingPresetIds) {
    const preset = manifest.presets[id];
    if (!preset || preset.id !== id) {
      issues.push({ code: 'preset-set', preset: id, detail: `${id} is missing or has a mismatched id` });
      continue;
    }

    const kinds = preset.slots.map((slot) => slot.kind);
    if (kinds.join('|') !== expectedSlotKinds[id].join('|')) {
      issues.push({ code: 'slot-set', preset: id, detail: `${id} slot kinds differ from the canonical composition` });
    }
    if (new Set(preset.slots.map((slot) => slot.id)).size !== preset.slots.length) {
      issues.push({ code: 'slot-set', preset: id, detail: `${id} contains duplicate slot ids` });
    }

    preset.slots.forEach((slot, index) => {
      const values = [slot.anchorXPercent, slot.anchorYPercent, slot.safeBox.leftPercent, slot.safeBox.topPercent,
        slot.safeBox.rightPercent, slot.safeBox.bottomPercent, slot.zIndex];
      if (!values.every(finite)) {
        issues.push({ code: 'coordinate', preset: id, slot: slot.id, detail: `${slot.id} coordinates must be finite` });
        return;
      }
      const safe = manifest.safeFrame;
      const boxValid = slot.safeBox.leftPercent >= safe.leftPercent && slot.safeBox.topPercent >= safe.topPercent &&
        slot.safeBox.rightPercent <= safe.rightPercent && slot.safeBox.bottomPercent <= safe.bottomPercent &&
        slot.safeBox.rightPercent > slot.safeBox.leftPercent && slot.safeBox.bottomPercent > slot.safeBox.topPercent;
      const anchorInside = slot.anchorXPercent >= slot.safeBox.leftPercent && slot.anchorXPercent <= slot.safeBox.rightPercent &&
        slot.anchorYPercent >= slot.safeBox.topPercent && slot.anchorYPercent <= slot.safeBox.bottomPercent;
      if (!boxValid || !anchorInside) {
        issues.push({ code: 'safe-area', preset: id, slot: slot.id, detail: `${slot.id} anchor/safe box leaves the normalized safe frame` });
      }
      if (!Number.isInteger(slot.zIndex) || slot.zIndex < 1) {
        issues.push({ code: 'coordinate', preset: id, slot: slot.id, detail: `${slot.id} zIndex must be a positive integer` });
      }
      const minimumShotScale = slot.kind === 'actor' ? 0.68 : 0.3;
      if ('shotScale' in slot && (!finite(slot.shotScale) || slot.shotScale < minimumShotScale || slot.shotScale > 1.2)) {
        issues.push({ code: 'shot-scale', preset: id, slot: slot.id, detail: `${slot.id} shot scale must remain between ${minimumShotScale} and 1.2` });
      }
      if (slot.kind === 'actor') {
        const expectedAnchor = id.startsWith('trio-') ? 'background-focal-eye-line' : 'runtime-top';
        if (slot.verticalAnchor !== expectedAnchor) {
          issues.push({ code: 'camera-anchor', preset: id, slot: slot.id, detail: `${slot.id} must use ${expectedAnchor}` });
        }
      }

      for (let otherIndex = index + 1; otherIndex < preset.slots.length; otherIndex += 1) {
        const other = preset.slots[otherIndex];
        if (boxesOverlap(slot.safeBox, other.safeBox)) {
          issues.push({ code: 'overlap', preset: id, slot: slot.id, detail: `${slot.id} safe box overlaps ${other.id}` });
        }
      }
    });

    const actorSlots = preset.slots.filter((slot) => slot.kind === 'actor').length;
    const guestShells = preset.slots.filter((slot) => slot.kind === 'guest-shell').length;
    const nativeUiSlots = preset.slots.filter((slot) => slot.kind === 'native-evidence' || slot.kind === 'testimony-card').length;
    if (preset.budget.actorSlots !== actorSlots || preset.budget.guestShells !== guestShells ||
        preset.budget.nativeUiSlots !== nativeUiSlots || preset.budget.newRuntimeArtAssets !== 0 ||
        preset.budget.newBackgroundMasters !== 0 || preset.budget.heroClueCloseups !== 0) {
      issues.push({ code: 'budget', preset: id, detail: `${id} budget does not match its zero-new-art slot composition` });
    }
  }

  const guestPreset = manifest.presets['guest-testimony-card'];
  if (guestPreset?.slots.some((slot) => slot.kind === 'actor')) {
    issues.push({ code: 'guest-boundary', preset: 'guest-testimony-card', detail: 'guest preview must remain a shell until ANM-028B3 defines its renderer' });
  }
  return issues;
}
