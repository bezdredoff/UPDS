import { levels, tilePresentation } from '../../src/data/levels';
import { Match3Game } from '../../src/engine/Match3Game';
import { beCatalog } from '../../src/localization/catalogs/be';
import { enCatalog } from '../../src/localization/catalogs/en';
import { ruCatalog } from '../../src/localization/catalogs/ru';
import { godotM3Evidence } from './godotPrologue';

const catalogs = { en: enCatalog, ru: ruCatalog, be: beCatalog } as const;
const level = levels[0];
if (!level || level.id !== 'M3_00_LOCKER_TUTORIAL') throw new Error('The first Match-3 level changed unexpectedly');

export function godotMatch3Level() {
  const key = `match3.level.${level.id}`;
  const tutorial = 'match3.tutorial.basic-swap';
  const seededOpeningBoard = new Match3Game(level).board.map((cell) => cell.tile);
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
    seededOpeningBoard,
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
    }])),
  };
}
