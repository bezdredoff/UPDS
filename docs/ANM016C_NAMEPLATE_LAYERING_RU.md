# ANM-016C — VN Nameplate Layering & Dialogue Card Hierarchy

## Цель

Исправить визуальную иерархию VN nameplate без изменения текста, staging, screenplay или header.

## Исправление

- `dialogue-shell` остаётся выше `stage` (`z-index: 8` против `2`) и создаёт изолированный stacking context.
- `dialogue-shell` и `.dialogue` разрешают visible overflow вверх.
- nameplate получает явный `z-index: 5`.
- отрицательный `top` сохраняется: nameplate физически заходит на нижнюю часть сцены и рисуется поверх background/character stage, а не обрезается границей dialogue card.
- dialogue text остаётся ниже nameplate (`z-index: 1`).

## Не входит в scope

- staging персонажей (ANM-016A);
- adaptive paging текста (ANM-016B);
- header contrast (ANM-016D);
- narrative / Match-3 / assets.

## Ручная проверка

1. Открыть любую VN реплику с персонажем.
2. Убедиться, что nameplate полностью виден.
3. Верхняя часть nameplate должна заходить на сцену и перекрывать фон.
4. Переключить несколько реплик и direction card — nameplate не должен пропадать или уходить под background.
5. Проверить 320x568 и обычный iPhone viewport.
