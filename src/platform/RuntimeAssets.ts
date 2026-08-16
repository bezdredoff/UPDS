import { characterRigs } from '../data/characterRigs';
import { blockerPresentation, cluePresentation, ingredientPresentation, specialAsset, tilePresentation } from '../data/levels';
import { backgroundAssets } from '../data/narrative';
import { uniqueAssetList } from './AssetPreloader';

const uiAssets = [
  './assets/ui/icon_back.svg', './assets/ui/icon_menu.svg', './assets/ui/icon_dossier.svg', './assets/ui/icon_close.svg',
  './assets/ui/icon_settings.svg', './assets/ui/icon_save.svg', './assets/ui/icon_load.svg', './assets/ui/icon_log.svg',
  './assets/ui/icon_skip.svg', './assets/ui/icon_auto.svg',
] as const;

/** Full runtime distribution/offline-cache catalog. Contextual Image warming is owned by feature transitions. */
export const runtimeAssetCatalog = uniqueAssetList([
  ...Object.values(backgroundAssets),
  ...Object.values(characterRigs).flatMap((rig) => [...Object.values(rig.frames), rig.poseB, rig.medallion]),
  ...Object.values(tilePresentation).map((item) => item.asset),
  ...Object.values(ingredientPresentation).map((item) => item.asset),
  ...Object.values(blockerPresentation).map((item) => item.asset),
  ...Object.values(cluePresentation).map((item) => item.asset),
  specialAsset,
  ...uiAssets,
]);
