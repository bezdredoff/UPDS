import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';
import {
  match3BoardCellsMarkup,
  match3ContextAttrs,
  match3IntroMarkup,
  match3ObjectiveMarkup,
  match3ScreenMarkup,
} from '../src/features/match3/Match3Presentation';
import { MATCH_MOTION_MS, matchMotionDuration } from '../src/ui/matchMotion';

const style = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const matchSource = readFileSync(new URL('../src/features/match3/Match3Controller.ts', import.meta.url), 'utf8');
const presentationSource = readFileSync(new URL('../src/features/match3/Match3Presentation.ts', import.meta.url), 'utf8');

const t = (key: string, params?: Readonly<Record<string, string | number>>): string => {
  if (!params) return key;
  return `${key}:${Object.entries(params).map(([name, value]) => `${name}=${value}`).join(',')}`;
};

describe('current Match-3 presentation contract', () => {
  it('keeps readable motion timings with a reduced-motion fast path', () => {
    expect(MATCH_MOTION_MS.swap).toBe(150);
    expect(MATCH_MOTION_MS.clear).toBe(280);
    expect(MATCH_MOTION_MS.settle).toBe(320);
    expect(MATCH_MOTION_MS.reshuffle).toBe(460);
    expect(matchMotionDuration('clear', true)).toBe(0);
    expect(matchMotionDuration('invalidHold', true)).toBeGreaterThan(0);
  });

  it('keeps objective-aware hints and staged move feedback', () => {
    expect(matchSource).toContain('getHintMove()');
    expect(matchSource).toContain('playMoveFrames');
    expect(matchSource).toContain("frame.phase === 'reshuffle'");
    expect(presentationSource).toContain('class="tile-stack"');
    expect(style).toContain('.board-cell.hinted');
    expect(style).toContain('.swap-rejected');
    expect(style).toContain('.phase-clear');
    expect(style).toContain('.phase-settle');
    expect(style).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('keeps the approved cream/green board presentation vocabulary', () => {
    expect(style).toContain('--case-green:');
    expect(style).toContain('--case-cream:');
    expect(style).toContain('.match-case-hud');
    expect(style).toContain('.objective-board');
    expect(style).toContain('.stage-board');
    expect(style).toContain('.match-tooltray');
    expect(style).toContain('.detective-strip');
  });

  it('renders context selectors from the pure presentation boundary', () => {
    const level = levels[0];
    const attrs = match3ContextAttrs(level);
    expect(attrs).toContain(`data-m3-page="${level.context.pageBackground}"`);
    expect(attrs).toContain(`data-m3-board-surface="${level.context.boardSurface}"`);
    expect(attrs).toContain(`data-m3-board-frame="${level.context.boardFrame}"`);
    expect(attrs).toContain(`data-m3-profile="${level.context.narrativeProfile}"`);
    expect(attrs).toContain(`data-m3-tile-profile="${level.context.tilePresentationProfile}"`);
  });

  it('renders board cells and objectives from concrete presentation data', () => {
    const level = levels[0];
    const game = new Match3Game(level, level.seed);
    const board = match3BoardCellsMarkup({
      level,
      board: game.board,
      selectedCell: 0,
      hintedCells: new Set([1]),
      t,
    });
    expect(board).toContain('class="tile-stack"');
    expect(board).toContain('data-tile-variant="tile:');
    expect(board).toContain('role="gridcell"');

    const objective = match3ObjectiveMarkup(level, level.objectives[0], '<objective>', 999, true);
    expect(objective).toContain('class="objective done"');
    expect(objective).toContain('&lt;objective&gt;');
    expect(objective).toContain(`/${level.objectives[0].target}`);
  });

  it('composes intro and gameplay markup from an explicit view model', () => {
    const level = levels[0];
    const game = new Match3Game(level, level.seed);
    const objectiveLabels = level.objectives.map((_, index) => `objective-${index}`);

    const intro = match3IntroMarkup({
      level,
      levelIndex: 0,
      totalLevels: levels.length,
      clueCount: 2,
      t,
      levelTitle: '<title>',
      storyAction: '<story>',
      objectiveLabels,
    });
    expect(intro).toContain('class="level-intro"');
    expect(intro).toContain('&lt;title&gt;');
    expect(intro).toContain('&lt;story&gt;');
    expect(intro).toContain('id="start"');

    const screen = match3ScreenMarkup({
      level,
      board: game.board,
      selectedCell: null,
      hintedCells: new Set<number>(),
      movesLeft: game.movesLeft,
      activeLevelIndex: 0,
      totalLevels: levels.length,
      runMode: 'story',
      labSeed: null,
      clueCount: 2,
      bark: { speaker: t('character.miku'), text: '<bark>' },
      barkEntering: false,
      tutorialConcept: level.tutorialConcepts[0] ?? null,
      tutorialDismissed: false,
      t,
      levelTitle: '<title>',
      objectiveLabels,
      objectiveValues: level.objectives.map((_, index) => game.objectiveValue(index)),
    });
    expect(screen).toContain('class="match-screen');
    expect(screen).toContain('id="hint"');
    expect(screen).toContain('id="dossier"');
    expect(screen).toContain('&lt;bark&gt;');
    expect(screen).toContain('field-bark-slot');
  });

  it('keeps the renderer independent from runtime services and DOM mutation', () => {
    for (const forbidden of ['RuntimeServices', 'AppSession', 'AppNavigation', 'document.', 'window.', 'addEventListener']) {
      expect(presentationSource).not.toContain(forbidden);
    }
  });
});
