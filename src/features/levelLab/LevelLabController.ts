import {
  BOARD_SIZE,
  blockerPresentation,
  ingredientPresentation,
  levels,
  tileKeys,
  validateLevelDefinitions,
  type BlockerKey,
  type BoardPlacement,
  type IngredientKey,
  type IngredientPlacement,
  type LevelDefinition,
  type LevelObjective,
  type Match3TileId,
} from '../../data/levels';
import { resolveMatch3TilePresentation } from '../../data/match3TilePresentation';
import { Match3Game, type BoardCell } from '../../engine/Match3Game';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppShell } from '../../app/AppShell';
import { escapeHtml, panelHeaderMarkup } from '../../ui/viewMarkup';

export const MAX_LEVEL_LAB_SEED = 0xffffffff;

export type LevelLabDraft = Readonly<{
  moves: number;
  blocker: BlockerKey;
  blockers: readonly BoardPlacement[];
  ingredients: readonly IngredientPlacement[];
  objectives: readonly LevelObjective[];
  activeTiles: readonly Match3TileId[];
  spawnWeights: Readonly<Partial<Record<Match3TileId, number>>>;
}>;

export function normalizeLevelLabSeed(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback >>> 0;
  return Math.max(0, Math.min(MAX_LEVEL_LAB_SEED, Math.trunc(parsed))) >>> 0;
}

export function createLevelLabDraft(level: LevelDefinition): LevelLabDraft {
  const spawnWeights: Partial<Record<Match3TileId, number>> = {};
  for (const tile of level.activeTiles) spawnWeights[tile] = level.spawnWeights?.[tile] ?? 1;
  return {
    moves: level.moves,
    blocker: level.blocker,
    blockers: level.blockers.map((placement) => ({ ...placement })),
    ingredients: level.ingredients.map((placement) => ({ ...placement })),
    objectives: level.objectives.map((objective) => ({ ...objective })),
    activeTiles: [...level.activeTiles],
    spawnWeights,
  };
}

function canonicalSpawnWeights(draft: LevelLabDraft): Readonly<Partial<Record<Match3TileId, number>>> | undefined {
  const weights: Partial<Record<Match3TileId, number>> = {};
  let custom = false;
  for (const tile of draft.activeTiles) {
    const weight = draft.spawnWeights[tile] ?? 1;
    weights[tile] = weight;
    if (weight !== 1) custom = true;
  }
  return custom ? weights : undefined;
}

export function applyLevelLabDraft(base: LevelDefinition, draft: LevelLabDraft): LevelDefinition {
  const spawnWeights = canonicalSpawnWeights(draft);
  return {
    ...base,
    moves: draft.moves,
    blocker: draft.blocker,
    blockers: draft.blockers,
    ingredients: draft.ingredients,
    objectives: draft.objectives,
    activeTiles: draft.activeTiles,
    ...(spawnWeights ? { spawnWeights } : { spawnWeights: undefined }),
  };
}

export function validateLevelLabDraft(base: LevelDefinition, draft: LevelLabDraft): string[] {
  return validateLevelDefinitions([applyLevelLabDraft(base, draft)]);
}

export function exportLevelLabDraft(base: LevelDefinition, draft: LevelLabDraft): string {
  const spawnWeights = canonicalSpawnWeights(draft);
  return JSON.stringify({
    format: 'upds-level-lab-v1',
    levelId: base.id,
    moves: draft.moves,
    activeTiles: draft.activeTiles,
    ...(spawnWeights ? { spawnWeights } : {}),
    blocker: draft.blocker,
    blockers: draft.blockers,
    ingredients: draft.ingredients,
    objectives: draft.objectives,
  }, null, 2);
}

export function levelLabBoardSignature(level: LevelDefinition, seed: number): string {
  const game = new Match3Game(level, normalizeLevelLabSeed(seed, level.seed));
  return game.board.map((cell) => `${cell.tile ?? '-'}:${cell.ingredient ?? '-'}:${cell.blockerLayers}:${cell.special ?? '-'}`).join('|');
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

function parseJsonArray(raw: string, label: string): { value: unknown[]; errors: string[] } {
  try {
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value) ? { value, errors: [] } : { value: [], errors: [`${label}: expected JSON array`] };
  } catch (error) {
    return { value: [], errors: [`${label}: ${error instanceof Error ? error.message : 'invalid JSON'}`] };
  }
}

