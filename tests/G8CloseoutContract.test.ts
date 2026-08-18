import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(path, 'utf8');

describe('ANM-023G8 closeout contract', () => {
  it('keeps G8 closed and Campaign completion E2E explicitly deferred', () => {
    const roadmap = read('docs/ROADMAP_RU.md');
    const testing = read('docs/process/TESTING_RU.md');
    const e2e = read('e2e/README.md');
    const closeout = read('docs/features/ANM023G8F_CLOSEOUT_RU.md');

    expect(roadmap).toContain('ANM-023G — Playwright Browser Automation [P0/P1] — COMPLETE THROUGH G8');
    expect(roadmap).toContain('G8C2 Campaign completion/progression browser E2E is DEFERRED');
    expect(testing).toContain('ANM-023G1–G8 is closed');
    expect(e2e).toContain('G8 is complete');
    expect(closeout).toContain('G8C2 Campaign Completion & Progression Flow переносится в deferred backlog');

    expect(roadmap).not.toContain('G8 IN PROGRESS');
    expect(roadmap).not.toContain('CURRENT CANDIDATE / PR #162');
  });

  it('preserves the post-G8 production-signal priority order', () => {
    const closeout = read('docs/features/ANM023G8F_CLOSEOUT_RU.md');
    const roadmap = read('docs/ROADMAP_RU.md');

    for (const marker of [
      'RU/BE/EN mobile locale × viewport matrix',
      'PWA offline/recovery',
      'VN/content asset crawl',
      'quantitative Match-3 regression/reporting',
    ]) {
      expect(closeout).toContain(marker);
      expect(roadmap).toContain(marker);
    }

    expect(closeout).toContain('320×568');
    expect(closeout).toContain('430×932');
    expect(closeout).toContain('Не вводить tiny win fixture только ради статуса coverage.');
  });
});
