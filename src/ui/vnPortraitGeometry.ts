export const VN_RUNTIME_PORTRAIT_HEIGHT_PERCENT = 178;
export const VN_RUNTIME_PORTRAIT_BOTTOM_PERCENT = -78;

export type VnPortraitCamera = Readonly<{
  shotScale: number;
  heightPercent: number;
  bottomPercent: number;
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
    bottomPercent: rounded(100 - heightPercent),
  };
}
