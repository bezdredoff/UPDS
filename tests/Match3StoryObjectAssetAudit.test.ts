import audit from '../src/content/art/ANM025D3.match3-story-object-asset-audit.json';
import { ingredientPresentation, levels } from '../src/data/levels';
import { describe, expect, it } from 'vitest';

describe('ANM-025D3 Match-3 story-object asset audit', () => {
  it('proves that all 27 story-object identities collapse into exactly four runtime visuals', () => {
    const entries = Object.entries(ingredientPresentation);
    expect(entries).toHaveLength(audit.totalStoryObjectIdentities);

    const byAsset = new Map<string, string[]>();
    for (const [ingredient, presentation] of entries) {
      const bucket = byAsset.get(presentation.asset) ?? [];
      bucket.push(ingredient);
      byAsset.set(presentation.asset, bucket);
    }

    expect(byAsset.size).toBe(audit.physicalRuntimeAssets);
    expect([...byAsset.keys()].sort()).toEqual(audit.shortlist.map((item) => item.asset).sort());

    for (const item of audit.shortlist) {
      expect(byAsset.get(item.asset)).toHaveLength(item.semanticFanout);
    }
  });

  it('orders the shortlist by semantic ambiguity, not arbitrary filename choice', () => {
    expect(audit.shortlist.map((item) => item.semanticFanout)).toEqual([10, 9, 6, 2]);
    expect(audit.shortlist.map((item) => item.priority)).toEqual([1, 2, 3, 4]);
  });

  it('confirms all four shortlisted visuals are actually used by production levels', () => {
    const usedAssets = new Set(
      levels.flatMap((level) => level.ingredients.map(({ kind }) => ingredientPresentation[kind].asset)),
    );

    for (const item of audit.shortlist) expect(usedAssets.has(item.asset)).toBe(true);
  });

  it('keeps this slice audit-only', () => {
    expect(audit.decision.status).toBe('measured-shortlist');
    expect(audit.decision.doNotChangeGameplay).toBe(true);
  });
});
