import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('ANM-023G8E2/E3 iOS VN viewport stability', () => {
  it('pins browser text inflation without disabling user pinch zoom', () => {
    const css = read('src/vnViewportStability.css');
    const main = read('src/main.ts');
    const html = read('index.html');

    expect(main).toContain("import './vnViewportStability.css';");
    expect(css).toContain('-webkit-text-size-adjust: 100%');
    expect(css).toContain('text-size-adjust: 100%');
    expect(html).toContain('width=device-width, initial-scale=1, viewport-fit=cover');
    expect(html).not.toContain('user-scalable=no');
    expect(html).not.toContain('maximum-scale=1');
  });

  it('keeps browser runtime VN on stable small-viewport geometry while Safari chrome changes height', () => {
    const css = read('src/vnViewportStability.css');
    const runtimeFrame = ".vn-screen[data-frame-context='runtime']";

    expect(css).toContain(`:root[data-upds-display-mode='browser'] .viewport-shell:has(${runtimeFrame})`);
    expect(css).toContain('height: 100svh');
    expect(css).toContain(`:root[data-upds-display-mode='browser'] .phone.game-viewport:has(${runtimeFrame})`);
    expect(css).toContain('height: min(100svh, 932px)');
    expect(css).toContain(`:root[data-upds-display-mode='browser'] ${runtimeFrame} {`);
    expect(css).toContain('--vn-dialogue-row: clamp(154px, 22svh, 198px)');
    expect(css).toContain('--vn-controls-min-height: clamp(60px, 9svh, 82px)');
    expect(css).toContain('bottom: calc(max(72px, 10svh) + var(--safe-area-bottom))');
    expect(css).not.toContain(":root[data-upds-display-mode='browser'] .vn-screen {");
    expect(css).not.toContain('data-frame-context=\'scene-studio\']');
  });

  it('prevents the legacy height breakpoint from rescaling normal-width portrait runtime VN', () => {
    const css = read('src/vnViewportStability.css');

    expect(css).toContain('@media (orientation: portrait) and (min-width: 341px)');
    expect(css).toContain(".vn-screen[data-frame-context='runtime'] .portrait");
    expect(css).toContain('height: var(--portrait-height, 178%)');
    expect(css).toContain('bottom: var(--portrait-bottom, -78%)');
    expect(css).toContain('font-size: 17px');
    expect(css).toContain('line-height: 1.42');
    expect(css).toContain('min-height: var(--vn-controls-min-height, clamp(60px, 9svh, 82px))');
  });

  it('advances dialogue pages in place instead of rebuilding the VN shell', () => {
    const controller = read('src/features/vn/VnController.ts');

    expect(controller).toContain('private updateDialoguePageInPlace(entry: StoryLine, dialoguePages: string[]): boolean');
    expect(controller).toContain('const localizedText = this.lineText(entry);');
    expect(controller).toContain('if (!this.updateDialoguePageInPlace(entry, dialoguePages)) this.renderVN();');
    expect(controller).toContain('textElement.dataset.dialoguePage = String(this.dialoguePageIndex + 1)');
    expect(controller).toContain('if (this.autoMode) this.shell.schedule(() => this.nextLine(), autoDelayForLine(page, this.autoSpeed));');
  });

  it('ignores height-only resize and remeasures width/orientation changes without full renderVN', () => {
    const controller = read('src/features/vn/VnController.ts');
    const bindStart = controller.indexOf('private bindDialogueReflow(): void');
    const bindEnd = controller.indexOf('private preloadNextVnAssets(): void', bindStart);
    const bindSource = controller.slice(bindStart, bindEnd);

    expect(bindSource).toContain('this.dialogueReflowWidth = Math.round(window.innerWidth)');
    expect(bindSource).toContain('if (Math.abs(nextWidth - previousWidth) < 2) return');
    expect(bindSource).toContain("window.addEventListener('resize', requestWidthReflow, { passive: true })");
    expect(bindSource).toContain("window.addEventListener('orientationchange', requestOrientationReflow, { passive: true })");
    expect(bindSource).toContain('this.remeasureDialogueInPlace()');
    expect(bindSource).not.toContain('this.renderVN()');
    expect(bindSource).not.toContain('document.fonts.ready');
  });

  it('covers the reported Belarusian lines in the Mobile WebKit critical suite', () => {
    const spec = read('e2e/tests/vn-navigation.pw.ts');
    const config = read('e2e/playwright.config.ts');

    expect(config).toContain('/vn-navigation\\.pw\\.ts/');
    expect(spec).toContain("test.skip(testInfo.project.name !== 'webkit-mobile', 'iOS/WebKit-specific paging corpus')");
    expect(spec).toContain("{ scene: 0, lines: ['VN0001'] }");
    expect(spec).toContain("{ scene: 5, lines: ['VN0156', 'VN0158', 'VN0160'] }");
    expect(spec).toContain("{ scene: 13, lines: ['VN0340'] }");
    expect(spec).toContain("{ scene: 26, lines: ['VN0595'] }");
    expect(spec).toContain("{ scene: 33, lines: ['VN0732'] }");
    expect(spec).toContain("{ scene: 44, lines: ['VN0964'] }");
    expect(spec).toContain('__updsVnFrameNode');
    expect(spec).toContain('visualScale');
    expect(spec).toContain("rect('.vn-topbar')");
    expect(spec).toContain("rect('.vn-controls')");
  });

  it('keeps RU/BE/EN multi-page paging in the localization Mobile WebKit flow', () => {
    const spec = read('e2e/tests/persistence-localization-flow.pw.ts');
    const config = read('e2e/playwright.config.ts');

    expect(config).toContain('/persistence-localization-flow\\.pw\\.ts/');
    expect(spec).toContain("for (const locale of ['ru', 'be', 'en'] as const)");
    expect(spec).toContain("await advanceToLine(page, 'VN0555', 40);");
    expect(spec).toContain("toHaveAttribute('data-dialogue-page', '2')");
    expect(spec).toContain('__updsLocalizedVnFrame');
    expect(spec).toContain('window.visualViewport?.scale ?? 1');
  });
});
