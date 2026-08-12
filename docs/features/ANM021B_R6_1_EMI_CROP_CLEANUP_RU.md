# ANM-021B R6.1 — Emi Crop Cleanup

R6 visual QA found detached fragments from neighboring sprites in Emi Pose A crops.
R6.1 changes only Emi PNG alpha topology; runtime/staging/expression routing is unchanged.

Cleanup rule:
- preserve the main connected character silhouette;
- preserve only tiny detached details fully enclosed by its bounding box;
- remove large detached alpha islands near crop boundaries;
- transparent pixels have RGB zeroed to avoid fringe contamination.

Manual preview QA remains mandatory for hands, elbows, hair edges and all five expressions.
