import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('release backlog prioritization', () => {
  it('keeps the actionable release backlog separate from historical roadmap detail', () => {
    const roadmap = read('docs/ROADMAP_RU.md');
    const backlog = read('docs/RELEASE_BACKLOG_RU.md');

    expect(roadmap).toContain('RELEASE_BACKLOG_RU.md');
    expect(backlog).toContain('portrait-first **web/PWA**');
    expect(backlog).toContain('production locales: **RU / BE / EN**');
    expect(backlog).toContain('R0 — release blocker');
    expect(backlog).toContain('R1 — release-worthy');
    expect(backlog).toContain('R2 — post-release / optional');
    expect(backlog).toContain('DROP / evidence-only');
  });

  it('prioritizes visible release gaps over optional hero-CG work', () => {
    const backlog = read('docs/RELEASE_BACKLOG_RU.md');
    const menu = read('src/features/menu/MainMenuController.ts');
    const audit = read('src/content/art/ANM030A.asset-gap-audit.json');

    expect(menu).toContain('menu.sceneNavigation');
    expect(menu).toContain('menu.levelLab');
    expect(menu).toContain('menu.sceneStudio');
    expect(menu).toContain('menu.saveDiagnostics');
    expect(backlog).toContain('normal player build не показывает QA navigation/tools');

    expect(audit).toContain('"runtimeFallbackBackgroundVariants": 11');
    expect(audit).toContain('"productionGuestPackages": 0');
    expect(backlog).toContain('Все восемь background families имеют production master');
    expect(backlog).toContain('`lab-asterion` уже получил production master');
    expect(backlog).toContain('`laundry-service` уже получил production master');
    expect(backlog).toContain('`campus-exterior` уже получил production master');
    expect(backlog).toContain('`old-building-finale` уже получил production master');
    expect(backlog).toContain('Дальнейшее производство background art через ChatGPT поставлено на паузу');
    expect(backlog).toContain('ни один shipped guest scene не показывает placeholder initials');

    expect(audit).toContain('"productionHeroClueCloseups": 0');
    expect(backlog).toContain('**не строить Hero Clue system для первого релиза**');
    expect(backlog).toContain('`conductive-seam` больше не является автоматически «следующей обязательной фичей»');
  });

  it('does not turn production budgets into mandatory asset counts', () => {
    const backlog = read('docs/RELEASE_BACKLOG_RU.md');

    expect(backlog).toContain('zero visibly wrong semantic background fallbacks in shipped Story');
    expect(backlog).toContain('19/19 уникальных variant PNG');
    expect(backlog).toContain('≤4 reusable adult archetypes');
    expect(backlog).toContain('blockingMatch3ArtGaps = 0');
    expect(backlog).toContain('Пять production PNG имеют смысл, если');
    expect(backlog).toContain('уникальная песня для каждого Match-3 level');
  });
});
