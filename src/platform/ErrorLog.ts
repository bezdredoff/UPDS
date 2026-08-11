import type { StorageLike } from './SafeStorage';
import { getSafeStorage } from './SafeStorage';

export type ErrorLogSource = 'window-error' | 'unhandled-rejection' | 'application' | 'asset';

export type ErrorLogEntry = Readonly<{
  timestamp: string;
  source: ErrorLogSource;
  message: string;
  stack?: string;
}>;

export const ERROR_LOG_STORAGE_KEY = 'seiran-detectives-error-log-v1';
export const ERROR_LOG_MAX_ENTRIES = 50;

const safeMessage = (value: unknown): string => {
  if (value instanceof Error) return value.message;
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch { return String(value); }
};

const safeStack = (value: unknown): string | undefined => (
  value instanceof Error && value.stack ? value.stack : undefined
);

const isEntry = (value: unknown): value is ErrorLogEntry => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entry = value as Partial<ErrorLogEntry>;
  return typeof entry.timestamp === 'string'
    && ['window-error', 'unhandled-rejection', 'application', 'asset'].includes(String(entry.source))
    && typeof entry.message === 'string'
    && (entry.stack === undefined || typeof entry.stack === 'string');
};

export class ErrorLog {
  private entries: ErrorLogEntry[];

  constructor(private readonly storage: StorageLike = getSafeStorage().storage) {
    this.entries = this.load();
  }

  record(source: ErrorLogSource, error: unknown): void {
    this.entries.push({ timestamp: new Date().toISOString(), source, message: safeMessage(error), stack: safeStack(error) });
    this.entries = this.entries.slice(-ERROR_LOG_MAX_ENTRIES);
    this.persist();
  }

  getEntries(): readonly ErrorLogEntry[] { return [...this.entries]; }

  clear(): void {
    this.entries = [];
    try { this.storage.removeItem(ERROR_LOG_STORAGE_KEY); } catch { /* diagnostics cleanup must not affect gameplay */ }
  }

  private load(): ErrorLogEntry[] {
    try {
      const raw = this.storage.getItem(ERROR_LOG_STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isEntry).slice(-ERROR_LOG_MAX_ENTRIES) : [];
    } catch { return []; }
  }

  private persist(): void {
    try { this.storage.setItem(ERROR_LOG_STORAGE_KEY, JSON.stringify(this.entries)); } catch { /* never break gameplay */ }
  }
}

export const installGlobalErrorHandlers = (log: ErrorLog): (() => void) => {
  const onError = (event: ErrorEvent): void => log.record('window-error', event.error ?? event.message);
  const onRejection = (event: PromiseRejectionEvent): void => log.record('unhandled-rejection', event.reason);
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
};
