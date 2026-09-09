/**
 * iOS can deliver two intentional-looking click events for a double tap.
 * Keep the guard small and time-based so it only applies to the physical
 * advance gesture; AUTO and programmatic navigation do not use it.
 */
export const VN_ADVANCE_TAP_GUARD_MS = 180;

export function acceptsVnAdvanceTap(now: number, previous: number, guardMs = VN_ADVANCE_TAP_GUARD_MS): boolean {
  if (!Number.isFinite(now) || !Number.isFinite(previous)) return true;
  return now - previous >= guardMs;
}
