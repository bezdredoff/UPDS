import { describe, expect, it } from 'vitest';
import { acceptsVnAdvanceTap, VN_ADVANCE_TAP_GUARD_MS } from '../src/ui/vnTapGuard';

describe('VN advance tap guard', () => {
  it('accepts the first tap and rejects a rapid duplicate', () => {
    expect(acceptsVnAdvanceTap(1000, Number.NEGATIVE_INFINITY)).toBe(true);
    expect(acceptsVnAdvanceTap(1000 + VN_ADVANCE_TAP_GUARD_MS - 1, 1000)).toBe(false);
    expect(acceptsVnAdvanceTap(1000 + VN_ADVANCE_TAP_GUARD_MS, 1000)).toBe(true);
  });

  it('does not reject taps when the clock values are unavailable', () => {
    expect(acceptsVnAdvanceTap(Number.NaN, 1000)).toBe(true);
    expect(acceptsVnAdvanceTap(1000, Number.NaN)).toBe(true);
  });
});
