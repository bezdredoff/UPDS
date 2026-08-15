import { describe, expect, it } from 'vitest';
import { storyGraph } from '../src/data/storyGraph';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B3J_KEY_COUNT = 131;
const SLOT9_SCENES = new Set([
  'VN_SCENE_19_E9_PRE',
  'VN_SCENE_20_E9_POST',
]);
const SLOT9_CHOICE = 'protect-gen-source';

const isB3JKey = (key: string): boolean => {
  const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
  if (scene) return SLOT9_SCENES.has(scene[1]);
  const line = key.match(/^vn\.line\.VN(\d{4})\.(?:speaker|emotion|text)$/u);
  if (line) return Number(line[1]) >= 449 && Number(line[1]) <= 488;
  return key.startsWith(`vn.storyChoice.${SLOT9_CHOICE}.`);
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB3JKey(key)));

describe('ANM-029B3J Belarusian VN story slot 9', () => {
  it('covers canonical runtime slot 9 exactly', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(source)).toHaveLength(B3J_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B3J_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B3J_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks VN0449–VN0488, protect-gen-source and the VN0489 next-slot boundary', () => {
    const scene19 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_19_E9_PRE');
    const scene20 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_20_E9_POST');
    const scene21 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_21_E10_PRE');

    expect(scene19?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0449', endLineId: 'VN0469' });
    expect(scene20?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0470', endLineId: 'VN0488' });
    expect(scene21?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0489', endLineId: 'VN0508' });
    expect(beCatalog['vn.line.VN0480.text']).toBe('{CHOICE protect-gen-source}');
  });

  it('locks reviewed maintenance-key terminology, choice copy, payload and runtime-hidden status', () => {
    expect(beCatalog['vn.scene.VN_SCENE_19_E9_PRE.title']).toBe('Кароль згубленых шкарпэтак');
    expect(beCatalog['vn.scene.VN_SCENE_20_E9_POST.title']).toBe('Начныя кантэйнеры');
    expect(beCatalog['vn.line.VN0452.text']).toContain('ўніверсальны ключ');
    expect(beCatalog['vn.line.VN0465.text']).toContain('Рына');
    expect(beCatalog['vn.line.VN0467.text']).toContain('Asterion');
    expect(beCatalog['vn.line.VN0474.text']).toContain('сэрвісны прэфікс Asterion');
    expect(beCatalog['vn.storyChoice.protect-gen-source.B.effect']).toBe('Давер крыніц +1');
    expect(beCatalog['vn.line.VN0485.text']).toBe('{ADD CUE_010}');
    expect(Object.keys(select(beCatalog))).toHaveLength(B3J_KEY_COUNT);
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'translation-pending',
      runtimeSelectable: false,
    });
    expect(supportedLocales).toEqual(['ru', 'en']);
    expect('be' in appCatalogs).toBe(false);
  });
});
