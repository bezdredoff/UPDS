import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { match3HelpMarkup } from '../src/features/match3/Match3Presentation';

const presentationSource = readFileSync(
  new URL('../src/features/match3/Match3Presentation.ts', import.meta.url),
  'utf8',
);
const helpCss = readFileSync(new URL('../src/match3Help.css', import.meta.url), 'utf8');
const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const t = (key: string): string => `translated:${key}`;

const requiredTopicKeys = [
  'match3.help.objectives.body',
  'match3.help.hint.body',
  'match3.tutorial.clear-blocker.title',
  'match3.tutorial.clear-blocker.body',
  'match3.tutorial.drop-ingredient.title',
  'match3.tutorial.drop-ingredient.body',
  'match3.tutorial.activate-special.title',
  'match3.tutorial.activate-special.body',
  'match3.tutorial.combine-specials.title',
  'match3.tutorial.combine-specials.body',
  'match3.help.reshuffle.title',
  'match3.help.reshuffle.body',
] as const;

describe('ANM-025C2 Match-3 Help / FAQ', () => {
  it('renders an accessible native disclosure with the approved rules reference', () => {
    const markup = match3HelpMarkup(t);

    expect(markup).toContain('<details class="match-help">');
    expect(markup).toContain('<summary class="app-header-action match-help-trigger"');
    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-labelledby="match-help-title"');
    expect(markup).toContain('translated:match3.help.title');
    expect(markup).toContain('translated:match3.help.closeHint');
    for (const key of requiredTopicKeys) expect(markup, key).toContain(`translated:${key}`);
  });

  it('offers the same Help entry from the level intro and the active board without controller state', () => {
    expect(presentationSource.match(/\$\{match3HelpMarkup\(t\)\}/g)).toHaveLength(2);
    expect(presentationSource).not.toContain('helpOpen');
    expect(presentationSource).not.toContain('toggleHelp');
  });

  it('floats the panel over Match-3 instead of resizing the board and keeps it phone-scrollable', () => {
    expect(helpCss).toContain('.match-help-popover');
    expect(helpCss).toContain('position: absolute;');
    expect(helpCss).toContain('overflow-y: auto;');
    expect(helpCss).toContain('overscroll-behavior: contain;');
    expect(helpCss).toContain('summary::-webkit-details-marker');
    expect(mainSource).toContain("import './match3Help.css';");
  });
});
