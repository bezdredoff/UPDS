import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { sceneStagingPresetIds } from '../src/data/sceneStaging';

type TriggerSet = Readonly<{
  newMasterFamilies: readonly string[];
  fullStageProduction: readonly string[];
  guestPackages: readonly string[];
  heroClueCloseups: readonly string[];
  uniqueCg: string | null;
  newMechanic: string | null;
  budgetException: string | null;
}>;

type MacroSlot = Readonly<{
  slot: number;
  branch: string;
  contentStatus: 'authored' | 'macro-locked';
  transition: Readonly<{ kind: string; targetSlot?: number; targets?: readonly number[]; endingId?: string }>;
  locations: readonly Readonly<{ family: string; variant: string }>[];
  cast: readonly Readonly<{ id: string; tier: string }>[];
  stagingPresets: readonly string[];
  evidence: Readonly<{ id: string; presentation: string }>;
  match3: Readonly<{ status: string; archetype: string; objectiveKinds: readonly string[] }>;
  assetTriggers: TriggerSet;
}>;

type MacroLock = Readonly<{
  format: string;
  status: string;
  baseline: string;
  endingPivotSlot: number;
  endingSlots: readonly number[];
  screenplayBatches: readonly Readonly<{ id: string; slots: readonly number[] }>[];
  castTiers: Readonly<{
    stageCore: readonly string[];
    recurringStage: readonly string[];
    episodeGuest: readonly string[];
  }>;
  locationFamilies: readonly Readonly<{ id: string; status: string; firstSlot: number }>[];
  match3Archetypes: readonly Readonly<{ id: string; objectiveKinds: readonly string[] }>[];
  allowedMatch3Mechanics: readonly string[];
  heroClueCloseups: readonly Readonly<{ id: string; slot: number }>[];
  slots: readonly MacroSlot[];
}>;

const macro = JSON.parse(readFileSync(resolve(process.cwd(), 'src/content/story/ANM027F.full-story-macro.json'), 'utf8')) as MacroLock;

