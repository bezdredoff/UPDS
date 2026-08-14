import { describe, expect, it } from 'vitest';
import batchManifestJson from '../src/content/story/ANM027G.episodes-19-21.story.json';
import macroJson from '../src/content/story/ANM027F.full-story-macro.json';
import { authoredVnShotManifest } from '../src/data/authoredVnShots';
import { levels } from '../src/data/levels';
import { backgroundAssets } from '../src/data/narrative';
import { storyGraph, storyTransitionForLegacyScene } from '../src/data/storyGraph';
import { fullTruthRequirement, meetsFullTruthRequirement, storyOutcomeMetrics } from '../src/data/storyOutcome';
import { SAVE_SCHEMA_VERSION } from '../src/engine/CampaignStore';
import type { StoryContentManifest } from '../src/content/storyContentFormat';

const manifest = batchManifestJson as StoryContentManifest;
const macro = macroJson as { allowedMatch3Mechanics: readonly string[]; slots: readonly { slot: number; contentStatus: string; match3: { status: string; objectiveKinds: readonly string[] }; assetTriggers: { newMechanic: string | null; heroClueCloseups: readonly string[] } }[] };
const batchLevelIds = ['M3_19_PRIVATE_RETURN', 'M3_20_SERVER_CONSENT_LOGS', 'M3_21_CONVENIENT_CASE'] as const;

describe('ANM-027G episodes 19–21 canonical ending batch', () => {
  it('owns one contiguous 119-line source and six final graph scenes', () => {
    expect(manifest.sourceId).toBe('ANM027G_EPISODES_19_21');
    expect(manifest.expectedBaseRange).toEqual({ startLineId: 'VN0846', endLineId: 'VN0964' });
    expect(manifest.sceneIds).toEqual([
      'VN_SCENE_39_E19_PRE', 'VN_SCENE_40_E19_POST',
      'VN_SCENE_41_E20_PRE', 'VN_SCENE_42_E20_POST',
      'VN_SCENE_43_E21_PRE', 'VN_SCENE_44_E21_POST',
    ]);
    expect(manifest.deferredLineIds).toEqual([]);
    expect(authoredVnShotManifest.shots.map((shot) => shot.lineId).filter((lineId) => lineId >= 'VN0846' && lineId <= 'VN0964')).toEqual(['VN0878', 'VN0913', 'VN0957']);
  });

  it('promotes all 22 macro slots and ships exactly the three ending Match-3 configs with no new mechanics', () => {
    expect(macro.slots).toHaveLength(22);
    expect(macro.slots.every((slot) => slot.contentStatus === 'authored')).toBe(true);
    expect(macro.slots.every((slot) => slot.match3.status === 'production-configured')).toBe(true);
    expect(levels).toHaveLength(22);
    expect(levels.slice(19).map((level) => level.id)).toEqual(batchLevelIds);
    expect(levels.slice(19).map((level) => level.moves)).toEqual([30, 31, 29]);
    expect(macro.slots.slice(19).every((slot) => slot.assetTriggers.newMechanic === null)).toBe(true);
    expect(macro.allowedMatch3Mechanics).not.toContain('ending-branch');
  });

  it('routes final-strategy semantics to B/A/C and keeps the full-truth path gated with a truthful fallback', () => {
    expect(storyTransitionForLegacyScene(38)).toEqual({
      kind: 'branch', gateId: 'final-strategy',
      routes: { A: 'VN_SCENE_39_E19_PRE', B: 'VN_SCENE_41_E20_PRE', C: 'VN_SCENE_43_E21_PRE' },
    });
    expect(storyTransitionForLegacyScene(40)).toEqual({ kind: 'ending', endingId: 'ENDING_B_CASE_CLOSED' });
    expect(storyTransitionForLegacyScene(42)).toEqual({
      kind: 'ending', endingId: 'ENDING_A_FULL_TRUTH', fallbackEndingId: 'ENDING_B_CASE_CLOSED', successRequirement: fullTruthRequirement,
    });
    expect(storyTransitionForLegacyScene(44)).toEqual({ kind: 'ending', endingId: 'ENDING_C_PERFECT_SUSPECT' });
    expect(storyGraph.scenes.filter((scene) => scene.transition.kind === 'ending')).toHaveLength(3);
  });

  it('derives Ending A eligibility from schema-2 evidence and visible trust choices rather than hidden state', () => {
    expect(SAVE_SCHEMA_VERSION).toBe(2);
    const eligible = storyOutcomeMetrics({
      choice: 'A',
      clues: ['CUE_010','CUE_011','CUE_012','CUE_013','CUE_014','CUE_015','CUE_016'],
      storyChoices: { 'meeting-tone': 'A', 'apology-to-hinata': 'B', 'family-ledger-permission': 'A', 'final-strategy': 'B' },
    });
    expect(eligible).toEqual({ evidence: 7, teamTrust: 2, sourceTrust: 2 });
    expect(meetsFullTruthRequirement(eligible)).toBe(true);
    expect(meetsFullTruthRequirement(storyOutcomeMetrics({ choice: 'B', clues: [], storyChoices: { 'final-strategy': 'B' } }))).toBe(false);
  });

  it('reuses semantic background aliases and preserves the macro-owned server-evidence hero clue', () => {
    expect(backgroundAssets.anonymousReturnCounter).toBe(backgroundAssets.lockerAthletics);
    expect(backgroundAssets.serviceTunnel).toBe(backgroundAssets.poolLocker);
    expect(backgroundAssets.serverRoom).toBe(backgroundAssets.norihiroApartment);
    expect(backgroundAssets.disciplinaryAssembly).toBe(backgroundAssets.clubroom);
    expect(macro.slots[20].assetTriggers.heroClueCloseups).toContain('server-evidence');
  });
});
