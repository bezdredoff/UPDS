# ANM-023G4A — Pages Preview Rerun Idempotency

Статус: инфраструктурный hotfix между ANM-023G4 и ANM-023G5.

## Причина

Во время ANM-023G4 GitHub Pages несколько раз возвращал HTTP 503 при создании preview deployment. Повторный запуск того же workflow run увеличивает `github.run_attempt`, но до hotfix `actions/upload-pages-artifact` каждый раз публиковал artifact с одним и тем же именем `github-pages`.

После нескольких попыток `actions/deploy-pages` обнаруживал больше одного artifact с именем `github-pages` внутри одного workflow run и завершался ошибкой `Multiple artifacts named "github-pages" were unexpectedly found`.

## Контракт исправления

Preview job использует attempt-scoped имя:

`github-pages-${{ github.run_attempt }}`

Оно передаётся одновременно:

- в `actions/upload-pages-artifact@v5` через `name`;
- в `actions/deploy-pages@v4` через `artifact_name`.

Таким образом каждый rerun создаёт собственный Pages artifact, а deploy выбирает artifact именно текущей попытки.

## Что не меняется

- mobile ZIP validation остаётся read-only до создания candidate branch;
- protected workflow по-прежнему нельзя менять через mobile ZIP;
- stable root + `/preview/` topology не меняется;
- candidate branch naming по `GITHUB_RUN_ID` остаётся детерминированным и переиспользуется при rerun;
- PR CI и ручной merge остаются обязательными gates.

`tests/PagesPreviewRerunContract.test.ts` защищает attempt-scoped upload/deploy pairing от случайной регрессии.
