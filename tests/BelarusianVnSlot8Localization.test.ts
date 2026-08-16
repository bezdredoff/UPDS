import { describe, expect, it } from 'vitest';
import { storyGraph } from '../src/data/storyGraph';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B3I_KEY_COUNT = 121;
const SLOT8_SCENES = new Set([
  'VN_SCENE_17_E8_PRE',
  'VN_SCENE_18_E8_POST',
]);

const isB3IKey = (key: string): boolean => {
  const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
  if (scene) return SLOT8_SCENES.has(scene[1]);
  const line = key.match(/^vn\.line\.VN(\d{4})\.(?:speaker|emotion|text)$/u);
  if (line) return Number(line[1]) >= 410 && Number(line[1]) <= 448;
  return false;
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB3IKey(key)));

describe('ANM-029B3I Belarusian VN story slot 8', () => {
  it('covers canonical runtime slot 8 exactly', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(source)).toHaveLength(B3I_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B3I_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B3I_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks VN0410–VN0448 and the VN0449 next-slot boundary', () => {
    const scene17 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_17_E8_PRE');
    const scene18 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_18_E8_POST');
    const scene19 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_19_E9_PRE');

    expect(scene17?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0410', endLineId: 'VN0429' });
    expect(scene18?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0430', endLineId: 'VN0448' });
    expect(scene19?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0449', endLineId: 'VN0469' });
  });

  it('locks reviewed lost-and-found terminology, payload and runtime-enabled status', () => {
    expect(beCatalog['vn.scene.VN_SCENE_17_E8_PRE.title']).toBe('Восемдзесят сем пакетаў');
    expect(beCatalog['vn.scene.VN_SCENE_17_E8_PRE.location']).toBe('Склад знаходак пральні');
    expect(beCatalog['vn.line.VN0412.text']).toContain('Рына Сіраісі');
    expect(beCatalog['vn.line.VN0421.text']).toContain('сэрвісных кодах');
    expect(beCatalog['vn.line.VN0436.text']).toContain('Цэнтральная пральня');
    expect(beCatalog['vn.line.VN0440.text']).toBe('{ADD CUE_009}');
    expect(beCatalog['vn.line.VN0443.text']).toContain('Asterion');
    expect(beCatalog['vn.line.VN0445.text']).toContain('ўніверсальным ключом');
    expect(beCatalog['vn.line.VN0448.text']).toBe('«Эпізод 9 — Кароль згубленых шкарпэтак»');
    expect(Object.keys(select(beCatalog))).toHaveLength(B3I_KEY_COUNT);
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'production-complete',
      runtimeSelectable: true,
    });
    expect(supportedLocales).toEqual(['ru', 'be', 'en']);
    expect('be' in appCatalogs).toBe(true);
  });
});
