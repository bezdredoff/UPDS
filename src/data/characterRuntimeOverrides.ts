import type {
  CharacterPortraitFrameGeometry,
  CharacterStaging,
  ProductionCharacterKey,
  RuntimeExpression,
} from './characterProduction';
import { characterProductionManifest, runtimeExpressionOrder } from './characterProduction';

export const CHARACTER_RUNTIME_OVERRIDE_FORMAT = 'upds-character-runtime-override-v1' as const;
export const BROWSER_LOCAL_CHARACTER_EXPORT_FORMAT = 'upds-browser-local-character-export-v3' as const;

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
  xPercent: number;
  yPercent: number;
}>;

export type BrowserLocalResolvedStaging = Readonly<CharacterStaging & { xPercent: number }>;

export type BrowserLocalCharacterCalibrationContext = Readonly<{
  presetId: string;
  slotId: string;
}>;

export type BrowserLocalCompositionAssignment = Readonly<{
  character: ProductionCharacterKey;
  expression: RuntimeExpression;
  pose: 'pose-a' | 'pose-b';
}>;

export type BrowserLocalCompositionAssignments = Readonly<Record<
  string,
  Readonly<Record<string, BrowserLocalCompositionAssignment>>
>>;

type BrowserLocalCharacterCalibrationState = Readonly<{
  global?: BrowserLocalCharacterCalibration;
  perSlot?: Readonly<Record<string, BrowserLocalCharacterCalibration>>;
}>;

export type BrowserLocalCharacterCalibrationSnapshot = Readonly<{
  calibration: BrowserLocalCharacterCalibration;
  staging: BrowserLocalResolvedStaging;
  frames: Readonly<Partial<Record<RuntimeExpression, CharacterPortraitFrameGeometry>>>;
  poseB?: CharacterPortraitFrameGeometry;
}>;

export type BrowserLocalCharacterSlotCalibrationSnapshot = BrowserLocalCharacterCalibrationSnapshot & Readonly<{
  presetId: string;
  slotId: string;
}>;

export type BrowserLocalCharacterExportSnapshot = Readonly<{
  format: typeof BROWSER_LOCAL_CHARACTER_EXPORT_FORMAT;
  packageLabel: string | null;
  compositionAssignments: BrowserLocalCompositionAssignments;
  characters: Readonly<Partial<Record<ProductionCharacterKey, Readonly<{
    assets: Readonly<{
      frames: Readonly<Partial<Record<RuntimeExpression, string>>>;
      poseB?: string;
      medallion?: string;
    }>;
    default: BrowserLocalCharacterCalibrationSnapshot;
    slotOverrides: Readonly<Record<string, BrowserLocalCharacterSlotCalibrationSnapshot>>;
  }>>>>;
}>;

const DEFAULT_CALIBRATION: BrowserLocalCharacterCalibration = Object.freeze({
  eyeLineOffsetPx: 0,
  bottomOffsetPx: 0,
  scale: 1,
  xPercent: 0,
  yPercent: 0,
});

export const characterRuntimeFrameOverrides: Readonly<
  Partial<Record<ProductionCharacterKey, Readonly<Partial<Record<RuntimeExpression, CharacterRuntimeFrameOverride>>>>>
> = Object.freeze({});

