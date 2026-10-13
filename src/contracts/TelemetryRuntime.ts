/** Events shared by gameplay and platform integrations. */
export type TelemetryEventName =
  | 'session_start' | 'session_end' | 'screen_view'
  | 'vn_line' | 'vn_paging' | 'vn_skip' | 'vn_auto' | 'vn_log_open'
  | 'choice_selected'
  | 'match_start' | 'match_move' | 'match_hint' | 'match_tutorial' | 'match_reaction' | 'match_end'
  | 'vertical_slice_complete'
  | 'pwa_registered' | 'pwa_offline_ready' | 'pwa_update_available' | 'pwa_update_applied' | 'pwa_installed' | 'connectivity_changed';

/** Event sink consumed by features and platform lifecycle controllers. */
export interface TelemetryRuntime {
  track(name: TelemetryEventName, data?: Readonly<Record<string, unknown>>): void;
  trackScreen(screen: string, detail?: string): void;
}
