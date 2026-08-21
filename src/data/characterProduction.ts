export const CHARACTER_PRODUCTION_FORMAT = 'upds-character-production-v2' as const;

export const runtimeExpressionOrder = ['neutral', 'smile', 'serious', 'surprised', 'embarrassed'] as const;
export type RuntimeExpression = typeof runtimeExpressionOrder[number];

export const productionCharacterKeys = [
  'miku',
  'onoe',
  'ayuki',
  'emi',
  'kentaro',
  'norihiro',
  'mayu',
  'rina',
  'kurose',
] as const;
export type ProductionCharacterKey = typeof productionCharacterKeys[number];

/** Compatibility export for callers that still expose the former placeholder lane. */
export const plannedCharacterKeys = [] as const;
export type PlannedCharacterKey = never;
export type CharacterProductionKey = ProductionCharacterKey;

export type CharacterStaging = Readonly<{
  scale: number;
  yPercent: number;
}>;

export type CharacterAlphaBounds = Readonly<{
  left: number;
  top: number;
  right: number;
  bottom: number;
}>;

export type CharacterPortraitFrameGeometry = Readonly<{
  alphaBounds: CharacterAlphaBounds;
  eyeLineYPx: number;
}>;

export type CharacterProportion = Readonly<{
  neutralAlphaBounds: CharacterAlphaBounds;
  visualHeightPx: number;
  neutralEyeLineYPx: number;
  frameGeometry: Readonly<Record<RuntimeExpression, CharacterPortraitFrameGeometry>>;
}>;

export type CharacterVisualApproval = 'approved' | 'rebuild-required';

export type CharacterProductionAssets = Readonly<{
  frames: Readonly<Record<RuntimeExpression, string>>;
  poseB: string;
  medallion: string;
}>;

export type ProductionCharacterDefinition = Readonly<{
  status: 'production';
  displayName: string;
  shortName: string;
  adultCharacter: true;
  speakerToken: string;
  speakerMatch: 'exact' | 'prefix';
  visualApproval: CharacterVisualApproval;
  staging: CharacterStaging;
  proportion: CharacterProportion;
  assets: CharacterProductionAssets;
}>;

export type CharacterProductionManifest = Readonly<{
  format: typeof CHARACTER_PRODUCTION_FORMAT;
  frameCanvas: Readonly<{ width: 1024; height: 1536 }>;
  pivot: Readonly<{ x: 0.5; y: 1 }>;
  proportionContract: Readonly<{
    measurement: 'neutral-alpha-bounds';
    referenceCharacter: 'onoe';
    encodeHeightInMasterCanvas: true;
    productionScaleDefault: 1;
    expressionHeightTolerancePx: 1;
    newCharacterApproval: 'lineup-required-before-production';
  }>;
  medallion: Readonly<{
    shape: 'square';
    acceptedSourceSizes: readonly [256, 512];
  }>;
  runtimeExpressions: typeof runtimeExpressionOrder;
  animationPolicy: Readonly<{
    mode: 'precomposed-static';
    blink: 'deferred';
    speaking: 'deferred';
  }>;
  characters: Readonly<Record<ProductionCharacterKey, ProductionCharacterDefinition>>;
}>;

const frames = (key: ProductionCharacterKey): Readonly<Record<RuntimeExpression, string>> => {
  const root = `./assets/characters/${key}/rig/pose_a/frames`;
  return {
    neutral: `${root}/frame-neutral.png`,
    smile: `${root}/frame-smile.png`,
    serious: `${root}/frame-serious.png`,
    surprised: `${root}/frame-surprised.png`,
    embarrassed: `${root}/frame-embarrassed.png`,
  };
};

const frameGeometry = (
  neutralAlphaBounds: CharacterAlphaBounds,
  eyeLineYPx: number,
  expressionBounds: Partial<Readonly<Record<RuntimeExpression, CharacterAlphaBounds>>> = {},
): Readonly<Record<RuntimeExpression, CharacterPortraitFrameGeometry>> => Object.freeze(
  Object.fromEntries(runtimeExpressionOrder.map((expression) => [
    expression,
    Object.freeze({ alphaBounds: expressionBounds[expression] ?? neutralAlphaBounds, eyeLineYPx }),
  ])) as Record<RuntimeExpression, CharacterPortraitFrameGeometry>,
);

