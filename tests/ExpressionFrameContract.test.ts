import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { characterRigs, characterForSpeaker, placeholderForSpeaker } from '../src/data/characterRigs';
import { runtimeAssetCatalog } from '../src/platform/RuntimeAssets';

const production = ['miku', 'onoe', 'ayuki'] as const;

describe('ANM-021B R4 expression frame contract', () => {
  it('uses five precomposed expression frames per production character', () => {
    for (const key of production) {
      const frames = characterRigs[key].frames;
      expect(Object.keys(frames).sort()).toEqual(['embarrassed','neutral','serious','smile','surprised'].sort());
      expect(new Set(Object.values(frames)).size).toBe(5);
      for (const asset of Object.values(frames)) expect(runtimeAssetCatalog).toContain(asset);
    }
  });

  it('keeps rejected Emi on placeholder until a new master is approved', () => {
    expect(characterForSpeaker('ЭМИ')).toBeNull();
    expect(placeholderForSpeaker('ЭМИ')).toBe('emi');
  });

  it('renders one expression image and no face overlay animation', async () => {
    const source = await readFile(new URL('../src/features/vn/VnController.ts', import.meta.url), 'utf8');
    expect(source).toContain('portrait-frame');
    expect(source).not.toContain('portrait-face');
    expect(source).not.toContain('animatePortrait(');
    expect(source).not.toContain("faces.speaking");
    expect(source).not.toContain("faces.blink");
  });
});
