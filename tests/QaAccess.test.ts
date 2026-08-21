import { describe, expect, it } from 'vitest';
import { qaSurfaceEnabled } from '../src/platform/QaAccess';

describe('QA surface access', () => {
  it('requires the explicit qa=1 query in a real browser URL', () => {
    expect(qaSurfaceEnabled('')).toBe(false);
    expect(qaSurfaceEnabled('?qa=0')).toBe(false);
    expect(qaSurfaceEnabled('?mode=qa')).toBe(false);
    expect(qaSurfaceEnabled('?qa=1')).toBe(true);
    expect(qaSurfaceEnabled('?foo=bar&qa=1')).toBe(true);
  });
});
