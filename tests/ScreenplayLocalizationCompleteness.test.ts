import { describe, expect, it } from 'vitest';
import { canonicalStoryLines } from '../src/content/storyRuntime';
import { enCatalog } from '../src/localization/catalogs/en';
import { ruCatalog } from '../src/localization/catalogs/ru';
import { getScene, sceneMeta } from '../src/data/narrative';

const ids = canonicalStoryLines.map((line) => line.id);
const fields = ['speaker', 'emotion', 'text'] as const;

describe('ANM-019F screenplay localization completeness', () => {
  it('localizes every authored screenplay line in both catalogs', () => {
    expect(ids.length).toBeGreaterThan(380);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      for (const field of fields) {
        const key = `vn.line.${id}.${field}` as keyof typeof enCatalog;
        expect(ruCatalog[key], `ru:${key}`).toBeTruthy();
        expect(enCatalog[key], `en:${key}`).toBeTruthy();
      }
    }
  });

  it('ships English screenplay values without Cyrillic fallback content', () => {
    for (const id of ids) {
      for (const field of fields) {
        const key = `vn.line.${id}.${field}` as keyof typeof enCatalog;
        expect(enCatalog[key], key).not.toMatch(/[А-Яа-яЁё]/);
      }
    }
  });

  it('covers every playable branch of CHOICE_00', () => {
    for (const choice of ['A', 'B', 'C'] as const) {
      const playableIds = Array.from({ length: sceneMeta.length }, (_, scene) => getScene(scene, choice)).flat().map((line) => line.id);
      expect(playableIds.length).toBeGreaterThan(0);
      for (const id of playableIds) {
        for (const field of fields) {
          const key = `vn.line.${id}.${field}` as keyof typeof enCatalog;
          expect(enCatalog[key], `${choice}:${key}`).toBeTruthy();
        }
      }
    }
  });

  it('keeps ru/en catalog parity after the full screenplay pass', () => {
    expect(Object.keys(enCatalog).sort()).toEqual(Object.keys(ruCatalog).sort());
  });
});
