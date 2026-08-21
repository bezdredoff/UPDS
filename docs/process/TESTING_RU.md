# UPDS — validation and test workflow

Status: active. Canonical story `0–21` is complete; ANM-023G1–G8 is closed, the Chromium/Mobile-WebKit Browser Gate is stable, and future automation is demand-driven by production signal rather than by a target test count. Full-stage character production is closed at 9/9; remaining guest/background/clue/Match-3 art production is still externally gated.

## Authoritative gates

GitHub Quality Gate runs:

```bash
npm ci --ignore-scripts
npm run check
```

`npm run check` runs Biome lint, the full Vitest suite and the strict TypeScript production build. Local runs are useful feedback but do not replace GitHub CI.

Browser/runtime changes are additionally protected by `.github/workflows/browser-gate.yml`:

- **Chromium full E2E** — full Playwright browser suite;
- **Mobile WebKit critical E2E** — critical player/QA flows plus the reviewed mobile Golden Samples.

The Browser Gate runs in the pinned Playwright container and is a separate authoritative browser gate, not a replacement for the fast Quality Gate.

## Browser automation framework policy

**Playwright is the only browser/E2E automation framework for UPDS. Selenium/WebDriver is not part of the UPDS test stack and is not planned as a parallel CI framework.**

Reasons:

- Playwright already owns Chromium and Mobile WebKit execution, traces, screenshots, retries, device profiles and Golden Samples;
- a second Selenium stack would duplicate browser provisioning, selectors, fixtures, diagnostics and CI maintenance without adding a distinct production-safety boundary;
- Playwright can exercise both QA entry points and real player journeys through the same production controllers/renderers;
- one browser stack keeps failures and visual baselines comparable and keeps CI cost bounded.

Do not introduce Selenium packages, WebDriver binaries or Selenium-specific workflows unless a future explicit product/technical decision supersedes this contract.

## Focused gates

```bash
npm run story:audit
npm run character:audit
npm run scene:audit
npm run localization:audit
npm run docs:audit
```

- `story:audit` — screenplay/manifest/graph completeness.
- `character:audit` — canonical nine-character production manifest, exact seven-asset package per character, PNG dimensions, selected-expression alpha bounds and eye-line landmarks, visual-approval status, runtime paths and exact per-character/full-package SHA-256 adoption of the approved 63-file archive.
- `localization:audit` — production-locale registry/readiness, RU/BE/EN catalog structure, full screenplay coverage, placeholder signatures and localized Match-3 surfaces.
- `scene:audit` — exact eight-preset registry/resolver, face-critical lanes, runtime-top and
  focal-eye-line camera derivation, duo/trio headroom, frame-accurate actor guides, ANM-024
  viewport/background calibration, contain geometry, measurable lineup/visual-status warnings,
  shared VN frame and Scene Studio smoke.
- `docs:audit` — active documentation/source-of-truth traceability and retired-contract guards.

Focused gates accelerate iteration; `npm run check` remains required before merge.

## Test categories

### Behavioral unit/contract tests

Preferred. Exercise public pure/data/engine/controller behavior:

- story parsing, branching, graph routing and canonical import;
- Story/Match-3 campaign stores and compatibility;
- Match3Game rules, deterministic boards, objectives, hints and specials;
- Level Lab validation/export and mode side-effect isolation;
- gesture, motion, tutorial and narrative-reaction decisions;
- VN paging/staging/playback;
- localization, telemetry, audio and platform safety.

### Playwright browser/E2E

Playwright executes the production Vite build in a real browser. Test entry points fall into two classes:

1. **Deterministic QA entry points** — QA Scene Navigation, Match-3 Campaign and Level Lab. They may select a known state/seed quickly, but after entry they must use the same production VN/Match-3/controller/render paths as the game.
2. **Real player entry points** — New Game, Continue, Settings and normal Story → Match-3 → Story boundaries. These validate persistence, navigation and cross-system behavior that a QA shortcut cannot prove by itself.

