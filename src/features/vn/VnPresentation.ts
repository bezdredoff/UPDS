import {
  characterForSpeaker,
  characterRigs,
  resolvedCharacterStaging,
  resolvedCharacterXPercent,
  poseAsset,
  expressionAsset,
  expressionForDirection,
  placeholderCharacters,
  placeholderForSpeaker,
  type CharacterKey,
  type RuntimeExpression,
} from '../../data/characterRigs';
import {
  guestWitnessAssetForDirection,
  guestWitnessForSpeaker,
} from '../../data/guestWitnesses';
import { cluePresentation, levels, type ClueId } from '../../data/levels';
import {
  backgroundAssets,
  getBackgroundForLine,
  isDirection,
  type ChoiceId,
  type StoryLine,
} from '../../data/narrative';
import type { StoryChoiceGate, StoryChoiceOptionId } from '../../data/storyChoices';
import { resolveVnStaging, type VnStageSide } from '../../ui/vnStaging';
import {
  authoredVnShotAssets,
  resolveAuthoredVnShot,
  vnAuthoredShotMarkup,
} from '../../ui/vnAuthoredShots';
import { guestWitnessStageMarkup } from '../../ui/guestWitnessMarkup';
import type { AutoSpeed, TextScale } from '../../ui/vnPlayback';
import { escapeHtml, headerActionMarkup, iconMarkup as icon } from '../../ui/viewMarkup';

export type VnStagePresentation = Readonly<{
  direction: boolean;
  backgroundAsset: string;
  stageSide: string;
  stageMarkup: string;
  preloadAssets: readonly string[];
}>;

export type VnHistoryPresentationEntry = Readonly<{
  id: string;
  speaker: string;
  text: string;
  direction: boolean;
}>;

export type VnChoicePresentationOption = Readonly<{
  id: ChoiceId;
  title: string;
  effect: string;
}>;

export type VnStoryChoicePresentationOption = Readonly<{
  id: StoryChoiceOptionId;
  title: string;
  effect: string;
}>;

const characterStageMarkup = (
  character: CharacterKey,
  expression: RuntimeExpression,
  direction: string,
  side: VnStageSide,
): string => {
  const rig = characterRigs[character];
  const staging = resolvedCharacterStaging(character);
  const xPercent = resolvedCharacterXPercent(character);
  const style = `--character-scale:${staging.scale};--character-x:${xPercent}%;--character-y:${staging.yPercent}%`;
  if (usesVnPoseB(character, direction)) {
    return `<div class="portrait portrait-${side} portrait-static-wrap" data-character="${character}" style="${style}"><img class="portrait-static" src="${poseAsset(character)}" alt="${rig.displayName}"></div>`;
  }
  return `<div class="portrait portrait-${side} character-rig" data-character="${character}" data-expression="${expression}" style="${style}">
      <img class="portrait-frame" src="${expressionAsset(character, expression)}" alt="${rig.displayName}">
    </div>`;
};

const placeholderStageMarkup = (key: keyof typeof placeholderCharacters, side: VnStageSide): string => {
  const character = placeholderCharacters[key];
  return `<div class="portrait-placeholder portrait-placeholder-${side}" style="--placeholder-accent:${character.accent}">
      <span>${character.initials}</span>
      <b>${character.displayName}</b>
      <small>PORTRAIT PLACEHOLDER</small>
    </div>`;
};

const clueToastMarkup = (clueId: ClueId, dossierUpdatedLabel: string): string => {
  const level = levels.find((candidate) => candidate.clueId === clueId)!;
  const clue = cluePresentation[clueId];
  return `<div class="clue-toast"><img src="${clue.asset}" alt=""><span><small>${escapeHtml(dossierUpdatedLabel)}</small><b>${escapeHtml(level.clueTitle)}</b></span></div>`;
};

export const usesVnPoseB = (character: CharacterKey, direction: string): boolean => {
  const value = direction.toLocaleUpperCase('ru-RU');
  if (character === 'miku') return /С БЛОКНОТОМ|УКАЗЫВАЕТ НА/.test(value);
  if (character === 'onoe') return /КРУЖЕВНЫМ ПАКЕТОМ|БЕР[ЕЁ]Т ПИНЦЕТ/.test(value);
  return /С ТЕЛЕФОНОМ|ПОКАЗЫВАЕТ ТЕЛЕФОН|С ДОСКОЙ НА ТЕЛЕФОНЕ/.test(value);
};

