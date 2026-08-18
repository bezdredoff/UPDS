import { BUILD_ID } from '../appVersion';
import type { ErrorLog } from './ErrorLog';
import type { PlaytestTelemetry } from './PlaytestTelemetry';

export type PwaSnapshot = Readonly<{
  supported: boolean;
  installed: boolean;
  displayMode: 'standalone' | 'browser';
  registration: 'none' | 'installing' | 'waiting' | 'active';
  updateAvailable: boolean;
  offlineReady: boolean;
  canPromptInstall: boolean;
  online: boolean;
  scope: string;
  lane: 'stable' | 'preview' | 'local';
  publishedBuild: string;
  cacheBuild: string;
  cacheFailed: number;
}>;

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };
type PublishedBuildIdentity = Readonly<{ buildId?: unknown; buildTimestamp?: unknown }>;
type Listener = (snapshot: PwaSnapshot) => void;

const displayMode = (): 'standalone' | 'browser' => {
  const navigatorStandalone = (globalThis.navigator as Navigator & { standalone?: boolean } | undefined)?.standalone === true;
  const mediaStandalone = typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(display-mode: standalone)').matches;
  return navigatorStandalone || mediaStandalone ? 'standalone' : 'browser';
};

const laneForPath = (pathname: string): 'stable' | 'preview' | 'local' => {
  if (/\/preview\/?/.test(pathname)) return 'preview';
  if (/^https?:/.test(globalThis.location?.protocol ?? '')) return 'stable';
  return 'local';
};

export const hasPublishedBuildUpdate = (publishedBuild: string, currentBuild = BUILD_ID): boolean =>
  publishedBuild.length > 0 && publishedBuild !== currentBuild;

export class PwaController {
  private registrationHandle: ServiceWorkerRegistration | null = null;
  private installPrompt: InstallPromptEvent | null = null;
  private listeners = new Set<Listener>();
  private offlineReady = false;
  private updateAvailable = false;
  private started = false;
  private reloadOnControllerChange = false;
  private reloadRequested = false;
  private publishedBuild = BUILD_ID;
  private buildCheckSerial = 0;
  private cacheBuild = BUILD_ID;
  private cacheFailed = 0;

  constructor(private readonly errorLog: ErrorLog, private readonly telemetry: PlaytestTelemetry) {}

