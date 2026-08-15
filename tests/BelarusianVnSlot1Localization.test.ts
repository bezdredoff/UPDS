import { describe, expect, it } from 'vitest';
import { storyGraph } from '../src/data/storyGraph';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B3B_KEY_COUNT = 178;
const SLOT1_SCENES = new Set([
  'VN_SCENE_03_E1_PRE',
  'VN_SCENE_04_E1_POST',
]);

const isB3BKey = (key: string): boolean => {
  const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
  if (scene) return SLOT1_SCENES.has(scene[1]);
  const line = key.match(/^vn\.line\.VN(\d{4})\.(?:speaker|emotion|text)$/u);
  return Boolean(line && Number(line[1]) >= 85 && Number(line[1]) <= 142);
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB3BKey(key)));

describe('ANM-029B3B Belarusian VN story slot 1', () => {
  it('covers the canonical runtime graph boundary VN0085–VN0142 and scenes 03–04 exactly', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(source)).toHaveLength(B3B_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B3B_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B3B_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('tracks the existing storyGraph ranges instead of screenplay-heading inference', () => {
    const scene03 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_03_E1_PRE');
    const scene04 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_04_E1_POST');
    const scene05 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_05_E2_PRE');

    expect(scene03?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0085', endLineId: 'VN0113' });
    expect(scene04?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0114', endLineId: 'VN0142' });
    expect(scene05?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0143', endLineId: 'VN0166' });
  });

  it('locks reviewed terminology, technical payloads and runtime-hidden status', () => {
    expect(beCatalog['vn.scene.VN_SCENE_03_E1_PRE.title']).toBe('Пакой, які ўсё тлумачыць занадта дрэнна');
    expect(beCatalog['vn.line.VN0093.text']).toContain('Кэнтаро');
    expect(beCatalog['vn.line.VN0101.text']).toContain('эмодзі трусікаў');
    expect(beCatalog['vn.line.VN0111.text']).toContain('часавая лінія');
    expect(beCatalog['vn.line.VN0123.text']).toContain('87 да 12 працэнтаў');
    expect(beCatalog['vn.line.VN0136.text']).toBe('{ADD CUE_002_SERVICE_CART; SET SUS_KENTARO=cleared}');
    expect(beCatalog['vn.line.VN0141.text']).toBe('«Эпізод 2 — Мокрыя паказанні»');
    expect(beCatalog['vn.line.VN0142.text']).toContain('Пустая распранальня');
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'translation-pending',
      runtimeSelectable: false,
    });
    expect(supportedLocales).toEqual(['ru', 'en']);
    expect('be' in appCatalogs).toBe(false);
  });
});
