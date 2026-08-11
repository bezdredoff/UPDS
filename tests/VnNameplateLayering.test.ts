import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const style = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../src/ui/AnimeDetectiveApp.ts', import.meta.url), 'utf8');

describe('ANM-016C VN nameplate layering', () => {
  it('keeps the dialogue shell above the VN stage and allows the nameplate to overlap upward', () => {
    expect(style).toContain('.stage { position: relative; z-index: 2;');
    expect(style).toContain('.dialogue-shell {\n  position: relative;\n  z-index: 8;\n  isolation: isolate;\n  overflow: visible;');
    expect(style).toContain('.dialogue {');
    expect(style).toContain('overflow: visible;\n  padding: 34px 20px 25px;');
  });

  it('places the speaker nameplate above the dialogue content instead of clipping it inside the card', () => {
    expect(style).toContain('.dialogue .name {\n  position: absolute;\n  z-index: 5;');
    expect(style).toContain('top: -19px;');
    expect(style).toContain('.dialogue-text { position: relative; z-index: 1;');
    expect(appSource).toContain('<span class="name">');
  });
});
