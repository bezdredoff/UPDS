import { authoredVnShotForLine, type AuthoredVnShotDefinition } from '../data/authoredVnShots';
import { characterRigs, expressionAsset, poseAsset, type CharacterKey } from '../data/characterRigs';
import { resolveSceneStagingPreset, type ResolvedSceneActor, type ResolvedSceneStaging } from './sceneStaging';
import { escapeHtml } from './viewMarkup';

export type ResolvedAuthoredVnShot = Readonly<{
  shot: AuthoredVnShotDefinition;
  staging: ResolvedSceneStaging;
}>;

export function resolveAuthoredVnShot(lineId: string): ResolvedAuthoredVnShot | null {
  const shot = authoredVnShotForLine(lineId);
  if (!shot) return null;
  return { shot, staging: resolveSceneStagingPreset(shot.presetId, shot.actors) };
}

const actorAsset = (actor: ResolvedSceneActor): string => actor.pose === 'pose-b'
  ? poseAsset(actor.character)
  : expressionAsset(actor.character, actor.expression);

export const authoredVnShotAssets = (resolved: ResolvedAuthoredVnShot): readonly string[] =>
  resolved.staging.actors.map(actorAsset);

const actorMarkup = (actor: ResolvedSceneActor, speakingCharacter: CharacterKey | null): string => {
  const rig = characterRigs[actor.character];
  const asset = actorAsset(actor);
  const style = [
    `--scene-x:${actor.anchorXPercent}%`,
    `--scene-z:${actor.zIndex}`,
    `--portrait-height:${actor.portraitHeightPercent}%`,
    `--portrait-top:${actor.portraitTopPercent}%`,
    `--portrait-bottom:${actor.portraitBottomPercent}%`,
    `--character-scale:${actor.canonicalCharacterScale}`,
    `--character-y:${actor.canonicalCharacterYPercent}%`,
  ].join(';');
  const portraitStyle = `--character-scale:${actor.canonicalCharacterScale};--character-y:${actor.canonicalCharacterYPercent}%`;
  const imageClass = actor.pose === 'pose-b' ? 'portrait-static' : 'portrait-frame';
  const wrapClass = actor.pose === 'pose-b' ? 'portrait-static-wrap' : 'character-rig';
  return `<div class="vn-authored-actor-slot" data-slot="${escapeHtml(actor.slotId)}" data-character="${actor.character}" data-role="${actor.role}" data-speaking="${actor.character === speakingCharacter}" data-visual-approval="${actor.visualApproval}" style="${style}">
    <div class="portrait ${wrapClass} vn-authored-runtime-portrait" data-shot-scale="${actor.shotScale}" data-vertical-anchor="${actor.verticalAnchor}" data-eye-line-y="${actor.eyeLineYPx}" style="${portraitStyle}">
      <img class="${imageClass}" src="${escapeHtml(asset)}" alt="${escapeHtml(rig.displayName)}">
    </div>
  </div>`;
};

export function vnAuthoredShotMarkup(
  resolved: ResolvedAuthoredVnShot,
  speakingCharacter: CharacterKey | null,
): string {
  return `<div class="vn-authored-shot" data-authored-shot="${escapeHtml(resolved.shot.lineId)}" data-scene-preset="${resolved.staging.preset.id}">
    ${resolved.staging.actors.map((actor) => actorMarkup(actor, speakingCharacter)).join('')}
  </div>`;
}