  snapshot(): PwaSnapshot {
    const supported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
    const registration = this.registrationHandle;
    const registrationState: PwaSnapshot['registration'] = registration?.waiting ? 'waiting' : registration?.installing ? 'installing' : registration?.active ? 'active' : 'none';
    return {
      supported,
      installed: displayMode() === 'standalone',
      displayMode: displayMode(),
      registration: registrationState,
      updateAvailable: this.updateAvailable,
      offlineReady: this.offlineReady,
      canPromptInstall: Boolean(this.installPrompt),
      online: typeof navigator === 'undefined' ? true : navigator.onLine,
      scope: registration?.scope ?? '',
      lane: laneForPath(globalThis.location?.pathname ?? ''),
      publishedBuild: this.publishedBuild,
      cacheBuild: this.cacheBuild,
      cacheFailed: this.cacheFailed,
    };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  async start(assetUrls: readonly string[]): Promise<void> {
    if (this.started) return;
    this.started = true;
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        this.installPrompt = event as InstallPromptEvent;
        this.emit();
      });
      window.addEventListener('appinstalled', () => {
        this.installPrompt = null;
        this.telemetry.track('pwa_installed');
        this.emit();
      });
      window.addEventListener('online', () => {
        this.telemetry.track('connectivity_changed', { online: true });
        void this.checkForUpdate();
        this.emit();
      });
      window.addEventListener('offline', () => { this.telemetry.track('connectivity_changed', { online: false }); this.emit(); });
    }
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || !/^https?:$/.test(globalThis.location?.protocol ?? '')) {
      this.emit();
      return;
    }
    try {
      const version = encodeURIComponent(BUILD_ID);
      const registration = await navigator.serviceWorker.register(`./sw.js?v=${version}`, { scope: './' });
      this.registrationHandle = registration;
      this.telemetry.track('pwa_registered', { scope: registration.scope, lane: laneForPath(globalThis.location?.pathname ?? '') });
      this.observeRegistration(registration);
      navigator.serviceWorker.addEventListener('message', (event) => this.onMessage(event));
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.emit();
        if (this.reloadOnControllerChange) this.reloadPage();
      });
      await navigator.serviceWorker.ready;
      this.warmCache(assetUrls);
      void registration.update().catch(() => undefined);
      await this.refreshPublishedBuild();
      this.emit();
    } catch (error) {
      this.errorLog.record('application', `PWA registration failed: ${String(error)}`);
      this.emit();
    }
  }

  async promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    const prompt = this.installPrompt;
    if (!prompt) return 'unavailable';
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') this.installPrompt = null;
      this.emit();
      return choice.outcome;
    } catch { return 'unavailable'; }
  }

  async checkForUpdate(): Promise<void> {
    await Promise.allSettled([
      this.registrationHandle?.update(),
      this.refreshPublishedBuild(),
    ]);
  }

  applyUpdate(): boolean {
    if (!this.updateAvailable) return false;
    const waiting = this.registrationHandle?.waiting;
    this.telemetry.track('pwa_update_applied', {
      currentBuild: BUILD_ID,
      publishedBuild: this.publishedBuild,
      cacheBuild: this.cacheBuild,
      waitingWorker: Boolean(waiting),
    });
    this.updateAvailable = false;
    this.emit();

    if (!waiting) {
      this.reloadPage();
      return true;
    }

    this.reloadOnControllerChange = true;
    waiting.postMessage({ type: 'SKIP_WAITING' });
    if (typeof window !== 'undefined') window.setTimeout(() => this.reloadPage(), 600);
    return true;
  }

  private observeRegistration(registration: ServiceWorkerRegistration): void {
    if (registration.waiting) void this.refreshPublishedBuild();
    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      this.emit();
      installing?.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) void this.refreshPublishedBuild();
        this.emit();
      });
    });
  }

  private async refreshPublishedBuild(): Promise<void> {
    if (typeof fetch !== 'function' || !/^https?:$/.test(globalThis.location?.protocol ?? '')) return;
    try {
      this.buildCheckSerial += 1;
      const requestSerial = this.buildCheckSerial;
      const url = new URL('./build.json', globalThis.location.href);
      url.searchParams.set('check', `${Date.now()}-${requestSerial}`);
      const response = await fetch(url.href, { cache: 'no-store' });
      if (!response.ok || requestSerial !== this.buildCheckSerial) return;
      const identity = await response.json() as PublishedBuildIdentity;
      const publishedBuild = typeof identity?.buildId === 'string' ? identity.buildId.trim() : '';
      if (!publishedBuild) return;

      const wasAvailable = this.updateAvailable;
      this.publishedBuild = publishedBuild;
      this.updateAvailable = hasPublishedBuildUpdate(publishedBuild);
      if (this.updateAvailable && !wasAvailable) {
        this.telemetry.track('pwa_update_available', { currentBuild: BUILD_ID, publishedBuild });
      }
      this.emit();
    } catch {
      // Best effort: offline/error state must never manufacture a stale update banner.
    }
  }

  private warmCache(assetUrls: readonly string[]): void {
    const worker = this.registrationHandle?.active ?? navigator.serviceWorker.controller;
    if (!worker) return;
    const resources = typeof performance !== 'undefined'
      ? performance.getEntriesByType('resource').map((entry) => entry.name).filter((url) => url.startsWith(globalThis.location?.origin ?? ''))
      : [];
    const urls = [...new Set(['./', './index.html', './manifest.webmanifest', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png', ...assetUrls, ...resources])];
    worker.postMessage({ type: 'CACHE_URLS', urls, build: BUILD_ID });
  }

  private onMessage(event: MessageEvent): void {
    const data = event.data as { type?: string; build?: string; cached?: number; failed?: number } | undefined;
    if (data?.type === 'CACHE_READY') {
      this.cacheFailed = Math.max(0, Number(data.failed) || 0);
      this.offlineReady = this.cacheFailed === 0;
      if (data.build) this.cacheBuild = data.build;
      if (this.offlineReady) this.telemetry.track('pwa_offline_ready', { cacheBuild: this.cacheBuild, cached: Number(data.cached) || 0 });
      else this.errorLog.record('application', `PWA cache warmup incomplete: ${this.cacheFailed} resource(s) failed.`);
      this.emit();
    }
  }

  private reloadPage(): void {
    if (this.reloadRequested || typeof globalThis.location?.reload !== 'function') return;
    this.reloadRequested = true;
    globalThis.location.reload();
  }

  private emit(): void {
    const snapshot = this.snapshot();
    for (const listener of this.listeners) listener(snapshot);
  }
}
