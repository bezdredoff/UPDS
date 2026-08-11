import { cluePresentation, levels } from '../../data/levels';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppSession } from '../../app/AppSession';
import type { AppShell } from '../../app/AppShell';
import { escapeHtml, panelHeaderMarkup } from '../../ui/viewMarkup';

export class DossierController {
  constructor(
    private readonly root: HTMLElement,
    private readonly services: RuntimeServices,
    private readonly session: AppSession,
    private readonly shell: AppShell,
    private readonly navigation: AppNavigation,
  ) {}

  render(back: () => void): void {
    this.services.audio.play('dossier');
    this.services.telemetry.trackScreen('dossier');
    const kentaroCleared = this.session.save.completed.includes(1);
    const norihiroCleared = this.session.save.completed.includes(3);
    this.shell.render(`<section class="panel dossier">
      ${panelHeaderMarkup('ДЕЛО 001', 'Досье')}
      <h2>Серийные пропажи</h2>
      <div class="tabs"><b>Улики</b><span>Версии</span><span>Хронология</span></div>
      <div class="clue-grid">${levels.map((level, index) => {
        const unlocked = this.session.save.clues.includes(level.clueId);
        const clue = cluePresentation[level.clueId];
        return `<article class="clue-card ${unlocked ? '' : 'locked'}">
          <div>${unlocked ? `<img src="${clue.asset}" alt="">` : '<span>?</span>'}</div>
          <small>УЛИКА 0${index + 1}</small>
          <b>${unlocked ? escapeHtml(level.clueTitle) : 'Не открыта'}</b>
          <p>${unlocked ? escapeHtml(level.clueSummary) : 'Победите в соответствующем расследовании.'}</p>
        </article>`;
      }).join('')}</div>
      <h3>Проверяемые версии</h3>
      <div class="suspects">
        <article class="${kentaroCleared ? 'cleared' : ''}"><i>К</i><span><b>Кэнтаро</b><small>${kentaroCleared ? 'ОПРАВДАН ТАЙМКОДАМИ' : 'АКТИВНАЯ ВЕРСИЯ'}</small></span></article>
        <article class="${norihiroCleared ? 'cleared' : ''}"><i>Н</i><span><b>Норихиро</b><small>${norihiroCleared ? 'ВЕРСИЯ ЗАКРЫТА' : 'ОЖИДАЕТ ПРОВЕРКИ'}</small></span></article>
      </div>
      <button id="reset" class="danger-link">Сбросить прогресс</button>
    </section>`);
    this.root.querySelector('#back')?.addEventListener('click', back);
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.navigation.showSettings(() => this.render(back), true));
    this.root.querySelector('#reset')?.addEventListener('click', () => {
      this.session.clearProgress();
      this.navigation.showMenu();
    });
  }
}
