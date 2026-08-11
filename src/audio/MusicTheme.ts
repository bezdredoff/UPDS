export type AudioScene = 'none' | 'menu' | 'vn' | 'match' | 'ending';

type MusicTone = Readonly<{
  beat: number;
  durationBeats: number;
  frequency: number;
  gain: number;
  wave: OscillatorType;
}>;

export type MusicTheme = Readonly<{
  bpm: number;
  beatsPerLoop: number;
  tones: readonly MusicTone[];
}>;

const chord = (beat: number, frequencies: readonly number[], durationBeats: number, gain: number): MusicTone[] => frequencies.map((frequency) => ({
  beat, frequency, durationBeats, gain: gain / Math.sqrt(frequencies.length), wave: 'sine' as const,
}));

const MENU_THEME: MusicTheme = {
  bpm: 86,
  beatsPerLoop: 16,
  tones: [
    ...chord(0, [220, 277.18, 329.63], 3.7, 0.032),
    ...chord(4, [196, 246.94, 293.66], 3.7, 0.03),
    ...chord(8, [174.61, 220, 261.63], 3.7, 0.03),
    ...chord(12, [196, 246.94, 329.63], 3.7, 0.031),
    { beat: 2, frequency: 659.25, durationBeats: 0.45, gain: 0.013, wave: 'triangle' },
    { beat: 6, frequency: 587.33, durationBeats: 0.45, gain: 0.012, wave: 'triangle' },
    { beat: 10, frequency: 523.25, durationBeats: 0.45, gain: 0.012, wave: 'triangle' },
    { beat: 14, frequency: 659.25, durationBeats: 0.7, gain: 0.013, wave: 'triangle' },
  ],
};

const VN_THEME: MusicTheme = {
  bpm: 76,
  beatsPerLoop: 16,
  tones: [
    ...chord(0, [196, 246.94, 293.66], 3.8, 0.026),
    ...chord(4, [220, 261.63, 329.63], 3.8, 0.026),
    ...chord(8, [174.61, 220, 293.66], 3.8, 0.025),
    ...chord(12, [196, 246.94, 311.13], 3.8, 0.026),
    { beat: 1.5, frequency: 440, durationBeats: 0.55, gain: 0.009, wave: 'sine' },
    { beat: 5.5, frequency: 493.88, durationBeats: 0.55, gain: 0.009, wave: 'sine' },
    { beat: 9.5, frequency: 440, durationBeats: 0.55, gain: 0.009, wave: 'sine' },
    { beat: 13.5, frequency: 392, durationBeats: 0.65, gain: 0.009, wave: 'sine' },
  ],
};

const MATCH_THEME: MusicTheme = {
  bpm: 116,
  beatsPerLoop: 16,
  tones: [
    ...chord(0, [220, 277.18, 329.63], 1.8, 0.023),
    ...chord(2, [246.94, 311.13, 369.99], 1.8, 0.023),
    ...chord(4, [261.63, 329.63, 392], 1.8, 0.024),
    ...chord(6, [246.94, 311.13, 369.99], 1.8, 0.023),
    ...chord(8, [220, 277.18, 329.63], 1.8, 0.023),
    ...chord(10, [196, 246.94, 293.66], 1.8, 0.022),
    ...chord(12, [174.61, 220, 261.63], 1.8, 0.022),
    ...chord(14, [196, 246.94, 329.63], 1.8, 0.023),
    { beat: 1, frequency: 659.25, durationBeats: 0.32, gain: 0.011, wave: 'triangle' },
    { beat: 5, frequency: 783.99, durationBeats: 0.32, gain: 0.011, wave: 'triangle' },
    { beat: 9, frequency: 659.25, durationBeats: 0.32, gain: 0.011, wave: 'triangle' },
    { beat: 13, frequency: 587.33, durationBeats: 0.32, gain: 0.011, wave: 'triangle' },
  ],
};

const ENDING_THEME: MusicTheme = {
  bpm: 68,
  beatsPerLoop: 16,
  tones: [
    ...chord(0, [220, 277.18, 329.63], 7.6, 0.027),
    ...chord(8, [196, 246.94, 329.63], 7.6, 0.027),
    { beat: 3, frequency: 659.25, durationBeats: 1.4, gain: 0.012, wave: 'sine' },
    { beat: 11, frequency: 739.99, durationBeats: 1.8, gain: 0.012, wave: 'sine' },
  ],
};

const THEMES: Record<Exclude<AudioScene, 'none'>, MusicTheme> = {
  menu: MENU_THEME,
  vn: VN_THEME,
  match: MATCH_THEME,
  ending: ENDING_THEME,
};

export const getMusicTheme = (scene: AudioScene): MusicTheme | null => scene === 'none' ? null : THEMES[scene];
export const beatDurationSeconds = (bpm: number): number => 60 / bpm;
export const loopDurationSeconds = (theme: MusicTheme): number => theme.beatsPerLoop * beatDurationSeconds(theme.bpm);
