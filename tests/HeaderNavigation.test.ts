import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const appSource = readFileSync(new URL('../src/ui/AnimeDetectiveApp.ts', import.meta.url), 'utf8');
const style = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');

describe('ANM-016D/016E unified compact header navigation', () => {
  it('keeps the shared high-contrast header contract from ANM-016D', () => {
    expect(style).toContain('/* Shared header/navigation contract — ANM-016D */');
    expect(style).toContain('background: linear-gradient(180deg, #17304df8, #10243df8);');
    expect(style).toContain('background: #0b2038;');
    expect(style).toContain('color: #fffaf0;');
    expect(style).toContain('filter: brightness(0) invert(1);');
    expect(style).toContain('width: 44px;');
    expect(style).toContain('min-height: 44px;');
    expect(style).toContain('.match-topbar {');
    expect(style).toContain('.panel-nav {');
  });

  it('keeps only contextual persistent actions in gameplay headers', () => {
    expect(appSource).toContain('headerActionMarkup');
    expect(appSource).toContain("headerActionMarkup('header-settings', 'settings', 'Настройки')");
    expect(appSource).toContain("headerActionMarkup('history', 'log', 'История диалога')");
    expect(appSource).toContain("headerActionMarkup('dossier', 'dossier', 'Досье', this.save.clues.length)");
    expect(appSource).not.toContain("headerActionMarkup('menu', 'menu', 'Главное меню')");
    expect(appSource).toContain('class="app-header vn-topbar"');
    expect(appSource).toContain('class="app-header choice-topbar"');
    expect(appSource).toContain('class="app-header match-topbar intro-topbar"');
    expect(appSource).toContain('class="app-header match-topbar"');
    expect(appSource).toContain('class="app-header result-topbar"');
    expect(appSource).toContain('class="app-header ending-topbar"');
  });

  it('moves global main-menu navigation inside settings while preserving caller return', () => {
    expect(appSource).toContain('private renderSettings(back: () => void = () => this.renderMenu(), showMainMenu = false): void');
    expect(appSource).toContain('id="settings-main-menu"');
    expect(appSource).toContain('id="vn-main-menu"');
    expect(appSource).toContain('private returnToMainMenu(): void');
    expect(appSource).toContain("window.confirm('Выйти в главное меню? Текущая попытка match-3 будет потеряна.')");
    expect(appSource).toContain('this.renderSettings(() => this.renderMatch(), true)');
    expect(appSource).toContain('this.renderSettings(() => this.renderDossier(back), true)');
    expect(style).toContain('/* ANM-016E compact context navigation */');
    expect(style).toContain('.settings-navigation,');
    expect(style).toContain('.vn-config-navigation {');
  });

  it('keeps VN reading controls and contextual log/case access without duplicate CONFIG or MENU buttons', () => {
    expect(appSource).not.toContain('<button id="config">');
    expect(appSource).toContain('this.renderVnConfigOverlay();');
    expect(appSource).toContain('<small>CONFIG</small><h2>Настройки чтения</h2>');
    expect(appSource).toContain('phone.querySelector(\'#vn-main-menu\')?.addEventListener');
    expect(style).toContain('grid-template-columns: repeat(4, minmax(0, 1fr));');
  });
});
