import type {
  CharacterPortraitFrameGeometry,
  CharacterStaging,
  ProductionCharacterKey,
  RuntimeExpression,
} from './characterProduction';
import { characterProductionManifest, runtimeExpressionOrder } from './characterProduction';

export const CHARACTER_RUNTIME_OVERRIDE_FORMAT = 'upds-character-runtime-override-v1' as const;
export const BROWSER_LOCAL_CHARACTER_EXPORT_FORMAT = 'upds-browser-local-character-export-v1' as const;

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

export type BrowserLocalCharacterCalibration = Readonly<{
  eyeLineOffsetPx: number;
  bottomOffsetPx: number;
  scale: number;
  yPercent: number;
}>;

export type BrowserLocalCharacterExportSnapshot = Readonly<{
  format: typeof BROWSER_LOCAL_CHARACTER_EXPORT_FORMAT;
  packageLabel: string | null;
  characters: Readonly<Partial<Record<ProductionCharacterKey, Readonly<{
    staging: CharacterStaging;
    calibration: BrowserLocalCharacterCalibration;
    frames: Readonly<Partial<Record<RuntimeExpression, CharacterPortraitFrameGeometry>>>;
    poseB?: CharacterPortraitFrameGeometry;
    medallion?: string;
    assets: Readonly<{
      frames: Readonly<Partial<Record<RuntimeExpression, string>>>;
      poseB?: string;
      medallion?: string;
    }>;
  }>>>>;
}>;

const emiApprovedGeometry: CharacterPortraitFrameGeometry = Object.freeze({
  alphaBounds: { left: 330, top: 80, right: 737, bottom: 1508 },
  eyeLineYPx: 244,
});

