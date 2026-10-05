# G5 browser QA report — 2026-10-05

## Scope

Checked the published stable build at [https://bezdredoff.github.io/UPDS/](https://bezdredoff.github.io/UPDS/) in Chromium. The live app identified itself as `v0.27.3-dev`. The repository baseline used for the report is merged `main` at `922806d051b2f443a4f5b164cf577ebff110d745` (PR #362).

This was a browser QA pass using real app screens and Playwright pointer/keyboard interactions. It is not a physical-phone test, complete manual story playthrough, or semantic playtest of every level.

## Result

- The stable root, main menu, production QA navigation, Campaign, Match-3 and Level Lab routes loaded.
- A sequential Chromium run against the published URL completed with **43 passed, 7 skipped, 0 failed**. The candidate-preview lane was intentionally excluded because this run targets the stable root.
- The passing cases cover production boot and critical assets; touch and zoom guards; 320×568, 390×844 and 440×956 Match-3 layouts; the 9×7 board; Match-3 Help; objective HUD and hint; a deterministic drag/swap, invalid swap and special activation; cascade and ingredient drop; localization and VN paging; save/reload/Continue; `CHOICE_00`; one real M3_00 win boundary; and runtime asset decode on selected VN routes.
- Visual inspection at 390×844 showed the shared game header, separate goal and move cards, 9×7 field, character/dialogue area and hint visible together without horizontal overflow. This is a layout sanity check, not a visual approval of every scene.
- The Help special PNGs and selected VN background/character images loaded and decoded in the browser. Existing asset audit reports cover local shipped-file paths/decode; this run does not force-load every asset used by every one of the 976 story lines.

## Initial failures and retest

The first full run used Chromium's default parallelism against the public site: **39 passed, 7 skipped, 5 failed**. One failure was the candidate-preview smoke test: it requested `/UPDS/preview/`, which returned 404 from the stable GitHub Pages deployment. The other four were time-sensitive assertions during concurrent cold asset/startup loading (VN image decode, Match-3 Help PNG decode, and viewport-recorder startup marks).

I reran the four runtime cases individually; all four passed. I then ran the full Chromium suite sequentially against stable, excluding only the preview-lane case: **43 passed, 7 skipped, 0 failed**. The seven skips are platform/suite exclusions: the installed-iPhone viewport case, five WebKit-only visual goldens, and the Belarusian iOS/WebKit long-route check. There is no confirmed gameplay or asset defect from the initial failures. The run does show that the public-site suite can be sensitive to concurrent cold loads; if that becomes a recurring CI issue, stabilize the remote asset wait/retry strategy rather than treating a local retry as proof of a product bug.

## Still open in G5

This browser pass does **not** close G5. These release checks remain outstanding:

1. Human integrated story pass through common Story 0–18 and each ending route 19/20/21.
2. Human verification of all 22 story-to-Match-3 transitions and each production level's objective completion, loss/retry, progression and return to story.
3. Full integrated save/continue/reload boundaries across VN → Match-3 → VN → ending (the E2E suite covers representative persistence paths, not every boundary).
4. The actual iPhone checks `KI-006` and `KI-007` during an integrated route. Desktop Chromium and mobile viewport emulation are not equivalent to iOS Safari/PWA.
5. A full runtime crawl that opens and decodes every shipped asset actually referenced by all story and Match-3 routes.

G5b's Match-3 design/balance/variety acceptance remains accepted by the user; this report does not reopen it. No production gameplay files were changed during this audit.

## Reproduction

From `e2e/`, with the existing dependency tree:

```powershell
$env:UPDS_E2E_BASE_URL = 'https://bezdredoff.github.io/UPDS/'
npm.cmd run test:chromium -- --workers=1 --grep-invert 'candidate-preview'
```