export function resolveVnStagePresentation(input: Readonly<{
  story: readonly StoryLine[];
  sceneIndex: number;
  lineIndex: number;
  entry: StoryLine;
  localizedEmotion: string;
  directionLabel: string;
  dossierUpdatedLabel: string;
  pendingClue: ClueId | null;
}>): VnStagePresentation {
  const direction = isDirection(input.entry);
  const authoredShot = direction ? null : resolveAuthoredVnShot(input.entry.id);
  const background = authoredShot?.shot.background
    ?? getBackgroundForLine(input.sceneIndex, input.lineIndex, input.story);
  const character = direction ? null : characterForSpeaker(input.entry.speaker);
  const placeholder = direction ? null : placeholderForSpeaker(input.entry.speaker);
  const guestWitness = direction || authoredShot || character || placeholder
    ? null
    : guestWitnessForSpeaker(input.entry.speaker);
  const expression = expressionForDirection(input.entry.emotion);
  const staging = direction || authoredShot ? null : resolveVnStaging(input.story, input.lineIndex);
  const stageMarkup = [
    authoredShot ? vnAuthoredShotMarkup(authoredShot, character) : '',
    !authoredShot && character
      ? characterStageMarkup(character, expression, input.entry.emotion, staging?.side ?? 'center')
      : '',
    !authoredShot && placeholder ? placeholderStageMarkup(placeholder, staging?.side ?? 'center') : '',
    guestWitness
      ? guestWitnessStageMarkup(guestWitness, input.entry.emotion, input.localizedEmotion)
      : '',
    direction
      ? `<div class="direction-card"><span>${escapeHtml(input.directionLabel)}</span><b>${escapeHtml(input.localizedEmotion)}</b></div>`
      : '',
    input.pendingClue ? clueToastMarkup(input.pendingClue, input.dossierUpdatedLabel) : '',
  ].join('');

  let preloadAssets: readonly string[] = [];
  if (authoredShot) {
    preloadAssets = authoredVnShotAssets(authoredShot);
  } else if (character && !usesVnPoseB(character, input.entry.emotion)) {
    preloadAssets = [expressionAsset(character, expression)];
  } else if (guestWitness) {
    const guestAsset = guestWitnessAssetForDirection(guestWitness, input.entry.emotion);
    preloadAssets = guestAsset ? [guestAsset] : [];
  }

  return {
    direction,
    backgroundAsset: backgroundAssets[background],
    stageSide: authoredShot
      ? `authored-${authoredShot.staging.preset.id}`
      : guestWitness
        ? 'guest-testimony-card'
        : staging?.side ?? 'empty',
    stageMarkup,
    preloadAssets,
  };
}

export function vnPreloadAssetsForLine(
  story: readonly StoryLine[],
  sceneIndex: number,
  lineIndex: number,
): readonly string[] {
  const entry = story[lineIndex];
  if (!entry) return [];
  const authoredShot = isDirection(entry) ? null : resolveAuthoredVnShot(entry.id);
  const background = authoredShot?.shot.background ?? getBackgroundForLine(sceneIndex, lineIndex, story);
  const assets: string[] = [backgroundAssets[background]];
  if (authoredShot) {
    assets.push(...authoredVnShotAssets(authoredShot));
    return assets;
  }
  if (isDirection(entry)) return assets;

  const character = characterForSpeaker(entry.speaker);
  if (character) {
    assets.push(
      usesVnPoseB(character, entry.emotion)
        ? poseAsset(character)
        : expressionAsset(character, expressionForDirection(entry.emotion)),
    );
    return assets;
  }

  const guestWitness = guestWitnessForSpeaker(entry.speaker);
  const guestAsset = guestWitness ? guestWitnessAssetForDirection(guestWitness, entry.emotion) : null;
  if (guestAsset) assets.push(guestAsset);
  return assets;
}

export function vnHistoryOverlayMarkup(input: Readonly<{
  ariaLabel: string;
  title: string;
  closeLabel: string;
  emptyLabel: string;
  entries: readonly VnHistoryPresentationEntry[];
}>): string {
  return `<section class="vn-overlay" role="dialog" aria-modal="true" aria-label="${escapeHtml(input.ariaLabel)}">
      <div class="vn-overlay-card history-card">
        <header><div><small>CASE LOG</small><h2>${escapeHtml(input.title)}</h2></div><button id="close-overlay" class="overlay-close" aria-label="${escapeHtml(input.closeLabel)}">${icon('close')}</button></header>
        <div class="history-list">${input.entries.length ? input.entries.map((entry) => `
          <article class="${entry.direction ? 'is-direction' : ''}">
            <div><b>${escapeHtml(entry.speaker)}</b><small>${escapeHtml(entry.id)}</small></div>
            <p>${escapeHtml(entry.text)}</p>
          </article>`).join('') : `<p class="empty-history">${escapeHtml(input.emptyLabel)}</p>`}</div>
      </div>
    </section>`;
}

