import type { StorageLike } from '../platform/SafeStorage';

export type AudioSettings = Readonly<{
  muted: boolean;
  musicVolume: number;
  effectsVolume: number;
  hapticsEnabled: boolean;
}>;

export const AUDIO_SETTINGS_KEY = 'seiran-detectives-audio-v1';

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  muted: false,
  musicVolume: 0.32,
  effectsVolume: 0.72,
  hapticsEnabled: true,
};

export const clampVolume = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
};

export const restoreAudioSettings = (value: unknown): AudioSettings => {
  if (!value || typeof value !== 'object') return DEFAULT_AUDIO_SETTINGS;
  const candidate = value as Partial<AudioSettings>;
  return {
    muted: typeof candidate.muted === 'boolean' ? candidate.muted : DEFAULT_AUDIO_SETTINGS.muted,
    musicVolume: typeof candidate.musicVolume === 'number' ? clampVolume(candidate.musicVolume) : DEFAULT_AUDIO_SETTINGS.musicVolume,
    effectsVolume: typeof candidate.effectsVolume === 'number' ? clampVolume(candidate.effectsVolume) : DEFAULT_AUDIO_SETTINGS.effectsVolume,
    hapticsEnabled: typeof candidate.hapticsEnabled === 'boolean' ? candidate.hapticsEnabled : DEFAULT_AUDIO_SETTINGS.hapticsEnabled,
  };
};

export class AudioSettingsStore {
  private current: AudioSettings;

  constructor(private readonly storage: StorageLike) {
    this.current = this.load();
  }

  get settings(): AudioSettings {
    return this.current;
  }

  update(patch: Partial<AudioSettings>): AudioSettings {
    this.current = restoreAudioSettings({ ...this.current, ...patch });
    this.persist();
    return this.current;
  }

  private load(): AudioSettings {
    try {
      const raw = this.storage.getItem(AUDIO_SETTINGS_KEY);
      return raw ? restoreAudioSettings(JSON.parse(raw)) : DEFAULT_AUDIO_SETTINGS;
    } catch {
      return DEFAULT_AUDIO_SETTINGS;
    }
  }

  private persist(): void {
    try {
      this.storage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(this.current));
    } catch {
      // Audio preferences are non-critical and may remain session-only.
    }
  }
}
