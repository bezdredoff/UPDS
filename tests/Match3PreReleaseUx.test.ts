import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { APP_VERSION, BUILD_LABEL } from '../src/appVersion';

const appSource = readFileSync(new URL('../src/ui/AnimeDetectiveApp.ts', import.meta.url), 'utf8');
const style = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };

describe('ANM-014 match-3 pre-release UX contract', () => {
  it('keeps version checks dynamic instead of pinning a feature build forever', () => {
    expect(APP_VERSION).toBe(packageJson.version);
    expect(BUILD_LABEL).toMatch(/^ANM-/);
  });

  it('ships objective-aware hints and staged move feedback', () => {
    expect(appSource).toContain('getHintMove()');
    expect(appSource).toContain('playMoveFrames');
    expect(appSource).toContain("frame.phase === 'reshuffle'");
    expect(appSource).toContain('УЛИКА СОБРАНА');
  });

  it('aligns match presentation with the approved cream/green golden sample language', () => {
    expect(style).toContain('--case-green:');
    expect(style).toContain('--case-cream:');
    expect(style).toContain('.match-case-hud');
    expect(style).toContain('.objective-board');
    expect(style).toContain('.stage-board');
    expect(style).toContain('.match-tooltray');
    expect(style).toContain('.detective-strip');
  });

  it('has explicit feedback for hint, rejected swaps, cascades and reshuffle', () => {
    expect(style).toContain('.board-cell.hinted');
    expect(style).toContain('.swap-rejected');
    expect(style).toContain('.phase-clear');
    expect(style).toContain('.phase-settle');
    expect(style).toContain('.phase-reshuffle');
    expect(style).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
