# UPDS — текущая архитектура

Status: ANM-023D audited baseline.

## Runtime flow

`content/data + localization → engine/application state → feature controllers → app composition → platform services`

Presentation code may animate engine results, but it must not redefine Match-3 rules, narrative IDs or campaign persistence semantics.

## Application composition

### `src/ui/AnimeDetectiveApp.ts`

Small composition root only. It owns:

- runtime service creation/injection;
- `AppSession` and `AppShell` composition;
- feature-controller construction;
- navigation callback wiring;
- page lifecycle and global PWA update banner;
- global transition back to the main menu.

It must not accumulate feature rendering, Match-3 rules, VN paging, content definitions or feature-owned state. Repository tests enforce that this file remains <= 200 lines.

### `src/app/`

- `AppSession.ts` — one shared mutable campaign state and the only application-level persistence seam;
- `AppShell.ts` — one-screen DOM shell plus disposable UI timers;
- `AppNavigation.ts` — navigation contract used by feature controllers.

Controllers do not import or instantiate one another. Cross-feature transitions go through `AppNavigation` or a narrow callback supplied by the composition root.

ANM-023D intentionally does **not** introduce an event bus or generic flow coordinator. The current awarded-clue handoff from Match-3 to the next VN screen is the only transient cross-feature payload and remains a narrow app-composed callback. If a second independent transient payload appears, that is the trigger to promote such handoffs into a dedicated application-level flow contract instead of accumulating more callbacks.

Repository source-audit tests enforce two structural rules:

1. a module under `src/features/<feature>/` cannot import a sibling `src/features/<other-feature>/` module;
2. feature controllers are instantiated only in `AnimeDetectiveApp`.

These are deliberate source-audit tests: the invariant is architectural structure rather than runtime output.

## Feature ownership

### `src/features/vn/VnController.ts`

Owns VN session UI state and orchestration:

- scene opening/advancement;
- authored-line progression;
- internal dialogue pages;
- AUTO/SKIP/read state integration;
- rendered measurement/reflow;
- portrait staging/animation;
- history/config overlays;
- `CHOICE_00` presentation;
- one-shot presentation of an awarded-clue toast received through the app-composed handoff.

Pure/supporting VN logic remains under `src/ui/` for now:

- `vnDialoguePaging.ts`;
- `dialogueMeasurement.ts`;
- `vnPlayback.ts`;
- `vnStaging.ts`.

The VN controller must not import or instantiate Match-3 feature code.

### `src/features/match3/Match3Controller.ts`

Owns one active Match-3 presentation/session:

- level intro/start;
- board interaction and selection state;
- hints and inactivity guidance;
- drag/swipe/tap/direct-special wiring;
- presentation frames/motion playback;
- field barks;
- win/loss/evidence transitions;
- playtest attempt telemetry.

Core rules remain exclusively in `src/engine/Match3Game.ts`. Existing pure input/motion helpers remain:

- `src/ui/boardInteraction.ts`;
- `src/ui/matchMotion.ts`.

The Match-3 controller must not import or instantiate VN feature code. Its awarded-clue callback is composed by the application root and carries only the transient clue ID needed for the next VN presentation.

### Small screen controllers

- `features/menu/MainMenuController.ts` — main menu and Continue/New Game entry;
- `features/settings/SettingsController.ts` — system settings screen;
- `features/diagnostics/DiagnosticsController.ts` — save/telemetry/PWA diagnostics and QA scene navigation;
- `features/dossier/DossierController.ts` — clue/suspect dossier;
- `features/ending/EndingController.ts` — vertical-slice completion screen.

These modules may call navigation callbacks but must not directly instantiate or import sibling feature controllers.

## Shared UI

### `src/ui/`

- `viewMarkup.ts` — escaped icon/header markup primitives;
- `systemControls.ts` — reusable audio/PWA settings markup and bindings;
- VN and Match-3 pure/presentation helper modules listed above.

Shared UI helpers should remain stateless where practical. Do not move feature state into a generic UI context.

## Content and engine

### `src/data/`

Authoritative runtime definitions:

- `narrative.ts` — parsed vertical-slice scenes, choice filtering, backgrounds/history;
- `levels.ts` — four Match-3 level definitions and presentation metadata;
- `characterRigs.ts` — production rigs/placeholders and expression mapping.

### `src/content/`

- `ANM-003_Vertical_Slice_Screenplay.md` — authored screenplay bundled for runtime parsing/auditing.

### `src/engine/`

- `CampaignStore.ts` — save compatibility, manual save, import/export/recovery;
- `Match3Game.ts` — deterministic Match-3 rules, objectives, hints, specials and presentation frames.

Engine code stays independent from DOM/CSS.

## Platform and audio

### `src/platform/`

Browser/platform concerns only: safe storage, diagnostics, asset health/preload, downloads, local playtest telemetry, PWA/install/offline/update and runtime service composition.

Platform features must degrade gracefully when browser APIs are absent.

### `src/audio/`

Procedural audio/haptics settings, cues, music themes and manager lifecycle.

## Extension rules

### Full content

New episodes/levels/characters should primarily extend content/data definitions. Do not encode episode-specific branches in screen controllers when a content/data contract can express them.

### Localization

`src/localization/` owns locale resolution, message catalogs, named-parameter formatting and locale persistence. `RuntimeServices` owns one shared `LocalizationService`; feature controllers consume it rather than creating per-feature localization state.

Russian and English catalogs cover the current vertical slice. Stable namespaced keys are preferred over tests or feature code depending on literal copy. VN scene display metadata resolves from stable `VN_SCENE_*` IDs and `CHOICE_00` display text resolves from stable A/B/C choice IDs. Internal dialogue paging remains presentation-only after translated text is resolved.

### Save migrations

Controllers must continue to use `AppSession`/`CampaignStore` rather than browser storage directly. Future schema migrations belong in the persistence layer, not feature controllers.

### New platforms

PWA/browser concerns remain under platform services so a future native wrapper does not require rewriting VN or Match-3 features.

## Repository structure

Historical implementation reports do not belong in the repository root. Active docs live under `docs/`; historical notes are archived under `docs/archive/`.