QA entry points are not a second implementation of the game. Browser-only game rules, alternate renderers or automation-specific progression logic are prohibited.

ANM-023G1–G8 coverage includes boot/build/Pages topology, VN paging/staging/choices, deterministic Match-3 mechanics, real pointer drag wiring, persistence/localization, bounded real-player Story completion, Chromium/WebKit Browser Gate execution, reviewed mobile WebKit Golden Samples, full-cast Scene Studio lineup validation, PWA update reliability, localized iOS VN viewport stability and Match-3 render stability.

**ANM-023G8 is closed.** The closeout decision is to stop before a balance-sensitive Campaign-win E2E that would either be flaky on a real level or overly narrow on an automation-only fixture. `G8C2` is deferred until balance stabilizes or a concrete regression proves that browser-level coverage is worth its maintenance cost.

Post-G8 automation priorities are:

1. **RU/BE/EN mobile locale × viewport matrix** over real production screens and the existing portrait QA sizes `320×568`, `375×667`, `390×844`, `393×852`, `430×932`. Assert geometry, overflow, controls and viewport stability rather than multiplying screenshot baselines.
2. **PWA offline/recovery journey** through the production service worker, real save/locale state, offline reload and network recovery.
3. **VN/content asset crawl** using QA Scene Navigation only as an entry point into production VN rendering; verify canonical scenes open, required content exists, assets decode and browser health stays clean.
4. **Quantitative Match-3 regression/reporting** on real production levels and deterministic seed samples outside Playwright, building on ANM-025E3. Prefer comparative envelopes/metrics over browser-playing a full level to completion.

Add any of these only as a bounded feature when its signal exceeds its CI/maintenance cost. Do not treat the post-G8 list as four mandatory immediate PRs.

### Render smoke

`UiSmoke.test.ts` verifies that major screens render with a lightweight test root and missing
browser capabilities without crashing. Smoke does not replace detailed behavior tests, Playwright E2E or visual QA.

### Presentation contracts

A small number of tests read CSS/UI source to protect invariants not available in the headless test
environment:

- shared viewport/safe-area ownership;
- VN stage/dialogue geometry and paging;
- stable Match-3 board/bark slots;
- reduced-motion paths.

Do not add a source-string test for every visual implementation detail.

### Repository/pipeline/source-audit contracts

Used only for structural safety:

- GitHub workflows remain read/write-separated;
- delta exact-base/protected-path rules remain intact;
- repository root/archive hygiene;
- feature ownership boundaries;
- save keys and build identity shape;
- retired face-overlay/candidate/static-override runtime does not return;
- active documentation points to current machine-readable sources.

## Current automated production contracts

### Story

- `StoryGraphContract.test.ts`;
- `StoryContentAudit.test.ts`;
- `StoryCanonicalRuntimeImport.test.ts`;
- narrative/runtime transition regressions.

They preserve the complete forty-five-scene/twenty-two-level authored graph, all seven scoped canonical screenplay sources, 976 parsed/runtime lines, zero deferred IDs, the continuous `VN0250` bridge and all three final-strategy ending routes.

### Character production

- `CharacterProductionManifest.test.ts`;
- `CharacterArchiveAdoption.test.ts`;
- `ExpressionFrameContract.test.ts`;
- `CharacterRuntimeOverrides.test.ts`;
- runtime asset/staging contracts and the Mobile WebKit full-cast lineup gate.

They preserve exactly nine canonical full-stage production characters, seven distinct runtime assets per character, the five precomposed expression frames, PNG dimensions, alpha-height proportions, per-expression guide geometry, exact 63-file archive digests and browser-local Scene Studio override/calibration behavior. There is no active full-stage planned/placeholder lane, candidate runtime module or built-in static transition override. The asset-heavy alpha scan uses a scoped 15-second Vitest budget instead of increasing global test timeout. Visual style, identity and expression readability still require manual approval for newly produced art before integration.

### Reusable scene staging

