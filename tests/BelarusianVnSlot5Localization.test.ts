import { describe, expect, it } from 'vitest';
import { storyChoiceGates } from '../src/data/storyChoices';
import { storyGraph } from '../src/data/storyGraph';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B3F_KEY_COUNT = 118;
const SLOT5_SCENES = new Set([
  'VN_SCENE_11_E5_PRE',
  'VN_SCENE_12_E5_POST',
]);

const isB3FKey = (key: string): boolean => {
  const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
  if (scene) return SLOT5_SCENES.has(scene[1]);
  const line = key.match(/^vn\.line\.VN(\d{4})\.(?:speaker|emotion|text)$/u);
  if (line) return Number(line[1]) >= 289 && Number(line[1]) <= 326;
  return false;
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB3FKey(key)));

describe('ANM-029B3F Belarusian VN story slot 5', () => {
  it('covers canonical runtime slot 5 exactly', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(source)).toHaveLength(B3F_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B3F_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B3F_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks the canonical VN0289–VN0326 graph boundary without swallowing slot 6 choice content', () => {
    const scene11 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_11_E5_PRE');
    const scene12 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_12_E5_POST');
    const scene13 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_13_E6_PRE');
    const nextGate = storyChoiceGates.find((candidate) => candidate.id === 'apology-to-hinata');

    expect(scene11?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0289', endLineId: 'VN0308' });
    expect(scene12?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0309', endLineId: 'VN0326' });
    expect(scene13?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0327', endLineId: 'VN0347' });
    expect(nextGate).toEqual({ id: 'apology-to-hinata', checkpointLineId: 'VN0356', options: ['A', 'B', 'C'] });
  });

  it('locks reviewed service-route terminology, Hinata naming, payload and runtime-hidden status', () => {
    expect(beCatalog['vn.scene.VN_SCENE_11_E5_PRE.title']).toBe('Заслон для злодзея');
    expect(beCatalog['vn.scene.VN_SCENE_12_E5_POST.title']).toBe('Сэрвісная строчка');
    expect(beCatalog['vn.line.VN0295.text']).toContain('Ціхару Хіната');
    expect(beCatalog['vn.line.VN0300.text']).toContain('сэрвісная строчка');
    expect(beCatalog['vn.line.VN0316.text']).toContain('цэнтральная пральня');
    expect(beCatalog['vn.line.VN0323.text']).toBe('{ADD CUE_006}');
    expect(beCatalog['vn.line.VN0326.text']).toBe('«Эпізод 6 — Майстэрня падазронага памеру»');
    expect(Object.keys(select(beCatalog))).toHaveLength(B3F_KEY_COUNT);
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'translation-pending',
      runtimeSelectable: false,
    });
    expect(supportedLocales).toEqual(['ru', 'en']);
    expect('be' in appCatalogs).toBe(false);
  });
});
