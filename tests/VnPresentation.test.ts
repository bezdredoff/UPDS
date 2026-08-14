import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const style = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const vnSource = readFileSync(new URL('../src/features/vn/VnController.ts', import.meta.url), 'utf8');
const frameSource = readFileSync(new URL('../src/ui/vnFrameMarkup.ts', import.meta.url), 'utf8');

describe('current VN presentation contract', () => {
  it('keeps a stable four-row shell with contain-over-fill backgrounds and bottom-anchored portraits', () => {
    expect(style).toContain('grid-template-rows: auto minmax(0, 1fr) var(--vn-dialogue-row, clamp(154px, 22dvh, 198px)) auto');
    expect(style).toContain('.vn-background-fit { object-fit: contain');
    expect(style).toContain('.vn-background-fill { object-fit: cover');
    expect(style).toContain('bottom: -78%;\n  height: 178%;');
    expect(style).toContain('.portrait-left { left: 29%; }');
    expect(style).toContain('.portrait-right { left: 71%; }');
    expect(style).toContain('.portrait-center { left: 50%; }');
    expect(style).toContain('.stage { position: relative; z-index: 2; min-height: 0; overflow: visible; }');
  });

  it('keeps the nameplate above the stage/dialogue seam and the lower portrait behind the dialogue card', () => {
    expect(frameSource).toContain('<span class="dialogue-nameplate">');
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
    expect(vnSource).toContain('id="vn-main-menu"');
    expect(style).toContain('width: 44px;');
    expect(style).toContain('min-height: 44px;');
  });
});
