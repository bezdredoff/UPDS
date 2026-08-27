import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';
import {
  match3ObjectiveMarkup,
  match3StoryObjectGuidanceMarkup,
} from '../src/features/match3/Match3Presentation';

const guidanceCss = readFileSync(new URL('../src/match3StoryObjectGuidance.css', import.meta.url), 'utf8');
const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const t = (key: string, params?: Readonly<Record<string, string | number>>): string =>
  `${key}${params?.object ? `:${params.object}` : ''}`;

describe('ANM-025C3 contextual story-object guidance', () => {
  it('names the actual localized drop objective instead of repeating generic Help copy', () => {
    const level = levels[0];
    const markup = match3StoryObjectGuidanceMarkup(level, ['Blockers', 'Receipt from locker'], t);

    expect(markup).toContain('data-guidance="story-object"');
    expect(markup).toContain('data-objective-index="1"');
    expect(markup).toContain('match3.storyObjectGuidance:Receipt from locker');
    expect(markup).toContain('data-guidance="input"');
  });

  it('marks only drop and dropGroup objective cards as story-object state sources', () => {
    const level = levels[0];
    const blocker = match3ObjectiveMarkup(level, level.objectives[0], 'Blockers', 0, true, 0);
    const drop = match3ObjectiveMarkup(level, level.objectives[1], 'Receipt', 0, true, 1);

    expect(blocker).not.toContain('story-object-0');
    expect(drop).toContain('story-object-1');
  });

  it('falls back to the ordinary input hint when a level has no story-object objective', () => {
    const level = {
      ...levels[0],
      objectives: [
        { kind: 'collect' as const, tile: 'pantiesSportWhite' as const, target: 3, label: 'Collect' },
      ],
    };
    const markup = match3StoryObjectGuidanceMarkup(level, ['Collect'], t);

    expect(markup).not.toContain('data-guidance="story-object"');
    expect(markup).toContain('data-guidance="input"');
    expect(markup).toContain('match3.inputHint');
  });

  it('uses the existing objective done state to show only the first incomplete story-object note', () => {
    expect(guidanceCss).toContain('.objective.story-object-0:not(.done)');
    expect(guidanceCss).toContain('.objective.story-object-1:not(.done)');
    expect(guidanceCss).toContain('.objective.story-object-2:not(.done)');
    expect(guidanceCss).toContain('.default-input-guidance');
    expect(guidanceCss).toContain('border-left: 5px solid var(--m3-green);');
    expect(mainSource).toContain("import './match3StoryObjectGuidance.css';");
  });
});
