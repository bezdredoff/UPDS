import type { CharacterPortraitFrameGeometry } from './characterProduction';

export const CHARACTER_CANDIDATE_FORMAT = 'upds-character-candidate-v1' as const;
export const EMI_NEUTRAL_CANDIDATE_ID = 'anm028d0-r1' as const;
export const EMI_SMILE_CANDIDATE_ID = 'anm028d1-r1' as const;

export const sceneStudioArtSources = ['runtime', EMI_NEUTRAL_CANDIDATE_ID, EMI_SMILE_CANDIDATE_ID] as const;
export type SceneStudioArtSource = typeof sceneStudioArtSources[number];

export type CharacterFrameCandidate = Readonly<{
  format: typeof CHARACTER_CANDIDATE_FORMAT;
  id: typeof EMI_NEUTRAL_CANDIDATE_ID | typeof EMI_SMILE_CANDIDATE_ID;
  character: 'emi';
  expression: 'neutral' | 'smile';
  asset: string;
  canvas: Readonly<{ width: 1024; height: 1536 }>;
  pivot: Readonly<{ x: 0.5; y: 1 }>;
  geometry: CharacterPortraitFrameGeometry;
  visualHeightPx: number;
  bottomPaddingPx: number;
  alphaCenterOffsetPx: number;
  status: 'approved-master' | 'manual-qa';
  runtimeEligible: false;
  source: 'gpt-work-chroma-matte' | 'gpt-work-face-roi';
}>;

export type CharacterNeutralCandidate = CharacterFrameCandidate & Readonly<{
  id: typeof EMI_NEUTRAL_CANDIDATE_ID;
  expression: 'neutral';
  status: 'approved-master';
  source: 'gpt-work-chroma-matte';
}>;

export type CharacterSmileCandidate = CharacterFrameCandidate & Readonly<{
  id: typeof EMI_SMILE_CANDIDATE_ID;
  expression: 'smile';
  status: 'manual-qa';
  source: 'gpt-work-face-roi';
}>;

/**
 * Approved neutral master. It remains outside the runtime rig while the
 * expression family is produced and approved one frame at a time.
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
  status: 'approved-master',
  runtimeEligible: false,
  source: 'gpt-work-chroma-matte',
} as const);

/** Studio-only smile candidate derived from the approved neutral via a bounded face ROI. */
export const emiSmileCandidate: CharacterSmileCandidate = Object.freeze({
  format: CHARACTER_CANDIDATE_FORMAT,
  id: EMI_SMILE_CANDIDATE_ID,
  character: 'emi',
  expression: 'smile',
  asset: './assets/characters/emi/candidates/anm028d1/frame-smile-r1.png',
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
  source: 'gpt-work-face-roi',
} as const);

export function emiCandidateForArtSource(
  source: SceneStudioArtSource,
): CharacterFrameCandidate | null {
  if (source === EMI_NEUTRAL_CANDIDATE_ID) return emiNeutralCandidate;
  if (source === EMI_SMILE_CANDIDATE_ID) return emiSmileCandidate;
  return null;
}

export function validateEmiFrameCandidate(
  candidate: CharacterFrameCandidate,
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
  if (candidate.runtimeEligible !== false) issues.push('candidate must remain outside runtime until integration');
  if (candidate.status !== 'approved-master' && candidate.status !== 'manual-qa') issues.push('unsupported candidate status');
  return issues;
}


export function validateEmiNeutralCandidate(): readonly string[] {
  return validateEmiFrameCandidate(emiNeutralCandidate);
}

export function validateEmiSmileCandidate(): readonly string[] {
  return validateEmiFrameCandidate(emiSmileCandidate);
}