const production = (
  key: ProductionCharacterKey,
  displayName: string,
  shortName: string,
  speakerToken: string,
  speakerMatch: 'exact' | 'prefix',
  poseBFile: string,
  medallionFile: string,
  neutralAlphaBounds: CharacterAlphaBounds,
  neutralEyeLineYPx: number,
  visualApproval: CharacterVisualApproval = 'approved',
  expressionBounds: Partial<Readonly<Record<RuntimeExpression, CharacterAlphaBounds>>> = {},
): ProductionCharacterDefinition => {
  const root = `./assets/characters/${key}`;
  return {
    status: 'production',
    displayName,
    shortName,
    adultCharacter: true,
    speakerToken,
    speakerMatch,
    visualApproval,
    staging: { scale: 1, yPercent: 0 },
    proportion: {
      neutralAlphaBounds,
      visualHeightPx: neutralAlphaBounds.bottom - neutralAlphaBounds.top,
      neutralEyeLineYPx,
      frameGeometry: frameGeometry(neutralAlphaBounds, neutralEyeLineYPx, expressionBounds),
    },
    assets: {
      frames: frames(key),
      poseB: `${root}/poses/${poseBFile}`,
      medallion: `${root}/medallions/${medallionFile}`,
    },
  };
};

export const characterProductionManifest: CharacterProductionManifest = {
  format: CHARACTER_PRODUCTION_FORMAT,
  frameCanvas: { width: 1024, height: 1536 },
  pivot: { x: 0.5, y: 1 },
  proportionContract: {
    measurement: 'neutral-alpha-bounds',
    referenceCharacter: 'onoe',
    encodeHeightInMasterCanvas: true,
    productionScaleDefault: 1,
    expressionHeightTolerancePx: 1,
    newCharacterApproval: 'lineup-required-before-production',
  },
  medallion: { shape: 'square', acceptedSourceSizes: [256, 512] },
  runtimeExpressions: runtimeExpressionOrder,
  animationPolicy: { mode: 'precomposed-static', blink: 'deferred', speaking: 'deferred' },
  characters: {
    miku: production(
      'miku', 'Мику Араи', 'Мику', 'МИКУ', 'prefix',
      'pose_b_pointing_sketchbook.png', 'portrait_neutral_256.png',
      { left: 359, top: 43, right: 651, bottom: 1418 },
      196,
    ),
    onoe: production(
      'onoe', 'Сацуки Оноэ', 'Оноэ', 'ОНОЭ', 'exact',
      'pose_b_evidence_bag.png', 'portrait_neutral_256.png',
      { left: 316, top: 26, right: 697, bottom: 1510 },
      158,
    ),
    ayuki: production(
      'ayuki', 'Аюки Момосэ', 'Аюки', 'АЮКИ', 'exact',
      'pose_b_phone_theory.png', 'portrait_neutral_256.png',
      { left: 304, top: 18, right: 746, bottom: 1480 },
      242,
    ),
    emi: production(
      'emi', 'Эми Такахаси', 'Эми', 'ЭМИ', 'exact',
      'pose_b_arms_crossed.png', 'portrait_neutral_512.png',
      { left: 194, top: 92, right: 829, bottom: 1536 },
      397,
      'approved',
      {
        smile: { left: 180, top: 92, right: 852, bottom: 1536 },
        serious: { left: 172, top: 92, right: 851, bottom: 1536 },
        surprised: { left: 172, top: 92, right: 851, bottom: 1536 },
        embarrassed: { left: 193, top: 93, right: 830, bottom: 1536 },
      },
    ),
    kentaro: production(
      'kentaro', 'Кэнтаро Фудзита', 'Кэнтаро', 'КЭНТАРО', 'exact',
      'pose_b_camera_explaining.png', 'portrait_neutral_256.png',
      { left: 217, top: 29, right: 807, bottom: 1508 },
      182,
    ),
    norihiro: production(
      'norihiro', 'Норихиро Сэнда', 'Норихиро', 'НОРИХИРО', 'exact',
      'pose_b_tablet_keys.png', 'portrait_neutral_256.png',
      { left: 221, top: 28, right: 803, bottom: 1508 },
      182,
    ),
    mayu: production(
      'mayu', 'Маю Хаясака', 'Маю', 'МАЮ', 'exact',
      'pose_b_phone_documents.png', 'portrait_neutral_256.png',
      { left: 268, top: 29, right: 756, bottom: 1508 },
      190,
    ),
    rina: production(
      'rina', 'Рина Сираиси', 'Рина', 'РИНА', 'exact',
      'pose_b_ledger_package.png', 'portrait_neutral_256.png',
      { left: 259, top: 28, right: 765, bottom: 1508 },
      200,
    ),
    kurose: production(
      'kurose', 'Рэйдзи Куросэ', 'Куросэ', 'КУРОСЭ', 'exact',
      'pose_b_lab_tablet.png', 'portrait_neutral_256.png',
      { left: 279, top: 28, right: 745, bottom: 1508 },
      180,
    ),
  },
};

export type CharacterProductionIssue = Readonly<{
  code: 'format' | 'runtime-expression' | 'adult-guardrail' | 'asset-set' | 'asset-path' | 'staging' | 'proportion' | 'portrait-landmark' | 'planned-assets';
  character?: CharacterProductionKey;
  detail: string;
}>;

