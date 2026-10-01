# Маю v7 — локальная интеграция

Дата: 2026-10-01. Статус: **локально интегрировано; ручная игровая приёмка открыта**.
Интеграция выполнена по запросу пользователя. По последующему запросу подготовлен
отдельный GitHub PR поверх актуального main; merge/deploy не выполнялись агентом.

## Состав и происхождение

Все семь файлов в `public/assets/characters/mayu/` заменены единым пакетом:
пять эмоций Pose A, `poses/pose_b_phone_documents.png`,
`medallions/portrait_neutral_256.png`. Пути и сюжетная роль не менялись.
Исходник — утверждённая поза v6 и спортивный дизайн v5b; ComfyUI final guests v10
Flux2-Klein, два прохода по 8 шагов. Промпты и API graphs сохранены в
`output/art-review/mayu-v7-package/workflows/`, редактируемые визуальные graphs —
в `visual-workflows/` того же пакета и в ComfyUI `UPDS_Mayu_v7_EDITABLE`.

Кандидаты: `output/art-review/mayu-v7-package/candidate/public/assets/characters/mayu/`.
Backup прежних семи PNG:
`output/art-review/mayu-v7-package/backup-before-integration-20261001/public/assets/characters/mayu/`.
Для отката также восстановить прежние bounds `(268,29)-(756,1508)`, eye-line 190 px
в production manifest/doc mirror и прежние digest из Git. Backup вне runtime.

## Геометрия и воспроизводимость

Stage: 1024×1536 RGBA; portrait: 256×256 RGBA; alpha-height: 1479 px.
Pose A bounds `(295,42)-(728,1521)`, Pose B `(294,42)-(729,1521)`;
правый/нижний край исключающий. Eye-line neutral: 176 px, визуальная отметка
по центрам глаз; финальная оценка рядом с остальным составом остаётся ручной.
Pivot `(0.5,1)`, scale 1, yPercent 0. Тело и alpha совпадают между пятью эмоциями;
face ROI `(452,142,123,108)`. Проверки кандидатов сохранены в QA JSON пакета.

Перед копированием и после него SHA-256 всех семи PNG сверены с candidate-manifest.
Digest семифайловой Маю:
`889eee1d848c4cd3d97cba6d9e905cc0e02e92e9de514400fbb7de136da76122`.
Digest полного runtime набора из 63 файлов:
`2a03f72ba4fef2252d6172ce238e0bda3dbbe5565d5ecadbcd910f8b4a7a9b7c`.
Остальные восемь character digests не изменены.
Контрольные суммы закреплены в `tests/CharacterArchiveAdoption.test.ts`;
геометрия — в `src/data/characterProduction.ts` и doc mirror.

## Проверка и оставшаяся приёмка

Автоматические gates пройдены: полный suite — 148 файлов / 726 тестов,
включая character/assets/docs audit; lint и production build успешны.
Сборка сообщает прежнее предупреждение о размере JS bundle, не ошибку.

PR #314: первый GitHub Quality gate и Chromium E2E пройдены. Mobile WebKit
остановился только на прежнем digest общего Scene Studio lineup после замены Маю.
Проверен Linux CI attachment `full-cast-lineup` из run `36854301920`:
SHA-256 `738ec5e4450dedd80ba6dab490c512ebb3cf5738892c261a459217e82e74c112`.
Оба запуска (основной и retry) дали тот же hash. 2026-10-01 обновлён только
`fullCastLineupDigest` в `e2e/tests/visual-regression.pw.ts` с этим provenance.
Остальные Golden Samples и строгая проверка digest не изменены;
Windows snapshots не создавались. Повторный GitHub Browser Gate требуется
для подтверждения исправления; это не означает пользовательскую device-приёмку.
Они не заменяют ручной просмотр. Для завершения G4a-MAYU:

- Сравнить Маю с Оноэ и Мику в Scene Studio, проверить рост/eye-line и опору ног.
- Просмотреть все пять эмоций подряд: тело не должно прыгать.
- Проверить Pose B и портрет, обрезку диалогом и отсутствие старого дизайна.
- После публикации проверить на телефоне свежую версию без старого PWA cache.

Исходный арт-экспорт 2026-09-30 не изменялся. Его 33 rework / 13 blocker относятся
к прежним hash. Остальные 26 замечаний, включая шесть blocker, остаются в очереди.
G4a-MAYU и общий G4a пока не закрыты; G0/G3 остаются accepted.
