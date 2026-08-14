import {
  MOBILE_REGRESSION_VIEWPORTS,
  resolveViewportGeometry,
  type ViewportInsets,
  type ViewportSize,
} from '../platform/ViewportContract';
import { backgroundAssets, type BackgroundKey } from './narrative';
import {
  characterProductionManifest,
  productionCharacterKeys,
  type ProductionCharacterKey,
} from './characterProduction';

export const SCENE_STUDIO_CALIBRATION_FORMAT = 'upds-scene-studio-calibration-v1' as const;
export const SCENE_STUDIO_QA_REPORT_FORMAT = 'upds-scene-studio-qa-v1' as const;

export const sceneStudioViewportIds = [
  '320x568',
  '375x667',
  '390x844',
  '393x852',
  '430x932',
] as const;

export type SceneStudioViewportId = typeof sceneStudioViewportIds[number];
export type SceneStudioViewMode = 'scene' | 'lineup';

export type SceneStudioViewportProfile = Readonly<{
  id: SceneStudioViewportId;
  viewport: ViewportSize;
  representativeInsets: ViewportInsets;
  compact: boolean;
}>;

export type SceneStudioBackgroundCalibration = Readonly<{
  key: BackgroundKey;
  master: Readonly<{ width: 1080; height: 1920 }>;
  sceneIndex: number;
  focalPoint: Readonly<{ xPercent: number; yPercent: number }>;
  horizonYPercent: number;
  footlineYPercent: number;
  actorZone: Readonly<{
    leftPercent: number;
    topPercent: number;
    rightPercent: number;
    bottomPercent: number;
  }>;
  reviewStatus: 'estimated-needs-manual-approval';
}>;

export type SceneStudioCalibrationManifest = Readonly<{
  format: typeof SCENE_STUDIO_CALIBRATION_FORMAT;
  viewportSource: 'ANM-024-mobile-regression-matrix';
  safeAreaPolicy: 'representative-non-zero-insets';
  backgroundFit: 'runtime-contain-over-fill';
  coordinateSpace: 'background-master-percent';
  viewports: Readonly<Record<SceneStudioViewportId, SceneStudioViewportProfile>>;
  backgrounds: Readonly<Record<BackgroundKey, SceneStudioBackgroundCalibration>>;
}>;

const representativeInsets: ViewportInsets = Object.freeze({ top: 47, right: 0, bottom: 34, left: 0 });

const viewport = (id: SceneStudioViewportId, width: number, height: number): SceneStudioViewportProfile => ({
  id,
  viewport: { width, height },
  representativeInsets,
  compact: height <= 650 || width <= 340,
});

const background = (
  key: BackgroundKey,
  sceneIndex: number,
  focalX: number,
  focalY: number,
  horizonY: number,
  footlineY: number,
): SceneStudioBackgroundCalibration => ({
  key,
  master: { width: 1080, height: 1920 },
  sceneIndex,
  focalPoint: { xPercent: focalX, yPercent: focalY },
  horizonYPercent: horizonY,
  footlineYPercent: footlineY,
  actorZone: { leftPercent: 8, topPercent: 18, rightPercent: 92, bottomPercent: 94 },
  reviewStatus: 'estimated-needs-manual-approval',
});

/**
 * Initial measurements are intentionally marked estimated. They are visible QA
 * guides, not an assertion that the existing background perspective is approved.
 */
