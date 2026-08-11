import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const style = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../src/ui/AnimeDetectiveApp.ts', import.meta.url), 'utf8');

describe('ANM-016C R2 VN stage-dialogue seam and nameplate layering', () => {
  it('lets the lower portrait continue below the stage so the dialogue card can occlude it naturally', () => {
    expect(style).toContain('.stage { position: relative; z-index: 2; min-height: 0; overflow: visible; }');
    expect(style).toContain('bottom: -78%;\n  height: 178%;');
    expect(style).toContain('.dialogue-shell {\n  position: relative;\n  z-index: 8;');
    expect(style).toContain('padding: 10px 12px 7px;\n  background: transparent;');
  });

  it('renders the speaker nameplate as a sibling above the clickable dialogue card', () => {
    expect(appSource).toContain('<span class="dialogue-nameplate">');
    expect(appSource).not.toContain('<span class="name">');
    expect(style).toContain('.dialogue-nameplate {\n  position: absolute;\n  z-index: 12;');
    expect(style).toContain('top: -19px;');
    expect(style).toContain('pointer-events: none;');
  });

  it('keeps the content below the overlapping nameplate', () => {
    expect(style).toContain('padding: 32px 20px 25px;');
    expect(style).toContain('.dialogue-text { position: relative; z-index: 1;');
  });
});