export function vnConfigOverlayMarkup(input: Readonly<{
  autoSpeed: AutoSpeed;
  textScale: TextScale;
  audioSettingsHtml: string;
  labels: Readonly<{
    ariaLabel: string;
    title: string;
    close: string;
    autoSpeed: string;
    textSize: string;
    audio: string;
    navigation: string;
    mainMenu: string;
    saved: string;
    note: string;
    slow: string;
    normal: string;
    fast: string;
    large: string;
  }>;
}>): string {
  const labels = input.labels;
  return `<section class="vn-overlay" role="dialog" aria-modal="true" aria-label="${escapeHtml(labels.ariaLabel)}">
      <div class="vn-overlay-card config-card">
        <header><div><small>CONFIG</small><h2>${escapeHtml(labels.title)}</h2></div><button id="close-overlay" class="overlay-close" aria-label="${escapeHtml(labels.close)}">${icon('close')}</button></header>
        <fieldset><legend>${escapeHtml(labels.autoSpeed)}</legend><div class="segmented">
          ${(['slow', 'normal', 'fast'] as AutoSpeed[]).map((speed) => `<button data-auto-speed="${speed}" class="${input.autoSpeed === speed ? 'is-selected' : ''}">${speed === 'slow' ? labels.slow : speed === 'normal' ? labels.normal : labels.fast}</button>`).join('')}
        </div></fieldset>
        <fieldset><legend>${escapeHtml(labels.textSize)}</legend><div class="segmented">
          ${(['normal', 'large'] as TextScale[]).map((scale) => `<button data-text-scale="${scale}" class="${input.textScale === scale ? 'is-selected' : ''}">${scale === 'normal' ? labels.normal : labels.large}</button>`).join('')}
        </div></fieldset>
        <fieldset><legend>${escapeHtml(labels.audio)}</legend>${input.audioSettingsHtml}</fieldset>
        <div class="vn-config-navigation"><small>${escapeHtml(labels.navigation)}</small><button id="vn-main-menu">${icon('menu')}<span><b>${escapeHtml(labels.mainMenu)}</b><em>${escapeHtml(labels.saved)}</em></span></button></div>
        <p>${escapeHtml(labels.note)}</p>
      </div>
    </section>`;
}

export function vnChoiceScreenMarkup(input: Readonly<{
  backgroundAsset: string;
  headerLabel: string;
  prompt: string;
  navigationLabel: string;
  settingsLabel: string;
  options: readonly VnChoicePresentationOption[];
}>): string {
  return `<section class="choice-screen">
      <div class="choice-background-stack" aria-hidden="true">
        <img class="choice-background choice-background-fill" src="${escapeHtml(input.backgroundAsset)}" alt="">
        <img class="choice-background choice-background-fit" src="${escapeHtml(input.backgroundAsset)}" alt="">
      </div>
      <header class="app-header choice-topbar">
        <div class="app-header-title"><small>CASE 001 · CHOICE_00</small><b>${escapeHtml(input.headerLabel)}</b></div>
        <nav class="app-header-actions" aria-label="${escapeHtml(input.navigationLabel)}">
          ${headerActionMarkup('header-settings', 'settings', input.settingsLabel)}
        </nav>
      </header>
      <div class="choice-panel">
        <p class="eyebrow">CHOICE_00</p><h2>${escapeHtml(input.prompt)}</h2>
        ${input.options.map((option) => `<button data-choice="${option.id}"><i>${option.id}</i><span><b>${escapeHtml(option.title)}</b><small>${escapeHtml(option.effect)}</small></span></button>`).join('')}
      </div>
    </section>`;
}

export function vnStoryChoiceScreenMarkup(input: Readonly<{
  gate: StoryChoiceGate;
  backgroundAsset: string;
  headerLabel: string;
  prompt: string;
  navigationLabel: string;
  settingsLabel: string;
  options: readonly VnStoryChoicePresentationOption[];
}>): string {
  const gateLabel = input.gate.id.toUpperCase();
  return `<section class="choice-screen">
      <div class="choice-background-stack" aria-hidden="true"><img class="choice-background choice-background-fill" src="${escapeHtml(input.backgroundAsset)}" alt=""><img class="choice-background choice-background-fit" src="${escapeHtml(input.backgroundAsset)}" alt=""></div>
      <header class="app-header choice-topbar"><div class="app-header-title"><small>CASE 001 · ${escapeHtml(gateLabel)}</small><b>${escapeHtml(input.headerLabel)}</b></div>
        <nav class="app-header-actions" aria-label="${escapeHtml(input.navigationLabel)}">${headerActionMarkup('header-settings', 'settings', input.settingsLabel)}</nav></header>
      <div class="choice-panel"><p class="eyebrow">${escapeHtml(gateLabel)}</p><h2>${escapeHtml(input.prompt)}</h2>
        ${input.options.map((option) => `<button data-story-choice="${option.id}"><i>${option.id}</i><span><b>${escapeHtml(option.title)}</b><small>${escapeHtml(option.effect)}</small></span></button>`).join('')}
      </div></section>`;
}

export const vnChoiceBackgroundAsset = backgroundAssets.clubroom;

export const vnStoryChoiceBackgroundAsset = (backgroundKey: keyof typeof backgroundAssets): string =>
  backgroundAssets[backgroundKey];
