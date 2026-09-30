import {
  guestWitnessAssetForDirection,
  guestWitnessManifest,
  type GuestWitnessKey,
} from '../data/guestWitnesses';
import { resolveVnPortraitCamera } from './vnPortraitGeometry';
import { escapeHtml } from './viewMarkup';

export type GuestWitnessMarkupContext = 'runtime' | 'scene-studio';

/** Guests retain their lean asset package and share the playable VN portrait camera. */
export function guestWitnessStageMarkup(
  key: GuestWitnessKey,
  direction: string,
  _localizedEmotion: string,
  context: GuestWitnessMarkupContext = 'runtime',
): string {
  const guest = guestWitnessManifest.guests[key];
  const asset = guestWitnessAssetForDirection(key, direction);
  if (!asset) throw new Error(`guest portrait renderer requires production art for ${key}`);

  const camera = resolveVnPortraitCamera();
  const style = `--portrait-height:${camera.heightPercent}%;--portrait-bottom:${camera.bottomPercent}%`;
  return `<div class="portrait portrait-right guest-witness-presentation guest-witness-${context}" data-guest-witness="${key}" data-guest-status="${guest.status}" data-scene-preset="guest-testimony-card" style="${style}">
    <img class="portrait-frame guest-witness-image" src="${escapeHtml(asset)}" alt="${escapeHtml(guest.displayName)}">
  </div>`;
}
