import type { BackgroundKey } from './narrative';

export const match3BoardSurfaceKeys = [
  'locker-bench',
  'photo-contact-sheet',
  'pool-service-tile',
  'ordered-cabinet',
  'meeting-grid',
  'locker-columns',
  'workbench-clusters',
  'signal-cross',
  'service-lanes',
  'archive-rows',
  'ordered-grid',
] as const;
export type Match3BoardSurfaceKey = typeof match3BoardSurfaceKeys[number];

export const match3BoardFrameKeys = [
  'evidence-file',
  'photo-file',
  'wet-service',
  'precision-file',
  'audit-file',
  'service-file',
  'workshop-file',
  'lab-file',
  'warehouse-file',
  'maintenance-file',
] as const;
export type Match3BoardFrameKey = typeof match3BoardFrameKeys[number];

export const match3NarrativeProfileKeys = [
  'locker-search',
  'photo-alibi',
  'pool-laundry',
  'ordered-inspection',
  'laundry-cadence',
  'basketball-repair',
  'post-repair-seam',
  'asterion-thread',
  'missing-package-ranges',
  'night-containers',
  'control-sample-gear',
  'lab-transfer-chain',
  'second-skin-tag',
  'pilot-participant-codes',
  'rina-pretheft-search',
  'consent-note-route',
  'post-rina-activation',
  'rina-catalog',
  'continued-project-proof',
  'private-return',
  'server-consent-logs',
  'convenient-case',
] as const;
export type Match3NarrativeProfileKey = typeof match3NarrativeProfileKeys[number];

export const match3TilePresentationProfileKeys = [
  'locker-laundry',
  'photo-props',
  'pool-service',
  'ordered-return',
  'meeting-reports',
  'basketball-service',
  'textile-workshop',
  'asterion-lab',
  'lost-found',
  'maintenance-service',
  'karate-control',
  'asterion-transfer',
  'second-skin-signal',
  'kendo-pilot',
  'kubo-atelier',
  'abandoned-laundry',
  'gymnastics-scanner',
  'rina-archive',
  'final-timeline',
  'private-return',
  'server-logs',
  'convenient-presentation',
] as const;
export type Match3TilePresentationProfileKey = typeof match3TilePresentationProfileKeys[number];

export type Match3CharacterKey = 'miku' | 'onoe' | 'ayuki' | 'emi' | 'kentaro' | 'norihiro' | 'mayu' | 'hinata' | 'rina' | 'kurose' | 'gen' | 'aoi' | 'kubo' | 'kubo-mother' | 'vincent';
export type Match3SourceSceneId =
  | 'VN_SCENE_01_E0_PRE'
  | 'VN_SCENE_03_E1_PRE'
  | 'VN_SCENE_05_E2_PRE'
  | 'VN_SCENE_07_E3_PRE'
  | 'VN_SCENE_09_E4_PRE'
  | 'VN_SCENE_11_E5_PRE'
  | 'VN_SCENE_13_E6_PRE'
  | 'VN_SCENE_15_E7_PRE'
  | 'VN_SCENE_17_E8_PRE'
  | 'VN_SCENE_19_E9_PRE'
  | 'VN_SCENE_21_E10_PRE'
  | 'VN_SCENE_23_E11_PRE'
  | 'VN_SCENE_25_E12_PRE'
  | 'VN_SCENE_27_E13_PRE'
  | 'VN_SCENE_29_E14_PRE'
  | 'VN_SCENE_31_E15_PRE'
  | 'VN_SCENE_33_E16_PRE'
  | 'VN_SCENE_35_E17_PRE'
  | 'VN_SCENE_37_E18_PRE'
  | 'VN_SCENE_39_E19_PRE'
  | 'VN_SCENE_41_E20_PRE'
  | 'VN_SCENE_43_E21_PRE';

export type Match3LevelContext = Readonly<{
  /** VN scene that directly hands off into this Match-3 level. */
  sourceSceneId: Match3SourceSceneId;
  /** Full-page/environment background behind all Match-3 UI. */
  pageBackground: BackgroundKey;
  /** Local surface directly underneath the grid cells. */
  boardSurface: Match3BoardSurfaceKey;
  /** Frame/material treatment around the grid. */
  boardFrame: Match3BoardFrameKey;
  /** Stable key used later by contextual hints/reactions. */
  narrativeProfile: Match3NarrativeProfileKey;
  /** Art-only tile skin profile. It must never change matching semantics or spawn odds. */
  tilePresentationProfile: Match3TilePresentationProfileKey;
  /** Characters narratively present/relevant to this investigation. */
  participants: readonly Match3CharacterKey[];
  /** Tooling-friendly semantic tags; not player-facing copy. */
  narrativeTags: readonly string[];
}>;
