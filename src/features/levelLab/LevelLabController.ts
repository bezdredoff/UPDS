import {
  BOARD_SIZE,
  blockerPresentation,
  ingredientPresentation,
  levels,
  validateLevelDefinitions,
  type LevelDefinition,
} from '../../data/levels';
import { resolveMatch3TilePresentation } from '../../data/match3TilePresentation';
import { Match3Game, type BoardCell } from '../../engine/Match3Game';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppShell } from '../../app/AppShell';
import { escapeHtml, panelHeaderMarkup } from '../../ui/viewMarkup';

export const MAX_LEVEL_LAB_SEED = 0xffffffff;

export function normalizeLevelLabSeed(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback >>> 0;
  return Math.max(0, Math.min(MAX_LEVEL_LAB_SEED, Math.trunc(parsed))) >>> 0;
}

export function levelLabBoardSignature(level: LevelDefinition, seed: number): string {
  const game = new Match3Game(level, normalizeLevelLabSeed(seed, level.seed));
  return game.board.map((cell) => `${cell.tile ?? '-'}:${cell.ingredient ?? '-'}:${cell.blockerLayers}:${cell.special ?? '-'}`).join('|');
}

export class LevelLabController {
  constructor(
    private readonly root: HTMLElement,
    private readonly services: RuntimeServices,
    private readonly shell: AppShell,
    private readonly navigation: AppNavigation,
    private readonly onPlay: (levelIndex: number, seed: number) => void,
  ) {}

