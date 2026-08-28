# ANM-030B1B9 — iOS safe-area repair

Status: **R7 candidate; requires GitHub CI and installed-iPhone preview QA**.

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

R4 replaced `100lvh` with `calc(100dvh + var(--safe-area-top))`. Real installed-iPhone QA then
confirmed the important result: the strip disappeared because player content itself extended to
the physical bottom.

R5 misclassified the remaining lower span as a separate compositor canvas and removed the R4
extension. It introduced per-screen root-background colors while returning the player shell to
`100dvh`. The short browser simulation accepted that compromise, but later installed-PWA use
proved it was a regression: the dark-blue strip returned and player content again ended above the
physical bottom. A color bridge can hide a seam only when iOS repaints that root canvas; it can
never make the interactive screen full-height.

The delay between merge and observation is expected for an installed PWA: a previously running
R4 build can remain active until the service worker publishes and the user applies a later build.

R6 restored the physical-height formula, but only tested the `390px`-wide iPhone 13 profile. The
outer `.viewport-shell` reached the expected physical bottom while the inner `.phone` still used
its base `width: min(100vw, 430px)` and `height: min(100dvh, 932px)` rules whenever the viewport was
wider than the legacy `@media (max-width: 430px)` override. Current large iPhones expose a `440px`
CSS viewport. On those devices the shorter `.phone` was centered inside the correctly enlarged
shell, recreating both the visible lower strip and the shortened player content. R6 asserted the
outer and inner geometry, but its narrow device profile made the bad branch unreachable.

## R7 runtime contract

- PWA bootstrap publishes the detected display mode as `data-upds-display-mode` on `<html>`.
- Normal browser tabs keep `--physical-viewport-height: 100dvh`.
- Installed standalone mode uses
  `--physical-viewport-height: calc(100dvh + var(--safe-area-top))`; this restores the missing
  physical span without changing browser-tab geometry.
- In portrait standalone windows up to `520px` wide, `.phone.game-viewport` fills the shared shell
  in both axes and drops the desktop frame's max-size and shadow presentation.
- The `430×932` cap remains valid for desktop/browser framing. It must never cap an installed phone;
  `520px` deliberately covers the current `440px` large-iPhone viewport without treating tablets as
  phones.
- The R5 `--upds-system-canvas-color` and screen-specific `:root:has(...)` mappings are removed.
  They are explicitly forbidden as a substitute for full-height player geometry.
- `.viewport-shell` is pinned to the physical top and horizontal edges and receives the explicit
  physical height token; it does not derive its bottom from `inset: 0`.
- `.phone` and every active player screen fill the shell with `width: 100%` and `height: 100%` on
  installed portrait phones, independently of the older `430px` breakpoint.
- `.app-header` remains the only owner of top safe-area presentation inside panel navigation.
- Bottom content padding continues to consume `--safe-area-bottom` on each scrolling/content surface.

No feature controller reads `env(safe-area-inset-*)`; physical inset discovery remains centralized
in `src/viewport.css`.

## Regression protection

- Vitest locks browser mode to `100dvh`, requires the standalone
  `calc(100dvh + var(--safe-area-top))` extension and continues to reject `100lvh`.
- Vitest rejects `--upds-system-canvas-color` and standalone screen-specific `:has(...)` mappings,
  so a later refactor cannot silently replace physical geometry with color camouflage.
- Mobile WebKit E2E switches to a `440px` large-iPhone viewport, injects representative `59px` top
  and `34px` bottom insets, and verifies shell/screen geometry against
  `window.innerHeight + 59px` on Menu, Settings and Match-3 Campaign.
- The E2E checks the bottom edge of `.viewport-shell`, `.phone` and the active screen on the main
  menu, Settings and Match-3 Campaign. A background-only strip can no longer pass by matching only
  the shortened `window.innerHeight` or by asserting a root color.
- The same E2E checks all left/right edges against the full `440px` viewport, so restoring a
  `430px` cap or narrowing the installed-phone override fails Browser Gate.
- The scrolled Settings header action must still remain below the top inset.

The architectural contract is duplicated intentionally in `ARCHITECTURE_RU.md`,
`PROJECT_CONTRACTS_RU.md` and `e2e/README.md`: installed-iOS physical full-bleed is a platform
invariant, not a temporary visual tweak.

## Candidate QA

On the generated `/preview/`, remove the previous installation, then install the candidate again.
The install-time viewport metadata and standalone launch state must come from this candidate.

1. Main menu content/background reaches all four physical edges; there is no dark-blue lower strip
   or narrow centered `430px` frame.
2. Settings header remains below time/signal/battery both at the top and after scrolling down.
3. Dossier header remains below the status area after scrolling the clue list.
4. Settings and Dossier content continue behind the home-indicator safe area without losing their
   bottom padding.
5. Match-3 Campaign and an active Match-3 board reach the physical bottom edge and keep their
   already-correct header/bottom insets.
6. VN top bar, stage, dialogue controls and bottom inset fill the same physical-height shell.
7. Repeat the checks after closing and reopening the installed candidate, not only in a Safari tab.