export const sceneStudioCalibrationManifest: SceneStudioCalibrationManifest = {
  format: SCENE_STUDIO_CALIBRATION_FORMAT,
  viewportSource: 'ANM-024-mobile-regression-matrix',
  safeAreaPolicy: 'representative-non-zero-insets',
  backgroundFit: 'runtime-contain-over-fill',
  coordinateSpace: 'background-master-percent',
  viewports: {
    '320x568': viewport('320x568', 320, 568),
    '375x667': viewport('375x667', 375, 667),
    '390x844': viewport('390x844', 390, 844),
    '393x852': viewport('393x852', 393, 852),
    '430x932': viewport('430x932', 430, 932),
  },
  backgrounds: {
    clubroom: background('clubroom', 0, 49, 42, 43, 87),
    lockerAthletics: background('lockerAthletics', 1, 50, 41, 40, 90),
    kentaroApartment: background('kentaroApartment', 3, 50, 40, 39, 89),
    poolLocker: background('poolLocker', 5, 53, 43, 42, 90),
    norihiroApartment: background('norihiroApartment', 7, 50, 39, 38, 87),
    studentCouncilAuditorium: background('studentCouncilAuditorium', 9, 49, 42, 43, 87),
    basketballLocker: background('basketballLocker', 11, 50, 41, 40, 90),
    textileWorkshop: background('textileWorkshop', 13, 50, 40, 39, 89),
    asterionLab: background('asterionLab', 15, 50, 39, 38, 87),
    lostFoundWarehouse: background('lostFoundWarehouse', 17, 50, 41, 40, 90),
    maintenanceRoom: background('maintenanceRoom', 19, 50, 41, 40, 90),
    combatClubHall: background('combatClubHall', 21, 50, 41, 40, 90),
    serviceYard: background('serviceYard', 23, 49, 42, 43, 87),
    asterionTransferPoint: background('asterionTransferPoint', 24, 50, 39, 38, 87),
    oldGymNight: background('oldGymNight', 25, 53, 43, 42, 90),
    campusPath: background('campusPath', 31, 49, 42, 43, 87),
    abandonedLaundry: background('abandonedLaundry', 32, 53, 43, 42, 90),
  },
};

export type SceneStudioCalibrationIssue = Readonly<{
  severity: 'error' | 'warning' | 'manual';
  code: 'staging-contract' | 'viewport-matrix' | 'safe-area' | 'background-set' | 'background-coordinate' |
    'background-review' | 'bottom-pivot' | 'master-rebuild' | 'golden-sample' | 'visual-style';
  subject?: string;
  detail: string;
}>;

export type SceneStudioContainBox = Readonly<{
  leftPercent: number;
  topPercent: number;
  widthPercent: number;
  heightPercent: number;
}>;

export function resolveSceneStudioContainBox(
  viewportSize: ViewportSize,
  master: Readonly<{ width: number; height: number }> = { width: 1080, height: 1920 },
): SceneStudioContainBox {
  const scale = Math.min(viewportSize.width / master.width, viewportSize.height / master.height);
  const width = master.width * scale;
  const height = master.height * scale;
  return {
    leftPercent: ((viewportSize.width - width) / 2 / viewportSize.width) * 100,
    topPercent: ((viewportSize.height - height) / 2 / viewportSize.height) * 100,
    widthPercent: (width / viewportSize.width) * 100,
    heightPercent: (height / viewportSize.height) * 100,
  };
}

export function backgroundPointToFramePercent(
  box: SceneStudioContainBox,
  xPercent: number,
  yPercent: number,
): Readonly<{ xPercent: number; yPercent: number }> {
  return {
    xPercent: box.leftPercent + box.widthPercent * xPercent / 100,
    yPercent: box.topPercent + box.heightPercent * yPercent / 100,
  };
}

