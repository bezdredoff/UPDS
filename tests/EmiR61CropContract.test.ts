import { describe, expect, it } from 'vitest';
import { characterRigs } from '../src/data/characterRigs';
describe('ANM-021B R6.1 Emi crop cleanup contract', () => {
  it('keeps crop cleanup asset-only and preserves R5 staging paths', () => {
    const rig=characterRigs.emi;
    expect(Object.values(rig.frames)).toHaveLength(5);
    for (const asset of Object.values(rig.frames)) {
      expect(asset).toContain('/emi/rig/pose_a/frames/frame-');
    }
  });
});
