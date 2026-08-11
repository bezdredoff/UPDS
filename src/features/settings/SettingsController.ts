import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppShell } from '../../app/AppShell';
import { escapeHtml, iconMarkup as icon, panelHeaderMarkup } from '../../ui/viewMarkup';
import { audioSettingsMarkup, bindAudioSettingsControls, bindLanguageSettingsControls, bindPwaControls, languageSettingsMarkup, pwaStatusMarkup } from '../../ui/systemControls';

export class SettingsController {
  constructor(
    private readonly root: HTMLElement,
    private readonly services: RuntimeServices,
    private readonly shell: AppShell,
    private readonly navigation: AppNavigation,
    private readonly isMatchActive: () => boolean,
  ) {}

  render(back: () => void = () => this.navigation.showMenu(), showMainMenu = false): void {
    const matchActive = this.isMatchActive();
    const t = (key: string) => escapeHtml(this.services.localization.t(key));
    this.services.telemetry.trackScreen('settings', matchActive ? 'match' : 'system');
    this.shell.render(`<section class="panel settings-panel">
      ${panelHeaderMarkup(this.services.localization.t('settings.eyebrow'), this.services.localization.t('settings.title'), {
        settings: false,
        backLabel: this.services.localization.t('common.back'),
        navigationLabel: this.services.localization.t('common.navigation'),
      })}
      <h2>${t('settings.languageHeading')}</h2>
      ${languageSettingsMarkup(this.services)}
      <h2>${t('settings.audioHeading')}</h2>
      <p class="panel-copy">${t('settings.audioCopy')}</p>
      ${audioSettingsMarkup(this.services)}
      <h2>${t('settings.installHeading')}</h2>
      ${pwaStatusMarkup(this.services)}
      <div class="settings-note"><b>${t('settings.mobileContractTitle')}</b><span>${t('settings.mobileContractCopy')}</span></div>
      ${showMainMenu ? `<div class="settings-navigation"><small>${t('settings.navigationLabel')}</small><button id="settings-main-menu">${icon('menu')}<span><b>${t('settings.mainMenu')}</b><em>${t(matchActive ? 'settings.mainMenuMatchWarning' : 'settings.mainMenuSafe')}</em></span></button></div>` : ''}
    </section>`);
    this.root.querySelector('#back')?.addEventListener('click', back);
    this.root.querySelector('#settings-main-menu')?.addEventListener('click', () => this.navigation.returnToMainMenu());
    bindLanguageSettingsControls(this.services, this.root, () => this.render(back, showMainMenu));
    bindAudioSettingsControls(this.services, this.root, () => this.render(back, showMainMenu));
    bindPwaControls(this.services, this.root, () => this.render(back, showMainMenu));
  }
}
