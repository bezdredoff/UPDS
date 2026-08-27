import { medallionAsset } from '../../data/characterRigs';
import { productionCharacterKeys } from '../../data/characterProduction';
import {
  blockerPresentation,
  ingredientPresentation,
  isLevelBoardCellActive,
  specialAsset,
  specialAssets,
  specialFallbackAssets,
  type LevelDefinition,
} from '../../data/levels';
import { backgroundAssets } from '../../data/narrative';
import { resolveMatch3TilePresentation } from '../../data/match3TilePresentation';
import type { Match3ReactionId, Match3RunMode } from '../../data/match3Reactions';
import { storyObjectEvidenceTag } from '../../data/match3StoryObjectPresentation';
import type { Match3TutorialConceptId } from '../../data/match3Tutorials';
import type { BoardCell } from '../../engine/Match3Game';
import type { Match3ReactionEmphasis } from '../../ui/match3ReactionPresentation';
import { escapeHtml, headerActionMarkup } from '../../ui/viewMarkup';

export type Match3Translate = (
  key: string,
  params?: Readonly<Record<string, string | number>>,
) => string;

export type Match3BarkPresentation = Readonly<{
  speaker: string;
  text: string;
  reaction?: Readonly<{
    id: Match3ReactionId;
    durationMs: number;
    emphasis: Match3ReactionEmphasis;
  }>;
}>;

export type Match3BoardMotion = Readonly<{
  kind: 'fall' | 'spawn';
  rows: number;
}>;

export type Match3BoardMarkupInput = Readonly<{
  level: LevelDefinition;
  board: readonly BoardCell[];
  selectedCell: number | null;
  hintedCells: ReadonlySet<number>;
  t: Match3Translate;
  clearing?: ReadonlySet<number>;
  motions?: ReadonlyMap<number, Match3BoardMotion>;
}>;

export type Match3IntroMarkupInput = Readonly<{
  level: LevelDefinition;
  levelIndex: number;
  totalLevels: number;
  clueCount: number;
  t: Match3Translate;
  levelTitle: string;
  storyAction: string;
  objectiveLabels: readonly string[];
}>;

export type Match3ScreenMarkupInput = Readonly<{
  level: LevelDefinition;
  board: readonly BoardCell[];
  selectedCell: number | null;
  hintedCells: ReadonlySet<number>;
  movesLeft: number;
  activeLevelIndex: number;
  totalLevels: number;
  runMode: Match3RunMode;
  labSeed: number | null;
  clueCount: number;
  bark: Match3BarkPresentation | null;
  barkEntering: boolean;
  tutorialConcept: Match3TutorialConceptId | null;
  tutorialDismissed: boolean;
  t: Match3Translate;
  levelTitle: string;
  objectiveLabels: readonly string[];
  objectiveValues: readonly number[];
}>;

const match3HelpTopics = [
  ['match3.objective', 'match3.help.objectives.body'],
  ['match3.hint', 'match3.help.hint.body'],
  ['match3.tutorial.clear-blocker.title', 'match3.tutorial.clear-blocker.body'],
  ['match3.tutorial.drop-ingredient.title', 'match3.tutorial.drop-ingredient.body'],
  ['match3.tutorial.activate-special.title', 'match3.tutorial.activate-special.body'],
  ['match3.tutorial.combine-specials.title', 'match3.tutorial.combine-specials.body'],
  ['match3.help.reshuffle.title', 'match3.help.reshuffle.body'],
] as const;

type Match3SpecialId = keyof typeof specialAssets;

const match3HelpSpecials = Object.keys(specialAssets) as Match3SpecialId[];

function match3SpecialImageMarkup(
  special: Match3SpecialId,
  className: string,
  alt: string,
): string {
  return `<img class="${className}" src="${specialAssets[special]}" data-asset-fallback-src="${specialFallbackAssets[special]}" alt="${escapeHtml(alt)}" draggable="false">`;
}

