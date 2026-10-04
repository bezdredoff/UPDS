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
  solid: ['M3_01', 'M3_03', 'M3_04', 'M3_06', 'M3_08', 'M3_09', 'M3_11', 'M3_12', 'M3_13', 'M3_14', 'M3_16', 'M3_18', 'M3_21'],
  overlay: ['M3_02', 'M3_15'],
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

  it('keeps foam only in wet/laundry contexts and every blocker layer locks interaction', () => {
    const overlayLevels = levels.filter((level) => level.blocker === 'overlay');
    expect(overlayLevels.map((level) => level.shortId)).toEqual(['M3_02', 'M3_15']);
    expect(overlayLevels.every((level) => level.context.narrativeTags.some((tag) => /laundry|foam/.test(tag))))
      .toBe(true);

    for (const level of levels) {
      expect(blockerLocksTileInteraction(1, level.blocker), level.shortId).toBe(level.blocker !== 'overlay');
      expect(blockerLocksTileInteraction(0, level.blocker), level.shortId).toBe(false);
    }
    expect(validateLevelDefinitions(levels)).toEqual([]);
  });

  it('uses one short blocker objective term in production data and all release locales', () => {
    const catalogs: Readonly<Record<string, Readonly<Record<string, string>>>> = {
      ru: ruCatalog,
      en: enCatalog,
      be: beCatalog,
    };
    const expected = { ru: 'Преграды', en: 'Blockers', be: 'Перашкоды' } as const;
    const clearAction = { ru: 'Очистить преграды', en: 'Clear blockers', be: 'Прыбраць перашкоды' } as const;

    for (const level of levels) {
      const objectiveIndex = level.objectives.findIndex((objective) => objective.kind === 'clearBlockers');
      if (level.shortId === 'M3_00') {
        expect(objectiveIndex).toBe(-1);
        continue;
      }
      expect(objectiveIndex, level.shortId).toBeGreaterThanOrEqual(0);
      expect(level.objectives[objectiveIndex].label, level.shortId).toBe('Преграды');
      const key = `match3.level.${level.id}.objective.${objectiveIndex}`;
      const expectedLabel = ['M3_00', 'M3_02'].includes(level.shortId) ? clearAction : expected;
      for (const locale of Object.keys(expected) as readonly (keyof typeof expected)[]) {
        expect(catalogs[locale][key], `${locale}:${key}`).toBe(expectedLabel[locale]);
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
