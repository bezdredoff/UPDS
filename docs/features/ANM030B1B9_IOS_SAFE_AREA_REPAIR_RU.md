# ANM-030B1B9 — iOS safe-area repair

Status: **R4 candidate; requires GitHub CI and installed-iPhone preview QA**.

## Problem

Real standalone iPhone screenshots exposed two shared-shell regressions that the desktop-sized
browser matrix did not reproduce:

- sticky headers inside `.panel` moved into the status-bar area after the panel was scrolled;
- most non-VN screens stopped above the physical bottom edge and exposed the dark page background.

The first defect came from a negative safe-area-derived sticky offset. R1 then exposed an
additional cascade defect in Mobile WebKit E2E: the later `.panel-nav { padding: 6px; }` shorthand
overrode the shared `.app-header` safe-area padding. R2 removed that shorthand and fixed the header.

R2 did not fix the remaining bottom strip on an installed iPhone. Its E2E compared the shell with
`window.innerHeight`, so the test accepted the same shortened standalone layout viewport that
caused the real gap. Safari and Chrome tabs visually masked that area with their own browser UI.

R3 still left the strip on the real device. `100lvh` and `100dvh` resolve to the same shortened
standalone viewport there, while the translucent status bar places the page origin at the physical
top. The missing bottom span matches the top safe-area inset. The R3 E2E hid this mistake by
overriding `--physical-viewport-height` with the expected answer instead of exercising production CSS.

## R4 runtime contract

- PWA bootstrap publishes the detected display mode as `data-upds-display-mode` on `<html>`.
- Normal browser tabs keep `--physical-viewport-height: 100dvh`.
- Installed standalone mode uses
  `--physical-viewport-height: calc(100dvh + var(--safe-area-top))`. This adds back the top inset
  excluded from the standalone viewport while the translucent status bar keeps the page at physical
  `top: 0`.
- `.viewport-shell` is pinned to the physical top and horizontal edges and receives the explicit
  physical height token; it no longer derives its bottom from `inset: 0`.
- On phone widths `.phone` and every active player screen continue to fill the shell with
  `height: 100%`.
- `.app-header` remains the only owner of top safe-area presentation inside panel navigation.
- Bottom content padding continues to consume `--safe-area-bottom` on each scrolling/content surface.

No feature controller reads `env(safe-area-inset-*)`; physical inset discovery remains centralized
in `src/viewport.css`.

## Regression protection

- Vitest locks the `100dvh` browser default, the standalone `100dvh + safe-area-top` formula and the
  runtime display-mode marker; the rejected `100lvh` formula is forbidden.
- Mobile WebKit E2E injects representative `59px` top and `34px` bottom insets. It does not override
  the physical-height token, so production CSS itself must extend the shell by the top inset.
- The E2E checks the bottom edge of `.viewport-shell`, `.phone` and the active screen on the main
  menu, Settings and Match-3 Campaign. A body-background strip can no longer pass by matching only
  the shortened `window.innerHeight`.
- The scrolled Settings header action must still remain below the top inset.

## Candidate QA

On the generated `/preview/`, remove the previous installation, then install the candidate again.
The install-time viewport metadata and standalone launch state must come from this candidate.

1. Main menu reaches the physical bottom edge without a dark empty strip.
2. Settings header remains below time/signal/battery both at the top and after scrolling down.
3. Dossier header remains below the status area after scrolling the clue list.
4. Match-3 Campaign reaches the physical bottom edge and keeps its already-correct header inset.
5. VN top bar, dialogue controls and bottom inset remain unchanged.
