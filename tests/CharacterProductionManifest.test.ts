import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import {
  characterProductionManifest,
  plannedCharacterKeys,
  productionCharacterKeys,
  runtimeExpressionOrder,
  validateCharacterProductionManifest,
} from '../src/data/characterProduction';
import { characterRigs, characterStaging, placeholderCharacters } from '../src/data/characterRigs';
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
  const bitDepth = buffer[24];
  const colorType = buffer[25];
  const interlace = buffer[28];
  expect(bitDepth).toBe(8);
  expect(colorType).toBe(6);
  expect(interlace).toBe(0);

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

describe('ANM-028A character production manifest', () => {
  it('validates the canonical v2 contract and keeps the runtime expression set precomposed-only', () => {
    expect(validateCharacterProductionManifest()).toEqual([]);
    expect(characterProductionManifest.format).toBe('upds-character-production-v2');
    expect(characterProductionManifest.runtimeExpressions).toEqual(runtimeExpressionOrder);
    expect(characterProductionManifest.runtimeExpressions).not.toContain('blink');
    expect(characterProductionManifest.runtimeExpressions).not.toContain('speaking');
    expect(characterProductionManifest.animationPolicy).toEqual({
      mode: 'precomposed-static',
      blink: 'deferred',
      speaking: 'deferred',
    });
  });

  it('derives production runtime rigs and staging from the manifest', () => {
    expect(Object.keys(characterRigs).sort()).toEqual([...productionCharacterKeys].sort());
    expect(Object.keys(characterStaging).sort()).toEqual([...productionCharacterKeys].sort());

    for (const key of productionCharacterKeys) {
      const definition = characterProductionManifest.characters[key];
      expect(definition.status).toBe('production');
      expect(definition.adultCharacter).toBe(true);
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

  it('keeps planned characters asset-free and represented by placeholders', () => {
    expect(Object.keys(placeholderCharacters).sort()).toEqual([...plannedCharacterKeys].sort());
    for (const key of plannedCharacterKeys) {
      const definition = characterProductionManifest.characters[key];
      expect(definition.status).toBe('planned');
      expect(definition.adultCharacter).toBe(true);
      expect(definition.age).toBeGreaterThanOrEqual(18);
      expect('assets' in definition).toBe(false);
      expect(placeholderCharacters[key]).toEqual({
        displayName: definition.shortName,
        initials: definition.placeholder.initials,
        accent: definition.placeholder.accent,
      });
    }
  });

  it('ships exactly seven valid production assets with production dimensions', async () => {
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


  it('locks integrated master geometry and records visual approval separately from runtime availability', async () => {
    expect(characterProductionManifest.proportionContract).toEqual({
      measurement: 'neutral-alpha-bounds',
      referenceCharacter: 'onoe',
      encodeHeightInMasterCanvas: true,
      productionScaleDefault: 1,
      expressionHeightTolerancePx: 1,
      newCharacterApproval: 'lineup-required-before-production',
    });

    const reference = characterProductionManifest.characters.onoe.proportion.visualHeightPx;
    const expectedHeight = {
      miku: 1375,
      onoe: 1484,
      ayuki: 1462,
      emi: 1444,
    } as const;
    const expectedEyeLine = { miku: 196, onoe: 158, ayuki: 242, emi: 397 } as const;

    for (const key of productionCharacterKeys) {
      const definition = characterProductionManifest.characters[key];
      expect(definition.staging.scale).toBe(1);
      expect(definition.proportion.visualHeightPx).toBe(expectedHeight[key]);
      expect(definition.proportion.neutralEyeLineYPx).toBe(expectedEyeLine[key]);

      const neutralBounds = await pngAlphaBounds(definition.assets.frames.neutral);
      expect(neutralBounds).toEqual(definition.proportion.neutralAlphaBounds);
      expect(neutralBounds.bottom - neutralBounds.top).toBe(definition.proportion.visualHeightPx);

      for (const expression of runtimeExpressionOrder) {
        const asset = definition.assets.frames[expression];
        const bounds = await pngAlphaBounds(asset);
        const height = bounds.bottom - bounds.top;
        expect(bounds).toEqual(definition.proportion.frameGeometry[expression].alphaBounds);
        expect(definition.proportion.frameGeometry[expression].eyeLineYPx).toBe(expectedEyeLine[key]);
        expect(Math.abs(height - definition.proportion.visualHeightPx))
          .toBeLessThanOrEqual(characterProductionManifest.proportionContract.expressionHeightTolerancePx);
      }
    }

    expect(characterProductionManifest.characters.miku.proportion.visualHeightPx / reference).toBeCloseTo(0.9265, 3);
    expect(characterProductionManifest.characters.ayuki.proportion.visualHeightPx / reference).toBeCloseTo(0.9852, 3);
    expect(characterProductionManifest.characters.emi.proportion.visualHeightPx / reference).toBeCloseTo(0.9730, 3);
    expect(characterProductionManifest.characters.miku.visualApproval).toBe('approved');
    expect(characterProductionManifest.characters.onoe.visualApproval).toBe('approved');
    expect(characterProductionManifest.characters.ayuki.visualApproval).toBe('approved');
    expect(characterProductionManifest.characters.emi.visualApproval).toBe('rebuild-required');

    for (const key of plannedCharacterKeys) {
      expect(characterProductionManifest.characters[key].proportionApproval).toBe('required-before-production');
    }
  });

  it('keeps the documentation mirror aligned with production/planned status and v2 runtime counts', async () => {
    const path = fileURLToPath(new URL('../docs/art/CHARACTER_USAGE_MANIFEST.json', import.meta.url));
    const mirror = JSON.parse(await readFile(path, 'utf8')) as {
      sourceOfTruth: string;
      productionCharacters: string[];
      plannedCharacters: string[];
      characters: Record<string, { visualApproval?: string; neutralEyeLineYPx?: number }>;
      runtimeContract: {
        runtimeExpressions: string[];
        requiredRuntimeAssetsPerProductionCharacter: number;
        sceneGuideGeometry: string;
      };
      proportionContract: {
        referenceCharacter: string;
        integratedVisualHeightPx: Record<string, number>;
        neutralEyeLineYPx: Record<string, number>;
        newCharacterApproval: string;
      };
    };

    expect(mirror.sourceOfTruth).toBe('src/data/characterProduction.ts');
    expect(mirror.productionCharacters).toEqual(productionCharacterKeys);
    expect(mirror.plannedCharacters).toEqual(plannedCharacterKeys);
    expect(mirror.runtimeContract.runtimeExpressions).toEqual(runtimeExpressionOrder);
    expect(mirror.runtimeContract.requiredRuntimeAssetsPerProductionCharacter).toBe(7);
    expect(mirror.runtimeContract.sceneGuideGeometry).toBe('selected-expression-alpha-bounds-and-eye-line');
    expect(mirror.proportionContract.referenceCharacter).toBe('onoe');
    expect(mirror.proportionContract.integratedVisualHeightPx).toEqual({
      miku: 1375,
      onoe: 1484,
      ayuki: 1462,
      emi: 1444,
    });
    expect(mirror.proportionContract.neutralEyeLineYPx).toEqual({ miku: 196, onoe: 158, ayuki: 242, emi: 397 });
    expect(mirror.characters.emi.visualApproval).toBe('rebuild-required');
    expect(mirror.proportionContract.newCharacterApproval).toBe('lineup-required-before-production');
  });

  it('does not let active runtime code reintroduce face-overlay asset references', async () => {
    const rigSource = await readFile(new URL('../src/data/characterRigs.ts', import.meta.url), 'utf8');
    const runtimeSource = await readFile(new URL('../src/platform/RuntimeAssets.ts', import.meta.url), 'utf8');
    const vnSource = await readFile(new URL('../src/features/vn/VnController.ts', import.meta.url), 'utf8');
    const activeSource = `${rigSource}\n${runtimeSource}\n${vnSource}`;

    expect(activeSource).not.toContain('face-speaking');
    expect(activeSource).not.toContain('face-blink');
    expect(activeSource).not.toContain('portrait-face');
    expect(activeSource).not.toContain('faces.speaking');
    expect(activeSource).not.toContain('faces.blink');
  });
});
