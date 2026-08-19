import type {
  CharacterPortraitFrameGeometry,
  ProductionCharacterKey,
  RuntimeExpression,
} from './characterProduction';

export const CHARACTER_RUNTIME_OVERRIDE_FORMAT = 'upds-character-runtime-override-v1' as const;

export type CharacterRuntimeFrameOverride = Readonly<{
  asset: string;
  geometry: CharacterPortraitFrameGeometry;
  visualApproval: 'approved';
  sourceCandidateId: string;
}>;

export type CharacterRuntimePoseOverride = Readonly<{
  asset: string;
  geometry: CharacterPortraitFrameGeometry;
  sourceCandidateId: string;
}>;

export type CharacterRuntimeMedallionOverride = Readonly<{
  asset: string;
  sourceCandidateId: string;
}>;

export type BrowserLocalCharacterAssetRecord = Readonly<{
  frames?: Readonly<Partial<Record<RuntimeExpression, CharacterRuntimeFrameOverride>>>;
  poseB?: CharacterRuntimePoseOverride;
  medallion?: CharacterRuntimeMedallionOverride;
}>;

export type BrowserLocalCharacterAssetOverrides = Readonly<
  Partial<Record<ProductionCharacterKey, BrowserLocalCharacterAssetRecord>>
>;

export type BrowserLocalCharacterSummary = Readonly<{
  character: ProductionCharacterKey;
  frameCount: number;
  poseB: boolean;
  medallion: boolean;
  assetCount: number;
}>;

const emiApprovedGeometry: CharacterPortraitFrameGeometry = Object.freeze({
  alphaBounds: { left: 330, top: 80, right: 737, bottom: 1508 },
  eyeLineYPx: 244,
});

const emiOverride = (
  expression: Exclude<RuntimeExpression, 'embarrassed'>,
  sourceCandidateId: string,
  asset: string,
): readonly [RuntimeExpression, CharacterRuntimeFrameOverride] => [expression, Object.freeze({
  asset,
  geometry: emiApprovedGeometry,
  visualApproval: 'approved',
  sourceCandidateId,
})];

export const characterRuntimeFrameOverrides: Readonly<
  Partial<Record<ProductionCharacterKey, Readonly<Partial<Record<RuntimeExpression, CharacterRuntimeFrameOverride>>>>>
> = Object.freeze({
  emi: Object.freeze(Object.fromEntries([
    emiOverride('neutral', 'anm028d0-r1', './assets/characters/emi/candidates/anm028d0/neutral-r1.png'),
    emiOverride('smile', 'anm028d1-r1', './assets/characters/emi/candidates/anm028d1/frame-smile-r1.png'),
    emiOverride('serious', 'anm028d2-r1', './assets/characters/emi/candidates/anm028d2/frame-serious-r1.png'),
    emiOverride('surprised', 'anm028d3-r1', './assets/characters/emi/candidates/anm028d3/frame-surprised-r1.png'),
  ]) as Partial<Record<RuntimeExpression, CharacterRuntimeFrameOverride>>),
});

let browserLocalCharacterOverrides: BrowserLocalCharacterAssetOverrides = Object.freeze({});
let browserLocalOverrideUrls: string[] = [];

function revokeBrowserLocalOverrideUrls(): void {
  if (typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') return;
  for (const url of browserLocalOverrideUrls) URL.revokeObjectURL(url);
  browserLocalOverrideUrls = [];
}

export function applyBrowserLocalCharacterOverrides(overrides: BrowserLocalCharacterAssetOverrides): void {
  revokeBrowserLocalOverrideUrls();
  const urls: string[] = [];
  for (const record of Object.values(overrides)) {
    if (!record) continue;
    for (const override of Object.values(record.frames ?? {})) {
      if (override) urls.push(override.asset);
    }
    if (record.poseB) urls.push(record.poseB.asset);
    if (record.medallion) urls.push(record.medallion.asset);
  }
  browserLocalOverrideUrls = urls;
  browserLocalCharacterOverrides = Object.freeze(overrides);
}

export function clearBrowserLocalCharacterOverrides(): void {
  revokeBrowserLocalOverrideUrls();
  browserLocalCharacterOverrides = Object.freeze({});
}

export function hasBrowserLocalCharacterOverrides(): boolean {
  return Object.keys(browserLocalCharacterOverrides).length > 0;
}

export function browserLocalCharacterOverrideSummaries(): readonly BrowserLocalCharacterSummary[] {
  return Object.entries(browserLocalCharacterOverrides).flatMap(([character, record]) => {
    if (!record) return [];
    const frameCount = Object.keys(record.frames ?? {}).length;
    return [{
      character: character as ProductionCharacterKey,
      frameCount,
      poseB: Boolean(record.poseB),
      medallion: Boolean(record.medallion),
      assetCount: frameCount + (record.poseB ? 1 : 0) + (record.medallion ? 1 : 0),
    } satisfies BrowserLocalCharacterSummary];
  });
}

export function browserLocalExpressionOverride(
  character: ProductionCharacterKey,
  expression: RuntimeExpression,
): CharacterRuntimeFrameOverride | null {
  return browserLocalCharacterOverrides[character]?.frames?.[expression] ?? null;
}

export function browserLocalPoseOverride(character: ProductionCharacterKey): CharacterRuntimePoseOverride | null {
  return browserLocalCharacterOverrides[character]?.poseB ?? null;
}

export function browserLocalMedallionOverride(character: ProductionCharacterKey): CharacterRuntimeMedallionOverride | null {
  return browserLocalCharacterOverrides[character]?.medallion ?? null;
}

export function runtimeFrameOverride(
  character: ProductionCharacterKey,
  expression: RuntimeExpression,
): CharacterRuntimeFrameOverride | null {
  return browserLocalExpressionOverride(character, expression) ?? characterRuntimeFrameOverrides[character]?.[expression] ?? null;
}

export function validateCharacterRuntimeFrameOverrides(): readonly string[] {
  const issues: string[] = [];
  for (const [character, expressions] of Object.entries(characterRuntimeFrameOverrides)) {
    if (!expressions) continue;
    for (const [expression, override] of Object.entries(expressions)) {
      if (!override) continue;
      if (!override.asset.startsWith('./assets/characters/')) issues.push(`${character}:${expression}: invalid asset root`);
      if (!override.sourceCandidateId) issues.push(`${character}:${expression}: missing source candidate`);
      const { alphaBounds, eyeLineYPx } = override.geometry;
      if (alphaBounds.left < 0 || alphaBounds.top < 0 || alphaBounds.right > 1024 || alphaBounds.bottom > 1536) {
        issues.push(`${character}:${expression}: alpha bounds leave the master canvas`);
      }
      if (eyeLineYPx <= alphaBounds.top || eyeLineYPx >= alphaBounds.bottom) {
        issues.push(`${character}:${expression}: eye line leaves visible subject`);
      }
    }
  }
  return issues;
}
