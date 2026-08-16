# ANM-023F4B — Runtime Asset Preload & Memory Pass

Status: R1 candidate. Second measured ANM-023F4 performance cut; changes asset warming pressure and diagnostics, but does not change art, story/gameplay rules, save state or the full PWA offline asset contract.

## Goal

Stop treating the complete runtime asset catalog as an in-memory/browser-image preload budget.

The player needs two different guarantees:

1. **offline distribution** — the service worker may cache the complete known runtime catalog in the background;
2. **transition readiness** — VN and Match-3 should warm only assets relevant to the current/next interaction.

Before F4B these responsibilities were mixed: `src/main.ts` scheduled `runtimeAssetCatalog` through browser `Image()` objects and also passed the same full catalog to `PwaController.start()`. VN and Match-3 then performed their own contextual preloads on top.

## Accepted F4A baseline

F4A merged via **PR #142** on main `e56235700ba839dc7c5347acbd374bdc0a9ca806` with green CI #286 and stable Pages #136.

The authoritative production build improved from the F3 baseline:

- initial JS: **1,206.14 kB / 389.05 kB gzip** → **741.15 kB / 247.14 kB gzip**;
- Belarusian chunk: **232.63 kB / 79.46 kB gzip**;
- English chunk: **234.75 kB / 63.81 kB gzip**;
- CSS remains **86.18 kB / 17.97 kB gzip**;
- tests: **90 files / 481 tests**.

That is approximately a 38.6% raw and 36.5% gzip reduction of the initial JS entry. F4A therefore closes as a successful measured payload cut.

## Measured F4B problem

The repository currently has three image-warming paths:

- bootstrap: `scheduleImagePreload(runtimeAssetCatalog, ...)` — complete runtime catalog;
- VN: current stage + next-line contextual assets via `preloadImageAssets()`;
- Match-3: the active level background/board/special asset family via `preloadImageAssets()`.

The complete catalog is intentionally broad because it is also the PWA offline distribution contract: backgrounds, finished character frames/poses/medallions, Match-3 tiles/ingredients/blockers, clues, special art and common UI icons. It is therefore the wrong unit for browser `Image()` warming on every application start.

The service worker had the same burst-shape problem: `CACHE_URLS` used one `Promise.allSettled(urls.map(...))`, allowing the whole cache warmup set to fetch/cache concurrently.

## R1 decision

### 1. Bootstrap no longer warms the full catalog through `Image()`

`src/main.ts` keeps:

`services.pwa.start(runtimeAssetCatalog)`

but removes global `scheduleImagePreload(runtimeAssetCatalog, ...)`.

`runtimeAssetCatalog` remains the complete **distribution/offline-cache catalog**. It is not redefined as a small startup tier merely to make the metric look better.

### 2. Feature transitions own browser-image warming

Existing contextual behavior remains authoritative:

- VN warms the current stage asset(s) and the next authored line/background;
- Match-3 warms the active level presentation family before play;
- already-requested URLs remain deduplicated across repeated transitions.

This means image warming follows actual navigation instead of application installation scope.

### 3. Browser image warming is bounded

`AssetPreloader` exports:

`IMAGE_PRELOAD_CONCURRENCY = 4`

and processes contextual assets through a small worker pool instead of a full `Promise.all()` burst.

`AssetHealth` now tracks:

- requested;
- loaded;
- failed;
- currently active;
- peak active preload count.

Diagnostics surfaces `active/peak`, so a mobile smoke test can distinguish a healthy bounded preload path from an accidental future burst.

### 4. PWA cache warming remains complete but bounded

The service worker keeps the complete `CACHE_URLS` contract and offline-ready reporting, but cache warmup now uses:

`CACHE_WARM_CONCURRENCY = 4`

with `cacheUrlsWithConcurrency()`.

This does **not** reduce offline coverage. It limits simultaneous fetch/clone/cache work so background installation is less likely to compete with the currently visible VN/Match-3 transition.

## Tests and invariants

F4B protects the following relationships:

- bootstrap still passes the full `runtimeAssetCatalog` to PWA;
- bootstrap does not globally image-preload that catalog;
- browser preload peak cannot exceed `IMAGE_PRELOAD_CONCURRENCY` in the deterministic fake-image contract;
- a URL already warmed by an earlier transition is not requested twice;
- preload active count returns to zero after completion;
- service-worker warmup uses `CACHE_WARM_CONCURRENCY` rather than an unbounded URL `Promise.allSettled`;
- all runtime catalog files still exist and remain eligible for offline caching.

## Acceptance gate

Authoritative candidate acceptance requires:

1. Biome, all tests, TypeScript and Vite build green;
2. F4A locale chunks and approximately **741 kB / 247 kB gzip** initial-entry shape remain intact — F4B must not regress payload splitting;
3. asset-preloader tests prove a peak of at most four concurrent browser image warmers;
4. PWA contract still reports offline-ready after the complete cache pass;
5. mobile preview smoke: RU/BE/EN startup, VN next-line transitions, Match-3 intro/start and return navigation show no new visible late-image flashes;
6. Diagnostics shows preload active returning to `0` and peak not exceeding `4` during normal VN/Match-3 use.

## Non-goals

F4B does not:

- delete assets or reduce offline content coverage;
- re-encode PNG/WebP files;
- alter character/background production contracts;
- change VN or Match-3 visuals, timing, rules or progression;
- make QA tooling lazy-loaded;
- split the eager Match-3 reaction catalog;
- claim JavaScript bundle reduction as the success metric for this cut.

## Next

If F4B merges green and mobile transition QA is clean, **ANM-023F4 can close**: F4A addressed the measured JavaScript payload problem and F4B addresses the measured asset-warming pressure. A further F4C should exist only if new measurements reveal another material startup/runtime bottleneck. Otherwise continue with **ANM-030A — Full Game Asset Gap Audit**.
