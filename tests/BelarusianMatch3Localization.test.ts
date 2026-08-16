import { describe, expect, it } from 'vitest';
import {
  auditMessageCatalog,
  isCatalogStructurallyComplete,
  selectMessageCatalogByPrefixes,
} from '../src/localization/CatalogAudit';
import { beCatalog } from '../src/localization/catalogs/be';
import { match3ReactionCatalogs } from '../src/localization/catalogs/match3Reactions';
import { ruCatalog } from '../src/localization/catalogs/ru';

type Catalog = Readonly<Record<string, string>>;
type SliceSpec = {
  label: string;
  keyCount: number;
  select: (catalog: Catalog) => Catalog;
};

const deferredMatch3Prefixes = [
  'match3.level.',
  'match3.bark.blockers.',
  'match3.bark.fiveMoves.',
  'match3.bark.ingredient.',
  'match3.clue.',
  'match3.ingredient.',
] as const;

const isMatch3CoreKey = (key: string): boolean =>
  key.startsWith('match3Campaign.') ||
  (key.startsWith('match3.') && !deferredMatch3Prefixes.some((prefix) => key.startsWith(prefix)));

const ingredients0006 = new Set([
  'match3.ingredient.receipt',
  'match3.ingredient.memoryCard',
  'match3.ingredient.serviceKey',
  'match3.ingredient.damagedTowel',
  'match3.ingredient.laundryCalendar',
  'match3.ingredient.repairLog',
  'match3.ingredient.warrantyCard',
  'match3.ingredient.silverSpool',
]);

const ingredients0713 = new Set([
  'match3.ingredient.asterionSpec',
  'match3.ingredient.missingNumberSheet',
  'match3.ingredient.handoffSlip',
  'match3.ingredient.stitchedWristband',
  'match3.ingredient.transferSeal',
  'match3.ingredient.routeCard',
  'match3.ingredient.transferManifest',
  'match3.ingredient.secondSkinTag',
  'match3.ingredient.pilotList',
]);

const ingredients1421 = new Set([
  'match3.ingredient.familyReceipt',
  'match3.ingredient.atelierLedger',
  'match3.ingredient.markedPackage',
  'match3.ingredient.serviceKeyCard',
  'match3.ingredient.handheldScanner',
  'match3.ingredient.rinaCatalog',
  'match3.ingredient.recentMarkedItem',
  'match3.ingredient.returnConfirmation',
  'match3.ingredient.backupDrive',
  'match3.ingredient.finalSlide',
]);

const selectByLevelRange = (
  catalog: Catalog,
  levelStart: number,
  levelEnd: number,
  cueStart: number,
  cueEnd: number,
  ingredients: ReadonlySet<string>,
): Catalog =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => {
    const level = key.match(/^match3\.level\.M3_(\d{2})_/u);
    if (level) {
      const index = Number(level[1]);
      return index >= levelStart && index <= levelEnd;
    }

    const bark = key.match(/^match3\.bark\.(?:fiveMoves|blockers|ingredient)\.(\d+)$/u);
    if (bark) {
      const index = Number(bark[1]);
      return index >= levelStart && index <= levelEnd;
    }

    const clue = key.match(/^match3\.clue\.CUE_(\d{3})$/u);
    if (clue) {
      const index = Number(clue[1]);
      return index >= cueStart && index <= cueEnd;
    }

    return ingredients.has(key);
  }));

const sliceSpecs: readonly SliceSpec[] = [
  {
    label: 'core/campaign',
    keyCount: 83,
    select: (catalog) => Object.fromEntries(Object.entries(catalog).filter(([key]) => isMatch3CoreKey(key))),
  },
  {
    label: 'levels 00–06',
    keyCount: 123,
    select: (catalog) => selectByLevelRange(catalog, 0, 6, 1, 7, ingredients0006),
  },
  {
    label: 'levels 07–13',
    keyCount: 128,
    select: (catalog) => selectByLevelRange(catalog, 7, 13, 8, 14, ingredients0713),
  },
  {
    label: 'levels 14–21',
    keyCount: 146,
    select: (catalog) => selectByLevelRange(catalog, 14, 21, 15, 22, ingredients1421),
  },
];

const assertComplete = (source: Catalog, target: Catalog, expectedCount: number, label: string): void => {
  const audit = auditMessageCatalog(source, target);
  expect(Object.keys(source), label).toHaveLength(expectedCount);
  expect(audit.sourceKeyCount, label).toBe(expectedCount);
  expect(audit.targetKeyCount, label).toBe(expectedCount);
  expect(audit.missingKeys, label).toEqual([]);
  expect(audit.extraKeys, label).toEqual([]);
  expect(audit.emptyKeys, label).toEqual([]);
  expect(audit.placeholderMismatches, label).toEqual([]);
  expect(isCatalogStructurallyComplete(audit), label).toBe(true);
};

