import { describe, expect, it } from 'vitest';
import { choices, sceneMeta } from '../src/data/narrative';
import { enCatalog } from '../src/localization/catalogs/en';
import { ruCatalog } from '../src/localization/catalogs/ru';

describe('ANM-019C VN localization contract', () => {
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
