# ANM-029B2B2 · Belarusian Match-3 Levels 07–13

Build label: `ANM-029B2B2 R1 · Belarusian Match-3 Levels 07–13`.

## Цель

Продолжить production-перевод `be` после принятого B2B1 и закрыть второй level-specific диапазон Match-3
без подключения незавершённой локали к runtime.

B2B2 переводит уровни `M3_07–M3_13` и связанные с ними evidence/item/bark ключи. Belarusian всё ещё
**не подключается к runtime**: `be` остаётся `translation-pending`, пока не завершены весь основной
каталог, F2 reactions, VN/ending контент и финальный zero-missing-key audit.

## Граница пакета

Ровно 128 ключей:

- 91 `match3.level.M3_07_*` … `match3.level.M3_13_*` строка;
- 21 контекстный `match3.bark.fiveMoves/blockers/ingredient.7–13`;
- 9 сюжетных `match3.ingredient.*` предметов, используемых этими уровнями;
- 7 `match3.clue.CUE_008–014` названий доказов.

В B2B2 **не входят** уровни `14–21` и отдельный F2 reaction catalog. Они идут в B2B3/B2C.

## Терминология и имена

Protected project names из production glossary сохраняются латиницей: `Asterion`, `Second Skin`.
Для персонажей этого диапазона фиксируются формы `Куросэ`, `Рына`, `Гэн`, `Аоі`, `Кубо`, а уже
утверждённые `Міку`, `Оноэ`, `Аюкі`, `Кэнтаро` не меняются.

Терминология продолжает B2A/B2B1: `сэрвісны`, `пральня`, `доказ`, `серабрысты шво`, `мікраметка`,
`ланцужок перадачы`. Автоматический structural audit не считается лингвистическим approval.

## Тесты

`tests/BelarusianMatch3Levels0713Localization.test.ts` фиксирует:

- 128/128 ключей source/target;
- zero missing/extra/empty;
- placeholder parity;
- protected `Asterion` / `Second Skin` и выбранные формы имён;
- `be` остаётся `translation-pending`, вне `supportedLocales` и `appCatalogs`.

Все предыдущие Belarusian scope-tests продолжают выбирать только собственные bounded ranges и не
ограничивают рост общего `beCatalog`.

## Следующие пакеты

- ANM-029B2B3 — Match-3 levels `14–21`;
- ANM-029B2C — F2 reactions + полный Belarusian Match-3 structural audit;
- затем VN/ending translation batches и только после full-catalog readiness — runtime activation `be`
  с отдельной проверкой `be-BY -> be`.
