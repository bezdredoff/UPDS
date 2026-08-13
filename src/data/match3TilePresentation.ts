import { tileKeys, tilePresentation, type TileKey } from './levels';
import type { Match3TilePresentationProfileKey } from './match3Context';

export type Match3TileArtVariant = Readonly<{
  id: string;
  asset: string;
  semanticTags: readonly string[];
}>;

export type Match3TilePresentationProfile = Readonly<{
  artDirectionTags: readonly string[];
  /** One stable art override per logical TileKey. Multiple same-tile variants are intentionally deferred. */
  overrides: Readonly<Partial<Record<TileKey, Match3TileArtVariant>>>;
}>;

export const match3TilePresentationProfiles: Readonly<Record<Match3TilePresentationProfileKey, Match3TilePresentationProfile>> = {
  'locker-laundry': {
    artDirectionTags: ['school-athletics', 'personal-laundry', 'bright-evidence'],
    overrides: {},
  },
  'photo-props': {
    artDirectionTags: ['photography', 'styled-prop', 'staged-evidence'],
    overrides: {},
  },
  'pool-service': {
    artDirectionTags: ['pool-locker', 'wet-laundry', 'service-area'],
    overrides: {},
  },
  'ordered-return': {
    artDirectionTags: ['ordered-storage', 'returned-laundry', 'inspection'],
    overrides: {},
  },
};

export type ResolvedMatch3TilePresentation = Readonly<{
  variantId: string;
  asset: string;
  color: string;
  semanticTags: readonly string[];
}>;

/**
 * Presentation-only resolver. Match3Game continues to own and compare only TileKey.
 * A profile maps each logical type to one stable visual asset, so falling/swapping a tile
 * cannot silently change its appearance. ANM-025C2 can populate profile overrides with real art.
 */
export function resolveMatch3TilePresentation(
  profileKey: Match3TilePresentationProfileKey,
  tile: TileKey,
): ResolvedMatch3TilePresentation {
  const base = tilePresentation[tile];
  const override = match3TilePresentationProfiles[profileKey].overrides[tile];
  return override
    ? { variantId: override.id, asset: override.asset, color: base.color, semanticTags: override.semanticTags }
    : { variantId: `base:${tile}`, asset: base.asset, color: base.color, semanticTags: ['base-art'] };
}

export function tilePresentationAssetsForProfile(profileKey: Match3TilePresentationProfileKey): string[] {
  return [...new Set(tileKeys.map((tile) => resolveMatch3TilePresentation(profileKey, tile).asset))];
}
