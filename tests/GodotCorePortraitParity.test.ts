import { readFileSync, readdirSync } from 'node:fs';
import { expect, it } from 'vitest';
import { getScene } from '../src/data/narrative';
import { characterForSpeaker } from '../src/data/characterRigs';
import { authoredVnShotForLine } from '../src/data/authoredVnShots';
import { resolveSceneStagingPreset } from '../src/ui/sceneStaging';

it('exports the source compact camera for every core portrait, including all locker branches', () => {
  let count = 0;
  const characters = new Set<string>();
  for (const file of readdirSync('godot/data').filter(file => file.endsWith('.json'))) {
    const data = JSON.parse(readFileSync(`godot/data/${file}`, 'utf8'));
    for (const lines of [data.lines, ...Object.values(data.variants ?? {})]) {
      for (const line of (lines ?? []) as { actors?: { asset: string; compactHeight: number; character: string }[] }[]) {
        for (const actor of line.actors ?? []) {
          if (!actor.asset.startsWith('./assets/characters/')) continue;
          expect(actor.compactHeight, `${file}: ${actor.asset}`).toBe(168);
          characters.add(actor.character);
          count += 1;
        }
      }
    }
  }
  expect(count).toBe(767);
  expect(characters.size).toBe(9);
});

it('preserves the source speaking-slot lift for authored shots, including equal-depth duos', () => {
  let groups = 0;
  for (const file of readdirSync('godot/data').filter(file => file.endsWith('.json'))) {
    const data = JSON.parse(readFileSync(`godot/data/${file}`, 'utf8'));
    if (!data.sceneId) continue;
    const scene = data.sceneIndex ?? Number(data.sceneId.match(/^VN_SCENE_(\d+)/)?.[1]);
    for (const [choice, lines] of data.variants ? Object.entries(data.variants) : [['A', data.lines]]) {
      const source = getScene(scene, choice as 'A' | 'B' | 'C');
      for (const line of lines as {id: string; actors: {character: string; z: number}[]}[]) {
        const original = source.find(entry => entry.id === line.id)!;
        const shot = authoredVnShotForLine(line.id);
        if (!shot) continue;
        const speaking = characterForSpeaker(original.speaker);
        const actors = resolveSceneStagingPreset(shot.presetId, shot.actors).actors;
        expect(line.actors.map(actor => [actor.character, actor.z])).toEqual(actors.map(actor => [actor.character, actor.zIndex + (actor.character === speaking ? 1 : 0)]));
        if (actors.length > 1) groups += 1;
      }
    }
  }
  expect(groups).toBe(29);
});
