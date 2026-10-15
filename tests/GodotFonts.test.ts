import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const fontsDir = join(root, 'godot/assets/fonts');
const uiFonts = readFileSync(join(root, 'godot/scripts/ui_fonts.gd'), 'utf8');
const mainMenu = readFileSync(join(root, 'godot/scripts/main_menu.gd'), 'utf8');
const menu = readFileSync(join(root, 'godot/scenes/main_menu.tscn'), 'utf8');
const vn = readFileSync(join(root, 'godot/scripts/vn_screen.gd'), 'utf8');
const match3 = readFileSync(join(root, 'godot/scripts/match3_screen.gd'), 'utf8');

describe('Godot bundled UI fonts', () => {
  it('includes the exact web interface fonts and Cyrillic subsets', () => {
    const files = readdirSync(fontsDir);
    const requiredFiles = [
      'Inter-latin.woff2', 'Inter-cyrillic.woff2',
      'ComicRelief-latin.woff2', 'ComicRelief-cyrillic.woff2',
      'ComicRelief-Bold-latin.woff2', 'ComicRelief-Bold-cyrillic.woff2',
      'Gelasio-wght.ttf', 'Gelasio-wght.ttf.import', 'Gelasio-OFL.txt',
      'NotoSerif-wdth-wght.ttf', 'NotoSerif-wdth-wght.ttf.import', 'NotoSerif-OFL.txt',
    ];
    for (const file of requiredFiles) {
      expect(files).toContain(file);
    }
    for (const file of [
      'Inter-latin.woff2', 'Inter-cyrillic.woff2',
      'ComicRelief-latin.woff2', 'ComicRelief-cyrillic.woff2',
      'ComicRelief-Bold-latin.woff2', 'ComicRelief-Bold-cyrillic.woff2',
      'Gelasio-wght.ttf', 'NotoSerif-wdth-wght.ttf',
    ]) {
      expect(readFileSync(join(fontsDir, file)).byteLength).toBeGreaterThan(1000);
    }
    expect(uiFonts).toContain('static func sans');
    expect(uiFonts).toContain('static func match3');
    expect(uiFonts).toContain('static func serif');
    expect(uiFonts).toContain('if OS.has_feature("web"):');
    expect(uiFonts).toContain('return bundled');
    expect(uiFonts).toContain('font.font_names = PackedStringArray(["Comic Sans MS", "Trebuchet MS"])');
    expect(uiFonts).toContain('font.fallbacks = [bundled]');
    expect(mainMenu).toContain('runtime_theme.default_font = UiFonts.sans()');
    expect(mainMenu).toContain('UiFonts.serif(800)');
    expect(menu).not.toContain('SystemFont_menu_serif');
    expect(vn).toContain('UiFonts.sans');
    expect(match3).toContain('UiFonts.match3');
  });
});
