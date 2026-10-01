import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  characterProductionManifest,
  productionCharacterKeys,
  type ProductionCharacterKey,
} from '../src/data/characterProduction';

// Original archive plus Mayu v7, Emi eye correction, Miku alpha and face repairs.
// Provenance: docs/reviews/MAYU_V7_INTEGRATION_2026-10-01.md
// docs/reviews/EMI_EYE_FIX_2026-10-01.md, MIKU_ALPHA_CLEANUP_2026-10-01.md
// and docs/reviews/FACE_REPAIR_BATCH_2026-10-01.md.
const packageDigest = '121a522c5f47f81e5ad83b28da0f011a8f5d258412c2efd0fcb3cec89b46cf93';
const characterDigests: Readonly<Record<ProductionCharacterKey, string>> = {
  miku: '1f708261c9aebce1e38f2f689c3e0381ef2c7cae2ebb188833cb71d1f8f0c5c7',
  onoe: '35e73985aabd098b4de64ec292abcf1a93f6305135b71b7d37bf885950c5095e',
  ayuki: '1188200ae2e4a3eeb408a7882b165a1fc8988ce331a4689a1af753d8949ed588',
  emi: '7db7b0728d619aa62d17b2d82000801446cb4c942a049ca2e77c73b7d5d5bca7',
  kentaro: 'd6db6f5f968cf889bfece2108c5075f78f3d13ab4d39180e785dd3d53346c1b0',
  norihiro: '117a1a7466486e52b65fc5e2047429ae8f481c845bc84f20f054b8f91a75b4ee',
  mayu: '889eee1d848c4cd3d97cba6d9e905cc0e02e92e9de514400fbb7de136da76122',
  rina: 'b1cbfe0bda9e6de15846bdcad0dc0938077dfd2dcd846ac526ab1f9722d05508',
  kurose: '50dd639a033e91b639139d6143b9d34ba87feaf7fad1d786814fafc49622bb77',
};

const repositoryPath = (asset: string): string => asset.replace(/^\.\/assets\//, 'public/assets/');

const assetsFor = (key: ProductionCharacterKey): readonly string[] => {
  const assets = characterProductionManifest.characters[key].assets;
  return [...Object.values(assets.frames), assets.poseB, assets.medallion].map(repositoryPath);
};

const sha256 = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex');

const digestAssets = (paths: readonly string[]): string => sha256(
  [...paths]
    .sort()
    .map((path) => `${path}\0${sha256(readFileSync(resolve(process.cwd(), path)))}\n`)
    .join(''),
);

describe('ANM-030B0C complete character archive adoption', () => {
  it('locks every seven-asset character package to its adopted source baseline', () => {
    for (const key of productionCharacterKeys) {
      const paths = assetsFor(key);
      expect(paths, key).toHaveLength(7);
      expect(digestAssets(paths), key).toBe(characterDigests[key]);
    }
  });

  it('locks all 63 runtime character assets as one reproducible package', () => {
    const paths = productionCharacterKeys.flatMap(assetsFor);
    expect(paths).toHaveLength(63);
    expect(new Set(paths).size).toBe(63);
    expect(digestAssets(paths)).toBe(packageDigest);
  });
});
