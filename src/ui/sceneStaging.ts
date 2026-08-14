import {
  sceneStagingManifest,
  type SceneStagingActorRole,
  type SceneStagingActorSlot,
  type SceneStagingNativeSlot,
  type SceneStagingGuestSlot,
  type SceneStagingPreset,
  type SceneStagingPresetId,
} from '../data/sceneStaging';
import {
  characterStaging,
  type CharacterKey,
  type CharacterStaging,
  type RuntimeExpression,
} from '../data/characterRigs';
import { characterProductionManifest, type CharacterVisualApproval } from '../data/characterProduction';
import { resolveVnPortraitCamera, resolveVnPortraitEyeLineCamera } from './vnPortraitGeometry';

export type SceneStagingActorInput = Readonly<{
  character: CharacterKey;
  expression: RuntimeExpression;
  pose?: 'pose-a' | 'pose-b';
}>;

export type ResolvedSceneActor = Readonly<{
  slotId: string;
  role: SceneStagingActorRole;
  character: CharacterKey;
  expression: RuntimeExpression;
  pose: 'pose-a' | 'pose-b';
  anchorXPercent: number;
  anchorYPercent: number;
  verticalAnchor: SceneStagingActorSlot['verticalAnchor'];
  shotScale: number;
  canonicalCharacterScale: number;
  canonicalCharacterYPercent: number;
  effectiveScale: number;
  portraitHeightPercent: number;
  portraitTopPercent: number;
  portraitBottomPercent: number;
  neutralEyeLineYPx: number;
  eyeLineRatio: number;
  resolvedEyeLinePercent?: number;
  headTopPercent: number;
  visualApproval: CharacterVisualApproval;
  safeBox: SceneStagingActorSlot['safeBox'];
  zIndex: number;
}>;

export type ResolvedSceneStaging = Readonly<{
  preset: SceneStagingPreset;
  actors: readonly ResolvedSceneActor[];
  guestSlots: readonly SceneStagingGuestSlot[];
  nativeSlots: readonly SceneStagingNativeSlot[];
}>;

export function resolveSceneStagingPreset(
  presetId: SceneStagingPresetId,
  actors: readonly SceneStagingActorInput[],
  canonicalStaging: Readonly<Record<CharacterKey, CharacterStaging>> = characterStaging,
): ResolvedSceneStaging {
  const preset = sceneStagingManifest.presets[presetId];
  const actorSlots = preset.slots.filter((slot): slot is SceneStagingActorSlot => slot.kind === 'actor');
  if (actors.length !== actorSlots.length) {
    throw new Error(`${presetId} requires ${actorSlots.length} actor assignments, got ${actors.length}`);
  }

  return {
    preset,
    actors: actorSlots.map((slot, index) => {
      const input = actors[index];
      const staging = canonicalStaging[input.character];
      const definition = characterProductionManifest.characters[input.character];
      const eyeLineYPx = definition.proportion.neutralEyeLineYPx;
      const camera = slot.verticalAnchor === 'background-focal-eye-line'
        ? resolveVnPortraitEyeLineCamera(slot.shotScale, eyeLineYPx)
        : resolveVnPortraitCamera(slot.shotScale);
      const headTopPercent = camera.topPercent + camera.heightPercent * definition.proportion.neutralAlphaBounds.top /
        characterProductionManifest.frameCanvas.height;
      return {
        slotId: slot.id,
        role: slot.role,
        character: input.character,
        expression: input.expression,
        pose: input.pose ?? 'pose-a',
        anchorXPercent: slot.anchorXPercent,
        anchorYPercent: slot.anchorYPercent,
        verticalAnchor: slot.verticalAnchor,
        shotScale: slot.shotScale,
        canonicalCharacterScale: staging.scale,
        canonicalCharacterYPercent: staging.yPercent,
        effectiveScale: staging.scale * slot.shotScale,
        portraitHeightPercent: camera.heightPercent,
        portraitTopPercent: camera.topPercent,
        portraitBottomPercent: camera.bottomPercent,
        neutralEyeLineYPx: eyeLineYPx,
        eyeLineRatio: eyeLineYPx / characterProductionManifest.frameCanvas.height,
        resolvedEyeLinePercent: camera.resolvedEyeLinePercent,
        headTopPercent,
        visualApproval: definition.visualApproval,
        safeBox: slot.safeBox,
        zIndex: slot.zIndex,
      };
    }),
    guestSlots: preset.slots.filter((slot): slot is SceneStagingGuestSlot => slot.kind === 'guest-shell'),
    nativeSlots: preset.slots.filter((slot): slot is SceneStagingNativeSlot => slot.kind === 'native-evidence' || slot.kind === 'testimony-card'),
  };
}
