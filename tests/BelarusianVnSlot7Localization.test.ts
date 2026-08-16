import { describe, expect, it } from 'vitest';
import { storyGraph } from '../src/data/storyGraph';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B3H_KEY_COUNT = 124;
const SLOT7_SCENES = new Set([
  'VN_SCENE_15_E7_PRE',
  'VN_SCENE_16_E7_POST',
]);

const isB3HKey = (key: string): boolean => {
  const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
  if (scene) return SLOT7_SCENES.has(scene[1]);
  const line = key.match(/^vn\.line\.VN(\d{4})\.(?:speaker|emotion|text)$/u);
  if (line) return Number(line[1]) >= 370 && Number(line[1]) <= 409;
  return false;
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB3HKey(key)));

describe('ANM-029B3H Belarusian VN story slot 7', () => {
  it('covers canonical runtime slot 7 exactly', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(source)).toHaveLength(B3H_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B3H_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B3H_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks VN0370–VN0409 and the VN0410 next-slot boundary', () => {
    const scene15 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_15_E7_PRE');
    const scene16 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_16_E7_POST');
    const scene17 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_17_E8_PRE');

    expect(scene15?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0370', endLineId: 'VN0390' });
    expect(scene16?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0391', endLineId: 'VN0409' });
    expect(scene17?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0410', endLineId: 'VN0429' });
  });

  it('locks reviewed Asterion evidence terminology, payload and runtime-enabled status', () => {
    expect(beCatalog['vn.scene.VN_SCENE_15_E7_PRE.title']).toBe('Чалавек, у якога ёсць тлумачэнне');
    expect(beCatalog['vn.line.VN0370.text']).toContain('серабрыстай ніткі');
    expect(beCatalog['vn.line.VN0376.text']).toContain('Asterion');
    expect(beCatalog['vn.line.VN0385.text']).toContain('сэрвісная строчка');
    expect(beCatalog['vn.line.VN0394.text']).toContain('асабістую бялізну');
    expect(beCatalog['vn.line.VN0401.text']).toBe('{ADD CUE_008}');
    expect(beCatalog['vn.line.VN0406.text']).toContain('цэнтральнай пральні');
    expect(beCatalog['vn.line.VN0409.text']).toBe('«Эпізод 8 — Восемдзесят сем пакетаў»');
    expect(Object.keys(select(beCatalog))).toHaveLength(B3H_KEY_COUNT);
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'production-complete',
      runtimeSelectable: true,
    });
    expect(supportedLocales).toEqual(['ru', 'be', 'en']);
    expect('be' in appCatalogs).toBe(true);
  });
});