export function validateSceneStudioCalibration(
  manifest: SceneStudioCalibrationManifest = sceneStudioCalibrationManifest,
): readonly SceneStudioCalibrationIssue[] {
  const issues: SceneStudioCalibrationIssue[] = [];
  const expectedViewports = MOBILE_REGRESSION_VIEWPORTS.map(({ width, height }) => `${width}x${height}`);
  if (Object.keys(manifest.viewports).join('|') !== expectedViewports.join('|')) {
    issues.push({ severity: 'error', code: 'viewport-matrix', detail: 'Scene Studio viewport set differs from ANM-024.' });
  }

  for (const profile of Object.values(manifest.viewports)) {
    const geometry = resolveViewportGeometry(profile.viewport, profile.representativeInsets);
    if (geometry.scene.width <= 0 || geometry.scene.height <= 0 || geometry.orientation !== 'portrait') {
      issues.push({ severity: 'error', code: 'safe-area', subject: profile.id, detail: `${profile.id} has invalid portrait safe-area geometry.` });
    }
  }

  const expectedBackgrounds = Object.keys(backgroundAssets);
  if (Object.keys(manifest.backgrounds).join('|') !== expectedBackgrounds.join('|')) {
    issues.push({ severity: 'error', code: 'background-set', detail: 'Calibration profiles do not match the runtime background catalog.' });
  }

  for (const profile of Object.values(manifest.backgrounds)) {
    const values = [
      profile.focalPoint.xPercent,
      profile.focalPoint.yPercent,
      profile.horizonYPercent,
      profile.footlineYPercent,
      profile.actorZone.leftPercent,
      profile.actorZone.topPercent,
      profile.actorZone.rightPercent,
      profile.actorZone.bottomPercent,
    ];
    const coordinatesValid = values.every((value) => Number.isFinite(value) && value >= 0 && value <= 100) &&
      profile.horizonYPercent < profile.footlineYPercent &&
      profile.actorZone.leftPercent < profile.actorZone.rightPercent &&
      profile.actorZone.topPercent < profile.actorZone.bottomPercent;
    if (!coordinatesValid) {
      issues.push({ severity: 'error', code: 'background-coordinate', subject: profile.key, detail: `${profile.key} calibration coordinates are invalid.` });
    }
  }

  const reference = characterProductionManifest.characters[characterProductionManifest.proportionContract.referenceCharacter];
  const referenceBottomPadding = characterProductionManifest.frameCanvas.height - reference.proportion.neutralAlphaBounds.bottom;
  for (const key of productionCharacterKeys) {
    const definition = characterProductionManifest.characters[key];
    const bottomPadding = characterProductionManifest.frameCanvas.height - definition.proportion.neutralAlphaBounds.bottom;
    if (Math.abs(bottomPadding - referenceBottomPadding) > 48) {
      issues.push({
        severity: 'warning',
        code: 'bottom-pivot',
        subject: key,
        detail: `${key} neutral alpha bottom padding is ${bottomPadding}px versus ${referenceBottomPadding}px for the Onoe reference.`,
      });
    }
    if (definition.visualApproval === 'rebuild-required') {
      issues.push({
        severity: 'warning',
        code: 'master-rebuild',
        subject: key,
        detail: `${key} is runtime-integrated but failed current lineup/style/full-body visual QA and requires a neutral-master rebuild.`,
      });
    }
  }

  return issues;
}

export function sceneStudioManualReviewIssues(backgroundKey: BackgroundKey): readonly SceneStudioCalibrationIssue[] {
  return [
    {
      severity: 'manual',
      code: 'background-review',
      subject: backgroundKey,
      detail: `${backgroundKey} horizon, footline, lighting and actor-zone measurements are estimates pending visual approval.`,
    },
    {
      severity: 'manual',
      code: 'golden-sample',
      detail: 'Compare the lineup with the approved external Golden Sample before accepting or generating expressions.',
    },
    {
      severity: 'manual',
      code: 'visual-style',
      detail: 'Style, anatomy, adult visual age, palette and light direction require human review; they are not inferred by the validator.',
    },
  ];
}

export type SceneStudioLineupMetric = Readonly<{
  character: ProductionCharacterKey;
  visualHeightPx: number;
  heightVsReference: number;
  bottomPaddingPx: number;
  alphaCenterOffsetPx: number;
  neutralEyeLineYPx: number;
  visualApproval: 'approved' | 'rebuild-required';
}>;

export function sceneStudioLineupMetrics(): readonly SceneStudioLineupMetric[] {
  const reference = characterProductionManifest.characters[characterProductionManifest.proportionContract.referenceCharacter];
  const referenceHeight = reference.proportion.visualHeightPx;
  const canvasCenter = characterProductionManifest.frameCanvas.width / 2;
  return productionCharacterKeys.map((character) => {
    const definition = characterProductionManifest.characters[character];
    const bounds = definition.proportion.neutralAlphaBounds;
    return {
      character,
      visualHeightPx: definition.proportion.visualHeightPx,
      heightVsReference: definition.proportion.visualHeightPx / referenceHeight,
      bottomPaddingPx: characterProductionManifest.frameCanvas.height - bounds.bottom,
      alphaCenterOffsetPx: (bounds.left + bounds.right) / 2 - canvasCenter,
      neutralEyeLineYPx: definition.proportion.neutralEyeLineYPx,
      visualApproval: definition.visualApproval,
    };
  });
}
