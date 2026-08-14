import {
  guestWitnessAssetForDirection,
  guestWitnessManifest,
  type GuestWitnessKey,
} from '../data/guestWitnesses';
import type { SceneStagingSafeBox } from '../data/sceneStaging';
import { resolveSceneStagingPreset } from './sceneStaging';
import { escapeHtml } from './viewMarkup';

export type GuestWitnessMarkupContext = 'runtime' | 'scene-studio';

const safeBoxStyle = (safeBox: SceneStagingSafeBox, zIndex: number): string => [
  `left:${safeBox.leftPercent}%`,
  `top:${safeBox.topPercent}%`,
  `width:${safeBox.rightPercent - safeBox.leftPercent}%`,
  `height:${safeBox.bottomPercent - safeBox.topPercent}%`,
  `z-index:${zIndex}`,
].join(';');

/**
 * Shared B3 guest/witness renderer. It deliberately resolves only the dedicated
 * guest-testimony-card preset; episode guests never become fake full-stage actors.
 */
export function guestWitnessStageMarkup(
  key: GuestWitnessKey,
  direction: string,
  localizedEmotion: string,
  context: GuestWitnessMarkupContext = 'runtime',
): string {
  const guest = guestWitnessManifest.guests[key];
  const resolution = resolveSceneStagingPreset('guest-testimony-card', []);
  const guestSlot = resolution.guestSlots[0];
  const testimonySlot = resolution.nativeSlots.find((slot) => slot.kind === 'testimony-card');
  if (!guestSlot || !testimonySlot) throw new Error('guest-testimony-card preset is missing its guest/testimony slots');

  const asset = guestWitnessAssetForDirection(key, direction);
  const visual = asset
    ? `<img class="guest-witness-image" src="${escapeHtml(asset)}" alt="${escapeHtml(guest.displayName)}">`
    : `<span class="guest-witness-placeholder" aria-hidden="true">${escapeHtml(guest.initials)}</span>`;

  return `<div class="guest-witness-presentation guest-witness-${context}" data-guest-witness="${key}" data-guest-status="${guest.status}" data-scene-preset="guest-testimony-card">
    <div class="guest-witness-shell" data-slot="${escapeHtml(guestSlot.id)}" style="${safeBoxStyle(guestSlot.safeBox, guestSlot.zIndex)};--guest-accent:${escapeHtml(guest.accent)}">
      ${visual}
      <b>${escapeHtml(guest.displayName)}</b>
    </div>
    <article class="guest-witness-testimony" data-slot="${escapeHtml(testimonySlot.id)}" style="${safeBoxStyle(testimonySlot.safeBox, testimonySlot.zIndex)};--guest-accent:${escapeHtml(guest.accent)}">
      <span aria-hidden="true">“</span>
      <b>${escapeHtml(guest.displayName)}</b>
      <small>${escapeHtml(localizedEmotion)}</small>
    </article>
  </div>`;
}
