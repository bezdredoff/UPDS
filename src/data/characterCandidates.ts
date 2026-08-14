import type { CharacterPortraitFrameGeometry } from './characterProduction';

export const CHARACTER_CANDIDATE_FORMAT = 'upds-character-candidate-v1' as const;
export const EMI_NEUTRAL_CANDIDATE_ID = 'anm028d0-r1' as const;

export const sceneStudioArtSources = ['runtime', EMI_NEUTRAL_CANDIDATE_ID] as const;
export type SceneStudioArtSource = typeof sceneStudioArtSources[number];

export type CharacterNeutralCandidate = Readonly<{
  format: typeof CHARACTER_CANDIDATE_FORMAT;
  id: typeof EMI_NEUTRAL_CANDIDATE_ID;
  character: 'emi';
  expression: 'neutral';
  asset: string;
  canvas: Readonly<{ width: 1024; height: 1536 }>;
  pivot: Readonly<{ x: 0.5; y: 1 }>;
  geometry: CharacterPortraitFrameGeometry;
  visualHeightPx: number;
  bottomPaddingPx: number;
  alphaCenterOffsetPx: number;
  status: 'manual-qa';
  runtimeEligible: false;
  source: 'gpt-work-chroma-matte';
}>;

/**
 * Studio-only neutral candidate. It must not replace Emi's runtime rig or
 * canonical production manifest until lineup and scene QA are approved.
 */
export const emiNeutralCandidate: CharacterNeutralCandidate = Object.freeze({
  format: CHARACTER_CANDIDATE_FORMAT,
  id: EMI_NEUTRAL_CANDIDATE_ID,
  character: 'emi',
  expression: 'neutral',
  asset: './assets/characters/emi/candidates/anm028d0/neutral-r1.png',
  canvas: { width: 1024, height: 1536 },
  pivot: { x: 0.5, y: 1 },
  geometry: {
    alphaBounds: { left: 330, top: 80, right: 737, bottom: 1508 },
    eyeLineYPx: 244,
  },
  visualHeightPx: 1428,
  bottomPaddingPx: 28,
  alphaCenterOffsetPx: 21.5,
  status: 'manual-qa',
  runtimeEligible: false,
  source: 'gpt-work-chroma-matte',
} as const);

export function validateEmiNeutralCandidate(
  candidate: CharacterNeutralCandidate = emiNeutralCandidate,
): readonly string[] {
  const issues: string[] = [];
  const bounds = candidate.geometry.alphaBounds;
  if (candidate.format !== CHARACTER_CANDIDATE_FORMAT) issues.push('candidate format mismatch');
  if (candidate.canvas.width !== 1024 || candidate.canvas.height !== 1536) issues.push('candidate canvas must be 1024x1536');
  if (candidate.pivot.x !== 0.5 || candidate.pivot.y !== 1) issues.push('candidate pivot must be bottom-centre');
  if (bounds.left < 0 || bounds.top < 0 || bounds.right > candidate.canvas.width ||
      bounds.bottom > candidate.canvas.height || bounds.right <= bounds.left || bounds.bottom <= bounds.top) {
    issues.push('candidate alpha bounds leave the canvas');
  }
  if (candidate.visualHeightPx !== bounds.bottom - bounds.top) issues.push('candidate visual height differs from alpha bounds');
  if (candidate.bottomPaddingPx !== candidate.canvas.height - bounds.bottom) issues.push('candidate bottom padding differs from alpha bounds');
  if (candidate.alphaCenterOffsetPx !== (bounds.left + bounds.right) / 2 - candidate.canvas.width / 2) {
    issues.push('candidate centre offset differs from alpha bounds');
  }
  if (candidate.geometry.eyeLineYPx <= bounds.top || candidate.geometry.eyeLineYPx >= bounds.bottom) {
    issues.push('candidate eye line must cross the visible subject');
  }
  if (candidate.runtimeEligible !== false || candidate.status !== 'manual-qa') {
    issues.push('candidate must remain Studio-only before manual approval');
  }
  return issues;
}
