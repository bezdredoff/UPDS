# ANM-023G8A — Playwright Coverage Audit & QA/Production Parity Matrix

Status: R1 candidate. Audit-only slice; no new browser tests, runtime code, assets or workflows.
Baseline: `main` at `bc8b7b9b7bd3878eb465e8975c191f621ff20830` after PR #161.

## Цель

Перед расширением Browser Gate зафиксировать, что именно уже доказывает текущая Playwright suite, где QA entry points действительно сходятся с production runtime, какие overlaps являются намеренными и какие production boundaries остаются без browser-level проверки.

G8A не добавляет тесты «для количества». Его результат — приоритизированный план G8B/G8C, основанный на реально отсутствующих границах поведения.

## Текущий browser baseline

На baseline существует 7 Playwright spec-файлов и 20 Chromium cases. Mobile WebKit critical lane выполняет 15 cases: `boot`, `vn-navigation`, `match3`, `persistence-localization-flow` и четыре Golden Samples; `pages-smoke` и `harness` остаются Chromium-only, потому что проверяют deployment/harness routing, а не отдельную mobile behavior contract.

| Spec | Cases | Entry point | Что доказывает | Lane | Audit verdict |
| --- | ---: | --- | --- | --- | --- |
| `boot.pw.ts` | 1 | normal app boot | production bundle → Main Menu, HTTP/app/browser health | Chromium + WebKit | keep |
| `pages-smoke.pw.ts` | 2 | stable `/` + `/preview/` | deployment topology and three QA menu entries exist on both Pages lanes | Chromium | keep; topology-specific, not duplicate |
| `harness.pw.ts` | 3 | QA Scene Navigation / Match-3 Campaign / Level Lab | deterministic entry points reach shared production VN/Match-3 surfaces | Chromium | keep; explicit parity smoke |
| `vn-navigation.pw.ts` | 3 | QA Scene Navigation | browser-measured paging, fallback/authored staging, CHOICE_00 branch | Chromium + WebKit | keep; focused renderer/navigation coverage |
| `match3.pw.ts` | 4 | Match-3 Campaign + Level Lab | production board start, hint/legal move, cascade/refill/objective progress, invalid swap, special create/activate | Chromium + WebKit | keep; mechanics browser coverage |
| `persistence-localization-flow.pw.ts` | 3 | New Game / Continue / Settings | early VN persistence, locale persistence, real New Game → CHOICE_00 → M3_00 start/resume boundary | Chromium + WebKit | keep; current real-player journeys |
| `visual-regression.pw.ts` | 4 | Main Menu / QA VN / Level Lab | reviewed mobile WebKit visual baselines | WebKit authoritative | keep; visual layer is distinct from functional overlap |

The current overlaps are intentional:

- `harness.pw.ts` proves entry-point parity, while `vn-navigation.pw.ts` and `match3.pw.ts` prove behavior after entry;
- Golden Samples revisit already-functional surfaces because they protect rendering, not behavior;
- `pages-smoke.pw.ts` revisits Main Menu/QA routing because its contract is stable-vs-preview deployment topology.

No current spec is recommended for deletion in G8A.

## QA → production parity

### QA Scene Navigation → production VN

Parity is strong and already guarded structurally:

- `AnimeDetectiveApp` constructs only one `VnController`;
- diagnostics Scene Navigation routes through `navigation.openScene(...)`;
- runtime and QA staging share `vnFrameMarkup` with `data-vn-frame="shared"`;
- Playwright observes the runtime frame, real dialogue paging, authored shot resolver and production image assets;
- there is no `QAVnController` or browser-only VN implementation.

Conclusion: QA Scene Navigation is suitable for focused VN rendering/staging/choice cases. It must not replace New Game/Continue when persistence or cross-system story progression is the behavior under test.

### Match-3 Campaign / Level Lab / Story → production Match-3

Parity is strong at controller/render/engine level:

- `AnimeDetectiveApp` constructs only one `Match3Controller`;
- Story uses `startMatch`, Campaign uses `startCampaignMatch`, Lab uses `startLabMatch` on that controller;
- all three construct the production `Match3Game` and render through the shared `Match3Presentation` board;
- mode differences are explicit state/lifecycle differences (`story`, `campaign`, `lab`), not alternate game rules;
- deterministic Lab fixtures are authored through visible Level Lab controls; Playwright helpers do not instantiate `Match3Game` or mutate game internals.

Conclusion: Level Lab is the correct deterministic surface for mechanics defects. Match-3 Campaign is the correct direct progression surface. Story is required when validating Story-specific save/clue/evidence/post-win routing.

## Coverage gaps

### P0 — Story Match-3 completion → evidence → post-win VN

Current real-player flow reaches `M3_00`, starts the production board, reloads, and proves that Continue returns to the Match-3 intro boundary. It does **not** win a Story match in a browser.

Therefore these production branches are currently protected by unit/contract tests but not by one browser journey:

