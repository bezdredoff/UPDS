import { describe, expect, it } from 'vitest';
import {
  decodeMatch3CampaignSave,
  encodeMatch3CampaignSave,
  freshMatch3CampaignSave,
  MATCH3_CAMPAIGN_SCHEMA_VERSION,
} from '../src/engine/Match3CampaignSaveFormat';
import type { Match3CampaignSave } from '../src/engine/Match3CampaignSaveFormat';
import { levels } from '../src/data/levels';

describe('Match-3 campaign save format', () => {
  const firstLevelId = levels[0].id;

  it('normalizes legacy and current formats independently from storage', () => {
    expect(decodeMatch3CampaignSave({ completed: [firstLevelId] })).toEqual({
      ...freshMatch3CampaignSave(), completed: [firstLevelId],
    });
    expect(decodeMatch3CampaignSave({ ...freshMatch3CampaignSave(), schemaVersion: MATCH3_CAMPAIGN_SCHEMA_VERSION }))
      .toEqual(freshMatch3CampaignSave());
    expect(decodeMatch3CampaignSave({ schemaVersion: MATCH3_CAMPAIGN_SCHEMA_VERSION + 1 })).toBeNull();
    expect(decodeMatch3CampaignSave(null)).toBeNull();
  });

  it('encodes the stable schema envelope with normalized campaign state', () => {
    expect(encodeMatch3CampaignSave({
      completed: [firstLevelId, 'bad'],
      attempts: { [firstLevelId]: 2.8, bad: 10 },
      bestMovesLeft: { [firstLevelId]: 7.4 },
      tutorialsCompleted: ['basic-swap', 'bad'] as Match3CampaignSave['tutorialsCompleted'],
    }, '2026-10-13T12:00:00.000Z')).toEqual({
      completed: [firstLevelId],
      attempts: { [firstLevelId]: 2 },
      bestMovesLeft: { [firstLevelId]: 7 },
      tutorialsCompleted: ['basic-swap'],
      schemaVersion: MATCH3_CAMPAIGN_SCHEMA_VERSION,
      savedAt: '2026-10-13T12:00:00.000Z',
    });
  });
});