- `SceneStagingContract.test.ts`;
- `SceneStudioFoundation.test.ts`;
- localization parity/completion audit.

They preserve the exact eight-preset `upds-scene-staging-v1` registry, safe non-overlapping boxes,
canonical/shot scale separation, exact actor assignment, zero-new-art budgets, the
`upds-scene-studio-calibration-v1` viewport/background contract, runtime contain fit, shared
playable/QA VN frame, canonical/current-expression guides, lineup metrics, browser-local slot calibration,
read-only QA report and an asset-free guest shell.
Style, anatomy, adult visual age, lighting, perspective and final composition/readability still
require `/preview/` phone QA against the approved Golden Sample when new visual assets are integrated.

### Match-3

Contracts cover shared legality, narrative special taxonomy, production tile identities, tutorials,
Level Lab drafts/board shapes, campaign progression, deterministic quantitative balance and
narrative reaction resolver/presentation.

### Documentation

`DocumentationTraceability.test.ts` protects only high-risk authority relationships. It should not
pin every sentence or historical feature note.

## Expandable-content assertions

Для контента, который по roadmap должен расти пакетами, contract-тесты проверяют **инвариант**, а не текущий снимок размера.

- HUD/count assertions получают текущее число уровней/сцен из source-of-truth коллекции (`levels.length`, `storySceneIds.length`), а не хардкодят `7`, `10`, `14`, `20` и т. п.;
- save normalization проверяется относительно текущей последней валидной scene/level и одновременно отбрасывает значение за этой границей;
- общие production limits (например `MAX_OBJECTIVES_PER_LEVEL`) проверяются для всей коллекции без перечисления длины каждого будущего level;
- exact counts остаются допустимыми в **milestone/content audit** тестах, когда цель теста — доказать completeness конкретного batch (`M3_19–21`, authored slots `0–21`, 976 canonical lines), либо для намеренно frozen contract (например восемь staging presets);
- дизайн конкретного уже выпущенного уровня можно фиксировать exact assertion отдельно от expandable collection invariant.

Если добавление следующего canonical batch ломает общий тест только из-за нового размера коллекции, сначала проверить, не является ли это stale snapshot. Не заменять старое число новым автоматически: по возможности переписать assertion на source-derived invariant.

## TypeScript hygiene

`strict`, `noUnusedLocals` and `noUnusedParameters` are enabled. Dead code/imports/parameters fail
the build.

## Manual QA by change type

### Docs/tests-only

- review rendered Markdown/links and changed-file list;
- confirm no runtime/assets/workflows changed;
- GitHub Quality gate;
- no unrelated phone visual QA required.

### Runtime visual/mobile

Use the mobile candidate `/preview/` and check affected viewports/flows. Minimum portrait matrix:

- 320×568
- 375×667
- 390×844
- 393×852
- 430×932

Also check low-height landscape does not break the shared viewport shell when relevant.

### Character assets

- before import, validate standalone transparency/canvas/pivot and measured alpha bounds/eye line in the offline/pre-production workflow;
- inspect extracted edges on both light and dark backgrounds;
- shared-baseline lineup and authored proportions;
- all five expression frames side by side and during switching;
- Pose B/medallion;
- multi-character staging in the actual runtime camera;
- real VN header/dialogue/nameplate/controls occlusion across the portrait matrix;
- background master contain box, estimated horizon/footline/actor zone and manual perspective/light
  approval;
- no overlap baked into source assets, halo, double face, crop or scale jump.

Historical candidate provenance may remain in feature docs/prompts/Git history, but a candidate file must not be reintroduced into runtime/preload merely for QA convenience.

### Match-3/content

- relevant Story → Match-3 → Story transition;
- Story, Match-3 Campaign and Level Lab mode isolation;
- direct/tap/drag/swipe input as affected;
- objective/tutorial/reaction presentation;
- deterministic seed reproduction for balance defects.

## Historical evidence

Past validation/manual QA snapshots live under `docs/archive/reports/`. They document what was
checked at that commit; they do not define the current implementation.
