export const GUEST_WITNESS_FORMAT = 'upds-guest-witness-production-v1' as const;

export const guestWitnessKeys = [
  'hinata',
  'gen',
  'aoi',
  'kubo',
  'kubo-mother',
  'vincent',
] as const;

export type GuestWitnessKey = typeof guestWitnessKeys[number];
export type GuestWitnessStatus = 'planned' | 'production';

export type GuestWitnessExpressionAsset = Readonly<{
  id: string;
  asset: string;
  directionTokens: readonly string[];
}>;

/**
 * Lighter episode-guest package. The neutral half-body/bust master is a runtime
 * frame of its own; the two expression frames are character-specific and use
 * direction-token routing instead of the strict five-expression full-stage API.
 */
export type GuestWitnessAssets = Readonly<{
  bustMaster: string;
  expressions: readonly [GuestWitnessExpressionAsset, GuestWitnessExpressionAsset];
  medallion: string;
}>;

export type GuestWitnessDefinition = Readonly<{
  id: GuestWitnessKey;
  displayName: string;
  speakerToken: string;
  speakerMatch: 'exact' | 'prefix';
  firstSlot: number;
  tier: 'episode-guest';
  adultVisualGuardrail: true;
  initials: string;
  accent: string;
  status: GuestWitnessStatus;
  assets: GuestWitnessAssets | null;
}>;

export type GuestWitnessManifest = Readonly<{
  format: typeof GUEST_WITNESS_FORMAT;
  package: Readonly<{
    bustCanvas: Readonly<{ width: 1024; height: 1536 }>;
    medallionCanvas: Readonly<{ width: 512; height: 512 }>;
    productionAssetCount: 4;
    expressionVariantCount: 2;
    runtimePresentation: 'guest-testimony-card';
  }>;
  guests: Readonly<Record<GuestWitnessKey, GuestWitnessDefinition>>;
}>;

const plannedGuest = (
  id: GuestWitnessKey,
  displayName: string,
  speakerToken: string,
  firstSlot: number,
  initials: string,
  accent: string,
): GuestWitnessDefinition => ({
  id,
  displayName,
  speakerToken,
  speakerMatch: 'prefix',
  firstSlot,
  tier: 'episode-guest',
  adultVisualGuardrail: true,
  initials,
  accent,
  status: 'planned',
  assets: null,
});

export const guestWitnessManifest: GuestWitnessManifest = {
  format: GUEST_WITNESS_FORMAT,
  package: {
    bustCanvas: { width: 1024, height: 1536 },
    medallionCanvas: { width: 512, height: 512 },
    productionAssetCount: 4,
    expressionVariantCount: 2,
    runtimePresentation: 'guest-testimony-card',
  },
  guests: {
    hinata: plannedGuest('hinata', 'Тихару Хината', 'ХИНАТА', 5, 'ХТ', '#b05469'),
    gen: plannedGuest('gen', 'Гэн Исида', 'ГЭН', 9, 'ГИ', '#596b86'),
    aoi: plannedGuest('aoi', 'Аой Кагава', 'АОЙ', 10, 'АК', '#6b5546'),
    kubo: plannedGuest('kubo', 'Кохэй Кубо', 'КУБО', 13, 'КК', '#4f607b'),
    'kubo-mother': plannedGuest('kubo-mother', 'Мать Кубо', 'МАТЬ КУБО', 14, 'МК', '#8b5c72'),
    vincent: plannedGuest('vincent', 'Винсент Мори', 'ВИНСЕНТ', 16, 'ВМ', '#506b68'),
  },
};

function speakerMatches(speaker: string, token: string, match: 'exact' | 'prefix'): boolean {
  return match === 'prefix' ? speaker.startsWith(token) : speaker === token;
}

export function guestWitnessForSpeaker(speaker: string): GuestWitnessKey | null {
  const normalized = speaker.toLocaleUpperCase('ru-RU');
  for (const key of guestWitnessKeys) {
    const guest = guestWitnessManifest.guests[key];
    if (speakerMatches(normalized, guest.speakerToken, guest.speakerMatch)) return key;
  }
  return null;
}