export function validateCharacterProductionManifest(
  manifest: CharacterProductionManifest = characterProductionManifest,
): readonly CharacterProductionIssue[] {
  const issues: CharacterProductionIssue[] = [];

  if (manifest.format !== CHARACTER_PRODUCTION_FORMAT) {
    issues.push({ code: 'format', detail: `expected ${CHARACTER_PRODUCTION_FORMAT}, got ${manifest.format}` });
  }

  if (manifest.runtimeExpressions.join('|') !== runtimeExpressionOrder.join('|')) {
    issues.push({ code: 'runtime-expression', detail: 'runtime expression set/order differs from the production contract' });
  }

  for (const key of productionCharacterKeys) {
    const definition = manifest.characters[key];
    if (definition.adultCharacter !== true) {
      issues.push({ code: 'adult-guardrail', character: key, detail: `${key} must be explicitly adult` });
    }

    const frameNames = Object.keys(definition.assets.frames).sort();
    if (frameNames.join('|') !== [...runtimeExpressionOrder].sort().join('|')) {
      issues.push({ code: 'asset-set', character: key, detail: `${key} does not provide the five required expression frames` });
    }
    const assets = [...Object.values(definition.assets.frames), definition.assets.poseB, definition.assets.medallion];
    if (assets.length !== 7 || new Set(assets).size !== 7) {
      issues.push({ code: 'asset-set', character: key, detail: `${key} must provide seven distinct runtime assets` });
    }
    const expectedRoot = `./assets/characters/${key}/`;
    for (const asset of assets) {
      if (!asset.startsWith(expectedRoot)) {
        issues.push({ code: 'asset-path', character: key, detail: `${asset} must remain under ${expectedRoot}` });
      }
    }
    if (!Number.isFinite(definition.staging.scale) || definition.staging.scale <= 0 ||
        !Number.isFinite(definition.staging.yPercent)) {
      issues.push({ code: 'staging', character: key, detail: `${key} staging values must be finite and scale must be positive` });
    }
    if (definition.staging.scale !== manifest.proportionContract.productionScaleDefault) {
      issues.push({
        code: 'proportion',
        character: key,
        detail: `${key} production height must be authored in the master canvas instead of compensated with runtime scale`,
      });
    }
    const bounds = definition.proportion.neutralAlphaBounds;
    const boundsAreValid = (candidate: CharacterAlphaBounds): boolean =>
      Number.isInteger(candidate.left) && Number.isInteger(candidate.top) &&
      Number.isInteger(candidate.right) && Number.isInteger(candidate.bottom) &&
      candidate.left >= 0 && candidate.top >= 0 &&
      candidate.right <= manifest.frameCanvas.width && candidate.bottom <= manifest.frameCanvas.height &&
      candidate.right > candidate.left && candidate.bottom > candidate.top;
    const validBounds =
      Number.isInteger(bounds.left) && Number.isInteger(bounds.top) &&
      Number.isInteger(bounds.right) && Number.isInteger(bounds.bottom) &&
      bounds.left >= 0 && bounds.top >= 0 &&
      bounds.right <= manifest.frameCanvas.width && bounds.bottom <= manifest.frameCanvas.height &&
      bounds.right > bounds.left && bounds.bottom > bounds.top;
    if (!validBounds || definition.proportion.visualHeightPx !== bounds.bottom - bounds.top) {
      issues.push({
        code: 'proportion',
        character: key,
        detail: `${key} neutral alpha bounds/visual height are invalid for the shared master canvas`,
      });
    }
    const neutralGeometry = definition.proportion.frameGeometry.neutral;
    if (neutralGeometry.alphaBounds.left !== bounds.left || neutralGeometry.alphaBounds.top !== bounds.top ||
        neutralGeometry.alphaBounds.right !== bounds.right || neutralGeometry.alphaBounds.bottom !== bounds.bottom ||
        neutralGeometry.eyeLineYPx !== definition.proportion.neutralEyeLineYPx) {
      issues.push({
        code: 'portrait-landmark',
        character: key,
        detail: `${key} neutral frame geometry must mirror the canonical neutral proportion fields`,
      });
    }
    for (const expression of runtimeExpressionOrder) {
      const geometry = definition.proportion.frameGeometry[expression];
      if (!geometry) {
        issues.push({
          code: 'portrait-landmark',
          character: key,
          detail: `${key}:${expression} is missing selected-frame guide geometry`,
        });
        continue;
      }
      const eyeLine = geometry.eyeLineYPx;
      const frameBounds = geometry.alphaBounds;
      if (!boundsAreValid(frameBounds) || !Number.isInteger(eyeLine) ||
          eyeLine <= frameBounds.top || eyeLine >= frameBounds.bottom ||
          eyeLine > frameBounds.top + (frameBounds.bottom - frameBounds.top) * 0.35) {
        issues.push({
          code: 'portrait-landmark',
          character: key,
          detail: `${key}:${expression} alpha bounds and eye-line must describe the selected runtime frame`,
        });
      }
    }
  }

  return issues;
}
