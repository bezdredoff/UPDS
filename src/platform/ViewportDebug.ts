import { BUILD_ID, BUILD_TIMESTAMP } from '../appVersion';
import type { RuntimeServices } from './RuntimeServices';
import { ViewportDebugBuffer } from './ViewportDebugBuffer';

type Detail = Readonly<Record<string, unknown>>;
type Rect = ReturnType<typeof rectOf>;
type Entry = { t: number; reason: string; detail: Detail; state: ReturnType<typeof collect> };
type EarlyEvidence = { enabled: boolean; entries: Detail[]; stop: () => void };
declare global {
  interface Window {
    __updsViewportEarly?: EarlyEvidence;
    __updsViewportDebug?: {
      capture: (reason: string, detail?: Detail) => void;
      exportJSON: () => string;
    };
  }
}

const selectors = [
  'html', 'body', '#app', '.viewport-shell', '.phone', '.vn-screen',
  '.vn-background-stack', '.vn-background', '.vn-vignette', '.vn-topbar',
  '.stage', '.portrait', '.portrait img', '.dialogue-shell', '.dialogue',
  '.dialogue-text', '.vn-controls', '.vn-controls button', '.pwa-update-banner',
];
const properties = [
  'display', 'position', 'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'top', 'right', 'bottom', 'left', 'overflow', 'overflow-x', 'overflow-y',
  'padding', 'margin', 'border-width', 'box-sizing', 'grid-template-rows', 'grid-template-columns',
  'gap', 'align-items', 'background', 'background-color', 'background-image',
  'transform', 'transform-origin', 'scale', 'zoom', 'font-family', 'font-size', 'line-height',
  '-webkit-text-size-adjust', 'text-size-adjust', 'filter', 'backdrop-filter', 'opacity',
  'z-index', 'isolation', 'contain', 'clip-path', 'object-fit', 'object-position',
  'animation-name', 'animation-duration', 'transition-property',
];
const tokens = [
  '--upds-viewport-height', '--physical-viewport-height', '--upds-vn-dialogue-row',
  '--upds-vn-controls-min-height', '--upds-vn-status-offset',
  '--safe-area-top', '--safe-area-right', '--safe-area-bottom', '--safe-area-left',
  '--vn-dialogue-row', '--vn-controls-min-height', '--portrait-height', '--portrait-bottom',
  '--character-scale', '--character-y', '--upds-system-canvas-color',
];
const round = (value: number): number => Math.round(value * 1000) / 1000;
const rectOf = (node: Element) => {
  const r = node.getBoundingClientRect();
  return { top: round(r.top), right: round(r.right), bottom: round(r.bottom), left: round(r.left), width: round(r.width), height: round(r.height) };
};
const stylesOf = (style: CSSStyleDeclaration, names = properties) =>
  Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name).trim()]));
const nodeIds = new WeakMap<Element, number>();
let nextNodeId = 0;
const identify = (node: Element): string => {
  if (!nodeIds.has(node)) nodeIds.set(node, ++nextNodeId);
  return `${node.tagName.toLowerCase()}${node.id ? `#${node.id}` : ''}.${[...node.classList].join('.')}@${nodeIds.get(node)}`;
};
const describe = (node: Element) => ({
  node: identify(node), rect: rectOf(node), style: stylesOf(getComputedStyle(node)),
  tokens: stylesOf(getComputedStyle(node), tokens),
  before: stylesOf(getComputedStyle(node, '::before'), ['content', ...properties]),
  after: stylesOf(getComputedStyle(node, '::after'), ['content', ...properties]),
  client: { width: node.clientWidth, height: node.clientHeight },
  scroll: { width: node.scrollWidth, height: node.scrollHeight, top: node.scrollTop, left: node.scrollLeft },
  image: node instanceof HTMLImageElement ? {
    src: node.currentSrc || node.src, complete: node.complete, naturalWidth: node.naturalWidth,
    naturalHeight: node.naturalHeight, decoding: node.decoding,
  } : null,
});

let recorder: ReturnType<typeof createRecorder> | undefined;
let pwa: unknown = null;
let registration: ServiceWorkerRegistration | null = null;
let probeHost: HTMLElement;
const probes = new Map<string, HTMLElement>();
const media = new Map<string, MediaQueryList>();
let lastBrowserEvent: Detail | null = null;
let lastRender: Detail | null = null;

