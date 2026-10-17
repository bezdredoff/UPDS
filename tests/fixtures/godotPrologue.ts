import { getScene, sceneMeta, backgroundAssets, getBackgroundForLine, isDirection } from '../../src/data/narrative';
import { levels, cluePresentation } from '../../src/data/levels';
import { characterForSpeaker, expressionForDirection, expressionAsset, poseAsset, characterStaging, resolvedCharacterXPercent } from '../../src/data/characterRigs';
import { authoredVnShotForLine } from '../../src/data/authoredVnShots';
import { characterProductionManifest } from '../../src/data/characterProduction';
import { SCENE_STAGING_SHARED_ACTOR_SCALE } from '../../src/data/sceneStaging';
import { resolveSceneStagingPreset } from '../../src/ui/sceneStaging';
import { resolveVnStaging } from '../../src/ui/vnStaging';
import { resolveVnPortraitEyeLineCamera, resolveVnPortraitCamera } from '../../src/ui/vnPortraitGeometry';
import { ruCatalog } from '../../src/localization/catalogs/ru';
import { enCatalog } from '../../src/localization/catalogs/en';
import { beCatalog } from '../../src/localization/catalogs/be';
import { getMusicTheme } from '../../src/audio/MusicTheme';
import { getCueDefinition } from '../../src/audio/AudioCues';
import { guestWitnessForSpeaker, guestWitnessAssetForDirection } from '../../src/data/guestWitnesses';
import type { MessageCatalog } from '../../src/localization/MessageCatalog';
import { storyGraph } from '../../src/data/storyGraph';
import { storyChoiceGateForLine } from '../../src/data/storyChoices';
import { storyChoiceGates } from '../../src/data/storyChoices';
import { fullTruthEvidenceClueIds, fullTruthRequirement, storyOutcomeMetrics } from '../../src/data/storyOutcome';

export function godotPrologue() {
  const lines = getScene(0);
  const catalogs: Record<string, MessageCatalog> = { ru: ruCatalog, en: enCatalog, be: beCatalog };
  const actorsFor = (line: typeof lines[number], index: number) => {
    const shot = authoredVnShotForLine(line.id);
    if (shot) return resolveSceneStagingPreset(shot.presetId, shot.actors).actors.map((actor) => ({
      character: actor.character, asset: actor.pose === 'pose-b' ? poseAsset(actor.character) : expressionAsset(actor.character, actor.expression),
      x: actor.anchorXPercent, top: actor.portraitTopPercent, height: actor.portraitHeightPercent, compactHeight: 168,
      scale: actor.canonicalCharacterScale, y: actor.canonicalCharacterYPercent, z: actor.zIndex + (actor.character === characterForSpeaker(line.speaker) ? 1 : 0),
    }));
    const character = characterForSpeaker(line.speaker);
    if (!character || isDirection(line)) return [];
    const expression = expressionForDirection(line.emotion);
    const geometry = characterProductionManifest.characters[character].proportion.frameGeometry[expression];
    const camera = resolveVnPortraitEyeLineCamera(SCENE_STAGING_SHARED_ACTOR_SCALE, geometry.eyeLineYPx);
    const side = resolveVnStaging(lines, index)?.side;
    return [{ character, asset: expressionAsset(character, expression),
      x: (side === 'left' ? 29 : side === 'right' ? 71 : 50) + resolvedCharacterXPercent(character),
      top: camera.topPercent, height: camera.heightPercent, compactHeight: 168, scale: characterStaging[character].scale,
      y: characterStaging[character].yPercent, z: 0 }];
  };
  return {
    sceneId: sceneMeta[0].id, sceneIndex: 0, nextSceneId: sceneMeta[1].id, nextSceneIndex: 1,
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

export const godotVnAudio = () => ({ vn: getMusicTheme('vn'), vnAdvance: getCueDefinition('vnAdvance'), choice: getCueDefinition('choice') });

export function godotLockerScene() {
  const catalogs: Record<string, MessageCatalog> = { ru: ruCatalog, en: enCatalog, be: beCatalog };
  const choices = ['A', 'B', 'C'] as const;
  const variants = Object.fromEntries(choices.map((choice) => {
    const lines = getScene(1, choice);
    return [choice, lines.map((line, index) => {
      const shot = authoredVnShotForLine(line.id);
      const actors = shot
        ? resolveSceneStagingPreset(shot.presetId, shot.actors).actors.map((actor) => ({
          character: actor.character, asset: actor.pose === 'pose-b' ? poseAsset(actor.character) : expressionAsset(actor.character, actor.expression),
          x: actor.anchorXPercent, top: actor.portraitTopPercent, height: actor.portraitHeightPercent, compactHeight: 168,
          scale: actor.canonicalCharacterScale, y: actor.canonicalCharacterYPercent, z: actor.zIndex + (actor.character === characterForSpeaker(line.speaker) ? 1 : 0),
        }))
        : (() => {
          const character = characterForSpeaker(line.speaker);
          if (!character || isDirection(line)) return [];
          const expression = expressionForDirection(line.emotion);
          const geometry = characterProductionManifest.characters[character].proportion.frameGeometry[expression];
          const camera = resolveVnPortraitEyeLineCamera(SCENE_STAGING_SHARED_ACTOR_SCALE, geometry.eyeLineYPx);
          const side = resolveVnStaging(lines, index)?.side;
          return [{ character, asset: expressionAsset(character, expression),
            x: (side === 'left' ? 29 : side === 'right' ? 71 : 50) + resolvedCharacterXPercent(character),
            top: camera.topPercent, height: camera.heightPercent, compactHeight: 168, scale: characterStaging[character].scale,
            y: characterStaging[character].yPercent, z: 0 }];
        })();
      const background = backgroundAssets[getBackgroundForLine(1, index, lines)];
      return { id: line.id, hidden: isDirection(line), background, actors,
        localized: Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, {
          speaker: catalog[`vn.line.${line.id}.speaker`] ?? line.speaker,
          emotion: catalog[`vn.line.${line.id}.emotion`] ?? line.emotion,
          text: catalog[`vn.line.${line.id}.text`] ?? line.text,
        }])) };
    })];
  }));
  return {
    sceneId: sceneMeta[1].id,
    titles: Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, catalog[`vn.scene.${sceneMeta[1].id}.title`]])),
    choicePrompt: Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, catalog['vn.choice.prompt']])),
    choices: Object.fromEntries(choices.map((id) => [id, Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, {
      title: catalog[`vn.choice.${id}.title`], effect: catalog[`vn.choice.${id}.effect`],
    }]))])),
    nextLevelId: 'M3_00_LOCKER_TUTORIAL',
    onWinSceneIndex: 2,
    nextSceneIndex: -1,
    variants,
  };
}

