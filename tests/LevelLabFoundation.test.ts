import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AppNavigation } from '../src/app/AppNavigation';
import { AppSession } from '../src/app/AppSession';
import { AppShell } from '../src/app/AppShell';
import { levels, validateLevelDefinitions } from '../src/data/levels';
import { LevelLabController, levelLabBoardSignature, normalizeLevelLabSeed } from '../src/features/levelLab/LevelLabController';
import { Match3Controller } from '../src/features/match3/Match3Controller';
import { createRuntimeServices } from '../src/platform/RuntimeServices';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

class FakeRoot {
  innerHTML = '';
  querySelector(): null { return null; }
  querySelectorAll(): [] { return []; }
}

const originalWindow = globalThis.window;

describe('ANM-026A Level Lab foundation', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        localStorage: new MemoryStorage(),
        setTimeout: globalThis.setTimeout.bind(globalThis),
        clearTimeout: globalThis.clearTimeout.bind(globalThis),
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
  });

  it('normalizes uint32 seeds without rejecting zero', () => {
    expect(normalizeLevelLabSeed(0, 9001)).toBe(0);
    expect(normalizeLevelLabSeed(-12, 9001)).toBe(0);
    expect(normalizeLevelLabSeed(0xffffffff + 50, 9001)).toBe(0xffffffff);
    expect(normalizeLevelLabSeed('12345', 9001)).toBe(12345);
    expect(normalizeLevelLabSeed('not-a-seed', 9001)).toBe(9001);
  });

  it('previews the exact deterministic board that the selected seed will play', () => {
    const level = levels[0];
    const first = levelLabBoardSignature(level, 9001);
    expect(levelLabBoardSignature(level, 9001)).toBe(first);
    expect(levelLabBoardSignature(level, 9002)).not.toBe(first);
    expect(first.split('|')).toHaveLength(64);
  });

  it('renders a validated 8x8 lab preview for the production level config', () => {
    expect(validateLevelDefinitions(levels)).toEqual([]);
    const root = new FakeRoot();
    const element = root as unknown as HTMLElement;
    const services = createRuntimeServices();
    const lab = new LevelLabController(
      element,
      services,
      new AppShell(element, () => undefined),
      {} as AppNavigation,
      () => undefined,
    );
    lab.render();
    expect(root.innerHTML).toContain('Level Lab');
    expect(root.innerHTML).toContain('CONFIG VALID');
    expect(root.innerHTML).toContain('M3_00');
    expect(root.innerHTML).toContain('seed 9001');
    expect((root.innerHTML.match(/data-lab-cell=/g) ?? [])).toHaveLength(64);
    expect(root.innerHTML).toContain('tile_panties_sport_white.png');
    expect(root.innerHTML).toContain('goal_receipt.png');
  });

  it('starts a deterministic lab run without mutating story save or tutorial progress', () => {
    const root = new FakeRoot();
    const element = root as unknown as HTMLElement;
    const services = createRuntimeServices();
    const session = new AppSession(services);
    const match3 = new Match3Controller(
      element,
      services,
      session,
      new AppShell(element, () => undefined),
      {} as AppNavigation,
      () => undefined,
    );
    session.save = {
      scene: 3,
      line: 7,
      choice: 'B',
      clues: ['CUE_001'],
      completed: [0],
      attempts: { M3_00_LOCKER_TUTORIAL: 4 },
      readLines: ['VN0001'],
      tutorialsCompleted: ['basic-swap'],
    };
    const before = JSON.parse(JSON.stringify(session.save));
    match3.startLabMatch(0, 0, () => undefined);
    expect(session.save).toEqual(before);
    expect(root.innerHTML).toContain('LEVEL LAB RUN');
    expect(root.innerHTML).toContain('SEED 0');
    expect(root.innerHTML).toContain('match-screen');
    expect(root.innerHTML).not.toContain('match-tutorial-overlay');
    expect(root.innerHTML).not.toContain('aria-label="Досье"');
  });
});
