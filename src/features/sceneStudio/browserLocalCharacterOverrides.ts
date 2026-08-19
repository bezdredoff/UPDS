import {
  characterProductionManifest,
  productionCharacterKeys,
  runtimeExpressionOrder,
  type CharacterAlphaBounds,
  type CharacterPortraitFrameGeometry,
  type ProductionCharacterKey,
  type RuntimeExpression,
} from '../../data/characterProduction';
import type {
  BrowserLocalCharacterAssetOverrides,
  BrowserLocalCharacterAssetRecord,
  BrowserLocalCharacterSummary,
  CharacterRuntimeFrameOverride,
  CharacterRuntimePoseOverride,
} from '../../data/characterRuntimeOverrides';

export const BROWSER_LOCAL_CHARACTER_OVERRIDE_FORMAT = 'upds-browser-local-character-override-v1' as const;

export type BrowserLocalCharacterOverrideLoadResult = Readonly<{
  format: typeof BROWSER_LOCAL_CHARACTER_OVERRIDE_FORMAT;
  packageLabel: string;
  activeAssetCount: number;
  summaries: readonly BrowserLocalCharacterSummary[];
  warnings: readonly string[];
}>;

type MappedAsset = Readonly<{ character: ProductionCharacterKey; kind: 'frame'; expression: RuntimeExpression } | { character: ProductionCharacterKey; kind: 'pose-b' | 'medallion' }>;

const assetPathMap: Readonly<Record<string, MappedAsset>> = Object.freeze(Object.fromEntries(productionCharacterKeys.flatMap((character) => {
  const definition = characterProductionManifest.characters[character];
  return [
    ...runtimeExpressionOrder.map((expression) => [definition.assets.frames[expression], { character, kind: 'frame' as const, expression }]),
    [definition.assets.poseB, { character, kind: 'pose-b' as const }],
    [definition.assets.medallion, { character, kind: 'medallion' as const }],
  ];
})) as Record<string, MappedAsset>);

function normalizeZipAssetPath(path: string): string | null {
  const normalized = path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\//, '');
  const marker = 'public/assets/characters/';
  const markerIndex = normalized.indexOf(marker);
  if (markerIndex === -1) return null;
  return `./assets/characters/${normalized.slice(markerIndex + marker.length)}`;
}

function dataViewAt(buffer: ArrayBuffer, byteOffset: number): DataView {
  return new DataView(buffer, byteOffset);
}

function findEndOfCentralDirectory(view: DataView): number {
  for (let offset = view.byteLength - 22; offset >= Math.max(0, view.byteLength - 65557); offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) return offset;
  }
  throw new Error('ZIP central directory was not found.');
}

async function inflateDeflateRaw(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('This browser does not support ZIP deflate decompression.');
  }
  const stream = new DecompressionStream('deflate-raw');
  const writer = new Response(new Blob([data]).stream().pipeThrough(stream));
  return new Uint8Array(await writer.arrayBuffer());
}

async function unzipPngEntries(buffer: ArrayBuffer): Promise<ReadonlyMap<string, Blob>> {
  const view = new DataView(buffer);
  const eocdOffset = findEndOfCentralDirectory(view);
  const entryCount = view.getUint16(eocdOffset + 10, true);
  const centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);
  let offset = centralDirectoryOffset;
  const entries = new Map<string, Blob>();

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) throw new Error('ZIP central directory entry is corrupted.');
    const compression = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const fileNameLength = view.getUint16(offset + 28, true);
    const extraFieldLength = view.getUint16(offset + 30, true);
    const fileCommentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const fileName = new TextDecoder().decode(new Uint8Array(buffer, offset + 46, fileNameLength));
    offset += 46 + fileNameLength + extraFieldLength + fileCommentLength;

    if (!/\.png$/i.test(fileName)) continue;

    const localHeader = dataViewAt(buffer, localHeaderOffset);
    if (localHeader.getUint32(0, true) !== 0x04034b50) throw new Error(`ZIP local header is corrupted for ${fileName}.`);
    const localNameLength = localHeader.getUint16(26, true);
    const localExtraLength = localHeader.getUint16(28, true);
    const dataOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressed = new Uint8Array(buffer, dataOffset, compressedSize);
    const raw = compression === 0
      ? compressed
      : compression === 8
        ? await inflateDeflateRaw(compressed)
        : (() => { throw new Error(`Unsupported ZIP compression method ${compression} for ${fileName}.`); })();
    entries.set(fileName, new Blob([raw], { type: 'image/png' }));
  }

  return entries;
}

async function loadImageBitmapFallback(blob: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') return createImageBitmap(blob);
  if (typeof Image === 'undefined') throw new Error('Image decoding is unavailable in this environment.');
  const image = new Image();
  image.decoding = 'async';
  const objectUrl = URL.createObjectURL(blob);
  try {
    image.src = objectUrl;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function measurePng(blob: Blob): Promise<Readonly<{ width: number; height: number; alphaBounds: CharacterAlphaBounds }>> {
  const bitmap = await loadImageBitmapFallback(blob);
  const width = 'width' in bitmap ? bitmap.width : 0;
  const height = 'height' in bitmap ? bitmap.height : 0;
  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(width, height)
    : Object.assign(document.createElement('canvas'), { width, height });
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Unable to measure PNG alpha bounds.');
  context.clearRect(0, 0, width, height);
  context.drawImage(bitmap as CanvasImageSource, 0, 0);
  const imageData = context.getImageData(0, 0, width, height).data;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (imageData[(y * width + x) * 4 + 3] === 0) continue;
      if (x < left) left = x;
      if (y < top) top = y;
      if (x > right) right = x;
      if (y > bottom) bottom = y;
    }
  }
  if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close();
  if (right < left || bottom < top) throw new Error('PNG contains no visible pixels.');
  return {
    width,
    height,
    alphaBounds: { left, top, right: right + 1, bottom: bottom + 1 },
  };
}

