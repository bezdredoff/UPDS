# ANM-018 — Manual QA

ANM-018 is intended to be behavior-neutral. The preview check should focus on accidental regressions from code/test/document restructuring.

## Critical smoke

1. Main menu renders and buttons work.
2. Start/Continue opens VN.
3. VN header CASE / LOG / Settings renders as before.
4. Two-line dialogue paging and continuation `…` still work.
5. Nameplate and half-body portrait seam are unchanged.
6. Settings opens and returns to caller.
7. Start Match-3 and perform tap, swipe and drag swaps.
8. Hint, invalid swap feedback and cascade motion still work.
9. Dossier opens and returns correctly.
10. Audio settings still persist.
11. Diagnostics exports save/diagnostics/playtest JSON.
12. PWA status/update controls render; stable and preview remain separate.

## Repository check after merge

GitHub root should show only normal project/config files plus `README.md`; historical ANM README/validation/QA documents must be under `docs/archive/`, not root.
