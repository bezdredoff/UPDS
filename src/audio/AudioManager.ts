import { getCueDefinition, type AudioCue } from './AudioCues';
import { AudioSettingsStore, type AudioSettings } from './AudioSettings';
import { beatDurationSeconds, getMusicTheme, loopDurationSeconds, type AudioScene } from './MusicTheme';
import type { ErrorLog } from '../platform/ErrorLog';
import type { StorageLike } from '../platform/SafeStorage';

type AudioHostWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
type HapticNavigator = Navigator & { vibrate?: (pattern: number | number[]) => boolean };

export class AudioManager {
  private context: AudioContext | null = null;
  private effectsGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicInput: GainNode | null = null;
  private musicTimer: number | null = null;
  private nextLoopAt = 0;
  private readonly scheduledMusicNodes = new Set<OscillatorNode>();
  private armed = false;
  private activated = false;
  private currentScene: AudioScene = 'none';

  private readonly settingsStore: AudioSettingsStore;

  constructor(
    storage: StorageLike,
    private readonly errorLog: ErrorLog,
    private readonly hostWindow: AudioHostWindow = window as AudioHostWindow,
    private readonly hostNavigator: HapticNavigator = navigator as HapticNavigator,
  ) {
    this.settingsStore = new AudioSettingsStore(storage);
  }

  get settings(): AudioSettings { return this.settingsStore.settings; }
  get supported(): boolean { return Boolean(this.hostWindow.AudioContext ?? this.hostWindow.webkitAudioContext); }
  get hapticsSupported(): boolean { return typeof this.hostNavigator.vibrate === 'function'; }
  get scene(): AudioScene { return this.currentScene; }

  arm(): void {
    if (this.armed) return;
    this.armed = true;
    const activate = (): void => {
      void this.activate();
      this.hostWindow.removeEventListener('pointerdown', activate);
      this.hostWindow.removeEventListener('keydown', activate);
    };
    this.hostWindow.addEventListener('pointerdown', activate, { once: true });
    this.hostWindow.addEventListener('keydown', activate, { once: true });
    this.hostWindow.document?.addEventListener('visibilitychange', () => {
      if (!this.context) return;
      if (this.hostWindow.document.hidden) {
        this.stopMusic();
        void this.context.suspend().catch(() => undefined);
      } else if (this.activated) {
        void this.context.resume().then(() => this.startMusic()).catch((error) => this.errorLog.record('application', error));
      }
    });
  }

  async activate(): Promise<void> {
    const context = this.ensureContext();
    if (!context) return;
    this.activated = true;
    try {
      if (context.state === 'suspended') await context.resume();
      this.applyVolumes();
      this.startMusic();
    } catch (error) {
      this.errorLog.record('application', error);
    }
  }

  updateSettings(patch: Partial<AudioSettings>): AudioSettings {
    const settings = this.settingsStore.update(patch);
    this.applyVolumes();
    if (settings.muted || settings.musicVolume <= 0) this.stopMusic();
    else if (this.activated) this.startMusic();
    return settings;
  }

  setScene(scene: AudioScene): void {
    if (scene === this.currentScene) return;
    this.currentScene = scene;
    if (!this.activated) return;
    this.stopMusic();
    this.startMusic();
  }