  render(levelIndex = 0, requestedSeed?: number): void {
    const safeLevelIndex = Math.max(0, Math.min(levels.length - 1, Math.trunc(levelIndex) || 0));
    const level = levels[safeLevelIndex];
    const seed = normalizeLevelLabSeed(requestedSeed ?? level.seed, level.seed);
    const game = new Match3Game(level, seed);
    const validationErrors = validateLevelDefinitions([level]);
    const t = (key: string, params: Readonly<Record<string, string | number | boolean>> = {}) => escapeHtml(this.services.localization.t(key, params));

    this.services.audio.setScene('menu');
    this.services.telemetry.trackScreen('level-lab', `${level.id}:${seed}`);
    this.shell.render(`<section class="panel level-lab-screen">
      ${panelHeaderMarkup(this.services.localization.t('levelLab.eyebrow'), this.services.localization.t('levelLab.title'), {
        settings: true,
        backLabel: this.services.localization.t('common.back'),
        navigationLabel: this.services.localization.t('common.navigation'),
        settingsLabel: this.services.localization.t('common.settings'),
      })}
      <h2>${t('levelLab.heading')}</h2>
      <p class="panel-copy">${t('levelLab.copy')}</p>

      <div class="level-lab-controls">
        <label><span>${t('levelLab.level')}</span><select id="lab-level">
          ${levels.map((candidate, index) => `<option value="${index}"${index === safeLevelIndex ? ' selected' : ''}>${escapeHtml(candidate.shortId)} · ${t(`match3.level.${candidate.id}.title`)}</option>`).join('')}
        </select></label>
        <label><span>${t('levelLab.seed')}</span><input id="lab-seed" type="number" inputmode="numeric" min="0" max="${MAX_LEVEL_LAB_SEED}" step="1" value="${seed}"></label>
        <div class="level-lab-control-actions">
          <button id="lab-preview">${t('levelLab.previewSeed')}</button>
          <button id="lab-default-seed">${t('levelLab.defaultSeed')}</button>
        </div>
      </div>

      <div class="level-lab-status ${validationErrors.length ? 'invalid' : 'valid'}">
        <b>${validationErrors.length ? t('levelLab.invalid') : t('levelLab.valid')}</b>
        <span>${validationErrors.length ? escapeHtml(validationErrors.join(' · ')) : t('levelLab.validDetail')}</span>
      </div>

      <div class="level-lab-config-grid">
        <article><small>${t('levelLab.moves')}</small><b>${level.moves}</b><span>${escapeHtml(level.id)}</span></article>
        <article><small>${t('levelLab.blockers')}</small><b>${level.blockers.length}</b><span>${t(`levelLab.blocker.${level.blocker}`)} · ${level.blockers.reduce((sum, blocker) => sum + blocker.layers, 0)} ${t('levelLab.layers')}</span></article>
        <article><small>${t('levelLab.ingredients')}</small><b>${level.ingredients.length}</b><span>${level.ingredients.map((item) => `${t(`match3.ingredient.${item.kind}`)} @${item.index}`).join(' · ')}</span></article>
        <article><small>${t('levelLab.objectives')}</small><b>${level.objectives.length}</b><span>${level.objectives.map((objective, index) => `${t(`match3.level.${level.id}.objective.${index}`)} ×${objective.target}`).join(' · ')}</span></article>
      </div>

      <section class="level-lab-board-card">
        <div class="level-lab-section-title"><div><small>${t('levelLab.initialBoard')}</small><b>${escapeHtml(level.shortId)} · seed ${seed}</b></div><span>${BOARD_SIZE}×${BOARD_SIZE}</span></div>
        <div class="level-lab-board" role="img" aria-label="${t('levelLab.boardAria', { level: level.shortId, seed })}">${this.boardMarkup(level, game.board)}</div>
      </section>

      <section class="level-lab-details">
        <div><small>${t('levelLab.activeTiles')}</small><div class="level-lab-tile-list">${level.activeTiles.map((tile) => {
          const presentation = resolveMatch3TilePresentation(level.context.tilePresentationProfile, tile);
          return `<span><img src="${presentation.asset}" alt=""><b>${t(`match3.tile.${tile}`)}</b></span>`;
        }).join('')}</div></div>
        <div class="level-lab-context"><small>${t('levelLab.context')}</small><code>${escapeHtml(level.context.pageBackground)}</code><code>${escapeHtml(level.context.boardSurface)}</code><code>${escapeHtml(level.context.boardFrame)}</code><code>${escapeHtml(level.context.narrativeProfile)}</code></div>
      </section>

      <button id="lab-play" class="primary level-lab-play">${t('levelLab.playSeed', { seed })}</button>
      <p class="level-lab-footnote">${t('levelLab.noSaveSideEffects')}</p>
    </section>`);

    this.root.querySelector('#back')?.addEventListener('click', () => this.navigation.showMenu());
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.navigation.showSettings(() => this.render(safeLevelIndex, seed), true));
    this.root.querySelector<HTMLSelectElement>('#lab-level')?.addEventListener('change', (event) => {
      const next = Number((event.currentTarget as HTMLSelectElement).value);
      this.render(next, levels[next]?.seed);
    });
    const seedInput = this.root.querySelector<HTMLInputElement>('#lab-seed');
    this.root.querySelector('#lab-preview')?.addEventListener('click', () => this.render(safeLevelIndex, normalizeLevelLabSeed(seedInput?.value, level.seed)));
    this.root.querySelector('#lab-default-seed')?.addEventListener('click', () => this.render(safeLevelIndex, level.seed));
    this.root.querySelector('#lab-play')?.addEventListener('click', () => this.onPlay(safeLevelIndex, normalizeLevelLabSeed(seedInput?.value, level.seed)));
  }

  private boardMarkup(level: LevelDefinition, board: readonly BoardCell[]): string {
    const blockerAsset = blockerPresentation[level.blocker].asset;
    return board.map((cell, index) => {
      const tile = cell.tile ? resolveMatch3TilePresentation(level.context.tilePresentationProfile, cell.tile) : null;
      const ingredient = cell.ingredient ? ingredientPresentation[cell.ingredient] : null;
      return `<span class="level-lab-cell" data-lab-cell="${index}">
        ${tile ? `<img class="level-lab-tile" src="${tile.asset}" alt="">` : ''}
        ${ingredient ? `<img class="level-lab-ingredient" src="${ingredient.asset}" alt="">` : ''}
        ${cell.blockerLayers > 0 ? `<span class="level-lab-blocker"><img src="${blockerAsset}" alt=""><b>${cell.blockerLayers}</b></span>` : ''}
      </span>`;
    }).join('');
  }
}
