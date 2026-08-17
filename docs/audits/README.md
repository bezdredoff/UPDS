# Audit snapshots

This directory stores dated, human-readable audit evidence that is useful for historical context but is **not** an active source of truth.

Repeatable validation belongs in executable repository contracts:

- `npm run docs:audit`
- `npm run story:audit`
- `npm run character:audit`
- `npm run scene:audit`
- `npm run localization:audit`
- `npm run tooling:audit`
- normal `npm run check` / GitHub CI

The manual **UPDS Audits** GitHub Action exposes these targeted suites from a phone or browser. Current feature status remains in `docs/ROADMAP_RU.md`; machine-readable production/runtime contracts remain authoritative over dated prose snapshots.
