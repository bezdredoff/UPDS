import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Match3Reaction } from '../src/data/match3Reactions';
import {
  match3ReactionPresentationPolicy,
  resolveMatch3ReactionPresentation,
} from '../src/ui/match3ReactionPresentation';

const reaction = (id: Match3Reaction['id'], repeat: Match3Reaction['repeat'] = 'once-per-attempt'): Match3Reaction => ({
  id,
  repeat,
  speaker: 'miku',
  messageKey: `test.${id}`,
});

describe('ANM-025F3 Match-3 reaction presentation and anti-spam', () => {
  it('keeps every once-per-attempt reaction visible regardless of recent presentation time', () => {
    const objective = reaction('objective-complete');
    expect(resolveMatch3ReactionPresentation(objective, 10_100, 10_000)).toMatchObject({
      show: true,
      policy: { durationMs: 3200, cooldownMs: 0, emphasis: 'urgent' },
    });
    expect(resolveMatch3ReactionPresentation(reaction('danger'), 20_001, 20_000).show).toBe(true);
  });

  it('suppresses only repeatable cascade reactions inside the cooldown and allows them afterwards', () => {
    const cascade = reaction('cascade', 'repeatable');
    expect(resolveMatch3ReactionPresentation(cascade, 10_000)).toMatchObject({ show: true });
    expect(resolveMatch3ReactionPresentation(cascade, 12_000, 10_000)).toMatchObject({
      show: false,
      reason: 'cooldown',
      policy: { durationMs: 1700, cooldownMs: 3600, emphasis: 'light' },
    });
    expect(resolveMatch3ReactionPresentation(cascade, 13_600, 10_000).show).toBe(true);
  });

  it('uses stable emphasis and timing tiers without coupling presentation to the resolver', () => {
    expect(match3ReactionPresentationPolicy('special-combo')).toEqual({ durationMs: 2600, cooldownMs: 0, emphasis: 'strong' });
    expect(match3ReactionPresentationPolicy('near-win')).toEqual({ durationMs: 3000, cooldownMs: 0, emphasis: 'strong' });
    expect(match3ReactionPresentationPolicy('character-beat')).toEqual({ durationMs: 2800, cooldownMs: 0, emphasis: 'standard' });
    const source = readFileSync(resolve(process.cwd(), 'src/ui/match3ReactionPresentation.ts'), 'utf8');
    for (const forbidden of ['HTMLElement', 'document.', 'RuntimeServices', 'Match3Game']) expect(source).not.toContain(forbidden);
  });

  it('keeps board geometry stable, supports reduced motion and records shown/suppressed telemetry', () => {
    const controller = readFileSync(resolve(process.cwd(), 'src/features/match3/Match3Controller.ts'), 'utf8');
    const css = readFileSync(resolve(process.cwd(), 'src/match3ReactionPresentation.css'), 'utf8');
    expect(controller).toContain('field-bark-slot');
    expect(controller).toContain("action: 'shown'");
    expect(controller).toContain("action: 'suppressed'");
    expect(controller).toContain('suppressionReason: presentation.reason');
    expect(controller).toContain('this.resetReactionPresentation()');
    expect(controller).toContain('this.clearReactionPresentationTimer()');
    expect(controller).toContain('this.armReactionPresentationTimer()');
    expect(controller.indexOf('this.armReactionPresentationTimer()')).toBeGreaterThan(controller.indexOf('this.shell.render(`'));
    expect(controller).toContain("this.reactionPresentationTimer === null ? ' is-entering' : ''");
    expect(css).toContain('min-height: 42px');
    expect(css).toContain('@keyframes match3-reaction-bark-enter');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
