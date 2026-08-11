export type DialogueRenderedFit = Readonly<{
  fits: (candidate: string) => boolean;
  width: number;
  height: number;
  lineHeight: number;
  dispose: () => void;
}>;

const numeric = (value: string, fallback: number): number => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const isUsableDialogueViewport = (width: number, height: number, lineHeight: number): boolean => {
  if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isFinite(lineHeight)) return false;
  if (width < 120 || lineHeight < 8) return false;
  return height >= Math.max(44, lineHeight * 1.8);
};

const copiedProperties = [
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'font-stretch',
  'font-variant',
  'line-height',
  'letter-spacing',
  'word-spacing',
  'text-transform',
  'text-indent',
  'white-space',
  'overflow-wrap',
  'word-break',
  'line-break',
  'hyphens',
  'tab-size',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'box-sizing',
] as const;

/**
 * Creates an isolated text measurer with the exact rendered width/font of the
 * visible dialogue viewport. The visible element is never mutated while the
 * paginator probes candidate strings, so its flex/grid height cannot collapse
 * and poison the fit predicate.
 */
export const createDialogueRenderedFit = (source: HTMLElement, reservePx = 3): DialogueRenderedFit | null => {
  if (typeof document === 'undefined' || typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') return null;

  const computed = window.getComputedStyle(source);
  const width = source.clientWidth;
  const height = source.clientHeight;
  const fontSize = numeric(computed.fontSize, 16);
  const lineHeight = numeric(computed.lineHeight, fontSize * 1.42);
  if (!isUsableDialogueViewport(width, height, lineHeight)) return null;

  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.lang = source.lang || document.documentElement?.lang || '';
  probe.style.position = 'fixed';
  probe.style.left = '-100000px';
  probe.style.top = '0';
  probe.style.zIndex = '-2147483647';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.display = 'block';
  probe.style.width = `${width}px`;
  probe.style.height = 'auto';
  probe.style.minHeight = '0';
  probe.style.maxHeight = 'none';
  probe.style.margin = '0';
  probe.style.border = '0';
  probe.style.overflow = 'visible';

  for (const property of copiedProperties) {
    const value = computed.getPropertyValue(property);
    if (value) probe.style.setProperty(property, value);
  }

  (document.body ?? document.documentElement).appendChild(probe);
  const safeHeight = Math.max(lineHeight, height - Math.max(0, reservePx));

  return {
    width,
    height,
    lineHeight,
    fits: (candidate: string): boolean => {
      probe.textContent = candidate;
      return probe.scrollHeight <= safeHeight && probe.scrollWidth <= width + 1;
    },
    dispose: () => probe.remove(),
  };
};
