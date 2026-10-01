# Рина — интеграция принятой позы v2

Neutral v2 явно принят пользователем 2026-10-01; интегрированы только пять Pose A.
Pose B и medallion не изменены. Исходники до интеграции находятся в `source/`.
`prepare.mjs` воспроизводит перенос original expression RGB в face ROI на exact
принятый master из `output/art-review/rina-pose-v2/neutral-candidate.png`.
Он проверяет SHA master и сохраняет alpha master во всех выражениях.
Не запускать автоматически: recipe заменяет пять runtime кадров по явному запросу.

`qa.json` фиксирует source/output hashes, original face RGB, общую alpha,
pixels вне ROI, bounds и защищённые два PNG. `edit-mask.png`, `workflow-api.json`
и `provenance.json` документируют исходную локальную ComfyUI правку руки.
`review.png` показывает пять лиц и позу; runtime не использует эти authoring files.

Проверки: `npm run character:audit`, `npm run check`.
Принятые лица не перегенерированы. По явному запросу пользователя радужки
smile/serious/embarrassed локально перекрашены из коричневых в зелёные по палитре
принятого neutral. `iris-masks/` точно ограничивает разрешённые изменения RGB;
альфа, тёмные зрачки, белые блики и лицо вне масок сохранены.
`prepare.mjs` воспроизводит и перенос лиц, и цветокоррекцию. Пакетная визуальная
приёмка и scene/device QA не подменяются успешными pixel tests.
