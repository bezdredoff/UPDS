import type { IngredientKey } from './levels';

/**
 * Stable case-file tags for Match-3 story objects.
 *
 * The runtime intentionally reuses a small number of base images for many semantic
 * ingredients. These two-digit tags make the board object and its objective icon
 * visually linkable without adding locale-specific text or changing gameplay data.
 */
export const storyObjectEvidenceTags = {
  receipt: '01',
  memoryCard: '02',
  serviceKey: '03',
  damagedTowel: '04',
  laundryCalendar: '05',
  repairLog: '06',
  warrantyCard: '07',
  silverSpool: '08',
  asterionSpec: '09',
  missingNumberSheet: '10',
  handoffSlip: '11',
  stitchedWristband: '12',
  transferSeal: '13',
  routeCard: '14',
  transferManifest: '15',
  secondSkinTag: '16',
  pilotList: '17',
  familyReceipt: '18',
  atelierLedger: '19',
  markedPackage: '20',
  serviceKeyCard: '21',
  handheldScanner: '22',
  rinaCatalog: '23',
  recentMarkedItem: '24',
  returnConfirmation: '25',
  backupDrive: '26',
  finalSlide: '27',
} as const satisfies Readonly<Record<IngredientKey, string>>;

export function storyObjectEvidenceTag(ingredient: IngredientKey): string {
  return storyObjectEvidenceTags[ingredient];
}
