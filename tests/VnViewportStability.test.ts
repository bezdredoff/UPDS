import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('ANM-023G8E2 iOS VN viewport stability', () => {
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

  it('advances dialogue pages in place instead of rebuilding the VN shell', () => {
    const controller = read('src/features/vn/VnController.ts');

    expect(controller).toContain('private updateDialoguePageInPlace(entry: StoryLine, dialoguePages: string[]): boolean');
    expect(controller).toContain('const localizedText = this.lineText(entry);');
    expect(controller).toContain('if (!this.updateDialoguePageInPlace(entry, dialoguePages)) this.renderVN();');
    expect(controller).toContain('textElement.dataset.dialoguePage = String(this.dialoguePageIndex + 1)');
    expect(controller).toContain('if (this.autoMode) this.shell.schedule(() => this.nextLine(), autoDelayForLine(page, this.autoSpeed));');
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
