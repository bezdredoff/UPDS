import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { godotMatch3ParityScenarios, godotMatch3SpecialActionScenario } from './fixtures/godotMatch3Parity';

describe('Godot Match-3 gameplay parity fixtures', () => {
  it('commits deterministic TypeScript-oracle cases for objectives, specials, hints and board topology', () => {
    const committed = JSON.parse(readFileSync(resolve(process.cwd(), 'godot/tests/fixtures/match3_parity_cases.json'), 'utf8'));
    const generated = [...godotMatch3ParityScenarios(), godotMatch3SpecialActionScenario()];
    expect(committed).toEqual(generated);
    expect(committed.map(({ name }: { name: string }) => name)).toEqual([
      'collect-objective',
      'layered-blocker',
      'ingredient-drop',
      'group-drop-objective',
      'board-hole-topology',
      'overlay-blocker',
      'special-activation',
    ]);
  });
});
