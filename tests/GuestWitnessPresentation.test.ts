import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  GUEST_WITNESS_FORMAT,
  guestWitnessForSpeaker,
  guestWitnessKeys,
  guestWitnessManifest,
  validateGuestWitnessManifest,
  type GuestWitnessManifest,
} from '../src/data/guestWitnesses';
import { characterProductionManifest } from '../src/data/characterProduction';
import { guestWitnessStageMarkup } from '../src/ui/guestWitnessMarkup';
import { resolveSceneStagingPreset } from '../src/ui/sceneStaging';

describe('ANM-028B3 guest/witness presentation contract', () => {
  it('locks the six ANM-027F guest packages outside the strict full-stage manifest', () => {
    expect(GUEST_WITNESS_FORMAT).toBe('upds-guest-witness-production-v1');
    expect(Object.keys(guestWitnessManifest.guests)).toEqual(guestWitnessKeys);
    expect(guestWitnessKeys).toEqual(['hinata', 'gen', 'aoi', 'kubo', 'kubo-mother', 'vincent']);
    expect(guestWitnessManifest.package.productionAssetCount).toBe(4);
    expect(guestWitnessManifest.package.expressionVariantCount).toBe(2);
    expect(guestWitnessManifest.package.runtimePresentation).toBe('guest-testimony-card');
    expect(validateGuestWitnessManifest()).toEqual([]);

    const fullStageIds = Object.keys(characterProductionManifest.characters);
    for (const key of guestWitnessKeys) expect(fullStageIds).not.toContain(key);

    const macro = JSON.parse(readFileSync(resolve(process.cwd(), 'src/content/story/ANM027F.full-story-macro.json'), 'utf8')) as {
      slots: Array<{ slot: number; assetTriggers: { guestPackages: string[] } }>;
    };
    const triggered = macro.slots.flatMap((slot) => slot.assetTriggers.guestPackages.map((guest) => [guest, slot.slot] as const));
    expect(triggered).toEqual([
      ['hinata', 5], ['gen', 9], ['aoi', 10], ['kubo', 13], ['kubo-mother', 14], ['vincent', 16],
    ]);
    for (const [key, slot] of triggered) {
      expect(guestWitnessManifest.guests[key as keyof typeof guestWitnessManifest.guests].firstSlot).toBe(slot);
    }
  });

  it('keeps all guest packages asset-free until external production art is supplied', () => {
    for (const guest of Object.values(guestWitnessManifest.guests)) {
      expect(guest.tier).toBe('episode-guest');
      expect(guest.adultVisualGuardrail).toBe(true);
      expect(guest.status).toBe('planned');
      expect(guest.assets).toBeNull();
    }
    expect(guestWitnessManifest.guests.hinata.firstSlot).toBe(5);
    expect(guestWitnessManifest.guests.vincent.firstSlot).toBe(16);
  });

  it('maps stable screenplay speaker tokens without entering the full-stage staging resolver', () => {
    expect(guestWitnessForSpeaker('ХИНАТА')).toBe('hinata');
    expect(guestWitnessForSpeaker('ХИНАТА (СЕРЬЁЗНО)')).toBe('hinata');
    expect(guestWitnessForSpeaker('ГЭН')).toBe('gen');
    expect(guestWitnessForSpeaker('АОЙ')).toBe('aoi');
    expect(guestWitnessForSpeaker('КУБО')).toBe('kubo');
    expect(guestWitnessForSpeaker('МАТЬ КУБО')).toBe('kubo-mother');
    expect(guestWitnessForSpeaker('ВИНСЕНТ')).toBe('vincent');
    expect(guestWitnessForSpeaker('МИКУ')).toBeNull();
  });

  it('renders a real guest-testimony-card layout with no fake image path for planned guests', () => {
    const staging = resolveSceneStagingPreset('guest-testimony-card', []);
    expect(staging.actors).toHaveLength(0);
    expect(staging.guestSlots).toHaveLength(1);
    expect(staging.nativeSlots.map((slot) => slot.kind)).toEqual(['testimony-card']);

    const markup = guestWitnessStageMarkup('hinata', 'СЕРЬЁЗНО', 'СЕРЬЁЗНО');
    expect(markup).toContain('data-guest-witness="hinata"');
    expect(markup).toContain('data-guest-status="planned"');
    expect(markup).toContain('data-scene-preset="guest-testimony-card"');
    expect(markup).toContain('Тихару Хината');
    expect(markup).toContain('guest-witness-placeholder');
    expect(markup).not.toContain('<img');
    expect(markup).not.toContain('./assets/characters/');
  });

  it('rejects partial or fake production packages instead of weakening the guest boundary', () => {
    const missingAssets = structuredClone(guestWitnessManifest) as unknown as {
      guests: Record<string, { status: string; assets: unknown }>;
    };
    missingAssets.guests.hinata.status = 'production';
    expect(validateGuestWitnessManifest(missingAssets as unknown as GuestWitnessManifest))
      .toContainEqual(expect.objectContaining({ guest: 'hinata', code: 'status-assets' }));

    const plannedWithAssets = structuredClone(guestWitnessManifest) as unknown as {
      guests: Record<string, { status: string; assets: unknown }>;
    };
    plannedWithAssets.guests.gen.assets = {
      bustMaster: './assets/guests/gen/bust-neutral.png',
      expressions: [
        { id: 'stern', asset: './assets/guests/gen/bust-stern.png', directionTokens: ['СЕРЬЁЗ'] },
        { id: 'surprised', asset: './assets/guests/gen/bust-surprised.png', directionTokens: ['УДИВ'] },
      ],
      medallion: './assets/guests/gen/medallion-neutral.png',
    };
    expect(validateGuestWitnessManifest(plannedWithAssets as unknown as GuestWitnessManifest))
      .toContainEqual(expect.objectContaining({ guest: 'gen', code: 'status-assets' }));
  });
});
