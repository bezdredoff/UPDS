import { describe, expect, it } from 'vitest';
import { createSeededRandom } from '../src/engine/SeededRandom';

describe('UPDS seeded random sequence v1', () => {
  it('keeps the documented sequence stable for a known seed', () => {
    const random = createSeededRandom(9001);
    expect(Array.from({ length: 5 }, random)).toEqual([
      0.8673377186059952,
      0.42265214351937175,
      0.5292259221896529,
      0.40202159946784377,
      0.07498880056664348,
    ]);
  });

  it('creates independent repeatable streams and normalizes seed input to unsigned 32 bits', () => {
    const first = createSeededRandom(-1);
    const second = createSeededRandom(0xffffffff);
    expect(Array.from({ length: 8 }, first)).toEqual(Array.from({ length: 8 }, second));
  });
});