function collect() {
  const root = document.documentElement;
  const vv = window.visualViewport;
  const worker = (value: ServiceWorker | null | undefined) => value ? { state: value.state, scriptURL: value.scriptURL } : null;
  const safe = getComputedStyle(probes.get('safe')!);
  const elements = Object.fromEntries(selectors.map((selector) => [selector, [...document.querySelectorAll(selector)].map(describe)]));
  const phoneBottom = document.querySelector('.phone')?.getBoundingClientRect().bottom;
  // Hit testing cannot see OS/compositor pixels. Out-of-range points are deliberately retained.
  const sampleY = [...new Set([innerHeight - 1, (vv?.height ?? innerHeight) - 1, screen.height - 1, ...(phoneBottom ? [phoneBottom - 1, phoneBottom - 20, phoneBottom - 40] : [])])];
  const bottomHits = sampleY.map((y) => ({
    x: innerWidth / 2, y,
    outsideLayoutViewport: y >= root.clientHeight,
    stack: document.elementsFromPoint(innerWidth / 2, y).filter((node) => !node.closest('[data-viewport-debug]')).map(identify),
  }));
  return {
    buildId: BUILD_ID, screen: { width: screen.width, height: screen.height, availWidth: screen.availWidth, availHeight: screen.availHeight },
    inner: { width: innerWidth, height: innerHeight }, client: { width: root.clientWidth, height: root.clientHeight },
    scroll: { x: scrollX, y: scrollY }, devicePixelRatio,
    visualViewport: vv ? { width: vv.width, height: vv.height, offsetTop: vv.offsetTop, offsetLeft: vv.offsetLeft, pageTop: vv.pageTop, pageLeft: vv.pageLeft, scale: vv.scale } : null,
    cssHeights: Object.fromEntries(['vh', 'dvh', 'svh', 'lvh'].map((unit) => [unit, { supported: CSS.supports('height', `100${unit}`), height: rectOf(probes.get(unit)!).height }])),
    safeArea: { top: safe.paddingTop, right: safe.paddingRight, bottom: safe.paddingBottom, left: safe.paddingLeft },
    display: { navigatorStandalone: (navigator as Navigator & { standalone?: boolean }).standalone ?? null, mediaStandalone: matchMedia('(display-mode: standalone)').matches, rootMode: root.dataset.updsDisplayMode ?? null },
    orientation: { type: screen.orientation?.type, angle: screen.orientation?.angle, legacy: window.orientation },
    fonts: document.fonts?.status, language: root.lang, visibility: document.visibilityState, focused: document.hasFocus(), online: navigator.onLine,
    rootStyle: root.getAttribute('style'), rootTokens: stylesOf(getComputedStyle(root), tokens),
    serviceWorker: { controller: worker(navigator.serviceWorker?.controller), registrationKnown: Boolean(registration), scope: registration?.scope, waiting: worker(registration?.waiting), installing: worker(registration?.installing), active: worker(registration?.active) },
    pwa, elements, bottomHits, media: Object.fromEntries([...media].map(([query, list]) => [query, list.matches])),
    lastBrowserEvent, lastRender,
  };
}

/** No work or stack allocation when the recorder is disabled. Never throws into gameplay. */
export function viewportDebugEvent(reason: string, detail: Detail = {}, stack = false): void {
  if (!recorder) return;
  const event = stack ? { ...detail, stack: new Error(reason).stack } : detail;
  if (stack) lastRender = { t: performance.now(), reason, ...event };
  recorder.capture(reason, event);
}

export function viewportDebugServices(services: RuntimeServices): void {
  if (!recorder) return;
  services.pwa.subscribe((snapshot) => {
    pwa = snapshot;
    viewportDebugEvent('pwa:snapshot');
  });
  services.localization.subscribe((locale) => viewportDebugEvent('localization:change', { locale }));
}

/** Observe the registration returned by the existing call; do not register/update another SW. */
export function viewportDebugRegistration(value: ServiceWorkerRegistration): void {
  if (!recorder) return;
  registration = value;
  const seen = new WeakSet<ServiceWorker>();
  const watch = () => {
    for (const worker of [value.active, value.installing, value.waiting]) {
      if (!worker || seen.has(worker)) continue;
      seen.add(worker);
      worker.addEventListener('statechange', () => {
        viewportDebugEvent('sw:statechange', { state: worker.state, scriptURL: worker.scriptURL });
        watch();
      });
    }
  };
  watch();
  value.addEventListener('updatefound', () => { watch(); viewportDebugEvent('sw:updatefound'); });
  viewportDebugEvent('sw:registration');
}

