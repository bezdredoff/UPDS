import type { AudioCue } from '../audio/AudioCues';
import type { AudioSettings } from '../audio/AudioSettings';
import type { AudioScene } from '../audio/MusicTheme';

/** Runtime-neutral audio controls required by application features and settings UI. */
export interface AudioRuntime {
  readonly settings: AudioSettings;
  readonly supported: boolean;
  readonly hapticsSupported: boolean;
  readonly scene: AudioScene;

  arm(): void;
  activate(): Promise<void>;
  updateSettings(patch: Partial<AudioSettings>): AudioSettings;
  setScene(scene: AudioScene): void;
  play(cue: AudioCue): void;
  previewEffects(): void;
  previewMusic(): void;
}
