import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { characterRigs, characterStaging } from '../src/data/characterRigs';

describe('ANM-021B R5 VN character staging contract', () => {
  it('uses one canonical camera distance for the approved production trio', () => {
    expect(characterStaging).toEqual({
      miku: { scale: 1, yPercent: 0 },
      onoe: { scale: 1, yPercent: 0 },
      ayuki: { scale: 1, yPercent: 0 },
      emi: { scale: 1, yPercent: 0 },
    });
  });

  it('keeps five expressions on one character-independent canvas contract', () => {
    for (const rig of Object.values(characterRigs)) {
      expect(Object.values(rig.frames)).toHaveLength(5);
      expect(Object.values(rig.frames).every((asset) => asset.includes('/rig/pose_a/frames/frame-'))).toBe(true);
    }
  });

  it('makes precomposed and static portraits share the same contain/bottom camera CSS', async () => {
    const css = await readFile(new URL('../src/style.css', import.meta.url), 'utf8');
    expect(css).toContain('.portrait-frame, .portrait-static {');
    expect(css).toContain('width: 100%');
    expect(css).toContain('height: 100%');
    expect(css).toContain('object-fit: contain');
    expect(css).toContain('object-position: center bottom');
    expect(css).not.toContain('.portrait-base, .portrait-static {');
  });

  it('routes explicit staging variables through both Pose A and Pose B markup', async () => {
    const source = await readFile(new URL('../src/features/vn/VnPresentation.ts', import.meta.url), 'utf8');
    expect(source).toContain('characterStaging[character]');
    expect(source).toContain('--character-scale:');
    expect(source).toContain('--character-y:');
    expect(source).toContain('portrait-frame');
    expect(source).toContain('portrait-static');
  });
});
