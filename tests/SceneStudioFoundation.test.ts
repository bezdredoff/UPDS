import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppShell } from '../src/app/AppShell';
import type { AppNavigation } from '../src/app/AppNavigation';
import { SceneStudioController } from '../src/features/sceneStudio/SceneStudioController';
import { createRuntimeServices } from '../src/platform/RuntimeServices';
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

const originalWindow = globalThis.window;

describe('ANM-028B1 Scene Studio foundation', () => {
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

  it('adds a localized QA entry and renders the shared scale layers', () => {
    const root = new FakeRoot();
    const app = new AnimeDetectiveApp(root as unknown as HTMLElement);
    app.mount();
    expect(root.innerHTML).toContain('Студия сцен');

    app.renderSceneStudio();
    expect(root.innerHTML).toContain('data-scene-preset="solo-close"');
    expect(root.innerHTML).toContain('upds-scene-staging-v1');
    expect(root.innerHTML).toContain('scene-studio-character-shot');
    expect(root.innerHTML).toContain('scene-studio-character-canonical');
    expect(root.innerHTML).toContain('--scene-shot-scale:1.08');
    expect(root.innerHTML).toContain('--scene-character-scale:1');
  });

  it('previews two real actors, native evidence, and the asset-free guest shell', () => {
    const root = new FakeRoot();
    const services = createRuntimeServices();
    const shell = new AppShell(root as unknown as HTMLElement, () => undefined);
    const navigation = {} as AppNavigation;
    const studio = new SceneStudioController(root as unknown as HTMLElement, services, shell, navigation);

    studio.render('two-shot-conflict', 'lockerAthletics');
    expect(root.innerHTML.match(/data-character=/g)).toHaveLength(2);
    expect(root.innerHTML).toContain('data-character="miku"');
    expect(root.innerHTML).toContain('data-character="emi"');

    studio.render('evidence-cutaway', 'clubroom');
    expect(root.innerHTML).toContain('scene-studio-evidence-card');
    expect(root.innerHTML).toContain('Проводящая нить');

    studio.render('guest-testimony-card', 'clubroom');
    expect(root.innerHTML).toContain('scene-studio-guest-shell');
    expect(root.innerHTML).toContain('NO FAKE RUNTIME ASSETS');
    expect(root.innerHTML).not.toContain('/characters/guest/');
  });
});

