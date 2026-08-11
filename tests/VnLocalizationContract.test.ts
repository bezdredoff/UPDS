import { describe, expect, it } from 'vitest';
import { choices, sceneMeta } from '../src/data/narrative';
import { enCatalog } from '../src/localization/catalogs/en';
import { ruCatalog } from '../src/localization/catalogs/ru';

describe('ANM-019C/019D VN localization contract', () => {
  it('covers every stable scene id in both locale catalogs', () => {
    for (const scene of sceneMeta) {
      for (const field of ['title', 'location'] as const) {
        const key = `vn.scene.${scene.id}.${field}`;
        expect(ruCatalog[key as keyof typeof ruCatalog], key).toBeTruthy();
        expect(enCatalog[key as keyof typeof enCatalog], key).toBeTruthy();
      }
    }
  });

  it('covers every authored choice id without changing choice state', () => {
    for (const id of Object.keys(choices) as Array<keyof typeof choices>) {
      expect(ruCatalog[`vn.choice.${id}.title` as keyof typeof ruCatalog]).toBeTruthy();
      expect(enCatalog[`vn.choice.${id}.title` as keyof typeof enCatalog]).toBeTruthy();
      expect(ruCatalog[`vn.choice.${id}.effect` as keyof typeof ruCatalog]).toBeTruthy();
      expect(enCatalog[`vn.choice.${id}.effect` as keyof typeof enCatalog]).toBeTruthy();
    }
    expect(choices.A.state).toEqual({ approach: 'verify', sourceTrust: 1, onoeTrust: 0, rumorHeat: 0 });
    expect(choices.B.state).toEqual({ approach: 'warn', sourceTrust: 0, onoeTrust: 0, rumorHeat: 1 });
    expect(choices.C.state).toEqual({ approach: 'report', sourceTrust: 0, onoeTrust: 1, rumorHeat: 0 });
  });
});


describe('ANM-019D screenplay localization', () => {
  it('ships a complete English prologue slice by stable VN IDs', () => {
    for (let n = 1; n <= 22; n += 1) {
      const id = `VN${String(n).padStart(4, '0')}`;
      expect(enCatalog[`vn.line.${id}.text` as keyof typeof enCatalog]).toBeTruthy();
      expect(enCatalog[`vn.line.${id}.speaker` as keyof typeof enCatalog]).toBeTruthy();
      expect(enCatalog[`vn.line.${id}.emotion` as keyof typeof enCatalog]).toBeTruthy();
    }
  });

  it('keeps ru/en screenplay slice key parity', () => {
    const ru = Object.keys(ruCatalog).filter((key) => key.startsWith('vn.line.'));
    const en = Object.keys(enCatalog).filter((key) => key.startsWith('vn.line.'));
    expect(en.sort()).toEqual(ru.sort());
  });
});
