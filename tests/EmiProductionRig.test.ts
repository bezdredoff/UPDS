import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { characterForSpeaker, characterRigs, placeholderForSpeaker } from '../src/data/characterRigs';
import { runtimeAssetCatalog } from '../src/platform/RuntimeAssets';
import { actorForStorySpeaker, resolveVnStaging } from '../src/ui/vnStaging';

const pngSize = async (path: string): Promise<[number, number]> => {
  const bytes = new Uint8Array(await readFile(new URL(`../public/${path.replace('./assets/', 'assets/')}`, import.meta.url)));
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return [view.getUint32(16), view.getUint32(20)];
};

describe('ANM-021B Emi production rig', () => {
  it('promotes Emi to production while keeping later characters as placeholders', () => {
    expect(characterForSpeaker('ЭМИ')).toBe('emi');
    expect(placeholderForSpeaker('ЭМИ')).toBeNull();
    expect(placeholderForSpeaker('КЭНТАРО')).toBe('kentaro');
    expect(placeholderForSpeaker('НОРИХИРО')).toBe('norihiro');
    expect(placeholderForSpeaker('МАЮ')).toBe('mayu');
  });

  it('ships the complete nine-file runtime contract and catalogs every asset', () => {
    const rig = characterRigs.emi;
    const assets = [rig.base, ...Object.values(rig.faces), rig.poseB, rig.medallion];
    expect(assets).toHaveLength(9);
    for (const asset of assets) expect(runtimeAssetCatalog).toContain(asset);
  });

  it('uses production dimensions for base, faces, pose B and medallion', async () => {
    const rig = characterRigs.emi;
    expect(await pngSize(rig.base)).toEqual([1024, 1536]);
    expect(await pngSize(rig.poseB)).toEqual([1024, 1536]);
    expect(await pngSize(rig.medallion)).toEqual([256, 256]);
    for (const face of Object.values(rig.faces)) expect(await pngSize(face)).toEqual([512, 512]);
  });

  it('keeps Emi on the external interview lane after promotion', () => {
    const story = [
      { speaker: 'МИКУ' },
      { speaker: 'ЭМИ' },
      { speaker: 'ОНОЭ' },
    ];
    expect(actorForStorySpeaker('ЭМИ')).toBe('emi');
    expect(resolveVnStaging(story, 1)?.side).toBe('right');
  });
});