export function match3ContextAttrs(level: LevelDefinition): string {
  const context = level.context;
  return `data-m3-page="${escapeHtml(context.pageBackground)}" data-m3-board-surface="${escapeHtml(context.boardSurface)}" data-m3-board-frame="${escapeHtml(context.boardFrame)}" data-m3-profile="${escapeHtml(context.narrativeProfile)}" data-m3-tile-profile="${escapeHtml(context.tilePresentationProfile)}"`;
}

export function match3ObjectiveMarkup(
  level: LevelDefinition,
  objective: LevelDefinition['objectives'][number],
  label: string,
  value: number,
  showProgress: boolean,
  objectiveIndex?: number,
): string {
  let objectiveIcons: readonly Readonly<{ asset: string; evidenceTag?: string }>[];
  if (objective.kind === 'collect') {
    objectiveIcons = [{ asset: resolveMatch3TilePresentation(level.context.tilePresentationProfile, objective.tile).asset }];
  } else if (objective.kind === 'drop') {
    objectiveIcons = [{ asset: ingredientPresentation[objective.ingredient].asset, evidenceTag: storyObjectEvidenceTag(objective.ingredient) }];
  } else if (objective.kind === 'dropGroup') {
    objectiveIcons = objective.ingredients.map((ingredient) => ({
      asset: ingredientPresentation[ingredient].asset,
      evidenceTag: storyObjectEvidenceTag(ingredient),
    }));
  } else {
    objectiveIcons = [{ asset: blockerPresentation[level.blocker].asset }];
  }

  const current = Math.min(value, objective.target);
  const icons = objectiveIcons
    .map(({ asset, evidenceTag }) => {
      if (!evidenceTag) return `<img src="${asset}" alt="">`;
      const tag = escapeHtml(evidenceTag);
      return `<span class="objective-evidence-icon" data-evidence-tag="${tag}"><img src="${asset}" alt=""><i class="story-object-evidence-tag" aria-hidden="true">${tag}</i></span>`;
    })
    .join('');
  const objectiveIndexAttr = objectiveIndex === undefined ? '' : ` data-objective-index="${objectiveIndex}"`;
  const storyObjectClass =
    objectiveIndex !== undefined && (objective.kind === 'drop' || objective.kind === 'dropGroup')
      ? ` story-object-${objectiveIndex}`
      : '';
  return `<div class="objective${showProgress && current >= objective.target ? ' done' : ''}${storyObjectClass}"${objectiveIndexAttr}>
<div class="objective-icons ${objectiveIcons.length > 1 ? 'multi' : ''}">${icons}</div><span>${escapeHtml(label)}</span>
<b>${showProgress ? `${current}/` : ''}${objective.target}</b>
</div>`;
}

