# ANM-018A · UI Orchestrator Decomposition

Build: `0.18.1-anm018a`.

## Цель

Уменьшить стоимость AI/developer изменений за счёт feature-oriented декомпозиции `AnimeDetectiveApp.ts` без изменения пользовательского поведения.

## Итог

`AnimeDetectiveApp.ts` больше не реализует VN, Match-3, dossier, settings, diagnostics и ending. Он является composition root: создаёт shared services/session/shell, связывает navigation callbacks и обслуживает глобальный PWA/page lifecycle.

Feature ownership:

- `features/vn/VnController.ts` — VN runtime/presentation state;
- `features/match3/Match3Controller.ts` — active Match-3 presentation/session;
- `features/menu/MainMenuController.ts`;
- `features/settings/SettingsController.ts`;
- `features/diagnostics/DiagnosticsController.ts`;
- `features/dossier/DossierController.ts`;
- `features/ending/EndingController.ts`.

Application seams:

- `app/AppSession.ts` — campaign state/persistence facade;
- `app/AppShell.ts` — screen shell/timer lifecycle;
- `app/AppNavigation.ts` — cross-feature navigation interface.

Shared settings markup moved to `ui/systemControls.ts` so VN config, system settings and diagnostics can reuse the same audio/PWA controls without importing feature controllers.

## Architectural constraints

- VN and Match-3 controllers do not import each other.
- Feature controllers do not instantiate `CampaignStore` or other feature controllers.
- Cross-feature transitions use `AppNavigation` or a narrow callback supplied by the composition root.
- Match-3 rules remain in `engine/Match3Game.ts`.
- narrative/level/rig definitions remain in data/content modules.
- save key/schema semantics are unchanged.
- PWA/service worker behavior is unchanged.

## Behavior-neutral scope

No intentional changes to:

- canon/VN IDs/CHOICE_00;
- level definitions or Match-3 rules;
- UI layout/CSS/art;
- audio content/settings semantics;
- telemetry schema;
- PWA cache/install/update logic;
- campaign save format/key.
