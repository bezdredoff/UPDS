export const VN_RUNTIME_PORTRAIT_HEIGHT_PERCENT = 178;
export const VN_RUNTIME_PORTRAIT_BOTTOM_PERCENT = -78;
export const VN_MASTER_CANVAS_HEIGHT_PX = 1536;
export const SCENE_STUDIO_DEFAULT_EYE_LINE_PERCENT = 55;

export type VnPortraitCamera = Readonly<{
  shotScale: number;
  heightPercent: number;
  topPercent: number;
  bottomPercent: number;
  resolvedEyeLinePercent?: number;
}>;

const rounded = (value: number): number => Math.round(value * 100) / 100;

/**
 * Derives reusable shot framing from the accepted playable-VN portrait camera.
 * Keeping top at 0 prevents smaller group shots from turning back into floating
 * full-body figures; the lower canvas remains occluded by the dialogue row.
 */
export function resolveVnPortraitCamera(shotScale = 1): VnPortraitCamera {
  if (!Number.isFinite(shotScale) || shotScale <= 0) {
    throw new Error(`VN portrait shot scale must be a positive finite number, got ${shotScale}`);
  }
  const heightPercent = rounded(VN_RUNTIME_PORTRAIT_HEIGHT_PERCENT * shotScale);
  return {
    shotScale,
    heightPercent,
    topPercent: 0,
    bottomPercent: rounded(100 - heightPercent),
  };
}

/**
 * Positions a portrait by an authored eye-line landmark instead of pinning the
 * top of its full-body canvas to the top of the stage. Scene Studio uses this
 * for trio shots and then refines the same formula against the measured focal
 * guide in the rendered viewport.
 */
export function resolveVnPortraitEyeLineCamera(
  shotScale: number,
  neutralEyeLineYPx: number,
  targetEyeLinePercent = SCENE_STUDIO_DEFAULT_EYE_LINE_PERCENT,
): VnPortraitCamera {
  if (!Number.isFinite(neutralEyeLineYPx) || neutralEyeLineYPx <= 0 || neutralEyeLineYPx >= VN_MASTER_CANVAS_HEIGHT_PX) {
    throw new Error(`VN portrait eye-line must be inside the ${VN_MASTER_CANVAS_HEIGHT_PX}px master canvas, got ${neutralEyeLineYPx}`);
  }
  if (!Number.isFinite(targetEyeLinePercent) || targetEyeLinePercent <= 0 || targetEyeLinePercent >= 100) {
    throw new Error(`VN target eye-line must be inside the stage, got ${targetEyeLinePercent}`);
  }
  const heightPercent = rounded(VN_RUNTIME_PORTRAIT_HEIGHT_PERCENT * shotScale);
  const eyeLineRatio = neutralEyeLineYPx / VN_MASTER_CANVAS_HEIGHT_PX;
  const topPercent = rounded(targetEyeLinePercent - heightPercent * eyeLineRatio);
  return {
    shotScale,
    heightPercent,
    topPercent,
    bottomPercent: rounded(100 - topPercent - heightPercent),
    resolvedEyeLinePercent: rounded(topPercent + heightPercent * eyeLineRatio),
  };
}
