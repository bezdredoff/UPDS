import { APP_VERSION, BUILD_ID, BUILD_LABEL, BUILD_TIMESTAMP } from '../appVersion';
import type { AudioScene } from '../audio/MusicTheme';
import type { AudioSettings } from '../audio/AudioSettings';
import { ANM009_SAVE_KEY, SAVE_SCHEMA_VERSION, type CampaignSave, type SaveLoadReport } from '../engine/CampaignStore';
import type { AssetHealth } from './AssetHealth';
import type { ErrorLog } from './ErrorLog';
import type { StorageMode } from './SafeStorage';
import type { PlaytestSummary } from './PlaytestTelemetry';
import type { PwaSnapshot } from './PwaController';

export type DiagnosticsContext = Readonly<{
  save: CampaignSave;
  storageMode: StorageMode;
  loadReport: SaveLoadReport;
  recoveryBackup: unknown | null;
  errorLog: ErrorLog;
  assetHealth: AssetHealth;
  audio: Readonly<{ supported: boolean; hapticsSupported: boolean; scene: AudioScene; settings: AudioSettings }>;
  playtest: Readonly<{ schemaVersion: number; eventCount: number; sessionId: string; summary: PlaytestSummary }>;
  pwa: PwaSnapshot;
}>;

export const createDiagnosticsSnapshot = (context: DiagnosticsContext): unknown => ({
  product: 'Project UPDS / Детективы класса U',
  generatedAt: new Date().toISOString(),
  build: { appVersion: APP_VERSION, label: BUILD_LABEL, buildId: BUILD_ID, buildTimestamp: BUILD_TIMESTAMP },
  save: {
    saveKey: ANM009_SAVE_KEY,
    schemaVersion: SAVE_SCHEMA_VERSION,
    storageMode: context.storageMode,
    loadReport: context.loadReport,
    state: context.save,
    recoveryBackup: context.recoveryBackup,
  },
  assets: context.assetHealth.snapshot(),
  audio: context.audio,
  playtest: context.playtest,
  pwa: context.pwa,
  errors: context.errorLog.getEntries(),
  environment: {
    path: globalThis.location?.pathname ?? 'unknown',
    href: globalThis.location?.href ?? 'unknown',
    userAgent: globalThis.navigator?.userAgent ?? 'unknown',
    language: globalThis.navigator?.language ?? 'unknown',
    online: globalThis.navigator?.onLine ?? true,
    viewport: {
      width: globalThis.innerWidth ?? 0,
      height: globalThis.innerHeight ?? 0,
      devicePixelRatio: globalThis.devicePixelRatio ?? 1,
    },
    reducedMotion: typeof globalThis.matchMedia === 'function' ? globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
  },
});
