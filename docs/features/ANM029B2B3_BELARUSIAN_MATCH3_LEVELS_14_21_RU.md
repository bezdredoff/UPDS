# ANM-029B2B3 · Belarusian Match-3 Levels 14–21

Build label: `ANM-029B2B3 R1 · Belarusian Match-3 Levels 14–21`.

## Цель

Закрыть третий и последний level-specific диапазон production-перевода `be` для Match-3 после принятых
B2B1/B2B2. B2B3 переводит уровни `M3_14–M3_21` и связанные evidence/item/bark ключи, но по-прежнему
**не подключает Belarusian к runtime**.

После B2B3 все 22 Match-3 level-specific набора имеют белорусский текст. Отдельный F2 reaction catalog
остаётся в B2C, а полная локаль всё ещё требует VN/ending/system leftovers и full-catalog readiness audit.

## Граница пакета

Ровно 146 ключей:

- 104 `match3.level.M3_14_*` … `match3.level.M3_21_*` строки;
- 24 контекстных `match3.bark.fiveMoves/blockers/ingredient.14–21`;
- 10 связанных `match3.ingredient.*` предметов;
- 8 `match3.clue.CUE_015–022` названий доказов.

B2B3 не включает отдельный `match3.reaction.*` F2 catalog. Он переводится и проверяется в ANM-029B2C.

## Терминология и имена

Protected project name `Second Skin` и технический идентификатор `SS-EDGE` сохраняются без перевода.
Продолжаются уже зафиксированные формы `Міку`, `Оноэ`, `Аюкі`, `Эмі`, `Рына`, `Кубо`, `Куросэ`,
а для нового источника фиксируется `Вінсент`; `Мать Кубо` переводится как `Маці Кубо`.

Для финального участка расследования фиксируются `згода`, `прыватнасць`, `журналы згоды`,
`рэзервовы назапашвальнік`, `часовая лінія`, `выдаленыя супярэчнасці`. Structural audit проверяет
структуру, а не заменяет лингвистическую вычитку.

## Тесты

`tests/BelarusianMatch3Levels1421Localization.test.ts` фиксирует:

- 146/146 ключей source/target;
- zero missing/extra/empty;
- placeholder parity;
- protected `Second Skin` / `SS-EDGE`, формы имён и consent/privacy terminology;
- `be` остаётся `translation-pending`, вне `supportedLocales` и `appCatalogs`.

Предыдущие B1/B2A/B2B1/B2B2 tests выбирают только свои bounded ranges и не ограничивают рост общего
`beCatalog`.

## Следующий пакет

ANM-029B2C — перевод 132 F2 reactions плюс полный Belarusian Match-3 structural audit. После B2C Match-3
слой будет структурно закрыт, но `be` останется скрытым до завершения VN/ending и full-catalog readiness.