export function match3BoardCellsMarkup(input: Match3BoardMarkupInput): string {
  const { level, board, selectedCell, hintedCells, t, clearing, motions } = input;
  const blockerAsset = blockerPresentation[level.blocker].asset;

  return board
    .map((cell, index) => {
      if (!isLevelBoardCellActive(level, index)) {
        return `<span class="board-cell board-hole" role="gridcell" aria-label="${escapeHtml(t('match3.holeCell'))}" aria-disabled="true"></span>`;
      }
      const selected = selectedCell === index ? ' selected' : '';
      const hinted = hintedCells.has(index) ? ' hinted' : '';
      const clearingClass = clearing?.has(index) ? ' is-clearing' : '';
      const motion = motions?.get(index);
      const motionClass = motion ? ` settle-${motion.kind}` : '';
      const motionStyle = motion ? ` style="--settle-rows:${motion.rows}"` : '';
      const tile = cell.tile
        ? resolveMatch3TilePresentation(level.context.tilePresentationProfile, cell.tile)
        : null;
      const ingredient = cell.ingredient ? ingredientPresentation[cell.ingredient] : null;
      const evidenceTag = cell.ingredient ? storyObjectEvidenceTag(cell.ingredient) : null;
      const cellLabel = cell.ingredient
        ? t(`match3.ingredient.${cell.ingredient}`)
        : cell.tile
          ? t(`match3.tile.${cell.tile}`)
          : t('match3.emptyCell');

      return `<button class="board-cell${selected}${hinted}${clearingClass}${motionClass}" data-cell="${index}" role="gridcell" aria-label="${escapeHtml(cellLabel)}"${motionStyle}>
<span class="tile-socket"></span>
<span class="tile-stack">
${tile ? `<img class="tile" src="${tile.asset}" data-tile-variant="${escapeHtml(tile.variantId)}" alt="" draggable="false">` : ''}
${ingredient ? `<img class="ingredient" src="${ingredient.asset}" alt="" draggable="false">${evidenceTag ? `<i class="story-object-evidence-tag" data-evidence-tag="${escapeHtml(evidenceTag)}" aria-hidden="true">${escapeHtml(evidenceTag)}</i>` : ''}` : ''}
${cell.special ? match3SpecialImageMarkup(cell.special, `special ${cell.special}`, t(`match3.special.${cell.special}`)) : ''}
</span>
${cell.blockerLayers > 0 ? `<span class="blocker"><img src="${blockerAsset}" alt="" draggable="false"><b>${cell.blockerLayers}</b></span>` : ''}
</button>`;
    })
    .join('');
}

export function match3TutorialMarkup(
  concept: Match3TutorialConceptId | null,
  dismissed: boolean,
  t: Match3Translate,
): string {
  if (!concept || dismissed) return '';
  return `<div class="match-tutorial-overlay" role="dialog" aria-modal="true" aria-labelledby="match-tutorial-title">
<div class="match-tutorial-card" data-tutorial-concept="${escapeHtml(concept)}">
<span class="case-tab">${escapeHtml(t('match3.tutorial.label'))}</span>
<h2 id="match-tutorial-title">${escapeHtml(t(`match3.tutorial.${concept}.title`))}</h2>
<p>${escapeHtml(t(`match3.tutorial.${concept}.body`))}</p>
<button id="tutorial-try" class="primary">${escapeHtml(t('match3.tutorial.try'))}</button>
</div>
</div>`;
}

export function match3HelpMarkup(t: Match3Translate): string {
  const trigger = t('match3.help.trigger');
  const topics = match3HelpTopics
    .map(
      ([titleKey, bodyKey]) =>
        `<section class="match-help-topic"><h3>${escapeHtml(t(titleKey))}</h3><p>${escapeHtml(t(bodyKey))}</p></section>`,
    )
    .join('');
  const specials = match3HelpSpecials
    .map((special) => `<li class="match-help-special" data-special="${special}">
<span class="match-help-special-visual" aria-hidden="true">${match3SpecialImageMarkup(special, 'match-help-special-image', '')}</span>
<span><b>${escapeHtml(t(`match3.special.${special}`))}</b><small>${escapeHtml(t(`match3.help.special.${special}.body`))}</small></span>
</li>`)
    .join('');

  return `<details class="match-help">
<summary class="app-header-action match-help-trigger" aria-label="${escapeHtml(trigger)}" title="${escapeHtml(trigger)}"><span aria-hidden="true">?</span><span class="visually-hidden">${escapeHtml(trigger)}</span></summary>
<div class="match-help-popover" role="dialog" aria-labelledby="match-help-title">
<span class="case-tab">${escapeHtml(t('match3.help.label'))}</span>
<h2 id="match-help-title">${escapeHtml(t('match3.help.title'))}</h2>
<p class="match-help-intro">${escapeHtml(t('match3.help.intro'))}</p>
<section class="match-help-specials" aria-labelledby="match-help-specials-title">
<h3 id="match-help-specials-title">${escapeHtml(t('match3.help.specials.title'))}</h3>
<p>${escapeHtml(t('match3.help.specials.intro'))}</p>
<ul class="match-help-special-list">${specials}</ul>
</section>
<div class="match-help-list">${topics}</div>
<p class="match-help-close-hint">${escapeHtml(t('match3.help.closeHint'))}</p>
</div>
</details>`;
}

