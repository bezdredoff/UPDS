import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  characterProductionManifest,
  productionCharacterKeys,
  type ProductionCharacterKey,
} from '../src/data/characterProduction';

const packageDigest = 'c10411a3a530490a721fc54dcf48feff07ca4b2ee0720b31d2128931487cec62';
const characterDigests: Readonly<Record<ProductionCharacterKey, string>> = {
  miku: 'a3b42f25159ce317fc62b264fd89b00bf7120e77343279128232fb9f460c79b5',
  onoe: 'a7461a43af9d0786ba95ce0d5ccfa701733f1cdb0363a4efb1a7721844b431f8',
  ayuki: '1188200ae2e4a3eeb408a7882b165a1fc8988ce331a4689a1af753d8949ed588',
  emi: '60fee8a1d523b0aefd42138d1c61240196a7f2a629a493ae53d50be9b4cf5e22',
  kentaro: 'd6db6f5f968cf889bfece2108c5075f78f3d13ab4d39180e785dd3d53346c1b0',
  norihiro: '117a1a7466486e52b65fc5e2047429ae8f481c845bc84f20f054b8f91a75b4ee',
  mayu: 'b9fabc85684997a0b5f9db4544d07ee3d0389b33e2e1299949b4708082c938cb',
  rina: '94e97a7507e7871333e9b66fff5bc13dd83e817f7c2c44cba0edec71d3ccf020',
  kurose: '415df2955da887fdef738ae62066737bfeb0c4a4c50742a70d1017a52e91da4c',
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
  it('locks every seven-asset character package to the approved source archive', () => {
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
