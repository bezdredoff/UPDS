# G5b-PT3-M3-ART-001 — blocker PNG redesign

## User retest evidence

The first integrated phone retest accepted removal of layer numbers and found that the current solid/locked rendering reveals covered tiles better. It also found an unexplained doubled outline/ghost box on M3_01 and a square tile behind the locked chains.

## Candidate changes

- Replace the box image with `public/assets/match3/obstacle_zip_bag.png` for the shared `solid` presentation used by every campaign level and Level Lab. Remove the former box PNG and CSS pseudo-element bag overlay so only one authored silhouette remains.
- Replace the locked image with `public/assets/match3/obstacle_locked_cell_redraw.png`. The square cell backing is removed, the padlock is retained and chain runs extend diagonally corner-to-corner.
- Keep both assets 256×256 RGBA and use real alpha rather than a CSS approximation. Generated source candidates are retained under `docs/art/g5b-blocker-redesign-2026-10-04/raw/`.

## Acceptance still required

This PR integrates generated candidates, not user-approved final art. On a merged phone build, inspect all solid levels plus representative locked levels at tile size. Confirm the zip bag reads clearly without masking its tile or leaving a ghost outline, and the locked chains span the tile with no unwanted backing square. If either sprite needs adjustment, revise the candidate before closing G5b-PT2-M3-002.