export function match3StoryObjectGuidanceMarkup(
  level: LevelDefinition,
  objectiveLabels: readonly string[],
  t: Match3Translate,
): string {
  const storyGuidance = level.objectives
    .map((objective, index) => {
      if (objective.kind !== 'drop' && objective.kind !== 'dropGroup') return '';
      const label = objectiveLabels[index] ?? '';
      return `<p class="match-hint story-object-guidance story-object-${index}" data-guidance="story-object" data-objective-index="${index}">${escapeHtml(t('match3.storyObjectGuidance', { object: label }))}</p>`;
    })
    .join('');

  return `<div class="match-guidance-slot" aria-live="polite">
${storyGuidance}
<p class="match-hint default-input-guidance" data-guidance="input">${escapeHtml(t('match3.inputHint'))}</p>
</div>`;
}

function barkMedallion(bark: Match3BarkPresentation, t: Match3Translate): string {
  const character = productionCharacterKeys.find((key) => bark.speaker === t(`character.${key}`));
  return medallionAsset(character ?? 'miku');
}

export function match3BarkMarkup(
  bark: Match3BarkPresentation | null,
  barkEntering: boolean,
  t: Match3Translate,
): string {
  if (!bark) return '';
  const reactionClass = bark.reaction
    ? ` reaction-bark${barkEntering ? ' is-entering' : ''}`
    : '';
  const reactionData = bark.reaction
    ? ` data-reaction-id="${escapeHtml(bark.reaction.id)}" data-emphasis="${escapeHtml(bark.reaction.emphasis)}" data-duration-ms="${bark.reaction.durationMs}"`
    : '';
  return `<div class="field-bark${reactionClass}"${reactionData}><img src="${barkMedallion(bark, t)}" alt=""><div><b>${escapeHtml(bark.speaker)}</b><span>${escapeHtml(bark.text)}</span></div></div>`;
}

function detectiveStripMarkup(t: Match3Translate): string {
  return (['miku', 'onoe', 'ayuki'] as const)
    .map(
      (key) =>
        `<span><img src="${medallionAsset(key)}" alt="${escapeHtml(t(`character.${key}`))}"><b>${escapeHtml(t(`character.${key}`))}</b></span>`,
    )
    .join('');
}

export function match3IntroMarkup(input: Match3IntroMarkupInput): string {
  const { level, levelIndex, totalLevels, clueCount, t, levelTitle, storyAction, objectiveLabels } = input;
  return `<section class="level-intro" ${match3ContextAttrs(level)}>
<img class="level-intro-background" src="${backgroundAssets[level.context.pageBackground]}" alt="">
<div class="level-intro-shade"></div>
<header class="app-header match-topbar intro-topbar">
${headerActionMarkup('back', 'back', t('common.back'), undefined, 'app-header-back')}
<div class="app-header-title"><small>${escapeHtml(t('match3.investigation', { current: levelIndex + 1, total: totalLevels }))}</small><b>${escapeHtml(levelTitle)}</b></div>
<nav class="app-header-actions" aria-label="${escapeHtml(t('match3.investigationNavigation'))}">
${headerActionMarkup('dossier', 'dossier', t('dossier.title'), clueCount)}
${match3HelpMarkup(t)}
${headerActionMarkup('header-settings', 'settings', t('common.settings'))}
</nav>
</header>
<div class="level-card">
<p class="eyebrow">${escapeHtml(level.id)}</p>
<h2>${escapeHtml(levelTitle)}</h2>
<p>${escapeHtml(storyAction)}</p>
<div class="intro-objectives">${level.objectives.map((objective, index) => match3ObjectiveMarkup(level, objective, objectiveLabels[index] ?? '', 0, false, index)).join('')}</div>
<div class="moves-chip"><b>${level.moves}</b><span>${escapeHtml(t('match3.moves'))}</span></div>
<button id="start" class="primary">${escapeHtml(t('match3.start'))}</button>
</div>
</section>`;
}

