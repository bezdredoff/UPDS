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
import {
  characterProductionManifest,
  type CharacterAlphaBounds,
  type CharacterPortraitFrameGeometry,
  type CharacterVisualApproval,
} from '../data/characterProduction';
import { browserLocalCharacterStaging, browserLocalPoseOverride, runtimeFrameOverride } from '../data/characterRuntimeOverrides';
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
  frameAlphaBounds: CharacterAlphaBounds;
  eyeLineYPx: number;
  eyeLineRatio: number;
  resolvedEyeLinePercent: number;
  headTopPercent: number;
  guideGeometrySource: 'expression-frame' | 'neutral-pose-b-fallback';
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

export function overrideResolvedActorFrameGeometry(
  actor: ResolvedSceneActor,
  geometry: CharacterPortraitFrameGeometry,
): ResolvedSceneActor {
  const camera = actor.verticalAnchor === 'background-focal-eye-line'
    ? resolveVnPortraitEyeLineCamera(actor.shotScale, geometry.eyeLineYPx)
    : resolveVnPortraitCamera(actor.shotScale);
  const resolvedEyeLinePercent = camera.resolvedEyeLinePercent ??
    camera.topPercent + camera.heightPercent * geometry.eyeLineYPx / characterProductionManifest.frameCanvas.height;
  const headTopPercent = camera.topPercent + camera.heightPercent * geometry.alphaBounds.top /
    characterProductionManifest.frameCanvas.height;
  return {
    ...actor,
    portraitHeightPercent: camera.heightPercent,
    portraitTopPercent: camera.topPercent,
    portraitBottomPercent: camera.bottomPercent,
    frameAlphaBounds: geometry.alphaBounds,
    eyeLineYPx: geometry.eyeLineYPx,
    eyeLineRatio: geometry.eyeLineYPx / characterProductionManifest.frameCanvas.height,
    resolvedEyeLinePercent,
    headTopPercent,
    guideGeometrySource: 'expression-frame',
  };
}

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
      const staging = browserLocalCharacterStaging(input.character, canonicalStaging[input.character]);
      const definition = characterProductionManifest.characters[input.character];
      const pose = input.pose ?? 'pose-a';
      const runtimeOverride = pose === 'pose-a' ? runtimeFrameOverride(input.character, input.expression) : null;
      const poseOverride = pose === 'pose-b' ? browserLocalPoseOverride(input.character) : null;
      const geometry = runtimeOverride?.geometry ?? poseOverride?.geometry ?? (pose === 'pose-a'
        ? definition.proportion.frameGeometry[input.expression]
        : definition.proportion.frameGeometry.neutral);
      const eyeLineYPx = geometry.eyeLineYPx;
      const camera = slot.verticalAnchor === 'background-focal-eye-line'
        ? resolveVnPortraitEyeLineCamera(slot.shotScale, eyeLineYPx)
        : resolveVnPortraitCamera(slot.shotScale);
      const resolvedEyeLinePercent = camera.resolvedEyeLinePercent ??
        camera.topPercent + camera.heightPercent * eyeLineYPx / characterProductionManifest.frameCanvas.height;
      const headTopPercent = camera.topPercent + camera.heightPercent * geometry.alphaBounds.top /
        characterProductionManifest.frameCanvas.height;
      return {
        slotId: slot.id,
        role: slot.role,
        character: input.character,
        expression: input.expression,
        pose,
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
        frameAlphaBounds: geometry.alphaBounds,
        eyeLineYPx,
        eyeLineRatio: eyeLineYPx / characterProductionManifest.frameCanvas.height,
        resolvedEyeLinePercent,
        headTopPercent,
        guideGeometrySource: pose === 'pose-a' ? 'expression-frame' : 'neutral-pose-b-fallback',
        visualApproval: runtimeOverride?.visualApproval ?? definition.visualApproval,
        safeBox: slot.safeBox,
        zIndex: slot.zIndex,
      };
    }),
    guestSlots: preset.slots.filter((slot): slot is SceneStagingGuestSlot => slot.kind === 'guest-shell'),
    nativeSlots: preset.slots.filter((slot): slot is SceneStagingNativeSlot => slot.kind === 'native-evidence' || slot.kind === 'testimony-card'),
  };
}
