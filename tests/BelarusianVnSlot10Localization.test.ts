import { describe, expect, it } from 'vitest';
import { storyGraph } from '../src/data/storyGraph';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B3K_KEY_COUNT = 121;
const SLOT10_SCENES = new Set([
  'VN_SCENE_21_E10_PRE',
  'VN_SCENE_22_E10_POST',
]);

const isB3KKey = (key: string): boolean => {
  const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
  if (scene) return SLOT10_SCENES.has(scene[1]);
  const line = key.match(/^vn\.line\.VN(\d{4})\.(?:speaker|emotion|text)$/u);
  return Boolean(line && Number(line[1]) >= 489 && Number(line[1]) <= 527);
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB3KKey(key)));

describe('ANM-029B3K Belarusian VN story slot 10', () => {
  it('covers canonical runtime slot 10 exactly', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(source)).toHaveLength(B3K_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B3K_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B3K_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks VN0489–VN0527 and the VN0528 next-slot boundary', () => {
    const scene21 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_21_E10_PRE');
    const scene22 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_22_E10_POST');
    const scene23 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_23_E11_PRE');

    expect(scene21?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0489', endLineId: 'VN0508' });
    expect(scene22?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0509', endLineId: 'VN0527' });
    expect(scene23?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0528', endLineId: 'VN0547' });
  });

  it('locks reviewed control-sample terminology, payloads and runtime-hidden status', () => {
    expect(beCatalog['vn.scene.VN_SCENE_21_E10_PRE.title']).toBe('Чорны пояс, белыя трусы');
    expect(beCatalog['vn.scene.VN_SCENE_22_E10_POST.title']).toBe('Кантрольная выбарка');
    expect(beCatalog['vn.line.VN0490.text']).toContain('Аоі Кагава');
    expect(beCatalog['vn.line.VN0502.text']).toContain('сэрвісныя біркі');
    expect(beCatalog['vn.line.VN0512.text'].toLowerCase()).toContain('кантрольныя рэчы');
    expect(beCatalog['vn.line.VN0516.text']).toContain('кантрольную выбарку');
    expect(beCatalog['vn.line.VN0517.text']).toBe('{ADD CUE_011}');
    expect(beCatalog['vn.line.VN0524.text']).toContain('Asterion');
    expect(Object.keys(select(beCatalog))).toHaveLength(B3K_KEY_COUNT);
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'translation-pending',
      runtimeSelectable: false,
    });
    expect(supportedLocales).toEqual(['ru', 'en']);
    expect('be' in appCatalogs).toBe(false);
  });
});
