import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

const selectors = read('e2e/selectors.ts');
const helper = read('e2e/helpers/vn.ts');
const spec = read('e2e/tests/vn-navigation.pw.ts');
const vnController = read('src/features/vn/VnController.ts');
const vnFrame = read('src/ui/vnFrameMarkup.ts');
const authoredShots = read('src/ui/vnAuthoredShots.ts');
const authoredShotContract = read('tests/AuthoredVnShots.test.ts');

describe('ANM-023G4 VN browser E2E contract', () => {
  it('uses QA Scene Navigation and production DOM instead of a browser-only scene jump API', () => {
    expect(helper).toContain('resetBrowserState(page)');
    expect(helper).toContain('sceneNavigationButton');
    expect(helper).toContain('data-scene="${sceneIndex}"');
    expect(helper).toContain('vnRuntimeFrame');
    expect(helper).not.toContain('window.__');
    expect(helper).not.toContain('AnimeDetectiveApp');
    expect(helper).not.toContain('VnController');
    expect(spec).not.toContain('localStorage.setItem');
  });

  it('locks the production VN selectors needed for paging, staging and choices', () => {
    for (const token of [
      "vnBackgroundFit: '.vn-background-fit'",
      "vnDirectionCard: '.direction-card'",
      "vnLineId: '.line-id'",
      "vnNext: '#next'",
      "vnAuthoredShot: '[data-authored-shot]'",
      "vnAuthoredActor: '.vn-authored-actor-slot'",
      "vnChoiceScreen: '.choice-screen'",
      "vnChoiceButton: '[data-choice]'",
    ]) {
      expect(selectors).toContain(token);
    }

    expect(vnFrame).toContain('data-dialogue-page="${pageIndex + 1}"');
    expect(vnFrame).toContain('data-dialogue-pages="${pageCount}"');
    expect(vnFrame).toContain('class="line-id"');
    expect(vnFrame).toContain("id=\"${escapeHtml(id('next'))}\"");
    expect(vnController).toContain("this.root.querySelector('#next')");
    expect(vnController).toContain("this.root.querySelectorAll<HTMLElement>('[data-choice]')");
  });

  it('covers measured paging, fallback presentation, authored trio staging and CHOICE_00 branching', () => {
    expect(spec).toContain("currentVnLineId(page)).toBe('VN0001')");
    expect(spec).toContain('data-dialogue-pages');
    expect(spec).toContain("endsWith('…')");
    expect(spec).toContain("advanceToLine(page, 'VN0002')");
    expect(spec).toContain('data-character="miku"');
    expect(spec).toContain("advanceToLine(page, 'VN0008')");
    expect(spec).toContain('data-authored-shot="VN0008"');
    expect(spec).toContain("toHaveAttribute('data-scene-preset', 'trio-central-speaker')");
    expect(spec).toContain("advanceToLine(page, 'VN0040')");
    expect(spec).toContain('data-choice="B"');
    expect(spec).toContain("currentVnLineId(page)).toBe('VN0041B')");
  });

  it('ties the browser authored-shot case to the already-approved production shot contract', () => {
    expect(authoredShotContract).toContain("resolveAuthoredVnShot('VN0008')");
    expect(authoredShotContract).toContain("toBe('trio-central-speaker')");
    expect(authoredShotContract).toContain('toHaveLength(3)');
    expect(authoredShots).toContain('class="vn-authored-actor-slot"');
    expect(authoredShots).toContain('data-speaking="${actor.character === speakingCharacter}"');
    expect(authoredShots).toContain('data-vertical-anchor="${actor.verticalAnchor}"');
  });
});
