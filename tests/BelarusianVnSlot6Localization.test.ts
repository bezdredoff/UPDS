import { describe, expect, it } from 'vitest';
import { storyChoiceGates } from '../src/data/storyChoices';
import { storyGraph } from '../src/data/storyGraph';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B3G_KEY_COUNT = 140;
const SLOT6_SCENES = new Set([
  'VN_SCENE_13_E6_PRE',
  'VN_SCENE_14_E6_POST',
]);
const SLOT6_CHOICE_PREFIX = 'vn.storyChoice.apology-to-hinata.';

const isB3GKey = (key: string): boolean => {
  const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
  if (scene) return SLOT6_SCENES.has(scene[1]);
  const line = key.match(/^vn\.line\.VN(\d{4})\.(?:speaker|emotion|text)$/u);
  if (line) return Number(line[1]) >= 327 && Number(line[1]) <= 369;
  return key.startsWith(SLOT6_CHOICE_PREFIX);
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB3GKey(key)));

describe('ANM-029B3G Belarusian VN story slot 6', () => {
  it('covers canonical runtime slot 6 and its choice gate exactly', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(source)).toHaveLength(B3G_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B3G_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B3G_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks VN0327–VN0369, apology-to-hinata at VN0356 and the VN0370 next-slot boundary', () => {
    const scene13 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_13_E6_PRE');
    const scene14 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_14_E6_POST');
    const scene15 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_15_E7_PRE');
    const gate = storyChoiceGates.find((candidate) => candidate.id === 'apology-to-hinata');

    expect(scene13?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0327', endLineId: 'VN0347' });
    expect(scene14?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0348', endLineId: 'VN0369' });
    expect(scene15?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0370', endLineId: 'VN0390' });
    expect(gate).toEqual({ id: 'apology-to-hinata', checkpointLineId: 'VN0356', options: ['A', 'B', 'C'] });
  });

  it('locks reviewed Hinata exoneration, silver-thread/Asterion bridge, payloads and runtime-hidden status', () => {
    expect(beCatalog['vn.scene.VN_SCENE_13_E6_PRE.title']).toBe('Майстэрня падазронага памеру');
    expect(beCatalog['vn.line.VN0343.text']).toContain('сэрвісная строчка');
    expect(beCatalog['vn.line.VN0349.text']).toContain('не падтрымлівае гэтую нітку');
    expect(beCatalog['vn.line.VN0356.text']).toBe('{CHOICE apology-to-hinata}');
    expect(beCatalog['vn.storyChoice.apology-to-hinata.A.effect']).toBe('Давер крыніц +1');
    expect(beCatalog['vn.line.VN0359.text']).toBe('{ADD CUE_007; SET SUS_HINATA=cleared}');
    expect(beCatalog['vn.line.VN0364.text']).toContain('Asterion Sports Lab');
    expect(beCatalog['vn.line.VN0365.text']).toContain('Куросэ');
    expect(beCatalog['vn.line.VN0369.text']).toBe('{AUTHORED FRONTIER: SLOT_07 / NEXT BATCH 7-9}');
    expect(Object.keys(select(beCatalog))).toHaveLength(B3G_KEY_COUNT);
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'translation-pending',
      runtimeSelectable: false,
    });
    expect(supportedLocales).toEqual(['ru', 'en']);
    expect('be' in appCatalogs).toBe(false);
  });
});