export function match3ScreenMarkup(input: Match3ScreenMarkupInput): string {
  const {
    level,
    board,
    selectedCell,
    hintedCells,
    movesLeft,
    activeLevelIndex,
    totalLevels,
    runMode,
    labSeed,
    clueCount,
    bark,
    barkEntering,
    tutorialConcept,
    tutorialDismissed,
    t,
    levelTitle,
    objectiveLabels,
    objectiveValues,
  } = input;

  const quitLabel =
    runMode === 'lab'
      ? t('levelLab.backToLab')
      : runMode === 'campaign'
        ? t('match3Campaign.backToCampaign')
        : t('match3.backToInvestigation');
  const stageLabel =
    runMode === 'lab'
      ? t('levelLab.runLabel')
      : runMode === 'campaign'
        ? t('match3Campaign.stage', { current: activeLevelIndex + 1, total: totalLevels })
        : t('match3.stage', { current: activeLevelIndex + 1, total: totalLevels });
  const stageId = runMode === 'lab' ? `SEED ${labSeed ?? 0}` : level.shortId;

  return `<section class="match-screen${tutorialConcept && !tutorialDismissed ? ' tutorial-active' : ''}" ${match3ContextAttrs(level)}>
<img class="match-background" src="${backgroundAssets[level.context.pageBackground]}" alt="">
<div class="match-shade"></div>
<header class="app-header match-topbar">
${headerActionMarkup('quit', 'back', quitLabel, undefined, 'app-header-back')}
<div class="app-header-title"><small>${escapeHtml(level.shortId)}</small><b>${escapeHtml(levelTitle)}</b></div>
<nav class="app-header-actions" aria-label="${escapeHtml(t('match3.investigationNavigation'))}">
${runMode === 'story' ? headerActionMarkup('dossier', 'dossier', t('dossier.title'), clueCount) : ''}
${match3HelpMarkup(t)}
${headerActionMarkup('header-settings', 'settings', t('common.settings'))}
</nav>
</header>
<div class="match-case-hud">
<section class="objective-board" aria-label="${escapeHtml(t('match3.objectivesAria'))}">
<span class="case-tab">${escapeHtml(t('match3.objective'))}</span>
<div class="objectives">${level.objectives.map((objective, index) => match3ObjectiveMarkup(level, objective, objectiveLabels[index] ?? '', objectiveValues[index] ?? 0, true, index)).join('')}</div>
</section>
<section class="stage-board" aria-label="${escapeHtml(t('match3.movesStageAria'))}">
<span class="case-tab">${escapeHtml(t('match3.movesUpper'))}</span>
<div class="moves-left"><b>${movesLeft}</b></div>
<div class="stage-meta"><small>${escapeHtml(stageLabel)}</small><b>${escapeHtml(stageId)}</b></div>
</section>
</div>
<div class="field-bark-slot" aria-live="polite">${match3BarkMarkup(bark, barkEntering, t)}</div>
<div id="match-feedback" class="match-feedback" aria-live="polite"></div>
<div class="board" role="grid" aria-label="${escapeHtml(t('match3.boardAria'))}">${match3BoardCellsMarkup({ level, board, selectedCell, hintedCells, t })}</div>
<div class="match-tooltray">
<div class="detective-strip" aria-label="${escapeHtml(t('match3.teamAria'))}">
${detectiveStripMarkup(t)}
</div>
<button id="hint" class="hint-button">
<img src="${specialAsset}" alt=""><span><b>${escapeHtml(t('match3.hint'))}</b><small>${escapeHtml(t('match3.bestMove'))}</small></span>
</button>
</div>
${match3StoryObjectGuidanceMarkup(level, objectiveLabels, t)}
${match3TutorialMarkup(tutorialConcept, tutorialDismissed, t)}
</section>`;
}
