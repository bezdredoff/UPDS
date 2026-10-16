import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';
import { match3TutorialConceptIds } from '../src/data/match3Tutorials';
import { godotCampaignBundle, godotMatch3Level } from './fixtures/godotMatch3';

const root = resolve(process.cwd());
const readJson = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));

describe('Godot first Match-3 level source parity', () => {
  it('exports the canonical first campaign level and its three locale strings', () => {
    const exported = readJson('godot/data/locker_match3.json');
    expect(exported).toEqual(godotMatch3Level());
    expect(exported.id).toBe('M3_00_LOCKER_TUTORIAL');
    expect(exported.rows).toBe(9);
    expect(exported.columns).toBe(7);
    expect(exported.moves).toBe(24);
    expect(exported.objectiveTile).toBe('pantiesSportWhite');
    expect(exported.target).toBe(12);
    expect(exported.seededOpeningBoard).toHaveLength(exported.rows * exported.columns);
    expect(exported.seededOpeningBoard).toEqual(godotMatch3Level().seededOpeningBoard);
    expect(Object.keys(exported.localized).sort()).toEqual(['be', 'en', 'ru']);
  });

  it('exports every Match-3 tutorial concept and its complete RU/BE/EN copy', () => {
    const bundle = godotCampaignBundle();
    expect(bundle.levels.map((level) => level.tutorialConcepts)).toEqual(levels.map((level) => level.tutorialConcepts));
    for (const locale of ['ru', 'be', 'en'] as const) {
      expect(bundle.tutorials[locale].try).toBeTruthy();
      for (const concept of match3TutorialConceptIds) {
        expect(bundle.tutorials[locale].concepts[concept].title, `${locale}/${concept} title`).toBeTruthy();
        expect(bundle.tutorials[locale].concepts[concept].body, `${locale}/${concept} body`).toBeTruthy();
      }
    }
  });

  it('exports the full localized Match-3 help guide and matching art references', () => {
    const bundle = godotCampaignBundle();
    for (const locale of ['ru', 'be', 'en'] as const) {
      const help = bundle.helpLocalized[locale];
      expect(help.label, `${locale} help label`).toBeTruthy();
      expect(help.title, `${locale} help title`).toBeTruthy();
      expect(help.intro, `${locale} help intro`).toBeTruthy();
      expect(help.blockers.package.body, `${locale} package guidance`).toBeTruthy();
      expect(help.blockers.foam.body, `${locale} foam guidance`).toBeTruthy();
      expect(help.blockers['lock-chain'].body, `${locale} lock-chain guidance`).toBeTruthy();
      expect(Object.keys(help.specials)).toEqual(['flash-row', 'flash-column', 'evidence', 'lead', 'insight']);
      for (const special of Object.values(help.specials)) {
        expect(special.title).toBeTruthy();
        expect(special.body).toBeTruthy();
      }
      expect(help.topics).toHaveLength(7);
      expect(help.topics.every((topic) => topic.title && topic.body)).toBe(true);
    }
    expect(bundle.assets.specials['flash-row']).toBeTruthy();
    expect(bundle.assets.lockedBlockers['2']).toBeTruthy();
  });

  it('copies each approved tile image byte for byte from the web source', () => {
    const level = godotMatch3Level();
    for (const asset of Object.values(level.assets)) {
      const source = readFileSync(resolve(root, 'public', asset.replace(/^\.\//, '')));
      const ported = readFileSync(resolve(root, 'godot', asset.replace(/^\.\//, '')));
      expect(ported.equals(source), `${asset} changed during export`).toBe(true);
    }
    const evidence = level.evidence;
    const evidenceSource = readFileSync(resolve(root, 'public', evidence.asset.replace(/^\.\//, '')));
    const evidencePort = readFileSync(resolve(root, 'godot', evidence.asset.replace(/^\.\//, '')));
    expect(evidencePort.equals(evidenceSource)).toBe(true);
  });

  it('copies every campaign evidence image required by the Godot win card', () => {
    const bundle = JSON.parse(readFileSync(resolve(root, 'godot/data/campaign_match3_levels.json'), 'utf8'));
    const assets = new Set<string>(bundle.levels.map((entry: { evidence: { asset: string } }) => entry.evidence.asset));
    expect(assets.size).toBeGreaterThan(1);
    for (const asset of assets) {
      const source = readFileSync(resolve(root, 'public', asset.replace(/^\.\//, '')));
      const ported = readFileSync(resolve(root, 'godot', asset.replace(/^\.\//, '')));
      expect(ported.equals(source), `${asset} changed during export`).toBe(true);
    }
  });
});
