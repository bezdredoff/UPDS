# ANM-030B1B7 — audit delta

После подключения `BG_BASKETBALL_LOCKER.webp`:

- `basketball-locker`: `runtime-fallback` → `production`;
- dedicated production background variants: `13/24` → `14/24`;
- runtime semantic background aliases: `11` → `10`.

Следующим плановым audit synchronization pass эти значения должны быть перенесены в `src/content/art/ANM030A.asset-gap-audit.json` и release backlog вместе с другими visual-production deltas, если до этого файла не будет отдельного text-only update.
