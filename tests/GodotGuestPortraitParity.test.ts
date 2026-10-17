import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getScene, isDirection, sceneMeta } from '../src/data/narrative';
import { characterForSpeaker } from '../src/data/characterRigs';
import { authoredVnShotForLine } from '../src/data/authoredVnShots';
import { guestWitnessKeys, guestWitnessManifest, guestWitnessForSpeaker, guestWitnessAssetForDirection } from '../src/data/guestWitnesses';

describe('Godot production guest portraits', () => {
  it('retains every runtime guest line, expression route and static right-lane camera', () => {
    const exported = new Map(readdirSync('godot/data').filter(file => file.endsWith('.json')).map(file => {
      const data = JSON.parse(readFileSync(`godot/data/${file}`, 'utf8'));
      return [data.sceneId, data];
    }));
    const seen = new Set<string>();
    let lines = 0;
    for (const [sceneIndex, scene] of sceneMeta.entries()) for (const line of getScene(sceneIndex)) {
      if (isDirection(line) || authoredVnShotForLine(line.id) || characterForSpeaker(line.speaker)) continue;
      const guest = guestWitnessForSpeaker(line.speaker);
      if (!guest) continue;
      const native = exported.get(scene.id).lines.find((entry: { id: string }) => entry.id === line.id);
      expect(native.actors).toEqual([{ character: guest, asset: guestWitnessAssetForDirection(guest, line.emotion),
        x: 71, top: 0, height: 178, compactHeight: 168, scale: 1, y: 0, z: 2, idle: false }]);
      seen.add(guest);
      lines += 1;
    }
    expect([...seen].sort()).toEqual([...guestWitnessKeys].sort());
    expect(lines).toBe(71);
  });

  it.each(guestWitnessKeys)('copies all three approved %s stage PNGs byte-for-byte with mipmaps', (guest) => {
    const assets = guestWitnessManifest.guests[guest].assets!;
    for (const asset of [assets.bustMaster, ...assets.expressions.map(entry => entry.asset)]) {
      expect(readFileSync(`godot/${asset}`).equals(readFileSync(`public/${asset}`))).toBe(true);
      expect(readFileSync(`godot/${asset}.import`, 'utf8')).toContain('mipmaps/generate=true');
    }
  });
});