function parseBlockers(raw: string): { value: BoardPlacement[]; errors: string[] } {
  const parsed = parseJsonArray(raw, 'blockers');
  const errors = [...parsed.errors];
  const value: BoardPlacement[] = [];
  parsed.value.forEach((item, index) => {
    if (!isRecord(item) || typeof item.index !== 'number' || !Number.isInteger(item.index) || (item.layers !== 1 && item.layers !== 2)) {
      errors.push(`blockers[${index}]: expected { index: integer, layers: 1|2 }`);
      return;
    }
    value.push({ index: Number(item.index), layers: item.layers });
  });
  return { value, errors };
}

function parseIngredients(raw: string): { value: IngredientPlacement[]; errors: string[] } {
  const parsed = parseJsonArray(raw, 'ingredients');
  const errors = [...parsed.errors];
  const value: IngredientPlacement[] = [];
  const ingredientKinds = new Set(Object.keys(ingredientPresentation));
  parsed.value.forEach((item, index) => {
    if (!isRecord(item) || typeof item.index !== 'number' || !Number.isInteger(item.index) || typeof item.kind !== 'string' || !ingredientKinds.has(item.kind)) {
      errors.push(`ingredients[${index}]: expected valid { index, kind }`);
      return;
    }
    value.push({ index: Number(item.index), kind: item.kind as IngredientKey });
  });
  return { value, errors };
}

function parseObjectives(raw: string): { value: LevelObjective[]; errors: string[] } {
  const parsed = parseJsonArray(raw, 'objectives');
  const errors = [...parsed.errors];
  const value: LevelObjective[] = [];
  const validTiles = new Set(tileKeys);
  const ingredientKinds = new Set(Object.keys(ingredientPresentation));
  parsed.value.forEach((item, index) => {
    if (!isRecord(item) || typeof item.kind !== 'string' || typeof item.target !== 'number' || !Number.isInteger(item.target) || item.target <= 0 || typeof item.label !== 'string' || item.label.trim() === '') {
      errors.push(`objectives[${index}]: expected kind, positive integer target and label`);
      return;
    }
    if (item.kind === 'collect' && typeof item.tile === 'string' && validTiles.has(item.tile as Match3TileId)) {
      value.push({ kind: 'collect', tile: item.tile as Match3TileId, target: Number(item.target), label: item.label });
      return;
    }
    if (item.kind === 'clearBlockers') {
      value.push({ kind: 'clearBlockers', target: Number(item.target), label: item.label });
      return;
    }
    if (item.kind === 'drop' && typeof item.ingredient === 'string' && ingredientKinds.has(item.ingredient)) {
      value.push({ kind: 'drop', ingredient: item.ingredient as IngredientKey, target: Number(item.target), label: item.label });
      return;
    }
    errors.push(`objectives[${index}]: unsupported objective shape`);
  });
  return { value, errors };
}

export class LevelLabController {
  private readonly drafts = new Map<number, LevelLabDraft>();

  constructor(
    private readonly root: HTMLElement,
    private readonly services: RuntimeServices,
    private readonly shell: AppShell,
    private readonly navigation: AppNavigation,
    private readonly onPlay: (levelIndex: number, seed: number, level: LevelDefinition) => void,
  ) {}

