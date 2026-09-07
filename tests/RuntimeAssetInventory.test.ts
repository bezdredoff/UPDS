import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { characterProductionManifest, productionCharacterKeys, runtimeExpressionOrder } from '../src/data/characterProduction';
import { guestWitnessManifest, guestWitnessKeys, validateGuestWitnessManifest } from '../src/data/guestWitnesses';
import { specialAssets, specialFallbackAssets } from '../src/data/levels';
import { backgroundAssets } from '../src/data/narrative';

type AssetIssue = Readonly<{ path: string; reason: string }>;

const publicRoot = resolve(process.cwd(), 'public');

const assetFile = (asset: string): string => resolve(publicRoot, asset.replace(/^\.\/assets\//u, 'assets/'));

const assetIssues = (asset: string): AssetIssue[] => {
  const issues: AssetIssue[] = [];
  if (!asset.startsWith('./assets/')) {
    issues.push({ path: asset, reason: 'path is outside the runtime asset root' });
    return issues;
  }
  const file = assetFile(asset);
  if (!existsSync(file)) {
    issues.push({ path: asset, reason: 'file is missing' });
    return issues;
  }
  const bytes = readFileSync(file);
  const isPng = bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isWebp = bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  const isSvg = bytes.toString('utf8', 0, Math.min(bytes.length, 512)).includes('<svg');
  if (!isPng && !isWebp && !isSvg) issues.push({ path: asset, reason: 'unrecognized image signature' });
  return issues;
};

const collectIssues = (assets: readonly string[]): AssetIssue[] => assets.flatMap(assetIssues);

describe('runtime asset inventory', () => {
  it('builds a release-checklist inventory from runtime semantic keys', () => {
    const backgroundEntries = Object.entries(backgroundAssets);
    const backgroundFiles = [...new Set(backgroundEntries.map(([, asset]) => asset))];
    const backgroundAliases = backgroundEntries.filter(([, asset], index) => backgroundEntries.findIndex(([, candidate]) => candidate === asset) !== index);

    const characterAssets = productionCharacterKeys.flatMap((character) => {
      const definition = characterProductionManifest.characters[character];
      return [...Object.values(definition.assets.frames), definition.assets.poseB, definition.assets.medallion];
    });
    const bonusAssets = Object.values(specialAssets);
    const bonusFallbackAssets = Object.values(specialFallbackAssets);
    const guestIssues = validateGuestWitnessManifest();
    const plannedGuests = guestWitnessKeys.filter((key) => guestWitnessManifest.guests[key].status === 'planned');
    const productionGuests = guestWitnessKeys.filter((key) => guestWitnessManifest.guests[key].status === 'production');

    const issues = [
      ...collectIssues(backgroundFiles),
      ...collectIssues(characterAssets),
      ...collectIssues(bonusAssets),
      ...collectIssues(bonusFallbackAssets),
    ];

    console.log([
      'RUNTIME ASSET INVENTORY',
      `backgrounds: semantic keys=${backgroundEntries.length}; production files=${backgroundFiles.length}; aliases/fallbacks=${backgroundAliases.length}`,
      `characters: production keys=${productionCharacterKeys.length}; assets=${characterAssets.length} (${runtimeExpressionOrder.length} frames + pose + medallion each)`,
      `match3 bonus: production PNG=${bonusAssets.length}; SVG fallbacks=${bonusFallbackAssets.length}`,
      `guest runtime: keys=${guestWitnessKeys.length}; production packages=${productionGuests.length}; planned fallback guests=${plannedGuests.length}; planned assets=${plannedGuests.length * guestWitnessManifest.package.productionAssetCount}`,
      `path/decode errors=${issues.length}; guest contract errors=${guestIssues.length}`,
    ].join('\n'));

    expect(backgroundEntries).toHaveLength(24);
    expect(backgroundFiles).toHaveLength(14);
    expect(productionCharacterKeys).toHaveLength(9);
    expect(characterAssets).toHaveLength(productionCharacterKeys.length * 7);
    expect(bonusAssets).toHaveLength(5);
    expect(bonusFallbackAssets).toHaveLength(5);
    expect(issues).toEqual([]);
    expect(guestIssues).toEqual([]);
    expect(plannedGuests).toHaveLength(6);
    expect(productionGuests).toHaveLength(0);
  });
});
