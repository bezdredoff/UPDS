# ANM-023F4A — Lazy Locale Payload

Status: R1 candidate. First measured ANM-023F4 performance/payload cut; runtime-visible locale loading changes, but localization copy, supported-locale registry, story/gameplay rules and save schema are unchanged.

## Goal

Reduce the initial JavaScript payload without weakening the production-complete RU/BE/EN localization contract.

ANM-023F3 is complete through PR #141. F4 starts from measured production output rather than a generic code-splitting rewrite.

## Merged F3 baseline

Main `9c35632e94ff6fd17c8ff62fc61b53189b019ca9` / PR #141 has green UPDS CI #284 and stable Pages #135.

The authoritative CI build reports:

- 101 transformed modules;
- initial CSS: **86.18 kB / 17.97 kB gzip**;
- single initial JS chunk: **1,206.14 kB / 389.05 kB gzip**;
- Vite warns because the initial JS chunk is above 500 kB;
- test baseline: **90 files / 478 tests**.

Source contribution inspection shows the localization catalogs are the dominant obvious payload family:

- `ru.ts`: 344,752 bytes;
- `be.ts`: 343,943 bytes;
- `en.ts`: 251,111 bytes;
- `match3Reactions.ts`: 58,193 bytes.

Before F4A, `src/localization/catalogs/index.ts` statically imports RU, BE and EN, so every selectable base catalog is part of the startup dependency graph regardless of the player's active locale.

## R1 decision

The bundle data is sufficient to approve lazy loading for **non-default base locale catalogs**.

R1 keeps Russian as the synchronously available source/fallback catalog and changes Belarusian/English to dynamic imports:

- `initialAppCatalogs` contains only the merged Russian runtime catalog;
- `loadRuntimeLocaleCatalog('be')` dynamically imports `be.ts`;
- `loadRuntimeLocaleCatalog('en')` dynamically imports `en.ts`;
- `match3Reactions.ts` intentionally remains eager in R1 so the first payload cut changes one ownership dimension at a time.

This preserves exact production catalog content while allowing Vite/Rollup to emit BE and EN as separate chunks.

## Startup and locale-switch contract

`LocalizationService` now supports `ensureLocale()` / `activateLocale()` and deduplicates concurrent loads for the same locale.

`RuntimeServices` exposes `ready: Promise<void>`:

1. Russian fallback is available immediately;
2. the persisted locale is resolved from `LocaleSettingsStore`;
3. if it is BE/EN, its chunk is loaded before player UI is rendered;
4. load failure is recorded and the runtime remains safely on Russian;
5. `document.documentElement.lang` is applied only after readiness resolves.

`src/main.ts` uses an async bootstrap and waits for `services.ready` before telemetry start, preload scheduling, PWA warm-cache start and `AnimeDetectiveApp.mount()`. Therefore a persisted BE/EN player does **not** see a transient Russian menu.

The Settings language selector calls `activateLocale()` and rerenders only after the requested catalog is available. A chunk-load failure keeps the previous locale selected and records a runtime diagnostic.

## PWA/offline interaction

PWA warm-cache remains after locale readiness. For a persisted BE/EN locale, its dynamic chunk has already been requested by the time `PwaController.start()` samples `performance.getEntriesByType('resource')`, so the active locale resource participates in the existing warm-cache pass.

R1 does not promise that a never-before-used alternate locale can be selected for the first time while fully offline. Once such a chunk has been fetched, the existing service-worker runtime caching can serve it subsequently. Broader all-locale offline precaching is not justified until payload/cache measurements show it is worth paying that download cost.

## Tests and invariants

The localization foundation now protects:

- only RU is present in `initialAppCatalogs`;
- BE/EN runtime catalogs load on demand with key parity to RU;
- duplicate concurrent requests for one locale share a single loader operation;
- existing synchronous `setLocale()` behavior remains valid for already-loaded catalogs;
- persisted EN and BE smoke tests await runtime readiness and still render their production copy before first UI assertion;
- Belarusian completion audits compare complete merged catalogs directly and do not force runtime startup to import every locale.

## Acceptance gate

Authoritative candidate CI must show:

1. Biome, all tests, TypeScript and Vite build green;
2. production build emits separate non-default locale chunks rather than one 1.2 MB monolith;
3. the initial entry JS decreases materially from **1,206.14 kB / 389.05 kB gzip**; target for this cut is at least a 15% reduction in both raw and gzip initial-entry size;
4. RU, persisted BE and persisted EN startup all work in preview;
5. switching RU ↔ BE ↔ EN from Settings rerenders correctly without a transient wrong-language screen.

If the measured reduction is not material, R1 must not be merged merely because dynamic imports compile.

## Non-goals

F4A does not:

- change or delete translation strings;
- resume paused `zh-CN`, `ja`, `ko` or `pt-BR` production;
- lazy-load player gameplay controllers;
- split `match3Reactions.ts` yet;
- change image preload policy, runtime asset budget or memory behavior;
- change story/gameplay data, balance, save state or art.

## Next

After F4A candidate measurements are accepted, continue with **ANM-023F4B — Runtime Asset Preload & Memory Pass**. That cut measures the current image preload catalog and repeated VN/Match-3 transition behavior before changing preload tiers. Lazy QA-tooling chunks and reaction-catalog splitting remain optional follow-ups only if measured data justifies them.