export function godotPostMatchScene() {
  const lines = getScene(2);
  const catalogs: Record<string, MessageCatalog> = { ru: ruCatalog, en: enCatalog, be: beCatalog };
  return {
    sceneId: sceneMeta[2].id,
    sceneIndex: 2,
    nextSceneId: sceneMeta[3].id,
    nextSceneIndex: 3,
    titles: Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, catalog[`vn.scene.${sceneMeta[2].id}.title`]])),
    lines: lines.map((line, index) => {
      const shot = authoredVnShotForLine(line.id);
      const actors = shot
        ? resolveSceneStagingPreset(shot.presetId, shot.actors).actors.map((actor) => ({
          character: actor.character, asset: actor.pose === 'pose-b' ? poseAsset(actor.character) : expressionAsset(actor.character, actor.expression),
          x: actor.anchorXPercent, top: actor.portraitTopPercent, height: actor.portraitHeightPercent, compactHeight: 168,
          scale: actor.canonicalCharacterScale, y: actor.canonicalCharacterYPercent, z: actor.zIndex + (actor.character === characterForSpeaker(line.speaker) ? 1 : 0),
        }))
        : (() => {
          const character = characterForSpeaker(line.speaker);
          if (!character || isDirection(line)) return [];
          const expression = expressionForDirection(line.emotion);
          const geometry = characterProductionManifest.characters[character].proportion.frameGeometry[expression];
          const camera = resolveVnPortraitEyeLineCamera(SCENE_STAGING_SHARED_ACTOR_SCALE, geometry.eyeLineYPx);
          const side = resolveVnStaging(lines, index)?.side;
          return [{ character, asset: expressionAsset(character, expression),
            x: (side === 'left' ? 29 : side === 'right' ? 71 : 50) + resolvedCharacterXPercent(character),
            top: camera.topPercent, height: camera.heightPercent, compactHeight: 168, scale: characterStaging[character].scale,
            y: characterStaging[character].yPercent, z: 0 }];
        })();
      const background = backgroundAssets[getBackgroundForLine(2, index, lines)];
      return { id: line.id, hidden: isDirection(line), background, actors,
        localized: Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, {
          speaker: catalog[`vn.line.${line.id}.speaker`] ?? line.speaker,
          emotion: catalog[`vn.line.${line.id}.emotion`] ?? line.emotion,
          text: catalog[`vn.line.${line.id}.text`] ?? line.text,
        }])) };
    }),
  };
}

