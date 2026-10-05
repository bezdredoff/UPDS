# G5 browser QA report — 2026-10-05

## Scope

Checked the published stable build at [https://bezdredoff.github.io/UPDS/](https://bezdredoff.github.io/UPDS/) in Chromium. The live app identified itself as `v0.27.3-dev`. The repository baseline used for the report is merged `main` at `922806d051b2f443a4f5b164cf577ebff110d745` (PR #362).

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

### Ending B / M3_19 — unresolved blocker

Selected strategy A from the same visible QA final-strategy scene and entered M3_19. Three hint-only attempts all lost at the 30-move limit; the run stopped rather than treating a hint-only loss as proof the level is impossible. In the detailed first attempt, the hints reached 14/14 anonymous codes by move 16 but only 6/10 blockers and 0/1 return confirmations. From move 20 through move 29, those unfinished objectives did not advance; the level ended in a normal loss screen with Retry. **M3_19 has not been passed, and Ending B has not been reached.** This is a high-priority follow-up: test M3_19 with a human strategy focused on blocker adjacency and opening the ingredient's path, and inspect the level's authored layout/objective feasibility if it remains stuck. Do not infer an engine defect solely from the hint-only failure.

### Coverage summary

- **21 of 22 distinct production Match-3 levels were won:** M3_00–M3_18, M3_20 and M3_21. M3_19 was entered but not won.
- Ending A was reached through the clean integrated New Game route. Ending C was reached after a QA scene jump. Ending B remains unverified.
- The entire common route and its 20/22-level A ending path worked; B/C were not independently played from New Game, so all three endings are not a complete integrated playthrough.
- Autosave/reload, Continue and all individual VN↔Match-3 boundaries were not exhaustively inspected during this pass. Device checks KI-006/KI-007 on a real iPhone remain unverified. Exhaustive runtime loading of all story assets also remains open.
- Logs are in `%TEMP%\upds-g5-full-playthrough.ndjson`, `%TEMP%\upds-g5-end-branches.ndjson`, and `%TEMP%\upds-g5-ending-c.ndjson` on the test workstation; they are evidence files outside the repository, not release artifacts.

## Still open in G5

This pass materially reduces the outstanding scope, but does **not** close G5:

1. Pass M3_19 and reach Ending B. Its hint-only route repeatedly stalls on blockers/drop confirmation after collection is complete.
2. Play B and C from clean New Game saves, without the QA scene jump, and inspect the complete integrated story/ending transitions.
3. Exercise persistence at every VN → Match-3 → VN boundary, including Continue/reload and progression after Retry.
4. Run the integrated iPhone checks `KI-006` and `KI-007`. Mobile Chromium emulation is not iOS Safari/PWA.
5. Complete an exhaustive browser crawl of assets referenced across all story and Match-3 routes.

G5b's Match-3 design/balance/variety acceptance remains accepted by the user; this report does not reopen it. No production gameplay files were changed during this audit.

## Reproduction

From `e2e/`, with the existing dependency tree:

```powershell
$env:UPDS_E2E_BASE_URL = 'https://bezdredoff.github.io/UPDS/'
npm.cmd run test:chromium -- --workers=1 --grep-invert 'candidate-preview'
```