function createRecorder() {
  const started = performance.now();
  const buffer = new ViewportDebugBuffer<Entry>(started);
  const events = new ViewportDebugBuffer<{ t: number; reason: string; detail: Detail }>(started, 2048);
  const errors: string[] = [];
  const previous = new Map<string, { node: string; rect: Rect }>();
  let capturing = false;
  let panel: HTMLElement;
  let summary: HTMLElement;
  let marked: { before?: Entry; after: Entry } | null = null;
  let pending = false;
  const capture = (reason: string, detail: Detail = {}) => {
    if (capturing) return;
    capturing = true;
    try {
      const t = performance.now();
      const state = collect();
      const changes: Detail[] = [];
      const current = new Set<string>();
      for (const [selector, nodes] of Object.entries(state.elements)) {
        nodes.forEach((node, index) => {
          const key = `${selector}[${index}]`;
          current.add(key);
          const old = previous.get(key);
          if (!old || old.node !== node.node || JSON.stringify(old.rect) !== JSON.stringify(node.rect)) {
            changes.push({ selector: key, old: old ?? null, new: { node: node.node, rect: node.rect } });
          }
          previous.set(key, { node: node.node, rect: node.rect });
        });
      }
      for (const [key, old] of previous) {
        if (current.has(key)) continue;
        changes.push({ selector: key, old, new: null });
        previous.delete(key);
      }
      const entry: Entry = { t, reason, detail: { ...detail, changes, captureDurationMs: round(performance.now() - t) }, state };
      if (reason === 'user:rescale') marked = { before: buffer.recent[buffer.recent.length - 1], after: entry };
      buffer.push(entry);
      events.push({ t, reason, detail });
      if (summary) {
        const stage = state.elements['.stage'][0]?.rect.height ?? '-';
        const portrait = state.elements['.portrait'][0]?.rect.height ?? '-';
        summary.textContent = `${(t / 1000).toFixed(1)}s ${state.display.rootMode ?? '?'} · stage ${stage} / portrait ${portrait}\ninner ${innerHeight} · shell ${state.elements['.viewport-shell'][0]?.rect.height ?? '-'} · ${reason}`;
      }
    } catch (error) {
      if (errors.length < 20) errors.push(String(error));
    } finally { capturing = false; }
  };
  const queue = (reason: string, detail: Detail = {}) => {
    events.push({ t: performance.now(), reason, detail });
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; capture(`after:${reason}`); });
  };
  const exportJSON = () => {
    // Computed declarations dominate the trace. Intern identical style records
    // in the export, retaining exact values without megabytes of repetition.
    const styles: Detail[] = [];
    const styleIds = new Map<string, number>();
    const payload = {
    schema: 'upds-viewport-debug-v1', buildId: BUILD_ID, buildTimestamp: BUILD_TIMESTAMP,
    started, timeOrigin: performance.timeOrigin, exportedAt: new Date().toISOString(),
    url: `${location.origin}${location.pathname}`, userAgent: navigator.userAgent,
    statusBar: document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.getAttribute('content'),
    viewportMeta: document.querySelector('meta[name="viewport"]')?.getAttribute('content'),
    early: window.__updsViewportEarly?.entries ?? [],
    stylesheets: [...document.styleSheets].map((sheet) => ({ href: sheet.href, disabled: sheet.disabled })),
    resources: performance.getEntriesByType('resource').map((entry) => ({ name: entry.name, startTime: entry.startTime, duration: entry.duration })),
    startup: buffer.startup, recent: buffer.recent.filter((entry) => !buffer.startup.includes(entry)), events, marked, errors,
    dropped: { startup: buffer.droppedStartup, recent: buffer.droppedRecent },
    limitations: ['DOM hit tests are not compositor pixel evidence.', 'Readbacks/observers add overhead; compare an uninstrumented run.', 'Native image decode completion has no passive DOM event; load, natural size and resource timing are recorded.'],
    };
    const packed = JSON.parse(JSON.stringify(payload, (key, value) => {
      if (!['style', 'tokens', 'before', 'after', 'rootTokens'].includes(key) || !value || typeof value !== 'object' || 'state' in value || 'rect' in value) return value;
      const serialized = JSON.stringify(value);
      let id = styleIds.get(serialized);
      if (id === undefined) { id = styles.length; styleIds.set(serialized, id); styles.push(value); }
      return { styleRef: id };
    }));
    return JSON.stringify({ ...packed, styles });
  };

  const observed = new Set<Element>();
  const ro = new ResizeObserver((entries) => queue('ResizeObserver', { nodes: entries.map((entry) => ({ node: identify(entry.target), rect: rectOf(entry.target) })), lastBrowserEvent, lastRender }));
  const refreshObservers = () => {
    for (const node of observed) {
      if (node.isConnected) continue;
      ro.unobserve(node);
      observed.delete(node);
    }
    for (const selector of selectors) {
      for (const node of document.querySelectorAll(selector)) {
        if (observed.has(node)) continue;
        observed.add(node);
        ro.observe(node);
      }
    }
  };
  const mo = new MutationObserver((records) => {
    const relevant = records.filter((record) => !(record.target instanceof Element ? record.target : record.target.parentElement)?.closest('[data-viewport-debug]'));
    if (!relevant.length) return;
    refreshObservers();
    queue('MutationObserver', { mutations: relevant.slice(0, 60).map((record) => ({
      target: record.target instanceof Element ? identify(record.target) : record.target.nodeName,
      type: record.type, attribute: record.attributeName, oldValue: record.oldValue,
      newValue: record.attributeName && record.target instanceof Element ? record.target.getAttribute(record.attributeName) : null,
      added: [...record.addedNodes].filter((node): node is Element => node instanceof Element).map(identify),
      removed: [...record.removedNodes].filter((node): node is Element => node instanceof Element).map(identify),
    })) });
  });
  mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeOldValue: true });
  refreshObservers();

  const browserEvent = (target: EventTarget, name: string, prefix: string) => target.addEventListener(name, (event) => {
    lastBrowserEvent = { t: performance.now(), name: `${prefix}:${name}`, persisted: event instanceof PageTransitionEvent ? event.persisted : undefined };
    capture(`${prefix}:${name}`);
  }, { passive: true, capture: true });
  for (const name of ['resize', 'orientationchange', 'pageshow', 'pagehide', 'focus', 'blur', 'online', 'offline', 'load']) browserEvent(window, name, 'window');
  for (const name of ['visibilitychange', 'DOMContentLoaded']) browserEvent(document, name, 'document');
  for (const name of ['resize', 'scroll']) if (visualViewport) browserEvent(visualViewport, name, 'visualViewport');
  if (screen.orientation) browserEvent(screen.orientation, 'change', 'orientation');
  for (const name of ['loading', 'loadingdone', 'loadingerror']) if (document.fonts) browserEvent(document.fonts, name, 'fonts');
  void document.fonts?.ready.then(() => capture('fonts:ready'));
  if (navigator.serviceWorker) {
    browserEvent(navigator.serviceWorker, 'controllerchange', 'sw');
    navigator.serviceWorker.addEventListener('message', (event) => queue('sw:message', { type: event.data?.type, build: event.data?.build, cached: event.data?.cached, failed: event.data?.failed }));
    void navigator.serviceWorker.getRegistration().then((value) => {
      if (value && !registration) viewportDebugRegistration(value);
    }).catch((error) => queue('sw:inspection-error', { error: String(error) }));
  }
  for (const name of ['load', 'error']) document.addEventListener(name, (event) => {
    if (event.target instanceof HTMLImageElement) queue(`image:${name}`, { node: identify(event.target), src: event.target.currentSrc || event.target.src, naturalWidth: event.target.naturalWidth, naturalHeight: event.target.naturalHeight });
  }, true);
  // Enumerate actual loaded CSS media conditions, including legacy feature files.
  const readMedia = (rules: CSSRuleList) => {
    for (const rule of rules) {
      if (rule instanceof CSSMediaRule && !media.has(rule.conditionText)) {
        const list = matchMedia(rule.conditionText);
        media.set(rule.conditionText, list);
        list.addEventListener('change', () => { lastBrowserEvent = { t: performance.now(), name: 'media:change', query: rule.conditionText }; capture('media:change', { query: rule.conditionText, matches: list.matches }); });
      }
      if ('cssRules' in rule) readMedia((rule as CSSGroupingRule).cssRules);
    }
  };
  for (const sheet of document.styleSheets) {
    try { readMedia(sheet.cssRules); } catch { errors.push(`Unreadable stylesheet: ${sheet.href}`); }
  }

  panel = document.createElement('aside');
  panel.dataset.viewportDebug = 'overlay';
  panel.style.cssText = 'position:fixed;z-index:2147483647;top:35%;right:4px;width:245px;max-width:90vw;contain:layout style;pointer-events:none';
  const shadow = panel.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<style>:host{font:11px/1.3 monospace;color:white}section{background:#111e;padding:6px;border:1px solid #bbb;border-radius:5px}p{margin:0 0 4px;white-space:pre-wrap}button{pointer-events:auto;font:11px sans-serif;min-height:32px;padding:4px;margin:2px}textarea{pointer-events:auto;width:95%;height:100px;font:16px monospace}</style><section><p>Viewport recorder · ${BUILD_ID}</p><p id="summary"></p><button id="mark">Mark rescale</button><button id="copy">Copy debug JSON</button><button id="hide">Hide overlay</button><button id="off">Disable next launch</button><p id="status"></p></section>`;
  summary = shadow.querySelector<HTMLElement>('#summary')!;
  shadow.querySelector('#mark')!.addEventListener('click', () => capture('user:rescale'));
  shadow.querySelector('#hide')!.addEventListener('click', () => {
    const section = shadow.querySelector('section')!;
    section.hidden = !section.hidden;
    if (!shadow.querySelector('#show')) {
      const show = document.createElement('button');
      show.id = 'show'; show.textContent = 'Viewport debug';
      show.onclick = () => { section.hidden = false; show.remove(); };
      shadow.append(show);
    }
  });
  shadow.querySelector('#off')!.addEventListener('click', () => {
    try { localStorage.removeItem(`upds-viewport-debug:${new URL('.', location.href).pathname}`); } catch { /* Storage may be disabled. */ }
    shadow.querySelector('#status')!.textContent = 'Disabled next launch; remove viewportdebug=1 from URL.';
  });
  shadow.querySelector('#copy')!.addEventListener('click', () => {
    capture('user:copy');
    const json = exportJSON();
    const fallback = () => {
      let area = shadow.querySelector('textarea');
      if (!area) { area = document.createElement('textarea'); shadow.append(area); }
      area.value = json; area.focus(); area.select();
      shadow.querySelector('#status')!.textContent = 'Clipboard unavailable: select all and copy below.';
    };
    if (!navigator.clipboard?.writeText) { fallback(); return; }
    void navigator.clipboard.writeText(json).then(() => { shadow.querySelector('#status')!.textContent = 'Copied'; }).catch(fallback);
  });
  document.body.append(panel);
  // Shadow DOM mutations cannot recursively feed the document observer.
  capture('bootstrap:immediate');
  const frameStart = performance.now();
  const frame = () => { capture('startup:rAF'); if (performance.now() - frameStart < 1000) requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
  for (const delay of [250, 500, 1000, 2000, 5000, 10000, 15000, 30000]) setTimeout(() => capture(`startup:${delay}ms`), delay);
  // Continue after startup: user may enter VN much later than bootstrap.
  setInterval(() => capture('sample:500ms'), 500);
  return { capture, exportJSON };
}

export function startViewportDebug(): void {
  if (typeof window === 'undefined' || !window.__updsViewportEarly?.enabled || recorder) return;
  window.__updsViewportEarly.stop();
  probeHost = document.createElement('div');
  probeHost.dataset.viewportDebug = 'probes';
  probeHost.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none;contain:strict';
  const shadow = probeHost.attachShadow({ mode: 'closed' });
  for (const unit of ['vh', 'dvh', 'svh', 'lvh', 'safe']) {
    const probe = document.createElement('div');
    probe.style.cssText = unit === 'safe'
      ? 'position:absolute;width:0;height:0;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)'
      : `position:absolute;width:1px;height:100${unit}`;
    shadow.append(probe);
    probes.set(unit, probe);
  }
  document.body.append(probeHost);
  try {
    recorder = createRecorder();
    window.__updsViewportDebug = recorder;
  } catch (error) {
    // Debug failure must not prevent application bootstrap.
    window.__updsViewportEarly.entries.push({ t: performance.now(), error: String(error) });
  }
}
