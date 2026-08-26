import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MATCH_AUTO_HINT_DELAY_MS } from '../src/features/match3/Match3Controller';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('ANM-025G2 auto-hint pacing', () => {
  it('keeps one lean 30-second production delay without changing the manual or telemetry contracts', () => {
    const controller = read('src/features/match3/Match3Controller.ts');

    expect(MATCH_AUTO_HINT_DELAY_MS).toBe(30_000);
    expect(controller).toContain("this.showObjectiveHint('inactivity')");
    expect(controller).toContain("this.showObjectiveHint('manual')");
    expect(controller).toContain('game.won || game.lost || this.tutorialPromptVisible');
    expect(controller).toContain('available: Boolean(hint), source');
  });

  it('locks the exact virtual-clock boundary in production-parity browser coverage', () => {
    const browserSpec = read('e2e/tests/match3.pw.ts');

    expect(browserSpec).toContain('const autoHintDelayMs = 30_000;');
    expect(browserSpec).toContain('await page.clock.install();');
    expect(browserSpec).toContain('await page.clock.fastForward(autoHintDelayMs - 1);');
    expect(browserSpec).toContain('await page.clock.fastForward(1);');
    expect(browserSpec).toContain('await expectMatch3DomStable(page);');
  });

  it('documents the playtest evidence, bounded scope and iPhone preview gate', () => {
    const feature = read('docs/features/ANM025G2_AUTO_HINT_PACING_RU.md');
    const roadmap = read('docs/ROADMAP_RU.md');
    const mechanics = read('docs/design/MATCH3_MECHANICS_TARGET_RU.md');

    expect(feature).toContain('94 автоматических и только один ручной');
    expect(feature).toContain('не создаёт новый tuning surface');
    expect(feature).toContain('Качество hint ranking');
    expect(feature).toContain('manual preview gate на iPhone');
    expect(roadmap).toContain('ANM-025G2 Auto-Hint Pacing');
    expect(mechanics).toContain('automatic objective-aware hint after thirty seconds');
  });
});
