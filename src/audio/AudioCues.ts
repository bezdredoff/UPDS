export type AudioCue =
  | 'uiClick'
  | 'vnAdvance'
  | 'choice'
  | 'dossier'
  | 'hint'
  | 'swap'
  | 'invalidSwap'
  | 'match'
  | 'cascade'
  | 'special'
  | 'reshuffle'
  | 'clue'
  | 'win'
  | 'lose';

export type CueDefinition = Readonly<{
  frequencies: readonly number[];
  durationMs: number;
  gain: number;
  wave: OscillatorType;
  haptic?: readonly number[];
}>;

const CUES: Record<AudioCue, CueDefinition> = {
  uiClick: { frequencies: [520], durationMs: 54, gain: 0.055, wave: 'sine', haptic: [8] },
  vnAdvance: { frequencies: [390, 520], durationMs: 74, gain: 0.035, wave: 'triangle' },
  choice: { frequencies: [440, 554, 659], durationMs: 190, gain: 0.075, wave: 'triangle', haptic: [12, 24, 18] },
  dossier: { frequencies: [330, 440], durationMs: 145, gain: 0.06, wave: 'triangle', haptic: [10] },
  hint: { frequencies: [740, 988], durationMs: 165, gain: 0.065, wave: 'sine', haptic: [8, 20, 8] },
  swap: { frequencies: [260, 310], durationMs: 78, gain: 0.045, wave: 'triangle', haptic: [7] },
  invalidSwap: { frequencies: [185, 155], durationMs: 155, gain: 0.07, wave: 'square', haptic: [18] },
  match: { frequencies: [523, 659, 784], durationMs: 190, gain: 0.075, wave: 'triangle', haptic: [9, 18, 10] },
  cascade: { frequencies: [659, 784, 988], durationMs: 205, gain: 0.075, wave: 'triangle', haptic: [9, 14, 9] },
  special: { frequencies: [784, 1047, 1319], durationMs: 275, gain: 0.085, wave: 'sine', haptic: [12, 18, 24] },
  reshuffle: { frequencies: [294, 370, 466, 587], durationMs: 290, gain: 0.055, wave: 'triangle', haptic: [10, 22, 10] },
  clue: { frequencies: [523, 659, 784, 1047], durationMs: 420, gain: 0.085, wave: 'sine', haptic: [18, 30, 35] },
  win: { frequencies: [523, 659, 784, 988], durationMs: 520, gain: 0.085, wave: 'triangle', haptic: [18, 24, 18, 24, 28] },
  lose: { frequencies: [294, 247, 196], durationMs: 410, gain: 0.07, wave: 'triangle', haptic: [24] },
};

export const getCueDefinition = (cue: AudioCue): CueDefinition => CUES[cue];
export const audioCueNames = Object.freeze(Object.keys(CUES) as AudioCue[]);
