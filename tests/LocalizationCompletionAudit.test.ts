import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { enCatalog } from '../src/localization/catalogs/en';
import { ruCatalog } from '../src/localization/catalogs/ru';
import { getScene, sceneMeta } from '../src/data/narrative';

const runtimeSurfaces = [
  '../src/features/menu/MainMenuController.ts',
  '../src/features/settings/SettingsController.ts',
  '../src/features/match3/Match3Controller.ts',
  '../src/features/match3/Match3Presentation.ts',
  '../src/features/dossier/DossierController.ts',
  '../src/features/ending/EndingController.ts',
  '../src/features/sceneStudio/SceneStudioController.ts',
] as const;

describe('ANM-020 localization completion audit', () => {
  it('keeps ru/en catalogs exactly in parity', () => {
    expect(Object.keys(enCatalog).sort()).toEqual(Object.keys(ruCatalog).sort());
  });

  it('has localized speaker, emotion and text for every authored screenplay line in every choice branch', () => {
    const ids = new Set<string>();
    for (const choice of ['A', 'B', 'C'] as const) {
      for (let scene = 0; scene < sceneMeta.length; scene += 1) {
        for (const line of getScene(scene, choice)) ids.add(line.id);
      }
    }

    for (const id of ids) {
      for (const field of ['speaker', 'emotion', 'text'] as const) {
        const key = `vn.line.${id}.${field}` as keyof typeof enCatalog;
        expect(enCatalog[key], key).toBeTruthy();
        expect(ruCatalog[key], key).toBeTruthy();
      }
    }
  });

  it('does not allow Cyrillic user-facing literals back into localized runtime controllers', async () => {
    for (const relative of runtimeSurfaces) {
      const source = await readFile(new URL(relative, import.meta.url), 'utf8');
      const strippedComments = source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
      expect(strippedComments, relative).not.toMatch(/[А-Яа-яЁё]/);
    }
  });
});
