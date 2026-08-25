import { describe, expect, it } from 'vitest';
import {
  blockerLocksTileInteraction,
  blockerPresentation,
  blockerStyles,
  levels,
  validateLevelDefinitions,
} from '../src/data/levels';
import { beCatalog } from '../src/localization/catalogs/be';
import { enCatalog } from '../src/localization/catalogs/en';
import { ruCatalog } from '../src/localization/catalogs/ru';

const expectedLevelsByStyle = {
  locked: ['M3_00', 'M3_05', 'M3_07', 'M3_10', 'M3_17', 'M3_19', 'M3_20'],
  solid: ['M3_01', 'M3_03', 'M3_04', 'M3_06', 'M3_08', 'M3_09', 'M3_11', 'M3_13', 'M3_14', 'M3_18', 'M3_21'],
  overlay: ['M3_02', 'M3_12', 'M3_15', 'M3_16'],
} as const;

describe('ANM-025G1 lean blocker archetypes', () => {
  it('keeps exactly three reusable blocker styles with one runtime asset each', () => {
    expect(blockerStyles).toEqual(['locked', 'solid', 'overlay']);
    expect(Object.keys(blockerPresentation)).toEqual(blockerStyles);
    expect(new Set(Object.values(blockerPresentation).map(({ asset }) => asset))).toHaveLength(3);

    for (const style of blockerStyles) {
      expect(levels.filter((level) => level.blocker === style).map((level) => level.shortId)).toEqual(
        expectedLevelsByStyle[style],
      );
    }
  });

  it('separates visual style from the one existing permeable interaction exception', () => {
    const permeable = levels.filter((level) => level.blockerIsPermeable);
    expect(permeable.map((level) => level.shortId)).toEqual(['M3_02']);
    expect(blockerLocksTileInteraction(permeable[0], 1)).toBe(false);

    const blockingOverlay = levels.find((level) => level.shortId === 'M3_12');
    expect(blockingOverlay?.blocker).toBe('overlay');
    expect(blockerLocksTileInteraction(blockingOverlay!, 1)).toBe(true);
    expect(blockerLocksTileInteraction(blockingOverlay!, 0)).toBe(false);

    expect(validateLevelDefinitions([{ ...levels[0], blockerIsPermeable: true }])).toContain(
      `${levels[0].id}: only overlay blockers may be permeable`,
    );
  });

  it('uses one short blocker objective term in production data and all release locales', () => {
    const catalogs: Readonly<Record<string, Readonly<Record<string, string>>>> = {
      ru: ruCatalog,
      en: enCatalog,
      be: beCatalog,
    };
    const expected = { ru: 'Преграды', en: 'Blockers', be: 'Перашкоды' } as const;

    for (const level of levels) {
      const objectiveIndex = level.objectives.findIndex((objective) => objective.kind === 'clearBlockers');
      expect(objectiveIndex, level.shortId).toBeGreaterThanOrEqual(0);
      expect(level.objectives[objectiveIndex].label, level.shortId).toBe('Преграды');
      const key = `match3.level.${level.id}.objective.${objectiveIndex}`;
      for (const locale of Object.keys(expected) as readonly (keyof typeof expected)[]) {
        expect(catalogs[locale][key], `${locale}:${key}`).toBe(expected[locale]);
      }
    }
  });

  it('exposes only the three archetypes in Level Lab localization', () => {
    const expectedKeys = blockerStyles.map((style) => `levelLab.blocker.${style}`).sort();
    for (const catalog of [ruCatalog, enCatalog, beCatalog]) {
      expect(Object.keys(catalog).filter((key) => key.startsWith('levelLab.blocker.')).sort()).toEqual(expectedKeys);
    }
  });
});
