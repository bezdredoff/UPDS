import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { characterRigs } from '../src/data/characterRigs';

const production = ['miku', 'onoe', 'ayuki', 'emi'] as const;

const png = async (asset: string): Promise<Uint8Array> =>
  new Uint8Array(await readFile(new URL(`../public/${asset.replace('./assets/', 'assets/')}`, import.meta.url)));

describe('ANM-021B R3 face rig quality contract', () => {
  it('keeps every authored emotional expression on a distinct asset', () => {
    for (const key of production) {
      const faces = characterRigs[key].faces;
      expect(new Set([faces.smile, faces.serious, faces.surprised, faces.embarrassed]).size).toBe(4);
    }
  });

  it('keeps animation patches separate from authored emotion assets', () => {
    for (const key of production) {
      const faces = characterRigs[key].faces;
      expect(faces.speaking).not.toBe(faces.smile);
      expect(faces.speaking).not.toBe(faces.serious);
      expect(faces.speaking).not.toBe(faces.surprised);
      expect(faces.speaking).not.toBe(faces.embarrassed);
      expect(faces.blink).not.toBe(faces.speaking);
    }
  });

  it('ships non-empty animation patch PNGs for every production character', async () => {
    for (const key of production) {
      const rig = characterRigs[key];
      expect((await png(rig.faces.speaking)).byteLength).toBeGreaterThan(1000);
      expect((await png(rig.faces.blink)).byteLength).toBeGreaterThan(1000);
    }
  });

  it('renders authored and animation faces as separate VN layers', async () => {
    const source = await readFile(new URL('../src/features/vn/VnController.ts', import.meta.url), 'utf8');
    expect(source).toContain('portrait-expression');
    expect(source).toContain('portrait-animation');
    expect(source).toContain("if (baseExpression !== 'neutral')");
    expect(source).not.toContain("setFace(speaking ? 'speaking' : baseExpression)");
  });
});
