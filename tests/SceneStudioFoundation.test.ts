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

  it('adds a localized QA entry and renders the shared runtime portrait crop', () => {
    const root = new FakeRoot();
    const app = new AnimeDetectiveApp(root as unknown as HTMLElement);
    app.mount();
    expect(root.innerHTML).toContain('Студия сцен');

    app.renderSceneStudio();
    expect(root.innerHTML).toContain('data-scene-preset="solo-close"');
    expect(root.innerHTML).toContain('upds-scene-staging-v1');
    expect(root.innerHTML).toContain('portrait portrait-static-wrap scene-studio-runtime-portrait');
    expect(root.innerHTML).toContain('data-runtime-crop="true"');
    expect(root.innerHTML).toContain('data-shot-scale="1"');
    expect(root.innerHTML).toContain('--portrait-height:178%');
    expect(root.innerHTML).toContain('--portrait-bottom:-78%');
    expect(root.innerHTML).toContain('--character-scale:1');
    expect(root.innerHTML).toContain('data-vn-frame="shared"');
    expect(root.innerHTML).toContain('data-frame-context="scene-studio"');
    expect(root.innerHTML).toContain('class="dialogue-shell');
    expect(root.innerHTML).toContain('class="vn-controls"');
    expect(root.innerHTML).toContain('data-scene-viewport="390x844"');
    expect(root.innerHTML).toContain('scene-studio-fit-box');
    expect(root.innerHTML).toContain('upds-scene-studio-qa-v1');
  });

  it('previews two real actors, native evidence, and the asset-free guest shell', () => {
    const root = new FakeRoot();
    const services = createRuntimeServices();
    const shell = new AppShell(root as unknown as HTMLElement, () => undefined);
    const navigation = {} as AppNavigation;
    const studio = new SceneStudioController(root as unknown as HTMLElement, services, shell, navigation);

    studio.render({ presetId: 'two-shot-conflict', background: 'lockerAthletics' });
    expect(root.innerHTML.match(/data-character=/g)).toHaveLength(2);
    expect(root.innerHTML).toContain('data-character="miku"');
    expect(root.innerHTML).toContain('data-character="emi"');
    expect(root.innerHTML.match(/data-runtime-crop="true"/g)).toHaveLength(2);
    expect(root.innerHTML).toContain('data-shot-scale="0.84"');
    expect(root.innerHTML).not.toContain('scene-studio-character-shot');

    studio.render({ presetId: 'evidence-cutaway', background: 'clubroom' });
    expect(root.innerHTML).toContain('scene-studio-evidence-card');
    expect(root.innerHTML).toContain('Проводящая нить');

    studio.render({ presetId: 'guest-testimony-card', background: 'clubroom' });
    expect(root.innerHTML).toContain('scene-studio-guest-shell');
    expect(root.innerHTML).toContain('NO FAKE RUNTIME ASSETS');
    expect(root.innerHTML).not.toContain('/characters/guest/');
  });

  it('renders a canonical neutral lineup and measured warnings without changing production scale', () => {
    const root = new FakeRoot();
    const services = createRuntimeServices();
    const shell = new AppShell(root as unknown as HTMLElement, () => undefined);
    const studio = new SceneStudioController(root as unknown as HTMLElement, services, shell, {} as AppNavigation);

    studio.render({ viewMode: 'lineup', viewportId: '320x568', textScale: 'large' });
    expect(root.innerHTML).toContain('data-lineup-source="upds-character-production-v2"');
    expect(root.innerHTML.match(/class="scene-studio-lineup-character"/g)).toHaveLength(4);
    expect(root.innerHTML).toContain('data-bottom-padding="118"');
    expect(root.innerHTML).toContain('bottom-pivot:miku');
    expect(root.innerHTML).toContain('data-scene-viewport="320x568"');
    expect(root.innerHTML).toContain('text-large');
  });
});
