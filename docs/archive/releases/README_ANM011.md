# ANM-011 — Infrastructure Hardening

**Version:** `0.11.0-anm011`  
**Base:** ANM-010 GitHub/phone pipeline  
**Scope:** runtime/storage/diagnostics/asset resilience only.

ANM-011 is the first full candidate intended to pass through the ANM-010 mobile ZIP pipeline end to end.

## Added

- safe `localStorage` probe with in-memory fallback;
- save schema metadata while preserving the exact existing save key and ANM-010-readable flat save shape;
- automatic backup of corrupt saves and recovery to a playable fresh state;
- JSON save export/import with foreign-key and future-schema rejection;
- persistent capped runtime error log;
- global `error` and `unhandledrejection` capture;
- runtime image failure tracking and graceful fallback;
- idle preload of the registered runtime asset catalog;
- build ID and build timestamp injected at Vite build time;
- QA service screen for save import/export, diagnostics export, recovery backup export, storage/error/asset status;
- ANM-011 regression tests.

## Explicitly unchanged

- story canon;
- `ANM-003` screenplay and stable VN IDs;
- branch `CHOICE_00` semantics;
- four level definitions and move budgets;
- match-3 engine rules;
- character model sheets / art direction;
- `base + face overlay` rig contract;
- save key `seiran-detectives-anm009-v1`.

## Save compatibility

ANM-011 intentionally stores schema metadata at the top level of the existing save object rather than wrapping state in a new envelope. ANM-010 ignores the extra keys and still reads the gameplay fields. This matters because GitHub Pages `/` and `/preview/` share one browser origin and therefore the same `localStorage`.

External export files use an explicit `upds-campaign-save` envelope. Import accepts that format and legacy flat UPDS saves, but rejects foreign save keys and schema versions newer than ANM-011 supports.

## Manual QA focus

1. Open existing ANM-010 save in ANM-011 preview; Continue must preserve progress.
2. Advance one VN line in preview, return to stable `/`; ANM-010 must still read the save.
3. Export save JSON, reset or change progress, import it and verify Continue position.
4. Export diagnostics on iPhone and verify a JSON file is produced.
5. Deliberately use DevTools or a local test to place invalid JSON under the save key; reload and verify a fresh playable state plus recovery backup indicator.
6. Verify normal face-overlay failures hide the overlay rather than replacing the whole character with a broken-image icon.
7. Verify missing non-face images use the neutral fallback graphic and appear in diagnostics.
