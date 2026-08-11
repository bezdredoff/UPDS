export const MATCH_MOTION_MS = {
  swap: 150,
  invalidHold: 420,
  clear: 280,
  settle: 320,
  feedbackHold: 420,
  reshuffle: 460,
} as const;

export type MatchMotionPhase = keyof typeof MATCH_MOTION_MS;

export function matchMotionDuration(phase: MatchMotionPhase, reducedMotion: boolean): number {
  if (!reducedMotion) return MATCH_MOTION_MS[phase];
  if (phase === 'invalidHold') return 180;
  if (phase === 'feedbackHold') return 160;
  return 0;
}
