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
    expect(root.innerHTML).toContain('data-art-source="anm028d3-r1"');
    expect(root.innerHTML).toContain('./assets/characters/emi/candidates/anm028d3/frame-surprised-r1.png');
    expect(root.innerHTML).toContain('data-alpha-bounds="330,80,737,1508"');
    expect(root.innerHTML).toContain('data-eye-line-y="244"');
    expect(root.innerHTML).toContain('upds-scene-staging-v1');
    expect(root.innerHTML).toContain('portrait portrait-static-wrap scene-studio-runtime-portrait');
    expect(root.innerHTML).toContain('data-runtime-crop="true"');
    expect(root.innerHTML).toContain('data-shot-scale="1"');
    expect(root.innerHTML).toContain('--portrait-height:178%');
    expect(root.innerHTML).toContain('--portrait-top:0%');
    expect(root.innerHTML).toContain('--portrait-bottom:-78%');
    expect(root.innerHTML).toContain('--character-scale:1');
    expect(root.innerHTML).toContain('data-vn-frame="shared"');
    expect(root.innerHTML).toContain('data-frame-context="scene-studio"');
    expect(root.innerHTML).toContain('class="dialogue-shell');
    expect(root.innerHTML).toContain('class="vn-controls"');
    expect(root.innerHTML).toContain('data-scene-viewport="390x844"');
    expect(root.innerHTML).toContain('scene-studio-fit-box');
    expect(root.innerHTML).toContain('scene-studio-focal-eye-line');
    expect(root.innerHTML).toContain('data-guide-geometry="expression-frame"');
    expect(root.innerHTML).toContain('scene-studio-actor-alpha-box');
    expect(root.innerHTML).toContain('scene-studio-actor-eye-marker');
    expect(root.innerHTML).toContain('upds-scene-studio-qa-v1');
    expect(root.innerHTML).toContain('Локальные подмены персонажей');
    expect(root.innerHTML).toContain('Загрузить ZIP');
    expect(root.innerHTML).toContain('Локальные подмены не загружены.');
    expect(root.innerHTML).toContain('BROWSER LOCAL');
  });

  it('renders duo and trio portraits with measurable focal eye-line anchors and selected-frame guides', () => {
    const root = new FakeRoot();
    const services = createRuntimeServices();
    const shell = new AppShell(root as unknown as HTMLElement, () => undefined);
    const studio = new SceneStudioController(root as unknown as HTMLElement, services, shell, {} as AppNavigation);

    studio.render({ presetId: 'two-shot-conflict', background: 'clubroom', showGuides: true });
    expect(root.innerHTML.match(/data-vertical-anchor="background-focal-eye-line"/g)).toHaveLength(2);
    expect(root.innerHTML.match(/data-guide-geometry="expression-frame"/g)).toHaveLength(2);
    expect(root.innerHTML.match(/scene-studio-actor-alpha-box/g)).toHaveLength(2);
    expect(root.innerHTML.match(/scene-studio-actor-eye-marker/g)).toHaveLength(2);
    expect(root.innerHTML).toContain('data-alpha-bounds="330,80,737,1508"');
    expect(root.innerHTML).toContain('data-guide-geometry="expression-frame"');
    expect(root.innerHTML).toContain('SELECTED FRAME ALPHA · anm028d3-r1');
    expect(root.innerHTML).toContain('data-guide="face-lane"');

    studio.render({ presetId: 'trio-central-speaker', background: 'clubroom', showGuides: true });
    expect(root.innerHTML.match(/data-vertical-anchor="background-focal-eye-line"/g)).toHaveLength(3);
    expect(root.innerHTML.match(/data-eye-line-ratio=/g)).toHaveLength(3);
    expect(root.innerHTML.match(/scene-studio-actor-alpha-box/g)).toHaveLength(3);
    expect(root.innerHTML.match(/scene-studio-actor-eye-marker/g)).toHaveLength(3);
    expect(root.innerHTML).toContain('scene-studio-calibration-overlay is-visible');
  });

  it('previews bounded authored VN shots through the same preset resolver', () => {
    const root = new FakeRoot();
    const services = createRuntimeServices();
    const shell = new AppShell(root as unknown as HTMLElement, () => undefined);
    const studio = new SceneStudioController(root as unknown as HTMLElement, services, shell, {} as AppNavigation);

    studio.render({ lineId: 'VN0008', presetId: 'solo-close', background: 'poolLocker', artSource: 'anm028d3-r1' });
    expect(root.innerHTML).toContain('data-scene-preset="trio-central-speaker"');
    expect(root.innerHTML).toContain('data-art-source="runtime"');
    expect(root.innerHTML.match(/data-character=/g)).toHaveLength(3);
    expect(root.innerHTML).toContain('data-character="miku"');
    expect(root.innerHTML).toContain('data-character="onoe"');
    expect(root.innerHTML).toContain('data-character="ayuki"');
    expect(root.innerHTML.match(/data-vertical-anchor="background-focal-eye-line"/g)).toHaveLength(3);
  });

  it('previews two real actors, native evidence, and the B3 asset-free Hinata guest package', () => {
    const root = new FakeRoot();
    const services = createRuntimeServices();
    const shell = new AppShell(root as unknown as HTMLElement, () => undefined);
    const navigation = {} as AppNavigation;
    const studio = new SceneStudioController(root as unknown as HTMLElement, services, shell, navigation);

    studio.render({ presetId: 'two-shot-conflict', background: 'lockerAthletics' });
    expect(root.innerHTML.match(/data-character=/g)).toHaveLength(2);
    expect(root.innerHTML).toContain('data-character="miku"');
    expect(root.innerHTML).toContain('data-character="emi"');
    expect(root.innerHTML).toContain('data-art-source="anm028d3-r1"');
    expect(root.innerHTML.match(/data-runtime-crop="true"/g)).toHaveLength(2);
    expect(root.innerHTML).toContain('data-shot-scale="0.84"');
    expect(root.innerHTML).not.toContain('scene-studio-character-shot');

    studio.render({ presetId: 'evidence-cutaway', background: 'clubroom' });
    expect(root.innerHTML).toContain('scene-studio-evidence-card');
    expect(root.innerHTML).toContain('Проводящая нить');

    studio.render({ presetId: 'guest-testimony-card', background: 'clubroom' });
    expect(root.innerHTML).toContain('data-guest-witness="hinata"');
    expect(root.innerHTML).toContain('guest-witness-placeholder');
    expect(root.innerHTML).toContain('Тихару Хината');
    expect(root.innerHTML).toContain('PLANNED · ASSET-FREE');
    expect(root.innerHTML).not.toContain('/characters/guest/');
    expect(root.innerHTML).not.toContain('<img class="guest-witness-image"');
  });

  it('renders the surprised candidate lineup and measured warnings without changing production scale', () => {
    const root = new FakeRoot();
    const services = createRuntimeServices();
    const shell = new AppShell(root as unknown as HTMLElement, () => undefined);
    const studio = new SceneStudioController(root as unknown as HTMLElement, services, shell, {} as AppNavigation);

    studio.render({ viewMode: 'lineup', viewportId: '320x568', textScale: 'large' });
    expect(root.innerHTML).toContain('data-lineup-source="upds-character-production-v2+upds-character-candidate-v1"');
    expect(root.innerHTML.match(/class="scene-studio-lineup-character"/g)).toHaveLength(4);
    expect(root.innerHTML).toContain('data-bottom-padding="118"');
    expect(root.innerHTML).toContain('data-bottom-padding="28"');
    expect(root.innerHTML).toContain('data-visual-height="1428"');
    expect(root.innerHTML).toContain('data-eye-line-y="244"');
    expect(root.innerHTML).toContain('data-candidate="true"');
    expect(root.innerHTML).toContain('bottom-pivot:miku');
    expect(root.innerHTML).toContain('master-rebuild:emi');
    expect(root.innerHTML).toContain('data-visual-approval="manual-qa"');
    expect(root.innerHTML).toContain('data-scene-viewport="320x568"');
    expect(root.innerHTML).toContain('text-large');
  });

  it('keeps the approved smile expression available beside the neutral anchor', () => {
    const root = new FakeRoot();
    const services = createRuntimeServices();
    const shell = new AppShell(root as unknown as HTMLElement, () => undefined);
    const studio = new SceneStudioController(root as unknown as HTMLElement, services, shell, {} as AppNavigation);

    studio.render({ presetId: 'solo-close', artSource: 'anm028d1-r1' });
    expect(root.innerHTML).toContain('data-art-source="anm028d1-r1"');
    expect(root.innerHTML).toContain('./assets/characters/emi/candidates/anm028d1/frame-smile-r1.png');
    expect(root.innerHTML).toContain('data-visual-approval="approved-expression"');
    expect(root.innerHTML).not.toContain('./assets/characters/emi/candidates/anm028d2/frame-serious-r1.png');
    expect(root.innerHTML).not.toContain('./assets/characters/emi/candidates/anm028d3/frame-surprised-r1.png');
  });

  it('keeps the approved serious expression available beside the earlier references', () => {
    const root = new FakeRoot();
    const services = createRuntimeServices();
    const shell = new AppShell(root as unknown as HTMLElement, () => undefined);
    const studio = new SceneStudioController(root as unknown as HTMLElement, services, shell, {} as AppNavigation);

    studio.render({ presetId: 'solo-close', artSource: 'anm028d2-r1' });
    expect(root.innerHTML).toContain('data-art-source="anm028d2-r1"');
    expect(root.innerHTML).toContain('./assets/characters/emi/candidates/anm028d2/frame-serious-r1.png');
    expect(root.innerHTML).toContain('data-visual-approval="approved-expression"');
    expect(root.innerHTML).not.toContain('./assets/characters/emi/candidates/anm028d3/frame-surprised-r1.png');
  });

  it('keeps the approved neutral master available as the expression anchor', () => {
    const root = new FakeRoot();
    const services = createRuntimeServices();
    const shell = new AppShell(root as unknown as HTMLElement, () => undefined);
    const studio = new SceneStudioController(root as unknown as HTMLElement, services, shell, {} as AppNavigation);

    studio.render({ presetId: 'solo-close', artSource: 'anm028d0-r1' });
    expect(root.innerHTML).toContain('data-art-source="anm028d0-r1"');
    expect(root.innerHTML).toContain('./assets/characters/emi/candidates/anm028d0/neutral-r1.png');
    expect(root.innerHTML).toContain('data-visual-approval="approved-master"');
    expect(root.innerHTML).not.toContain('./assets/characters/emi/candidates/anm028d1/frame-smile-r1.png');
  });

  it('uses the explicitly adopted runtime Emi frame and its measured geometry while retaining legacy fallback assets', () => {
    const root = new FakeRoot();
    const services = createRuntimeServices();
    const shell = new AppShell(root as unknown as HTMLElement, () => undefined);
    const studio = new SceneStudioController(root as unknown as HTMLElement, services, shell, {} as AppNavigation);

    studio.render({ presetId: 'two-shot-conflict', artSource: 'runtime' });
    expect(root.innerHTML).toContain('data-art-source="runtime"');
    expect(root.innerHTML).toContain('./assets/characters/emi/candidates/anm028d2/frame-serious-r1.png');
    expect(root.innerHTML).toContain('data-alpha-bounds="330,80,737,1508"');
    expect(root.innerHTML).toContain('data-eye-line-y="244"');
    expect(root.innerHTML).toContain('data-visual-approval="approved"');
    expect(root.innerHTML).not.toContain('./assets/characters/emi/rig/pose_a/frames/frame-serious.png');
  });
});
