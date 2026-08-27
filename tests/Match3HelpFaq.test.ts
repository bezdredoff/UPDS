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

const requiredSpecials = ['flash-row', 'flash-column', 'evidence', 'lead', 'insight'] as const;

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
    expect(markup).toContain('translated:match3.help.specials.title');
    expect(markup).toContain('translated:match3.help.specials.intro');
    for (const special of requiredSpecials) {
      expect(markup).toContain(`data-special="${special}"`);
      expect(markup).toContain(`translated:match3.special.${special}`);
      expect(markup).toContain(`translated:match3.help.special.${special}.body`);
      expect(markup).toContain(`specials/${special}.png`);
      expect(markup).toContain(`data-asset-fallback-src="./assets/match3/specials/${special}.svg"`);
    }
  });

  it('offers the same Help entry from the level intro and the active board without controller state', () => {
    expect(presentationSource.match(/\$\{match3HelpMarkup\(t\)\}/g)).toHaveLength(2);
    expect(presentationSource).not.toContain('helpOpen');
    expect(presentationSource).not.toContain('toggleHelp');
  });

  it('centers the Help sheet on the phone viewport instead of anchoring it to the header trigger', () => {
    expect(helpCss).toContain('.match-help-popover');
    expect(helpCss).toContain('position: fixed;');
    expect(helpCss).toContain('left: 50%;');
    expect(helpCss).toContain('transform: translateX(-50%);');
    expect(helpCss).toContain('width: min(350px, calc(100vw - 28px));');
    expect(helpCss).not.toContain('right: 0;');
  });

  it('uses the established Match-3 tutorial-card visual vocabulary and a blocking backdrop', () => {
    expect(helpCss).toContain('.match-help[open]::before');
    expect(helpCss).toContain('background: #0714279e;');
    expect(helpCss).toContain('border: 3px solid var(--m3-gold);');
    expect(helpCss).toContain('border-left: 8px solid var(--m3-green);');
    expect(helpCss).toContain('background: linear-gradient(180deg, var(--m3-paper-light), var(--m3-paper));');
    expect(helpCss).toContain('box-shadow: 0 0 0 3px var(--m3-navy), 0 18px 44px #020914c7;');
  });

  it('keeps the centered sheet phone-scrollable without resizing the Match-3 board', () => {
    expect(helpCss).toContain('overflow-y: auto;');
    expect(helpCss).toContain('overscroll-behavior: contain;');
    expect(helpCss).toContain('summary::-webkit-details-marker');
    expect(mainSource).toContain("import './match3Help.css';");
  });

  it('shows each special at actual mobile board scale in a compact readable guide', () => {
    expect(helpCss).toContain('.match-help-special-list');
    expect(helpCss).toContain('grid-template-columns: 50px minmax(0, 1fr);');
    expect(helpCss).toContain('.match-help-special-visual');
    expect(helpCss).toContain('width: 48px;');
    expect(helpCss).toContain('height: 48px;');
  });
});
