# Исправления лиц — инструкция и provenance

Этот пакет содержит реальные prompts/seeds и API graphs, а не новый дизайн персонажей.
JSON в `workflows/` — API graphs для `/prompt`, не drag-and-drop UI workflows.
Для ручной работы можно использовать сохранённый визуальный workflow Маю v7:
`C:/StableDiffusion/ComfyUI-Desktop/user/default/workflows/UPDS_Mayu_v7_EDITABLE/`.
Заменить reference/base, face crop и ROI по manifest; не оставлять координаты Маю.

1. Сохранить текущие runtime PNG и записать их SHA256 до любых правок.
2. Neutral использовать как reference лица/радужек/возраста; expression — как base
   для сохранения body/camera/alpha. Не генерировать новое тело.
3. Prompts и seeds для двух проходов находятся в generation-jobs.json и API graphs.
   Euler и 8+8 шагов оставить; seed второго прохода равен первому +1000.
   Для Куросэ embarrassed используется финальный v2 graph с seed 101058/102058.
4. Для Мику принятый seed 101017/102017; исходный пакет находится в
   `C:/git/UPDS-art-work/miku/surprised-v1/`. Принятый PNG не перегенерировать без причины.
5. Сохранить pass1/pass2, применить composite graph с мягкой маской. Полный face ROI
   нужен для согласованного тона кожи; не заменять волосы/контур головы/тело.
6. Финальная доводка сохраняет исходную alpha побитово и восстанавливает исходные
   RGBA вне ROI. Проверить decoded pixel signatures, не только размер и file hash.
7. Посмотреть full-body и close-up на сером/светлом/тёмном фоне, сравнить neutral.
   Отдельно проверить цвет глаз, очки, возраст, симметрию взгляда и границы вставки.
8. Только после явной приёмки считать asset утверждённым. Все шесть лиц #317
   приняты пользователем 2026-10-01; финальная runtime/device проверка остаётся.
   Последующая alpha-only очистка Оноэ — отдельный review candidate:
   `../onoe-alpha-2026-10-01/README_RU.md`. Не переносить её приёмку с лица автоматически.

`FACE_REPAIR_BATCH_2026-10-01.json` уровнем выше фиксирует source/output SHA256,
ROIs, canvas/bounds, alpha/outside-ROI signatures и approval по каждому PNG.
Для проверки: `npm run character:audit`, `npm exec -- vitest run tests/FaceRepairPreservation.test.ts`,
`npm run assets:audit`, `npm run docs:audit`, `npm run check:fast`, `npm run build`.
Linux WebKit эталоны обновлять только по просмотренным CI attachments, не по Windows;
assertions и допустимые пороги не ослаблять.
