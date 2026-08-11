import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { APP_VERSION, BUILD_LABEL } from '../src/appVersion';
import { LOCALE_SETTINGS_KEY } from '../src/localization/LocaleSettingsStore';
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
  renderSettings(): void;
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
    expect(root.innerHTML).toContain('Настройки');
  });

  it('renders a layered finished rig and every approved portrait placeholder', () => {
    const { root, app } = create();
    const mikuLine = getScene(0).findIndex((line) => line.speaker.startsWith('МИКУ'));
    app.openScene(0, mikuLine);
    expect(root.innerHTML).toContain('character-rig');
    expect(root.innerHTML).toMatch(/data-stage-side="(left|right|center)"/);
    expect(root.innerHTML).toMatch(/portrait-(left|right|center)/);
    expect(root.innerHTML).toContain('base-neutral.png');
    expect(root.innerHTML).toContain('vn-controls');
    expect(root.innerHTML).toContain('vn-background-fill');
    expect(root.innerHTML).toContain('vn-background-fit');
    expect(root.innerHTML).toContain('>SKIP<');
    expect(root.innerHTML).toContain('>AUTO<');
    expect(root.innerHTML).toContain('aria-label="История диалога"');
    expect(root.innerHTML).toContain('aria-label="Настройки"');
    expect(root.innerHTML).not.toContain('aria-label="Главное меню"');
    expect(root.innerHTML).not.toContain('id="config"');

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

  it('renders player-facing audio controls without requiring browser audio support', () => {
    const { root, app } = create();
    app.mount();
    app.renderSettings();
    expect(root.innerHTML).toContain('Звук и отклик');
    expect(root.innerHTML).toContain('Громкость музыки');
    expect(root.innerHTML).toContain('Громкость эффектов');
    expect(root.innerHTML).toContain('Haptics');
    expect(root.innerHTML).toContain('Проверить музыку');
    expect(root.innerHTML).toContain('Проверить SFX');
  });


  it('renders the ANM-019B language selector and an English menu/settings vertical slice', () => {
    const storage = (globalThis.window as unknown as { localStorage: Storage }).localStorage;
    storage.setItem(LOCALE_SETTINGS_KEY, 'en');
    const { root, app } = create();
    app.mount();
    expect(root.innerHTML).toContain('New Game');
    expect(root.innerHTML).toContain('Scene Navigation');
    expect(root.innerHTML).toContain('Saves &amp; Diagnostics');
    expect(root.innerHTML).not.toContain('Новая игра');

    app.renderSettings();
    expect(root.innerHTML).toContain('Audio &amp; Feedback');
    expect(root.innerHTML).toContain('Music volume');
    expect(root.innerHTML).toContain('Check for update');
    expect(root.innerHTML).toContain('data-language-select');
    expect(root.innerHTML).toContain('<option value="en" selected>English</option>');
  });

  it('renders save and diagnostics tools', () => {
    const { root, app } = create();
    app.mount();
    app.renderSupport();
    expect(root.innerHTML).toContain('Сохранения и диагностика');
    expect(root.innerHTML).toContain('Экспорт сохранения');
    expect(root.innerHTML).toContain('Импорт сохранения');
    expect(root.innerHTML).toContain('Экспорт диагностики');
    expect(root.innerHTML).toContain('Экспорт playtest report');
    expect(root.innerHTML).toContain('PWA / OFFLINE');
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
    expect(root.innerHTML).toContain('Перетащите фишку');
    expect(root.innerHTML).toContain('подсказка учитывает цели');
    expect(root.innerHTML).toContain('tile-stack');
  });
  it('pages compact VN dialogue before advancing the authored line', () => {
    Object.assign(globalThis.window as unknown as Record<string, unknown>, { innerWidth: 320, innerHeight: 568 });
    const { root, app } = create();
    app.openScene(0, 0);
    expect(root.innerHTML).toContain('VN0001 · 1/2');
    expect(root.innerHTML).toContain('data-dialogue-page="1"');

    const state = app as unknown as { nextLine(): void; save: { line: number; readLines: string[] } };
    expect(state.save.line).toBe(0);
    expect(state.save.readLines).not.toContain('VN0001');

    state.nextLine();
    expect(state.save.line).toBe(0);
    expect(state.save.readLines).not.toContain('VN0001');
    expect(root.innerHTML).toContain('VN0001 · 2/2');
    expect(root.innerHTML).toContain('data-dialogue-page="2"');

    state.nextLine();
    expect(state.save.line).toBe(1);
    expect(state.save.readLines).toContain('VN0001');
  });

});
