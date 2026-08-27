# ANM-030B0A1 R1.1 — Match-3 Special / Bonus Visual Contract

## Цель

Зафиксировать production contract для пяти уже существующих special-механик Match-3 **до** генерации арта.
Эта фича не создаёт изображения и не меняет runtime. Она превращает найденный в ANM-030A gap в точный и проверяемый production brief.

Machine-readable source of truth:
`src/content/art/ANM030B0A1.match3-special-visual-contract.json` (`upds-match3-special-visual-contract-v1`).

## Current adoption

ANM-030B0A2 реализован: пять production PNG подключены к board и локализованному Help,
зарегистрированы для preload/offline delivery, а перечисленные ниже SVG сохранены как semantic
fallback. Этот документ остаётся исходным production brief; implementation closeout находится в
[`ANM030B0A2_MATCH3_SPECIAL_ASSET_INTEGRATION_RU.md`](ANM030B0A2_MATCH3_SPECIAL_ASSET_INTEGRATION_RU.md).

## Что остаётся неизменным

ANM-022D/022E gameplay vocabulary и правила не переименовываются:

| Mechanic | Создание | Эффект |
| --- | --- | --- |
| `flash-row` | horizontal line-4 | очищает ряд |
| `flash-column` | vertical line-4 | очищает колонку |
| `evidence` | T/L | очищает 3×3 |
| `lead` | player-created 2×2 | локальная очистка + одна полезная удалённая цель |
| `insight` | line-5+ | очищает retained base tile type |

Текущие `public/assets/match3/specials/*.svg` остаются рабочим semantic fallback после integration.
Никаких новых mechanics, balance changes или special-combination rules в B0A1 нет.

## Production pack

Нужен **один reusable pack из пяти visual identities для всей игры**, а не набор на каждый из 22 уровней.

1. `flash-row.png` — camera-strobe / horizontal flash rail; горизонтальная ось должна читаться без анимации.
2. `flash-column.png` — тот же family, но с однозначной вертикальной осью.
3. `evidence.png` — **компактный фотоаппарат с фронтальной вспышкой**; центральный radial burst должен визуально объяснять 3×3 area clear.
4. `lead.png` — magnifier / focus locator + marked target; должен отличаться от radial Evidence и намекать на поиск полезной удалённой цели.
5. `insight.png` — premium camera lens / viewfinder с focus rings и расходящейся энергией; самый сильный визуальный tier.

Мотивы `camera / flash / viewfinder / evidence` задают направление, но не являются требованием использовать буквально одинаковую камеру во всех пяти assets. Сильнее важны мгновенная механическая читаемость и единый визуальный family.

## Runtime delivery contract

Production integration target для B0A2:

- 5 × transparent RGBA PNG;
- runtime canvas `256×256`;
- внешний authoring/generation master — минимум `1024×1024`, в repo хранить его не требуется;
- квадратный canvas, один центрированный special identity;
- примерно 12% safe padding до края canvas;
- без baked board background, UI frame и текста;
- QA на фактическом board scale: `48 / 56 / 64 / 72 CSS px`;
- базовый matchable tile остаётся под overlay, поэтому production visual обязан оставлять достаточно прозрачности, чтобы retained tile type/цвет продолжал читаться.

Последнее правило важнее декоративной сложности: special не должен превращать матч в угадывание скрытого base type.

## Required vs optional

### Blocking для B0A2

- пять production PNG;
- однозначная row/column direction readability;
- distinct silhouettes для Evidence / Lead / Insight;
- сохранение base-tile readability;
- маленький mobile board QA;
- runtime mapping с fallback-safe preload/update tests.

### Optional polish

Activation/combo FX не являются blocker для первой интеграции:

- row/column beam;
- camera flash burst;
- remote target pulse;
- Insight focus/sweep;
- special-special combo burst overlays.

Их можно добавить позже отдельным polish pass после того, как сами пять special tiles доказали читаемость в playable board.

## Production sequence

1. **B0A1 — этот contract:** docs/data/tests only, no art.
2. External production: **COMPLETE** — пять визуалов подготовлены по contract.
3. **B0A2 — Asset Integration: COMPLETE** — approved PNG импортированы, `specialAssets` переключён, fallback/preload/Help coverage добавлены; остаётся candidate iPhone board QA перед merge.
4. Только после реального playtest решать, нужен ли отдельный activation/combo FX pass.

## Out of scope

- art generation внутри B0A1;
- новые Match-3 mechanics;
- 22 level-specific special packs;
- замена базовых tile identities;
- изменение objective/balance/move budgets;
- обязательный VFX production до B0A2.
