# ANM-016C R2 — VN Stage–Dialogue Seam & Nameplate Layering

Версия: `0.16.3-anm016c-r2`.

## Цель

Исправить визуальный стык VN-сцены и диалоговой карточки без изменения сценария, staging rules, adaptive paging, assets или gameplay.

## Исправления R2

- `.stage` больше не обрезает portrait на своей нижней границе. Нижняя часть существующего ростового PNG продолжает уходить вниз и естественно скрывается **за** диалоговой карточкой.
- Убран cream/transparent gradient с `.dialogue-shell`, который создавал визуальную щель между персонажем и карточкой.
- Nameplate вынесен из `<button class="dialogue">` в отдельный sibling layer `.dialogue-nameplate`.
- Nameplate имеет собственный `z-index: 12`, лежит поверх stage и dialogue card и не зависит от clipping/rounded-button поведения Safari.
- Сохранены существующие character PNG, half-body scale (`height: 178%; bottom: -78%`) и left/right/center staging.

## Не входит

- ANM-016D header contrast;
- изменения текста/пейджинга;
- новые изображения;
- изменение narrative IDs, save key, Match-3 или баланса.
