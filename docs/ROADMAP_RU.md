# UPDS — актуальный roadmap после ANM-022A

## Completed foundation

- GitHub/iPhone validation + preview pipeline;
- infrastructure/save/diagnostics;
- mobile UX;
- VN pre-release UX and presentation polish;
- localization foundation + completion audit;
- Match-3 interaction/motion/feedback foundation;
- audio/haptics;
- compact unified navigation;
- local playtest telemetry;
- PWA/install/offline/update foundation;
- repository/test/documentation maintenance refactor;
- feature-oriented UI orchestrator decomposition.

## Current production status

### ANM-021 — Production characters

- ANM-021A production planning/contract complete;
- Emi production-integrated through ANM-021B R6.1;
- current character contract: precomposed 1024×1536 expression frames + shared R5 virtual-camera staging;
- legacy `base-neutral + face overlay` runtime contract is retired;
- automatic speaking/blink overlays remain intentionally disabled until a correct replacement/delta animation feature;
- Kentaro → Norihiro → Mayu remain planned, but are temporarily deferred while image-generation is unreliable.

Character production can resume independently without blocking code/data work.

## Next recommended work

### ANM-022 — Match-3 mechanics

ANM-022A audit/target contract complete.\nANM-022B shared move-legality contract complete.

Next atomic features:
- ANM-022B shared move-legality/simulation contract — complete;
- ANM-022C MATCH / COMBO / CHAIN / SPECIAL feedback semantics — complete;
- ANM-022D expanded special shape taxonomy;
- ANM-022E explicit special-combination matrix;
- ANM-022F inactivity hint/direct-special interaction polish.

See `docs/design/MATCH3_MECHANICS_TARGET_RU.md`.

### ANM-023 — Match-3 balance

After mechanics stabilize, use existing telemetry and structured manual runs to tune:
- move budgets;
- objectives;
- difficulty curve;
- special frequency / usefulness where necessary.

Do not mix balance tuning into ANM-022 mechanic PRs.

### ANM-024 — Structured vertical-slice playtest

Collect comparable exported playtest JSON on stable mechanics/balance and run full RU/EN slice validation.

### ANM-025 — Release-candidate hardening

Feature freeze followed by full mobile/offline/save/audio/accessibility/performance/proofreading regression and final asset optimization.

## Not required before vertical-slice pre-release

- all 22 episodes;
- backend/accounts/cloud saves;
- ads/IAP/live ops;
- large booster/meta systems;
- production level editor.
