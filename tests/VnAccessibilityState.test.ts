import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { vnConfigOverlayMarkup } from '../src/features/vn/VnPresentation';
import { setVnAdvanceAccessibilityLabel } from '../src/ui/runtimeAccessibilityLabels';
import { vnFrameMarkup } from '../src/ui/vnFrameMarkup';

const runtimeServicesSource = readFileSync(new URL('../src/platform/RuntimeServices.ts', import.meta.url), 'utf8');

const frame = (autoMode: boolean): string => vnFrameMarkup({
  frameContext: 'runtime',
  textScale: 'normal',
  backgroundAsset: '/background.png',
  location: 'Club room',
  caseLabel: 'CASE 001',
  sceneTitle: 'Opening',
  clueCount: 0,
  stageSide: 'empty',
  stageMarkup: '',
  direction: false,
  speaker: 'Miku',
  emotion: 'neutral',
  dialogueText: 'Hello.',
  dialoguePageIndex: 0,
  dialoguePageCount: 1,
  lineId: 'VN0001',
  skipAvailable: false,
  autoMode,
  labels: {
    openDossier: 'Open dossier',
    navigation: 'Navigation',
    history: 'History',
    settings: 'Settings',
    controls: 'Controls',
    skip: 'Skip',
    auto: 'Auto',
    save: 'Save',
    load: 'Load',
  },
});

const config = (autoSpeed: 'slow' | 'normal' | 'fast', textScale: 'normal' | 'large'): string =>
  vnConfigOverlayMarkup({
    autoSpeed,
    textScale,
    audioSettingsHtml: '<div data-audio></div>',
    labels: {
      ariaLabel: 'Config',
      title: 'Config',
      close: 'Close',
      autoSpeed: 'Auto speed',
      textSize: 'Text size',
      audio: 'Audio',
      navigation: 'Navigation',
      mainMenu: 'Main menu',
      saved: 'Saved',
      note: 'Note',
      slow: 'Slow',
      normal: 'Normal',
      fast: 'Fast',
      large: 'Large',
    },
  });

describe('G2 VN accessibility state semantics', () => {
  it('exposes AUTO as a real pressed toggle without changing the existing active class', () => {
    expect(frame(false)).toContain('id="auto" class="" aria-pressed="false"');
    expect(frame(true)).toContain('id="auto" class="is-active" aria-pressed="true"');
  });

  it('exposes exactly the selected config choices as pressed', () => {
    const normal = config('normal', 'normal');
    expect(normal).toContain('data-auto-speed="normal" class="is-selected" aria-pressed="true"');
    expect(normal).toContain('data-auto-speed="slow" class="" aria-pressed="false"');
    expect(normal).toContain('data-text-scale="normal" class="is-selected" aria-pressed="true"');
    expect(normal).toContain('data-text-scale="large" class="" aria-pressed="false"');

    const changed = config('fast', 'large');
    expect(changed).toContain('data-auto-speed="fast" class="is-selected" aria-pressed="true"');
    expect(changed).toContain('data-auto-speed="normal" class="" aria-pressed="false"');
    expect(changed).toContain('data-text-scale="large" class="is-selected" aria-pressed="true"');
    expect(changed).toContain('data-text-scale="normal" class="" aria-pressed="false"');
  });

  it('gives the VN dialogue advance control a localized action name instead of dialogue content', () => {
    setVnAdvanceAccessibilityLabel('Продолжить');
    expect(frame(false)).toContain('id="next" aria-label="Продолжить"');
    expect(frame(false)).not.toContain('aria-label="Hello."');
    setVnAdvanceAccessibilityLabel('Continue');
  });

  it('syncs the advance label from existing localized Continue copy without changing locale persistence wiring', () => {
    expect(runtimeServicesSource).toContain("setVnAdvanceAccessibilityLabel(localization.t('menu.continue'))");
    expect(runtimeServicesSource).toContain('localization.subscribe((locale) => localeSettings.save(locale))');
    expect(runtimeServicesSource).toContain('localization.subscribe(() => syncAccessibilityLabels())');
    expect(runtimeServicesSource).toContain('syncAccessibilityLabels();');
  });
});
