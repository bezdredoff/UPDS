import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { godotPrologue, godotVnAudio } from './fixtures/godotPrologue';

describe('Godot prologue source parity', () => {
  const source = godotPrologue();
  it('keeps canonical lines, locales and authored staging aligned with the web runtime', () => {
    expect(JSON.parse(readFileSync('godot/data/prologue.json', 'utf8'))).toEqual(source);
  });
  it('ships byte-identical approved art and the original VN music/cue definitions', () => {
    const assets = new Set([source.background, ...source.lines.flatMap((line) => line.actors.map((actor) => actor.asset))]);
    for (const asset of assets) expect(readFileSync(`godot/${asset}`).equals(readFileSync(`public/${asset}`))).toBe(true);
    const audio = JSON.parse(readFileSync('godot/data/menu_audio.json', 'utf8'));
    expect({ vn: audio.vn, vnAdvance: audio.vnAdvance }).toEqual(godotVnAudio());
  });
});
