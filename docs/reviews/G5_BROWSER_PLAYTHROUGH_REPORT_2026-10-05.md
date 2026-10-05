# G5 browser QA report — 2026-10-05

## Scope

Checked the published stable build at [https://bezdredoff.github.io/UPDS/](https://bezdredoff.github.io/UPDS/) in Chromium. The live app identified itself as `v0.27.3-dev`. The initial audit baseline was merged `main` at `922806d051b2f443a4f5b164cf577ebff110d745` (PR #362); this follow-up uses current merged `main` at `949b60cd3c0bbc008d7acec231a5fb788c530b3b` (PR #364).

This audit combines the earlier browser QA run with a fresh end-to-end published-game route using Playwright mobile Chromium (402×874, touch enabled). All game actions were taps on visible controls/cells. It is browser automation, not physical-phone QA or a human balance/comprehension study.

## Result

- The stable root, main menu, production QA navigation, Campaign, Match-3 and Level Lab routes loaded.
- A sequential Chromium run against the published URL completed with **43 passed, 7 skipped, 0 failed**. The candidate-preview lane was intentionally excluded because this run targets the stable root.
- The passing cases cover production boot and critical assets; touch and zoom guards; 320×568, 390×844 and 440×956 Match-3 layouts; the 9×7 board; Match-3 Help; objective HUD and hint; a deterministic drag/swap, invalid swap and special activation; cascade and ingredient drop; localization and VN paging; save/reload/Continue; `CHOICE_00`; one real M3_00 win boundary; and runtime asset decode on selected VN routes.
- Visual inspection at 390×844 showed the shared game header, separate goal and move cards, 9×7 field, character/dialogue area and hint visible together without horizontal overflow. This is a layout sanity check, not a visual approval of every scene.
- The Help special PNGs and selected VN background/character images loaded and decoded in the browser. Existing asset audit reports cover local shipped-file paths/decode; this run does not force-load every asset used by every one of the 976 story lines.

## Initial failures and retest

The first full run used Chromium's default parallelism against the public site: **39 passed, 7 skipped, 5 failed**. One failure was the candidate-preview smoke test: it requested `/UPDS/preview/`, which returned 404 from the stable GitHub Pages deployment. The other four were time-sensitive assertions during concurrent cold asset/startup loading (VN image decode, Match-3 Help PNG decode, and viewport-recorder startup marks).

I reran the four runtime cases individually; all four passed. I then ran the full Chromium suite sequentially against stable, excluding only the preview-lane case: **43 passed, 7 skipped, 0 failed**. The seven skips are platform/suite exclusions: the installed-iPhone viewport case, five WebKit-only visual goldens, and the Belarusian iOS/WebKit long-route check. There is no confirmed gameplay or asset defect from the initial failures. The run does show that the public-site suite can be sensitive to concurrent cold loads; if that becomes a recurring CI issue, stabilize the remote asset wait/retry strategy rather than treating a local retry as proof of a product bug.

## Full published-game route follow-up — 2026-10-05

### Method and limits

Started a fresh isolated browser save at the published stable URL with `?qa=1`. I advanced VN by tapping the visible Next action, chose dialogue options on-screen, started each Match-3 level, acknowledged first-entry tutorials, activated specials when the tutorial required it, followed the visible Hint pair, and used the visible Retry action after losses. This verifies route integration and whether the in-game hint path can complete a level. It is not equivalent to a human playing without guidance: almost all match moves were hint-directed and VN text was fast-forwarded.

### Integrated route A

From New Game, the common story route reached the final-strategy choice, selected the evidence-heavy strategy, played M3_20, and reached `ENDING_A_FULL_TRUTH` without route interruption. Ending screen showed **10 evidence / 4 team trust / 4 source trust**, with **20/22 clues**. All 20 levels on this route (M3_00–M3_18 and M3_20) reported the accessible board name `Игровое поле: 9 строк, 7 столбцов`; all won. M3_05, M3_15 and M3_18 required one Retry each; the other 17 won on the first attempt. A loss screen and Retry worked in all three cases. No browser page errors or failed network requests were recorded.

| Level | Result | Attempts | Moves to win |
| --- | --- | ---: | ---: |
| M3_00–M3_04 | Win | 1 each | 6, 10, 21, 9, 11 |
| M3_05 | Win | 2 | 27 (loss), 16 |
| M3_06–M3_14 | Win | 1 each | 12, 23, 11, 10, 15, 10, 10, 14, 25 |
| M3_15 | Win | 2 | 30 (loss), 10 |
| M3_16–M3_17 | Win | 1 each | 8, 32 |
| M3_18 | Win | 2 | 31 (loss), 10 |
| M3_20 (A) | Win | 1 | 15 |

### Ending C

Using the visible QA scene-navigation screen at the final-strategy VN scene, selected strategy C, played M3_21 with visible Hint pairs, won on the first attempt after 26 moves, and reached the actual `ENDING_C_PERFECT_SUSPECT` screen. No page errors or failed requests. This validates branch selection, the B/C-style branch M3_21 transition and ending screen, but the QA jump bypasses common story progression. It is not a fully integrated clean-save route to C.

### Ending B / M3_19 — passed with caveat

A first QA-jumped branch run had three hint-only losses. On a fresh QA-jumped branch run, M3_19 succeeded on attempt 4 after three ordinary 30-move losses; the game then continued to `ENDING_B_CASE_CLOSED`. No page errors or failed requests were recorded. Progress snapshots show why the level is easy to stall: in different attempts the hint sequence completed the anonymous codes and all blockers, yet left `Подтверждение` at 0/1 until the move budget expired. On the winning attempt, all three objectives completed by move 21.

I also ran the B strategy from a fresh New Game through the common route. M3_00–M3_18 completed (with Retry on M3_05, M3_15 and M3_18); M3_19 then lost on all three hint-only attempts and the route driver stopped at its configured retry cap. That run did **not** reach Ending B. Therefore branch wiring and the ending screen are verified, but hint-following on a clean B route is not reliable enough to treat as a clean integrated pass. The losses alone do not establish infeasibility or an engine defect.

A fresh 200-seed run of the existing `objective-aware-getHintMove` simulation measured M3_19 at **98/200 wins (49%; agent-hard)**. The older audit document records 70%; treat the new run as the current diagnostic and the old figure as historical. This agent rate is not human balance acceptance, but together with the repeated live hint losses it justifies a focused human/tactical retest of blocker adjacency and the ingredient drop path.

### Clean New Game route C

Ran a second full mobile-Chromium route from `#new`, using the same common-story choices as route A and selecting strategy C at the final choice. M3_00–M3_18 all won; M3_05, M3_15 and M3_18 each required one Retry. M3_21 won on the first attempt after 26 moves; the game reached `ENDING_C_PERFECT_SUSPECT` with 10/4/4 and 20/22 clues. The route log recorded 3,765 VN advances, no page errors and no failed network requests. All boards again reported 9×7.

The clean B route was also attempted from `#new`, but stopped at M3_19 after three hint-only losses as described above. So clean A and C reach their respective endings; clean B does not yet.

### Coverage summary

- **All 22 distinct production Match-3 levels have now been won at least once** across the clean A route, clean C route and QA-jumped B branch. M3_19 required attempt 4 in its successful run.
- Clean New Game routes reached endings A and C. Ending B was reached only after a QA scene jump; the clean B route reached M3_19 but failed its three hint-only attempts.
- This verifies all three branch endings and every level at least once, but it is not three successful clean integrated playthroughs because B still fails under the hint-only route.
- Two targeted live-production Chromium E2E persistence checks were rerun after the playthrough: save/reload restored the exact VN line and Continue resumed it; New Game reached the first Match-3 intro and Continue restored the story boundary. **2 passed.** This is representative coverage only; autosave/reload at every VN↔Match-3/ending boundary was not exhausted. Device checks KI-006/KI-007 on a real iPhone remain unverified. Exhaustive runtime loading of all story assets also remains open.
- Logs are in `%TEMP%\upds-g5-full-playthrough.ndjson`, `%TEMP%\upds-g5-end-branches.ndjson`, and `%TEMP%\upds-g5-ending-c.ndjson` on the test workstation; they are evidence files outside the repository, not release artifacts.

## Still open in G5

This pass materially reduces the outstanding scope, but does **not** close G5:

1. Complete a clean B route by revising or tactically playing M3_19; the current hint-only route failed three times even though a separate fourth attempt won.
2. Exercise persistence at every VN → Match-3 → VN boundary, including Continue/reload and progression after Retry. Existing E2E verifies representative save/reload paths, not every boundary.
3. Run integrated iPhone checks `KI-006` and `KI-007`. Mobile Chromium emulation is not iOS Safari/PWA.
4. Complete an exhaustive browser crawl of assets referenced across all story and Match-3 routes; live route play and static inventory checks do not guarantee every referenced asset decoded in-browser.

G5b's Match-3 design/balance/variety acceptance remains accepted by the user; this report does not reopen it. No production gameplay files were changed during this audit.

## Reproduction

From `e2e/`, with the existing dependency tree:

```powershell
$env:UPDS_E2E_BASE_URL = 'https://bezdredoff.github.io/UPDS/'
npm.cmd run test:chromium -- --workers=1 --grep-invert 'candidate-preview'
```
