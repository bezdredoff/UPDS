import { describe, expect, it } from 'vitest';
import { characterForSpeaker, characterRigs, characterStaging, placeholderForSpeaker } from '../src/data/characterRigs';
import { characterProductionManifest } from '../src/data/characterProduction';
import { runtimeAssetCatalog } from '../src/platform/RuntimeAssets';
describe('ANM-021B R6 Emi production integration', () => {
  it('keeps Emi runtime-integrated on the approved replacement rig', () => {
    expect(characterForSpeaker('ЭМИ')).toBe('emi');
    expect(placeholderForSpeaker('ЭМИ')).toBeNull();
    expect(characterStaging.emi).toEqual({ scale: 1, yPercent: 0 });
    expect(characterProductionManifest.characters.emi.visualApproval).toBe('approved');
  });
  it('ships the R4/R5 asset contract', () => {
    const rig=characterRigs.emi;
    expect(Object.values(rig.frames)).toHaveLength(5);
    for (const asset of [...Object.values(rig.frames),rig.poseB,rig.medallion]) expect(runtimeAssetCatalog).toContain(asset);
  });
});
