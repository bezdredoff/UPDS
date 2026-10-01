import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { decodeRgbaPng, preservationSignatures, type FaceROI } from './helpers/pngRgba';

const qa = JSON.parse(readFileSync('docs/art/rina-pose-2026-10-01/qa.json', 'utf8')) as {
  masterSHA256: string;
  faceROI: FaceROI;
  assets: { expression: string; path: string; sourcePath: string; sourceSHA256: string;
    outputSHA256: string; alphaSHA256: string; outsideROISHA256: string; faceRGBSHA256: string;
    irisMaskPath: string | null; irisChanges: number }[];
  protectedAssets: { path: string; sha256: string }[];
};
const sha = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
const neutralPath = 'public/assets/characters/rina/rig/pose_a/frames/frame-neutral.png';
const neutralBytes = readFileSync(neutralPath);
const neutral = decodeRgbaPng(neutralBytes);
const neutralSignatures = preservationSignatures(neutralBytes, [qa.faceROI]);
function faceRGB(pixels: Buffer): Buffer {
  const [x, y, w, h] = qa.faceROI;
  const result = Buffer.alloc(w * h * 3);
  for (let row = 0; row < h; row++) for (let col = 0; col < w; col++) {
    const i = ((y + row) * 1024 + x + col) * 4;
    pixels.copy(result, (row * w + col) * 3, i, i + 3);
  }
  return result;
}
describe('Rina accepted pose preserves original identity and stable expression body', () => {
  it('locks the explicitly accepted neutral v2 and exact five-expression scope', () => {
    expect(sha(neutralBytes)).toBe('4ec1dd2d41b3bf1ddbf41e10a5bb90fed352c0e37a442e4775e1dbe87b8fede1');
    expect(sha(neutralBytes)).toBe(qa.masterSHA256);
    expect(qa.assets.map(asset => asset.expression)).toEqual(['neutral', 'smile', 'serious', 'surprised', 'embarrassed']);
  });
  for (const asset of qa.assets) it(`${asset.expression}: original face, stable alpha and non-face pixels`, () => {
    const bytes = readFileSync(asset.path), sourceBytes = readFileSync(asset.sourcePath);
    const measured = preservationSignatures(bytes, [qa.faceROI]);
    expect(sha(bytes)).toBe(asset.outputSHA256);
    expect(sha(sourceBytes)).toBe(asset.sourceSHA256);
    expect([measured.width, measured.height]).toEqual([1024, 1536]);
    expect(measured.alphaSHA256).toBe(neutralSignatures.alphaSHA256);
    expect(measured.alphaSHA256).toBe(asset.alphaSHA256);
    expect(measured.outsideROISHA256).toBe(neutralSignatures.outsideROISHA256);
    const rgb = faceRGB(decodeRgbaPng(bytes).pixels);
    const sourcePixels = decodeRgbaPng(sourceBytes).pixels;
    const mask = asset.irisMaskPath ? decodeRgbaPng(readFileSync(asset.irisMaskPath)).pixels : null;
    const [rx, ry, rw, rh] = qa.faceROI;
    const framePixels = decodeRgbaPng(bytes).pixels;
    let irisChanges = 0;
    for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) {
      const i = (y * 1024 + x) * 4;
      if (mask?.[i]) {
        expect(['smile', 'serious', 'embarrassed']).toContain(asset.expression);
        expect((x >= 459 && x < 492 && y >= 194 && y < 231) ||
          (x >= 550 && x < 584 && y >= 183 && y < 219)).toBe(true);
        expect(framePixels[i + 1]).toBeGreaterThan(framePixels[i]);
        expect(framePixels[i + 1]).toBeGreaterThan(framePixels[i + 2]);
        expect(framePixels[i + 3]).toBe(neutral.pixels[i + 3]);
        irisChanges++;
      } else {
        expect(framePixels.subarray(i, i + 3).equals(sourcePixels.subarray(i, i + 3))).toBe(true);
      }
    }
    expect(irisChanges).toBe(asset.irisChanges);
    if (mask) expect(irisChanges).toBeGreaterThan(500);
    expect(sha(rgb)).toBe(asset.faceRGBSHA256);
    const frame = decodeRgbaPng(bytes);
    let bounds = [1024, 1536, 0, 0];
    for (let i = 3; i < frame.pixels.length; i += 4) if (frame.pixels[i]) {
      const p = (i - 3) / 4, x = p % 1024, y = Math.floor(p / 1024);
      bounds = [Math.min(bounds[0], x), Math.min(bounds[1], y), Math.max(bounds[2], x + 1), Math.max(bounds[3], y + 1)];
    }
    expect(bounds).toEqual([266, 28, 765, 1508]);
  });
  it('restricts recoloring to the three requested expressions', () => {
    expect(qa.assets.filter(asset => asset.irisMaskPath).map(asset => asset.expression)).toEqual(['smile', 'serious', 'embarrassed']);
    expect(qa.assets.find(asset => asset.expression === 'surprised')?.outputSHA256).toBe('617a91361f2b6820d5334be5065bc2421aa8d6148a8c010115e0802957a03c6c');
  });
  it('keeps original face/head and lower-body rows in accepted neutral', () => {
    const original = decodeRgbaPng(readFileSync(qa.assets[0].sourcePath));
    expect(neutral.pixels.subarray(0, 320 * 1024 * 4).equals(original.pixels.subarray(0, 320 * 1024 * 4))).toBe(true);
    expect(neutral.pixels.subarray(832 * 1024 * 4).equals(original.pixels.subarray(832 * 1024 * 4))).toBe(true);
  });
  it('does not alter approved Pose B or medallion', () => {
    expect(qa.protectedAssets).toHaveLength(2);
    for (const asset of qa.protectedAssets) expect(sha(readFileSync(asset.path))).toBe(asset.sha256);
  });
});