export function guestWitnessAssetForDirection(key: GuestWitnessKey, direction: string): string | null {
  const guest = guestWitnessManifest.guests[key];
  if (guest.status !== 'production' || !guest.assets) return null;
  const normalized = direction.toLocaleUpperCase('ru-RU');
  const expression = guest.assets.expressions.find((candidate) =>
    candidate.directionTokens.some((token) => normalized.includes(token.toLocaleUpperCase('ru-RU'))),
  );
  return expression?.asset ?? guest.assets.bustMaster;
}

export type GuestWitnessIssue = Readonly<{
  code: 'format' | 'key-set' | 'identity' | 'slot' | 'status-assets' | 'asset-count' | 'asset-path' | 'expression';
  guest?: GuestWitnessKey;
  detail: string;
}>;

export function validateGuestWitnessManifest(
  manifest: GuestWitnessManifest = guestWitnessManifest,
): readonly GuestWitnessIssue[] {
  const issues: GuestWitnessIssue[] = [];
  if (manifest.format !== GUEST_WITNESS_FORMAT) {
    issues.push({ code: 'format', detail: `expected ${GUEST_WITNESS_FORMAT}, got ${manifest.format}` });
  }
  if (Object.keys(manifest.guests).join('|') !== guestWitnessKeys.join('|')) {
    issues.push({ code: 'key-set', detail: 'guest/witness key set or order differs from ANM-027F macro lock' });
  }
  if (manifest.package.productionAssetCount !== 4 || manifest.package.expressionVariantCount !== 2) {
    issues.push({ code: 'asset-count', detail: 'guest production package must remain neutral bust + two expressions + neutral medallion' });
  }
  if (manifest.package.runtimePresentation !== 'guest-testimony-card') {
    issues.push({ code: 'format', detail: 'guest runtime presentation must remain guest-testimony-card' });
  }

  const speakers = new Set<string>();
  for (const key of guestWitnessKeys) {
    const guest = manifest.guests[key];
    if (!guest || guest.id !== key) {
      issues.push({ code: 'identity', guest: key, detail: `${key}: missing or mismatched definition` });
      continue;
    }
    if (!guest.adultVisualGuardrail || guest.tier !== 'episode-guest') {
      issues.push({ code: 'identity', guest: key, detail: `${key}: guest tier/adult visual guardrail changed` });
    }
    if (guest.firstSlot < 4 || guest.firstSlot > 21) {
      issues.push({ code: 'slot', guest: key, detail: `${key}: invalid firstSlot ${guest.firstSlot}` });
    }
    if (speakers.has(guest.speakerToken)) {
      issues.push({ code: 'identity', guest: key, detail: `${key}: duplicate speaker token ${guest.speakerToken}` });
    }
    speakers.add(guest.speakerToken);

    if (guest.status === 'planned') {
      if (guest.assets !== null) issues.push({ code: 'status-assets', guest: key, detail: `${key}: planned guest must remain asset-free` });
      continue;
    }
    if (!guest.assets) {
      issues.push({ code: 'status-assets', guest: key, detail: `${key}: production guest requires a complete four-asset package` });
      continue;
    }

    const assets = [
      guest.assets.bustMaster,
      ...guest.assets.expressions.map((expression) => expression.asset),
      guest.assets.medallion,
    ];
    if (assets.length !== manifest.package.productionAssetCount || new Set(assets).size !== assets.length) {
      issues.push({ code: 'asset-count', guest: key, detail: `${key}: production package must contain four unique assets` });
    }
    const prefix = `./assets/guests/${key}/`;
    for (const asset of assets) {
      if (!asset.startsWith(prefix)) issues.push({ code: 'asset-path', guest: key, detail: `${key}: asset must live under ${prefix}` });
    }
    const expressionIds = guest.assets.expressions.map((expression) => expression.id);
    if (new Set(expressionIds).size !== 2 || guest.assets.expressions.some((expression) => expression.directionTokens.length === 0)) {
      issues.push({ code: 'expression', guest: key, detail: `${key}: two unique expression ids with direction tokens are required` });
    }
  }
  return issues;
}