  render(levelIndex = 0, requestedSeed?: number): void {
    const safeLevelIndex = Math.max(0, Math.min(levels.length - 1, Math.trunc(levelIndex) || 0));
    const baseLevel = levels[safeLevelIndex];
    const draft = this.drafts.get(safeLevelIndex) ?? createLevelLabDraft(baseLevel);
    const level = applyLevelLabDraft(baseLevel, draft);
    const seed = normalizeLevelLabSeed(requestedSeed ?? level.seed, level.seed);
    const validationErrors = validateLevelLabDraft(baseLevel, draft);
    const game = validationErrors.length === 0 ? new Match3Game(level, seed) : null;
    const exported = exportLevelLabDraft(baseLevel, draft);
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

      <section class="level-lab-editor">
        <div class="level-lab-section-title"><div><small>${t('levelLab.editorEyebrow')}</small><b>${t('levelLab.editorTitle')}</b></div><span>${t('levelLab.draftOnly')}</span></div>
        <div class="level-lab-editor-row">
          <label><span>${t('levelLab.moves')}</span><input id="lab-moves" type="number" min="1" step="1" value="${draft.moves}"></label>
          <label><span>${t('levelLab.blockerType')}</span><select id="lab-blocker-type">${Object.keys(blockerPresentation).map((key) => `<option value="${key}"${draft.blocker === key ? ' selected' : ''}>${t(`levelLab.blocker.${key}`)}</option>`).join('')}</select></label>
        </div>
        <div class="level-lab-editor-block">
          <small>${t('levelLab.tileWeights')}</small>
          <div class="level-lab-tile-editor">${tileKeys.map((tile) => {
            const presentation = resolveMatch3TilePresentation(level.context.tilePresentationProfile, tile);
            const checked = draft.activeTiles.includes(tile);
            const weight = draft.spawnWeights[tile] ?? 1;
            return `<label class="level-lab-tile-edit${checked ? ' selected' : ''}"><input class="lab-tile-toggle" data-tile="${tile}" type="checkbox"${checked ? ' checked' : ''}><img src="${presentation.asset}" alt=""><span>${t(`match3.tile.${tile}`)}</span><input class="lab-weight" data-weight-tile="${tile}" type="number" min="0.01" step="0.1" value="${weight}"></label>`;
          }).join('')}</div>
        </div>
        <label class="level-lab-json-field"><span>${t('levelLab.blockerPlacements')}</span><textarea id="lab-blockers-json" rows="4" spellcheck="false">${escapeHtml(JSON.stringify(draft.blockers, null, 2))}</textarea></label>
        <label class="level-lab-json-field"><span>${t('levelLab.ingredientPlacements')}</span><textarea id="lab-ingredients-json" rows="4" spellcheck="false">${escapeHtml(JSON.stringify(draft.ingredients, null, 2))}</textarea></label>
        <label class="level-lab-json-field"><span>${t('levelLab.objectiveEditor')}</span><textarea id="lab-objectives-json" rows="7" spellcheck="false">${escapeHtml(JSON.stringify(draft.objectives, null, 2))}</textarea></label>
        <div class="level-lab-editor-actions"><button id="lab-apply" class="primary">${t('levelLab.validatePreview')}</button><button id="lab-reset">${t('levelLab.resetDraft')}</button></div>
      </section>

      <div class="level-lab-status ${validationErrors.length ? 'invalid' : 'valid'}" id="lab-validation">
        <b>${validationErrors.length ? t('levelLab.invalid') : t('levelLab.valid')}</b>
        <span>${validationErrors.length ? escapeHtml(validationErrors.join(' · ')) : t('levelLab.validDetail')}</span>
      </div>

      <div class="level-lab-config-grid">
        <article><small>${t('levelLab.moves')}</small><b>${level.moves}</b><span>${escapeHtml(level.id)}</span></article>
        <article><small>${t('levelLab.blockers')}</small><b>${level.blockers.length}</b><span>${t(`levelLab.blocker.${level.blocker}`)} · ${level.blockers.reduce((sum, blocker) => sum + blocker.layers, 0)} ${t('levelLab.layers')}</span></article>
        <article><small>${t('levelLab.ingredients')}</small><b>${level.ingredients.length}</b><span>${level.ingredients.map((item) => `${t(`match3.ingredient.${item.kind}`)} @${item.index}`).join(' · ')}</span></article>
        <article><small>${t('levelLab.objectives')}</small><b>${level.objectives.length}</b><span>${level.objectives.map((objective) => `${escapeHtml(objective.label)} ×${objective.target}`).join(' · ')}</span></article>
      </div>

      <section class="level-lab-board-card">
        <div class="level-lab-section-title"><div><small>${t('levelLab.initialBoard')}</small><b>${escapeHtml(level.shortId)} · seed ${seed}</b></div><span>${BOARD_SIZE}×${BOARD_SIZE}</span></div>
        ${game ? `<div class="level-lab-board" role="img" aria-label="${t('levelLab.boardAria', { level: level.shortId, seed })}">${this.boardMarkup(level, game.board)}</div>` : `<p class="level-lab-preview-error">${t('levelLab.previewBlocked')}</p>`}
      </section>

      <section class="level-lab-details">
        <div><small>${t('levelLab.activeTiles')}</small><div class="level-lab-tile-list">${level.activeTiles.map((tile) => {
          const presentation = resolveMatch3TilePresentation(level.context.tilePresentationProfile, tile);
          const weight = level.spawnWeights?.[tile] ?? 1;
          return `<span><img src="${presentation.asset}" alt=""><b>${t(`match3.tile.${tile}`)} · w${weight}</b></span>`;
        }).join('')}</div></div>
        <div class="level-lab-context"><small>${t('levelLab.context')}</small><code>${escapeHtml(level.context.pageBackground)}</code><code>${escapeHtml(level.context.boardSurface)}</code><code>${escapeHtml(level.context.boardFrame)}</code><code>${escapeHtml(level.context.narrativeProfile)}</code></div>
      </section>

      <section class="level-lab-export"><small>${t('levelLab.exportEyebrow')}</small><textarea id="lab-export-json" rows="8" readonly spellcheck="false">${escapeHtml(exported)}</textarea><button id="lab-copy-json">${t('levelLab.copyJson')}</button></section>
      <button id="lab-play" class="primary level-lab-play"${validationErrors.length ? ' disabled' : ''}>${t('levelLab.playDraft', { seed })}</button>
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
    this.root.querySelector('#lab-apply')?.addEventListener('click', () => this.applyDraftFromForm(safeLevelIndex, seed));
    this.root.querySelector('#lab-reset')?.addEventListener('click', () => { this.drafts.delete(safeLevelIndex); this.render(safeLevelIndex, baseLevel.seed); });
    this.root.querySelector('#lab-copy-json')?.addEventListener('click', () => this.copyExportJson());
    this.root.querySelector('#lab-play')?.addEventListener('click', () => {
      if (validationErrors.length === 0) this.onPlay(safeLevelIndex, normalizeLevelLabSeed(seedInput?.value, level.seed), level);
    });
  }

