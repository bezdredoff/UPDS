# ANM-030B1B9 — iOS safe-area repair

Status: **R2 candidate; requires GitHub CI and iPhone preview QA**.

## Problem

Real standalone iPhone screenshots exposed two shared-shell regressions that the desktop-sized
browser matrix did not reproduce:

- sticky headers inside `.panel` moved into the status-bar area after the panel was scrolled;
- most non-VN screens stopped above the physical bottom edge and exposed the dark page background.

The first defect came from a negative safe-area-derived sticky offset. The second came from sizing
the mobile game surface with `100dvh` instead of pinning the physical shell to the browser canvas.
VN visually masked the bottom gap because its background already used the same dark color.

R1 exposed one additional cascade defect in Mobile WebKit E2E: the later
`.panel-nav { padding: 6px; }` shorthand overrode the shared `.app-header` safe-area padding. R2
removes that shorthand so the shared header remains the single owner of the top inset before and
after the panel becomes sticky.

## Runtime contract

- `.viewport-shell` is the physical fixed containing block (`position: fixed; inset: 0`).
- On phone widths `.phone` fills that containing block with `width: 100%; height: 100%`.
- `.app-header` remains the only owner of top safe-area presentation inside panel navigation.
- `.panel` no longer adds a second top inset.
- `.panel-nav` sticks at `top: 0`; it must never use a negative safe-area offset or margin.
- Bottom content padding continues to consume `--safe-area-bottom` on each scrolling/content surface.

No feature controller reads `env(safe-area-inset-*)`; physical inset discovery remains centralized
in `src/viewport.css`.

## Regression protection

- Vitest locks the fixed physical shell, non-negative panel-header ownership and prevents
  `.panel-nav` from overriding the shared header padding shorthand.
- Mobile WebKit E2E injects representative `47px` top and `34px` bottom insets, scrolls Settings,
  checks that the header action stays below the top inset, and checks full-height geometry on the
  main menu, Settings and Match-3 Campaign.

## Candidate QA

On the generated `/preview/`, verify on a standalone iPhone PWA:

1. Main menu reaches the physical bottom edge without a dark empty strip.
2. Settings header remains below time/signal/battery both at the top and after scrolling down.
3. Dossier header remains below the status area after scrolling the clue list.
4. Match-3 Campaign reaches the physical bottom edge and keeps its already-correct header inset.
5. VN top bar, dialogue controls and bottom inset remain unchanged.
