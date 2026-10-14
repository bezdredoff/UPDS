import {
  blockerPresentation,
  ingredientPresentation,
  levels,
  lockedBlockerAssetsByLayers,
  specialAssets,
  tilePresentation,
} from '../../src/data/levels';
import { Match3Game } from '../../src/engine/Match3Game';
import { godotM3Evidence } from './godotPrologue';
import { beCatalog } from '../../src/localization/catalogs/be';
import { enCatalog } from '../../src/localization/catalogs/en';
import { ruCatalog } from '../../src/localization/catalogs/ru';

const catalogs = { en: enCatalog, ru: ruCatalog, be: beCatalog } as const;
const tutorial = 'match3.tutorial.basic-swap';

/** A runtime-neutral campaign level contract generated from the canonical web level. */
export function godotCampaignLevel(level: (typeof levels)[number]) {
  const game = new Match3Game(level);
  return {
    id: level.id,
    shortId: level.shortId,
    seed: level.seed,
    rows: level.boardSize?.rows ?? 8,
    columns: level.boardSize?.columns ?? 8,
    moves: level.moves,
    activeTiles: level.activeTiles,
    spawnWeights: level.spawnWeights ?? {},
    boardHoles: level.boardHoles ?? [],
    initialTiles: level.initialTiles ?? [],
    blockers: level.blockers,
    blockerStyle: level.blocker,
    ingredients: level.ingredients,
    objectives: level.objectives,
    openingBoard: game.board.map((cell) => ({
      tile: cell.tile ?? '',
      ingredient: cell.ingredient ?? '',
      blockerLayers: cell.blockerLayers,
      special: cell.special ?? '',
    })),
  };
}

export function godotCampaignBundle() {
  const tileAssets = Object.fromEntries(
    [...new Set(levels.flatMap((level) => level.activeTiles))].map((tile) => [tile, tilePresentation[tile].asset]),
  );
  const ingredientAssets = Object.fromEntries(
    [...new Set(levels.flatMap((level) => level.ingredients.map(({ kind }) => kind)))].map((kind) => [kind, ingredientPresentation[kind].asset]),
  );
  const evidenceLevel = levels[0];
  const evidenceKey = `match3.level.${evidenceLevel.id}`;
  return {
    schemaVersion: 1,
    levels: levels.map(godotCampaignLevel),
    levelPresentations: Object.fromEntries(levels.map((level) => {
      const key = `match3.level.${level.id}`;
      return [level.id, { localized: Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, {
        title: catalog[`${key}.title`],
        storyAction: catalog[`${key}.storyAction`],
        objectives: level.objectives.map((_, index) => catalog[`${key}.objective.${index}`]),
        startSpeaker: catalog[`${key}.startBark.speaker`],
        startText: catalog[`${key}.startBark.text`],
        winSpeaker: catalog[`${key}.winBark.speaker`],
        winText: catalog[`${key}.winBark.text`],
        loseSpeaker: catalog[`${key}.loseBark.speaker`],
        loseText: catalog[`${key}.loseBark.text`],
        noMatchBark: catalog['match3.bark.noMatchInvalid'],
        back: catalog['common.back'],
        retry: catalog['match3Campaign.replay'],
        moves: catalog['match3.moves'],
        hint: catalog['match3.hint'],
        win: catalog['match3Campaign.winHeading'],
        lose: catalog['match3Campaign.lossHeading'],
        resultDetail: catalog['match3Campaign.resultDetail'],
        backToCampaign: catalog['match3Campaign.backToCampaign'],
      }])) }];
    })),
    campaignLocalized: Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, {
      eyebrow: catalog['match3Campaign.eyebrow'], title: catalog['match3Campaign.title'],
      summary: catalog['match3Campaign.summary'], progress: catalog['match3Campaign.progress'],
      complete: catalog['match3Campaign.complete'], locked: catalog['match3Campaign.locked'],
      completed: catalog['match3Campaign.completed'], available: catalog['match3Campaign.available'],
      attempts: catalog['match3Campaign.attempts'], best: catalog['match3Campaign.best'],
      replay: catalog['match3Campaign.replay'], play: catalog['match3Campaign.play'],
      back: catalog['common.back'],
    }])),
    assets: {
      tiles: tileAssets,
      ingredients: ingredientAssets,
      blockers: Object.fromEntries(Object.entries(blockerPresentation).map(([key, value]) => [key, value.asset])),
      lockedBlockers: lockedBlockerAssetsByLayers,
      specials: specialAssets,
    },
    firstLevelPresentation: {
      evidence: godotM3Evidence(),
      localized: Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, {
        title: catalog[`${evidenceKey}.title`],
        storyAction: catalog[`${evidenceKey}.storyAction`],
        objective: catalog[`${evidenceKey}.objective.0`],
        tutorialTitle: catalog[`${tutorial}.title`],
        tutorialBody: catalog[`${tutorial}.body`],
        tutorialTry: catalog['match3.tutorial.try'],
        noMatchBark: catalog['match3.bark.noMatchInvalid'],
        startSpeaker: catalog[`${evidenceKey}.startBark.speaker`],
        startText: catalog[`${evidenceKey}.startBark.text`],
        winSpeaker: catalog[`${evidenceKey}.winBark.speaker`],
        winText: catalog[`${evidenceKey}.winBark.text`],
        loseSpeaker: catalog[`${evidenceKey}.loseBark.speaker`],
        loseText: catalog[`${evidenceKey}.loseBark.text`],
        back: catalog['common.back'],
        retry: catalog['match3Campaign.replay'],
        moves: catalog['match3.moves'],
        collected: catalog['match3.objective'],
        win: catalog['match3Campaign.winHeading'],
        lose: catalog['match3Campaign.lossHeading'],
      }]))
    },
  };
}

export function godotMatch3Level() {
  const level = levels[0];
  const game = new Match3Game(level);
  const key = `match3.level.${level.id}`;
  return {
    id: level.id,
    shortId: level.shortId,
    seed: level.seed,
    rows: level.boardSize?.rows,
    columns: level.boardSize?.columns,
    moves: level.moves,
    target: level.objectives[0]?.kind === 'collect' ? level.objectives[0].target : 0,
    objectiveTile: level.objectives[0]?.kind === 'collect' ? level.objectives[0].tile : '',
    activeTiles: level.activeTiles,
    seededOpeningBoard: game.board.map((cell) => cell.tile),
    evidence: godotM3Evidence(),
    assets: Object.fromEntries(level.activeTiles.map((tile) => [tile, tilePresentation[tile].asset])),
    localized: Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale, {
      title: catalog[`${key}.title`],
      storyAction: catalog[`${key}.storyAction`],
      objective: catalog[`${key}.objective.0`],
      tutorialTitle: catalog[`${tutorial}.title`],
      tutorialBody: catalog[`${tutorial}.body`],
      tutorialTry: catalog['match3.tutorial.try'],
      noMatchBark: catalog['match3.bark.noMatchInvalid'],
      startSpeaker: catalog[`${key}.startBark.speaker`],
      startText: catalog[`${key}.startBark.text`],
      winSpeaker: catalog[`${key}.winBark.speaker`],
      winText: catalog[`${key}.winBark.text`],
      loseSpeaker: catalog[`${key}.loseBark.speaker`],
      loseText: catalog[`${key}.loseBark.text`],
      back: catalog['common.back'],
      retry: catalog['match3Campaign.replay'],
      moves: catalog['match3.moves'],
      collected: catalog['match3.objective'],
      win: catalog['match3Campaign.winHeading'],
      lose: catalog['match3Campaign.lossHeading'],
    }]))
  };
}
