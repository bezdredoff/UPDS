import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const fontsDir = join(root, 'godot/assets/fonts');
const uiFonts = readFileSync(join(root, 'godot/scripts/ui_fonts.gd'), 'utf8');
const menu = readFileSync(join(root, 'godot/scenes/main_menu.tscn'), 'utf8');
const vn = readFileSync(join(root, 'godot/scripts/vn_screen.gd'), 'utf8');
const match3 = readFileSync(join(root, 'godot/scripts/match3_screen.gd'), 'utf8');

describe('Godot bundled UI fonts', () => {
  it('includes the exact web interface fonts and Cyrillic subsets', () => {
    const files = readdirSync(fontsDir);
    for (const file of [
      'Inter-latin.woff2', 'Inter-cyrillic.woff2',
      'ComicRelief-latin.woff2', 'ComicRelief-cyrillic.woff2',
      'ComicRelief-Bold-latin.woff2', 'ComicRelief-Bold-cyrillic.woff2',
    ]) {
      expect(files).toContain(file);
      expect(readFileSync(join(fontsDir, file)).byteLength).toBeGreaterThan(1000);
    }
    expect(uiFonts).toContain('static func sans');
    expect(uiFonts).toContain('static func match3');
    expect(menu).toContain('default_font = ExtResource("7_ui_fonts")');
    expect(vn).toContain('UiFonts.sans');
    expect(match3).toContain('UiFonts.match3');
  });
});