describe('Belarusian Match-3 localization', () => {
  it('keeps every historical Match-3 production slice structurally complete', () => {
    for (const spec of sliceSpecs) {
      assertComplete(spec.select(ruCatalog), spec.select(beCatalog), spec.keyCount, spec.label);
    }
  });

  it('keeps the core selector isolated from level narrative, evidence and per-level barks', () => {
    expect(isMatch3CoreKey('match3.level.M3_00_LOCKER_TUTORIAL.title')).toBe(false);
    expect(isMatch3CoreKey('match3.clue.CUE_001')).toBe(false);
    expect(isMatch3CoreKey('match3.ingredient.receipt')).toBe(false);
    expect(isMatch3CoreKey('match3.bark.blockers.0')).toBe(false);
  });

  it('keeps the complete 612-key Match-3 production surface structurally aligned', () => {
    const sourceMain = selectMessageCatalogByPrefixes(ruCatalog, ['match3', 'match3Campaign']);
    const targetMain = selectMessageCatalogByPrefixes(beCatalog, ['match3', 'match3Campaign']);
    const source = { ...sourceMain, ...match3ReactionCatalogs.ru };
    const target = { ...targetMain, ...match3ReactionCatalogs.be };

    assertComplete(sourceMain, targetMain, 480, 'main Match-3 catalog');
    assertComplete(match3ReactionCatalogs.ru, match3ReactionCatalogs.be, 132, 'reaction catalog');
    assertComplete(source, target, 612, 'full Match-3 surface');
  });

  it('preserves reviewed terminology, names and protected project labels', () => {
    expect(beCatalog['match3.objective']).toBe('МЭТА');
    expect(beCatalog['match3.hint']).toBe('ПАДКАЗКА');
    expect(beCatalog['match3.feedback.match']).toBe('СУПАДЗЕННЕ');
    expect(beCatalog['match3.special.evidence']).toBe('Доказ');
    expect(beCatalog['match3Campaign.title']).toBe('Дошка спраў');

    expect(beCatalog['match3.level.M3_00_LOCKER_TUTORIAL.title']).toBe('Шафка Эмі');
    expect(beCatalog['match3.level.M3_01_PHOTO_PROPS.winBark.speaker']).toBe('Міку');
    expect(beCatalog['match3.level.M3_05_BASKETBALL_LOCKERS.startBark.speaker']).toBe('Хіната');
    expect(beCatalog['match3.level.M3_02_POOL_LAUNDRY.startBark.speaker']).toBe('Норыхіра');
    expect(beCatalog['match3.clue.CUE_004']).toBe('Электраправодны шво');
    expect(beCatalog['match3.ingredient.serviceKey']).toBe('Сэрвісны ключ');

    expect(beCatalog['match3.level.M3_07_ASTERION_THREAD.title']).toBe('Узоры Asterion');
    expect(beCatalog['match3.level.M3_08_LOST_FOUND_LEDGER.startBark.speaker']).toBe('Рына');
    expect(beCatalog['match3.level.M3_10_CONTROL_SAMPLE_GEAR.startBark.speaker']).toBe('Аоі');
    expect(beCatalog['match3.level.M3_12_SECOND_SKIN_SIGNAL.title']).toBe('Сігнал Second Skin');
    expect(beCatalog['match3.level.M3_13_KENDO_PILOT_LIST.startBark.speaker']).toBe('Кубо');
    expect(beCatalog['match3.ingredient.secondSkinTag']).toBe('Мікраметка Second Skin');

    expect(beCatalog['match3.level.M3_14_KUBO_ATELIER_LEDGER.startBark.speaker']).toBe('Маці Кубо');
    expect(beCatalog['match3.level.M3_16_PINK_RIBBON_SCANNER.startBark.speaker']).toBe('Вінсент');
    expect(beCatalog['match3.level.M3_17_RINA_ARCHIVE_CATALOG.startBark.speaker']).toBe('Рына');
    expect(beCatalog['match3.level.M3_18_FULL_TIMELINE_PROOF.clueTitle']).toBe('Працяг Second Skin');
    expect(beCatalog['match3.level.M3_20_SERVER_CONSENT_LOGS.clueTitle']).toBe('Журналы згоды');
    expect(beCatalog['match3.level.M3_21_CONVENIENT_CASE.title']).toBe('Ідэальны падазраваны');
    expect(beCatalog['match3.ingredient.backupDrive']).toBe('Рэзервовы назапашвальнік');

    expect(match3ReactionCatalogs.be['match3.reaction.specialCombo.11']).toContain('Asterion');
    expect(match3ReactionCatalogs.be['match3.reaction.nearWin.18']).toContain('Second Skin');
    expect(match3ReactionCatalogs.be['match3.reaction.danger.19']).toContain('CASE CLOSED');
    expect(match3ReactionCatalogs.be['match3.reaction.specialCombo.7']).toContain('Куросэ');
    expect(match3ReactionCatalogs.be['match3.reaction.specialActivated.16']).toContain('Вінсент');
    expect(match3ReactionCatalogs.be['match3.reaction.objectiveComplete.20']).toContain('згоду');
    expect(match3ReactionCatalogs.be['match3.reaction.objectiveComplete.19']).toContain('Прыватнасць');
  });
});
