# ANM-030B0A2 R1 — Match-3 Special Asset Integration + Help Guide

## Результат

Пять существующих special-механик получили один общий production visual pack для всех 22
уровней. Generic SVG больше не является основным изображением, но остаётся semantic fallback.
Gameplay, balance, создание special и правила комбинаций не меняются.

| Mechanic | Production PNG | Runtime effect |
| --- | --- | --- |
| `flash-row` | `flash-row.png` | очищает ряд |
| `flash-column` | `flash-column.png` | очищает колонку |
| `evidence` | `evidence.png` | очищает `3×3` |
| `lead` | `lead.png` | локальная очистка + полезная удалённая цель |
| `insight` | `insight.png` | очищает retained base tile type |

Все production-файлы — transparent RGBA PNG `256×256`, с видимым foreground внутри
`194×194` safe area. External generation masters в repository не хранятся. Prompt/source record:
[`ANM030B0A2_MATCH3_SPECIALS_R1_PROMPTS.md`](../art/prompts/ANM030B0A2_MATCH3_SPECIALS_R1_PROMPTS.md).

## Runtime и fallback

- `specialAssets` указывает на production PNG;
- `specialFallbackAssets` сохраняет прежние пять SVG;
- board и Help передают SVG через `data-asset-fallback-src`;
- global image health handler сначала пробует semantic SVG и только затем generic placeholder;
- production и fallback assets входят в feature preload и PWA offline catalog;
- digest/PNG-header tests фиксируют approved binary package.

## Player Help

Help показывает пять реальных production-изображений на `48 px` tile preview. Для каждого
бонуса локализованы название, условие создания и эффект в RU/BE/EN. Карточки являются частью
существующего scrollable Help sheet и не меняют состояние доски или число ходов.

## Проверки

Автоматические:

- пять PNG существуют, имеют `256×256`, RGBA color type и locked SHA-256;
- production/fallback mappings имеют одинаковую taxonomy и порядок;
- runtime/offline preload содержит обе группы;
- Help содержит пять карточек и полный RU/BE/EN key parity;
- Browser Gate открывает Help и проверяет, что все пять PNG реально декодированы как `256×256`;
- существующие special creation/activation/combo tests остаются без изменений.

Ручной iPhone gate:

1. На Level Lab/Golden Sample проверить все пять bonuses на поле при реальном размере клетки.
2. Убедиться, что row/column axis читаются мгновенно и не перепутываются.
3. Проверить, что base tile type/цвет остаётся виден под каждым overlay.
4. Открыть `?` на intro и active board; просмотреть все пять карточек без горизонтального overflow.
5. Переключить RU/BE/EN и проверить название, создание и эффект каждого bonus.

## Out of scope

- новые mechanics и balance changes;
- per-level special packs;
- обязательные activation/combo VFX;
- замена базовых matchable tile identities.

