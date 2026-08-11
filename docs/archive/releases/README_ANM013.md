# ANM-013 · VN Pre-release UX + Golden Sample Alignment

Build: `0.13.0-anm013`.

Цель — довести VN-часть vertical slice до pre-release UX, сохранив канон, стабильные VN IDs, save key и production rig contract.

Ключевые изменения: backlog/LOG, skip только прочитанного, AUTO с настройкой скорости, manual save/load controls поверх существующего autosave, text-size config, корректный resume на `CHOICE_00`, priority preload следующего VN-фона/портрета, runtime показ `VN0246–VN0249` и нативный UI pass по утверждённому VN Golden Sample.

Подробный scope и ручной QA: `docs/ANM013_VN_PRE_RELEASE_UX_RU.md`.

Проверка:

```bash
npm ci
npm run check
```
