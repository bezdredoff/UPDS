import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('G2-READ-001 locked Campaign readability contract', () => {
  it('loads the focused Campaign readability stylesheet from the production controller', () => {
    const controller = read('src/features/match3Campaign/Match3CampaignController.ts');
    expect(controller).toContain("import './campaignReadability.css';");
  });

  it('removes whole-card dimming while keeping locked state visually distinct', () => {
    const css = read('src/features/match3Campaign/campaignReadability.css');
    expect(css).toContain('.match3-campaign-screen .campaign-level-card.locked');
    expect(css).toContain('opacity: 1;');
    expect(css).toContain('filter: none;');
    expect(css).toContain('border-color: #b8b1bc;');
    expect(css).toContain('background: #f3f0f3;');
    expect(css).toContain('.campaign-level-meta span');
    expect(css).toContain('button:disabled');
  });

  it('keeps the existing spoiler-safe locked identity contract intact', () => {
    const controller = read('src/features/match3Campaign/Match3CampaignController.ts');
    const spoilerSpec = read('e2e/tests/campaign-spoilers.pw.ts');
    expect(controller).toContain(": `<div class=\"campaign-level-heading\"><span aria-hidden=\"true\">—</span><b>${status}</b></div>`;");
    expect(spoilerSpec).toContain("lockedCard.locator('.campaign-level-heading span')).not.toHaveText(/M3_/)");
    expect(spoilerSpec).toContain("lockedCard.locator('p')).toHaveCount(0)");
    expect(spoilerSpec).toContain("lockedCard).not.toContainText('M3_01')");
  });

  it('verifies the actual compact browser cascade instead of CSS text only', () => {
    const boot = read('e2e/tests/boot.pw.ts');
    expect(boot).toContain("const lockedCard = page.locator('.campaign-level-card.locked').first();");
    expect(boot).toContain("expect(lockedPresentation.opacity).toBe('1')");
    expect(boot).toContain("expect(lockedPresentation.filter).toBe('none')");
    expect(boot).toContain("expect(lockedPresentation.buttonOpacity).toBe('1')");
  });
});