  play(cue: AudioCue): void {
    this.pulse(cue);
    if (this.settings.muted || this.settings.effectsVolume <= 0) return;
    const context = this.ensureContext();
    if (!context || !this.effectsGain) return;
    this.activated = true;
    if (context.state === 'suspended') void context.resume().catch(() => undefined);
    const definition = getCueDefinition(cue);
    const now = context.currentTime;
    const slice = definition.durationMs / 1000 / definition.frequencies.length;
    definition.frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + index * slice * 0.68;
      const end = start + Math.max(0.045, slice * 1.18);
      oscillator.type = definition.wave;
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(definition.gain, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      oscillator.connect(gain);
      gain.connect(this.effectsGain!);
      oscillator.start(start);
      oscillator.stop(end + 0.02);
    });
  }

  previewEffects(): void { void this.activate().then(() => this.play('match')); }
  previewMusic(): void {
    void this.activate().then(() => {
      this.stopMusic();
      this.startMusic();
    });
  }

  private pulse(cue: AudioCue): void {
    if (!this.settings.hapticsEnabled || !this.hapticsSupported) return;
    const pattern = getCueDefinition(cue).haptic;
    if (!pattern?.length) return;
    try { this.hostNavigator.vibrate?.([...pattern]); } catch { /* Optional capability. */ }
  }

  private ensureContext(): AudioContext | null {
    if (this.context) return this.context;
    const Context = this.hostWindow.AudioContext ?? this.hostWindow.webkitAudioContext;
    if (!Context) return null;
    try {
      this.context = new Context();
      this.effectsGain = this.context.createGain();
      this.musicGain = this.context.createGain();
      this.musicInput = this.context.createGain();

      const filter = this.context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2600;
      filter.Q.value = 0.45;
      this.effectsGain.connect(this.context.destination);
      this.musicInput.connect(filter);
      filter.connect(this.musicGain);
      this.musicGain.connect(this.context.destination);
      this.applyVolumes();
      return this.context;
    } catch (error) {
      this.errorLog.record('application', error);
      return null;
    }
  }

  private applyVolumes(): void {
    if (!this.context || !this.effectsGain || !this.musicGain) return;
    const now = this.context.currentTime;
    const settings = this.settings;
    this.effectsGain.gain.setTargetAtTime(settings.muted ? 0 : settings.effectsVolume, now, 0.025);
    this.musicGain.gain.setTargetAtTime(settings.muted ? 0 : settings.musicVolume * 0.52, now, 0.11);
  }

  private startMusic(): void {
    if (!this.context || !this.musicInput || this.musicTimer !== null) return;
    if (this.settings.muted || this.settings.musicVolume <= 0) return;
    const theme = getMusicTheme(this.currentScene);
    if (!theme) return;
    this.nextLoopAt = this.context.currentTime + 0.05;
    this.scheduleMusicAhead();
    this.musicTimer = this.hostWindow.setInterval(() => this.scheduleMusicAhead(), 700);
  }

  private stopMusic(): void {
    if (this.musicTimer !== null) {
      this.hostWindow.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    for (const oscillator of this.scheduledMusicNodes) {
      try { oscillator.stop(); } catch { /* Already ended. */ }
    }
    this.scheduledMusicNodes.clear();
    this.nextLoopAt = 0;
  }

  private scheduleMusicAhead(): void {
    if (!this.context || !this.musicInput || this.context.state !== 'running') return;
    const theme = getMusicTheme(this.currentScene);
    if (!theme || this.settings.muted || this.settings.musicVolume <= 0) return;
    const horizon = this.context.currentTime + 2.1;
    const loopDuration = loopDurationSeconds(theme);
    while (this.nextLoopAt < horizon) {
      this.scheduleThemeLoop(theme, this.nextLoopAt);
      this.nextLoopAt += loopDuration;
    }
  }

  private scheduleThemeLoop(theme: NonNullable<ReturnType<typeof getMusicTheme>>, loopStart: number): void {
    if (!this.context || !this.musicInput) return;
    const beat = beatDurationSeconds(theme.bpm);
    for (const tone of theme.tones) {
      const start = loopStart + tone.beat * beat;
      const duration = tone.durationBeats * beat;
      const end = start + duration;
      const attackEnd = Math.min(end - 0.02, start + Math.min(0.18, duration * 0.26));
      const releaseStart = Math.max(attackEnd, end - Math.min(0.34, duration * 0.36));
      const oscillator = this.context.createOscillator();
      const envelope = this.context.createGain();
      oscillator.type = tone.wave;
      oscillator.frequency.setValueAtTime(tone.frequency, start);
      envelope.gain.setValueAtTime(0.0001, start);
      envelope.gain.exponentialRampToValueAtTime(tone.gain, attackEnd);
      envelope.gain.setValueAtTime(tone.gain, releaseStart);
      envelope.gain.exponentialRampToValueAtTime(0.0001, end);
      oscillator.connect(envelope);
      envelope.connect(this.musicInput);
      this.scheduledMusicNodes.add(oscillator);
      oscillator.addEventListener('ended', () => this.scheduledMusicNodes.delete(oscillator), { once: true });
      oscillator.start(start);
      oscillator.stop(end + 0.03);
    }
  }
}