const DEFAULT_CALIBRATION: BrowserLocalCharacterCalibration = Object.freeze({
  eyeLineOffsetPx: 0,
  bottomOffsetPx: 0,
  scale: 1,
  yPercent: 0,
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
let browserLocalCharacterCalibrations: Partial<Record<ProductionCharacterKey, BrowserLocalCharacterCalibration>> = Object.freeze({});

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function revokeBrowserLocalOverrideUrls(): void {
  if (typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') return;
  for (const url of browserLocalOverrideUrls) URL.revokeObjectURL(url);
  browserLocalOverrideUrls = [];
}

function calibratedGeometry(
  geometry: CharacterPortraitFrameGeometry,
  calibration: BrowserLocalCharacterCalibration,
): CharacterPortraitFrameGeometry {
  const minimumBottom = geometry.alphaBounds.top + 8;
  const bottom = clamp(Math.round(geometry.alphaBounds.bottom + calibration.bottomOffsetPx), minimumBottom, 1536);
  const eyeLineYPx = clamp(
    Math.round(geometry.eyeLineYPx + calibration.eyeLineOffsetPx),
    geometry.alphaBounds.top + 1,
    bottom - 1,
  );
  return {
    alphaBounds: {
      left: geometry.alphaBounds.left,
      top: geometry.alphaBounds.top,
      right: geometry.alphaBounds.right,
      bottom,
    },
    eyeLineYPx,
  };
}

function calibrationFor(character: ProductionCharacterKey): BrowserLocalCharacterCalibration {
  return browserLocalCharacterCalibrations[character] ?? DEFAULT_CALIBRATION;
}

export function browserLocalCharacterCalibration(character: ProductionCharacterKey): BrowserLocalCharacterCalibration {
  return calibrationFor(character);
}

export function applyBrowserLocalCharacterCalibration(
  character: ProductionCharacterKey,
  patch: Partial<BrowserLocalCharacterCalibration>,
): void {
  const current = calibrationFor(character);
  browserLocalCharacterCalibrations = Object.freeze({
    ...browserLocalCharacterCalibrations,
    [character]: Object.freeze({
      eyeLineOffsetPx: Number.isFinite(patch.eyeLineOffsetPx) ? Math.round(patch.eyeLineOffsetPx!) : current.eyeLineOffsetPx,
      bottomOffsetPx: Number.isFinite(patch.bottomOffsetPx) ? Math.round(patch.bottomOffsetPx!) : current.bottomOffsetPx,
      scale: Number.isFinite(patch.scale) ? round(clamp(patch.scale!, 0.6, 1.6), 3) : current.scale,
      yPercent: Number.isFinite(patch.yPercent) ? round(clamp(patch.yPercent!, -30, 30), 2) : current.yPercent,
    }),
  });
}

export function resetBrowserLocalCharacterCalibration(character?: ProductionCharacterKey): void {
  if (!character) {
    browserLocalCharacterCalibrations = Object.freeze({});
    return;
  }
  const next = { ...browserLocalCharacterCalibrations };
  delete next[character];
  browserLocalCharacterCalibrations = Object.freeze(next);
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
  browserLocalCharacterCalibrations = Object.freeze({});
}

export function clearBrowserLocalCharacterOverrides(): void {
  revokeBrowserLocalOverrideUrls();
  browserLocalCharacterOverrides = Object.freeze({});
  browserLocalCharacterCalibrations = Object.freeze({});
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

export function browserLocalCharacterOverrideCharacters(): readonly ProductionCharacterKey[] {
  return browserLocalCharacterOverrideSummaries().map((summary) => summary.character);
}

export function browserLocalExpressionOverride(
  character: ProductionCharacterKey,
  expression: RuntimeExpression,
): CharacterRuntimeFrameOverride | null {
  const base = browserLocalCharacterOverrides[character]?.frames?.[expression] ?? null;
  return base
    ? { ...base, geometry: calibratedGeometry(base.geometry, calibrationFor(character)) }
    : null;
}

export function browserLocalPoseOverride(character: ProductionCharacterKey): CharacterRuntimePoseOverride | null {
  const base = browserLocalCharacterOverrides[character]?.poseB ?? null;
  return base
    ? { ...base, geometry: calibratedGeometry(base.geometry, calibrationFor(character)) }
    : null;
}

export function browserLocalMedallionOverride(character: ProductionCharacterKey): CharacterRuntimeMedallionOverride | null {
  return browserLocalCharacterOverrides[character]?.medallion ?? null;
}

export function browserLocalCharacterStaging(character: ProductionCharacterKey, fallback: CharacterStaging): CharacterStaging {
  if (!browserLocalCharacterOverrides[character]) return fallback;
  const calibration = calibrationFor(character);
  return {
    scale: round(fallback.scale * calibration.scale, 3),
    yPercent: round(fallback.yPercent + calibration.yPercent, 2),
  };
}

export function browserLocalCharacterExportSnapshot(packageLabel: string | null = null): BrowserLocalCharacterExportSnapshot {
  const characters: Partial<Record<ProductionCharacterKey, BrowserLocalCharacterExportSnapshot['characters'][ProductionCharacterKey]>> = {};
  for (const character of browserLocalCharacterOverrideCharacters()) {
    const calibration = calibrationFor(character);
    const baseRecord = browserLocalCharacterOverrides[character];
    if (!baseRecord) continue;
    const definition = characterProductionManifest.characters[character];
    const frames = Object.fromEntries(runtimeExpressionOrder.flatMap((expression) => {
      const frame = baseRecord.frames?.[expression];
      if (!frame) return [];
      return [[expression, calibratedGeometry(frame.geometry, calibration)]];
    })) as Partial<Record<RuntimeExpression, CharacterPortraitFrameGeometry>>;
    const assets: {
      frames: Partial<Record<RuntimeExpression, string>>;
      poseB?: string;
      medallion?: string;
    } = {
      frames: Object.fromEntries(runtimeExpressionOrder.flatMap((expression) => baseRecord.frames?.[expression] ? [[expression, definition.assets.frames[expression]]] : [])) as Partial<Record<RuntimeExpression, string>>,
    };
    if (baseRecord.poseB) assets.poseB = definition.assets.poseB;
    if (baseRecord.medallion) assets.medallion = definition.assets.medallion;
    characters[character] = {
      staging: browserLocalCharacterStaging(character, definition.staging),
      calibration,
      frames,
      poseB: baseRecord.poseB ? calibratedGeometry(baseRecord.poseB.geometry, calibration) : undefined,
      medallion: baseRecord.medallion ? definition.assets.medallion : undefined,
      assets,
    };
  }
  return {
    format: BROWSER_LOCAL_CHARACTER_EXPORT_FORMAT,
    packageLabel,
    characters,
  };
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
