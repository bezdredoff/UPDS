import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppShell } from '../../app/AppShell';
import { iconMarkup as icon, panelHeaderMarkup } from '../../ui/viewMarkup';
import { audioSettingsMarkup, bindAudioSettingsControls, bindPwaControls, pwaStatusMarkup } from '../../ui/systemControls';

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
    this.services.telemetry.trackScreen('settings', matchActive ? 'match' : 'system');
    this.shell.render(`<section class="panel settings-panel">
      ${panelHeaderMarkup('CONFIG · SYSTEM', 'Настройки', { settings: false })}
      <h2>Звук и отклик</h2>
      <p class="panel-copy">Музыка и SFX генерируются локально через Web Audio и не требуют загрузки аудиофайлов. Настройки сохраняются отдельно от игрового прогресса.</p>
      ${audioSettingsMarkup(this.services)}
      <h2>Установка и офлайн</h2>
      ${pwaStatusMarkup(this.services)}
      <div class="settings-note"><b>Мобильный контракт</b><span>Звук активируется только после первого касания/клавиши. При сворачивании вкладки музыка приостанавливается и безопасно возобновляется при возвращении.</span></div>
      ${showMainMenu ? `<div class="settings-navigation"><small>НАВИГАЦИЯ</small><button id="settings-main-menu">${icon('menu')}<span><b>Главное меню</b><em>${matchActive ? 'Текущая попытка потребует подтверждения' : 'Сохранённый прогресс не потеряется'}</em></span></button></div>` : ''}
    </section>`);
    this.root.querySelector('#back')?.addEventListener('click', back);
    this.root.querySelector('#settings-main-menu')?.addEventListener('click', () => this.navigation.returnToMainMenu());
    bindAudioSettingsControls(this.services, this.root, () => this.render(back, showMainMenu));
    bindPwaControls(this.services, this.root, () => this.render(back, showMainMenu));
  }
}
