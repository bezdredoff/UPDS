# G4a-FACE-REPAIR — шесть правок лица

Дата: 2026-10-01. Baseline: `5ae91a3c428b20b22380384795b5d51759fae7f1`,
после пользовательского merge Эми (#315) и alpha Мику (#316).
Статус: все шесть лиц визуально утверждены пользователем 2026-10-01;
PR #317 merged пользователем. Quality, Chromium и Mobile WebKit passed.
Финальная runtime/device приёмка остаётся отдельной проверкой.

Мику surprised v1 принята ранее; остальные пять приняты ответом
«Да. Утверждаю. Жду прохождения последних тестов и сливаю».
Последующая alpha-only очистка Оноэ описана в ONOE_ALPHA_CLEANUP_2026-10-01.md;
для прежнего face gate сохранён промежуточный PNG из #317.

## Состав и границы

| Кадр | Исправление | Приёмка |
| --- | --- | --- |
| Мику surprised | ровный взгляд, небольшой естественный открытый рот | user-approved |
| Оноэ surprised | исходные бирюзовые радужки, естественное удивление | user-approved |
| Рина surprised | зелёные радужки вместо чёрных точек, естественное удивление | user-approved |
| Куросэ surprised | очки, нормальные радужки, зрелое лицо | user-approved |
| Куросэ embarrassed | очки и зрелые черты, сдержанное смущение | user-approved |
| Винсент smile | узкая закрытая улыбка без широкой усмешки | user-approved |

Только эти шесть PNG; утверждённые neutral/Pose B/medallion и прочие эмоции не меняются.
Пряди Оноэ и Pose A Рины не исправляются этим пакетом. KI-005/G4a остаются открытыми.
Исторический экспорт ревью сохраняет исходные оценки и hashes, не переписывается.

## Workflow и воспроизводимость

Сохранённый guest/Mayu ComfyUI Flux2-Klein-9B-True-V3-fp8mixed,
qwen_3_8b_fp8mixed, flux2-vae; Euler, два прохода по 8 шагов, 0.75 MP face crop.
Neutral задаёт идентичность, цвет глаз и возраст; rejected expression задаёт
неизменную основу тела и alpha. Новое лицо feather-composited в ограниченный ROI.
Для Мику сохранены прежние две feature ROI; для Оноэ/Рины/Куросэ применён единый
face ROI с feather 12 px, чтобы не создавать переходов оттенка кожи между вставками.
Винсент меняется только в mouth ROI. После ComfyUI composite побитово восстанавливаются
alpha всего canvas и все pixels вне ROI исходного PNG, включая скрытый RGB.

QA и hashes: [машиночитаемый manifest](../art/FACE_REPAIR_BATCH_2026-10-01.json).
Промпты, seeds, API graphs и порядок повторения: [инструкция](../art/face-repair-2026-10-01/README_RU.md).
Сравнения neutral/old/new сохранены рядом с инструкцией: review-1.png, review-2.png.
Исходники для отката: `output/art-review/face-repair-batch-v1/backup/`;
полный локальный пакет также сохраняется в `C:/git/UPDS-art-work/face-repair-batch-v1/`.

Для всех шести кадров: 1024×1536 RGBA, 0 alpha changes, 0 изменений вне ROI;
исходные alpha bounds и staging metadata сохранены. Это не утверждение об одинаковых
alpha всех эмоций одного персонажа: сохранена alpha каждого собственного исходника.
Добавлен `FaceRepairPreservation.test.ts`, проверяющий decoded alpha/outside-ROI hashes
по исходным baseline pixels, включая PNG Винсента. Общий 63-asset digest:
`121a522c5f47f81e5ad83b28da0f011a8f5d258412c2efd0fcb3cec89b46cf93`.

## Проверки

Локально успешно: 149 файлов / 733 теста полного Vitest, character geometry/adoption,
7 новых preservation tests, asset inventory (0 path/decode errors), docs audit
(11 тестов), lint, TypeScript и production build. Прежнее предупреждение о bundle
больше 500 kB остаётся. `character:audit` теперь включает preservation tests.
GitHub Quality и обе Browser Gate lanes #317 успешно завершены до пользовательского merge.
Linux golden samples
и lineup digest не меняются без фактического различия и просмотра CI attachments.
Этот пакет не меняет neutral lineup или trio embarrassed baseline, поэтому новые
visual approvals не подменяются автоматическим обновлением snapshots.
Пользовательская приёмка пяти новых лиц и игровых сцен остаётся обязательной.