describe('ANM-027F full-story macro lock', () => {
  it('locks all 22 slots, the authored boundary and the three endings', () => {
    expect(macro.format).toBe('upds-story-macro-lock-v1');
    expect(macro.status).toBe('locked-for-screenplay-authoring');
    expect(macro.baseline).toBe('f2a5f10fa232c0da0bb00f4f22803550b770641c');
    expect(macro.slots.map((slot) => slot.slot)).toEqual(Array.from({ length: 22 }, (_, index) => index));
    const authoredSlots = macro.slots.filter((slot) => slot.contentStatus === 'authored').map((slot) => slot.slot);
    const macroLockedSlots = macro.slots.filter((slot) => slot.contentStatus === 'macro-locked').map((slot) => slot.slot);
    expect(authoredSlots.length).toBeGreaterThanOrEqual(4);
    expect(authoredSlots).toEqual(Array.from({ length: authoredSlots.length }, (_, index) => index));
    expect(macroLockedSlots).toEqual(
      Array.from({ length: macro.slots.length - authoredSlots.length }, (_, index) => index + authoredSlots.length),
    );
    expect(macro.endingPivotSlot).toBe(18);
    expect(macro.endingSlots).toEqual([19, 20, 21]);
    expect(macro.slots[18].transition).toEqual({ kind: 'ending-choice', targets: [19, 20, 21] });
    expect(macro.slots.slice(19).map((slot) => slot.transition.endingId)).toEqual(['B', 'A', 'C']);
  });

  it('stays inside the lean location, cast and hero-clue budgets', () => {
    expect(macro.locationFamilies).toHaveLength(8);
    const familyIds = new Set(macro.locationFamilies.map((family) => family.id));
    const newFamilies = macro.locationFamilies.filter((family) => family.status === 'new-master-required');
    expect(newFamilies.map((family) => family.id)).toEqual(['lab-asterion', 'laundry-service', 'campus-exterior', 'old-building-finale']);
    expect(newFamilies.map((family) => family.firstSlot)).toEqual([7, 8, 11, 15]);
    for (const slot of macro.slots) {
      expect(slot.locations.length).toBeGreaterThan(0);
      for (const location of slot.locations) expect(familyIds.has(location.family)).toBe(true);
      expect(slot.assetTriggers.fullStageProduction.length).toBeLessThanOrEqual(1);
      expect(slot.assetTriggers.uniqueCg).toBeNull();
      expect(slot.assetTriggers.budgetException).toBeNull();
    }

    const fullStage = [...macro.castTiers.stageCore, ...macro.castTiers.recurringStage];
    expect(fullStage).toHaveLength(9);
    expect(new Set(fullStage).size).toBe(9);
    expect(macro.castTiers.recurringStage).toEqual(['emi', 'kentaro', 'norihiro', 'mayu', 'rina', 'kurose']);
    expect(macro.castTiers.episodeGuest).toEqual(['hinata', 'gen', 'aoi', 'kubo', 'kubo-mother', 'vincent']);

    expect(macro.heroClueCloseups.length).toBeGreaterThanOrEqual(5);
    expect(macro.heroClueCloseups.length).toBeLessThanOrEqual(7);
    expect(macro.heroClueCloseups).toHaveLength(6);
    expect(new Set(macro.heroClueCloseups.map((clue) => clue.id)).size).toBe(6);
    const triggeredHeroIds = macro.slots.flatMap((slot) => slot.assetTriggers.heroClueCloseups);
    expect(triggeredHeroIds.sort()).toEqual(macro.heroClueCloseups.map((clue) => clue.id).sort());
  });

  it('uses only frozen staging presets and reused Match-3 framework concepts', () => {
    const allowedPresets = new Set<string>(sceneStagingPresetIds);
    const archetypeIds = new Set(macro.match3Archetypes.map((archetype) => archetype.id));
    expect(macro.match3Archetypes.length).toBeGreaterThanOrEqual(5);
    expect(macro.match3Archetypes.length).toBeLessThanOrEqual(6);
    expect(macro.match3Archetypes).toHaveLength(6);

    const usage = new Map<string, number>();
    for (const slot of macro.slots) {
      for (const preset of slot.stagingPresets) expect(allowedPresets.has(preset)).toBe(true);
      expect(archetypeIds.has(slot.match3.archetype)).toBe(true);
      usage.set(slot.match3.archetype, (usage.get(slot.match3.archetype) ?? 0) + 1);
      for (const objective of slot.match3.objectiveKinds) expect(['collect', 'clearBlockers', 'drop', 'dropGroup']).toContain(objective);
      expect(slot.assetTriggers.newMechanic).toBeNull();
    }
    for (const count of usage.values()) expect(count).toBeGreaterThanOrEqual(2);
    expect(macro.allowedMatch3Mechanics).toContain('special-combos');
    expect(macro.allowedMatch3Mechanics).toContain('board-holes');
  });

  it('keeps the six screenplay batch plan aligned with the now-complete authored macro', () => {
    expect(macro.screenplayBatches).toEqual([
      { id: '4-6', slots: [4, 5, 6] },
      { id: '7-9', slots: [7, 8, 9] },
      { id: '10-12', slots: [10, 11, 12] },
      { id: '13-15', slots: [13, 14, 15] },
      { id: '16-18', slots: [16, 17, 18] },
      { id: '19-21', slots: [19, 20, 21] },
    ]);
    const authoredSlots = macro.slots.filter((slot) => slot.contentStatus === 'authored').map((slot) => slot.slot);
    const productionConfiguredSlots = macro.slots.filter((slot) => slot.match3.status === 'production-configured').map((slot) => slot.slot);
    const macroLockedSlots = macro.slots.filter((slot) => slot.contentStatus === 'macro-locked').map((slot) => slot.slot);
    const plannedConfigSlots = macro.slots.filter((slot) => slot.match3.status === 'planned-config').map((slot) => slot.slot);
    expect(productionConfiguredSlots).toEqual(authoredSlots);
    expect(plannedConfigSlots).toEqual(macroLockedSlots);
    expect(macro.slots.slice(4, 7).flatMap((slot) => slot.assetTriggers.newMasterFamilies)).toEqual([]);
  });
});
