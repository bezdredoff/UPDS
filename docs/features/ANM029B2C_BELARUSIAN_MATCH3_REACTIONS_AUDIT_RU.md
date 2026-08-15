# ANM-029B2C · Belarusian Match-3 Reactions & Full Audit

Build label: `ANM-029B2C R1 · Belarusian Match-3 Reactions & Full Audit`.

## Цель

Завершить production-перевод Match-3 слоя для `be` после B2A и B2B1–B2B3:
перевести отдельный F2 reaction catalog и зафиксировать единый structural audit всего
белорусского Match-3 surface.

B2C **не делает Belarusian runtime-selectable**. Полная локаль всё ещё требует VN,
endings и оставшихся player-facing/system строк, после чего выполняется full-catalog
readiness audit и отдельный mobile/linguistic QA.

## Граница пакета

Reaction catalog содержит ровно 132 строки:

- 22 уровня;
- по 6 reaction families на уровень:
  `objectiveComplete`, `specialActivated`, `specialCombo`, `nearWin`, `danger`,
  `characterBeat`.

Основной Match-3 catalog уже закрыт предыдущими пакетами:

- B2A — 83 core/campaign keys;
- B2B1 — 123 keys для `M3_00–M3_06`;
- B2B2 — 128 keys для `M3_07–M3_13`;
- B2B3 — 146 keys для `M3_14–M3_21`.

Итого основной catalog: **480 keys**. Вместе с F2 reactions финальный Belarusian
Match-3 production surface составляет **612 keys**.

## Runtime boundary

`match3ReactionCatalogs.be` существует как production catalog для дальнейшей активации,
но runtime по-прежнему использует только `ru` и `en` через `appCatalogs`.

До полного завершения `be`:

- `getProductionLocaleProfile('be').status === 'translation-pending'`;
- `runtimeSelectable === false`;
- `supportedLocales === ['ru', 'en']`;
- `be` отсутствует в `appCatalogs`.

Наличие полного Match-3 перевода не означает готовность всей локали.

## Терминология

Сохраняются protected names `Asterion`, `Second Skin`, `CASE CLOSED` и уже принятые
белорусские формы имён (`Міку`, `Аюкі`, `Рына`, `Куросэ`, `Вінсент` и др.).

Для финальных реакций сохраняются принятые ранее production-термины:
`згода`, `прыватнасць`, `журналы`, `рэзервовая копія`, `часавая лінія`,
`сэрвісны маршрут`, `ланцужок перадачы`.

Structural audit не заменяет лингвистическую вычитку и mobile overflow QA.

## Тесты

`tests/BelarusianMatch3ReactionsLocalization.test.ts` фиксирует:

- F2 reactions: **132/132**;
- основной Match-3 catalog: **480/480**;
- объединённый Match-3 surface: **612/612**;
- zero missing/extra/empty;
- placeholder parity;
- protected-name/terminology locks;
- `be` остаётся `translation-pending` и недоступным в runtime.

## Следующий этап

После B2C Match-3 перевод на белорусский структурно завершён. Следующий production
этап ANM-029B — VN localization batches, затем endings/system leftovers и только после
полного zero-missing-key audit — runtime activation `be` и iPhone linguistic/overflow QA.
