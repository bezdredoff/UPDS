import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';
import { enCatalog } from '../src/localization/catalogs/en';
import { ruCatalog } from '../src/localization/catalogs/ru';

describe('ANM-019E2 Match-3 localization', () => {
  it('keeps locale catalogs in parity', () => expect(Object.keys(enCatalog).sort()).toEqual(Object.keys(ruCatalog).sort()));
  it('covers every level presentation, objective and authored bark', () => {
    for (const level of levels) {
      for (const field of ['title', 'storyAction', 'clueTitle', 'clueSummary', 'startBark.speaker', 'startBark.text', 'winBark.speaker', 'winBark.text', 'loseBark.speaker', 'loseBark.text']) {
        const key = `match3.level.${level.id}.${field}` as keyof typeof enCatalog;
        expect(enCatalog[key], key).toBeTruthy();
      }
      level.objectives.forEach((_, index) => {
        const key = `match3.level.${level.id}.objective.${index}` as keyof typeof enCatalog;
        expect(enCatalog[key], key).toBeTruthy();
      });
    }
  });
  it('does not leave Cyrillic user-facing literals in Match-3 runtime presentation', async () => {
    const fs = await import('node:fs/promises');
    for (const relative of [
      '../src/features/match3/Match3Controller.ts',
      '../src/features/match3/Match3Presentation.ts',
    ] as const) {
      const source = await fs.readFile(new URL(relative, import.meta.url), 'utf8');
      expect(source, relative).not.toMatch(/[А-Яа-яЁё]/);
    }
  });
});
