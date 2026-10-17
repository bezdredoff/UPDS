import { readFileSync, readdirSync } from 'node:fs';
import { expect, it } from 'vitest';

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
