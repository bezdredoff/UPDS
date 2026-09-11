import { resolveDisplayMode, resolveRuntimeLane, type RuntimeDisplayMode, type RuntimeLane } from './PlatformIdentity';

export const VIEWPORT_EVIDENCE_UNITS = ['vh', 'dvh', 'svh', 'lvh'] as const;
export type ViewportEvidenceUnit = (typeof VIEWPORT_EVIDENCE_UNITS)[number];

export type ViewportEvidence = Readonly<{
  screen: Readonly<{ width: number; height: number; availWidth: number; availHeight: number }>;
  inner: Readonly<{ width: number; height: number }>;
  client: Readonly<{ width: number; height: number }>;
  visualViewport: Readonly<{
    width: number;
    height: number;
    offsetTop: number;
    offsetLeft: number;
    pageTop: number;
    pageLeft: number;
    scale: number;
  }> | null;
  cssHeights: Readonly<Record<ViewportEvidenceUnit, Readonly<{ supported: boolean; height: number }>>>;
  safeArea: Readonly<{ top: string; right: string; bottom: string; left: string }>;
  display: Readonly<{
    navigatorStandalone: boolean | null;
    mediaStandalone: boolean;
    rootMode: string | null;
    resolvedMode: RuntimeDisplayMode;
    lane: RuntimeLane;
  }>;
  orientation: Readonly<{ type?: OrientationType; angle?: number; legacy?: number }>;
}>;

let probeHost: HTMLElement | null = null;
const probes = new Map<ViewportEvidenceUnit | 'safe', HTMLElement>();

const finiteNumber = (value: number | null | undefined): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const round = (value: number): number => Math.round(value * 1000) / 1000;

const ensureProbes = (): void => {
  if (typeof document === 'undefined' || !document.body) return;
  if (probeHost?.isConnected && probes.size === VIEWPORT_EVIDENCE_UNITS.length + 1) return;

  probes.clear();
  probeHost = document.createElement('div');
  probeHost.dataset.viewportDebug = 'evidence-probes';
  probeHost.setAttribute('aria-hidden', 'true');
  probeHost.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none;contain:strict';
  const shadow = probeHost.attachShadow({ mode: 'closed' });

  for (const unit of VIEWPORT_EVIDENCE_UNITS) {
    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;width:1px;height:100${unit}`;
    shadow.append(probe);
    probes.set(unit, probe);
  }

  const safe = document.createElement('div');
  safe.style.cssText = 'position:absolute;width:0;height:0;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
  shadow.append(safe);
  probes.set('safe', safe);
  document.body.append(probeHost);
};

/** Prepare the shared measurement probes before observers are installed. */
export const prepareViewportEvidence = (): void => ensureProbes();

/**
 * Read-only viewport/platform evidence used by QA diagnostics and the recorder.
 * It never writes runtime geometry tokens or participates in layout decisions.
 */
export const collectViewportEvidence = (): ViewportEvidence => {
  ensureProbes();

  const root = typeof document !== 'undefined' ? document.documentElement : undefined;
  const viewport = globalThis.visualViewport;
  const screenValue = globalThis.screen;
  const navigatorStandaloneValue =
    (globalThis.navigator as Navigator & { standalone?: boolean } | undefined)?.standalone;
  const navigatorStandalone = typeof navigatorStandaloneValue === 'boolean' ? navigatorStandaloneValue : null;
  const mediaStandalone =
    typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(display-mode: standalone)').matches;
  const cssHeights = {} as Record<ViewportEvidenceUnit, { supported: boolean; height: number }>;

  for (const unit of VIEWPORT_EVIDENCE_UNITS) {
    const probe = probes.get(unit);
    cssHeights[unit] = {
      supported: typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
        ? CSS.supports('height', `100${unit}`)
        : false,
      height: probe ? round(probe.getBoundingClientRect().height) : 0,
    };
  }

  const safeProbe = probes.get('safe');
  const safeStyle = safeProbe && typeof getComputedStyle === 'function' ? getComputedStyle(safeProbe) : null;
  const displaySignals = { navigatorStandalone: navigatorStandalone === true, mediaStandalone };

  return {
    screen: {
      width: finiteNumber(screenValue?.width),
      height: finiteNumber(screenValue?.height),
      availWidth: finiteNumber(screenValue?.availWidth),
      availHeight: finiteNumber(screenValue?.availHeight),
    },
    inner: { width: finiteNumber(globalThis.innerWidth), height: finiteNumber(globalThis.innerHeight) },
    client: { width: finiteNumber(root?.clientWidth), height: finiteNumber(root?.clientHeight) },
    visualViewport: viewport ? {
      width: viewport.width,
      height: viewport.height,
      offsetTop: viewport.offsetTop,
      offsetLeft: viewport.offsetLeft,
      pageTop: viewport.pageTop,
      pageLeft: viewport.pageLeft,
      scale: viewport.scale,
    } : null,
    cssHeights,
    safeArea: {
      top: safeStyle?.paddingTop || 'n/a',
      right: safeStyle?.paddingRight || 'n/a',
      bottom: safeStyle?.paddingBottom || 'n/a',
      left: safeStyle?.paddingLeft || 'n/a',
    },
    display: {
      navigatorStandalone,
      mediaStandalone,
      rootMode: root?.dataset.updsDisplayMode ?? null,
      resolvedMode: resolveDisplayMode(displaySignals),
      lane: resolveRuntimeLane(),
    },
    orientation: {
      type: screenValue?.orientation?.type,
      angle: screenValue?.orientation?.angle,
      legacy: typeof window !== 'undefined' ? window.orientation : undefined,
    },
  };
};
