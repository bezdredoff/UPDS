import type { TextScale } from './vnPlayback';
import { escapeHtml, headerActionMarkup, iconMarkup as icon } from './viewMarkup';

export type VnFrameLabels = Readonly<{
  openDossier: string;
  navigation: string;
  history: string;
  settings: string;
  controls: string;
}>;

export type VnFrameMarkupInput = Readonly<{
  idPrefix?: string;
  frameContext: 'runtime' | 'scene-studio';
  screenClass?: string;
  textScale: TextScale;
  backgroundAsset: string;
  location: string;
  caseLabel: string;
  sceneTitle: string;
  clueCount: number;
  stageSide: string;
  stageMarkup: string;
  overlayMarkup?: string;
  direction: boolean;
  speaker: string;
  emotion: string;
  dialogueText: string;
  dialoguePageIndex: number;
  dialoguePageCount: number;
  lineId: string;
  skipAvailable: boolean;
  autoMode: boolean;
  labels: VnFrameLabels;
  interactive?: boolean;
}>;

/**
 * Shared four-row VN frame used by both the playable controller and Scene Studio.
 *
 * Callers own stage content and behavior. This function owns the production DOM
 * structure/classes so the QA surface cannot drift into a separate mock UI.
 */
export function vnFrameMarkup(input: VnFrameMarkupInput): string {
  const prefix = input.idPrefix ?? '';
  const id = (value: string): string => `${prefix}${value}`;
  const inertControl = input.interactive === false ? ' tabindex="-1"' : '';
  const pageCount = Math.max(1, input.dialoguePageCount);
  const pageIndex = Math.max(0, Math.min(input.dialoguePageIndex, pageCount - 1));
  const screenClasses = ['vn-screen', `text-${input.textScale}`, input.screenClass ?? ''].filter(Boolean).join(' ');

  return `<section class="${escapeHtml(screenClasses)}" data-vn-frame="shared" data-frame-context="${input.frameContext}"${input.interactive === false ? ' inert' : ''}>
    <div class="vn-background-stack" aria-hidden="true">
      <img class="vn-background vn-background-fill" src="${escapeHtml(input.backgroundAsset)}" alt="">
      <img class="vn-background vn-background-fit" src="${escapeHtml(input.backgroundAsset)}" alt="">
    </div>
    <span class="visually-hidden">${escapeHtml(input.location)}</span>
    <div class="vn-vignette"></div>
    ${input.overlayMarkup ?? ''}
    <header class="app-header vn-topbar">
      <button id="${escapeHtml(id('dossier'))}" class="vn-case-pill" aria-label="${escapeHtml(input.labels.openDossier)}"${inertControl}>
        <span><small>${escapeHtml(input.caseLabel)}</small><b>${escapeHtml(input.sceneTitle)}</b></span>
        <i>${icon('dossier')}<em>${input.clueCount}</em></i>
      </button>
      <nav class="app-header-actions" aria-label="${escapeHtml(input.labels.navigation)}">
        ${headerActionMarkup(id('history'), 'log', input.labels.history)}
        ${headerActionMarkup(id('header-settings'), 'settings', input.labels.settings)}
      </nav>
    </header>
    <div class="stage stage-${escapeHtml(input.stageSide)}" data-stage-side="${escapeHtml(input.stageSide)}">
      ${input.stageMarkup}
    </div>
    <div class="dialogue-shell ${input.direction ? 'direction' : ''}">
      <span class="dialogue-nameplate">${escapeHtml(input.speaker)}<em>${escapeHtml(input.emotion)}</em></span>
      <button class="dialogue ${input.direction ? 'direction' : ''}" id="${escapeHtml(id('next'))}"${inertControl}>
        <span class="dialogue-text" data-dialogue-page="${pageIndex + 1}" data-dialogue-pages="${pageCount}">${escapeHtml(input.dialogueText)}</span>
        <span class="line-id">${escapeHtml(input.lineId)}${pageCount > 1 ? ` · ${pageIndex + 1}/${pageCount}` : ''}</span>
        <span class="dialogue-progress" aria-hidden="true">${Array.from({ length: pageCount }, (_, page) => `<i class="${page <= pageIndex ? 'is-active' : ''}"></i>`).join('')}<b>▼</b></span>
      </button>
    </div>
    <nav class="vn-controls" aria-label="${escapeHtml(input.labels.controls)}">
      <button id="${escapeHtml(id('skip'))}" ${input.skipAvailable ? '' : 'disabled'}${inertControl}>${icon('skip')}<span>SKIP</span></button>
      <button id="${escapeHtml(id('auto'))}" class="${input.autoMode ? 'is-active' : ''}"${inertControl}>${icon('auto')}<span>AUTO</span></button>
      <button id="${escapeHtml(id('save-vn'))}"${inertControl}>${icon('save')}<span>SAVE</span></button>
      <button id="${escapeHtml(id('load-vn'))}"${inertControl}>${icon('load')}<span>LOAD</span></button>
    </nav>
    <div id="${escapeHtml(id('vn-status'))}" class="vn-status" hidden></div>
  </section>`;
}
