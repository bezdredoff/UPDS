import { getScene, sceneMeta, backgroundAssets, isDirection } from '../../src/data/narrative';
import { characterForSpeaker, expressionForDirection, expressionAsset, poseAsset, characterStaging, resolvedCharacterXPercent } from '../../src/data/characterRigs';
import { authoredVnShotForLine } from '../../src/data/authoredVnShots';
import { characterProductionManifest } from '../../src/data/characterProduction';
import { SCENE_STAGING_SHARED_ACTOR_SCALE } from '../../src/data/sceneStaging';
import { resolveSceneStagingPreset } from '../../src/ui/sceneStaging';
import { resolveVnStaging } from '../../src/ui/vnStaging';
import { resolveVnPortraitEyeLineCamera } from '../../src/ui/vnPortraitGeometry';
import { ruCatalog } from '../../src/localization/catalogs/ru';
import { enCatalog } from '../../src/localization/catalogs/en';
import { beCatalog } from '../../src/localization/catalogs/be';
import { getMusicTheme } from '../../src/audio/MusicTheme';
import { getCueDefinition } from '../../src/audio/AudioCues';
import type { MessageCatalog } from '../../src/localization/MessageCatalog';

export function godotPrologue() {
  const lines = getScene(0);
  const catalogs: Record<string, MessageCatalog> = { ru: ruCatalog, en: enCatalog, be: beCatalog };
  const actorsFor = (line: typeof lines[number], index: number) => {
    const shot = authoredVnShotForLine(line.id);
    if (shot) return resolveSceneStagingPreset(shot.presetId, shot.actors).actors.map((actor) => ({
      character: actor.character, asset: actor.pose === 'pose-b' ? poseAsset(actor.character) : expressionAsset(actor.character, actor.expression),
      x: actor.anchorXPercent, top: actor.portraitTopPercent, height: actor.portraitHeightPercent,
      scale: actor.canonicalCharacterScale, y: actor.canonicalCharacterYPercent, z: actor.zIndex,
    }));
    const character = characterForSpeaker(line.speaker);
    if (!character || isDirection(line)) return [];
    const expression = expressionForDirection(line.emotion);
    const geometry = characterProductionManifest.characters[character].proportion.frameGeometry[expression];
    const camera = resolveVnPortraitEyeLineCamera(SCENE_STAGING_SHARED_ACTOR_SCALE, geometry.eyeLineYPx);
    const side = resolveVnStaging(lines, index)?.side;
    return [{ character, asset: expressionAsset(character, expression),
      x: (side === 'left' ? 29 : side === 'right' ? 71 : 50) + resolvedCharacterXPercent(character),
      top: camera.topPercent, height: camera.heightPercent, scale: characterStaging[character].scale,
      y: characterStaging[character].yPercent, z: 0 }];
  };
  return {
    sceneId: sceneMeta[0].id, sceneIndex: 0, nextSceneId: sceneMeta[1].id,
    background: backgroundAssets.clubroom,
    titles: Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, catalog[`vn.scene.${sceneMeta[0].id}.title`]])),
    lines: lines.map((line, index) => ({ id: line.id, hidden: isDirection(line), actors: actorsFor(line, index),
      localized: Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, {
        speaker: catalog[`vn.line.${line.id}.speaker`] ?? line.speaker,
        emotion: catalog[`vn.line.${line.id}.emotion`] ?? line.emotion,
        text: catalog[`vn.line.${line.id}.text`] ?? line.text,
      }])),
    })),
  };
}

export const godotVnAudio = () => ({ vn: getMusicTheme('vn'), vnAdvance: getCueDefinition('vnAdvance') });