export function godotStoryScene(sceneIndex: number) {
  const lines = getScene(sceneIndex);
  const scene = sceneMeta[sceneIndex];
  const graphScene = storyGraph.scenes.find((entry) => entry.legacyIndex === sceneIndex);
  if (!scene || !graphScene) throw new Error(`Story scene ${sceneIndex} is unavailable`);
  const catalogs: Record<string, MessageCatalog> = { ru: ruCatalog, en: enCatalog, be: beCatalog };
  const choiceGateSource = lines.map((line) => storyChoiceGateForLine(line.id)).find((gate) => gate !== null);
  const choiceGate = choiceGateSource ? {
    id: choiceGateSource.id,
    checkpointLineId: choiceGateSource.checkpointLineId,
    prompt: Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, catalog[`vn.storyChoice.${choiceGateSource.id}.prompt`]])),
    choices: Object.fromEntries(choiceGateSource.options.map((option) => [option, Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, {
      title: catalog[`vn.storyChoice.${choiceGateSource.id}.${option}.title`],
      effect: catalog[`vn.storyChoice.${choiceGateSource.id}.${option}.effect`],
    }]))])),
  } : null;
  const transition = graphScene.transition;
  const nextSceneId = transition.kind === 'scene' ? transition.targetSceneId : '';
  const nextSceneIndex = nextSceneId ? storyGraph.scenes.find((entry) => entry.id === nextSceneId)?.legacyIndex ?? -1 : -1;
  const branchChoiceId = transition.kind === 'branch' ? transition.gateId : '';
  const nextSceneIndices = transition.kind === 'branch'
    ? Object.fromEntries(Object.entries(transition.routes).map(([option, sceneId]) => [option, storyGraph.scenes.find((entry) => entry.id === sceneId)?.legacyIndex ?? -1]))
    : {};
  const nextLevelId = transition.kind === 'match3' ? transition.levelId : '';
  const onWinSceneIndex = transition.kind === 'match3'
    ? storyGraph.scenes.find((entry) => entry.id === transition.onWinSceneId)?.legacyIndex ?? -1
    : -1;
  const ending = transition.kind === 'ending' ? {
    endingId: transition.endingId,
    ...(transition.fallbackEndingId ? { fallbackEndingId: transition.fallbackEndingId } : {}),
    ...(transition.successRequirement ? { successRequirement: transition.successRequirement } : {}),
  } : null;
  return {
    sceneId: scene.id, sceneIndex, nextSceneId, nextSceneIndex, nextLevelId, onWinSceneIndex,
    ...(ending ? { ending } : {}),
    ...(transition.kind === 'branch' ? { branchChoiceId, nextSceneIndices } : {}),
    ...(choiceGate ? { choiceGate } : {}),
    background: backgroundAssets[scene.defaultBackground],
    titles: Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, catalog[`vn.scene.${scene.id}.title`]])),
    lines: lines.map((line, index) => {
      const shot = authoredVnShotForLine(line.id);
      const actors = shot
        ? resolveSceneStagingPreset(shot.presetId, shot.actors).actors.map((actor) => ({
          character: actor.character, asset: actor.pose === 'pose-b' ? poseAsset(actor.character) : expressionAsset(actor.character, actor.expression),
          x: actor.anchorXPercent, top: actor.portraitTopPercent, height: actor.portraitHeightPercent, compactHeight: 168,
          scale: actor.canonicalCharacterScale, y: actor.canonicalCharacterYPercent, z: actor.zIndex + (actor.character === characterForSpeaker(line.speaker) ? 1 : 0),
        }))
        : (() => {
          const character = characterForSpeaker(line.speaker);
          if (isDirection(line)) return [];
          if (!character) {
            const guest = guestWitnessForSpeaker(line.speaker);
            if (!guest) return [];
            const camera = resolveVnPortraitCamera();
            const asset = guestWitnessAssetForDirection(guest, line.emotion);
            if (!asset) throw new Error(`Missing production portrait for ${guest}`);
            return [{ character: guest, asset,
              x: 71, top: camera.topPercent, height: camera.heightPercent, compactHeight: 168,
              scale: 1, y: 0, z: 2, idle: false }];
          }
          const expression = expressionForDirection(line.emotion);
          const geometry = characterProductionManifest.characters[character].proportion.frameGeometry[expression];
          const camera = resolveVnPortraitEyeLineCamera(SCENE_STAGING_SHARED_ACTOR_SCALE, geometry.eyeLineYPx);
          const side = resolveVnStaging(lines, index)?.side;
          return [{ character, asset: expressionAsset(character, expression),
            x: (side === 'left' ? 29 : side === 'right' ? 71 : 50) + resolvedCharacterXPercent(character),
            top: camera.topPercent, height: camera.heightPercent, compactHeight: 168, scale: characterStaging[character].scale,
            y: characterStaging[character].yPercent, z: 0 }];
        })();
      return { id: line.id, hidden: isDirection(line), background: backgroundAssets[getBackgroundForLine(sceneIndex, index, lines)], actors,
        localized: Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, {
          speaker: catalog[`vn.line.${line.id}.speaker`] ?? line.speaker,
          emotion: catalog[`vn.line.${line.id}.emotion`] ?? line.emotion,
          text: catalog[`vn.line.${line.id}.text`] ?? line.text,
        }])) };
    }),
  };
}

