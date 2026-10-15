import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { match3ReactionRulesByLevel } from '../src/data/match3Reactions';
import { characterProductionManifest } from '../src/data/characterProduction';
import { guestWitnessManifest } from '../src/data/guestWitnesses';
import { beCatalog } from '../src/localization/catalogs/be';
import { enCatalog } from '../src/localization/catalogs/en';
import { ruCatalog } from '../src/localization/catalogs/ru';
import { match3ReactionPolicies } from '../src/ui/match3ReactionPresentation';

const root = resolve(process.cwd());
const catalogs = { en: enCatalog, ru: ruCatalog, be: beCatalog } as const;

describe('Godot Match-3 reaction export', () => {
  it('keeps rules, policies, copy and speaker medallions synchronized with the web source', () => {
    const exported = JSON.parse(readFileSync(resolve(root, 'godot/data/match3_reactions.json'), 'utf8'));
    expect(exported.schemaVersion).toBe(1);
    expect(exported.rulesByLevel).toEqual(match3ReactionRulesByLevel);
    expect(exported.policies).toEqual(match3ReactionPolicies);

    for (const [locale, catalog] of Object.entries(catalogs)) {
      const expectedCopy = Object.fromEntries(Object.entries(catalog)
        .filter(([key]) => key.startsWith('match3.reaction.') || key.startsWith('match3.bark.')));
      expect(exported.localized[locale]).toEqual(expectedCopy);
    }

    const speakerIds = [...new Set(Object.values(match3ReactionRulesByLevel).flatMap((rules) => rules.map(({ speaker }) => speaker)))].sort();
    const expectedNames = Object.fromEntries(Object.entries(catalogs).map(([locale, catalog]) => [locale,
      Object.fromEntries(speakerIds.map((speaker) => [speaker, catalog[`character.${speaker}` as keyof typeof catalog]])),
    ]));
    const expectedAssets = Object.fromEntries(speakerIds.map((speaker) => [speaker,
      characterProductionManifest.characters[speaker as keyof typeof characterProductionManifest.characters]?.assets.medallion
        ?? guestWitnessManifest.guests[speaker as keyof typeof guestWitnessManifest.guests]?.assets?.medallion,
    ]));
    expect(exported.speakerNames).toEqual(expectedNames);
    expect(exported.speakerAssets).toEqual(expectedAssets);

    for (const asset of Object.values(expectedAssets)) {
      expect(asset).toBeTruthy();
      const relativePath = String(asset).replace(/^\.\//, '');
      const source = readFileSync(resolve(root, 'public', relativePath));
      const ported = readFileSync(resolve(root, 'godot', relativePath));
      expect(ported.equals(source), `${relativePath} changed during export`).toBe(true);
    }
  });
});
