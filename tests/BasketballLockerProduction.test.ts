import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { backgroundAssets, sceneMeta } from '../src/data/narrative';

const assetPath = resolve(process.cwd(), 'public/assets/backgrounds/BG_BASKETBALL_LOCKER.webp');
const approvedSha256 = 'ac591b43778570fb46a3a9282538154b4199825bfacf5dacea6d66b48668e149';

function readWebpDimensions(buffer: Buffer): readonly [number, number] {
  expect(buffer.subarray(0, 4).toString('ascii')).toBe('RIFF');
  expect(buffer.subarray(8, 12).toString('ascii')).toBe('WEBP');

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const fourcc = buffer.subarray(offset, offset + 4).toString('ascii');
    const size = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;

    if (fourcc === 'VP8X') {
      const width = 1 + buffer.readUIntLE(dataOffset + 4, 3);
      const height = 1 + buffer.readUIntLE(dataOffset + 7, 3);
      return [width, height];
    }

    if (fourcc === 'VP8 ') {
      expect(buffer.subarray(dataOffset + 3, dataOffset + 6)).toEqual(Buffer.from([0x9d, 0x01, 0x2a]));
      const width = buffer.readUInt16LE(dataOffset + 6) & 0x3fff;
      const height = buffer.readUInt16LE(dataOffset + 8) & 0x3fff;
      return [width, height];
    }

    offset = dataOffset + size + (size % 2);
  }

  throw new Error('Unsupported WebP container: no VP8/VP8X dimensions found');
}

describe('ANM-030B1B7 basketball locker production background', () => {
  it('uses a dedicated production asset instead of the athletics-locker fallback', () => {
    expect(backgroundAssets.basketballLocker).toBe('./assets/backgrounds/BG_BASKETBALL_LOCKER.webp');
    expect(backgroundAssets.basketballLocker).not.toBe(backgroundAssets.lockerAthletics);
  });

  it('keeps both slot-5 VN scenes on the basketball semantic key', () => {
    expect(sceneMeta.find((scene) => scene.id === 'VN_SCENE_11_E5_PRE')?.defaultBackground).toBe('basketballLocker');
    expect(sceneMeta.find((scene) => scene.id === 'VN_SCENE_12_E5_POST')?.defaultBackground).toBe('basketballLocker');
  });

  it('ships the exact approved 1080x1920 portrait WebP', () => {
    expect(existsSync(assetPath)).toBe(true);
    const asset = readFileSync(assetPath);
    expect(readWebpDimensions(asset)).toEqual([1080, 1920]);
    expect(createHash('sha256').update(asset).digest('hex')).toBe(approvedSha256);
  });
});