export function godotEndingOutcomeData() {
  const catalogs: Record<string, MessageCatalog> = { ru: ruCatalog, en: enCatalog, be: beCatalog };
  const endingIds = ['ENDING_A_FULL_TRUTH', 'ENDING_B_CASE_CLOSED', 'ENDING_C_PERFECT_SUSPECT'] as const;
  const baseTrustByChoice = Object.fromEntries((['A', 'B', 'C'] as const).map((choice) => {
    const metrics = storyOutcomeMetrics({ choice, clues: [], storyChoices: {} });
    return [choice, { teamTrust: metrics.teamTrust, sourceTrust: metrics.sourceTrust }];
  }));
  const storyChoiceEffects = Object.fromEntries(storyChoiceGates.filter((gate) => gate.id !== 'final-strategy').map((gate) => [gate.id,
    Object.fromEntries(gate.options.map((option) => {
      const metrics = storyOutcomeMetrics({ choice: 'A', clues: [], storyChoices: { [gate.id]: option } });
      const base = baseTrustByChoice.A;
      return [option, { teamTrust: metrics.teamTrust - base.teamTrust, sourceTrust: metrics.sourceTrust - base.sourceTrust }];
    })),
  ]));
  return {
    copy: Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, {
      case: catalog['ending.case'], chapterComplete: catalog['ending.chapterComplete'],
      finalStrategy: catalog['ending.finalStrategy'], metrics: catalog['ending.metrics'],
      cluesFound: catalog['ending.cluesFound'], mainMenu: catalog['ending.mainMenu'], replay: catalog['ending.replay'],
      settingsNavigation: { label: catalog['settings.navigationLabel'], title: catalog['settings.mainMenu'], safe: catalog['settings.mainMenuSafe'] },
      strategyTitles: Object.fromEntries((['A', 'B', 'C'] as const).map((option) => [option, catalog[`vn.storyChoice.final-strategy.${option}.title`]])),
      outcomes: Object.fromEntries(endingIds.map((id) => [id, {
        eyebrow: catalog[`ending.outcome.${id}.eyebrow`], heading: catalog[`ending.outcome.${id}.heading`],
        copy: catalog[`ending.outcome.${id}.copy`],
        fallbackCopy: catalog[`ending.outcome.${id}.fallbackCopy`] ?? '',
      }])),
    }])) as Record<string, unknown>,
    backgrounds: {
      ENDING_A_FULL_TRUTH: backgroundAssets.disciplinaryAssembly,
      ENDING_B_CASE_CLOSED: backgroundAssets.clubroom,
      ENDING_C_PERFECT_SUSPECT: backgroundAssets.clubroom,
    },
    outcomeRules: {
      evidenceClueIds: fullTruthEvidenceClueIds,
      requirement: fullTruthRequirement,
      baseTrustByChoice,
      storyChoiceEffects,
    },
    totalClues: levels.length,
    clueAssets: Object.fromEntries(Object.entries(cluePresentation).map(([id, clue]) => [id, clue.asset])),
    defaultClueId: levels[levels.length - 1].clueId,
  };
}

export function godotM3Evidence() {
  const level = levels[0];
  const catalogs: Record<string, MessageCatalog> = { ru: ruCatalog, en: enCatalog, be: beCatalog };
  const clue = cluePresentation[level.clueId];
  return {
    id: level.clueId,
    asset: clue.asset,
    localized: Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, {
      label: catalog[`match3.clue.${level.clueId}`],
      title: catalog[`match3.level.${level.id}.clueTitle`],
      evidenceFound: catalog['match3.evidenceFound'],
      continueStory: catalog['match3.continueStory'],
    }])),
  };
}