let browserLocalCharacterOverrides: BrowserLocalCharacterAssetOverrides = Object.freeze({});
let browserLocalOverrideUrls: string[] = [];
let browserLocalCharacterCalibrations: Partial<Record<ProductionCharacterKey, BrowserLocalCharacterCalibrationState>> = Object.freeze({});

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function normalizeCalibration(
  current: BrowserLocalCharacterCalibration,
  patch: Partial<BrowserLocalCharacterCalibration>,
): BrowserLocalCharacterCalibration {
  return Object.freeze({
    eyeLineOffsetPx: Number.isFinite(patch.eyeLineOffsetPx) ? Math.round(patch.eyeLineOffsetPx!) : current.eyeLineOffsetPx,
    bottomOffsetPx: Number.isFinite(patch.bottomOffsetPx) ? Math.round(patch.bottomOffsetPx!) : current.bottomOffsetPx,
    scale: Number.isFinite(patch.scale) ? round(clamp(patch.scale!, 0.6, 1.6), 3) : current.scale,
    xPercent: Number.isFinite(patch.xPercent) ? round(clamp(patch.xPercent!, -30, 30), 2) : current.xPercent,
    yPercent: Number.isFinite(patch.yPercent) ? round(clamp(patch.yPercent!, -30, 30), 2) : current.yPercent,
  });
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

function globalCalibrationFor(character: ProductionCharacterKey): BrowserLocalCharacterCalibration {
  return browserLocalCharacterCalibrations[character]?.global ?? DEFAULT_CALIBRATION;
}

function calibrationContextKey(context: BrowserLocalCharacterCalibrationContext): string {
  return `${context.presetId}/${context.slotId}`;
}

function parseCalibrationContextKey(key: string): BrowserLocalCharacterCalibrationContext {
  const separator = key.indexOf('/');
  return separator === -1
    ? { presetId: key, slotId: '' }
    : { presetId: key.slice(0, separator), slotId: key.slice(separator + 1) };
}

function calibrationFor(
  character: ProductionCharacterKey,
  context?: BrowserLocalCharacterCalibrationContext,
): BrowserLocalCharacterCalibration {
  const state = browserLocalCharacterCalibrations[character];
  if (context) {
    const slotCalibration = state?.perSlot?.[calibrationContextKey(context)];
    if (slotCalibration) return slotCalibration;
  }
  return state?.global ?? DEFAULT_CALIBRATION;
}

export function browserLocalCharacterCalibration(
  character: ProductionCharacterKey,
  context?: BrowserLocalCharacterCalibrationContext,
): BrowserLocalCharacterCalibration {
  return calibrationFor(character, context);
}

export function hasBrowserLocalCharacterSlotCalibration(
  character: ProductionCharacterKey,
  context: BrowserLocalCharacterCalibrationContext,
): boolean {
  return Boolean(browserLocalCharacterCalibrations[character]?.perSlot?.[calibrationContextKey(context)]);
}

export function browserLocalCharacterSlotKeys(character: ProductionCharacterKey): readonly string[] {
  return Object.keys(browserLocalCharacterCalibrations[character]?.perSlot ?? {}).sort();
}

export function applyBrowserLocalCharacterCalibration(
  character: ProductionCharacterKey,
  patch: Partial<BrowserLocalCharacterCalibration>,
  context?: BrowserLocalCharacterCalibrationContext,
): void {
  const state = browserLocalCharacterCalibrations[character] ?? {};
  if (context) {
    const key = calibrationContextKey(context);
    const current = calibrationFor(character, context);
    browserLocalCharacterCalibrations = Object.freeze({
      ...browserLocalCharacterCalibrations,
      [character]: Object.freeze({
        ...state,
        perSlot: Object.freeze({
          ...(state.perSlot ?? {}),
          [key]: normalizeCalibration(current, patch),
        }),
      }),
    });
    return;
  }
  browserLocalCharacterCalibrations = Object.freeze({
    ...browserLocalCharacterCalibrations,
    [character]: Object.freeze({ ...state, global: normalizeCalibration(globalCalibrationFor(character), patch) }),
  });
}

export function copyBrowserLocalCharacterDefaultCalibrationToSlot(
  character: ProductionCharacterKey,
  context: BrowserLocalCharacterCalibrationContext,
): void {
  const state = browserLocalCharacterCalibrations[character] ?? {};
  const key = calibrationContextKey(context);
  browserLocalCharacterCalibrations = Object.freeze({
    ...browserLocalCharacterCalibrations,
    [character]: Object.freeze({
      ...state,
      perSlot: Object.freeze({
        ...(state.perSlot ?? {}),
        [key]: Object.freeze({ ...globalCalibrationFor(character) }),
      }),
    }),
  });
}

export function resetBrowserLocalCharacterDefaultCalibration(character: ProductionCharacterKey): void {
  const state = browserLocalCharacterCalibrations[character];
  if (!state) return;
  browserLocalCharacterCalibrations = Object.freeze({
    ...browserLocalCharacterCalibrations,
    [character]: Object.freeze({ perSlot: state.perSlot ?? Object.freeze({}) }),
  });
}

export function resetBrowserLocalCharacterCalibration(
  character?: ProductionCharacterKey,
  context?: BrowserLocalCharacterCalibrationContext,
): void {
  if (!character) {
    browserLocalCharacterCalibrations = Object.freeze({});
    return;
  }
  const state = browserLocalCharacterCalibrations[character];
  if (!state) return;
  if (context) {
    const nextSlots = { ...(state.perSlot ?? {}) };
    delete nextSlots[calibrationContextKey(context)];
    browserLocalCharacterCalibrations = Object.freeze({
      ...browserLocalCharacterCalibrations,
      [character]: Object.freeze({ ...state, perSlot: Object.freeze(nextSlots) }),
    });
    return;
  }
  const next = { ...browserLocalCharacterCalibrations };
  delete next[character];
  browserLocalCharacterCalibrations = Object.freeze(next);
}

export function hasBrowserLocalCharacterCalibration(): boolean {
  return Object.keys(browserLocalCharacterCalibrations).length > 0;
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
  context?: BrowserLocalCharacterCalibrationContext,
): CharacterRuntimeFrameOverride | null {
  const base = browserLocalCharacterOverrides[character]?.frames?.[expression] ?? null;
  return base
    ? { ...base, geometry: calibratedGeometry(base.geometry, calibrationFor(character, context)) }
    : null;
}

export function browserLocalPoseOverride(
  character: ProductionCharacterKey,
  context?: BrowserLocalCharacterCalibrationContext,
): CharacterRuntimePoseOverride | null {
  const base = browserLocalCharacterOverrides[character]?.poseB ?? null;
  return base
    ? { ...base, geometry: calibratedGeometry(base.geometry, calibrationFor(character, context)) }
    : null;
}

export function browserLocalMedallionOverride(character: ProductionCharacterKey): CharacterRuntimeMedallionOverride | null {
  return browserLocalCharacterOverrides[character]?.medallion ?? null;
}

export function browserLocalCharacterStaging(
  character: ProductionCharacterKey,
  fallback: CharacterStaging,
  context?: BrowserLocalCharacterCalibrationContext,
): CharacterStaging {
  const calibration = calibrationFor(character, context);
  return {
    scale: round(fallback.scale * calibration.scale, 3),
    yPercent: round(fallback.yPercent + calibration.yPercent, 2),
  };
}

export function browserLocalCharacterXPercent(
  character: ProductionCharacterKey,
  context?: BrowserLocalCharacterCalibrationContext,
): number {
  return calibrationFor(character, context).xPercent;
}

function calibrationSnapshot(
  character: ProductionCharacterKey,
  calibration: BrowserLocalCharacterCalibration,
): BrowserLocalCharacterCalibrationSnapshot {
  const baseRecord = browserLocalCharacterOverrides[character];
  const definition = characterProductionManifest.characters[character];
  const frames = Object.fromEntries(runtimeExpressionOrder.flatMap((expression) => {
    const frame = baseRecord?.frames?.[expression];
    return frame ? [[expression, calibratedGeometry(frame.geometry, calibration)]] : [];
  })) as Partial<Record<RuntimeExpression, CharacterPortraitFrameGeometry>>;
  return {
    calibration,
    staging: {
      scale: round(definition.staging.scale * calibration.scale, 3),
      xPercent: calibration.xPercent,
      yPercent: round(definition.staging.yPercent + calibration.yPercent, 2),
    },
    frames,
    poseB: baseRecord?.poseB ? calibratedGeometry(baseRecord.poseB.geometry, calibration) : undefined,
  };
}

function exportCharacters(): readonly ProductionCharacterKey[] {
  return [...new Set([
    ...browserLocalCharacterOverrideCharacters(),
    ...Object.keys(browserLocalCharacterCalibrations) as ProductionCharacterKey[],
  ])];
}

export function browserLocalCharacterExportSnapshot(
  packageLabel: string | null = null,
  compositionAssignments: BrowserLocalCompositionAssignments = {},
): BrowserLocalCharacterExportSnapshot {
  const characters: Partial<Record<ProductionCharacterKey, BrowserLocalCharacterExportSnapshot['characters'][ProductionCharacterKey]>> = {};
  for (const character of exportCharacters()) {
    const baseRecord = browserLocalCharacterOverrides[character];
    const definition = characterProductionManifest.characters[character];
    const assets: {
      frames: Partial<Record<RuntimeExpression, string>>;
      poseB?: string;
      medallion?: string;
    } = {
      frames: Object.fromEntries(runtimeExpressionOrder.flatMap((expression) => baseRecord?.frames?.[expression]
        ? [[expression, definition.assets.frames[expression]]]
        : [])) as Partial<Record<RuntimeExpression, string>>,
    };
    if (baseRecord?.poseB) assets.poseB = definition.assets.poseB;
    if (baseRecord?.medallion) assets.medallion = definition.assets.medallion;
    const slotOverrides = Object.fromEntries(browserLocalCharacterSlotKeys(character).map((key) => {
      const context = parseCalibrationContextKey(key);
      return [key, {
        ...calibrationSnapshot(character, calibrationFor(character, context)),
        presetId: context.presetId,
        slotId: context.slotId,
      } satisfies BrowserLocalCharacterSlotCalibrationSnapshot];
    }));
    characters[character] = {
      assets,
      default: calibrationSnapshot(character, globalCalibrationFor(character)),
      slotOverrides,
    };
  }
  return {
    format: BROWSER_LOCAL_CHARACTER_EXPORT_FORMAT,
    packageLabel,
    compositionAssignments,
    characters,
  };
}

export function runtimeFrameOverride(
  character: ProductionCharacterKey,
  expression: RuntimeExpression,
  context?: BrowserLocalCharacterCalibrationContext,
): CharacterRuntimeFrameOverride | null {
  return browserLocalExpressionOverride(character, expression, context) ?? characterRuntimeFrameOverrides[character]?.[expression] ?? null;
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
