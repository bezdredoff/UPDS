import { describe, expect, it } from 'vitest';
import { escapeHtml, headerActionMarkup, panelHeaderMarkup } from '../src/ui/viewMarkup';

describe('shared view markup', () => {
  it('escapes user-visible markup inputs', () => {
    expect(escapeHtml(`<b>O'Reilly & \"x\"</b>`)).toBe('&lt;b&gt;O&#039;Reilly &amp; &quot;x&quot;&lt;/b&gt;');
  });

  it('renders one compact accessible icon action with optional badge', () => {
    const markup = headerActionMarkup('settings', 'settings', 'Настройки', 3);
    expect(markup).toContain('id="settings"');
    expect(markup).toContain('aria-label="Настройки"');
    expect(markup).toContain('icon_settings.svg');
    expect(markup).toContain('<i>3</i>');
  });

  it('renders panel navigation with Back and optional Settings only', () => {
    const standard = panelHeaderMarkup('CASE', 'Досье');
    expect(standard).toContain('id="back"');
    expect(standard).toContain('id="header-settings"');
    expect(standard).not.toContain('Главное меню');

    const noSettings = panelHeaderMarkup('CONFIG', 'Настройки', { settings: false });
    expect(noSettings).toContain('id="back"');
    expect(noSettings).not.toContain('id="header-settings"');
  });
});
