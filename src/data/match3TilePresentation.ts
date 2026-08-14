import { tilePresentation, type Match3TileCategory, type Match3TileId } from './levels';
import type { Match3TilePresentationProfileKey } from './match3Context';

export type Match3TilePresentationProfile = Readonly<{
  /** Narrative/art-direction metadata only. It cannot replace the core asset of a match identity. */
  artDirectionTags: readonly string[];
}>;

export const match3TilePresentationProfiles: Readonly<Record<Match3TilePresentationProfileKey, Match3TilePresentationProfile>> = {
  'locker-laundry': {
    artDirectionTags: ['school-athletics', 'personal-laundry', 'bright-evidence'],
  },
  'photo-props': {
    artDirectionTags: ['photography', 'styled-prop', 'staged-evidence'],
  },
  'pool-service': {
    artDirectionTags: ['pool-locker', 'wet-laundry', 'service-area'],
  },
  'ordered-return': { artDirectionTags: ['ordered-storage', 'returned-laundry', 'inspection'] },
  'meeting-reports': { artDirectionTags: ['student-council', 'reports', 'laundry-calendar'] },
  'basketball-service': { artDirectionTags: ['basketball-locker', 'service-tags', 'repair-log'] },
  'textile-workshop': { artDirectionTags: ['textile-workshop', 'orders', 'conductive-thread'] },
  'asterion-lab': { artDirectionTags: ['asterion-lab', 'sensor-thread', 'specification'] },
  'lost-found': { artDirectionTags: ['lost-found', 'sealed-packages', 'service-ledger'] },
  'maintenance-service': { artDirectionTags: ['maintenance-room', 'master-key', 'night-logistics'] },
  'karate-control': { artDirectionTags: ['karate-club', 'control-sample', 'service-stitch'] },
  'asterion-transfer': { artDirectionTags: ['service-yard', 'asterion-container', 'transfer-chain'] },
  'second-skin-signal': { artDirectionTags: ['old-gym-night', 'radio-signal', 'second-skin'] },
  'kendo-pilot': { artDirectionTags: ['kendo-hall', 'armor-racks', 'pilot-codes'] },
  'kubo-atelier': { artDirectionTags: ['family-atelier', 'order-ledger', 'silver-seam'] },
  'abandoned-laundry': { artDirectionTags: ['old-laundry', 'service-route', 'consent-note'] },
};

export type ResolvedMatch3TilePresentation = Readonly<{
  tileId: Match3TileId;
  variantId: string;
  asset: string;
  color: string;
  category: Match3TileCategory;
  semanticTags: readonly string[];
}>;

/**
 * One concrete Match3TileId is both the match identity and the visual identity.
 * A presentation profile can contribute narrative tags, but it cannot swap the tile's asset.
 */
export function resolveMatch3TilePresentation(
  profileKey: Match3TilePresentationProfileKey,
  tile: Match3TileId,
): ResolvedMatch3TilePresentation {
  const base = tilePresentation[tile];
  const profile = match3TilePresentationProfiles[profileKey];
  return {
    tileId: tile,
    variantId: `tile:${tile}`,
    asset: base.asset,
    color: base.color,
    category: base.category,
    semanticTags: [...profile.artDirectionTags, base.category],
  };
}

export function tilePresentationAssetsForActiveSet(
  profileKey: Match3TilePresentationProfileKey,
  activeTiles: readonly Match3TileId[],
): string[] {
  return [...new Set(activeTiles.map((tile) => resolveMatch3TilePresentation(profileKey, tile).asset))];
}
