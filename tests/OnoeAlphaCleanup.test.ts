import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { decodeRgbaPng } from './helpers/pngRgba';

type CleanupAsset = {
  path: string; mask: string; outputSHA256: string; sourceSHA256: string;
  rgbSHA256: string; protectedPixelsSHA256: string;
  width: number; height: number; alphaChanges: number; bounds: number[];
  visualApproval: string;
};
const manifest: { format: string; assets: CleanupAsset[] } = JSON.parse(
  readFileSync('docs/art/onoe-alpha-2026-10-01/qa.json', 'utf8'),
);
const sha = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');

describe('Onoe shoulder-strand cleanup preserves approved artwork', () => {
  it('covers exactly five expressions, Pose B and the portrait', () => {
    expect(manifest.format).toBe('upds-onoe-alpha-cleanup-v1');
    expect(manifest.assets.every(a => a.visualApproval === 'user-approved-2026-10-01')).toBe(true);
    expect(manifest.assets.map(a => a.path).sort()).toEqual([
      'public/assets/characters/onoe/medallions/portrait_neutral_256.png',
      'public/assets/characters/onoe/poses/pose_b_evidence_bag.png',
      ...['embarrassed', 'neutral', 'serious', 'smile', 'surprised'].map(
        e => `public/assets/characters/onoe/rig/pose_a/frames/frame-${e}.png`,
      ),
    ].sort());
  });
  for (const asset of manifest.assets) {
    it(`${asset.path}: RGB and alpha outside the shared mask remain exact`, () => {
      const bytes = readFileSync(asset.path);
      expect(sha(bytes)).toBe(asset.outputSHA256);
      const image = decodeRgbaPng(bytes);
      const mask = decodeRgbaPng(readFileSync(`docs/art/onoe-alpha-2026-10-01/masks/${asset.mask}.png`));
      expect([image.width, image.height]).toEqual([asset.width, asset.height]);
      expect([mask.width, mask.height]).toEqual([image.width, image.height]);
      const rgb = Buffer.alloc(image.width * image.height * 3);
      const protectedPixels = Buffer.from(image.pixels);
      const bounds = [image.width, image.height, 0, 0];
      let invalidMaskPixels = 0;
      let residualAlpha = 0;
      for (let p = 0; p < image.width * image.height; p++) {
        image.pixels.copy(rgb, p * 3, p * 4, p * 4 + 3);
        const keep = mask.pixels[p * 4];
        if (keep !== 0 && keep !== 255) invalidMaskPixels++;
        if (keep === 0) {
          if (image.pixels[p * 4 + 3] !== 0) residualAlpha++;
          protectedPixels[p * 4 + 3] = 0;
        }
        if (image.pixels[p * 4 + 3]) {
          const x = p % image.width; const y = Math.floor(p / image.width);
          bounds[0] = Math.min(bounds[0], x); bounds[1] = Math.min(bounds[1], y);
          bounds[2] = Math.max(bounds[2], x + 1); bounds[3] = Math.max(bounds[3], y + 1);
        }
      }
      expect(sha(rgb)).toBe(asset.rgbSHA256);
      expect(invalidMaskPixels).toBe(0);
      expect(residualAlpha).toBe(0);
      expect(sha(protectedPixels)).toBe(asset.protectedPixelsSHA256);
      expect(bounds).toEqual(asset.bounds);
      expect(asset.alphaChanges).toBeGreaterThan(0);
    });
  }
  it('chains the approved surprised repair into the alpha-only cleanup', () => {
    const source = readFileSync('docs/art/onoe-alpha-2026-10-01/source-surprised.png');
    const asset = manifest.assets.find(a => a.path.endsWith('/frame-surprised.png'));
    expect(sha(source)).toBe(asset?.sourceSHA256);
  });
  it('keeps the colored portrait strand where the rejected v1 had a square cut', () => {
    const image = decodeRgbaPng(readFileSync('public/assets/characters/onoe/medallions/portrait_neutral_256.png'));
    for (const [x, y, alpha] of [[199, 135, 224], [211, 165, 222], [221, 185, 255]]) {
      expect(image.pixels[(y * image.width + x) * 4 + 3]).toBe(alpha);
    }
  });
});
