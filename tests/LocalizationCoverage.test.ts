import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';
import { enCatalog } from '../src/localization/catalogs/en';
import { ruCatalog } from '../src/localization/catalogs/ru';

const keySets = () => [Object.keys(ruCatalog).sort(), Object.keys(enCatalog).sort()] as const;

describe('ANM-019E1 localization coverage', () => {
  it('keeps ru/en catalog parity', () => {
    const [ru, en] = keySets();
    expect(en).toEqual(ru);
  });

  it('covers dossier clue presentation for every stable level id', () => {
    for (const level of levels) {
      for (const field of ['clueTitle', 'clueSummary'] as const) {
        const key = `match3.level.${level.id}.${field}`;
        expect(ruCatalog[key as keyof typeof ruCatalog], key).toBeTruthy();
        expect(enCatalog[key as keyof typeof enCatalog], key).toBeTruthy();
      }
    }
  });

  it('ships localized dossier and ending surfaces', () => {
    for (const key of ['dossier.heading', 'dossier.reset', 'ending.heading', 'ending.replay'] as const) {
      expect(ruCatalog[key]).toBeTruthy();
      expect(enCatalog[key]).toBeTruthy();
      expect(enCatalog[key]).not.toBe(ruCatalog[key]);
    }
  });
});
