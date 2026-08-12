# UPDS — актуальный roadmap после ANM-019F

## Completed foundation

- GitHub/iPhone validation + preview pipeline;
- infrastructure/save/diagnostics;
- mobile UX;
- VN pre-release UX and presentation polish;
- Match-3 interaction/motion/feedback;
- audio/haptics;
- compact unified navigation;
- local playtest telemetry;
- PWA/install/offline/update foundation;
- repository/test/documentation maintenance refactor;
- feature-oriented UI orchestrator decomposition.

## Next recommended work

### ANM-019 — Localization foundation

Localization core, ru/en Main Menu + Settings, and VN metadata/choices/chrome are complete. Screenplay runtime localization and an English prologue slice are complete. Localization foundation complete through ANM-019F. Next: localization completeness/manual audit, then return to gameplay/content roadmap. Russian remains the source/fallback locale while features migrate.

### Production character completion

Replace remaining portrait placeholders (Emi, Mayu, Kentaro, Norihiro) using the existing `base-neutral + face overlay` production contract.

### Structured playtest + balance pass

Distribute the installable build, collect exported playtest JSON, then adjust level move budgets/objectives and UX only from observed data. Keep telemetry schema stable during one comparison cohort where practical.

### Release-candidate hardening

Feature freeze followed by full mobile/offline/save/audio/accessibility/performance/proofreading regression and final asset optimization.

## Not required before vertical-slice pre-release

- all 22 episodes;
- backend/accounts/cloud saves;
- ads/IAP/live ops;
- large booster/meta systems;
- production level editor.
