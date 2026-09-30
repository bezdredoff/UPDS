type TapPoint = Readonly<{ x: number; y: number; time: number; scope: object }>;

/** Only repeated, stationary, single-finger taps on passive content qualify. */
export class RapidTapZoomGuard {
  private start: TapPoint | null = null;
  private previous: TapPoint | null = null;

  reset(): void {
    this.start = null;
    this.previous = null;
  }

  begin(point: TapPoint | null): void {
    this.start = point;
    if (!point) this.previous = null;
  }

  move(x: number, y: number, fingers: number): void {
    if (fingers !== 1 || (this.start && Math.hypot(x - this.start.x, y - this.start.y) > 10)) this.reset();
  }

  end(point: TapPoint): boolean {
    const start = this.start;
    this.start = null;
    if (!start || point.scope !== start.scope || point.time < start.time || point.time - start.time > 250
      || Math.hypot(point.x - start.x, point.y - start.y) > 10) {
      this.previous = null;
      return false;
    }
    const previous = this.previous;
    this.previous = point;
    return Boolean(previous && previous.scope === point.scope && point.time >= previous.time
      && point.time - previous.time <= 350 && Math.hypot(point.x - previous.x, point.y - previous.y) <= 24);
  }
}

const featureGestureTargets = '.board, .scene-studio-actor-slot[data-editor-draggable="true"]';
const interactiveTargets = 'button, a, input, textarea, select, label, summary, [role="button"], [role="slider"], [contenteditable]:not([contenteditable="false"])';
const installedGuards = new WeakMap<HTMLElement, () => void>();

/** CSS remains primary; cancel only the browser default of duplicate passive taps. */
export function installRapidTapZoomGuard(root: HTMLElement): () => void {
  const installed = installedGuards.get(root);
  if (installed) return installed;
  if (typeof root.addEventListener !== 'function') return () => undefined;
  const guard = new RapidTapZoomGuard();
  const reset = () => guard.reset();
  const point = (event: TouchEvent, touch: Touch): TapPoint | null => {
    const target = event.target as Element | null;
    if (typeof target?.closest !== 'function' || !target.closest('.viewport-shell')
      || target.closest(`${featureGestureTargets}, ${interactiveTargets}`)) return null;
    const scope = target.closest('[role="dialog"], .vn-overlay, .match-help-popover, .app-screen-host > *')
      ?? target.closest('.viewport-shell');
    return scope ? { x: touch.clientX, y: touch.clientY, time: event.timeStamp, scope } : null;
  };
  root.addEventListener('touchstart', (event) => {
    guard.begin(event.touches.length === 1 ? point(event, event.touches[0]) : null);
  }, { capture: true, passive: true });
  root.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    if (!touch) reset();
    else guard.move(touch.clientX, touch.clientY, event.touches.length);
  }, { capture: true, passive: true });
  root.addEventListener('touchcancel', reset, { capture: true, passive: true });
  root.addEventListener('touchend', (event) => {
    if (event.touches.length !== 0 || event.changedTouches.length !== 1) return reset();
    const tap = point(event, event.changedTouches[0]);
    if (!tap) return reset();
    if (guard.end(tap) && event.cancelable) event.preventDefault();
  }, { capture: true, passive: false });
  installedGuards.set(root, reset);
  return reset;
}
