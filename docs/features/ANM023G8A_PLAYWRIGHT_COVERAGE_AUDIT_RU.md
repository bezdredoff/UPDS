# ANM-023G8A — Playwright Coverage Audit & QA/Production Parity Matrix

Status: R1 complete / PR #162. Updated by G8B candidate to keep the live browser inventory traceable.
Baseline after G8A: 7 specs / 20 Chromium cases / 15 Mobile WebKit critical cases.
Current G8B candidate inventory: 8 specs / 21 Chromium cases / 15 Mobile WebKit critical cases.

## Цель

Browser Gate должен защищать реальные production boundaries без второго игрового runtime, Selenium/WebDriver и полного прогона 976 VN-линий на каждый PR.

## Current browser inventory

| Spec | Cases | Entry point | Boundary | Lane | Verdict |
| --- | ---: | --- | --- | --- | --- |
| `boot.pw.ts` | 1 | normal boot | production bundle/Main Menu/browser health | Chromium + WebKit | keep |
| `pages-smoke.pw.ts` | 2 | stable + preview Pages | deployment topology | Chromium | keep |
| `harness.pw.ts` | 3 | QA Scene Navigation / Campaign / Lab | deterministic QA → production parity | Chromium | keep |
| `vn-navigation.pw.ts` | 3 | QA Scene Navigation | paging/staging/choice rendering | Chromium + WebKit | keep |
| `match3.pw.ts` | 4 | Campaign + Level Lab | mechanics/hints/cascade/specials | Chromium + WebKit | keep |
| `persistence-localization-flow.pw.ts` | 3 | New Game / Continue / Settings | early persistence/locale/first M3 boundary | Chromium + WebKit | keep |
| `visual-regression.pw.ts` | 4 | reviewed QA/player surfaces | four mobile Golden Samples | WebKit authoritative | keep |
| `story-completion.pw.ts` | 1 | Diagnostics → Story win QA | real Match3Game win → evidence → VN → persisted Continue | Chromium | G8B candidate |

No current spec is recommended for deletion. Functional, topology, QA-parity and visual overlaps protect different layers.

## QA → production parity

### QA Scene Navigation → production VN

`AnimeDetectiveApp` still constructs one `VnController`. QA Scene Navigation enters the same shared runtime frame and authored/fallback staging path as normal Story play. It remains the preferred deterministic surface for local VN presentation checks.

### Match-3 Campaign / Level Lab / Story → production Match-3

`AnimeDetectiveApp` still constructs one `Match3Controller`. Story, Campaign and Lab differ by lifecycle mode but share production `Match3Game`, board rendering and move resolution.

G8B adds one additional visible QA setup for a cross-system Story boundary. The fixture changes only the synchronous start configuration long enough for production `startMatch()` to construct a real `Match3Game`; it restores the canonical level registry before player input. Victory is still produced only by `Match3Game.attemptSwap()`, and the normal `completeLevel()` owns clue/save/evidence/VN routing.

## Coverage gaps

### P0 — Story Match-3 completion → evidence → post-win VN — G8B candidate coverage

G8A identified this as the largest missing production boundary. G8B covers it with one deterministic M3_00 fixture:

`visible QA setup → real swap → Match3Game won → completeLevel() → CUE_001/evidence → VN0058 → reload → Continue → VN0058`.

The test does not call a force-win API, mutate Match3Game internals or write completion state through browser storage.

### P0 — Match-3 Campaign completion/progression

Still open for G8C2:

- campaign win result;
- persisted `completed`;
- `bestMovesLeft`;
- next-level unlock;
- next/replay/hub behavior.

### P0/P1 — Real pointer drag/swipe input

Still open for G8C1. Existing browser mechanics use tap-based swaps. Production `pointerdown → pointermove → pointerup → attemptMatchSwap(..., 'drag')` still needs a real browser pointer test.

### P1 — Later Story/Continue representative boundaries

Do not replay all 976 lines. Add only a later Story boundary if it protects distinct routing/save risk not already covered by the first Story completion journey and graph/content contracts.

## Follow-up split

- **G8B Story/VN Production-Flow Expansion** — current candidate: first Story Match-3 completion → evidence → post-win VN → persisted Continue.
- **G8C1 Match-3 Browser Interaction Parity** — planned: real pointer drag/swipe and short-drag no-op on deterministic production Match-3.
- **G8C2 Match-3 Completion & Progression Flow** — planned: Campaign win result/persistence/unlock/next/replay/hub.

Chromium remains the full-suite owner. G8B intentionally remains Chromium-only; Mobile WebKit stays at 15 critical cases. G8C1 is the strongest candidate for later WebKit inclusion because pointer/touch interaction is mobile-critical.

## Guardrails

- Playwright is the only browser/E2E stack.
- Selenium/WebDriver is not added.
- No `window.__UPDS_TEST__` or force-win API.
- QA setup may make a boundary deterministic, but production game code must produce the outcome.
- Existing four Golden Samples remain unchanged.
