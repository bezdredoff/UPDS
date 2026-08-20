import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  resolveVnStagePresentation,
  usesVnPoseB,
  vnChoiceScreenMarkup,
  vnConfigOverlayMarkup,
} from '../src/features/vn/VnPresentation';

const style = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const vnSource = readFileSync(new URL('../src/features/vn/VnController.ts', import.meta.url), 'utf8');
const presentationSource = readFileSync(new URL('../src/features/vn/VnPresentation.ts', import.meta.url), 'utf8');
const frameSource = readFileSync(new URL('../src/ui/vnFrameMarkup.ts', import.meta.url), 'utf8');

describe('current VN presentation contract', () => {
  it('keeps a stable four-row shell with contain-over-fill backgrounds and bottom-anchored portraits', () => {
    expect(style).toContain('grid-template-rows: auto minmax(0, 1fr) var(--vn-dialogue-row, clamp(154px, 22dvh, 198px)) auto');
    expect(style).toContain('.vn-background-fit { object-fit: contain');
    expect(style).toContain('.vn-background-fill { object-fit: cover');
    expect(style).toContain('bottom: var(--portrait-bottom, -78%);\n  height: var(--portrait-height, 178%);');
    expect(style).toContain('.portrait-left { left: calc(29% + var(--character-x, 0%)); }');
    expect(style).toContain('.portrait-right { left: calc(71% + var(--character-x, 0%)); }');
    expect(style).toContain('.portrait-center { left: calc(50% + var(--character-x, 0%)); }');
    expect(style).toContain('.stage { position: relative; z-index: 2; min-height: 0; overflow: visible; }');
  });

  it('supports bounded authored multi-character shots without removing the legacy lane fallback', () => {
    expect(presentationSource).toContain('resolveAuthoredVnShot(input.entry.id)');
    expect(presentationSource).toContain('vnAuthoredShotMarkup(authoredShot, character)');
    expect(presentationSource).toContain('resolveVnStaging(input.story, input.lineIndex)');
    expect(style).toContain('.vn-authored-actor-slot {');
    expect(style).toContain('.vn-authored-runtime-portrait[data-vertical-anchor="background-focal-eye-line"]');
  });

  it('keeps the nameplate above the stage/dialogue seam and the lower portrait behind the dialogue card', () => {
    expect(frameSource).toContain('<span class="dialogue-nameplate">');
    expect(frameSource).toContain('data-stage-interactive="${stageInteractive}"');
    expect(frameSource).toContain('const frameInert = input.interactive === false && !stageInteractive');
    expect(vnSource).toContain("frameContext: 'runtime'");
    expect(vnSource).toContain('vnFrameMarkup({');
    expect(style).toContain('.dialogue-shell {\n  position: relative;\n  z-index: 8;');
    expect(style).toContain('.dialogue-nameplate {');
    expect(style).toContain('z-index: 12;');
    expect(style).toContain('pointer-events: none;');
  });

  it('keeps a fixed two-line dialogue viewport wired to measured localization-safe paging', () => {
    expect(style).toContain('height: calc(2.84em + 19px);');
    expect(style).toContain('min-height: calc(2.84em + 19px);');
    expect(style).toContain('max-height: calc(2.84em + 19px);');
    expect(style).toContain('overflow-wrap: break-word;');
    expect(style).toContain('hyphens: auto;');
    expect(vnSource).toContain('createDialogueRenderedFit(textElement)');
    expect(vnSource).toContain('dialogueContinuationText(dialoguePage, this.dialoguePageIndex < dialoguePages.length - 1)');
  });

  it('keeps compact contextual navigation and no persistent main-menu action in gameplay headers', () => {
    expect(frameSource).toContain("headerActionMarkup(id('history'), 'log', input.labels.history)");
    expect(frameSource).toContain("headerActionMarkup(id('header-settings'), 'settings', input.labels.settings)");
    expect(frameSource).toContain('id="${escapeHtml(id(\'dossier\'))}" class="vn-case-pill"');
    expect(frameSource).not.toContain("headerActionMarkup(id('menu')");
    expect(presentationSource).toContain('id="vn-main-menu"');
    expect(style).toContain('width: 44px;');
    expect(style).toContain('min-height: 44px;');
  });

  it('resolves legacy character stage markup and pose-B policy from the presentation boundary', () => {
    const entry = { id: 'TEST0001', speaker: 'МИКУ', emotion: 'нейтрально', text: 'Тест.' } as const;
    const stage = resolveVnStagePresentation({
      story: [entry],
      sceneIndex: 0,
      lineIndex: 0,
      entry,
      localizedEmotion: 'neutral',
      directionLabel: 'Direction',
      dossierUpdatedLabel: 'Dossier updated',
      pendingClue: null,
    });

    expect(stage.stageSide).toBe('left');
    expect(stage.stageMarkup).toContain('data-character="miku"');
    expect(stage.stageMarkup).toContain('portrait-frame');
    expect(stage.preloadAssets).toHaveLength(1);
    expect(usesVnPoseB('miku', 'С БЛОКНОТОМ')).toBe(true);
    expect(usesVnPoseB('ayuki', 'БЕРЁТСЯ ЗА ТЕЛЕФОН')).toBe(true);
    expect(usesVnPoseB('kentaro', 'ПЫТАЕТСЯ ОБЪЯСНИТЬ')).toBe(true);
    expect(usesVnPoseB('norihiro', 'С ПЛАНШЕТОМ')).toBe(true);
    expect(usesVnPoseB('mayu', 'ЛИСТАЕТ ДОГОВОР')).toBe(true);
    expect(usesVnPoseB('rina', 'ПОКАЗЫВАЕТ МАРШРУТ')).toBe(true);
    expect(usesVnPoseB('kurose', 'ПОКАЗЫВАЕТ ПЛАНШЕТ')).toBe(true);
    expect(usesVnPoseB('emi', 'С ТЕЛЕФОНОМ')).toBe(false);
  });

  it('composes choice/config markup without owning event binding or runtime services', () => {
    const choice = vnChoiceScreenMarkup({
      backgroundAsset: '/choice.png',
      headerLabel: '<header>',
      prompt: '<prompt>',
      navigationLabel: 'Navigation',
      settingsLabel: 'Settings',
      options: [{ id: 'A', title: '<title>', effect: '<effect>' }],
    });
    expect(choice).toContain('class="choice-screen"');
    expect(choice).toContain('&lt;header&gt;');
    expect(choice).toContain('&lt;title&gt;');

    const config = vnConfigOverlayMarkup({
      autoSpeed: 'normal',
      textScale: 'normal',
      audioSettingsHtml: '<div data-audio></div>',
      labels: {
        ariaLabel: 'Config', title: 'Config', close: 'Close', autoSpeed: 'Auto speed', textSize: 'Text size',
        audio: 'Audio', navigation: 'Navigation', mainMenu: 'Main menu', saved: 'Saved', note: 'Note',
        slow: 'Slow', normal: 'Normal', fast: 'Fast', large: 'Large',
      },
    });
    expect(config).toContain('id="vn-main-menu"');
    expect(config).toContain('<div data-audio></div>');

    for (const forbidden of ['RuntimeServices', 'AppSession', 'AppNavigation', 'document.', 'window.', 'addEventListener', 'querySelector']) {
      expect(presentationSource).not.toContain(forbidden);
    }
    expect(vnSource).toContain('resolveVnStagePresentation({');
    expect(vnSource).toContain("addEventListener('click'");
  });
});
