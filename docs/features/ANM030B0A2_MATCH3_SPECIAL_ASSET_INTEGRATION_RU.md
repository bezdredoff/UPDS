# ANM-030B0A2 R2 — Match-3 Special Readability + Cascade Creation

## Результат

Пять существующих special-механик получили один общий production visual pack для всех 22
уровней. Generic SVG больше не является основным изображением, но остаётся semantic fallback.
R2 закрывает мобильный playtest feedback: bonus art визуально заменяет старый tile, сюжетные
объекты больше не получают необъяснимые numeric tags, invalid feedback остаётся читаемым,
а сильная фигура, возникшая после fall/refill, создаёт bonus автоматически.

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

На поле production art занимает `128%` canvas клетки: внутренний safe area изображения теперь
почти полностью заполняет tile. Полноразмерное старое изображение не рисуется; сохранённый
matchable type показывается только маленьким круглым marker в правом нижнем углу. Help RU/BE/EN
объясняет этот marker.

## Playtest feedback contracts

- story-object identity tags `01–27` удалены из board и objective HUD; прогресс цели (`0/2`)
  сохраняется;
- blocker layer badge остаётся: его число по-прежнему означает количество оставшихся слоёв;
- invalid-move banner показывается `1600 ms` и при обычной, и при reduced-motion настройке;
- каскады создают `Insight → Evidence → Lead → Flash` по той же приоритетной taxonomy, что и
  player-authored match;
- anchor выбирается среди реально упавших/появившихся клеток, затем детерминированно по центру;
- лимит resolution остаётся `24` каскада, established balance floors не снижены.

## Проверки

Автоматические:

- пять PNG существуют, имеют `256×256`, RGBA color type и locked SHA-256;
- production/fallback mappings имеют одинаковую taxonomy и порядок;
- runtime/offline preload содержит обе группы;
- Help содержит пять карточек и полный RU/BE/EN key parity;
- Browser Gate открывает Help и проверяет, что все пять PNG реально декодированы как `256×256`;
- unit/integration contract проверяет создание Flash на втором cascade после fall;
- полный deterministic balance cohort сохраняет established win floors.

Ручной iPhone gate:

1. На Level Lab/Golden Sample проверить все пять bonuses на поле при реальном размере клетки.
2. Убедиться, что row/column axis читаются мгновенно и не перепутываются.
3. Проверить, что старый tile не просвечивает, bonus крупный, а type marker читается в углу.
4. Открыть `?` на intro и active board; просмотреть все пять карточек без горизонтального overflow.
5. Переключить RU/BE/EN и проверить название, создание и эффект каждого bonus.
6. Создать каскадную линию `4+` и проверить, что после refill на поле остаётся bonus.

## Out of scope

- per-level special packs;
- обязательные activation/combo VFX;
- изменение move budgets, objectives, spawn weights и special-combination effects.
