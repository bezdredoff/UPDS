export const CHARACTER_PRODUCTION_FORMAT = 'upds-character-production-v2' as const;

export const runtimeExpressionOrder = ['neutral', 'smile', 'serious', 'surprised', 'embarrassed'] as const;
export type RuntimeExpression = typeof runtimeExpressionOrder[number];

export const productionCharacterKeys = ['miku', 'onoe', 'ayuki', 'emi'] as const;
export type ProductionCharacterKey = typeof productionCharacterKeys[number];

export const plannedCharacterKeys = ['kentaro', 'norihiro', 'mayu'] as const;
export type PlannedCharacterKey = typeof plannedCharacterKeys[number];
export type CharacterProductionKey = ProductionCharacterKey | PlannedCharacterKey;

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

export type CharacterProportion = Readonly<{
  neutralAlphaBounds: CharacterAlphaBounds;
  visualHeightPx: number;
}>;

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
  staging: CharacterStaging;
  proportion: CharacterProportion;
  assets: CharacterProductionAssets;
}>;

export type PlannedCharacterDefinition = Readonly<{
  status: 'planned';
  displayName: string;
  shortName: string;
  adultCharacter: true;
  age: number;
  speakerToken: string;
  speakerMatch: 'exact';
  placeholder: Readonly<{ initials: string; accent: string }>;
  authoredEmotionCoverage: readonly RuntimeExpression[];
  plannedPoseBFile: string;
  productionPriority: 'high' | 'medium';
  proportionApproval: 'required-before-production';
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
  characters: Readonly<Record<ProductionCharacterKey, ProductionCharacterDefinition>> &
    Readonly<Record<PlannedCharacterKey, PlannedCharacterDefinition>>;
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

const production = (
  key: ProductionCharacterKey,
  displayName: string,
  shortName: string,
  speakerToken: string,
  speakerMatch: 'exact' | 'prefix',
  poseBFile: string,
  medallionFile: string,
  neutralAlphaBounds: CharacterAlphaBounds,
): ProductionCharacterDefinition => {
  const root = `./assets/characters/${key}`;
  return {
    status: 'production',
    displayName,
    shortName,
    adultCharacter: true,
    speakerToken,
    speakerMatch,
    staging: { scale: 1, yPercent: 0 },
    proportion: {
      neutralAlphaBounds,
      visualHeightPx: neutralAlphaBounds.bottom - neutralAlphaBounds.top,
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
    ),
    onoe: production(
      'onoe', 'Сацуки Оноэ', 'Оноэ', 'ОНОЭ', 'exact',
      'pose_b_evidence_bag.png', 'portrait_neutral_256.png',
      { left: 316, top: 26, right: 697, bottom: 1510 },
    ),
    ayuki: production(
      'ayuki', 'Аюки Момосэ', 'Аюки', 'АЮКИ', 'exact',
      'pose_b_phone_theory.png', 'portrait_neutral_256.png',
      { left: 304, top: 18, right: 746, bottom: 1480 },
    ),
    emi: production(
      'emi', 'Эми Такахаси', 'Эми', 'ЭМИ', 'exact',
      'pose_b_arms_crossed.png', 'portrait_neutral_512.png',
      { left: 194, top: 92, right: 829, bottom: 1536 },
    ),
    kentaro: {
      status: 'planned',
      displayName: 'Кэнтаро Фудзита',
      shortName: 'Кэнтаро',
      adultCharacter: true,
      age: 20,
      speakerToken: 'КЭНТАРО',
      speakerMatch: 'exact',
      placeholder: { initials: 'К', accent: '#6588b0' },
      authoredEmotionCoverage: ['neutral', 'serious', 'embarrassed', 'smile', 'surprised'],
      plannedPoseBFile: 'pose_b_camera_explaining.png',
      productionPriority: 'high',
      proportionApproval: 'required-before-production',
    },
    norihiro: {
      status: 'planned',
      displayName: 'Норихиро Сэнда',
      shortName: 'Норихиро',
      adultCharacter: true,
      age: 21,
      speakerToken: 'НОРИХИРО',
      speakerMatch: 'exact',
      placeholder: { initials: 'Н', accent: '#4a9a8b' },
      authoredEmotionCoverage: ['neutral', 'serious', 'smile', 'surprised'],
      plannedPoseBFile: 'pose_b_tablet_keys.png',
      productionPriority: 'high',
      proportionApproval: 'required-before-production',
    },
    mayu: {
      status: 'planned',
      displayName: 'Маю Хаясака',
      shortName: 'Маю',
      adultCharacter: true,
      age: 22,
      speakerToken: 'МАЮ',
      speakerMatch: 'exact',
      placeholder: { initials: 'М', accent: '#a970a5' },
      authoredEmotionCoverage: ['neutral', 'serious'],
      plannedPoseBFile: 'pose_b_phone_documents.png',
      productionPriority: 'medium',
      proportionApproval: 'required-before-production',
    },
  },
};

export type CharacterProductionIssue = Readonly<{
  code: 'format' | 'runtime-expression' | 'adult-guardrail' | 'asset-set' | 'asset-path' | 'staging' | 'proportion' | 'planned-assets';
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

  for (const key of [...productionCharacterKeys, ...plannedCharacterKeys]) {
    const definition = manifest.characters[key];
    if (definition.adultCharacter !== true) {
      issues.push({ code: 'adult-guardrail', character: key, detail: `${key} must be explicitly adult` });
    }

    if (definition.status === 'production') {
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
    } else {
      if (definition.age < 18) {
        issues.push({ code: 'adult-guardrail', character: key, detail: `${key} planned age must be 18+` });
      }
      if ('assets' in definition) {
        issues.push({ code: 'planned-assets', character: key, detail: `${key} is planned and must not claim production assets` });
      }
      if (definition.proportionApproval !== 'required-before-production') {
        issues.push({
          code: 'proportion',
          character: key,
          detail: `${key} must require lineup proportion approval before production promotion`,
        });
      }
    }
  }

  return issues;
}
