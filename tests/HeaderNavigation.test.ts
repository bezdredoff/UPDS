import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const appSource = readFileSync(new URL('../src/ui/AnimeDetectiveApp.ts', import.meta.url), 'utf8');
const style = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');

describe('ANM-016D unified header navigation and contrast', () => {
  it('uses one shared high-contrast header contract instead of per-screen light controls', () => {
    expect(style).toContain('/* Shared header/navigation contract — ANM-016D */');
    expect(style).toContain('background: linear-gradient(180deg, #17304df8, #10243df8);');
    expect(style).toContain('background: #0b2038;');
    expect(style).toContain('color: #fffaf0;');
    expect(style).toContain('filter: brightness(0) invert(1);');
    expect(style).toContain('.match-topbar {');
    expect(style).toContain('.panel-nav {');
  });

  it('keeps menu and settings reachable from persistent VN, choice, match and utility screens', () => {
    expect(appSource).toContain('headerActionMarkup');
    expect(appSource).toContain("headerActionMarkup('header-settings', 'settings', 'Настройки')");
    expect(appSource).toContain("headerActionMarkup('menu', 'menu', 'Главное меню')");
    expect(appSource).toContain('class="app-header vn-topbar"');
    expect(appSource).toContain('class="app-header choice-topbar"');
    expect(appSource).toContain('class="app-header match-topbar intro-topbar"');
    expect(appSource).toContain('class="app-header match-topbar"');
    expect(appSource).toContain('class="app-header result-topbar"');
    expect(appSource).toContain('class="app-header ending-topbar"');
    expect(appSource).toContain('panelHeaderMarkup');
  });

  it('removes duplicate VN CONFIG navigation while preserving the full VN config overlay', () => {
    expect(appSource).not.toContain('<button id="config">');
    expect(appSource).toContain('this.renderVnConfigOverlay();');
    expect(appSource).toContain('<small>CONFIG</small><h2>Настройки чтения</h2>');
    expect(style).toContain('grid-template-columns: repeat(4, minmax(0, 1fr));');
  });

  it('keeps dossier and history contextual rather than making every screen carry every action', () => {
    expect(appSource).toContain("headerActionMarkup('history', 'log', 'История диалога')");
    expect(appSource).toContain("headerActionMarkup('dossier', 'dossier', 'Досье', this.save.clues.length)");
    expect(appSource).toContain("panelHeaderMarkup('CONFIG · AUDIO', 'Настройки', { settings: false, menu: true })");
  });
});
