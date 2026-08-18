import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

const spec = read('e2e/tests/match3.pw.ts');
const controller = read('src/features/match3/Match3Controller.ts');
const interaction = read('src/ui/boardInteraction.ts');
const playwrightConfig = read('e2e/playwright.config.ts');
const feature = read('docs/features/ANM023G8C1_MATCH3_BROWSER_INTERACTION_PARITY_RU.md');

describe('ANM-023G8C1 Match-3 browser interaction parity contract', () => {
  it('drives the production pointer path through rendered browser geometry', () => {
    expect(spec).toContain('boundingBox()');
    expect(spec).toContain('page.mouse.down()');
    expect(spec).toContain('page.mouse.move(');
    expect(spec).toContain('page.mouse.up()');
    expect(spec).not.toContain('dispatchEvent(');
    expect(spec).not.toContain('window.__');

    expect(controller).toContain("board.addEventListener('pointerdown'");
    expect(controller).toContain("const cell = target.closest<HTMLElement>('[data-cell]');");
    expect(controller).toContain("board.addEventListener('pointermove'");
    expect(controller).toContain("board.addEventListener('pointerup'");
    expect(controller).toContain("this.attemptMatchSwap(pointer.startIndex, targetIndex, false, 'drag')");
  });

  it('protects preview thresholds, short-drag no-op and committed deterministic parity', () => {
    expect(interaction).toContain('DRAG_TARGET_REACTION_RATIO = 0.035');
    expect(interaction).toContain('DRAG_COMMIT_RATIO = 0.24');
    expect(spec).toContain('shortDragRatio = 0.1');
    expect(spec).toContain('committedDragRatio = 0.42');
    expect(spec).toContain('drag-source');
    expect(spec).toContain('drag-target');
    expect(spec).toContain('drag-target--commit');
    expect(spec).toContain("style.getPropertyValue('--drag-y')");
    expect(spec).toContain('expect(await movesLeft(page)).toBe(deterministicLabMoves)');
    expect(spec).toContain('expect(await firstObjectiveProgress(page)).toEqual([0, 10])');
    expect(spec).toContain('expect(await firstObjectiveProgress(page)).toEqual([3, 10])');
    expect(spec).toContain("locator('.special.flash-row')");
  });

  it('keeps the interaction case in both Chromium and the mobile-critical WebKit lane', () => {
    expect(playwrightConfig).toContain('/match3\\.pw\\.ts/');
    expect(feature).toContain('8 specs / 22 Chromium cases / 16 Mobile WebKit critical cases');
    expect(feature).toContain('Production runtime не меняется');
    expect(feature).toContain('G8C2');
  });
});
