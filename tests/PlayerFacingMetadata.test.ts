import { describe, expect, it } from 'vitest';
import { storyChoiceGates } from '../src/data/storyChoices';
import {
  vnChoiceScreenMarkup,
  vnHistoryOverlayMarkup,
  vnStoryChoiceScreenMarkup,
} from '../src/features/vn/VnPresentation';
import { vnFrameMarkup } from '../src/ui/vnFrameMarkup';

describe('G2 player-facing production metadata', () => {
  it('keeps the canonical VN line id available only through a hidden QA hook', () => {
    const frame = vnFrameMarkup({
      frameContext: 'runtime',
      textScale: 'normal',
      backgroundAsset: '/background.png',
      location: 'Club room',
      caseLabel: 'CASE 001 · SCENE 00',
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
      autoMode: false,
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

    expect(frame).toContain('<span class="line-id qa-line-id" hidden>VN0001</span>');
    expect(frame).toContain('<span class="line-id" aria-hidden="true">&nbsp;</span>');
    expect(frame).not.toContain('<span class="line-id">VN0001');
  });

  it('does not render canonical line, choice or story-gate ids as player-facing labels', () => {
    const history = vnHistoryOverlayMarkup({
      ariaLabel: 'History',
      title: 'Case log',
      closeLabel: 'Close',
      emptyLabel: 'Empty',
      entries: [{ id: 'VN0001', speaker: 'Miku', text: 'Hello.', direction: false }],
    });
    expect(history).not.toContain('VN0001');
    expect(history).toContain('<small aria-hidden="true">#1</small>');

    const legacyChoice = vnChoiceScreenMarkup({
      backgroundAsset: '/choice.png',
      headerLabel: 'Choose an approach',
      prompt: 'Where do we start?',
      navigationLabel: 'Navigation',
      settingsLabel: 'Settings',
      options: [{ id: 'A', title: 'Option title', effect: 'Option effect' }],
    });
    expect(legacyChoice).not.toContain('CHOICE_00');
    expect(legacyChoice).not.toContain('<i>A</i>');
    expect(legacyChoice).toContain('data-choice="A"');

    const storyGate = storyChoiceGates[0];
    const storyChoice = vnStoryChoiceScreenMarkup({
      gate: storyGate,
      backgroundAsset: '/choice.png',
      headerLabel: 'Scene decision',
      prompt: 'What now?',
      navigationLabel: 'Navigation',
      settingsLabel: 'Settings',
      options: [{ id: 'A', title: 'Option title', effect: 'Option effect' }],
    });
    expect(storyChoice).not.toContain(storyGate.id);
    expect(storyChoice).not.toContain(storyGate.id.toUpperCase());
    expect(storyChoice).not.toContain('<i>A</i>');
    expect(storyChoice).toContain('data-story-choice="A"');
  });
});
