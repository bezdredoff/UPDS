## Scope

- [ ] One focused task / candidate only.
- [ ] Current docs under `docs/architecture`, `docs/process` or `docs/features` were updated if behavior/contracts changed.
- [ ] Historical files under `docs/archive` were not treated as current requirements.

## Protected UPDS contracts

- [ ] Canon is unchanged unless explicitly requested.
- [ ] Stable VN line IDs / `CHOICE_00` semantics are unchanged unless explicitly requested.
- [ ] Save key `seiran-detectives-anm009-v1` is unchanged unless explicitly requested.
- [ ] Approved art direction is unchanged unless explicitly requested.
- [ ] Character runtime keeps precomposed 1024×1536 expression frames; retired transparent face-overlay composition is not reintroduced.

## Validation

- [ ] `npm run check` passes in GitHub CI.
- [ ] GitHub Pages `/preview/` is checked on a phone when runtime or visual behavior changes.
- [ ] Critical path relevant to this change is checked manually.
- [ ] Pipeline/docs-only changes are validated against their relevant workflow/contract instead of requiring unrelated visual QA.
- [ ] No unexpected runtime/console errors for runtime-affecting changes.

## Versioning

- [ ] Player runtime, production assets, localization, or production build behavior changed: `APP_VERSION` was bumped (patch for routine fixes/content/presentation; minor for a new player-facing capability).
- [ ] No player-facing production change: no `APP_VERSION` bump is needed.
- [ ] `BUILD_LABEL` identifies the active milestone; update it and the roadmap when the production milestone changes.
- [ ] `package.json.version` was left alone unless npm package publication/versioning itself is in scope.
