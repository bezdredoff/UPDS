# ANM-029B2B1 · Belarusian Match-3 Levels 00–06

Build label: `ANM-029B2B1 R1 · Belarusian Match-3 Levels 00–06`.

## Цель

Продолжить production-перевод `be` после B2A и закрыть первый level-specific диапазон Match-3,
не превращая почти 400 строк уровня/улики/barks в один непроверяемый пакет.

B2B1 переводит уровни `M3_00–M3_06` и связанные с ними evidence/item/bark ключи. Belarusian всё ещё
**не подключается к runtime**: `be` остаётся `translation-pending`, пока не завершены весь каталог,
VN/ending контент и финальный zero-missing-key audit.

## Граница пакета

Ровно 123 ключа:

- 87 `match3.level.M3_00_*` … `match3.level.M3_06_*` строк;
- 21 контекстный `match3.bark.fiveMoves/blockers/ingredient.0–6`;
- 8 сюжетных `match3.ingredient.*` предметов, используемых этими уровнями;
- 7 `match3.clue.CUE_001–007` названий доказов.

В B2B1 **не входят** уровни `07–21` и отдельный F2 reaction catalog. Они идут в B2B2/B2B3/B2C.

## Лингвистический контракт

Используется современная официальная белорусская орфография. Для повторяющихся имён в этом диапазоне
фиксируются формы `Міку`, `Оноэ`, `Аюкі`, `Эмі`, `Кэнтаро`, `Норыхіра`, `Маю`, `Хіната`.
Терминология расследования сохраняет уже выбранный B2A стиль: `доказ`, `сэрвісны`, `пральня`,
`электраправодны шво`.

Автоматический audit проверяет exact key scope, missing/extra/empty и placeholder parity, но не заменяет
лингвистическую вычитку.

## Locale code

Код языка остаётся `be`. `BY` — код страны Беларусь; региональная BCP 47 форма языка — `be-BY`.
Пока `be` скрыт из `supportedLocales`, `resolveLocale()` не должен выдавать его в runtime. В финальном
пакете активации Belarusian будет добавлен отдельный regression test `be-BY -> be` одновременно с
включением `be` в `supportedLocales`.

## Тесты

`tests/BelarusianMatch3Levels0006Localization.test.ts` фиксирует:

- 123/123 ключа source/target;
- zero missing/extra/empty;
- placeholder parity;
- выбранные формы имён/терминов;
- `be` остаётся `translation-pending` и отсутствует в `appCatalogs`.

Старый B2A scope-test также сделан future-proof: он проверяет собственный core selector, а не требует,
чтобы весь `beCatalog` навсегда не содержал level-specific ключей.

## Следующие пакеты

- ANM-029B2B2 — Match-3 levels `07–13`;
- ANM-029B2B3 — Match-3 levels `14–21`;
- ANM-029B2C — F2 reactions + полный Belarusian Match-3 structural audit.
