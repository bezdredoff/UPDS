import { describe, expect, it } from 'vitest';
import { AudioManager } from '../src/audio/AudioManager';
import { audioCueNames, getCueDefinition } from '../src/audio/AudioCues';
import { AUDIO_SETTINGS_KEY, AudioSettingsStore, DEFAULT_AUDIO_SETTINGS, clampVolume, restoreAudioSettings } from '../src/audio/AudioSettings';
import { beatDurationSeconds, getMusicTheme, loopDurationSeconds } from '../src/audio/MusicTheme';
import { ErrorLog } from '../src/platform/ErrorLog';
import type { StorageLike } from '../src/platform/SafeStorage';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

describe('audio and haptics foundation', () => {
  it('clamps and restores persisted settings safely', () => {
    expect(clampVolume(-2)).toBe(0);
    expect(clampVolume(2)).toBe(1);
    expect(clampVolume(Number.NaN)).toBe(0);
    expect(restoreAudioSettings({ musicVolume: 2, effectsVolume: -1, muted: true, hapticsEnabled: false })).toEqual({
      muted: true,
      musicVolume: 1,
      effectsVolume: 0,
      hapticsEnabled: false,
    });
    expect(restoreAudioSettings(null)).toEqual(DEFAULT_AUDIO_SETTINGS);
  });

  it('persists audio preferences under an UPDS-specific key independent of campaign save', () => {
    const storage = new MemoryStorage();
    const store = new AudioSettingsStore(storage);
    store.update({ musicVolume: 0.44, effectsVolume: 0.61, hapticsEnabled: false });
    expect(storage.getItem(AUDIO_SETTINGS_KEY)).not.toBeNull();
    expect(AUDIO_SETTINGS_KEY).toBe('seiran-detectives-audio-v1');
    expect(new AudioSettingsStore(storage).settings).toMatchObject({ musicVolume: 0.44, effectsVolume: 0.61, hapticsEnabled: false });
  });

  it('defines every required pre-release cue with non-empty procedural sound data', () => {
    expect(audioCueNames).toEqual(expect.arrayContaining(['uiClick', 'vnAdvance', 'choice', 'dossier', 'hint', 'swap', 'invalidSwap', 'match', 'cascade', 'special', 'reshuffle', 'clue', 'win', 'lose']));
    for (const cue of audioCueNames) {
      const definition = getCueDefinition(cue);
      expect(definition.frequencies.length).toBeGreaterThan(0);
      expect(definition.durationMs).toBeGreaterThan(0);
      expect(definition.gain).toBeGreaterThan(0);
    }
  });

  it('ships distinct menu, VN, match and ending music themes', () => {
    const scenes = ['menu', 'vn', 'match', 'ending'] as const;
    const bpms = scenes.map((scene) => getMusicTheme(scene)!.bpm);
    expect(new Set(bpms).size).toBeGreaterThan(2);
    for (const scene of scenes) {
      const theme = getMusicTheme(scene)!;
      expect(theme.tones.length).toBeGreaterThan(5);
      expect(loopDurationSeconds(theme)).toBeGreaterThan(4);
      expect(beatDurationSeconds(theme.bpm)).toBeGreaterThan(0);
    }
    expect(getMusicTheme('none')).toBeNull();
  });

  it('uses optional haptics without requiring Web Audio support', () => {
    const storage = new MemoryStorage();
    const errors = new ErrorLog(storage);
    const pulses: Array<number | number[]> = [];
    const fakeWindow = {
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      setInterval: () => 1,
      clearInterval: () => undefined,
      document: { addEventListener: () => undefined, hidden: false },
    } as unknown as Window & typeof globalThis;
    const fakeNavigator = { vibrate: (pattern: number | number[]) => { pulses.push(pattern); return true; } } as unknown as Navigator;
    const manager = new AudioManager(storage, errors, fakeWindow, fakeNavigator);
    expect(manager.supported).toBe(false);
    expect(manager.hapticsSupported).toBe(true);
    manager.play('hint');
    expect(pulses).toHaveLength(1);
    manager.updateSettings({ hapticsEnabled: false });
    manager.play('hint');
    expect(pulses).toHaveLength(1);
  });
});