`Match3Controller.completeLevel()` → Story save `completed/clues` → `storyWinSceneIndexForLevelId()` → evidence transition → `#continue-story` → post-win VN → persisted Continue state.

This is a high-value G8B boundary because it crosses engine result, Story save, clue/evidence UI and VN routing.

### P0 — Match-3 Campaign completion/progression

Current Campaign E2E proves only that the first unlocked production level starts on the shared board. Browser coverage does not currently exercise:

- campaign win result screen;
- `completed` persistence;
- `bestMovesLeft` update;
- unlocking the next level;
- `campaign-next`;
- replay of a completed level;
- hub state after returning from a result.

`renderCampaignResult()` owns these player-visible transitions, so this is a distinct production boundary and belongs in G8C2.

### P0/P1 — Real pointer drag/swipe input

Current Match-3 browser mechanics use `tapSwap()` (two DOM clicks) and direct-special double tap. No `e2e/` test emits a real pointer drag/swipe sequence.

The production controller separately owns:

`pointerdown → pointermove → drag preview/target reaction → pointerup → getDragPreview/getSwipeDecision → attemptMatchSwap(..., 'drag')`.

Unit tests protect the geometric decisions, but they cannot prove browser pointer capture, DOM event wiring, drag-preview classes or committed production swap behavior. This is a genuine browser-only gap and should be isolated as G8C1 before progression work.

### P1 — Later Story/Continue representative boundaries

Real-player Story coverage is concentrated at the beginning of the game:

- persistence at `VN0002`;
- first choice `CHOICE_00`;
- first Match-3 boundary `M3_00`.

The canonical 0–21 graph and all later choices/routes are strongly covered by unit/content contracts, so CI should **not** click through all 976 lines. G8B should instead add a small number of representative later boundaries using normal Story/Continue behavior where persistence/routing is the point, while retaining QA Scene Navigation for local VN presentation checks.

### P2 / do not expand without evidence

These are currently lower-value browser additions because stronger focused coverage already exists or the cost/flake risk is disproportionate:

- every authored VN scene/line in Playwright;
- every Match-3 level in a full browser playthrough;
- exhaustive special-combination gameplay in Browser Gate;
- broad screenshot baselines beyond the four reviewed Golden Samples;
- Level Lab win/loss result UI unless a concrete regression appears;
- duplicating unit validation, story graph completeness or deterministic balance simulations in browser tests.

## Recommended implementation split after G8A

### G8B — Story/VN Production-Flow Expansion

Keep this bounded to representative player journeys. Minimum high-value target:

1. deterministic/controlled way to complete the first Story Match-3 without browser-only game logic;
2. assert evidence transition;
3. continue into the canonical post-win VN scene;
4. reload and assert Continue preserves the post-win boundary;
5. optionally add one later representative choice/save boundary if this can be reached without replaying a large fraction of the screenplay on every PR.

The implementation must not add a hidden `window.__UPDS_TEST__` mutation API or a second Story/Match-3 implementation merely to force a win.

### G8C1 — Match-3 Browser Interaction Parity

Add one deterministic Level Lab interaction case using real Playwright mouse/touch-like pointer movement through rendered cell geometry. It should prove:

- source drag preview appears;
- target reacts/commits at the production threshold;
- `pointerup` executes the expected swap;
- move/objective state changes exactly as the same deterministic tap fixture would;
- an uncommitted short drag is side-effect free.

Do not re-test every engine rule here; the purpose is browser input/event parity.

### G8C2 — Match-3 Completion & Progression Flow

Add a deterministic production Campaign win path and verify:

`play → win result → persisted completed/best → next unlock → next/replay/hub`.

If practical in the same bounded slice, include one loss/retry assertion; otherwise keep loss behavior in unit/controller coverage until a real regression justifies browser cost.

## Browser Gate allocation

- Chromium remains the full E2E owner and receives all G8 additions.
- Mobile WebKit should receive new G8 tests only when the boundary is mobile-critical and runtime remains acceptable.
- G8C1 pointer interaction is a strong candidate for WebKit because touch-like mobile interaction is product-critical.
- G8B/G8C2 should first prove stable in Chromium; add to the WebKit critical list only when the extra signal justifies execution cost.
- Existing four Golden Samples remain unchanged by G8A.

## Acceptance criteria for G8A

- all current `*.pw.ts` specs are inventoried;
- every existing case has an explicit product/QA boundary and keep/remove verdict;
- QA Scene Navigation, Match-3 Campaign and Level Lab parity is traced to production controllers/render paths;
- intentional overlap is distinguished from duplicate coverage;
- missing Story completion, Campaign progression and real pointer drag/swipe boundaries are explicit;
- future work is split into G8B, G8C1 and G8C2;
- no Selenium/WebDriver stack is introduced;
- no runtime/browser tests/assets/workflows change in this audit slice.
