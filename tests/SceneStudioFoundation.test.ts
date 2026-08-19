import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppShell } from '../src/app/AppShell';
import { applyBrowserLocalCharacterCalibration, applyBrowserLocalCharacterOverrides, clearBrowserLocalCharacterOverrides } from '../src/data/characterRuntimeOverrides';
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

const createStudio = (root: FakeRoot): SceneStudioController => {
  const services = createRuntimeServices();
  const shell = new AppShell(root as unknown as HTMLElement, () => undefined);
  return new SceneStudioController(root as unknown as HTMLElement, services, shell, {} as AppNavigation);
};

describe('ANM-028E0C1 Scene Studio workspace separation', () => {
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
    clearBrowserLocalCharacterOverrides();
    Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
  });

  it('opens in Composition with runtime/browser-local art and no legacy Emi Art Source control', () => {
    const root = new FakeRoot();
    const app = new AnimeDetectiveApp(root as unknown as HTMLElement);
    app.mount();
    expect(root.innerHTML).toContain('Студия сцен');

    app.renderSceneStudio();
    expect(root.innerHTML).toContain('data-scene-studio-workspace="composition"');
    expect(root.innerHTML).toContain('data-scene-preset="solo-close"');
    expect(root.innerHTML).toContain('data-art-source="runtime"');
    expect(root.innerHTML).toContain('data-character="miku"');
    expect(root.innerHTML).toContain('./assets/characters/miku/rig/pose_a/frames/frame-serious.png');
    expect(root.innerHTML).toContain('id="scene-studio-workspace"');
    expect(root.innerHTML).toContain('id="scene-studio-preset"');
    expect(root.innerHTML).not.toContain('id="scene-studio-art-source"');
    expect(root.innerHTML).not.toContain('value="anm028d0-r1"');
    expect(root.innerHTML).not.toContain('value="anm028d1-r1"');
    expect(root.innerHTML).not.toContain('value="anm028d2-r1"');
    expect(root.innerHTML).not.toContain('value="anm028d3-r1"');
    expect(root.innerHTML).toContain('Локальные подмены персонажей');
    expect(root.innerHTML).toContain('BROWSER LOCAL');
  });

  it('keeps Composition trio-reaction independent from any authored VN line', () => {
    const root = new FakeRoot();
    const studio = createStudio(root);

    studio.render({ workspaceMode: 'composition', presetId: 'trio-reaction', lineId: 'VN0038', background: 'clubroom' });
    expect(root.innerHTML).toContain('data-scene-studio-workspace="composition"');
    expect(root.innerHTML).toContain('data-scene-preset="trio-reaction"');
    expect(root.innerHTML.match(/data-character=/g)).toHaveLength(3);
    expect(root.innerHTML).toContain('data-character="ayuki"');
    expect(root.innerHTML).toContain('data-character="miku"');
    expect(root.innerHTML).toContain('data-character="onoe"');
    expect(root.innerHTML).not.toContain('data-character="emi"');
    expect(root.innerHTML).not.toContain('id="scene-studio-line"');
    expect(root.innerHTML).toContain('composition-preview');
  });

  it('renders Story QA from the authored shot and makes production plan/background read-only', () => {
    const root = new FakeRoot();
    const studio = createStudio(root);

    studio.render({ workspaceMode: 'story', lineId: 'VN0008', presetId: 'solo-close', background: 'poolLocker', viewMode: 'lineup' });
    expect(root.innerHTML).toContain('data-scene-studio-workspace="story"');
    expect(root.innerHTML).toContain('data-scene-preset="trio-central-speaker"');
    expect(root.innerHTML).toContain('data-story-derived="preset"');
    expect(root.innerHTML).toContain('data-story-derived="background"');
    expect(root.innerHTML).toContain('id="scene-studio-line"');
    expect(root.innerHTML).toContain('value="VN0957"');
    expect(root.innerHTML).not.toContain('id="scene-studio-preset"');
    expect(root.innerHTML).not.toContain('id="scene-studio-background"');
    expect(root.innerHTML).not.toContain('id="scene-studio-mode"');
    expect(root.innerHTML.match(/data-character=/g)).toHaveLength(3);
    expect(root.innerHTML).toContain('data-character="miku"');
    expect(root.innerHTML).toContain('data-character="onoe"');
    expect(root.innerHTML).toContain('data-character="ayuki"');
  });

  it('shows VN0038 honestly as its real two-shot-alliance Ayuki + Emi authored shot', () => {
    const root = new FakeRoot();
    const studio = createStudio(root);

    studio.render({ workspaceMode: 'story', lineId: 'VN0038' });
    expect(root.innerHTML).toContain('data-scene-preset="two-shot-alliance"');
    expect(root.innerHTML.match(/data-character=/g)).toHaveLength(2);
    expect(root.innerHTML).toContain('data-character="ayuki"');
    expect(root.innerHTML).toContain('data-character="emi"');
    expect(root.innerHTML).toContain('./assets/characters/ayuki/poses/pose_b_phone_theory.png');
  });

  it('keeps duo/trio focal-eye guides on runtime expression geometry', () => {
    const root = new FakeRoot();
    const studio = createStudio(root);

    studio.render({ workspaceMode: 'composition', presetId: 'two-shot-conflict', background: 'clubroom', showGuides: true });
    expect(root.innerHTML.match(/data-vertical-anchor="background-focal-eye-line"/g)).toHaveLength(2);
    expect(root.innerHTML.match(/data-guide-geometry="expression-frame"/g)).toHaveLength(2);
    expect(root.innerHTML.match(/scene-studio-actor-alpha-box/g)).toHaveLength(2);
    expect(root.innerHTML.match(/scene-studio-actor-eye-marker/g)).toHaveLength(2);
    expect(root.innerHTML).toContain('data-guide="face-lane"');

    studio.render({ workspaceMode: 'composition', presetId: 'trio-central-speaker', background: 'clubroom', showGuides: true });
    expect(root.innerHTML.match(/data-vertical-anchor="background-focal-eye-line"/g)).toHaveLength(3);
    expect(root.innerHTML.match(/data-eye-line-ratio=/g)).toHaveLength(3);
    expect(root.innerHTML.match(/scene-studio-actor-alpha-box/g)).toHaveLength(3);
    expect(root.innerHTML.match(/scene-studio-actor-eye-marker/g)).toHaveLength(3);
    expect(root.innerHTML).toContain('scene-studio-calibration-overlay is-visible');
  });

  it('keeps evidence, guest testimony, and runtime Emi presentation available in Composition', () => {
    const root = new FakeRoot();
    const studio = createStudio(root);

    studio.render({ workspaceMode: 'composition', presetId: 'two-shot-conflict', background: 'lockerAthletics' });
    expect(root.innerHTML.match(/data-character=/g)).toHaveLength(2);
    expect(root.innerHTML).toContain('data-character="miku"');
    expect(root.innerHTML).toContain('data-character="emi"');
    expect(root.innerHTML).toContain('data-art-source="runtime"');
    expect(root.innerHTML).toContain('./assets/characters/emi/candidates/anm028d2/frame-serious-r1.png');
    expect(root.innerHTML).toContain('data-visual-approval="approved"');

    studio.render({ workspaceMode: 'composition', presetId: 'evidence-cutaway', background: 'clubroom' });
    expect(root.innerHTML).toContain('scene-studio-evidence-card');
    expect(root.innerHTML).toContain('Проводящая нить');

    studio.render({ workspaceMode: 'composition', presetId: 'guest-testimony-card', background: 'clubroom' });
    expect(root.innerHTML).toContain('data-guest-witness="hinata"');
    expect(root.innerHTML).toContain('guest-witness-placeholder');
    expect(root.innerHTML).toContain('Тихару Хината');
    expect(root.innerHTML).toContain('PLANNED · ASSET-FREE');
    expect(root.innerHTML).not.toContain('/characters/guest/');
  });

  it('keeps lineup as a runtime-only Composition diagnostic instead of an Emi candidate selector', () => {
    const root = new FakeRoot();
    const studio = createStudio(root);

    studio.render({ workspaceMode: 'composition', viewMode: 'lineup', viewportId: '320x568', textScale: 'large' });
    expect(root.innerHTML).toContain('data-lineup-source="upds-character-production-v2"');
    expect(root.innerHTML.match(/class="scene-studio-lineup-character"/g)).toHaveLength(4);
    expect(root.innerHTML).not.toContain('data-candidate="true"');
    expect(root.innerHTML).toContain('data-scene-viewport="320x568"');
    expect(root.innerHTML).toContain('text-large');
  });

  it('keeps browser-local calibration editable in Composition and read-only in Story QA', () => {
    applyBrowserLocalCharacterOverrides({
      miku: {
        frames: {
          serious: {
            asset: 'blob:miku-serious',
            geometry: { alphaBounds: { left: 310, top: 48, right: 700, bottom: 1496 }, eyeLineYPx: 212 },
            visualApproval: 'approved',
            sourceCandidateId: 'browser-local:test',
          },
        },
        poseB: {
          asset: 'blob:miku-pose-b',
          geometry: { alphaBounds: { left: 320, top: 52, right: 702, bottom: 1498 }, eyeLineYPx: 216 },
          sourceCandidateId: 'browser-local:test',
        },
      },
    });
    applyBrowserLocalCharacterCalibration('miku', { scale: 1.1, xPercent: 2, yPercent: 3 });
    applyBrowserLocalCharacterCalibration('miku', { scale: 1.2, xPercent: -5, yPercent: 6 }, 'solo-close');

    const root = new FakeRoot();
    const studio = createStudio(root);
    (studio as unknown as { browserCalibrationScope: 'global' | 'plan' }).browserCalibrationScope = 'plan';

    studio.render({ workspaceMode: 'composition', presetId: 'solo-close' });
    expect(root.innerHTML).toContain('Ручная калибровка');
    expect(root.innerHTML).toContain('Текущий план · solo-close');
    expect(root.innerHTML).toContain('data-calibration-scope="plan"');
    expect(root.innerHTML).toContain('data-plan-override="true"');
    expect(root.innerHTML).toContain('--scene-x:45%');
    expect(root.innerHTML).toContain('style="--character-scale:1.2;--character-y:6%"');
    expect(root.innerHTML).toContain('upds-browser-local-character-export-v2');

    studio.render({ workspaceMode: 'story', lineId: 'VN0008' });
    expect(root.innerHTML).toContain('Локальные browser-overrides активны.');
    expect(root.innerHTML).not.toContain('Ручная калибровка');
    expect(root.innerHTML).not.toContain('scene-studio-browser-override-json');
  });
});