function clampEyeLine(alphaBounds: CharacterAlphaBounds, y: number): number {
  return Math.max(alphaBounds.top + 1, Math.min(alphaBounds.bottom - 1, Math.round(y)));
}

function geometryFromMeasurement(
  character: ProductionCharacterKey,
  expression: RuntimeExpression,
  alphaBounds: CharacterAlphaBounds,
): CharacterPortraitFrameGeometry {
  const base = characterProductionManifest.characters[character].proportion.frameGeometry[expression];
  const offsetFromTop = base.eyeLineYPx - base.alphaBounds.top;
  return {
    alphaBounds,
    eyeLineYPx: clampEyeLine(alphaBounds, alphaBounds.top + offsetFromTop),
  };
}

function poseGeometryFromMeasurement(character: ProductionCharacterKey, alphaBounds: CharacterAlphaBounds): CharacterPortraitFrameGeometry {
  const base = characterProductionManifest.characters[character].proportion.frameGeometry.neutral;
  const offsetFromTop = base.eyeLineYPx - base.alphaBounds.top;
  return {
    alphaBounds,
    eyeLineYPx: clampEyeLine(alphaBounds, alphaBounds.top + offsetFromTop),
  };
}

function buildFrameOverride(
  character: ProductionCharacterKey,
  expression: RuntimeExpression,
  asset: string,
  alphaBounds: CharacterAlphaBounds,
  packageLabel: string,
): CharacterRuntimeFrameOverride {
  return {
    asset,
    geometry: geometryFromMeasurement(character, expression, alphaBounds),
    visualApproval: 'approved',
    sourceCandidateId: `browser-local:${packageLabel}`,
  };
}

function buildPoseOverride(
  character: ProductionCharacterKey,
  asset: string,
  alphaBounds: CharacterAlphaBounds,
  packageLabel: string,
): CharacterRuntimePoseOverride {
  return {
    asset,
    geometry: poseGeometryFromMeasurement(character, alphaBounds),
    sourceCandidateId: `browser-local:${packageLabel}`,
  };
}

function createSummary(character: ProductionCharacterKey, record: BrowserLocalCharacterAssetRecord): BrowserLocalCharacterSummary {
  const frameCount = record.frames ? Object.keys(record.frames).length : 0;
  return {
    character,
    frameCount,
    poseB: Boolean(record.poseB),
    medallion: Boolean(record.medallion),
    assetCount: frameCount + (record.poseB ? 1 : 0) + (record.medallion ? 1 : 0),
  };
}

type MutableBrowserLocalCharacterAssetRecord = {
  frames?: Partial<Record<RuntimeExpression, CharacterRuntimeFrameOverride>>;
  poseB?: CharacterRuntimePoseOverride;
  medallion?: BrowserLocalCharacterAssetRecord['medallion'];
};

export async function loadBrowserLocalCharacterOverrideZip(file: File): Promise<Readonly<{
  overrides: BrowserLocalCharacterAssetOverrides;
  result: BrowserLocalCharacterOverrideLoadResult;
}>> {
  const entries = await unzipPngEntries(await file.arrayBuffer());
  const overrides: Partial<Record<ProductionCharacterKey, MutableBrowserLocalCharacterAssetRecord>> = {};
  const warnings: string[] = [];
  const createdUrls: string[] = [];

  try {
    for (const [entryName, blob] of entries.entries()) {
    const assetPath = normalizeZipAssetPath(entryName);
    if (!assetPath) continue;
    const mapping = assetPathMap[assetPath];
    if (!mapping) continue;
    const record = (overrides[mapping.character] ??= {} as MutableBrowserLocalCharacterAssetRecord);
    if (mapping.kind === 'medallion') {
      const measurement = await measurePng(blob);
      if (![256, 512].includes(measurement.width) || measurement.width !== measurement.height) {
        warnings.push(`${entryName}: medallion must remain square 256px or 512px.`);
        continue;
      }
      const medallionUrl = URL.createObjectURL(blob);
      createdUrls.push(medallionUrl);
      record.medallion = { asset: medallionUrl, sourceCandidateId: `browser-local:${file.name}` };
      continue;
    }

    const measurement = await measurePng(blob);
    if (measurement.width !== 1024 || measurement.height !== 1536) {
      warnings.push(`${entryName}: expected 1024x1536 PNG, got ${measurement.width}x${measurement.height}.`);
      continue;
    }

    const asset = URL.createObjectURL(blob);
    createdUrls.push(asset);
    if (mapping.kind === 'frame') {
      record.frames = { ...(record.frames ?? {}), [mapping.expression]: buildFrameOverride(mapping.character, mapping.expression, asset, measurement.alphaBounds, file.name) };
    } else {
      record.poseB = buildPoseOverride(mapping.character, asset, measurement.alphaBounds, file.name);
    }
  }

    const typedOverrides = overrides as BrowserLocalCharacterAssetOverrides;
    const summaries = productionCharacterKeys
      .filter((character) => overrides[character])
      .map((character) => createSummary(character, overrides[character]!));
    const activeAssetCount = summaries.reduce((sum, summary) => sum + summary.assetCount, 0);
    if (activeAssetCount === 0) throw new Error('ZIP did not contain direct production character replacements.');

    return {
      overrides: typedOverrides,
      result: {
        format: BROWSER_LOCAL_CHARACTER_OVERRIDE_FORMAT,
        packageLabel: file.name,
        activeAssetCount,
        summaries,
        warnings,
      },
    };
  } catch (error) {
    if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      for (const url of createdUrls) URL.revokeObjectURL(url);
    }
    throw error;
  }
}
