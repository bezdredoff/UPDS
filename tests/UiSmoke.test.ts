import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { APP_VERSION, BUILD_LABEL } from '../src/appVersion';
import { getScene, type ChoiceId } from '../src/data/narrative';
import { AnimeDetectiveApp } from '../src/ui/AnimeDetectiveApp';

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

type AppHarness = {
  openScene(scene: number, line?: number): void;
  startMatch(level: number): void;
  renderSupport(status?: string): void;
};

const originalWindow = globalThis.window;

describe('AnimeDetectiveApp render smoke', () => {
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

  const create = (): { root: FakeRoot; app: AnimeDetectiveApp & AppHarness } => {
    const root = new FakeRoot();
    const app = new AnimeDetectiveApp(root as unknown as HTMLElement) as AnimeDetectiveApp & AppHarness;
    return { root, app };
  };

  it('mounts the production menu without a browser DOM implementation', () => {
    const { root, app } = create();
    app.mount();
    expect(root.innerHTML).toContain(BUILD_LABEL);
    expect(root.innerHTML).toContain('Новая игра');
    expect(root.innerHTML).toContain('characters/miku/medallions');
  });

  it('renders a layered finished rig and every approved portrait placeholder', () => {
    const { root, app } = create();
    const mikuLine = getScene(0).findIndex((line) => line.speaker.startsWith('МИКУ'));
    app.openScene(0, mikuLine);
    expect(root.innerHTML).toContain('character-rig');
    expect(root.innerHTML).toContain('base-neutral.png');
    expect(root.innerHTML).toContain('vn-controls');
    expect(root.innerHTML).toContain('>SKIP<');
    expect(root.innerHTML).toContain('>AUTO<');
    expect(root.innerHTML).toContain('>LOG<');

    const placeholderCases = [
      { scene: 1, speaker: 'ЭМИ', label: 'Эми', choice: 'A' as ChoiceId },
      { scene: 1, speaker: 'МАЮ', label: 'Маю', choice: 'C' as ChoiceId },
      { scene: 3, speaker: 'КЭНТАРО', label: 'Кэнтаро', choice: 'A' as ChoiceId },
      { scene: 5, speaker: 'НОРИХИРО', label: 'Норихиро', choice: 'A' as ChoiceId },
    ];
    for (const item of placeholderCases) {
      (app as unknown as { save: { choice: ChoiceId } }).save.choice = item.choice;
      const line = getScene(item.scene, item.choice).findIndex((entry) => entry.speaker === item.speaker);
      expect(line, item.speaker).toBeGreaterThanOrEqual(0);
      app.openScene(item.scene, line);
      expect(root.innerHTML).toContain('PORTRAIT PLACEHOLDER');
      expect(root.innerHTML).toContain(item.label);
    }
  });

  it('renders ANM-011 save and diagnostics tools', () => {
    const { root, app } = create();
    app.mount();
    app.renderSupport();
    expect(root.innerHTML).toContain('Сохранения и диагностика');
    expect(root.innerHTML).toContain('Экспорт сохранения');
    expect(root.innerHTML).toContain('Импорт сохранения');
    expect(root.innerHTML).toContain('Экспорт диагностики');
    expect(root.innerHTML).toContain(APP_VERSION);
  });

  it('renders a complete 8x8 board with runtime images', () => {
    const { root, app } = create();
    app.startMatch(0);
    expect(root.innerHTML).toContain('match-screen');
    expect((root.innerHTML.match(/data-cell=/g) ?? [])).toHaveLength(64);
    expect(root.innerHTML).toContain('tile_');
    expect(root.innerHTML).toContain('obstacle_locked_cell.png');
    expect(root.innerHTML).toContain('goal_receipt.png');
    expect(root.innerHTML).toContain('match-case-hud');
    expect(root.innerHTML).toContain('detective-strip');
    expect(root.innerHTML).toContain('ПОДСКАЗКА');
    expect(root.innerHTML).toContain('подсказка учитывает текущие цели');
  });
});
