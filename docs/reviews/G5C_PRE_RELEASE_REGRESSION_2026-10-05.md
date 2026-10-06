# G5c release regression — preflight 2026-10-05

## Scope and baseline

This is an agent-run preflight for G5c, not final device acceptance. It was run against the current merged `main` at `d784cb3` (PR #368) and the published stable GitHub Pages build at <https://bezdredoff.github.io/UPDS/>. The published identity is `v0.27.3-dev`, build `build-37327491130-d784cb3ac4c1` (`2026-10-05T14:47:39.280Z`). G5c remains queued until the real-device and release-owner checks below are completed.

## Checks completed by Codex

| Area | Result | Evidence / limits |
| --- | --- | --- |
| Repository Quality | Pass | `npm run check`: lint passed; **777/777 unit tests** passed; production build passed. `npm run check:fast`: lint and typecheck passed. |
| Chromium against stable Pages | Pass with one expected environment failure | **43 passed, 7 skipped, 1 failed**. The sole failure is `candidate-preview` requesting `/UPDS/preview/`, which is not served by the stable Pages deployment (404); stable-root smoke passed. Skip counts include the mobile-only visual suite and viewport cases that only apply to Mobile WebKit. |
| Browser flows / accessibility assertions | Pass in Chromium | Match-3 at 320×568, 390×844 and 440×956; 44px touch-target minimum; objective labels/no horizontal scroll; hint and drag; save/Continue; RU/BE/EN selection and multi-page VN; keyboard focus trapping; VN and Match-3 flows. These are browser assertions, not VoiceOver/TalkBack certification. |
| PWA manifest and published resources | Pass | `build.json`, `manifest.webmanifest`, `sw.js`, and manifest icons 192×192 and 512×512 returned HTTP 200. Manifest has relative `start_url`/`scope`, `standalone` display and portrait orientation. |
| Warm-cache offline reload | Pass in isolated Chromium profile | Service worker activated for `https://bezdredoff.github.io/UPDS/`; cache held 160 same-origin entries, including `index.html` and the app JS bundle. After network was disabled, a cold page reload returned to the game menu. This does not prove a true device cold install or offline asset coverage through every story route. |
| Mobile WebKit against stable Pages | **Inconclusive; suite not green on this host** | Full Windows Playwright iPhone-profile run: **19 passed, 18 failed**. Failures were dominated by uncaught WebKit access-control errors for `build.json`/`sw.js` during the long combined run; the five visual Golden Samples also lack authoritative Windows baselines (the project snapshots are Linux WebKit). Isolated reruns of the inactivity-hint and language-persistence cases passed, and a direct WebKit session registered the service worker and fetched `build.json` successfully. Treat this as a combined-suite/host diagnostic, not evidence of an iPhone defect or an accepted WebKit pass. Rerun the authoritative Mobile WebKit lane in the pinned Linux Playwright CI environment before RC. |
| Candidate preview route | Expected unavailable on stable host | The stable Pages URL does not publish `/preview/`; preview smoke is not a stable-release failure. |

## Additional findings

- `npm audit --audit-level=high` reports **two moderate** advisories through `vitest` → `@vitest/mocker`. The suggested automatic fix requires moving to Vitest 5, a major-version change; no dependency changes were made in this audit. Review before RC and plan a compatible upgrade separately if needed.
- Vite warns that the minified main JavaScript chunk is about **1,056.77 kB** (279.90 kB gzip), above its 500 kB advisory threshold. This is a performance review item: check actual mobile cold-load/perceived startup on target devices before deciding whether code splitting is required.
- Browser automation cannot verify installation from Safari/Chrome menus, OS update behavior, true cold-start offline launch after install, real device safe areas, or screen-reader behavior.

## User-provided phone results — 2026-10-05

The release owner reported this first manual pass on the published build above. Device model, OS version and browser versions were not supplied.

| Checks | Reported result | Notes |
| --- | --- | --- |
| IOS-01–03 | Pass | Installed, launched online and restored progress after reload. |
| IOS-04 | Pass / no count shown | Online diagnostics did not show a cache error count. |
| IOS-05 | Flow works; defect observed | Offline launch succeeded, but diagnostics showed **166 cache errors**. |
| IOS-06–07 | Pass | VN and Match-3 worked offline; online recovery worked and the cache warning disappeared. |
| LANG-01 | Pass | Russian screens were reported working. |
| LANG-02–03 | Pass with localization defect | Belarusian and English worked, but a title/text in the dossier-update toast remained Russian in both locales. |
| AND-01–07 | Not started | Android validation remains with the release owner. |
| A11Y-01–03 | Not required by tester | Recorded as not applicable, not as passed accessibility checks. |
| UPDATE-01 | Waiting | Requires a newer published build. |
| REL-01 / REL-03 | Pending | Final title/icon and target distribution platforms are not decided. |
| REL-02 | Confirmed | User confirmed included materials are cleared and credits are present. |

The reported cache count was caused by offline warm-up retries treating a resource that was already in Cache Storage as a failed network fetch. `G5c-PWA-001` changes the worker to count an existing cache entry as ready. The localized notification fix is tracked as `G5c-I18N-001`: VN now supplies the active-locale `match3.level.<level-id>.clueTitle` to the toast. Both changes are candidate fixes only; the iPhone offline and BE/EN phone checks must be repeated after publication. Known issues `KI-013` and `KI-014` therefore remain open pending that retest.

## Checks still required from release owner

Use the exact published URL and build identity above, and record device/OS/browser/build details and pass/fail for each item.

1. **iPhone / Safari:** install with Share → Add to Home Screen; launch the standalone app online; verify menu, VN, Match-3, bottom safe area, no clipping/zoom, and save/Continue.
2. **iPhone offline/recovery:** after a successful online launch and cache-ready indication in Settings/Diagnostics, enable Airplane Mode, fully close and relaunch the installed app, open a saved VN and Match-3 level, then restore connectivity and confirm recovery.
3. **Representative Android / Chrome:** install from the browser prompt/menu; repeat launch, save/Continue, offline cold relaunch and online recovery. Record model, Android and Chrome versions.
4. **Real update path:** when a newer published build exists, open the installed app online, use the in-app update prompt, apply it, and verify progress/save survives. The currently published build cannot validate a real old-build → new-build update by itself.
5. **Device language/readability:** on both phone sizes where available, inspect RU, BE and EN through menu, settings, VN, choices and Match-3 Help; note clipped text, overflow or inconsistent terminology.
6. **Accessibility:** verify VoiceOver on iOS and TalkBack on Android for the primary navigation, settings, VN choices, Match-3 board/objectives, Hint and dialogs. Confirm focus/reading order, meaningful names, and that reduced-motion does not block progression.
7. **Release-owner product checks:** confirm final title/description/icons, credits and asset rights, and any platform-required privacy/content/age notices before public release.

## Acceptance state

The agent-verifiable preflight is largely green, with the Windows Mobile WebKit combined-suite result requiring authoritative CI rerun. The user has completed part of the iPhone/language matrix; G5c remains **open**. KI-002 (cold offline launch/startup precache on real iOS/Android PWA), KI-013 (offline cache error count) and KI-014 (BE/EN clue-title localization) remain **open** until the applicable device checks are recorded on the fixed published build. Do not treat this report as RC approval.
