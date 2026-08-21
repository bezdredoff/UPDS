import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import {
  characterProductionManifest,
  productionCharacterKeys,
  runtimeExpressionOrder,
  validateCharacterProductionManifest,
} from '../src/data/characterProduction';
import { characterRigs, characterStaging } from '../src/data/characterRigs';
import { runtimeAssetCatalog } from '../src/platform/RuntimeAssets';

type AlphaBounds = Readonly<{ left: number; top: number; right: number; bottom: number }>;

const paethPredictor = (a: number, b: number, c: number): number => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
};

const pngAlphaBounds = async (asset: string): Promise<AlphaBounds> => {
  const relative = asset.replace(/^\.\/assets\//, '../public/assets/');
  const buffer = await readFile(new URL(relative, import.meta.url));
  expect(buffer.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  expect(buffer[24]).toBe(8);
  expect(buffer[25]).toBe(6);
  expect(buffer[28]).toBe(0);

  const idat: Buffer[] = [];
  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    if (type === 'IDAT') idat.push(buffer.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
    if (type === 'IEND') break;
  }

  const raw = inflateSync(Buffer.concat(idat));
  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  let rawOffset = 0;
  let previous = Buffer.alloc(stride);
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    const filter = raw[rawOffset];
    rawOffset += 1;
    const encoded = raw.subarray(rawOffset, rawOffset + stride);
    rawOffset += stride;
    const row = Buffer.alloc(stride);

    for (let x = 0; x < stride; x += 1) {
      const source = encoded[x];
      const a = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
      const b = previous[x] ?? 0;
      const c = x >= bytesPerPixel ? previous[x - bytesPerPixel] : 0;
      if (filter === 0) row[x] = source;
      else if (filter === 1) row[x] = (source + a) & 0xff;
      else if (filter === 2) row[x] = (source + b) & 0xff;
      else if (filter === 3) row[x] = (source + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) row[x] = (source + paethPredictor(a, b, c)) & 0xff;
      else throw new Error(`Unsupported PNG filter ${filter} for ${asset}`);
    }

    for (let x = 0; x < width; x += 1) {
      if (row[x * bytesPerPixel + 3] === 0) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
    previous = row;
  }

  if (right < left || bottom < top) throw new Error(`No visible alpha pixels in ${asset}`);
  return { left, top, right: right + 1, bottom: bottom + 1 };
};

const pngSize = async (asset: string): Promise<readonly [number, number]> => {
  const relative = asset.replace(/^\.\/assets\//, '../public/assets/');
  const buffer = await readFile(new URL(relative, import.meta.url));
  expect(buffer.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
};

describe('character production manifest', () => {
  it('validates the canonical precomposed production contract', () => {
    expect(validateCharacterProductionManifest()).toEqual([]);
    expect(characterProductionManifest.format).toBe('upds-character-production-v2');
    expect(characterProductionManifest.runtimeExpressions).toEqual(runtimeExpressionOrder);
    expect(characterProductionManifest.animationPolicy).toEqual({
      mode: 'precomposed-static',
      blink: 'deferred',
      speaking: 'deferred',
    });
  });

  it('derives all nine production rigs and staging entries from the manifest', () => {
    expect(Object.keys(characterRigs).sort()).toEqual([...productionCharacterKeys].sort());
    expect(Object.keys(characterStaging).sort()).toEqual([...productionCharacterKeys].sort());

    for (const key of productionCharacterKeys) {
      const definition = characterProductionManifest.characters[key];
      expect(definition.status).toBe('production');
      expect(definition.adultCharacter).toBe(true);
      expect(definition.visualApproval).toBe('approved');
      expect(characterRigs[key]).toEqual({
        displayName: definition.displayName,
        shortName: definition.shortName,
        frames: definition.assets.frames,
        poseB: definition.assets.poseB,
        medallion: definition.assets.medallion,
      });
      expect(characterStaging[key]).toEqual(definition.staging);
    }
  });

  it('ships exactly seven distinct runtime assets per production character', async () => {
    for (const key of productionCharacterKeys) {
      const definition = characterProductionManifest.characters[key];
      const frameAssets = Object.values(definition.assets.frames);
      const assets = [...frameAssets, definition.assets.poseB, definition.assets.medallion];
      expect(assets).toHaveLength(7);
      expect(new Set(assets).size).toBe(7);

      for (const asset of assets) expect(runtimeAssetCatalog).toContain(asset);
      for (const asset of [...frameAssets, definition.assets.poseB]) {
        expect(await pngSize(asset)).toEqual([1024, 1536]);
      }

      const [width, height] = await pngSize(definition.assets.medallion);
      expect(width).toBe(height);
      expect(characterProductionManifest.medallion.acceptedSourceSizes).toContain(width as 256 | 512);
    }
  });

  it('keeps runtime geometry synchronized with the selected expression PNGs', async () => {
    for (const key of productionCharacterKeys) {
      const definition = characterProductionManifest.characters[key];
      expect(definition.staging).toEqual({ scale: 1, yPercent: 0 });

      const neutralBounds = await pngAlphaBounds(definition.assets.frames.neutral);
      expect(neutralBounds).toEqual(definition.proportion.neutralAlphaBounds);
      expect(neutralBounds.bottom - neutralBounds.top).toBe(definition.proportion.visualHeightPx);

      for (const expression of runtimeExpressionOrder) {
        const geometry = definition.proportion.frameGeometry[expression];
        const bounds = await pngAlphaBounds(definition.assets.frames[expression]);
        expect(bounds).toEqual(geometry.alphaBounds);
        expect(geometry.eyeLineYPx).toBe(definition.proportion.neutralEyeLineYPx);
        expect(Math.abs((bounds.bottom - bounds.top) - definition.proportion.visualHeightPx))
          .toBeLessThanOrEqual(characterProductionManifest.proportionContract.expressionHeightTolerancePx);
      }
    }
  }, 15_000);
});
