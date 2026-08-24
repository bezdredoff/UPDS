import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

const controller = read('src/features/match3/Match3Controller.ts');
const presentation = read('src/features/match3/Match3Presentation.ts');
const selectors = read('e2e/selectors.ts');
const browserSpec = read('e2e/tests/match3.pw.ts');

describe('ANM-023G8E3 Match-3 render stability', () => {
  it('keeps full Match-3 renders at structural boundaries and syncs transient state in place', () => {
    expect(controller).toContain('private syncMatchPresentation(): void');
    expect(controller).toContain("const screen = this.root.querySelector<HTMLElement>('.match-screen');");
    expect(controller).toContain("const board = this.root.querySelector<HTMLElement>('.board');");
    expect(controller).toContain("board.className = 'board';");
    expect(controller).toContain("moves.textContent = String(game.movesLeft);");
    expect(controller).toContain("objectiveElement.classList.toggle('done', current >= objective.target);");
    expect(controller).toContain("this.matchBark = this.bark('hintFound', 'miku');\nthis.syncMatchPresentation();");
    expect(controller).not.toContain("this.matchBark = this.bark('hintFound', 'miku');\nthis.renderMatch();");
    expect(controller).not.toContain('await this.playMoveFrames(result, first, second);\nthis.renderMatch();');
  });

  it('delegates cell input and preserves every board-cell shell across animation frames', () => {
    expect(controller).toContain("board.addEventListener('click', (event) => {");
    expect(controller).toContain("board.addEventListener('pointerdown', (event) => {");
    expect(controller).toContain("const cell = target.closest<HTMLElement>('[data-cell]');");
    expect(controller).not.toContain("this.root.querySelectorAll<HTMLElement>('[data-cell]').forEach((cell) => {");
    expect(controller).toContain('private syncBoardFrameMarkup(board: HTMLElement, markup: string): void');
    expect(controller).toContain('const frameMarkup = match3BoardCellsMarkup({');
    expect(controller).toContain('this.syncBoardFrameMarkup(board, frameMarkup);');
    expect(controller).toContain('if (live.innerHTML !== next.innerHTML) live.innerHTML = next.innerHTML;');
    expect(controller).not.toContain('board.innerHTML = match3BoardCellsMarkup({');
  });

  it('updates objectives, bark and tutorials without rebuilding the Match-3 shell', () => {
    expect(presentation).toContain('data-objective-index="${objectiveIndex}"');
    expect(presentation).toContain('export function match3BarkMarkup(');
    expect(controller).toContain('barkSlot.innerHTML = match3BarkMarkup(');
    expect(controller).toContain("const tutorialOverlay = screen.querySelector<HTMLElement>('.match-tutorial-overlay');");
    expect(controller).toContain("screen.classList.toggle('tutorial-active', Boolean(expectedTutorial));");
  });

  it('covers inactivity hints, reaction lifecycle and cascade DOM identity in both browser gates', () => {
    expect(selectors).toContain("match3Bark: '.field-bark'");
    expect(browserSpec).toContain('inactivity hint updates the stable Match-3 screen and board in place');
    expect(browserSpec).toContain('reaction bark appears and dismisses without replacing the Match-3 screen or board');
    expect(browserSpec).toContain("[data-reaction-id=\"special-created\"]");
    expect(browserSpec).toContain('__updsMatch3Cells');
    expect(browserSpec).toContain('__updsMatch3BoardRect');
    expect(browserSpec).toContain('await expectMatch3DomStable(page);');
    expect(browserSpec).toContain('a deterministic cascade uses production clear/settle/refill rules');
  });
});