  private applyDraftFromForm(levelIndex: number, seed: number): void {
    const base = levels[levelIndex];
    const errors: string[] = [];
    const moves = Number(this.root.querySelector<HTMLInputElement>('#lab-moves')?.value);
    if (!Number.isInteger(moves) || moves <= 0) errors.push('moves: expected positive integer');
    const blocker = this.root.querySelector<HTMLSelectElement>('#lab-blocker-type')?.value as BlockerKey;
    if (!blockerPresentation[blocker]) errors.push('blocker: unknown type');

    const activeTiles = [...this.root.querySelectorAll<HTMLInputElement>('.lab-tile-toggle:checked')].map((input) => input.dataset.tile as Match3TileId);
    const spawnWeights: Partial<Record<Match3TileId, number>> = {};
    for (const tile of activeTiles) {
      const input = this.root.querySelector<HTMLInputElement>(`.lab-weight[data-weight-tile="${tile}"]`);
      const weight = Number(input?.value);
      if (!Number.isFinite(weight) || weight <= 0) errors.push(`spawnWeights.${tile}: expected positive number`);
      else spawnWeights[tile] = weight;
    }

    const blockers = parseBlockers(this.root.querySelector<HTMLTextAreaElement>('#lab-blockers-json')?.value ?? '[]');
    const ingredients = parseIngredients(this.root.querySelector<HTMLTextAreaElement>('#lab-ingredients-json')?.value ?? '[]');
    const objectives = parseObjectives(this.root.querySelector<HTMLTextAreaElement>('#lab-objectives-json')?.value ?? '[]');
    errors.push(...blockers.errors, ...ingredients.errors, ...objectives.errors);

    if (errors.length === 0) {
      const draft: LevelLabDraft = { moves, blocker, blockers: blockers.value, ingredients: ingredients.value, objectives: objectives.value, activeTiles, spawnWeights };
      errors.push(...validateLevelLabDraft(base, draft));
      if (errors.length === 0) {
        this.drafts.set(levelIndex, draft);
        this.render(levelIndex, seed);
        return;
      }
    }
    this.showFormErrors(errors);
  }

  private showFormErrors(errors: readonly string[]): void {
    const status = this.root.querySelector<HTMLElement>('#lab-validation');
    if (!status) return;
    status.classList.remove('valid');
    status.classList.add('invalid');
    status.innerHTML = `<b>${escapeHtml(this.services.localization.t('levelLab.invalid'))}</b><span>${escapeHtml(errors.join(' · '))}</span>`;
  }

  private copyExportJson(): void {
    const textarea = this.root.querySelector<HTMLTextAreaElement>('#lab-export-json');
    if (!textarea) return;
    const clipboard = globalThis.navigator?.clipboard;
    if (clipboard?.writeText) {
      void clipboard.writeText(textarea.value);
      return;
    }
    textarea.focus();
    textarea.select();
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
